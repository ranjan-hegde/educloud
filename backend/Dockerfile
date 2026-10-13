# ---------- Build stage ----------
FROM eclipse-temurin:25-jdk-alpine AS build
WORKDIR /app

# Install Maven (Alpine doesn't have it by default)
RUN apk add --no-cache maven

# Copy pom first for dependency caching
COPY pom.xml ./

# Download dependencies (cached unless pom.xml changes)
RUN mvn dependency:go-offline -B

# Copy sources and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ---------- Runtime stage ----------
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

COPY --from=build /app/target/educloud-backend.jar app.jar

# Render injects PORT env var; Spring Boot picks it up via SERVER_PORT
ENV SERVER_PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

