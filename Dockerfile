FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY pom.xml ./
COPY core/pom.xml core/pom.xml
COPY service/pom.xml service/pom.xml
COPY event-service/pom.xml event-service/pom.xml
COPY cron-job/pom.xml cron-job/pom.xml
COPY core/src core/src
COPY service/src service/src
COPY event-service/src event-service/src
COPY cron-job/src cron-job/src

RUN mvn -pl service -am clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /workspace/service/target/service-0.1.0-SNAPSHOT.jar /app/service.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/service.jar"]
