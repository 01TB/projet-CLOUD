# Documentation API Firebase Functions - Système de Signalements

## 📋 Vue d'ensemble

Cette documentation décrit les endpoints REST API déployés sur Firebase Cloud Functions pour le système de gestion de signalements routiers.

**Base URL** : `https://us-central1-projet-cloud-e2146.cloudfunctions.net/`

**Région** : us-central1 (par défaut)

---

## 🔐 Authentification

### 1. POST /register

**Description** : Inscription d'un nouvel utilisateur avec le rôle "Utilisateur" par défaut.

**URL complète** : `https://us-central1-projet-cloud-e2146.cloudfunctions.net/register`

**Méthode HTTP** : `POST`

**Headers** :

```json
{
  "Content-Type": "application/json"
}
```

**Corps de la requête** :

```json
{
  "email": "user@example.mg",
  "password": "Password123",
  "nom": "Rakoto",
  "prenom": "Jean",
  "telephone": "+261340000000"
}
```

**Champs** :

- `email` (string, requis) : Email valide
- `password` (string, requis) : Min 8 caractères, 1 lettre, 1 chiffre
- `nom` (string, requis) : Nom de famille
- `prenom` (string, requis) : Prénom
- `telephone` (string, optionnel) : Numéro de téléphone

**Réponse succès (201)** :

```json
{
  "success": true,
  "user": {
    "id": "abc123xyz",
    "email": "user@example.mg",
    "nom": "Rakoto",
    "prenom": "Jean",
    "telephone": "+261340000000",
    "role": "roleId123",
    "date_creation": "2026-01-27T10:30:00.000Z",
    "date_modification": "2026-01-27T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Réponses erreur** :

```json
// 400 - Validation échouée
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email, password, nom et prenom sont requis"
  }
}

// 400 - Email déjà utilisé
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "Email déjà utilisé"
  }
}

// 400 - Format email invalide
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Format email invalide"
  }
}

// 400 - Mot de passe faible
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Le mot de passe doit contenir au moins 8 caractères, 1 lettre et 1 chiffre"
  }
}
```

---

### 2. POST /login

**Description** : Connexion d'un utilisateur existant.

**URL complète** : `https://us-central1-projet-cloud-e2146.cloudfunctions.net/login`

**Méthode HTTP** : `POST`

**Headers** :

```json
{
  "Content-Type": "application/json"
}
```

**Corps de la requête** :

```json
{
  "email": "user@example.mg",
  "password": "Password123"
}
```

**Réponse succès (200)** :

```json
{
  "success": true,
  "user": {
    "id": "abc123xyz",
    "email": "user@example.mg",
    "nom": "Rakoto",
    "prenom": "Jean",
    "telephone": "+261340000000",
    "role": "roleId123",
    "date_creation": "2026-01-27T10:30:00.000Z",
    "date_modification": "2026-01-27T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Réponses erreur** :

```json
// 400 - Champs manquants
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email et password requis"
  }
}

// 401 - Identifiants incorrects
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email ou mot de passe incorrect"
  }
}

// 404 - Utilisateur non trouvé
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "Utilisateur non trouvé"
  }
}
```

---

### 3. GET /me

**Description** : Récupérer les informations de l'utilisateur connecté.

**URL complète** : `https://us-central1-projet-cloud-e2146.cloudfunctions.net/me`

**Méthode HTTP** : `GET`

**Headers** :

```json
{
  "Authorization": "Bearer <token>"
}
```

**Réponse succès (200)** :

```json
{
  "success": true,
  "user": {
    "id": "abc123xyz",
    "email": "user@example.mg",
    "nom": "Rakoto",
    "prenom": "Jean",
    "telephone": "+261340000000",
    "role": "roleId123",
    "date_creation": "2026-01-27T10:30:00.000Z",
    "date_modification": "2026-01-27T10:30:00.000Z"
  }
}
```

**Réponses erreur** :

```json
// 401 - Token manquant
{
  "success": false,
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Token requis"
  }
}

// 401 - Token invalide
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token invalide"
  }
}

// 404 - Utilisateur non trouvé
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "Utilisateur non trouvé"
  }
}
```

---

### 4. PUT /update

**Description** : Mettre à jour le profil de l'utilisateur connecté.

**URL complète** : `https://us-central1-projet-cloud-e2146.cloudfunctions.net/update`

**Méthode HTTP** : `PUT`

**Headers** :

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

**Corps de la requête** :

```json
{
  "nom": "Nouveau Nom",
  "prenom": "Nouveau Prenom",
  "telephone": "+261340000001"
}
```

**Note** : Tous les champs sont optionnels.

**Réponse succès (200)** :

```json
{
  "success": true,
  "user": {
    "id": "abc123xyz",
    "email": "user@example.mg",
    "nom": "Nouveau Nom",
    "prenom": "Nouveau Prenom",
    "telephone": "+261340000001",
    "role": "roleId123",
    "date_creation": "2026-01-27T10:30:00.000Z",
    "date_modification": "2026-01-27T15:45:00.000Z"
  }
}
```

**Réponses erreur** :

```json
// 401 - Token manquant
{
  "success": false,
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Token requis"
  }
}

// 401 - Token invalide
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token invalide"
  }
}
```

---

### 5. POST /logout

**Description** : Déconnexion de l'utilisateur (côté client).

**URL complète** : `https://us-central1-projet-cloud-e2146.cloudfunctions.net/logout`

**Méthode HTTP** : `POST`

**Headers** :

```json
{
  "Authorization": "Bearer <token>"
}
```

**Réponse succès (200)** :

```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

## 📍 Signalements

### 6. GET /getSignalements

**Description** : Récupérer la liste des signalements avec pagination et filtres (accessible à tous, même sans authentification).

**URL complète** : `https://us-central1-projet-cloud-e2146.cloudfunctions.net/getSignalements`

**Méthode HTTP** : `GET`

**Headers** :

```json
{
  "Authorization": "Bearer <token>"
}
```

**Note** : Le header Authorization est optionnel.

**Paramètres query** :

- `page` (number, optionnel) : Numéro de page (défaut: 1)
- `limit` (number, optionnel) : Nombre d'éléments par page (défaut: 20)
- `id_utilisateur_createur` (string, optionnel) : Filtrer par créateur

**Exemple** : `/getSignalements?page=1&limit=10&id_utilisateur_createur=abc123`

**Réponse succès (200)** :

```json
{
  "success": true,
  "data": [
    {
      "id": "signalement123",
      "description": "Nid de poule important",
      "surface": 150.5,
      "budget": 5000000,
      "adresse": "Route Ambohijatovo",
      "localisation": {
        "type": "Point",
        "coordinates": [47.5079, -18.8792]
      },
      "date_creation": "2026-01-15T10:30:00Z",
      "date_modification": "2026-01-15T10:30:00.000Z",
      "id_utilisateur_createur": "user123",
      "avancement_signalements": [
        {
          "id": "avancement1",
          "statut_avancement": {
            "id": "statut1",
            "nom": "En cours"
          },
          "date_creation": "2026-01-16T08:00:00.000Z",
          "commentaire": ""
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Réponses erreur** :

```json
// 500 - Erreur serveur
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Erreur interne du serveur"
  }
}
```

---

### 7. POST /createSignalement

**Description** : Créer un nouveau signalement (authentification requise, utilisateur non bloqué).

**URL complète** : `https://us-central1-projet-cloud-e2146.cloudfunctions.net/createSignalement`

**Méthode HTTP** : `POST`

**Headers** :

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

**Corps de la requête** :

```json
{
  "description": "Nid de poule important sur la route",
  "surface": 150.5,
  "budget": 5000000,
  "adresse": "Route Ambohijatovo, Antananarivo",
  "localisation": {
    "type": "Point",
    "coordinates": [47.5079, -18.8792]
  },
  "id_entreprise": "entrepriseId123"
}
```

**Champs** :

- `description` (string, optionnel) : Description du signalement
- `surface` (number, requis) : Surface en m² (> 0)
- `budget` (number, requis) : Budget en Ariary (> 0)
- `adresse` (string, optionnel) : Adresse textuelle
- `localisation` (object, requis) : Coordonnées GPS [longitude, latitude]
- `id_entreprise` (string, optionnel) : ID de l'entreprise assignée

**Réponse succès (201)** :

```json
{
  "success": true,
  "data": {
    "id": "signalement123",
    "description": "Nid de poule important sur la route",
    "surface": 150.5,
    "budget": 5000000,
    "adresse": "Route Ambohijatovo, Antananarivo",
    "localisation": {
      "type": "Point",
      "coordinates": [47.5079, -18.8792]
    },
    "date_creation": "2026-01-27T10:30:00.000Z",
    "id_utilisateur_createur": "user123"
  }
}
```

**Réponses erreur** :

```json
// 401 - Non authentifié
{
  "success": false,
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Token requis"
  }
}

// 403 - Utilisateur bloqué
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Utilisateur bloqué"
  }
}

// 400 - Validation échouée
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Surface, budget et localisation requis"
  }
}

// 400 - Valeurs invalides
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Surface et budget doivent être supérieurs à 0"
  }
}
```

---

### 8. GET /getSignalement/:id

**Description** : Récupérer les détails d'un signalement spécifique (accessible à tous).

**URL complète** : `https://us-central1-projet-cloud-e2146.cloudfunctions.net/getSignalement/{id}`

**Méthode HTTP** : `GET`

**Paramètres URL** :

- `id` (string, requis) : ID du signalement

**Exemple** : `/getSignalement/signalement123`

**Réponse succès (200)** :

```json
{
  "success": true,
  "data": {
    "id": "signalement123",
    "description": "Nid de poule important",
    "surface": 150.5,
    "budget": 5000000,
    "adresse": "Route Ambohijatovo",
    "localisation": {
      "type": "Point",
      "coordinates": [47.5079, -18.8792]
    },
    "date_creation": "2026-01-15T10:30:00Z",
    "date_modification": "2026-01-15T10:30:00.000Z",
    "id_utilisateur_createur": "user123",
    "avancement_signalements": [
      {
        "id": "avancement1",
        "statut_avancement": {
          "id": "statut1",
          "nom": "En cours"
        },
        "date_creation": "2026-01-16T08:00:00.000Z",
        "commentaire": ""
      }
    ]
  }
}
```

**Réponses erreur** :

```json
// 400 - ID manquant
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ID requis"
  }
}

// 404 - Signalement non trouvé
{
  "success": false,
  "error": {
    "code": "SIGNALEMENT_NOT_FOUND",
    "message": "Signalement non trouvé"
  }
}
```

---

### 9. PUT /updateSignalement/:id

**Description** : Mettre à jour un signalement (uniquement Manager).

**URL complète** : `https://us-central1-projet-cloud-e2146.cloudfunctions.net/updateSignalement/{id}`

**Méthode HTTP** : `PUT`

**Headers** :

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

**Paramètres URL** :

- `id` (string, requis) : ID du signalement

**Corps de la requête** :

```json
{
  "description": "Description mise à jour",
  "surface": 200.0,
  "budget": 6000000,
  "adresse": "Nouvelle adresse"
}
```

**Note** : Tous les champs sont optionnels.

**Réponse succès (200)** :

```json
{
  "success": true,
  "data": {
    "id": "signalement123",
    "description": "Description mise à jour",
    "surface": 200.0,
    "budget": 6000000,
    "adresse": "Nouvelle adresse",
    "date_modification": "2026-01-27T15:45:00.000Z"
  }
}
```

**Réponses erreur** :

```json
// 401 - Non authentifié
{
  "success": false,
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Token requis"
  }
}

// 403 - Non autorisé (pas Manager)
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Seuls les Managers peuvent modifier les signalements"
  }
}

// 400 - ID manquant
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ID requis"
  }
}
```

---

### 10. DELETE /deleteSignalement/:id

**Description** : Supprimer un signalement (uniquement Manager).

**URL complète** : `https://us-central1-projet-cloud-e2146.cloudfunctions.net/deleteSignalement/{id}`

**Méthode HTTP** : `DELETE`

**Headers** :

```json
{
  "Authorization": "Bearer <token>"
}
```

**Paramètres URL** :

- `id` (string, requis) : ID du signalement

**Réponse succès (200)** :

```json
{
  "success": true,
  "message": "Signalement supprimé avec succès"
}
```

**Réponses erreur** :

```json
// 401 - Non authentifié
{
  "success": false,
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Token requis"
  }
}

// 403 - Non autorisé (pas Manager)
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Seuls les Managers peuvent supprimer les signalements"
  }
}

// 400 - ID manquant
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ID requis"
  }
}
```

---

## 📊 Statuts d'avancement

### 11. GET /getStatuts

**Description** : Récupérer la liste de tous les statuts d'avancement possibles (accessible à tous).

**URL complète** : `https://us-central1-projet-cloud-e2146.cloudfunctions.net/getStatuts`

**Méthode HTTP** : `GET`

**Réponse succès (200)** :

```json
{
  "success": true,
  "data": [
    {
      "id": "statut1",
      "nom": "En attente",
      "valeur": 0
    },
    {
      "id": "statut2",
      "nom": "En cours",
      "valeur": 25
    },
    {
      "id": "statut3",
      "nom": "En validation",
      "valeur": 50
    },
    {
      "id": "statut4",
      "nom": "Validé",
      "valeur": 75
    },
    {
      "id": "statut5",
      "nom": "Terminé",
      "valeur": 100
    }
  ]
}
```

**Réponses erreur** :

```json
// 500 - Erreur serveur
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Erreur interne du serveur"
  }
}
```

---

## 📈 Statistiques

### 12. GET /getStats

**Description** : Récupérer les statistiques globales du système (accessible à tous).

**URL complète** : `https://us-central1-projet-cloud-e2146.cloudfunctions.net/getStats`

**Méthode HTTP** : `GET`

**Réponse succès (200)** :

```json
{
  "success": true,
  "data": {
    "total_signalements": 45,
    "total_surface": 6825.3,
    "total_budget": 225000000,
    "avancement_moyen": 42.5,
    "signalements_par_statut": [
      {
        "statut": "En attente",
        "count": 12
      },
      {
        "statut": "En cours",
        "count": 18
      },
      {
        "statut": "En validation",
        "count": 8
      },
      {
        "statut": "Validé",
        "count": 5
      },
      {
        "statut": "Terminé",
        "count": 2
      }
    ]
  }
}
```

**Réponses erreur** :

```json
// 500 - Erreur serveur
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Erreur interne du serveur"
  }
}
```

---

## � Synchronisation

### 13. POST /syncToBackend

**Description** : Synchroniser les données Firestore vers le backend Spring Boot. Récupère toutes les données non synchronisées (synchro = false), les envoie au backend, puis met à jour synchro = true.

**URL complète** : `https://us-central1-projet-cloud-e2146.cloudfunctions.net/syncToBackend`

**Méthode HTTP** : `POST`

**Authentification** : ❌ Non requise (endpoint public pour le backend Spring Boot)

**Headers** :

```json
{
  "Content-Type": "application/json"
}
```

**Corps de la requête** : Aucun

**Réponse succès (200)** :

```json
{
  "success": true,
  "data": {
    "synced": 15,
    "timestamp": "2026-01-27T14:30:45.123Z",
    "data": {
      "roles": [
        {
          "id": "role123",
          "nom": "Administrateur",
          "synchro": false
        }
      ],
      "entreprises": [
        {
          "id": "entr001",
          "nom": "BTP Rénovation",
          "synchro": false
        },
        {
          "id": "entr002",
          "nom": "Eco-Construction",
          "synchro": false
        }
      ],
      "statuts_avancement": [
        {
          "id": "statut001",
          "nom": "Nouveau",
          "valeur": 0,
          "synchro": false
        }
      ],
      "parametres": [
        {
          "id": "param001",
          "nb_tentatives_connexion": 5,
          "duree_session": 3600,
          "synchro": false
        }
      ],
      "utilisateurs": [
        {
          "id": "user001",
          "email": "jean.dupont@email.com",
          "password": "hashed_password",
          "id_role": "role123",
          "synchro": false
        }
      ],
      "utilisateurs_bloques": [
        {
          "id": "block001",
          "id_utilisateur": "user003",
          "date_blocage": "2023-10-25T14:00:00.000Z",
          "synchro": false
        }
      ],
      "signalements": [
        {
          "id": "signal001",
          "date_creation": "2023-11-01T09:30:00.000Z",
          "surface": 45.5,
          "budget": 15000,
          "localisation": {
            "latitude": 18.9,
            "longitude": 47.5
          },
          "id_utilisateur_createur": "user001",
          "id_entreprise": "entr001",
          "synchro": false
        }
      ],
      "avancements_signalement": [
        {
          "id": "avanc001",
          "date_modification": "2023-11-02T10:00:00.000Z",
          "id_utilisateur": "user001",
          "id_statut_avancement": "statut001",
          "id_signalement": "signal001",
          "synchro": false
        }
      ]
    },
    "updated": {
      "roles": ["role123"],
      "entreprises": ["entr001", "entr002"],
      "statuts_avancement": ["statut001"],
      "parametres": ["param001"],
      "utilisateurs": ["user001"],
      "utilisateurs_bloques": ["block001"],
      "signalements": ["signal001"],
      "avancements_signalement": ["avanc001"]
    }
  }
}
```

**Structure de la réponse** :

- `success` (boolean) : Statut de la requête
- `data.synced` (number) : Nombre total de documents synchronisés
- `data.timestamp` (string) : Horodatage de la synchronisation (ISO 8601)
- `data.data` (object) : Données par collection avec synchro = false
  - Chaque collection contient un tableau d'objets avec leurs IDs
  - Les `Timestamp` Firestore sont convertis en ISO 8601 strings
  - Les `GeoPoint` sont convertis en objets `{latitude, longitude}`
- `data.updated` (object) : Liste des IDs de documents mis à jour par collection

**Réponse si aucune donnée à synchroniser (200)** :

```json
{
  "success": true,
  "data": {
    "synced": 0,
    "timestamp": "2026-01-27T14:30:45.123Z",
    "data": {},
    "updated": {}
  }
}
```

**Réponses erreur** :

```json
// 500 - Erreur lors de la synchronisation
{
  "success": false,
  "error": {
    "code": "SYNC_ERROR",
    "message": "Erreur lors de la synchronisation"
  }
}

// 405 - Méthode non autorisée
{
  "success": false,
  "error": {
    "code": "METHOD_NOT_ALLOWED",
    "message": "Méthode non autorisée"
  }
}
```

**Collections synchronisées** :

1. `roles`
2. `entreprises`
3. `statuts_avancement`
4. `parametres`
5. `utilisateurs`
6. `utilisateurs_bloques`
7. `signalements`
8. `avancements_signalement`

**Notes importantes** :

- ⚠️ Après synchronisation, tous les documents récupérés auront `synchro = true`
- 📦 Limite Firestore : 500 opérations par batch (gérée automatiquement)
- 🔄 Conversion automatique des types Firestore :
  - `Timestamp` → ISO 8601 string
  - `GeoPoint` → `{latitude: number, longitude: number}`
- 🚀 Idéal pour appel périodique depuis Spring Boot (cron job)

**Exemple d'utilisation depuis Spring Boot** :

```java
// RestTemplate
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
```

---

## �🔑 Codes d'erreur

| Code                    | Message                        | Description                 |
| ----------------------- | ------------------------------ | --------------------------- |
| `AUTH_REQUIRED`         | Token requis                   | Authentification nécessaire |
| `UNAUTHORIZED`          | Token invalide                 | Token expiré ou invalide    |
| `FORBIDDEN`             | Accès interdit                 | Permissions insuffisantes   |
| `VALIDATION_ERROR`      | Erreur de validation           | Données invalides           |
| `EMAIL_EXISTS`          | Email déjà utilisé             | Email déjà enregistré       |
| `INVALID_CREDENTIALS`   | Identifiants incorrects        | Email/password incorrects   |
| `USER_NOT_FOUND`        | Utilisateur non trouvé         | Utilisateur inexistant      |
| `SIGNALEMENT_NOT_FOUND` | Signalement non trouvé         | Signalement inexistant      |
| `METHOD_NOT_ALLOWED`    | Méthode non autorisée          | Mauvaise méthode HTTP       |
| `SYNC_ERROR`            | Erreur lors de synchronisation | Échec de synchronisation    |
| `INTERNAL_ERROR`        | Erreur interne du serveur      | Erreur non prévue           |

---

## 🌐 CORS

Toutes les APIs supportent CORS avec :

- **Origins** : `*` (tous les domaines)
- **Methods** : `GET, POST, PUT, DELETE, OPTIONS`
- **Headers** : `Content-Type, Authorization`

---

## 🔒 Sécurité

### Authentification

- Les tokens JWT sont générés via Firebase Authentication
- Les tokens doivent être envoyés dans le header `Authorization: Bearer <token>`
- Les tokens ont une durée de validité configurée par Firebase

### Rôles et permissions

- **Visiteurs** : Lecture des signalements et statuts uniquement
- **Utilisateur** : Création de signalements + droits visiteurs
- **Manager** : Tous les droits (création, modification, suppression)

### Blocage d'utilisateurs

Les utilisateurs bloqués ne peuvent pas :

- Créer de nouveaux signalements
- Modifier des signalements existants

---

## 📝 Notes importantes

1. **Pagination** : Par défaut, `getSignalements` retourne 20 éléments par page
2. **Localisation** : Format GeoPoint [longitude, latitude]
3. **Dates** : Format ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
4. **IDs** : Générés automatiquement par Firestore
5. **Token** : Valide tant que l'utilisateur ne se déconnecte pas (géré par Firebase Auth)

---

## 🧪 Test avec cURL

```bash
# Register
curl -X POST https://us-central1-projet-cloud-e2146.cloudfunctions.net/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.mg","password":"Test1234","nom":"Test","prenom":"User"}'

# Login
curl -X POST https://us-central1-projet-cloud-e2146.cloudfunctions.net/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.mg","password":"Test1234"}'

# Get signalements
curl https://us-central1-projet-cloud-e2146.cloudfunctions.net/getSignalements?page=1&limit=10

# Get statuts
curl https://us-central1-projet-cloud-e2146.cloudfunctions.net/getStatuts

# Get stats
curl https://us-central1-projet-cloud-e2146.cloudfunctions.net/getStats

# Synchronisation (pour backend Spring Boot)
curl -X POST https://us-central1-projet-cloud-e2146.cloudfunctions.net/syncToBackend \
  -H "Content-Type: application/json"
```

---

**Date de dernière mise à jour** : 27 janvier 2026  
**Version API** : 1.0.0
