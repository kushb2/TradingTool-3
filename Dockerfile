FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY pom.xml ./
COPY core core
COPY service service
COPY event-service event-service
COPY cron-job cron-job

RUN mvn -pl service -am clean package -DskipTests
RUN mvn -pl service -am dependency:copy-dependencies -DincludeScope=runtime -DoutputDirectory=service/target/lib

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /workspace/service/target/service-0.1.0-SNAPSHOT.jar /app/service.jar
COPY --from=build /workspace/service/target/lib /app/lib

EXPOSE 8080

ENTRYPOINT ["java", "-cp", "/app/service.jar:/app/lib/*", "com.tradingtool.ApplicationKt"]
