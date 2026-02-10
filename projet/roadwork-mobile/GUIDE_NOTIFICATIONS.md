# 📨 Guide Complet : Notifications Firebase RoadWork Mobile

## 🎯 Objectif
Configurer et tester le système de notifications push Firebase Cloud Messaging dans l'application mobile RoadWork.

---

## 🔧 ÉTAPE 1 : Configuration Firebase

### 1.1 Obtenir les clés depuis Firebase Console
1. **Aller sur** : https://console.firebase.google.com/
2. **Sélectionner le projet** : `projet-cloud-e2146`
3. **Aller dans** : `Project Settings` > `Cloud Messaging`

### 1.2 Clés à récupérer
- **✅ Sender ID** : `103456789012` (déjà configuré)
- **🔑 Server Key** : Pour envoyer depuis le backend
- **🌐 Web API Key** : Pour le client JavaScript
- **🔐 VAPID Key** : Pour les notifications web push

### 1.3 Mettre à jour les clés dans les fichiers
**Fichiers à modifier :**
- `public/firebase-messaging-sw.js` (lignes 7-12)
- `src/composables/useNotifications.js` (lignes 6-12)

**Remplacer les placeholders :**
```javascript
apiKey: "VOTRE_API_KEY_ICI",           // ← Remplacer
appId: "VOTRE_APP_ID_ICI",           // ← Remplacer  
vapidKey: 'VOTRE_VAPID_KEY_ICI'       // ← Remplacer
```

---

## 🚀 ÉTAPE 2 : Tester le système

### 2.1 Démarrer l'application
```bash
npm run dev
# Ou
ionic serve
```

### 2.2 Vérifier la console du navigateur
**Ouvrir la console** (F12) et chercher ces logs :

#### ✅ Logs de succès attendus :
```
🔥 Firebase Messaging Service Worker chargé
✅ Permission notification accordée
🔑 Token FCM: abc123xyz...
📨 Notification reçue au premier plan: {title: "...", body: "..."}
```

#### ❌ Logs d'erreur possibles :
```
❌ Erreur permission notification: DOMException...
❌ Token FCM non généré
🔥 Firebase Messaging Service Worker erreur
```

### 2.3 Vérifier le localStorage
**Dans la console :**
```javascript
localStorage.getItem('fcmToken')
// Devrait retourner le token FCM
```

### 2.4 Tester l'interface utilisateur
1. **Se connecter** à l'application
2. **Ouvrir le menu** latéral
3. **Cliquer sur "Mes notifications"**
4. **Vérifier** que le modal s'ouvre
5. **Vérifier le badge** avec le nombre de notifications non lues

---

## 📨 ÉTAPE 3 : Envoyer une notification test

### 3.1 Depuis Firebase Console (recommandé)
1. **Aller dans** : Firebase Console > Cloud Messaging
2. **Cliquer sur** : "Send your first message"
3. **Configurer** :
   - **Title** : "Test RoadWork"
   - **Body** : "Ceci est une notification de test"
   - **Target** : "User segment" > "New users" (ou tester avec un token spécifique)

### 3.2 Depuis cURL (avancé)
```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=VOTRE_SERVER_KEY_ICI" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "title": "Test RoadWork",
      "body": "Ceci est une notification de test",
      "icon": "https://votre-domaine.com/icons/icon-192x192.png"
    },
    "to": "TOKEN_FCM_DE_LUTILISATEUR"
  }'
```

---

## 🎯 ÉTAPE 4 : Vérifier le comportement

### 4.1 Application au premier plan
- ✅ **Toast notification** qui apparaît en haut à droite
- ✅ **Modal notifications** mis à jour avec la nouvelle notification
- ✅ **Badge** qui s'incrémente
- ✅ **Console logs** qui montrent la réception

### 4.2 Application en arrière-plan
- ✅ **Notification système** qui apparaît
- ✅ **Clic sur notification** qui ouvre l'application
- ✅ **Service Worker** qui traite le message

### 4.3 Application fermée
- ✅ **Notification système** qui apparaît sur l'écran d'accueil
- ✅ **Icône de notification** personnalisée
- ✅ **Son de notification** (si configuré)

---

## 🔧 ÉTAPE 5 : Dépannage

### 5.1 Problèmes courants

#### ❌ "Permission notification refusée"
**Solution** : 
- Vérifier les permissions du navigateur
- Cliquer sur l'icône 🔒 dans la barre d'adresse
- Autoriser les notifications

#### ❌ "Token FCM non généré"
**Solutions** :
- Vérifier la configuration Firebase (apiKey, projectId, etc.)
- Vérifier la connexion internet
- Vérifier que le domaine est autorisé dans Firebase Console

#### ❌ "Service Worker ne se charge pas"
**Solutions** :
- Vider le cache du navigateur
- Redémarrer le serveur de développement
- Vérifier les erreurs dans la console

### 5.2 Outils de débuggage
```javascript
// Dans la console du navigateur
// Vérifier le service worker
navigator.serviceWorker.getRegistrations()

// Vérifier les permissions
navigator.permissions.query({name: 'notifications'})

// Forcer une notification test
new Notification("Test", {
  body: "Notification de test manuelle",
  icon: "/icons/icon-192x192.png"
})
```

---

## 📱 ÉTAPE 6 : Déploiement

### 6.1 Build pour production
```bash
npm run build
# Ou
ionic build
```

### 6.2 Configuration HTTPS obligatoire
**Important** : Les notifications push nécessit HTTPS en production !
- **Localhost** : OK pour les tests
- **Production** : Obligatoirement HTTPS

### 6.3 Vérifier le manifeste
**Fichier** : `public/manifest.json`
```json
{
  "gcm_sender_id": "103456789012",
  "permissions": ["notifications"]
}
```

---

## 🎉 Succès !

Une fois ces étapes terminées, votre application RoadWork Mobile pourra :
- ✅ Recevoir des notifications push en temps réel
- ✅ Afficher les notifications dans l'interface
- ✅ Gérer les permissions utilisateur
- ✅ Fonctionner en arrière-plan et au premier plan
- ✅ Maintenir un historique des notifications

---

## 📚 Documentation utile

- **Firebase Cloud Messaging** : https://firebase.google.com/docs/cloud-messaging
- **Service Worker API** : https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Notifications API** : https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API

---

*Pour toute question sur une étape spécifique, n'hésitez pas à demander !*
