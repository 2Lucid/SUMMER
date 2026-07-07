import { useEffect, useRef, useState } from "react";
import { useGame } from "../game.jsx";
import { usePeers, myId } from "../store.js";
import { teamAgg, proChestRoad, ENTITIES } from "../lib/work.js";
import { confetti } from "../fx.js";

/* Chemin de récompenses d'ÉQUIPE pour une entité Pro (Lucarnepro / LUCID).
 * Paliers déclenchés par l'XP cumulée de l'équipe ; chacun ouvre sa propre copie
 * (stockée dans son S.work.chests, ids namespacés "asso:2" / "lucid:0"). */
export default function ProChests({ entity }) {
  const { S, openProChest } = useGame();
  const peers = usePeers();
  const agg = teamAgg(peers, myId(), S);
  const teamXp = entity === "asso" ? agg.asso.xp : agg.lucid.xp;
  const road = proChestRoad(teamXp, (S.work && S.work.chests) || [], entity);
  const ent = ENTITIES[entity];

  const [open, setOpen] = useState(null); // { chest, phase:'shake'|'reveal' }
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const trackRef = useRef(null);
  useEffect(() => {
    const el = trackRef.current; if (!el) return;
    const t = el.querySelector(".chest.ready") || el.querySelector(".chest.next");
    if (t) el.scrollTo({ left: t.offsetLeft - 90, behavior: "smooth" });
  }, [road.readyCount, road.nextLocked && road.nextLocked.id]);

  function launch(c) {
    if (!c.ready || open) return;
    timers.current.forEach(clearTimeout); timers.current = [];
    setOpen({ chest: c, phase: "shake" });
    timers.current.push(setTimeout(() => { setOpen({ chest: c, phase: "reveal" }); confetti(c.id >= 5 ? 80 : 50); openProChest(entity, c.id); }, 1100));
  }
  const close = () => { timers.current.forEach(clearTimeout); timers.current = []; setOpen(null); };

  const label = road.readyCount > 0
    ? `${road.readyCount} coffre${road.readyCount > 1 ? "s" : ""} à ouvrir 🎉`
    : road.nextLocked ? `Prochain palier dans ${road.nextLocked.xp - teamXp} XP` : "Tous les paliers atteints 👑";

  return (
    <div className="reward-road" style={{ "--ent": ent.accentHex }}>
      <div className="rr-head">
        <div className="rr-left">
          <div className="rr-eyebrow">Paliers d'équipe · {ent.name}</div>
          <div className="rr-xp">{teamXp}<small>XP équipe</small></div>
        </div>
        <div className={"rr-next" + (road.readyCount ? " hot" : "")}>{label}</div>
      </div>

      <div className="rr-bar">
        <div className="rr-fill" style={{ width: road.pct + "%" }} />
        {road.nextLocked && <div className="rr-goal" title={road.nextLocked.name}>{road.nextLocked.emoji}</div>}
      </div>

      <div className="chest-track" ref={trackRef}>
        {road.chests.map(c => {
          const cls = "chest " + (c.ready ? "ready" : c.opened ? "opened" : "locked") + (road.nextLocked && c.id === road.nextLocked.id ? " next" : "");
          return (
            <button key={c.id} className={cls} onClick={() => launch(c)} disabled={!c.ready} style={{ "--glow": c.glow }}>
              <div className="chest-ic">{c.opened ? "✅" : c.emoji}</div>
              <div className="chest-name">{c.name}</div>
              <div className="chest-req">{c.opened ? "ouvert" : c.ready ? "OUVRIR" : c.xp + " XP"}</div>
            </button>
          );
        })}
      </div>

      {open && (
        <div className={"chest-overlay" + (open.phase === "reveal" ? " revealed" : "")} onClick={open.phase === "reveal" ? close : undefined}>
          <div className="chest-stage" style={{ "--glow": open.chest.glow }}>
            {open.phase === "shake"
              ? <div className="chest-big shaking">{open.chest.emoji}</div>
              : (
                <div className="reward-card">
                  <div className="rc-burst">{open.chest.emoji}</div>
                  <div className="rc-rarity">{open.chest.name}</div>
                  <div className="rc-title">{open.chest.reward.title}</div>
                  {open.chest.reward.lines.map((l, i) => <p key={i} className="rc-line">{l}</p>)}
                  <button className="btn primary rc-btn" onClick={close}>Récupérer ✨</button>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
