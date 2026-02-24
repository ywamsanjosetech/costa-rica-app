const CANTON_CENTERS = {
  san_jose: { lng: -84.0907, lat: 9.9281 },
  escazu: { lng: -84.1365, lat: 9.9198 },
  desamparados: { lng: -84.0608, lat: 9.8973 },
  alajuelita: { lng: -84.1002, lat: 9.9024 },
  tibas: { lng: -84.0846, lat: 9.9574 },
  curridabat: { lng: -84.0352, lat: 9.9156 },
  goicoechea: { lng: -84.0479, lat: 9.9532 },
  moravia: { lng: -84.0114, lat: 9.9617 },
  santa_ana: { lng: -84.182, lat: 9.9327 },
  aserri: { lng: -84.0929, lat: 9.8588 },
  alajuela: { lng: -84.2116, lat: 10.0162 },
  cartago: { lng: -83.921, lat: 9.8644 },
  heredia: { lng: -84.1165, lat: 9.9985 },
  guanacaste: { lng: -85.4361, lat: 10.6325 },
  puntarenas: { lng: -84.8394, lat: 9.9763 },
  limon: { lng: -83.0352, lat: 9.9907 },
};

const PROVINCE_CENTERS = {
  san_jose: { lng: -84.0907, lat: 9.9281 },
  alajuela: { lng: -84.2116, lat: 10.0162 },
  cartago: { lng: -83.921, lat: 9.8644 },
  heredia: { lng: -84.1165, lat: 9.9985 },
  guanacaste: { lng: -85.4361, lat: 10.6325 },
  puntarenas: { lng: -84.8394, lat: 9.9763 },
  limon: { lng: -83.0352, lat: 9.9907 },
};

const COSTA_RICA_CENTER = { lng: -84.1942, lat: 9.7489 };
const geocodeCache = new Map();
const geocodeInFlight = new Map();

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeAddress(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/,\s+/g, ", ")
    .toLowerCase();
}

function hashUnit(input, seed = 0) {
  let hash = 2166136261 ^ seed;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function withDeterministicJitter(base, address) {
  const jitterLng = (hashUnit(address, 13) - 0.5) * 0.06;
  const jitterLat = (hashUnit(address, 29) - 0.5) * 0.06;

  return {
    lng: Number((base.lng + jitterLng).toFixed(6)),
    lat: Number((base.lat + jitterLat).toFixed(6)),
  };
}

function findBestCostaRicaCenter({ city, province, address }) {
  const cityKey = normalizeKey(city);
  if (cityKey && CANTON_CENTERS[cityKey]) return CANTON_CENTERS[cityKey];

  const provinceKey = normalizeKey(province);
  if (provinceKey && PROVINCE_CENTERS[provinceKey]) return PROVINCE_CENTERS[provinceKey];

  const normalizedAddress = normalizeAddress(address);
  for (const [key, value] of Object.entries(CANTON_CENTERS)) {
    if (normalizedAddress.includes(key.replaceAll("_", " "))) return value;
  }
  for (const [key, value] of Object.entries(PROVINCE_CENTERS)) {
    if (normalizedAddress.includes(key.replaceAll("_", " "))) return value;
  }

  return COSTA_RICA_CENTER;
}

function getGeocoderProvider() {
  const explicit = String(process.env.GEOCODER_PROVIDER || "").trim().toLowerCase();
  if (explicit === "mapbox" || explicit === "nominatim" || explicit === "none") {
    return explicit;
  }
  if (process.env.MAPBOX_GEOCODING_TOKEN) return "mapbox";
  return "none";
}

function getGeocoderProviderLabel() {
  const provider = getGeocoderProvider();
  if (provider === "mapbox") return "Mapbox";
  if (provider === "nominatim") return "Nominatim (OpenStreetMap)";
  return "Aproximacion local por provincia/canton";
}

async function fetchJson(url, { timeoutMs = 6000, headers = {} } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function geocodeWithMapbox(fullAddress) {
  const token = process.env.MAPBOX_GEOCODING_TOKEN;
  if (!token) return null;

  const query = encodeURIComponent(fullAddress);
  const endpoint =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json` +
    `?country=CR&language=es&limit=1&types=address,place,locality,neighborhood` +
    `&access_token=${encodeURIComponent(token)}`;

  const payload = await fetchJson(endpoint, { timeoutMs: 5000 });
  const feature = payload?.features?.[0];
  const center = feature?.center;

  if (!Array.isArray(center) || center.length < 2) return null;
  const [lng, lat] = center;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;

  return { lng, lat, source: "mapbox" };
}

async function geocodeWithNominatim(fullAddress) {
  const endpoint =
    "https://nominatim.openstreetmap.org/search" +
    `?format=jsonv2&countrycodes=cr&limit=1&q=${encodeURIComponent(fullAddress)}`;

  const payload = await fetchJson(endpoint, {
    timeoutMs: 6000,
    headers: {
      "Accept-Language": "es",
      "User-Agent":
        process.env.GEOCODER_USER_AGENT || "ywam-costa-rica-admin/1.0 (contact@local)",
    },
  });

  const first = payload?.[0];
  const lng = Number(first?.lon);
  const lat = Number(first?.lat);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;

  return { lng, lat, source: "nominatim" };
}

async function geocodeRecord(record) {
  const address = String(record.address || "").trim();
  const provider = getGeocoderProvider();
  const fullAddress = address ? `${address}, Costa Rica` : "";

  if (provider === "mapbox" && fullAddress) {
    const result = await geocodeWithMapbox(fullAddress);
    if (result) return result;
  }

  if (provider === "nominatim" && fullAddress) {
    const result = await geocodeWithNominatim(fullAddress);
    if (result) return result;
  }

  const base = findBestCostaRicaCenter(record);
  return {
    ...withDeterministicJitter(base, normalizeAddress(fullAddress || record.id || "fallback")),
    source: "fallback",
  };
}

async function mapWithConcurrency(items, limit, mapper) {
  if (!items.length) return [];
  const safeLimit = Math.max(1, limit);
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const current = cursor;
      cursor += 1;
      results[current] = await mapper(items[current], current);
    }
  }

  const workers = Array.from(
    { length: Math.min(safeLimit, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

async function geocodeRecordCached(record) {
  const cacheKey = normalizeAddress(record.address) || String(record.id);
  if (geocodeCache.has(cacheKey)) return geocodeCache.get(cacheKey);
  if (geocodeInFlight.has(cacheKey)) return geocodeInFlight.get(cacheKey);

  const pending = geocodeRecord(record).then((result) => {
    geocodeCache.set(cacheKey, result);
    geocodeInFlight.delete(cacheKey);
    return result;
  });

  geocodeInFlight.set(cacheKey, pending);
  return pending;
}

export function getGeocodingProviderLabel() {
  return getGeocoderProviderLabel();
}

export async function buildAssessmentMapPoints(records) {
  const provider = getGeocoderProvider();
  const concurrency = provider === "mapbox" ? 4 : 10;

  return mapWithConcurrency(records, concurrency, async (record) => {
    const coordinates = await geocodeRecordCached(record);
    return {
      ...record,
      lng: coordinates.lng,
      lat: coordinates.lat,
      geocodeSource: coordinates.source,
    };
  });
}
