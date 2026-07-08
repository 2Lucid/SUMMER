/* ===== PROFIL — Clément · PCSI Stanislas =====================================
 * Contenu d'origine de l'app (extrait verbatim de l'ancien config.js).
 * NE PAS toucher sans raison : c'est l'expérience de Clément, à l'identique.
 * Chaque profil expose la MÊME API (voir profiles/lucas.js + config.js). */
import { fromDk } from "../util.js";
import { FLASH as FLASH_PREPA, SUBJECTS as SUBJECTS_PREPA } from "../flash.js";

export const SCHOOL = "PCSI Stanislas";
export const RENTREE = "2026-09-01";

/* Ce qui existe dans SON app (l'expérience d'origine, complète). */
export const FEATURES = { coeur: true, sport: false, exam: true, worldLabel: "Prépa" };
/* Canal « courage » (S.xp) = le Cœur. */
export const CHANNEL = { emoji: "❤️", name: "coeur" };
/* Flashcards = le jeu prépa d'origine (défini dans lib/flash.js). */
export const FLASH = FLASH_PREPA;
export const SUBJECTS = SUBJECTS_PREPA;

/* Vue d'ensemble de l'été (onglet Planning) — contenu d'origine. */
export const OVERVIEW = {
  phases: [
    ["7 – 12 juil.", "RESET", "Sommeil, inscription Cahier de Prépa, démarrage doux, Ion.", "var(--bic)"],
    ["13 juil. – 11 août", "CROISIÈRE", "Matin studieux (2-3h), après-midi projets/mer, DM maths n°1 (31/07), chimie I (09/08), L'Œuvre puis Woolf.", "var(--green)"],
    ["12 – 31 août", "INTENSE", "Journées type prépa 5-6h : DM maths n°2, chimie II, République X, fiches, montée du réveil vers 6h45.", "var(--penred)"],
  ],
  readingTitle: "Plan de lecture — « Les arcanes de la création »",
  reading: [
    ["7 – 9 juil.", "Ion (Platon)", "≈ 2h30 avec notes"], ["10 juil. – 3 août", "L'Œuvre (Zola)", "≈ 20 p/jour, 15-18h au total"],
    ["4 – 10 août", "Un lieu à soi (Woolf)", "≈ 6-7h"], ["11 – 16 août", "La République, livre X", "≈ 3h30, dense"],
    ["17 – 31 août", "Fiches + 15-20 citations/œuvre", "classées par axes du thème"],
  ],
  readingNote: "Axes pour les fiches : inspiration vs travail · maîtrise vs dépossession · l'œuvre et le réel.",
  rules: [
    "Jamais plus d'une semaine sans maths.", "Le par-cœur (courbes, dérivées, primitives) s'auto-évalue régulièrement — c'est demandé à l'éval de rentrée.",
    "Jamais le corrigé sans avoir vraiment cherché.", "Un exo raté se refait quelques jours plus tard (le Drill s'en charge pour le calcul).",
    "Les devoirs à rendre, c'est toi seul — sans IA. Moi je planifie, j'interroge, je fais réciter.",
  ],
};

export const phaseOf = dk => (dk < "2026-07-13" ? "reset" : dk < "2026-08-12" ? "croisiere" : dk < "2026-09-01" ? "intense" : "rentree");

const RAMP = [
  { to: "2026-07-08", wake: "09:30", bed: "01:30" }, { to: "2026-07-10", wake: "09:00", bed: "01:00" },
  { to: "2026-07-12", wake: "08:30", bed: "00:45" }, { to: "2026-08-11", wake: "08:30", bed: "00:15" },
  { to: "2026-08-15", wake: "08:00", bed: "23:45" }, { to: "2026-08-19", wake: "07:30", bed: "23:15" },
  { to: "2026-08-23", wake: "07:15", bed: "23:00" }, { to: "2026-08-27", wake: "07:00", bed: "22:45" },
  { to: "2026-12-31", wake: "06:45", bed: "22:30" },
];
export const rampOf = dk => RAMP.find(r => dk <= r.to) || RAMP[RAMP.length - 1];

export const DEADLINES = [
  { dk: "2026-07-20", label: "Énigme info n°1 → mail au prof", icon: "💻" },
  { dk: "2026-07-31", label: "DM Maths n°1 → Cahier de Prépa", icon: "📐" },
  { dk: "2026-08-09", label: "Chimie Partie I (ex. 1–4) → Cahier de Prépa", icon: "⚗️" },
  { dk: "2026-08-20", label: "Énigme info n°2 → mail au prof", icon: "💻" },
  { dk: "2026-08-23", label: "Chimie Partie II (ex. 5–6) → Cahier de Prépa", icon: "⚗️" },
  { dk: "2026-08-30", label: "DM Maths n°2 → Cahier de Prépa", icon: "📐" },
  { dk: "2026-09-01", label: "RENTRÉE — copie SI + évals (maths, physique, chimie, anglais)", icon: "🎒" },
];

export const TODOS = [
  { id: "cdp", label: "S'inscrire sur cahier-de-prepa.fr/pcsi-stanislas + récupérer le DM maths de juillet" },
  { id: "platon", label: "Commander Platon, Ion + République X (GF Prépas scientifiques 2026)" },
  { id: "zola", label: "Commander Zola, L'Œuvre (GF) + Woolf, Un lieu à soi (Folio, trad. Darrieussecq)" },
  { id: "anglais", label: "Commander « Tout l'anglais aux concours » (3e éd., 2024)" },
  { id: "blouse", label: "Acheter blouse coton manches longues + lunettes de sécurité (TP semaine 1)" },
  { id: "dunod", label: "(Option) Cahier d'entraînement physique-chimie 1re année, Dunod" },
  { id: "esp", label: "Vérifier s'il existe un doc de travail d'été en espagnol" },
  { id: "opal", label: "Configurer Temps d'écran / Opal : blocage réseaux 9h–12h" },
  { id: "chiang", label: "Lire « Exhalation » (Ted Chiang) + écouter « The Merchant and the Alchemist's Gate »" },
];

const BOOKS = [
  { to: "2026-07-09", name: "Ion (Platon)" }, { to: "2026-08-03", name: "L'Œuvre (Zola) — ≈20 pages" },
  { to: "2026-08-10", name: "Un lieu à soi (Woolf)" }, { to: "2026-08-16", name: "La République, livre X" },
  { to: "2026-12-31", name: "Fiches + citations (les 4 œuvres)" },
];
export const bookOf = dk => (BOOKS.find(b => dk <= b.to) || BOOKS[BOOKS.length - 1]).name;

export const SCI_BY_DAY = { 1: "Physique", 2: "Chimie (devoir en cours)", 3: "SI / Info", 4: "Physique", 5: "Chimie (devoir en cours)", 6: "Refais tes ratés de la semaine" };

export function prepaBlocks(dk) {
  const ph = phaseOf(dk), wd = fromDk(dk).getDay(), book = bookOf(dk);
  const read = { start: "21:30", end: "22:10", k: "📖", l: "Lecture — " + book, s: "30–40 min, lumière basse, zéro écran" };
  if (ph === "rentree") return [];
  if (wd === 0) return [read];                       // dimanche = coupure, juste la lecture du soir
  if (ph === "reset") return [
    { start: "10:00", end: "10:45", k: "⚡", l: "Drill automatismes", s: "calcul mental chronométré" },
    { start: "10:45", end: "11:45", k: "📐", l: "Maths — cahier de calcul / DM", s: "cherche avant le corrigé" },
    { start: "18:00", end: "18:30", k: "🇬🇧", l: "Anglais — logbook / thème", s: "le soir, léger" },
    read,
  ];
  if (ph === "croisiere") return [
    { start: "09:00", end: "09:45", k: "📐", l: "Maths — drill + cahier de calcul", s: "" },
    { start: "10:00", end: "10:45", k: "🔬", l: SCI_BY_DAY[wd], s: "" },
    { start: "11:00", end: "11:30", k: "🇬🇧", l: "Anglais — logbook / thème / WSE", s: "" },
    { start: "18:00", end: "18:20", k: "🧠", l: "Par cœur — 10 flashcards", s: "" },
    read,
  ];
  return [                                            // intense
    { start: "09:00", end: "12:00", k: "📐", l: "BLOC 1 — Maths", s: "DM, cahier de calcul, par cœur" },
    { start: "14:30", end: "16:30", k: "🔬", l: "BLOC 2 — " + SCI_BY_DAY[wd], s: "physique / chimie / SI-info" },
    { start: "16:30", end: "17:00", k: "⚡", l: "Drill — 2 séries", s: "" },
    { start: "17:00", end: "17:45", k: "🌍", l: "Anglais + espagnol léger", s: "" },
    read,
  ];
}

export function buildChecklist(dk) {
  const ph = phaseOf(dk), r = rampOf(dk), wd = fromDk(dk).getDay();
  if (ph === "rentree") return [{ id: "go", label: "Sois un monstre. Bonne rentrée. 🎒" }];
  if (wd === 0) {
    return ph === "intense" ? [
      { id: "wake", label: "Réveil ≤ " + r.wake + " (+30 min max)" },
      { id: "flash", label: "Révision légère : 15 flashcards + relecture fiches" },
      { id: "out", label: "Repos actif — sortie, mer, sport" },
      { id: "prep", label: "Préparer la semaine (planning + affaires)" },
      { id: "bed", label: "Coucher " + r.bed },
    ] : [
      { id: "wake", label: "Réveil libre mais ≤ " + r.wake + " + 1h" },
      { id: "read", label: "Lecture plaisir 30 min" },
      { id: "vo", label: "1 film / épisode en VO → entrée logbook" },
      { id: "off", label: "Zéro maths. Vraie coupure." },
      { id: "bed", label: "Coucher " + r.bed },
    ];
  }
  if (ph === "reset") return [
    { id: "wake", label: "Réveil " + r.wake + " + lumière dehors 10 min" },
    { id: "drill", label: "Drill automatismes : 1 série (onglet Drill)" },
    { id: "math", label: "Maths : cahier de calcul / DM 30–45 min" },
    { id: "read", label: "Lecture : " + bookOf(dk) + " — 30 à 45 min" },
    { id: "eng", label: "Anglais : 1 entrée logbook ou 10 phrases de thème" },
    { id: "caf", label: "Caféine stop 14h" },
    { id: "bed", label: "Coucher " + r.bed + " — écrans off 30 min avant" },
  ];
  if (ph === "croisiere") return [
    { id: "wake", label: "Réveil " + r.wake + " + lumière" },
    { id: "drill", label: "Drill automatismes : 1 série" },
    { id: "math", label: "Maths : cahier de calcul / DM 45 min" },
    { id: "sci", label: SCI_BY_DAY[wd] + " : 45 min" },
    { id: "eng", label: "Anglais : logbook / thème / visio WSE 30 min" },
    { id: "read", label: "Lecture : " + bookOf(dk) + " — 45 min" },
    { id: "flash", label: "Par cœur : 10 flashcards" },
    { id: "bed", label: "Coucher " + r.bed },
  ];
  return [
    { id: "wake", label: "Réveil " + r.wake },
    { id: "b1", label: "Bloc 1 (9h–12h) : Maths — DM2, cahier de calcul, par cœur" },
    { id: "drill", label: "Drill automatismes : 2 séries" },
    { id: "b2", label: "Bloc 2 (14h30–16h30) : Physique / Chimie / SI-Info" },
    { id: "lang", label: "17h : anglais (thème + logbook) + espagnol léger" },
    { id: "read", label: "Philo : " + bookOf(dk) },
    { id: "bed", label: "Coucher " + r.bed },
  ];
}

export function buildDayPlan(dk) {
  const ph = phaseOf(dk), r = rampOf(dk), wd = fromDk(dk).getDay(), book = bookOf(dk);
  if (ph === "rentree") return [{ t: "", k: "🎒", l: "C'est la rentrée. Sois un monstre.", s: "PCSI Stanislas — copie SI + évals maths/physique/chimie/anglais" }];
  const bed = { t: r.bed, k: "🌙", l: "Coucher", s: "écrans off 30 min avant · lit = sommeil" };
  const readEve = b => ({ t: "21:30", k: "📖", l: "Lecture du soir — " + b, s: "30 à 40 min, au calme, lumière basse", read: true });
  if (wd === 0) return [
    { t: r.wake, k: "☀️", l: "Réveil libre (≤ " + r.wake + " + 1h)", s: "grasse mat' ok, mais pas toute la matinée" },
    { t: "Matin", k: "🌊", l: "Repos actif", s: "sortie, mer, sport, voir du monde" },
    { t: "Aprem", k: "🎬", l: "1 film / épisode en VO", s: "→ une entrée dans le logbook anglais" },
    readEve("plaisir (ce que tu veux)"), bed];
  if (ph === "reset") return [
    { t: r.wake, k: "☀️", l: "Réveil + lumière dehors 10 min", s: "cible " + r.wake },
    { t: "10:00", k: "⚡", l: "Drill automatismes — 1 série", s: "calcul mental chronométré (onglet Drill)" },
    { t: "10:45", k: "📐", l: "Maths — cahier de calcul / DM", s: "30 à 45 min, cherche avant le corrigé" },
    { t: "14:00", k: "☕", l: "Dernier café", s: "caféine stop 14h" },
    { t: "18:00", k: "🇬🇧", l: "Anglais — logbook ou 10 phrases de thème", s: "20 min" },
    readEve(book), bed];
  if (ph === "croisiere") return [
    { t: r.wake, k: "☀️", l: "Réveil + lumière", s: "cible " + r.wake },
    { t: "09:00", k: "📐", l: "Maths — drill + cahier de calcul", s: "45 min" },
    { t: "10:00", k: "🔬", l: SCI_BY_DAY[wd], s: "45 min" },
    { t: "11:00", k: "🇬🇧", l: "Anglais — logbook / thème / visio WSE", s: "30 min" },
    { t: "Aprem", k: "🌊", l: "Libre — projets, mer, sport", s: "vraie coupure de l'après-midi" },
    { t: "18:00", k: "🧠", l: "Par cœur — 10 flashcards", s: "onglet Par cœur" },
    readEve(book), bed];
  return [
    { t: r.wake, k: "☀️", l: "Réveil", s: "cible " + r.wake + " — non négociable" },
    { t: "09:00", k: "📐", l: "BLOC 1 — Maths", s: "DM, cahier de calcul, par cœur (≈ 3h)" },
    { t: "12:00", k: "🍽️", l: "Déjeuner + marche", s: "vraie coupure" },
    { t: "14:30", k: "🔬", l: "BLOC 2 — " + SCI_BY_DAY[wd], s: "physique / chimie / SI-info (≈ 2h)" },
    { t: "16:30", k: "⚡", l: "Drill — 2 séries", s: "entretien du calcul" },
    { t: "17:00", k: "🌍", l: "Anglais (thème + logbook) + espagnol léger", s: "45 min" },
    readEve(book), bed];
}
