// notificationVisibility.js
// Shared rules for who should see a given notification/announcement.
//
// BUG THIS FIXES: the Admin "Compose Announcement" form let you pick a
// Recipient ("All Students" / "All Faculty" / "Specific Department" /
// "Specific Course") but the choice was never actually stored on the
// notification, so EVERY announcement reached EVERY role's inbox
// regardless of what was selected. These helpers make that selection
// (stored as `audience: { type, target }`) actually matter, while leaving
// existing class-scoped (`classId`) and person-scoped (`facultyId`)
// notifications working exactly as before.

export function isVisibleToStudent(n, student) {
  if (n.classId) return n.classId === `${student.course} ${student.semester}`;
  if (n.audience) {
    switch (n.audience.type) {
      case "All Faculty":
        return false;
      case "Specific Department":
        return n.audience.target === student.department;
      case "Specific Course":
        return n.audience.target === student.course;
      default:
        return true; // "All Students" or unrecognized -> visible
    }
  }
  return true;
}

export function isVisibleToFaculty(n, faculty) {
  if (n.classId) return false; // class-scoped items (e.g. QR attendance started) are for students only
  if (n.facultyId) return n.facultyId === faculty.id;
  if (n.audience) {
    switch (n.audience.type) {
      case "All Students":
      case "Specific Course":
        return false;
      case "Specific Department":
        return n.audience.target === faculty.department;
      default:
        return true; // "All Faculty" or unrecognized -> visible
    }
  }
  return true;
}
