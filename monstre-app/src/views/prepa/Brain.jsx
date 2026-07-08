import { useState } from "react";
import { useGame } from "../../game.jsx";
import { brainData } from "../../lib/brain.js";

export default function Brain() {
  const { S } = useGame();
  const [sel, setSel] = useState(null);
  const { nodes, edges, stats, byRegion, idx } = brainData(S);
  const selNode = sel != null ? nodes.find(n => n.id === sel) : null;
  const regLabel = r => (byRegion.find(x => x.id === r) || {}).label;
  // libellés propres : un nom par région, au sommet de son amas
  const cent = {}; nodes.forEach(n => { const c = cent[n.region] || (cent[n.region] = { x: 0, y: 0, minY: 1e9, n: 0 }); c.x += n.x; c.y += n.y; c.minY = Math.min(c.minY, n.y); c.n++; });
  const regionTags = byRegion.map(r => { const c = cent[r.id]; return c ? { label: r.label, color: r.color, pct: r.pct, x: c.x / c.n, y: c.minY - 6 } : null; }).filter(Boolean);

  return (
    <>
      <div className="p-h">🧠 Cerveau Prépa</div>
      <div className="p-sub">Chaque neurone = une compétence. Il grossit et s'illumine quand tu la travailles (drill, contrôles, par cœur, sommeil, lecture, cœur). Touche un neurone.</div>

      <div className="brain-hero">
        <div className="bh-top">
          <div><div className="bh-pct">{stats.globalPct}%</div><div className="bh-sub" style={{ marginTop: 2 }}>cerveau développé</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontFamily: "var(--disp)", fontWeight: 900, fontSize: 20, color: "var(--cyan)" }}>{stats.active}<span style={{ color: "var(--muted)", fontSize: 14 }}>/{stats.total}</span></div><div className="bh-sub">neurones actifs</div></div>
        </div>
        <div className="brain-wrap" style={{ marginTop: 10 }}>
          <svg className="brain" viewBox="8 56 336 266" role="img" aria-label="Réseau de neurones des compétences">
            {edges.map(([a, b], i) => { const na = nodes[idx[a]], nb = nodes[idx[b]]; if (!na || !nb) return null; const op = Math.min(na.m, nb.m) / 100;
              return <line key={i} className="synapse" x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} strokeWidth={0.4 + op * 1.2} strokeOpacity={0.05 + op * 0.5} />; })}
            {nodes.map(n => { const r = 2.4 + n.m / 100 * 5.2; const on = sel === n.id;
              return (
                <g key={n.id} onClick={() => setSel(on ? null : n.id)} style={{ cursor: "pointer" }}>
                  <circle cx={n.x} cy={n.y} r={r + 3 + n.m / 100 * 6} fill={n.color} opacity={0.05 + n.m / 100 * 0.16} />
                  <circle className="neuron" cx={n.x} cy={n.y} r={on ? r + 1.5 : r} fill={n.color} fillOpacity={0.28 + n.m / 100 * 0.72} stroke={on ? "#fff" : "none"} strokeWidth={on ? 1 : 0} />
                </g>
              ); })}
            {regionTags.map(r => (
              <text key={r.label} x={r.x} y={r.y} textAnchor="middle" style={{ fill: r.color, fontFamily: "var(--disp)", fontSize: 8, fontWeight: 700, opacity: 0.45 + r.pct / 200, pointerEvents: "none" }}>{r.label}</text>
            ))}
            {selNode && <text className="nlabel" x={selNode.x} y={selNode.y - (2.4 + selNode.m / 100 * 5.2) - 2.6} textAnchor="middle" style={{ fill: "#fff", fontSize: 7 }}>{selNode.label}</text>}
          </svg>
        </div>
        {selNode && (
          <div className="node-pop">
            <span className="np-dot" style={{ background: selNode.color }} />
            <div><div className="np-n">{selNode.label}</div><div className="np-m">{regLabel(selNode.region)} · {selNode.m >= 70 ? "maîtrisé 🔥" : selNode.m >= 40 ? "en progrès 💪" : selNode.m > 0 ? "à consolider" : "pas encore travaillé"}</div></div>
            <span className="np-v" style={{ color: selNode.color }}>{selNode.m}</span>
          </div>
        )}
      </div>

      <div className="brain-regions">
        {byRegion.map(r => (
          <div key={r.id} className="brain-region">
            <span className="brdot" style={{ background: r.color }} />
            <span className="brn">{r.label}</span>
            <span className="brbar"><i style={{ width: r.pct + "%", background: r.color }} /></span>
            <span className="brv">{r.pct}</span>
          </div>
        ))}
      </div>
      <div className="p-sub" style={{ marginTop: 12, textAlign: "center" }}>Plus tu bosses, plus ton cerveau prend forme. L'objectif : tout illuminer avant la rentrée. 👹</div>
    </>
  );
}
