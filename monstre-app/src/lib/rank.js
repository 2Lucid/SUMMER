/* Classement : stats dérivées d'un état joueur (le mien ou celui d'un pair). */
import { todayKey, addDays } from "./util.js";
import { buildChecklist } from "./config.js";
import { levelIndex } from "./coeur.js";
import { focusStreak } from "./work.js";

export function studyStreakOf(days) {
  days = days || {};
  const tk = todayKey();
  const done = dk => { const list = buildChecklist(dk); const ch = days[dk] || {}; const n = list.filter(it => ch[it.id]).length; return list.length ? n / list.length >= 0.6 : false; };
  let s = 0, cur = tk;
  if (!done(cur)) cur = addDays(cur, -1);
  while (cur >= "2026-07-06" && done(cur)) { s++; cur = addDays(cur, -1); }
  return s;
}

export function peerStats(p) {
  const d = p.d || {};
  const xpCoeur = d.xp || 0, xpPrepa = (d.skills && d.skills.xp) || 0;
  const pr = d.profile || {};
  const chests = ((d.chests && d.chests.opened) || []).length;
  return { id: p.id, name: pr.name || p.id, avatar: pr.avatar || "⭐", total: xpCoeur + xpPrepa, xpCoeur, xpPrepa, coeurStreak: d.streak || 0, best: d.best || 0, study: studyStreakOf(d.days), lvl: levelIndex(xpCoeur), chests, proStreak: focusStreak(d.work || {}), updated: p.updated };
}
