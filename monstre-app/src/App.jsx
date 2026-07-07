import { useEffect, useState } from "react";
import { useGame } from "./game.jsx";
import { useSync, useLogged, initApp, myId } from "./store.js";
import { toast } from "./fx.js";
import { todayKey, daysTo } from "./lib/util.js";
import { RENTREE, phaseOf, PHASE_META } from "./lib/config.js";
import Home from "./views/Home.jsx";
import Flow from "./views/Flow.jsx";
import Coeur from "./views/Coeur.jsx";
import CoeurCouple from "./views/CoeurCouple.jsx";
import Prepa from "./views/Prepa.jsx";
import Agenda from "./views/Agenda.jsx";
import Rank from "./views/Rank.jsx";
import Pro from "./views/Pro.jsx";
import Login from "./components/Login.jsx";
import Modal from "./components/Modal.jsx";
import Settings from "./components/Settings.jsx";
import NightGuard from "./components/NightGuard.jsx";
import StudyTimer from "./components/StudyTimer.jsx";
import Fx from "./components/Fx.jsx";

function Appbar({ onSettings, pdark, onToggleDark }) {
  const { S, ui, setWorld } = useGame(); const sync = useSync();
  const tk = todayKey(); const ph = PHASE_META[phaseOf(tk)];
  const dLeft = Math.max(0, daysTo(tk, RENTREE));
  const dot = sync.cloud === "pending" ? "pending" : sync.cloud === "err" ? "err" : "ok";
  const pr = S.profile || {};
  return (
    <div className="appbar">
      <div className="abtop">
        <div className="ab-brand">
          {ui.world === "prepa"
            ? <span>MONSTRE <span style={{ fontWeight: 500, fontSize: 12, color: "var(--pencil)" }}>· PCSI Stanislas</span></span>
            : <span><span className="g">MONSTRE</span> 👹🌴</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {ui.world === "prepa" && <span className="phasechip" style={{ background: ph.color }}>{ph.label}</span>}
          <div className="ab-count">J−{dLeft}<small>avant la rentrée</small></div>
        </div>
      </div>
      <div className="abchips">
        <button className="chipbtn" onClick={onSettings}><span className="mini-status"><span className={"sd " + dot} /></span> ⚙️ Réglages</button>
        {ui.world === "prepa" && <button className="chipbtn" onClick={onToggleDark} title="Mode sombre prépa">{pdark ? "☀️ Clair" : "🌙 Sombre"}</button>}
        {(pr.pseudo || myId()) && <button className="chipbtn" onClick={() => setWorld("rank")}>{pr.avatar || "⭐"} {pr.name || myId()}</button>}
      </div>
    </div>
  );
}

function WorldNav() {
  const { ui, setWorld } = useGame();
  const items = [["home", "🏠", "Accueil"], ["flow", "🌀", "Flow"], ["coeur", "❤️", "Cœur"], ["prepa", "📓", "Prépa"], ["pro", "💼", "Pro"], ["agenda", "🗓️", "Planning"], ["rank", "🏆", "Classement"]];
  return (
    <div className="worldnav"><div className="inner">
      {items.map(([id, ic, l]) => (
        <button key={id} className={ui.world === id ? "on" : ""} onClick={() => setWorld(id)}>
          <span className="ic">{ic}</span>{l}
        </button>
      ))}
    </div></div>
  );
}

export default function App() {
  const { S, ui, patch } = useGame();
  const logged = useLogged();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pdark, setPdark] = useState(() => { try { return localStorage.getItem("monstre.pdark") === "1"; } catch { return false; } });

  useEffect(() => { document.body.classList.toggle("paper", logged && ui.world === "prepa"); }, [ui.world, logged]);
  useEffect(() => { document.body.classList.toggle("pdark", pdark); try { localStorage.setItem("monstre.pdark", pdark ? "1" : "0"); } catch { /* privé/quota */ } }, [pdark]);
  // Deep-link : #coeur ou #prepa:brain ouvrent directement le bon écran.
  useEffect(() => {
    const h = decodeURIComponent(location.hash.slice(1)); if (!h) return;
    const [w, t] = h.split(":");
    if (["home", "flow", "coeur", "prepa", "pro", "agenda", "rank"].includes(w)) patch({ world: w, ...(t ? { tab: t } : {}) });
  }, [patch]);
  useEffect(() => {
    let alive = true;
    initApp().then(res => { if (alive && res && res.pen) setTimeout(() => toast("Hier : 0 action de courage. −" + res.pen.lost + " XP, streak à zéro. La flippe adore ça — aujourd'hui tu bouges. 👊"), 800); });
    return () => { alive = false; };
  }, []);

  if (!logged) return (<><Login /><Fx /></>);

  return (
    <>
      {ui.world === "prepa" && <div className="p-margin" />}
      <div id="app">
        <Appbar onSettings={() => setSettingsOpen(true)} pdark={pdark} onToggleDark={() => setPdark(v => !v)} />
        {ui.world === "home" ? <Home />
          : ui.world === "flow" ? <Flow />
          : ui.world === "coeur" ? (S.couple === true ? <CoeurCouple /> : <Coeur />)
            : ui.world === "pro" ? <Pro />
            : ui.world === "agenda" ? <Agenda />
              : ui.world === "rank" ? <Rank />
                : <Prepa />}
        <WorldNav />
      </div>
      <StudyTimer />
      <Modal />
      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
      <NightGuard />
      <Fx />
    </>
  );
}
