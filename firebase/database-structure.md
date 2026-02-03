# Structure de la base de données Firestore - Système de Signalements

## Collections principales

### roles

- **Description** : Rôles des utilisateurs du système
- **Champs** :
  - `nom` (string) - Nom du rôle : "Manager" ou "Utilisateur"
  - `synchro` (boolean) - Indicateur de synchronisation avec la base locale
- **Contraintes** :
  - Seulement 2 rôles possibles : Manager et Utilisateur
  - Les Managers ont tous les droits (lecture/modification)
  - Les Utilisateurs peuvent uniquement créer et voir les signalements

### entreprises

- **Description** : Entreprises assignées aux signalements
- **Champs** :
  - `nom` (string) - Nom de l'entreprise (unique)
  - `synchro` (boolean) - Indicateur de synchronisation
- **Exemples** : JIRAMA, TelMa, Air Madagascar, Orange Madagascar

### statuts_avancement

- **Description** : États possibles d'avancement d'un signalement
- **Champs** :
  - `nom` (string) - Nom du statut (unique)
  - `valeur` (number) - Valeur de progression (0-100, unique)
  - `synchro` (boolean) - Indicateur de synchronisation
- **Statuts standards** :
  - En attente (0%)
  - En cours (25%)
  - En validation (50%)
  - Validé (75%)
  - Terminé (100%)

### parametres

- **Description** : Configuration système globale
- **Champs** :
  - `nb_tentatives_connexion` (number) - Nombre de tentatives avant blocage
  - `duree_session` (number) - Durée de session en secondes
  - `synchro` (boolean) - Indicateur de synchronisation

### utilisateurs

- **Description** : Profils utilisateurs du système
- **Champs** :
  - `email` (string) - Email de l'utilisateur (identifiant)
  - `password` (string) - Mot de passe hashé
  - `id_role` (string) - Référence vers roles/{id}
  - `synchro` (boolean) - Indicateur de synchronisation
- **Relations** :
  - Lié à un rôle via `id_role`
  - Correspondance avec Firebase Authentication (même UID)
- **Règles de sécurité** :
  - Un utilisateur peut lire/modifier son propre profil
  - Les Managers peuvent lire/modifier tous les profils
  - À la création, seul le rôle "Utilisateur" est autorisé (pas d'auto-promotion Manager)

### utilisateurs_bloques

- **Description** : Liste des utilisateurs bloqués
- **Champs** :
  - `id_utilisateur` (string) - Référence vers utilisateurs/{id}
  - `date_blocage` (timestamp) - Date et heure du blocage
  - `synchro` (boolean) - Indicateur de synchronisation
- **Impact** :
  - Les utilisateurs bloqués ne peuvent pas créer/modifier de signalements
  - Seuls les Managers peuvent bloquer/débloquer des utilisateurs

### signalements

- **Description** : Signalements créés par les utilisateurs
- **Champs** :
  - `date_creation` (string) - Date de création au format ISO 8601
  - `surface` (number) - Surface concernée en m² (doit être > 0)
  - `budget` (number) - Budget estimé en Ariary (doit être > 0)
  - `localisation` (geopoint) - Position GPS (latitude, longitude)
  - `id_utilisateur_createur` (string) - Référence vers utilisateurs/{id}
  - `id_entreprise` (string) - Référence vers entreprises/{id}
  - `synchro` (boolean) - Indicateur de synchronisation
- **Relations** :
  - Créé par un utilisateur via `id_utilisateur_createur`
  - Assigné à une entreprise via `id_entreprise`
  - Suivi d'avancement via avancements_signalement
- **Règles de sécurité** :
  - **Lecture** : Accessible à TOUS (même visiteurs non authentifiés)
  - **Création** : Utilisateurs authentifiés et non bloqués uniquement
  - **Modification** : Uniquement les Managers
  - **Suppression** : Uniquement les Managers
  - **Validation** : surface > 0 et budget > 0

### avancements_signalement

- **Description** : Historique des changements de statut des signalements
- **Champs** :
  - `id_signalement` (string) - Référence vers signalements/{id}
  - `id_utilisateur` (string) - Utilisateur ayant effectué la modification
  - `id_statut_avancement` (string) - Référence vers statuts_avancement/{id}
  - `date_modification` (timestamp) - Date et heure de la modification
  - `synchro` (boolean) - Indicateur de synchronisation
- **Relations** :
  - Lié à un signalement via `id_signalement`
  - Créé par un utilisateur via `id_utilisateur`
  - Référence un statut via `id_statut_avancement`
- **Règles de sécurité** :
  - **Lecture** : Visible par tous (comme les signalements)
  - **Création** : Uniquement les Managers
  - **Modification** : Uniquement les Managers
  - **Suppression** : Uniquement les Managers

## Schéma des relations

```
roles (1) ←──── (N) utilisateurs
                     ↓ (1)
                     ↓
                     ↓ crée
                     ↓
entreprises (1) ←──── (N) signalements
                          ↓ (1)
                          ↓
                          ↓ suivi par
                          ↓
statuts_avancement (1) ←──── (N) avancements_signalement
```

## Logique métier

### Rôles et permissions

- **Manager** :
  - Lecture/modification/suppression de tous les signalements
  - Création/modification des avancements de signalement
  - Gestion des utilisateurs et des blocages
  - Accès aux paramètres système

- **Utilisateur** :
  - Création de signalements
  - Lecture de TOUS les signalements (lecture publique)
  - Pas de modification des signalements
  - Pas de gestion des avancements

- **Visiteurs (non authentifiés)** :
  - Lecture de TOUS les signalements uniquement

### Synchronisation

Le champ `synchro` dans chaque collection permet de gérer la synchronisation entre :

- L'application mobile (base locale SQLite)
- La base de données Firestore (cloud)

### Blocage d'utilisateurs

- Système de tentatives de connexion configuré via `parametres.nb_tentatives_connexion`
- Après X tentatives échouées, l'utilisateur est ajouté à `utilisateurs_bloques`
- Les utilisateurs bloqués ne peuvent plus créer/modifier de contenu
- Seuls les Managers peuvent débloquer

## Index composites

Les index suivants sont définis pour optimiser les requêtes :

1. **Signalements par créateur** : `id_utilisateur_createur` (ASC) + `date_creation` (DESC)
2. **Signalements par entreprise** : `id_entreprise` (ASC) + `date_creation` (DESC)
3. **Signalements à synchroniser** : `synchro` (ASC) + `date_creation` (DESC)
4. **Signalements par budget** : `id_entreprise` (ASC) + `budget` (ASC)
5. **Avancements par signalement** : `id_signalement` (ASC) + `date_modification` (DESC)
6. **Avancements par utilisateur** : `id_utilisateur` (ASC) + `date_modification` (DESC)
7. **Avancements complexes** : `id_signalement` (ASC) + `id_statut_avancement` (ASC) + `date_modification` (DESC)
8. **Utilisateurs par rôle** : `id_role` (ASC) + `email` (ASC)
9. **Blocages par utilisateur** : `id_utilisateur` (ASC) + `date_blocage` (DESC)
