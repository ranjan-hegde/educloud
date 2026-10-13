package com.educloud.dto.fees;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRequest {
    @NotNull
    private Long feeId;
    /**
     * Intentionally NOT the amount to charge — see FeeService. The actual
     * amount charged always comes from the Fee record in the database
     * (the outstanding balance, or amountToPay capped at the balance),
     * never from whatever the client sends here.
     */
    private java.math.BigDecimal amountToPay;
    @NotBlank
    private String method;
}
