// qrAttendanceService.js — QR attendance workflow.
// Performs GENUINE validation using the real browser Geolocation API and
// real current date/time — nothing here is a simulated/fake pass-through.
//
// validateAttendanceSession() is the SINGLE shared validation function used
// by all three student input methods (camera scan, uploaded QR image, and
// manual Session ID entry) — there are no separate/duplicate rule sets.
//
// TODO (Backend integration): the real backend MUST independently
// re-verify every one of these checks (session state, class assignment,
// date/time window, GPS radius, duplicate attendance, student identity/
// authorization). Never trust attendance information coming only from the
// browser — this frontend validation is for development/demo purposes only
// and is not a security boundary.

import { haversineDistanceMeters, getCurrentPosition } from "./geoUtils";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Parses a "10:00 AM" style time string into a Date on today's date. */
function parseTimeToday(timeStr) {
  const m = timeStr?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  let [, h, min, ampm] = m;
  h = parseInt(h, 10);
  min = parseInt(min, 10);
  if (/PM/i.test(ampm) && h !== 12) h += 12;
  if (/AM/i.test(ampm) && h === 12) h = 0;
  const d = new Date();
  d.setHours(h, min, 0, 0);
  return d;
}

/**
 * The ONE shared validation function for marking QR attendance, regardless
 * of how the Student obtained the Session ID (camera scan, uploaded QR
 * image, or manual entry).
 *
 * @param {string} sessionId - The attendance Session ID to validate.
 * @param {object} ctx
 * @param {object[]} ctx.qrSessions - All Faculty-created attendance sessions (shared storage).
 * @param {object[]} ctx.subjects - The subjects[] master list.
 * @param {string} ctx.studentClass - The logged-in student's class label (e.g. "BCA 5th Semester").
 * @param {boolean} ctx.alreadyMarked - Whether this student already has a mark for this session.
 */
export async function validateAttendanceSession(sessionId, { qrSessions, subjects, studentClass, alreadyMarked }) {
  const checks = {};
  let message = "";
  let distance = null;

  // 1. The Session ID must correspond to an actual Faculty-created session.
  const session = (qrSessions || []).find((s) => s.id === (sessionId || "").trim());
  if (!session) {
    return { success: false, checks: {}, message: "Invalid Attendance Session ID.", distance: null, session: null };
  }
  const subject = (subjects || []).find((s) => s.name === session.subject);

  // 2. Class assignment.
  checks.classAssigned = session.class === studentClass;

  // Session status/date, checked separately so the reject message can be
  // precise about WHICH condition failed.
  const sessionIsActive = session.status === "ACTIVE";
  const sessionIsToday = session.date === todayISO();
  checks.sessionActive = sessionIsActive && sessionIsToday;

  // 3. Time window.
  const start = parseTimeToday(session.startTime);
  const end = parseTimeToday(session.endTime);
  const now = new Date();
  checks.withinTime = !!(start && end && now >= start && now <= end);

  // 4. Duplicate check.
  checks.notDuplicate = !alreadyMarked;

  // Stop early with a clear reason if any non-location check already failed
  // (no point prompting for GPS permission if the session isn't even valid).
  if (!checks.classAssigned) {
    message = "This attendance session is not assigned to your class.";
    return { success: false, checks, message, distance, session, subject };
  }
  if (alreadyMarked) {
    message = "Attendance already marked for this session.";
    return { success: false, checks, message, distance, session, subject };
  }
  if (session.status === "CLOSED" || session.status === "COMPLETED") {
    message = "This attendance session has been closed.";
    return { success: false, checks, message, distance, session, subject };
  }
  if (session.status === "SCHEDULED") {
    message = "This attendance session has not started yet.";
    return { success: false, checks, message, distance, session, subject };
  }
  if (!sessionIsToday) {
    message = "This attendance session is not active today.";
    return { success: false, checks, message, distance, session, subject };
  }
  if (!checks.sessionActive) {
    message = "This attendance session is no longer valid.";
    return { success: false, checks, message, distance, session, subject };
  }
  if (!checks.withinTime) {
    message = "Attendance is not active at this time.";
    return { success: false, checks, message, distance, session, subject };
  }

  // 5. REAL GPS location check — genuinely requests the device's current
  // position and computes the actual distance to the session's coordinates.
  try {
    const pos = await getCurrentPosition();
    distance = haversineDistanceMeters(pos.latitude, pos.longitude, parseFloat(session.latitude), parseFloat(session.longitude));
    checks.locationVerified = distance <= session.radius;
  } catch (err) {
    checks.locationVerified = false;
    message = err.message || "Unable to verify your location.";
    return { success: false, checks, message, distance, session, subject };
  }

  if (!checks.locationVerified) {
    message = "You are outside the allowed attendance location.";
    return { success: false, checks, message, distance, session, subject };
  }

  message = "Attendance Marked Successfully";
  return { success: true, checks, message, distance, session, subject };
}
