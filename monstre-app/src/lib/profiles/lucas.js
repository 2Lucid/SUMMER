/* ===== PROFIL — Lucas · BSc AIDAMS (CentraleSupélec × ESSEC) ==================
 * Bachelor in Artificial Intelligence, Data & Management Sciences.
 * Rentrée : 27 août 2026, campus Paris-Saclay. Année 1 : 75 % Centrale (maths,
 * Python, probas/stats, algo) + 25 % ESSEC (éco, management) — 100 % en anglais.
 *
 * Été = « matinée de monstre, après-midi libre » : ~3 h de taf le matin
 * (chinois · maths · Python · anglais), le reste de la journée est à lui
 * (salle/natation, LUCID, amis). Monde Cœur remplacé par le monde Sport.
 * Objectifs issus d'une vraie recherche sur le programme (voir git log).
 * Même API que profiles/clement.js. */
import { fromDk } from "../util.js";

export const SCHOOL = "CentraleSupélec × ESSEC";
export const RENTREE = "2026-08-27";

/* Ce qui existe / n'existe pas dans SON app. */
export const FEATURES = { coeur: false, sport: true, exam: false, worldLabel: "Études" };
/* Canal « courage » (S.xp) réutilisé pour le sport : emoji du classement/accueil. */
export const CHANNEL = { emoji: "💪", name: "sport" };

export const phaseOf = dk => (dk < "2026-07-20" ? "reset" : dk < "2026-08-17" ? "croisiere" : dk < "2026-08-27" ? "intense" : "rentree");
export const PHASE_META = {
  reset: { label: "MISE EN ROUTE", desc: "Installer les habitudes — matinées légères", color: "#2647d0" },
  croisiere: { label: "CROISIÈRE", desc: "Matinée de monstre, après-midi libre", color: "#177245" },
  intense: { label: "LIGNE DROITE", desc: "Cap sur Saclay — réveil qui avance", color: "#c2182b" },
  rentree: { label: "RENTRÉE", desc: "BSc AIDAMS. C'est parti.", color: "#182559" },
};

/* Réveil 9h30 tout l'été (c'est le deal), rampe douce vers 8h sur la fin. */
const RAMP = [
  { to: "2026-08-16", wake: "09:30", bed: "00:30" },
  { to: "2026-08-20", wake: "09:00", bed: "00:00" },
  { to: "2026-08-23", wake: "08:30", bed: "23:30" },
  { to: "2026-08-26", wake: "08:00", bed: "23:15" },
  { to: "2026-12-31", wake: "07:30", bed: "23:00" },
];
export const rampOf = dk => RAMP.find(r => dk <= r.to) || RAMP[RAMP.length - 1];

/* Objectifs SMART vers le 27 août (basés sur le vrai contenu de l'année 1).
 * À affiner dès que l'école envoie le programme officiel de vacances. */
export const DEADLINES = [
  { dk: "2026-07-15", label: "Programme officiel de vacances : récupéré + lu (mail/portail)", icon: "📩" },
  { dk: "2026-07-19", label: "Chinois — pinyin + 4 tons maîtrisés (lire 20 syllabes sans erreur)", icon: "🇨🇳" },
  { dk: "2026-07-26", label: "3Blue1Brown — Essence of Linear Algebra + Calculus finis (en VO)", icon: "📐" },
  { dk: "2026-08-09", label: "Python — CS50P jusqu'à « Libraries » + 3 mini-programmes perso", icon: "🐍" },
  { dk: "2026-08-16", label: "Khan Academy — algèbre linéaire + probas ≥ 90 % · intro NumPy/Pandas", icon: "📊" },
  { dk: "2026-08-23", label: "Maths — sujet type test 90 min chrono · Chinois ~120 caractères (Anki)", icon: "🎯" },
  { dk: "2026-08-26", label: "Relire le programme officiel + affaires prêtes (Saclay)", icon: "🎒" },
  { dk: "2026-08-27", label: "RENTRÉE — BSc AIDAMS (CentraleSupélec × ESSEC)", icon: "🎓" },
];

export const TODOS = [
  { id: "prog", label: "Guetter le programme officiel de vacances (mail/portail école)" },
  { id: "colab", label: "Créer un compte Google Colab (Python sans installation) — VS Code en semaine 2-3" },
  { id: "cs50", label: "S'inscrire à CS50P (cs50.harvard.edu/python) — gratuit, en anglais" },
  { id: "zh", label: "Installer HelloChinese + Anki avec un deck HSK1" },
  { id: "exo7", label: "Mettre en favori Exo7 (PDF algèbre + analyse) et les playlists 3Blue1Brown" },
  { id: "voc", label: "Créer ta fiche vocab tech EN (matrix, derivative, mean, loop, variable…)" },
  { id: "toeic", label: "Faire 1 test blanc TOEIC/IELTS pour te situer en anglais" },
  { id: "salle", label: "S'abonner à la salle + repérer les horaires piscine de l'été" },
  { id: "opal", label: "Configurer Temps d'écran : réseaux bloqués 9h30–13h" },
  { id: "lucid", label: "(LUCID) Lister avec Clément les headlines à écrire pour le site" },
];

/* Lecture du soir — business/tech en anglais : double coup lecture + langue. */
const BOOKS = [
  { to: "2026-07-20", name: "Zero to One (Peter Thiel, en VO)" },
  { to: "2026-08-05", name: "The Lean Startup (Eric Ries, en VO)" },
  { to: "2026-08-18", name: "Weapons of Math Destruction (Cathy O'Neil)" },
  { to: "2026-08-26", name: "Storytelling with Data (Nussbaumer Knaflic)" },
  { to: "2026-12-31", name: "Fiches — idées clés + vocab business EN" },
];
export const bookOf = dk => (BOOKS.find(b => dk <= b.to) || BOOKS[BOOKS.length - 1]).name;

/* Focus maths/Python du jour (1 = lundi … 6 = samedi). Dimanche = coupure. */
export const SCI_BY_DAY = {
  1: "Maths — algèbre linéaire (3B1B → Khan → Exo7)",
  2: "Python — CS50P, leçon + exos",
  3: "Maths — probabilités & statistiques",
  4: "Python — CS50P + mini-projet perso",
  5: "Maths — analyse / calcul (dérivées, intégrales)",
  6: "Anglais + refais tes ratés de la semaine",
};

/* ── Blocs calendrier (matinée sacrée + soir léger) ───────────────────────── */
export function prepaBlocks(dk) {
  const ph = phaseOf(dk), wd = fromDk(dk).getDay(), book = bookOf(dk);
  const sport = { start: "09:40", end: "09:55", k: "💪", l: "100 pompes + 100 squats", s: "en séries (4×25 ok) — avant la douche" };
  const read = { start: "22:00", end: "22:30", k: "📖", l: "Lecture — " + book, s: "25–30 min, lumière basse, zéro écran" };
  if (ph === "rentree") return [];
  if (wd === 0) return [sport, read];                 // dimanche = coupure (le 100/100 reste)
  if (ph === "reset") return [
    sport,
    { start: "10:00", end: "10:20", k: "🇨🇳", l: "Chinois — pinyin & tons", s: "HelloChinese, 15-20 min" },
    { start: "10:20", end: "11:10", k: "📐", l: "Maths — remise en route", s: "3Blue1Brown + Khan Academy" },
    { start: "11:20", end: "12:00", k: "🐍", l: "Python — premiers pas", s: "Colab / Scrimba, en douceur" },
    read,
  ];
  if (ph === "croisiere") return [
    sport,
    { start: "10:00", end: "10:20", k: "🇨🇳", l: "Chinois — HelloChinese + Anki", s: "streak quotidien" },
    { start: "10:20", end: "11:20", k: "📐", l: SCI_BY_DAY[wd].startsWith("Maths") ? SCI_BY_DAY[wd] : "Maths — fiche + exos Exo7", s: "" },
    { start: "11:30", end: "12:30", k: "🐍", l: SCI_BY_DAY[wd].startsWith("Python") ? SCI_BY_DAY[wd] : "Python — CS50P", s: "" },
    { start: "12:30", end: "12:50", k: "🇬🇧", l: "Anglais — vocab tech / logbook", s: "cours déjà en VO = bonus" },
    read,
  ];
  return [                                            // ligne droite
    sport,
    { start: "09:30", end: "09:40", k: "☀️", l: "Réveil qui avance", s: "cap sur les horaires de Saclay" },
    { start: "10:00", end: "10:20", k: "🇨🇳", l: "Chinois — révision Anki", s: "consolide tes ~120 caractères" },
    { start: "10:20", end: "11:30", k: "📐", l: "Maths — sujet type test / révision", s: "90 min chrono une fois par semaine" },
    { start: "11:40", end: "12:40", k: "🐍", l: "Python — NumPy / Pandas", s: "un script data de A à Z" },
    { start: "12:40", end: "13:00", k: "🇬🇧", l: "Anglais — pitch + vocab", s: "" },
    read,
  ];
}

/* ── Checklist du jour (le cœur du suivi — items = XP) ────────────────────── */
export function buildChecklist(dk) {
  const ph = phaseOf(dk), r = rampOf(dk), wd = fromDk(dk).getDay();
  if (ph === "rentree") return [{ id: "go", label: "Première ligne du BSc. Sois un monstre. 🎓" }];
  if (wd === 0) return [
    { id: "wake", label: "Réveil libre mais ≤ " + r.wake + " + 1h" },
    { id: "zh", label: "Chinois : 10 min (le streak survit au dimanche)" },
    { id: "vo", label: "1 film / épisode / podcast en VO" },
    { id: "off", label: "Vraie coupure. Mer, amis, recharge." },
    { id: "bed", label: "Coucher " + r.bed },
  ];
  if (ph === "reset") return [
    { id: "wake", label: "Réveil " + r.wake + " + eau + lumière dehors" },
    { id: "zh", label: "Chinois : 15-20 min pinyin & tons (HelloChinese)" },
    { id: "math", label: "Maths : 45 min (3Blue1Brown / Khan)" },
    { id: "code", label: "Python : 40 min premiers pas (Colab)" },
    { id: "read", label: "Lecture : " + bookOf(dk) + " — 25 min" },
    { id: "bed", label: "Coucher " + r.bed + " — écrans off 30 min avant" },
  ];
  if (ph === "croisiere") return [
    { id: "wake", label: "Réveil " + r.wake + " + eau + lumière" },
    { id: "zh", label: "Chinois : 20 min (HelloChinese + Anki)" },
    { id: "math", label: "Maths : 1h — " + (SCI_BY_DAY[wd].startsWith("Maths") ? SCI_BY_DAY[wd].slice(8) : "fiche + exos") },
    { id: "code", label: "Python : 1h — CS50P" + (SCI_BY_DAY[wd].startsWith("Python") ? " (" + SCI_BY_DAY[wd].slice(9) + ")" : "") },
    { id: "eng", label: "Anglais : 15-20 min vocab tech / logbook" },
    { id: "flash", label: "Par cœur : 10 flashcards (le soir)" },
    { id: "read", label: "Lecture : " + bookOf(dk) + " — 25 min" },
    { id: "bed", label: "Coucher " + r.bed },
  ];
  return [                                            // ligne droite
    { id: "wake", label: "Réveil " + r.wake + " — on avance vers Saclay" },
    { id: "zh", label: "Chinois : 20 min révision Anki (~120 caractères)" },
    { id: "math", label: "Maths : 1h10 — révision / sujet type test" },
    { id: "code", label: "Python : 1h — NumPy / Pandas, script data" },
    { id: "eng", label: "Anglais : pitch + vocab 20 min" },
    { id: "flash", label: "Par cœur : 10 flashcards" },
    { id: "read", label: "Lecture : " + bookOf(dk) },
    { id: "bed", label: "Coucher " + r.bed },
  ];
}

/* ── Journée type (vue Planning) ──────────────────────────────────────────── */
export function buildDayPlan(dk) {
  const ph = phaseOf(dk), r = rampOf(dk), wd = fromDk(dk).getDay(), book = bookOf(dk);
  if (ph === "rentree") return [{ t: "", k: "🎓", l: "C'est la rentrée. Sois un monstre.", s: "BSc AIDAMS — CentraleSupélec × ESSEC, campus Saclay" }];
  const bed = { t: r.bed, k: "🌙", l: "Coucher", s: "écrans off 30 min avant · lit = sommeil" };
  const readEve = b => ({ t: "22:00", k: "📖", l: "Lecture du soir — " + b, s: "25 à 30 min, au calme, lumière basse", read: true });
  const sport = { t: "09:40", k: "💪", l: "100 pompes + 100 squats", s: "en séries — le ✓ se coche dans l'onglet Sport" };
  const free = { t: "Aprem", k: "🌴", l: "LIBRE — salle/natation, LUCID, amis", s: "t'as fini ta journée de taf. Profite sans culpabilité." };
  if (wd === 0) return [
    { t: r.wake, k: "☀️", l: "Réveil libre (≤ " + r.wake + " + 1h)", s: "grasse mat' ok" },
    sport,
    { t: "Journée", k: "🌊", l: "Coupure totale", s: "mer, sport, amis — recharge" },
    { t: "Soir", k: "🎬", l: "1 film / épisode en VO", s: "+ 10 min de chinois pour le streak" },
    readEve("plaisir (ce que tu veux)"), bed];
  if (ph === "reset") return [
    { t: r.wake, k: "☀️", l: "Réveil + eau + lumière", s: "cible " + r.wake },
    sport,
    { t: "10:00", k: "🇨🇳", l: "Chinois — pinyin & tons", s: "HelloChinese, 15-20 min" },
    { t: "10:20", k: "📐", l: "Maths — remise en route", s: "3Blue1Brown / Khan, 45 min" },
    { t: "11:20", k: "🐍", l: "Python — premiers pas", s: "Google Colab, 40 min" },
    free,
    readEve(book), bed];
  if (ph === "croisiere") return [
    { t: r.wake, k: "☀️", l: "Réveil + eau + lumière", s: "cible " + r.wake },
    sport,
    { t: "10:00", k: "🇨🇳", l: "Chinois — HelloChinese + Anki", s: "20 min, streak quotidien" },
    { t: "10:20", k: "📐", l: SCI_BY_DAY[wd].startsWith("Maths") ? SCI_BY_DAY[wd] : "Maths — fiche + exos", s: "1h" },
    { t: "11:20", k: "☕", l: "Pause", s: "10 min, bouge, loin des écrans" },
    { t: "11:30", k: "🐍", l: SCI_BY_DAY[wd].startsWith("Python") ? SCI_BY_DAY[wd] : "Python — CS50P", s: "1h" },
    { t: "12:30", k: "🇬🇧", l: "Anglais — vocab tech / logbook", s: "15-20 min et t'as FINI 🎉" },
    free,
    readEve(book), bed];
  return [
    { t: r.wake, k: "☀️", l: "Réveil", s: "cible " + r.wake + " — on prépare le rythme Saclay" },
    sport,
    { t: "10:00", k: "🇨🇳", l: "Chinois — révision Anki", s: "20 min, consolide" },
    { t: "10:20", k: "📐", l: "Maths — révision / sujet type test", s: "1h10 (90 min chrono 1×/sem)" },
    { t: "11:40", k: "🐍", l: "Python — NumPy / Pandas", s: "1h, un script data de A à Z" },
    { t: "12:40", k: "🇬🇧", l: "Anglais — pitch + vocab", s: "20 min et c'est plié" },
    free,
    readEve(book), bed];
}

/* ── Flashcards perso : maths L1 · Python · chinois HSK1 · anglais tech ─────
 * ids "L0…Ln" (préfixe L ≠ f de Clément → aucune collision de progression). */
const CARDS = [
  // ═══ MATHS — algèbre linéaire (les briques du ML) ═══
  ["math", "matrices", "Produit A(m×n) · B(p×q) possible si… ?", "n = p — résultat de taille m×q"],
  ["math", "matrices", "Matrice identité I : propriété ?", "A·I = I·A = A (des 1 sur la diagonale)"],
  ["math", "matrices", "(A·B)ᵀ = ?", "Bᵀ·Aᵀ (l'ordre s'inverse)"],
  ["math", "matrices", "A inversible ⇔ ... (déterminant) ?", "det A ≠ 0"],
  ["math", "matrices", "det d'une matrice 2×2 [[a,b],[c,d]] ?", "ad − bc"],
  ["math", "matrices", "Inverse d'une 2×2 [[a,b],[c,d]] ?", "1/(ad−bc) · [[d,−b],[−c,a]]"],
  ["math", "vecteurs", "Produit scalaire u·v (formule coordonnées) ?", "Σ uᵢvᵢ = u₁v₁ + … + uₙvₙ"],
  ["math", "vecteurs", "Norme ‖u‖ ?", "√(u·u) = √(Σ uᵢ²)"],
  ["math", "vecteurs", "u ⊥ v ⇔ ?", "u·v = 0"],
  ["math", "vecteurs", "cos de l'angle entre u et v ?", "(u·v)/(‖u‖·‖v‖)"],
  ["math", "vecteurs", "Famille libre : définition ?", "Σ λᵢuᵢ = 0 ⇒ tous les λᵢ = 0"],
  // ═══ MATHS — probas & stats ═══
  ["math", "proba", "P(A∪B) = ?", "P(A) + P(B) − P(A∩B)"],
  ["math", "proba", "Probabilité conditionnelle P(A|B) ?", "P(A∩B)/P(B)"],
  ["math", "proba", "Formule de Bayes ?", "P(A|B) = P(B|A)·P(A)/P(B)"],
  ["math", "proba", "A et B indépendants ⇔ ?", "P(A∩B) = P(A)·P(B)"],
  ["math", "proba", "E(aX+b) et V(aX+b) ?", "aE(X)+b ; a²V(X)"],
  ["math", "proba", "Binomiale B(n,p) : E(X) et V(X) ?", "np ; np(1−p)"],
  ["math", "proba", "Loi normale : % dans [μ±σ] et [μ±2σ] ?", "≈ 68 % ; ≈ 95 %"],
  ["math", "proba", "Variance V(X) (2 formules) ?", "E[(X−μ)²] = E(X²) − E(X)²"],
  ["math", "proba", "Écart-type σ ?", "√V(X)"],
  // ═══ PYTHON — les bases CS50P ═══
  ["py", "base", "Afficher « Hello » ?", "print(\"Hello\")"],
  ["py", "base", "Demander une saisie utilisateur ?", "x = input(\"prompt \")  (renvoie toujours un str)"],
  ["py", "base", "Convertir \"42\" en nombre ?", "int(\"42\")  ·  float pour les décimaux"],
  ["py", "base", "Les 4 types de base ?", "int, float, str, bool"],
  ["py", "base", "f-string : injecter x dans un texte ?", "f\"valeur : {x}\""],
  ["py", "struct", "Créer une liste / y ajouter ?", "L = [1, 2, 3] · L.append(4)"],
  ["py", "struct", "Créer un dictionnaire ?", "d = {\"clé\": \"valeur\"} · accès d[\"clé\"]"],
  ["py", "struct", "L[0], L[-1], L[1:3] ?", "1er élément · dernier · tranche indices 1 à 2"],
  ["py", "struct", "len(L) ?", "Nombre d'éléments (marche sur str, list, dict…)"],
  ["py", "flow", "Boucle sur les éléments d'une liste ?", "for x in L:"],
  ["py", "flow", "Boucle 0 → 9 ?", "for i in range(10):"],
  ["py", "flow", "Condition ?", "if …: / elif …: / else:"],
  ["py", "flow", "Définir une fonction ?", "def f(x):  return x * 2"],
  ["py", "flow", "Égalité vs affectation ?", "== compare · = affecte"],
  ["py", "flow", "Compréhension de liste : carrés de 0 à 9 ?", "[x**2 for x in range(10)]"],
  ["py", "data", "Importer NumPy / Pandas (convention) ?", "import numpy as np · import pandas as pd"],
  ["py", "data", "Lire un CSV avec Pandas ?", "df = pd.read_csv(\"fichier.csv\")"],
  ["py", "data", "Moyenne d'une colonne ?", "df[\"col\"].mean()"],
  // ═══ CHINOIS — fondations HSK1 (pinyin + tons) ═══
  ["zh", "tons", "Les 4 tons du mandarin ?", "1er ˉ plat · 2e ˊ montant · 3e ˇ creusé · 4e ˋ descendant (+ neutre)"],
  ["zh", "tons", "mā má mǎ mà : sens ?", "妈 maman · 麻 chanvre · 马 cheval · 骂 gronder — le ton change TOUT"],
  ["zh", "salut", "Bonjour ?", "你好 nǐ hǎo"],
  ["zh", "salut", "Merci ?", "谢谢 xièxie"],
  ["zh", "salut", "Au revoir ?", "再见 zàijiàn"],
  ["zh", "salut", "Je m'appelle… ?", "我叫… wǒ jiào…"],
  ["zh", "base", "Je / tu / il-elle ?", "我 wǒ · 你 nǐ · 他/她 tā"],
  ["zh", "base", "Être (c'est/suis) ?", "是 shì"],
  ["zh", "base", "Négation (ne pas) ?", "不 bù"],
  ["zh", "base", "Avoir / il y a ?", "有 yǒu"],
  ["zh", "base", "Personne / gens ?", "人 rén"],
  ["zh", "base", "France / Français ?", "法国 Fǎguó · 法国人 Fǎguórén"],
  ["zh", "nombres", "1 2 3 ?", "一 yī · 二 èr · 三 sān"],
  ["zh", "nombres", "4 5 6 ?", "四 sì · 五 wǔ · 六 liù"],
  ["zh", "nombres", "7 8 9 10 ?", "七 qī · 八 bā · 九 jiǔ · 十 shí"],
  ["zh", "phrases", "« Je suis français » ?", "我是法国人 wǒ shì Fǎguórén"],
  ["zh", "phrases", "« Comment tu t'appelles ? »", "你叫什么名字？nǐ jiào shénme míngzi?"],
  ["zh", "phrases", "Oui (c'est ça) / Non ?", "是 shì / 不是 bú shì"],
  // ═══ ANGLAIS — vocab tech du BSc (tout le cursus est en VO) ═══
  ["en", "maths", "matrix / matrices ?", "matrice(s) — matrix multiplication = produit matriciel"],
  ["en", "maths", "derivative / integral ?", "dérivée / intégrale"],
  ["en", "maths", "mean · variance · standard deviation ?", "moyenne · variance · écart-type"],
  ["en", "maths", "eigenvalue / eigenvector ?", "valeur propre / vecteur propre"],
  ["en", "maths", "probability distribution ?", "loi de probabilité"],
  ["en", "code", "loop · statement · variable ?", "boucle · instruction · variable"],
  ["en", "code", "array · string · dictionary ?", "tableau · chaîne de caractères · dictionnaire"],
  ["en", "code", "to debug / a bug ?", "déboguer / une erreur de code"],
  ["en", "code", "input / output (I/O) ?", "entrée / sortie"],
  ["en", "biz", "revenue · profit · costs ?", "chiffre d'affaires · bénéfice · coûts"],
  ["en", "biz", "supply & demand ?", "l'offre et la demande"],
  ["en", "biz", "stakeholder / shareholder ?", "partie prenante / actionnaire"],
];
export const FLASH = CARDS.map((c, i) => ({ id: "L" + i, subject: c[0], deck: c[1], front: c[2], back: c[3] }));

/* Vue d'ensemble de l'été (onglet Planning). */
export const OVERVIEW = {
  phases: [
    ["8 – 19 juil.", "MISE EN ROUTE", "Installer les habitudes : pinyin & tons, Python premiers pas (Colab), 3Blue1Brown algèbre linéaire — et le contrat 100/100 chaque jour.", "var(--bic)"],
    ["20 juil. – 16 août", "CROISIÈRE", "Matinée de monstre (~3h) : chinois · maths · CS50P · anglais. Après-midi 100 % libre : salle/natation, LUCID, amis.", "var(--green)"],
    ["17 – 26 août", "LIGNE DROITE", "NumPy/Pandas, sujet type test 90 min chrono, ~120 caractères au compteur Anki, réveil qui remonte vers 8h. Cap sur Saclay.", "var(--penred)"],
  ],
  readingTitle: "Plan de lecture du soir — business & data, en VO",
  reading: [
    ["8 – 20 juil.", "Zero to One (Peter Thiel)", "≈ 25 min/soir, en anglais"],
    ["21 juil. – 5 août", "The Lean Startup (Eric Ries)", "pense LUCID en lisant"],
    ["6 – 18 août", "Weapons of Math Destruction (Cathy O'Neil)", "l'IA côté société — culture BSc"],
    ["19 – 26 août", "Storytelling with Data (Nussbaumer)", "la compétence secrète du data scientist"],
  ],
  readingNote: "Chaque livre nourrit l'anglais ET la culture data/business du BSc. Double gain, chaque soir.",
  rules: [
    "Jamais deux jours de suite sans maths ni Python — la régularité bat le volume.",
    "Le chinois, c'est 20 min TOUS les jours, dimanche compris : une langue vit de son streak.",
    "Toujours la ressource en VO quand elle existe : le cours + l'anglais, deux gains d'un coup.",
    "Jamais le corrigé sans avoir vraiment cherché. Un exo raté se refait quelques jours plus tard.",
    "Matinée finie = journée gagnée. L'après-midi est libre SANS culpabilité — c'est le deal.",
  ],
};
export const SUBJECTS = [
  { key: "all", label: "Tout", emoji: "📚" },
  { key: "math", label: "Maths", emoji: "➗" },
  { key: "py", label: "Python", emoji: "🐍" },
  { key: "zh", label: "Chinois", emoji: "🇨🇳" },
  { key: "en", label: "Anglais", emoji: "🇬🇧" },
];
