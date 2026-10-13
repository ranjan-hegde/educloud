// storageService.js
// Central TEMPORARY storage layer for the frontend-only phase.
// Backed by browser localStorage so data survives page refreshes and is
// shared across the Student, Faculty, and Admin dashboards.
//
// TODO (Backend integration): once a real backend/database exists, replace
// the implementations below with real API calls (fetch/axios). Callers that
// use getData/addData/updateData/deleteData should not need to change.

import * as mock from "../data/mockData";

const NAMESPACE = "educloud_data";

// Maps each storage key to its ORIGINAL mock data. Used only:
//  (a) the very first time a key is read (before anything is ever saved), or
//  (b) after "Reset Demo Data" wipes the namespace.
// This guarantees existing mock data is never lost — it's simply the seed.
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
  subjectAttendance: () => mock.subjectAttendance,
  attendanceSummary: () => mock.attendanceSummary,
  notifications: () => mock.notificationsList,
  assignments: () => mock.assignmentsList,
  assessments: () => mock.assessmentsList,
  courseMaterials: () => mock.courseMaterialsList,
  feedback: () => mock.feedbackList,
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
    // localStorage unavailable (e.g. private browsing quota) — fail silently,
    // the app still works for the current session via in-memory React state.
  }
}

/** Read a collection/value. Seeds it from mock data on first access. */
export function getData(key) {
  const ns = readNamespace();
  if (ns[key] === undefined) {
    const seed = SEED_MAP[key] ? SEED_MAP[key]() : null;
    ns[key] = seed;
    writeNamespace(ns);
    return seed;
  }
  return ns[key];
}

/** Overwrite a collection/value entirely. */
export function setData(key, value) {
  const ns = readNamespace();
  ns[key] = value;
  writeNamespace(ns);
  // Notify any other mounted component (in this same tab) that's watching
  // this key — e.g. a Student submits feedback while a Faculty page is
  // already open, so it can refresh without waiting for a remount.
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new CustomEvent("educloud-storage-update", { detail: { key } }));
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

/** Remove a single key entirely (it will reseed from mock data on next read). */
export function clearData(key) {
  const ns = readNamespace();
  delete ns[key];
  writeNamespace(ns);
}

/** Wipe ALL temporary app data back to the original mock dataset. */
export function resetAllData() {
  localStorage.removeItem(NAMESPACE);
}
