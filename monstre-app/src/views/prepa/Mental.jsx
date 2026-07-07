import { useState, useEffect, useRef } from "react";
import { useGame } from "../../game.jsx";
import { frn, fmtDate } from "../../lib/util.js";

/* ── Générateur de problèmes (plages type Zetamac) ── */
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
function genProblem(ops) {
  const op = ops[Math.floor(Math.random() * ops.length)];
  if (op === "+") { const a = R(2, 100), b = R(2, 100); return { t: a + " + " + b, a: a + b }; }
  if (op === "−") { const a = R(2, 100); let b = R(2, 100); if (b === a) b = a > 2 ? a - 1 : a + 1; const hi = Math.max(a, b), lo = Math.min(a, b); return { t: hi + " − " + lo, a: hi - lo }; }
  if (op === "×") { const a = R(2, 12), b = R(2, 100); return { t: a + " × " + b, a: a * b }; }
  const b = R(2, 12), q = R(2, 100); return { t: (b * q) + " ÷ " + b, a: q };
}
const OPS = ["+", "−", "×", "÷"];
const DURS = [[60, "1 min"], [120, "2 min"], [180, "3 min"]];
const fmtT = sec => sec == null ? "—" : Math.floor(sec / 60) + ":" + String(Math.round(sec % 60)).padStart(2, "0");
const accOf = e => (e.correct != null && e.wrong != null && (e.correct + e.wrong) > 0) ? Math.round(e.correct / (e.correct + e.wrong) * 1000) / 10 : null;

export default function Mental() {
  const { S, parseMental, addMental, removeMental, setMentalHigh } = useGame();
  const high = S.mentalHigh !== false;

  /* ── état du jeu ── */
  const [g, setG] = useState({ phase: "config", ops: ["+", "−", "×", "÷"], dur: 120, prob: null, input: "", correct: 0, wrong: 0, endsAt: 0, lastScore: null });
  const [now, setNow] = useState(0);
  const gRef = useRef(g); gRef.current = g;
  const doneRef = useRef(false);

  const start = () => { if (!g.ops.length) return; doneRef.current = false; setNow(Date.now()); setG(s => ({ ...s, phase: "play", prob: genProblem(s.ops), input: "", correct: 0, wrong: 0, endsAt: Date.now() + s.dur * 1000 })); };
  const press = d => setG(s => { if (s.phase !== "play") return s; const input = (s.input + d).slice(0, 7);
    if (Number(input) === s.prob.a) return { ...s, correct: s.correct + 1, input: "", prob: genProblem(s.ops) };
    return { ...s, input }; });
  const back = () => setG(s => ({ ...s, input: s.input.slice(0, -1) }));
  const skip = () => setG(s => s.phase === "play" ? { ...s, wrong: s.wrong + 1, input: "", prob: genProblem(s.ops) } : s);
  const toggleOp = op => setG(s => ({ ...s, ops: s.ops.includes(op) ? s.ops.filter(o => o !== op) : [...s.ops, op] }));

  /* tic d'horloge pendant le jeu */
  useEffect(() => { if (g.phase !== "play") return; const id = setInterval(() => setNow(Date.now()), 200); return () => clearInterval(id); }, [g.phase]);
  /* fin de partie → log auto (une seule fois) */
  useEffect(() => {
    if (g.phase === "play" && g.endsAt && now >= g.endsAt && !doneRef.current) {
      doneRef.current = true; const s = gRef.current;
      if (s.correct > 0 || s.wrong > 0) addMental({ score: s.correct, correct: s.correct, wrong: s.wrong, timeSec: s.dur, ops: s.ops.join("") + " · " + (s.dur / 60) + "min" });
      if (high !== true) setMentalHigh(true);   // jeu = nb de bonnes réponses → plus haut = mieux
      setG(x => ({ ...x, phase: "done", lastScore: s.correct }));
    }
  }, [now, g.phase, g.endsAt]);   // eslint-disable-line react-hooks/exhaustive-deps
  /* clavier physique (desktop) */
  useEffect(() => { if (g.phase !== "play") return; const h = e => {
      if (/^[0-9]$/.test(e.key)) { e.preventDefault(); press(e.key); }
      else if (e.key === "Backspace") { e.preventDefault(); back(); }
      else if (e.key === " " || e.key === "Enter") { e.preventDefault(); skip(); }
    }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [g.phase]);   // eslint-disable-line react-hooks/exhaustive-deps

  const remain = g.phase === "play" ? Math.max(0, Math.ceil((g.endsAt - now) / 1000)) : 0;

  /* ── stats / évolution (lecture de S.mental) ── */
  const list = (S.mental || []).slice().sort((a, b) => a.ts - b.ts);
  const scores = list.map(e => e.score);
  const best = scores.length ? (high ? Math.max(...scores) : Math.min(...scores)) : null;
  const lastE = list.length ? list[list.length - 1] : null;
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 100) / 100 : null;
  const accs = list.map(accOf).filter(x => x != null); const bestAcc = accs.length ? Math.max(...accs) : null;
  const lo = scores.length ? Math.min(...scores) : 0, hi = scores.length ? Math.max(...scores) : 1;
  const norm = s => { if (hi === lo) return 60; const t = high ? (s - lo) / (hi - lo) : (hi - s) / (hi - lo); return 12 + t * 88; };
  const last12 = list.slice(-12);

  /* ── import externe (repliable) ── */
  const [imp, setImp] = useState({ open: false, txt: "" });
  const doImport = () => { const p = parseMental(imp.txt); const r = addMental({ score: p.score, seed: p.seed, url: p.url }); if (r && r.ok) setImp({ open: false, txt: "" }); };

  /* ═══ ÉCRAN DE JEU ═══ */
  if (g.phase === "play") {
    const K = ["7", "8", "9", "4", "5", "6", "1", "2", "3"];
    return (
      <div className="mm-play">
        <div className="mm-hud">
          <div className="mm-hud-b"><span className="v">{g.correct}</span><span className="l">justes</span></div>
          <div className={"mm-timer" + (remain <= 10 ? " warn" : "")}>{fmtT(remain)}</div>
          <div className="mm-hud-b"><span className="v">{g.wrong}</span><span className="l">passés</span></div>
        </div>
        <div className="mm-prob">{g.prob.t}</div>
        <div className="mm-answer">{g.input || <span className="ph">?</span>}</div>
        <div className="mm-pad">
          {K.map(d => <button key={d} onClick={() => press(d)}>{d}</button>)}
          <button className="alt" onClick={back}>⌫</button>
          <button onClick={() => press("0")}>0</button>
          <button className="alt skip" onClick={skip}>Passer →</button>
        </div>
        <button className="p-btn" style={{ marginTop: 12, background: "#eee", color: "var(--pencil)" }} onClick={() => { doneRef.current = true; setG(s => ({ ...s, phase: "config" })); }}>Arrêter</button>
      </div>
    );
  }

  /* ═══ ÉCRAN RÉSULTAT ═══ */
  if (g.phase === "done") {
    const isRec = best != null && g.lastScore === best && list.length > 1;
    return (
      <div className="mm-done">
        <div style={{ fontSize: 44 }}>{isRec ? "🏆" : g.lastScore >= 20 ? "🔥" : "💪"}</div>
        <div className="mm-done-score">{g.lastScore}</div>
        <div className="p-sub">bonnes réponses en {g.dur / 60} min{isRec ? " · nouveau record 🔥" : (best != null ? " · record " + best : "")}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="p-btn red" style={{ flex: 1 }} onClick={start}>↻ Rejouer</button>
          <button className="p-btn ink" style={{ flex: 1 }} onClick={() => setG(s => ({ ...s, phase: "config" }))}>Réglages</button>
        </div>
      </div>
    );
  }

  /* ═══ ÉCRAN CONFIG + STATS ═══ */
  return (
    <>
      <div className="p-h">Calcul mental</div>
      <div className="p-sub">Calcul mental chronométré, direct dans l'app. Tu tapes, ça s'enchaîne. Ton score (bonnes réponses) et ta courbe se remplissent tout seuls. <b className="p-red">+15 XP</b> / partie.</div>

      <div className="p-card ink" style={{ marginTop: 12 }}>
        <div className="p-card-title" style={{ marginBottom: 8 }}>Opérations</div>
        <div className="mm-ops">
          {OPS.map(op => <button key={op} className={g.ops.includes(op) ? "on" : ""} onClick={() => toggleOp(op)}>{op}</button>)}
        </div>
        <div className="p-card-title" style={{ margin: "14px 0 8px" }}>Durée</div>
        <div className="mm-durs">
          {DURS.map(([d, l]) => <button key={d} className={g.dur === d ? "on" : ""} onClick={() => setG(s => ({ ...s, dur: d }))}>{l}</button>)}
        </div>
        <button className="p-btn red" style={{ marginTop: 16, fontSize: 18 }} disabled={!g.ops.length} onClick={start}>▶️ Jouer</button>
      </div>

      {list.length > 0 && (
        <>
          <div className="mm-stats">
            <div className="mm-stat"><div className="v" style={{ color: "var(--green)" }}>{frn(best)}</div><div className="l">record</div></div>
            <div className="mm-stat"><div className="v">{lastE ? frn(lastE.score) : "—"}</div><div className="l">dernier</div><div className="s">{list.length} partie(s)</div></div>
            <div className="mm-stat"><div className="v">{avg != null ? frn(avg) : "—"}</div><div className="l">moyenne</div></div>
            <div className="mm-stat"><div className="v">{bestAcc != null ? frn(bestAcc) + "%" : "—"}</div><div className="l">précision max</div></div>
          </div>

          <div className="p-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span className="p-card-title">Évolution</span><span className="p-sub">12 dernières</span></div>
            <div className="mm-evo">
              {last12.map(e => { const isBest = e.score === best; const a = accOf(e);
                return (
                  <div key={e.id} className={"mm-eb" + (isBest ? " best" : "")} title={fmtDate(e.ts) + " · " + frn(e.score) + (a != null ? " · " + frn(a) + "%" : "") + (e.timeSec != null ? " · " + fmtT(e.timeSec) : "")}>
                    <div className="mm-ev">{frn(e.score)}</div>
                    <div className="mm-bar" style={{ height: norm(e.score) + "%" }} />
                    {isBest && <div className="mm-crown">👑</div>}
                    <div className="mm-day">{new Date(e.ts).getDate()}/{new Date(e.ts).getMonth() + 1}</div>
                  </div>
                ); })}
            </div>
          </div>

          <div className="p-card">
            <div className="p-card-title" style={{ marginBottom: 4 }}>Historique</div>
            {list.slice().reverse().map(e => { const a = accOf(e); return (
              <div key={e.id} className="mm-row">
                <span className={"mm-score" + (e.score === best ? " best" : "")}>{frn(e.score)}</span>
                <span className="mm-meta">{fmtDate(e.ts)}{a != null ? " · " + frn(a) + "%" : ""}{e.timeSec != null ? " · " + fmtT(e.timeSec) : ""}{e.ops ? " · " + e.ops : ""}</span>
                {e.url && <a className="mm-replay" href={e.url} target="_blank" rel="noreferrer" title="Rejouer">↻</a>}
                <button className="mm-del" onClick={() => removeMental(e.id)} title="Retirer">✕</button>
              </div>
            ); })}
          </div>
        </>
      )}

      <details className="mm-import" open={imp.open}>
        <summary onClick={e => { e.preventDefault(); setImp(s => ({ ...s, open: !s.open })); }}>+ Importer un score externe (coller)</summary>
        <textarea className="mm-paste" rows={2} value={imp.txt} onChange={e => setImp(s => ({ ...s, txt: e.target.value }))} placeholder="Colle un « …score of 34.47… » d'une autre app" />
        <button className="p-btn ink" style={{ marginTop: 8, width: "100%" }} onClick={doImport}>Ajouter ce score</button>
      </details>
    </>
  );
}
