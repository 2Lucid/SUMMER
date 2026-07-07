import { segments } from "../lib/mathfmt.js";

/* Affiche une chaîne maths/physique de l'app : la prose reste du texte normal
 * (elle se coupe en fin de ligne, accents OK), seuls les tokens maths sont rendus
 * en LaTeX (KaTeX). Multi-lignes (\n) → <br>. Repli en texte brut si besoin. */
export default function MathText({ children, className, style }) {
  const raw = children == null ? "" : String(children);
  const lines = raw.split("\n");
  return (
    <span className={className} style={style}>
      {lines.map((ln, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {segments(ln).map((seg, j) => seg.t === "math"
            ? <span key={j} className="mtx" dangerouslySetInnerHTML={{ __html: seg.s }} />
            : <span key={j}>{seg.s}</span>)}
        </span>
      ))}
    </span>
  );
}
