import { useRef, useState } from "react";
import { useSync, useS, SB, sbReady, exportSave, importSave, connectSupabase, disconnectSupabase, logout, myId } from "../store.js";
import { useGame } from "../game.jsx";
import { toast } from "../fx.js";

export default function Settings({ onClose }) {
  const sync = useSync();
  const S = useS();
  const { setCouple } = useGame();
  const isCouple = S.couple === true;
  const pr = S.profile || {};
  const [url, setUrl] = useState(SB.url);
  const [key, setKey] = useState(SB.key);
  const [player, setPlayer] = useState(SB.player);
  const fileRef = useRef();
  const ok = sbReady() && sync.cloud !== "err";
  const [ngOn, setNgOn] = useState(() => { try { return localStorage.getItem("monstre.ng") !== "0"; } catch { return true; } });
  const [bedtime, setBedtime] = useState(() => { try { return localStorage.getItem("monstre.bedtime") || "23:00"; } catch { return "23:00"; } });
  const saveNg = (on, bed) => { setNgOn(on); setBedtime(bed); try { localStorage.setItem("monstre.ng", on ? "1" : "0"); localStorage.setItem("monstre.bedtime", bed); } catch { /* privé */ } };

  const doConnect = async () => {
    const r = await connectSupabase(url, key, player);
    if (r.ok) toast("☁️ Connecté — sauvegarde envoyée.");
    else if (r.reason === "missing") toast("Il me faut l'URL et la clé");
    else toast("Échec : table manquante, clé invalide, ou réseau bloqué");
  };
  const doDisconnect = async () => { await disconnectSupabase(); setUrl(""); setKey(""); toast("Supabase déconnecté"); };
  const doImport = f => importSave(f, good => toast(good ? "Sauvegarde restaurée ✨" : "Fichier invalide"));
  const doLogout = async () => { const ok = await logout(); if (ok) onClose(); };

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet">
        {(pr.pseudo || myId()) && (
          <div className="set-hero" style={{ marginBottom: 14 }}>
            <span className="sh-ic">{pr.avatar || "⭐"}</span>
            <div>
              <div className="sh-t">{pr.name || myId()}</div>
              <div className="sh-s">Connecté en tant que « {myId()} ». Ta progression est sauvegardée dans le cloud sous ce pseudo.</div>
              <div className="sheetrow"><button className="btn ghost set-danger" onClick={doLogout}>Se déconnecter</button></div>
            </div>
          </div>
        )}
        <h3>Sauvegarde</h3>
        <div className={"set-hero" + (ok ? "" : " off")}>
          <span className="sh-ic">{ok ? "☁️" : "💾"}</span>
          <div>
            <div className="sh-t">{ok ? "Sauvegarde cloud active" : "Sauvegarde sur cet appareil"}</div>
            <div className="sh-s">{ok
              ? "Ta progression est synchronisée automatiquement, sur tous tes appareils. Tu peux fermer et rouvrir sans rien perdre."
              : sbReady() ? "Cloud configuré mais injoignable ici — tes données restent sur cet appareil."
                : "Tout est gardé sur cet appareil."}</div>
          </div>
        </div>
        <div className="sheetrow"><button className="btn ghost block" onClick={exportSave}>💾 Télécharger une copie de secours</button></div>

        <h3 style={{ marginTop: 18 }}>Cœur</h3>
        <div className="set-hero">
          <span className="sh-ic">{isCouple ? "💞" : "🔥"}</span>
          <div>
            <div className="sh-t">{isCouple ? "En couple" : "Célibataire"}</div>
            <div className="sh-s">Le monde Cœur s'adapte : {isCouple ? "entretien & croissance de la relation (compte affectif, principes, love map)." : "courage & rencontres (funnel, boss de la flippe)."}</div>
            <div className="sheetrow"><button className="btn ghost" onClick={() => setCouple(!isCouple)}>{isCouple ? "Repasser en célibataire" : "🎬 Voir le mode couple 💞"}</button></div>
          </div>
        </div>
        <h3 style={{ marginTop: 18 }}>Garde de nuit</h3>
        <div className={"set-hero" + (ngOn ? "" : " off")}>
          <span className="sh-ic">{ngOn ? "🚨" : "😴"}</span>
          <div>
            <div className="sh-t">{ngOn ? "Couvre-feu actif" : "Couvre-feu désactivé"}</div>
            <div className="sh-s">Passé l'heure de coucher, des messages bien méchants popent partout à l'écran pour te dégoûter de rester debout — sans bloquer ce que tu fais. Le sommeil, c'est là que la prépa rentre vraiment.</div>
            <div className="set-field" style={{ marginTop: 10 }}>
              <label>Heure de coucher</label>
              <input type="time" value={bedtime} onChange={e => saveNg(ngOn, e.target.value)} />
            </div>
            <div className="sheetrow"><button className="btn ghost" onClick={() => saveNg(!ngOn, bedtime)}>{ngOn ? "Désactiver la garde de nuit" : "Activer la garde de nuit"}</button></div>
          </div>
        </div>

        <details className="set-adv">
          <summary>Réglages avancés (cloud, import)</summary>
          <div className="set-note" style={{ marginTop: 4 }}>Le cloud est déjà configuré — inutile d'y toucher. Ne modifie ça que si tu sais ce que tu fais.</div>
          <div className="set-field"><label>URL du projet Supabase</label><input value={url} spellCheck={false} onChange={e => setUrl(e.target.value)} /></div>
          <div className="set-field"><label>Clé publishable / anon</label><input type="password" value={key} onChange={e => setKey(e.target.value)} /></div>
          <div className="set-field"><label>Identifiant joueur</label><input value={player} onChange={e => setPlayer(e.target.value)} /></div>
          <div className="sheetrow">
            <button className="btn ghost" onClick={() => fileRef.current.click()}>Importer une copie</button>
            <button className="btn" onClick={doConnect}>Reconnecter</button>
          </div>
          {sbReady() && <div className="sheetrow"><button className="btn ghost set-danger" onClick={doDisconnect}>Déconnecter le cloud</button></div>}
          <input ref={fileRef} type="file" accept="application/json" style={{ display: "none" }} onChange={e => e.target.files[0] && doImport(e.target.files[0])} />
        </details>
        <div className="sheetrow"><button className="btn block" onClick={onClose}>OK</button></div>
      </div>
    </div>
  );
}
