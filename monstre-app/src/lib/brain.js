import { addDays, todayKey } from "./util.js";
import { DOMAINS } from "./drill.js";
import { FLASH } from "./flash.js";
import { buildChecklist, sleepOkOf } from "./config.js";

const GA = 2.399963229728653; // angle d'or → répartition organique
function layout(cx, cy, i, spread) { const r = 5 + spread * Math.sqrt(i); const a = i * GA; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
const clamp = v => Math.max(0, Math.min(100, Math.round(v)));

/* --- masteries par nœud (0-100) à partir des signaux existants --- */
function mathM(S, id) {
  const sk = S.skills.d[id]; if (!sk) return 0;
  const lvlPart = ((sk.lvl || 1) - 1) / 2;
  const hist = sk.hist || []; const ratePart = hist.length ? hist.filter(Boolean).length / hist.length : lvlPart;
  return clamp((lvlPart * 0.7 + ratePart * 0.3) * 100);
}
function flashM(S, deck) {
  const cards = FLASH.filter(c => c.deck === deck); if (!cards.length) return 0;
  let sum = 0; cards.forEach(c => { const s = S.flash[c.id]; sum += s ? (s.box || 1) : 0; });
  return clamp(sum / (cards.length * 4) * 100);
}
function physM(S) { const pe = S.exams.filter(e => e.subject === "phys" || e.subject === "mixte"); return pe.length ? clamp(pe.slice(-5).reduce((a, e) => a + e.score, 0) / Math.min(5, pe.length) / 20 * 100) : 0; }
function checkRate(S, ids, days = 21) {
  const tk = todayKey(); let tot = 0, ok = 0;
  for (let i = 0; i < days; i++) { const dk = addDays(tk, -i); if (dk < "2026-07-06") continue;
    const list = buildChecklist(dk); if (!list.some(it => ids.includes(it.id))) continue;
    tot++; const ch = S.days[dk] || {}; if (ids.some(id => ch[id])) ok++; }
  return tot ? clamp(ok / tot * 100) : 0;
}
function sleepM(S) { const tk = todayKey(); let tot = 0, ok = 0; for (let i = 0; i < 21; i++) { const dk = addDays(tk, -i); if (dk < "2026-07-06") continue; const so = sleepOkOf(S, dk); if (so != null) { tot++; if (so) ok++; } } return tot ? clamp(ok / tot * 100) : 0; }

const PHYS_TOPICS = [["Chute libre"], ["Énergie méca."], ["Lois de Newton"], ["Électricité"], ["Ondes"], ["Optique"]];
const FLASH_DECKS = [["der", "Dérivées"], ["prim", "Primitives"], ["lim", "Limites"], ["trig", "Trigo"], ["form", "Formules"], ["courbe", "Courbes"]];

export const BRAIN_REGIONS = [
  { id: "maths", label: "Maths", color: "#35e0d0" },
  { id: "phys", label: "Physique", color: "#ff8e3c" },
  { id: "mem", label: "Mémoire", color: "#ffd166" },
  { id: "sci", label: "Sciences", color: "#8f7bff" },
  { id: "humain", label: "Le reste", color: "#ff3d8b" },
];

export function brainData(S) {
  const nodes = [];
  const add = (region, color, id, label, m, cx, cy, i, spread) => { const [x, y] = layout(cx, cy, i, spread); nodes.push({ id, region, color, label, m, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }); };

  DOMAINS.forEach((d, i) => add("maths", "#35e0d0", "m_" + d.id, d.name, mathM(S, d.id), 96, 108, i, 6.4));
  const pm = physM(S);
  PHYS_TOPICS.forEach((t, i) => add("phys", "#ff8e3c", "p_" + i, t[0], pm, 252, 100, i, 8.5));
  FLASH_DECKS.forEach((d, i) => add("mem", "#ffd166", "f_" + d[0], d[1], flashM(S, d[0]), 92, 214, i, 8.5));
  const sci = checkRate(S, ["sci", "b2"]);
  [["Chimie"], ["SI / Info"]].forEach((t, i) => add("sci", "#8f7bff", "s_" + i, t[0], sci, 250, 210, i, 14));
  const humain = [
    ["h_ang", "Anglais", checkRate(S, ["eng", "lang"])],
    ["h_lec", "Lecture / Philo", checkRate(S, ["read"])],
    ["h_som", "Sommeil", sleepM(S)],
    ["h_rel", "Relationnel", Math.min(100, Math.round(S.xp / 1500 * 100))],
  ];
  humain.forEach((t, i) => add("humain", "#ff3d8b", t[0], t[1], t[2], 168, 256, i, 18));

  // synapses : chaînes intra-région + ponts inter-régions (corps calleux)
  const idx = {}; nodes.forEach((n, i) => (idx[n.id] = i));
  const edges = [];
  const chain = (pfx, count) => { for (let i = 1; i < count; i++) { edges.push([pfx + "-" + (i - 1), pfx + "-" + i]); } };
  // relie chaque nœud à son précédent dans l'ordre d'ajout, par région
  const byRegion = {}; nodes.forEach(n => { (byRegion[n.region] = byRegion[n.region] || []).push(n.id); });
  Object.values(byRegion).forEach(list => { for (let i = 1; i < list.length; i++) edges.push([list[i - 1], list[i]]); for (let i = 2; i < list.length; i++) edges.push([list[i - 2], list[i]]); });
  const bridge = (a, b) => { if (idx[a] != null && idx[b] != null) edges.push([a, b]); };
  bridge("m_frac", "f_der"); bridge("m_der", "f_der"); bridge("m_der", "p_0"); bridge("p_0", "s_0"); bridge("f_der", "h_lec"); bridge("m_frac", "h_rel"); bridge("p_0", "h_rel"); bridge("s_0", "h_som");

  const total = nodes.length;
  const globalPct = Math.round(nodes.reduce((a, n) => a + n.m, 0) / total);
  const active = nodes.filter(n => n.m >= 40).length;
  const byRegionPct = BRAIN_REGIONS.map(r => { const ns = nodes.filter(n => n.region === r.id); return { ...r, pct: ns.length ? Math.round(ns.reduce((a, n) => a + n.m, 0) / ns.length) : 0 }; });
  return { nodes, edges, stats: { globalPct, active, total }, byRegion: byRegionPct, idx };
}
