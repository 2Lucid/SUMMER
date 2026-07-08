import { useGame } from "../../game.jsx";
import { todayKey, daysTo, addDays, frDate } from "../../lib/util.js";
import { buildChecklist, rampOf, deadlines, todos, DEADLINE_XP } from "../../lib/config.js";

export default function Today() {
  const { S, toggleDay, doTodo, markDeadline } = useGame();
  const tk = todayKey(); const list = buildChecklist(tk); const ch = S.days[tk] || {};
  const nDone = list.filter(it => ch[it.id]).length; const pct = Math.round(nDone / list.length * 100); const r = rampOf(tk);
  const done = S.deadlinesDone || {};
  const next = deadlines().filter(d => d.dk >= addDays(tk, -4)).slice(0, 4); const openTodos = todos().filter(t => !S.todos[t.id]);

  return (
    <>
      <div className="p-h">{frDate(tk)}</div>
      <div className="p-sub">Cible : réveil <b className="p-red">{r.wake}</b> · coucher <b className="p-red">{r.bed}</b></div>
      <div className="plan-cols">
        <div>
          {next.length > 0 && (
            <div className="p-card red">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <span className="p-card-title">Devoirs à rendre</span>
                <span className="pen p-red" style={{ fontSize: 15 }}>coche = +{DEADLINE_XP} XP</span>
              </div>
              {next.map(d => { const n = daysTo(tk, d.dk); const dn = !!done[d.dk]; return (
                <button key={d.dk} className={"p-item" + (dn ? " done" : "")} onClick={() => markDeadline(d.dk)}>
                  <span className={"p-check" + (dn ? " on" : "")}>{dn ? "✓" : ""}</span>
                  <span className="lab">{d.icon} {d.label} <b className="p-red">{dn ? "· rendu ✓" : n === 0 ? "· aujourd'hui !" : n < 0 ? "· en retard" : "· J−" + n}</b></span>
                </button>); })}
            </div>
          )}
          <div className="p-card ink">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span className="p-card-title">Checklist du jour</span>
              <span className="pen" style={{ fontSize: 19, color: pct >= 100 ? "var(--green)" : "var(--bic)" }}>{pct >= 100 ? "vu, parfait ✓" : nDone + "/" + list.length}</span>
            </div>
            {list.map(it => { const on = !!ch[it.id]; return (
              <button key={it.id} className={"p-item" + (on ? " done" : "")} onClick={() => toggleDay(it.id)}>
                <span className={"p-check" + (on ? " on" : "")}>{on ? "✓" : ""}</span><span className="lab">{it.label}</span>
              </button>); })}
            <div className="p-progress"><i style={{ width: pct + "%", background: pct >= 100 ? "var(--green)" : "var(--bic)" }} /></div>
          </div>
        </div>
        <div>
          {openTodos.length > 0 && (
            <div className="p-card"><div className="p-card-title" style={{ marginBottom: 4 }}>À faire une fois <span className="p-red">({openTodos.length})</span></div>
              {openTodos.map(t => <button key={t.id} className="p-item" onClick={() => doTodo(t.id)}><span className="p-check" /><span className="lab" style={{ fontSize: 13 }}>{t.label}</span></button>)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
