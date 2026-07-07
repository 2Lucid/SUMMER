import { fromDk } from "./util.js";

/* Types d'actions « couple » (voir ACTIONS dans coeur.js) */
export const COUPLE_TYPES = ["grat", "attn", "ecoute", "qtime", "lovemap", "repair", "datec"];

/* Objectif hebdo de « dépôts » sur le compte affectif (métaphore Gottman) */
export const WEEK_GOAL = 10;

/* Boutons de log rapide (type, emoji, libellé court) */
export const COUPLE_QUICK = [
  ["grat", "🙏", "Gratitude"],
  ["attn", "🎁", "Attention"],
  ["ecoute", "👂", "Écoute active"],
  ["qtime", "🕯️", "Temps de qualité"],
  ["lovemap", "🗺️", "Question profonde"],
  ["repair", "🛠️", "Réparation"],
  ["datec", "💞", "Date à deux"],
];

/* Défi concret du jour (petit dépôt affectif) */
export const COUPLE_MICRO = [
  "Envoie-lui un message qui n'attend rien en retour.",
  "Fais une chose de sa to-do sans qu'il/elle demande.",
  "Dis merci pour un truc qu'on ne remarque jamais.",
  "Ramène/prépare un petit truc qu'il/elle adore.",
  "Facilite-lui la journée : prépare ou range quelque chose.",
  "Pose une question sur son monde intérieur, écoute 5 min sans solutionner.",
  "Un vrai câlin de 6 secondes, pour de bon.",
  "Rappelle-lui un souvenir précis que tu adores.",
  "Propose un mini-plan à deux cette semaine.",
  "Complimente une qualité, pas un physique.",
  "Coupez les écrans 20 min ce soir, juste vous deux.",
  "Demande : « de quoi tu as besoin cette semaine ? »",
  "Fais-le/la rire volontairement, au moins une fois.",
  "Écris 3 choses que tu apprécies chez lui/elle (garde-les).",
];

/* Principe du jour — basé sur la recherche (Gottman & co.), toujours actionnable */
export const PRINCIPLES = [
  { t: "Le ratio magique 5:1", s: "Gottman a mesuré que les couples qui durent gardent ~5 interactions positives pour 1 négative — même en pleine dispute.", a: "Vise 5 petits positifs (merci, geste, compliment) avant tout reproche aujourd'hui." },
  { t: "Réponds à ses « bids »", s: "Un « bid » est une micro-tentative de connexion (« regarde ça »). Se tourner vers plutôt que l'ignorer prédit la longévité du couple.", a: "Quand il/elle te sollicite, lâche ton téléphone et réponds vraiment." },
  { t: "Le soft startup", s: "93 % des disputes finissent comme elles commencent. Attaquer fort = échec ; commencer doux = résolution.", a: "Exprime un besoin en « je » : « je me sens…, j'aurais besoin de… », sans « tu, toujours »." },
  { t: "Répare, ne vise pas la perfection", s: "Les couples solides ne se disputent pas moins — ils réparent plus vite (humour, excuse, geste).", a: "Après la moindre tension, tente une réparation dans l'heure, et loge-la ici." },
  { t: "Enrichis ta « love map »", s: "Connaître son monde intérieur — rêves, peurs, stress du moment — est la base de l'intimité.", a: "Pose une vraie question ouverte et écoute sans chercher à résoudre." },
  { t: "Admiration & gratitude", s: "Chercher activement ce qu'on admire chez l'autre est l'antidote à l'usure du quotidien.", a: "Dis-lui une chose précise que tu admires chez lui/elle aujourd'hui." },
  { t: "Accepte son influence", s: "Chez les couples heureux, chacun laisse l'autre l'influencer sur les décisions.", a: "Sur un choix du jour, demande son avis — et suis-le pour de vrai." },
  { t: "Les rituels de connexion", s: "Un rituel quotidien répété (café du matin, débrief du soir) crée de la sécurité affective.", a: "Instaure un mini-rituel : des retrouvailles du soir qui comptent vraiment (6 min)." },
  { t: "La conversation anti-stress", s: "20 min/jour où l'un décharge son stress externe et l'autre écoute (sans conseil) protège le couple.", a: "Ce soir : « raconte ta journée » — tu écoutes et tu valides, zéro solution." },
  { t: "Le toucher qui apaise", s: "Six secondes de câlin ou de baiser libèrent l'ocytocine et régulent le stress à deux.", a: "Un vrai câlin de 6 secondes aujourd'hui — pas un frôlement." },
  { t: "Assume la bonne intention", s: "Interpréter le geste de l'autre en positif désamorce la majorité des micro-conflits.", a: "Au moindre doute aujourd'hui, choisis l'explication la plus généreuse." },
  { t: "Cultivez vos rêves partagés", s: "Derrière les conflits durables se cachent souvent des rêves de vie. Les explorer les transforme.", a: "Parlez 10 min d'un rêve à 5 ans — voyage, projet, envie — sans juger." },
];

/* Questions « love map » — profondes mais faciles à poser */
export const LOVE_MAP_QUESTIONS = [
  "Quel est ton meilleur souvenir de nous ?",
  "Qu'est-ce qui te stresse le plus en ce moment, hors de nous ?",
  "De quoi es-tu le/la plus fier·e cette année ?",
  "Quel petit geste de ma part te fait le plus de bien ?",
  "Comment tu te sens le plus aimé·e : mots, gestes, temps, cadeaux ou toucher ?",
  "Un rêve un peu fou que tu aimerais qu'on réalise ensemble ?",
  "Qu'est-ce qui te manque un peu entre nous en ce moment ?",
  "Quelle a été ta plus grande leçon de vie récemment ?",
  "Comment était l'amour dans ta famille quand tu étais petit·e ?",
  "Qu'est-ce qui te fait te sentir en sécurité avec moi ?",
  "Si on partait demain, ce serait où ?",
  "Quelle version de toi as-tu envie de devenir cette année ?",
  "Qu'est-ce que je fais qui te fait rire à tous les coups ?",
  "Quand tu vas mal, tu as besoin qu'on te console, qu'on te laisse, ou qu'on t'aide à résoudre ?",
  "Quel moment de ta semaine tu préfères avec moi ?",
  "Y a-t-il une peur que tu n'oses pas trop me dire ?",
  "C'est quoi une soirée parfaite pour toi, là, maintenant ?",
  "Qu'est-ce que tu admires le plus chez tes modèles ?",
  "Qu'est-ce qui te ferait te sentir plus désiré·e ?",
  "Un truc que tu aimerais qu'on arrête de faire tous les deux ?",
];

const idxOf = (dk, mod) => { const d = fromDk(dk); return (d.getFullYear() + d.getMonth() * 31 + d.getDate()) % mod; };
export const coupleMicroOfDay = dk => COUPLE_MICRO[idxOf(dk, COUPLE_MICRO.length)];
export const principleOfDay = dk => PRINCIPLES[idxOf(dk, PRINCIPLES.length)];
export const lovemapOfDay = dk => LOVE_MAP_QUESTIONS[idxOf(dk, LOVE_MAP_QUESTIONS.length)];

/* Dépôts affectifs sur les 7 derniers jours (toutes actions couple) */
export function deposits7(S) {
  const since = Date.now() - 7 * 864e5;
  return S.log.filter(e => COUPLE_TYPES.includes(e.type) && e.ts >= since).length;
}
