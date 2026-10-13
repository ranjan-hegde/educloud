package com.educloud.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A concrete class-group, e.g. "BCA — Semester 5". Named SchoolClass because
 * "Class" is a reserved identifier pattern to avoid in Java. Exposed to the
 * frontend as the flat string "<course> <semester>th Semester" it already expects.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "school_classes", uniqueConstraints = @UniqueConstraint(columnNames = {"course_id", "semester", "section"}))
public class SchoolClass extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private Integer semester;

    @Builder.Default
    @Column(nullable = false)
    private String section = "A";

    /** Convenience display label used across the frontend, e.g. "BCA 5th Semester". */
    public String getDisplayName() {
        return course.getName() + " " + semester + "th Semester";
    }
}
