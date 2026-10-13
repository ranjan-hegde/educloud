# EduCloud Backend

Spring Boot 3.3.4 / Java 21 backend for the EduCloud Cloud-Based Student
Management System, built to plug directly into the existing React frontend
without any frontend changes.

## Quick start (no MySQL needed)

```bash
mvn clean install -DskipTests
mvn spring-boot:run "-Dspring-boot.run.profiles=demo"
```
(or just double-click `run-demo.bat` on Windows / run `./run-demo.sh` on Mac/Linux)

This runs against an in-memory H2 database and auto-seeds sample data, so it
works instantly. Data resets each time you stop the app. Then verify:

```bash
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@educloud.com\",\"password\":\"Admin@123\"}"
```
You should get `"success": true` and a JWT token. For real MySQL, see Setup below.

## Build notes

- **Lombok** is wired explicitly into `maven-compiler-plugin`
  (`annotationProcessorPaths` in `pom.xml`). Without that, javac never
  generates the getters/builders/constructors and you get hundreds of
  "cannot find symbol" errors. If you use an IDE, enable annotation
  processing and install the Lombok plugin (IntelliJ: Settings → Build →
  Compiler → Annotation Processors → Enable).
- `spring.jpa.open-in-view` is intentionally `true`: services map lazy
  relations (e.g. `student.getUser()`) to DTOs outside a transaction.
- Not yet verified end-to-end on my side (I could only syntax-check the
  sources, not run Maven or the tests). If `mvn clean install` still reports
  errors, send me the `[ERROR]` lines and I'll fix them.

## Architecture

```
Controller → Service → Repository → Database
```

- **entity/** — 25 JPA entities (User, Student, Faculty, Admin, Department,
  Course, SchoolClass, Subject, FacultySubjectAssignment, ClassStudent,
  Location, AttendanceSession, Attendance, Marks, Assessment, Assignment,
  AssignmentSubmission, Timetable, CourseMaterial, Announcement,
  Notification, Feedback, Fee, FeePayment, PasswordResetToken) plus enums.
  `Class` is modeled as `SchoolClass` (a Java-reserved-word-adjacent name),
  exposed to the frontend as the flat "BCA 5th Semester" string it expects.
- **repository/** — Spring Data JPA repositories, one per entity.
- **security/** — `JwtService` (generation/validation), `AppUserPrincipal` /
  `AppUserDetailsService` (Spring Security wiring), `JwtAuthenticationFilter`,
  `CurrentUserService` (**the only way controllers/services resolve "who is
  asking" — always from the verified JWT, never from a request parameter**),
  and JSON-formatted 401/403 handlers.
- **service/** — business logic, one service per domain area.
- **controller/** — REST endpoints, thin — delegate to services.
- **dto/** — request/response shapes, organized by domain (auth, admin,
  attendance, academic, profile, misc, fees, ai, common).
- **exception/** — custom exceptions + `GlobalExceptionHandler` producing
  the consistent `{success, message, data, timestamp}` envelope and correct
  HTTP status codes (400/401/403/404/409/500).
- **config/** — `SecurityConfig` (JWT filter chain, CORS, role rules),
  `JpaAuditingConfig`, `WebClientConfig` (Gemini), `WebMvcConfig` (serves
  uploaded files at `/uploads/**`).
- **seed/DataSeeder.java** — see below.

## Why sample data is a Java seeder, not `data.sql`

`src/main/resources/data.sql` is a placeholder explaining this: generating
~800 correctly-linked rows (with valid foreign keys, BCrypt-hashed
passwords, and realistic distributions) by hand in raw SQL is exactly the
kind of thing that silently drifts out of sync with the JPA schema.
`DataSeeder.java` (a `CommandLineRunner`) does it in real Java against the
real repositories instead, and only runs once — it checks
`if (userRepository.count() > 0) return;` — so it's safe to leave enabled.
Disable it with `SEED_ENABLED=false`.

It seeds: 1 admin, 5 faculty, 30 students, 3 departments, 3 classes
(BCA Sem 5, B.Sc CS Sem 3, B.Com Sem 4), 12 subjects, 3 locations, 40
attendance sessions (with one genuinely ACTIVE "right now" per run so QR
attendance is testable immediately), ~300 attendance records, ~100 marks
records, 15 assessments, 15 assignments, ~20 submissions, ~50 timetable
entries, 20 course materials, 20 announcements, ~50 notifications, 20
feedback records, and a fee record (+ payment where applicable) per student.

## Setup

### 1. Prerequisites
- Java 21
- Maven 3.9+
- MySQL 8+ running locally (or reachable)

### 2. Create the database
```sql
CREATE DATABASE educloud;
```
(Or just let it auto-create — `createDatabaseIfNotExist=true` is set in the
JDBC URL — as long as the configured user has permission to create databases.)

### 3. Configure environment
```bash
cp .env.example .env
# then edit .env with your real DB_PASSWORD, JWT_SECRET, MAIL_*, and
# (optionally) GEMINI_API_KEY
```
Spring reads `.env` automatically via `spring-dotenv`. Alternatively, export
the same variables in your shell/CI.

**Generate a real JWT secret** rather than using the default:
```bash
openssl rand -base64 48
```

### 4. Build and run
```bash
mvn clean install
mvn spring-boot:run
```

Backend runs at **http://localhost:8080**, API base **http://localhost:8080/api**.

### 5. Run tests
```bash
mvn test
```
Tests run against an in-memory H2 database (see
`src/test/resources/application.properties`) — no MySQL needed for testing.

## Connecting the existing React frontend

1. In the frontend, point API calls at `http://localhost:8080/api` (e.g. via
   `VITE_API_URL` if you introduce one, or directly in your axios/fetch
   base config — the frontend's existing `services/*.js` mock layer is the
   natural place to swap in real `fetch`/`axios` calls to these endpoints).
2. CORS is pre-configured for `http://localhost:5173` (Vite's default dev
   port) — change `CORS_ALLOWED_ORIGINS` in `.env` if your frontend runs
   elsewhere.
3. Store the JWT returned from `/api/auth/login` (e.g. in memory or
   `localStorage`/`sessionStorage` depending on "Remember me") and send it
   as `Authorization: Bearer <token>` on every subsequent request.
4. Response shape is always `{ success, message, data, timestamp }` — adjust
   the frontend's response-unwrapping accordingly.

## Default accounts (seeded)

| Role    | Email                | Password    |
|---------|----------------------|-------------|
| Admin   | admin@educloud.com   | Admin@123   |
| Faculty | faculty@educloud.com | Faculty@123 |
| Student | student@educloud.com | Student@123 |

(4 more faculty and 29 more students are seeded with generated emails —
see `DataSeeder.java` for the exact list, or just query
`GET /api/admin/students` / `/api/admin/faculty` once logged in as admin.)

## API documentation

Import `postman/EduCloud-API-Collection.json` into Postman — 121 requests
across 17 folders (Auth, Students, Faculty, Admin, QR Attendance,
Attendance, Marks, Assessments, Assignments, Timetable, Course Materials,
Announcements, Notifications, Feedback, Fees, Dashboards, AI Chatbot).
Logging in via the "Login" requests automatically saves the JWT into the
collection's `{{token}}` variable via a test script, so every other request
just works after that.

Every response follows:
```json
{ "success": true, "message": "Operation successful", "data": { ... }, "timestamp": "..." }
```
Errors:
```json
{ "success": false, "message": "Something went wrong", "timestamp": "..." }
```

## Security notes (what "never trust the frontend" means here, concretely)

- **Identity**: every controller/service gets the current user via
  `CurrentUserService`, which reads the Spring Security context — populated
  only from a verified, server-signed JWT. No endpoint accepts a userId/
  studentId/role from the request body to determine *who's asking* (path
  params like `/admin/students/{id}` are for *which record to act on*,
  always separately permission-checked).
- **QR attendance**: `QrAttendanceService.markAttendance()` runs all 12
  checks from the spec in order — session exists, token valid, not closed,
  correct date, within time window, class membership, subject/curriculum
  match, no duplicate (also enforced by a DB unique constraint on
  `(student_id, attendance_session_id)`), and real Haversine distance vs.
  the session's allowed radius using the coordinates the client's GPS sent
  — never a client-supplied "verified: true" flag.
- **Fees**: `FeeService.makePayment()` always clamps the charged amount to
  the fee's real outstanding balance from the database — a client can't
  inflate or fake the payment amount.
- **Marks**: `@Min(0)`/`@Max(30/70)` bean validation plus a
  faculty-must-be-assigned-to-the-subject check before any write.

## Known limitations / what to verify yourself

- **Not compiled or run by me** — see the warning at the top.
- Course-material and assignment file uploads are stored on local disk
  (`app.upload.dir`, default `./uploads`) and served back at `/uploads/**`
  — fine for a single-instance deployment/demo, not for a
  multi-instance/cloud deployment (swap in S3/GCS if you need that).
- Gemini AI chat gracefully falls back to a context-only canned reply if
  `GEMINI_API_KEY` isn't set, so the endpoint never hard-fails — but you'll
  want a real key for actual generated answers.
- Email sending fails silently by default (`MAIL_FAIL_SILENTLY=true`) so
  registration/reset flows don't break in local dev without real SMTP
  credentials configured — flip it to `false` once you've configured real
  SMTP and want failures to surface.
- The test suite covers the areas the spec called out (registration,
  login, JWT auth, role restrictions, QR session creation/expiry, duplicate
  attendance prevention, location validation, marks creation/validation,
  assignment submission, notifications, dashboards) but isn't
  exhaustive line-by-line coverage of every endpoint.
