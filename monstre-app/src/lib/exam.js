import { ri, rnz, pick, fracS, sup, poly, rd2, rd1, frn, sgn, fac, G } from "./util.js";

export const EXAM_MATH = [
  () => { let p = rnz(-6, 6), q = rnz(-6, 6); if (p === q) q = p < 6 ? p + 1 : p - 1; const b = -(p + q), c = p * q, lo = Math.min(p, q), hi = Math.max(p, q);
    return { pts: 6,
      q: "Soit f(x) = " + poly([[1, "x²"], [b, "x"], [c, ""]]) + ".\n1) Calculer le discriminant Δ.\n2) Résoudre f(x) = 0.\n3) Factoriser f(x).\n4) Étudier le signe de f(x) selon les valeurs de x.",
      sol: "Δ = b² − 4ac = " + (b * b - 4 * c) + "  (> 0 : deux racines réelles).\nRacines : x₁ = " + sgn(lo) + " et x₂ = " + sgn(hi) + ".\nFactorisation : f(x) = " + fac(lo) + fac(hi) + ".\nSigne (a = 1 > 0) : f(x) > 0 sur ]−∞ ; " + sgn(lo) + "[ ∪ ]" + sgn(hi) + " ; +∞[ , et f(x) < 0 sur ]" + sgn(lo) + " ; " + sgn(hi) + "[." }; },
  () => { const k = ri(1, 4), c = 3 * k * k;
    return { pts: 6,
      q: "Soit f(x) = x³ − " + c + "x, définie sur ℝ.\n1) Calculer f '(x).\n2) Étudier son signe et dresser le tableau de variations.\n3) Donner les extrema locaux (valeur de x et de f).",
      sol: "f '(x) = 3x² − " + c + " = 3(x − " + k + ")(x + " + k + ").\nf '(x) > 0 pour x < −" + k + " et x > " + k + " ; f '(x) < 0 sur ]−" + k + " ; " + k + "[.\nMaximum local en x = −" + k + " : f(−" + k + ") = " + (2 * k * k * k) + ".\nMinimum local en x = " + k + " : f(" + k + ") = " + sgn(-2 * k * k * k) + "." }; },
  () => { const u0 = ri(1, 4), qv = pick([2, 3]), n = ri(4, 7), un = u0 * qv ** n, S = u0 * (qv ** (n + 1) - 1) / (qv - 1);
    return { pts: 5,
      q: "(uₙ) est la suite géométrique de premier terme u₀ = " + u0 + " et de raison q = " + qv + ".\n1) Exprimer uₙ en fonction de n.\n2) Calculer u" + sup(n) + ".\n3) Calculer S = u₀ + u₁ + … + u" + sup(n) + ".",
      sol: "uₙ = u₀·qⁿ = " + u0 + "×" + qv + "ⁿ.\nu" + sup(n) + " = " + u0 + "×" + qv + sup(n) + " = " + un + ".\nS = u₀·(q" + sup(n + 1) + " − 1)/(q − 1) = " + u0 + "×(" + qv + sup(n + 1) + " − 1)/" + (qv - 1) + " = " + S + "." }; },
  () => { const a = rnz(-5, 5), b = rnz(-5, 5), z2r = a * a - b * b, z2i = 2 * a * b;
    return { pts: 5,
      q: "On pose z = " + a + (b < 0 ? " − " : " + ") + Math.abs(b) + "i.\n1) Calculer le module |z|.\n2) Développer z².\n3) Calculer z·z̄ (z̄ : conjugué de z).",
      sol: "|z| = √(" + (a * a) + " + " + (b * b) + ") = √" + (a * a + b * b) + " ≈ " + frn(rd2(Math.sqrt(a * a + b * b))) + ".\nz² = (" + sgn(a) + ")² − (" + sgn(b) + ")² + 2(" + sgn(a) + ")(" + sgn(b) + ")i = " + sgn(z2r) + (z2i < 0 ? " − " : " + ") + Math.abs(z2i) + "i.\nz·z̄ = a² + b² = " + (a * a + b * b) + "  (réel positif)." }; },
  () => { const a = rnz(-4, 5), b = rnz(-5, 5), c = rnz(-4, 5), k = ri(2, 4), val = a * k ** 3 / 3 + b * k ** 2 / 2 + c * k, num = 2 * a * k ** 3 + 3 * b * k ** 2 + 6 * c * k;
    return { pts: 5,
      q: "Calculer l'intégrale  I = ∫₀" + sup(k) + " (" + poly([[a, "x²"], [b, "x"], [c, ""]]) + ") dx.",
      sol: "Primitive : F(x) = " + poly([[a, "x³/3"], [b, "x²/2"], [c, "x"]]) + ".\nI = F(" + k + ") − F(0) = " + sgn(frn(fracS(num, 6))) + " ≈ " + sgn(frn(rd2(val))) + "." }; },
  () => { let r1 = ri(1, 4), r2 = ri(1, 4); if (r1 === r2) r2 = r1 % 4 + 1; const s = r1 + r2, p = r1 * r2, lo = Math.min(r1, r2), hi = Math.max(r1, r2);
    return { pts: 5,
      q: "Résoudre dans ℝ :  e^(2x) − " + s + "·eˣ + " + p + " = 0.\nIndication : poser X = eˣ.",
      sol: "Avec X = eˣ (X > 0) : X² − " + s + "X + " + p + " = 0 → X = " + lo + " ou X = " + hi + ".\nComme eˣ = X : x = ln(" + lo + ")" + (lo === 1 ? " = 0" : "") + " ou x = ln(" + hi + ").\nS = { ln(" + lo + ") ; ln(" + hi + ") } ≈ { " + frn(rd2(Math.log(lo))) + " ; " + frn(rd2(Math.log(hi))) + " }." }; },
];
export const EXAM_PHYS = [
  () => { const H = pick([20, 45, 80, 125, 180]), t = Math.sqrt(2 * H / G), v = G * t;
    return { pts: 5,
      q: "CHUTE LIBRE. On lâche une bille sans vitesse initiale d'une hauteur H = " + H + " m (g = 9,8 m·s⁻², frottements négligés).\n1) Établir l'expression de la durée de chute t.\n2) Calculer t.\n3) Calculer la vitesse v à l'arrivée au sol (en m·s⁻¹ puis en km·h⁻¹).",
      sol: "Mouvement uniformément accéléré sans vitesse initiale : H = ½g·t² ⟹ t = √(2H/g).\nt = √(2×" + H + "/9,8) = " + frn(rd2(t)) + " s.\nv = g·t = 9,8×" + frn(rd2(t)) + " = " + frn(rd1(v)) + " m·s⁻¹ ≈ " + frn(rd1(v * 3.6)) + " km·h⁻¹.\nVérification : v = √(2gH) = " + frn(rd1(Math.sqrt(2 * G * H))) + " m·s⁻¹." }; },
  () => { const h = pick([1.5, 2, 3, 5, 8]), m = pick([50, 60, 70, 80]), v = Math.sqrt(2 * G * h), Ec = 0.5 * m * v * v;
    return { pts: 5,
      q: "ÉNERGIE MÉCANIQUE. Un skieur (m = " + m + " kg) part sans vitesse d'une hauteur h = " + frn(h) + " m. Frottements négligés (g = 9,8).\n1) Écrire la conservation de l'énergie mécanique.\n2) Calculer sa vitesse v en bas.\n3) Calculer son énergie cinétique en bas.",
      sol: "Em conservée : Ep(haut) → Ec(bas), soit m·g·h = ½·m·v².\nv = √(2gh) = √(2×9,8×" + frn(h) + ") = " + frn(rd2(v)) + " m·s⁻¹ ≈ " + frn(rd1(v * 3.6)) + " km·h⁻¹.\nEc = ½·m·v² = m·g·h = " + frn(rd1(Ec)) + " J." }; },
  () => { const ang = pick([20, 30, 45]), m = pick([2, 5, 10]), a = G * Math.sin(ang * Math.PI / 180);
    return { pts: 5,
      q: "LOIS DE NEWTON. Un solide (m = " + m + " kg) glisse sans frottement sur un plan incliné d'angle α = " + ang + "° (g = 9,8).\n1) Faire le bilan des forces.\n2) Par la 2ᵉ loi de Newton, montrer que a = g·sin α.\n3) Calculer a.",
      sol: "Forces : poids P⃗ (m·g, vertical) et réaction normale N⃗ (⊥ au plan, pas de frottement).\nProjection sur l'axe du plan (sens de la descente) : m·g·sin α = m·a ⟹ a = g·sin α (indépendant de m).\na = 9,8 × sin(" + ang + "°) = " + frn(rd2(a)) + " m·s⁻²." }; },
  () => { const R1 = pick([10, 22, 47, 100]), R2 = pick([33, 68, 150, 220]), U = pick([5, 9, 12, 15]), Req = R1 + R2, I = U / Req, P = U * I;
    return { pts: 5,
      q: "ÉLECTRICITÉ. R₁ = " + R1 + " Ω et R₂ = " + R2 + " Ω sont branchées EN SÉRIE sous U = " + U + " V.\n1) Calculer la résistance équivalente R_eq.\n2) Calculer l'intensité I.\n3) Calculer la puissance totale dissipée.",
      sol: "En série les résistances s'ajoutent : R_eq = R₁ + R₂ = " + Req + " Ω.\nLoi d'Ohm : I = U/R_eq = " + U + "/" + Req + " = " + frn(rd1(I * 1000)) + " mA = " + frn(rd2(I)) + " A.\nP = U·I = " + U + "×" + frn(rd2(I)) + " = " + frn(rd2(P)) + " W (= U²/R_eq)." }; },
  () => { const v = pick([340, 1500]), f = pick([170, 340, 680, 1000]), lam = v / f, T = 1 / f;
    return { pts: 4,
      q: "ONDES. Une onde sonore de fréquence f = " + f + " Hz se propage à la célérité v = " + v + " m·s⁻¹ (" + (v === 340 ? "dans l'air" : "dans l'eau") + ").\n1) Rappeler la relation entre v, λ et f.\n2) Calculer la longueur d'onde λ.\n3) Calculer la période T.",
      sol: "Relation : v = λ·f , donc λ = v/f.\nλ = " + v + "/" + f + " = " + frn(rd2(lam)) + " m.\nT = 1/f = 1/" + f + " = " + frn(rd2(T * 1000)) + " ms." }; },
  () => { const f = pick([10, 15, 20]), d = pick([30, 40, 60]), OAp = 1 / (1 / f - 1 / d), gamma = OAp / (-d);
    return { pts: 5,
      q: "OPTIQUE. Un objet réel AB est à " + d + " cm devant une lentille mince convergente de focale f ' = " + f + " cm.\n1) Rappeler la relation de conjugaison (origine au centre O).\n2) Déterminer la position OA' de l'image.\n3) Calculer le grandissement γ ; l'image est-elle droite ou renversée ?",
      sol: "Conjugaison : 1/OA' − 1/OA = 1/f ' , avec OA = −" + d + " cm.\n1/OA' = 1/" + f + " − 1/" + d + " ⟹ OA' = " + frn(rd1(OAp)) + " cm (> 0 : image réelle, après la lentille).\nγ = OA'/OA = " + frn(rd1(OAp)) + "/(−" + d + ") = " + sgn(frn(rd2(gamma))) + "  (< 0 : image renversée, " + (Math.abs(gamma) < 1 ? "plus petite" : "plus grande") + " que l'objet)." }; },
];
export function buildExam(subject, minutes) {
  const nMap = { 30: 3, 45: 4, 60: 6 }, n = nMap[minutes] || 4; let seq;
  if (subject === "maths") seq = Array.from({ length: n }, () => "M");
  else if (subject === "phys") seq = Array.from({ length: n }, () => "P");
  else { seq = []; for (let i = 0; i < n; i++) seq.push(i % 2 ? "P" : "M"); }
  return seq.map((s, i) => { const ex = (s === "M" ? pick(EXAM_MATH) : pick(EXAM_PHYS))();
    return { ...ex, sub: s === "M" ? "Maths" : "Physique", subKey: s, n: i + 1 }; });
}
