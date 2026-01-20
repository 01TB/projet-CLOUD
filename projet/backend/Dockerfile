# --------------------------
# Étape 1 : Build avec JDK
# --------------------------
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Copier uniquement les fichiers nécessaires pour Maven afin de profiter du cache
COPY pom.xml mvnw ./
COPY .mvn .mvn

# Installer uniquement les dépendances déclarées dans le pom local (mode batch, sans interaction)
# Référence explicite du pom pour éviter que Maven n'explore un parent ou d'autres modules présents
RUN ./mvnw -B -f pom.xml -DskipTests dependency:go-offline

# Copier le code source
COPY src ./src

# Build du jar (mode batch, skip tests pour accélérer)
RUN ./mvnw -B -f pom.xml -ntp clean package -DskipTests

# --------------------------
# Étape 2 : Image finale
# --------------------------
FROM eclipse-temurin:17-jdk
WORKDIR /app

# Copier le jar construit depuis l'étape de build
COPY --from=build /app/target/*.jar app.jar

# Copier le script SQL et l'entrypoint
COPY src/main/resources/sql/script.sql /app/script.sql
COPY entrypoint.sh /app/entrypoint.sh

# Installer psql pour exécuter le script SQL
RUN apt-get update && \
    apt-get install -y postgresql-client && \
    rm -rf /var/lib/apt/lists/*

# Rendre l'entrypoint exécutable
RUN chmod +x /app/entrypoint.sh

# Exposer le port par défaut Spring Boot
EXPOSE 8080

# Entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
