import { addDays, todayKey } from "./util.js";
import { DOMAINS } from "./drill.js";
import { FLASH } from "./flash.js";
import { buildChecklist, sleepOkOf } from "./config.js";

export function radarSignals(S) {
  const mv = DOMAINS.map(d => ((S.skills.d[d.id] && S.skills.d[d.id].lvl) || 1));
  const maths = Math.round(mv.reduce((a, l) => a + (l - 1) / 2, 0) / DOMAINS.length * 100);
  const pe = S.exams.filter(e => e.subject === "phys" || e.subject === "mixte");
  const phys = pe.length ? Math.round(pe.slice(-5).reduce((a, e) => a + e.score, 0) / Math.min(5, pe.length) / 20 * 100) : 0;
  let boxSum = 0; FLASH.forEach(c => { const s = S.flash[c.id]; boxSum += s ? (s.box || 1) : 0; });
  const mem = Math.round(boxSum / (FLASH.length * 4) * 100);
  const tk = todayKey(); let rTot = 0, rOk = 0, slTot = 0, slOk = 0;
  for (let i = 0; i < 14; i++) {
    const dk = addDays(tk, -i); if (dk < "2026-07-06") continue;
    const list = buildChecklist(dk), ch = S.days[dk] || {};
    if (list.some(it => it.id === "read")) { rTot++; if (ch.read) rOk++; }
    const so = sleepOkOf(S, dk); if (so != null) { slTot++; if (so) slOk++; }
  }
  return [
    { k: "Maths", v: maths, c: "#35e0d0" }, { k: "Physique", v: phys, c: "#ff8e3c" },
    { k: "Mémoire", v: mem, c: "#ffd166" }, { k: "Lecture", v: rTot ? Math.round(rOk / rTot * 100) : 0, c: "#8f7bff" },
    { k: "Sommeil", v: slTot ? Math.round(slOk / slTot * 100) : 0, c: "#5aa9ff" }, { k: "Relationnel", v: Math.min(100, Math.round(S.xp / 1500 * 100)), c: "#ff3d8b" },
  ];
}
