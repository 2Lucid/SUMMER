export const ACTIONS = {
  message: { label: "Premier message envoyé", tag: "Le pas le plus dur", emoji: "📨", xp: 50, fear: true, once: true },
  convo: { label: "Conversation relancée", tag: "Tu entretiens le feu", emoji: "💬", xp: 20, fear: false },
  proposer: { label: "Date proposé", tag: "BOSS FIGHT", emoji: "🎯", xp: 100, fear: true, once: true, boss: true },
  date: { label: "Date réalisé", tag: "BOSS VAINCU", emoji: "🏖️", xp: 250, fear: false, boss: true },
  rateau: { label: "Râteau encaissé", tag: "Seuls les joueurs peuvent en prendre", emoji: "🥀", xp: 75, fear: false, closes: true },
  couple: { label: "En couple", tag: "LOOT LÉGENDAIRE", emoji: "💘", xp: 500, fear: false, once: true, legendary: true },
  irl: { label: "Action courage IRL", tag: "Compliment, question, approche…", emoji: "⚡", xp: 30, fear: true, global: true },
};
export const LEVELS = [
  { xp: 0, t: "Spectateur" }, { xp: 100, t: "Rookie" }, { xp: 250, t: "Audacieux" }, { xp: 450, t: "Stratège" },
  { xp: 700, t: "Charmeur" }, { xp: 1000, t: "Boss de l'été" }, { xp: 1500, t: "Légende de la Côte" },
];
export const EMOJIS = ["🌸", "🌊", "⭐", "🍒", "🌙", "🦋", "🍑", "🔥", "🎾", "😇"];
export const DAILY_BONUS = 15;
export const COEUR_STAKE = 10;

export function levelIndex(xp) { let i = 0; for (let k = 0; k < LEVELS.length; k++) { if (xp >= LEVELS[k].xp) i = k; } return i; }
export function has(S, q, type) { return S.log.some(e => e.questId === q.id && e.type === type); }
export function fearEntries(S) { return S.log.filter(e => typeof e.fear === "number"); }

// Renvoie { e, parts } — parts = liste de { t } (texte) ou { b } (nom en gras),
// rendus en JSX côté composant : pas d'injection HTML possible.
export function mission(S) {
  const act = S.quests.filter(q => q.status === "active"); let q;
  const P = (...parts) => parts;
  if ((q = act.find(x => !has(S, x, "message")))) return { e: "📨", parts: P({ t: "Envoie le premier message à " }, { b: q.name }, { t: ". Court, spécifique, une question facile." }) };
  if ((q = act.find(x => has(S, x, "convo") && !has(S, x, "proposer")))) return { e: "🎯", parts: P({ t: "Boss fight : propose un date à " }, { b: q.name }, { t: ". Un truc concret — glace, verre, tour en mer." }) };
  if ((q = act.find(x => has(S, x, "message") && !has(S, x, "convo")))) return { e: "💬", parts: P({ t: "Relance la conversation avec " }, { b: q.name }, { t: ". Une story, un lien marrant, une vraie question." }) };
  if ((q = act.find(x => has(S, x, "proposer") && !has(S, x, "date")))) return { e: "🏖️", parts: P({ t: "Transforme l'essai : cale la date et le lieu avec " }, { b: q.name }, { t: "." }) };
  if (S.quests.length === 0) return { e: "🗺️", parts: P({ t: "Ajoute tes quêtes dans l'onglet Cœur, puis envoie le premier message à celle qui te fait le moins flipper." }) };
  return { e: "⚡", parts: P({ t: "Pipeline à jour. Farm du courage IRL : un compliment sincère ou une question à quelqu'un que tu ne connais pas." }) };
}
