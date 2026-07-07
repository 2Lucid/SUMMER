import { useState } from "react";
import { useGame } from "../../game.jsx";
import { frn, fmtDate } from "../../lib/util.js";

const APP_URL = "https://mental-math.codeberg.page/app";

export default function Mental() {
  const { S, addMental, removeMental } = useGame();
  const [txt, setTxt] = useState("");
  const list = (S.mental || []).slice().sort((a, b) => a.ts - b.ts);

  const scores = list.map(e => e.score);
  const best = scores.length ? Math.min(...scores) : null;         // temps → plus bas = mieux
  const worst = scores.length ? Math.max(...scores) : null;
  const last = list.length ? list[list.length - 1] : null;
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const last12 = list.slice(-12);

  const submit = () => { const r = addMental(txt); if (r && r.ok) setTxt(""); };

  return (
    <>
      <div className="p-h">Calcul mental</div>
      <div className="p-sub">Tu joues sur <b>Mental Math</b>, tu copies le message de partage (« Try to beat my score of… »), tu le colles ici : je note ton score et je trace ta progression. <b className="p-red">+15 XP</b> par partie.</div>

      <a className="p-btn red" style={{ display: "block", textAlign: "center", textDecoration: "none", marginTop: 12, fontSize: 16 }} href={APP_URL} target="_blank" rel="noreferrer">🧮 Ouvrir Mental Math →</a>

      <div className="p-card ink" style={{ marginTop: 12 }}>
        <div className="p-card-title" style={{ marginBottom: 6 }}>Coller le message de partage</div>
        <textarea className="mm-paste" value={txt} onChange={e => setTxt(e.target.value)} rows={4}
          placeholder={"Try to beat my score of 34.47 in Mental Math.\nReplay my game with seed 1761103885829160799:\nhttps://mental-math.codeberg.page/app?s=…"} />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="p-btn ink" style={{ flex: 1 }} onClick={submit}>➕ Enregistrer ma partie</button>
          {txt && <button className="p-btn" style={{ background: "#eee", color: "var(--pencil)", width: "auto", padding: "12px 14px" }} onClick={() => setTxt("")}>Vider</button>}
        </div>
        <div className="p-sub" style={{ marginTop: 8, fontSize: 12 }}>Astuce : sur ton tel, colle directement (appui long → Coller). Je repère le score, la seed et le lien tout seul. Une même partie (seed) n'est comptée qu'une fois.</div>
      </div>

      {list.length > 0 ? (
        <>
          <div className="mm-stats">
            <div className="mm-stat"><div className="v" style={{ color: "var(--bic)" }}>{frn(best)}</div><div className="l">meilleur</div><div className="s">plus bas = mieux</div></div>
            <div className="mm-stat"><div className="v">{last ? frn(last.score) : "—"}</div><div className="l">dernier</div><div className="s">{list.length} partie(s)</div></div>
            <div className="mm-stat"><div className="v">{avg != null ? frn(Math.round(avg * 100) / 100) : "—"}</div><div className="l">moyenne</div></div>
            <div className="mm-stat"><div className="v">{scores.length >= 2 ? (last.score <= best ? "🔥" : "💪") : "🎯"}</div><div className="l">forme</div><div className="s">{scores.length >= 2 ? frn(Math.round((worst - best) * 100) / 100) + " d'écart" : "à suivre"}</div></div>
          </div>

          <div className="p-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span className="p-card-title">Évolution</span><span className="p-sub">12 dernières · une barre plus basse = plus rapide</span></div>
            <div className="mm-evo">
              {last12.map(e => { const isBest = e.score === best;
                const h = worst > 0 ? Math.max(8, e.score / worst * 100) : 50;
                return (
                  <div key={e.id} className={"mm-eb" + (isBest ? " best" : "")} title={fmtDate(e.ts) + " · " + frn(e.score)}>
                    <div className="mm-ev">{frn(e.score)}</div>
                    <div className="mm-bar" style={{ height: h + "%" }} />
                    {isBest && <div className="mm-crown">👑</div>}
                    <div className="mm-day">{new Date(e.ts).getDate()}/{new Date(e.ts).getMonth() + 1}</div>
                  </div>
                ); })}
            </div>
          </div>

          <div className="p-card">
            <div className="p-card-title" style={{ marginBottom: 4 }}>Historique</div>
            {list.slice().reverse().map(e => (
              <div key={e.id} className="mm-row">
                <span className={"mm-score" + (e.score === best ? " best" : "")}>{frn(e.score)}</span>
                <span className="mm-meta">{fmtDate(e.ts)}{e.seed ? " · seed " + e.seed.slice(-6) : ""}</span>
                {e.url && <a className="mm-replay" href={e.url} target="_blank" rel="noreferrer" title="Rejouer cette partie">↻</a>}
                <button className="mm-del" onClick={() => removeMental(e.id)} title="Retirer">✕</button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="p-card" style={{ marginTop: 14, textAlign: "center", color: "var(--pencil)" }}>
          Aucune partie enregistrée. Joue une manche, copie le message de partage, colle-le ci-dessus. 🧮
        </div>
      )}
    </>
  );
}
