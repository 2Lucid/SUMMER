import { useState, useEffect, useRef } from "react";
import { useGame } from "../../game.jsx";
import { pad, frn, rd1, fromDk, frDate } from "../../lib/util.js";

const SUBS = [["maths", "Maths", "calcul, fonctions, suites…"], ["phys", "Physique", "méca, élec, ondes, optique"], ["mixte", "Mixte", "moitié-moitié"]];
const MINS = [[30, "30 min", "court"], [45, "45 min", "standard"], [60, "1 h", "le vrai défi"]];

function ExamTimer({ endsAt, onExpire }) {
  const [left, setLeft] = useState(Math.max(0, endsAt - Date.now()));
  const exp = useRef(onExpire); exp.current = onExpire;
  useEffect(() => {
    const id = setInterval(() => { const l = Math.max(0, endsAt - Date.now()); setLeft(l); if (l <= 0) { clearInterval(id); exp.current(); } }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  const s = Math.floor(left / 1000);
  return <div className={"exam-timer" + (left < 300000 ? " warn" : "")}><span className="et-l">⏱ Temps restant</span><span className="et-time">{pad(Math.floor(s / 60))}:{pad(s % 60)}</span></div>;
}

function Setup() {
  const { S, ui, setExamCfg, startExam } = useGame(); const cfg = ui.examCfg;
  const last = S.exams.slice(-12);
  const avg = S.exams.length ? rd1(S.exams.reduce((a, x) => a + x.score, 0) / S.exams.length) : 0;
  const best = S.exams.length ? rd1(Math.max(...S.exams.map(x => x.score))) : 0;
  return (
    <>
      <div className="p-h">Contrôle</div>
      <div className="p-sub">Un DS que tu fais sur copie, chez toi, chronométré. Tu cherches, tu rédiges, puis tu te corriges avec le barème. On suit ta progression jour après jour.</div>
      <div className="p-card ink">
        <div className="p-card-title" style={{ marginBottom: 6 }}>Matière</div>
        <div className="ex-opt">{SUBS.map(sb => <button key={sb[0]} className={cfg.subject === sb[0] ? "sel" : ""} onClick={() => setExamCfg({ subject: sb[0] })}>{sb[1]}<span className="eo-s">{sb[2]}</span></button>)}</div>
        <div className="p-card-title" style={{ margin: "14px 0 6px" }}>Durée</div>
        <div className="ex-opt">{MINS.map(mn => <button key={mn[0]} className={cfg.minutes === mn[0] ? "sel" : ""} onClick={() => setExamCfg({ minutes: mn[0] })}>{mn[1]}<span className="eo-s">{mn[2]}</span></button>)}</div>
        <button className="p-btn red" style={{ marginTop: 16, fontSize: 17 }} onClick={() => startExam(cfg.subject, cfg.minutes)}>🚀 Lancer le contrôle</button>
        <div className="p-sub" style={{ marginTop: 8 }}>Prépare feuille + stylo. Le chrono démarre au lancement.</div>
      </div>
      {S.exams.length > 0 && (
        <div className="p-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span className="p-card-title">Évolution</span><span className="p-sub">{S.exams.length} contrôle(s) · moy {frn(avg)} · record {frn(best)}</span></div>
          <div className="exam-evo">{last.map((x, i) => <div key={i} className={"eb" + (x.subject === "phys" ? " phys" : "")} title={frDate(x.dk) + " · " + frn(x.score) + "/20"}><div className="ev">{frn(x.score)}</div><div className="ebar" style={{ height: Math.max(6, x.score / 20 * 100) + "%" }} /></div>)}</div>
          <div className="p-sub" style={{ marginTop: 6 }}>Barres bleues = maths/mixte · rouges = physique. But du jeu : la courbe qui monte.</div>
        </div>
      )}
    </>
  );
}

function Running({ e }) {
  const { examSubmit, endExam } = useGame();
  const total = e.list.reduce((s, x) => s + x.pts, 0);
  return (
    <>
      <ExamTimer endsAt={e.endsAt} onExpire={examSubmit} />
      <div className="p-sub" style={{ marginTop: 10 }}>{e.list.length} exercices · {total} points au total · rédige sur ta copie, numérote bien.</div>
      {e.list.map(x => (
        <div key={x.n} className="exq"><div className="exq-h"><span>Exercice {x.n} · {x.sub}</span><span className="pts">/{x.pts}</span></div><div className="exq-q">{x.q}</div></div>
      ))}
      <button className="p-btn ink" style={{ marginTop: 16 }} onClick={() => { if (confirm("Rendre la copie et voir la correction ?")) examSubmit(); }}>✅ Rendre la copie &amp; voir la correction</button>
      <button className="p-btn" style={{ marginTop: 8, background: "#f0f0f0", color: "var(--pencil)" }} onClick={() => { if (confirm("Abandonner ce contrôle ? Il ne sera pas enregistré.")) endExam(); }}>Abandonner</button>
    </>
  );
}

function Review({ e }) {
  const { examSetGrade, examSave, endExam } = useGame();
  const total = e.list.reduce((s, x) => s + x.pts, 0), got = e.list.reduce((s, x, i) => s + (e.grades[i] || 0), 0);
  const score = Math.round(got / total * 200) / 10;
  return (
    <>
      <div className="p-h">Correction</div>
      <div className="p-card ink ex-score"><div className="es-big">{frn(score)}<span style={{ fontSize: 22, color: "var(--pencil)" }}>/20</span></div><div className="es-sub">{got}/{total} points{e.saved ? " · enregistré ✓" : ""}</div></div>
      {e.list.map((x, i) => { const c = e.grades[i] || 0;
        return (
          <div key={i} className="exq">
            <div className="exq-h"><span>Exercice {x.n} · {x.sub}</span><span className="pts">/{x.pts}</span></div>
            <div className="exq-q">{x.q}</div>
            <div className="exq-sol"><b>Correction.</b>{"\n" + x.sol}</div>
            {e.saved
              ? <div className="exq-grade"><span className="g-lab">Note : <b>{c}/{x.pts}</b></span></div>
              : <div className="exq-grade"><span className="g-lab">Tes points :</span><div className="g-pts">{Array.from({ length: x.pts + 1 }, (_, p) => <button key={p} className={c === p ? "sel" : ""} onClick={() => examSetGrade(i, p)}>{p}</button>)}</div></div>}
          </div>
        ); })}
      {e.saved
        ? <button className="p-btn green" style={{ marginTop: 14 }} onClick={endExam}>↻ Nouveau contrôle</button>
        : <><div className="p-sub" style={{ margin: "12px 0 4px" }}>Corrige-toi honnêtement, attribue tes points exercice par exercice, puis valide.</div><button className="p-btn red" style={{ marginTop: 6 }} onClick={examSave}>💾 Valider ma note ({frn(score)}/20)</button></>}
    </>
  );
}

export default function Exam() {
  const { ui } = useGame(); const e = ui.exam;
  if (!e) return <Setup />;
  if (!e.submitted) return <Running e={e} />;
  return <Review e={e} />;
}
