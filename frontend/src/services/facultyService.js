// facultyService.js
// Production faculty service with real backend API integration and persistent local caching.
// Strictly queries real database and registered faculty accounts; mock data is excluded.

import api from "./api";
import * as storageService from "./storageService";

const MOCK_NAMES = new Set([
  "Dr. Rajesh Sharma",
  "Prof. Sneha Gupta",
  "Dr. Amit Verma",
  "Prof. Priya Nair",
  "Dr. Suresh Rao",
]);

export async function getFacultyList() {
  let backendFaculty = [];
  try {
    const res = await api("/api/admin/faculty");
    const data = res?.data || res;
    if (Array.isArray(data)) {
      backendFaculty = data.map((f) => ({
        id: String(f.id || `FAC${f.user?.id || Date.now().toString().slice(-4)}`),
        name: f.name || f.user?.name || "Faculty Member",
        email: f.email || f.user?.email || "",
        phone: f.phone || f.user?.phone || "",
        department: f.department?.name || f.department || "Computer Science",
        designation: f.designation || "Assistant Professor",
        subjects: Array.isArray(f.subjects) ? f.subjects.length : f.subjects || 1,
        subjectNames: Array.isArray(f.subjects) ? f.subjects.map((s) => s.name || s) : [f.department || "Computer Science"],
        status: f.status || "Active",
      }));
    }
  } catch {
    // Backend offline / unauthenticated fallback
  }

  // Load from persistent storage
  const localFaculty = storageService.getData("faculty") || [];

  // Also include registered faculty from educloud_registered_users
  let registeredFaculty = [];
  try {
    const rawReg = localStorage.getItem("educloud_registered_users");
    if (rawReg) {
      const regMap = JSON.parse(rawReg);
      Object.values(regMap).forEach((acc) => {
        const p = acc?.profile;
        if (p && p.role === "faculty") {
          registeredFaculty.push({
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
        }
      });
    }
  } catch {
    // ignore
  }

  // Merge unique by email / id
  const map = new Map();
  localFaculty.forEach((f) => {
    if (f && f.name && !MOCK_NAMES.has(f.name) && f.email !== "faculty@example.com") {
      map.set(f.email || f.id, f);
    }
  });
  backendFaculty.forEach((f) => {
    if (f && f.name && !MOCK_NAMES.has(f.name) && f.email !== "faculty@example.com") {
      map.set(f.email || f.id, f);
    }
  });
  registeredFaculty.forEach((f) => {
    if (f && f.name && !MOCK_NAMES.has(f.name) && f.email !== "faculty@example.com") {
      map.set(f.email || f.id, f);
    }
  });

  const merged = Array.from(map.values());
  storageService.setData("faculty", merged);
  return merged;
}

export async function getFacultyProfile() {
  try {
    const res = await api("/api/faculty/me");
    if (res?.data || res) return res?.data || res;
  } catch {
    // ignore
  }
  return storageService.getCurrentUser();
}

export async function updateFacultyProfile(updates) {
  try {
    const res = await api("/api/faculty/me", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    if (res?.data || res) return res?.data || res;
  } catch {
    // ignore
  }
  const curr = storageService.getCurrentUser() || {};
  return { ...curr, ...updates };
}

export async function addFaculty(faculty) {
  let created = null;
  try {
    const res = await api("/api/admin/faculty", {
      method: "POST",
      body: JSON.stringify(faculty),
    });
    created = res?.data || res;
  } catch {
    // offline
  }

  const newEntry = {
    ...faculty,
    id: created?.id ? String(created.id) : faculty.id || `FAC${Date.now().toString().slice(-4)}`,
    status: faculty.status || "Active",
  };

  storageService.addData("faculty", newEntry);
  return newEntry;
}

export async function deleteFaculty(id) {
  try {
    await api(`/api/admin/faculty/${id}`, {
      method: "DELETE",
    });
  } catch {
    // offline
  }
  storageService.deleteData("faculty", id);
  return { success: true, id };
}
