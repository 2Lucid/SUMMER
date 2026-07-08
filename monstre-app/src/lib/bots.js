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
const SEED_RATIO = [1.05, 1.00, 0.95, 0.85, 0.72];  // placement initial : ~2 devant, 3 derrière
const PACE = [320, 260, 210, 165, 125];             // XP/JOUR visé par bot (≈ 2-3 h de travail) → ils gagnent ÉNORMÉMENT
const CATCH = 0.14;                                  // ressort Mario Kart : rattrape quand il est derrière moi, freine quand il me distance
const MINGAIN = 12;

/* petit bruit déterministe [0..1) à partir d'une graine texte */
function noise(seed) { let h = 2166136261; const s = String(seed); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000) / 1000; }
/* bornes Mario Kart : un bot ne s'échappe jamais trop haut, ne disparaît jamais trop bas (plafond légèrement dégressif par bot → pas d'égalités) */
const hiCap = (my, i) => (my || 0) + Math.max(500, (my || 0) * 0.7) * (1 - i * 0.045);
const loCap = my => (my || 0) - Math.max(250, (my || 0) * 0.45);

export function seedBots(myTotal) {
  const base = Math.max(60, myTotal || 0);
  return SEED_RATIO.map((r, i) => {
    const p = PROFILES[i % PROFILES.length];
    const xp = Math.round(base * r * (0.94 + noise("s" + i) * 0.12));
    return { id: "bot_" + i, name: p.name, avatar: p.avatar, xp: Math.max(10, xp) };
  });
}

/* avance les bots des jours écoulés entre fromDk et toDk (idempotent dans la journée) */
export function tickBots(bots, myTotal, fromDk, toDk) {
  const days = Math.min(30, Math.max(0, daysTo(fromDk, toDk)));
  if (!days) return bots;
  const my = myTotal || 0;
  return bots.map((b, i) => {
    let xp = b.xp; const pace = PACE[i] || 150;
    for (let d = 0; d < days; d++) {
      const wobble = 0.82 + noise(b.id + fromDk + d) * 0.36;         // ±18 % de variation par jour
      let gain = (pace - (xp - my) * CATCH) * wobble;                // rythme exigeant + ressort vers moi
      gain = Math.max(MINGAIN, Math.min(pace * 2.5, gain));
      xp = Math.max(loCap(my), Math.min(hiCap(my, i), xp + gain));   // Mario Kart : borné autour de mon niveau
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
