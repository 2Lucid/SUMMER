import { useState } from "react";
import { useGame } from "../game.jsx";
import { todayKey, fmtDate } from "../lib/util.js";
import { ACTIONS, LEVELS, levelIndex } from "../lib/coeur.js";
import { COUPLE_TYPES, COUPLE_QUICK, WEEK_GOAL, coupleMicroOfDay, principleOfDay, lovemapOfDay, deposits7 } from "../lib/couple.js";

export default function CoeurCouple() {
  const { S, logAction, undoLast, undoTop, deleteLog, setCouple } = useGame();
  const [repairOpen, setRepairOpen] = useState(false);
  const [rnote, setRnote] = useState("");
  const tk = todayKey();
  const lvl = levelIndex(S.xp), cur = LEVELS[lvl], next = LEVELS[lvl + 1] || null;
  const pct = next ? Math.min(100, Math.round((S.xp - cur.xp) / (next.xp - cur.xp) * 100)) : 100;
  const dep = deposits7(S);
  const tank = Math.min(100, Math.round(dep / WEEK_GOAL * 100));
  const reps = S.log.filter(e => e.type === "repair").length;
  const dts = S.log.filter(e => e.type === "datec").length;
  const done = (S.coeurDaily[tk] || 0) > 0;
  const micro = coupleMicroOfDay(tk), pr = principleOfDay(tk), lm = lovemapOfDay(tk);
  const log = S.log.filter(e => COUPLE_TYPES.includes(e.type)).slice(-8).reverse();

  const doLog = t => { if (t === "repair") { setRepairOpen(true); return; } logAction(null, t, null); };
  const saveRepair = () => { logAction(null, "repair", null, rnote.trim() || null); setRepairOpen(false); setRnote(""); };

  return (
    <div className="coeur-world couple-world">
      <div className="coeur-fire" aria-hidden="true" />
      <div className="coeur-embers" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <div className="coeur-banner couple-banner"><span className="cb-flame">💞</span> Mode couple — un petit dépôt chaque jour bâtit un couple solide. <span className="cb-flame">💞</span></div>

      <div className="grid2">
        <div>
          <div className={"stake" + (done ? " done" : "")}>
            <div className="st-top"><span className="st-emoji">{done ? "✅" : "💞"}</span><span className="st-ttl">Geste du jour</span></div>
            <div className="st-mis">{done ? "C'est fait. Un dépôt de plus sur votre compte affectif." : micro}</div>
            <div className="st-warn">{done ? "👑 Streak sécurisé — on remet ça demain." : "Petit + constant, mieux que grand + rare. C'est le quotidien qui gagne."}</div>
            {!done && <div className="st-row"><button className="btn small" onClick={() => doLog("attn")}>💞 J'ai fait mon geste (+30 XP)</button></div>}
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
              <div className="stat"><div className="v">{dep}</div><div className="k">dépôts / 7 j</div></div>
              <div className="stat"><div className="v">{dts}</div><div className="k">dates</div></div>
              <div className="stat"><div className="v">{reps}</div><div className="k">réparations</div></div>
              <div className="stat"><div className="v">{S.best}</div><div className="k">record</div></div>
            </div>
          </div>

          <div className="card"><h2>🏦 Compte affectif<span className="sub">{dep}/{WEEK_GOAL} cette semaine</span></h2>
            <div className="hpbar love"><i style={{ width: tank + "%" }} /></div>
            <div className="hpmeta"><span>Dépôts positifs (7 derniers jours)</span><span>{tank}%</span></div>
            <div className="cpl-note">Chaque attention, merci, écoute = un dépôt. Gottman : vise ~5 positifs pour 1 négatif.</div>
          </div>

          <div className="card learn"><h2>📖 Principe du jour<span className="sub">apprentissage</span></h2>
            <div className="learn-t">{pr.t}</div>
            <p className="learn-s">{pr.s}</p>
            <div className="learn-a">🎯 {pr.a}</div>
          </div>
        </div>

        <div>
          <div className="card"><h2>⚡ Loguer un moment<span className="sub">+XP · +dépôt</span></h2>
            <div className="cpl-grid">
              {COUPLE_QUICK.map(([t, e, l]) => { const a = ACTIONS[t];
                return (
                  <button key={t} className="cpl-act" onClick={() => doLog(t)}>
                    <span className="cae">{e}</span><span className="cal">{l}</span><span className="cax">+{a.xp}</span>
                  </button>
                );
              })}
            </div>
            {undoTop && <button className="cpl-undo" onClick={undoLast}>↩️ Oups, annuler « {undoTop} »</button>}
          </div>

          {repairOpen && (
            <div className="card repair-debrief"><h2>🛠️ Réparation<span className="sub">+60 XP</span></h2>
              <div className="rd-hint">Qu'est-ce qui a apaisé ? Une phrase — pour t'en souvenir la prochaine fois.</div>
              <input className="rd-input" maxLength={140} autoFocus placeholder="ex : je me suis excusé le premier, on a pris l'air ensemble…"
                value={rnote} onChange={e => setRnote(e.target.value)} onKeyDown={e => { if (e.key === "Enter") saveRepair(); }} />
              <div className="row" style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="btn ghost small" onClick={() => { setRepairOpen(false); setRnote(""); }}>Annuler</button>
                <button className="btn small" onClick={saveRepair}>Valider la réparation</button>
              </div>
            </div>
          )}

          <div className="card lovemap"><h2>🗺️ Question du jour<span className="sub">love map</span></h2>
            <div className="lm-q">« {lm} »</div>
            <div className="row"><button className="btn small" onClick={() => doLog("lovemap")}>Je la lui ai posée (+35)</button></div>
          </div>

          <div className="card"><h2>📜 Journal du couple</h2>
            {log.length === 0 ? <div className="empty">Vos moments s'écrivent ici. Premier geste = premières lignes.</div>
              : log.map(e => { const a = ACTIONS[e.type];
                return <div key={e.id} className="logline"><span className="lxp">+{e.xp} XP</span><span className="ltxt">{a.emoji} {a.label}{e.note ? <span className="ln-note"> — « {e.note} »</span> : ""}</span><span className="ldate">{fmtDate(e.ts)}</span><button className="log-del" title="Retirer cette action" onClick={() => deleteLog(e.id)}>✕</button></div>;
              })}
          </div>

          <div className="card rules"><h2>⚖️ Les 3 lois du couple</h2>
            <ol>
              <li><b>Répare vite.</b> Les couples solides ne se disputent pas moins — ils se reconnectent plus vite.</li>
              <li><b>Tourne-toi vers.</b> Réponds aux petites sollicitations : l'amour se joue là, pas dans les grands gestes.</li>
              <li><b>5 pour 1.</b> Cinq positifs pour un négatif. Le quotidien gagne sur les déclarations.</li>
            </ol>
          </div>

          <button className="cpl-switch" onClick={() => setCouple(false)}>Je ne suis plus en couple →</button>
        </div>
      </div>
    </div>
  );
}
