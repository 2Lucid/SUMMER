import { useState } from "react";
import { useGame } from "../game.jsx";
import { todayKey, fmtDate } from "../lib/util.js";
import * as SP from "../lib/sport.js";

/* Monde SPORT (profil Lucas) — même ossature visuelle que le Cœur :
 * mise du jour (le contrat 100/100), niveau + streak, jauge hebdo (3 séances),
 * records perso, pesées, journal. Le canal XP est S.xp (voir lib/sport.js). */
export default function Sport() {
  const { S, sportAct, sportWeigh, sportSetPR, undoLast, undoTop, deleteLog } = useGame();
  const [kg, setKg] = useState("");
  const [pr, setPr] = useState({});

  const tk = todayKey();
  const lvl = SP.levelIndex(S.xp), cur = SP.LEVELS[lvl], next = SP.LEVELS[lvl + 1] || null;
  const pct = next ? Math.min(100, Math.round((S.xp - cur.xp) / (next.xp - cur.xp) * 100)) : 100;
  const done = SP.dailyDone(S, tk);
  const n7 = SP.sessions7(S); const tank = Math.min(100, Math.round(n7 / SP.WEEK_GOAL * 100));
  const m = SP.sportMission(S); const tip = SP.tipOfDay(tk);
  const log = SP.sportLog(S);
  const nSalle = SP.countType(S, "salle"), nNat = SP.countType(S, "natation"), nDaily = SP.countType(S, "daily");
  const trend = SP.weightTrend(S); const ws = SP.weights(S);

  const saveKg = () => { if (!kg) return; sportWeigh(kg); setKg(""); };

  return (
    <div className="coeur-world">
      <div className="coeur-fire" aria-hidden="true" />
      <div className="coeur-embers" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <div className="coeur-banner"><span className="cb-flame">💪</span> Zone de fonte — chaque rep <b>construit la machine</b>. <span className="cb-flame">💪</span></div>
      <div className="grid2">
        <div>
          <div className={"stake" + (done ? " done" : "")}>
            <div className="st-top"><span className="st-emoji">{done ? "✅" : "💪"}</span><span className="st-ttl">Le contrat du jour</span></div>
            <div className="st-mis">{done ? "100 pompes + 100 squats : FAIT. La machine a tourné aujourd'hui." : "100 pompes + 100 squats — où que tu sois, en séries si tu veux (4×25 ok)."}</div>
            <div className="st-warn">{done ? "👑 XP sécurisé pour aujourd'hui — on remet ça demain." : "⚠️ Zéro sport aujourd'hui = −" + SP.SPORT_STAKE + " XP demain + streak à zéro. Le contrat, c'est tous les jours."}</div>
            {!done && <div className="st-row"><button className="btn small" onClick={() => sportAct("daily")}>💪 J'ai fait mes 100/100 (+{SP.ACTIONS.daily.xp} XP)</button></div>}
          </div>

          <div className="charsheet">
            <div className="lvl-row">
              <div className="lvl-badge">{lvl + 1}</div>
              <div className="lvl-info"><div className="lvl-eyebrow">Niveau {lvl + 1}</div><div className="lvl-title">{cur.t}</div></div>
              <div className="streak"><div className="flame">🔥</div><div className="n">{S.streak}</div><div className="lbl">jours de suite</div></div>
            </div>
            <div className="xpbar-wrap"><div className="xpbar"><i style={{ width: pct + "%" }} /></div>
              <div className="xpmeta"><span><b>{S.xp} XP</b></span><span>{next ? next.xp + " XP → " + next.t : "Niveau max. Machine absolue."}</span></div>
            </div>
            <div className="statsrow">
              <div className="stat"><div className="v">{nDaily}</div><div className="k">contrats 100/100</div></div>
              <div className="stat"><div className="v">{nSalle}</div><div className="k">salle</div></div>
              <div className="stat"><div className="v">{nNat}</div><div className="k">natation</div></div>
              <div className="stat"><div className="v">{S.best}</div><div className="k">record streak</div></div>
            </div>
          </div>

          <div className="card mission"><h2>{m.e} Mission du moment</h2>
            <p>{m.txt}</p>
            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              <button className="btn small" onClick={() => sportAct("salle")}>🏋️ Séance salle (+{SP.ACTIONS.salle.xp})</button>
              <button className="btn small ghost" onClick={() => sportAct("natation")}>🏊 Natation (+{SP.ACTIONS.natation.xp})</button>
              <button className="btn small ghost" onClick={() => sportAct("autre")}>🏃 Autre sport (+{SP.ACTIONS.autre.xp})</button>
            </div>
          </div>

          <div className="card"><h2>🏋️ Objectif hebdo<span className="sub">{n7}/{SP.WEEK_GOAL} séances sur 7 jours</span></h2>
            <div className="hpbar love" style={{ marginTop: 6 }}><i style={{ width: tank + "%" }} /></div>
            <div className="hpmeta"><span>Salle / natation — c'est là que la masse se construit</span><span>{tank}%</span></div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 10 }}>{n7 >= SP.WEEK_GOAL ? "✅ Semaine validée — chaque séance en plus, c'est du bonus." : "La " + SP.WEEK_GOAL + "e séance de la semaine déclenche +" + SP.WEEK_BONUS + " XP. L'aprem est libre — utilise-la."}</div>
          </div>

          <div className="card rules"><h2>⚖️ Règles d'or</h2>
            <ol><li><b>Le contrat 100/100 est quotidien.</b> Pas de jour off, pas de négociation — les séries peuvent se répartir dans la journée.</li><li><b>La masse se construit à la salle, dans l'assiette et au lit.</b> ~2 g de protéines/kg, dormir = muscu invisible.</li><li><b>Progressive overload.</b> +1 rep ou +1 kg à chaque séance. Note tes records.</li></ol>
          </div>
        </div>

        <div>
          <div className="card mission"><h2>💡 Conseil masse du jour</h2><p>{tip}</p></div>

          <div className="card"><h2>🏆 Records perso<span className="sub">bats-les, note-les</span></h2>
            {SP.PR_DEFS.map(d => { const rec = SP.prOf(S, d.id);
              return (
                <div key={d.id} className="logline" style={{ alignItems: "center" }}>
                  <span className="lxp" style={{ color: "var(--gold)" }}>{rec ? rec.v : "—"}</span>
                  <span className="ltxt">{d.emoji} {d.label}{rec && <span style={{ color: "var(--muted)" }}> · le {rec.dk.slice(8)}/{rec.dk.slice(5, 7)}</span>}</span>
                  <input style={{ width: 64 }} inputMode="numeric" placeholder={rec ? String(rec.v + 1) : "reps"} value={pr[d.id] || ""} onChange={e => setPr(p => ({ ...p, [d.id]: e.target.value }))}
                    onKeyDown={e => { if (e.key === "Enter" && pr[d.id]) { sportSetPR(d.id, pr[d.id]); setPr(p => ({ ...p, [d.id]: "" })); } }} />
                  <button className="btn small ghost" onClick={() => { if (pr[d.id]) { sportSetPR(d.id, pr[d.id]); setPr(p => ({ ...p, [d.id]: "" })); } }}>OK</button>
                </div>
              ); })}
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 8 }}>Max en UNE série, propre. Un record battu = confetti mérité.</div>
          </div>

          <div className="card"><h2>⚖️ Pesée<span className="sub">prise de masse — 1×/semaine</span></h2>
            {trend
              ? <div style={{ fontSize: 14, marginBottom: 10 }}>{trend.from} kg → <b>{trend.to} kg</b> <span style={{ color: trend.delta >= 0 ? "var(--cyan)" : "var(--orange)" }}>({trend.delta >= 0 ? "+" : ""}{trend.delta} kg)</span> {trend.delta > 0 ? "📈 La masse monte." : "— mange plus, la masse viendra."}</div>
              : <div className="empty">Toujours le matin, à jeun, même jour de la semaine. Première pesée = point de départ.</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ width: 90 }} inputMode="decimal" placeholder="72.5" value={kg} onChange={e => setKg(e.target.value)} onKeyDown={e => { if (e.key === "Enter") saveKg(); }} />
              <button className="btn small" onClick={saveKg}>⚖️ Noter (+{SP.ACTIONS.pesee.xp} XP)</button>
            </div>
            {ws.length > 1 && <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>{ws.slice(-8).map(w => <span key={w.dk} className="qchip">{w.dk.slice(8)}/{w.dk.slice(5, 7)} · {w.kg} kg</span>)}</div>}
            {!SP.weighedThisWeek(S) && ws.length > 0 && <div style={{ fontSize: 12, color: "var(--orange)", marginTop: 8 }}>⏰ Pas encore pesé cette semaine.</div>}
          </div>

          <div className="card"><h2>📜 Journal d'entraînement</h2>
            {log.length === 0 ? <div className="empty">Ta transformation s'écrit ici. Premier 100/100 = premières lignes.</div>
              : log.slice(-10).reverse().map(e => { const a = SP.ACTIONS[e.type];
                return <div key={e.id} className="logline"><span className="lxp">+{e.xp} XP</span><span className="ltxt">{a.emoji} {a.label}</span><span className="ldate">{fmtDate(e.ts)}</span><button className="log-del" title="Retirer cette séance" onClick={() => deleteLog(e.id)}>✕</button></div>; })}
            {undoTop && <button className="cpl-undo" onClick={undoLast}>↩️ Oups, annuler « {undoTop} »</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
