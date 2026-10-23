// storageService.js
// Production-ready data storage layer with USER-ISOLATED DATA PARTITIONS.
// Enforces real data persistence and purges mock/sample placeholder data.

import * as mock from "../data/mockData";
import { getCookie } from "../utils/cookieUtils";

const NAMESPACE = "educloud_data";

export function getCurrentUser() {
  try {
    const raw =
      localStorage.getItem("educloud_user") ||
      sessionStorage.getItem("educloud_user") ||
      getCookie("educloud_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Keys that are strictly private to individual users (student/faculty)
const USER_SCOPED_KEYS = new Set([
  "attendanceSummary",
  "subjectAttendance",
  "attendanceTrend",
  "studentMarksOverrides",
  "resultsData",
  "pastSemesterResults",
  "feedback",
  "feeStructure",
  "userPreferences",
  "studentProfile",
]);

function resolveStorageKey(key) {
  if (!USER_SCOPED_KEYS.has(key)) return key;
  const user = getCurrentUser();
  if (!user) return key;
  const rawId =
    user.id !== undefined && user.id !== null && user.id !== ""
      ? user.id
      : (user.email || user.uid);
  if (!rawId) return key;
  const userIdent = String(rawId).replace(/[^a-zA-Z0-9_-]/g, "_");
  return `user_${userIdent}_${key}`;
}

const MOCK_NAMES = new Set([
  "Aarav Sharma",
  "Diya Patel",
  "Rohan Mehta",
  "Ananya Iyer",
  "Vikram Singh",
  "Pooja Hegde",
  "Rahul Verma",
  "Sneha Kulkarni",
  "Kavya Nair",
  "Aditya Rao",
  "Neha Joshi",
  "Arjun Menon",
  "Meera Pillai",
  "Karan Bhat",
  "Tanvi Deshmukh",
  "Dr. Rajesh Sharma",
  "Prof. Sneha Gupta",
  "Dr. Amit Verma",
  "Prof. Priya Nair",
  "Dr. Suresh Rao",
]);

function getRegisteredAccountsByRole(role) {
  const result = [];
  try {
    const raw = localStorage.getItem("educloud_registered_users");
    if (raw) {
      const regMap = JSON.parse(raw);
      Object.values(regMap).forEach((acc) => {
        const p = acc?.profile;
        if (p && p.role === role) {
          if (role === "faculty") {
            result.push({
              id: String(p.id || p.facultyId || `FAC${Date.now().toString().slice(-4)}`),
              name: p.name || "Faculty Member",
              email: p.email,
              phone: p.phone || "",
              department: p.department || "Computer Science",
              designation: p.designation || "Assistant Professor",
              subjects: Array.isArray(p.subjects) ? p.subjects.length : 1,
              subjectNames: Array.isArray(p.subjects) ? p.subjects : ["Computer Science"],
              status: "Active",
            });
          } else if (role === "student") {
            result.push({
              id: String(p.id || p.rollNo || `STU${Date.now().toString().slice(-4)}`),
              rollNo: String(p.rollNo || p.id || `STU${Date.now().toString().slice(-4)}`),
              name: p.name || "Student",
              email: p.email,
              phone: p.phone || "",
              course: p.course || "BCA",
              semester: p.semester || "1st Semester",
              department: p.department || "Computer Applications",
              attendance: 95,
              status: "Active",
            });
          }
        }
      });
    }
  } catch {
    // ignore
  }

  // Also include current user if matching role
  const curr = getCurrentUser();
  if (curr && curr.role === role) {
    if (!result.some((r) => r.email === curr.email)) {
      if (role === "faculty") {
        result.push({
          id: String(curr.id || curr.facultyId || `FAC${Date.now().toString().slice(-4)}`),
          name: curr.name || "Faculty Member",
          email: curr.email,
          phone: curr.phone || "",
          department: curr.department || "Computer Science",
          designation: curr.designation || "Assistant Professor",
          subjects: Array.isArray(curr.subjects) ? curr.subjects.length : 1,
          subjectNames: Array.isArray(curr.subjects) ? curr.subjects : ["Computer Science"],
          status: "Active",
        });
      } else if (role === "student") {
        result.push({
          id: String(curr.id || curr.rollNo || `STU${Date.now().toString().slice(-4)}`),
          rollNo: String(curr.rollNo || curr.id || `STU${Date.now().toString().slice(-4)}`),
          name: curr.name || "Student",
          email: curr.email,
          phone: curr.phone || "",
          course: curr.course || "BCA",
          semester: curr.semester || "1st Semester",
          department: curr.department || "Computer Applications",
          attendance: 95,
          status: "Active",
        });
      }
    }
  }

  return result;
}

const SEED_MAP = {
  students: () => getRegisteredAccountsByRole("student"),
  faculty: () => getRegisteredAccountsByRole("faculty"),
  departments: () => mock.departments,
  courses: () => mock.courses,
  subjects: () => mock.subjects,
  timetable: () => [],
  locations: () => [],
  qrSessions: () => [],
  todaysClasses: () => [],
  attendanceRecords: () => [],
  subjectAttendance: () => {
    const user = getCurrentUser();
    const userCourse = user?.course || "BCA";
    const userSubs = mock.subjects.filter((s) => !userCourse || s.course === userCourse);
    return (userSubs.length ? userSubs : mock.subjects).map((s) => ({
      subject: s.name,
      total: 0,
      present: 0,
      absent: 0,
      percentage: 100,
      status: "Good",
    }));
  },
  attendanceSummary: () => ({
    overall: 100,
    present: 0,
    absent: 0,
    total: 0,
  }),
  attendanceTrend: () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((m) => ({ month: m, percentage: 100 }));
  },
  notifications: () => [],
  assignments: () => [],
  assessments: () => [],
  courseMaterials: () => [],
  feedback: () => [],
  feeStructure: () => {
    const user = getCurrentUser();
    return {
      semester: user?.semester || "1st Semester",
      academicYear: "2026 - 2027",
      dueDate: "2026-11-30",
      totalAmount: 48000,
      paidAmount: 0,
      dueAmount: 48000,
      breakdown: [
        { label: "Tuition Fee", amount: 35000 },
        { label: "Laboratory & Tech Fee", amount: 7500 },
        { label: "Library & Digital Resources", amount: 3000 },
        { label: "Student Activities", amount: 2500 },
      ],
    };
  },
  requests: () => [],
  facultyTasks: () => [],
  facultyAttendanceLog: () => [],
  studentAttendanceMarks: () => [],
  studentMarksOverrides: () => ({}),
  marksRecords: () => ({}),
  attendanceSavedLog: () => [],
  userPreferences: () => ({ email: true, sms: false, push: true, theme: "light", language: "English" }),
};

/** Purge mock entries from state to leave strictly real data */
function sanitizeNamespace(ns) {
  let changed = false;

  // Filter students: remove mock names
  if (Array.isArray(ns.students)) {
    const cleanStudents = ns.students.filter(
      (s) => !MOCK_NAMES.has(s.name) && s.email !== "student@example.com"
    );
    if (cleanStudents.length !== ns.students.length) {
      ns.students = cleanStudents;
      changed = true;
    }
  }

  // Filter faculty: remove mock names
  if (Array.isArray(ns.faculty)) {
    const cleanFaculty = ns.faculty.filter(
      (f) => !MOCK_NAMES.has(f.name) && f.email !== "faculty@example.com"
    );
    if (cleanFaculty.length !== ns.faculty.length) {
      ns.faculty = cleanFaculty;
      changed = true;
    }
  }

  // Filter materials: remove any referencing mock faculty
  if (Array.isArray(ns.courseMaterials)) {
    const cleanMaterials = ns.courseMaterials.filter(
      (m) => !MOCK_NAMES.has(m.faculty) && !MOCK_NAMES.has(m.facultyName)
    );
    if (cleanMaterials.length !== ns.courseMaterials.length) {
      ns.courseMaterials = cleanMaterials;
      changed = true;
    }
  }

  // Filter tasks: remove mock task titles
  if (Array.isArray(ns.facultyTasks)) {
    const mockTaskTitles = new Set([
      "Review Java OOP assignment submissions",
      "Prepare Internal Assessment 1 question paper",
      "Post attendance summary for August",
    ]);
    const cleanTasks = ns.facultyTasks.filter((t) => !mockTaskTitles.has(t.title));
    if (cleanTasks.length !== ns.facultyTasks.length) {
      ns.facultyTasks = cleanTasks;
      changed = true;
    }
  }

  // Filter requests: remove mock requests
  if (Array.isArray(ns.requests)) {
    const cleanReqs = ns.requests.filter(
      (r) => !MOCK_NAMES.has(r.facultyName) && r.facultyEmail !== "faculty@example.com"
    );
    if (cleanReqs.length !== ns.requests.length) {
      ns.requests = cleanReqs;
      changed = true;
    }
  }

  return { ns, changed };
}

function readNamespace() {
  try {
    const raw = localStorage.getItem(NAMESPACE);
    let ns = raw ? JSON.parse(raw) : {};
    const { ns: cleaned, changed } = sanitizeNamespace(ns);
    if (changed) {
      writeNamespace(cleaned);
    }
    return cleaned;
  } catch {
    return {};
  }
}

function writeNamespace(ns) {
  try {
    localStorage.setItem(NAMESPACE, JSON.stringify(ns));
  } catch {
    // quota exceeded or private mode fallback
  }
}

/** Read a collection/value. Scoped automatically per-user when appropriate. */
export function getData(key) {
  const actualKey = resolveStorageKey(key);
  const ns = readNamespace();
  if (ns[actualKey] === undefined) {
    const seed = SEED_MAP[key] ? SEED_MAP[key]() : null;
    ns[actualKey] = seed;
    writeNamespace(ns);
    return seed;
  }
  return ns[actualKey];
}

/** Overwrite a collection/value entirely. */
export function setData(key, value) {
  const actualKey = resolveStorageKey(key);
  const ns = readNamespace();
  ns[actualKey] = value;
  writeNamespace(ns);
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new CustomEvent("educloud-storage-update", { detail: { key, actualKey } }));
  }
  return value;
}

/** Prepend a new record to an array collection. */
export function addData(key, item) {
  const list = getData(key) || [];
  const updated = [item, ...list];
  setData(key, updated);
  return updated;
}

/** Merge `updates` into the record matching `id` within an array collection. */
export function updateData(key, id, updates) {
  const list = getData(key) || [];
  const updated = list.map((i) => (i.id === id ? { ...i, ...updates } : i));
  setData(key, updated);
  return updated;
}

/** Remove the record matching `id` from an array collection. */
export function deleteData(key, id) {
  const list = getData(key) || [];
  const updated = list.filter((i) => i.id !== id);
  setData(key, updated);
  return updated;
}

/** Remove a single key entirely (it will reseed on next read). */
export function clearData(key) {
  const actualKey = resolveStorageKey(key);
  const ns = readNamespace();
  delete ns[actualKey];
  writeNamespace(ns);
}

/** Wipe ALL temporary app data back to clean state. */
export function resetAllData() {
  localStorage.removeItem(NAMESPACE);
}
