/* Dates ------------------------------------------------------------------ */
export const pad = n => String(n).padStart(2, "0");
export const dkOf = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
export const todayKey = () => dkOf(new Date());
export const fromDk = dk => { const [y, m, d] = dk.split("-").map(Number); return new Date(y, m - 1, d); };
export const addDays = (dk, n) => { const d = fromDk(dk); d.setDate(d.getDate() + n); return dkOf(d); };
export const daysTo = (dk, t) => Math.round((fromDk(t) - fromDk(dk)) / 86400000);
export const WD = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
export const MO = ["janv.", "févr.", "mars", "avril", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
export const frDate = dk => { const d = fromDk(dk); return WD[d.getDay()] + " " + d.getDate() + " " + MO[d.getMonth()]; };
export const dstr = (d = new Date()) => dkOf(d);
export const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dstr(d); };
export const fmtDate = ts => new Date(ts).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
export const uid = () => Math.random().toString(36).slice(2, 9);

/* Maths ------------------------------------------------------------------ */
export const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const rnz = (a, b) => { let x = 0; while (x === 0) x = ri(a, b); return x; };
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
export const fracS = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.abs(n), d) || 1; n /= g; d /= g; return d === 1 ? String(n) : n + "/" + d; };
const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
export const sup = n => String(n).split("").map(c => SUP[c] || c).join("");
export const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
export const term = (c, s) => (c === 0 ? "" : ((Math.abs(c) === 1 && s ? "" : Math.abs(c)) + s));
export function poly(terms) { let out = ""; terms.forEach(([c, s]) => { if (c === 0) return; if (!out) out = (c < 0 ? "−" : "") + term(c, s); else out += (c < 0 ? " − " : " + ") + term(c, s); if (Math.abs(c) === 1 && !s) out += "1"; }); return out || "0"; }
export const mcq = (correct, distractors) => { const set = [correct]; distractors.forEach(d => { if (!set.includes(d) && set.length < 4) set.push(d); }); let k = 2; while (set.length < 4) { const alt = correct + " · " + k; if (!set.includes(alt)) set.push(alt); k++; } return { choices: shuffle(set), sol: correct }; };
export const rd2 = x => Math.round(x * 100) / 100, rd1 = x => Math.round(x * 10) / 10;
export const frn = x => String(x).replace(".", ",");
export const sgn = x => String(x).replace(/-/g, "−");
export const fac = r => (r < 0 ? "(x + " + (-r) + ")" : "(x − " + r + ")");
export const G = 9.8;
