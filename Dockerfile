# Build stage with optimized layer caching
FROM maven:3.9-eclipse-temurin-17-alpine as build
WORKDIR /app

# Copy Maven descriptor and npm manifests first for better layer caching
COPY pom.xml .
COPY package.json package-lock.json* ./

# Pre-fetch Maven Java dependencies
RUN mvn dependency:go-offline -B

# Copy Vite/TypeScript config files needed for the frontend build
COPY vite.config.ts tsconfig.json ./

# Copy source code
COPY src ./src

# Full build — frontend-maven-plugin downloads Node.js, runs npm install + vite build,
# then Quarkus packages everything into the über-jar
RUN mvn package -DskipTests -B

# Run stage — minimal distroless image
FROM gcr.io/distroless/java17-debian11:nonroot
COPY --from=build --chown=nonroot:nonroot /app/target/visit-polzela-1.0-runner.jar /app/visit-polzela-1.0-runner.jar
EXPOSE 8080
USER nonroot

# Set environment variables for production
ENV QUARKUS_HTTP_HOST=0.0.0.0
ENV QUARKUS_HTTP_PORT=8080
ENV JAVA_OPTS="-Djava.util.logging.manager=org.jboss.logmanager.LogManager -XX:+UseG1GC -XX:MaxGCPauseMillis=100"

ENTRYPOINT ["java", "-jar", "/app/visit-polzela-1.0-runner.jar"]
