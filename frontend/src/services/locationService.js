// locationService.js — MOCK location verification.
// TODO (Backend integration): replace with real browser Geolocation API
// (navigator.geolocation.getCurrentPosition) combined with server-side
// haversine-distance validation against the assigned classroom coordinates.

import { delay } from "./_utils";
import { savedLocations } from "../data/mockData";

export function getSavedLocations() {
  return delay(savedLocations);
}

export function verifyLocation(locationId) {
  // Mocked distance calculation — always returns a plausible in-range value.
  const distance = Math.floor(15 + Math.random() * 30);
  const location = savedLocations.find((l) => l.id === locationId) || savedLocations[0];
  const withinRadius = distance <= location.radius;
  return delay({ distance, radius: location.radius, withinRadius }, 900);
}

export function saveLocation(location) {
  return delay({ ...location, id: `LOC${Math.floor(10 + Math.random() * 90)}` }, 600);
}
