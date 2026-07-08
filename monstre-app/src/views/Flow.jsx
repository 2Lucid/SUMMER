import { useEffect, useState, useRef } from "react";
import { useGame } from "../game.jsx";
import { confetti } from "../fx.js";
import { daysTo, frDate } from "../lib/util.js";
import { phaseOf, phaseMeta } from "../lib/config.js";
import { buildFlow, pickQueue, nextDeadline, KIND } from "../lib/flow.js";

const pad2 = n => String(n).padStart(2, "0");
const clockOf = ts => { const d = new Date(ts); return pad2(d.getHours()) + ":" + pad2(d.getMinutes()); };
const durTxt = m => (m >= 60 ? (m % 60 === 0 ? m / 60 + " h" : Math.floor(m / 60) + " h " + (m % 60)) : m + " min");
const fmtLeft = ms => { const s = Math.max(0, Math.round(ms / 1000)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60; return h > 0 ? h + ":" + pad2(m) + ":" + pad2(ss) : pad2(m) + ":" + pad2(ss); };

export default function Flow() {
  const { S, patch, flowMark, flowSkip, flowPause, flowExtend, flowResume, flowRestart } = useGame();
  const [now, setNow] = useState(() => Date.now());
  const pause = S.flow && S.flow.pause;
  const overRef = useRef(false);
  const celebrated = useRef(false);

  /* Tous les Hooks sont appelés inconditionnellement, AVANT tout return. */

  /* Horloge locale (jamais persistée) : 1 s en pause, 30 s sinon. */
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), pause ? 1000 : 30000);
    return () => clearInterval(id);
  }, [pause ? pause.until : 0]);

  /* Petit confetti quand la pause se termine. */
  useEffect(() => {
    const over = pause && pause.until - now <= 0;
    if (over && !overRef.current) { overRef.current = true; confetti(24); }
    if (!pause) overRef.current = false;
  }, [pause, now]);

  /* Programme du jour (fonction pure — OK d'appeler à chaque rendu). */
  const { blocks, tk, nDone, nTotal } = buildFlow(S, now);
  const queue = pickQueue(blocks);
  const head = queue[0];
  const upnext = queue.slice(1, 5);
  const allDone = !pause && !head;

  /* Confetti (une fois) quand tout le programme est bouclé. */
  useEffect(() => {
    if (allDone && nTotal > 0 && !celebrated.current) { celebrated.current = true; confetti(60); }
    if (!allDone) celebrated.current = false;
  }, [allDone, nTotal]);

  const open = b => { if (b.go) patch({ world: b.go.world, ...(b.go.tab ? { tab: b.go.tab } : {}) }); };
  const done = b => flowMark(b.id, b.dayId, b.todoId);
  const take = b => flowPause(b.pauseMins || b.mins, b.title, b.id);
  const tap = b => (b.kind === "pause" ? take(b) : b.go ? open(b) : done(b));

  /* ===== Écran de pause ===== */
  if (pause) {
    const left = pause.until - now, over = left <= 0;
    const total = Math.max(1, (pause.mins || 1) * 60000);
    const prog = Math.min(100, Math.max(0, (1 - left / total) * 100));
    return (
      <div className="flow-pause">
        <div className="flow-pause-kick">{over ? "PAUSE TERMINÉE" : "EN PAUSE"}</div>
        <div className="flow-pause-emoji">{over ? "💪" : "🌙"}</div>
        <div className="flow-pause-label">{pause.label}</div>
        {over
          ? <div className="flow-count over">On y retourne.</div>
          : <><div className="flow-count">{fmtLeft(left)}</div><div className="flow-pause-until">reprise à <b>{clockOf(pause.until)}</b></div></>}
        <div className="flow-ring"><i style={{ width: prog + "%" }} /></div>
        <div className="flow-cta"><button className="btn block" onClick={flowResume}>{over ? "Reprendre 💪" : "Reprendre maintenant"}</button></div>
        {!over && <div className="flow-pause-add"><button onClick={() => flowExtend(5)}>+5 min</button><button onClick={() => flowExtend(15)}>+15 min</button></div>}
      </div>
    );
  }

  /* ===== Programme du jour ===== */
  const ph = phaseMeta()[phaseOf(tk)];
  const dl = nextDeadline(tk); const dlN = dl ? daysTo(tk, dl.dk) : null;
  const pct = nTotal ? Math.round(nDone / nTotal * 100) : 0;
  const doneList = blocks.filter(b => b.done && b.kind !== "pause" && b.kind !== "event");

  return (
    <>
      <div className="flow-head">
        <div>
          <div className="flow-kick">FLOW · <b>{clockOf(now)}</b></div>
          <div className="flow-date">{frDate(tk)}</div>
        </div>
        <span className="phasechip" style={{ background: ph.color }}>{ph.label}</span>
      </div>

      {dl && dlN <= 10 && (
        <button className="flow-dl" onClick={() => patch({ world: "prepa", tab: "today" })}>
          <span>{dl.icon}</span><span className="flow-dl-t">{dl.label}</span>
          <span className="flow-dl-n">{dlN === 0 ? "aujourd'hui" : "J−" + dlN}</span>
        </button>
      )}

      <div className="flow-prog">
        <div className="flow-prog-bar"><i style={{ width: pct + "%" }} /></div>
        <span>{nDone}/{nTotal}</span>
      </div>

      {allDone ? (
        <div className="flow-win">
          <div className="flow-win-e">👑</div>
          <div className="flow-win-t">Programme du jour bouclé</div>
          <div className="flow-win-s">Tout est fait, {S.profile?.name || "monstre"}. Repos mérité — ou prends de l'avance.</div>
          <div className="flow-cta">
            <button className="btn ghost" onClick={() => patch({ world: "home" })}>Tableau de bord</button>
            <button className="btn ghost" onClick={flowRestart}>Recommencer</button>
          </div>
        </div>
      ) : (
        <div className={"flow-hero k-" + head.kind}>
          <div className="flow-eyebrow">
            <span className="flow-tag" style={{ color: KIND[head.kind].col, borderColor: KIND[head.kind].col }}>{head.urgent ? "⚡ maintenant" : KIND[head.kind].tag}</span>
            {head.mins > 0 && <span className="flow-dur">≈ {durTxt(head.mins)}</span>}
          </div>
          <div className="flow-emoji">{head.emoji}</div>
          <div className="flow-title">{head.title}</div>
          {head.sub && head.sub !== KIND[head.kind].tag && <div className="flow-sub">{head.sub}</div>}
          <div className="flow-cta">
            {head.kind === "pause"
              ? <button className="btn block" onClick={() => take(head)}>Prendre ma pause · {head.mins} min</button>
              : head.kind === "event"
                ? <button className="btn block" onClick={() => open(head)}>Ouvrir l'agenda →</button>
                : <>
                    <button className="btn" onClick={() => done(head)}>Fait ✓</button>
                    {head.go && <button className="btn ghost" onClick={() => open(head)}>Ouvrir →</button>}
                  </>}
          </div>
          <button className="flow-skip" onClick={() => flowSkip(head.id)}>{head.kind === "pause" ? "pas de pause, je continue" : "passer"}</button>
        </div>
      )}

      {upnext.length > 0 && (
        <div className="flow-next">
          <div className="flow-next-h">À suivre</div>
          {upnext.map(b => (
            <button key={b.id} className="flow-nx" onClick={() => tap(b)}>
              <span className="flow-nx-e">{b.emoji}</span>
              <span className="flow-nx-t">{b.title}</span>
              <span className="flow-nx-d" style={{ color: KIND[b.kind].col }}>{b.kind === "pause" ? "pause" : b.mins > 0 ? durTxt(b.mins) : "→"}</span>
            </button>
          ))}
        </div>
      )}

      {!allDone && (
        <div className="flow-pausebar">
          <span className="flow-pb-l">☕ Une pause ?</span>
          {[15, 30, 60, 120].map(m => <button key={m} onClick={() => flowPause(m, "Pause")}>{m < 60 ? m + " min" : m / 60 + " h"}</button>)}
        </div>
      )}

      {doneList.length > 0 && (
        <div className="flow-doneline">✓ {doneList.length} fait{doneList.length > 1 ? "s" : ""} aujourd'hui · <button onClick={flowRestart}>recommencer</button></div>
      )}
    </>
  );
}
