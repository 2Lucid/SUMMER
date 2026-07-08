import { useState } from "react";
import { useGame } from "../game.jsx";
import { usePeersAuto, myId } from "../store.js";
import { toast } from "../fx.js";
import { todayKey, fromDk, addDays, dkOf, uid, pad, WD, MO, frDate } from "../lib/util.js";
import { deadlines, prepaBlocks, PREPA_COLOR } from "../lib/config.js";
import { CAL_START, CAL_END, CAL_HPX, CAL_TOTAL, MOF, EV_TYPES, DEF_TYPE, evTypeOf, evCoversDay, evIsRange, evDayCount, hm2min, min2hm, capEnd, calMonday, calWeekDays } from "../lib/agenda.js";

export default function Agenda() {
  const { S, ui, patch, saveEvent, deleteEvent } = useGame();
  const peers = usePeersAuto(true);
  const me = myId();
  const view = ui.calView || "week";
  const date = ui.calDate || todayKey();
  const [editor, setEditor] = useState(null);
  const [peek, setPeek] = useState(null);
  const tk = todayKey();
  const shareOn = ui.sharePlan !== false;
  const prepaOn = ui.calPrepa !== false;

  /* --- données --- */
  const evSort = (a, b) => (a.allDay ? -1 : 0) - (b.allDay ? -1 : 0) || hm2min(a.start) - hm2min(b.start);
  const evOfDay = dk => S.events.filter(e => evCoversDay(e, dk)).slice().sort(evSort);
  const dlOf = dk => deadlines().filter(d => d.dk === dk);

  /* --- blocs prépa auto (fond du calendrier, privés, lecture seule) : masqués un jour déjà « matérialisé » en vrais événements --- */
  const hasGen = dk => S.events.some(e => e.gen === "prepa" && e.date === dk);
  const prepaOfDay = dk => (prepaOn && !hasGen(dk)) ? prepaBlocks(dk).map(b => ({ ...b, title: b.k + " " + b.l, color: PREPA_COLOR, note: b.s, date: dk, allDay: false })) : [];

  /* --- événements des autres joueurs, intégrés au grand planning en lecture seule (les créneaux PRIVÉS ne sont jamais partagés) --- */
  const peerEvs = shareOn ? peers.filter(p => p.id !== me).flatMap(p => {
    const d = p.d || {}, pr = d.profile || {};
    const owner = { id: p.id, name: pr.name || p.id, avatar: pr.avatar || "⭐" };
    return (d.events || []).filter(e => e && !e.private).map(e => ({ ...e, _owner: owner }));
  }) : [];
  const peerOfDay = dk => peerEvs.filter(e => evCoversDay(e, dk)).slice().sort(evSort);

  /* --- navigation --- */
  const shift = n => {
    if (view === "month") { const d = fromDk(date); d.setMonth(d.getMonth() + n); patch({ calDate: dkOf(d) }); }
    else if (view === "day") patch({ calDate: addDays(date, n) });
    else patch({ calDate: addDays(date, 7 * n) });
  };
  const title = (() => {
    const d = fromDk(date);
    if (view === "month") return MOF[d.getMonth()] + " " + d.getFullYear();
    if (view === "day") return frDate(date);
    const a = fromDk(calMonday(date)), b = fromDk(addDays(calMonday(date), 6));
    return a.getMonth() === b.getMonth()
      ? a.getDate() + " – " + b.getDate() + " " + MO[b.getMonth()]
      : a.getDate() + " " + MO[a.getMonth()] + " – " + b.getDate() + " " + MO[b.getMonth()];
  })();

  /* --- éditeur --- */
  const openEvent = id => { const e = S.events.find(x => x.id === id); if (e) setEditor({ ...e }); };
  const newEvent = (d, startMin, allDay) => {
    let start = "09:00", end = "10:00";
    if (typeof startMin === "number") { const sm = Math.max(CAL_START * 60, Math.min((CAL_END - 1) * 60, Math.round(startMin / 30) * 30)); start = min2hm(sm); end = min2hm(capEnd(sm + 60)); }
    setEditor({ title: "", date: d || date, start, end, allDay: !!allDay, type: DEF_TYPE.id, color: DEF_TYPE.color, note: "" });
  };
  const commit = () => {
    const e = editor, t = (e.title || "").trim();
    if (!t) { toast("Donne un titre à ton événement ✍️"); return; }
    let start = e.start || "09:00", end = e.end || "10:00";
    if (!e.allDay && hm2min(end) <= hm2min(start)) end = min2hm(capEnd(hm2min(start) + 60));
    const ty = evTypeOf(e);
    const rec = { id: e.id || uid(), title: t.slice(0, 80), date: e.date, allDay: !!e.allDay, start, end, type: ty.id, color: ty.color, note: (e.note || "").slice(0, 500) };
    if (e.allDay && e.endDate && e.endDate > e.date) rec.endDate = e.endDate;
    if (e.private) rec.private = true;
    if (e.gen) rec.gen = e.gen;
    const isNew = !e.id; saveEvent(rec); setEditor(null);
    const nd = evDayCount(rec);
    toast(isNew ? (nd > 1 ? `Plage ajoutée 🏖️ (${nd} jours)` : "Événement ajouté 🗓️") : "Événement mis à jour ✓");
  };
  const remove = () => { if (!confirm("Supprimer cet événement ?")) return; deleteEvent(editor.id); setEditor(null); toast("Événement supprimé"); };

  /* --- drag & drop (grille horaire) --- */
  const onEvPointerDown = (e, ev) => {
    e.stopPropagation();
    const el = e.currentTarget, startX = e.clientX, startY = e.clientY;
    const cols = Array.from(document.querySelectorAll("[data-calcol]"));
    const origTop = (hm2min(ev.start) - CAL_START * 60) / 60 * CAL_HPX;
    const dur = Math.max(15, hm2min(ev.end) - hm2min(ev.start));
    let moved = false;
    try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    const move = m => {
      const dx = m.clientX - startX, dy = m.clientY - startY;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 5) return;
      moved = true; el.classList.add("drag"); el.style.transform = `translate(${dx}px,${dy}px)`;
    };
    const up = m => {
      try { el.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
      el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up);
      el.style.transform = ""; el.classList.remove("drag");
      if (!moved) { openEvent(ev.id); return; }
      let sMin = CAL_START * 60 + Math.round((origTop + (m.clientY - startY)) / CAL_HPX * 60 / 15) * 15;
      sMin = Math.max(0, Math.min(CAL_END * 60 - 15, sMin));
      const under = cols.find(c => { const r = c.getBoundingClientRect(); return m.clientX >= r.left && m.clientX <= r.right; });
      const nd = under ? under.dataset.calcol : ev.date;
      saveEvent({ ...ev, date: nd, start: min2hm(sMin), end: min2hm(capEnd(sMin + dur)) });
    };
    el.addEventListener("pointermove", move); el.addEventListener("pointerup", up);
  };

  /* --- rendus --- */
  const evStyle = e => ({ top: Math.max(0, (hm2min(e.start) - CAL_START * 60) / 60 * CAL_HPX), height: Math.max(16, (Math.max(hm2min(e.start) + 20, hm2min(e.end)) - hm2min(e.start)) / 60 * CAL_HPX - 2), background: e.color + "26", borderLeft: "3px solid " + e.color });
  /* fond hachuré en diagonale : signature visuelle « ce n'est pas à moi » */
  const peerBg = c => `repeating-linear-gradient(135deg, ${c}2e, ${c}2e 5px, ${c}0d 5px, ${c}0d 11px)`;

  const nowLine = () => { const n = new Date(), m = n.getHours() * 60 + n.getMinutes(); if (m < CAL_START * 60 || m > CAL_END * 60) return null; return <div className="cal-now" style={{ top: (m - CAL_START * 60) / 60 * CAL_HPX }} />; };

  const MonthView = () => {
    const d = fromDk(date), mon = d.getMonth();
    const start = calMonday(dkOf(new Date(d.getFullYear(), mon, 1)));
    const wd = ["L", "M", "M", "J", "V", "S", "D"];
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const dk = addDays(start, i), dd = fromDk(dk), other = dd.getMonth() !== mon;
      const evs = evOfDay(dk), pevs = peerOfDay(dk), dls = dlOf(dk);
      const shown = evs.slice(0, 3), pShown = pevs.slice(0, Math.max(0, 3 - shown.length));
      const extra = (evs.length - shown.length) + (pevs.length - pShown.length);
      cells.push(
        <div key={dk} className={"cal-cell" + (other ? " other" : "") + (dk === tk ? " today" : "")} onClick={e => { if (e.target.closest(".cal-chip")) return; newEvent(dk); }}>
          <div className="cal-daynum">{dd.getDate()}</div>
          {dls.map((x, j) => <button key={"d" + j} className="cal-chip" style={{ background: "rgba(255,84,112,.16)", borderLeft: "3px solid var(--red)" }} onClick={ev => { ev.stopPropagation(); toast("📌 Deadline prépa — se gère dans l'onglet Prépa"); }}>📌 {x.label}</button>)}
          {shown.map(e => <button key={e.id} className="cal-chip" style={{ background: e.color + "2a", borderLeft: "3px solid " + e.color }} onClick={ev => { ev.stopPropagation(); openEvent(e.id); }}>{!e.allDay && <b>{e.start}</b>}{e.title}</button>)}
          {pShown.map(e => <button key={"p" + e._owner.id + e.id} className="cal-chip peer" style={{ background: peerBg(e.color), borderLeft: "3px dashed " + e.color }} onClick={ev => { ev.stopPropagation(); setPeek(e); }}><span className="pev-ava">{e._owner.avatar}</span>{!e.allDay && <b>{e.start}</b>}{e.title}</button>)}
          {extra > 0 && <div className="cal-more">+{extra} autre{extra > 1 ? "s" : ""}</div>}
        </div>
      );
    }
    return <><div className="cal-wd">{wd.map((w, i) => <span key={i}>{w}</span>)}</div><div className="cal-month">{cells}</div></>;
  };

  const GridView = ({ days }) => {
    const cols = days.length, gtc = { gridTemplateColumns: `44px repeat(${cols},1fr)` };
    const hlabs = [];
    for (let h = CAL_START; h <= CAL_END; h++) hlabs.push(<div key={h} className="cal-hlab" style={{ top: (h - CAL_START) * CAL_HPX }}>{h < 24 ? pad(h) + ":00" : ""}</div>);
    return (
      <>
        <div className="cal-th" style={gtc}>
          <div className="cal-gut" />
          {days.map(dk => { const dd = fromDk(dk); return (
            <div key={dk} className={"cal-thd" + (dk === tk ? " today" : "")} onClick={() => patch({ calDate: dk, calView: "day" })}>
              <div className="wd">{WD[dd.getDay()].slice(0, 3)}</div><div className="dn">{dd.getDate()}</div>
            </div>); })}
        </div>
        <div className="cal-allday" style={gtc}>
          <div className="cal-gut">jour</div>
          {days.map(dk => (
            <div key={dk} className="cal-adcol" onClick={e => { if (e.target.closest(".cal-ad")) return; newEvent(dk, undefined, true); }}>
              {dlOf(dk).map((x, j) => <button key={"d" + j} className="cal-ad" style={{ background: "rgba(255,84,112,.2)", borderLeft: "3px solid var(--red)" }} onClick={ev => { ev.stopPropagation(); toast("📌 Deadline prépa — se gère dans l'onglet Prépa"); }}>📌 {x.label}</button>)}
              {evOfDay(dk).filter(e => e.allDay).map(e => <button key={e.id} className="cal-ad" style={{ background: e.color + "33", borderLeft: "3px solid " + e.color }} onClick={ev => { ev.stopPropagation(); openEvent(e.id); }}>{e.title}</button>)}
              {peerOfDay(dk).filter(e => e.allDay).map(e => <button key={"p" + e._owner.id + e.id} className="cal-ad peer" style={{ background: peerBg(e.color), borderLeft: "3px dashed " + e.color }} onClick={ev => { ev.stopPropagation(); setPeek(e); }}><span className="pev-ava">{e._owner.avatar}</span>{e.title}</button>)}
            </div>
          ))}
        </div>
        <div className="cal-scroll">
          <div className="cal-canvas" style={gtc}>
            <div className="cal-gut cal-hours" style={{ height: CAL_TOTAL }}>{hlabs}</div>
            {days.map(dk => (
              <div key={dk} className={"cal-col" + (dk === tk ? " today" : "")} data-calcol={dk} style={{ height: CAL_TOTAL, "--hpx": CAL_HPX + "px" }}
                onClick={e => { if (e.target.closest(".cal-ev")) return; const r = e.currentTarget.getBoundingClientRect(); newEvent(dk, CAL_START * 60 + (e.clientY - r.top) / CAL_HPX * 60); }}>
                {prepaOfDay(dk).filter(e => !e.allDay).map((e, i) => { const st = evStyle(e); return (
                  <div key={"pr" + i} className="cal-ev prepa" style={{ ...st, background: peerBg(e.color), borderLeft: "3px dashed " + e.color }} onClick={ev => { ev.stopPropagation(); toast("📓 Bloc prépa perso — coche-le dans l'onglet Prépa"); }}>
                    <div className="et">{e.title}</div>
                    {st.height > 28 && <div className="eh">{e.start}–{e.end}</div>}
                  </div>); })}
                {evOfDay(dk).filter(e => !e.allDay).map(e => (
                  <div key={e.id} className="cal-ev" style={evStyle(e)} onPointerDown={ev => onEvPointerDown(ev, e)}>
                    <div className="et">{e.private && "🔒 "}{e.title}</div>
                    {evStyle(e).height > 28 && <div className="eh">{e.start}–{e.end}</div>}
                  </div>
                ))}
                {peerOfDay(dk).filter(e => !e.allDay).map(e => {
                  const st = evStyle(e);
                  return (
                    <div key={"p" + e._owner.id + e.id} className="cal-ev peer" style={{ ...st, left: "48%", background: peerBg(e.color), borderLeftStyle: "dashed" }} onClick={ev => { ev.stopPropagation(); setPeek(e); }}>
                      <div className="et"><span className="pev-ava">{e._owner.avatar}</span>{e.title}</div>
                      {st.height > 28 && <div className="eh">{e.start}–{e.end}{st.height > 46 && <span className="pev-own"> · {e._owner.name}</span>}</div>}
                    </div>
                  );
                })}
                {dk === tk && nowLine()}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="cal">
      <div className="cal-top">
        <div className="cal-nav">
          <button className="cal-ib" onClick={() => shift(-1)}>‹</button>
          <button className="cal-ib" onClick={() => shift(1)}>›</button>
          <button className="cal-today" onClick={() => patch({ calDate: tk })}>Aujourd'hui</button>
        </div>
        <div className="cal-title">{title}</div>
        <div className="cal-views">
          {[["month", "Mois"], ["week", "Semaine"], ["day", "Jour"]].map(([v, l]) => (
            <button key={v} className={view === v ? "on" : ""} onClick={() => patch({ calView: v })}>{l}</button>
          ))}
        </div>
        <button className="cal-add" onClick={() => newEvent(date)}>+ Événement</button>
        <button className={"cal-prepa-toggle" + (prepaOn ? " on" : "")} onClick={() => patch({ calPrepa: ui.calPrepa === false })} title="Afficher/masquer tes blocs de travail prépa (privés)">📓 Prépa {prepaOn ? "✓" : ""}</button>
      </div>

      <div className="cal-panel">
        {view === "month" ? <MonthView /> : view === "day" ? <GridView days={[date]} /> : <GridView days={calWeekDays(date)} />}
      </div>

      <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 10, lineHeight: 1.5 }}>
        Touche un créneau vide pour créer · glisse un bloc pour le déplacer · touche-le pour l'éditer. Tes 📓 blocs prépa (privés, hachurés) et les créneaux des autres joueurs (pointillés) apparaissent en lecture seule. Un événement 🔒 perso n'est jamais partagé.
      </div>

      <SharedPlanning peers={peers} me={me} view={view} date={date} on={shareOn} onToggle={() => patch({ sharePlan: ui.sharePlan === false })} onPeek={setPeek} />

      {editor && <EventEditor e={editor} set={setEditor} onSave={commit} onDelete={remove} onClose={() => setEditor(null)} />}
      {peek && <PeerPeek e={peek} onClose={() => setPeek(null)} />}
    </div>
  );
}

/* Aperçu en lecture seule d'un événement posé par un autre joueur. */
function PeerPeek({ e, onClose }) {
  const ty = evTypeOf(e);
  const when = e.allDay ? (evIsRange(e) ? "Toute la journée · " + evDayCount(e) + " jours" : "Toute la journée") : e.start + " – " + e.end;
  return (
    <div className="overlay" onClick={ev => { if (ev.target === ev.currentTarget) onClose(); }}>
      <div className="sheet cal-form">
        <div className="peek-owner"><span className="ava">{e._owner.avatar}</span><span>Planning de <b>{e._owner.name}</b></span></div>
        <h3 style={{ margin: "6px 0 2px" }}>{e.title || "(sans titre)"}</h3>
        <div className="peek-line"><span className="dot" style={{ background: e.color || "#8f7bff" }} />{ty.emoji} {ty.label} · {frDate(e.date)}</div>
        <div className="peek-line" style={{ fontFamily: "var(--disp)", fontWeight: 700, color: "var(--cyan)" }}>{when}</div>
        {e.note && <div className="peek-note">{e.note}</div>}
        <div className="peek-hint">🔒 Créneau d'un autre joueur — lecture seule.</div>
        <div className="sheetrow" style={{ marginTop: 18 }}>
          <button className="btn" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

function SharedPlanning({ peers, me, view, date, on, onToggle, onPeek }) {
  const days = view === "day" ? [date]
    : view === "month" ? (() => { const d = fromDk(date), mon = d.getMonth(), first = dkOf(new Date(d.getFullYear(), mon, 1)), last = dkOf(new Date(d.getFullYear(), mon + 1, 0)); const out = []; let dk = first; while (dk <= last) { out.push(dk); dk = addDays(dk, 1); } return out; })()
      : calWeekDays(date);
  const inRange = e => days.some(dk => evCoversDay(e, dk));
  const others = peers.filter(p => p.id !== me).map(p => {
    const d = p.d || {}, pr = d.profile || {};
    const evs = (d.events || []).filter(e => e && !e.private && inRange(e)).slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) || (a.allDay ? -1 : 0) - (b.allDay ? -1 : 0) || hm2min(a.start) - hm2min(b.start));
    return { id: p.id, name: pr.name || p.id, avatar: pr.avatar || "⭐", evs };
  }).filter(o => o.evs.length);
  const loading = peers.length === 0;
  const rangeLbl = view === "day" ? "ce jour" : view === "month" ? "ce mois" : "cette semaine";

  return (
    <div className="share-panel">
      <div className="share-head">
        <span className="sh-t">👥 Planning partagé</span>
        <button className={"share-toggle" + (on ? "" : " off")} onClick={onToggle}>{on ? "👁️ Affiché" : "🙈 Masqué"}</button>
      </div>
      {!on ? <div className="share-empty">Le planning des autres est masqué. Touche « Masqué » pour afficher leurs créneaux directement dans le grand planning {rangeLbl}.</div>
        : loading ? <div className="share-empty">☁️ Chargement du planning des autres…</div>
          : !others.length ? <div className="share-empty">Personne d'autre n'a posé de créneau {rangeLbl}. Sois celui qui donne le rythme. 🔥</div>
            : <>
              <div className="share-empty" style={{ marginTop: 8 }}>Leurs créneaux apparaissent en pointillés dans le calendrier ci-dessus. Récap {rangeLbl} :</div>
              {others.map((o, oi) => (
                <div className="share-person" key={oi}>
                  <div className="share-who"><span className="ava">{o.avatar}</span>{o.name}<span className="cnt">{o.evs.length} créneau{o.evs.length > 1 ? "x" : ""}</span></div>
                  {o.evs.map((e, ei) => (
                    <button className="share-ev" key={ei} onClick={() => onPeek({ ...e, _owner: { id: o.id, name: o.name, avatar: o.avatar } })}>
                      <span className="t">{e.allDay ? (evIsRange(e) ? evDayCount(e) + " j" : "journée") : e.start + "–" + e.end}</span>
                      <span className="dot" style={{ background: e.color || "#8f7bff" }} />
                      <span className="ti">{e.title || "(sans titre)"}{days.length > 1 && <span style={{ color: "var(--muted)" }}> · {WD[fromDk(e.date).getDay()].slice(0, 3)} {fromDk(e.date).getDate()}</span>}</span>
                    </button>
                  ))}
                </div>
              ))}
            </>}
    </div>
  );
}

/* Sélecteur d'heure 24h façon FR : « 15h » + minutes, sans AM/PM. */
function TimeField({ value, onChange }) {
  const [hs, ms] = String(value || "09:00").split(":");
  const h = Math.max(0, Math.min(23, Number(hs) || 0));
  const m = Math.max(0, Math.min(59, Number(ms) || 0));
  return (
    <div className="timefield">
      <select value={h} onChange={ev => onChange(pad(Number(ev.target.value)) + ":" + pad(m))}>
        {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i}h</option>)}
      </select>
      <select value={m} onChange={ev => onChange(pad(h) + ":" + pad(Number(ev.target.value)))}>
        {Array.from({ length: 12 }, (_, i) => <option key={i} value={i * 5}>{pad(i * 5)}</option>)}
      </select>
    </div>
  );
}

function EventEditor({ e, set, onSave, onDelete, onClose }) {
  const isNew = !e.id;
  const upd = p => set(cur => ({ ...cur, ...p }));
  return (
    <div className="overlay" onClick={ev => { if (ev.target === ev.currentTarget) onClose(); }}>
      <div className="sheet cal-form">
        <h3>{isNew ? "Nouvel événement" : "Modifier l'événement"}</h3>
        <input type="text" className="titin" placeholder="Titre de l'événement" value={e.title} autoComplete="off" autoFocus onChange={ev => upd({ title: ev.target.value })} />
        <div className="cal-ad-row" onClick={() => upd({ allDay: !e.allDay })}>
          <input type="checkbox" checked={e.allDay} readOnly /><span>Toute la journée</span>
        </div>
        <div className="cal-ad-row" onClick={() => upd(e.endDate ? { endDate: undefined } : { endDate: e.date, allDay: true })}>
          <input type="checkbox" checked={!!e.endDate} readOnly /><span>🏖️ Plage de plusieurs jours (vacances, stage…)</span>
        </div>
        <div className="cal-ad-row" onClick={() => upd({ private: !e.private })}>
          <input type="checkbox" checked={!!e.private} readOnly /><span>🔒 Perso — non partagé avec les autres joueurs</span>
        </div>
        {e.endDate ? (
          <div className="cal-2">
            <div>
              <label>Du</label>
              <input type="date" value={e.date} onChange={ev => { const v = ev.target.value; upd({ date: v, endDate: e.endDate < v ? v : e.endDate }); }} />
            </div>
            <div>
              <label>Au</label>
              <input type="date" value={e.endDate} min={e.date} onChange={ev => upd({ endDate: ev.target.value })} />
            </div>
          </div>
        ) : (
          <>
            <label>Date</label>
            <input type="date" value={e.date} onChange={ev => upd({ date: ev.target.value })} />
          </>
        )}
        {!e.allDay && !e.endDate && (
          <div className="cal-2">
            <div><label>Début</label><TimeField value={e.start} onChange={v => upd({ start: v })} /></div>
            <div><label>Fin</label><TimeField value={e.end} onChange={v => upd({ end: v })} /></div>
          </div>
        )}
        <label>Type</label>
        <div className="cal-types">
          {EV_TYPES.map(t => {
            const on = evTypeOf(e).id === t.id;
            return (
              <button key={t.id} className={"cal-type" + (on ? " on" : "")} style={on ? { borderColor: t.color, background: t.color + "22" } : undefined}
                onClick={() => upd({ type: t.id, color: t.color })}>
                <span className="cdot" style={{ background: t.color }} />{t.emoji} {t.label}
              </button>
            );
          })}
        </div>
        <label>Note</label>
        <textarea placeholder="Détails, lieu, lien…" value={e.note || ""} onChange={ev => upd({ note: ev.target.value })} />
        <div className="sheetrow" style={{ marginTop: 18 }}>
          {isNew
            ? <button className="btn ghost" onClick={onClose}>Annuler</button>
            : <button className="btn ghost set-danger" onClick={onDelete}>🗑 Supprimer</button>}
          <button className="btn" onClick={onSave}>{isNew ? "Créer" : "Enregistrer"}</button>
        </div>
      </div>
    </div>
  );
}
