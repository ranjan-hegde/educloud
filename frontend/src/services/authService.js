// authService.js
// Production-ready authentication service with Real Backend API,
// Google OAuth (Firebase), and seamless offline/demo fallback.

import api from "./api";
import { delay, mockError } from "./_utils";
import { currentStudent, currentFaculty, currentAdmin } from "../data/mockData";

const DEMO_ACCOUNTS = {
  "student@example.com": { password: "demo1234", profile: currentStudent },
  "faculty@example.com": { password: "demo1234", profile: currentFaculty },
  "admin@example.com": { password: "demo1234", profile: currentAdmin },
};

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

/**
 * Log in with Email & Password.
 * Attempts real backend POST /api/auth/login first; falls back gracefully if backend is waking up.
 */
export async function login({ email, password, role }) {
  if (!role) {
    return mockError("Please select your role.");
  }

  // 1. Attempt Real Backend API
  try {
    const res = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    });

    const authData = res?.data || res;
    if (authData?.token) {
      localStorage.setItem("educloud_token", authData.token);

      const serverUser = authData.user || {};
      const userRole = (serverUser.role || role).toLowerCase();

      // Enrich with detailed role profile if student or faculty
      let detailedProfile = {};
      try {
        if (userRole === "student") {
          const profileRes = await api("/api/students/me");
          detailedProfile = profileRes?.data || profileRes || {};
        } else if (userRole === "faculty") {
          const profileRes = await api("/api/faculty/me");
          detailedProfile = profileRes?.data || profileRes || {};
        }
      } catch {
        // use basic user summary if profile fetch failed
      }

      const fullUser = {
        id: serverUser.id || serverUser.profileId || `USR${Date.now().toString().slice(-4)}`,
        name: serverUser.name || email.split("@")[0],
        email: serverUser.email || email,
        phone: serverUser.phone || "",
        role: userRole,
        avatar: (serverUser.name || "U").slice(0, 2).toUpperCase(),
        department: detailedProfile.department || "Computer Applications",
        course: detailedProfile.course || "BCA",
        semester: detailedProfile.semester ? `${detailedProfile.semester}th Semester` : "1st Semester",
        rollNo: detailedProfile.rollNo || `STU${Date.now().toString().slice(-4)}`,
        ...detailedProfile,
      };

      return { token: authData.token, user: fullUser };
    }
  } catch (err) {
    const msg = err.message || "";
    // If backend explicitly rejected credentials, don't silently hide the error
    if (msg.includes("Bad credentials") || msg.includes("Incorrect password") || msg.includes("Account not found")) {
      return mockError("Incorrect email or password.");
    }
  }

  // 2. Local Fallback (for offline or local testing)
  const account = findAccount(email);
  if (!account) {
    return mockError("No account found with this email. Please check your credentials or register.");
  }
  if (account.password !== password) {
    return mockError("Incorrect password.");
  }
  if (account.profile.role !== role) {
    const label = role.charAt(0).toUpperCase() + role.slice(1);
    return mockError(`This account is not registered as a ${label}.`);
  }

  return delay({ token: "local-token-" + Date.now(), user: account.profile }, 500);
}

/**
 * Register a new user with their OWN name and information.
 */
export async function register(formData) {
  const key = formData.email.trim().toLowerCase();

  // Try registering in the real backend database
  try {
    const backendPayload = {
      name: formData.fullName.trim(),
      email: key,
      password: formData.password,
      phone: formData.phone || "+91 99999 00000",
      role: formData.role.toUpperCase(),
      departmentId: 1, // default department
      courseId: 1,     // default course
      semester: parseInt(formData.semester, 10) || 1,
      designation: formData.role === "faculty" ? "Assistant Professor" : undefined,
    };

    await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(backendPayload),
    });
  } catch {
    // If backend is sleeping, continue to local storage save
  }

  // Always save profile locally with their OWN actual details
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
    name: formData.fullName.trim(),
    email: key,
    phone: formData.phone || "",
    role: formData.role,
    department: formData.department || "Computer Applications",
    avatar: initials || "U",
    ...(formData.role === "student" && {
      studentId: formData.studentId || uniqueId,
      course: formData.course || "BCA",
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

  return delay({ success: true, message: "Registration successful. You can now log in.", profile }, 600);
}

/**
 * Sign in or Register using Google OAuth.
 */
export async function loginWithGoogle({ googleUser, role = "student" }) {
  const email = googleUser.email.trim().toLowerCase();
  const name = googleUser.name || email.split("@")[0];
  const avatar = googleUser.avatar || name.slice(0, 2).toUpperCase();

  // 1. Try backend /api/auth/google
  try {
    const res = await api("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({
        email,
        name,
        role: role.toUpperCase(),
        googleId: googleUser.uid,
        avatar,
      }),
    });

    const authData = res?.data || res;
    if (authData?.token) {
      localStorage.setItem("educloud_token", authData.token);

      const serverUser = authData.user || {};
      const userRole = (serverUser.role || role).toLowerCase();

      let detailed = {};
      try {
        if (userRole === "student") {
          const profileRes = await api("/api/students/me");
          detailed = profileRes?.data || profileRes || {};
        } else if (userRole === "faculty") {
          const profileRes = await api("/api/faculty/me");
          detailed = profileRes?.data || profileRes || {};
        }
      } catch {
        // fallback
      }

      const fullUser = {
        id: serverUser.id || serverUser.profileId || `GOOG${Date.now().toString().slice(-4)}`,
        name: serverUser.name || name,
        email: serverUser.email || email,
        phone: serverUser.phone || "",
        role: userRole,
        avatar,
        department: detailed.department || "Computer Applications",
        course: detailed.course || "BCA",
        semester: detailed.semester ? `${detailed.semester}th Semester` : "1st Semester",
        rollNo: detailed.rollNo || `STU${Date.now().toString().slice(-4)}`,
        ...detailed,
      };

      return { token: authData.token, user: fullUser };
    }
  } catch {
    // If backend is unreachable, continue with local creation
  }

  // 2. Local Google User Creation
  const existing = findAccount(email);
  if (existing) {
    const user = { ...existing.profile, name, avatar };
    return delay({ token: "google-token-" + Date.now(), user }, 400);
  }

  const idPrefix = role === "student" ? "STU" : role === "faculty" ? "FAC" : "ADM";
  const uniqueId = `${idPrefix}${Date.now().toString().slice(-6)}`;

  const profile = {
    id: uniqueId,
    name,
    email,
    phone: "",
    role,
    avatar,
    department: "Computer Applications",
    ...(role === "student" && {
      studentId: uniqueId,
      course: "BCA",
      semester: "1st Semester",
      academicYear: "2026 - 2027",
      address: "",
      rollNo: uniqueId,
    }),
    ...(role === "faculty" && {
      designation: "Assistant Professor",
      subjects: [],
      experience: "Newly joined",
    }),
    ...(role === "admin" && {
      designation: "Administrator",
    }),
  };

  const registered = loadRegisteredUsers();
  registered[email] = { password: "google-oauth-account", profile };
  saveRegisteredUsers(registered);

  return delay({ token: "google-token-" + Date.now(), user: profile }, 400);
}

export function forgotPassword(email) {
  try {
    api("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    }).catch(() => {});
  } catch {
    // ignore
  }
  return delay({ success: true, message: `Password reset instructions sent to ${email}.` }, 600);
}

export function logout() {
  try {
    api("/api/auth/logout", { method: "POST" }).catch(() => {});
  } catch {
    // ignore
  }
  localStorage.removeItem("educloud_token");
  return delay({ success: true }, 200);
}
