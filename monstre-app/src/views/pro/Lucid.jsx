import { useState } from "react";
import { useGame } from "../../game.jsx";
import { usePeers, myId } from "../../store.js";
import * as W from "../../lib/work.js";
import { fmtDate, todayKey, addDays, daysTo } from "../../lib/util.js";
import ProChests from "../../components/ProChests.jsx";

const MS_ICONS = ["🔩", "🔐", "🎯", "🔔", "🌱"];
const SIZE_EMOJI = { S: "🔩", M: "📦", L: "🏗️" };
const KINDS = [{ id: "feature", emoji: "✨", label: "Feature" }, { id: "fix", emoji: "🐛", label: "Fix" }, { id: "release", emoji: "🏁", label: "Release" }];
const kindTag = k => (KINDS.find(x => x.id === k) || {}).emoji || "";

const inputSt = { width: "100%", background: "rgba(0,0,0,.3)", border: "1px solid var(--line)", borderRadius: 11, color: "var(--ink)", fontFamily: "var(--body)", fontSize: 14, padding: "10px 12px", outline: "none", marginTop: 10 };
const KPI = ({ cls, v, l, s }) => <div className={"kpi " + cls}><div className="kv">{v}</div><div className="kl">{l}</div>{s && <div className="ks">{s}</div>}</div>;

export default function Lucid() {
  const g = useGame(); const { S } = g;
  const w = S.work || {};
  const peers = usePeers(); const me = myId();
  const agg = W.teamAgg(peers, me, S);

  const [title, setTitle] = useState("");
  const [size, setSize] = useState("M");
  const [kind, setKind] = useState("feature");
  const [ms, setMs] = useState("");
  const [editRm, setEditRm] = useState(false);
  const [msLabel, setMsLabel] = useState(""); const [msNeed, setMsNeed] = useState("3"); const [msDate, setMsDate] = useState("");

  const tk = todayKey();
  const prog = W.entProg(agg.lucid.xp);
  const ships = W.teamShips(peers, me, S);              // ships de toute l'équipe
  const myShipIds = new Set((w.ships || []).map(s => s.id));
  const roadmap = W.roadmapOf(w);                       // roadmap éditable (seed LUCID_MVP si vide)
  const mvp = Math.round(W.mvpPctOf(roadmap, ships));    // progression = features d'équipe
  const doneMs = roadmap.filter(m => W.msStat(ships, m.id, m.need).shipped).length;
  const ago = W.lastShipDaysAgo(w);
  const agoTxt = ago === 0 ? "aujourd'hui" : "il y a " + ago + " j";

  const focusDays = W.dailyFocus(w, 14, "lucid");
  const maxMin = Math.max(W.DAILY_FOCUS_TARGET, ...focusDays.map(d => d.min));
  const weekMin = W.focusMin(w, "lucid", addDays(tk, -6));
  const weekPct = Math.min(100, weekMin / W.WEEK_FOCUS_TARGET * 100);

  const roster = [...agg.people].sort((a, b) => (b.s.ships || 0) - (a.s.ships || 0));

  const submit = () => { if (!title.trim()) return; g.shipFeature({ title, size, kind, ms: ms || null }); setTitle(""); };
  const submitMs = () => { if (!msLabel.trim()) return; g.addMilestone({ label: msLabel, need: parseInt(msNeed, 10) || 3, targetDk: msDate }); setMsLabel(""); setMsDate(""); };
  const inSm = { background: "rgba(0,0,0,.3)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--ink)", padding: "5px 8px", fontFamily: "var(--body)", fontSize: 12.5 };

  return (
    <div className="pro-lucid">
      {/* 1 · HERO */}
      <div className="pro-hero">
        <div className="ph-eyebrow">La startup</div>
        <div className="ph-title">🚀 LUCID <span className="ph-badge">{W.entTitle("lucid", agg.lucid.xp)}</span></div>
        <div className="ph-xp">{agg.lucid.xp}<small>XP équipe</small></div>
        <div className="xpbar"><i style={{ width: prog.pct + "%" }} /></div>
        <div className="xpmeta"><span>Niv. {prog.lvl}</span><span>Plus que <b>{prog.toNext}</b> XP → niv. {prog.lvl + 1}</span></div>
        <div style={{ marginTop: 14, display: "flex", alignItems: "baseline", gap: 9 }}>
          <span className="bh-pct">{mvp}%</span>
          <span style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600 }}>du MVP livré · {doneMs}/{roadmap.length} jalons bouclés</span>
        </div>
      </div>

      {/* 2 · KPIS */}
      <div className="kpis">
        <KPI cls="cyan" v={W.focusMin(w, "lucid", tk) + " min"} l="Focus aujourd'hui" s={W.focusStreak(w) + " 🔥 j de focus"} />
        <KPI cls="orange" v={W.shipStreak(w) + " 🚢"} l="Ship streak" s={ago == null ? "aucun ship encore" : "dernier " + agoTxt} />
        <KPI cls="gold" v={agg.lucid.ships} l="Features équipe" s={"cible " + W.PRO_GOALS.lucidShips} />
        <KPI cls="pink" v={mvp + " %"} l="MVP" s={doneMs + "/" + roadmap.length + " jalons"} />
      </div>

      {/* 2b · objectifs clairs (équipe) */}
      <div className="card">
        <h2>🎯 Objectifs<span className="sub">équipe</span></h2>
        {W.lucidGoals(agg, w).map(o => o.ic === "🧩" ? { ...o, cur: mvp } : o).map((o, i) => {
          const pct = o.target ? Math.min(100, Math.round(o.cur / o.target * 100)) : 0;
          const ok = o.cur >= o.target;
          return (
            <div key={i} style={{ marginTop: i ? 13 : 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 13.5, marginBottom: 5, gap: 8 }}>
                <span style={{ fontWeight: 600 }}>{o.ic} {o.label}</span>
                <span style={{ color: ok ? "var(--cyan)" : "var(--muted)", fontWeight: 700, fontVariantNumeric: "tabular-nums", flex: "none" }}>{o.cur} / {o.target}{o.unit ? " " + o.unit : ""} {ok ? "✅" : ""}</span>
              </div>
              <div className="xpbar" style={{ height: 8 }}><i style={{ width: pct + "%", background: ok ? "var(--cyan)" : "var(--ent)" }} /></div>
            </div>
          );
        })}
      </div>

      {/* 3 · COFFRES D'ÉQUIPE */}
      <ProChests entity="lucid" />

      {/* 4 · ROADMAP MVP — éditable, partagée cofondateurs (sync Supabase) */}
      <div className="card">
        <h2>🗺️ Roadmap MVP<span className="sub">{doneMs}/{roadmap.length} · progression équipe</span></h2>
        {roadmap.map((m, idx) => {
          const mp = W.msStat(ships, m.id, m.need);
          const d = m.targetDk ? daysTo(tk, m.targetDk) : null;
          return (
            <div key={m.id} className={"pro-ms" + (mp.shipped ? " done" : "")}>
              <div className="ms-ic">{mp.shipped ? "✅" : (MS_ICONS[m.order] || MS_ICONS[idx] || "🎯")}</div>
              <div className="ms-main">
                {editRm
                  ? <input defaultValue={m.label} onBlur={e => { const v = e.target.value.trim(); if (v && v !== m.label) g.editMilestone(m.id, { label: v }); }} onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }} style={{ ...inSm, width: "100%", fontSize: 14, fontWeight: 600, padding: "8px 10px" }} />
                  : <div className="ms-lab">{m.label}</div>}
                <div className="ms-bar"><i style={{ width: mp.pct + "%" }} /></div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span>{mp.done}/{m.need} features{mp.shipped ? " · bouclé 🎉" : ""}</span>
                  {editRm && <>
                    <label style={{ display: "flex", alignItems: "center", gap: 4 }}>cible <input type="number" min="1" max="20" defaultValue={m.need} onBlur={e => g.editMilestone(m.id, { need: e.target.value })} style={{ ...inSm, width: 50 }} /></label>
                    <input type="date" defaultValue={m.targetDk || ""} onChange={e => g.editMilestone(m.id, { targetDk: e.target.value })} style={inSm} />
                    <button className="qmenu-btn" title="Monter" onClick={() => g.moveMilestone(m.id, -1)}>↑</button>
                    <button className="qmenu-btn" title="Descendre" onClick={() => g.moveMilestone(m.id, 1)}>↓</button>
                    <button className="qmenu-btn" title="Supprimer" onClick={() => g.removeMilestone(m.id)}>🗑️</button>
                  </>}
                </div>
              </div>
              {!editRm && <div className={"ms-when" + (!mp.shipped && d != null && d < 0 ? " pro-stale" : "")} title={m.targetDk}>{mp.shipped ? "✅" : d == null ? "—" : d >= 0 ? "J−" + d : "⏰ +" + (-d) + "j"}</div>}
            </div>
          );
        })}
        {roadmap.length === 0 && <div className="empty">Roadmap vide. Ajoute ton premier objectif d'implémentation ci-dessous. 🎯</div>}

        {editRm && (
          <div className="addform" style={{ marginTop: 12 }}>
            <div className="hint">Nouvel objectif (jalon MVP). Modifiable à tout moment — synchro cofondateurs via le cloud.</div>
            <input value={msLabel} onChange={e => setMsLabel(e.target.value)} placeholder="Ex : Paiement Stripe en prod" onKeyDown={e => e.key === "Enter" && submitMs()} />
            <div style={{ display: "flex", gap: 8, marginTop: 9, flexWrap: "wrap", alignItems: "center" }}>
              <label style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>features <input type="number" min="1" max="20" value={msNeed} onChange={e => setMsNeed(e.target.value)} style={{ ...inSm, width: 56, padding: "6px 8px" }} /></label>
              <input type="date" value={msDate} onChange={e => setMsDate(e.target.value)} style={{ ...inSm, padding: "6px 8px" }} />
              <button className="btn small" onClick={submitMs}>➕ Ajouter</button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <button className="btn small ghost" onClick={() => setEditRm(v => !v)}>{editRm ? "✓ Terminer l'édition" : "✏️ Éditer la roadmap"}</button>
          {editRm && <button className="btn small ghost" onClick={g.resetRoadmap}>🔄 Réinitialiser</button>}
        </div>
      </div>

      {/* 5 · CONCENTRATION */}
      <div className="card">
        <h2>🧠 Concentration<span className="sub">temps concentré · équipe</span></h2>
        <div style={{ display: "flex", alignItems: "baseline", gap: 9, marginTop: 4 }}>
          <span className="bh-pct" style={{ fontFamily: "var(--disp)", fontWeight: 900, fontSize: 40, lineHeight: 1, color: "var(--cyan)" }}>{agg.lucid.minH} h</span>
          <span style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600 }}>de focus cumulé en équipe sur LUCID</span>
        </div>
        <div className="mini-bars">
          {focusDays.map((d, i) => {
            const hit = d.min >= W.DAILY_FOCUS_TARGET;
            const h = d.min > 0 ? Math.max(6, d.min / maxMin * 100) : 3;
            const col = d.min <= 0 ? "rgba(255,255,255,.08)" : hit ? "var(--cyan)" : "rgba(255,142,60,.55)";
            return <div key={i} className="mb" title={d.dk + " · " + d.min + " min"} style={{ height: h + "%", background: col }} />;
          })}
        </div>
        <div className="axis"><span>il y a 14 j</span><span>aujourd'hui</span></div>
        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 8 }}>Barre cyan = jour à ≥ {W.DAILY_FOCUS_TARGET} min de deep work LUCID.</div>

        <div style={{ marginTop: 16 }}>
          <div className="xpmeta" style={{ marginBottom: 6 }}><span>Objectif focus cette semaine</span><span><b>{weekMin}</b> / {W.WEEK_FOCUS_TARGET} min</span></div>
          <div className="xpbar"><i style={{ width: weekPct + "%", background: "linear-gradient(90deg,var(--cyan),var(--gold))" }} /></div>
        </div>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="pro-streak">{W.focusStreak(w)} 🔥 jours</span>
          {weekMin === 0 && <span style={{ fontSize: 12, color: "var(--muted)" }}>0 min cette semaine — lance un Deep Work, la startup se construit pas seule.</span>}
        </div>
      </div>

      {/* 6 · LIVRER UNE FEATURE */}
      <div className="card">
        <h2>🚀 Livrer une feature<span className="sub">chaque ship fait exister LUCID</span></h2>
        <div className="addform">
          <input value={title} maxLength={60} placeholder="Ce que tu viens de livrer…" onChange={e => setTitle(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submit(); }} />
          <div className="pro-ent-row" style={{ marginTop: 10 }}>
            {["S", "M", "L"].map(sz => (
              <button key={sz} className={"pro-ent" + (size === sz ? " sel" : "")} onClick={() => setSize(sz)}>
                <span className="pe-emoji">{SIZE_EMOJI[sz]}</span>
                <span className="pe-label">{sz}</span>
                <span className="pe-sub">+{W.SHIP_XP[sz]} XP</span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {KINDS.map(k => <button key={k.id} className={"btn small" + (kind === k.id ? "" : " ghost")} onClick={() => setKind(k.id)}>{k.emoji} {k.label}</button>)}
          </div>
          <select value={ms} onChange={e => setMs(e.target.value)} style={inputSt}>
            <option value="">Sans jalon</option>
            {roadmap.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <button className="btn block" style={{ marginTop: 12 }} onClick={submit}>🚀 Shipper (+{W.SHIP_XP[size]} XP)</button>
        </div>

        {ago == null
          ? <div className="empty" style={{ marginTop: 12 }}>Aucune feature livrée. Ton premier ship t'attend — même moche, il fait exister LUCID. 🚀</div>
          : <div className={"empty" + (ago > 5 ? " pro-stale" : "")} style={{ marginTop: 12, fontWeight: ago > 5 ? 700 : 400 }}>{ago > 5 ? "⚠️ Dernier ship " + agoTxt + " — LUCID n'existe pas cette semaine si tu shippes pas." : "Dernier ship " + agoTxt + ". Garde la cadence. 🚢"}</div>}

        <div style={{ fontFamily: "var(--disp)", fontWeight: 700, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", margin: "18px 0 4px" }}>Changelog équipe</div>
        {ships.length === 0
          ? <div className="empty">Le changelog est vide. La première ligne, c'est toi qui l'écris. ✍️</div>
          : ships.slice(0, 12).map(s => (
            <div key={s.id} className="pro-ship">
              <span className={"sh-size " + s.size}>{s.size}</span>
              <span className="sh-t">{s.title} <span className="sh-note">· {s.who}{s.kind && s.kind !== "feature" ? " " + kindTag(s.kind) : ""}</span></span>
              {myShipIds.has(s.id) && <button onClick={() => g.removeShip(s.id)} title="Retirer" style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, padding: "0 4px", flex: "none" }}>✕</button>}
              <span className="sh-when">{fmtDate(s.ts)}</span>
            </div>
          ))}
      </div>

      {/* 7 · MANTRA */}
      <div className="card pro-cta">
        <h2>🔥 Mantra du jour</h2>
        <div className="cta-txt" style={{ marginTop: 8 }}>{W.rotate(W.LUCID_MANTRAS, W.daySeed())}</div>
      </div>

      {/* 8 · ÉQUIPE */}
      <div className="card">
        <h2>🚀 L'équipe<span className="sub">course au ship</span></h2>
        {agg.lucid.ships === 0 && <div className="empty" style={{ marginBottom: 4 }}>Personne n'a encore shippé. Sois le premier nom du changelog. 🥇</div>}
        {roster.map((p, i) => {
          const s = p.s; const isMe = p.id === me; const first = i === 0 && s.ships > 0;
          return (
            <div key={p.id} className={"lbrow" + (isMe ? " me" : "") + (first ? " top1" : "")}>
              <div className="lb-rank">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i + 1)}</div>
              <div className="lb-ava">{p.avatar}</div>
              <div className="lb-main">
                <div className="lb-name">{p.name}{first && <span className="pro-badge">🥇 Ship-race</span>}{isMe && <span className="metag">toi</span>}</div>
                <div className="lb-chips"><span>🚀 Niv. {s.lucidLvl}</span><span>{Math.round(s.minLucid / 60)} h</span><span>{s.ships} ships</span>{s.shipStreak > 0 && <span>🚢 {s.shipStreak} sem.</span>}</div>
              </div>
              <div className="lb-xp"><b>{s.lucidXP}</b><small>XP LUCID</small></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
