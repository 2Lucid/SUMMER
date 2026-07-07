/* ===== Rendu maths/physique en LaTeX (KaTeX) — logique PURE =====
 * Le contenu de l'app est du texte FR mêlé de maths (fractions a/b, exposants
 * unicode, √, ∫, symboles…). On convertit CHAQUE ligne en une source KaTeX où la
 * prose reste en \text{} et où seuls les tokens mathématiques passent en mode
 * maths ($…$). Si une ligne ne se convertit pas proprement → on retombe sur le
 * texte brut (jamais pire qu'avant). Aucune dépendance React ici → testable en Node.
 */
import katex from "katex";

/* exposants / indices unicode → ASCII */
const SUP = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "-", "⁽": "(", "⁾": ")", "ⁿ": "n", "ˣ": "x", "ᵃ": "a", "ᵇ": "b", "ᶜ": "c", "ᵈ": "d", "ᵉ": "e", "ᶠ": "f", "ᵍ": "g", "ʰ": "h", "ⁱ": "i", "ʲ": "j", "ᵏ": "k", "ˡ": "l", "ᵐ": "m", "ᵒ": "o", "ᵖ": "p", "ʳ": "r", "ˢ": "s", "ᵗ": "t", "ᵘ": "u", "ᵛ": "v", "ʷ": "w", "ʸ": "y", "ᶻ": "z" };
const SUB = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9", "₊": "+", "₋": "-", "ₙ": "n", "ₐ": "a", "ₑ": "e", "ₒ": "o", "ₓ": "x", "ᵢ": "i", "ⱼ": "j", "ₖ": "k", "ₚ": "p", "ₛ": "s", "ₜ": "t" };
/* symboles → LaTeX */
const SYM = { "π": "\\pi ", "∞": "\\infty ", "ℝ": "\\mathbb{R}", "ℂ": "\\mathbb{C}", "ℚ": "\\mathbb{Q}", "ℤ": "\\mathbb{Z}", "ℕ": "\\mathbb{N}", "Δ": "\\Delta ", "λ": "\\lambda ", "γ": "\\gamma ", "α": "\\alpha ", "β": "\\beta ", "θ": "\\theta ", "φ": "\\varphi ", "ω": "\\omega ", "μ": "\\mu ", "Ω": "\\Omega ", "·": "\\cdot ", "×": "\\times ", "÷": "\\div ", "−": "-", "–": "-", "≈": "\\approx ", "≤": "\\le ", "≥": "\\ge ", "≠": "\\ne ", "≪": "\\ll ", "≫": "\\gg ", "→": "\\to ", "⟶": "\\to ", "⟹": "\\Rightarrow ", "⇒": "\\Rightarrow ", "⊥": "\\perp ", "∪": "\\cup ", "∩": "\\cap ", "±": "\\pm ", "∓": "\\mp ", "∈": "\\in ", "∉": "\\notin ", "∅": "\\varnothing ", "∑": "\\sum ", "∏": "\\prod ", "∫": "\\int ", "∮": "\\oint ", "∬": "\\iint ", "≡": "\\equiv ", "∀": "\\forall ", "∃": "\\exists ", "∂": "\\partial ", "∇": "\\nabla ", "°": "^{\\circ}", "′": "'", "″": "''", "…": "\\ldots ", "⋅": "\\cdot ",
  "½": "\\tfrac{1}{2}", "¼": "\\tfrac{1}{4}", "¾": "\\tfrac{3}{4}", "⅓": "\\tfrac{1}{3}", "⅔": "\\tfrac{2}{3}", "⅕": "\\tfrac{1}{5}", "⅖": "\\tfrac{2}{5}", "⅗": "\\tfrac{3}{5}", "⅘": "\\tfrac{4}{5}", "⅙": "\\tfrac{1}{6}", "⅚": "\\tfrac{5}{6}", "⅛": "\\tfrac{1}{8}", "⅜": "\\tfrac{3}{8}", "⅝": "\\tfrac{5}{8}", "⅞": "\\tfrac{7}{8}" };
const FUNCS = new Set(["sin", "cos", "tan", "ln", "exp", "log", "lim", "arg", "cot", "cotan", "sh", "ch", "th", "min", "max", "Re", "Im", "det"]);

/* un « mot » est mathématique s'il porte un signal maths et pas d'accent (le mode maths ne sait pas afficher les accents → ceux-là restent en prose). */
const SIGNAL = /[0-9√∫∞πℝℂℚℤℕΔλγαβθφωμΩ°′±·⋅×÷=<>≤≥≠≪≫→⟶⟹⇒⊥∪∩∈∉∑∏≡∂∇^_(){}[\]|⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿˣᵃ-ᶻ₀-₉ₙₐₑₒₓᵢⱼₖₚₛₜ−–]/u;
const ACCENT = /[À-ÖØ-öø-ÿ]/;          // lettres accentuées latin-1, SANS × (D7) ni ÷ (F7)
function isMath(w) {
  if (ACCENT.test(w)) return false;
  if (FUNCS.has(w)) return true;
  if (SIGNAL.test(w)) return true;
  return /^[A-Za-z]'?$/.test(w);          // variable seule : x, n, f, f'
}

/* profondeur de parenthèses → 1re barre de fraction « top-level » */
function topSlash(w) { let d = 0; for (let i = 0; i < w.length; i++) { const c = w[i]; if (c === "(" || c === "[") d++; else if (c === ")" || c === "]") d--; else if (c === "/" && d === 0) return i; } return -1; }
function matchParen(w, i) { let d = 0; for (let j = i; j < w.length; j++) { if (w[j] === "(") d++; else if (w[j] === ")") { d--; if (d === 0) return j; } } return w.length; }
function matchBrace(w, i) { let d = 0; for (let j = i; j < w.length; j++) { if (w[j] === "{") d++; else if (w[j] === "}") { d--; if (d === 0) return j; } } return w.length; }
function stripParens(s) { s = s.trim(); if (s[0] === "(" && matchParen(s, 0) === s.length - 1) return s.slice(1, -1); return s; }

/* convertit UN token mathématique (sans espace) en LaTeX */
function conv(w) {
  w = w.replace(/⁄/g, "/");               // barre de fraction unicode U+2044 → /
  const sl = topSlash(w);
  if (sl > 0 && sl < w.length - 1) { const a = w.slice(0, sl), b = w.slice(sl + 1); if (a && b) return "\\frac{" + conv(stripParens(a)) + "}{" + conv(stripParens(b)) + "}"; }
  let out = "", i = 0;
  while (i < w.length) {
    const c = w[i], nx = w[i + 1];
    if (nx === "⃗") { out += "\\vec{" + (SYM[c] ? SYM[c].trim() : c) + "}"; i += 2; continue; }   // X⃗
    if (nx === "̄") { out += "\\bar{" + (SYM[c] ? SYM[c].trim() : c) + "}"; i += 2; continue; }   // z̄
    if (c === "√") { if (nx === "(") { const j = matchParen(w, i + 1); out += "\\sqrt{" + conv(w.slice(i + 2, j)) + "}"; i = j + 1; } else { let j = i + 1; while (j < w.length && /[0-9A-Za-z]/.test(w[j])) j++; out += "\\sqrt{" + conv(w.slice(i + 1, j) || "") + "}"; i = j; } continue; }
    if (c === "^") { if (nx === "(") { const j = matchParen(w, i + 1); out += "^{" + conv(w.slice(i + 2, j)) + "}"; i = j + 1; } else if (nx === "{") { const j = matchBrace(w, i + 1); out += "^{" + conv(w.slice(i + 2, j)) + "}"; i = j + 1; } else { out += "^{" + (nx || "") + "}"; i += 2; } continue; }
    if (c === "_" && nx === "{") { const j = matchBrace(w, i + 1); out += "_{" + conv(w.slice(i + 2, j)) + "}"; i = j + 1; continue; }
    if (SUP[c]) { let j = i, s = ""; while (j < w.length && SUP[w[j]]) { s += SUP[w[j]]; j++; } out += "^{" + s + "}"; i = j; continue; }
    if (SUB[c]) { let j = i, s = ""; while (j < w.length && SUB[w[j]]) { s += SUB[w[j]]; j++; } out += "_{" + s + "}"; i = j; continue; }
    if (SYM[c]) { out += SYM[c]; i++; continue; }
    if (/[A-Za-z]/.test(c)) { let j = i; while (j < w.length && /[A-Za-z]/.test(w[j])) j++; const run = w.slice(i, j);
      if (FUNCS.has(run)) out += (run === "Re" || run === "Im" ? "\\operatorname{" + run + "}" : "\\" + run) + " ";
      else if (run.length >= 2) out += "\\mathrm{" + run + "}";
      else out += run; i = j; continue; }
    if (/[0-9]/.test(c)) { let j = i; while (j < w.length && /[0-9]/.test(w[j])) j++; let num = w.slice(i, j);
      if (w[j] === "," && /[0-9]/.test(w[j + 1])) { let k = j + 1; while (k < w.length && /[0-9]/.test(w[k])) k++; num += "{,}" + w.slice(j + 1, k); j = k; }
      out += num; i = j; continue; }
    if (c === "{") { out += "\\{"; i++; continue; }
    if (c === "}") { out += "\\}"; i++; continue; }
    if (c === "%") { out += "\\%"; i++; continue; }
    out += c; i++;                          // + - * = ( ) [ ] | . ; : etc. valides en mode maths
  }
  return out;
}


/* découpe une ligne en tokens+espaces, MAIS ne coupe pas sur les espaces situés à
 * l'intérieur de parenthèses (…) → « √(a² + b²) » ou « (q⁷ − 1)/(q − 1) » restent entiers. */
function splitTop(line) {
  const toks = []; let buf = "", depth = 0, sp = false;
  for (const ch of line) {
    const isSp = /\s/.test(ch) && depth === 0;
    if (ch === "(") depth++; else if (ch === ")") depth = Math.max(0, depth - 1);
    if (isSp !== sp && buf) { toks.push(buf); buf = ""; }
    sp = isSp; buf += ch;
  }
  if (buf) toks.push(buf);
  return toks;
}

/* Découpe une ligne en segments : la PROSE reste du texte HTML normal (elle
 * s'affiche et se coupe naturellement, accents inclus) ; seuls les TOKENS maths
 * passent dans KaTeX (petits spans inline qui coulent dans le texte). Repli en
 * texte si un token ne se convertit pas. → { t:"text", s } | { t:"math", s:htmlKaTeX } */
export function segments(line) {
  const out = [];
  for (const tok of splitTop(line)) {
    if (!tok) continue;
    if (/^\s+$/.test(tok) || !isMath(tok)) { out.push({ t: "text", s: tok }); continue; }
    let html = null;
    try { html = katex.renderToString(conv(tok), { throwOnError: true, displayMode: false, strict: false, output: "html" }); } catch { html = null; }
    out.push(html ? { t: "math", s: html } : { t: "text", s: tok });
  }
  return out;
}
