const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const RECENT_LOCATIONS_KEY = 'fd_recent_delivery_locations_v1';
const GEOCODE_CACHE_TTL_MS = 1000 * 60 * 30;
const geocodeCache = new Map();
const LOCATION_ALIASES = [
  { pattern: /\baddis\s*abeba\b/gi, replacement: 'Addis Ababa' },
  { pattern: /\badis\s*ababa\b/gi, replacement: 'Addis Ababa' },
  { pattern: /\badis\s*abeba\b/gi, replacement: 'Addis Ababa' },
  { pattern: /\bharer\b/gi, replacement: 'Harar' },
];

const LOCAL_FALLBACK_POINTS = [
  {
    test: /\bbole\b/i,
    latitude: 8.9982,
    longitude: 38.7868,
    normalizedAddress: 'Bole, Addis Ababa, Ethiopia',
  },
  {
    test: /\bpiassa\b/i,
    latitude: 9.0422,
    longitude: 38.7578,
    normalizedAddress: 'Piassa, Addis Ababa, Ethiopia',
  },
  {
    test: /\bjugol\b/i,
    latitude: 9.3117,
    longitude: 42.1306,
    normalizedAddress: 'Jugol, Harar, Ethiopia',
  },
  {
    test: /\bharar\b/i,
    latitude: 9.3126,
    longitude: 42.1274,
    normalizedAddress: 'Harar, Ethiopia',
  },
];

const normalizeAddressInput = (address) => {
  let normalized = (address || '').trim();
  LOCATION_ALIASES.forEach(({ pattern, replacement }) => {
    normalized = normalized.replace(pattern, replacement);
  });
  return normalized.replace(/\s+/g, ' ').trim();
};

const safelyReadRecentLocations = () => {
  try {
    const raw = window.localStorage.getItem(RECENT_LOCATIONS_KEY);
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
};

const persistRecentLocations = (rows) => {
  try {
    window.localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(rows));
  } catch (_error) {
    // Ignore storage quota failures.
  }
};

const buildQueryCandidates = (address) => {
  const base = normalizeAddressInput(address);
  if (!base) {
    return [];
  }

  const candidates = [base];
  if (!/ethiopia/i.test(base)) {
    candidates.push(`${base}, Ethiopia`);
  }
  if (/\bAddis Ababa\b/i.test(base) && !/ethiopia/i.test(base)) {
    candidates.push(`${base}, Addis Ababa, Ethiopia`);
  }
  if (/\bHarar\b/i.test(base) && !/ethiopia/i.test(base)) {
    candidates.push(`${base}, Harar, Ethiopia`);
  }

  return [...new Set(candidates)];
};

const tryLocalFallback = (address) => {
  const normalized = normalizeAddressInput(address);
  const match = LOCAL_FALLBACK_POINTS.find((point) => point.test.test(normalized));
  if (!match) {
    return null;
  }

  return {
    latitude: match.latitude,
    longitude: match.longitude,
    normalizedAddress: match.normalizedAddress,
  };
};

export const locationService = {
  detectBrowserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          reject(new Error('Unable to detect your current location.'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 120000,
        }
      );
    });
  },

  async reverseGeocode(latitude, longitude) {
    const url = `${NOMINATIM_BASE}/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Unable to fetch address from your location.');
    }

    const payload = await response.json();
    return payload?.display_name || '';
  },

  async geocodeAddress(address) {
    const normalizedInput = normalizeAddressInput(address);
    const cached = geocodeCache.get(normalizedInput);
    const now = Date.now();
    if (cached && now - cached.createdAt <= GEOCODE_CACHE_TTL_MS) {
      return cached.payload;
    }

    const candidates = buildQueryCandidates(address);
    for (const candidate of candidates) {
      const query = encodeURIComponent(candidate);
      const url = `${NOMINATIM_BASE}/search?format=jsonv2&q=${query}&limit=1`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        continue;
      }

      const rows = await response.json();
      if (!Array.isArray(rows) || !rows.length) {
        continue;
      }

      const payload = {
        latitude: Number(rows[0].lat),
        longitude: Number(rows[0].lon),
        normalizedAddress: rows[0].display_name || candidate,
      };
      geocodeCache.set(normalizedInput, {
        payload,
        createdAt: now,
      });

      return payload;
    }

    const localFallback = tryLocalFallback(address);
    if (localFallback) {
      geocodeCache.set(normalizedInput, {
        payload: localFallback,
        createdAt: now,
      });
      return localFallback;
    }

    throw new Error('Address not found. Use area + city, for example: Bole, Addis Ababa.');
  },

  getRecentLocations() {
    return safelyReadRecentLocations();
  },

  saveRecentLocation(address) {
    const normalized = normalizeAddressInput(address);
    if (!normalized) {
      return;
    }

    const existing = safelyReadRecentLocations();
    const deduped = [normalized, ...existing.filter((entry) => entry !== normalized)].slice(0, 5);
    persistRecentLocations(deduped);
  },
};
