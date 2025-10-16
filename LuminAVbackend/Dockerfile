# Imagen base con Java 17 (ligera)
FROM eclipse-temurin:17-jre

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia tu archivo JAR al contenedor
COPY ./target/LuminAV_backend-0.0.1-SNAPSHOT.jar app.jar

# Variables opcionales de memoria
ENV JAVA_OPTS="-Xms256m -Xmx512m"

# Expone el puerto del backend
EXPOSE 8081

# Comando que ejecuta tu aplicación
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]