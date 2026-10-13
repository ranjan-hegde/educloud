package com.educloud.controller;

import com.educloud.dto.common.ApiResponse;
import com.educloud.dto.fees.FeeResponse;
import com.educloud.dto.fees.PaymentRequest;
import com.educloud.dto.fees.PaymentResponse;
import com.educloud.service.FeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fees")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class FeeController {

    private final FeeService feeService;

    @GetMapping("/student")
    public ResponseEntity<ApiResponse<List<FeeResponse>>> studentFees() {
        return ResponseEntity.ok(ApiResponse.success(feeService.getStudentFees()));
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<FeeResponse>> overview() {
        return ResponseEntity.ok(ApiResponse.success(feeService.getOverview()));
    }

    @GetMapping("/payment-history")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> paymentHistory() {
        return ResponseEntity.ok(ApiResponse.success(feeService.getPaymentHistory()));
    }

    @PostMapping("/payment")
    public ResponseEntity<ApiResponse<PaymentResponse>> pay(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Payment processed successfully.", feeService.makePayment(request)));
    }
}
