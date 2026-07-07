/* ===== Chrono de travail prépa — logique PURE =====
 * Un simple chronomètre « horloge murale » : l'état ne stocke qu'un timestamp de
 * départ (running.startedAt) + des sessions bruts {ms,dk,ts}. Tout est dérivé à
 * la lecture — donc robuste au reload et à la synchro cloud (comme S.work).
 */
import { todayKey, addDays } from "./util.js";

const S0 = { running: null, sessions: [] };
export const study = S => (S && S.study) || S0;

/* millisecondes du chrono EN COURS (0 si arrêté) — passe Date.now() au render */
export const runMs = (S, now) => { const r = study(S).running; return r && r.startedAt ? Math.max(0, now - r.startedAt) : 0; };
export const isRunning = S => !!study(S).running;

/* totaux ENREGISTRÉS (hors chrono en cours) */
export const totalMs = S => (study(S).sessions || []).reduce((n, s) => n + (s.ms || 0), 0);
export const dayMs   = (S, dk) => (study(S).sessions || []).filter(s => s.dk === dk).reduce((n, s) => n + (s.ms || 0), 0);
export const rangeMs = (S, fromDk) => (study(S).sessions || []).filter(s => s.dk >= fromDk).reduce((n, s) => n + (s.ms || 0), 0);
export const weekMs  = (S, dk) => rangeMs(S, addDays(dk, -6));
export const sessionCount = S => (study(S).sessions || []).length;

/* variantes LIVE (incluent le chrono en cours) */
export const liveTotal = (S, now) => totalMs(S) + runMs(S, now);
export const liveToday = (S, now) => dayMs(S, todayKey()) + runMs(S, now);

/* streak : jours consécutifs (jusqu'à aujourd'hui) avec ≥ 15 min de travail */
export const MIN_STUDY_DAY = 15 * 60000;
export function studyStreak(S, now = 0) {
  const has = dk => (dk === todayKey() ? dayMs(S, dk) + runMs(S, now) : dayMs(S, dk)) >= MIN_STUDY_DAY;
  let n = 0, cur = todayKey();
  if (!has(cur)) cur = addDays(cur, -1);   // aujourd'hui pas encore atteint : la streak d'hier tient
  while (has(cur)) { n++; cur = addDays(cur, -1); }
  return n;
}

/* histo N derniers jours (min par jour) — pour d'éventuelles barres */
export function dailyStudy(S, days = 14) {
  const tk = todayKey(); const out = [];
  for (let i = days - 1; i >= 0; i--) { const dk = addDays(tk, -i); out.push({ dk, min: Math.round(dayMs(S, dk) / 60000) }); }
  return out;
}

/* ── FORMATTERS ─────────────────────────────────────────────────────────── */
const p2 = n => String(n).padStart(2, "0");
/* horloge défilante : H:MM:SS ou MM:SS */
export function clock(ms) {
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0 ? h + ":" + p2(m) + ":" + p2(sec) : p2(m) + ":" + p2(sec);
}
/* durée lisible : « 12 h 30 » / « 45 min » / « 0 min » */
export function human(ms) {
  const totalMin = Math.floor(ms / 60000), h = Math.floor(totalMin / 60), m = totalMin % 60;
  if (h > 0) return m > 0 ? h + " h " + p2(m) : h + " h";
  return totalMin + " min";
}
export const hours1 = ms => Math.round(ms / 3600000 * 10) / 10;
