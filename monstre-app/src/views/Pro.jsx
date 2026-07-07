import { useEffect } from "react";
import { useGame } from "../game.jsx";
import { usePeersAuto } from "../store.js";
import Asso from "./pro/Asso.jsx";
import Lucid from "./pro/Lucid.jsx";
import Work from "./pro/Work.jsx";

const TABS = [["asso", "🪟 Lucarnepro"], ["lucid", "🚀 LUCID"], ["work", "⏱️ Deep Work"]];

/* Monde "Pro" (néon-nuit) — coquille : garde les pairs frais (totaux équipe,
 * comme le Classement), réconcilie le minuteur au retour, et route les 3 onglets. */
export default function Pro() {
  const { ui, setTab, reconcileTimer } = useGame();
  usePeersAuto(true);
  useEffect(() => {
    reconcileTimer();
    const onVis = () => { if (!document.hidden) reconcileTimer(); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const tab = ["asso", "lucid", "work"].includes(ui.tab) ? ui.tab : "asso";
  const V = { asso: Asso, lucid: Lucid, work: Work }[tab];
  return (
    <>
      <div className="pro-sub">
        {TABS.map(([id, l]) => <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>{l}</button>)}
      </div>
      <V />
    </>
  );
}
