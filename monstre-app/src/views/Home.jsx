import { useState, useEffect } from "react";
import { useGame } from "../game.jsx";
import Radar from "../components/Radar.jsx";
import { todayKey, addDays, daysTo, frDate, fromDk, MO } from "../lib/util.js";
import { RENTREE, phaseOf, PHASE_META, rampOf, DEADLINES, checklistPct, studyStreak, sleepOkOf } from "../lib/config.js";
import { FLASH, rankOf } from "../lib/flash.js";
import { LEVELS, levelIndex, mission, fearEntries } from "../lib/coeur.js";
import { deposits7, WEEK_GOAL, coupleMicroOfDay, lovemapOfDay } from "../lib/couple.js";

const COEUR_TYPES = [["message", "📨 Messages"], ["convo", "💬 Relances"], ["proposer", "🎯 Propositions"], ["date", "🏖️ Dates"], ["couple", "💘 Couple"], ["rateau", "🥀 Râteaux"], ["irl", "⚡ Courage IRL"]];
const COEUR_COLS = { message: "var(--cyan)", convo: "var(--cyan)", proposer: "var(--orange)", date: "var(--gold)", couple: "var(--pink)", rateau: "var(--red)", irl: "var(--cyan)" };

export default function Home() {
  const { S, goto, setWorld, doWipe, setCouple } = useGame();
  const [askCouple, setAskCouple] = useState(false);
  useEffect(() => {
    if (S.couple != null) { setAskCouple(false); return; }
    const t = setTimeout(() => setAskCouple(true), 1600);  // laisse d'abord admirer la page
    return () => clearTimeout(t);
  }, [S.couple]);
  const tk = todayKey(); const ph = PHASE_META[phaseOf(tk)]; const r = rampOf(tk);
  const pct = checklistPct(S, tk);
  const due = FLASH.filter(c => { const s = S.flash[c.id]; return !s || s.due <= tk; }).length;
  const next3 = DEADLINES.filter(d => d.dk >= tk).slice(0, 3); const nextDl = next3[0];
  const m = mission(S); const lvl = levelIndex(S.xp); const rank = rankOf(S.skills.xp || 0);
  const fe = fearEntries(S); const a1 = fe.length ? fe.slice(-3).reduce((s, e) => s + e.fear, 0) / Math.min(3, fe.length) : null;
  const hp = a1 == null ? 100 : Math.round(a1 * 10);
  const dLeft = Math.max(0, daysTo(tk, RENTREE));
  const isCouple = S.couple === true;
  const dep = deposits7(S); const tank = Math.min(100, Math.round(dep / WEEK_GOAL * 100));
  const coupleDone = (S.coeurDaily[tk] || 0) > 0; const coupleMicro = coupleMicroOfDay(tk);

  const boxes = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  FLASH.forEach(c => { const s = S.flash[c.id]; if (!s) boxes[0]++; else boxes[s.box || 1]++; });
  const total = FLASH.length;
  const leit = [["Nouvelles", boxes[0], "rgba(156,144,198,.9)"], ["Boîte 1 · 1 j", boxes[1], "var(--red)"], ["Boîte 2 · 3 j", boxes[2], "var(--orange)"], ["Boîte 3 · 7 j", boxes[3], "var(--cyan)"], ["Boîte 4 · 14 j", boxes[4], "var(--gold)"]];

  const last14 = []; for (let i = 13; i >= 0; i--) { const dk = addDays(tk, -i); last14.push({ dk, pct: dk < "2026-07-06" ? null : checklistPct(S, dk) }); }
  const d0 = fromDk(last14[0].dk);

  const funnel = COEUR_TYPES.map(t => S.log.filter(e => e.type === t[0]).length); const fmax = Math.max(1, ...funnel);

  const KPI = ({ cls, v, l, s }) => <div className={"kpi " + cls}><div className="kv">{v}</div><div className="kl">{l}</div>{s && <div className="ks">{s}</div>}</div>;

  return (
    <>
      <div className="charsheet" style={{ background: "linear-gradient(160deg,rgba(255,61,139,.16),rgba(38,71,208,.14))" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "var(--disp)", fontWeight: 900, fontSize: 16 }}>{frDate(tk)}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>{ph.desc} · cible <b style={{ color: "var(--ink)" }}>{r.wake}</b> → <b style={{ color: "var(--ink)" }}>{r.bed}</b></div>
          </div>
          <span className="phasechip" style={{ background: ph.color }}>{ph.label}</span>
        </div>
      </div>

      <div className="kpis">
        <KPI cls="gold" v={"J−" + dLeft} l="avant la rentrée" s={nextDl ? "⏳ " + nextDl.icon + " J−" + daysTo(tk, nextDl.dk) : "🎒 c'est parti"} />
        <KPI cls="cyan" v={studyStreak(S) + " 🔥"} l="streak prépa" s={pct + "% du jour fait"} />
        <KPI cls="pink" v={S.streak + " 🔥"} l="streak cœur" s={"record " + S.best} />
        <KPI cls="orange" v={S.xp + (S.skills.xp || 0)} l="XP cumulé" s={"📓 " + (S.skills.xp || 0) + " · ❤️ " + S.xp} />
      </div>

      <div className="coeur-row">
        <div className="coeur-hero">
          <div className="ch-glow" />
          <div className="ch-head">
            <div className="ch-badge">
              <span className="ch-heart">{isCouple ? "💞" : "❤️"}</span>
              <span className="ch-lvl">Niv. {lvl + 1}</span>
            </div>
            <div className="ch-title">
              <h2>{isCouple ? "Notre couple" : "Arbre cœur"}</h2>
              <div className="ch-sub">{isCouple ? "Mode couple" : LEVELS[lvl].t}</div>
              <div className="ch-streak">🔥 {S.streak} j de streak · record {S.best}</div>
            </div>
            <button className="btn ch-cta" onClick={() => setWorld("coeur")}>Ouvrir le Cœur →</button>
          </div>
          {isCouple ? (
            <>
              <div className="ch-geste">
                <span className="ch-geste-l">💞 Geste du jour</span>
                <span className="ch-geste-t">{coupleDone ? "✅ Fait — dépôt affectif sécurisé aujourd'hui." : coupleMicro}</span>
              </div>
              <div className="hpbar love" style={{ marginTop: 12 }}><i style={{ width: tank + "%" }} /></div>
              <div className="hpmeta"><span>🏦 Compte affectif ({dep}/{WEEK_GOAL} cette semaine)</span><span>{tank}%</span></div>
            </>
          ) : (
            <>
              <div className="ch-funnel">
                {COEUR_TYPES.map((t, i) => (
                  <div key={t[0]} className="lrow"><span className="ln" style={{ width: 112 }}>{t[1]}</span><div className="lbar"><i style={{ width: Math.round(funnel[i] / fmax * 100) + "%", background: COEUR_COLS[t[0]] }} /></div><span className="lc">{funnel[i]}</span></div>
                ))}
              </div>
              <div className="hpbar" style={{ marginTop: 4 }}><i style={{ width: hp + "%" }} /></div>
              <div className="hpmeta"><span>PV du boss (= flippe récente)</span><span>{hp}/100</span></div>
            </>
          )}
        </div>

        <div className="card ch-activity">
          <h2>📈 Activité prépa<span className="sub">14 derniers jours</span></h2>
          <div className="mini-bars">
            {last14.map((d, i) => { const p = d.pct == null ? 0 : d.pct; const col = d.pct == null ? "rgba(255,255,255,.07)" : (p >= 60 ? "var(--cyan)" : p > 0 ? "var(--orange)" : "rgba(255,255,255,.16)");
              return <div key={i} className="mb" title={d.dk + " · " + (d.pct == null ? "—" : p + "%")} style={{ height: Math.max(5, p) + "%", background: col }} />; })}
          </div>
          <div className="axis"><span>{d0.getDate()} {MO[d0.getMonth()]}</span><span>aujourd'hui</span></div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 8 }}>Barre cyan = journée validée (≥ 60% de la checklist).</div>
        </div>
      </div>

      <div className="grid2">
        <div>
          <div className="card">
            <h2>⭐ Étoile de compétences<span className="sub">{rank.name}</span></h2>
            <Radar S={S} />
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              <button className="btn small" onClick={() => goto("drill")}>⚡ Drill</button>
              <button className="btn small ghost" onClick={() => goto("exam")}>📝 Contrôle</button>
              <button className="btn small ghost" onClick={() => goto("brain")}>🧠 Cerveau</button>
              <button className="btn small ghost" onClick={() => goto("planning")}>🗓️ Planning</button>
            </div>
          </div>

          <div className="card">
            <h2>🧠 Mémoire · Leitner<span className="sub">{due} carte(s) dues</span></h2>
            {leit.map(row => (
              <div key={row[0]} className="lrow"><span className="ln">{row[0]}</span><div className="lbar"><i style={{ width: Math.round(row[1] / total * 100) + "%", background: row[2] }} /></div><span className="lc">{row[1]}</span></div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}><button className="btn small ghost" onClick={() => goto("flash")}>Réviser maintenant</button></div>
          </div>
        </div>

        <div>
          <div className="card mission">
            {isCouple ? (
              <>
                <h2>🗺️ Question du jour</h2>
                <p>« {lovemapOfDay(tk)} »</p>
                <div className="row"><button className="btn small" onClick={() => setWorld("coeur")}>Ouvrir →</button></div>
              </>
            ) : (
              <>
                <h2>{m.e} Mission cœur du jour</h2>
                <p>{m.parts.map((p, i) => p.b ? <b key={i}>{p.b}</b> : <span key={i}>{p.t}</span>)}</p>
                <div className="row"><button className="btn small" onClick={() => setWorld("coeur")}>Go →</button></div>
              </>
            )}
          </div>

          <div className="card">
            <h2>🌙 Sommeil<span className="sub">cible {r.bed} → {r.wake}</span></h2>
            <div className="dotrow">
              {(() => { const out = []; for (let i = 13; i >= 0; i--) { const dk = addDays(tk, -i); if (dk < "2026-07-06") { out.push(<div key={i} className="dot">·</div>); continue; } const ok = sleepOkOf(S, dk); out.push(<div key={i} className={"dot " + (ok == null ? "" : ok ? "ok" : "ko")} title={dk}>{ok == null ? "·" : ok ? "✓" : "✗"}</div>); } return out; })()}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 8 }}>✓ = coucher et réveil dans la cible (±30 min).</div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}><button className="btn small ghost" onClick={() => goto("sleep")}>Loguer ma nuit</button></div>
          </div>

          {next3.length > 0 && (
            <div className="card"><h2>⏳ À rendre</h2>
              {next3.map(d => <div key={d.dk} className="logline"><span className="lxp" style={{ color: "var(--gold)" }}>J−{daysTo(tk, d.dk)}</span><span className="ltxt">{d.icon} {d.label}</span></div>)}
            </div>
          )}
        </div>
      </div>

      <div className="footer" style={{ marginTop: 26, textAlign: "center", fontSize: 12, color: "var(--muted)" }}>
        MONSTRE · un seul joueur 🎮 · <button onClick={doWipe} style={{ background: "none", border: "none", color: "var(--muted)", textDecoration: "underline", cursor: "pointer", fontSize: 12, fontFamily: "var(--body)" }}>réinitialiser</button>
      </div>

      {askCouple && (
        <div className="overlay couple-overlay">
          <div className="sheet couple-ask">
            <div className="ca-emoji">💘</div>
            <h3>Une dernière chose…</h3>
            <p className="ca-sub">Es-tu <b>en couple</b> en ce moment ? Ça adapte ton monde Cœur — aucun jugement, tu pourras changer d'avis plus tard.</p>
            <div className="ca-btns">
              <button className="btn ca-yes" onClick={() => { setCouple(true); setAskCouple(false); }}>💞 Oui, en couple</button>
              <button className="btn ghost ca-no" onClick={() => { setCouple(false); setAskCouple(false); }}>🔥 Non, célibataire</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
