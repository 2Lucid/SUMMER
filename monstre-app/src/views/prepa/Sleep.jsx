import { useGame } from "../../game.jsx";
import { todayKey, addDays, frDate } from "../../lib/util.js";
import { rampOf } from "../../lib/config.js";

const toMin = t => { if (!t) return null; const [h, m] = t.split(":").map(Number); let v = h * 60 + m; if (v < 12 * 60) v += 24 * 60; return v; };
const toMinW = t => { if (!t) return null; const [h, m] = t.split(":").map(Number); return h * 60 + m; };

export default function Sleep() {
  const { S, upSleep } = useGame();
  const tk = todayKey(); const r = rampOf(tk); const rec = S.sleep[tk] || {};
  const okBed = rec.bed && Math.abs(toMin(rec.bed) - toMin(r.bed)) <= 30;
  const okWake = rec.wake && Math.abs(toMinW(rec.wake) - toMinW(r.wake)) <= 30;
  const hist = [];
  for (let n = 1; n <= 10; n++) { const dk = addDays(tk, -n); if (dk < "2026-07-06") break; const rr = rampOf(dk), rc = S.sleep[dk] || {}; const ob = rc.bed && Math.abs(toMin(rc.bed) - toMin(rr.bed)) <= 30; const ow = rc.wake && Math.abs(toMinW(rc.wake) - toMinW(rr.wake)) <= 30; hist.push({ dk, rc, ok: ob && ow, logged: !!(rc.bed || rc.wake) }); }

  return (
    <>
      <div className="p-card ink"><div className="p-card-title">Cible ce soir</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--bic)" }}>{r.bed} <span style={{ fontSize: 13, color: "var(--pencil)" }}>coucher</span> → {r.wake} <span style={{ fontSize: 13, color: "var(--pencil)" }}>réveil</span></div>
        <div className="pen p-red" style={{ fontSize: 19, marginTop: 2 }}>on avance de 30 min tous les 2-3 jours, pas de raccourci</div>
      </div>
      <div className="p-card"><div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Enregistrer aujourd'hui ({frDate(tk)})</div>
        <div className="p-grid2">
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--pencil)" }}>Couché hier à<input type="time" value={rec.bed || ""} className={"p-time" + (okBed ? " ok" : "")} style={{ marginTop: 4 }} onChange={e => upSleep("bed", e.target.value)} /></label>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--pencil)" }}>Levé ce matin à<input type="time" value={rec.wake || ""} className={"p-time" + (okWake ? " ok" : "")} style={{ marginTop: 4 }} onChange={e => upSleep("wake", e.target.value)} /></label>
        </div>
        {(rec.bed || rec.wake) && <div style={{ fontSize: 14, fontWeight: 600, marginTop: 10, color: okBed && okWake ? "var(--green)" : "var(--penred)" }}>{okBed && okWake ? "✓ Dans la cible (±30 min). Monstre." : "Hors cible — on retente ce soir, réveil non négociable demain."}</div>}
      </div>
      <div className="p-card"><div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>10 derniers jours</div>
        {hist.length === 0 ? <div className="p-sub">Rien encore — premier log ce soir.</div>
          : hist.map(h => <div key={h.dk} className="p-row"><span className="p-pencil">{frDate(h.dk)}</span><span className="p-flex" style={{ textAlign: "center", fontWeight: 600 }}>{(h.rc.bed || "—") + " → " + (h.rc.wake || "—")}</span><span>{!h.logged ? "·" : h.ok ? "✅" : "❌"}</span></div>)}
      </div>
      <div className="p-card"><div style={{ fontWeight: 700 }}>Protocole</div>
        <div style={{ fontSize: 14, marginTop: 4, lineHeight: 1.7 }}>1. Réveil fixe 7 j/7, même après une mauvaise nuit.<br />2. Lumière + mouvement dans les 20 premières minutes.<br />3. Caféine : stop 14h.<br />4. Dernière heure : lumière basse, pas de scroll — la lecture philo tombe pile là.<br />5. Lit = sommeil. Pas de téléphone dedans.</div>
      </div>
    </>
  );
}
