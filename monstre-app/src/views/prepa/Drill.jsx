import { useState, useEffect } from "react";
import { useGame } from "../../game.jsx";
import { DOMAINS } from "../../lib/drill.js";
import MathText from "../../components/MathText.jsx";

function Chrono({ t0 }) {
  const [, tick] = useState(0);
  useEffect(() => { const id = setInterval(() => tick(n => n + 1), 500); return () => clearInterval(id); }, [t0]);
  const s = Math.floor((Date.now() - t0) / 1000);
  return <span style={{ color: s > 30 ? "var(--penred)" : "var(--pencil)" }}>{s}s</span>;
}

export default function Drill() {
  const { S, ui, startDrill, drillSubmit, drillNext, endDrill } = useGame();
  const s = ui.sess;

  if (!s) {
    return (
      <>
        <div className="p-sub" style={{ marginBottom: 4 }}>Séries de 10 calculs chronométrés, en QCM (aucune saisie clavier). Le niveau (1→3) monte quand tu cartonnes, redescend quand tu rates ; tes erreurs reviennent. Ces domaines suivent le cahier de calcul du prof.</div>
        <button className="p-btn red" style={{ marginTop: 12, fontSize: 17 }} onClick={() => startDrill("mix")}>⚡ SÉRIE MIX (tout mélangé)</button>
        <div className="p-grid2 domgrid" style={{ marginTop: 10 }}>
          {DOMAINS.map(d => { const sk = S.skills.d[d.id]; const rate = sk && sk.hist && sk.hist.length ? Math.round(sk.hist.filter(Boolean).length / sk.hist.length * 100) : null;
            return <button key={d.id} className="p-domcard" onClick={() => startDrill(d.id)}><div className="dn">{d.name}</div><div className="dl">Niv. <b className="p-bic">{(sk && sk.lvl) || 1}</b>/3{rate !== null ? " · " + rate + "%" : ""}</div></button>; })}
        </div>
      </>
    );
  }

  if (s.done) {
    const ok = s.results.filter(r => r.ok).length;
    return (
      <div className="p-card ink" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40 }}>{ok >= s.results.length * 0.8 ? "🔥" : ok >= s.results.length * 0.5 ? "💪" : "📚"}</div>
        <div style={{ fontSize: 26, fontWeight: 800 }}>{ok}/{s.results.length}</div>
        <div className="pen p-red" style={{ fontSize: 26 }}>+{s.xpGain} XP</div>
        {(s.changes || []).map((c, i) => <div key={i} className="p-bic" style={{ fontWeight: 700, fontSize: 14, marginTop: 4 }}>{c}</div>)}
        <button className="p-btn ink" style={{ marginTop: 14 }} onClick={endDrill}>↻ Nouvelle série</button>
      </div>
    );
  }

  const q = s.queue[s.idx];
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "var(--pencil)" }}>
        <span>Question {s.idx + 1}/{s.queue.length}{q.retry && <span className="pen p-red" style={{ fontSize: 15 }}> à retenter !</span>}</span>
        <Chrono t0={s.t0} />
      </div>
      <div className="p-card ink">
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--bic)", marginBottom: 4 }}>{DOMAINS.find(d => d.id === q.dom).name} · niv. {q.lvl}</div>
        <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.35 }}><MathText>{q.q}</MathText></div>
      </div>
      {!s.fb && q.choices.map((c, i) => <button key={i} className="p-choice" onClick={() => drillSubmit(c)}><MathText>{c}</MathText></button>)}
      {s.fb && (
        <div className={"p-fb " + (s.fb.ok ? "ok" : "no")}>
          <div style={{ fontWeight: 800, color: s.fb.ok ? "var(--green)" : "var(--penred)" }}>{s.fb.ok ? "✓ Exact." : "✗ Raté."}</div>
          {!s.fb.ok && <div style={{ fontSize: 14, marginTop: 4 }}>Réponse : <b><MathText>{s.fb.sol}</MathText></b> <span className="pen p-red" style={{ fontSize: 17 }}>(elle revient plus loin)</span></div>}
          <button className="p-btn ink" style={{ marginTop: 10 }} onClick={drillNext}>Suivant →</button>
        </div>
      )}
    </>
  );
}
