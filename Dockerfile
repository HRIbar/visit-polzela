# Build stage with optimized layer caching
FROM maven:3.9-eclipse-temurin-17-alpine as build
WORKDIR /app

# Copy and cache dependencies first (this layer will be reused unless pom.xml changes)
COPY pom.xml .
COPY package.json .
RUN mvn dependency:go-offline -B

# Install Node.js dependencies (cached unless package.json changes)
RUN if [ -f package.json ]; then mvn vaadin:prepare-frontend -B; fi

# Copy source code only after dependencies are cached
COPY src ./src

# Build the application
RUN mvn package -Pproduction -DskipTests -B

# Run stage - use distroless for smaller image
FROM gcr.io/distroless/java17-debian11:nonroot
COPY --from=build --chown=nonroot:nonroot /app/target/visit-polzela-1.0-runner.jar /app/visit-polzela-1.0-runner.jar
EXPOSE 8080
USER nonroot

# Set environment variables for production
ENV QUARKUS_HTTP_HOST=0.0.0.0
ENV QUARKUS_HTTP_PORT=8080
ENV JAVA_OPTS="-Djava.util.logging.manager=org.jboss.logmanager.LogManager -XX:+UseG1GC -XX:MaxGCPauseMillis=100"

ENTRYPOINT ["java", "-jar", "/app/visit-polzela-1.0-runner.jar"]
