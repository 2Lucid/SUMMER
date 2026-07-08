/* ===== Rivaux d'entraînement (bots) — logique PURE =====
 * Des adversaires fictifs dont l'XP se cale sur le tien : 2 devant (objectifs),
 * 3 derrière (pression). Ils suivent ton niveau avec un ressort DÉCALÉ : chaque
 * jour ils avancent d'une fraction vers une cible = ton total × ratio, + un petit
 * « grind » quotidien. Donc un gros jour de travail te fait passer devant
 * (battable), et si tu relâches ils te doublent. Toujours challengé.
 * Marqués 🤖 dans le classement : ce ne sont pas de vrais joueurs. */
import { todayKey, daysTo } from "./util.js";
import { levelIndex } from "./coeur.js";

const PROFILES = [
  { name: "Léa", avatar: "🦊" }, { name: "Hugo", avatar: "🐺" }, { name: "Camille", avatar: "🦉" },
  { name: "Naël", avatar: "🐉" }, { name: "Sofia", avatar: "🐈" }, { name: "Malik", avatar: "🦅" },
];
const RATIO = [1.09, 1.03, 0.965, 0.90, 0.80];   // 2 devant toi, 3 derrière
const PULL = 0.18;                                // fraction rattrapée par jour vers la cible (→ décalage = battable)
const GRIND = 14;                                 // XP « de base » gagné par jour (progresse même si tu stagnes)

/* petit bruit déterministe [0..1) à partir d'une graine texte */
function noise(seed) { let h = 2166136261; const s = String(seed); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000) / 1000; }

export function seedBots(myTotal) {
  const base = Math.max(60, myTotal || 0);
  return RATIO.map((r, i) => {
    const p = PROFILES[i % PROFILES.length];
    const xp = Math.round(base * r * (0.92 + noise("s" + i) * 0.16));
    return { id: "bot_" + i, name: p.name, avatar: p.avatar, xp: Math.max(10, xp) };
  });
}

/* avance les bots des jours écoulés entre fromDk et toDk (idempotent dans la journée) */
export function tickBots(bots, myTotal, fromDk, toDk) {
  const days = Math.min(30, Math.max(0, daysTo(fromDk, toDk)));
  if (!days) return bots;
  return bots.map((b, i) => {
    let xp = b.xp; const ratio = RATIO[i] || 1;
    for (let d = 0; d < days; d++) {
      const target = Math.max(40, (myTotal || 0) * ratio);
      const grind = GRIND * (0.5 + noise(b.id + fromDk + d) * 1.0);
      xp = Math.max(0, xp + (target - xp) * PULL + grind);
    }
    return { ...b, xp: Math.round(xp) };
  });
}

/* met à jour bots + date, sans écrire si rien ne change → { bots, dk, changed } */
export function syncBots(cur) {
  const myTotal = (cur.xp || 0) + ((cur.skills && cur.skills.xp) || 0);
  const tk = todayKey();
  let bots = cur.bots, dk = cur.botsDk;
  if (!bots || !bots.length) { bots = seedBots(myTotal); dk = tk; return { bots, dk, changed: true }; }
  if (dk && dk < tk) { bots = tickBots(bots, myTotal, dk, tk); dk = tk; return { bots, dk, changed: true }; }
  return { bots, dk: dk || tk, changed: (dk == null) };
}

/* une entrée de classement (même forme que peerStats) à partir d'un bot */
export function botEntry(b) {
  const total = Math.max(0, Math.round(b.xp));
  const xpPrepa = Math.round(total * 0.55), xpCoeur = total - xpPrepa;
  const coeurStreak = Math.min(60, Math.floor(total / 220) + 1);
  return { id: b.id, name: b.name, avatar: b.avatar, total, xpCoeur, xpPrepa, coeurStreak, best: coeurStreak, study: Math.min(45, Math.floor(total / 260)), lvl: levelIndex(xpCoeur), chests: 0, proStreak: 0, updated: null, bot: true };
}
