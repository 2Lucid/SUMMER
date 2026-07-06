import { ri, rnz, pick, fracS, sup, shuffle, term, poly, mcq } from "./util.js";

export const DOMAINS = [
  { id: "frac", name: "Fractions" }, { id: "pow", name: "Puissances" }, { id: "lit", name: "Calcul littéral" },
  { id: "rac", name: "Racines" }, { id: "sd", name: "Second degré" }, { id: "expln", name: "Exp & ln" },
  { id: "trig", name: "Trigo" }, { id: "der", name: "Dérivées" }, { id: "prim", name: "Primitives" },
  { id: "int", name: "Intégrales" }, { id: "suit", name: "Suites" }, { id: "cplx", name: "Complexes" }, { id: "sys", name: "Systèmes" },
];

export const GEN = {
  frac(l) { if (l === 1) { const d = ri(3, 12), a = ri(1, 11), b = ri(1, 11), s = pick([1, -1]); const n = a + s * b; return { q: a + "/" + d + " " + (s > 0 ? "+" : "−") + " " + b + "/" + d + " = ?", mode: "num", sol: n / d, disp: fracS(n, d) }; }
    if (l === 2) { const a = ri(1, 9), b = ri(2, 9), c = ri(1, 9), d = ri(2, 9), s = pick([1, -1]); const n = a * d + s * c * b; return { q: a + "/" + b + " " + (s > 0 ? "+" : "−") + " " + c + "/" + d + " = ?", mode: "num", sol: n / (b * d), disp: fracS(n, b * d) }; }
    const a = ri(1, 9), b = ri(2, 9), c = ri(1, 9), d = ri(2, 9), div = pick([0, 1]);
    if (div) return { q: "(" + a + "/" + b + ") ÷ (" + c + "/" + d + ") = ?", mode: "num", sol: (a * d) / (b * c), disp: fracS(a * d, b * c) };
    return { q: "(" + a + "/" + b + ") × (" + c + "/" + d + ") = ?", mode: "num", sol: (a * c) / (b * d), disp: fracS(a * c, b * d) }; },
  pow(l) { const a = pick([2, 3, 5, 10]);
    if (l === 1) { const m = ri(2, 9), n = ri(2, 9), s = pick([1, -1]); const e = s > 0 ? m + n : m - n; return { q: a + sup(m) + " " + (s > 0 ? "×" : "÷") + " " + a + sup(n) + " = " + a + sup("n") + ".  n = ?", mode: "num", sol: e, disp: String(e) }; }
    if (l === 2) { const m = ri(2, 5), n = ri(2, 4), p = ri(1, 9); const e = m * n - p; return { q: "(" + a + sup(m) + ")" + sup(n) + " ÷ " + a + sup(p) + " = " + a + sup("n") + ".  n = ?", mode: "num", sol: e, disp: String(e) }; }
    const m = pick([3, 5, 7, 9]); return { q: "√(" + a + sup(m) + ") = " + a + sup("n") + ".  n = ? (fraction)", mode: "num", sol: m / 2, disp: m + "/2" }; },
  lit(l) { if (l === 1) { const a = rnz(-7, 7), b = rnz(-7, 7); const ok = poly([[1, "x²"], [a + b, "x"], [a * b, ""]]);
      const m = mcq(ok, [poly([[1, "x²"], [a - b, "x"], [a * b, ""]]), poly([[1, "x²"], [a + b, "x"], [-a * b, ""]]), poly([[1, "x²"], [a * b, "x"], [a + b, ""]])]);
      return { q: "Développer : (x " + (a < 0 ? "−" : "+") + " " + Math.abs(a) + ")(x " + (b < 0 ? "−" : "+") + " " + Math.abs(b) + ")", mode: "mcq", ...m, disp: ok }; }
    if (l === 2) { const a = ri(1, 3), b = rnz(-6, 6); const ok = poly([[a * a, "x²"], [2 * a * b, "x"], [b * b, ""]]);
      const m = mcq(ok, [poly([[a * a, "x²"], [b * b, ""]]), poly([[a * a, "x²"], [a * b, "x"], [b * b, ""]]), poly([[a * a, "x²"], [2 * a * b, "x"], [-b * b, ""]])]);
      return { q: "Développer : (" + (term(a, "x") || "x") + " " + (b < 0 ? "−" : "+") + " " + Math.abs(b) + ")²", mode: "mcq", ...m, disp: ok }; }
    let p = rnz(-6, 6), q2 = rnz(-6, 6); if (p === q2) q2 = p + 1 || 1; const f = r => "(x " + (r > 0 ? "−" : "+") + " " + Math.abs(r) + ")"; const ok = f(p) + f(q2);
    const m = mcq(ok, [f(-p) + f(-q2), f(-p) + f(q2), f(p) + f(-q2)]);
    return { q: "Factoriser : " + poly([[1, "x²"], [-(p + q2), "x"], [p * q2, ""]]), mode: "mcq", ...m, disp: ok }; },
  rac(l) { if (l === 1) { const k = ri(2, 6), m = pick([2, 3, 5, 6, 7]); const ok = k + "√" + m; const mq = mcq(ok, [m + "√" + k, (k * m) + "√" + m, k + "√" + (k * m)]);
      return { q: "Simplifier : √" + (k * k * m), mode: "mcq", ...mq, disp: ok }; }
    if (l === 2) { const k = ri(2, 9); const divs = []; for (let a = 2; a < k * k; a++) if ((k * k) % a === 0) divs.push(a); const a = pick(divs), b = (k * k) / a;
      return { q: "√" + a + " × √" + b + " = ?", mode: "num", sol: k, disp: String(k) }; }
    const a = ri(2, 9), b = pick([2, 3, 5, 7]); const ok = a + "√" + b + "⁄" + b; const m = mcq(ok, [a + "√" + b, "√" + b + "⁄" + a, a + "⁄" + b + "√" + b]);
    return { q: "Rationaliser : " + a + "/√" + b, mode: "mcq", ...m, disp: ok }; },
  sd(l) { if (l === 1) { const a = rnz(-3, 3), b = rnz(-9, 9), c = rnz(-9, 9); return { q: "Δ de " + poly([[a, "x²"], [b, "x"], [c, ""]]) + " ?", mode: "num", sol: b * b - 4 * a * c, disp: String(b * b - 4 * a * c) }; }
    if (l === 2) { let p = rnz(-7, 7), q2 = rnz(-7, 7); if (p === q2) q2 = -p || 2; return { q: "Racines de " + poly([[1, "x²"], [-(p + q2), "x"], [p * q2, ""]]) + " = 0 ?", mode: "pair", sol: [p, q2], ordered: false, disp: p + " ; " + q2 }; }
    let p = rnz(-5, 5), q2 = rnz(-5, 5); if (p === q2) q2 = p + 2; const lo = Math.min(p, q2), hi = Math.max(p, q2);
    const ok = "Négatif sur ]" + lo + " ; " + hi + "[, positif ailleurs"; const m = mcq(ok, ["Positif sur ]" + lo + " ; " + hi + "[, négatif ailleurs", "Toujours positif", "Négatif sur ]−∞ ; " + lo + "["]);
    return { q: "Signe de " + poly([[1, "x²"], [-(p + q2), "x"], [p * q2, ""]]) + " (a=1, racines " + lo + " et " + hi + ") ?", mode: "mcq", ...m, disp: ok }; },
  expln(l) { if (l === 1) { const mode = pick([0, 1, 2]);
      if (mode === 0) { const k = rnz(-9, 9); return { q: "ln(e" + sup(k) + ") = ?", mode: "num", sol: k, disp: String(k) }; }
      if (mode === 1) { const k = ri(2, 9); return { q: "e^(ln " + k + ") = ?", mode: "num", sol: k, disp: String(k) }; }
      const a = ri(1, 6), b = ri(1, 6); return { q: "e" + sup(a) + " × e" + sup(b) + " = e" + sup("n") + ".  n = ?", mode: "num", sol: a + b, disp: String(a + b) }; }
    if (l === 2) { const a = ri(2, 5), b = rnz(-9, 9); return { q: "Résoudre : e^(" + a + "x) = e" + sup(b) + ".  x = ? (fraction ok)", mode: "num", sol: b / a, disp: fracS(b, a) }; }
    const a = ri(2, 6), b = ri(2, 6), c = ri(2, 6); const ok = "ln(" + (a * b) + "/" + c + ")"; const m = mcq(ok, ["ln(" + (a + b - c) + ")", "ln(" + (a * b * c) + ")", "ln(" + (a + b) + "/" + c + ")"]);
    return { q: "Simplifier : ln " + a + " + ln " + b + " − ln " + c, mode: "mcq", ...m, disp: ok }; },
  trig(l) { const T = [["0", "1", "0"], ["π/6", "√3/2", "1/2"], ["π/4", "√2/2", "√2/2"], ["π/3", "1/2", "√3/2"], ["π/2", "0", "1"]]; const VALS = ["0", "1/2", "√2/2", "√3/2", "1"];
    if (l === 1) { const row = pick(T), f = pick(["cos", "sin"]); const ok = f === "cos" ? row[1] : row[2]; const m = mcq(ok, shuffle(VALS.filter(v => v !== ok)).slice(0, 3));
      return { q: f + "(" + row[0] + ") = ?", mode: "mcq", ...m, disp: ok }; }
    if (l === 2) { const EQ = [["cos x = 1/2", "{ π/3 ; 5π/3 }"], ["cos x = √2/2", "{ π/4 ; 7π/4 }"], ["cos x = −1/2", "{ 2π/3 ; 4π/3 }"], ["sin x = 1/2", "{ π/6 ; 5π/6 }"], ["sin x = √3/2", "{ π/3 ; 2π/3 }"], ["cos x = 0", "{ π/2 ; 3π/2 }"]];
      const [eq, ok] = pick(EQ); const others = EQ.map(e => e[1]).filter(s => s !== ok); const m = mcq(ok, shuffle(others).slice(0, 3));
      return { q: "Résoudre sur [0 ; 2π] : " + eq, mode: "mcq", ...m, disp: ok }; }
    const ID = [["cos(π − x)", "−cos x"], ["cos(π + x)", "−cos x"], ["sin(π − x)", "sin x"], ["sin(π + x)", "−sin x"], ["cos(−x)", "cos x"], ["sin(−x)", "−sin x"], ["cos(π/2 − x)", "sin x"], ["sin(π/2 − x)", "cos x"]];
    const [e, ok] = pick(ID); const m = mcq(ok, ["cos x", "−cos x", "sin x", "−sin x"].filter(v => v !== ok));
    return { q: "Simplifier : " + e, mode: "mcq", ...m, disp: ok }; },
  der(l) { if (l === 1) { const a = ri(1, 5), n = ri(2, 5), b = rnz(-6, 6); const ok = poly([[a * n, "x" + sup(n - 1)], [b, ""]]);
      const m = mcq(ok, [poly([[a, "x" + sup(n - 1)], [b, ""]]), poly([[a * n, "x" + sup(n)], [b, ""]]), poly([[a * n, "x" + sup(n - 1)]])]);
      return { q: "Dériver : f(x) = " + poly([[a, "x" + sup(n)], [b, "x"]]), mode: "mcq", ...m, disp: ok }; }
    if (l === 2) { const a = ri(2, 6); const F = [["e^(" + a + "x)", a + "e^(" + a + "x)", ["e^(" + a + "x)", a + "e^(x)", "e^(" + a + "x)/" + a]],
        [a + " ln x", a + "/x", [a + " ln x", "1/(" + a + "x)", "ln(" + a + "x)"]], [a + "/x", "−" + a + "/x²", [a + "/x²", "−" + a + "/x", a + " ln x"]],
        [a + "√x", a + "/(2√x)", [a + "√x/2", a + "/√x", "2" + a + "√x"]]];
      const [f, ok, ds] = pick(F); const m = mcq(ok, ds); return { q: "Dériver : f(x) = " + f, mode: "mcq", ...m, disp: ok }; }
    const a = ri(2, 5), b = rnz(-5, 5), n = ri(2, 4);
    const F = [["(" + a + "x " + (b < 0 ? "−" : "+") + " " + Math.abs(b) + ")" + sup(n), (n * a) + "(" + a + "x " + (b < 0 ? "−" : "+") + " " + Math.abs(b) + ")" + sup(n - 1)],
      ["e^(" + a + "x " + (b < 0 ? "−" : "+") + " " + Math.abs(b) + ")", a + "e^(" + a + "x " + (b < 0 ? "−" : "+") + " " + Math.abs(b) + ")"],
      ["ln(" + a + "x " + (b < 0 ? "−" : "+") + " " + Math.abs(b) + ")", a + "/(" + a + "x " + (b < 0 ? "−" : "+") + " " + Math.abs(b) + ")"],
      ["cos(" + a + "x)", "−" + a + " sin(" + a + "x)"], ["sin(" + a + "x)", a + " cos(" + a + "x)"]];
    const [f, ok] = pick(F); const wrong = F.map(x => x[1]).filter(s => s !== ok); const m = mcq(ok, shuffle(wrong).slice(0, 3));
    return { q: "Dériver : f(x) = " + f, mode: "mcq", ...m, disp: ok }; },
  prim(l) { if (l === 1) { const n = ri(1, 4), k = ri(1, 3); const a = (n + 1) * k; const ok = (k === 1 ? "" : k) + "x" + sup(n + 1);
      const m = mcq(ok, [a + "x" + sup(n + 1), (a * n) + "x" + (sup(n - 1) || ""), (k === 1 ? "" : k) + "x" + sup(n)]);
      return { q: "Une primitive de f(x) = " + a + "x" + sup(n) + " ?", mode: "mcq", ...m, disp: ok }; }
    if (l === 2) { const a = ri(2, 5); const F = [["e^(" + a + "x)", "e^(" + a + "x)/" + a, [a + "e^(" + a + "x)", "e^(" + a + "x)", "e^(x)/" + a]],
        ["cos(" + a + "x)", "sin(" + a + "x)/" + a, [a + " sin(" + a + "x)", "−sin(" + a + "x)/" + a, "cos(" + a + "x)/" + a]],
        ["1/x  (x>0)", "ln x", ["−1/x²", "1/x²", "x ln x"]], ["1/x²", "−1/x", ["1/x", "ln(x²)", "−1/x³"]]];
      const [f, ok, ds] = pick(F); const m = mcq(ok, ds); return { q: "Une primitive de f(x) = " + f + " ?", mode: "mcq", ...m, disp: ok }; }
    const F = [["2x·e^(x²)", "e^(x²)", ["2e^(x²)", "x²e^(x²)", "e^(2x)"]], ["2x/(x² + 1)", "ln(x² + 1)", ["1/(x² + 1)", "2 ln(x² + 1)", "ln(2x)"]],
      ["3x²(x³ + 1)²", "(x³ + 1)³/3", ["(x³ + 1)³", "3(x³ + 1)³", "(x³ + 1)²/2"]]];
    const [f, ok, ds] = pick(F); const m = mcq(ok, ds); return { q: "Une primitive de f(x) = " + f + " ?", mode: "mcq", ...m, disp: ok }; },
  int(l) { if (l === 1) { const a = rnz(-6, 6), b = rnz(-6, 6); const v = a / 2 + b; return { q: "∫₀¹ (" + poly([[a, "x"], [b, ""]]) + ") dx = ? (fraction ok)", mode: "num", sol: v, disp: fracS(a + 2 * b, 2) }; }
    if (l === 2) { const k = ri(2, 4); if (pick([0, 1])) return { q: "∫₀" + sup(k) + " x² dx = ? (fraction ok)", mode: "num", sol: (k ** 3) / 3, disp: fracS(k ** 3, 3) };
      return { q: "∫₁" + sup(k) + " 2x dx = ?", mode: "num", sol: k * k - 1, disp: String(k * k - 1) }; }
    const a = rnz(-4, 4), b = rnz(-4, 4); const v = a / 3 + b / 2; return { q: "∫₀¹ (" + poly([[a, "x²"], [b, "x"]]) + ") dx = ? (fraction ok)", mode: "num", sol: v, disp: fracS(2 * a + 3 * b, 6) }; },
  suit(l) { if (l === 1) { const u0 = ri(-5, 9), r = rnz(-6, 6), n = ri(5, 20); return { q: "(uₙ) arithmétique, u₀ = " + u0 + ", r = " + r + ".  u" + sup(n) + " = ?", mode: "num", sol: u0 + n * r, disp: String(u0 + n * r) }; }
    if (l === 2) { const u0 = ri(1, 3), q2 = pick([2, 3, -2]), n = ri(2, 5); const v = u0 * q2 ** n; return { q: "(uₙ) géométrique, u₀ = " + u0 + ", q = " + q2 + ".  u" + sup(n) + " = ?", mode: "num", sol: v, disp: String(v) }; }
    if (pick([0, 1])) { const n = ri(10, 40); return { q: "1 + 2 + … + " + n + " = ?", mode: "num", sol: (n * (n + 1)) / 2, disp: String((n * (n + 1)) / 2) }; }
    const u0 = ri(1, 5), n = ri(3, 6); const v = u0 * (2 ** (n + 1) - 1); return { q: "u₀ + u₁ + … + u" + sup(n) + ", géométrique u₀ = " + u0 + ", q = 2 ?", mode: "num", sol: v, disp: String(v) }; },
  cplx(l) { if (l === 1) { const a = rnz(-5, 5), b = rnz(-5, 5), c = rnz(-5, 5), d = rnz(-5, 5);
      if (pick([0, 1])) return { q: "Re[(" + a + " " + (b < 0 ? "−" : "+") + " " + Math.abs(b) + "i)(" + c + " " + (d < 0 ? "−" : "+") + " " + Math.abs(d) + "i)] = ?", mode: "num", sol: a * c - b * d, disp: String(a * c - b * d) };
      return { q: "Im[(" + a + " " + (b < 0 ? "−" : "+") + " " + Math.abs(b) + "i)(" + c + " " + (d < 0 ? "−" : "+") + " " + Math.abs(d) + "i)] = ?", mode: "num", sol: a * d + b * c, disp: String(a * d + b * c) }; }
    if (l === 2) { const P = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]]; const [a, b, m] = pick(P); return { q: "|" + a + " + " + b + "i| = ?", mode: "num", sol: m, disp: String(m) }; }
    const a = rnz(-5, 5), b = rnz(-5, 5); if (pick([0, 1])) return { q: "z = " + a + " " + (b < 0 ? "−" : "+") + " " + Math.abs(b) + "i.  z·z̄ = ?", mode: "num", sol: a * a + b * b, disp: String(a * a + b * b) };
    return { q: "Im[(" + a + " " + (b < 0 ? "−" : "+") + " " + Math.abs(b) + "i)²] = ?", mode: "num", sol: 2 * a * b, disp: String(2 * a * b) }; },
  sys(l) { const x0 = ri(-4, 4), y0 = rnz(-4, 4); let a = l === 1 ? 1 : rnz(-3, 3), b = rnz(-3, 3), c = rnz(-3, 3), d = l === 1 ? 1 : rnz(-3, 3);
    if (a * d - b * c === 0) d = d + 1 || 2; const e = a * x0 + b * y0, f = c * x0 + d * y0; const eq = (p, q2, r) => poly([[p, "x"], [q2, "y"]]) + " = " + r;
    return { q: "Résoudre : " + eq(a, b, e) + "  et  " + eq(c, d, f) + " ?", mode: "pair", sol: [x0, y0], ordered: true, disp: "x = " + x0 + ", y = " + y0 }; },
};

/* --- Conversion en QCM (aucune saisie clavier) ------------------------- */
function styleOf(disp) {
  if (/^-?\d+$/.test(disp)) return { k: "int" };
  const f = disp.match(/^(-?\d+)\/(-?\d+)$/); if (f) return { k: "frac", n: +f[1], d: +f[2] };
  return { k: "other" };
}
export function makeChoices(raw, n = 6) {
  if (raw.mode === "mcq") return { choices: raw.choices, sol: raw.sol };
  const set = new Set(); let correct;
  if (raw.mode === "pair") {
    const [a, b] = raw.sol; const f = (x, y) => x + " ; " + y; correct = f(a, b);
    [f(a + 1, b), f(a, b + 1), f(a - 1, b - 1), f(-a, b), f(a, -b), f(b, a), f(a + 1, b - 1), f(a - 1, b + 1), f(a + 2, b), f(a, b + 2)]
      .forEach(c => { if (c !== correct) set.add(c); });
  } else {
    correct = raw.disp; const st = styleOf(correct); let cand = [];
    if (st.k === "int") { const s = +correct; cand = [s + 1, s - 1, s + 2, s - 2, s + 3, -s, s * 2, s + 5, s - 5, s + 10, Math.round(s / 2)].map(String); }
    else if (st.k === "frac") { const nn = st.n, d = st.d; cand = [fracS(nn + 1, d), fracS(nn - 1, d), fracS(nn + 2, d), fracS(nn - 2, d), fracS(-nn, d), fracS(nn + d, d), fracS(2 * nn, d), fracS(nn, d + 1)]; }
    else cand = [correct + " (?)"];
    cand.forEach(c => { if (c !== correct) set.add(c); });
  }
  const distract = shuffle([...set]).slice(0, n - 1);
  return { choices: shuffle([correct, ...distract]), sol: correct };
}
export function genDrill(domId, lvl) {
  const raw = GEN[domId](lvl); const { choices, sol } = makeChoices(raw, 6);
  return { q: raw.q, dom: domId, lvl, choices, sol, disp: raw.disp };
}
