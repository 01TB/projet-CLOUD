# Format JSON - Synchronisation Firebase vers Backend

Ce document décrit le format JSON renvoyé par l'endpoint **POST /syncToBackend** qui synchronise les données Firestore vers le backend Spring Boot.

## 🔗 Endpoint

**URL**: `https://us-central1-projet-cloud-e2146.cloudfunctions.net/syncToBackend`  
**Méthode**: `POST`  
**Headers**: `Content-Type: application/json`  
**Body**: Aucun

---

## 📤 Structure de la Réponse

```json
{
  "success": boolean,
  "data": {
    "synced": number,
    "timestamp": string (ISO 8601),
    "data": {
      "roles": Array<Object>,
      "entreprises": Array<Object>,
      "statuts_avancement": Array<Object>,
      "parametres": Array<Object>,
      "utilisateurs": Array<Object>,
      "utilisateurs_bloques": Array<Object>,
      "signalements": Array<Object>,
      "avancements_signalement": Array<Object>
    },
    "updated": {
      "roles": Array<string>,
      "entreprises": Array<string>,
      "statuts_avancement": Array<string>,
      "parametres": Array<string>,
      "utilisateurs": Array<string>,
      "utilisateurs_bloques": Array<string>,
      "signalements": Array<string>,
      "avancements_signalement": Array<string>
    }
  }
}
```

---

## 📝 Exemple Complet de Réponse

### Réponse avec données à synchroniser

```json
{
  "success": true,
  "data": {
    "synced": 15,
    "timestamp": "2026-02-03T10:30:45.123Z",
    "data": {
      "roles": [
        {
          "id": "role_id_1",
          "nom": "Administrateur",
          "synchro": false
        },
        {
          "id": "role_id_2",
          "nom": "Utilisateur",
          "synchro": false
        },
        {
          "id": "role_id_3",
          "nom": "Entreprise",
          "synchro": false
        }
      ],
      "entreprises": [
        {
          "id": "entreprise_id_1",
          "nom": "BTP Rénovation",
          "synchro": false
        },
        {
          "id": "entreprise_id_2",
          "nom": "Eco-Construction",
          "synchro": false
        },
        {
          "id": "entreprise_id_3",
          "nom": "Travaux Express",
          "synchro": false
        }
      ],
      "statuts_avancement": [
        {
          "id": "statut_id_1",
          "nom": "Nouveau",
          "valeur": 0,
          "synchro": false
        },
        {
          "id": "statut_id_2",
          "nom": "En cours d'analyse",
          "valeur": 25,
          "synchro": false
        },
        {
          "id": "statut_id_3",
          "nom": "Travaux commencés",
          "valeur": 50,
          "synchro": false
        },
        {
          "id": "statut_id_4",
          "nom": "Travaux terminés",
          "valeur": 100,
          "synchro": false
        },
        {
          "id": "statut_id_5",
          "nom": "Rejeté",
          "valeur": -1,
          "synchro": false
        }
      ],
      "parametres": [
        {
          "id": "param_id_1",
          "nb_tentatives_connexion": 5,
          "duree_session": 3600,
          "synchro": false
        }
      ],
      "utilisateurs": [
        {
          "id": "firebase_auth_uid_admin",
          "email": "admin@signalement.com",
          "password": "hashed_password_admin",
          "id_role": "role_id_1",
          "synchro": false
        },
        {
          "id": "firebase_auth_uid_user1",
          "email": "jean.dupont@email.com",
          "password": "hashed_password_user1",
          "id_role": "role_id_2",
          "synchro": false
        },
        {
          "id": "firebase_auth_uid_user2",
          "email": "marie.curie@email.com",
          "password": "hashed_password_user2",
          "id_role": "role_id_2",
          "synchro": false
        },
        {
          "id": "firebase_auth_uid_entreprise",
          "email": "contact@btp-renovation.com",
          "password": "hashed_password_entreprise",
          "id_role": "role_id_3",
          "synchro": false
        },
        {
          "id": "firebase_auth_uid_spammeur",
          "email": "spammeur@bad.com",
          "password": "hashed_password_user3",
          "id_role": "role_id_2",
          "synchro": false
        }
      ],
      "utilisateurs_bloques": [
        {
          "id": "blocage_id_1",
          "id_utilisateur": "firebase_auth_uid_spammeur",
          "date_blocage": "2023-10-25T14:00:00.000Z",
          "synchro": false
        }
      ],
      "signalements": [
        {
          "id": "signalement_id_1",
          "date_creation": "2023-11-01T09:30:00.000Z",
          "surface": 45.5,
          "budget": 15000,
          "localisation": {
            "latitude": 18.9,
            "longitude": 47.5
          },
          "id_utilisateur_createur": "firebase_auth_uid_user1",
          "id_entreprise": "entreprise_id_1",
          "synchro": false
        },
        {
          "id": "signalement_id_2",
          "date_creation": "2023-11-02T10:15:00.000Z",
          "surface": 120.0,
          "budget": 50000,
          "localisation": {
            "latitude": -12.28,
            "longitude": 49.29
          },
          "id_utilisateur_createur": "firebase_auth_uid_user2",
          "id_entreprise": "entreprise_id_2",
          "synchro": false
        },
        {
          "id": "signalement_id_3",
          "date_creation": "2023-11-03T16:00:00.000Z",
          "surface": 15.0,
          "budget": 2000,
          "localisation": {
            "latitude": 18.92,
            "longitude": 47.52
          },
          "id_utilisateur_createur": "firebase_auth_uid_user1",
          "id_entreprise": "entreprise_id_3",
          "synchro": false
        }
      ],
      "avancements_signalement": [
        {
          "id": "avancement_id_1",
          "id_signalement": "signalement_id_1",
          "id_utilisateur": "firebase_auth_uid_user1",
          "id_statut_avancement": "statut_id_1",
          "date_modification": "2025-02-01T00:00:00.000Z",
          "synchro": false
        },
        {
          "id": "avancement_id_2",
          "id_signalement": "signalement_id_1",
          "id_utilisateur": "firebase_auth_uid_admin",
          "id_statut_avancement": "statut_id_2",
          "date_modification": "2025-02-02T00:00:00.000Z",
          "synchro": false
        }
      ]
    },
    "updated": {
      "roles": ["role_id_1", "role_id_2", "role_id_3"],
      "entreprises": ["entreprise_id_1", "entreprise_id_2", "entreprise_id_3"],
      "statuts_avancement": [
        "statut_id_1",
        "statut_id_2",
        "statut_id_3",
        "statut_id_4",
        "statut_id_5"
      ],
      "parametres": ["param_id_1"],
      "utilisateurs": [
        "firebase_auth_uid_admin",
        "firebase_auth_uid_user1",
        "firebase_auth_uid_user2",
        "firebase_auth_uid_entreprise",
        "firebase_auth_uid_spammeur"
      ],
      "utilisateurs_bloques": ["blocage_id_1"],
      "signalements": [
        "signalement_id_1",
        "signalement_id_2",
        "signalement_id_3"
      ],
      "avancements_signalement": ["avancement_id_1", "avancement_id_2"]
    }
  }
}
```

### Réponse sans données à synchroniser

```json
{
  "success": true,
  "data": {
    "synced": 0,
    "timestamp": "2026-02-03T10:30:45.123Z",
    "data": {},
    "updated": {}
  }
}
```

---

## 🔍 Détails des Champs

### Champs racine

| Champ     | Type    | Description                                                |
| --------- | ------- | ---------------------------------------------------------- |
| `success` | boolean | Indique si la synchronisation a réussi                     |
| `data`    | object  | Objet contenant toutes les informations de synchronisation |

### Objet `data`

| Champ       | Type   | Description                                           |
| ----------- | ------ | ----------------------------------------------------- |
| `synced`    | number | Nombre total de documents synchronisés                |
| `timestamp` | string | Date et heure de la synchronisation (format ISO 8601) |
| `data`      | object | Données organisées par collection                     |
| `updated`   | object | IDs des documents mis à jour (synchro passé à `true`) |

### Objet `data.data` (Données par collection)

Chaque clé correspond à une collection Firestore. Les valeurs sont des tableaux d'objets contenant les documents avec `synchro = false`.

**Collections disponibles** :

- `roles`
- `entreprises`
- `statuts_avancement`
- `parametres`
- `utilisateurs`
- `utilisateurs_bloques`
- `signalements`
- `avancements_signalement`

### Objet `data.updated`

Contient les mêmes clés que `data.data`, mais avec des tableaux d'IDs (strings) des documents qui ont été mis à jour.

---

## 🔄 Conversions de Types Firestore

Le endpoint effectue automatiquement les conversions suivantes :

| Type Firestore      | Type JSON           | Exemple                                 |
| ------------------- | ------------------- | --------------------------------------- |
| `Timestamp`         | `string` (ISO 8601) | `"2023-11-01T09:30:00.000Z"`            |
| `GeoPoint`          | `object`            | `{"latitude": 18.9, "longitude": 47.5}` |
| `DocumentReference` | `string` (ID)       | `"entreprise_id_1"`                     |

### Exemple de conversion Timestamp

**Firestore** :

```javascript
Timestamp { _seconds: 1698831000, _nanoseconds: 0 }
```

**JSON** :

```json
"2023-11-01T09:30:00.000Z"
```

### Exemple de conversion GeoPoint

**Firestore** :

```javascript
GeoPoint { _latitude: 18.9, _longitude: 47.5 }
```

**JSON** :

```json
{
  "latitude": 18.9,
  "longitude": 47.5
}
```

---

## ⚙️ Comportement de la Synchronisation

1. **Récupération** : Recherche tous les documents avec `synchro = false` dans les 8 collections
2. **Conversion** : Transforme les types Firestore en types JSON standards
3. **Réponse** : Retourne les données au format structuré
4. **Mise à jour** : Change `synchro = false` → `synchro = true` pour tous les documents récupérés
5. **Batch** : Gère automatiquement les lots de 500 opérations (limite Firestore)

---

## 🚨 Gestion des Erreurs

### Erreur de synchronisation (500)

```json
{
  "success": false,
  "error": {
    "code": "SYNC_ERROR",
    "message": "Erreur lors de la synchronisation",
    "status": 500
  }
}
```

### Méthode non autorisée (405)

```json
{
  "success": false,
  "error": {
    "code": "METHOD_NOT_ALLOWED",
    "message": "Méthode non autorisée",
    "status": 405
  }
}
```

---

## 💡 Utilisation depuis Spring Boot

### RestTemplate

```java
RestTemplate restTemplate = new RestTemplate();
HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.APPLICATION_JSON);

HttpEntity<Void> request = new HttpEntity<>(headers);
ResponseEntity<SyncResponse> response = restTemplate.postForEntity(
    "https://us-central1-projet-cloud-e2146.cloudfunctions.net/syncToBackend",
    request,
    SyncResponse.class
);

SyncResponse syncData = response.getBody();
System.out.println("Documents synchronisés: " + syncData.getData().getSynced());

// Traiter les données par collection
Map<String, List<Map<String, Object>>> collections = syncData.getData().getData();
collections.forEach((collectionName, documents) -> {
    System.out.println("Collection: " + collectionName + " - " + documents.size() + " documents");
    documents.forEach(doc -> {
        // Traiter chaque document
        String id = (String) doc.get("id");
        // ... logique métier
    });
});
```

### WebClient (Reactive)

```java
WebClient webClient = WebClient.create();

Mono<SyncResponse> syncResponse = webClient.post()
    .uri("https://us-central1-projet-cloud-e2146.cloudfunctions.net/syncToBackend")
    .contentType(MediaType.APPLICATION_JSON)
    .retrieve()
    .bodyToMono(SyncResponse.class);

syncResponse.subscribe(data -> {
    System.out.println("Synchronisé: " + data.getData().getSynced() + " documents");
    // Traiter les données
});
```

### Scheduled Task (Cron)

```java
@Scheduled(fixedRate = 300000) // Toutes les 5 minutes
public void syncFromFirebase() {
    try {
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<SyncResponse> response = restTemplate.postForEntity(
            "https://us-central1-projet-cloud-e2146.cloudfunctions.net/syncToBackend",
            new HttpEntity<>(new HttpHeaders()),
            SyncResponse.class
        );

        if (response.getStatusCode() == HttpStatus.OK) {
            SyncResponse syncData = response.getBody();
            int synced = syncData.getData().getSynced();

            if (synced > 0) {
                logger.info("Synchronisation réussie: {} documents", synced);
                // Traiter les données
                processFirebaseData(syncData.getData().getData());
            } else {
                logger.debug("Aucune nouvelle donnée à synchroniser");
            }
        }
    } catch (Exception e) {
        logger.error("Erreur lors de la synchronisation Firebase", e);
    }
}
```

---

## 📊 Classes DTO Suggérées (Java)

```java
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SyncResponse {
    private boolean success;
    private SyncData data;
    private ErrorInfo error;
}

@Data
public class SyncData {
    private int synced;
    private String timestamp;
    private Map<String, List<Map<String, Object>>> data;
    private Map<String, List<String>> updated;
}

@Data
public class ErrorInfo {
    private String code;
    private String message;
    private int status;
}

// Classes spécifiques pour chaque collection
@Data
public class FirebaseRole {
    private String id;
    private String nom;
    private boolean synchro;
}

@Data
public class FirebaseEntreprise {
    private String id;
    private String nom;
    private boolean synchro;
}

@Data
public class FirebaseStatutAvancement {
    private String id;
    private String nom;
    private int valeur;
    private boolean synchro;
}

@Data
public class FirebaseSignalement {
    private String id;
    private String dateCreation; // ISO 8601 string
    private double surface;
    private double budget;
    private GeoLocation localisation;
    private String idUtilisateurCreateur;
    private String idEntreprise;
    private boolean synchro;
}

@Data
public class GeoLocation {
    private double latitude;
    private double longitude;
}
```

---

## 📋 Notes Importantes

1. ⚠️ **Après synchronisation** : Tous les documents récupérés auront automatiquement `synchro = true`
2. 📦 **Limite Firestore** : Maximum 500 opérations par batch (géré automatiquement par l'endpoint)
3. 🔄 **Types convertis** : Timestamp → ISO 8601, GeoPoint → {latitude, longitude}
4. 🚀 **Usage recommandé** : Appel périodique via cron job (ex: toutes les 5 minutes)
5. 🔒 **Sécurité** : Endpoint public, prévoir une authentification côté Spring Boot si nécessaire
6. 📊 **Performance** : Traiter les collections en parallèle si possible
7. 🧹 **Nettoyage** : L'endpoint ne supprime pas les données, il marque juste comme synchronisées

---

## 🔗 Ressources

- [Documentation API complète](../api/firebase-api.md)
- [Structure des collections Firebase](./conventions_firebase.md)
- [Exemples de données](./format_pull_firebase.json)
- [Code source de l'endpoint](../../firebase/functions/src/sync/index.ts)
