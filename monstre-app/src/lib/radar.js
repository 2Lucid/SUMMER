import { addDays, todayKey } from "./util.js";
import { DOMAINS } from "./drill.js";
import { buildChecklist, sleepOkOf, flashCards, FEAT } from "./config.js";

/* Taux de coche d'items de checklist (par ids) sur 14 jours. */
function checkRate14(S, ids) {
  const tk = todayKey(); let tot = 0, ok = 0;
  for (let i = 0; i < 14; i++) {
    const dk = addDays(tk, -i); if (dk < "2026-07-06") continue;
    const list = buildChecklist(dk); if (!list.some(it => ids.includes(it.id))) continue;
    tot++; const ch = S.days[dk] || {}; if (ids.some(id => ch[id])) ok++;
  }
  return tot ? Math.round(ok / tot * 100) : 0;
}

export function radarSignals(S) {
  const FL = flashCards();
  const mv = DOMAINS.map(d => ((S.skills.d[d.id] && S.skills.d[d.id].lvl) || 1));
  const maths = Math.round(mv.reduce((a, l) => a + (l - 1) / 2, 0) / DOMAINS.length * 100);
  let boxSum = 0; FL.forEach(c => { const s = S.flash[c.id]; boxSum += s ? (s.box || 1) : 0; });
  const mem = FL.length ? Math.round(boxSum / (FL.length * 4) * 100) : 0;
  const tk = todayKey(); let slTot = 0, slOk = 0;
  for (let i = 0; i < 14; i++) { const dk = addDays(tk, -i); if (dk < "2026-07-06") continue; const so = sleepOkOf(S, dk); if (so != null) { slTot++; if (so) slOk++; } }
  const sleep = slTot ? Math.round(slOk / slTot * 100) : 0;

  if (FEAT().sport) {
    /* Profil Lucas — BSc AIDAMS : maths · Python · chinois · mémoire · sommeil · sport */
    return [
      { k: "Maths", v: maths, c: "#35e0d0" }, { k: "Python", v: checkRate14(S, ["code"]), c: "#ff8e3c" },
      { k: "Chinois", v: checkRate14(S, ["zh"]), c: "#ffd166" }, { k: "Mémoire", v: mem, c: "#8f7bff" },
      { k: "Sommeil", v: sleep, c: "#5aa9ff" }, { k: "Sport", v: Math.min(100, Math.round(S.xp / 1500 * 100)), c: "#ff3d8b" },
    ];
  }
  /* Profil Clément — prépa PCSI (axes d'origine) */
  const pe = S.exams.filter(e => e.subject === "phys" || e.subject === "mixte");
  const phys = pe.length ? Math.round(pe.slice(-5).reduce((a, e) => a + e.score, 0) / Math.min(5, pe.length) / 20 * 100) : 0;
  return [
    { k: "Maths", v: maths, c: "#35e0d0" }, { k: "Physique", v: phys, c: "#ff8e3c" },
    { k: "Mémoire", v: mem, c: "#ffd166" }, { k: "Lecture", v: checkRate14(S, ["read"]), c: "#8f7bff" },
    { k: "Sommeil", v: sleep, c: "#5aa9ff" }, { k: "Relationnel", v: Math.min(100, Math.round(S.xp / 1500 * 100)), c: "#ff3d8b" },
  ];
}
