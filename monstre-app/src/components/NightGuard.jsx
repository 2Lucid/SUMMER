import { useEffect, useRef, useState } from "react";
import { pick } from "../lib/util.js";

// ---- Réglages (localStorage) ----
export const NG_ON = () => { try { return localStorage.getItem("monstre.ng") !== "0"; } catch { return true; } };
export const NG_BED = () => { try { return localStorage.getItem("monstre.bedtime") || "23:00"; } catch { return "23:00"; } };
const NG_WAKE = "05:00"; // fin de la fenêtre "tu devrais dormir"

const toMin = hhmm => { const [h, m] = String(hhmm).split(":").map(Number); return h * 60 + (m || 0); };
function inSleepWindow(now) {
  if (!NG_ON()) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  const bed = toMin(NG_BED()), wake = toMin(NG_WAKE);
  return bed > wake ? (cur >= bed || cur < wake) : (cur >= bed && cur < wake);
}

// Messages très durs — ça harcèle, ça pique, ça pousse à couper et aller dormir.
// Beaucoup d'angles : ordres, insultes, science du sommeil, concours, concurrents,
// ton futur, physique, moqueries, culpabilité… histoire que ça se répète jamais.
const MSGS = [
  // ordres secs
  "VA. DORMIR.",
  "ÉTEINS. TOUT DE SUITE.",
  "Ton lit. Maintenant. C'est un ORDRE.",
  "Ferme cet écran. Point.",
  "Coupe. Sans discuter.",
  "Debout ? Non. Couché. Immédiatement.",
  "STOP. Éteins et dors.",
  "Lâche le téléphone. Tout de suite.",
  // insultes / moqueries
  "T'es en train de te SABOTER, abruti.",
  "Encore debout ? Pathétique.",
  "Arrête de scroller comme une victime.",
  "T'as pas de discipline ou quoi ?!",
  "Sérieux, t'es qu'un gamin.",
  "Tu te crois fort ? T'es juste fatigué.",
  "Regarde-toi. Minable, à cette heure.",
  "Même un CE2 se coucherait, là.",
  "Tu joues à quoi, exactement ?",
  "Zéro volonté. Zéro. La honte.",
  "Continue, champion du monde des excuses.",
  // science du sommeil
  "Ton cerveau se CÂBLE en dormant. Là tu débranches.",
  "Après minuit t'apprends plus rien. Tu perds tout.",
  "Pas de sommeil = pas de mémoire. Tu bosses pour RIEN.",
  "Ta concentration de demain se joue MAINTENANT.",
  "Le vrai boulot se fait pendant le sommeil profond. Vas-y.",
  "Chaque heure volée au lit, ton QI la paie demain.",
  "Ton hippocampe hurle. Ferme les yeux.",
  // concours / prépa
  "Chaque minute ici = un point de moins au prochain DS.",
  "Le concours se gagne au lit, pas à 2h du mat.",
  "Tu veux couler en colle demain ? Continue comme ça.",
  "La rentrée approche. Et toi tu te sabotes.",
  "Un 20 se prépare en dormant. Un 4 en veillant.",
  "T'intégreras rien en étant une épave.",
  "Les intégrés dorment. Les recalés veillent. Choisis.",
  // concurrents
  "Tes concurrents dorment. Toi tu te noies.",
  "Pendant que tu galères, un autre prend ta place.",
  "Y'en a un qui bosse mieux que toi. Parce qu'il DORT.",
  "Tu offres ton avance à tout le monde. Bravo.",
  // ton futur / consequences
  "Demain tu seras une LOQUE. Bravo.",
  "Réveil dans quelques heures. Tu vas déguster.",
  "Demain en amphi : zombie. À cause de MAINTENANT.",
  "Le toi de demain te déteste, là.",
  "Prépare-toi à une journée de merde. Bien joué.",
  "Cernes, migraine, cerveau en purée. Ton choix.",
  // culpabilité / effort gâché
  "T'as bossé aujourd'hui ? Tu jettes tout à la poubelle.",
  "Tout ton effort part en fumée si tu dors pas.",
  "Tu crois avancer. Tu recules. Fort.",
  "Tu perds. Là, maintenant. TU PERDS.",
  "C'est toi contre toi. Et tu es en train de perdre.",
  // sec et cash
  "Dodo. C'est pas négociable.",
  "Il est trop tard pour tout. Sauf pour dormir.",
  "Rien de bon se passe après cette heure. Coupe.",
  "T'as gagné le droit de fermer ta gueule et de dormir.",
];

let SEQ = 0;

export default function NightGuard() {
  const [pops, setPops] = useState([]); // {id, text, top, left, rot}
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    let timer = null;

    const schedule = () => {
      const d = new Date();
      if (inSleepWindow(d)) {
        const id = ++SEQ;
        const top = 6 + Math.floor(Math.random() * 78);   // 6% → 84%
        const left = 4 + Math.floor(Math.random() * 62);  // 4% → 66%
        const rot = Math.floor(Math.random() * 13) - 6;   // -6° → +6°
        setPops(ps => [...ps.slice(-6), { id, text: pick(MSGS), top, left, rot }]);
        setTimeout(() => { if (alive.current) setPops(ps => ps.filter(p => p.id !== id)); }, 5200);
      } else {
        setPops([]);
      }
      // Cadence agressive et irrégulière : ça surgit un peu partout, tout le temps.
      timer = setTimeout(schedule, inSleepWindow(d) ? 1400 + Math.random() * 2600 : 20000);
    };
    schedule();

    return () => { alive.current = false; clearTimeout(timer); };
  }, []);

  if (!pops.length) return null;
  return (
    <div className="ng-layer" aria-hidden="true">
      {pops.map(p => (
        <div key={p.id} className="ng-pop" style={{ top: p.top + "%", left: p.left + "%", "--rot": p.rot + "deg" }}>
          {p.text}
        </div>
      ))}
    </div>
  );
}
