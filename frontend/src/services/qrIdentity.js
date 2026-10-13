// qrIdentity.js
// The QR encodes the SPECIFIC attendance SESSION (via its unique Session ID)
// created by Faculty — not just the subject. A session's QR image stays the
// same for the lifetime of that session (it isn't regenerated on every
// render or every scan), but a new session naturally gets a new Session ID.

const APP_TAG = "educloud";

export function buildSessionQrPayload(session) {
  return JSON.stringify({
    app: APP_TAG,
    type: "attendance-session",
    sessionId: session.id,
  });
}

/** Parses a scanned/decoded QR payload. Returns the sessionId, or null if invalid. */
export function parseQrPayload(raw) {
  try {
    const data = JSON.parse(raw);
    if (data?.app !== APP_TAG || data?.type !== "attendance-session" || !data?.sessionId) return null;
    return data;
  } catch {
    return null;
  }
}

/** Generates a human-readable, unique attendance Session ID, e.g. ATT-20260901-001. */
export function generateSessionId(dateISO, sequence) {
  const compact = dateISO.replace(/-/g, "");
  return `ATT-${compact}-${String(sequence).padStart(3, "0")}`;
}

/**
 * Computes the next safe sequence number for a NEW session on `dateISO`,
 * given all existing sessions.
 *
 * BUG THIS FIXES: sequence numbers were previously derived from
 * `allSessions.length + 1` — the TOTAL number of sessions across every
 * date. That means (a) the sequence keeps climbing forever instead of
 * resetting per day, and (b) once any session is ever deleted, a later
 * session created on the SAME date can be assigned a sequence number
 * that's already in use for that date, producing a duplicate Session ID.
 * This scans only sessions that already start with today's date prefix
 * and returns one past the highest sequence actually in use for that day.
 */
export function nextSessionSequence(existingSessions, dateISO) {
  const compact = dateISO.replace(/-/g, "");
  const prefix = `ATT-${compact}-`;
  let max = 0;
  for (const s of existingSessions || []) {
    if (typeof s?.id === "string" && s.id.startsWith(prefix)) {
      const n = parseInt(s.id.slice(prefix.length), 10);
      if (!Number.isNaN(n) && n > max) max = n;
    }
  }
  return max + 1;
}

/**
 * Converts a native <input type="time"> value ("HH:MM", 24-hour) into an
 * unambiguous 12-hour "hh:mm AM/PM" string — the exact format the rest of
 * the app's session times, display, and validation already use. Handles
 * the 12:00 AM (midnight) / 12:00 PM (noon) edge cases correctly.
 */
export function to12HourTime(rawHHMM) {
  if (!rawHHMM) return "";
  const [hStr, mStr] = rawHHMM.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
}
