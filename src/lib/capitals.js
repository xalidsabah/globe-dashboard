/**
 * World capitals + helpers for country-level globe pins.
 * Coordinates are city centers (approx.) for Open-Meteo weather.
 */

/** @typedef {{ name: string, country: string, countryCode?: string, lat: number, lng: number, timezone: string, isCapital?: boolean }} CityRow */

/** Capitals used for country focus + zoomed-out LOD */
export const CAPITALS = [
  { name: 'Washington', country: 'United States', countryCode: 'US', lat: 38.9072, lng: -77.0369, timezone: 'America/New_York', isCapital: true },
  { name: 'Ottawa', country: 'Canada', countryCode: 'CA', lat: 45.4215, lng: -75.6972, timezone: 'America/Toronto', isCapital: true },
  { name: 'Mexico City', country: 'Mexico', countryCode: 'MX', lat: 19.4326, lng: -99.1332, timezone: 'America/Mexico_City', isCapital: true },
  { name: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London', isCapital: true },
  { name: 'Paris', country: 'France', countryCode: 'FR', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris', isCapital: true },
  { name: 'Berlin', country: 'Germany', countryCode: 'DE', lat: 52.52, lng: 13.405, timezone: 'Europe/Berlin', isCapital: true },
  { name: 'Madrid', country: 'Spain', countryCode: 'ES', lat: 40.4168, lng: -3.7038, timezone: 'Europe/Madrid', isCapital: true },
  { name: 'Rome', country: 'Italy', countryCode: 'IT', lat: 41.9028, lng: 12.4964, timezone: 'Europe/Rome', isCapital: true },
  { name: 'Moscow', country: 'Russia', countryCode: 'RU', lat: 55.7558, lng: 37.6173, timezone: 'Europe/Moscow', isCapital: true },
  { name: 'Ankara', country: 'Turkey', countryCode: 'TR', lat: 39.9334, lng: 32.8597, timezone: 'Europe/Istanbul', isCapital: true },
  { name: 'Abu Dhabi', country: 'UAE', countryCode: 'AE', lat: 24.4539, lng: 54.3773, timezone: 'Asia/Dubai', isCapital: true },
  { name: 'Cairo', country: 'Egypt', countryCode: 'EG', lat: 30.0444, lng: 31.2357, timezone: 'Africa/Cairo', isCapital: true },
  { name: 'Abuja', country: 'Nigeria', countryCode: 'NG', lat: 9.0765, lng: 7.3986, timezone: 'Africa/Lagos', isCapital: true },
  { name: 'Nairobi', country: 'Kenya', countryCode: 'KE', lat: -1.2921, lng: 36.8219, timezone: 'Africa/Nairobi', isCapital: true },
  { name: 'Pretoria', country: 'South Africa', countryCode: 'ZA', lat: -25.7479, lng: 28.2293, timezone: 'Africa/Johannesburg', isCapital: true },
  { name: 'New Delhi', country: 'India', countryCode: 'IN', lat: 28.6139, lng: 77.209, timezone: 'Asia/Kolkata', isCapital: true },
  { name: 'Bangkok', country: 'Thailand', countryCode: 'TH', lat: 13.7563, lng: 100.5018, timezone: 'Asia/Bangkok', isCapital: true },
  { name: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.3521, lng: 103.8198, timezone: 'Asia/Singapore', isCapital: true },
  { name: 'Beijing', country: 'China', countryCode: 'CN', lat: 39.9042, lng: 116.4074, timezone: 'Asia/Shanghai', isCapital: true },
  { name: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo', isCapital: true },
  { name: 'Seoul', country: 'South Korea', countryCode: 'KR', lat: 37.5665, lng: 126.978, timezone: 'Asia/Seoul', isCapital: true },
  { name: 'Canberra', country: 'Australia', countryCode: 'AU', lat: -35.2809, lng: 149.13, timezone: 'Australia/Sydney', isCapital: true },
  { name: 'Wellington', country: 'New Zealand', countryCode: 'NZ', lat: -41.2865, lng: 174.7762, timezone: 'Pacific/Auckland', isCapital: true },
  { name: 'Brasília', country: 'Brazil', countryCode: 'BR', lat: -15.7975, lng: -47.8919, timezone: 'America/Sao_Paulo', isCapital: true },
  { name: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', lat: -34.6037, lng: -58.3816, timezone: 'America/Argentina/Buenos_Aires', isCapital: true },
  { name: 'Lima', country: 'Peru', countryCode: 'PE', lat: -12.0464, lng: -77.0428, timezone: 'America/Lima', isCapital: true },
  { name: 'Bogotá', country: 'Colombia', countryCode: 'CO', lat: 4.711, lng: -74.0721, timezone: 'America/Bogota', isCapital: true },
  { name: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA', lat: 24.7136, lng: 46.6753, timezone: 'Asia/Riyadh', isCapital: true },
  { name: 'Tehran', country: 'Iran', countryCode: 'IR', lat: 35.6892, lng: 51.389, timezone: 'Asia/Tehran', isCapital: true },
  { name: 'Jakarta', country: 'Indonesia', countryCode: 'ID', lat: -6.2088, lng: 106.8456, timezone: 'Asia/Jakarta', isCapital: true },
  { name: 'Manila', country: 'Philippines', countryCode: 'PH', lat: 14.5995, lng: 120.9842, timezone: 'Asia/Manila', isCapital: true },
  { name: 'Hanoi', country: 'Vietnam', countryCode: 'VN', lat: 21.0278, lng: 105.8342, timezone: 'Asia/Bangkok', isCapital: true },
  { name: 'Islamabad', country: 'Pakistan', countryCode: 'PK', lat: 33.6844, lng: 73.0479, timezone: 'Asia/Karachi', isCapital: true },
  { name: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', lat: 23.8103, lng: 90.4125, timezone: 'Asia/Dhaka', isCapital: true },
  { name: 'Warsaw', country: 'Poland', countryCode: 'PL', lat: 52.2297, lng: 21.0122, timezone: 'Europe/Warsaw', isCapital: true },
  { name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', lat: 52.3676, lng: 4.9041, timezone: 'Europe/Amsterdam', isCapital: true },
  { name: 'Brussels', country: 'Belgium', countryCode: 'BE', lat: 50.8503, lng: 4.3517, timezone: 'Europe/Brussels', isCapital: true },
  { name: 'Vienna', country: 'Austria', countryCode: 'AT', lat: 48.2082, lng: 16.3738, timezone: 'Europe/Vienna', isCapital: true },
  { name: 'Stockholm', country: 'Sweden', countryCode: 'SE', lat: 59.3293, lng: 18.0686, timezone: 'Europe/Stockholm', isCapital: true },
  { name: 'Oslo', country: 'Norway', countryCode: 'NO', lat: 59.9139, lng: 10.7522, timezone: 'Europe/Oslo', isCapital: true },
  { name: 'Helsinki', country: 'Finland', countryCode: 'FI', lat: 60.1699, lng: 24.9384, timezone: 'Europe/Helsinki', isCapital: true },
  { name: 'Athens', country: 'Greece', countryCode: 'GR', lat: 37.9838, lng: 23.7275, timezone: 'Europe/Athens', isCapital: true },
  { name: 'Lisbon', country: 'Portugal', countryCode: 'PT', lat: 38.7223, lng: -9.1393, timezone: 'Europe/Lisbon', isCapital: true },
  { name: 'Dublin', country: 'Ireland', countryCode: 'IE', lat: 53.3498, lng: -6.2603, timezone: 'Europe/Dublin', isCapital: true },
  { name: 'Kyiv', country: 'Ukraine', countryCode: 'UA', lat: 50.4501, lng: 30.5234, timezone: 'Europe/Kyiv', isCapital: true },
  { name: 'Bucharest', country: 'Romania', countryCode: 'RO', lat: 44.4268, lng: 26.1025, timezone: 'Europe/Bucharest', isCapital: true },
  { name: 'Prague', country: 'Czechia', countryCode: 'CZ', lat: 50.0755, lng: 14.4378, timezone: 'Europe/Prague', isCapital: true },
  { name: 'Budapest', country: 'Hungary', countryCode: 'HU', lat: 47.4979, lng: 19.0402, timezone: 'Europe/Budapest', isCapital: true },
  { name: 'Bern', country: 'Switzerland', countryCode: 'CH', lat: 46.948, lng: 7.4474, timezone: 'Europe/Zurich', isCapital: true },
  { name: 'Copenhagen', country: 'Denmark', countryCode: 'DK', lat: 55.6761, lng: 12.5683, timezone: 'Europe/Copenhagen', isCapital: true },
  { name: 'Santiago', country: 'Chile', countryCode: 'CL', lat: -33.4489, lng: -70.6693, timezone: 'America/Santiago', isCapital: true },
  { name: 'Caracas', country: 'Venezuela', countryCode: 'VE', lat: 10.4806, lng: -66.9036, timezone: 'America/Caracas', isCapital: true },
  { name: 'Havana', country: 'Cuba', countryCode: 'CU', lat: 23.1136, lng: -82.3666, timezone: 'America/Havana', isCapital: true },
  { name: 'Addis Ababa', country: 'Ethiopia', countryCode: 'ET', lat: 9.032, lng: 38.7469, timezone: 'Africa/Addis_Ababa', isCapital: true },
  { name: 'Accra', country: 'Ghana', countryCode: 'GH', lat: 5.6037, lng: -0.187, timezone: 'Africa/Accra', isCapital: true },
  { name: 'Algiers', country: 'Algeria', countryCode: 'DZ', lat: 36.7538, lng: 3.0588, timezone: 'Africa/Algiers', isCapital: true },
  { name: 'Rabat', country: 'Morocco', countryCode: 'MA', lat: 34.0209, lng: -6.8416, timezone: 'Africa/Casablanca', isCapital: true },
  { name: 'Baghdad', country: 'Iraq', countryCode: 'IQ', lat: 33.3152, lng: 44.3661, timezone: 'Asia/Baghdad', isCapital: true },
  { name: 'Amman', country: 'Jordan', countryCode: 'JO', lat: 31.9454, lng: 35.9284, timezone: 'Asia/Amman', isCapital: true },
  { name: 'Beirut', country: 'Lebanon', countryCode: 'LB', lat: 33.8938, lng: 35.5018, timezone: 'Asia/Beirut', isCapital: true },
  { name: 'Damascus', country: 'Syria', countryCode: 'SY', lat: 33.5138, lng: 36.2765, timezone: 'Asia/Damascus', isCapital: true },
  { name: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', lat: 3.139, lng: 101.6869, timezone: 'Asia/Kuala_Lumpur', isCapital: true },
  { name: 'Taipei', country: 'Taiwan', countryCode: 'TW', lat: 25.033, lng: 121.5654, timezone: 'Asia/Taipei', isCapital: true },
  { name: 'Ulaanbaatar', country: 'Mongolia', countryCode: 'MN', lat: 47.8864, lng: 106.9057, timezone: 'Asia/Ulaanbaatar', isCapital: true },
  { name: 'Tashkent', country: 'Uzbekistan', countryCode: 'UZ', lat: 41.2995, lng: 69.2401, timezone: 'Asia/Tashkent', isCapital: true },
  { name: 'Astana', country: 'Kazakhstan', countryCode: 'KZ', lat: 51.1694, lng: 71.4491, timezone: 'Asia/Almaty', isCapital: true },
]

const ALIASES = {
  usa: 'united states',
  'united states of america': 'united states',
  us: 'united states',
  uk: 'united kingdom',
  'great britain': 'united kingdom',
  britain: 'united kingdom',
  'south korea': 'south korea',
  'republic of korea': 'south korea',
  korea: 'south korea',
  'north korea': 'north korea',
  uae: 'uae',
  'united arab emirates': 'uae',
  'czech republic': 'czechia',
  'hong kong': 'china',
  'hong kong sar': 'china',
  'russian federation': 'russia',
  'the netherlands': 'netherlands',
  holland: 'netherlands',
  'people\'s republic of china': 'china',
  prc: 'china',
  'islamic republic of iran': 'iran',
  'kingdom of saudi arabia': 'saudi arabia',
  'republic of turkey': 'turkey',
  türkiye: 'turkey',
  turkiye: 'turkey',
  'new zealand': 'new zealand',
  'south africa': 'south africa',
}

function normCountry(s) {
  if (!s) return ''
  const k = String(s).trim().toLowerCase()
  return ALIASES[k] || k
}

const byCountry = new Map()
for (const c of CAPITALS) {
  if (!c.isCapital) continue
  const key = normCountry(c.country)
  if (!byCountry.has(key)) byCountry.set(key, c)
}

/** Resolve capital city for a country name (or code). */
export function capitalForCountry(country, countryCode) {
  if (countryCode) {
    const code = String(countryCode).toUpperCase()
    const hit = CAPITALS.find((c) => c.isCapital && c.countryCode === code)
    if (hit) return { ...hit, id: `capital-${hit.countryCode || hit.name}` }
  }
  const key = normCountry(country)
  if (!key) return null
  const hit = byCountry.get(key)
  return hit ? { ...hit, id: `capital-${hit.countryCode || hit.name}` } : null
}

/** True if this place is (near) a known capital. */
export function isCapitalPlace(place, eps = 0.6) {
  if (!place || place.lat == null || place.lng == null) return false
  if (place.isCapital) return true
  return CAPITALS.some(
    (c) =>
      c.isCapital &&
      Math.abs(c.lat - place.lat) < eps &&
      Math.abs(c.lng - place.lng) < eps
  )
}

/** Capitals as pin-ready rows for snapshots. */
export function capitalPinRows() {
  return CAPITALS.filter((c) => c.isCapital).map((c) => ({
    ...c,
    id: `capital-${c.countryCode || c.name}`,
    label: `${c.name}, ${c.country}`,
  }))
}
