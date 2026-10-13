package com.educloud.service;

import com.educloud.dto.common.NotificationResponse;
import com.educloud.entity.Notification;
import com.educloud.entity.NotificationCategory;
import com.educloud.entity.User;
import com.educloud.exception.ForbiddenException;
import com.educloud.exception.NotFoundException;
import com.educloud.repository.NotificationRepository;
import com.educloud.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public Notification notifyUser(User recipient, String title, String message, NotificationCategory category, String sourceRef) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(title)
                .message(message)
                .category(category)
                .isRead(false)
                .sourceRef(sourceRef)
                .build();
        return notificationRepository.save(notification);
    }

    public List<NotificationResponse> getMyNotifications() {
        User user = currentUserService.getUser();
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void markAsRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Notification not found."));
        if (!n.getRecipient().getId().equals(currentUserService.getUserId())) {
            throw new ForbiddenException("You can't modify another user's notification.");
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllAsRead() {
        User user = currentUserService.getUser();
        List<Notification> unread = notificationRepository.findByRecipientAndIsReadFalse(user);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void delete(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Notification not found."));
        if (!n.getRecipient().getId().equals(currentUserService.getUserId())) {
            throw new ForbiddenException("You can't delete another user's notification.");
        }
        notificationRepository.delete(n);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .category(n.getCategory().name())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
