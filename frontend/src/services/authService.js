// authService.js
// MOCK authentication service.
// TODO (Backend integration): replace with real calls to POST /api/auth/login,
// POST /api/auth/register, POST /api/auth/forgot-password, and JWT/session handling.

import { delay, mockError } from "./_utils";
import { currentStudent, currentFaculty, currentAdmin } from "../data/mockData";

const DEMO_ACCOUNTS = {
  "student@example.com": { password: "demo1234", profile: currentStudent },
  "faculty@example.com": { password: "demo1234", profile: currentFaculty },
  "admin@example.com": { password: "demo1234", profile: currentAdmin },
};

// Registered users (from the Register page) are persisted here for this
// frontend-only phase. A real backend/database will replace this later.
const REGISTERED_USERS_KEY = "educloud_registered_users";

function loadRegisteredUsers() {
  try {
    return JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveRegisteredUsers(users) {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

function findAccount(email) {
  const key = email.trim().toLowerCase();
  const registered = loadRegisteredUsers();
  return registered[key] || DEMO_ACCOUNTS[key] || null;
}

export function login({ email, password, role }) {
  if (!role) {
    return mockError("Please select your role.");
  }
  const account = findAccount(email);
  if (!account) {
    return mockError("No account found with this email.");
  }
  if (account.password !== password) {
    return mockError("Incorrect password.");
  }
  if (account.profile.role !== role) {
    const label = role.charAt(0).toUpperCase() + role.slice(1);
    return mockError(`This account is not registered as a ${label}.`);
  }
  return delay({ token: "mock-jwt-token", user: account.profile }, 700);
}

export function register(formData) {
  const key = formData.email.trim().toLowerCase();

  if (DEMO_ACCOUNTS[key] || loadRegisteredUsers()[key]) {
    return mockError("An account with this email already exists.");
  }

  const initials = formData.fullName
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const idPrefix = formData.role === "student" ? "STU" : formData.role === "faculty" ? "FAC" : "ADM";
  const uniqueId = `${idPrefix}${Date.now().toString().slice(-6)}`;

  const profile = {
    id: uniqueId,
    name: formData.fullName,
    email: key,
    phone: formData.phone,
    role: formData.role,
    department: formData.department,
    avatar: initials || "U",
    ...(formData.role === "student" && {
      studentId: formData.studentId || uniqueId,
      course: formData.course,
      semester: formData.semester ? `${formData.semester}th Semester` : "1st Semester",
      academicYear: "2026 - 2027",
      address: "",
      rollNo: formData.studentId || uniqueId,
    }),
    ...(formData.role === "faculty" && {
      designation: "Assistant Professor",
      subjects: [],
      experience: "Newly joined",
      qualification: "",
    }),
    ...(formData.role === "admin" && {
      designation: "Administrator",
    }),
  };

  const registered = loadRegisteredUsers();
  registered[key] = { password: formData.password, profile };
  saveRegisteredUsers(registered);

  return delay({ success: true, message: "Registration successful. You can now log in." }, 900);
}

export function forgotPassword(email) {
  return delay({ success: true, message: `Password reset instructions sent to ${email}.` }, 800);
}

export function logout() {
  return delay({ success: true }, 200);
}
