Voici une synthèse complète de notre échange, structurée de manière claire. Tu peux copier ce contenu et le sauvegarder dans un fichier nommé `DOCKER_SPRING_GUIDE.md`.

---

# Guide : Développement Spring Boot avec Docker & PostgreSQL

Ce guide explique comment configurer un environnement de développement où le code source reste sur votre machine hôte (**Bind Mount**) pour permettre le rechargement à chaud (**Hot Reload**), tout en utilisant une base de données PostgreSQL conteneurisée.

## 1. Concepts Clés : Volume vs Bind Mount

| Type | Emplacement | Usage idéal |
| --- | --- | --- |
| **Volume** | Géré par Docker | Persistance de base de données (PostgreSQL). |
| **Bind Mount** | Votre ordinateur (`./src`) | Code source en cours de développement. |

---

## 2. Configuration des fichiers

### A. Le `Dockerfile`

Ce fichier définit l'environnement de compilation. On utilise Maven pour exécuter l'application.

```dockerfile
# Utilisation d'une image Maven avec JDK 17
FROM maven:3.9.6-eclipse-temurin-17

# Définition du répertoire de travail dans le container
WORKDIR /app

# On ne copie pas le code ici, il sera monté via Docker Compose
# On lance Spring Boot en mode run
CMD ["mvn", "spring-boot:run"]

```

### B. Le `docker-compose.yml`

C'est le chef d'orchestre qui lie votre code, la base de données et les volumes.

```yaml
services:
  # Base de données PostgreSQL
  db:
    image: postgres:15-alpine
    container_name: postgres_db
    environment:
      - POSTGRES_USER=myuser
      - POSTGRES_PASSWORD=mypassword
      - POSTGRES_DB=mydb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Application Spring Boot
  app-spring:
    build: .
    container_name: spring_app
    ports:
      - "8080:8080"
    volumes:
      # BIND MOUNT : lie le dossier actuel au dossier /app du container
      - .:/app
      # VOLUME NOMMÉ : évite de retélécharger les libs Maven à chaque reboot
      - maven-cache:/root/.m2
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/mydb
      - SPRING_DATASOURCE_USERNAME=myuser
      - SPRING_DATASOURCE_PASSWORD=mypassword
      - SPRING_JPA_HIBERNATE_DDL_AUTO=update
    depends_on:
      - db

volumes:
  maven-cache:
  postgres_data:

```

### C. Configuration Spring Boot (`application.properties`)

Assurez-vous que votre application utilise les variables d'environnement.

```properties
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}

spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=${SPRING_JPA_HIBERNATE_DDL_AUTO}

```

---

## 3. Workflow de développement

### Démarrage initial

```bash
docker-compose up

```

### Modification du code (Hot Reload)

1. Ajoutez la dépendance `spring-boot-devtools` dans votre `pom.xml`.
2. Modifiez un fichier `.java` dans votre IDE local.
3. Spring Boot détectera le changement via le volume et redémarrera l'application automatiquement à l'intérieur du container.

### Ajout d'une nouvelle dépendance Maven

Si vous ajoutez une dépendance dans le `pom.xml` :

1. Enregistrez le fichier.
2. Redémarrez le service pour forcer Maven à lire le nouveau `pom.xml` :
```bash
docker-compose restart app-spring

```


3. *Note :* Maven ne téléchargera que la nouvelle dépendance grâce au volume `maven-cache`.

---

## 4. Commandes Utiles

* **Tout arrêter et supprimer les containers :** `docker-compose down`
* **Voir les logs en temps réel :** `docker-compose logs -f app-spring`
* **Accéder à la base de données via le terminal :** `docker exec -it postgres_db psql -U myuser -d mydb`

---

Souhaites-tu que je t'explique comment **déboguer (debug mode)** ton application Spring Boot directement depuis ton IDE alors qu'elle tourne dans Docker ?