// Petit bus d'effets visuels (toast / confetti / level-up) découplé du store.
const bus = new EventTarget();
export const toast = msg => bus.dispatchEvent(new CustomEvent("toast", { detail: msg }));
export const confetti = n => bus.dispatchEvent(new CustomEvent("confetti", { detail: n }));
export const levelup = idx => bus.dispatchEvent(new CustomEvent("levelup", { detail: idx }));
export function onFx(type, cb) { const h = e => cb(e.detail); bus.addEventListener(type, h); return () => bus.removeEventListener(type, h); }
