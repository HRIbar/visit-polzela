# Build stage
FROM maven:3.9-eclipse-temurin-17-alpine as build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn dependency:go-offline
RUN mvn package -Pproduction

# Run stage
FROM registry.access.redhat.com/ubi8/openjdk-17:1.14
COPY --from=build --chown=185 /app/target/visit-polzela-1.0-runner.jar /deployments/visit-polzela-1.0-runner.jar
EXPOSE 8080
USER 185
ENV JAVA_OPTS="-Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"
ENV JAVA_APP_JAR="/deployments/visit-polzela-1.0-runner.jar"