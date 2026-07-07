import { useEffect, useRef, useState } from "react";
import { onFx } from "../fx.js";
import { LEVELS } from "../lib/coeur.js";

function spawnConfetti(n) {
  const colors = ["#ff3d8b", "#ff8e3c", "#ffd166", "#35e0d0", "#f6f2ff"];
  for (let i = 0; i < n; i++) {
    const c = document.createElement("div"); c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDuration = (1.6 + Math.random() * 1.6) + "s";
    c.style.animationDelay = (Math.random() * 0.4) + "s";
    document.body.appendChild(c); setTimeout(() => c.remove(), 3600);
  }
}

export default function Fx() {
  const [toast, setToast] = useState(null);
  const [lvl, setLvl] = useState(null);
  const timer = useRef();
  useEffect(() => {
    const offT = onFx("toast", msg => { setToast({ msg, k: Date.now() + Math.random() }); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(null), 2600); });
    const offC = onFx("confetti", spawnConfetti);
    const offL = onFx("levelup", setLvl);
    return () => { offT(); offC(); offL(); clearTimeout(timer.current); };
  }, []);
  return (
    <>
      {toast && <div key={toast.k} className="toast show">{toast.msg}</div>}
      {lvl != null && (
        <div className="levelup" onClick={() => setLvl(null)}>
          <div className="inner">
            <div className="lu-eyebrow">Level up</div>
            <div className="lu-lvl">NIV. {lvl + 1}</div>
            <div className="lu-title">{LEVELS[lvl].t}</div>
            <div className="lu-tap">toucher pour continuer</div>
          </div>
        </div>
      )}
    </>
  );
}
