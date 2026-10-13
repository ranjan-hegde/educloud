package com.educloud.dto.fees;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
public class FeeResponse {
    private Long id;
    private String academicYear;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal balance;
    private LocalDate dueDate;
    private String status; // PAID | PARTIAL | DUE
}
