package com.educloud.dto.fees;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private BigDecimal amount;
    private String method;
    private String transactionRef;
    private String status;
    private LocalDateTime paidAt;
}
