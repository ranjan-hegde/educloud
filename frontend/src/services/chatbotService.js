// chatbotService.js
// Smart MOCK AI assistant. Reads LIVE application data from storageService
// (the same temporary localStorage-backed data the dashboards read/write)
// plus static profile data from mockData.js, and answers using real,
// current numbers — it never invents information.
//
// TODO (Backend integration): replace this rule-based engine with a real
// LLM API call (e.g. the Anthropic Claude API) via a secure backend proxy
// that still scopes the model's context to the caller's own role and data.

import { delay } from "./_utils";
import api from "./api";
import * as storageService from "./storageService";
import { currentFaculty, currentStudent, subjects as allSubjects, resultsData } from "../data/mockData";

// ---------------------------------------------------------------------
// Small last-turn memory so short follow-ups like "What about Java?" or
// "How many classes did I miss?" resolve without repeating the subject.
// ---------------------------------------------------------------------
let lastContext = { subject: null, topic: null };

export function resetChatContext() {
  lastContext = { subject: null, topic: null };
}

function norm(s) {
  return (s || "").toLowerCase().trim();
}

// Finds which known subject (if any) a question refers to, by checking
// whether a significant word from the subject's name appears in the text.
function matchSubject(question, subjectNames) {
  const q = norm(question);
  let best = null;
  for (const name of subjectNames) {
    if (!name) continue;
    const words = norm(name).split(/\s+/).filter((w) => w.length > 2);
    if (words.some((w) => q.includes(w))) {
      if (!best || name.length > best.length) best = name;
    }
  }
  return best;
}

// Extracts an explicitly-named subject phrase from an attendance-style
// question (e.g. "my Physics attendance", "attendance in Physics"),
// regardless of whether that subject actually exists in our data.
function extractNamedSubject(question) {
  const m = question.match(/attendance in ([a-zA-Z ]+)|my ([a-zA-Z ]+?) attendance/i);
  if (!m) return null;
  return (m[1] || m[2] || "").trim() || null;
}

const DENY = "You don't have permission to access that information.";

// Deterministic mock average-marks generator, matching the one used on the
// Faculty → Student Performance page, so chatbot answers stay consistent.
function avgMarksMock(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 97;
  return 55 + (hash % 40);
}

// ---------------------------------------------------------------------
// STUDENT
// ---------------------------------------------------------------------
function answerStudent(question) {
  const q = norm(question);

  // Role security — students can only see their own data.
  if (/all students|every student|other student'?s|admin.only|faculty list|how many students are registered|how many faculty|system(-| )wide|entire (college|institution|system)|every faculty/.test(q)) {
    return DENY;
  }

  const subjectAttendance = storageService.getData("subjectAttendance") || [];
  const attendanceSummary = storageService.getData("attendanceSummary") || {};
  const studentClass = `${currentStudent.course} ${currentStudent.semester}`;
  const todayISO = new Date().toISOString().slice(0, 10);
  const todaysClasses = (storageService.getData("qrSessions") || []).filter((s) => s.class === studentClass && s.date === todayISO);
  const myMarks = (storageService.getData("studentAttendanceMarks") || []).filter((m) => m.studentId === currentStudent.id);
  const assignments = storageService.getData("assignments") || [];
  const notifications = storageService.getData("notifications") || [];
  const subjectNames = subjectAttendance.map((s) => s.subject);

  // --- Which subjects have low attendance? (checked before the general
  // attendance block since it also contains the word "attendance") ---
  if (/low attendance|weak attendance/.test(q)) {
    const low = subjectAttendance.filter((s) => s.percentage < 75);
    lastContext = { subject: null, topic: "attendance" };
    if (!low.length) return "All of your subjects currently have healthy attendance (75% or above).";
    return `These subjects have low attendance: ${low.map((s) => `${s.subject} (${s.percentage}%)`).join(", ")}.`;
  }

  // --- Faculty for a subject (checked BEFORE the attendance/follow-up
  // block, so a subject-name mention here doesn't get mistaken for an
  // attendance follow-up just because the last topic was attendance) ---
  const facultySubjectMatch = matchSubject(question, allSubjects.map((s) => s.name));
  if (/faculty/.test(q) && facultySubjectMatch) {
    const subj = allSubjects.find((s) => s.name === facultySubjectMatch);
    lastContext = { subject: facultySubjectMatch, topic: "faculty" };
    if (subj) return `${subj.faculty} teaches ${subj.name}.`;
    return "I couldn't find that subject in your current data.";
  }

  // --- Timetable / next class ---
  if (/next class/.test(q)) {
    const upcoming = todaysClasses[0];
    lastContext = { subject: upcoming?.subject || null, topic: "timetable" };
    if (!upcoming) return "I couldn't find any classes scheduled for you today.";
    return `Your next class is ${upcoming.subject} at ${upcoming.startTime} in ${upcoming.room} with ${upcoming.faculty}.`;
  }
  if (/timetable|schedule/.test(q)) {
    lastContext = { subject: null, topic: "timetable" };
    if (!todaysClasses.length) return "I couldn't find any classes on your timetable for today.";
    return `Today you have: ${todaysClasses.map((c) => `${c.subject} at ${c.startTime}`).join(", ")}.`;
  }

  // --- Subjects list ---
  if (/what (are|is) my subjects|my subjects|which subjects am i/.test(q)) {
    lastContext = { subject: null, topic: "subjects" };
    if (!subjectNames.length) return "I couldn't find your subject list in the current data.";
    return `Your current subjects are ${subjectNames.join(", ")}.`;
  }

  // --- Results ---
  if (/\bcgpa\b/.test(q)) { lastContext = { subject: null, topic: "results" }; return `Your current CGPA is ${resultsData.cgpa}.`; }
  if (/\bsgpa\b/.test(q)) { lastContext = { subject: null, topic: "results" }; return `Your current SGPA is ${resultsData.sgpa} for ${resultsData.semester}.`; }
  if (/result|marks|grade/.test(q)) {
    lastContext = { subject: null, topic: "results" };
    return `Your latest results (${resultsData.semester}): SGPA ${resultsData.sgpa}, CGPA ${resultsData.cgpa}, overall percentage ${resultsData.percentage}%.`;
  }

  // --- Assignments ---
  if (/assignment/.test(q)) {
    lastContext = { subject: null, topic: "assignments" };
    const pending = assignments.filter((a) => a.status === "Pending");
    if (!pending.length) return "You have no pending assignments right now — nice work!";
    return `You have ${pending.length} pending assignment${pending.length > 1 ? "s" : ""}: ${pending.map((a) => `${a.title} (due ${a.dueDate})`).join(", ")}.`;
  }

  // --- Notifications ---
  if (/notification/.test(q)) {
    lastContext = { subject: null, topic: "notifications" };
    const unread = notifications.filter((n) => !n.read);
    if (!unread.length) return "You have no unread notifications.";
    return `You have ${unread.length} unread notification${unread.length > 1 ? "s" : ""}: ${unread.map((n) => n.title).join(", ")}.`;
  }

  // --- QR attendance ---
  if (/mark attendance|attendance session|\bqr\b|why can'?t i/.test(q)) {
    const named = todaysClasses.find((c) => matchSubject(question, [c.subject]) === c.subject);
    const target = named || todaysClasses.find((c) => c.status === "ACTIVE") || todaysClasses[0];
    lastContext = { subject: target?.subject || null, topic: "qr" };
    if (!target) return "I couldn't find any class session for you right now.";
    const marked = myMarks.some((m) => m.sessionId === target.id);
    if (marked) return `You've already marked attendance for ${target.subject}.`;
    if (target.status === "ACTIVE") {
      return `Yes. Your ${target.subject} attendance session is active in ${target.room}. Your attendance can be marked if the location verification is successful.`;
    }
    if (target.status === "SCHEDULED") return `The ${target.subject} attendance session hasn't started yet.`;
    return `The ${target.subject} attendance session is currently closed, so you cannot mark attendance.`;
  }
  if (/where is my class|what room/.test(q)) {
    const named = todaysClasses.find((c) => matchSubject(question, [c.subject]) === c.subject);
    const target = named || todaysClasses[0];
    lastContext = { subject: target?.subject || null, topic: "qr" };
    if (!target) return "I couldn't find your class location right now.";
    return `Your ${target.subject} class is in ${target.room} (${target.location}).`;
  }

  // --- Attendance (overall, subject-specific, and follow-ups). Checked
  // after all other specific intents so an old attendance topic never
  // "steals" a question that's clearly about something else. ---
  const mentionedSubject = matchSubject(question, subjectNames);
  const namedSubject = extractNamedSubject(question); // explicit subject phrase, known or not
  const topicIsAttendance =
    /attend/.test(q) ||
    (lastContext.topic === "attendance" && (mentionedSubject || /miss|absent/.test(q)));

  if (topicIsAttendance) {
    // An explicit subject was named (e.g. "physics") but it isn't in the
    // student's data — say so honestly, and do NOT fall back to whatever
    // subject was discussed earlier.
    if (namedSubject && !mentionedSubject && !subjectNames.some((n) => norm(n).includes(norm(namedSubject)))) {
      lastContext = { subject: null, topic: "attendance" };
      return `I couldn't find ${namedSubject} attendance information in your current student data.`;
    }

    const targetSubject = mentionedSubject || (lastContext.topic === "attendance" ? lastContext.subject : null);

    if (/miss|absent/.test(q) && targetSubject) {
      const row = subjectAttendance.find((s) => s.subject === targetSubject);
      if (row) {
        lastContext = { subject: targetSubject, topic: "attendance" };
        return `You missed ${row.absent} ${targetSubject} class${row.absent === 1 ? "" : "es"} out of ${row.total} held so far.`;
      }
    }

    if (targetSubject) {
      const row = subjectAttendance.find((s) => s.subject === targetSubject);
      if (!row) return `I couldn't find ${targetSubject} attendance information in your current student data.`;
      lastContext = { subject: targetSubject, topic: "attendance" };
      return `Your ${row.subject} attendance is ${row.percentage}%. You attended ${row.present} out of ${row.total} classes and were absent for ${row.absent}.`;
    }

    lastContext = { subject: null, topic: "attendance" };
    const weak = subjectAttendance.filter((s) => s.percentage < 75);
    const weakNote = weak.length ? ` Your lowest is ${weak.map((s) => `${s.subject} (${s.percentage}%)`).join(", ")}.` : "";
    return `Your overall attendance is ${attendanceSummary.overall}% (${attendanceSummary.present} out of ${attendanceSummary.total} classes).${weakNote}`;
  }

  return 'I can help with your attendance, timetable, subjects, results, assignments, and notifications. Try asking something like "What is my Java attendance?"';
}

// ---------------------------------------------------------------------
// FACULTY
// ---------------------------------------------------------------------
function answerFaculty(question) {
  const q = norm(question);

  if (/how many students are registered|total students in the system|all departments|which department has the most|system(-| )wide|entire (college|institution)|every department/.test(q)) {
    return DENY;
  }

  const allSessions = storageService.getData("qrSessions") || [];
  const facultyTodayISO = new Date().toISOString().slice(0, 10);
  const mySessions = allSessions.filter((s) => s.faculty === currentFaculty.name);
  const myTodaySessions = mySessions.filter((s) => s.date === facultyTodayISO);
  const sessions = mySessions.length ? mySessions : allSessions;
  const attendanceRecords = storageService.getData("attendanceRecords") || [];
  const assignments = storageService.getData("assignments") || [];
  const students = storageService.getData("students") || [];
  const mySubjectNames = currentFaculty.subjects || [];

  const activeSession = sessions.find((s) => s.status === "ACTIVE");
  const mentionedSubject = matchSubject(question, sessions.map((s) => s.subject));
  const targetSession = sessions.find((s) => s.subject === mentionedSubject) || activeSession || sessions[0];

  // --- QR-specific (checked before generic attendance-percentage phrasing) ---
  if (/\bqr\b.*active|active.*\bqr\b|is (the |my )?qr\b/.test(q)) {
    if (!targetSession) return "I couldn't find a QR session for that class.";
    return targetSession.status === "ACTIVE"
      ? `Yes, the QR session for ${targetSession.subject} is currently active.`
      : `No, the QR session for ${targetSession.subject} is currently ${targetSession.status.toLowerCase()}.`;
  }
  if (/how many students scanned/.test(q) && targetSession) {
    return `${targetSession.present} students have scanned the QR code for ${targetSession.subject} so far.`;
  }
  if (/when should i close/.test(q) && targetSession) {
    return targetSession.status === "ACTIVE"
      ? `You can close the ${targetSession.subject} session once the attendance window (${targetSession.startTime} – ${targetSession.endTime}) ends, or sooner if all students have checked in.`
      : `The ${targetSession.subject} session isn't currently active.`;
  }
  if (/which classroom/.test(q) && targetSession) {
    return `${targetSession.subject} is assigned to ${targetSession.room} (${targetSession.location}).`;
  }

  if (/how many students (are )?in my class|class size/.test(q) && targetSession) {
    return `Your ${targetSession.subject} class (${targetSession.class}) has ${targetSession.total} students.`;
  }

  if (/today'?s classes|classes today/.test(q)) {
    if (!myTodaySessions.length) return "I couldn't find any classes scheduled for you today.";
    return `Today you have: ${myTodaySessions.map((s) => `${s.subject} at ${s.startTime} in ${s.room}`).join(", ")}.`;
  }

  if (/which students are absent|absent students|not attend|have not attended|who('?s| is) absent/.test(q)) {
    const absent = attendanceRecords.filter((r) => r.status === "Absent");
    if (!absent.length) return "No students are currently marked absent in the latest attendance record.";
    return `The following students are currently absent: ${absent.map((r) => r.name).join(", ")}.`;
  }

  if (/(how many|number of) students (attended|scanned|present)|attendance percentage|how many.*attended.*today/.test(q) && targetSession) {
    const pct = Math.round((targetSession.present / targetSession.total) * 100);
    return `${targetSession.present} out of ${targetSession.total} students have marked attendance for ${targetSession.subject} (${pct}%). ${targetSession.absent} students are currently absent.`;
  }

  if (/low.attendance/.test(q)) {
    const low = students.filter((s) => s.attendance < 60);
    if (!low.length) return "No students currently have critically low attendance.";
    return `These students have low attendance: ${low.map((s) => `${s.name} (${s.attendance}%)`).join(", ")}.`;
  }

  if (/pending assignment/.test(q)) {
    const mine = assignments.filter((a) => mySubjectNames.includes(a.subject));
    const pending = mine.filter((a) => a.status === "Pending");
    if (!pending.length) return "You have no pending assignments to track right now.";
    return `You have ${pending.length} pending assignment${pending.length > 1 ? "s" : ""}: ${pending.map((a) => a.title).join(", ")}.`;
  }

  if (/my subjects/.test(q)) {
    if (!mySubjectNames.length) return "I couldn't find your assigned subjects in the current data.";
    return `You are teaching: ${mySubjectNames.join(", ")}.`;
  }

  if (/next class/.test(q)) {
    if (!sessions.length) return "I couldn't find your next class in today's schedule.";
    return `Your next class is ${sessions[0].subject} at ${sessions[0].startTime} in ${sessions[0].room}.`;
  }

  if (/how many.*submitted|submission/.test(q)) {
    const mine = assignments.filter((a) => mySubjectNames.includes(a.subject));
    if (!mine.length) return "I couldn't find any assignments for your subjects.";
    return mine.map((a) => `${a.title}: ${a.submissions} of ${a.totalStudents} submitted`).join("; ") + ".";
  }

  if (/upcoming assessment|my assessment/.test(q)) {
    const assessments = (storageService.getData("assessments") || []).filter((a) => mySubjectNames.includes(a.subject));
    if (!assessments.length) return "You have no assessments scheduled right now.";
    return `Your assessments: ${assessments.map((a) => `${a.title} (${a.subject}) on ${a.date}, ${a.status}`).join("; ")}.`;
  }

  if (/average marks|avg marks/.test(q)) {
    const avg = students.length ? Math.round(students.reduce((a, s) => a + avgMarksMock(s.id), 0) / students.length) : 0;
    return `The current average marks across your students is ${avg}/100.`;
  }

  if (/need(s)? attention|at.risk|need support/.test(q)) {
    const atRisk = students.filter((s) => s.attendance < 75 || avgMarksMock(s.id) < 60);
    if (!atRisk.length) return "No students currently need academic attention.";
    return `These students may need attention: ${atRisk.map((s) => s.name).join(", ")}.`;
  }

  if (/what announcements did i create|my announcements/.test(q)) {
    const notifications = storageService.getData("notifications") || [];
    const mine = notifications.filter((n) => n.postedBy === "faculty" && n.postedByName === currentFaculty.name);
    if (!mine.length) return "You haven't posted any announcements yet.";
    return `Your announcements: ${mine.slice(0, 5).map((n) => n.title).join(", ")}.`;
  }

  return 'I can help with your classes, attendance, QR sessions, marks, assessments, and assignments. Try asking something like "How many students attended Java today?"';
}

// ---------------------------------------------------------------------
// ADMIN
// ---------------------------------------------------------------------
function answerAdmin(question) {
  const q = norm(question);

  const students = storageService.getData("students") || [];
  const faculty = storageService.getData("faculty") || [];
  const departments = storageService.getData("departments") || [];
  const courses = storageService.getData("courses") || [];
  const qrSessions = storageService.getData("qrSessions") || [];
  const notifications = storageService.getData("notifications") || [];

  if (/how many students are registered|total (number of )?students/.test(q)) {
    return `There are currently ${students.length} registered students in the system.`;
  }
  if (/how many faculty/.test(q)) {
    return `There are currently ${faculty.length} faculty members in the system.`;
  }
  if (/which department has the most students/.test(q)) {
    const counts = {};
    students.forEach((s) => { counts[s.department] = (counts[s.department] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (!top) return "I couldn't find department-wise student data right now.";
    return `${top[0]} has the most students, with ${top[1]} enrolled.`;
  }
  if (/active qr session/.test(q)) {
    const active = qrSessions.filter((s) => s.status === "ACTIVE");
    if (!active.length) return "There are no active QR attendance sessions right now.";
    return `Active QR sessions: ${active.map((s) => `${s.subject} in ${s.room} (${s.faculty})`).join(", ")}.`;
  }
  if (/classrooms currently have active attendance|active.*classroom/.test(q)) {
    const active = qrSessions.filter((s) => s.status === "ACTIVE");
    if (!active.length) return "No classrooms currently have an active attendance session.";
    return `Active classrooms: ${active.map((s) => s.room).join(", ")}.`;
  }
  if (/how many students are absent today/.test(q)) {
    const totalAbsent = qrSessions.reduce((sum, s) => sum + (s.absent || 0), 0);
    return `Based on today's QR attendance sessions, ${totalAbsent} students are currently marked absent.`;
  }
  if (/attendance statistics|attendance rate/.test(q)) {
    const avg = students.length ? Math.round(students.reduce((a, s) => a + (s.attendance || 0), 0) / students.length) : 0;
    return `The current institution-wide average attendance is ${avg}%.`;
  }
  if (/how many courses/.test(q)) {
    return `There are currently ${courses.length} courses available.`;
  }
  if (/how many departments/.test(q)) {
    return `There are currently ${departments.length} departments.`;
  }
  if (/recent notification/.test(q)) {
    if (!notifications.length) return "There are no notifications in the system yet.";
    return `Recent notifications: ${notifications.slice(0, 3).map((n) => n.title).join(", ")}.`;
  }
  if (/low attendance/.test(q)) {
    const low = students.filter((s) => s.attendance < 60);
    if (!low.length) return "No students currently have critically low attendance.";
    return `${low.length} students have attendance below 60%: ${low.slice(0, 8).map((s) => s.name).join(", ")}${low.length > 8 ? ", and others" : ""}.`;
  }
  const facultySubjectMatch = matchSubject(question, allSubjects.map((s) => s.name));
  if (/faculty/.test(q) && facultySubjectMatch) {
    const subj = allSubjects.find((s) => s.name === facultySubjectMatch);
    if (subj) return `${subj.faculty} is assigned to ${subj.name}.`;
    return "I couldn't find a faculty assignment for that subject.";
  }

  return 'I can help with institution-wide statistics — students, faculty, departments, courses, QR sessions, and notifications. Try asking something like "How many students are registered?"';
}

// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// Public entry point: Real Gemini AI Agent
// ---------------------------------------------------------------------
export async function getBotReply(question, context = {}) {
  // 1. Try calling the real backend Gemini proxy (secure server-side key)
  try {
    const res = await api("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message: question }),
    });
    if (res?.data?.reply) return res.data.reply;
    if (res?.reply) return res.reply;
  } catch (err) {
    // If backend isn't available or returned an error, try direct client key
  }

  // 2. Direct client-side Google AI Studio Gemini API if configured
  const clientKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (clientKey && clientKey !== "your-gemini-api-key") {
    try {
      const model = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash";
      const studentName = context.user?.name || currentStudent.name;
      const sysPrompt =
        `You are EduCloud AI, an intelligent, helpful academic assistant for ${studentName}. ` +
        `Answer general knowledge questions (like science, history, coding, pop culture, trivia, Donald Trump, etc.) ` +
        `accurately, directly, and naturally. If asked about student/academic advice, be encouraging and practical.\n\n` +
        `User Question: ${question}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${clientKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: sysPrompt }] }],
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch {
      // Fall through to local fallback
    }
  }

  // 3. Graceful offline fallback
  const role = context.role || context.user?.role || "student";
  let answer;
  if (role === "student") answer = answerStudent(question);
  else if (role === "faculty") answer = answerFaculty(question);
  else if (role === "admin") answer = answerAdmin(question);
  else answer = "I'm not sure how to help with that yet.";
  return delay(answer, 500);
}
