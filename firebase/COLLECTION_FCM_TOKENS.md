# Collection utilisateurs_fcm_tokens

## 📋 Description

Collection dédiée pour stocker les tokens FCM (Firebase Cloud Messaging) des utilisateurs. Cette collection est **séparée** de la collection `utilisateurs` pour éviter les conflits avec la synchronisation bidirectionnelle PostgreSQL-Firebase.

## 🎯 Pourquoi une collection séparée ?

### Problème Initial

La collection `utilisateurs` est synchronisée avec PostgreSQL via le backend Spring Boot :

- PostgreSQL → Firebase (PUSH)
- Firebase → PostgreSQL (PULL)

Lors du PUSH, le backend écrase les documents Firestore avec les données de PostgreSQL, qui **ne contient pas** le champ `fcm_token`. Résultat : le token disparaît après chaque synchronisation.

### Solution

Créer une collection **indépendante** `utilisateurs_fcm_tokens` qui :

- ✅ N'est **jamais synchronisée** avec PostgreSQL
- ✅ Est gérée uniquement par Firebase Functions
- ✅ Évite toute perte de données
- ✅ Permet de gérer plusieurs devices par utilisateur (extension future)

---

## 📊 Structure de la Collection

### Nom de la collection

```
utilisateurs_fcm_tokens
```

### Structure d'un document

**ID du document** : `{id_utilisateur}` (ID numérique de l'utilisateur)

**Champs** :

| Champ                  | Type        | Description                                                       | Obligatoire |
| ---------------------- | ----------- | ----------------------------------------------------------------- | ----------- |
| `id_utilisateur`       | `number`    | ID numérique de l'utilisateur (clé étrangère vers `utilisateurs`) | Oui         |
| `fcm_token`            | `string`    | Token FCM de l'appareil                                           | Oui         |
| `fcm_token_updated_at` | `timestamp` | Date de dernière mise à jour du token (serverTimestamp)           | Oui         |
| `last_updated`         | `string`    | Date ISO 8601 de dernière mise à jour                             | Oui         |

**Exemple de document** :

```json
{
  "id_utilisateur": 3,
  "fcm_token": "fZj8X9kR2E4:APA91bF...",
  "fcm_token_updated_at": "2024-01-15T10:30:00.000Z",
  "last_updated": "2024-01-15T10:30:00.000Z"
}
```

---

## 🔧 Fonctions Utilisant Cette Collection

### 1. updateFcmToken (PUT /api/utilisateurs/fcm-token)

**Fichier** : `firebase/functions/src/utilisateurs/updateFcmToken.ts`

**Action** : Enregistre ou met à jour le token FCM

```typescript
const fcmTokenRef = db
  .collection("utilisateurs_fcm_tokens")
  .doc(userInfo.id.toString());

await fcmTokenRef.set(
  {
    id_utilisateur: userInfo.id,
    fcm_token: fcm_token,
    fcm_token_updated_at: admin.firestore.FieldValue.serverTimestamp(),
    last_updated: new Date().toISOString(),
  },
  { merge: true },
);
```

**Effet** : Crée ou met à jour le document avec l'ID de l'utilisateur.

---

### 2. deleteFcmToken (DELETE /api/utilisateurs/fcm-token)

**Fichier** : `firebase/functions/src/utilisateurs/updateFcmToken.ts`

**Action** : Supprime le token FCM lors de la déconnexion

```typescript
const fcmTokenRef = db
  .collection("utilisateurs_fcm_tokens")
  .doc(userInfo.id.toString());
await fcmTokenRef.delete();
```

**Effet** : Supprime complètement le document du token.

---

### 3. notifyUserOnAvancement (Trigger onCreate)

**Fichier** : `firebase/functions/src/signalements/notifyUserOnAvancement.ts`

**Action** : Récupère le token pour envoyer une notification

```typescript
const fcmTokenDoc = await admin
  .firestore()
  .collection("utilisateurs_fcm_tokens")
  .doc(idUtilisateur.toString())
  .get();

if (!fcmTokenDoc.exists) {
  console.warn(
    `⚠️  Utilisateur ${idUtilisateur} n'a pas de token FCM enregistré`,
  );
  return;
}

const fcmToken = fcmTokenDoc.data()?.fcm_token;
```

**Effet** : Lit le token depuis la collection dédiée au lieu de la collection `utilisateurs`.

---

## 🔒 Règles de Sécurité Firestore

Ajoutez ces règles dans `firestore.rules` :

```javascript
// Règles pour la collection utilisateurs_fcm_tokens
match /utilisateurs_fcm_tokens/{tokenId} {
  // Seules les Cloud Functions peuvent écrire
  allow read, write: if false;

  // Si vous voulez permettre aux utilisateurs de lire leur propre token (optionnel)
  // allow read: if request.auth != null && request.auth.uid == tokenId;
}
```

**Important** : Cette collection est gérée **uniquement** par les Cloud Functions pour des raisons de sécurité.

---

## 📈 Migration des Données Existantes (Optionnel)

Si vous avez déjà des tokens dans la collection `utilisateurs`, vous pouvez migrer avec ce script :

```typescript
// scripts/migrate-fcm-tokens.ts
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

async function migrateFcmTokens() {
  const utilisateursSnapshot = await db
    .collection("utilisateurs")
    .where("fcm_token", "!=", null)
    .get();

  let migrated = 0;

  for (const doc of utilisateursSnapshot.docs) {
    const data = doc.data();
    const userId = data.id;
    const fcmToken = data.fcm_token;

    if (userId && fcmToken) {
      await db
        .collection("utilisateurs_fcm_tokens")
        .doc(userId.toString())
        .set({
          id_utilisateur: userId,
          fcm_token: fcmToken,
          fcm_token_updated_at:
            data.fcm_token_updated_at ||
            admin.firestore.FieldValue.serverTimestamp(),
          last_updated: new Date().toISOString(),
        });

      migrated++;
      console.log(`✅ Migré token pour utilisateur ${userId}`);
    }
  }

  console.log(`\n✅ Migration terminée : ${migrated} tokens migrés`);
}

migrateFcmTokens().catch(console.error);
```

**Exécution** :

```bash
cd firebase/scripts
ts-node migrate-fcm-tokens.ts
```

---

## 🧪 Tests

### 1. Test d'Enregistrement du Token

```bash
curl -X PUT https://us-central1-projet-cloud-e2146.cloudfunctions.net/updateFcmToken \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "fcm_token": "fZj8X9kR2E4:APA91bF..."
  }'
```

**Vérification** :

```bash
firebase firestore:get utilisateurs_fcm_tokens/3
```

**Attendu** :

```json
{
  "id_utilisateur": 3,
  "fcm_token": "fZj8X9kR2E4:APA91bF...",
  "fcm_token_updated_at": "...",
  "last_updated": "..."
}
```

---

### 2. Test de Suppression du Token

```bash
curl -X DELETE https://us-central1-projet-cloud-e2146.cloudfunctions.net/deleteFcmToken \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Vérification** :

```bash
firebase firestore:get utilisateurs_fcm_tokens/3
```

**Attendu** : Document non trouvé

---

### 3. Test de Notification

```bash
# 1. S'assurer que le token existe
firebase firestore:get utilisateurs_fcm_tokens/3

# 2. Créer un avancement de signalement
firebase firestore:set avancements_signalement/99999 '{
  "id": 99999,
  "id_signalement": 1,
  "id_statut_avancement": 2,
  "id_utilisateur": 3,
  "description": "Test notification",
  "date_modification": "2024-01-15T10:30:00Z",
  "synchro": false
}'

# 3. Vérifier les logs
firebase functions:log --only notifyUserOnAvancement --limit 10
```

**Attendu dans les logs** :

```
✅ Token FCM récupéré pour l'utilisateur 3
✅ Notification envoyée avec succès à l'utilisateur 3
```

---

## 🔄 Comparaison Avant/Après

### ❌ Avant (Collection `utilisateurs`)

```
utilisateurs/3
{
  "id": 3,
  "email": "user@example.com",
  "password": "...",
  "id_role": 2,
  "fcm_token": "abc123...",  // ❌ Supprimé lors de la synchro PUSH
  "synchro": true
}
```

**Problème** : Le champ `fcm_token` disparaît après la synchronisation.

---

### ✅ Après (Collection dédiée)

```
utilisateurs/3
{
  "id": 3,
  "email": "user@example.com",
  "password": "...",
  "id_role": 2,
  "synchro": true
  // ✅ Pas de fcm_token ici
}

utilisateurs_fcm_tokens/3
{
  "id_utilisateur": 3,
  "fcm_token": "abc123...",  // ✅ Préservé, jamais touché par la synchro
  "fcm_token_updated_at": "...",
  "last_updated": "..."
}
```

**Avantage** : Le token FCM est complètement isolé de la synchronisation PostgreSQL.

---

## 📊 Indexes Recommandés

Créez un index composite dans `firestore.indexes.json` :

```json
{
  "indexes": [
    {
      "collectionGroup": "utilisateurs_fcm_tokens",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "id_utilisateur", "order": "ASCENDING" },
        { "fieldPath": "fcm_token_updated_at", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**Déploiement** :

```bash
firebase deploy --only firestore:indexes
```

---

## 🚀 Extensions Futures

### Support de Plusieurs Devices par Utilisateur

Actuellement, un utilisateur = un token. Pour supporter plusieurs devices :

**Nouvelle structure** :

```
utilisateurs_fcm_tokens/3/devices/{device_id}
{
  "id_utilisateur": 3,
  "fcm_token": "abc123...",
  "device_id": "device-uuid-1234",
  "platform": "android", // ou "ios", "web"
  "device_name": "Samsung Galaxy S21",
  "fcm_token_updated_at": "...",
  "last_used": "..."
}
```

**Modification de notifyUserOnAvancement** :

```typescript
// Récupérer tous les tokens de l'utilisateur
const tokensSnapshot = await admin
  .firestore()
  .collection("utilisateurs_fcm_tokens")
  .doc(idUtilisateur.toString())
  .collection("devices")
  .get();

const tokens = tokensSnapshot.docs.map(doc => doc.data().fcm_token);

// Envoyer à tous les devices
const messages = tokens.map(token => ({
  token,
  notification: { title, body },
  data: { ... }
}));

await admin.messaging().sendAll(messages);
```

---

## ✅ Checklist de Déploiement

- [x] Fonctions modifiées (`updateFcmToken`, `deleteFcmToken`, `notifyUserOnAvancement`)
- [ ] Règles Firestore ajoutées dans `firestore.rules`
- [ ] Indexes créés dans `firestore.indexes.json`
- [ ] Déploiement des fonctions (`firebase deploy --only functions`)
- [ ] Déploiement des règles (`firebase deploy --only firestore:rules`)
- [ ] Déploiement des indexes (`firebase deploy --only firestore:indexes`)
- [ ] Migration des tokens existants (si nécessaire)
- [ ] Tests d'enregistrement de token
- [ ] Tests de suppression de token
- [ ] Tests de notification
- [ ] Documentation API mise à jour

---

**Date de création** : 10 février 2026  
**Version** : 1.0.0  
**Status** : ✅ Implémenté
