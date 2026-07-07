/* Agenda / calendrier — constantes + helpers purs (mêmes règles que la v1 HTML). */
import { pad, fromDk, addDays } from "./util.js";

export const CAL_START = 6, CAL_END = 24, CAL_HPX = 46;
export const CAL_TOTAL = (CAL_END - CAL_START) * CAL_HPX;
export const CAL_COLORS = ["#8f7bff", "#35e0d0", "#ff3d8b", "#ff8e3c", "#ffd166", "#5aa9ff", "#ff5470", "#3ddc84"];

/* Types d'événement — chaque type porte sa couleur. */
export const EV_TYPES = [
  { id: "travail", label: "Travail", color: "#8f7bff", emoji: "📚" },
  { id: "perso", label: "Personnel", color: "#5aa9ff", emoji: "🏡" },
  { id: "lucide", label: "Lucide", color: "#35e0d0", emoji: "💡" },
  { id: "startup", label: "Start-up", color: "#ff8e3c", emoji: "🚀" },
  { id: "sport", label: "Sport", color: "#3ddc84", emoji: "🏋️" },
  { id: "social", label: "Social", color: "#ff3d8b", emoji: "🎉" },
];
export const DEF_TYPE = EV_TYPES[0];
export const evType = id => EV_TYPES.find(t => t.id === id);
export const typeByColor = color => EV_TYPES.find(t => t.color === color);
/* Retrouve le type d'un événement (par id, sinon par couleur pour le legacy). */
export const evTypeOf = e => evType(e.type) || typeByColor(e.color) || DEF_TYPE;
export const MOF = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export const hm2min = t => { const p = String(t || "0:0").split(":"); return (Number(p[0]) || 0) * 60 + (Number(p[1]) || 0); };
export const min2hm = m => pad(Math.floor(m / 60)) + ":" + pad(((m % 60) + 60) % 60);
export const capEnd = v => Math.min(23 * 60 + 59, Math.max(0, v));
/* Événement sur une plage de jours (vacances, stage…) : allDay + endDate > date. */
export const evIsRange = e => !!e.allDay && !!e.endDate && e.endDate > e.date;
/* Vrai si l'événement occupe ce jour (jour unique OU plage allDay). */
export const evCoversDay = (e, dk) => e.date === dk || (evIsRange(e) && dk >= e.date && dk <= e.endDate);
/* Nombre de jours couverts. */
export const evDayCount = e => evIsRange(e) ? Math.round((fromDk(e.endDate) - fromDk(e.date)) / 86400000) + 1 : 1;

export const calMonday = dk => addDays(dk, -((fromDk(dk).getDay() + 6) % 7));
export const calWeekDays = dk => { const mon = calMonday(dk); const out = []; for (let i = 0; i < 7; i++) out.push(addDays(mon, i)); return out; };
