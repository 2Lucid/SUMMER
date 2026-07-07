import { createContext, useContext, useState, useCallback, useRef } from "react";
import { useS, setS, getS, wipe, myId } from "./store.js";
import * as fx from "./fx.js";
import { uid, todayKey, yesterday, addDays, dkOf, pick, shuffle, frn } from "./lib/util.js";
import { ACTIONS, LEVELS, EMOJIS, DAILY_BONUS, levelIndex } from "./lib/coeur.js";
import { DOMAINS, genDrill } from "./lib/drill.js";
import { buildExam } from "./lib/exam.js";
import { FLASH, BOX_GAP } from "./lib/flash.js";
import * as W from "./lib/work.js";

const Ctx = createContext(null);
export const useGame = () => useContext(Ctx);
const PREPA_TABS = ["today", "planning", "exam", "drill", "flash", "brain", "sleep"];
const PRO_TABS = ["asso", "lucid", "work"];
const initUi = () => ({ world: "home", tab: "today", menuFor: null, modal: null, selAction: null, fear: 5, selEmoji: EMOJIS[0], sess: null, exam: null, examCfg: { subject: "mixte", minutes: 60 }, flash: null, flashSubj: "all", planDay: null, planOverview: false, calView: "week", calDate: todayKey(), sharePlan: true });

export function GameProvider({ children }) {
  const S = useS();
  const [ui, setUi] = useState(initUi);
  const patch = useCallback(p => setUi(u => ({ ...u, ...(typeof p === "function" ? p(u) : p) })), []);

  /* --- annulation (undo) des actions loguées --- */
  const undoRef = useRef([]);
  const [undoTop, setUndoTop] = useState(null);  // libellé de la dernière action annulable (ou null)
  const pushUndo = (label, snap) => { undoRef.current.push({ label, snap }); if (undoRef.current.length > 8) undoRef.current.shift(); setUndoTop(label); };
  const undoLast = () => { const e = undoRef.current.pop(); if (!e) return; setS(e.snap); const nx = undoRef.current[undoRef.current.length - 1]; setUndoTop(nx ? nx.label : null); fx.toast("↩️ Annulé : " + e.label); };

  /* --- navigation --- */
  const setWorld = w => setUi(u => ({ ...u, world: w, tab: (w === "prepa" && !PREPA_TABS.includes(u.tab)) ? "today" : (w === "pro" && !PRO_TABS.includes(u.tab)) ? "asso" : u.tab }));
  const setTab = t => setUi(u => ({ ...u, tab: t, flash: t === "flash" ? null : u.flash }));
  const goto = t => setUi(u => ({ ...u, world: "prepa", tab: t }));

  /* --- Cœur --- */
  const addQuest = (name, emoji) => { const n = (name || "").trim(); if (!n) { fx.toast("Il lui faut un prénom (ou un nom de code 😏)"); return; }
    const cur = getS(); setS({ ...cur, quests: [...cur.quests, { id: uid(), name: n.slice(0, 24), emoji: emoji || "🌸", status: "active", created: Date.now() }] });
    fx.toast("Quête ajoutée : " + n + " ✨"); };
  const logAction = (questId, type, fear, note) => {
    const a = ACTIONS[type]; if (!a) return;
    const cur = getS(); const prevLvl = levelIndex(cur.xp); const today = todayKey();
    pushUndo(a.label, cur);
    let gain = a.xp, bonus = "", streak = cur.streak, best = cur.best, lastDay = cur.lastDay;
    if (lastDay !== today) { if (lastDay === yesterday()) streak += 1; else streak = 1; best = Math.max(best, streak); lastDay = today; gain += DAILY_BONUS; bonus = " (+" + DAILY_BONUS + " bonus du jour)"; }
    const log = [...cur.log, { id: uid(), questId: questId || null, type, xp: a.xp, fear: (typeof fear === "number" ? fear : null), ts: Date.now(), ...(note ? { note: String(note).slice(0, 140) } : {}) }];
    const coeurDaily = { ...cur.coeurDaily, [today]: (cur.coeurDaily[today] || 0) + 1 };
    const quests = questId ? cur.quests.map(q => q.id === questId ? { ...q, status: a.closes ? "closed" : (type === "couple" ? "couple" : q.status) } : q) : cur.quests;
    const xp = cur.xp + gain;
    setS({ ...cur, log, xp, streak, best, lastDay, coeurDaily, quests });
    setUi(u => ({ ...u, modal: null }));
    fx.toast(a.emoji + " +" + a.xp + " XP · " + a.label + bonus);
    if (a.boss || a.legendary) fx.confetti(a.legendary ? 80 : 40);
    if (type === "rateau") setTimeout(() => fx.toast("Quête fermée avec honneur. GG d'avoir joué. ⚔️"), 2400);
    const nl = levelIndex(xp); if (nl > prevLvl) { fx.levelup(nl); fx.confetti(60); }
  };
  /* Retire une ligne du journal et corrige XP / streak / record / dépôts du jour. */
  const deleteLog = id => {
    const cur = getS(); const e = cur.log.find(x => x.id === id); if (!e) return;
    if (!confirm("Retirer cette action du journal ? L'XP correspondant sera enlevé.")) return;
    pushUndo("suppression du journal", cur);
    const dk = dkOf(new Date(e.ts));
    const log = cur.log.filter(x => x.id !== id);
    const sameDay = log.filter(x => dkOf(new Date(x.ts)) === dk).length;
    const coeurDaily = { ...cur.coeurDaily }; if (sameDay > 0) coeurDaily[dk] = sameDay; else delete coeurDaily[dk];
    // bonus du jour retiré seulement si c'était la dernière action de ce jour
    const xp = Math.max(0, cur.xp - ((e.xp || 0) + (sameDay === 0 ? DAILY_BONUS : 0)));
    // streak / record / dernier jour recalculés depuis les jours réellement actifs
    const days = [...new Set(log.map(x => dkOf(new Date(x.ts))))].sort();
    let best = 0, run = 0, prev = null;
    for (const d of days) { run = (prev && addDays(prev, 1) === d) ? run + 1 : 1; best = Math.max(best, run); prev = d; }
    const lastDay = days.length ? days[days.length - 1] : null; const streak = days.length ? run : 0;
    setS({ ...cur, log, coeurDaily, xp, best, streak, lastDay });
    fx.toast("🗑️ Action retirée du journal");
  };
  const setStatus = (id, st) => { const cur = getS(); setS({ ...cur, quests: cur.quests.map(q => q.id === id ? { ...q, status: st } : q) }); setUi(u => ({ ...u, menuFor: null })); };
  const removeQuest = id => { if (!confirm("Supprimer cette quête et garder l'XP déjà gagné ?")) return; const cur = getS(); setS({ ...cur, quests: cur.quests.filter(q => q.id !== id) }); setUi(u => ({ ...u, menuFor: null })); };
  const openModal = questId => setUi(u => ({ ...u, modal: { questId }, selAction: null, fear: 5 }));
  const closeModal = () => setUi(u => ({ ...u, modal: null }));
  const setCouple = v => { const cur = getS(); setS({ ...cur, couple: !!v }); fx.toast(v ? "C'est noté 💞 En couple." : "C'est noté 🔥 Célibataire — à toi de jouer."); };

  /* --- Prépa (jour / sommeil) --- */
  const toggleDay = id => { const cur = getS(); const tk = todayKey(); const ch = cur.days[tk] || {}; setS({ ...cur, days: { ...cur.days, [tk]: { ...ch, [id]: !ch[id] } } }); };
  const doTodo = id => { const cur = getS(); setS({ ...cur, todos: { ...cur.todos, [id]: true } }); };
  const upSleep = (k, v) => { const cur = getS(); const tk = todayKey(); const rec = cur.sleep[tk] || {}; setS({ ...cur, sleep: { ...cur.sleep, [tk]: { ...rec, [k]: v } } }); };

  /* --- Drill (100% QCM) --- */
  const drillLvl = id => (S.skills.d[id] && S.skills.d[id].lvl) || 1;
  const startDrill = domSel => { const queue = []; for (let i = 0; i < 10; i++) { const id = domSel === "mix" ? pick(DOMAINS).id : domSel; queue.push(genDrill(id, (getS().skills.d[id] && getS().skills.d[id].lvl) || 1)); } setUi(u => ({ ...u, sess: { domSel, queue, idx: 0, results: [], fb: null, t0: Date.now(), xpGain: 0, done: false } })); };
  const drillSubmit = choice => { const s = ui.sess; const q = s.queue[s.idx]; const ok = choice === q.sol;
    const fast = (Date.now() - s.t0) / 1000 < 15; const gain = ok ? 8 * q.lvl + (fast ? 4 : 0) : 0; let queue = [...s.queue];
    if (!ok && queue.length < 13) queue.splice(Math.min(s.idx + 3, queue.length), 0, { ...genDrill(q.dom, q.lvl), retry: true });
    setUi(u => ({ ...u, sess: { ...s, queue, fb: { ok, sol: q.disp }, results: [...s.results, { dom: q.dom, ok }], xpGain: s.xpGain + gain } })); };
  const drillNext = () => { const s = ui.sess; const ni = s.idx + 1;
    if (ni >= s.queue.length) {
      const cur = getS(); const d = { ...(cur.skills.d || {}) }; const touched = {};
      s.results.forEach(r => { const c = { ...(d[r.dom] || { lvl: 1, hist: [] }) }; c.hist = [...(c.hist || []), r.ok].slice(-10); d[r.dom] = c; touched[r.dom] = true; });
      const changes = [];
      Object.keys(touched).forEach(id => { const c = d[id]; const n = c.hist.length, w = c.hist.filter(Boolean).length;
        if (n >= 6 && w / n >= 0.8 && c.lvl < 3) { c.lvl++; c.hist = []; changes.push(DOMAINS.find(x => x.id === id).name + " → niveau " + c.lvl + " 🔺"); }
        else if (n >= 6 && w / n <= 0.4 && c.lvl > 1) { c.lvl--; c.hist = []; changes.push(DOMAINS.find(x => x.id === id).name + " → niveau " + c.lvl + " 🔻"); } });
      setS({ ...cur, skills: { xp: (cur.skills.xp || 0) + s.xpGain, d } });
      setUi(u => ({ ...u, sess: { ...s, done: true, changes } })); return;
    }
    setUi(u => ({ ...u, sess: { ...s, idx: ni, fb: null, t0: Date.now() } })); };
  const endDrill = () => setUi(u => ({ ...u, sess: null }));

  /* --- Flash --- */
  const flashDue = (subj = "all") => { const tk = todayKey(); const fl = getS().flash; return FLASH.filter(c => (subj === "all" || c.subject === subj) && (() => { const s = fl[c.id]; return !s || s.due <= tk; })()); };
  const startFlash = () => setUi(u => ({ ...u, flash: { queue: shuffle(flashDue(u.flashSubj)).slice(0, 15), idx: 0, rev: false } }));
  const setFlashSubj = subj => setUi(u => ({ ...u, flashSubj: subj, flash: { queue: shuffle(flashDue(subj)).slice(0, 15), idx: 0, rev: false } }));
  const flipFlash = () => setUi(u => ({ ...u, flash: { ...u.flash, rev: !u.flash.rev } }));
  const gradeFlash = ok => { const cur = getS(); const st = ui.flash; const c = st.queue[st.idx]; const s = cur.flash[c.id] || { box: 1 }; const box = ok ? Math.min(4, (s.box || 1) + 1) : 1; const tk = todayKey(); const dueNext = ok ? addDays(tk, BOX_GAP[box - 1]) : tk;
    setS({ ...cur, flash: { ...cur.flash, [c.id]: { box, due: dueNext } } }); setUi(u => ({ ...u, flash: { ...st, idx: st.idx + 1, rev: false } })); };

  /* --- Contrôle --- */
  const setExamCfg = p => setUi(u => ({ ...u, examCfg: { ...u.examCfg, ...p } }));
  const startExam = (subject, minutes) => setUi(u => ({ ...u, exam: { subject, minutes, list: buildExam(subject, minutes), t0: Date.now(), endsAt: Date.now() + minutes * 60000, submitted: false, grades: {}, saved: false } }));
  const examSubmit = () => setUi(u => { if (!u.exam || u.exam.submitted) return u; const grades = { ...u.exam.grades }; u.exam.list.forEach((_, i) => { if (grades[i] == null) grades[i] = 0; }); return { ...u, exam: { ...u.exam, submitted: true, grades } }; });
  const examSetGrade = (i, pts) => setUi(u => ({ ...u, exam: { ...u.exam, grades: { ...u.exam.grades, [i]: pts } } }));
  const examSave = () => { const e = ui.exam; if (!e || e.saved) return; const max = e.list.reduce((s, x) => s + x.pts, 0), got = e.list.reduce((s, x, i) => s + (e.grades[i] || 0), 0); const score = Math.round(got / max * 200) / 10;
    const byEx = e.list.map((x, i) => ({ sub: x.subKey, got: e.grades[i] || 0, max: x.pts })); const cur = getS();
    setS({ ...cur, exams: [...cur.exams, { dk: todayKey(), ts: Date.now(), subject: e.subject, minutes: e.minutes, score, max, got, byEx }] });
    setUi(u => ({ ...u, exam: { ...e, saved: true, finalScore: score } })); fx.confetti(score >= 14 ? 50 : 20); fx.toast("Copie corrigée : " + frn(score) + "/20 " + (score >= 16 ? "🔥" : score >= 12 ? "💪" : "📚")); };
  const endExam = () => setUi(u => ({ ...u, exam: null, tab: "exam" }));

  /* --- Coffres (récompenses) --- */
  const openChest = id => { const cur = getS(); const cur0 = cur.chests || { opened: [] }; if ((cur0.opened || []).includes(id)) return; setS({ ...cur, chests: { ...cur0, opened: [...(cur0.opened || []), id] } }); };

  /* --- Planning (agenda perso) --- */
  const saveEvent = rec => { const cur = getS(); const exists = cur.events.some(e => e.id === rec.id); setS({ ...cur, events: exists ? cur.events.map(e => e.id === rec.id ? rec : e) : [...cur.events, rec] }); };
  const deleteEvent = id => { const cur = getS(); setS({ ...cur, events: cur.events.filter(e => e.id !== id) }); };

  /* --- Flow (« qu'est-ce que je fais maintenant ? ») --- */
  const flowF = cur => cur.flow || { pause: null, done: {}, skip: {} };
  const flowSetDay = (cur, bag, id, val) => { const f = flowF(cur); const tk = todayKey(); const day = { ...((f[bag] || {})[tk] || {}) }; if (val) day[id] = true; else delete day[id]; return { ...f, [bag]: { ...(f[bag] || {}), [tk]: day } }; };
  const flowMark = (id, dayId, todoId) => { if (dayId) return toggleDay(dayId); const cur = getS(); if (todoId && !cur.todos[todoId]) return setS({ ...cur, todos: { ...cur.todos, [todoId]: true }, flow: flowSetDay(cur, "done", id, true) }); setS({ ...cur, flow: flowSetDay(cur, "done", id, true) }); };
  const flowUnmark = (id, dayId) => { if (dayId) return toggleDay(dayId); const cur = getS(); setS({ ...cur, flow: flowSetDay(cur, "done", id, false) }); };
  const flowSkip = id => { const cur = getS(); setS({ ...cur, flow: flowSetDay(cur, "skip", id, true) }); };
  const flowPause = (mins, label, fromId) => { const cur = getS(); const now = Date.now(); let f = flowF(cur); if (fromId) f = flowSetDay(cur, "done", fromId, true); setS({ ...cur, flow: { ...f, pause: { until: now + mins * 60000, startedAt: now, mins, label: label || "Pause" } } }); fx.toast("Pause lancée — on se retrouve dans " + mins + " min ⏸️"); };
  const flowExtend = mins => { const cur = getS(); const f = flowF(cur); if (!f.pause) return; setS({ ...cur, flow: { ...f, pause: { ...f.pause, until: f.pause.until + mins * 60000, mins: (f.pause.mins || 0) + mins } } }); };
  const flowResume = () => { const cur = getS(); const f = flowF(cur); setS({ ...cur, flow: { ...f, pause: null } }); };
  const flowRestart = () => { if (!confirm("Recommencer le programme du jour à zéro ?")) return; const cur = getS(); const f = flowF(cur); const tk = tkNow(); setS({ ...cur, flow: { ...f, done: { ...(f.done || {}), [tk]: {} }, skip: { ...(f.skip || {}), [tk]: {} } } }); fx.toast("Programme du jour remis à zéro 🔄"); };

  /* --- Pro (Lucarnepro + LUCID + Deep Work) : logs bruts, tout dérivé dans lib/work.js --- */
  const EW = () => ({ sessions: [], prospects: [], ships: [], chests: [], timer: null });
  const wsave = fn => { const cur = getS(); const w = fn(cur.work || EW()); if (w) setS({ ...cur, work: w }); return w; };
  // crédite une session en respectant les plafonds (manuel ≤180, 8 h/jour, min 10) — renvoie {w,gain,min,rejected,leveled}
  const creditSession = (w0, { entity, mode, minutes, full }) => {
    let min = Math.round(minutes);
    if (!(min >= W.MIN_SESSION)) return { rejected: true };
    if (mode === "manual") min = Math.min(min, W.MANUAL_CAP);
    const tk = todayKey();
    const todayMin = W.focusMin(w0, null, tk);
    const credit = Math.max(0, Math.min(min, W.DAILY_CREDIT_CAP - todayMin));
    const firstToday = W.sessionsOf(w0, entity, tk).length === 0;
    const before = W.entityXP(w0, entity);
    const sess = { id: uid(), entity, mode, min: credit, full: !!full, ts: Date.now(), dk: tk };
    const w = { ...w0, sessions: [...(w0.sessions || []), sess] };
    const gain = credit * W.XP_MIN + (full ? W.CYCLE_BONUS : 0) + (credit > 0 && firstToday ? W.DAILY_FOCUS_BONUS : 0);
    return { w, gain, min: credit, leveled: W.entLevel(W.entityXP(w, entity)) > W.entLevel(before) };
  };
  const celebrate = (w, entity, leveled) => { if (leveled) { fx.levelup(W.entLevel(W.entityXP(w, entity))); fx.confetti(60); } };

  const logSession = ({ entity, mode = "manual", minutes, full = false }) => {
    if (!entity) { fx.toast("Choisis Lucarnepro ou LUCID d'abord."); return; }
    const cur = getS(); const r = creditSession(cur.work || EW(), { entity, mode, minutes, full });
    if (r.rejected) { fx.toast("Trop court pour compter ⏳ (min " + W.MIN_SESSION + " min)"); return; }
    setS({ ...cur, work: r.w }); const ent = W.ENTITIES[entity];
    if (r.min === 0) { fx.toast("Plafond du jour atteint (8 h) — loggé, 0 XP 😅"); return; }
    fx.toast("+" + r.gain + " XP · " + ent.name + " " + ent.emoji + (full ? " · cycle bouclé 🔥" : ""));
    if (r.min >= 50) fx.confetti(40); celebrate(r.w, entity, r.leveled);
  };

  /* --- minuteur pomodoro (horloge murale, écrit S.work.timer sur transition seulement) --- */
  const startTimer = ({ entity, preset = "std", focusMin, breakMin }) => {
    if (!entity) { fx.toast("Tag ta session : Lucarnepro ou LUCID ?"); return; }
    const p = W.PRESETS[preset] || W.PRESETS.std; const fMin = Math.max(1, focusMin || p.focus), bMin = Math.max(1, breakMin || p.break);
    const now = Date.now();
    wsave(w => ({ ...w, timer: { entity, preset, focusMin: fMin, breakMin: bMin, phase: "focus", cycle: 1, startedAt: now, endsAt: now + fMin * 60000, paused: false, accMs: 0 } }));
  };
  const pauseTimer = () => wsave(w => { const t = w.timer; if (!t || t.paused) return w; return { ...w, timer: { ...t, paused: true, accMs: (t.accMs || 0) + Math.max(0, Date.now() - t.startedAt) } }; });
  const resumeTimer = () => wsave(w => { const t = w.timer; if (!t || !t.paused) return w; const now = Date.now(); const remain = Math.max(0, (t.phase === "focus" ? t.focusMin : t.breakMin) * 60000 - (t.accMs || 0)); return { ...w, timer: { ...t, paused: false, startedAt: now, endsAt: now + remain } }; });
  const stopTimer = () => { const cur = getS(); const t = cur.work && cur.work.timer; if (!t) return;
    if (t.phase === "focus") { const elapsedMin = ((t.accMs || 0) + (t.paused ? 0 : Math.max(0, Date.now() - t.startedAt))) / 60000;
      if (elapsedMin >= W.MIN_SESSION) { const r = creditSession({ ...cur.work, timer: null }, { entity: t.entity, mode: "pomo", minutes: elapsedMin, full: false }); setS({ ...cur, work: { ...r.w, timer: null } }); const ent = W.ENTITIES[t.entity]; fx.toast("+" + r.gain + " XP · " + ent.name + " " + ent.emoji + " (arrêt anticipé)"); celebrate(r.w, t.entity, r.leveled); }
      else { setS({ ...cur, work: { ...cur.work, timer: null } }); fx.toast("Arrêté — trop court pour créditer ⏳"); }
    } else setS({ ...cur, work: { ...cur.work, timer: null } });
  };
  const skipBreak = () => wsave(w => (w.timer && w.timer.phase === "break") ? { ...w, timer: null } : w);
  // à appeler au mount + visibilitychange + quand timerView(...).done : avance les phases écoulées pendant l'absence
  const reconcileTimer = () => {
    const cur = getS(); let t = cur.work && cur.work.timer; if (!t || t.paused) return;
    let work = cur.work, changed = false, leveledEnt = null, guard = 0; const toasts = []; let cycled = false;
    while (t && !t.paused && guard++ < 20) {
      const phaseTotal = (t.phase === "focus" ? t.focusMin : t.breakMin) * 60000;
      const elapsed = (t.accMs || 0) + Math.max(0, Date.now() - t.startedAt);
      if (elapsed < phaseTotal) break;
      const phaseEnd = t.startedAt + (phaseTotal - (t.accMs || 0));
      if (t.phase === "focus") {
        const r = creditSession(work, { entity: t.entity, mode: "pomo", minutes: t.focusMin, full: true });
        if (r && r.w) { work = { ...r.w }; cycled = true; const ent = W.ENTITIES[t.entity];   // garde-fou : jamais {...undefined} → pas de wipe de S.work
          toasts.push("+" + r.gain + " XP · " + ent.name + " " + ent.emoji + " · cycle bouclé 🔥");
          if (r.leveled) leveledEnt = t.entity; }
        changed = true; // on avance la phase même si trop court pour créditer
        t = { ...t, phase: "break", accMs: 0, startedAt: phaseEnd, endsAt: phaseEnd + t.breakMin * 60000, paused: false };
        work = { ...work, timer: t };
      } else { t = null; work = { ...work, timer: null }; changed = true; toasts.push("Pause finie 💪 Relance un bloc quand tu veux."); }
    }
    if (changed) { setS({ ...cur, work }); toasts.forEach((m, i) => setTimeout(() => fx.toast(m), i * 1900)); if (cycled) fx.confetti(40); if (leveledEnt) celebrate(work, leveledEnt, true); }
  };

  /* --- Lucarnepro (funnel de prospection) --- */
  const addProspect = ({ name, sector = "autre", price = 0 }) => { const n = (name || "").trim(); if (!n) { fx.toast("Il faut un nom de commerce."); return; } wsave(w => ({ ...w, prospects: [...(w.prospects || []), { id: uid(), name: n.slice(0, 40), sector, stage: "repere", price: price || 0, by: myId(), ts: Date.now(), dk: todayKey() }] })); fx.toast("🔍 Repéré : " + n + " (+2 XP)"); };
  const bumpAsso = (before, w) => { if (W.entLevel(W.assoXP(w)) > W.entLevel(before)) { fx.levelup(W.entLevel(W.assoXP(w))); fx.confetti(60); } };
  const advProspect = id => { const cur = getS(); const w0 = cur.work || EW(); const p = (w0.prospects || []).find(x => x.id === id); if (!p) return; const ns = W.nextStage(p.stage); if (!ns) return; const before = W.assoXP(w0);
    const w = { ...w0, prospects: w0.prospects.map(x => x.id === id ? { ...x, stage: ns, dk: todayKey(), ts: Date.now() } : x) }; setS({ ...cur, work: w });
    if (ns === "vendu") { fx.confetti(60); fx.toast("✅ SITE VENDU — " + p.name + " (+300 XP). T'as transformé une conversation en argent."); } else { const m = W.stageMeta(ns); fx.toast(m.ic + " " + m.label + " : " + p.name); } bumpAsso(before, w); };
  const moveProspect = (id, stage) => { const cur = getS(); const w0 = cur.work || EW(); const before = W.assoXP(w0); const w = { ...w0, prospects: (w0.prospects || []).map(x => x.id === id ? { ...x, stage, dk: todayKey(), ts: Date.now() } : x) }; setS({ ...cur, work: w });
    if (stage === "perdu") fx.toast("Classé 🥀 — +10 XP quand même, t'as tenté."); else if (stage === "vendu") { const gain = W.assoXP(w) - before; fx.confetti(60); fx.toast("✅ VENDU (+" + gain + " XP) 💰"); } bumpAsso(before, w); };
  const setProspectPrice = (id, price) => wsave(w => ({ ...w, prospects: (w.prospects || []).map(x => x.id === id ? { ...x, price: Math.max(0, +price || 0) } : x) }));
  const quickSale = ({ name, sector = "autre", price = 0 }) => { const n = (name || "").trim(); if (!n) { fx.toast("Nom du commerce ?"); return; } const cur = getS(); const w0 = cur.work || EW(); const before = W.assoXP(w0); const w = { ...w0, prospects: [...(w0.prospects || []), { id: uid(), name: n.slice(0, 40), sector, stage: "vendu", price: price || 0, by: myId(), ts: Date.now(), dk: todayKey() }] }; setS({ ...cur, work: w }); const gain = W.assoXP(w) - before; fx.confetti(60); fx.toast("✅ SITE VENDU — " + n + " (+" + gain + " XP) 💰"); bumpAsso(before, w); };
  const removeProspect = id => { if (!confirm("Retirer ce prospect ?")) return; wsave(w => ({ ...w, prospects: (w.prospects || []).filter(x => x.id !== id) })); };

  /* --- LUCID (livraisons) --- */
  const shipFeature = ({ title, size = "M", kind = "feature", ms = null, note = "" }) => { const t = (title || "").trim(); if (!t) { fx.toast("Un titre pour ta feature ?"); return; } const cur = getS(); const w0 = cur.work || EW(); const before = W.lucidXP(w0); const w = { ...w0, ships: [...(w0.ships || []), { id: uid(), title: t.slice(0, 60), size, kind, ms: ms || null, note: (note || "").slice(0, 120), ts: Date.now(), dk: todayKey() }] }; setS({ ...cur, work: w }); fx.confetti(size === "L" ? 60 : 40); fx.toast("🚀 Shipped : " + t + " (+" + (W.SHIP_XP[size] || 0) + " XP). Ça existe maintenant."); if (W.entLevel(W.lucidXP(w)) > W.entLevel(before)) { fx.levelup(W.entLevel(W.lucidXP(w))); fx.confetti(60); } };
  const removeShip = id => { if (!confirm("Retirer cette livraison ?")) return; wsave(w => ({ ...w, ships: (w.ships || []).filter(x => x.id !== id) })); };

  /* --- LUCID : roadmap MVP ÉDITABLE (vit dans S.work.roadmap → sync Supabase, partagée cofondateurs) --- */
  const curRoadmap = w => (Array.isArray(w.roadmap) && w.roadmap.length) ? w.roadmap : W.LUCID_MVP.map(m => ({ ...m })); // 1re édition = on matérialise le seed
  const addMilestone = ({ label, need = 3, targetDk = "" }) => { const l = (label || "").trim(); if (!l) { fx.toast("Un intitulé pour ton objectif ?"); return; } wsave(w => { const rm = curRoadmap(w); return { ...w, roadmap: [...rm, { id: uid(), label: l.slice(0, 80), need: Math.max(1, +need || 1), targetDk: targetDk || "", order: rm.length }] }; }); fx.toast("🎯 Objectif ajouté — synchro cofondateurs ✨"); };
  const editMilestone = (id, patch) => wsave(w => ({ ...w, roadmap: curRoadmap(w).map(m => m.id === id ? { ...m, ...patch, ...(patch.label != null ? { label: String(patch.label).slice(0, 80) } : {}), ...(patch.need != null ? { need: Math.max(1, +patch.need || 1) } : {}) } : m) }));
  const removeMilestone = id => { if (!confirm("Supprimer cet objectif de la roadmap ? (les features livrées restent)")) return; wsave(w => ({ ...w, roadmap: curRoadmap(w).filter(m => m.id !== id) })); };
  const moveMilestone = (id, dir) => wsave(w => { const rm = [...curRoadmap(w)]; const i = rm.findIndex(m => m.id === id); const j = i + dir; if (i < 0 || j < 0 || j >= rm.length) return w; [rm[i], rm[j]] = [rm[j], rm[i]]; return { ...w, roadmap: rm.map((m, k) => ({ ...m, order: k })) }; });
  const resetRoadmap = () => { if (!confirm("Réinitialiser la roadmap au modèle de départ ?")) return; wsave(w => ({ ...w, roadmap: [] })); fx.toast("Roadmap réinitialisée 🔄"); };

  /* --- coffres Pro (par palier d'XP d'équipe, ids namespacés "asso:2" / "lucid:0") --- */
  const openProChest = (entity, id) => { const cur = getS(); const w0 = cur.work || EW(); const oid = entity + ":" + id; if ((w0.chests || []).includes(oid)) return; setS({ ...cur, work: { ...w0, chests: [...(w0.chests || []), oid] } }); };

  /* --- données --- */
  const doWipe = () => { if (confirm("Tout effacer : Cœur + Prépa ?") && confirm("Sûr de sûr ? Irréversible.")) { wipe(); fx.toast("Nouvelle partie. Deviens un monstre. 👹"); } };

  const value = { S, ui, patch, setWorld, setTab, goto, addQuest, logAction, undoLast, undoTop, deleteLog, setStatus, removeQuest, openModal, closeModal, setCouple, toggleDay, doTodo, upSleep, drillLvl, startDrill, drillSubmit, drillNext, endDrill, startFlash, flipFlash, gradeFlash, setFlashSubj, setExamCfg, startExam, examSubmit, examSetGrade, examSave, endExam, openChest, saveEvent, deleteEvent, flowMark, flowUnmark, flowSkip, flowPause, flowExtend, flowResume, flowRestart,
    logSession, startTimer, pauseTimer, resumeTimer, stopTimer, skipBreak, reconcileTimer, addProspect, advProspect, moveProspect, setProspectPrice, quickSale, removeProspect, shipFeature, removeShip, addMilestone, editMilestone, removeMilestone, moveMilestone, resetRoadmap, openProChest, doWipe };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
