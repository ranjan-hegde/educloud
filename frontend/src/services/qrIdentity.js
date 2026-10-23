// qrIdentity.js
// Production QR payload encoding and decoding for EduCloud attendance.

const APP_TAG = "educloud";

/**
 * Builds a deterministic, unique QR payload for a student that DOES NOT CHANGE.
 * Serves as the student's digital QR Attendance ID pass.
 */
export function buildStudentQrPayload(student) {
  const rawId = student.rollNo || student.studentId || student.id || "STU2301";
  return JSON.stringify({
    app: APP_TAG,
    type: "student-identity",
    studentId: String(rawId),
    rollNo: String(student.rollNo || rawId),
    name: student.name || "Student",
    email: student.email || "",
    course: student.course || "BCA",
    semester: student.semester || "5th Semester",
  });
}

/** Parses a scanned student QR code. Returns decoded student identity or null. */
export function parseStudentQrPayload(raw) {
  if (!raw) return null;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  try {
    const data = JSON.parse(trimmed);
    if (data && (data.type === "student-identity" || data.studentId || data.rollNo)) {
      return {
        studentId: data.studentId || data.rollNo,
        rollNo: data.rollNo || data.studentId,
        name: data.name || "Student",
        email: data.email || "",
        course: data.course || "BCA",
        semester: data.semester || "5th Semester",
      };
    }
  } catch {
    // If raw scanned string is a student roll number or ID directly (e.g. "STU2301" or "2301")
    if (/^STU/i.test(trimmed) || /^\d+$/.test(trimmed)) {
      return {
        studentId: trimmed,
        rollNo: trimmed,
        name: `Student (${trimmed})`,
        email: "",
        course: "BCA",
        semester: "5th Semester",
      };
    }
  }
  return null;
}

/**
 * Builds a deterministic, unique QR payload for a faculty member that DOES NOT CHANGE.
 * Serves as the teacher's digital Faculty Attendance Pass.
 */
export function buildFacultyQrPayload(faculty) {
  const rawId = faculty.facultyId || faculty.id || "FAC2601";
  return JSON.stringify({
    app: APP_TAG,
    type: "faculty-identity",
    facultyId: String(rawId),
    name: faculty.name || "Faculty Member",
    email: faculty.email || "",
    department: faculty.department || "Computer Science",
    designation: faculty.designation || "Assistant Professor",
  });
}

/** Parses a scanned faculty QR code. Returns decoded faculty identity or null. */
export function parseFacultyQrPayload(raw) {
  if (!raw) return null;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  try {
    const data = JSON.parse(trimmed);
    if (data && (data.type === "faculty-identity" || data.facultyId)) {
      return {
        facultyId: String(data.facultyId || data.id),
        name: data.name || "Faculty Member",
        email: data.email || "",
        department: data.department || "Computer Science",
        designation: data.designation || "Assistant Professor",
      };
    }
  } catch {
    if (/^FAC/i.test(trimmed)) {
      return {
        facultyId: trimmed,
        name: `Faculty (${trimmed})`,
        email: "",
        department: "Computer Science",
        designation: "Faculty Member",
      };
    }
  }
  return null;
}

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
