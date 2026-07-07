import { useGame } from "../game.jsx";
import { ACTIONS, has } from "../lib/coeur.js";

export default function Modal() {
  const { S, ui, patch, closeModal, logAction } = useGame();
  if (!ui.modal) return null;
  const q = S.quests.find(x => x.id === ui.modal.questId) || null;
  let types;
  if (!q) types = ["irl"];
  else if (q.status === "couple") types = ["convo", "date"];
  else types = ["message", "convo", "proposer", "date", "rateau", "couple"].filter(t => !(ACTIONS[t].once && has(S, q, t)));
  const needFear = ui.selAction && ACTIONS[ui.selAction].fear;
  const fe = ui.fear <= 3 ? "😌" : ui.fear <= 6 ? "😬" : ui.fear <= 8 ? "😰" : "💀";

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
      <div className="sheet">
        <h3>Loguer une action</h3>
        <div className="for">{q ? "Quête : " + q.emoji + " " + q.name : "Hors quête — courage général ⚡"}</div>
        <div className="actlist">
          {types.map(t => { const a = ACTIONS[t]; const cls = a.legendary ? "leg" : a.boss ? "boss" : "";
            return (
              <button key={t} className={"actbtn" + (ui.selAction === t ? " sel" : "")} onClick={() => patch({ selAction: t })}>
                <span className="aemoji">{a.emoji}</span>
                <span><div className="alabel">{a.label}</div><div className="atag">{a.tag}</div></span>
                <span className={"axp " + cls}>+{a.xp}</span>
              </button>
            );
          })}
        </div>
        {needFear && (
          <div className="fearbox">
            <label>Niveau de flippe juste avant <span className="fearval">{fe} {ui.fear}/10</span></label>
            <input type="range" min="1" max="10" value={ui.fear} onChange={e => patch({ fear: Number(e.target.value) })} />
          </div>
        )}
        <div className="sheetrow">
          <button className="btn ghost" onClick={closeModal}>Annuler</button>
          <button className="btn" disabled={!ui.selAction} style={ui.selAction ? undefined : { opacity: 0.45 }}
            onClick={() => { if (!ui.selAction) return; const a = ACTIONS[ui.selAction]; logAction(q ? q.id : null, ui.selAction, a.fear ? ui.fear : null); }}>
            Valider
          </button>
        </div>
      </div>
    </div>
  );
}
