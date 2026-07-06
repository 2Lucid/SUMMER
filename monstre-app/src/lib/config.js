import { fromDk, addDays, todayKey } from "./util.js";

export const RENTREE = "2026-09-01";
export const phaseOf = dk => (dk < "2026-07-13" ? "reset" : dk < "2026-08-12" ? "croisiere" : dk < "2026-09-01" ? "intense" : "rentree");
export const PHASE_META = {
  reset: { label: "RESET", desc: "Sommeil + mise en route", color: "#2647d0" },
  croisiere: { label: "CROISIÈRE", desc: "Matinées studieuses, après-midis libres", color: "#177245" },
  intense: { label: "INTENSE", desc: "Journées type prépa", color: "#c2182b" },
  rentree: { label: "RENTRÉE", desc: "C'est parti.", color: "#182559" },
};
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

export const MICRO_ACTIONS = [
  "Like + commente une story (pas juste un ❤️)", "Envoie un message à quelqu'un de nouveau",
  "Relance une conversation éteinte", "Fais un vrai compliment IRL, en face",
  "Pose une question à un(e) inconnu(e)", "Propose un truc concret (verre, glace, tour en mer)",
  "Regard + sourire à quelqu'un qui te plaît",
];
export const microOfDay = dk => { const d = fromDk(dk); return MICRO_ACTIONS[(d.getFullYear() + d.getMonth() * 31 + d.getDate()) % MICRO_ACTIONS.length]; };

/* Helpers stats (dashboard) -------------------------------------------- */
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
