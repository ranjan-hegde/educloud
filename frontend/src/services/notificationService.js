// notificationService.js
// Production notification & announcement service with database persistence & real-time shared storage sync.

import api from "./api";
import * as storageService from "./storageService";
import { notificationsList } from "../data/mockData";

export async function getNotifications() {
  try {
    const res = await api("/api/notifications");
    const serverNotifications = (res?.data || res || []).map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      category: n.category ? n.category.charAt(0) + n.category.slice(1).toLowerCase() : "Announcements",
      time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently",
      read: n.isRead ?? n.read ?? false,
      priority: n.priority || "Normal",
    }));

    if (serverNotifications.length > 0) {
      // Sync into storage
      const local = storageService.getData("notifications") || [];
      const merged = [...serverNotifications];
      local.forEach((loc) => {
        if (!merged.some((m) => m.id === loc.id || (m.title === loc.title && m.message === loc.message))) {
          merged.push(loc);
        }
      });
      storageService.setData("notifications", merged);
      return merged;
    }
  } catch {
    // Backend offline / waking up — fallback to shared storage
  }

  const stored = storageService.getData("notifications");
  return stored && stored.length > 0 ? stored : notificationsList;
}

export async function markAsRead(id) {
  try {
    await api(`/api/notifications/${id}/read`, { method: "PUT" });
  } catch {
    // ignore backend error if offline
  }
  const current = storageService.getData("notifications") || [];
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  storageService.setData("notifications", updated);
  return { success: true, id };
}

export async function markAllAsRead() {
  try {
    await api("/api/notifications/read-all", { method: "PUT" });
  } catch {
    // ignore
  }
  const current = storageService.getData("notifications") || [];
  const updated = current.map((n) => ({ ...n, read: true }));
  storageService.setData("notifications", updated);
  return { success: true };
}

export async function deleteNotification(id) {
  try {
    await api(`/api/notifications/${id}`, { method: "DELETE" });
  } catch {
    // ignore
  }
  const current = storageService.getData("notifications") || [];
  const updated = current.filter((n) => n.id !== id);
  storageService.setData("notifications", updated);
  return { success: true, id };
}

/**
 * Publishes an announcement.
 * Writes to real backend POST /api/announcements (persisting into database and fanning out
 * notifications to students) AND updates shared local storage with custom update event.
 */
export async function sendAnnouncement(payload) {
  let backendSuccess = false;
  try {
    const audienceType = payload.audienceType || (payload.recipient === "All Faculty" ? "ALL_FACULTY" : "ALL_STUDENTS");
    await api("/api/announcements", {
      method: "POST",
      body: JSON.stringify({
        title: payload.title || payload.subject || "Campus Announcement",
        message: payload.message,
        category: (payload.category || "ANNOUNCEMENTS").toUpperCase(),
        audienceType: audienceType,
        audienceTarget: payload.audienceTarget || payload.class || "",
      }),
    });
    backendSuccess = true;
  } catch {
    // Backend offline fallback
  }

  const newEntry = {
    id: Date.now(),
    category: payload.category || "Announcements",
    title: payload.title || payload.subject || "Announcement",
    message: `${payload.message}${payload.subject && !payload.message.includes(payload.subject) ? ` (${payload.subject})` : ""}`,
    time: "Just now",
    read: false,
    postedBy: payload.postedBy || "faculty",
    postedByName: payload.postedByName || "Faculty",
    priority: payload.priority || "Normal",
    classId: payload.class || payload.classId || "All Classes",
    recipient: payload.recipient || "All Students",
    subject: payload.subject || "",
    persistedToDatabase: backendSuccess,
  };

  storageService.addData("notifications", newEntry);
  return { success: true, entry: newEntry, backendSuccess };
}
