import { createContext, useContext, useState, useCallback } from "react";
import { useS, setS, getS, wipe } from "./store.js";
import * as fx from "./fx.js";
import { uid, todayKey, yesterday, addDays, pick, shuffle, frn } from "./lib/util.js";
import { ACTIONS, LEVELS, EMOJIS, DAILY_BONUS, levelIndex } from "./lib/coeur.js";
import { DOMAINS, genDrill } from "./lib/drill.js";
import { buildExam } from "./lib/exam.js";
import { FLASH, BOX_GAP } from "./lib/flash.js";

const Ctx = createContext(null);
export const useGame = () => useContext(Ctx);
const PREPA_TABS = ["today", "planning", "exam", "drill", "flash", "brain", "sleep"];
const initUi = () => ({ world: "home", tab: "today", menuFor: null, modal: null, selAction: null, fear: 5, selEmoji: EMOJIS[0], sess: null, exam: null, examCfg: { subject: "mixte", minutes: 60 }, flash: null, planDay: null, planOverview: false });

export function GameProvider({ children }) {
  const S = useS();
  const [ui, setUi] = useState(initUi);
  const patch = useCallback(p => setUi(u => ({ ...u, ...(typeof p === "function" ? p(u) : p) })), []);

  /* --- navigation --- */
  const setWorld = w => setUi(u => ({ ...u, world: w, tab: (w === "prepa" && !PREPA_TABS.includes(u.tab)) ? "today" : u.tab }));
  const setTab = t => setUi(u => ({ ...u, tab: t, flash: t === "flash" ? null : u.flash }));
  const goto = t => setUi(u => ({ ...u, world: "prepa", tab: t }));

  /* --- Cœur --- */
  const addQuest = (name, emoji) => { const n = (name || "").trim(); if (!n) { fx.toast("Il lui faut un prénom (ou un nom de code 😏)"); return; }
    const cur = getS(); setS({ ...cur, quests: [...cur.quests, { id: uid(), name: n.slice(0, 24), emoji: emoji || "🌸", status: "active", created: Date.now() }] });
    fx.toast("Quête ajoutée : " + n + " ✨"); };
  const logAction = (questId, type, fear) => {
    const a = ACTIONS[type]; if (!a) return;
    const cur = getS(); const prevLvl = levelIndex(cur.xp); const today = todayKey();
    let gain = a.xp, bonus = "", streak = cur.streak, best = cur.best, lastDay = cur.lastDay;
    if (lastDay !== today) { if (lastDay === yesterday()) streak += 1; else streak = 1; best = Math.max(best, streak); lastDay = today; gain += DAILY_BONUS; bonus = " (+" + DAILY_BONUS + " bonus du jour)"; }
    const log = [...cur.log, { id: uid(), questId: questId || null, type, xp: a.xp, fear: (typeof fear === "number" ? fear : null), ts: Date.now() }];
    const coeurDaily = { ...cur.coeurDaily, [today]: (cur.coeurDaily[today] || 0) + 1 };
    const quests = questId ? cur.quests.map(q => q.id === questId ? { ...q, status: a.closes ? "closed" : (type === "couple" ? "couple" : q.status) } : q) : cur.quests;
    const xp = cur.xp + gain;
    setS({ ...cur, log, xp, streak, best, lastDay, coeurDaily, quests });
    setUi(u => ({ ...u, modal: null }));
    fx.toast(a.emoji + " +" + a.xp + " XP · " + a.label + bonus);
    if (a.boss || a.legendary) fx.confetti(a.legendary ? 80 : 40);
    if (type === "rateau") setTimeout(() => fx.toast("Quête fermée avec honneur. GG d'avoir joué. ⚔️"), 2400);
    const nl = levelIndex(xp); if (nl > prevLvl) { fx.levelup(nl); fx.confetti(60); }
  };
  const setStatus = (id, st) => { const cur = getS(); setS({ ...cur, quests: cur.quests.map(q => q.id === id ? { ...q, status: st } : q) }); setUi(u => ({ ...u, menuFor: null })); };
  const removeQuest = id => { if (!confirm("Supprimer cette quête et garder l'XP déjà gagné ?")) return; const cur = getS(); setS({ ...cur, quests: cur.quests.filter(q => q.id !== id) }); setUi(u => ({ ...u, menuFor: null })); };
  const openModal = questId => setUi(u => ({ ...u, modal: { questId }, selAction: null, fear: 5 }));
  const closeModal = () => setUi(u => ({ ...u, modal: null }));

  /* --- Prépa (jour / sommeil) --- */
  const toggleDay = id => { const cur = getS(); const tk = todayKey(); const ch = cur.days[tk] || {}; setS({ ...cur, days: { ...cur.days, [tk]: { ...ch, [id]: !ch[id] } } }); };
  const doTodo = id => { const cur = getS(); setS({ ...cur, todos: { ...cur.todos, [id]: true } }); };
  const upSleep = (k, v) => { const cur = getS(); const tk = todayKey(); const rec = cur.sleep[tk] || {}; setS({ ...cur, sleep: { ...cur.sleep, [tk]: { ...rec, [k]: v } } }); };

  /* --- Drill (100% QCM) --- */
  const drillLvl = id => (S.skills.d[id] && S.skills.d[id].lvl) || 1;
  const startDrill = domSel => { const queue = []; for (let i = 0; i < 10; i++) { const id = domSel === "mix" ? pick(DOMAINS).id : domSel; queue.push(genDrill(id, (getS().skills.d[id] && getS().skills.d[id].lvl) || 1)); } setUi(u => ({ ...u, sess: { domSel, queue, idx: 0, results: [], fb: null, t0: Date.now(), xpGain: 0, done: false } })); };
  const drillSubmit = choice => { const s = ui.sess; const q = s.queue[s.idx]; const ok = choice === q.sol;
    const fast = (Date.now() - s.t0) / 1000 < 15; const gain = ok ? 8 * q.lvl + (fast ? 4 : 0) : 0; let queue = [...s.queue];
    if (!ok && queue.length < 13) queue.splice(Math.min(s.idx + 3, queue.length), 0, { ...genDrill(q.dom, q.lvl), retry: true });
    setUi(u => ({ ...u, sess: { ...s, queue, fb: { ok, sol: q.disp }, results: [...s.results, { dom: q.dom, ok }], xpGain: s.xpGain + gain } })); };
  const drillNext = () => { const s = ui.sess; const ni = s.idx + 1;
    if (ni >= s.queue.length) {
      const cur = getS(); const d = { ...(cur.skills.d || {}) }; const touched = {};
      s.results.forEach(r => { const c = { ...(d[r.dom] || { lvl: 1, hist: [] }) }; c.hist = [...(c.hist || []), r.ok].slice(-10); d[r.dom] = c; touched[r.dom] = true; });
      const changes = [];
      Object.keys(touched).forEach(id => { const c = d[id]; const n = c.hist.length, w = c.hist.filter(Boolean).length;
        if (n >= 6 && w / n >= 0.8 && c.lvl < 3) { c.lvl++; c.hist = []; changes.push(DOMAINS.find(x => x.id === id).name + " → niveau " + c.lvl + " 🔺"); }
        else if (n >= 6 && w / n <= 0.4 && c.lvl > 1) { c.lvl--; c.hist = []; changes.push(DOMAINS.find(x => x.id === id).name + " → niveau " + c.lvl + " 🔻"); } });
      setS({ ...cur, skills: { xp: (cur.skills.xp || 0) + s.xpGain, d } });
      setUi(u => ({ ...u, sess: { ...s, done: true, changes } })); return;
    }
    setUi(u => ({ ...u, sess: { ...s, idx: ni, fb: null, t0: Date.now() } })); };
  const endDrill = () => setUi(u => ({ ...u, sess: null }));

  /* --- Flash --- */
  const flashDue = () => { const tk = todayKey(); const fl = getS().flash; return FLASH.filter(c => { const s = fl[c.id]; return !s || s.due <= tk; }); };
  const startFlash = () => setUi(u => ({ ...u, flash: { queue: shuffle(flashDue()).slice(0, 15), idx: 0, rev: false } }));
  const flipFlash = () => setUi(u => ({ ...u, flash: { ...u.flash, rev: !u.flash.rev } }));
  const gradeFlash = ok => { const cur = getS(); const st = ui.flash; const c = st.queue[st.idx]; const s = cur.flash[c.id] || { box: 1 }; const box = ok ? Math.min(4, (s.box || 1) + 1) : 1; const tk = todayKey(); const dueNext = ok ? addDays(tk, BOX_GAP[box - 1]) : tk;
    setS({ ...cur, flash: { ...cur.flash, [c.id]: { box, due: dueNext } } }); setUi(u => ({ ...u, flash: { ...st, idx: st.idx + 1, rev: false } })); };

  /* --- Contrôle --- */
  const setExamCfg = p => setUi(u => ({ ...u, examCfg: { ...u.examCfg, ...p } }));
  const startExam = (subject, minutes) => setUi(u => ({ ...u, exam: { subject, minutes, list: buildExam(subject, minutes), t0: Date.now(), endsAt: Date.now() + minutes * 60000, submitted: false, grades: {}, saved: false } }));
  const examSubmit = () => setUi(u => { if (!u.exam || u.exam.submitted) return u; const grades = { ...u.exam.grades }; u.exam.list.forEach((_, i) => { if (grades[i] == null) grades[i] = 0; }); return { ...u, exam: { ...u.exam, submitted: true, grades } }; });
  const examSetGrade = (i, pts) => setUi(u => ({ ...u, exam: { ...u.exam, grades: { ...u.exam.grades, [i]: pts } } }));
  const examSave = () => { const e = ui.exam; if (!e || e.saved) return; const max = e.list.reduce((s, x) => s + x.pts, 0), got = e.list.reduce((s, x, i) => s + (e.grades[i] || 0), 0); const score = Math.round(got / max * 200) / 10;
    const byEx = e.list.map((x, i) => ({ sub: x.subKey, got: e.grades[i] || 0, max: x.pts })); const cur = getS();
    setS({ ...cur, exams: [...cur.exams, { dk: todayKey(), ts: Date.now(), subject: e.subject, minutes: e.minutes, score, max, got, byEx }] });
    setUi(u => ({ ...u, exam: { ...e, saved: true, finalScore: score } })); fx.confetti(score >= 14 ? 50 : 20); fx.toast("Copie corrigée : " + frn(score) + "/20 " + (score >= 16 ? "🔥" : score >= 12 ? "💪" : "📚")); };
  const endExam = () => setUi(u => ({ ...u, exam: null, tab: "exam" }));

  /* --- données --- */
  const doWipe = () => { if (confirm("Tout effacer : Cœur + Prépa ?") && confirm("Sûr de sûr ? Irréversible.")) { wipe(); fx.toast("Nouvelle partie. Deviens un monstre. 👹"); } };

  const value = { S, ui, patch, setWorld, setTab, goto, addQuest, logAction, setStatus, removeQuest, openModal, closeModal, toggleDay, doTodo, upSleep, drillLvl, startDrill, drillSubmit, drillNext, endDrill, startFlash, flipFlash, gradeFlash, setExamCfg, startExam, examSubmit, examSetGrade, examSave, endExam, doWipe };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
