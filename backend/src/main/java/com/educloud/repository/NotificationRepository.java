package com.educloud.repository;

import com.educloud.entity.Notification;
import com.educloud.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    long countByRecipientAndIsReadFalse(User recipient);
    List<Notification> findByRecipientAndIsReadFalse(User recipient);
}
