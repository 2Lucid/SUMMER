import { useState, useEffect } from "react";
import { useGame } from "../../game.jsx";
import { usePeers, myId } from "../../store.js";
import * as W from "../../lib/work.js";
import { fmtDate, todayKey, addDays } from "../../lib/util.js";

/* Le moteur d'XP : minuteur pomodoro (horloge murale) + log manuel + historique
 * d'équipe. Aucune XP n'est stockée : on écrit des sessions brutes, tout dérive
 * dans lib/work.js. La couleur suit l'entité taguée (--ent via .pro-asso/.pro-lucid). */
export default function Work() {
  const g = useGame();
  const { S } = g;
  const w = S.work || {};
  const peers = usePeers();
  const me = myId();
  const tk = todayKey();

  const [entity, setEntity] = useState(w.timer ? w.timer.entity : null);
  const [preset, setPreset] = useState("std");
  const [manMin, setManMin] = useState("");

  /* ── minuteur (horloge murale) — pattern robuste : le tél verrouillé n'arrête rien ── */
  const t = w.timer;
  const [, force] = useState(0);
  useEffect(() => { if (!t) return; const id = setInterval(() => force(x => x + 1), 1000); return () => clearInterval(id); }, [!!t]);
  const tv = t ? W.timerView(t, Date.now()) : null;
  useEffect(() => { if (tv && tv.done && !t.paused) g.reconcileTimer(); }, [tv && tv.done]);
  // au montage + retour d'onglet : on rattrape les phases écoulées pendant l'absence
  useEffect(() => {
    g.reconcileTimer();
    const onVis = () => { if (document.visibilityState === "visible") g.reconcileTimer(); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []); // eslint-disable-line

  const ent = t ? t.entity : entity;           // entité affichée : le timer prime
  const P = W.PRESETS[preset] || W.PRESETS.std;
  const presetClock = String(P.focus).padStart(2, "0") + ":00";
  const doneCyc = W.sessionsOf(w, ent, tk).filter(s => s.mode === "pomo" && s.full).length;
  const sess = W.teamSessions(peers, me, S);

  const KPI = ({ cls, v, l }) => <div className={"kpi " + cls}><div className="kv">{v}</div><div className="kl">{l}</div></div>;
  const EntPick = ({ sel, onPick }) => (
    <div className="pro-ent-row">
      {["asso", "lucid"].map(x => { const E = W.ENTITIES[x]; return (
        <button key={x} className={"pro-ent" + (sel === x ? " sel" : "")} style={{ "--ent": E.accentHex }} onClick={() => onPick(x)}>
          <span className="pe-emoji">{E.emoji}</span>
          <span className="pe-label">{E.name}</span>
          <span className="pe-sub">{x === "asso" ? "Terrain · ventes" : "Build · ship"}</span>
        </button>
      ); })}
    </div>
  );
  const Dots = () => (
    <div className="pro-dots">
      {Array.from({ length: Math.max(4, doneCyc + 1) }).map((_, i) =>
        <span key={i} className={"pro-dot" + (i < doneCyc ? " done" : "")} />)}
    </div>
  );

  const submitManual = () => {
    const m = Number(manMin);
    if (!entity || !(m >= W.MIN_SESSION)) return;
    g.logSession({ entity, mode: "manual", minutes: m });
    setManMin("");
  };

  return (
    <div className={ent === "asso" ? "pro-asso" : ent === "lucid" ? "pro-lucid" : ""}>
      {/* 1 — en-tête */}
      <div className="pro-hero">
        <div className="ph-eyebrow">PARTAGÉ · TOI + LUCAS</div>
        <div className="ph-title">⏱️ Le moteur d'XP</div>
        <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 8, lineHeight: 1.4 }}>
          Plus tu bosses, plus l'asso ET la startup montent.
        </div>
      </div>

      {/* 2 — sélecteur d'entité (masqué pendant qu'un bloc tourne) */}
      {!t && <EntPick sel={entity} onPick={setEntity} />}

      {/* 3 — minuteur pomodoro */}
      <div className="pro-timer">
        {t ? (
          <>
            <div className={"pro-ring" + (tv.phase === "break" ? " brk" : "")} style={{ "--p": tv.pct }}>
              <div className="pr-in">
                <div className="pro-clock">{tv.clock}</div>
                <div className="pro-phase">{tv.phase === "focus" ? "FOCUS" : "PAUSE"}</div>
              </div>
            </div>
            <Dots />
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
              {W.ENTITIES[ent].emoji} {W.ENTITIES[ent].name} · {doneCyc} cycle{doneCyc > 1 ? "s" : ""} aujourd'hui
            </div>
            {tv.phase === "break" ? (
              <>
                <div style={{ fontWeight: 600, fontSize: 15, marginTop: 14 }}>☕ Pause — souffle, bouge, hydrate-toi.</div>
                <div className="pt-btns"><button className="btn ghost block" onClick={g.skipBreak}>⏭️ Passer la pause</button></div>
              </>
            ) : (
              <div className="pt-btns">
                {!tv.paused
                  ? <><button className="btn ghost" onClick={g.pauseTimer}>⏸️ Pause</button><button className="btn" onClick={g.stopTimer}>⏹️ Terminer</button></>
                  : <><button className="btn" onClick={g.resumeTimer}>▶️ Reprendre</button><button className="btn ghost" onClick={g.stopTimer}>⏹️ Terminer</button></>}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="pro-sub" style={{ marginBottom: 8 }}>
              {["sprint", "std", "deep"].map(k => { const Q = W.PRESETS[k]; return (
                <button key={k} className={preset === k ? "on" : ""} onClick={() => setPreset(k)}>{Q.emoji} {Q.label} {Q.focus}/{Q.break}</button>
              ); })}
            </div>
            <div className="pro-ring" style={{ "--p": 0 }}>
              <div className="pr-in">
                <div className="pro-clock">{presetClock}</div>
                <div className="pro-phase">{P.focus} min focus</div>
              </div>
            </div>
            <Dots />
            <button className="btn block" disabled={!entity} onClick={() => g.startTimer({ entity, preset })} style={{ marginTop: 16, opacity: entity ? 1 : .55 }}>
              {entity ? "▶️ Démarrer le bloc" : "🏷️ Tag ta session d'abord"}
            </button>
            {!entity && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>Choisis 🪟 Lucarnepro ou 🚀 LUCID au-dessus pour lancer l'horloge.</div>}
          </>
        )}
      </div>

      {/* 4 — saisie manuelle */}
      <div className="card">
        <h2>✍️ Bossé sans l'app ?<span className="sub">rattrape ton temps</span></h2>
        <div className="addform">
          <div className="hint">Ajoute le temps concentré fait ailleurs (cours, terrain, code hors app). On crédite honnêtement, plafond 3 h par saisie.</div>
          {!entity && <EntPick sel={entity} onPick={setEntity} />}
          <input type="number" min="10" max="180" inputMode="numeric" placeholder="Minutes (10 → 180)" value={manMin}
                 onChange={e => setManMin(e.target.value)} style={{ marginTop: 10 }} />
          <button className="btn block" style={{ marginTop: 10 }} disabled={!entity || !(Number(manMin) >= W.MIN_SESSION)} onClick={submitManual}>
            ➕ Créditer{entity ? " · " + W.ENTITIES[entity].emoji + " " + W.ENTITIES[entity].name : ""}
          </button>
        </div>
      </div>

      {/* 5 — barème */}
      <div className="rules">
        <b>Barème.</b> 1 min = 2 XP vers l'entité taguée · cycle complet +10 · 1re session du jour +15 · vente Lucarnepro +300 · ship S/M/L +60/120/250 · plafond 8 h/jour · &lt;10 min = 0. <b>Pas de triche :</b> on logue que le temps vraiment fait.
      </div>

      {/* 6 — pacte */}
      <div className="pact">
        <span className="pe">🤝</span>
        <div>
          <div className="pt">La confiance règne.</div>
          <div className="ps">Chaque minute ici, c'est du vrai cul-sur-la-chaise. Se gonfler le temps, c'est se mentir.</div>
        </div>
      </div>

      {/* 7 — KPIs du jour */}
      <div className="kpis">
        <KPI cls="cyan" v={W.focusMin(w, null, tk) + " min"} l="Focus aujourd'hui" />
        <KPI cls="orange" v={W.focusStreak(w) + " 🔥"} l="Streak deep work" />
        <KPI cls="gold" v={W.focusMin(w, null, addDays(tk, -6)) + " min"} l="Cette semaine" />
        <KPI cls="pink" v={(w.sessions || []).filter(s => s.dk === tk).length} l="Sessions" />
      </div>

      {/* 8 — historique d'équipe */}
      <div className="card">
        <h2>👥 Historique d'équipe<span className="sub">toi + Lucas</span></h2>
        {sess.length
          ? sess.slice(0, 8).map((s, i) => (
            <div key={(s.id || "") + "_" + s.ts + "_" + i} className="logline" style={s.mode === "manual" ? { opacity: .6 } : undefined}>
              <span className="lxp">{s.entity === "asso" ? "🪟" : "🚀"}</span>
              <span className="ltxt">{s.min + " min · " + s.who + (s.mode === "manual" ? " (manuel)" : "")}</span>
              <span className="ldate">{fmtDate(s.ts)}</span>
            </div>
          ))
          : <div className="empty">Lance ton premier bloc. 🚀</div>}
      </div>

      {/* 9 — motivation du jour */}
      <div style={{ marginTop: 22, textAlign: "center", fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>
        {W.rotate(W.WORK_MOTIV, W.daySeed())}
      </div>
    </div>
  );
}
