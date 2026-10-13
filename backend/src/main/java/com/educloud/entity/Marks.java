package com.educloud.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "marks", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "subject_id", "semester"}))
public class Marks extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false)
    private Integer semester;

    @Min(0)
    @Max(30)
    @Column(nullable = false)
    private Integer internal;

    @Min(0)
    @Max(70)
    @Column(nullable = false)
    private Integer external;

    /** Faculty who entered/last edited this record — for audit + access checks. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entered_by_faculty_id")
    private Faculty enteredBy;

    public int getTotal() {
        return (internal == null ? 0 : internal) + (external == null ? 0 : external);
    }

    public String getGrade() {
        int total = getTotal();
        if (total >= 90) return "A+";
        if (total >= 80) return "A";
        if (total >= 70) return "B+";
        if (total >= 60) return "B";
        if (total >= 50) return "C";
        return "F";
    }
}
