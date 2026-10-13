# EduCloud Frontend — Audit & Fix Change Log

## ⚠️ How this audit was done (please read first)

My sandbox has **no internet access**, so I could not run `npm install`,
start the Vite dev server, or click through the running app in a browser.
Everything below comes from a **thorough static code read**: tracing every
import, every state update, every handler, and every piece of mock data by
hand, plus automated scripts that verified every import/export pair and
every React hook usage across all 113 source files resolves correctly.

**What this means for you:**
- Every bug below is a real, concrete defect I found by reading the code —
  not a guess.
- I have **not** visually confirmed the fixes in a running browser. Please
  run `npm install && npm run dev` and smoke-test the flows listed under
  "How to verify" before treating this as final.
- The codebase was, overall, considerably better built than a typical
  "broken student project" — most pages, the auth system, and the QR/geo
  validation logic were already solid. The bugs below are the real
  exceptions, not evidence of wholesale brokenness.

---

## 1. Problems found (and fixed)

### 🔴 Critical — would crash or silently break a page/feature

1. **Admin → Faculty Management page crashed on load.**
   `src/pages/admin/Faculty.jsx` called `useState` five times but never
   imported it from `"react"`. This throws `ReferenceError: useState is not
   defined` and takes down the whole page.
2. **"Remember me" on Login did nothing.** The checkbox existed and toggled
   in the UI, but the value was never passed to `login()`, and
   `AuthContext` always wrote the session to `sessionStorage` — so a
   session never survived closing the browser even when the person checked
   "Remember me," and unchecking it made no difference either.
3. **QR Attendance was unusable out of the box.** Every seeded QR session
   (`src/data/mockData.js`) had a hardcoded date (`2026-08-29`). The
   session-validation logic correctly rejects attendance for any date that
   isn't "today" — so depending on when the app is actually opened, the
   demo "ACTIVE" session would immediately show "not active today" and
   attendance scanning would be impossible with zero setup.
4. **Settings page showed fake success messages.** Clicking "Save Changes"
   on Profile, Password, Notifications, Theme, or Language always showed
   "Settings saved successfully" — but:
   - Profile fields used `defaultValue` (uncontrolled) and were never
     written back anywhere.
   - Password fields had no `value`/`onChange` at all, and there was no
     validation (matching, minimum length, current password, confirm
     password) despite the spec requiring it.
   - Notification/theme/language preferences lived in plain `useState` and
     were lost on refresh — yet the success toast implied they were saved.
   This is a direct instance of "do not create fake success messages when
   an operation actually fails," called out explicitly in your brief.
5. **Duplicate IDs across ~11 CRUD "Create" handlers.** Every create
   handler (Students, Faculty, Departments/Courses/Subjects, QR sessions,
   Feedback, Course Materials, Tasks, Assessments, Requests, Assignments)
   generated new IDs from `list.length + 1`. As soon as any record is ever
   deleted, the next "new" record's generated ID collides with a
   still-existing record's ID.
6. **Duplicate attendance counting.** Faculty → Attendance had no guard
   against saving the same subject+date twice — every click on "Save
   Attendance" re-incremented the running present/absent/total counters,
   silently inflating attendance percentages.

### 🟠 High — wrong data shown, or a role seeing the wrong content

7. **Faculty → Notifications showed the STUDENT's notifications.** The page
   literally did `export default function FacultyNotifications() { return
   <StudentNotifications />; }` — which filters everything by the demo
   *student's* class. A faculty user's inbox was showing content scoped to
   a different role entirely.
8. **Admin "Compose Announcement" recipient targeting was decorative.**
   Choosing "All Students," "All Faculty," "Specific Department," or
   "Specific Course" had no effect — the created notification carried no
   audience information, so it reached every role's inbox regardless of
   what was selected.
9. **"Today's Classes" on the Student dashboard, Faculty dashboard, and the
   chatbot service all ignored the date.** They filtered QR sessions only
   by class/faculty name, so once bug #3's dates are fixed, stale sessions
   from other days would still show up as "today's classes."
10. **Faculty dashboard's "Assigned Students" count used a hardcoded
    literal** (`"BCA 5th Semester"`) instead of deriving it from the
    faculty's actual assigned subjects — would silently show the wrong
    number for any faculty not teaching that exact class.
11. **Faculty → Marks entry always showed the same 6 students** (
    `studentsList.slice(0, 6)`) for every subject, regardless of which
    class/course/semester the subject actually belongs to — and the
    "Semester"/"Class" fields next to it were hardcoded, non-functional
    dropdowns showing a fixed value no matter which subject was selected.
    The same fake, non-functional "Class" dropdown existed on Faculty →
    Attendance.
12. **Marks could be entered as negative or above the maximum.** The
    `max`/no lower bound on the Internal/External inputs was purely
    cosmetic (an HTML attribute with no enforcement in the change handler)
    — you could type `9999` into either field and it would be accepted and
    saved.
13. **Data inconsistency:** the course catalog listed `"B.Sc Computer
    Science"` while two students' records used `"B.Sc CS"` — a mismatched
    foreign-key-style relationship that would silently break any
    course-based filtering/targeting for those two students (including
    bug #8's fix, before this was corrected).

### 🟡 Lower severity — cleanup

14. Leftover `console.log("[feedback-debug] ...")` debug statements left in
    both Student and Faculty Feedback pages from a prior investigation.
15. The faculty "Assign Subjects" multi-select on Admin → Faculty
    Management had no `value`/`onChange` — selecting subjects did nothing
    and never affected the saved subject count.
16. QR session IDs were generated from a global session counter
    (`allSessions.length + 1`) rather than a per-date-safe sequence, which
    is the same "duplicate ID after delete" class of bug as #5, applied to
    session IDs specifically.

---

## 2. Fixes applied

- **`src/pages/admin/Faculty.jsx`** — added the missing `useState` import;
  wired the "Assign Subjects" multi-select to real state and derived the
  subject count from it; switched to the new safe ID generator.
- **`src/context/AuthContext.jsx`** — "Remember me" now actually chooses
  between `localStorage` (persists across browser restarts) and
  `sessionStorage` (current tab only); added `updateProfile()` so Settings
  can genuinely persist profile edits; session restore now checks both
  storages.
- **`src/pages/auth/Login.jsx`** — passes the `remember` checkbox value
  through to `login()`.
- **`src/data/mockData.js`** — QR sessions (`SES1001`–`SES1004`) now
  compute their `date`/`startTime`/`endTime` relative to the moment the
  app loads, so the ACTIVE session is always genuinely scannable right
  now, the SCHEDULED one is genuinely upcoming, and COMPLETED/CLOSED ones
  are genuinely in the past — regardless of what day the app is opened.
  Also fixed the `"B.Sc CS"` / `"B.Sc Computer Science"` naming mismatch.
- **`src/components/SettingsPage.jsx`** — Profile is now a controlled form
  that actually saves via `updateProfile()`; Password tab has real
  validation (required fields, 8+ characters, new ≠ current, confirm must
  match) and only shows success when validation passes; Notification/
  Theme/Language preferences now use `usePersistentState` so they actually
  survive a refresh.
- **`src/services/storageService.js`** — added `userPreferences` and
  `attendanceSavedLog` to the seed map to support the above fixes.
- **`src/utils/idGenerator.js`** *(new file)* — shared `nextId()` helper
  that derives the next ID from the highest numeric suffix actually in the
  list, never from `list.length`. Applied to: `EntityManager.jsx`,
  `admin/Students.jsx`, `admin/Faculty.jsx`, `admin/LocationManagement.jsx`,
  `student/Feedback.jsx`, `faculty/CourseMaterials.jsx`, `faculty/Tasks.jsx`,
  `faculty/Assessments.jsx`, `faculty/Requests.jsx`, `faculty/Assignments.jsx`.
- **`src/services/qrIdentity.js`** — added `nextSessionSequence()`, a
  per-date-safe sequence generator; applied in `admin/QRManagement.jsx` and
  `faculty/QRAttendance.jsx`.
- **`src/pages/faculty/Attendance.jsx`** — added a persisted
  `attendanceSavedLog` so saving the same subject+date twice updates
  statuses but no longer double-counts totals, with a visible warning
  banner when re-saving; replaced the fake "Class" dropdown with a
  read-only field derived from the actual subject.
- **`src/pages/faculty/Marks.jsx`** — roster is now filtered by the
  selected subject's actual course + semester instead of an arbitrary
  slice of all students; Internal/External inputs are now clamped
  (0–30 / 0–70) in the change handler itself, not just cosmetically;
  Semester/Class fields now reflect the real subject.
- **`src/pages/faculty/Dashboard.jsx`** — "Today's Classes" now filters by
  today's date, not just faculty name; "Assigned Students" is now derived
  from the faculty's real subjects' course/semester combinations.
- **`src/pages/student/Dashboard.jsx`** — "Today's Classes" now filters by
  today's date, not just class name.
- **`src/services/chatbotService.js`** — same "today's classes" date-filter
  fix applied to both the student- and faculty-side chatbot answers.
- **`src/utils/notificationVisibility.js`** *(new file)* — shared
  `isVisibleToStudent()` / `isVisibleToFaculty()` rules.
- **`src/pages/admin/Notifications.jsx`** — announcements now store the
  chosen `audience` (type + department/course target) and validate that a
  department/course was actually picked when required.
- **`src/pages/student/Notifications.jsx`** — now uses the shared
  audience-aware visibility helper instead of only checking `classId`.
- **`src/pages/faculty/Notifications.jsx`** — completely rewritten as a
  real, faculty-scoped page (previously just re-rendered the student page).
- **`src/pages/student/Feedback.jsx`** / **`src/pages/faculty/Feedback.jsx`**
  — removed leftover debug `console.log` statements.

---

## 3. Files modified

```
src/components/EntityManager.jsx
src/components/SettingsPage.jsx
src/context/AuthContext.jsx
src/data/mockData.js
src/pages/admin/Faculty.jsx
src/pages/admin/LocationManagement.jsx
src/pages/admin/Notifications.jsx
src/pages/admin/QRManagement.jsx
src/pages/admin/Students.jsx
src/pages/auth/Login.jsx
src/pages/faculty/Assessments.jsx
src/pages/faculty/Assignments.jsx
src/pages/faculty/Attendance.jsx
src/pages/faculty/CourseMaterials.jsx
src/pages/faculty/Dashboard.jsx
src/pages/faculty/Feedback.jsx
src/pages/faculty/Marks.jsx
src/pages/faculty/Notifications.jsx   (rewritten)
src/pages/faculty/QRAttendance.jsx
src/pages/faculty/Requests.jsx
src/pages/faculty/Tasks.jsx
src/pages/student/Dashboard.jsx
src/pages/student/Feedback.jsx
src/pages/student/Notifications.jsx
src/services/chatbotService.js
src/services/qrIdentity.js
src/services/storageService.js
```

## 4. New files created

```
src/utils/idGenerator.js
src/utils/notificationVisibility.js
CHANGELOG.md   (this file)
```

---

## 5. Features now working that weren't before

- Admin Faculty Management page loads at all (was a hard crash).
- "Remember me" on login genuinely controls session persistence.
- QR attendance sessions are scannable/testable the moment the app is
  opened, on any date.
- Settings → Profile edits actually persist and reflect elsewhere (e.g.
  the navbar avatar/name).
- Settings → Password change is properly validated before "succeeding."
- Settings → Notification/Theme/Language preferences survive a refresh.
- New records (students, faculty, departments, subjects, locations, QR
  sessions, feedback, materials, tasks, assessments, requests,
  assignments) get IDs that can never collide with an existing record's ID
  after a delete.
- Faculty Attendance can't silently double-count a day's attendance.
- Faculty's own Notifications inbox shows their own notifications, not the
  demo student's.
- Admin announcement recipient targeting (department/course/all) actually
  restricts who sees it.
- Marks entry shows the correct roster for the subject's actual class and
  clamps marks to valid ranges.
- Dashboards' "Today's Classes" genuinely reflect today, not just
  same-class/same-faculty sessions from any date.

## 6. Remaining limitations (not fixed in this pass — flagged, not hidden)

- **No automated browser verification.** As noted above, I could not run
  the dev server in this sandbox. Please smoke-test the flows below.
- **Faculty → Assignments** still lacks Edit/Delete/View-details and a
  delete confirmation (Create-only). The Student → Assignments page also
  doesn't yet show a "late submission" warning or a real file-picker
  preview for uploads. These are feature gaps, not defects I introduced,
  and were out of scope for this pass given the volume of confirmed bugs
  found elsewhere — happy to build these out next if useful.
  Only the ID-generation bug on that page was fixed.
- **`attendanceRecords` (Faculty → Attendance) is one shared roster**, not
  genuinely partitioned per subject — switching the Subject dropdown
  doesn't change which students appear. Fixing this properly means
  reshaping how attendance records are stored (keyed by subject), which is
  a bigger structural change than a bug fix; flagged for a follow-up pass.
- **Password changes are validated but not actually authenticated** against
  a real stored credential (there isn't one — auth is fully mocked with
  demo accounts). The Settings page is now honest about this in its
  copy rather than pretending otherwise.
- A few mock-data seams (e.g. `todaysClasses` export in `mockData.js`) are
  unused dead code left over from earlier iterations — harmless, not
  removed per your "don't remove existing mock data" instruction.
- No `/unauthorized` page exists; `ProtectedRoute` instead redirects a
  wrong-role user straight to their own dashboard, which is safe (never
  exposes another role's route) but not the dedicated "Unauthorized" page
  your brief mentions. Flagged as a minor spec-compliance gap rather than
  a functional bug.

---

## 7. Exact commands to run the project

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

## 8. Demo login credentials

| Role    | Email                  | Password   |
|---------|-------------------------|------------|
| Student | student@example.com    | demo1234   |
| Faculty | faculty@example.com    | demo1234   |
| Admin   | admin@example.com      | demo1234   |

(The Login page also has one-click "Student / Faculty / Admin" demo-fill
buttons that populate these for you.)

## 9. How to verify each role

**Student** — log in, check the Dashboard's "Today's Classes" card now
shows the live QR session; go to QR Attendance and confirm the ACTIVE
session can be scanned/marked; check Settings → Profile edits persist
after navigating away and back; check Notifications only shows things
relevant to your class/department.

**Faculty** — log in, go to QR Attendance and confirm you can Start/Close a
session; go to Marks and confirm the roster matches the selected subject's
actual class, and that typing marks above the max clamps automatically; go
to Attendance, save once, then save again for the same date and confirm
the "already recorded" banner appears and totals don't double-count; check
Notifications shows faculty-relevant items, not the student's.

**Admin** — go to Faculty Management and confirm the page loads (it
previously crashed) and that the "Assign Subjects" selector works; create
a new Student/Faculty/Department/Location, delete one, create another, and
confirm no ID collides with an existing one; compose an announcement
targeted at "Specific Department" and confirm only that department's
students see it.
