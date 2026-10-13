package com.educloud.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GeoUtilsTest {

    @Test
    void sameCoordinatesHaveZeroDistance() {
        double distance = GeoUtils.distanceMeters(12.29581, 76.63929, 12.29581, 76.63929);
        assertEquals(0.0, distance, 0.001);
    }

    @Test
    void knownDistanceIsCalculatedCorrectly() {
        // Roughly 1 degree of latitude ~= 111.32 km at the equator-ish range used here.
        double distance = GeoUtils.distanceMeters(0.0, 0.0, 1.0, 0.0);
        assertTrue(distance > 110_000 && distance < 112_000,
                "Expected ~111km for 1 degree of latitude, got " + distance);
    }

    @Test
    void nearbyPointsAreWithinASmallRadius() {
        // ~0.0005 degrees is roughly 55m at this latitude — should be within 60-70m.
        double distance = GeoUtils.distanceMeters(12.29581, 76.63929, 12.29631, 76.63929);
        assertTrue(distance < 70, "Expected under 70m, got " + distance);
        assertTrue(distance > 40, "Expected over 40m, got " + distance);
    }
}
