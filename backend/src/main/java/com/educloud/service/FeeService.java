package com.educloud.service;

import com.educloud.dto.fees.FeeResponse;
import com.educloud.dto.fees.PaymentRequest;
import com.educloud.dto.fees.PaymentResponse;
import com.educloud.entity.*;
import com.educloud.exception.BadRequestException;
import com.educloud.exception.NotFoundException;
import com.educloud.repository.FeePaymentRepository;
import com.educloud.repository.FeeRepository;
import com.educloud.security.CurrentUserService;
import com.educloud.util.TokenGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeeService {

    private final FeeRepository feeRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    public List<FeeResponse> getStudentFees() {
        Student student = currentUserService.getStudent();
        return feeRepository.findByStudent(student).stream().map(this::toResponse).toList();
    }

    public FeeResponse getOverview() {
        Student student = currentUserService.getStudent();
        List<Fee> fees = feeRepository.findByStudent(student);
        BigDecimal total = fees.stream().map(Fee::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal paid = fees.stream().map(Fee::getPaidAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal balance = total.subtract(paid);
        return FeeResponse.builder()
                .totalAmount(total).paidAmount(paid).balance(balance)
                .status(balance.compareTo(BigDecimal.ZERO) <= 0 ? "PAID" : paid.compareTo(BigDecimal.ZERO) > 0 ? "PARTIAL" : "DUE")
                .build();
    }

    public List<PaymentResponse> getPaymentHistory() {
        Student student = currentUserService.getStudent();
        return feePaymentRepository.findByStudentOrderByPaidAtDesc(student).stream().map(this::toResponse).toList();
    }

    /**
     * Mock payment processing for demo purposes. The amount charged is ALWAYS
     * clamped to the fee's real outstanding balance from the database — a
     * client sending an inflated or zero `amountToPay` can never make the
     * system record more (or less, if they try to pay 0 and claim success)
     * than what's actually owed.
     */
    @Transactional
    public PaymentResponse makePayment(PaymentRequest req) {
        Student student = currentUserService.getStudent();
        Fee fee = feeRepository.findById(req.getFeeId()).orElseThrow(() -> new NotFoundException("Fee record not found."));
        if (!fee.getStudent().getId().equals(student.getId())) {
            throw new BadRequestException("This fee record doesn't belong to your account.");
        }

        BigDecimal balance = fee.getBalance();
        if (balance.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("This fee has already been paid in full.");
        }

        BigDecimal amount = balance;
        if (req.getAmountToPay() != null && req.getAmountToPay().compareTo(BigDecimal.ZERO) > 0) {
            amount = req.getAmountToPay().min(balance); // never allow paying more than what's owed
        }

        fee.setPaidAmount(fee.getPaidAmount().add(amount));
        feeRepository.save(fee);

        FeePayment payment = FeePayment.builder()
                .fee(fee).student(student).amount(amount).method(req.getMethod())
                .transactionRef("TXN-" + TokenGenerator.generate(9))
                .status(PaymentStatus.SUCCESS).paidAt(LocalDateTime.now())
                .build();
        payment = feePaymentRepository.save(payment);

        notificationService.notifyUser(student.getUser(), "Payment received",
                "Your payment of ₹" + amount + " was received successfully.", NotificationCategory.ACADEMIC, "FEE:" + fee.getId());

        return toResponse(payment);
    }

    private FeeResponse toResponse(Fee f) {
        BigDecimal balance = f.getBalance();
        return FeeResponse.builder()
                .id(f.getId()).academicYear(f.getAcademicYear()).totalAmount(f.getTotalAmount())
                .paidAmount(f.getPaidAmount()).balance(balance).dueDate(f.getDueDate())
                .status(balance.compareTo(BigDecimal.ZERO) <= 0 ? "PAID" : f.getPaidAmount().compareTo(BigDecimal.ZERO) > 0 ? "PARTIAL" : "DUE")
                .build();
    }

    private PaymentResponse toResponse(FeePayment p) {
        return PaymentResponse.builder()
                .id(p.getId()).amount(p.getAmount()).method(p.getMethod()).transactionRef(p.getTransactionRef())
                .status(p.getStatus().name()).paidAt(p.getPaidAt())
                .build();
    }
}
