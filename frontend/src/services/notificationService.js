// notificationService.js — MOCK. Replace with real REST/WebSocket push later.
import { delay } from "./_utils";
import { notificationsList } from "../data/mockData";

export function getNotifications() {
  return delay(notificationsList);
}

export function markAsRead(id) {
  return delay({ success: true, id }, 300);
}

export function deleteNotification(id) {
  return delay({ success: true, id }, 300);
}

// Mock email/announcement dispatch — real email service (e.g. SES, SendGrid) later.
export function sendAnnouncement(payload) {
  return delay({ success: true, sentTo: payload.recipient, subject: payload.subject }, 1000);
}
