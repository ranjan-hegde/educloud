// geoUtils.js
// Genuine GPS distance utilities for QR attendance location validation.
// Uses the browser's real navigator.geolocation API — never a simulated
// or hardcoded distance. The backend must independently re-validate this
// once connected; this frontend check alone is not a security boundary.

/** Great-circle distance between two lat/lng points, in meters (Haversine formula). */
export function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Requests the device's real current position via the browser Geolocation API.
 * Resolves { latitude, longitude } or rejects with a typed error:
 *   - { code: "UNSUPPORTED" }  — browser has no geolocation support
 *   - { code: "DENIED" }       — user denied the permission prompt
 *   - { code: "UNAVAILABLE" }  — position could not be determined
 *   - { code: "TIMEOUT" }      — request timed out
 */
export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject({ code: "UNSUPPORTED", message: "Geolocation is not supported on this device." });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) reject({ code: "DENIED", message: "Location permission is required to mark attendance." });
        else if (err.code === err.TIMEOUT) reject({ code: "TIMEOUT", message: "Location request timed out. Please try again." });
        else reject({ code: "UNAVAILABLE", message: "Unable to determine your current location." });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0, ...options }
    );
  });
}
