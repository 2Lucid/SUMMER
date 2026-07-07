// Chaque carte = [matière, deck, recto, verso]. matière ∈ "math" | "phys" | "chim".
// Les 48 premières cartes math gardent leur ordre → ids f0..f47 stables (progression SR conservée).

const MATH = [
  // ── dérivées ──
  ["math", "der", "(xⁿ)′ = ?", "n·xⁿ⁻¹"], ["math", "der", "(1/x)′ = ?", "−1/x²"], ["math", "der", "(√x)′ = ?", "1/(2√x)"],
  ["math", "der", "(eˣ)′ = ?", "eˣ"], ["math", "der", "(ln x)′ = ?", "1/x"], ["math", "der", "(sin x)′ = ?", "cos x"],
  ["math", "der", "(cos x)′ = ?", "−sin x"], ["math", "der", "(uⁿ)′ = ?", "n·u′·uⁿ⁻¹"], ["math", "der", "(eᵘ)′ = ?", "u′·eᵘ"],
  ["math", "der", "(ln u)′ = ?", "u′/u"], ["math", "der", "(uv)′ = ?", "u′v + uv′"], ["math", "der", "(u/v)′ = ?", "(u′v − uv′)/v²"],
  // ── primitives ──
  ["math", "prim", "Primitive de xⁿ ?", "xⁿ⁺¹/(n+1)"], ["math", "prim", "Primitive de 1/x (x>0) ?", "ln x"],
  ["math", "prim", "Primitive de 1/x² ?", "−1/x"], ["math", "prim", "Primitive de 1/√x ?", "2√x"],
  ["math", "prim", "Primitive de cos x ?", "sin x"], ["math", "prim", "Primitive de sin x ?", "−cos x"],
  ["math", "prim", "Primitive de u′·eᵘ ?", "eᵘ"], ["math", "prim", "Primitive de u′/u ?", "ln|u|"],
  // ── limites ──
  ["math", "lim", "lim (ln x)/x en +∞ ?", "0  (x l'emporte sur ln x)"], ["math", "lim", "lim eˣ/xⁿ en +∞ ?", "+∞  (eˣ écrase xⁿ)"],
  ["math", "lim", "lim (sin x)/x en 0 ?", "1"], ["math", "lim", "lim x·ln x en 0⁺ ?", "0"],
  ["math", "lim", "lim (eˣ − 1)/x en 0 ?", "1"], ["math", "lim", "Hiérarchie en +∞ ?", "ln x ≪ xᵃ ≪ eˣ"],
  // ── trigonométrie ──
  ["math", "trig", "cos(π/6) et sin(π/6) ?", "√3/2 et 1/2"], ["math", "trig", "cos(π/4) et sin(π/4) ?", "√2/2 et √2/2"],
  ["math", "trig", "cos(π/3) et sin(π/3) ?", "1/2 et √3/2"], ["math", "trig", "tan(π/4), tan(π/3), tan(π/6) ?", "1, √3, √3/3"],
  // ── formules ──
  ["math", "form", "cos²x + sin²x = ?", "1"], ["math", "form", "cos(a+b) = ?", "cos a·cos b − sin a·sin b"],
  ["math", "form", "sin(a+b) = ?", "sin a·cos b + cos a·sin b"], ["math", "form", "cos(2a) = ? (3 formes)", "cos²a − sin²a = 2cos²a − 1 = 1 − 2sin²a"],
  ["math", "form", "sin(2a) = ?", "2 sin a·cos a"], ["math", "form", "ln(ab), ln(a/b), ln(aⁿ) ?", "ln a + ln b ; ln a − ln b ; n·ln a"],
  ["math", "form", "eᵃ·eᵇ et (eᵃ)ᵇ ?", "eᵃ⁺ᵇ et eᵃᵇ"], ["math", "form", "|a + bi| = ?", "√(a² + b²)"],
  // ── courbes ──
  ["math", "courbe", "Courbe de ln : domaine, variations, limites ?", "]0;+∞[, strictement croissante, −∞ en 0⁺, +∞ en +∞, passe par (1;0)"],
  ["math", "courbe", "Courbe de exp : variations, limites ?", "Croissante sur ℝ, 0 en −∞, +∞ en +∞, passe par (0;1), toujours > 0"],
  ["math", "courbe", "Courbe de √x ?", "[0;+∞[, croissante, tangente verticale en 0, +∞ en +∞"],
  ["math", "courbe", "Courbe de 1/x ?", "ℝ*, décroissante sur chaque intervalle, asymptotes x=0 et y=0, impaire"],
  ["math", "courbe", "Courbe de x² et x³ ?", "x² : paire, min en 0. x³ : impaire, croissante, point d'inflexion en 0"],
  ["math", "courbe", "Courbe de |x| ?", "Paire, décroît puis croît, min 0 en 0, non dérivable en 0"],
  ["math", "courbe", "sin et cos : période, parité, bornes ?", "Période 2π, sin impaire / cos paire, valeurs dans [−1;1]"],

  // ═══ AJOUTS MATH ═══
  // ── complexes ──
  ["math", "complexe", "Forme exponentielle de z ?", "z = r·e^{iθ}, avec r=|z| et θ=arg z"],
  ["math", "complexe", "Formule d'Euler : cos θ et sin θ ?", "cos θ = (e^{iθ}+e^{−iθ})/2 ; sin θ = (e^{iθ}−e^{−iθ})/2i"],
  ["math", "complexe", "Formule de Moivre ?", "(cos θ + i sin θ)ⁿ = cos(nθ) + i sin(nθ)"],
  ["math", "complexe", "|z|² en fonction de z ?", "z·z̄"],
  ["math", "complexe", "arg(z₁z₂) et arg(z₁/z₂) ?", "arg z₁ + arg z₂ ; arg z₁ − arg z₂  (mod 2π)"],
  ["math", "complexe", "Racines n-ièmes de l'unité ?", "e^{2ikπ/n}, k = 0…n−1"],
  ["math", "complexe", "Conjugué de z = a + ib ?", "z̄ = a − ib"],
  ["math", "complexe", "e^{iπ} = ?", "−1  (identité d'Euler)"],
  // ── développements limités (en 0) ──
  ["math", "DL", "DL de eˣ en 0 ?", "1 + x + x²/2! + … + xⁿ/n! + o(xⁿ)"],
  ["math", "DL", "DL de ln(1+x) en 0 ?", "x − x²/2 + x³/3 − … + (−1)ⁿ⁻¹ xⁿ/n + o(xⁿ)"],
  ["math", "DL", "DL de (1+x)^α en 0 ?", "1 + αx + α(α−1)/2! x² + … + o(xⁿ)"],
  ["math", "DL", "DL de cos x en 0 ?", "1 − x²/2! + x⁴/4! − … + o(x^{2n})"],
  ["math", "DL", "DL de sin x en 0 ?", "x − x³/3! + x⁵/5! − … + o(x^{2n+1})"],
  ["math", "DL", "DL de 1/(1−x) en 0 ?", "1 + x + x² + … + xⁿ + o(xⁿ)"],
  ["math", "DL", "DL de √(1+x) en 0 (ordre 2) ?", "1 + x/2 − x²/8 + o(x²)"],
  ["math", "DL", "DL de tan x en 0 (ordre 3) ?", "x + x³/3 + o(x³)"],
  // ── équivalents (en 0) ──
  ["math", "équiv", "sin x ~ ? (x→0)", "x"],
  ["math", "équiv", "1 − cos x ~ ? (x→0)", "x²/2"],
  ["math", "équiv", "ln(1+x) ~ ? (x→0)", "x"],
  ["math", "équiv", "eˣ − 1 ~ ? (x→0)", "x"],
  ["math", "équiv", "(1+x)^α − 1 ~ ? (x→0)", "αx"],
  ["math", "équiv", "tan x ~ ? (x→0)", "x"],
  // ── suites ──
  ["math", "suite", "Suite arithmétique : terme uₙ ?", "uₙ = u₀ + n·r"],
  ["math", "suite", "Suite géométrique : terme uₙ ?", "uₙ = u₀·qⁿ"],
  ["math", "suite", "Somme arith. Σ_{k=0}^n uₖ ?", "(n+1)(u₀ + uₙ)/2"],
  ["math", "suite", "Somme géo Σ_{k=0}^n qᵏ (q≠1) ?", "(1 − q^{n+1})/(1 − q)"],
  ["math", "suite", "lim qⁿ selon q ?", "0 si |q|<1 ; 1 si q=1 ; +∞ si q>1 ; diverge si q≤−1"],
  // ── sommes / dénombrement ──
  ["math", "somme", "Σ_{k=1}^n k = ?", "n(n+1)/2"],
  ["math", "somme", "Σ_{k=1}^n k² = ?", "n(n+1)(2n+1)/6"],
  ["math", "somme", "Σ_{k=1}^n k³ = ?", "[n(n+1)/2]²"],
  ["math", "somme", "Binôme de Newton (a+b)ⁿ = ?", "Σ_{k=0}^n C(n,k) aᵏ b^{n−k}"],
  // ── intégration ──
  ["math", "intég", "Intégration par parties ?", "∫u′v = [uv] − ∫uv′"],
  ["math", "intég", "∫_a^b f = ? (F primitive de f)", "F(b) − F(a)"],
  ["math", "intég", "Primitive de 1/(1+x²) ?", "arctan x"],
  ["math", "intég", "Primitive de 1/√(1−x²) ?", "arcsin x"],
  // ── équations différentielles ──
  ["math", "équadiff", "Solution de y′ + a·y = 0 ?", "y = C·e^{−ax}"],
  ["math", "équadiff", "Solution de y′ + a·y = b (a≠0) ?", "y = C·e^{−ax} + b/a"],
  ["math", "équadiff", "y″ + ω²y = 0 : solutions ?", "y = A cos(ωx) + B sin(ωx)"],
  ["math", "équadiff", "y″ − ω²y = 0 : solutions ?", "y = A·e^{ωx} + B·e^{−ωx}"],
  // ── fonctions usuelles ──
  ["math", "fonction", "(arctan x)′ = ?", "1/(1+x²)"],
  ["math", "fonction", "(arcsin x)′ = ?", "1/√(1−x²)"],
  ["math", "fonction", "ch x et sh x : définitions ?", "ch x = (eˣ+e⁻ˣ)/2 ; sh x = (eˣ−e⁻ˣ)/2"],
  ["math", "fonction", "ch²x − sh²x = ?", "1"],
  ["math", "fonction", "(ch x)′ et (sh x)′ ?", "sh x et ch x"],
  ["math", "fonction", "(tan x)′ = ?", "1 + tan²x = 1/cos²x"],
  // ── trigo (compléments) ──
  ["math", "trig", "cos(a−b) = ?", "cos a·cos b + sin a·sin b"],
  ["math", "trig", "sin(a−b) = ?", "sin a·cos b − cos a·sin b"],
  ["math", "trig", "tan(a+b) = ?", "(tan a + tan b)/(1 − tan a·tan b)"],
  ["math", "trig", "cos et sin en 0, π/2, π ?", "cos : 1, 0, −1  ·  sin : 0, 1, 0"],
];

const PHYS = [
  // ── mécanique ──
  ["phys", "méca", "2ᵉ loi de Newton (PFD) ?", "Σ F⃗ = m·a⃗"],
  ["phys", "méca", "Quantité de mouvement p⃗ ?", "p⃗ = m·v⃗"],
  ["phys", "méca", "Poids P⃗ ?", "P⃗ = m·g⃗  (g ≈ 9,81 m·s⁻²)"],
  ["phys", "méca", "Force de rappel d'un ressort ?", "F = −k·x  (loi de Hooke)"],
  ["phys", "méca", "Frottement fluide linéaire ?", "f⃗ = −λ·v⃗"],
  ["phys", "méca", "Accélération centripète (mvt circulaire) ?", "a = v²/R = ω²·R"],
  ["phys", "méca", "Relation v et ω (mvt circulaire) ?", "v = R·ω"],
  ["phys", "méca", "Moment d'une force par rapport à O ?", "M⃗_O = r⃗ ∧ F⃗"],
  ["phys", "méca", "Théorème du moment cinétique ?", "dL⃗/dt = Σ M⃗_O(F⃗)"],
  ["phys", "méca", "Chute libre : z(t) ?", "z = −½g·t² + v₀·t + z₀"],
  // ── énergie ──
  ["phys", "énergie", "Énergie cinétique ?", "E_c = ½·m·v²"],
  ["phys", "énergie", "Théorème de l'énergie cinétique ?", "ΔE_c = Σ W(F⃗)"],
  ["phys", "énergie", "Énergie potentielle de pesanteur ?", "E_p = m·g·z (+ cte)"],
  ["phys", "énergie", "Énergie potentielle élastique ?", "E_p = ½·k·x²"],
  ["phys", "énergie", "Travail d'une force constante ?", "W = F⃗·d⃗ = F·d·cos θ"],
  ["phys", "énergie", "Puissance d'une force ?", "P = F⃗·v⃗"],
  ["phys", "énergie", "Énergie mécanique ?", "E_m = E_c + E_p ; conservée si forces conservatives"],
  // ── oscillateurs ──
  ["phys", "oscill", "Pulsation propre d'un ressort (masse m) ?", "ω₀ = √(k/m)"],
  ["phys", "oscill", "Période d'un pendule simple ?", "T = 2π·√(L/g)"],
  ["phys", "oscill", "Relations T, ω, f ?", "T = 2π/ω = 1/f"],
  ["phys", "oscill", "Équation de l'oscillateur harmonique ?", "ẍ + ω₀²·x = 0"],
  // ── électrocinétique ──
  ["phys", "élec", "Loi d'Ohm ?", "U = R·I"],
  ["phys", "élec", "Puissance électrique ?", "P = U·I = R·I² = U²/R"],
  ["phys", "élec", "Loi des nœuds ?", "Σ I entrants = Σ I sortants"],
  ["phys", "élec", "Loi des mailles ?", "Σ des tensions orientées = 0"],
  ["phys", "élec", "Relation charge/tension d'un condensateur ?", "q = C·u ; i = C·du/dt"],
  ["phys", "élec", "Tension aux bornes d'une bobine ?", "u = L·di/dt"],
  ["phys", "élec", "Résistances en série / parallèle ?", "série : R₁+R₂  ·  parallèle : 1/R = 1/R₁ + 1/R₂"],
  ["phys", "élec", "Condensateurs en série / parallèle ?", "parallèle : C₁+C₂  ·  série : 1/C = 1/C₁ + 1/C₂"],
  ["phys", "élec", "Énergie d'un condensateur ?", "E = ½·C·U²"],
  ["phys", "élec", "Énergie d'une bobine ?", "E = ½·L·I²"],
  // ── régimes transitoires / RLC ──
  ["phys", "RLC", "Constante de temps d'un circuit RC ?", "τ = R·C"],
  ["phys", "RLC", "Constante de temps d'un circuit RL ?", "τ = L/R"],
  ["phys", "RLC", "Charge d'un RC : u(t) ?", "u = E·(1 − e^{−t/τ})"],
  ["phys", "RLC", "Pulsation propre d'un circuit LC ?", "ω₀ = 1/√(LC)"],
  ["phys", "RLC", "Impédance complexe d'un condensateur ?", "Z = 1/(jCω)"],
  ["phys", "RLC", "Impédance complexe d'une bobine ?", "Z = jLω"],
  ["phys", "RLC", "Facteur de qualité (RLC série) ?", "Q = (1/R)·√(L/C) = L·ω₀/R"],
  // ── optique géométrique ──
  ["phys", "optique", "Relation de conjugaison (Descartes, lentille) ?", "1/OA′ − 1/OA = 1/f′"],
  ["phys", "optique", "Vergence d'une lentille ?", "V = 1/f′  (en dioptries δ)"],
  ["phys", "optique", "Grandissement γ ?", "γ = A′B′/AB = OA′/OA"],
  ["phys", "optique", "Loi de Snell-Descartes (réfraction) ?", "n₁·sin i₁ = n₂·sin i₂"],
  ["phys", "optique", "Condition de réflexion totale ?", "sin i > n₂/n₁  (avec n₁ > n₂)"],
  // ── thermodynamique ──
  ["phys", "thermo", "Loi des gaz parfaits ?", "P·V = n·R·T"],
  ["phys", "thermo", "1ᵉʳ principe de la thermo ?", "ΔU = W + Q"],
  ["phys", "thermo", "Travail d'une transformation isobare ?", "W = −P·ΔV"],
  ["phys", "thermo", "Énergie interne d'un GP monoatomique ?", "U = (3/2)·n·R·T"],
  ["phys", "thermo", "Transformation isotherme d'un GP ?", "P·V = cte  (loi de Boyle-Mariotte)"],
  ["phys", "thermo", "Loi de Laplace (adiabatique réversible) ?", "P·V^γ = cte"],
  // ── ondes ──
  ["phys", "ondes", "Relation vitesse, longueur d'onde, fréquence ?", "v = λ·f"],
  ["phys", "ondes", "Relations ω↔T et k↔λ ?", "ω = 2π/T ; k = 2π/λ"],
  // ── constantes ──
  ["phys", "const", "Vitesse de la lumière c ?", "≈ 3,00×10⁸ m·s⁻¹"],
  ["phys", "const", "Intensité de pesanteur g (Terre) ?", "≈ 9,81 m·s⁻²"],
  ["phys", "const", "Constante des gaz parfaits R ?", "≈ 8,314 J·K⁻¹·mol⁻¹"],
  ["phys", "const", "Charge élémentaire e ?", "≈ 1,60×10⁻¹⁹ C"],
  ["phys", "const", "Nombre d'Avogadro N_A ?", "≈ 6,02×10²³ mol⁻¹"],
  ["phys", "const", "0 °C en kelvin ?", "273,15 K"],
  // ── dimensions / unités ──
  ["phys", "unités", "Unité SI d'une force ?", "newton — N = kg·m·s⁻²"],
  ["phys", "unités", "Unité SI d'une énergie ?", "joule — J = kg·m²·s⁻²"],
  ["phys", "unités", "Unité SI d'une puissance ?", "watt — W = J·s⁻¹"],
  ["phys", "unités", "Unité SI d'une pression ?", "pascal — Pa = N·m⁻²"],
];

const CHIM = [
  // ── atomistique ──
  ["chim", "atome", "Ordre de remplissage (Klechkowski) ?", "1s 2s 2p 3s 3p 4s 3d 4p 5s …"],
  ["chim", "atome", "Règle de Hund ?", "On occupe d'abord seul chaque orbitale dégénérée, spins parallèles"],
  ["chim", "atome", "Principe d'exclusion de Pauli ?", "2 e⁻ max par orbitale, de spins opposés"],
  ["chim", "atome", "Config. électronique du carbone (Z=6) ?", "1s² 2s² 2p²"],
  ["chim", "atome", "Électrons de valence ?", "Électrons de la couche externe (n maximal)"],
  ["chim", "atome", "Nombre de masse A ?", "A = Z + N  (protons + neutrons)"],
  // ── classification périodique ──
  ["chim", "période", "Évolution de l'électronégativité ?", "↗ vers la droite et vers le haut (max : F)"],
  ["chim", "période", "Évolution du rayon atomique ?", "↗ vers la gauche et vers le bas"],
  ["chim", "période", "Famille des alcalins ?", "Colonne 1 (Li, Na, K…), 1 e⁻ de valence"],
  ["chim", "période", "Famille des halogènes ?", "Colonne 17 (F, Cl, Br…), 7 e⁻ de valence"],
  ["chim", "période", "Particularité des gaz nobles ?", "Colonne 18, couche de valence saturée → très stables"],
  // ── liaison / géométrie ──
  ["chim", "liaison", "Règle de l'octet ?", "Les atomes tendent vers 8 e⁻ de valence (2 pour H)"],
  ["chim", "liaison", "VSEPR : géométrie AX₂ ?", "Linéaire, 180°"],
  ["chim", "liaison", "VSEPR : géométrie AX₃ ?", "Trigonale plane, 120°"],
  ["chim", "liaison", "VSEPR : géométrie AX₄ ?", "Tétraédrique, 109,5°"],
  ["chim", "liaison", "VSEPR : géométrie de H₂O (AX₂E₂) ?", "Coudée, ≈ 104,5°"],
  // ── cinétique ──
  ["chim", "cinét", "Vitesse volumique de réaction ?", "v = (1/νᵢ)·d[i]/dt"],
  ["chim", "cinét", "Loi de vitesse d'ordre 1 ?", "v = k·[A] ; [A] = [A]₀·e^{−kt}"],
  ["chim", "cinét", "Temps de demi-réaction (ordre 1) ?", "t½ = ln2 / k  (indép. de [A]₀)"],
  ["chim", "cinét", "Loi d'Arrhenius ?", "k = A·e^{−Ea/RT}"],
  ["chim", "cinét", "Rôle d'un catalyseur ?", "↑ la vitesse en abaissant Ea, non consommé au bilan"],
  // ── équilibres ──
  ["chim", "équil", "Quotient de réaction Q ?", "Q = Π aᵢ^{νᵢ}  (produits / réactifs)"],
  ["chim", "équil", "Sens d'évolution selon Q et K ?", "Q < K → sens direct ; Q > K → sens inverse"],
  ["chim", "équil", "Relation ΔrG° et K ?", "ΔrG° = −R·T·ln K"],
  // ── acide-base ──
  ["chim", "acide", "Produit ionique de l'eau Ke (25 °C) ?", "Ke = [H₃O⁺]·[OH⁻] = 10⁻¹⁴"],
  ["chim", "acide", "Définition du pH ?", "pH = −log[H₃O⁺]"],
  ["chim", "acide", "pH + pOH = ? (25 °C)", "14"],
  ["chim", "acide", "Ka et pKa ?", "Ka = [A⁻][H₃O⁺]/[AH] ; pKa = −log Ka"],
  ["chim", "acide", "Relation de Henderson-Hasselbalch ?", "pH = pKa + log([A⁻]/[AH])"],
  ["chim", "acide", "pH d'un acide fort de concentration C ?", "pH = −log C"],
  ["chim", "acide", "Un acide est d'autant plus fort que… ?", "Ka est grand (pKa petit)"],
  // ── oxydoréduction ──
  ["chim", "redox", "Oxydant et réducteur ?", "Oxydant : capte des e⁻ · Réducteur : cède des e⁻"],
  ["chim", "redox", "Oxydation et réduction ?", "Oxydation = perte d'e⁻ · Réduction = gain d'e⁻"],
  ["chim", "redox", "Formule de Nernst (25 °C) ?", "E = E° + (0,059/n)·log(a_ox/a_red)"],
  ["chim", "redox", "Nombres d'oxydation usuels de O et H ?", "O : −II · H : +I"],
  // ── thermochimie ──
  ["chim", "thermo", "Enthalpie de réaction (loi de Hess) ?", "ΔrH° = Σ ΔfH°(produits) − Σ ΔfH°(réactifs)"],
  ["chim", "thermo", "Critère de spontanéité (ΔG) ?", "ΔG < 0 → spontané ; ΔG = ΔH − T·ΔS"],
  // ── quantité de matière ──
  ["chim", "mole", "Quantité de matière n ?", "n = m/M = N/N_A"],
  ["chim", "mole", "Concentration molaire ?", "c = n/V  (mol·L⁻¹)"],
  ["chim", "mole", "Volume molaire d'un gaz (CNTP, 0 °C) ?", "≈ 22,4 L·mol⁻¹"],
  // ── cristallographie ──
  ["chim", "cristal", "Compacité d'une structure CFC ?", "74 %  (0,74)"],
  ["chim", "cristal", "Coordinence d'une structure CFC ?", "12"],
];

export const FLASH = [...MATH, ...PHYS, ...CHIM]
  .map((c, i) => ({ id: "f" + i, subject: c[0], deck: c[1], front: c[2], back: c[3] }));

export const SUBJECTS = [
  { key: "all", label: "Tout", emoji: "📚" },
  { key: "math", label: "Maths", emoji: "➗" },
  { key: "phys", label: "Physique", emoji: "⚛️" },
  { key: "chim", label: "Chimie", emoji: "🧪" },
];

export const BOX_GAP = [1, 3, 7, 14];
export const RANKS = [[0, "Larve 🐛"], [250, "Apprenti ✏️"], [700, "Soldat 🎖️"], [1500, "Machine ⚙️"], [3000, "MONSTRE 👹"]];
export const rankOf = xp => { let r = RANKS[0][1], next = null; RANKS.forEach(([t, n], i) => { if (xp >= t) { r = n; next = RANKS[i + 1] || null; } }); return { name: r, next }; };
