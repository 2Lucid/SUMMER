export const FLASH = [
  ["der", "(xⁿ)′ = ?", "n·xⁿ⁻¹"], ["der", "(1/x)′ = ?", "−1/x²"], ["der", "(√x)′ = ?", "1/(2√x)"],
  ["der", "(eˣ)′ = ?", "eˣ"], ["der", "(ln x)′ = ?", "1/x"], ["der", "(sin x)′ = ?", "cos x"],
  ["der", "(cos x)′ = ?", "−sin x"], ["der", "(uⁿ)′ = ?", "n·u′·uⁿ⁻¹"], ["der", "(eᵘ)′ = ?", "u′·eᵘ"],
  ["der", "(ln u)′ = ?", "u′/u"], ["der", "(uv)′ = ?", "u′v + uv′"], ["der", "(u/v)′ = ?", "(u′v − uv′)/v²"],
  ["prim", "Primitive de xⁿ ?", "xⁿ⁺¹/(n+1)"], ["prim", "Primitive de 1/x (x>0) ?", "ln x"],
  ["prim", "Primitive de 1/x² ?", "−1/x"], ["prim", "Primitive de 1/√x ?", "2√x"],
  ["prim", "Primitive de cos x ?", "sin x"], ["prim", "Primitive de sin x ?", "−cos x"],
  ["prim", "Primitive de u′·eᵘ ?", "eᵘ"], ["prim", "Primitive de u′/u ?", "ln|u|"],
  ["lim", "lim (ln x)/x en +∞ ?", "0  (x l'emporte sur ln x)"], ["lim", "lim eˣ/xⁿ en +∞ ?", "+∞  (eˣ écrase xⁿ)"],
  ["lim", "lim (sin x)/x en 0 ?", "1"], ["lim", "lim x·ln x en 0⁺ ?", "0"],
  ["lim", "lim (eˣ − 1)/x en 0 ?", "1"], ["lim", "Hiérarchie en +∞ ?", "ln x ≪ xᵃ ≪ eˣ"],
  ["trig", "cos(π/6) et sin(π/6) ?", "√3/2 et 1/2"], ["trig", "cos(π/4) et sin(π/4) ?", "√2/2 et √2/2"],
  ["trig", "cos(π/3) et sin(π/3) ?", "1/2 et √3/2"], ["trig", "tan(π/4), tan(π/3), tan(π/6) ?", "1, √3, √3/3"],
  ["form", "cos²x + sin²x = ?", "1"], ["form", "cos(a+b) = ?", "cos a·cos b − sin a·sin b"],
  ["form", "sin(a+b) = ?", "sin a·cos b + cos a·sin b"], ["form", "cos(2a) = ? (3 formes)", "cos²a − sin²a = 2cos²a − 1 = 1 − 2sin²a"],
  ["form", "sin(2a) = ?", "2 sin a·cos a"], ["form", "ln(ab), ln(a/b), ln(aⁿ) ?", "ln a + ln b ; ln a − ln b ; n·ln a"],
  ["form", "eᵃ·eᵇ et (eᵃ)ᵇ ?", "eᵃ⁺ᵇ et eᵃᵇ"], ["form", "|a + bi| = ?", "√(a² + b²)"],
  ["courbe", "Courbe de ln : domaine, variations, limites ?", "]0;+∞[, strictement croissante, −∞ en 0⁺, +∞ en +∞, passe par (1;0)"],
  ["courbe", "Courbe de exp : variations, limites ?", "Croissante sur ℝ, 0 en −∞, +∞ en +∞, passe par (0;1), toujours > 0"],
  ["courbe", "Courbe de √x ?", "[0;+∞[, croissante, tangente verticale en 0, +∞ en +∞"],
  ["courbe", "Courbe de 1/x ?", "ℝ*, décroissante sur chaque intervalle, asymptotes x=0 et y=0, impaire"],
  ["courbe", "Courbe de x² et x³ ?", "x² : paire, min en 0. x³ : impaire, croissante, point d'inflexion en 0"],
  ["courbe", "Courbe de |x| ?", "Paire, décroît puis croît, min 0 en 0, non dérivable en 0"],
  ["courbe", "sin et cos : période, parité, bornes ?", "Période 2π, sin impaire / cos paire, valeurs dans [−1;1]"],
].map((c, i) => ({ id: "f" + i, deck: c[0], front: c[1], back: c[2] }));
export const BOX_GAP = [1, 3, 7, 14];
export const RANKS = [[0, "Larve 🐛"], [250, "Apprenti ✏️"], [700, "Soldat 🎖️"], [1500, "Machine ⚙️"], [3000, "MONSTRE 👹"]];
export const rankOf = xp => { let r = RANKS[0][1], next = null; RANKS.forEach(([t, n], i) => { if (xp >= t) { r = n; next = RANKS[i + 1] || null; } }); return { name: r, next }; };
