import { useState } from "react";
import { useGame } from "../../game.jsx";
import { frn, fmtDate } from "../../lib/util.js";

const APP_URL = "https://mental-math.codeberg.page/app";
const parseTime = s => { const m = String(s).match(/(\d+)\s*:\s*(\d+)/); if (m) return +m[1] * 60 + +m[2]; const n = parseFloat(String(s).replace(",", ".")); return isNaN(n) ? null : n; };
const fmtT = sec => sec == null ? "—" : Math.floor(sec / 60) + ":" + String(Math.round(sec % 60)).padStart(2, "0");
const accOf = e => (e.correct != null && e.wrong != null && (e.correct + e.wrong) > 0) ? Math.round(e.correct / (e.correct + e.wrong) * 1000) / 10 : null;

export default function Mental() {
  const { S, parseMental, addMental, removeMental, setMentalHigh } = useGame();
  const high = S.mentalHigh !== false;
  const [f, setF] = useState({ txt: "", score: "", correct: "", wrong: "", time: "", ops: "", seed: null, url: null });
  const up = p => setF(c => ({ ...c, ...p }));

  // colle → remplit score / seed / lien automatiquement
  const onPaste = txt => { const p = parseMental(txt); up({ txt, ...(p.score > 0 ? { score: String(p.score) } : {}), seed: p.seed, url: p.url }); };

  const submit = () => { const r = addMental({ score: f.score, correct: f.correct, wrong: f.wrong, timeSec: parseTime(f.time), ops: f.ops, seed: f.seed, url: f.url });
    if (r && r.ok) setF({ txt: "", score: "", correct: "", wrong: "", time: "", ops: "", seed: null, url: null }); };

  const list = (S.mental || []).slice().sort((a, b) => a.ts - b.ts);
  const scores = list.map(e => e.score);
  const best = scores.length ? (high ? Math.max(...scores) : Math.min(...scores)) : null;
  const last = list.length ? list[list.length - 1] : null;
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 100) / 100 : null;
  const accs = list.map(accOf).filter(x => x != null); const bestAcc = accs.length ? Math.max(...accs) : null;
  const lo = scores.length ? Math.min(...scores) : 0, hi = scores.length ? Math.max(...scores) : 1;
  const last12 = list.slice(-12);
  const norm = s => { if (hi === lo) return 60; const t = high ? (s - lo) / (hi - lo) : (hi - s) / (hi - lo); return 12 + t * 88; };  // « meilleur » toujours plus haut

  return (
    <>
      <div className="p-h">Calcul mental</div>
      <div className="p-sub">Tu joues sur <b>Mental Math</b>. Le partage ne donne que le score — les détails (✓ ✗ temps) sont sur la carte, saisis-les en 5 s. <b className="p-red">+15 XP</b> / partie.</div>

      <a className="p-btn red" style={{ display: "block", textAlign: "center", textDecoration: "none", marginTop: 12, fontSize: 16 }} href={APP_URL} target="_blank" rel="noreferrer">🧮 Ouvrir Mental Math →</a>

      <div className="p-card ink" style={{ marginTop: 12 }}>
        <div className="p-card-title" style={{ marginBottom: 6 }}>1 · Colle le message de partage</div>
        <textarea className="mm-paste" value={f.txt} onChange={e => onPaste(e.target.value)} rows={3}
          placeholder={"Try to beat my score of 34.47 in Mental Math.\nReplay my game with seed …:  https://…"} />
        {f.seed && <div className="mm-ok">✓ Score, seed{f.url ? " et lien" : ""} détectés</div>}

        <div className="p-card-title" style={{ margin: "12px 0 6px" }}>2 · Recopie la carte</div>
        <div className="mm-form">
          <label>⭐ Score<input inputMode="decimal" value={f.score} onChange={e => up({ score: e.target.value })} placeholder="34.47" /></label>
          <label>✓ Justes<input inputMode="numeric" value={f.correct} onChange={e => up({ correct: e.target.value })} placeholder="18" /></label>
          <label>✗ Ratés<input inputMode="numeric" value={f.wrong} onChange={e => up({ wrong: e.target.value })} placeholder="2" /></label>
          <label>⏱ Temps<input value={f.time} onChange={e => up({ time: e.target.value })} placeholder="4:42" /></label>
          <label className="wide">Opérations (option)<input value={f.ops} onChange={e => up({ ops: e.target.value })} placeholder="# 20 · + 2-4" /></label>
        </div>
        <button className="p-btn ink" style={{ marginTop: 10, width: "100%" }} onClick={submit}>➕ Enregistrer ma partie</button>
        <div className="p-sub" style={{ marginTop: 8, fontSize: 12 }}>Seul le score est obligatoire. Une même partie (seed) n'est comptée qu'une fois.</div>
      </div>

      {list.length > 0 ? (
        <>
          <div className="mm-dir">
            <span>Meilleur score =</span>
            <button className={high ? "on" : ""} onClick={() => setMentalHigh(true)}>plus haut ▲</button>
            <button className={!high ? "on" : ""} onClick={() => setMentalHigh(false)}>plus bas ▼</button>
          </div>

          <div className="mm-stats">
            <div className="mm-stat"><div className="v" style={{ color: "var(--green)" }}>{frn(best)}</div><div className="l">record ⭐</div></div>
            <div className="mm-stat"><div className="v">{last ? frn(last.score) : "—"}</div><div className="l">dernier</div><div className="s">{list.length} partie(s)</div></div>
            <div className="mm-stat"><div className="v">{avg != null ? frn(avg) : "—"}</div><div className="l">moyenne</div></div>
            <div className="mm-stat"><div className="v">{bestAcc != null ? frn(bestAcc) + "%" : "—"}</div><div className="l">précision max</div></div>
          </div>

          <div className="p-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span className="p-card-title">Évolution</span><span className="p-sub">12 dernières · barre haute = meilleur</span></div>
            <div className="mm-evo">
              {last12.map(e => { const isBest = e.score === best; const a = accOf(e);
                return (
                  <div key={e.id} className={"mm-eb" + (isBest ? " best" : "")} title={fmtDate(e.ts) + " · ⭐" + frn(e.score) + (a != null ? " · " + frn(a) + "%" : "") + (e.timeSec != null ? " · " + fmtT(e.timeSec) : "")}>
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
                <span className="mm-meta">{fmtDate(e.ts)}{a != null ? " · " + frn(a) + "%" : ""}{e.timeSec != null ? " · " + fmtT(e.timeSec) : ""}{e.correct != null ? " · " + e.correct + "✓" + (e.wrong != null ? "/" + e.wrong + "✗" : "") : ""}</span>
                {e.url && <a className="mm-replay" href={e.url} target="_blank" rel="noreferrer" title="Rejouer">↻</a>}
                <button className="mm-del" onClick={() => removeMental(e.id)} title="Retirer">✕</button>
              </div>
            ); })}
          </div>
        </>
      ) : (
        <div className="p-card" style={{ marginTop: 14, textAlign: "center", color: "var(--pencil)" }}>
          Aucune partie. Joue une manche, colle le partage, recopie la carte. 🧮
        </div>
      )}
    </>
  );
}
