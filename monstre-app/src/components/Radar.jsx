import { radarSignals } from "../lib/radar.js";
import { rd1 } from "../lib/util.js";

export default function Radar({ S }) {
  const D = radarSignals(S), N = D.length, cx = 130, cy = 120, R = 90;
  const ang = i => (-90 + i * 360 / N) * Math.PI / 180;
  const pt = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
  const rings = [0.25, 0.5, 0.75, 1].map(f => D.map((_, i) => pt(i, R * f).map(rd1).join(",")).join(" "));
  const dpts = D.map((s, i) => pt(i, R * Math.max(0.04, s.v / 100)).map(rd1).join(",")).join(" ");
  return (
    <div className="radar-wrap">
      <svg className="radar" viewBox="-50 -8 360 268" role="img" aria-label="Étoile de compétences">
        <defs>
          <radialGradient id="radGrad" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(255,209,102,.5)" />
            <stop offset="100%" stopColor="rgba(255,61,139,.28)" />
          </radialGradient>
        </defs>
        {rings.map((p, i) => <polygon key={i} className="grid-poly" points={p} />)}
        {D.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} className="axis-l" x1={cx} y1={cy} x2={rd1(x)} y2={rd1(y)} />; })}
        <polygon className="data-poly" points={dpts} />
        {D.map((s, i) => { const [x, y] = pt(i, R * Math.max(0.04, s.v / 100)); return <circle key={i} className="dot" cx={rd1(x)} cy={rd1(y)} r={3} />; })}
        {D.map((s, i) => {
          const [lx, ly] = pt(i, R + 18); const anc = Math.abs(lx - cx) < 6 ? "middle" : lx > cx ? "start" : "end";
          return (
            <g key={i}>
              <text className="lab" x={rd1(lx)} y={rd1(ly)} textAnchor={anc} dominantBaseline="middle">{s.k}</text>
              <text className="val" x={rd1(lx)} y={rd1(ly + 12)} textAnchor={anc} dominantBaseline="middle">{s.v}</text>
            </g>
          );
        })}
      </svg>
      <div className="radar-legend">
        {D.map(s => <div key={s.k} className="rl"><i style={{ background: s.c }} />{s.k}<b>{s.v}</b></div>)}
      </div>
    </div>
  );
}
