// studentService.js — MOCK. Replace with real REST/GraphQL calls later.
import { delay } from "./_utils";
import { studentsList, currentStudent, subjectAttendance, attendanceSummary, attendanceTrend } from "../data/mockData";

export function getStudents() {
  return delay(studentsList);
}

export function getStudentProfile() {
  return delay(currentStudent);
}

export function updateStudentProfile(updates) {
  return delay({ ...currentStudent, ...updates, updatedAt: new Date().toISOString() }, 600);
}

export function getStudentAttendance() {
  return delay({ summary: attendanceSummary, subjects: subjectAttendance, trend: attendanceTrend });
}

export function addStudent(student) {
  return delay({ ...student, id: `STU${Math.floor(2000 + Math.random() * 900)}` }, 600);
}

export function deleteStudent(id) {
  return delay({ success: true, id }, 400);
}
