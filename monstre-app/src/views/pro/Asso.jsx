import { useState, useRef } from "react";
import { useGame } from "../../game.jsx";
import { usePeers, myId } from "../../store.js";
import * as W from "../../lib/work.js";
import { todayKey, addDays } from "../../lib/util.js";
import ProChests from "../../components/ProChests.jsx";

/* Sélecteur de secteur (chips néon, réutilise .abchips/.chipbtn) */
function SectorChips({ value, onChange }) {
  return (
    <div className="abchips" style={{ marginTop: 9 }}>
      {W.SECTORS.map(s => (
        <button key={s.id} type="button" className="chipbtn" onClick={() => onChange(s.id)}
          style={value === s.id ? { borderColor: "var(--ent)", color: "var(--ink)", background: "color-mix(in srgb,var(--ent) 18%,transparent)" } : undefined}>
          {s.ic} {s.label}
        </button>
      ))}
    </div>
  );
}

const KPI = ({ cls, v, l, s }) => <div className={"kpi " + cls}><div className="kv">{v}</div><div className="kl">{l}</div>{s && <div className="ks">{s}</div>}</div>;

export default function Asso() {
  const g = useGame(); const { S } = g;
  const w = S.work || {};
  const peers = usePeers(); const me = myId();
  const agg = W.teamAgg(peers, me, S);
  const tp = W.teamProspects(peers, me, S);           // prospects de toute l'équipe
  const prog = W.entProg(agg.asso.xp);
  const touched = W.touchedToday(w);
  const pipe = W.activePipe(w);                        // MES prospects actifs
  const avgTeam = agg.asso.sales ? Math.round(agg.asso.ca / agg.asso.sales) : 0;
  const pipeTeam = tp.filter(p => !["vendu", "perdu"].includes(p.stage)).length;

  // temps de deep work passé sur l'asso (équipe + moi)
  const tk = todayKey();
  const assoDays = W.dailyFocus(w, 14, "asso");
  const assoMax = Math.max(W.DAILY_FOCUS_TARGET, ...assoDays.map(d => d.min));
  const myAssoH = Math.round(W.focusMin(w, "asso") / 60 * 10) / 10;
  const myWeekAsso = W.focusMin(w, "asso", addDays(tk, -6));

  // funnel équipe (compte par étage courant)
  const fcount = W.FUNNEL.map(f => tp.filter(p => p.stage === f.stage).length);
  const fmax = Math.max(1, ...fcount);
  const repToCont = tp.length ? Math.round(agg.asso.contacted / tp.length * 100) : 0;

  // formulaire d'ajout de prospect (en tête du pipe) + scroll depuis les CTA
  const addRef = useRef(null); const nameRef = useRef(null);
  const focusAdd = () => { addRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => nameRef.current?.focus(), 420); };
  const [name, setName] = useState(""); const [sector, setSector] = useState("resto"); const [price, setPrice] = useState("");
  const submitAdd = () => { if (!name.trim()) { nameRef.current?.focus(); return; } g.addProspect({ name, sector, price: parseInt(price, 10) || 0 }); setName(""); setPrice(""); };

  // formulaire "j'ai vendu un site"
  const [showSale, setShowSale] = useState(false);
  const [sName, setSName] = useState(""); const [sSector, setSSector] = useState("resto"); const [sPrice, setSPrice] = useState("");
  const submitSale = () => { if (!sName.trim()) return; g.quickSale({ name: sName, sector: sSector, price: parseInt(sPrice, 10) || 0 }); setSName(""); setSPrice(""); setSSector("resto"); setShowSale(false); };

  const people = [...agg.people].sort((a, b) => b.s.sales - a.s.sales);
  const done = touched >= 3;

  return (
    <div className="pro-asso">
      {/* 1 · en-tête */}
      <div className="pro-hero">
        <div className="ph-eyebrow">L'association</div>
        <div className="ph-title">🪟 Lucarnepro <span className="ph-badge">{W.entTitle("asso", agg.asso.xp)}</span></div>
        <div className="ph-xp">{agg.asso.xp}<small>XP équipe</small></div>
        <div className="xpbar"><i style={{ width: prog.pct + "%" }} /></div>
        <div className="xpmeta"><span>Niv. <b>{prog.lvl}</b></span><span>reste <b>{prog.toNext}</b> XP pour le niv. {prog.lvl + 1}</span></div>
      </div>

      {/* 2 · défi du jour */}
      <div className={"stake" + (done ? " done" : "")}>
        <div className="st-top"><span className="st-emoji">🚪</span><span className="st-ttl">Défi du jour · {touched}/3</span></div>
        <div className="st-mis">Va voir 3 commerçants aujourd'hui. Pas un mail — une porte, une vraie.</div>
        <div className="st-warn">{done ? "Défi bouclé — t'as fait ton terrain aujourd'hui. Le monstre bosse ET vend. 🔥"
          : touched === 0 ? "0/3 — le premier pas est le plus dur. Lève-toi, la vitrine la plus proche t'attend."
          : "Plus que " + (3 - touched) + " commerçant" + (3 - touched > 1 ? "s" : "") + " à aller voir. Enchaîne."}</div>
        <div className="st-row"><button className="btn small" onClick={focusAdd}>+ Un commerçant vu</button></div>
      </div>

      {/* 3 · appel à l'action */}
      <div className="pro-cta">
        <div className="cta-txt">{W.rotate(W.ASSO_CTA, W.daySeed())}</div>
        <button className="btn block" onClick={focusAdd}>Va prospecter maintenant →</button>
      </div>

      {/* 4 · KPIs équipe */}
      <div className="kpis">
        <KPI cls="gold" v={agg.asso.sales} l="Sites vendus" s={agg.asso.sales ? "vitrines en ligne 🪟" : "le 1er change tout"} />
        <KPI cls="cyan" v={agg.asso.ca + " €"} l="CA cumulé" s={"panier moy. " + avgTeam + " €"} />
        <KPI cls="orange" v={agg.asso.contacted} l="Contactés" s={pipeTeam + " en pipe actif"} />
        <KPI cls="pink" v={agg.asso.closing + " %"} l="Closing" s="vendu / contacté" />
      </div>

      {/* 4a · objectifs clairs de l'été (équipe) */}
      <div className="card">
        <h2>🎯 Objectifs de l'été<span className="sub">équipe</span></h2>
        {W.assoGoals(agg, w).map((o, i) => {
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

      {/* 4b · temps passé sur l'asso (deep work tagué Lucarnepro) */}
      <div className="card">
        <h2>⏱️ Temps sur le terrain<span className="sub">deep work · Lucarnepro</span></h2>
        <div style={{ display: "flex", alignItems: "baseline", gap: 9, marginTop: 4 }}>
          <span style={{ fontFamily: "var(--disp)", fontWeight: 900, fontSize: 40, lineHeight: 1, color: "var(--orange)" }}>{agg.asso.minH} h</span>
          <span style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600 }}>de concentration sur l'asso, en équipe</span>
        </div>
        <div className="mini-bars">
          {assoDays.map((d, i) => {
            const hit = d.min >= W.DAILY_FOCUS_TARGET;
            const h = d.min > 0 ? Math.max(6, d.min / assoMax * 100) : 3;
            const col = d.min <= 0 ? "rgba(255,255,255,.08)" : hit ? "var(--orange)" : "rgba(255,142,60,.4)";
            return <div key={i} className="mb" title={d.dk + " · " + d.min + " min"} style={{ height: h + "%", background: col }} />;
          })}
        </div>
        <div className="axis"><span>il y a 14 j</span><span>aujourd'hui</span></div>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="pro-streak">{W.focusStreak(w)} 🔥 jours</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>toi : {myAssoH} h au total · {myWeekAsso} min cette semaine</span>
          <button className="btn small ghost" onClick={() => g.setTab("work")}>⏱️ Deep work asso →</button>
        </div>
      </div>

      {/* 5 · coffres d'équipe */}
      <ProChests entity="asso" />

      {/* 6 · funnel de prospection */}
      <div className="card">
        <h2>🌪️ Funnel<span className="sub">équipe · {tp.length} prospect(s)</span></h2>
        {tp.length === 0
          ? <div className="empty">Aucun prospect encore. Ton funnel démarre à la première porte poussée — ajoute un commerce repéré ci-dessous. 🔍</div>
          : (<>
            {W.FUNNEL.map((f, i) => (
              <div key={f.stage} className="lrow">
                <span className="ln" style={{ width: 96 }}>{f.ic} {f.label}</span>
                <div className="lbar"><i style={{ width: Math.round(fcount[i] / fmax * 100) + "%", background: f.boss ? "var(--gold)" : "var(--ent)" }} /></div>
                <span className="lc">{fcount[i]}</span>
              </div>
            ))}
            <div className="statsrow">
              <div className="stat"><div className="v">{repToCont}%</div><div className="k">Repéré → Contacté</div></div>
              <div className="stat"><div className="v">{agg.asso.closing}%</div><div className="k">Contacté → Vendu</div></div>
            </div>
          </>)}
        {showSale
          ? (<div className="addform" style={{ borderColor: "rgba(255,209,102,.4)" }}>
              <div className="hint">💰 Une vente directe (déjà closée) — elle entre au bout du funnel : +482 XP (la vente + tout le parcours).</div>
              <input value={sName} onChange={e => setSName(e.target.value)} placeholder="Nom du commerce vendu" onKeyDown={e => e.key === "Enter" && submitSale()} />
              <SectorChips value={sSector} onChange={setSSector} />
              <input style={{ marginTop: 9 }} value={sPrice} onChange={e => setSPrice(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="Prix vendu (€)" onKeyDown={e => e.key === "Enter" && submitSale()} />
              <div className="sheetrow">
                <button className="btn" onClick={submitSale}>💰 Encaisser</button>
                <button className="btn ghost" onClick={() => setShowSale(false)}>Annuler</button>
              </div>
            </div>)
          : <button className="btn block" style={{ marginTop: 14 }} onClick={() => setShowSale(true)}>💰 J'ai vendu un site</button>}
      </div>

      {/* 7 · mon pipe */}
      <div className="card">
        <h2>🎯 Mon pipe<span className="sub">{pipe.length} en cours</span></h2>

        <div className="addform" ref={addRef}>
          <div className="hint">Repère un commerce sans site (ou avec une page Facebook morte). +2 XP direct, la balade devient un jeu.</div>
          <input ref={nameRef} value={name} onChange={e => setName(e.target.value)} placeholder="Nom du commerce (ex : Pizza Bella)" onKeyDown={e => e.key === "Enter" && submitAdd()} />
          <SectorChips value={sector} onChange={setSector} />
          <input style={{ marginTop: 9 }} value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder="Prix visé (€, optionnel)" onKeyDown={e => e.key === "Enter" && submitAdd()} />
          <button className="btn block small" style={{ marginTop: 11 }} onClick={submitAdd}>🔍 Repérer ce commerce</button>
        </div>

        {pipe.length === 0
          ? <div className="empty">Ton pipe est vide. Repère 5 commerces sans site, là, maintenant.</div>
          : pipe.slice().reverse().map(p => {
            const sm = W.stageMeta(p.stage); const sec = W.sectorMeta(p.sector); const ns = W.nextStage(p.stage);
            return (
              <div key={p.id} role="button" className={"pro-step" + (ns === "vendu" ? " boss" : "")} onClick={() => g.advProspect(p.id)} title="Avancer d'un étage">
                <span className="ps-emoji">{sm.ic}</span>
                <div className="ps-main">
                  <div className="ps-name">{p.name}</div>
                  <div className="ps-meta">{sec.ic} {sec.label} · {p.price ? p.price + " €" : "prix à fixer"} · {sm.label}</div>
                </div>
                {ns && <div className="ps-xp">→ {W.stageMeta(ns).label}</div>}
                <button className="qmenu-btn" title="Perdu" onClick={e => { e.stopPropagation(); g.moveProspect(p.id, "perdu"); }}>🥀</button>
                <button className="qmenu-btn" title="Retirer" onClick={e => { e.stopPropagation(); g.removeProspect(p.id); }}>✕</button>
              </div>
            );
          })}
        {pipe.length > 0 && <div className="rules">Clique une carte pour la <b>faire avancer</b> d'un étage. 🥀 = perdu (+10 XP quand même) · ✕ = retirer.</div>}
      </div>

      {/* 9 · équipe */}
      <div className="card">
        <h2>🤝 Équipe<span className="sub">classé par sites vendus</span></h2>
        {people.map((p, i) => (
          <div key={p.id} className="lbrow">
            <div className="lb-ava">{p.avatar}</div>
            <div className="lb-main">
              <div className="lb-name">{p.name}{i === 0 && p.s.sales > 0 && <span className="pro-badge">🥇 Closer</span>}</div>
              <div className="lb-chips"><span>🪟 Niv {p.s.assoLvl}</span><span>{p.s.sales} sites</span><span>{p.s.ca} €</span><span>{Math.round(p.s.minAsso / 60)} h</span></div>
            </div>
            <div className="lb-xp"><b>{p.s.assoXP}</b><small>XP ASSO</small></div>
          </div>
        ))}
      </div>
    </div>
  );
}
