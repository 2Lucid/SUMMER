/* ===== Monde SPORT (profil Lucas) ============================================
 * Même moteur que le Cœur : le canal S.xp / S.streak / S.coeurDaily est
 * réutilisé tel quel (une action sport par jour = jour sécurisé, sinon
 * −10 XP le lendemain via enforceCoeurDaily). Zéro migration de données,
 * classement et coffres continuent de marcher pour tout le monde.
 *
 * Le contrat : 100 pompes + 100 squats PAR JOUR, où que tu sois (en séries,
 * 4×25 ok). C'est la discipline. La masse, elle, se construit à la salle /
 * piscine ≥ 3 fois par semaine (l'après-midi, t'es libre). */
import { fromDk, todayKey } from "./util.js";

export const ACTIONS = {
  daily: { label: "100 pompes + 100 squats", tag: "Le contrat quotidien — où que tu sois", emoji: "💪", xp: 30, daily: true },
  salle: { label: "Séance salle", tag: "Progressive overload — c'est ici que la masse se construit", emoji: "🏋️", xp: 40, session: true },
  natation: { label: "Séance natation", tag: "Dos, épaules, cardio — le physique complet", emoji: "🏊", xp: 40, session: true },
  autre: { label: "Autre sport", tag: "Foot, tennis, course… ça compte", emoji: "🏃", xp: 25, session: true },
  pesee: { label: "Pesée de la semaine", tag: "La prise de masse se mesure", emoji: "⚖️", xp: 10, weigh: true },
};
export const SESSION_TYPES = ["salle", "natation", "autre"];

export const LEVELS = [
  { xp: 0, t: "Échauffement" }, { xp: 100, t: "Régulier" }, { xp: 250, t: "Discipliné" }, { xp: 450, t: "Athlète" },
  { xp: 700, t: "Machine" }, { xp: 1000, t: "Monstre physique" }, { xp: 1500, t: "Légende de la fonte" },
];
export const levelIndex = xp => { let i = 0; for (let k = 0; k < LEVELS.length; k++) { if (xp >= LEVELS[k].xp) i = k; } return i; };

export const SPORT_STAKE = 10;      // perdu le lendemain d'un jour à zéro (cf. enforceCoeurDaily)
export const WEEK_GOAL = 3;         // séances (salle/natation/autre) sur 7 jours glissants
export const WEEK_BONUS = 30;       // bonus quand la 3e séance de la semaine tombe

/* Journal : les actions sport vivent dans S.log (types ci-dessus). */
export const sportLog = S => (S.log || []).filter(e => ACTIONS[e.type]);
export const dailyDone = (S, dk) => (S.log || []).some(e => e.type === "daily" && e.dk === (dk || todayKey()));
export function sessions7(S) { const since = Date.now() - 7 * 864e5; return (S.log || []).filter(e => SESSION_TYPES.includes(e.type) && e.ts >= since).length; }
export const countType = (S, t) => (S.log || []).filter(e => e.type === t).length;

/* Pesées (S.sport.weight = [{dk, kg, ts}]). */
export const weights = S => ((S.sport && S.sport.weight) || []).slice().sort((a, b) => a.dk < b.dk ? -1 : 1);
export function weighedThisWeek(S) { const since = Date.now() - 7 * 864e5; return weights(S).some(w => w.ts >= since); }
export function weightTrend(S) {
  const w = weights(S); if (w.length < 2) return null;
  const d = w[w.length - 1].kg - w[0].kg;
  return { from: w[0].kg, to: w[w.length - 1].kg, delta: Math.round(d * 10) / 10 };
}

/* Records perso (S.sport.prs = { pushups: {v, dk}, squats: {v, dk} }). */
export const PR_DEFS = [
  { id: "pushups", label: "Pompes max (1 série)", emoji: "💪" },
  { id: "squats", label: "Squats max (1 série)", emoji: "🦵" },
];
export const prOf = (S, id) => (S.sport && S.sport.prs && S.sport.prs[id]) || null;

/* Mission du moment (équivalent sport de mission() du Cœur). */
export function sportMission(S) {
  if (!dailyDone(S)) return { e: "💪", txt: "Le contrat : 100 pompes + 100 squats. En séries si tu veux (4×25), mais aujourd'hui, ça passe." };
  const n = sessions7(S);
  if (n < WEEK_GOAL) return { e: "🏋️", txt: "Contrat du jour rempli ✅ — il te reste " + (WEEK_GOAL - n) + " séance" + (WEEK_GOAL - n > 1 ? "s" : "") + " (salle ou natation) cette semaine. L'aprem est à toi." };
  if (!weighedThisWeek(S)) return { e: "⚖️", txt: "Semaine bouclée (" + n + "/" + WEEK_GOAL + " séances) 🔥 Monte sur la balance — la prise de masse, ça se mesure." };
  return { e: "👑", txt: "Tout est fait : contrat quotidien, " + n + " séances, pesée. T'es une machine. Récupère bien, mange bien." };
}

/* Conseil prise de masse du jour (rotation quotidienne). */
export const MUSCLE_TIPS = [
  "Prise de masse = surplus calorique. Vise ~2 g de protéines par kilo de poids de corps, chaque jour.",
  "Progressive overload : chaque séance, essaie +1 rep ou +1 kg quelque part. C'est LA règle de la masse.",
  "Le muscle se construit pendant le sommeil. Ton coucher, c'est de la muscu invisible.",
  "Pompes : corps gainé, coudes ~45°, descente contrôlée. 100 reps propres > 150 bâclées.",
  "Squats : talons au sol, descends sous la parallèle si tu peux. L'amplitude paie.",
  "Mange autour de l'entraînement : un vrai repas dans les 2 h après la salle.",
  "La natation creuse l'appétit — parfait en prise de masse, à condition de manger derrière.",
  "Note tes charges à la salle (dans Records) : ce qui se mesure progresse.",
  "Jour off de salle ≠ jour off du contrat. Les 100/100, c'est tous les jours.",
  "L'eau compte : 2-3 L par jour, plus quand tu t'entraînes l'été.",
  "Si t'as pas le temps : 4×25 pompes réparties dans la journée. Le ✓ vaut pareil.",
  "Les fibres qui brûlent aujourd'hui sont les kilos de masse de septembre. Encaisse.",
];
export const tipOfDay = dk => { const d = fromDk(dk); return MUSCLE_TIPS[(d.getFullYear() + d.getMonth() * 31 + d.getDate()) % MUSCLE_TIPS.length]; };
