import { useState } from "react";
import { useGame } from "../game.jsx";
import { todayKey, fmtDate } from "../lib/util.js";
import { microOfDay } from "../lib/config.js";
import { ACTIONS, LEVELS, EMOJIS, COEUR_STAKE, levelIndex, has, mission, fearEntries } from "../lib/coeur.js";

const STEPS = [{ t: "message", e: "📨" }, { t: "convo", e: "💬" }, { t: "proposer", e: "🎯" }, { t: "date", e: "🏖️" }];

export default function Coeur() {
  const { S, ui, patch, openModal, setStatus, removeQuest, addQuest, undoLast, undoTop, deleteLog } = useGame();
  const [name, setName] = useState("");
  const lvl = levelIndex(S.xp), cur = LEVELS[lvl], next = LEVELS[lvl + 1] || null;
  const pct = next ? Math.min(100, Math.round((S.xp - cur.xp) / (next.xp - cur.xp) * 100)) : 100;
  const dates = S.log.filter(e => e.type === "date").length, rateaux = S.log.filter(e => e.type === "rateau").length;
  const m = mission(S); const fe = fearEntries(S);
  const avg = arr => arr.length ? arr.reduce((s, e) => s + e.fear, 0) / arr.length : null;
  const a0 = avg(fe.slice(0, 3)), a1 = avg(fe.slice(-3)); const hp = a1 == null ? 100 : Math.round(a1 * 10);
  const doneToday = (S.coeurDaily[todayKey()] || 0) > 0; const micro = microOfDay(todayKey());

  const submit = () => { addQuest(name, ui.selEmoji); setName(""); };

  return (
    <div className="coeur-world">
      <div className="coeur-fire" aria-hidden="true" />
      <div className="coeur-embers" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <div className="coeur-banner"><span className="cb-flame">🔥</span> Zone de courage — chaque rep <b>brûle la flippe</b>. <span className="cb-flame">🔥</span></div>
    <div className="grid2">
      <div>
        <div className={"stake" + (doneToday ? " done" : "")}>
          <div className="st-top"><span className="st-emoji">{doneToday ? "✅" : "🎯"}</span><span className="st-ttl">Mise du jour</span></div>
          <div className="st-mis">{doneToday ? "C'est fait. Le boss a pris des dégâts aujourd'hui." : micro}</div>
          <div className="st-warn">{doneToday ? "👑 XP sécurisé pour aujourd'hui — on remet ça demain." : "⚠️ Zéro action aujourd'hui = −" + COEUR_STAKE + " XP demain + streak à zéro. Ça, ça fait mal."}</div>
          {!doneToday && <div className="st-row"><button className="btn small" onClick={() => openModal(null)}>⚡ Faire mon action du jour (+30 XP)</button></div>}
        </div>

        <div className="charsheet">
          <div className="lvl-row">
            <div className="lvl-badge">{lvl + 1}</div>
            <div className="lvl-info"><div className="lvl-eyebrow">Niveau {lvl + 1}</div><div className="lvl-title">{cur.t}</div></div>
            <div className="streak"><div className="flame">🔥</div><div className="n">{S.streak}</div><div className="lbl">jours de suite</div></div>
          </div>
          <div className="xpbar-wrap"><div className="xpbar"><i style={{ width: pct + "%" }} /></div>
            <div className="xpmeta"><span><b>{S.xp} XP</b></span><span>{next ? next.xp + " XP → " + next.t : "Niveau max. Respect."}</span></div>
          </div>
          <div className="statsrow">
            <div className="stat"><div className="v">{S.log.length}</div><div className="k">actions</div></div>
            <div className="stat"><div className="v">{dates}</div><div className="k">dates</div></div>
            <div className="stat"><div className="v">{rateaux}</div><div className="k">râteaux (fiers)</div></div>
            <div className="stat"><div className="v">{S.best}</div><div className="k">record</div></div>
          </div>
        </div>

        <div className="card mission"><h2>{m.e} Mission du jour</h2>
          <p>{m.parts.map((p, i) => p.b ? <b key={i}>{p.b}</b> : <span key={i}>{p.t}</span>)}</p>
          <div className="row"><button className="btn ghost small" onClick={() => openModal(null)}>⚡ Action IRL (+30 XP)</button></div>
        </div>

        <div className="card boss"><h2>👹 Boss final : LA FLIPPE<span className="sub">−PV à chaque rep</span></h2>
          {fe.length === 0
            ? <div className="empty">Avant chaque action qui fait peur, note ta flippe sur 10. Chaque rep tape dans ses PV. C'est lui, le vrai boss.</div>
            : <>
              <div className="hp"><div className="hpbar"><i style={{ width: hp + "%" }} /></div><div className="hpmeta"><span>PV du boss (= flippe récente)</span><span>{hp}/100</span></div></div>
              <div className="fearchart">{fe.slice(-14).map((e, i) => { const h = Math.max(8, e.fear * 10); const col = e.fear >= 7 ? "var(--red)" : e.fear >= 4 ? "var(--orange)" : "var(--cyan)"; return <div key={i} className="bar" style={{ height: h + "%", background: col }} />; })}</div>
              {fe.length >= 4 && a0 != null && a1 != null && (
                (a0 - a1) > 0.4 ? <div className="trend">Flippe : {a0.toFixed(1)} → <b>{a1.toFixed(1)}</b> 📉 Le boss perd des PV.</div>
                  : (a0 - a1) < -0.4 ? <div className="trend up">Flippe : {a0.toFixed(1)} → <b>{a1.toFixed(1)}</b> — normal quand la difficulté monte. Les reps la feront redescendre.</div>
                    : <div className="trend">Flippe stable ({a1.toFixed(1)}/10). Enchaîne, la chute arrive.</div>
              )}
            </>}
        </div>

        <div className="card"><h2>📜 Journal de bord</h2>
          {S.log.length === 0 ? <div className="empty">Ton histoire s'écrit ici. Première action = premières lignes.</div>
            : S.log.slice(-8).reverse().map(e => { const a = ACTIONS[e.type]; const q = S.quests.find(x => x.id === e.questId);
              return <div key={e.id} className="logline"><span className="lxp">+{e.xp} XP</span><span className="ltxt">{a.emoji} {a.label}{q ? " · " + q.name : ""}{typeof e.fear === "number" ? <span style={{ color: "var(--muted)" }}> (flippe {e.fear}/10)</span> : ""}</span><span className="ldate">{fmtDate(e.ts)}</span><button className="log-del" title="Retirer cette action" onClick={() => deleteLog(e.id)}>✕</button></div>; })}
          {undoTop && <button className="cpl-undo" onClick={undoLast}>↩️ Oups, annuler « {undoTop} »</button>}
        </div>

        <div className="card rules"><h2>⚖️ Règles d'or</h2>
          <ol><li><b>L'XP paie l'action, jamais le résultat.</b> Toi tu contrôles le bouton envoyer.</li><li><b>Un non = quête fermée avec honneur.</b> XP empoché, zéro insistance.</li><li><b>Une action par jour minimum.</b> La flippe fond avec les reps, pas avec le temps.</li></ol>
        </div>
      </div>

      <div>
        <div className="card"><h2>🗺️ Tes quêtes<span className="sub">{S.quests.length} en jeu</span></h2>
          {S.quests.map(q => {
            const won = has(S, q, "date");
            const chip = q.status === "couple" ? <span className="qchip couple">💘 En couple</span> : q.status === "closed" ? <span className="qchip">Terminée avec honneur</span> : won ? <span className="qchip won">🏆 Date fait</span> : <span className="qchip">En cours</span>;
            return (
              <div key={q.id} className={"quest " + q.status}>
                <div className="qtop"><div className="qavatar">{q.emoji}</div><div className="qname">{q.name}</div>{chip}
                  <button className="qmenu-btn" onClick={e => { e.stopPropagation(); patch(u => ({ menuFor: u.menuFor === q.id ? null : q.id })); }}>⋯</button></div>
                <div className="qsteps">{STEPS.map((s, i) => { const done = has(S, q, s.t); return <span key={s.t} style={{ display: "contents" }}>{i > 0 && <div className={"qlink" + (done ? " done" : "")} />}<div className={"qstep" + (done ? " done" : "")}>{s.e}</div></span>; })}</div>
                <div className="qactions">{q.status === "closed"
                  ? <button className="btn ghost small" onClick={() => setStatus(q.id, "active")}>Réouvrir</button>
                  : <button className="btn small" onClick={() => openModal(q.id)}>+ Loguer une action</button>}</div>
                {ui.menuFor === q.id && (
                  <div className="qmenu">
                    {q.status === "active" ? <button onClick={() => setStatus(q.id, "closed")}>⚔️ Fermer avec honneur</button> : <button onClick={() => setStatus(q.id, "active")}>🔄 Réouvrir</button>}
                    <button className="danger" onClick={() => removeQuest(q.id)}>🗑️ Supprimer</button>
                  </div>
                )}
              </div>
            );
          })}
          <div className="addform"><div className="hint">Ajoute une quête — prénom ou nom de code 😏</div>
            <input maxLength={24} placeholder="Prénom ou nom de code" autoComplete="off" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submit(); }} />
            <div className="emojirow">{EMOJIS.map(e => <button key={e} className={ui.selEmoji === e ? "sel" : ""} onClick={() => patch({ selEmoji: e })}>{e}</button>)}</div>
            <button className="btn small" onClick={submit}>+ Ajouter</button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
