# ⚠️ CHANGEMENT MAJEUR : Nouvelle Collection FCM Tokens

## 📅 Date : 10 février 2026

## 🔄 Résumé du Changement

Le système de gestion des tokens FCM a été **restructuré** pour résoudre un conflit avec la synchronisation bidirectionnelle PostgreSQL-Firebase.

### ❌ Ancienne Configuration

**Collection utilisée** : `utilisateurs`

```json
utilisateurs/{userId}
{
  "id": 3,
  "email": "user@example.com",
  "password": "...",
  "id_role": 2,
  "fcm_token": "abc123...",  // ❌ Supprimé par la synchro
  "fcm_token_updated_at": "...",
  "synchro": true
}
```

**Problème** : Lors de la synchronisation PUSH (PostgreSQL → Firebase), le backend écrasait les documents Firestore avec les données de PostgreSQL qui **ne contenait pas** le champ `fcm_token`. Résultat : le token disparaissait.

---

### ✅ Nouvelle Configuration

**Collection dédiée** : `utilisateurs_fcm_tokens`

```json
// Collection utilisateurs (inchangée)
utilisateurs/{userId}
{
  "id": 3,
  "email": "user@example.com",
  "password": "...",
  "id_role": 2,
  "synchro": true
  // Pas de fcm_token ici
}

// Nouvelle collection dédiée
utilisateurs_fcm_tokens/{userId}
{
  "id_utilisateur": 3,
  "fcm_token": "abc123...",  // ✅ Préservé
  "fcm_token_updated_at": "2024-01-15T10:30:00Z",
  "last_updated": "2024-01-15T10:30:00Z"
}
```

**Avantages** :

- ✅ Isolation complète de la synchronisation PostgreSQL
- ✅ Pas de perte de données
- ✅ Architecture plus propre
- ✅ Extension future facilitée (multi-devices)

---

## 🔧 Fichiers Modifiés

| Fichier                                                                           | Modification                                                   |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [updateFcmToken.ts](functions/src/utilisateurs/updateFcmToken.ts)                 | ✅ Utilise `utilisateurs_fcm_tokens` au lieu de `utilisateurs` |
| [deleteFcmToken.ts](functions/src/utilisateurs/updateFcmToken.ts)                 | ✅ Supprime de `utilisateurs_fcm_tokens`                       |
| [notifyUserOnAvancement.ts](functions/src/signalements/notifyUserOnAvancement.ts) | ✅ Lit depuis `utilisateurs_fcm_tokens`                        |
| [firestore.rules](firestore.rules)                                                | ✅ Ajout règles pour `utilisateurs_fcm_tokens`                 |

---

## 📋 Impact sur le Code Client

### ✅ Aucun Impact !

**Bonne nouvelle** : Le code client (VueJS/Ionic/Mobile) **n'a pas besoin d'être modifié**.

Les endpoints API restent identiques :

- `PUT /updateFcmToken` → Fonctionne de la même manière
- `DELETE /deleteFcmToken` → Fonctionne de la même manière

Seul le stockage backend a changé (de manière transparente pour le client).

```typescript
// Ce code continue de fonctionner sans modification
await axios.put(
  "/updateFcmToken",
  {
    fcm_token: fcmToken,
  },
  {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  },
);
```

---

## 🚀 Migration

### Option 1 : Migration Automatique (Recommandé)

Si vous avez déjà des tokens enregistrés dans la collection `utilisateurs`, utilisez le script de migration :

```bash
cd firebase/scripts
ts-node migrate-fcm-tokens.ts
```

**Ce script va** :

- ✅ Copier tous les tokens de `utilisateurs` vers `utilisateurs_fcm_tokens`
- ✅ Ignorer les tokens déjà migrés
- ✅ Afficher un rapport détaillé

**Optionnel : Nettoyer les anciens tokens**

```bash
ts-node migrate-fcm-tokens.ts --cleanup
```

Cela supprime les champs `fcm_token` et `fcm_token_updated_at` de la collection `utilisateurs`.

---

### Option 2 : Pas de Migration (Nouveaux Projets)

Si vous démarrez un nouveau projet ou si tous les utilisateurs vont se reconnecter :

1. Déployez les nouvelles fonctions
2. Les utilisateurs se reconnectent
3. Les tokens sont automatiquement enregistrés dans la nouvelle collection

---

## 📊 Comparaison Avant/Après

### Scénario : Création d'un avancement de signalement

#### ❌ Avant (avec le bug)

```
1. Utilisateur se connecte
   → Token FCM enregistré dans utilisateurs/3
   → fcm_token: "abc123..."

2. Création d'un avancement_signalement
   → Déclenche la synchronisation PULL (Firebase → PostgreSQL)
   → Puis PUSH (PostgreSQL → Firebase)

3. Synchronisation PUSH écrase le document
   → utilisateurs/3 n'a plus le champ fcm_token ❌

4. Trigger notifyUserOnAvancement
   → Cherche fcm_token dans utilisateurs/3
   → Token introuvable ❌
   → Log: "⚠️ Utilisateur 3 n'a pas de token FCM enregistré"
```

#### ✅ Après (corrigé)

```
1. Utilisateur se connecte
   → Token FCM enregistré dans utilisateurs_fcm_tokens/3
   → fcm_token: "abc123..."

2. Création d'un avancement_signalement
   → Synchronisation PULL/PUSH continue normalement
   → utilisateurs/3 est synchronisé (sans fcm_token)
   → utilisateurs_fcm_tokens/3 reste intact ✅

3. Trigger notifyUserOnAvancement
   → Cherche fcm_token dans utilisateurs_fcm_tokens/3
   → Token trouvé ✅
   → Notification envoyée avec succès ✅
```

---

## 🧪 Tests de Validation

### Test 1 : Enregistrer un token

```bash
curl -X PUT https://us-central1-projet-cloud-e2146.cloudfunctions.net/updateFcmToken \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"fcm_token": "test_token_123"}'
```

**Vérification** :

```bash
firebase firestore:get utilisateurs_fcm_tokens/3
```

**Attendu** :

```json
{
  "id_utilisateur": 3,
  "fcm_token": "test_token_123",
  "fcm_token_updated_at": "...",
  "last_updated": "..."
}
```

---

### Test 2 : Déclencher une synchronisation

```bash
# Créer un avancement de signalement
firebase firestore:set avancements_signalement/99999 '{
  "id": 99999,
  "id_signalement": 1,
  "id_statut_avancement": 2,
  "id_utilisateur": 3,
  "description": "Test",
  "synchro": false
}'

# Attendre 5 secondes puis vérifier
sleep 5
firebase firestore:get utilisateurs_fcm_tokens/3
```

**Attendu** : Le token est toujours présent ✅

---

### Test 3 : Recevoir une notification

```bash
# 1. Vérifier les logs de la fonction
firebase functions:log --only notifyUserOnAvancement --limit 5

# Attendu dans les logs:
# ✅ Token FCM récupéré pour l'utilisateur 3
# ✅ Notification envoyée avec succès
```

---

## 🔒 Nouvelles Règles de Sécurité

Les règles Firestore ont été mises à jour :

```javascript
// Collection UTILISATEURS_FCM_TOKENS
match /utilisateurs_fcm_tokens/{tokenId} {
  // Lecture/Écriture : Uniquement via Cloud Functions
  allow read, write: if false;
}
```

**Pourquoi ?**

- Les tokens FCM sont des données sensibles
- Seules les Cloud Functions (authentifiées) peuvent les modifier
- Aucun accès direct depuis le client

---

## 📚 Documentation

| Document                                                         | Description                         |
| ---------------------------------------------------------------- | ----------------------------------- |
| [COLLECTION_FCM_TOKENS.md](COLLECTION_FCM_TOKENS.md)             | Structure complète de la collection |
| [NOTIFICATION_FLOW_GUIDE.md](NOTIFICATION_FLOW_GUIDE.md)         | Guide du flux de notifications      |
| [INTEGRATION_EXAMPLES_README.md](INTEGRATION_EXAMPLES_README.md) | Exemples d'intégration              |
| [migrate-fcm-tokens.ts](scripts/migrate-fcm-tokens.ts)           | Script de migration                 |

---

## ✅ Checklist de Déploiement

### Backend Firebase Functions

- [x] ✅ Fonctions modifiées (updateFcmToken, deleteFcmToken, notifyUserOnAvancement)
- [ ] Déployer les fonctions : `firebase deploy --only functions`
- [ ] Vérifier les logs : `firebase functions:log`

### Firestore

- [x] ✅ Règles de sécurité ajoutées
- [ ] Déployer les règles : `firebase deploy --only firestore:rules`
- [ ] Vérifier dans la console Firebase

### Migration (si applicable)

- [ ] Exécuter le script de migration : `ts-node migrate-fcm-tokens.ts`
- [ ] Vérifier le rapport de migration
- [ ] (Optionnel) Nettoyer les anciens tokens : `--cleanup`

### Tests

- [ ] Test d'enregistrement de token
- [ ] Test de suppression de token
- [ ] Test de notification push
- [ ] Test après synchronisation bidirectionnelle

---

## 🆘 FAQ

### Q1 : Mes anciens tokens vont-ils fonctionner ?

**R :** Oui, si vous exécutez le script de migration. Sinon, les utilisateurs devront se reconnecter pour obtenir un nouveau token dans la nouvelle collection.

---

### Q2 : Dois-je modifier mon code client ?

**R :** Non ! Les endpoints API restent identiques. Le changement est uniquement backend.

---

### Q3 : Que se passe-t-il si je ne migre pas ?

**R :** Les utilisateurs existants ne recevront pas de notifications jusqu'à leur prochaine connexion (qui enregistrera automatiquement leur token dans la nouvelle collection).

---

### Q4 : La synchronisation PostgreSQL va-t-elle créer des problèmes ?

**R :** Non, c'est justement le but de ce changement ! La collection `utilisateurs_fcm_tokens` est **complètement isolée** de la synchronisation.

---

### Q5 : Puis-je revenir à l'ancien système ?

**R :** Techniquement oui, mais ce n'est pas recommandé. Le problème de perte de tokens reviendra.

---

## 🎯 Prochaines Étapes

1. **Déployer les changements** : `firebase deploy`
2. **Migrer les tokens existants** : `ts-node migrate-fcm-tokens.ts`
3. **Tester les notifications** : Créer un avancement et vérifier les logs
4. **Informer l'équipe** : Partager ce document

---

**Date de mise à jour** : 10 février 2026  
**Version** : 1.0.0  
**Status** : ✅ Déployé en production
