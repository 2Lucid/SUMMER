/* Flow — « Qu'est-ce que je fais maintenant ? »
   Moteur PUR : à partir de l'état S + l'heure, construit le programme du jour
   sous forme d'une file de blocs (travail / révision / lecture / courage /
   intendance / repos / pauses), dans l'ordre naturel de la journée, avec des
   pauses tissées entre les blocs d'effort. Aucune écriture ici — la vue lit
   `done`/`skipped`/`effort` et déclenche les mutations (voir game.jsx). */
import { dkOf } from "./util.js";
import { buildChecklist, deadlines, todos, FEAT, flashCards } from "./config.js";
import { mission } from "./coeur.js";
import * as SPORT from "./sport.js";
import { hm2min } from "./agenda.js";

/* Habillage par type de bloc (tag + couleur du monde « nuit »). */
export const KIND = {
  work:    { tag: "Travail",    col: "var(--cyan)" },
  review:  { tag: "Révision",   col: "var(--gold)" },
  read:    { tag: "Lecture",    col: "var(--orange)" },
  courage: { tag: "Courage",    col: "var(--pink)" },
  sport:   { tag: "Sport",      col: "var(--pink)" },
  admin:   { tag: "Intendance", col: "var(--muted)" },
  rest:    { tag: "Repos",      col: "#5aa9ff" },
  wake:    { tag: "Réveil",     col: "var(--gold)" },
  sleep:   { tag: "Sommeil",    col: "#8f7bff" },
  event:   { tag: "Agenda",     col: "#8f7bff" },
  pause:   { tag: "Pause",      col: "#5aa9ff" },
};

/* Métadonnées par id d'item de la checklist du jour (voir config.buildChecklist). */
const DAY_META = {
  wake:  { emoji: "☀️", kind: "wake",   go: { world: "prepa", tab: "sleep" },    mins: 5 },
  drill: { emoji: "⚡", kind: "work",   go: { world: "prepa", tab: "drill" },    mins: 15 },
  math:  { emoji: "📐", kind: "work",   go: { world: "prepa", tab: "today" },    mins: 45 },
  code:  { emoji: "🐍", kind: "work",   go: { world: "prepa", tab: "today" },    mins: 60 },
  zh:    { emoji: "🇨🇳", kind: "work",   go: { world: "prepa", tab: "today" },    mins: 20 },
  b1:    { emoji: "📐", kind: "work",   go: { world: "prepa", tab: "today" },    mins: 180 },
  sci:   { emoji: "🔬", kind: "work",   go: { world: "prepa", tab: "today" },    mins: 45 },
  b2:    { emoji: "🔬", kind: "work",   go: { world: "prepa", tab: "today" },    mins: 120 },
  eng:   { emoji: "🌍", kind: "work",   go: { world: "prepa", tab: "today" },    mins: 30 },
  lang:  { emoji: "🌍", kind: "work",   go: { world: "prepa", tab: "today" },    mins: 45 },
  read:  { emoji: "📖", kind: "read",   go: null,                                mins: 40 },
  flash: { emoji: "🧠", kind: "review", go: { world: "prepa", tab: "flash" },    mins: 12 },
  caf:   { emoji: "☕", kind: "admin",  go: null,                                mins: 1 },
  vo:    { emoji: "🎬", kind: "read",   go: null,                                mins: 90 },
  out:   { emoji: "🌊", kind: "rest",   go: null,                                mins: 120 },
  off:   { emoji: "🌴", kind: "rest",   go: null,                                mins: 1 },
  prep:  { emoji: "🗂️", kind: "admin",  go: { world: "agenda" },                 mins: 20 },
  bed:   { emoji: "🌙", kind: "sleep",  go: { world: "prepa", tab: "sleep" },    mins: 5 },
  go:    { emoji: "🎒", kind: "work",   go: null,                                mins: 1 },
};
const DEF_META = { emoji: "✅", kind: "work", go: { world: "prepa", tab: "today" }, mins: 30 };

/* Pauses tissées : présets rotatifs insérés après les blocs d'effort. */
const PAUSES = [
  { emoji: "☕", title: "Micro-pause", sub: "Eau, bouge, respire — loin des écrans", mins: 10 },
  { emoji: "🍽️", title: "Vraie coupure", sub: "Déjeuner + marche, sans écran", mins: 60 },
  { emoji: "🌊", title: "Coupure de l'aprem", sub: "Sors, change d'air, vois du monde", mins: 45 },
];
const PAUSE_AT = new Set([2, 4, 6]);   // après le n-ième bloc d'effort
const EFFORT = new Set(["work", "review", "read", "courage"]);

const strMission = m => m.parts.map(p => p.b || p.t).join("").trim();

/* Construit le programme du jour. nowMs = Date.now() (horloge réelle). */
export function buildFlow(S, nowMs) {
  const now = new Date(nowMs);
  const tk = dkOf(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const fl = S.flow || {};
  const flowDone = (fl.done && fl.done[tk]) || {};
  const skip = (fl.skip && fl.skip[tk]) || {};
  const days = (S.days && S.days[tk]) || {};
  const coeurDaily = (S.coeurDaily && S.coeurDaily[tk]) || 0;

  const isDone = id => !!flowDone[id];
  const wrap = b => ({ ...b, effort: EFFORT.has(b.kind), done: b.done ?? isDone(b.id), skipped: !!skip[b.id] });

  /* 1) Blocs issus de la checklist du jour, dans l'ordre naturel. */
  const list = buildChecklist(tk);
  const covered = new Set(list.map(it => it.id));
  const core = list.map(it => {
    const m = DAY_META[it.id] || DEF_META;
    return wrap({ id: "day-" + it.id, dayId: it.id, kind: m.kind, emoji: m.emoji, title: it.label, sub: KIND[m.kind].tag, mins: m.mins, go: m.go, done: !!days[it.id] });
  });

  /* 2) Blocs dynamiques (pas toujours dans la checklist). */
  const dueFlash = flashCards().filter(c => { const s = (S.flash || {})[c.id]; return !s || s.due <= tk; }).length;
  const flashBlock = (!covered.has("flash") && dueFlash > 0)
    ? wrap({ id: "flash-dyn", kind: "review", emoji: "🧠", title: "Réviser " + dueFlash + " flashcard" + (dueFlash > 1 ? "s" : ""), sub: "Mémoire · Leitner", mins: 12, go: { world: "prepa", tab: "flash" } })
    : null;

  /* Bloc « canal courage » : mission cœur (Clément) OU contrat sport (Lucas). */
  const isSport = FEAT().sport;
  const m = isSport ? null : mission(S);
  const coeurBlock = isSport
    ? wrap({ id: "coeur", kind: "sport", emoji: "💪", title: "100 pompes + 100 squats", sub: "Le contrat quotidien — en séries si tu veux", mins: 15, go: { world: "sport" }, done: SPORT.dailyDone(S, tk) || isDone("coeur") })
    : wrap({ id: "coeur", kind: "courage", emoji: m.e, title: "Mission cœur du jour", sub: strMission(m), mins: 10, go: { world: "coeur" }, done: coeurDaily > 0 || isDone("coeur") });

  const openTodo = todos().find(t => !(S.todos && S.todos[t.id]));
  const todoBlock = openTodo
    ? wrap({ id: "todo-" + openTodo.id, todoId: openTodo.id, kind: "admin", emoji: "🗂️", title: "Intendance rentrée", sub: openTodo.label, mins: 15, go: null, done: !!(S.todos && S.todos[openTodo.id]) })
    : null;

  /* 3) Événements agenda d'aujourd'hui qui tombent maintenant / bientôt. */
  const evs = (S.events || []).filter(e => e.date === tk && !e.allDay).map(e => {
    const st = hm2min(e.start), en = hm2min(e.end || e.start);
    return { e, st, en };
  }).filter(x => x.en >= nowMin - 15 && x.st <= nowMin + 60)   // en cours ou dans l'heure
    .sort((a, b) => a.st - b.st)
    .map(({ e, st }) => wrap({
      id: "ev-" + e.id, kind: "event", emoji: "📅", title: e.title || "Événement",
      sub: (st <= nowMin ? "en cours" : "à " + e.start), mins: 0, go: { world: "agenda" }, urgent: true, done: false,
    }));

  /* 4) Assemblage : événements urgents en tête, puis la journée avec pauses tissées. */
  const out = [...evs];
  let effort = 0, pauses = 0, coeurIn = false, todoIn = false, flashIn = false;
  core.forEach(b => {
    if (b.dayId === "bed" && flashBlock && !flashIn) { out.push(flashBlock); flashIn = true; }   // réviser avant de dormir
    out.push(b);
    if (isSport && b.dayId === "wake" && coeurBlock && !coeurIn) { out.push(coeurBlock); coeurIn = true; }  // 100/100 au réveil, avant la douche
    if (!b.effort) return;
    effort++;
    if (PAUSE_AT.has(effort) && pauses < PAUSES.length) {
      const p = PAUSES[pauses];
      out.push(wrap({ id: "pause-" + pauses, kind: "pause", emoji: p.emoji, title: p.title, sub: p.sub, mins: p.mins, pauseMins: p.mins, go: null }));
      pauses++;
    }
    if (effort === 2 && coeurBlock && !coeurIn) { out.push(coeurBlock); coeurIn = true; }
    if (effort === 4 && todoBlock && !todoIn) { out.push(todoBlock); todoIn = true; }
  });
  if (coeurBlock && !coeurIn) out.push(coeurBlock);
  if (flashBlock && !flashIn) out.push(flashBlock);
  if (todoBlock && !todoIn) out.push(todoBlock);

  /* Progression = blocs « à faire » hors pauses/événements. */
  const tasks = out.filter(b => b.kind !== "pause" && b.kind !== "event");
  const nDone = tasks.filter(b => b.done).length;

  return { blocks: out, tk, nowMin, nDone, nTotal: tasks.length };
}

/* Sélection des blocs à montrer : on retire faits + passés, les pauses de fin
   de file (plus aucun effort ne suit) et les pauses collées l'une à l'autre. */
export function pickQueue(blocks) {
  const pending = blocks.filter(b => !b.done && !b.skipped);
  const out = [];
  pending.forEach((b, i) => {
    if (b.kind === "pause") {
      const laterEffort = pending.slice(i + 1).some(x => x.effort);
      const prevPause = out.length && out[out.length - 1].kind === "pause";
      if (!laterEffort || prevPause) return;
    }
    out.push(b);
  });
  return out;
}

/* Prochaine échéance (bandeau), à J−N. */
export function nextDeadline(tk) {
  return deadlines().find(d => d.dk >= tk) || null;
}
