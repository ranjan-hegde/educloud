package com.educloud.security;

import com.educloud.entity.Role;
import com.educloud.entity.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private final JwtService longLivedJwtService = new JwtService(
            "test-secret-key-for-jwt-unit-tests-1234567890", 3600_000L);
    private final JwtService instantlyExpiringJwtService = new JwtService(
            "test-secret-key-for-jwt-unit-tests-1234567890", -1000L);

    private User user(String email, Role role) {
        User u = User.builder().email(email).name("Test User").passwordHash("hash").role(role).enabled(true).build();
        u.setId(1L); // id lives on BaseEntity, so it is not part of User's builder
        return u;
    }

    @Test
    void generatedTokenIsValidForTheSameUser() {
        User user = user("test@example.com", Role.STUDENT);
        AppUserPrincipal principal = new AppUserPrincipal(user);
        String token = longLivedJwtService.generateToken(principal, user.getId(), user.getRole().name());

        assertTrue(longLivedJwtService.isTokenValid(token, principal));
        assertEquals("test@example.com", longLivedJwtService.extractEmail(token));
        assertEquals("STUDENT", longLivedJwtService.extractRole(token));
        assertEquals(1L, longLivedJwtService.extractUserId(token));
    }

    @Test
    void tokenIsInvalidForADifferentUser() {
        User user = user("owner@example.com", Role.FACULTY);
        AppUserPrincipal owner = new AppUserPrincipal(user);
        String token = longLivedJwtService.generateToken(owner, user.getId(), user.getRole().name());

        AppUserPrincipal impostor = new AppUserPrincipal(user("someone-else@example.com", Role.FACULTY));
        assertFalse(longLivedJwtService.isTokenValid(token, impostor));
    }

    @Test
    void expiredTokenIsRejected() {
        User user = user("expired@example.com", Role.ADMIN);
        AppUserPrincipal principal = new AppUserPrincipal(user);
        String token = instantlyExpiringJwtService.generateToken(principal, user.getId(), user.getRole().name());

        assertFalse(instantlyExpiringJwtService.isTokenValid(token, principal));
    }
}
