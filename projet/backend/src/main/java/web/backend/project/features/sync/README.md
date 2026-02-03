# Synchronisation Firebase ↔ Backend

Ce module gère la synchronisation bidirectionnelle entre le backend PostgreSQL et Firebase Firestore.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│   PostgreSQL    │ ←→  │   SyncService    │ ←→  │  Firebase   │
│   (Entities)    │     │   (Registry)     │     │ (Firestore) │
└─────────────────┘     └──────────────────┘     └─────────────┘
```

### Composants principaux

| Fichier               | Rôle                             |
| --------------------- | -------------------------------- |
| `SyncController`      | API REST `/api/sync/*`           |
| `SyncService`         | Orchestration push/pull          |
| `EntitySyncRegistry`  | Registre des handlers génériques |
| `EntityTypeHandler`   | Handler par type d'entité        |
| `FirebaseSyncService` | Communication avec Firebase      |

---

## Endpoints API

### Synchronisation complète

```http
POST /api/sync
Content-Type: application/json

{
  "entityTypes": ["Signalement", "StatutAvancement"],
  "direction": "PUSH" | "PULL" | "BIDIRECTIONAL",
  "forceSync": false
}
```

### Raccourcis

```http
POST /api/sync/push?entities=Signalement,Utilisateur&forceSync=false
POST /api/sync/pull?entities=StatutAvancement
POST /api/sync/bidirectional?entities=AvancementSignalement
```

### Statut

```http
GET /api/sync/status/{entityType}
GET /api/sync/supported-entities
GET /api/sync/health
```

---

## Format des données Firebase

### Collections Firestore

Les collections utilisent le nom de l'entité en **lowercase** :

| Entité                  | Collection Firebase     |
| ----------------------- | ----------------------- |
| `Signalement`           | `signalement`           |
| `StatutAvancement`      | `statutavancement`      |
| `AvancementSignalement` | `avancementsignalement` |
| `Utilisateur`           | `utilisateur`           |
| `UtilisateurBloque`     | `utilisateurbloque`     |

---

## PUSH (Backend → Firebase)

Données envoyées à Firebase via `toFirebaseMap()` :

### Signalement

```json
{
  "id": 1,
  "dateCreation": "2026-02-02",
  "surface": 150.5,
  "budget": 50000,
  "localisationWkt": "POINT(-18.9137 47.5361)",
  "synchro": true,
  "utilisateurCreateurId": 3,
  "entrepriseId": 2,
  "last_modified": "2026-02-02T10:30:00"
}
```

### StatutAvancement

```json
{
  "id": 1,
  "nom": "En cours",
  "valeur": 50,
  "synchro": true,
  "last_modified": "2026-02-02T10:30:00"
}
```

### AvancementSignalement

```json
{
  "id": 1,
  "date_modification": "2026-02-02T14:25:00",
  "synchro": true,
  "utilisateur_id": 3,
  "statut_avancement_id": 2,
  "signalement_id": 5,
  "last_modified": "2026-02-02T14:25:00"
}
```

### Utilisateur

```json
{
  "id": 1,
  "email": "user@example.com",
  "password": "hashed_password",
  "synchro": true,
  "role_id": 2,
  "last_modified": "2026-02-02T10:30:00"
}
```

### UtilisateurBloque

```json
{
  "id": 1,
  "date_blocage": "2026-01-15T08:00:00",
  "synchro": true,
  "utilisateur_id": 5
}
```

---

## PULL (Firebase → Backend)

Données attendues depuis Firebase via `fromFirebaseMap()` :

### Signalement

```json
{
  "id": 1,
  "dateCreation": "2026-02-02",
  "surface": 150.5,
  "budget": 50000,
  "localisation": "POINT(-18.9137 47.5361)",
  "synchro": false,
  "utilisateurCreateurId": 3,
  "entrepriseId": 2,
  "last_modified": "2026-02-02T10:30:00"
}
```

### StatutAvancement

```json
{
  "id": 1,
  "nom": "Terminé",
  "valeur": 100,
  "synchro": false,
  "last_modified": "2026-02-02T10:30:00"
}
```

### AvancementSignalement

```json
{
  "id": 1,
  "date_modification": "2026-02-02T14:25:00",
  "synchro": false,
  "utilisateur_id": 3,
  "statut_avancement_id": 2,
  "signalement_id": 5,
  "last_modified": "2026-02-02T14:25:00"
}
```

### Utilisateur

```json
{
  "id": 1,
  "email": "user@example.com",
  "password": "hashed_password",
  "synchro": false,
  "role_id": 2,
  "last_modified": "2026-02-02T10:30:00"
}
```

### UtilisateurBloque

```json
{
  "id": 1,
  "date_blocage": "2026-01-15T08:00:00",
  "synchro": false,
  "utilisateur_id": 5
}
```

---

## Types de données

| Champ                                             | Type      | Format                                   | Exemple                     |
| ------------------------------------------------- | --------- | ---------------------------------------- | --------------------------- |
| `id`                                              | `Integer` | Numérique (accepte String, Long, Double) | `1`                         |
| `dateModification`, `dateBlocage`, `last_modified` | `String`  | ISO-8601                                 | `"2026-02-02T14:25:00"`     |
| `dateCreation`                                    | `String`  | Date simple                              | `"2026-02-02"`              |
| `localisationWkt`                                 | `String`  | WKT (Well-Known Text)                    | `"POINT(-18.9137 47.5361)"` |
| `synchro`                                         | `Boolean` | true/false                               | `true`                      |
| `*Id` (relations)                                 | `Integer` | ID de l'entité référencée                | `3`                         |

### Formats WKT supportés

```
POINT(longitude latitude)
LINESTRING(lon1 lat1, lon2 lat2, ...)
POLYGON((lon1 lat1, lon2 lat2, lon3 lat3, lon1 lat1))
```

---

## Ajouter une nouvelle entité synchronisable

### 1. L'entité doit implémenter `SyncableEntity<DTO>`

```java
@Entity
public class NouvelleEntite implements SyncableEntity<NouvelleEntiteDTO> {

    @Override
    public NouvelleEntiteDTO toDTO() {
        // Conversion Entity → DTO
    }

    @Override
    public void updateFromDTO(NouvelleEntiteDTO dto) {
        // Mise à jour Entity depuis DTO
    }

    // getSynchro(), setSynchro(), getId(), setId()
}
```

### 2. Le DTO doit implémenter `SyncableDTO` et `FirebaseSerializable`

```java
public class NouvelleEntiteDTO implements SyncableDTO, FirebaseSerializable {

    @Override
    public FirebaseSerializable fromFirebaseMap(Map<String, Object> data) {
        this.id = FirebaseSerializable.extractInteger(data, "id");
        // ... autres champs
        return this;
    }

    @Override
    public Map<String, Object> toFirebaseMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        // ... autres champs
        return map;
    }
}
```

### 3. Enregistrer dans `SyncRepositoryConfig`

```java
syncRegistry.register(new EntityTypeHandler<>(
    "NouvelleEntite",
    nouvelleEntiteRepository,
    NouvelleEntite::new,
    NouvelleEntiteDTO::new,
    (entity, dto) -> {
        // Résolution des relations (optionnel)
        if (dto.getAutreEntiteId() != null) {
            autreRepository.findById(dto.getAutreEntiteId())
                .ifPresent(entity::setAutreEntite);
        }
    }
));
```

### 4. Ajouter dans `SUPPORTED_ENTITY_TYPES` du `SyncController`

```java
private static final List<String> SUPPORTED_ENTITY_TYPES = Arrays.asList(
    "Signalement", "StatutAvancement", "AvancementSignalement",
    "Utilisateur", "UtilisateurBloque", "NouvelleEntite"  // ← Ajouter ici
);
```

---

## Flux de synchronisation

### Push (Backend → Firebase)

```
1. Récupère entités où synchro = false
2. Convertit via entity.toDTO()
3. Convertit via dto.toFirebaseMap()
4. Envoie à Firebase collection
5. Marque synchro = true
```

### Pull (Firebase → Backend)

```
1. Récupère documents depuis Firebase collection
2. Pour chaque document :
   a. Crée DTO via dto.fromFirebaseMap(data)
   b. Trouve ou crée l'entité
   c. Met à jour via entity.updateFromDTO(dto)
   d. Résout les relations via RelationResolver
   e. Sauvegarde en base
```
