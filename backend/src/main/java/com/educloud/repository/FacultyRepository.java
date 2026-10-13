package com.educloud.repository;

import com.educloud.entity.Faculty;
import com.educloud.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByUser(User user);
    Optional<Faculty> findByUserId(Long userId);
}
