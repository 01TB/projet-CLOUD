# Conventions Firebase - Structure des Collections NoSQL

Ce document décrit le format de chaque collection Firestore utilisée dans le projet.

## 📋 Collections

### 1. `roles`

Collection des rôles utilisateurs dans l'application.

| Champ     | Type    | Description                                                     |
| --------- | ------- | --------------------------------------------------------------- |
| `nom`     | string  | Nom du rôle (ex: "Administrateur", "Utilisateur", "Entreprise") |
| `synchro` | boolean | Indicateur de synchronisation                                   |

---

### 2. `entreprises`

Collection des entreprises enregistrées dans le système.

| Champ     | Type    | Description                   |
| --------- | ------- | ----------------------------- |
| `nom`     | string  | Nom de l'entreprise           |
| `synchro` | boolean | Indicateur de synchronisation |

---

### 3. `statuts_avancement`

Collection des différents statuts d'avancement des signalements.

| Champ     | Type    | Description                                                              |
| --------- | ------- | ------------------------------------------------------------------------ |
| `nom`     | string  | Nom du statut (ex: "Nouveau", "En cours d'analyse", "Travaux commencés") |
| `valeur`  | number  | Valeur numérique du statut (0-100 pour progression, -1 pour rejet)       |
| `synchro` | boolean | Indicateur de synchronisation                                            |

---

### 4. `parametres`

Collection des paramètres système de l'application.

| Champ                     | Type    | Description                                          |
| ------------------------- | ------- | ---------------------------------------------------- |
| `nb_tentatives_connexion` | number  | Nombre maximum de tentatives de connexion autorisées |
| `duree_session`           | number  | Durée de session en secondes                         |
| `synchro`                 | boolean | Indicateur de synchronisation                        |

---

### 5. `utilisateurs`

Collection des utilisateurs de l'application. L'ID du document correspond à l'UID Firebase Auth.

| Champ      | Type    | Description                                         |
| ---------- | ------- | --------------------------------------------------- |
| `email`    | string  | Adresse email de l'utilisateur                      |
| `password` | string  | Mot de passe hashé                                  |
| `id_role`  | string  | Référence à l'ID du rôle dans la collection `roles` |
| `synchro`  | boolean | Indicateur de synchronisation                       |

**Note:** Le document ID est l'UID Firebase Auth de l'utilisateur.

---

### 6. `utilisateurs_bloques`

Collection des utilisateurs bloqués dans le système.

| Champ            | Type      | Description                               |
| ---------------- | --------- | ----------------------------------------- |
| `id_utilisateur` | string    | Référence à l'UID de l'utilisateur bloqué |
| `date_blocage`   | Timestamp | Date et heure du blocage                  |
| `synchro`        | boolean   | Indicateur de synchronisation             |

---

### 7. `signalements`

Collection des signalements de travaux créés par les utilisateurs.

| Champ                     | Type      | Description                                          |
| ------------------------- | --------- | ---------------------------------------------------- |
| `date_creation`           | Timestamp | Date et heure de création du signalement             |
| `surface`                 | number    | Surface concernée par les travaux (en m²)            |
| `budget`                  | number    | Budget estimé ou alloué                              |
| `localisation`            | GeoPoint  | Coordonnées GPS du signalement (latitude, longitude) |
| `id_utilisateur_createur` | string    | Référence à l'UID de l'utilisateur créateur          |
| `id_entreprise`           | string    | Référence à l'ID de l'entreprise assignée            |
| `synchro`                 | boolean   | Indicateur de synchronisation                        |

---

### 8. `avancements_signalement`

Collection historisant les changements de statut des signalements.

| Champ                  | Type      | Description                                                |
| ---------------------- | --------- | ---------------------------------------------------------- |
| `id_signalement`       | string    | Référence à l'ID du signalement                            |
| `id_utilisateur`       | string    | Référence à l'UID de l'utilisateur ayant modifié le statut |
| `id_statut_avancement` | string    | Référence à l'ID du statut dans `statuts_avancement`       |
| `date_modification`    | Timestamp | Date et heure de la modification                           |
| `synchro`              | boolean   | Indicateur de synchronisation                              |

---

## 🔗 Relations entre collections

```
utilisateurs (UID)
    ├── id_role → roles (ID)
    └── utilisateur bloqué → utilisateurs_bloques.id_utilisateur

signalements (ID)
    ├── id_utilisateur_createur → utilisateurs (UID)
    ├── id_entreprise → entreprises (ID)
    └── historique → avancements_signalement.id_signalement

avancements_signalement (ID)
    ├── id_signalement → signalements (ID)
    ├── id_utilisateur → utilisateurs (UID)
    └── id_statut_avancement → statuts_avancement (ID)
```

---

## 📝 Notes importantes

1. **Champ `synchro`**: Présent dans toutes les collections pour gérer la synchronisation entre Firebase et d'autres systèmes.

2. **Types Firebase**:
   - `Timestamp`: Objet Firebase représentant une date/heure
   - `GeoPoint`: Objet Firebase pour les coordonnées géographiques (latitude, longitude)

3. **Références**: Les champs préfixés par `id_` sont des références vers d'autres documents dans d'autres collections.

4. **ID de document**: Pour la collection `utilisateurs`, l'ID du document Firestore est l'UID Firebase Authentication de l'utilisateur.
