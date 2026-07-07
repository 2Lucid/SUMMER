import { useSyncExternalStore, useEffect } from "react";
import { todayKey, addDays } from "./lib/util.js";

/* ===== état par défaut (MÊME forme que la v1 HTML) ===== */
export const DEFAULT = () => ({
  quests: [], log: [], xp: 0, streak: 0, best: 0, lastDay: null,
  days: {}, skills: { xp: 0, d: {} }, flash: {}, sleep: {}, todos: {},
  exams: [], coeurDaily: {}, coeurCheck: null,
  couple: null,         // en couple ? null = pas encore demandé, true/false = réponse

  chests: { opened: [] },  // coffres récompenses déjà ouverts (ids)
  study: { running: null, sessions: [] },  // chrono de travail prépa — running={startedAt} ou null, sessions=[{id,ms,dk,ts}]
  work: { sessions: [], prospects: [], ships: [], chests: [], timer: null, roadmap: [] },  // monde Pro — logs bruts + roadmap LUCID éditable (vide ⇒ seed LUCID_MVP)
  flow: { pause: null, done: {}, skip: {} },  // Flow : pause minutée + faits/passés par jour
  events: [],           // agenda perso — conservé tel quel si présent dans la sauvegarde cloud
  profile: { pseudo: "", name: "", avatar: "⭐", codeHash: "" },  // identité (classement + partage)
  savedAt: 0,
});

/* ===== clés de stockage — IDENTIQUES à la v1 pour reprendre la sauvegarde ===== */
const KEY = "monstre:state:v1";
const CREDS_KEY = "monstre:sb:v1";
export const SB_DEFAULTS = { url: "https://sumojlzppiaifcipsabz.supabase.co", key: "sb_publishable_UeNkwsBuQ0dMXVO_HbMhLA_9P55fyUj", player: "", name: "", avatar: "⭐" };
export let SB = { ...SB_DEFAULTS };

/* ===== stores réactifs ===== */
let S = DEFAULT();
const Slisteners = new Set();
export const getS = () => S;
function emitS() { Slisteners.forEach(l => l()); }
export function useS() { return useSyncExternalStore(l => { Slisteners.add(l); return () => Slisteners.delete(l); }, getS, getS); }
export function setS(next, persist = true) { S = typeof next === "function" ? next(S) : next; emitS(); if (persist) save(); }

let sync = { cloud: "off", mode: "local" };
const syncListeners = new Set();
export const getSync = () => sync;
function emitSync() { syncListeners.forEach(l => l()); }
export function useSync() { return useSyncExternalStore(l => { syncListeners.add(l); return () => syncListeners.delete(l); }, getSync, getSync); }
function setSync(patch) { sync = { ...sync, ...patch }; emitSync(); }

/* connecté ? (gate de login) */
let logged = false;
const loggedListeners = new Set();
export const getLogged = () => logged;
function emitLogged() { loggedListeners.forEach(l => l()); }
export function useLogged() { return useSyncExternalStore(l => { loggedListeners.add(l); return () => loggedListeners.delete(l); }, getLogged, getLogged); }
function setLogged(v) { logged = v; emitLogged(); }

/* pairs (classement + planning partagé) */
let peers = [], peersAt = 0;
const peerListeners = new Set();
export const getPeers = () => peers;
function emitPeers() { peerListeners.forEach(l => l()); }
export function usePeers() { return useSyncExternalStore(l => { peerListeners.add(l); return () => peerListeners.delete(l); }, getPeers, getPeers); }
const peersFresh = () => peers.length && Date.now() - peersAt < 25000;

/* ===== couche stockage ===== */
function lsGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch { /* quota / privé */ } }
function lsDel(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } }
export function lsWorks() { try { localStorage.setItem("__t", "1"); localStorage.removeItem("__t"); return true; } catch { return false; } }
export function sbReady() { return !!(SB.url && SB.key); }
function sbBase() { return SB.url.replace(/\/+$/, "") + "/rest/v1/sq_state"; }
function sbHeaders() { const h = { apikey: SB.key, "Content-Type": "application/json" }; if (SB.key.indexOf("sb_") !== 0) h.Authorization = "Bearer " + SB.key; return h; }
async function sbLoad() { const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 7000); try { const r = await fetch(sbBase() + "?id=eq." + encodeURIComponent(SB.player) + "&select=data", { headers: sbHeaders(), signal: ctrl.signal }); if (!r.ok) throw new Error("HTTP " + r.status); const rows = await r.json(); return rows.length ? rows[0].data : null; } finally { clearTimeout(to); } }
async function sbSave() { const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 7000); try { const r = await fetch(sbBase() + "?on_conflict=id", { method: "POST", headers: Object.assign({ Prefer: "resolution=merge-duplicates" }, sbHeaders()), body: JSON.stringify([{ id: SB.player, data: S, updated_at: new Date().toISOString() }]), signal: ctrl.signal }); if (!r.ok) throw new Error("HTTP " + r.status); } finally { clearTimeout(to); } }
async function sbLoadAll() { const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 7000); try { const r = await fetch(sbBase() + "?select=id,data,updated_at&order=updated_at.desc", { headers: sbHeaders(), signal: ctrl.signal }); if (!r.ok) throw new Error("HTTP " + r.status); return await r.json(); } finally { clearTimeout(to); } }
async function loadCreds() { let raw = lsGet(CREDS_KEY); if (raw) { try { SB = Object.assign(SB, JSON.parse(raw)); } catch { /* ignore */ } } }
export async function saveCreds() { lsSet(CREDS_KEY, JSON.stringify(SB)); }
function parseState(raw) { if (!raw) return null; try { const o = (typeof raw === "string") ? JSON.parse(raw) : raw; return (o && typeof o === "object") ? o : null; } catch { return null; } }

export async function save() {
  S.savedAt = Date.now(); lsSet(KEY, JSON.stringify(S));
  if (sbReady()) { setSync({ cloud: "pending" }); try { await sbSave(); setSync({ cloud: "ok" }); } catch { setSync({ cloud: "err" }); } }
}
export async function load() {
  await loadCreds();
  let cloudOk = false, cloudData = null;
  if (sbReady()) { try { cloudData = parseState(await sbLoad()); setSync({ cloud: "ok" }); cloudOk = true; } catch { setSync({ cloud: "err" }); } }
  if (cloudOk && cloudData) { S = Object.assign(DEFAULT(), cloudData); return; }
  const l = parseState(lsGet(KEY)); if (l) S = Object.assign(DEFAULT(), l);
  if (cloudOk && !cloudData && l) { try { S.savedAt = Date.now(); await sbSave(); } catch { /* ignore */ } }
}
export async function wipe() { lsDel(KEY); S = DEFAULT(); emitS(); if (sbReady()) { try { await sbSave(); } catch { /* ignore */ } } }
export function exportSave() { const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "monstre-save-" + todayKey() + ".json"; document.body.appendChild(a); a.click(); a.remove(); }
export function importSave(file, onDone) { const rd = new FileReader(); rd.onload = () => { const o = parseState(rd.result); if (!o || !Array.isArray(o.quests)) { onDone(false); return; } S = Object.assign(DEFAULT(), o); emitS(); save(); onDone(true); }; rd.readAsText(file); }

/* ===== crédentiels Supabase (réglages avancés) ===== */
export async function connectSupabase(url, key, player) {
  SB.url = url.trim(); SB.key = key.trim(); SB.player = (player || "clement").trim();
  if (!sbReady()) return { ok: false, reason: "missing" };
  await saveCreds(); setSync({ cloud: "pending" });
  try { await sbSave(); setSync({ cloud: "ok" }); return { ok: true }; }
  catch { setSync({ cloud: "err" }); return { ok: false, reason: "fail" }; }
}
export async function disconnectSupabase() { SB.url = ""; SB.key = ""; setSync({ cloud: "off" }); await saveCreds(); }

/* ===== identité / auth (pseudo + code secret) ===== */
export function hashCode(s) { s = String(s); let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(36); }
export function normPseudo(p) { return (p || "").trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_-]/g, "").slice(0, 20); }
export function myId() { return (S.profile && S.profile.pseudo) || SB.player; }

export async function doLogin(pseudo, code, name, avatar) {
  pseudo = normPseudo(pseudo); code = (code || "").trim();
  if (!pseudo) return { err: "Choisis un pseudo (lettres/chiffres)." };
  if (code.length < 3) return { err: "Ton code fait au moins 3 caractères." };
  SB.player = pseudo;
  let raw = null, reachable = true;
  try { raw = await sbLoad(); } catch { reachable = false; }
  if (!reachable) return { err: "Cloud injoignable ici — vérifie ta connexion et réessaie." };
  const existing = parseState(raw);
  if (existing) {
    const ch = existing.profile && existing.profile.codeHash;
    if (ch) { if (ch !== hashCode(code)) return { err: "Code incorrect pour « " + pseudo + " ». (ce pseudo est déjà pris)" }; }
    else { existing.profile = Object.assign({ pseudo, name: (name || "").trim() || pseudo, avatar: avatar || "⭐" }, existing.profile || {}, { pseudo, codeHash: hashCode(code) }); }
    S = Object.assign(DEFAULT(), existing);
    if (!S.profile || typeof S.profile !== "object") S.profile = { pseudo, name: pseudo, avatar: avatar || "⭐", codeHash: hashCode(code) };
    if (!S.profile.pseudo) S.profile.pseudo = pseudo;
  } else {
    S = DEFAULT();
    S.profile = { pseudo, name: (name || "").trim().slice(0, 22) || pseudo, avatar: avatar || "⭐", codeHash: hashCode(code) };
  }
  SB.name = S.profile.name; SB.avatar = S.profile.avatar || "⭐";
  await saveCreds();
  enforceCoeurDaily(); emitS(); await save();
  setLogged(true); refreshPeers();
  return { ok: true };
}
export async function logout() {
  if (!confirm("Se déconnecter ? Ta progression reste sauvegardée dans le cloud sous ton pseudo — il te faudra ton code pour revenir.")) return false;
  SB.player = ""; SB.name = ""; SB.avatar = "⭐"; peers = []; peersAt = 0; emitPeers();
  await saveCreds(); S = DEFAULT(); emitS(); setLogged(false); return true;
}

/* ===== pairs : chargement + rafraîchissement (TTL 25s) ===== */
export async function refreshPeers() {
  try { const rows = await sbLoadAll(); peers = (rows || []).map(r => ({ id: r.id, updated: r.updated_at, d: r.data || {} })); }
  catch { /* réseau : on garde le cache */ }
  finally { peersAt = Date.now(); emitPeers(); }
}
/* Hook : rafraîchit au montage (si périmé) puis toutes les 25s tant que la vue est active. */
export function usePeersAuto(active = true) {
  const p = usePeers();
  useEffect(() => {
    if (!active) return;
    if (!peersFresh()) refreshPeers();
    const id = setInterval(() => { if (getLogged()) refreshPeers(); }, 25000);
    return () => clearInterval(id);
  }, [active]);
  return p;
}

/* ===== mise du jour (Cœur) : perte d'XP si aucune action ===== */
export function enforceCoeurDaily() {
  const tk = todayKey();
  const started = S.quests.length > 0 || S.log.length > 0;
  if (!started || !S.coeurCheck) { S.coeurCheck = tk; return null; }
  if (S.coeurCheck >= tk) return null;
  let dk = S.coeurCheck, lost = 0, missed = 0, guard = 0;
  while (dk < tk && guard++ < 40) {
    if (dk > "2026-07-06" && dk >= addDays(tk, -14) && !(S.coeurDaily[dk] > 0)) { lost += 10; missed++; }
    dk = addDays(dk, 1);
  }
  S.coeurCheck = tk;
  if (lost > 0) { S.xp = Math.max(0, S.xp - lost); S.streak = 0; }
  return missed > 0 ? { lost, missed } : null;
}

/* ===== init (au montage) — gate de login ===== */
export async function initApp() {
  await loadCreds();
  if (!SB.player) { setLogged(false); return { logged: false, pen: null }; }
  await load();
  const pen = enforceCoeurDaily();
  emitS(); save(); setLogged(true); refreshPeers();
  return { logged: true, pen };
}
