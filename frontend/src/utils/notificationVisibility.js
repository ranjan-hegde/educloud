// notificationVisibility.js
// Shared rules for who should see a given notification/announcement.

export function isVisibleToStudent(n, student) {
  if (!student) return true;

  // Personal notification targeted to another student
  if (n.studentId && n.studentId !== student.id && n.studentId !== student.rollNo) {
    return false;
  }

  // Announcements posted by faculty or admin:
  if (n.category === "Announcements" || n.postedBy === "faculty" || n.postedBy === "admin") {
    // If targeted to All Students or All Classes, definitely visible to student
    if (!n.classId || n.classId === "All Classes" || n.recipient === "All Students" || n.audience?.type === "All Students") {
      return true;
    }

    const studentCourse = (student.course || "BCA").toLowerCase();
    const studentSemester = (student.semester || "1st Semester").toLowerCase();
    const studentClassStr = `${studentCourse} ${studentSemester}`;
    const classIdStr = String(n.classId || "").toLowerCase();

    if (
      classIdStr === "all" ||
      classIdStr.includes("all") ||
      studentClassStr.includes(classIdStr) ||
      classIdStr.includes(studentCourse)
    ) {
      return true;
    }
  }

  if (n.classId && n.classId !== "All Classes") {
    const studentClass = `${student.course || "BCA"} ${student.semester || "1st Semester"}`;
    if (n.classId !== studentClass && !n.classId.toLowerCase().includes((student.course || "").toLowerCase())) {
      return false;
    }
  }

  if (n.audience) {
    switch (n.audience.type) {
      case "All Faculty":
        return false;
      case "Specific Department":
        return !student.department || n.audience.target === student.department;
      case "Specific Course":
        return !student.course || n.audience.target === student.course;
      default:
        return true;
    }
  }
  return true;
}

export function isVisibleToFaculty(n, faculty) {
  if (!faculty) return true;
  if (n.classId && !n.postedBy) return false;
  if (n.facultyId && n.facultyId !== faculty.id) return false;
  if (n.audience) {
    switch (n.audience.type) {
      case "All Students":
      case "Specific Course":
        return false;
      case "Specific Department":
        return !faculty.department || n.audience.target === faculty.department;
      default:
        return true;
    }
  }
  return true;
}
