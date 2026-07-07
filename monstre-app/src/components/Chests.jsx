import { useEffect, useRef, useState } from "react";
import { useGame } from "../game.jsx";
import { chestRoad, ULTIME } from "../lib/chests.js";
import { confetti, toast } from "../fx.js";

/* Chemin de récompenses (façon Brawl Stars) : barre de progression + rangée
 * de coffres. Un coffre "prêt" pulse et s'ouvre au clic avec une animation. */
export default function Chests() {
  const { S, openChest } = useGame();
  const total = (S.xp || 0) + ((S.skills && S.skills.xp) || 0);
  const road = chestRoad(total, S.chests && S.chests.opened);

  // overlay d'ouverture : { chest, phase: 'shake' | 'reveal' }
  const [open, setOpen] = useState(null);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const trackRef = useRef(null);
  // centre la vue sur le prochain coffre à viser
  useEffect(() => {
    const el = trackRef.current; if (!el) return;
    const target = el.querySelector(".chest.ready") || el.querySelector(".chest.next");
    if (target) el.scrollTo({ left: target.offsetLeft - 90, behavior: "smooth" });
  }, [road.readyCount, road.nextLocked && road.nextLocked.id]);

  function launch(chest) {
    if (!chest.ready || open) return;
    timers.current.forEach(clearTimeout); timers.current = [];
    setOpen({ chest, phase: "shake" });
    const burst = chest.ultimate ? 120 : chest.rarity === "royal" || chest.rarity === "legend" || chest.rarity === "infernal" ? 70 : 40;
    timers.current.push(setTimeout(() => {
      setOpen({ chest, phase: "reveal" });
      confetti(burst);
      openChest(chest.id);
    }, 1150));
  }
  const close = () => { timers.current.forEach(clearTimeout); timers.current = []; setOpen(null); };

  const readyLabel = road.readyCount > 0
    ? `${road.readyCount} coffre${road.readyCount > 1 ? "s" : ""} à ouvrir 🎉`
    : road.nextLocked
      ? `Prochain coffre dans ${road.nextLocked.xp - total} XP`
      : "Tous les coffres ouverts 👑";

  return (
    <div className="reward-road">
      <div className="rr-head">
        <div className="rr-left">
          <div className="rr-eyebrow">Chemin de récompenses</div>
          <div className="rr-xp">{total}<small>XP total</small></div>
        </div>
        <div className={"rr-next" + (road.readyCount ? " hot" : "")}>{readyLabel}</div>
      </div>

      <div className="rr-bar">
        <div className="rr-fill" style={{ width: road.pct + "%" }} />
        {road.nextLocked && (
          <div className="rr-goal" title={road.nextLocked.name}>{road.nextLocked.emoji}</div>
        )}
      </div>

      <div className="chest-track" ref={trackRef}>
        {road.chests.map(c => {
          const cls = "chest " + c.rarity + (c.ready ? " ready" : c.opened ? " opened" : " locked")
            + (road.nextLocked && c.id === road.nextLocked.id ? " next" : "");
          return (
            <button key={c.id} className={cls} onClick={() => launch(c)} disabled={!c.ready}
              style={{ "--glow": c.glow }}>
              <div className="chest-ic">{c.opened ? "✅" : c.ready ? c.emoji : c.ultimate ? "❓" : c.emoji}</div>
              <div className="chest-name">{c.ultimate && !c.opened ? "???" : c.name}</div>
              <div className="chest-req">{c.opened ? "ouvert" : c.ready ? "OUVRIR" : c.xp + " XP"}</div>
            </button>
          );
        })}
      </div>

      {open && (
        <div className={"chest-overlay" + (open.phase === "reveal" ? " revealed" : "")} onClick={open.phase === "reveal" ? close : undefined}>
          <div className="chest-stage" style={{ "--glow": open.chest.glow }}>
            {open.phase === "shake" ? (
              <div className="chest-big shaking">{open.chest.emoji}</div>
            ) : open.chest.ultimate ? (
              <UltimeCard onClose={close} />
            ) : (
              <RewardCard chest={open.chest} onClose={close} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RewardCard({ chest, onClose }) {
  return (
    <div className={"reward-card " + chest.rarity}>
      <div className="rc-burst">{chest.emoji}</div>
      <div className="rc-rarity">{chest.name}</div>
      <div className="rc-title">{chest.reward.title}</div>
      {chest.reward.lines.map((l, i) => <p key={i} className="rc-line">{l}</p>)}
      <button className="btn primary rc-btn" onClick={onClose}>Récupérer ✨</button>
    </div>
  );
}

function UltimeCard({ onClose }) {
  const [seq, setSeq] = useState(0); // révélation en 2 temps pour le suspense
  useEffect(() => { const t = setTimeout(() => setSeq(1), 700); return () => clearTimeout(t); }, []);
  useEffect(() => { toast("Coffre Ultime ouvert. 🖤"); }, []);
  return (
    <div className="ultime-card">
      <div className="uc-key">🗝️</div>
      <div className="uc-eyebrow">Récompense ultime · secrète</div>
      {seq === 0 ? (
        <div className="uc-loading">déverrouillage…</div>
      ) : (
        <div className="uc-body">
          <div className="uc-to">Pour {ULTIME.to},</div>
          {ULTIME.lines.map((l, i) => <p key={i} className="uc-line">{l}</p>)}
          <div className="uc-sign">{ULTIME.sign}</div>
          <button className="btn primary uc-btn" onClick={onClose}>🖤</button>
        </div>
      )}
    </div>
  );
}
