import { useState } from "react";
import { doLogin } from "../store.js";
import { toast } from "../fx.js";

const LOGIN_AVATARS = ["⭐", "🔥", "👹", "🦈", "🐉", "⚡", "🎯", "💎", "🚀", "🧠", "🏆", "🌊", "🐺", "👑", "🍑"];

export default function Login() {
  const [pseudo, setPseudo] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("⭐");
  const [err, setErr] = useState({ msg: "", kind: "muted" });
  const [busy, setBusy] = useState(false);

  const go = async () => {
    if (busy) return;
    setBusy(true); setErr({ msg: "Connexion au cloud…", kind: "muted" });
    const res = await doLogin(pseudo, code, name, avatar);
    if (res && res.ok) toast("Bienvenue " + (name.trim() || pseudo) + " 👹"); // useLogged bascule → App affiche l'app
    else { setBusy(false); setErr({ msg: (res && res.err) || "Échec de connexion.", kind: "err" }); }
  };
  const onKey = e => { if (e.key === "Enter") go(); };

  return (
    <div className="login-wrap">
      <div className="login-logo"><span className="g">MONSTRE</span> 👹🌴</div>
      <div className="login-tag">Connecte-toi. Rejoins la course. Deviens un monstre cet été.</div>
      <div className="login-card">
        <label>Ton pseudo</label>
        <input className="login-inp" autoComplete="off" spellCheck={false} placeholder="clement · lucas · …" value={pseudo} onChange={e => setPseudo(e.target.value)} onKeyDown={onKey} />
        <label>Ton code perso <span style={{ color: "var(--muted)", fontWeight: 400 }}>— secret, pour te reconnecter</span></label>
        <input className="login-inp" type="password" autoComplete="off" placeholder="••••" value={code} onChange={e => setCode(e.target.value)} onKeyDown={onKey} />
        <label>Nom affiché <span style={{ color: "var(--muted)", fontWeight: 400 }}>— si nouveau compte</span></label>
        <input className="login-inp" autoComplete="off" placeholder="Ton prénom" maxLength={22} value={name} onChange={e => setName(e.target.value)} onKeyDown={onKey} />
        <label>Ton avatar</label>
        <div className="login-ava">
          {LOGIN_AVATARS.map(e => <button key={e} className={e === avatar ? "sel" : ""} onClick={() => setAvatar(e)}>{e}</button>)}
        </div>
        <div className="login-err" style={{ color: err.kind === "err" ? "var(--red)" : "var(--muted)" }}>{err.msg}</div>
        <button className="btn block" style={{ marginTop: 18, fontSize: 16, padding: 13 }} disabled={busy} onClick={go}>Entrer 👹</button>
      </div>
      <div className="login-pact">🤝 <b>La confiance règne.</b><br />On gagne jamais l'XP pour rien. Chaque point = du vrai taf.</div>
    </div>
  );
}
