// attendanceService.js — MOCK. Replace with real REST calls later.
import { delay } from "./_utils";
import { liveAttendanceStudents } from "../data/mockData";

export function getClassRoster(classId) {
  return delay(liveAttendanceStudents.map((s) => ({ ...s, present: s.status === "Present" })));
}

export function saveManualAttendance(classId, records) {
  return delay({ success: true, saved: records.length }, 700);
}
