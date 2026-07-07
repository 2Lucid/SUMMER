/* ===== Coffres & récompenses (façon Brawl Stars) =====
 * Chaque coffre se débloque à un palier d'XP total (Cœur + Prépa).
 * Plus tu bosses, plus tu montes, plus tu ouvres de coffres.
 *
 * ✏️  ÉDITE LIBREMENT :
 *   - `reward.title` / `reward.lines` = la surprise dans chaque coffre.
 *   - `ULTIME` (tout en bas) = le message secret final pour Lucas.
 */

export const CHESTS = [
  { id: 0, xp: 150,   emoji: "🎁", name: "Coffre de Bois",      rarity: "bois",     glow: "#c69a6b",
    reward: { title: "Le premier pas 👟", lines: ["T'as lancé la machine. C'est ça le plus dur, et t'es déjà passé.", "Garde ce rythme — le monstre commence ici."] } },

  { id: 1, xp: 400,   emoji: "🥈", name: "Coffre d'Argent",     rarity: "argent",   glow: "#c8d2e6",
    reward: { title: "Badge : Discipliné 🥈", lines: ["Titre débloqué : « Le mec qui s'y met vraiment ».", "Personne peut plus te dire que t'as rien fait cet été."] } },

  { id: 2, xp: 750,   emoji: "🥇", name: "Coffre d'Or",         rarity: "or",       glow: "#ffd166",
    reward: { title: "Pause méritée ☕", lines: ["Récompense : va te chercher un truc que t'aimes. T'as le droit.", "Puis tu reviens. On lâche rien."] } },

  { id: 3, xp: 1200,  emoji: "💎", name: "Coffre de Diamant",   rarity: "diamant",  glow: "#35e0d0",
    reward: { title: "Citation cachée 💎", lines: ["« La discipline, c'est choisir entre ce que tu veux maintenant et ce que tu veux le plus. »", "Relis-la quand t'as la flemme."] } },

  { id: 4, xp: 1800,  emoji: "🔮", name: "Méga Coffre",         rarity: "mega",     glow: "#a855f7",
    reward: { title: "Surprise 🔮", lines: ["✏️ (Clément a caché un truc ici — édite `chests.js` pour ta surprise à toi.)", "T'as fait la moitié de l'été comme un monstre. Respect."] } },

  { id: 5, xp: 2600,  emoji: "🌈", name: "Coffre Légendaire",   rarity: "legend",   glow: "#ff8e3c",
    reward: { title: "Titre légendaire 🌈", lines: ["Débloqué : « Machine de guerre ».", "À ce stade, t'es plus dans la moyenne. T'es au-dessus."] } },

  { id: 6, xp: 3600,  emoji: "👑", name: "Coffre Royal",        rarity: "royal",    glow: "#ffd166",
    reward: { title: "Couronne 👑", lines: ["T'es dans le top 1% de ceux qui tiennent un été entier.", "Fait. Prouvé. Gravé."] } },

  { id: 7, xp: 5000,  emoji: "⭐", name: "Coffre des Étoiles",  rarity: "stars",    glow: "#ffe45c",
    reward: { title: "Étoile filante ⭐", lines: ["Fais un vœu.", "Puis va le chercher au taf — les vœux se réalisent pas tout seuls."] } },

  { id: 8, xp: 7000,  emoji: "🔥", name: "Coffre Infernal",     rarity: "infernal", glow: "#ff3d8b",
    reward: { title: "Feu 🔥", lines: ["T'as brûlé l'été entier sans t'arrêter.", "Il reste une dernière porte. Une seule. Continue…"] } },

  { id: 9, xp: 10000, emoji: "🗝️", name: "COFFRE ULTIME",       rarity: "ultime",   glow: "#ff3d8b", ultimate: true,
    reward: { title: "Le secret ultime", lines: [] } },
];

/* ===== MESSAGE SECRET ULTIME — pour Lucas =====
 * ✏️ Édite chaque ligne à ta sauce. Reste toi.
 */
export const ULTIME = {
  to: "Lucas",
  lines: [
    "J'espère que t'as été appliqué cet été. Et surtout, j'espère qu'il a été magnifique.",
    "Depuis qu'on se connaît, tu me régales — vraiment, tellement de choses. Tu m'as mis dans ce mindset, ce truc qui donne envie de se lever et de devenir un monstre. J'espère que ce lock-in nous lâchera jamais.",
    "Après mes deux ans de prépa, mon objectif c'est de monter une boîte, une entreprise, tout ça. Et j'espère qu'on verra ça ensemble, plus tard.",
    "T'es un vrai. Force à toi frère. 🖤",
  ],
  sign: "— Clément",
};

/* ===== helpers ===== */
export const MAX_XP = CHESTS[CHESTS.length - 1].xp;

/* État du chemin de récompenses depuis l'XP total + la liste des coffres ouverts. */
export function chestRoad(total, openedArr) {
  const opened = new Set(openedArr || []);
  const chests = CHESTS.map(c => ({
    ...c,
    opened: opened.has(c.id),
    unlocked: total >= c.xp,
    ready: total >= c.xp && !opened.has(c.id),   // débloqué mais pas encore ouvert
  }));
  // prochain coffre encore verrouillé (cible de la barre de progression)
  const nextLocked = chests.find(c => !c.unlocked) || null;
  const reachedXp = chests.filter(c => c.unlocked).slice(-1)[0]?.xp || 0;
  const prevXp = nextLocked
    ? (chests.filter(c => c.unlocked).slice(-1)[0]?.xp || 0)
    : reachedXp;
  const span = nextLocked ? (nextLocked.xp - prevXp) : 1;
  const pct = nextLocked ? Math.max(0, Math.min(100, ((total - prevXp) / span) * 100)) : 100;
  const readyCount = chests.filter(c => c.ready).length;
  return { chests, nextLocked, pct, readyCount, prevXp, total };
}
