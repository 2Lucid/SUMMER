import { useState, useEffect } from "react";
import { useGame } from "../game.jsx";
import * as STU from "../lib/study.js";

/* Bouton flottant présent sur TOUTES les pages : lance/arrête le chrono de
 * travail prépa. Au repos = pastille discrète « Bosser ». En cours = horloge
 * qui défile + point qui pulse ; un clic l'arrête et enregistre la session. */
export default function StudyTimer() {
  const { S, studyStart, studyStop } = useGame();
  const running = !!(S.study && S.study.running);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running) return;
    setNow(Date.now());                       // recale tout de suite à l'ouverture
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  const live = running ? STU.runMs(S, now) : 0;

  return (
    <div className={"study-fab" + (running ? " on" : "")}>
      {running ? (
        <button className="stf-main" onClick={studyStop} title="Arrêter et enregistrer le temps">
          <span className="stf-dot" />
          <span className="stf-clock">{STU.clock(live)}</span>
          <span className="stf-stop">⏹</span>
        </button>
      ) : (
        <button className="stf-main" onClick={studyStart} title="Lancer le chrono de travail prépa">
          <span className="stf-ic">⏱️</span>
          <span className="stf-lbl">Bosser</span>
        </button>
      )}
    </div>
  );
}
