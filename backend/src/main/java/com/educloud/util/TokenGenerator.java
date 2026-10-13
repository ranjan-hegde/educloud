package com.educloud.util;

import java.security.SecureRandom;
import java.util.Base64;

/** Cryptographically secure tokens for QR session payloads and password reset links. */
public final class TokenGenerator {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private TokenGenerator() {}

    public static String generate(int numBytes) {
        byte[] bytes = new byte[numBytes];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public static String qrToken() {
        return generate(32);
    }

    public static String resetToken() {
        return generate(32);
    }
}
