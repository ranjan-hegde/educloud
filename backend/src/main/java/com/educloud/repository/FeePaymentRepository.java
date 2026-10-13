package com.educloud.repository;

import com.educloud.entity.FeePayment;
import com.educloud.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeePaymentRepository extends JpaRepository<FeePayment, Long> {
    List<FeePayment> findByStudentOrderByPaidAtDesc(Student student);
}
