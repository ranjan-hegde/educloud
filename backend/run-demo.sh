#!/usr/bin/env bash
# Starts the backend in demo mode (in-memory H2, sample data auto-seeded). No MySQL required.
mvn spring-boot:run -Dspring-boot.run.profiles=demo
