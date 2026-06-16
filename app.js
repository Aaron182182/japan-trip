const STORAGE_KEY = "japanTrip";

const CATEGORY_META = {
  lodging: { icon: "🏨", label: "Lodging" },
  transport: { icon: "🚄", label: "Transport" },
  food: { icon: "🍜", label: "Food & Drink" },
  culture: { icon: "⛩️", label: "Culture & History" },
  nature: { icon: "🌳", label: "Nature & Parks" },
  shopping: { icon: "🛍️", label: "Shopping" },
  popculture: { icon: "🎮", label: "Pop Culture" },
  golf: { icon: "⛳", label: "Golf" },
  themepark: { icon: "🎢", label: "Theme Park" }
};

const TRANSFER_MODES = ["Private transfer", "Taxi", "Shuttle bus", "Train / Shinkansen", "Subway / Local train", "Rental car", "Other"];

let trip = loadTrip();
let activeDayId = trip.days[0] ? trip.days[0].id : null;

function clone(obj) {
  return typeof structuredClone === "function" ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));
}

// Fill in any keys/fields added in newer versions so trips already saved
// in localStorage (from an earlier version) gain the new sections cleanly.
// Runs on every load — including the fresh seed — so all records are normalized.
function migrate(t) {
  if (!t || typeof t !== "object") t = clone(DEFAULT_TRIP);
  if (typeof t.jpyPerAud !== "number" || !t.jpyPerAud) t.jpyPerAud = DEFAULT_TRIP.jpyPerAud;
  ["flights", "transfers", "accommodation", "activityBookings", "packingList", "budget", "days"].forEach((k) => {
    if (!Array.isArray(t[k])) t[k] = clone(DEFAULT_TRIP[k] || []);
  });
  // Backfill booking fields added with the Bookings hub.
  t.flights.forEach((f) => {
    f.cost = Number(f.cost) || 0;
    if (typeof f.confirmed !== "boolean") f.confirmed = false;
    f.phone = f.phone || ""; f.website = f.website || "";
  });
  t.transfers.forEach((x) => {
    if (typeof x.confirmed !== "boolean") x.confirmed = false;
    x.phone = x.phone || ""; x.website = x.website || ""; x.email = x.email || "";
  });
  return t;
}

function loadTrip() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch (e) {
    console.warn("Could not read saved trip, falling back to sample data.", e);
  }
  return migrate(clone(DEFAULT_TRIP));
}

function saveTrip() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
}

function uid(prefix) {
  const rand = (window.crypto && crypto.randomUUID) ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function addDays(isoDateStr, n) {
  const d = new Date(isoDateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d;
}

function formatShortDate(date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatLongDate(date) {
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatDateTime(isoStr) {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  if (isNaN(d)) return escapeHtml(isoStr);
  return d.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatDateOnly(isoDateStr) {
  if (!isoDateStr) return "";
  const d = new Date(isoDateStr + "T00:00:00");
  if (isNaN(d)) return escapeHtml(isoDateStr);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function mapsUrl(query) {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
}

const KLOOK_BOOKINGS_URL = "https://www.klook.com/booking/";

function directionsUrl(destination, mode, origin) {
  const params = new URLSearchParams({ api: "1", destination });
  if (origin) params.set("origin", origin);
  if (mode) params.set("travelmode", mode);
  return "https://www.google.com/maps/dir/?" + params.toString();
}

function telHref(phone) {
  return "tel:" + String(phone).replace(/[^+\d]/g, "");
}

function searchUrl(q) {
  return "https://www.google.com/search?q=" + encodeURIComponent(q);
}

function normalizeUrl(u) {
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : "https://" + u;
}

// Builds a row of one-tap action buttons (Map / transit Route / Taxi / Call /
// Site / Email / Search / Klook) from whichever fields a booking has.
function bookingActions(o) {
  const btns = [];
  if (o.mapQuery) btns.push(`<a class="action-btn" href="${mapsUrl(o.mapQuery)}" target="_blank" rel="noopener">📍 Map</a>`);
  if (o.dirDestination) {
    btns.push(`<a class="action-btn" href="${directionsUrl(o.dirDestination, "transit", o.dirOrigin)}" target="_blank" rel="noopener">🚆 Route</a>`);
    btns.push(`<a class="action-btn" href="${directionsUrl(o.dirDestination, "driving", o.dirOrigin)}" target="_blank" rel="noopener">🚕 Taxi</a>`);
  }
  if (o.phone) btns.push(`<a class="action-btn" href="${telHref(o.phone)}">📞 Call</a>`);
  if (o.website) btns.push(`<a class="action-btn" href="${escapeHtml(normalizeUrl(o.website))}" target="_blank" rel="noopener">🌐 Site</a>`);
  if (o.email) btns.push(`<a class="action-btn" href="mailto:${escapeHtml(o.email)}">✉️ Email</a>`);
  if (o.searchQuery) btns.push(`<a class="action-btn" href="${searchUrl(o.searchQuery)}" target="_blank" rel="noopener">🔎 Search</a>`);
  if (o.klook) btns.push(`<a class="action-btn action-klook" href="${escapeHtml(o.klook === true ? KLOOK_BOOKINGS_URL : normalizeUrl(o.klook))}" target="_blank" rel="noopener">🎟️ Klook</a>`);
  return btns.length ? `<div class="action-row">${btns.join("")}</div>` : "";
}

function statusBadge(confirmed) {
  return confirmed
    ? '<span class="status-badge confirmed">✓ Confirmed</span>'
    : '<span class="status-badge pending">Pending</span>';
}

function nightsBetween(inDate, outDate) {
  if (!inDate || !outDate) return 0;
  const a = new Date(inDate + "T00:00:00"), b = new Date(outDate + "T00:00:00");
  const n = Math.round((b - a) / 86400000);
  return n > 0 ? n : 0;
}

function allBookings() {
  return [...trip.flights, ...trip.accommodation, ...trip.transfers, ...trip.activityBookings];
}

function confirmedBookingsTotal() {
  return allBookings().reduce((s, b) => s + (b.confirmed ? Number(b.cost) || 0 : 0), 0);
}

function bookingsGrandTotal() {
  return allBookings().reduce((s, b) => s + (Number(b.cost) || 0), 0);
}

function money(n) {
  return "¥" + (Number(n) || 0).toLocaleString();
}

function toAud(jpy) {
  const rate = Number(trip.jpyPerAud) || DEFAULT_TRIP.jpyPerAud;
  return (Number(jpy) || 0) / rate;
}

function moneyAud(jpy) {
  return "A$" + toAud(jpy).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || "Misc";
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {});
}

// ---------- Day / activity mutations ----------

function addDayAtEnd() {
  const newDay = { id: uid("d"), city: "New city", hotel: "", activities: [] };
  trip.days.push(newDay);
  activeDayId = newDay.id;
  saveTrip();
  renderDayTabs();
  renderDayContent();
}

function insertDayAfter(dayId) {
  const idx = trip.days.findIndex((d) => d.id === dayId);
  const newDay = { id: uid("d"), city: "New city", hotel: "", activities: [] };
  trip.days.splice(idx + 1, 0, newDay);
  activeDayId = newDay.id;
  saveTrip();
  renderDayTabs();
  renderDayContent();
}

function deleteDay(dayId) {
  if (trip.days.length <= 1) {
    alert("You need at least one day — edit it instead of deleting.");
    return;
  }
  if (!confirm("Delete this day and all its activities? Every later day shifts a day earlier.")) return;
  const idx = trip.days.findIndex((d) => d.id === dayId);
  trip.days.splice(idx, 1);
  activeDayId = trip.days[Math.max(0, idx - 1)].id;
  saveTrip();
  renderDayTabs();
  renderDayContent();
}

function createActivity(dayId, data) {
  const day = trip.days.find((d) => d.id === dayId);
  day.activities.push({ id: uid("a"), ...data });
  saveTrip();
  renderDayContent();
  renderDayTabs();
}

function updateActivity(dayId, activityId, data) {
  const day = trip.days.find((d) => d.id === dayId);
  const a = day.activities.find((x) => x.id === activityId);
  Object.assign(a, data);
  saveTrip();
  renderDayContent();
}

function deleteActivity(dayId, activityId) {
  const day = trip.days.find((d) => d.id === dayId);
  day.activities = day.activities.filter((x) => x.id !== activityId);
  saveTrip();
  renderDayContent();
}

// ---------- Rendering: itinerary ----------

function renderDayTabs() {
  const tabsEl = document.getElementById("day-tabs");
  const tabs = trip.days.map((d, idx) => {
    const date = addDays(trip.startDate, idx);
    return `<button class="day-tab ${d.id === activeDayId ? "active" : ""}" data-day-id="${d.id}">
      <span class="day-tab-num">Day ${idx + 1}</span>
      <span class="day-tab-date">${formatShortDate(date)}</span>
      <span class="day-tab-city">${escapeHtml(d.city)}</span>
    </button>`;
  }).join("");
  tabsEl.innerHTML = tabs + `<button class="day-tab add-day-tab" id="add-day-tab">+ Add day</button>`;

  tabsEl.querySelectorAll(".day-tab[data-day-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeDayId = btn.dataset.dayId;
      renderDayTabs();
      renderDayContent();
    });
  });
  document.getElementById("add-day-tab").addEventListener("click", addDayAtEnd);
}

function activityRow(a) {
  const meta = CATEGORY_META[a.category] || CATEGORY_META.food;
  return `
    <li class="activity-row" data-activity-id="${a.id}">
      <div class="activity-time">${escapeHtml(a.time)}</div>
      <div class="activity-icon" title="${meta.label}">${meta.icon}</div>
      <div class="activity-body">
        <div class="activity-title-row">
          <span class="activity-title">${escapeHtml(a.title)}</span>
          ${a.kid ? '<span class="kid-badge">👶 kid-friendly</span>' : ""}
        </div>
        ${a.location ? `<a class="maps-link" href="${mapsUrl(a.location)}" target="_blank" rel="noopener">📍 ${escapeHtml(a.location)}</a>` : ""}
        ${a.notes ? `<p class="activity-notes">${escapeHtml(a.notes)}</p>` : ""}
      </div>
      <div class="activity-cost">${a.cost ? money(a.cost) : ""}</div>
    </li>`;
}

function renderDayContent() {
  const container = document.getElementById("day-content");
  const day = trip.days.find((d) => d.id === activeDayId);
  if (!day) {
    container.innerHTML = '<p class="empty">No days yet — add one to get started.</p>';
    return;
  }
  const idx = trip.days.findIndex((d) => d.id === day.id);
  const date = addDays(trip.startDate, idx);
  const activities = [...day.activities].sort((a, b) => a.time.localeCompare(b.time));
  const dailyTotal = activities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);

  container.innerHTML = `
    <div class="day-card-header">
      <div class="day-date">${formatLongDate(date)}</div>
      <div class="day-fields">
        <input class="day-city-input" data-field="city" value="${escapeHtml(day.city)}" placeholder="City / area">
        <input class="day-hotel-input" data-field="hotel" value="${escapeHtml(day.hotel)}" placeholder="Hotel (optional)">
      </div>
      <div class="day-actions">
        <span class="day-total">Est. ${money(dailyTotal)} <span class="aud-sub">≈ ${moneyAud(dailyTotal)}</span></span>
        <button class="btn-text" id="insert-day-btn">+ Insert day after</button>
        <button class="btn-text btn-danger-text" id="delete-day-btn">Delete day</button>
      </div>
    </div>
    <ul class="activity-list">
      ${activities.map(activityRow).join("") || '<li class="empty">No activities yet.</li>'}
    </ul>
    <button class="btn-secondary add-activity-btn" id="add-activity-btn">+ Add activity</button>
  `;

  container.querySelectorAll("[data-field]").forEach((input) => {
    input.addEventListener("change", () => {
      day[input.dataset.field] = input.value;
      saveTrip();
      renderDayTabs();
    });
  });
  document.getElementById("add-activity-btn").addEventListener("click", () => openActivityModal(day.id));
  document.getElementById("insert-day-btn").addEventListener("click", () => insertDayAfter(day.id));
  document.getElementById("delete-day-btn").addEventListener("click", () => deleteDay(day.id));
  container.querySelectorAll(".activity-row").forEach((row) => {
    row.addEventListener("click", (e) => {
      if (e.target.closest(".maps-link")) return;
      const activity = day.activities.find((x) => x.id === row.dataset.activityId);
      openActivityModal(day.id, activity);
    });
  });
}

// ---------- Modal: add/edit activity ----------

function openActivityModal(dayId, activity) {
  const isEdit = !!activity;
  const a = activity || { time: "12:00", category: "food", title: "", location: "", notes: "", cost: 0, kid: false };
  const modal = document.getElementById("modal");
  modal.innerHTML = `
    <h2>${isEdit ? "Edit" : "Add"} activity</h2>
    <form id="activity-form">
      <label>Time
        <input type="time" name="time" value="${escapeHtml(a.time)}" required>
      </label>
      <label>Category
        <select name="category">
          ${Object.entries(CATEGORY_META).map(([k, v]) => `<option value="${k}" ${k === a.category ? "selected" : ""}>${v.icon} ${v.label}</option>`).join("")}
        </select>
      </label>
      <label>Title
        <input type="text" name="title" value="${escapeHtml(a.title)}" required>
      </label>
      <label>Location
        <input type="text" name="location" value="${escapeHtml(a.location)}" placeholder="Used for the Maps link">
      </label>
      <label>Notes
        <textarea name="notes" rows="3">${escapeHtml(a.notes)}</textarea>
      </label>
      <label>Estimated cost (¥)
        <input type="number" name="cost" value="${a.cost || 0}" min="0" step="100">
      </label>
      <label class="checkbox-label">
        <input type="checkbox" name="kid" ${a.kid ? "checked" : ""}>
        Kid-friendly
      </label>
      <div class="modal-actions">
        ${isEdit ? '<button type="button" id="delete-activity-btn" class="btn-danger">Delete</button>' : ""}
        <button type="button" id="cancel-modal-btn" class="btn-secondary">Cancel</button>
        <button type="submit" class="btn-primary">Save</button>
      </div>
    </form>
  `;
  showModal();

  const form = document.getElementById("activity-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = {
      time: fd.get("time"),
      category: fd.get("category"),
      title: fd.get("title").trim(),
      location: fd.get("location").trim(),
      notes: fd.get("notes").trim(),
      cost: Number(fd.get("cost")) || 0,
      kid: fd.get("kid") === "on"
    };
    if (isEdit) updateActivity(dayId, activity.id, data);
    else createActivity(dayId, data);
    closeModal();
  });
  document.getElementById("cancel-modal-btn").addEventListener("click", closeModal);
  if (isEdit) {
    document.getElementById("delete-activity-btn").addEventListener("click", () => {
      if (confirm("Delete this activity?")) {
        deleteActivity(dayId, activity.id);
        closeModal();
      }
    });
  }
}

function showModal() {
  document.getElementById("modal-overlay").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
  document.getElementById("modal").innerHTML = "";
}

// ---------- Rendering: travel (flights + transfers) ----------

function costLine(b) {
  return b.cost ? `<span class="booking-cost">${money(b.cost)} ≈ ${moneyAud(b.cost)}</span>` : "";
}

function flightCard(f) {
  const headline = [f.airline, f.flightNumber].filter(Boolean).join(" ") || "Flight details not set yet";
  const searchQ = ([f.airline, f.flightNumber].filter(Boolean).join(" ") || f.label) + " flight status";
  return `
    <div class="travel-card" data-flight-id="${f.id}">
      <div class="travel-card-head">
        <span class="travel-card-label">✈️ ${escapeHtml(f.label || "Flight")}</span>
        <button class="btn-text" data-edit-flight="${f.id}">Edit</button>
      </div>
      <div class="booking-status-row">${statusBadge(f.confirmed)}${costLine(f)}</div>
      <div class="flight-headline">${escapeHtml(headline)}</div>
      <div class="flight-legs">
        <div class="flight-leg">
          <span class="flight-leg-label">Depart</span>
          <span class="flight-airport">${escapeHtml(f.depAirport || "—")}</span>
          <span class="flight-datetime">${formatDateTime(f.depDateTime)}</span>
        </div>
        <div class="flight-arrow">→</div>
        <div class="flight-leg">
          <span class="flight-leg-label">Arrive</span>
          <span class="flight-airport">${escapeHtml(f.arrAirport || "—")}</span>
          <span class="flight-datetime">${formatDateTime(f.arrDateTime)}</span>
        </div>
      </div>
      ${(f.bookingRef || f.seats) ? `<div class="travel-meta">${f.bookingRef ? `<span>Ref: ${escapeHtml(f.bookingRef)}</span>` : ""}${f.seats ? `<span>Seats: ${escapeHtml(f.seats)}</span>` : ""}</div>` : ""}
      ${f.notes ? `<p class="travel-notes">${escapeHtml(f.notes)}</p>` : ""}
      ${bookingActions({ mapQuery: f.arrAirport, searchQuery: searchQ, phone: f.phone, website: f.website })}
    </div>`;
}

function transferCard(t) {
  return `
    <div class="travel-card" data-transfer-id="${t.id}">
      <div class="travel-card-head">
        <span class="travel-card-label">🚕 ${escapeHtml(t.mode || "Transfer")}</span>
        <button class="btn-text" data-edit-transfer="${t.id}">Edit</button>
      </div>
      <div class="booking-status-row">${statusBadge(t.confirmed)}${costLine(t)}</div>
      <div class="transfer-route">
        <span class="transfer-from">${escapeHtml(t.from || "—")}</span>
        <span class="flight-arrow">→</span>
        <span class="transfer-to">${escapeHtml(t.to || "—")}</span>
      </div>
      <div class="travel-meta">
        <span>📅 ${formatDateOnly(t.date)}${t.time ? " · " + escapeHtml(t.time) : ""}</span>
        ${t.provider ? `<span>${escapeHtml(t.provider)}</span>` : ""}
        ${t.bookingRef ? `<span>Ref: ${escapeHtml(t.bookingRef)}</span>` : ""}
      </div>
      ${t.notes ? `<p class="travel-notes">${escapeHtml(t.notes)}</p>` : ""}
      ${bookingActions({ mapQuery: t.to, dirDestination: t.to, dirOrigin: t.from, searchQuery: t.provider || (t.from + " to " + t.to), phone: t.phone, website: t.website, email: t.email })}
    </div>`;
}

function accommodationCard(h) {
  const nights = nightsBetween(h.checkIn, h.checkOut);
  return `
    <div class="travel-card" data-acc-id="${h.id}">
      <div class="travel-card-head">
        <span class="travel-card-label">🏨 ${escapeHtml(h.name || "Hotel")}</span>
        <button class="btn-text" data-edit-acc="${h.id}">Edit</button>
      </div>
      <div class="booking-status-row">${statusBadge(h.confirmed)}${costLine(h)}</div>
      ${h.address ? `<div class="travel-meta"><span>📍 ${escapeHtml(h.address)}</span></div>` : ""}
      <div class="travel-meta">
        <span>🛏️ ${formatDateOnly(h.checkIn)}${h.checkInTime ? " " + escapeHtml(h.checkInTime) : ""} → ${formatDateOnly(h.checkOut)}${h.checkOutTime ? " " + escapeHtml(h.checkOutTime) : ""}${nights ? ` · ${nights} night${nights > 1 ? "s" : ""}` : ""}</span>
      </div>
      ${(h.confirmationRef || h.phone) ? `<div class="travel-meta">${h.confirmationRef ? `<span>Conf: ${escapeHtml(h.confirmationRef)}</span>` : ""}${h.phone ? `<span>📞 ${escapeHtml(h.phone)}</span>` : ""}</div>` : ""}
      ${h.notes ? `<p class="travel-notes">${escapeHtml(h.notes)}</p>` : ""}
      ${bookingActions({ mapQuery: h.address || h.name, dirDestination: h.address || h.name, phone: h.phone, email: h.email, website: h.website, searchQuery: h.name })}
    </div>`;
}

function activityCard(a) {
  const isKlook = /klook/i.test(a.vendor || "");
  return `
    <div class="travel-card" data-actbk-id="${a.id}">
      <div class="travel-card-head">
        <span class="travel-card-label">🎟️ ${escapeHtml(a.name || "Activity")}</span>
        <button class="btn-text" data-edit-actbk="${a.id}">Edit</button>
      </div>
      <div class="booking-status-row">${statusBadge(a.confirmed)}${costLine(a)}</div>
      <div class="travel-meta">
        ${a.vendor ? `<span>${escapeHtml(a.vendor)}</span>` : ""}
        ${a.date ? `<span>📅 ${formatDateOnly(a.date)}${a.time ? " · " + escapeHtml(a.time) : ""}</span>` : ""}
        ${a.voucherRef ? `<span>Voucher: ${escapeHtml(a.voucherRef)}</span>` : ""}
        ${a.location ? `<span>📍 ${escapeHtml(a.location)}</span>` : ""}
      </div>
      ${a.notes ? `<p class="travel-notes">${escapeHtml(a.notes)}</p>` : ""}
      ${bookingActions({ mapQuery: a.location, dirDestination: a.location, phone: a.phone, website: a.website, searchQuery: [a.name, a.vendor].filter(Boolean).join(" "), klook: a.klookUrl || (isKlook ? true : "") })}
    </div>`;
}

function renderTravel() {
  const container = document.getElementById("travel-content");
  const transfers = [...trip.transfers].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const accommodation = [...trip.accommodation].sort((a, b) => (a.checkIn || "").localeCompare(b.checkIn || ""));
  const activities = [...trip.activityBookings].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const confirmed = confirmedBookingsTotal();
  const grand = bookingsGrandTotal();

  container.innerHTML = `
    <div class="bookings-summary">
      <div class="budget-totals">
        <div class="budget-total-block">
          <span class="budget-total-label">Confirmed bookings</span>
          <span class="budget-total-jpy">${money(confirmed)}</span>
          <span class="budget-total-aud">≈ ${moneyAud(confirmed)}</span>
        </div>
        <div class="budget-total-block">
          <span class="budget-total-label">All (incl. unconfirmed)</span>
          <span class="budget-total-jpy">${money(grand)}</span>
          <span class="budget-total-aud">≈ ${moneyAud(grand)}</span>
        </div>
      </div>
      <p class="budget-disclaimer">Add your real booking refs and prices, then flip a booking to <strong>Confirmed</strong> — the Confirmed total reflects only what you've actually locked in. 🎟️ <strong>Klook</strong> opens your Klook bookings (sign in to Klook to view vouchers); the app can't import them automatically.</p>
    </div>

    <div class="travel-section">
      <div class="travel-section-head">
        <h2>✈️ Flights</h2>
        <button class="btn-secondary" id="add-flight-btn">+ Add</button>
      </div>
      ${trip.flights.map(flightCard).join("") || '<p class="empty">No flights yet.</p>'}
    </div>

    <div class="travel-section">
      <div class="travel-section-head">
        <h2>🏨 Accommodation</h2>
        <button class="btn-secondary" id="add-acc-btn">+ Add</button>
      </div>
      ${accommodation.map(accommodationCard).join("") || '<p class="empty">No hotels yet.</p>'}
    </div>

    <div class="travel-section">
      <div class="travel-section-head">
        <h2>🚕 Transport &amp; transfers</h2>
        <button class="btn-secondary" id="add-transfer-btn">+ Add</button>
      </div>
      ${transfers.map(transferCard).join("") || '<p class="empty">No transfers yet.</p>'}
    </div>

    <div class="travel-section">
      <div class="travel-section-head">
        <h2>🎟️ Activities &amp; tickets</h2>
        <button class="btn-secondary" id="add-actbk-btn">+ Add</button>
      </div>
      ${activities.map(activityCard).join("") || '<p class="empty">No activity bookings yet.</p>'}
    </div>
  `;

  document.getElementById("add-flight-btn").addEventListener("click", () => openFlightModal());
  document.getElementById("add-acc-btn").addEventListener("click", () => openAccommodationModal());
  document.getElementById("add-transfer-btn").addEventListener("click", () => openTransferModal());
  document.getElementById("add-actbk-btn").addEventListener("click", () => openActivityBookingModal());
  container.querySelectorAll("[data-edit-flight]").forEach((btn) =>
    btn.addEventListener("click", () => openFlightModal(trip.flights.find((f) => f.id === btn.dataset.editFlight))));
  container.querySelectorAll("[data-edit-acc]").forEach((btn) =>
    btn.addEventListener("click", () => openAccommodationModal(trip.accommodation.find((h) => h.id === btn.dataset.editAcc))));
  container.querySelectorAll("[data-edit-transfer]").forEach((btn) =>
    btn.addEventListener("click", () => openTransferModal(trip.transfers.find((t) => t.id === btn.dataset.editTransfer))));
  container.querySelectorAll("[data-edit-actbk]").forEach((btn) =>
    btn.addEventListener("click", () => openActivityBookingModal(trip.activityBookings.find((a) => a.id === btn.dataset.editActbk))));
}

function openFlightModal(flight) {
  const isEdit = !!flight;
  const f = flight || { label: "", airline: "", flightNumber: "", depAirport: "", depDateTime: "", arrAirport: "", arrDateTime: "", bookingRef: "", seats: "", cost: 0, phone: "", website: "", confirmed: false, notes: "" };
  const modal = document.getElementById("modal");
  modal.innerHTML = `
    <h2>${isEdit ? "Edit" : "Add"} flight</h2>
    <form id="flight-form">
      <label>Label
        <input type="text" name="label" value="${escapeHtml(f.label)}" placeholder="e.g. Outbound — Sydney to Tokyo">
      </label>
      <div class="form-row">
        <label>Airline
          <input type="text" name="airline" value="${escapeHtml(f.airline)}" placeholder="e.g. Qantas">
        </label>
        <label>Flight no.
          <input type="text" name="flightNumber" value="${escapeHtml(f.flightNumber)}" placeholder="e.g. QF25">
        </label>
      </div>
      <label>Departure airport
        <input type="text" name="depAirport" value="${escapeHtml(f.depAirport)}" placeholder="e.g. Sydney (SYD) T1">
      </label>
      <label>Departure date & time
        <input type="datetime-local" name="depDateTime" value="${escapeHtml(f.depDateTime)}">
      </label>
      <label>Arrival airport
        <input type="text" name="arrAirport" value="${escapeHtml(f.arrAirport)}" placeholder="e.g. Tokyo Haneda (HND) T3">
      </label>
      <label>Arrival date & time
        <input type="datetime-local" name="arrDateTime" value="${escapeHtml(f.arrDateTime)}">
      </label>
      <div class="form-row">
        <label>Booking ref
          <input type="text" name="bookingRef" value="${escapeHtml(f.bookingRef)}">
        </label>
        <label>Seats
          <input type="text" name="seats" value="${escapeHtml(f.seats)}" placeholder="e.g. 32A, 32B">
        </label>
      </div>
      <div class="form-row">
        <label>Cost (¥)
          <input type="number" name="cost" value="${f.cost || 0}" min="0" step="100">
        </label>
        <label>Airline phone
          <input type="text" name="phone" value="${escapeHtml(f.phone || "")}" placeholder="for the Call button">
        </label>
      </div>
      <label>Airline website
        <input type="text" name="website" value="${escapeHtml(f.website || "")}" placeholder="e.g. qantas.com">
      </label>
      <label>Notes
        <textarea name="notes" rows="2">${escapeHtml(f.notes)}</textarea>
      </label>
      <label class="checkbox-label">
        <input type="checkbox" name="confirmed" ${f.confirmed ? "checked" : ""}>
        Confirmed / booked
      </label>
      <div class="modal-actions">
        ${isEdit ? '<button type="button" id="delete-flight-btn" class="btn-danger">Delete</button>' : ""}
        <button type="button" id="cancel-modal-btn" class="btn-secondary">Cancel</button>
        <button type="submit" class="btn-primary">Save</button>
      </div>
    </form>
  `;
  showModal();
  const form = document.getElementById("flight-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = {
      label: fd.get("label").trim(), airline: fd.get("airline").trim(), flightNumber: fd.get("flightNumber").trim(),
      depAirport: fd.get("depAirport").trim(), depDateTime: fd.get("depDateTime"),
      arrAirport: fd.get("arrAirport").trim(), arrDateTime: fd.get("arrDateTime"),
      bookingRef: fd.get("bookingRef").trim(), seats: fd.get("seats").trim(),
      cost: Number(fd.get("cost")) || 0, phone: fd.get("phone").trim(), website: fd.get("website").trim(),
      confirmed: fd.get("confirmed") === "on", notes: fd.get("notes").trim()
    };
    if (isEdit) Object.assign(flight, data);
    else trip.flights.push({ id: uid("f"), ...data });
    saveTrip();
    renderTravel();
    closeModal();
  });
  document.getElementById("cancel-modal-btn").addEventListener("click", closeModal);
  if (isEdit) {
    document.getElementById("delete-flight-btn").addEventListener("click", () => {
      if (confirm("Delete this flight?")) {
        trip.flights = trip.flights.filter((x) => x.id !== flight.id);
        saveTrip();
        renderTravel();
        closeModal();
      }
    });
  }
}

function openTransferModal(transfer) {
  const isEdit = !!transfer;
  const t = transfer || { date: trip.startDate, time: "12:00", mode: "Private transfer", from: "", to: "", provider: "", bookingRef: "", cost: 0, phone: "", website: "", email: "", confirmed: false, notes: "" };
  const modal = document.getElementById("modal");
  modal.innerHTML = `
    <h2>${isEdit ? "Edit" : "Add"} transfer</h2>
    <form id="transfer-form">
      <div class="form-row">
        <label>Date
          <input type="date" name="date" value="${escapeHtml(t.date)}">
        </label>
        <label>Time
          <input type="time" name="time" value="${escapeHtml(t.time)}">
        </label>
      </div>
      <label>Mode
        <select name="mode">
          ${TRANSFER_MODES.map((m) => `<option value="${m}" ${m === t.mode ? "selected" : ""}>${m}</option>`).join("")}
        </select>
      </label>
      <label>From
        <input type="text" name="from" value="${escapeHtml(t.from)}" placeholder="e.g. Haneda Airport">
      </label>
      <label>To
        <input type="text" name="to" value="${escapeHtml(t.to)}" placeholder="e.g. Toy Story Hotel">
      </label>
      <div class="form-row">
        <label>Provider
          <input type="text" name="provider" value="${escapeHtml(t.provider)}" placeholder="Company name">
        </label>
        <label>Booking ref
          <input type="text" name="bookingRef" value="${escapeHtml(t.bookingRef)}">
        </label>
      </div>
      <div class="form-row">
        <label>Cost (¥)
          <input type="number" name="cost" value="${t.cost || 0}" min="0" step="100">
        </label>
        <label>Phone
          <input type="text" name="phone" value="${escapeHtml(t.phone || "")}" placeholder="driver / company">
        </label>
      </div>
      <div class="form-row">
        <label>Website
          <input type="text" name="website" value="${escapeHtml(t.website || "")}">
        </label>
        <label>Email
          <input type="text" name="email" value="${escapeHtml(t.email || "")}">
        </label>
      </div>
      <label>Notes
        <textarea name="notes" rows="2">${escapeHtml(t.notes)}</textarea>
      </label>
      <label class="checkbox-label">
        <input type="checkbox" name="confirmed" ${t.confirmed ? "checked" : ""}>
        Confirmed / booked
      </label>
      <div class="modal-actions">
        ${isEdit ? '<button type="button" id="delete-transfer-btn" class="btn-danger">Delete</button>' : ""}
        <button type="button" id="cancel-modal-btn" class="btn-secondary">Cancel</button>
        <button type="submit" class="btn-primary">Save</button>
      </div>
    </form>
  `;
  showModal();
  const form = document.getElementById("transfer-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = {
      date: fd.get("date"), time: fd.get("time"), mode: fd.get("mode"),
      from: fd.get("from").trim(), to: fd.get("to").trim(),
      provider: fd.get("provider").trim(), bookingRef: fd.get("bookingRef").trim(),
      cost: Number(fd.get("cost")) || 0, phone: fd.get("phone").trim(), website: fd.get("website").trim(),
      email: fd.get("email").trim(), confirmed: fd.get("confirmed") === "on", notes: fd.get("notes").trim()
    };
    if (isEdit) Object.assign(transfer, data);
    else trip.transfers.push({ id: uid("t"), ...data });
    saveTrip();
    renderTravel();
    closeModal();
  });
  document.getElementById("cancel-modal-btn").addEventListener("click", closeModal);
  if (isEdit) {
    document.getElementById("delete-transfer-btn").addEventListener("click", () => {
      if (confirm("Delete this transfer?")) {
        trip.transfers = trip.transfers.filter((x) => x.id !== transfer.id);
        saveTrip();
        renderTravel();
        closeModal();
      }
    });
  }
}

function openAccommodationModal(hotel) {
  const isEdit = !!hotel;
  const h = hotel || { name: "", address: "", checkIn: trip.startDate, checkInTime: "15:00", checkOut: "", checkOutTime: "11:00", confirmationRef: "", cost: 0, phone: "", email: "", website: "", confirmed: false, notes: "" };
  const modal = document.getElementById("modal");
  modal.innerHTML = `
    <h2>${isEdit ? "Edit" : "Add"} hotel</h2>
    <form id="acc-form">
      <label>Hotel name
        <input type="text" name="name" value="${escapeHtml(h.name)}" required>
      </label>
      <label>Address
        <input type="text" name="address" value="${escapeHtml(h.address)}" placeholder="Used for Map & directions">
      </label>
      <div class="form-row">
        <label>Check-in
          <input type="date" name="checkIn" value="${escapeHtml(h.checkIn || "")}">
        </label>
        <label>Time
          <input type="time" name="checkInTime" value="${escapeHtml(h.checkInTime || "")}">
        </label>
      </div>
      <div class="form-row">
        <label>Check-out
          <input type="date" name="checkOut" value="${escapeHtml(h.checkOut || "")}">
        </label>
        <label>Time
          <input type="time" name="checkOutTime" value="${escapeHtml(h.checkOutTime || "")}">
        </label>
      </div>
      <div class="form-row">
        <label>Confirmation #
          <input type="text" name="confirmationRef" value="${escapeHtml(h.confirmationRef)}">
        </label>
        <label>Cost (¥)
          <input type="number" name="cost" value="${h.cost || 0}" min="0" step="100">
        </label>
      </div>
      <div class="form-row">
        <label>Phone
          <input type="text" name="phone" value="${escapeHtml(h.phone)}">
        </label>
        <label>Email
          <input type="text" name="email" value="${escapeHtml(h.email)}">
        </label>
      </div>
      <label>Website
        <input type="text" name="website" value="${escapeHtml(h.website)}">
      </label>
      <label>Notes
        <textarea name="notes" rows="2">${escapeHtml(h.notes)}</textarea>
      </label>
      <label class="checkbox-label">
        <input type="checkbox" name="confirmed" ${h.confirmed ? "checked" : ""}>
        Confirmed / booked
      </label>
      <div class="modal-actions">
        ${isEdit ? '<button type="button" id="delete-acc-btn" class="btn-danger">Delete</button>' : ""}
        <button type="button" id="cancel-modal-btn" class="btn-secondary">Cancel</button>
        <button type="submit" class="btn-primary">Save</button>
      </div>
    </form>
  `;
  showModal();
  const form = document.getElementById("acc-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = {
      name: fd.get("name").trim(), address: fd.get("address").trim(),
      checkIn: fd.get("checkIn"), checkInTime: fd.get("checkInTime"),
      checkOut: fd.get("checkOut"), checkOutTime: fd.get("checkOutTime"),
      confirmationRef: fd.get("confirmationRef").trim(), cost: Number(fd.get("cost")) || 0,
      phone: fd.get("phone").trim(), email: fd.get("email").trim(), website: fd.get("website").trim(),
      confirmed: fd.get("confirmed") === "on", notes: fd.get("notes").trim()
    };
    if (isEdit) Object.assign(hotel, data);
    else trip.accommodation.push({ id: uid("h"), ...data });
    saveTrip();
    renderTravel();
    closeModal();
  });
  document.getElementById("cancel-modal-btn").addEventListener("click", closeModal);
  if (isEdit) {
    document.getElementById("delete-acc-btn").addEventListener("click", () => {
      if (confirm("Delete this hotel booking?")) {
        trip.accommodation = trip.accommodation.filter((x) => x.id !== hotel.id);
        saveTrip();
        renderTravel();
        closeModal();
      }
    });
  }
}

function openActivityBookingModal(act) {
  const isEdit = !!act;
  const a = act || { name: "", vendor: "Klook", date: trip.startDate, time: "", voucherRef: "", cost: 0, location: "", phone: "", website: "", klookUrl: "", confirmed: false, notes: "" };
  const modal = document.getElementById("modal");
  modal.innerHTML = `
    <h2>${isEdit ? "Edit" : "Add"} activity / ticket</h2>
    <form id="actbk-form">
      <label>Name
        <input type="text" name="name" value="${escapeHtml(a.name)}" placeholder="e.g. USJ 1-Day Studio Pass" required>
      </label>
      <div class="form-row">
        <label>Vendor
          <input type="text" name="vendor" value="${escapeHtml(a.vendor)}" placeholder="e.g. Klook">
        </label>
        <label>Date
          <input type="date" name="date" value="${escapeHtml(a.date || "")}">
        </label>
      </div>
      <div class="form-row">
        <label>Time
          <input type="time" name="time" value="${escapeHtml(a.time || "")}">
        </label>
        <label>Cost (¥)
          <input type="number" name="cost" value="${a.cost || 0}" min="0" step="100">
        </label>
      </div>
      <label>Voucher / booking ref
        <input type="text" name="voucherRef" value="${escapeHtml(a.voucherRef)}">
      </label>
      <label>Location
        <input type="text" name="location" value="${escapeHtml(a.location)}" placeholder="Used for Map & directions">
      </label>
      <div class="form-row">
        <label>Phone
          <input type="text" name="phone" value="${escapeHtml(a.phone)}">
        </label>
        <label>Website
          <input type="text" name="website" value="${escapeHtml(a.website)}">
        </label>
      </div>
      <label>Klook booking link (optional)
        <input type="text" name="klookUrl" value="${escapeHtml(a.klookUrl)}" placeholder="Blank = open Klook bookings page">
      </label>
      <label>Notes
        <textarea name="notes" rows="2">${escapeHtml(a.notes)}</textarea>
      </label>
      <label class="checkbox-label">
        <input type="checkbox" name="confirmed" ${a.confirmed ? "checked" : ""}>
        Confirmed / booked
      </label>
      <div class="modal-actions">
        ${isEdit ? '<button type="button" id="delete-actbk-btn" class="btn-danger">Delete</button>' : ""}
        <button type="button" id="cancel-modal-btn" class="btn-secondary">Cancel</button>
        <button type="submit" class="btn-primary">Save</button>
      </div>
    </form>
  `;
  showModal();
  const form = document.getElementById("actbk-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = {
      name: fd.get("name").trim(), vendor: fd.get("vendor").trim(),
      date: fd.get("date"), time: fd.get("time"),
      voucherRef: fd.get("voucherRef").trim(), cost: Number(fd.get("cost")) || 0,
      location: fd.get("location").trim(), phone: fd.get("phone").trim(),
      website: fd.get("website").trim(), klookUrl: fd.get("klookUrl").trim(),
      confirmed: fd.get("confirmed") === "on", notes: fd.get("notes").trim()
    };
    if (isEdit) Object.assign(act, data);
    else trip.activityBookings.push({ id: uid("ab"), ...data });
    saveTrip();
    renderTravel();
    closeModal();
  });
  document.getElementById("cancel-modal-btn").addEventListener("click", closeModal);
  if (isEdit) {
    document.getElementById("delete-actbk-btn").addEventListener("click", () => {
      if (confirm("Delete this activity booking?")) {
        trip.activityBookings = trip.activityBookings.filter((x) => x.id !== act.id);
        saveTrip();
        renderTravel();
        closeModal();
      }
    });
  }
}

// ---------- Rendering: packing ----------

function renderPacking() {
  const container = document.getElementById("packing-content");
  const groups = groupBy(trip.packingList, "category");
  const packedCount = trip.packingList.filter((i) => i.packed).length;

  container.innerHTML = `
    <div class="packing-summary">${packedCount} / ${trip.packingList.length} packed</div>
    ${Object.entries(groups).map(([cat, items]) => `
      <div class="packing-group">
        <h3>${escapeHtml(cat)}</h3>
        <ul class="packing-list">
          ${items.map((i) => `
            <li class="packing-item ${i.packed ? "packed" : ""}">
              <label>
                <input type="checkbox" data-toggle-id="${i.id}" ${i.packed ? "checked" : ""}>
                <span>${escapeHtml(i.item)}</span>
              </label>
              <button class="btn-text btn-danger-text" data-delete-id="${i.id}">✕</button>
            </li>
          `).join("")}
        </ul>
      </div>
    `).join("")}
    <form id="add-packing-form" class="inline-add-form">
      <input type="text" name="item" placeholder="Add item…" required>
      <input type="text" name="category" placeholder="Category" value="Misc">
      <button type="submit" class="btn-secondary">Add</button>
    </form>
  `;

  container.querySelectorAll("[data-toggle-id]").forEach((cb) => {
    cb.addEventListener("change", () => {
      const item = trip.packingList.find((i) => i.id === cb.dataset.toggleId);
      item.packed = cb.checked;
      saveTrip();
      renderPacking();
    });
  });
  container.querySelectorAll("[data-delete-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      trip.packingList = trip.packingList.filter((i) => i.id !== btn.dataset.deleteId);
      saveTrip();
      renderPacking();
    });
  });
  container.querySelector("#add-packing-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const item = fd.get("item").trim();
    const category = fd.get("category").trim() || "Misc";
    if (!item) return;
    trip.packingList.push({ id: uid("p"), category, item, packed: false });
    saveTrip();
    renderPacking();
  });
}

// ---------- Rendering: budget (dual currency) ----------

function renderBudget() {
  const container = document.getElementById("budget-content");
  const totalEst = trip.budget.reduce((s, b) => s + (Number(b.estimated) || 0), 0);
  const totalAct = trip.budget.reduce((s, b) => s + (Number(b.actual) || 0), 0);
  const confirmed = confirmedBookingsTotal();

  container.innerHTML = `
    <div class="budget-summary">
      <label class="rate-field">1 AUD = ¥<input type="number" id="rate-input" value="${trip.jpyPerAud}" min="1" step="0.1"></label>
      <div class="budget-totals">
        <div class="budget-total-block">
          <span class="budget-total-label">Estimated</span>
          <span class="budget-total-jpy">${money(totalEst)}</span>
          <span class="budget-total-aud">≈ ${moneyAud(totalEst)}</span>
        </div>
        <div class="budget-total-block">
          <span class="budget-total-label">Actual</span>
          <span class="budget-total-jpy">${money(totalAct)}</span>
          <span class="budget-total-aud">≈ ${moneyAud(totalAct)}</span>
        </div>
      </div>
      <div class="budget-confirmed-line">Confirmed bookings: <strong>${money(confirmed)}</strong> ≈ ${moneyAud(confirmed)} <span class="muted">— real total from the Bookings tab</span></div>
    </div>
    <p class="budget-disclaimer">Estimates are rough planning placeholders (some based on dynamic theme-park pricing). The AUD rate is editable above — set it to your card's real rate.</p>
    <div class="budget-cards">
      ${trip.budget.map((b) => `
        <div class="budget-card" data-budget-id="${b.id}">
          <div class="budget-card-top">
            <input type="text" class="budget-label-input" data-field="label" value="${escapeHtml(b.label)}">
            <button class="btn-text btn-danger-text" data-delete-budget="${b.id}">✕</button>
          </div>
          <div class="budget-card-fields">
            <label class="budget-money-field">
              <span>Estimated</span>
              <input type="number" data-field="estimated" value="${b.estimated || 0}" min="0" step="100">
              <span class="aud-sub">≈ ${moneyAud(b.estimated)}</span>
            </label>
            <label class="budget-money-field">
              <span>Actual</span>
              <input type="number" data-field="actual" value="${b.actual || 0}" min="0" step="100">
              <span class="aud-sub">≈ ${moneyAud(b.actual)}</span>
            </label>
          </div>
          ${b.notes ? `<p class="budget-card-notes">${escapeHtml(b.notes)}</p>` : ""}
        </div>
      `).join("")}
    </div>
    <button class="btn-secondary" id="add-budget-btn">+ Add budget line</button>
  `;

  document.getElementById("rate-input").addEventListener("change", (e) => {
    const v = Number(e.target.value);
    if (v > 0) {
      trip.jpyPerAud = v;
      saveTrip();
      renderBudget();
      if (document.getElementById("view-itinerary").classList.contains("active")) renderDayContent();
    }
  });

  container.querySelectorAll(".budget-card input[data-field]").forEach((input) => {
    input.addEventListener("change", () => {
      const card = input.closest(".budget-card");
      const b = trip.budget.find((x) => x.id === card.dataset.budgetId);
      const field = input.dataset.field;
      b[field] = field === "label" ? input.value : Number(input.value) || 0;
      saveTrip();
      renderBudget();
    });
  });
  container.querySelectorAll("[data-delete-budget]").forEach((btn) => {
    btn.addEventListener("click", () => {
      trip.budget = trip.budget.filter((b) => b.id !== btn.dataset.deleteBudget);
      saveTrip();
      renderBudget();
    });
  });
  document.getElementById("add-budget-btn").addEventListener("click", () => {
    trip.budget.push({ id: uid("b"), label: "New item", estimated: 0, actual: 0, notes: "" });
    saveTrip();
    renderBudget();
  });
}

// ---------- View switching ----------

function switchView(view) {
  document.querySelectorAll(".view-tab").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + view));
}

// ---------- Share / export / import / reset ----------

function buildShareText() {
  const lines = [trip.tripName, ""];
  if (trip.flights.length) {
    lines.push("FLIGHTS");
    trip.flights.forEach((f) => {
      const name = [f.airline, f.flightNumber].filter(Boolean).join(" ") || f.label;
      lines.push(`  ${f.label}: ${name}`);
      lines.push(`    ${f.depAirport} ${formatDateTime(f.depDateTime)} → ${f.arrAirport} ${formatDateTime(f.arrDateTime)}`);
    });
    lines.push("");
  }
  if (trip.accommodation.length) {
    lines.push("ACCOMMODATION");
    [...trip.accommodation].sort((a, b) => (a.checkIn || "").localeCompare(b.checkIn || "")).forEach((h) => {
      lines.push(`  ${h.name}${h.confirmationRef ? " — conf " + h.confirmationRef : ""}`);
      lines.push(`    ${formatDateOnly(h.checkIn)} → ${formatDateOnly(h.checkOut)}${h.address ? " — " + h.address : ""}${h.phone ? " — " + h.phone : ""}`);
    });
    lines.push("");
  }
  trip.days.forEach((day, idx) => {
    const date = addDays(trip.startDate, idx);
    lines.push(`Day ${idx + 1} — ${formatLongDate(date)} — ${day.city}${day.hotel ? " (" + day.hotel + ")" : ""}`);
    [...day.activities].sort((a, b) => a.time.localeCompare(b.time)).forEach((a) => {
      lines.push(`  ${a.time}  ${a.title}${a.location ? " — " + a.location : ""}`);
    });
    lines.push("");
  });
  return lines.join("\n");
}

function copyTextFallback(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

// ---------- Init ----------

function renderAll() {
  document.getElementById("trip-name-input").value = trip.tripName;
  document.getElementById("start-date-input").value = trip.startDate;
  renderDayTabs();
  renderDayContent();
  renderTravel();
  renderPacking();
  renderBudget();
}

function wireStaticHandlers() {
  document.querySelectorAll(".view-tab").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  document.getElementById("trip-name-input").addEventListener("change", (e) => {
    trip.tripName = e.target.value;
    saveTrip();
  });

  document.getElementById("start-date-input").addEventListener("change", (e) => {
    trip.startDate = e.target.value;
    saveTrip();
    renderDayTabs();
    renderDayContent();
  });

  const menuBtn = document.getElementById("menu-btn");
  const menuPanel = document.getElementById("menu-panel");
  menuBtn.addEventListener("click", () => menuPanel.classList.toggle("hidden"));
  document.addEventListener("click", (e) => {
    if (!menuPanel.classList.contains("hidden") && !menuPanel.contains(e.target) && e.target !== menuBtn) {
      menuPanel.classList.add("hidden");
    }
  });

  document.getElementById("export-btn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(trip, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "japan-trip-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    menuPanel.classList.add("hidden");
  });

  const importFileInput = document.getElementById("import-file");
  document.getElementById("import-btn").addEventListener("click", () => importFileInput.click());
  importFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.days || !Array.isArray(data.days)) throw new Error("Missing days array");
        trip = migrate(data);
        activeDayId = trip.days[0] ? trip.days[0].id : null;
        saveTrip();
        renderAll();
      } catch (err) {
        alert("Could not read that file as trip data.");
      }
    };
    reader.readAsText(file);
    importFileInput.value = "";
    menuPanel.classList.add("hidden");
  });

  document.getElementById("share-btn").addEventListener("click", () => {
    const text = buildShareText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => alert("Itinerary copied — paste it anywhere."),
        () => { copyTextFallback(text); alert("Itinerary copied — paste it anywhere."); }
      );
    } else {
      copyTextFallback(text);
      alert("Itinerary copied — paste it anywhere.");
    }
    menuPanel.classList.add("hidden");
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    if (confirm("Reset everything back to the original sample itinerary? This cannot be undone.")) {
      trip = migrate(clone(DEFAULT_TRIP));
      activeDayId = trip.days[0] ? trip.days[0].id : null;
      saveTrip();
      renderAll();
    }
    menuPanel.classList.add("hidden");
  });

  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "modal-overlay") closeModal();
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", () => {
  wireStaticHandlers();
  renderAll();
  registerServiceWorker();
});
