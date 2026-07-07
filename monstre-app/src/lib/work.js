/* ===== Monde "Pro" — logique PURE (Lucarnepro + LUCID + Deep Work) =====
 * Parti pris : on ne STOCKE jamais d'XP, de niveau ni de streak. L'état ne
 * contient que des LOGS bruts (S.work.sessions / prospects / ships / chests /
 * timer). Tout ce qui suit est DÉRIVÉ à la lecture — donc incrackable à la main
 * et agrégeable pour l'équipe en concaténant les S.work des peers (comme le
 * Classement lit tous les joueurs). Chaque fonction prend un état quelconque :
 * le mien (getS()) OU celui d'un pair (peer.d).
 *
 * ✏️  ÉDITE LIBREMENT le CONTENU en bas : roadmap LUCID, objectifs, idées de
 *    prospection, CTA, mantras, phrases de motivation, coffres.
 */
import { todayKey, addDays, daysTo, fromDk, dkOf } from "./util.js";

/* ── CONSTANTES XP ────────────────────────────────────────────────────────── */
export const XP_MIN            = 2;                       // 1 min concentrée = 2 XP
export const CYCLE_BONUS       = 10;                      // cycle focus mené au bout (full:true)
export const DAILY_FOCUS_BONUS = 15;                      // 1re session du jour PAR ENTITÉ
export const SHIP_XP           = { S: 60, M: 120, L: 250 }; // feature livrée
export const DAILY_FOCUS_TARGET = 90;                    // objectif perso min/jour (barre)
export const WEEK_FOCUS_TARGET  = 600;                   // 10 h/pers/semaine (barre LUCID)
export const MANUAL_CAP        = 180;                     // saisie manuelle plafonnée / entrée
export const DAILY_CREDIT_CAP  = 480;                    // 8 h créditées / jour max
export const MIN_SESSION       = 10;                     // < 10 min = 0 XP

/* ── ENTITÉS ──────────────────────────────────────────────────────────────── */
export const ENTITIES = {
  asso:  { key: "asso",  name: "Lucarnepro", emoji: "🪟", accent: "var(--orange)", accentHex: "#ff8e3c" },
  lucid: { key: "lucid", name: "LUCID",      emoji: "🚀", accent: "var(--cyan)",   accentHex: "#35e0d0" },
};

/* ── FUNNEL DE PROSPECTION (étape → xp d'atteinte) ────────────────────────── */
export const FUNNEL = [
  { stage: "repere",   ic: "🔍", label: "Repéré",       xp: 2 },
  { stage: "contacte", ic: "🚪", label: "Contacté",     xp: 10 },
  { stage: "rdv",      ic: "🤝", label: "RDV décroché",  xp: 30 },
  { stage: "demo",     ic: "🎨", label: "Démo montrée",  xp: 60 },
  { stage: "devis",    ic: "📄", label: "Devis envoyé",  xp: 80 },
  { stage: "vendu",    ic: "💰", label: "VENDU",         xp: 300, boss: true },
];
// XP cumulé atteint à chaque étage : [2,12,42,102,182,482]
export const CUM = FUNNEL.reduce((a, s) => (a.push((a[a.length - 1] || 0) + s.xp), a), []);
export const stageIndex = st => FUNNEL.findIndex(f => f.stage === st);
export const stageMeta  = st => FUNNEL.find(f => f.stage === st) || { stage: st, ic: "🥀", label: "Classé", xp: 0 };
export const nextStage  = st => { const i = stageIndex(st); return i >= 0 && i < FUNNEL.length - 1 ? FUNNEL[i + 1].stage : null; };
export const prospectXP = p => p.stage === "perdu" ? 10 : (CUM[stageIndex(p.stage)] || 0);

export const SECTORS = [
  { id: "resto",   label: "Resto / Café",  ic: "🍔" },
  { id: "beaute",  label: "Beauté",        ic: "💇" },
  { id: "artisan", label: "Artisan",       ic: "🔨" },
  { id: "commerce",label: "Commerce",      ic: "🛍️" },
  { id: "sante",   label: "Santé",         ic: "🩺" },
  { id: "autre",   label: "Autre",         ic: "📍" },
];
export const sectorMeta = id => SECTORS.find(s => s.id === id) || SECTORS[SECTORS.length - 1];

/* ── PRESETS POMODORO ─────────────────────────────────────────────────────── */
export const PRESETS = {
  sprint: { label: "Sprint", emoji: "⚡", focus: 25, break: 5 },
  std:    { label: "Standard", emoji: "🎯", focus: 50, break: 10 }, // défaut
  deep:   { label: "Deep", emoji: "🧠", focus: 90, break: 20 },
  custom: { label: "Custom", emoji: "⚙️", focus: 50, break: 10 },
};

/* ── NIVEAUX PAR ENTITÉ (courbe partagée asso & lucid) ────────────────────── */
export const levelAt  = L  => 100 * L * (L - 1);         // XP cumulé pour ATTEINDRE L : 0,200,600,1200,2000,3000,4200…
export const entLevel = xp => Math.floor((1 + Math.sqrt(1 + (Math.max(0, xp || 0)) / 25)) / 2);
export const entProg  = xp => {
  const L = entLevel(xp), a = levelAt(L), b = levelAt(L + 1);
  return { lvl: L, into: (xp || 0) - a, span: b - a, pct: Math.min(100, ((xp || 0) - a) / (b - a) * 100), nextAt: b, toNext: b - (xp || 0) };
};
export const ASSO_TITLES  = ["Démarcheur", "Frappeur de portes", "Closer", "Machine à vitrines", "Boss local", "Empire de quartier", "Légende du terrain"];
export const LUCID_TITLES = ["Bricoleur", "Builder", "Shipper", "Architecte", "Fondateur", "Scale", "Licorne en approche"];
export const entTitle = (entity, xp) => (entity === "asso" ? ASSO_TITLES : LUCID_TITLES)[Math.max(0, Math.min(entLevel(xp) - 1, 6))];

/* ── XP DÉRIVÉE (pures, prennent n'importe quel état : le mien OU peer.d) ──── */
export const sessionsOf = (w, e, sinceDk) =>
  (w?.sessions || []).filter(s => (!e || s.entity === e) && (!sinceDk || s.dk >= sinceDk));
export const focusMin = (w, e, sinceDk) =>
  sessionsOf(w, e, sinceDk).reduce((n, s) => n + (s.min || 0), 0);
export function focusXP(w, e) {
  const ss = sessionsOf(w, e);
  const base = ss.reduce((n, s) => n + (s.min || 0) * XP_MIN + (s.full ? CYCLE_BONUS : 0), 0);
  const days = new Set(ss.filter(s => (s.min || 0) > 0).map(s => s.dk)).size;
  return base + days * DAILY_FOCUS_BONUS;
}
export const assoXP  = w => focusXP(w, "asso") + (w?.prospects || []).reduce((n, p) => n + prospectXP(p), 0);
export const lucidXP = w => focusXP(w, "lucid") + (w?.ships || []).reduce((n, s) => n + (SHIP_XP[s.size] || 0), 0);
export const entityXP = (w, e) => e === "asso" ? assoXP(w) : lucidXP(w);

/* ── STATS LUCARNEPRO ─────────────────────────────────────────────────────── */
export const salesOf     = w => (w?.prospects || []).filter(p => p.stage === "vendu");
export const caOf        = w => salesOf(w).reduce((n, p) => n + (p.price || 0), 0);
export const contactedOf = w => (w?.prospects || []).filter(p => ["contacte", "rdv", "demo", "devis", "vendu"].includes(p.stage)).length;
export const closingOf   = w => { const c = contactedOf(w); return c ? Math.round(salesOf(w).length / c * 100) : 0; };
export const avgTicket   = w => { const s = salesOf(w); return s.length ? Math.round(caOf(w) / s.length) : 0; };
export const stageCounts = w => FUNNEL.map(f => ({ ...f, n: (w?.prospects || []).filter(p => p.stage === f.stage).length }));
export const activePipe  = w => (w?.prospects || []).filter(p => !["vendu", "perdu"].includes(p.stage));
// commerçants "vus" aujourd'hui (prospects créés/avancés/vendus aujourd'hui) → défi du jour
export const touchedToday = w => { const tk = todayKey(); return (w?.prospects || []).filter(p => p.dk === tk).length; };

/* ── STATS LUCID (roadmap MVP) ────────────────────────────────────────────── */
export const LUCID_MVP = [
  { id: "m0", label: "Socle : repo · CI · déploiement auto",     targetDk: "2026-07-12", need: 3, order: 0 },
  { id: "m1", label: "Auth + onboarding utilisateur",            targetDk: "2026-07-20", need: 3, order: 1 },
  { id: "m2", label: "Boucle produit core (le « aha moment »)",  targetDk: "2026-08-03", need: 4, order: 2 },
  { id: "m3", label: "Rétention : notifs / rappels",             targetDk: "2026-08-17", need: 3, order: 3 },
  { id: "m4", label: "10 vrais users qui reviennent",            targetDk: "2026-08-31", need: 2, order: 4 },
];
export const shipsOf   = (w, msId) => (w?.ships || []).filter(s => !msId || s.ms === msId);
export const msProgress = (w, msId, need = 3) => msStat(w?.ships, msId, need);
export const mvpPct = w => mvpPctOf(roadmapOf(w), w?.ships);

/* Roadmap ÉDITABLE : vit dans S.work.roadmap (→ sync Supabase, partagé cofondateurs).
 * Vide/absente ⇒ on retombe sur le seed LUCID_MVP ci-dessus. */
export const roadmapOf = w => (Array.isArray(w?.roadmap) && w.roadmap.length) ? w.roadmap : LUCID_MVP;
export const msCount = (shipsArr, msId) => (shipsArr || []).filter(s => s.ms === msId).length;
export const msStat  = (shipsArr, msId, need = 3) => { const n = msCount(shipsArr, msId); return { done: n, need, pct: Math.min(100, n / Math.max(1, need) * 100), shipped: n >= need }; };
export const mvpPctOf = (roadmap, shipsArr) => { const r = roadmap || LUCID_MVP; return r.length ? r.reduce((a, m) => a + msStat(shipsArr, m.id, m.need).pct, 0) / r.length : 0; };
export const lastShipDaysAgo = w => { const ss = w?.ships || []; if (!ss.length) return null; const last = ss.reduce((m, s) => s.dk > m ? s.dk : m, ss[0].dk); return daysTo(last, todayKey()); };

/* ── SEMAINES (pour les streaks de livraison) ─────────────────────────────── */
export function weekKey(dk) { const d = fromDk(dk); const day = d.getDay(); const diff = day === 0 ? -6 : 1 - day; return addDays(dk, diff); }
export const prevWeek = wk => addDays(wk, -7);

/* ── STREAKS DÉRIVÉS (même esprit que studyStreakOf de rank.js) ───────────── */
export function focusStreak(w) { // jours consécutifs avec ≥25 min de focus (toute entité)
  const per = {}; (w?.sessions || []).forEach(s => per[s.dk] = (per[s.dk] || 0) + (s.min || 0));
  let n = 0, cur = todayKey(); if ((per[cur] || 0) < 25) cur = addDays(cur, -1);
  while (cur >= "2026-07-06" && (per[cur] || 0) >= 25) { n++; cur = addDays(cur, -1); } return n;
}
export function shipStreak(w) { // semaines consécutives avec ≥1 ship
  const weeks = new Set((w?.ships || []).map(s => weekKey(s.dk)));
  let n = 0, cur = weekKey(todayKey());
  while (weeks.has(cur)) { n++; cur = prevWeek(cur); } return n;
}

/* ── HISTO SUR N JOURS (barres d'activité type Home) ──────────────────────── */
export function dailyFocus(w, days = 14, entity) {
  const tk = todayKey(); const out = [];
  for (let i = days - 1; i >= 0; i--) { const dk = addDays(tk, -i); out.push({ dk, min: focusMin(w, entity, dk) - focusMin(w, entity, addDays(dk, 1)) }); }
  return out;
}
export function weeklyShips(w, weeks = 8) {
  const out = []; let cur = weekKey(todayKey());
  for (let i = 0; i < weeks; i++) { const wk = cur; out.unshift({ wk, n: (w?.ships || []).filter(s => weekKey(s.dk) === wk).length }); cur = prevWeek(cur); }
  return out;
}

/* ── STATS PAR JOUEUR + AGRÉGATION ÉQUIPE (le pendant de peerStats) ───────── */
export function workStats(d) {
  const w = d?.work || {};
  const tk = todayKey();
  return {
    assoXP: assoXP(w), lucidXP: lucidXP(w), assoLvl: entLevel(assoXP(w)), lucidLvl: entLevel(lucidXP(w)),
    sales: salesOf(w).length, ca: caOf(w), contacted: contactedOf(w), closing: closingOf(w),
    minAsso: focusMin(w, "asso"), minLucid: focusMin(w, "lucid"),
    focusToday: focusMin(w, null, tk) - focusMin(w, null, addDays(tk, 1)),
    weekLucid: focusMin(w, "lucid", addDays(tk, -6)),
    weekAsso: focusMin(w, "asso", addDays(tk, -6)),
    ships: (w.ships || []).length, focusStreak: focusStreak(w), shipStreak: shipStreak(w),
    touchedToday: touchedToday(w),
  };
}

/* rows = [{id, name, avatar, s:workStats, w:S.work}] moi en premier, puis les pairs */
export function teamRows(peers, meId, myS) {
  const seen = new Set([meId]);
  const rows = [{ id: meId, d: myS }];
  (peers || []).forEach(p => { if (!seen.has(p.id)) { seen.add(p.id); rows.push({ id: p.id, d: p.d || {} }); } });
  return rows.map(r => ({ id: r.id, name: (r.d.profile && r.d.profile.name) || r.id, avatar: (r.d.profile && r.d.profile.avatar) || "⭐", s: workStats(r.d), w: r.d.work || {} }));
}
export function teamAgg(peers, meId, myS) {
  const people = teamRows(peers, meId, myS);
  const sum = k => people.reduce((n, p) => n + (p.s[k] || 0), 0);
  return {
    people,
    asso:  { xp: sum("assoXP"), sales: sum("sales"), ca: sum("ca"), contacted: sum("contacted"),
             closing: sum("contacted") ? Math.round(sum("sales") / sum("contacted") * 100) : 0, lvl: entLevel(sum("assoXP")),
             minH: Math.round(sum("minAsso") / 60 * 10) / 10, weekMin: sum("weekAsso") },
    lucid: { xp: sum("lucidXP"), ships: sum("ships"), minH: Math.round(sum("minLucid") / 60 * 10) / 10,
             weekMin: sum("weekLucid"), lvl: entLevel(sum("lucidXP")) },
  };
}
// prospects/ships de toute l'équipe fusionnés + tris (historique partagé)
export function teamProspects(peers, meId, myS) {
  return teamRows(peers, meId, myS).flatMap(p => (p.w.prospects || []).map(x => ({ ...x, who: p.name, avatar: p.avatar })));
}
export function teamSessions(peers, meId, myS) {
  return teamRows(peers, meId, myS).flatMap(p => (p.w.sessions || []).map(x => ({ ...x, who: p.name, avatar: p.avatar })))
    .sort((a, b) => (b.ts || 0) - (a.ts || 0));
}
export function teamShips(peers, meId, myS) {
  return teamRows(peers, meId, myS).flatMap(p => (p.w.ships || []).map(x => ({ ...x, who: p.name, avatar: p.avatar })))
    .sort((a, b) => (b.ts || 0) - (a.ts || 0));
}

/* ── OBJECTIFS ÉQUIPE (consts → mêmes cibles pour les deux potes) ─────────── */
export const PRO_GOALS = { assoSales: 5, assoCA: 3000, assoContacts: 30, closing: 25, lucidShips: 12, focusWeek: 600 };
export function assoGoals(agg, myW) {
  const a = agg.asso;
  return [
    { ic: "🩸", label: "Premier sang — 1er site vendu", cur: a.sales, target: 1, unit: "" },
    { ic: "🏆", label: "Cible de l'été", cur: a.sales, target: PRO_GOALS.assoSales, unit: "sites" },
    { ic: "💶", label: "Le vrai argent", cur: a.ca, target: PRO_GOALS.assoCA, unit: "€" },
    { ic: "📞", label: "Prospecte fort", cur: a.contacted, target: PRO_GOALS.assoContacts, unit: "contacts" },
    { ic: "🎯", label: "Closer", cur: a.closing, target: PRO_GOALS.closing, unit: "%" },
    { ic: "🚪", label: "Défi du jour — 3 commerçants vus", cur: touchedToday(myW), target: 3, unit: "" },
  ];
}
export function lucidGoals(agg, myW) {
  return [
    { ic: "📦", label: "Features livrées (équipe)", cur: agg.lucid.ships, target: PRO_GOALS.lucidShips, unit: "" },
    { ic: "⏱️", label: "Focus / semaine / pers", cur: focusMin(myW, "lucid", addDays(todayKey(), -6)), target: PRO_GOALS.focusWeek, unit: "min" },
    { ic: "🚢", label: "Cadence — 1 ship / 3 jours", cur: (myW?.ships || []).filter(s => s.dk >= addDays(todayKey(), -13)).length, target: 5, unit: "sur 14 j" },
    { ic: "🧩", label: "MVP", cur: Math.round(mvpPct(myW)), target: 100, unit: "%" },
  ];
}

/* ── COFFRES PRO (par palier de niveau/XP d'équipe, réutilise le style road) ─ */
export const PRO_CHESTS = [
  { id: 0, xp: 200,  emoji: "📦", name: "Premier palier", glow: "#c69a6b",
    reward: { title: "La machine est lancée 🚀", lines: ["L'équipe a mis le premier coup de pioche.", "Le plus dur — commencer — est derrière vous."] } },
  { id: 1, xp: 600,  emoji: "🥈", name: "Régularité", glow: "#c8d2e6",
    reward: { title: "Vous tenez le rythme 🥈", lines: ["Pas un feu de paille. Une cadence.", "C'est là que 90 % des gens lâchent. Pas vous."] } },
  { id: 2, xp: 1200, emoji: "🥇", name: "Traction", glow: "#ffd166",
    reward: { title: "Ça décolle ✈️", lines: ["Le projet a une vraie inertie maintenant.", "Récompense : offrez-vous un truc, vous l'avez mérité."] } },
  { id: 3, xp: 2000, emoji: "💎", name: "Momentum", glow: "#35e0d0",
    reward: { title: "Diamant 💎", lines: ["« On surestime ce qu'on fait en un jour, on sous-estime ce qu'on fait en un été. »", "Vous êtes la preuve vivante."] } },
  { id: 4, xp: 3000, emoji: "🔮", name: "Machine", glow: "#a855f7",
    reward: { title: "Machine de guerre 🔮", lines: ["À ce niveau, vous n'êtes plus des étudiants qui bricolent.", "Vous êtes une équipe qui exécute."] } },
  { id: 5, xp: 4500, emoji: "👑", name: "Empire", glow: "#ffd166",
    reward: { title: "Bâtisseurs d'empire 👑", lines: ["Top 1 % de ceux qui tiennent un projet un été entier.", "Fait. Prouvé. Gravé."] } },
  { id: 6, xp: 6500, emoji: "🔥", name: "Légende", glow: "#ff3d8b",
    reward: { title: "Feu 🔥", lines: ["Vous avez brûlé l'été à construire.", "La suite ? Deux ans de prépa, puis on lâche les chevaux."] } },
];
export function proChestRoad(teamXp, openedArr, entity) {
  const opened = new Set(openedArr || []);
  const key = c => entity + ":" + c.id;
  const chests = PRO_CHESTS.map(c => ({
    ...c, entity, oid: key(c),
    opened: opened.has(key(c)),
    unlocked: teamXp >= c.xp,
    ready: teamXp >= c.xp && !opened.has(key(c)),
  }));
  const nextLocked = chests.find(c => !c.unlocked) || null;
  const prevXp = chests.filter(c => c.unlocked).slice(-1)[0]?.xp || 0;
  const span = nextLocked ? (nextLocked.xp - prevXp) : 1;
  const pct = nextLocked ? Math.max(0, Math.min(100, ((teamXp - prevXp) / span) * 100)) : 100;
  return { chests, nextLocked, pct, readyCount: chests.filter(c => c.ready).length, total: teamXp, entity };
}

/* ── HELPER AFFICHAGE TIMER (pur — appelé au render avec Date.now()) ───────── */
export function timerView(t, now) {
  if (!t) return null;
  const phaseTotal = (t.phase === "focus" ? t.focusMin : t.breakMin) * 60000;
  const elapsed = (t.accMs || 0) + (t.paused ? 0 : Math.max(0, now - t.startedAt));
  const remainMs = Math.max(0, phaseTotal - elapsed);
  const mm = String(Math.floor(remainMs / 60000)).padStart(2, "0");
  const ss = String(Math.floor((remainMs % 60000) / 1000)).padStart(2, "0");
  return { remainMs, elapsedMs: elapsed, clock: mm + ":" + ss, pct: phaseTotal ? Math.min(100, elapsed / phaseTotal * 100) : 0, phase: t.phase, paused: !!t.paused, done: remainMs <= 0, cycle: t.cycle || 1 };
}

/* ═══════════════════════ CONTENU ÉDITABLE ═══════════════════════════════════ */

/* CTA Lucarnepro (rotation dans .pro-cta) */
export const ASSO_CTA = [
  "Il y a des vitrines à moins de 500 m qui n'ont pas de site. Lève-toi. Va pousser une porte. 🚪",
  "Un site se vend pas depuis ton canapé. Le pire qu'il dise, c'est non — et non te rapporte quand même 10 XP.",
  "Un site vendu = +300 XP d'un coup. C'est un level entier. Va le chercher.",
  "T'as révisé 4 h ? Parfait. Maintenant 30 min de terrain. Le monstre bosse ET vend.",
  "Ton pipe est vide = ton CA sera vide dans 3 semaines. Ajoute 5 commerces repérés, là, maintenant.",
  "Des devis dorment sans réponse. Une relance = 1 vente sur 4. Envoie.",
  "Lucas avance sur le terrain. Un RDV et tu repasses devant. 👊",
];

/* Mantras LUCID (rotation dans .pro-cta teinte cyan) */
export const LUCID_MANTRAS = [
  "Livré > parfait. Un truc live et moche bat dix chefs-d'œuvre dans ta tête. Ship.",
  "Si t'as un peu honte de ta v1, t'as shippé au bon moment.",
  "Parle à un user aujourd'hui. Le code ment, les users non.",
  "Si t'as rien shippé cette semaine, LUCID n'existe pas cette semaine.",
  "La discipline bat la motivation. Le minuteur, lui, négocie pas.",
  "On construit une boîte, pas un side-project de vacances. Deux ans de prépa, puis on lâche les chevaux.",
  "1 % par jour = ×37 en un an. Fais ton 1 % maintenant.",
];

/* Motivation Deep Work (rotation footer) */
export const WORK_MOTIV = [
  "45 minutes sans ton tél. C'est ça, un monstre.",
  "12 min. Reste. Ne touche pas ce téléphone.",
  "Chaque minute ici arrose Lucarnepro et LUCID. Le monstre irrigue son empire.",
  "Aujourd'hui tu casses pas ta streak de deep work.",
  "Personne construit un empire en scrollant. Lance le timer. ⏱️",
  "Bloc bouclé. LUCID a grandi pendant que les autres scrollaient.",
];

/* Petit sélecteur déterministe (évite Math.random au render) : tourne sur le jour. */
export const rotate = (arr, seed) => arr[(seed >>> 0) % arr.length];
export const daySeed = () => { const t = todayKey(); return (parseInt(t.replace(/-/g, ""), 10) || 0); };

export { dkOf };
