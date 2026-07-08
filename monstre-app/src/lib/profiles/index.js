/* ===== Registre des profils =================================================
 * Chaque profil (clement, lucas, …) expose la MÊME API de contenu prépa/études.
 * On résout le profil actif par pseudo (normalisé) ; défaut = Clément pour ne
 * rien casser des sauvegardes existantes.
 * Ajouter un profil = créer profiles/<pseudo>.js puis l'enregistrer ici. */
import * as clement from "./clement.js";
import * as lucas from "./lucas.js";

export const DEFAULT_PROFILE = "clement";
const REGISTRY = { clement, lucas };

export const hasProfile = id => Object.prototype.hasOwnProperty.call(REGISTRY, String(id || "").toLowerCase());
export function profileFor(id) {
  const k = String(id || "").toLowerCase();
  return REGISTRY[k] || REGISTRY[DEFAULT_PROFILE];
}
