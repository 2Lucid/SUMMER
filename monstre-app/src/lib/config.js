import { fromDk, addDays, todayKey } from "./util.js";
import { getS } from "../store.js";
import { profileFor, DEFAULT_PROFILE } from "./profiles/index.js";

/* ═══════════════════════════════════════════════════════════════════════════
 * config.js — RÉSOLVEUR DE PROFIL
 * Le CONTENU études/prépa (rentrée, phases-dates, matières, deadlines, planning,
 * checklist, lectures) vit dans profiles/<pseudo>.js. Ici on ne fait que router
 * vers le profil de la personne connectée. Clément = défaut (rien ne change pour
 * lui). Lucas = son propre monde. Le RESTE (phases-labels, couleur, XP, coffres,
 * micro-actions Cœur) est COMMUN et défini plus bas.
 * ═════════════════════════════════════════════════════════════════════════ */

/* Profil actif = pseudo de la personne connectée (fallback = Clément). */
export function activeProfileId() {
  try { const s = getS(); return (s && s.profile && s.profile.pseudo) || DEFAULT_PROFILE; }
  catch { return DEFAULT_PROFILE; }
}
const P = () => profileFor(activeProfileId());

/* ── API de contenu, déléguée au profil actif ─────────────────────────────── */
export const schoolLabel = () => P().SCHOOL;
export const rentree     = () => P().RENTREE;                 // (ancien const RENTREE)
export const phaseOf     = dk => P().phaseOf(dk);
export const rampOf      = dk => P().rampOf(dk);
export const bookOf      = dk => P().bookOf(dk);
export const deadlines   = () => P().DEADLINES;               // (ancien const DEADLINES)
export const todos       = () => P().TODOS;                   // (ancien const TODOS)
export const prepaBlocks = dk => P().prepaBlocks(dk);
export const buildDayPlan = dk => P().buildDayPlan(dk);
/* buildChecklist accepte un profil explicite (classement : chaque pair est
 * évalué avec SON propre profil, pas celui du joueur connecté). */
export const buildChecklist = (dk, profId) => (profId ? profileFor(profId) : P()).buildChecklist(dk);

/* Features de l'app (mondes visibles, onglets) + canal courage (❤️ vs 💪). */
const DEF_FEATURES = { coeur: true, sport: false, exam: true, worldLabel: "Prépa" };
export const featuresOf = profId => ({ ...DEF_FEATURES, ...((profId ? profileFor(profId) : P()).FEATURES || {}) });
export const FEAT = () => featuresOf();
export const channelOf = profId => (profId ? profileFor(profId) : P()).CHANNEL || { emoji: "❤️", name: "coeur" };

/* Flashcards + matières du profil (Clément : prépa · Lucas : math/py/zh/en). */
export const flashCards = () => P().FLASH || [];
export const flashSubjects = () => P().SUBJECTS || [];

/* Vue d'ensemble de l'été (Planning) : phases, lectures, règles d'or. */
export const overview = () => P().OVERVIEW || { phases: [], reading: [], rules: [], readingTitle: "", readingNote: "" };

/* Phases : labels/desc communes, surchargées par le profil si présent. */
export const phaseMeta = () => { const o = P().PHASE_META || {}; const out = {}; Object.keys(PHASE_META).forEach(k => { out[k] = { ...PHASE_META[k], ...(o[k] || {}) }; }); return out; };

/* ── COMMUN à tous les profils ────────────────────────────────────────────── */
export const PHASE_META = {
  reset: { label: "RESET", desc: "Sommeil + mise en route", color: "#2647d0" },
  croisiere: { label: "CROISIÈRE", desc: "Matinées studieuses, après-midis libres", color: "#177245" },
  intense: { label: "INTENSE", desc: "Journées type études", color: "#c2182b" },
  rentree: { label: "RENTRÉE", desc: "C'est parti.", color: "#182559" },
};

export const PREPA_COLOR = "#8f7bff";

/* ── XP prépa (commun) ────────────────────────────────────────────────────── */
export const CHECK_XP    = 5;   // item de la checklist du jour coché
export const DEADLINE_XP = 40;  // devoir/DM/objectif rendu
export const MENTAL_XP   = 15;  // partie de calcul mental enregistrée (1 par seed)

/* ── Micro-actions Cœur (commun) ──────────────────────────────────────────── */
export const MICRO_ACTIONS = [
  "Like + commente une story (pas juste un ❤️)", "Envoie un message à quelqu'un de nouveau",
  "Relance une conversation éteinte", "Fais un vrai compliment IRL, en face",
  "Pose une question à un(e) inconnu(e)", "Propose un truc concret (verre, glace, tour en mer)",
  "Regard + sourire à quelqu'un qui te plaît",
];
export const microOfDay = dk => { const d = fromDk(dk); return MICRO_ACTIONS[(d.getFullYear() + d.getMonth() * 31 + d.getDate()) % MICRO_ACTIONS.length]; };

/* ── Helpers stats (dashboard) — profil de la personne connectée ──────────── */
export function checklistPct(S, dk) { const list = buildChecklist(dk); const ch = S.days[dk] || {}; const n = list.filter(it => ch[it.id]).length; return Math.round(n / list.length * 100); }
export function studyStreak(S) {
  const tk = todayKey(); const done = dk => { const list = buildChecklist(dk); const ch = S.days[dk] || {}; const n = list.filter(it => ch[it.id]).length; return n / list.length >= 0.6; };
  let s = 0, cur = tk; if (!done(cur)) cur = addDays(cur, -1); while (cur >= "2026-07-06" && done(cur)) { s++; cur = addDays(cur, -1); } return s;
}
export function sleepOkOf(S, dk) {
  const r = rampOf(dk), rc = S.sleep[dk] || {}; if (!rc.bed && !rc.wake) return null;
  const toMin = t => { if (!t) return null; const [h, m] = t.split(":").map(Number); let v = h * 60 + m; if (v < 12 * 60) v += 24 * 60; return v; };
  const toMinW = t => { if (!t) return null; const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const ob = rc.bed && Math.abs(toMin(rc.bed) - toMin(r.bed)) <= 30; const ow = rc.wake && Math.abs(toMinW(rc.wake) - toMinW(r.wake)) <= 30; return !!(ob && ow);
}
