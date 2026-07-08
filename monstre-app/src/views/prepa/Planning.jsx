import { useGame } from "../../game.jsx";
import { todayKey, addDays, fromDk, frDate, WD, MO } from "../../lib/util.js";
import { phaseOf, phaseMeta, rampOf, buildDayPlan, bookOf, deadlines, overview, DEADLINE_XP } from "../../lib/config.js";

function Overview() {
  const { S, markDeadline } = useGame();
  const done = S.deadlinesDone || {};
  const OV = overview();
  return (
    <div style={{ marginTop: 6 }}>
      {OV.phases.map(([d, n, t, col]) => (
        <div key={n} className="p-card" style={{ borderLeft: "4px solid " + col }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ fontWeight: 800, color: col }}>{n}</span><span style={{ fontSize: 12, fontWeight: 600, color: "var(--pencil)" }}>{d}</span></div>
          <div style={{ fontSize: 14, marginTop: 2, lineHeight: 1.35 }}>{t}</div>
        </div>
      ))}
      <div className="p-card"><div className="p-card-title" style={{ marginBottom: 6 }}>Devoirs à rendre <span className="pen p-red" style={{ fontSize: 16 }}>— coche = +{DEADLINE_XP} XP</span></div>
        {deadlines().map(d => { const dn = !!done[d.dk]; return (
          <button key={d.dk} className={"p-item" + (dn ? " done" : "")} onClick={() => markDeadline(d.dk)}>
            <span className={"p-check" + (dn ? " on" : "")}>{dn ? "✓" : ""}</span>
            <span className="lab">{d.icon} {d.label} <b style={{ color: "var(--penred)" }}>· {fromDk(d.dk).getDate()} {MO[fromDk(d.dk).getMonth()]}{dn ? " · rendu ✓" : ""}</b></span>
          </button>); })}
      </div>
      <div className="p-card"><div className="p-card-title" style={{ marginBottom: 6 }}>{OV.readingTitle}</div>
        {OV.reading.map(([d, b, t]) => <div key={b} style={{ padding: "7px 0", borderBottom: "1px solid var(--pline)" }}><div style={{ display: "flex", justifyContent: "space-between" }}><b>{b}</b><span style={{ fontSize: 12, fontWeight: 600, color: "var(--pencil)" }}>{d}</span></div><div style={{ fontSize: 12, color: "var(--pencil)" }}>{t}</div></div>)}
        <div style={{ fontSize: 12, marginTop: 8, color: "var(--pencil)" }}>{OV.readingNote}</div>
      </div>
      <div className="p-card hi"><div className="p-card-title" style={{ marginBottom: 4 }}>Règles d'or</div>
        {OV.rules.map((r, i) => <div key={i} style={{ fontSize: 14, padding: "2px 0" }}>— {r}</div>)}
      </div>
    </div>
  );
}

export default function Planning() {
  const { ui, patch, genPrepaPlan } = useGame();
  const tk = todayKey(); const sel = (ui.planDay && ui.planDay >= tk) ? ui.planDay : tk;
  const ph = phaseMeta()[phaseOf(sel)], r = rampOf(sel), plan = buildDayPlan(sel);
  const dueThatDay = deadlines().filter(d => d.dk === sel);

  return (
    <>
      <div className="p-h">Planning</div>
      <div className="p-sub">Choisis un jour : voici ta journée type, heure par heure.</div>
      <div className="plan-strip">
        {Array.from({ length: 14 }, (_, i) => { const dk = addDays(tk, i); const d = fromDk(dk); const p = phaseMeta()[phaseOf(dk)];
          return (
            <button key={dk} className={"plan-day" + (dk === sel ? " on" : "") + (dk === tk ? " today" : "")} onClick={() => patch({ planDay: dk })}>
              <div className="pd-wd">{WD[d.getDay()].slice(0, 3)}</div><div className="pd-dm">{d.getDate()}</div><div className="pd-dot" style={{ background: p.color }} />
            </button>
          ); })}
      </div>
      <div className="plan-cols">
        <div>
          <div className="p-card ink">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 6 }}>
              <span className="p-card-title" style={{ fontSize: 16 }}>{frDate(sel)}{sel === tk && <span className="pen p-red" style={{ fontSize: 16 }}> · aujourd'hui</span>}</span>
              <span className="phasechip" style={{ background: ph.color }}>{ph.label}</span>
            </div>
            <div className="p-sub" style={{ margin: "5px 0 6px" }}>Réveil <b className="p-red">{r.wake}</b> · coucher <b className="p-red">{r.bed}</b></div>
            {plan.map((b, i) => (
              <div key={i} className={"block" + (b.read ? " read" : "")}>
                <div className="bt">{b.t}</div><div className="bk">{b.k}</div>
                <div className="bc"><div className="bl">{b.l}</div>{b.s && <div className="bs">{b.s}</div>}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          {dueThatDay.length > 0 && (
            <div className="p-card red"><div className="p-card-title" style={{ marginBottom: 4 }}>📌 À rendre ce jour</div>
              {dueThatDay.map(d => <div key={d.dk} className="p-row"><span>{d.icon}</span><span className="p-flex">{d.label}</span></div>)}
            </div>
          )}
          <div className="p-card hi"><div className="p-card-title" style={{ marginBottom: 4 }}>📖 Lecture du soir · 30–40 min</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.45 }}>Chaque soir avant de dormir : <b>{bookOf(sel)}</b>. Créneau idéal — lumière basse, zéro écran, ça enclenche le sommeil. 30 min suffisent les soirs chargés, vise 40 quand tu peux.</div>
          </div>
        </div>
      </div>
      <div className="plan-gen">
        <div className="plan-gen-btns">
          <button className="p-btn gen" onClick={() => genPrepaPlan("day", sel)}>🗓️ Ajouter ce jour au calendrier</button>
          <button className="p-btn gen" onClick={() => genPrepaPlan("week", sel)}>📅 Générer la semaine</button>
        </div>
        <div className="plan-gen-note">Blocs créés en <b>privé 🔒</b> dans ton planning perso — jamais visibles par les autres joueurs. Ils s'affichent déjà en fond du calendrier ; le bouton les rend modifiables. La <b>lecture du soir</b> est toujours incluse.</div>
      </div>
      <button className="p-btn" style={{ marginTop: 16, background: "#fff", border: "1.5px solid var(--pline)", color: "var(--pink-ink)" }} onClick={() => patch(u => ({ planOverview: !u.planOverview }))}>
        {ui.planOverview ? "▾ Masquer la vue d'ensemble de l'été" : "🗺️ Vue d'ensemble de l'été — phases, lectures, deadlines"}
      </button>
      {ui.planOverview && <Overview />}
    </>
  );
}
