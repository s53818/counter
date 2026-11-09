/* Rep Counter – Vanilla JS. Daten liegen in localStorage (Schlüssel STORE_KEY). */
"use strict";

const STORE_KEY = "rep-counter.v1";
/** state = { counters: [{ id, name, step, value }] } */
let state = load();
let editingId = null; // null = neuer Counter

const $ = (id) => document.getElementById(id);

/* ---------- Speicher ---------- */
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && Array.isArray(s.counters)) return s;
  } catch (e) {}
  return { counters: [] };
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
}
// Float-Rauschen vermeiden (0.1 + 0.2), max. 3 Nachkommastellen
const round = (n) => Math.round(n * 1000) / 1000;
const find = (id) => state.counters.find((c) => c.id === id);

/* ---------- Liste rendern ---------- */
function render() {
  const list = $("list");
  list.textContent = "";
  for (const c of state.counters) {
    const li = document.createElement("li");
    li.className = "item";
    li.dataset.id = c.id;
    li.innerHTML = `<div class="name"></div><div class="value"></div><div class="step"></div>`;
    li.querySelector(".name").textContent = c.name;
    li.querySelector(".value").textContent = c.value;
    li.querySelector(".step").textContent = "Schritt " + c.step;
    list.appendChild(li);
  }
  $("empty").hidden = state.counters.length > 0;
  if (detailId) renderDetail();
}

// Tipp auf eine Karte öffnet die Detailseite
$("list").addEventListener("click", (e) => {
  const li = e.target.closest(".item");
  if (li) openDetail(li.dataset.id);
});

/* ---------- Detailseite: hoch/runter zählen ---------- */
let detailId = null;

function openDetail(id) { detailId = id; $("detail").hidden = false; renderDetail(); }
function closeDetail() { detailId = null; $("detail").hidden = true; render(); }
function renderDetail() {
  const c = find(detailId);
  if (!c) return closeDetail();
  $("dName").textContent = c.name;
  $("dValue").textContent = c.value;
  $("dStep").textContent = "Schritt " + c.step;
}
function count(dir) {
  const c = find(detailId);
  c.value = round(c.value + dir * c.step);
  save();
  renderDetail();
  const v = $("dValue");
  v.classList.remove("bump"); void v.offsetWidth; v.classList.add("bump");
}
$("dInc").addEventListener("click", () => count(1));
$("dDec").addEventListener("click", () => count(-1));
$("backBtn").addEventListener("click", closeDetail);
$("dEditBtn").addEventListener("click", () => openSheet(find(detailId)));

/* ---------- Bearbeiten-Sheet ---------- */
function openSheet(c) {
  editingId = c ? c.id : null;
  $("sheetTitle").textContent = c ? "Counter bearbeiten" : "Neuer Counter";
  $("fName").value = c ? c.name : "";
  $("fStep").value = c ? c.step : 1;       // Standard-Schrittweite: 1
  $("fValue").value = c ? c.value : 0;
  $("resetBtn").hidden = $("delBtn").hidden = !c;
  $("sheet").hidden = $("sheetBack").hidden = false;
  if (!c) $("fName").focus();
}
function closeSheet() { $("sheet").hidden = $("sheetBack").hidden = true; }

$("addBtn").addEventListener("click", () => openSheet(null));
$("cancelBtn").addEventListener("click", closeSheet);
$("sheetBack").addEventListener("click", closeSheet);
$("resetBtn").addEventListener("click", () => { $("fValue").value = 0; });
$("delBtn").addEventListener("click", () => {
  const c = find(editingId);
  if (c && confirm(`„${c.name}“ löschen?`)) {
    state.counters = state.counters.filter((x) => x.id !== editingId);
    save(); render(); closeSheet();
  }
});
$("sheet").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("fName").value.trim();
  const step = round(parseFloat($("fStep").value)) || 1;
  const value = round(parseFloat($("fValue").value)) || 0;
  if (!name) return;
  if (editingId) Object.assign(find(editingId), { name, step: Math.abs(step), value });
  else state.counters.push({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), name, step: Math.abs(step), value });
  save(); render(); closeSheet();
});

/* ---------- Tabs ---------- */
document.querySelectorAll(".tab-btn").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((x) => x.classList.toggle("active", x === b));
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.id === b.dataset.tab));
    $("addBtn").classList.toggle("hidden", b.dataset.tab !== "tab-counters");
  })
);

/* ---------- Export / Import ---------- */
$("exportBtn").addEventListener("click", async () => {
  const name = `counter-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const file = new File([JSON.stringify(state, null, 2)], name, { type: "application/json" });
  // iOS: Teilen-Dialog ("In Dateien sichern"); Fallback: normaler Download
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file] }); return; } catch (e) { if (e.name === "AbortError") return; }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(file); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
$("importBtn").addEventListener("click", () => $("importFile").click());
$("importFile").addEventListener("change", async (e) => {
  const f = e.target.files[0]; e.target.value = "";
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (!Array.isArray(data.counters)) throw 0;
    const counters = data.counters.map((c) => ({
      id: String(c.id || Math.random()), name: String(c.name || "Counter"),
      step: Number(c.step) || 1, value: Number(c.value) || 0 }));
    if (!confirm(`${counters.length} Counter importieren? Bestehende Daten werden ersetzt.`)) return;
    state = { counters }; save(); render();
  } catch (err) { alert("Ungültige Backup-Datei."); }
});

/* ---------- Dauerhafter Speicher ---------- */
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().then((ok) => {
    $("persistInfo").textContent = ok ? "Speicher: dauerhaft geschützt" : "Speicher: nicht garantiert – bitte Backups anlegen";
  });
}

/* ---------- Service Worker + Update-Hinweis ---------- */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").then((reg) => {
    const offer = (worker) => {
      $("update").hidden = false;
      $("updateBtn").onclick = () => worker.postMessage("SKIP_WAITING");
    };
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener("updatefound", () => {
      const w = reg.installing;
      w.addEventListener("statechange", () => {
        if (w.state === "installed" && navigator.serviceWorker.controller) offer(w);
      });
    });
  });
  // Neuer SW übernimmt -> Seite einmal neu laden
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!reloaded) { reloaded = true; location.reload(); }
  });
}

render();
