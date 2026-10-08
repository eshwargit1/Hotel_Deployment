const EXTRA_HOTELS_KEY = "rhs-extra-hotels";
const DELETED_HOTELS_KEY = "rhs-deleted-hotels";
const UPDATED_HOTELS_KEY = "rhs-updated-hotels";

export function loadExtraHotels() {
  try {
    const raw = localStorage.getItem(EXTRA_HOTELS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExtraHotel(hotel) {
  const next = [hotel, ...loadExtraHotels()];
  localStorage.setItem(EXTRA_HOTELS_KEY, JSON.stringify(next));
  return next;
}

export function loadDeletedHotelIds() {
  try {
    const raw = localStorage.getItem(DELETED_HOTELS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function loadHotelUpdates() {
  try {
    const raw = localStorage.getItem(UPDATED_HOTELS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getVisibleHotels(seedHotels = []) {
  const extras = loadExtraHotels();
  const deleted = new Set(loadDeletedHotelIds());
  const updates = loadHotelUpdates();
  const seen = new Set();
  const list = [];

  for (const hotel of [...extras, ...seedHotels]) {
    if (!hotel?.id || deleted.has(hotel.id) || seen.has(hotel.id)) {
      continue;
    }

    seen.add(hotel.id);
    list.push(updates[hotel.id] ? { ...hotel, ...updates[hotel.id] } : hotel);
  }

  return list;
}

export function deleteHotelById(id) {
  const extras = loadExtraHotels().filter((hotel) => hotel.id !== id);
  localStorage.setItem(EXTRA_HOTELS_KEY, JSON.stringify(extras));

  const deleted = loadDeletedHotelIds();
  if (!deleted.includes(id)) {
    localStorage.setItem(DELETED_HOTELS_KEY, JSON.stringify([...deleted, id]));
  }

  const updates = loadHotelUpdates();
  if (updates[id]) {
    delete updates[id];
    localStorage.setItem(UPDATED_HOTELS_KEY, JSON.stringify(updates));
  }
}

export function updateHotelById(hotel) {
  const extras = loadExtraHotels();
  const extraIndex = extras.findIndex((item) => item.id === hotel.id);

  if (extraIndex >= 0) {
    extras[extraIndex] = hotel;
    localStorage.setItem(EXTRA_HOTELS_KEY, JSON.stringify(extras));
    return;
  }

  const updates = loadHotelUpdates();
  updates[hotel.id] = hotel;
  localStorage.setItem(UPDATED_HOTELS_KEY, JSON.stringify(updates));
}

export function formatPrice(value) {
  const amount = Number(String(value).replace(/[^0-9.]/g, ""));
  if (!amount) {
    return "";
  }

  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function slugifyName(name) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${base || "hotel"}-${Date.now()}`;
}
