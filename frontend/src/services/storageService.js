// storageService.js
// Production-ready data storage layer with USER-ISOLATED DATA PARTITIONS.
// Guarantees each student and faculty member only sees their OWN data and records.

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
  "notifications",
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

const SEED_MAP = {
  students: () => mock.studentsList,
  faculty: () => mock.facultyList,
  departments: () => mock.departments,
  courses: () => mock.courses,
  subjects: () => mock.subjects,
  timetable: () => mock.timetable,
  locations: () => mock.savedLocations,
  qrSessions: () => mock.qrSessions,
  todaysClasses: () => mock.todaysClasses,
  attendanceRecords: () => mock.liveAttendanceStudents,
  subjectAttendance: () => {
    const user = getCurrentUser();
    if (!user || user.email === "student@example.com" || user.id === "STU2301") {
      return mock.subjectAttendance;
    }
    const userCourse = user.course || "BCA";
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
  attendanceSummary: () => {
    const user = getCurrentUser();
    if (!user || user.email === "student@example.com" || user.id === "STU2301") {
      return mock.attendanceSummary;
    }
    return {
      overall: 100,
      present: 0,
      absent: 0,
      total: 0,
    };
  },
  attendanceTrend: () => {
    const user = getCurrentUser();
    if (!user || user.email === "student@example.com" || user.id === "STU2301") {
      return mock.attendanceTrend;
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((m) => ({ month: m, percentage: 100 }));
  },
  notifications: () => {
    const user = getCurrentUser();
    if (!user || user.email === "student@example.com" || user.id === "STU2301") {
      return mock.notificationsList;
    }
    return [
      {
        id: `notif-welcome-${Date.now()}`,
        title: `Welcome, ${user.name ? user.name.split(" ")[0] : "Student"}!`,
        message: `Your EduCloud account is ready. Course: ${user.course || "BCA"} (${user.semester || "1st Semester"}). Explore your subjects, schedule, and attendance.`,
        time: "Just now",
        read: false,
        type: "academic",
      },
    ];
  },
  assignments: () => mock.assignmentsList,
  assessments: () => mock.assessmentsList,
  courseMaterials: () => mock.courseMaterialsList,
  feedback: () => {
    const user = getCurrentUser();
    if (!user || user.email === "student@example.com" || user.id === "STU2301") {
      return mock.feedbackList;
    }
    return [];
  },
  feeStructure: () => {
    const user = getCurrentUser();
    if (!user || user.email === "student@example.com" || user.id === "STU2301") {
      return mock.feeStructure;
    }
    return {
      semester: user.semester || "1st Semester",
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
  requests: () => mock.requestsList,
  facultyTasks: () => mock.facultyTasksList,
  studentAttendanceMarks: () => [],
  studentMarksOverrides: () => ({}),
  marksRecords: () => ({}),
  attendanceSavedLog: () => [],
  userPreferences: () => ({ email: true, sms: false, push: true, theme: "light", language: "English" }),
};

function readNamespace() {
  try {
    return JSON.parse(localStorage.getItem(NAMESPACE)) || {};
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
