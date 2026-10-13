package com.educloud.seed;

import com.educloud.entity.*;
import com.educloud.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;

/**
 * Seeds realistic sample data on first startup against an empty database:
 * 1 admin, 5 faculty, 30 students, 3 departments, 3 classes, 12 subjects,
 * ~40 attendance sessions, ~300 attendance records, ~100 marks records,
 * 15 assessments, 15 assignments, ~20 submissions, ~50 timetable entries,
 * 20 course materials, 20 announcements, ~50 notifications, 20 feedback
 * records, and a fee record per student.
 *
 * Runs via Java (not a raw data.sql) so every foreign key, unique
 * constraint, and BCrypt password hash is guaranteed valid — hand-written
 * INSERT statements for ~800 interlinked rows are exactly the kind of
 * thing that silently drifts out of sync with the schema.
 *
 * Idempotent: does nothing if any User already exists, so it only ever
 * seeds once against a genuinely empty database.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final AdminRepository adminRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final FacultySubjectAssignmentRepository assignmentRepository;
    private final ClassStudentRepository classStudentRepository;
    private final LocationRepository locationRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarksRepository marksRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssignmentRepository assignmentRepositoryEntity;
    private final AssignmentSubmissionRepository submissionRepository;
    private final TimetableRepository timetableRepository;
    private final CourseMaterialRepository courseMaterialRepository;
    private final AnnouncementRepository announcementRepository;
    private final NotificationRepository notificationRepository;
    private final FeedbackRepository feedbackRepository;
    private final FeeRepository feeRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    private final Random random = new Random(42);

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) return;
        if (userRepository.count() > 0) {
            log.info("Database already has data — skipping seed.");
            return;
        }
        log.info("Seeding EduCloud sample data...");

        List<Department> departments = seedDepartments();
        List<Course> courses = seedCourses(departments);
        List<SchoolClass> classes = seedClasses(courses);
        List<Subject> subjects = seedSubjects(classes);
        List<Faculty> facultyList = seedFaculty(departments);
        assignFacultyToSubjects(facultyList, subjects, classes);
        List<Student> students = seedStudents(departments, courses, classes);
        seedAdmin();
        List<Location> locations = seedLocations();
        List<AttendanceSession> sessions = seedAttendanceSessions(subjects, classes, facultyList, locations);
        seedAttendanceRecords(sessions, classes, students);
        seedMarks(students, subjects, classes, facultyList);
        List<Assessment> assessments = seedAssessments(subjects, classes, facultyList);
        List<Assignment> assignments = seedAssignments(subjects, classes, facultyList);
        seedSubmissions(assignments, classes, students);
        seedTimetable(classes, subjects, facultyList);
        seedCourseMaterials(subjects, facultyList);
        seedAnnouncements(students, facultyList);
        seedNotifications(students, facultyList);
        seedFeedback(students, facultyList, subjects);
        seedFees(students);

        log.info("EduCloud sample data seeded successfully.");
    }

    // ---------------- Departments / Courses / Classes / Subjects ----------------

    private List<Department> seedDepartments() {
        List<Department> list = new ArrayList<>();
        list.add(departmentRepository.save(Department.builder().name("Computer Applications").headName("Dr. Meera Nair").build()));
        list.add(departmentRepository.save(Department.builder().name("Computer Science").headName("Dr. Arvind Rao").build()));
        list.add(departmentRepository.save(Department.builder().name("Commerce").headName("Dr. Latha Iyer").build()));
        return list;
    }

    private List<Course> seedCourses(List<Department> departments) {
        List<Course> list = new ArrayList<>();
        list.add(courseRepository.save(Course.builder().name("BCA").department(departments.get(0)).duration("3 Years").build()));
        list.add(courseRepository.save(Course.builder().name("B.Sc Computer Science").department(departments.get(1)).duration("3 Years").build()));
        list.add(courseRepository.save(Course.builder().name("B.Com").department(departments.get(2)).duration("3 Years").build()));
        return list;
    }

    private List<SchoolClass> seedClasses(List<Course> courses) {
        List<SchoolClass> list = new ArrayList<>();
        list.add(schoolClassRepository.save(SchoolClass.builder().course(courses.get(0)).semester(5).section("A").build()));
        list.add(schoolClassRepository.save(SchoolClass.builder().course(courses.get(1)).semester(3).section("A").build()));
        list.add(schoolClassRepository.save(SchoolClass.builder().course(courses.get(2)).semester(4).section("A").build()));
        return list;
    }

    private List<Subject> seedSubjects(List<SchoolClass> classes) {
        String[][] namesBySubjectPerClass = {
                {"Java Programming", "Database Management Systems", "Computer Networks", "Cloud Computing"},
                {"Data Structures", "Operating Systems", "Discrete Mathematics", "Web Technologies"},
                {"Financial Accounting", "Business Statistics", "Corporate Law", "Marketing Management"}
        };
        String[] codePrefixes = {"CA", "CS", "COM"};

        List<Subject> list = new ArrayList<>();
        for (int c = 0; c < classes.size(); c++) {
            SchoolClass sc = classes.get(c);
            for (int i = 0; i < namesBySubjectPerClass[c].length; i++) {
                Subject subject = Subject.builder()
                        .name(namesBySubjectPerClass[c][i])
                        .code(codePrefixes[c] + (301 + i))
                        .course(sc.getCourse())
                        .semester(sc.getSemester())
                        .credits(4)
                        .build();
                list.add(subjectRepository.save(subject));
            }
        }
        return list;
    }

    // ---------------- Faculty ----------------

    private List<Faculty> seedFaculty(List<Department> departments) {
        String[][] facultyData = {
                {"Dr. Ashok Kumar", "faculty@educloud.com", "Associate Professor"},
                {"Prof. Anjali Singh", "anjali.singh@educloud.com", "Assistant Professor"},
                {"Dr. Ramesh Gupta", "ramesh.gupta@educloud.com", "Professor"},
                {"Prof. Kavita Rao", "kavita.rao@educloud.com", "Assistant Professor"},
                {"Dr. Suresh Menon", "suresh.menon@educloud.com", "Associate Professor"},
        };
        List<Faculty> list = new ArrayList<>();
        for (int i = 0; i < facultyData.length; i++) {
            User user = userRepository.save(User.builder()
                    .name(facultyData[i][0]).email(facultyData[i][1])
                    .passwordHash(passwordEncoder.encode("Faculty@123"))
                    .phone("+91 90000 000" + (10 + i)).role(Role.FACULTY).enabled(true).build());
            Faculty faculty = Faculty.builder()
                    .user(user).department(departments.get(i % departments.size()))
                    .designation(facultyData[i][2]).qualification("Ph.D.").experience((5 + i) + " years")
                    .status(Faculty.FacultyStatus.ACTIVE)
                    .build();
            list.add(facultyRepository.save(faculty));
        }
        return list;
    }

    private void assignFacultyToSubjects(List<Faculty> faculty, List<Subject> subjects, List<SchoolClass> classes) {
        for (int i = 0; i < subjects.size(); i++) {
            Subject subject = subjects.get(i);
            SchoolClass schoolClass = classes.stream()
                    .filter(c -> c.getCourse().getId().equals(subject.getCourse().getId()) && c.getSemester().equals(subject.getSemester()))
                    .findFirst().orElseThrow();
            Faculty assigned = faculty.get(i % faculty.size());
            assignmentRepository.save(FacultySubjectAssignment.builder()
                    .faculty(assigned).subject(subject).schoolClass(schoolClass).build());
        }
    }

    // ---------------- Students ----------------

    private List<Student> seedStudents(List<Department> departments, List<Course> courses, List<SchoolClass> classes) {
        String[] firstNames = {"Rahul", "Priya", "Amit", "Sneha", "Vikram", "Divya", "Karan", "Anita", "Rohit", "Pooja",
                "Arjun", "Neha", "Sanjay", "Kavya", "Manoj", "Ritu", "Deepak", "Swati", "Nikhil", "Meera",
                "Varun", "Shreya", "Abhishek", "Pallavi", "Gaurav", "Isha", "Siddharth", "Tanvi", "Harsh", "Ananya"};
        String[] lastNames = {"Sharma", "Reddy", "Patel", "Iyer", "Singh", "Nair", "Kumar", "Gupta", "Rao", "Verma"};

        List<Student> list = new ArrayList<>();
        int perClass = firstNames.length / classes.size();
        for (int i = 0; i < firstNames.length; i++) {
            int classIndex = Math.min(i / perClass, classes.size() - 1);
            SchoolClass schoolClass = classes.get(classIndex);
            String name = firstNames[i] + " " + lastNames[i % lastNames.length];
            String email = i == 0 ? "student@educloud.com" : (firstNames[i] + "." + lastNames[i % lastNames.length] + i + "@educloud.edu").toLowerCase(Locale.ROOT);

            User user = userRepository.save(User.builder()
                    .name(name).email(email).passwordHash(passwordEncoder.encode("Student@123"))
                    .phone("+91 98765 " + String.format("%05d", 40000 + i)).role(Role.STUDENT).enabled(true).build());

            Student student = studentRepository.save(Student.builder()
                    .user(user).department(schoolClass.getCourse().getDepartment()).course(schoolClass.getCourse())
                    .semester(schoolClass.getSemester()).status(Student.StudentStatus.ACTIVE)
                    .academicYear("2026-2027").bloodGroup(randomBloodGroup())
                    .guardianName(lastNames[(i + 1) % lastNames.length] + " " + firstNames[(i + 3) % firstNames.length])
                    .guardianPhone("+91 91234 " + String.format("%05d", 50000 + i))
                    .build());
            student.setRollNo("STU" + (2300 + student.getId()));
            student = studentRepository.save(student);
            list.add(student);

            classStudentRepository.save(ClassStudent.builder().student(student).schoolClass(schoolClass).build());
        }
        return list;
    }

    private String randomBloodGroup() {
        String[] groups = {"A+", "A-", "B+", "B-", "O+", "O-", "AB+"};
        return groups[random.nextInt(groups.length)];
    }

    private void seedAdmin() {
        User user = userRepository.save(User.builder()
                .name("Sunita Desai").email("admin@educloud.com")
                .passwordHash(passwordEncoder.encode("Admin@123"))
                .phone("+91 90000 00001").role(Role.ADMIN).enabled(true).build());
        adminRepository.save(Admin.builder().user(user).designation("System Administrator").build());
    }

    // ---------------- Locations ----------------

    private List<Location> seedLocations() {
        List<Location> list = new ArrayList<>();
        list.add(locationRepository.save(Location.builder().name("Main Block - Lab 1").room("Lab 1")
                .latitude(12.29581).longitude(76.63929).radiusMeters(50).build()));
        list.add(locationRepository.save(Location.builder().name("Main Block - Lab 2").room("Lab 2")
                .latitude(12.29588).longitude(76.63941).radiusMeters(50).build()));
        list.add(locationRepository.save(Location.builder().name("Main Block - Room 4B").room("Room 4B")
                .latitude(12.29601).longitude(76.63958).radiusMeters(40).build()));
        return list;
    }

    // ---------------- Attendance sessions + records ----------------

    private List<AttendanceSession> seedAttendanceSessions(List<Subject> subjects, List<SchoolClass> classes,
                                                             List<Faculty> facultyList, List<Location> locations) {
        List<AttendanceSession> list = new ArrayList<>();
        LocalDate today = LocalDate.now();
        int sessionCount = 40;
        for (int i = 0; i < sessionCount; i++) {
            Subject subject = subjects.get(i % subjects.size());
            SchoolClass schoolClass = classes.stream()
                    .filter(c -> c.getCourse().getId().equals(subject.getCourse().getId()) && c.getSemester().equals(subject.getSemester()))
                    .findFirst().orElseThrow();
            Faculty faculty = assignmentRepository.findBySubjectAndSchoolClass(subject, schoolClass).stream()
                    .findFirst().map(FacultySubjectAssignment::getFaculty).orElse(facultyList.get(i % facultyList.size()));
            Location location = locations.get(i % locations.size());

            // Spread sessions across the last 13 days, with the very last one "live" for demo purposes.
            LocalDate date = today.minusDays(sessionCount - 1 - i);
            SessionStatus status;
            LocalTime start, end;
            if (date.isEqual(today)) {
                status = SessionStatus.ACTIVE;
                start = LocalTime.now().minusMinutes(15);
                end = LocalTime.now().plusMinutes(45);
            } else if (date.isAfter(today)) {
                status = SessionStatus.SCHEDULED;
                start = LocalTime.of(10, 0);
                end = LocalTime.of(11, 0);
            } else {
                status = SessionStatus.COMPLETED;
                start = LocalTime.of(9 + (i % 6), 0);
                end = start.plusHours(1);
            }

            AttendanceSession session = AttendanceSession.builder()
                    .subject(subject).schoolClass(schoolClass).faculty(faculty).location(location)
                    .date(date).startTime(start).endTime(end).radiusMeters(location.getRadiusMeters())
                    .qrToken(com.educloud.util.TokenGenerator.qrToken()).status(status)
                    .build();
            list.add(sessionRepository.save(session));
        }
        return list;
    }

    private void seedAttendanceRecords(List<AttendanceSession> sessions, List<SchoolClass> classes, List<Student> students) {
        for (AttendanceSession session : sessions) {
            List<Student> classStudents = students.stream()
                    .filter(s -> s.getCourse().getId().equals(session.getSchoolClass().getCourse().getId())
                            && s.getSemester().equals(session.getSchoolClass().getSemester()))
                    .toList();
            // Mark ~75-80% of the class per session, mirroring a realistic attendance rate.
            for (Student student : classStudents) {
                if (random.nextInt(100) >= 22) { // ~78% present overall
                    boolean late = random.nextInt(100) < 8;
                    Attendance attendance = Attendance.builder()
                            .student(student).session(session)
                            .status(late ? AttendanceStatus.LATE : AttendanceStatus.PRESENT)
                            .markedBy(MarkedBy.QR)
                            .scanTime(session.getDate().atTime(session.getStartTime()).plusMinutes(random.nextInt(10)))
                            .studentLatitude(session.getLocation().getLatitude())
                            .studentLongitude(session.getLocation().getLongitude())
                            .distanceMeters((double) random.nextInt(30))
                            .build();
                    attendanceRepository.save(attendance);
                } else {
                    attendanceRepository.save(Attendance.builder()
                            .student(student).session(session).status(AttendanceStatus.ABSENT)
                            .markedBy(MarkedBy.MANUAL).scanTime(null).build());
                }
            }
        }
    }

    // ---------------- Marks ----------------

    private void seedMarks(List<Student> students, List<Subject> subjects, List<SchoolClass> classes, List<Faculty> facultyList) {
        for (Student student : students) {
            List<Subject> mySubjects = subjects.stream()
                    .filter(s -> s.getCourse().getId().equals(student.getCourse().getId()) && s.getSemester().equals(student.getSemester()))
                    .toList();
            for (Subject subject : mySubjects) {
                if (random.nextInt(100) < 15) continue; // leave a few ungraded, matching a realistic in-progress semester
                Faculty enteredBy = assignmentRepository.findBySubjectAndSchoolClass(subject,
                        classes.stream().filter(c -> c.getCourse().getId().equals(subject.getCourse().getId()) && c.getSemester().equals(subject.getSemester())).findFirst().orElseThrow())
                        .stream().findFirst().map(FacultySubjectAssignment::getFaculty).orElse(facultyList.get(0));
                marksRepository.save(Marks.builder()
                        .student(student).subject(subject).semester(student.getSemester())
                        .internal(18 + random.nextInt(13)).external(35 + random.nextInt(36))
                        .enteredBy(enteredBy)
                        .build());
            }
        }
    }

    // ---------------- Assessments / Assignments / Submissions ----------------

    private List<Assessment> seedAssessments(List<Subject> subjects, List<SchoolClass> classes, List<Faculty> facultyList) {
        String[] types = {"Internal Assessment", "Unit Test", "Practical Exam"};
        List<Assessment> list = new ArrayList<>();
        for (int i = 0; i < 15; i++) {
            Subject subject = subjects.get(i % subjects.size());
            SchoolClass schoolClass = classes.stream()
                    .filter(c -> c.getCourse().getId().equals(subject.getCourse().getId()) && c.getSemester().equals(subject.getSemester()))
                    .findFirst().orElseThrow();
            Faculty faculty = assignmentRepository.findBySubjectAndSchoolClass(subject, schoolClass)
                    .stream().findFirst().map(FacultySubjectAssignment::getFaculty).orElse(facultyList.get(i % facultyList.size()));
            list.add(assessmentRepository.save(Assessment.builder()
                    .title(types[i % types.length] + " " + (i / types.length + 1))
                    .subject(subject).schoolClass(schoolClass).faculty(faculty)
                    .type(types[i % types.length]).date(LocalDate.now().plusDays(5 + i))
                    .startTime(LocalTime.of(10, 0)).duration("60 mins").maxMarks(50)
                    .instructions("Cover all units discussed till date.")
                    .status(AssessmentStatus.PUBLISHED)
                    .build()));
        }
        return list;
    }

    private List<Assignment> seedAssignments(List<Subject> subjects, List<SchoolClass> classes, List<Faculty> facultyList) {
        List<Assignment> list = new ArrayList<>();
        for (int i = 0; i < 15; i++) {
            Subject subject = subjects.get(i % subjects.size());
            SchoolClass schoolClass = classes.stream()
                    .filter(c -> c.getCourse().getId().equals(subject.getCourse().getId()) && c.getSemester().equals(subject.getSemester()))
                    .findFirst().orElseThrow();
            Faculty faculty = assignmentRepository.findBySubjectAndSchoolClass(subject, schoolClass)
                    .stream().findFirst().map(FacultySubjectAssignment::getFaculty).orElse(facultyList.get(i % facultyList.size()));
            list.add(assignmentRepositoryEntity.save(Assignment.builder()
                    .title(subject.getName() + " Assignment " + (i / subjects.size() + 1))
                    .subject(subject).schoolClass(schoolClass).faculty(faculty)
                    .description("Complete the exercises covered in the last two weeks of " + subject.getName() + ".")
                    .dueDate(LocalDate.now().plusDays(3 + i)).status(AssignmentStatus.PENDING)
                    .build()));
        }
        return list;
    }

    private void seedSubmissions(List<Assignment> assignments, List<SchoolClass> classes, List<Student> students) {
        int created = 0;
        for (Assignment assignment : assignments) {
            List<Student> classStudents = students.stream()
                    .filter(s -> s.getCourse().getId().equals(assignment.getSchoolClass().getCourse().getId())
                            && s.getSemester().equals(assignment.getSchoolClass().getSemester()))
                    .toList();
            for (Student student : classStudents) {
                if (created >= 20) return;
                if (random.nextInt(100) < 20) {
                    submissionRepository.save(AssignmentSubmission.builder()
                            .assignment(assignment).student(student)
                            .submittedAt(LocalDateTime.now().minusDays(random.nextInt(3)))
                            .fileUrl(null).fileName(student.getRollNo() + "_submission.pdf")
                            .status(SubmissionStatus.SUBMITTED)
                            .build());
                    created++;
                }
            }
        }
    }

    // ---------------- Timetable ----------------

    private void seedTimetable(List<SchoolClass> classes, List<Subject> subjects, List<Faculty> facultyList) {
        DayOfWeek[] days = {DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY};
        LocalTime[] slots = {LocalTime.of(9, 0), LocalTime.of(10, 0), LocalTime.of(11, 15), LocalTime.of(13, 0)};
        String[] rooms = {"Room 101", "Room 102", "Lab 1", "Lab 2"};

        for (SchoolClass schoolClass : classes) {
            List<Subject> classSubjects = subjects.stream()
                    .filter(s -> s.getCourse().getId().equals(schoolClass.getCourse().getId()) && s.getSemester().equals(schoolClass.getSemester()))
                    .toList();
            int slotIndex = 0;
            for (DayOfWeek day : days) {
                int periodsToday = (slotIndex % 2 == 0) ? 4 : 3;
                for (int p = 0; p < periodsToday && p < slots.length; p++) {
                    Subject subject = classSubjects.get((slotIndex + p) % classSubjects.size());
                    Faculty faculty = assignmentRepository.findBySubjectAndSchoolClass(subject, schoolClass)
                            .stream().findFirst().map(FacultySubjectAssignment::getFaculty).orElse(facultyList.get(0));
                    timetableRepository.save(Timetable.builder()
                            .schoolClass(schoolClass).subject(subject).faculty(faculty)
                            .dayOfWeek(day).startTime(slots[p]).endTime(slots[p].plusMinutes(50))
                            .room(rooms[p % rooms.length])
                            .build());
                }
                slotIndex++;
            }
        }
    }

    // ---------------- Course materials ----------------

    private void seedCourseMaterials(List<Subject> subjects, List<Faculty> facultyList) {
        String[] types = {"Notes", "PDF", "Video", "Link", "Study Material"};
        int count = 0;
        for (Subject subject : subjects) {
            int materialsForSubject = (count < 8) ? 2 : 1; // first 8 subjects get 2, rest get 1 -> 20 total
            for (int i = 0; i < materialsForSubject; i++) {
                Faculty faculty = assignmentRepository.findBySubjectAndSchoolClass(subject,
                        subject.getCourse() != null ? schoolClassRepository.findByCourseAndSemesterAndSection(subject.getCourse(), subject.getSemester(), "A").orElse(null) : null)
                        .stream().findFirst().map(FacultySubjectAssignment::getFaculty).orElse(facultyList.get(0));
                courseMaterialRepository.save(CourseMaterial.builder()
                        .title(subject.getName() + " - Unit " + (i + 1) + " Notes")
                        .subject(subject).faculty(faculty).type(types[count % types.length]).fileUrl(null)
                        .build());
                count++;
            }
        }
    }

    // ---------------- Announcements ----------------

    private void seedAnnouncements(List<Student> students, List<Faculty> facultyList) {
        String[] titles = {
                "Semester Exam Schedule Released", "Holiday Notice", "Library Timings Updated",
                "Guest Lecture on AI", "Sports Day Announcement", "Fee Payment Deadline Extended",
                "Placement Drive Registration Open", "Workshop on Cloud Computing", "Mid-Semester Break",
                "New Course Materials Uploaded", "Convocation Ceremony Details", "Scholarship Applications Open",
                "Campus Wi-Fi Maintenance", "Alumni Meet 2026", "Internship Opportunities",
                "Revised Timetable for Next Week", "Blood Donation Camp", "Annual Cultural Fest",
                "Research Paper Submission Deadline", "Feedback Survey Reminder"
        };
        AudienceType[] audiences = {AudienceType.ALL_STUDENTS, AudienceType.ALL_FACULTY, AudienceType.SPECIFIC_DEPARTMENT, AudienceType.SPECIFIC_COURSE};
        NotificationCategory[] categories = NotificationCategory.values();
        User admin = adminRepository.findAll().stream().findFirst().map(Admin::getUser).orElse(facultyList.get(0).getUser());

        for (int i = 0; i < titles.length; i++) {
            AudienceType audience = audiences[i % audiences.length];
            String target = switch (audience) {
                case SPECIFIC_DEPARTMENT -> "Computer Applications";
                case SPECIFIC_COURSE -> "BCA";
                default -> null;
            };
            announcementRepository.save(Announcement.builder()
                    .title(titles[i]).message("Please note: " + titles[i] + ". Contact the office for further details.")
                    .category(categories[i % categories.length]).audienceType(audience).audienceTarget(target)
                    .postedBy(i % 3 == 0 ? facultyList.get(i % facultyList.size()).getUser() : admin)
                    .build());
        }
    }

    // ---------------- Notifications ----------------

    private void seedNotifications(List<Student> students, List<Faculty> facultyList) {
        String[] messages = {
                "Your attendance for today has been recorded.",
                "New assignment has been posted.",
                "Your marks have been updated.",
                "A new announcement has been posted.",
                "Your feedback received a reply.",
        };
        NotificationCategory[] categories = NotificationCategory.values();
        int total = 50;
        for (int i = 0; i < total; i++) {
            boolean toStudent = i % 2 == 0;
            User recipient = toStudent
                    ? students.get(i % students.size()).getUser()
                    : facultyList.get(i % facultyList.size()).getUser();
            Notification n = Notification.builder()
                    .recipient(recipient).title(categories[i % categories.length].name() + " Update")
                    .message(messages[i % messages.length]).category(categories[i % categories.length])
                    .isRead(random.nextBoolean())
                    .build();
            notificationRepository.save(n);
        }
    }

    // ---------------- Feedback ----------------

    private void seedFeedback(List<Student> students, List<Faculty> facultyList, List<Subject> subjects) {
        String[] messages = {
                "Could you please share extra practice problems for this subject?",
                "The pace of lectures has been very helpful, thank you!",
                "Could we get more real-world examples in class?",
                "Requesting a revision session before the exam.",
                "The course material was very clear and well organized.",
        };
        for (int i = 0; i < 20; i++) {
            Student student = students.get(i % students.size());
            List<Subject> mySubjects = subjects.stream()
                    .filter(s -> s.getCourse().getId().equals(student.getCourse().getId()) && s.getSemester().equals(student.getSemester()))
                    .toList();
            Subject subject = mySubjects.isEmpty() ? null : mySubjects.get(i % mySubjects.size());
            Faculty faculty = subject != null
                    ? assignmentRepository.findBySubjectAndSchoolClass(subject,
                            schoolClassRepository.findByCourseAndSemesterAndSection(subject.getCourse(), subject.getSemester(), "A").orElse(null))
                            .stream().findFirst().map(FacultySubjectAssignment::getFaculty).orElse(facultyList.get(0))
                    : facultyList.get(i % facultyList.size());

            boolean replied = i % 3 == 0;
            feedbackRepository.save(Feedback.builder()
                    .student(student).faculty(faculty).subject(subject).message(messages[i % messages.length])
                    .status(replied ? FeedbackStatus.REVIEWED : FeedbackStatus.NEW)
                    .reply(replied ? "Thank you for your feedback — noted and will be addressed in the next class." : null)
                    .repliedAt(replied ? LocalDateTime.now().minusDays(i % 5) : null)
                    .build());
        }
    }

    // ---------------- Fees ----------------

    private void seedFees(List<Student> students) {
        BigDecimal totalFee = new BigDecimal("50000");
        for (int i = 0; i < students.size(); i++) {
            Student student = students.get(i);
            BigDecimal paid = switch (i % 3) {
                case 0 -> totalFee; // fully paid
                case 1 -> totalFee.multiply(new BigDecimal("0.5")); // half paid
                default -> BigDecimal.ZERO; // unpaid
            };
            Fee fee = feeRepository.save(Fee.builder()
                    .student(student).academicYear("2026-2027").totalAmount(totalFee).paidAmount(paid)
                    .dueDate(LocalDate.now().plusDays(30))
                    .build());
            if (paid.compareTo(BigDecimal.ZERO) > 0) {
                feePaymentRepository.save(FeePayment.builder()
                        .fee(fee).student(student).amount(paid).method("UPI")
                        .transactionRef("TXN-SEED-" + student.getId())
                        .status(PaymentStatus.SUCCESS).paidAt(LocalDateTime.now().minusDays(10))
                        .build());
            }
        }
    }
}
