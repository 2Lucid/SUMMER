import { useEffect, useRef } from "react";
import { useS, usePeersAuto, refreshPeers, myId } from "../store.js";
import { useGame } from "../game.jsx";
import { peerStats } from "../lib/rank.js";
import { botEntry } from "../lib/bots.js";
import { confetti, toast } from "../fx.js";
import Chests from "../components/Chests.jsx";

export default function Rank() {
  const S = useS();
  const { syncBots, setBotsOn } = useGame();
  const peers = usePeersAuto(true);
  const me = myId();
  const fired = useRef(false);
  const botsOn = S.botsOn !== false;

  useEffect(() => { syncBots(); }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  let list = peers.map(peerStats);
  if (!list.some(e => e.id === me)) list.push(peerStats({ id: me, d: S, updated: null }));
  if (botsOn) list = list.concat((S.bots || []).map(botEntry));
  list.sort((a, b) => b.total - a.total || b.study - a.study || b.coeurStreak - a.coeurStreak);
  const loading = peers.length === 0;
  const myI = list.findIndex(e => e.id === me);

  useEffect(() => {
    if (myI === 0 && !loading && !fired.current) { fired.current = true; const t = setTimeout(() => confetti(40), 250); return () => clearTimeout(t); }
  }, [myI, loading]);

  let youLine = null;
  if (myI >= 0 && !loading) {
    if (myI === 0) youLine = <div className="you-line">👑 Tu es <b>en tête du classement</b>. Tout le monde te court après. Un point de relâche et c'est la chute — reste devant.</div>;
    else { const ahead = list[myI - 1], gap = ahead.total - list[myI].total; youLine = <div className="you-line">Tu es <b>#{myI + 1}</b>. Plus que <b>{gap} XP</b> pour doubler {ahead.avatar + " " + ahead.name}. C'est une série de drill + une action de courage. Go. 👊</div>; }
  }

  const refresh = async () => { await refreshPeers(); toast("Classement à jour ✨"); };

  return (
    <>
      <div className="rank-hero"><div className="rh-title">🏆 Classement</div><div className="rh-sub">{loading ? "Chargement…" : list.length + " monstre(s) dans la course — toi vs tous les connectés"}</div></div>
      <Chests />
      <div className="lb-sec">Le classement</div>
      <div className="pact"><span className="pe">🤝</span><div><div className="pt">La confiance règne.</div><div className="ps">On gagne jamais l'XP pour rien. Chaque point ici, c'est du vrai taf : un drill, un contrôle, une action de courage. Se gonfler l'XP, c'est se mentir à soi — et se faire doubler pour de faux. On joue franc.</div></div></div>
      {youLine}
      {loading
        ? <div className="lb-loading">☁️ On récupère le classement…</div>
        : list.map((e, i) => {
          const isMe = e.id === me;
          return (
            <div key={e.id} className={"lbrow" + (isMe ? " me" : "") + (i === 0 ? " top1" : "") + (e.bot ? " bot" : "")}>
              <div className="lb-rank">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i + 1)}</div>
              <div className="lb-ava">{e.avatar}</div>
              <div className="lb-main">
                <div className="lb-name">{e.name}{isMe && <span className="metag">toi</span>}{e.bot && <span className="bottag">🤖 rival</span>}</div>
                <div className="lb-chips"><span>Niv. {e.lvl + 1}</span><span>❤️ {e.coeurStreak}🔥</span><span>📓 {e.study}🔥</span>{e.proStreak > 0 && <span>💼 {e.proStreak}🔥</span>}{e.chests > 0 && <span className="c-chip">🎁 {e.chests}</span>}<span>📓 {e.xpPrepa} · ❤️ {e.xpCoeur}</span></div>
              </div>
              <div className="lb-xp"><b>{e.total}</b><small>XP TOTAL</small></div>
            </div>
          );
        })}
      {botsOn && <div className="bots-note">🤖 Les « rivaux » s'adaptent à ton niveau d'XP pour te pousser en continu — bosse fort, tu les doubles ; relâche, ils te rattrapent.</div>}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        <button className="btn ghost small" onClick={refresh}>↻ Rafraîchir</button>
        <button className="btn ghost small" onClick={() => setBotsOn(!botsOn)}>{botsOn ? "🤖 Rivaux : ON" : "🤖 Rivaux : OFF"}</button>
      </div>
    </>
  );
}
