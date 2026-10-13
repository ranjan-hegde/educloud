# EduCloud — Cloud-Based Student Management System (Frontend — Phase 1)

A complete, professional, responsive React frontend for a cloud-based Student Management System with three role-based portals: **Student**, **Faculty**, and **Administrator**.

This is a **frontend-only** build. There is no backend, database, or real API — all data comes from `src/data/mockData.js` and mock service functions in `src/services/`. The codebase is structured so a real backend can be plugged in later without rebuilding the UI.

---

## 1. How to Run

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (typically `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## 2. Demo Login Accounts

On the login page, select a role first, then sign in with:

| Role    | Email                  | Password   |
|---------|-------------------------|-----------|
| Student | student@example.com    | demo1234  |
| Faculty | faculty@example.com    | demo1234  |
| Admin   | admin@example.com      | demo1234  |

Clicking the "Student" / "Faculty" / "Admin" quick-fill buttons on the login page automatically selects the matching role and fills these credentials.

You can also register a new account from the Register page — the account is stored in the browser's `localStorage` (mock, frontend-only) and can then be used to log in immediately with the same role, email, and password.

## 3. Folder Structure

```
src/
├── assets/            Static images/icons
├── components/         Reusable UI components (Navbar, Sidebar, DataTable, Modal, etc.)
│   └── attendance/      QR & location attendance building blocks
├── context/            AuthContext (mock session) and ToastContext (toast messages)
├── layouts/             AuthLayout, StudentLayout, FacultyLayout, AdminLayout
├── pages/
│   ├── auth/            Login, Register, Forgot Password
│   ├── student/          All student portal pages
│   ├── faculty/          All faculty portal pages
│   ├── admin/            All admin portal pages
│   └── common/           Landing page, 404
├── services/            Mock "API" layer — swap internals for real HTTP calls later
├── data/mockData.js     Central mock dataset for the whole app
├── routes/AppRoutes.jsx  All route definitions
└── styles/global.css     Tailwind layers + design tokens
```

## 4. Pages Implemented

**Public:** Landing page, Login, Register, Forgot Password

**Student:** Dashboard, Profile, Attendance, QR Attendance, Subjects (with course materials), Timetable, Results, Fees, Assessments, Assignments, Feedback (submit/edit/delete own feedback), Notifications, AI Chatbot, Settings

**Faculty:** Dashboard (with quick actions), Profile, My Classes, My Subjects, Students, Attendance (Present/Absent/Late + select-all), QR Attendance Management (start/close sessions, live attendance), Marks (feeds Student Results), Assessments (create/publish → visible to students), Assignments, Course Materials (→ visible under Student Subjects), Announcements (→ Student Notifications), Notifications, Student Performance (incl. at-risk identification), Student Feedback (read-only — filters, search, summary, NEW→READ status), Leave/Class Requests, Reports, Tasks & Activities, AI Assistant, Settings

**Admin:** Dashboard, Students (CRUD), Faculty (CRUD), Departments (CRUD), Courses (CRUD), Subjects (CRUD), Attendance (institution-wide), QR Attendance Management (create/open/close sessions, ACTIVE/SCHEDULED/COMPLETED/CLOSED tabs, view QR, view live attendance), Location Management (geofence configuration), Results Management, Timetable Management (CRUD), Notifications & Email Announcements, Reports (charts + export), AI Assistant, System Settings

## 5. Genuine QR Attendance System

- **Real, scannable QR codes** — generated with the `qrcode` library, one stable QR identity per subject (`services/qrIdentity.js`). The same QR image represents a subject across every session; only the session's date/time/location/status changes.
- **Real camera scanning** — the Student's "Scan QR Code" button uses `html5-qrcode` to request the device camera and decode actual QR codes (with a manual subject-code fallback if camera access isn't available).
- **Real GPS location validation** — `services/geoUtils.js` uses the browser's `navigator.geolocation` API and the Haversine formula to compute the actual distance between the student's device and the session's configured latitude/longitude, rejecting attendance outside the allowed radius. Admin → Locations has a "Use My Current Location" button that captures real device coordinates.
- **Full validation chain** (`services/qrAttendanceService.js`) — subject match, class assignment, session active, date match, time window, duplicate check, then GPS — mirrors what a real backend must independently re-verify.
- Faculty/Admin QR Attendance and Student QR Attendance all read the **same shared `qrSessions` and `studentAttendanceMarks`** storage, so starting/closing a session is reflected instantly on the student side.

## 6. Key Mock Features

- **Temporary data storage** — Students, Faculty, Departments, Courses, Subjects, Timetable, Locations, QR Sessions, Attendance, Notifications, and Assignments now persist to the browser's `localStorage` via a central `services/storageService.js` (with a `usePersistentState` hook wrapper). Changes made in one dashboard (e.g. Admin adding a student, or Faculty marking attendance) are immediately visible in the others, and survive page refresh. On first load, and after a reset, the storage seeds itself from the existing mock data — nothing is lost.
- **Reset Demo Data** — Admin → Settings → Data tab has a "Reset Demo Data" option (with confirmation) that clears the temporary storage and restores the original mock dataset. It does not affect your login account.
- **Smart, role-aware AI Chatbot** — `services/chatbotService.js` now reads live data from the same temporary storage the dashboards use, and answers differently per role (Student / Faculty / Admin), including subject-specific attendance questions, simple follow-up context ("What about Java?"), honest "I couldn't find that" responses instead of invented numbers, and role-based access denial for out-of-scope questions.

- **Authentication** — mock login/register/logout via `authService.js`, session persisted in `sessionStorage`.
- **QR Attendance workflow** — simulates the full validation chain: session active → class assignment → time window → location radius → duplicate check, via `qrAttendanceService.js`.
- **Location verification** — `locationService.js` returns simulated distance/radius checks; ready to be swapped for the browser Geolocation API.
- **AI Chatbot** — `chatbotService.js` returns canned responses to a fixed set of questions; ready to be swapped for a real LLM API call.
- **Email announcements** — `notificationService.sendAnnouncement()` simulates dispatch; no real email is sent.
- **All CRUD screens** (students, faculty, departments, courses, subjects, timetable, locations) operate on in-memory React state seeded from mock data — changes reset on page reload.

## 7. Where the Real Backend Connects Later

| Concern | Current mock | Replace with |
|---|---|---|
| Authentication | `services/authService.js` | Real `POST /api/auth/login`, JWT/session handling |
| Database | `data/mockData.js` | Real REST/GraphQL API responses |
| QR/location validation | `services/qrAttendanceService.js`, `services/locationService.js` | Server-side session, geofence (haversine), and time-window validation — never trust frontend-only checks |
| Email service | `services/notificationService.js` → `sendAnnouncement()` | Real provider (SES, SendGrid, etc.) via backend |
| AI Chatbot | `services/chatbotService.js` → `getBotReply()` | Real AI/LLM API via a secure backend proxy |
| Cloud deployment | — | AWS/Azure/GCP hosting, cloud storage, managed database |

## 8. Tech Stack

React 19 · React Router 7 · Tailwind CSS · Recharts · lucide-react icons · Vite · qrcode · html5-qrcode
