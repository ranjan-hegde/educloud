// ============================================================
// MOCK DATA — src/data/mockData.js
// Central source of mock/demo data for the entire frontend.
// Replace with real API responses when the backend is connected.
// ============================================================

// ---------------- Date/time helpers for "live" demo data ----------------
// A handful of records below (QR attendance sessions) need to look and
// behave like they are happening RIGHT NOW, regardless of the actual date
// the app is opened on — otherwise every demo QR session would be dated to
// whatever day this file was written and instantly fail the "is this
// session active today?" check the moment a day passes.
function pad2(n) {
  return String(n).padStart(2, "0");
}
function isoDate(d) {
  // Match the exact same convention used everywhere else in the app
  // (qrAttendanceService.todayISO(), student/faculty QR pages, etc.) so a
  // session's seeded `date` always compares equal to "today" there too.
  return d.toISOString().slice(0, 10);
}
function fmtTime(d) {
  let h = d.getHours();
  const m = pad2(d.getMinutes());
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${pad2(h)}:${m} ${ampm}`;
}
function addMinutes(base, mins) {
  return new Date(base.getTime() + mins * 60000);
}
const _now = new Date();
const TODAY_ISO = isoDate(_now);

export const departments = [
  { id: "DEP01", name: "Computer Applications", head: "Dr. Meera Nair", faculty: 12, students: 240 },
  { id: "DEP02", name: "Computer Science", head: "Dr. Arvind Rao", faculty: 18, students: 360 },
  { id: "DEP03", name: "Commerce", head: "Dr. Latha Iyer", faculty: 9, students: 210 },
  { id: "DEP04", name: "Electronics", head: "Dr. Sanjay Verma", faculty: 10, students: 180 },
];

export const courses = [
  { id: "CRS01", name: "BCA", department: "Computer Applications", duration: "3 Years", students: 240 },
  { id: "CRS02", name: "B.Sc Computer Science", department: "Computer Science", duration: "3 Years", students: 220 },
  { id: "CRS03", name: "B.Com", department: "Commerce", duration: "3 Years", students: 210 },
  { id: "CRS04", name: "B.Tech ECE", department: "Electronics", duration: "4 Years", students: 180 },
];

export const subjects = [
  { id: "SUB01", name: "Java Programming", code: "BCA501", course: "BCA", semester: 5, credits: 4, faculty: "Dr. Ashok Kumar" },
  { id: "SUB02", name: "Database Management Systems", code: "BCA502", course: "BCA", semester: 5, credits: 4, faculty: "Dr. Ashok Kumar" },
  { id: "SUB03", name: "Cloud Computing", code: "BCA503", course: "BCA", semester: 5, credits: 3, faculty: "Prof. Anjali Singh" },
  { id: "SUB04", name: "Computer Networks", code: "BCA504", course: "BCA", semester: 5, credits: 3, faculty: "Prof. Anjali Singh" },
  { id: "SUB05", name: "Web Technologies", code: "BCA505", course: "BCA", semester: 5, credits: 4, faculty: "Dr. Ashok Kumar" },
  { id: "SUB06", name: "Operating Systems", code: "BCA401", course: "BCA", semester: 4, credits: 4, faculty: "Dr. Meera Nair" },
];

export const currentStudent = {
  id: "STU2301",
  name: "Rahul Sharma",
  email: "student@example.com",
  phone: "+91 98765 43210",
  role: "student",
  department: "Computer Applications",
  course: "BCA",
  semester: "5th Semester",
  academicYear: "2025 - 2026",
  address: "12, Lakeview Residency, Mysuru, Karnataka",
  avatar: "RS",
  rollNo: "BCA23-041",
  dob: "2004-03-18",
  bloodGroup: "O+",
  guardianName: "Suresh Sharma",
  guardianPhone: "+91 90000 11122",
};

export const currentFaculty = {
  id: "FAC1042",
  name: "Dr. Ashok Kumar",
  email: "faculty@example.com",
  phone: "+91 98123 45670",
  role: "faculty",
  department: "Computer Applications",
  designation: "Associate Professor",
  avatar: "AK",
  subjects: ["Java Programming", "Database Management Systems", "Web Technologies"],
  experience: "11 years",
  qualification: "Ph.D. in Computer Science",
};

export const currentAdmin = {
  id: "ADM001",
  name: "Priya Menon",
  email: "admin@example.com",
  phone: "+91 99887 65432",
  role: "admin",
  designation: "System Administrator",
  avatar: "PM",
};

export const studentsList = [
  { id: "STU2301", name: "Rahul Sharma", email: "rahul.sharma@educloud.edu", department: "Computer Applications", course: "BCA", semester: 5, attendance: 88, status: "Active", phone: "+91 98765 43210" },
  { id: "STU2302", name: "Priya Patel", email: "priya.patel@educloud.edu", department: "Computer Applications", course: "BCA", semester: 5, attendance: 94, status: "Active", phone: "+91 98765 43211" },
  { id: "STU2303", name: "Arun Das", email: "arun.das@educloud.edu", department: "Computer Applications", course: "BCA", semester: 5, attendance: 61, status: "Active", phone: "+91 98765 43212" },
  { id: "STU2304", name: "Sneha Reddy", email: "sneha.reddy@educloud.edu", department: "Computer Science", course: "B.Sc Computer Science", semester: 3, attendance: 79, status: "Active", phone: "+91 98765 43213" },
  { id: "STU2305", name: "Vikram Singh", email: "vikram.singh@educloud.edu", department: "Computer Science", course: "B.Sc Computer Science", semester: 3, attendance: 55, status: "Inactive", phone: "+91 98765 43214" },
  { id: "STU2306", name: "Ananya Iyer", email: "ananya.iyer@educloud.edu", department: "Commerce", course: "B.Com", semester: 1, attendance: 90, status: "Active", phone: "+91 98765 43215" },
  { id: "STU2307", name: "Karthik Menon", email: "karthik.menon@educloud.edu", department: "Electronics", course: "B.Tech ECE", semester: 7, attendance: 72, status: "Active", phone: "+91 98765 43216" },
  { id: "STU2308", name: "Divya Nair", email: "divya.nair@educloud.edu", department: "Computer Applications", course: "BCA", semester: 5, attendance: 96, status: "Active", phone: "+91 98765 43217" },
];

export const facultyList = [
  { id: "FAC1042", name: "Dr. Ashok Kumar", email: "ashok.kumar@educloud.edu", department: "Computer Applications", designation: "Associate Professor", subjects: 3, status: "Active" },
  { id: "FAC1043", name: "Prof. Anjali Singh", email: "anjali.singh@educloud.edu", department: "Computer Applications", designation: "Assistant Professor", subjects: 2, status: "Active" },
  { id: "FAC1044", name: "Dr. Meera Nair", email: "meera.nair@educloud.edu", department: "Computer Applications", designation: "HOD & Professor", subjects: 1, status: "Active" },
  { id: "FAC1045", name: "Dr. Arvind Rao", email: "arvind.rao@educloud.edu", department: "Computer Science", designation: "Professor", subjects: 2, status: "Active" },
  { id: "FAC1046", name: "Dr. Latha Iyer", email: "latha.iyer@educloud.edu", department: "Commerce", designation: "Associate Professor", subjects: 2, status: "On Leave" },
];

// ---------------- Attendance ----------------

export const attendanceSummary = {
  overall: 84,
  present: 101,
  absent: 19,
  total: 120,
};

export const subjectAttendance = [
  { subject: "Java Programming", total: 24, present: 22, absent: 2, percentage: 92, status: "Excellent" },
  { subject: "Database Management Systems", total: 22, present: 19, absent: 3, percentage: 86, status: "Good" },
  { subject: "Cloud Computing", total: 20, present: 15, absent: 5, percentage: 75, status: "Warning" },
  { subject: "Computer Networks", total: 21, present: 12, absent: 9, percentage: 57, status: "Critical" },
  { subject: "Web Technologies", total: 23, present: 21, absent: 2, percentage: 91, status: "Excellent" },
];

export const attendanceTrend = [
  { month: "Mar", percentage: 90 },
  { month: "Apr", percentage: 86 },
  { month: "May", percentage: 82 },
  { month: "Jun", percentage: 88 },
  { month: "Jul", percentage: 80 },
  { month: "Aug", percentage: 84 },
];

// ---------------- QR Attendance ----------------

export const todaysClasses = [
  {
    id: "CLS001",
    subject: "Java Programming",
    faculty: "Dr. Ashok Kumar",
    room: "Lab 2",
    location: "College Main Block - Lab 2",
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    allowedWindowEnd: "10:15 AM",
    class: "BCA 5th Semester",
    qrStatus: "ACTIVE",
    alreadyMarked: false,
  },
  {
    id: "CLS002",
    subject: "Database Management Systems",
    faculty: "Dr. Ashok Kumar",
    room: "Room 4B",
    location: "College Main Block - Room 4B",
    startTime: "11:15 AM",
    endTime: "12:15 PM",
    allowedWindowEnd: "11:30 AM",
    class: "BCA 5th Semester",
    qrStatus: "SCHEDULED",
    alreadyMarked: false,
  },
  {
    id: "CLS003",
    subject: "Cloud Computing",
    faculty: "Prof. Anjali Singh",
    room: "Lab 1",
    location: "College Main Block - Lab 1",
    startTime: "09:00 AM",
    endTime: "10:00 AM",
    allowedWindowEnd: "09:15 AM",
    class: "BCA 5th Semester",
    qrStatus: "CLOSED",
    alreadyMarked: true,
  },
];

export const qrAttendanceHistory = [
  { id: 1, subject: "Java Programming", date: "2026-08-24", time: "10:04 AM", status: "Present", location: "Verified" },
  { id: 2, subject: "Cloud Computing", date: "2026-08-24", time: "09:06 AM", status: "Present", location: "Verified" },
  { id: 3, subject: "Computer Networks", date: "2026-08-23", time: "--", status: "Absent", location: "--" },
  { id: 4, subject: "Web Technologies", date: "2026-08-23", time: "02:12 PM", status: "Present", location: "Verified" },
  { id: 5, subject: "Database Management Systems", date: "2026-08-22", time: "11:20 AM", status: "Present", location: "Verified" },
];

// Faculty-side QR sessions
// Dates/times are computed relative to the moment the app loads (see
// TODAY_ISO / _now above) so the ACTIVE session is genuinely scannable
// right now, the SCHEDULED one is genuinely upcoming, and the
// COMPLETED/CLOSED ones are genuinely in the past — no matter what day
// or time someone actually opens the app.
export const qrSessions = [
  {
    id: "SES1001",
    subject: "Java Programming",
    class: "BCA 5th Semester",
    faculty: "Dr. Ashok Kumar",
    room: "Lab 2",
    location: "College Main Block - Lab 2",
    latitude: "12.29588",
    longitude: "76.63941",
    radius: 50,
    date: TODAY_ISO,
    startTime: fmtTime(addMinutes(_now, -20)),
    endTime: fmtTime(addMinutes(_now, 40)),
    status: "ACTIVE",
    present: 32,
    absent: 8,
    total: 40,
  },
  {
    id: "SES1002",
    subject: "Database Management Systems",
    class: "BCA 5th Semester",
    faculty: "Dr. Ashok Kumar",
    room: "Room 4B",
    location: "College Main Block - Room 4B",
    latitude: "12.29601",
    longitude: "76.63958",
    radius: 40,
    date: TODAY_ISO,
    startTime: fmtTime(addMinutes(_now, 120)),
    endTime: fmtTime(addMinutes(_now, 180)),
    status: "SCHEDULED",
    present: 0,
    absent: 0,
    total: 40,
  },
  {
    id: "SES1003",
    subject: "Cloud Computing",
    class: "BCA 5th Semester",
    faculty: "Prof. Anjali Singh",
    room: "Lab 1",
    location: "College Main Block - Lab 1",
    latitude: "12.29581",
    longitude: "76.63929",
    radius: 50,
    date: TODAY_ISO,
    startTime: fmtTime(addMinutes(_now, -180)),
    endTime: fmtTime(addMinutes(_now, -120)),
    status: "COMPLETED",
    present: 36,
    absent: 4,
    total: 40,
  },
  {
    id: "SES1004",
    subject: "Computer Networks",
    class: "BCA 5th Semester",
    faculty: "Prof. Anjali Singh",
    room: "Room 2A",
    location: "College Main Block - Room 2A",
    latitude: "12.29570",
    longitude: "76.63912",
    radius: 40,
    date: TODAY_ISO,
    startTime: fmtTime(addMinutes(_now, -300)),
    endTime: fmtTime(addMinutes(_now, -240)),
    status: "CLOSED",
    present: 28,
    absent: 12,
    total: 40,
  },
];

export const liveAttendanceStudents = [
  { id: "STU2301", name: "Rahul Sharma", time: "10:12 AM", location: "Verified", status: "Present" },
  { id: "STU2302", name: "Priya Patel", time: "10:15 AM", location: "Verified", status: "Present" },
  { id: "STU2303", name: "Arun Das", time: "--", location: "--", status: "Absent" },
  { id: "STU2304", name: "Sneha Reddy", time: "10:09 AM", location: "Verified", status: "Present" },
  { id: "STU2305", name: "Vikram Singh", time: "--", location: "--", status: "Absent" },
  { id: "STU2308", name: "Divya Nair", time: "10:07 AM", location: "Verified", status: "Present" },
];

export const savedLocations = [
  { id: "LOC01", name: "College Main Block - Lab 1", room: "Lab 1", latitude: "12.29581", longitude: "76.63929", radius: 50 },
  { id: "LOC02", name: "College Main Block - Lab 2", room: "Lab 2", latitude: "12.29588", longitude: "76.63941", radius: 50 },
  { id: "LOC03", name: "College Main Block - Room 4B", room: "Room 4B", latitude: "12.29601", longitude: "76.63958", radius: 40 },
  { id: "LOC04", name: "College Main Block - Room 2A", room: "Room 2A", latitude: "12.29570", longitude: "76.63912", radius: 40 },
];

// ---------------- Timetable ----------------

export const timetable = {
  Monday: [
    { time: "09:00 - 10:00", subject: "Cloud Computing", faculty: "Prof. Anjali Singh", room: "Lab 1" },
    { time: "10:00 - 11:00", subject: "Java Programming", faculty: "Dr. Ashok Kumar", room: "Lab 2" },
    { time: "11:15 - 12:15", subject: "DBMS", faculty: "Dr. Ashok Kumar", room: "Room 4B" },
  ],
  Tuesday: [
    { time: "09:00 - 10:00", subject: "Computer Networks", faculty: "Prof. Anjali Singh", room: "Room 2A" },
    { time: "10:00 - 11:00", subject: "Web Technologies", faculty: "Dr. Ashok Kumar", room: "Lab 2" },
  ],
  Wednesday: [
    { time: "10:00 - 11:00", subject: "Java Programming", faculty: "Dr. Ashok Kumar", room: "Lab 2" },
    { time: "11:15 - 12:15", subject: "Cloud Computing", faculty: "Prof. Anjali Singh", room: "Lab 1" },
  ],
  Thursday: [
    { time: "09:00 - 10:00", subject: "DBMS", faculty: "Dr. Ashok Kumar", room: "Room 4B" },
    { time: "10:00 - 11:00", subject: "Computer Networks", faculty: "Prof. Anjali Singh", room: "Room 2A" },
  ],
  Friday: [
    { time: "10:00 - 11:00", subject: "Web Technologies", faculty: "Dr. Ashok Kumar", room: "Lab 2" },
    { time: "11:15 - 12:15", subject: "Java Programming", faculty: "Dr. Ashok Kumar", room: "Lab 2" },
  ],
  Saturday: [
    { time: "09:00 - 10:00", subject: "Cloud Computing (Lab)", faculty: "Prof. Anjali Singh", room: "Lab 1" },
  ],
};

// ---------------- Results ----------------

export const resultsData = {
  cgpa: 8.42,
  sgpa: 8.6,
  percentage: 81.4,
  semester: "5th Semester",
  subjectMarks: [
    { subject: "Java Programming", credits: 4, internal: 28, external: 62, total: 90, grade: "A+" },
    { subject: "Database Management Systems", credits: 4, internal: 24, external: 58, total: 82, grade: "A" },
    { subject: "Cloud Computing", credits: 3, internal: 22, external: 54, total: 76, grade: "B+" },
    { subject: "Computer Networks", credits: 3, internal: 20, external: 50, total: 70, grade: "B" },
    { subject: "Web Technologies", credits: 4, internal: 27, external: 60, total: 87, grade: "A" },
  ],
  semesterHistory: [
    { semester: "Sem 1", sgpa: 7.8 },
    { semester: "Sem 2", sgpa: 8.1 },
    { semester: "Sem 3", sgpa: 8.0 },
    { semester: "Sem 4", sgpa: 8.3 },
    { semester: "Sem 5", sgpa: 8.6 },
  ],
};

// Subject-wise marks for every completed semester, including the current one.
// Used by the Results page's "previous semester" selector.
export const pastSemesterResults = [
  {
    semester: "Sem 1",
    sgpa: 7.8,
    percentage: 74.2,
    subjectMarks: [
      { subject: "Programming Fundamentals", credits: 4, internal: 24, external: 52, total: 76, grade: "B+" },
      { subject: "Digital Electronics", credits: 3, internal: 22, external: 48, total: 70, grade: "B" },
      { subject: "Mathematics I", credits: 4, internal: 20, external: 50, total: 70, grade: "B" },
      { subject: "Communication Skills", credits: 2, internal: 26, external: 56, total: 82, grade: "A" },
      { subject: "Environmental Studies", credits: 2, internal: 25, external: 54, total: 79, grade: "A-" },
    ],
  },
  {
    semester: "Sem 2",
    sgpa: 8.1,
    percentage: 77.5,
    subjectMarks: [
      { subject: "Data Structures", credits: 4, internal: 26, external: 58, total: 84, grade: "A" },
      { subject: "Object Oriented Programming", credits: 4, internal: 25, external: 55, total: 80, grade: "A" },
      { subject: "Mathematics II", credits: 4, internal: 21, external: 49, total: 70, grade: "B" },
      { subject: "Computer Organization", credits: 3, internal: 23, external: 52, total: 75, grade: "B+" },
      { subject: "Professional Ethics", credits: 2, internal: 27, external: 58, total: 85, grade: "A+" },
    ],
  },
  {
    semester: "Sem 3",
    sgpa: 8.0,
    percentage: 76.4,
    subjectMarks: [
      { subject: "Operating Systems", credits: 4, internal: 24, external: 54, total: 78, grade: "A-" },
      { subject: "Database Management Systems", credits: 4, internal: 23, external: 53, total: 76, grade: "B+" },
      { subject: "Discrete Mathematics", credits: 3, internal: 20, external: 48, total: 68, grade: "B" },
      { subject: "Software Engineering", credits: 3, internal: 25, external: 55, total: 80, grade: "A" },
      { subject: "Java Programming", credits: 4, internal: 26, external: 56, total: 82, grade: "A" },
    ],
  },
  {
    semester: "Sem 4",
    sgpa: 8.3,
    percentage: 79.8,
    subjectMarks: [
      { subject: "Computer Networks", credits: 3, internal: 25, external: 55, total: 80, grade: "A" },
      { subject: "Design and Analysis of Algorithms", credits: 4, internal: 24, external: 56, total: 80, grade: "A" },
      { subject: "Web Technologies", credits: 4, internal: 27, external: 58, total: 85, grade: "A+" },
      { subject: "Theory of Computation", credits: 3, internal: 21, external: 50, total: 71, grade: "B+" },
      { subject: "Microprocessors", credits: 3, internal: 23, external: 52, total: 75, grade: "B+" },
    ],
  },
  {
    semester: "Sem 5",
    sgpa: 8.6,
    percentage: 81.4,
    subjectMarks: [
      { subject: "Java Programming", credits: 4, internal: 28, external: 62, total: 90, grade: "A+" },
      { subject: "Database Management Systems", credits: 4, internal: 24, external: 58, total: 82, grade: "A" },
      { subject: "Cloud Computing", credits: 3, internal: 22, external: 54, total: 76, grade: "B+" },
      { subject: "Computer Networks", credits: 3, internal: 20, external: 50, total: 70, grade: "B" },
      { subject: "Web Technologies", credits: 4, internal: 27, external: 60, total: 87, grade: "A" },
    ],
  },
];

// ---------------- Fees ----------------

export const feeStructure = {
  academicYear: "2026 - 2027",
  semester: "5th Semester",
  totalFee: 65000,
  paidAmount: 45000,
  dueAmount: 20000,
  dueDate: "2026-09-15",
  breakdown: [
    { head: "Tuition Fee", amount: 45000 },
    { head: "Examination Fee", amount: 5000 },
    { head: "Library Fee", amount: 3000 },
    { head: "Laboratory Fee", amount: 7000 },
    { head: "Development Fee", amount: 5000 },
  ],
};

export const feePaymentHistory = [
  { id: "RC1042", date: "2026-07-02", description: "5th Semester — Part Payment", amount: 25000, mode: "Online (UPI)", status: "Paid" },
  { id: "RC1027", date: "2026-06-10", description: "5th Semester — Registration Fee", amount: 20000, mode: "Online (Card)", status: "Paid" },
  { id: "RC0988", date: "2026-01-08", description: "4th Semester — Full Payment", amount: 62000, mode: "Net Banking", status: "Paid" },
  { id: "RC0931", date: "2025-08-05", description: "3rd Semester — Full Payment", amount: 60000, mode: "Online (UPI)", status: "Paid" },
];

// Institution-wide fee snapshot for the admin Fees page.
export const feeOverviewStats = {
  totalCollected: 4820000,
  totalDue: 612000,
  studentsFullyPaid: 312,
  studentsWithDues: 48,
};

// ---------------- Assignments ----------------

export const assignmentsList = [
  { id: "ASG01", title: "REST API Design Assignment", subject: "Web Technologies", dueDate: "2026-08-28", status: "Pending", submissions: 24, totalStudents: 40 },
  { id: "ASG02", title: "Normalization Case Study", subject: "Database Management Systems", dueDate: "2026-08-30", status: "Pending", submissions: 18, totalStudents: 40 },
  { id: "ASG03", title: "OOP Concepts Report", subject: "Java Programming", dueDate: "2026-08-20", status: "Submitted", submissions: 40, totalStudents: 40 },
  { id: "ASG04", title: "Cloud Deployment Model Comparison", subject: "Cloud Computing", dueDate: "2026-09-02", status: "Pending", submissions: 5, totalStudents: 40 },
];

// ---------------- Notifications ----------------

export const notificationsList = [
  { id: 1, category: "Attendance", title: "Low attendance warning", message: "Your attendance in Computer Networks has dropped below 60%.", time: "2 hours ago", read: false },
  { id: 2, category: "Results", title: "Semester results published", message: "Your 5th semester results have been published. Check the Results section.", time: "1 day ago", read: false },
  { id: 3, category: "Assignments", title: "New assignment posted", message: "Dr. Ashok Kumar posted a new assignment in Web Technologies.", time: "2 days ago", read: true },
  { id: 4, category: "Academic", title: "Class rescheduled", message: "Cloud Computing class on Friday moved to Lab 3.", time: "3 days ago", read: true },
  { id: 5, category: "Announcements", title: "College fest registrations open", message: "Register for TechFest 2026 before September 5th.", time: "4 days ago", read: true },
];

// ---------------- Chatbot ----------------

export const chatbotSuggestionsByRole = {
  student: [
    "What is my attendance?",
    "Show my timetable",
    "Show my results",
    "What assignments are pending?",
    "When is my next class?",
  ],
  faculty: [
    "Show today's classes",
    "How many students are present?",
    "Show absent students",
    "Is QR attendance active?",
    "Show low-attendance students",
  ],
  admin: [
    "How many students are registered?",
    "Show active QR sessions",
    "Show attendance statistics",
    "How many faculty are there?",
    "Show recent notifications",
  ],
};

export const chatbotResponses = {
  "what is my attendance": "Your overall attendance is 84% (101 out of 120 classes). Computer Networks is currently at 57% — please attend upcoming classes to stay above the 75% requirement.",
  "show my timetable": "You have Cloud Computing at 9:00 AM, Java Programming at 10:00 AM, and Database Management Systems at 11:15 AM today.",
  "what are my subjects": "Your current subjects are Java Programming, Database Management Systems, Cloud Computing, Computer Networks, and Web Technologies.",
  "when is my next class": "Your next class is Database Management Systems at 11:15 AM in Room 4B with Dr. Ashok Kumar.",
  "show my latest results": "Your latest SGPA is 8.6 with an overall CGPA of 8.42. Your highest score was in Java Programming (90/100, A+).",
  default: "I'm a demo assistant for now — once the real AI service is connected, I'll be able to answer detailed questions about your academic record.",
};

// ---------------- Reports (Admin) ----------------

export const reportStats = {
  totalStudents: 1240,
  totalFaculty: 86,
  totalCourses: 12,
  attendanceRate: 82,
};

export const departmentPerformance = [
  { department: "Computer Applications", avgAttendance: 86, avgResult: 78 },
  { department: "Computer Science", avgAttendance: 81, avgResult: 74 },
  { department: "Commerce", avgAttendance: 88, avgResult: 80 },
  { department: "Electronics", avgAttendance: 75, avgResult: 70 },
];

export const monthlyAttendanceTrend = [
  { month: "Mar", rate: 88 },
  { month: "Apr", rate: 85 },
  { month: "May", rate: 80 },
  { month: "Jun", rate: 83 },
  { month: "Jul", rate: 79 },
  { month: "Aug", rate: 82 },
];

// ---------------- Dashboard summaries ----------------

export const studentDashboardStats = {
  attendancePercentage: 84,
  totalSubjects: 5,
  upcomingClasses: 2,
  pendingAssignments: 3,
  unreadNotifications: 2,
};

export const facultyDashboardStats = {
  totalStudents: 160,
  totalSubjects: 3,
  todaysClasses: 3,
  pendingAssignments: 2,
  averageAttendance: 81,
};

export const adminDashboardStats = {
  totalStudents: 1240,
  totalFaculty: 86,
  totalCourses: 12,
  totalDepartments: 4,
  attendanceRate: 82,
  activeUsers: 342,
};

export const emailRecipientGroups = ["All Students", "All Faculty", "Specific Department", "Specific Course"];

// ---------------- Faculty workspace (Assessments, Materials, Announcements, Feedback, Requests) ----------------

export const assessmentsList = [
  { id: "ASM1001", title: "Internal Assessment 1", subject: "Java Programming", class: "BCA 5th Semester", type: "Internal Assessment", date: "2026-09-20", startTime: "10:00", duration: "60 mins", maxMarks: 50, instructions: "Cover Units 1-3. Bring your own calculator.", status: "Published" },
  { id: "ASM1002", title: "Unit Test — Normalization", subject: "Database Management Systems", class: "BCA 5th Semester", type: "Unit Test", date: "2026-09-25", startTime: "11:00", duration: "45 mins", maxMarks: 25, instructions: "Focus on 1NF-3NF and BCNF.", status: "Published" },
  { id: "ASM1003", title: "Practical — REST API", subject: "Web Technologies", class: "BCA 5th Semester", type: "Practical", date: "2026-09-30", startTime: "14:00", duration: "90 mins", maxMarks: 30, instructions: "Bring your laptop with Node.js installed.", status: "Unpublished" },
];

export const courseMaterialsList = [
  { id: "MAT1001", subject: "Java Programming", class: "BCA 5th Semester", title: "Unit 3 — Collections Framework Notes", description: "Covers List, Set, Map implementations with examples.", type: "Notes", date: "2026-08-20" },
  { id: "MAT1002", subject: "Database Management Systems", class: "BCA 5th Semester", title: "Normalization Slides", description: "Slide deck for 1NF through BCNF with worked examples.", type: "PDF", date: "2026-08-18" },
  { id: "MAT1003", subject: "Web Technologies", class: "BCA 5th Semester", title: "REST API Design — Recorded Lecture", description: "Walkthrough of designing RESTful endpoints.", type: "Video", date: "2026-08-22" },
];

export const feedbackList = [
  {
    id: "FB1001",
    studentId: "STU2301",
    studentName: "Rahul Sharma",
    classId: "BCA 5th Semester",
    subjectId: "SUB01",
    subjectName: "Java Programming",
    facultyId: "FAC1042",
    facultyName: "Dr. Ashok Kumar",
    category: "Teaching",
    rating: 4,
    message: "The explanations were clear and the practical examples helped me understand the concepts better.",
    date: "2026-08-15",
    status: "READ",
  },
  {
    id: "FB1002",
    studentId: "STU2301",
    studentName: "Rahul Sharma",
    classId: "BCA 5th Semester",
    subjectId: "SUB02",
    subjectName: "Database Management Systems",
    facultyId: "FAC1042",
    facultyName: "Dr. Ashok Kumar",
    category: "Course Material",
    rating: 5,
    message: "The normalization slides were very well organized and easy to follow.",
    date: "2026-08-22",
    status: "NEW",
  },
];

export const requestsList = [
  { id: "REQ1001", type: "Leave Request", date: "2026-09-05", reason: "Medical appointment", description: "Requesting leave for a half-day medical appointment.", status: "Pending" },
];

export const facultyTasksList = [
  { id: "TSK1001", title: "Review Java OOP assignment submissions", dueDate: "2026-09-03", status: "Pending" },
  { id: "TSK1002", title: "Prepare Internal Assessment 1 question paper", dueDate: "2026-09-15", status: "Pending" },
  { id: "TSK1003", title: "Post attendance summary for August", dueDate: "2026-08-31", status: "Completed" },
];
