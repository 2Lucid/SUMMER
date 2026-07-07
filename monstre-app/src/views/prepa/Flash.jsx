import { useEffect } from "react";
import { useGame } from "../../game.jsx";
import { todayKey } from "../../lib/util.js";
import { FLASH, SUBJECTS } from "../../lib/flash.js";
import MathText from "../../components/MathText.jsx";

export default function Flash() {
  const { S, ui, startFlash, flipFlash, gradeFlash, setFlashSubj } = useGame();
  const st = ui.flash;
  const subj = ui.flashSubj || "all";
  useEffect(() => { if (!st) startFlash(); }, [st, startFlash]);

  const tk = todayKey();
  const inSubj = c => subj === "all" || c.subject === subj;
  const dueOf = s => FLASH.filter(c => (s === "all" || c.subject === s) && (() => { const x = S.flash[c.id]; return !x || x.due <= tk; })()).length;
  const nDue = dueOf(subj);

  const picker = (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${SUBJECTS.length}, 1fr)`, gap: 6, marginBottom: 10 }}>
      {SUBJECTS.map(sj => {
        const active = sj.key === subj;
        const total = FLASH.filter(c => sj.key === "all" || c.subject === sj.key).length;
        const due = dueOf(sj.key);
        return (
          <button key={sj.key} onClick={() => setFlashSubj(sj.key)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2, lineHeight: 1.15,
            padding: "8px 4px", borderRadius: 12, cursor: "pointer", fontFamily: "var(--body)",
            border: "2px solid " + (active ? "var(--pink-ink)" : "var(--line)"),
            background: active ? "var(--pink-ink)" : "var(--paper)",
            color: active ? "#fff" : "var(--ink)",
          }}>
            <div style={{ fontSize: 18 }}>{sj.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 800 }}>{sj.label}</div>
            <div style={{ fontSize: 10, opacity: 0.8, color: active ? "#fff" : "var(--pencil)" }}>{due > 0 ? due + " dues" : total + " cartes"}</div>
          </button>
        );
      })}
    </div>
  );

  if (!st) return <div className="p-sub">Chargement…</div>;

  if (st.queue.length === 0 || st.idx >= st.queue.length) {
    return (
      <>
        {picker}
        <div className="p-card ink" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>🧠</div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{nDue === 0 ? "Tout est à jour." : "Session terminée."}</div>
          <div className="p-sub" style={{ marginTop: 4 }}>{nDue === 0 ? "Les cartes reviennent selon la répétition espacée (1, 3, 7, 14 j). Change de matière ou repasse demain." : nDue + " carte(s) encore dues."}</div>
          {nDue > 0 && <button className="p-btn ink" style={{ marginTop: 12 }} onClick={startFlash}>Continuer</button>}
        </div>
      </>
    );
  }

  const c = st.queue[st.idx];
  const sjMeta = SUBJECTS.find(s => s.key === c.subject);
  return (
    <>
      {picker}
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--pencil)" }}>Carte {st.idx + 1}/{st.queue.length} · {sjMeta ? sjMeta.emoji + " " : ""}deck « {c.deck} » · dues : {nDue}</div>
      <button className="p-flash" onClick={flipFlash}>
        <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.35 }}><MathText>{c.front}</MathText></div>
        {st.rev ? <div className="pen p-red" style={{ fontSize: 24, lineHeight: 1.3 }}><MathText>{c.back}</MathText></div> : <div className="p-sub">touche pour révéler</div>}
      </button>
      {st.rev && (
        <div className="p-grid2" style={{ marginTop: 10 }}>
          <button className="p-btn red" onClick={() => gradeFlash(false)}>✗ Pas su</button>
          <button className="p-btn green" onClick={() => gradeFlash(true)}>✓ Su</button>
        </div>
      )}
    </>
  );
}
