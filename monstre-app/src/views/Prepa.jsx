import { useGame } from "../game.jsx";
import Today from "./prepa/Today.jsx";
import Planning from "./prepa/Planning.jsx";
import Exam from "./prepa/Exam.jsx";
import Drill from "./prepa/Drill.jsx";
import Flash from "./prepa/Flash.jsx";
import Brain from "./prepa/Brain.jsx";
import Sleep from "./prepa/Sleep.jsx";

const TABS = [["today", "📋 Jour"], ["planning", "🗓️ Planning"], ["exam", "📝 Contrôle"], ["drill", "⚡ Drill"], ["flash", "🃏 Par cœur"], ["brain", "🧠 Cerveau"], ["sleep", "🌙 Sommeil"]];

export default function Prepa() {
  const { ui, setTab } = useGame();
  const V = { today: Today, planning: Planning, exam: Exam, drill: Drill, flash: Flash, brain: Brain, sleep: Sleep }[ui.tab] || Today;
  return (
    <>
      <div className="p-tabstrip">
        {TABS.map(([id, l]) => <button key={id} className={"p-tab " + (ui.tab === id ? "on" : "")} onClick={() => setTab(id)}>{l}</button>)}
      </div>
      <V />
    </>
  );
}
