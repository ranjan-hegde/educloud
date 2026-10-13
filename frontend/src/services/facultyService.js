// facultyService.js — MOCK. Replace with real REST/GraphQL calls later.
import { delay } from "./_utils";
import { facultyList, currentFaculty, subjects } from "../data/mockData";

export function getFacultyList() {
  return delay(facultyList);
}

export function getFacultyProfile() {
  return delay(currentFaculty);
}

export function updateFacultyProfile(updates) {
  return delay({ ...currentFaculty, ...updates }, 600);
}

export function getFacultySubjects() {
  return delay(subjects.filter((s) => s.faculty === currentFaculty.name));
}

export function addFaculty(faculty) {
  return delay({ ...faculty, id: `FAC${Math.floor(1000 + Math.random() * 900)}` }, 600);
}

export function deleteFaculty(id) {
  return delay({ success: true, id }, 400);
}
