Voici un **Cheat Sheet complet** au format Markdown (`.md`), structuré pour être copié-collé directement dans un fichier `README.md` ou votre bloc-notes personnel.

---

# 🔥 Firebase Backend Cheat Sheet

Ce guide couvre l'essentiel pour construire un backend moderne avec Firebase (Node.js / Admin SDK).

---

## 🛠 1. Setup & CLI (Ligne de commande)

Essentiel pour configurer et déployer votre environnement.

- **Installer les outils :** `npm install -g firebase-tools`
    
- **S'authentifier :** `firebase login`
    
- **Initialiser un projet :** `firebase init`
    
- **Changer de projet :** `firebase use --add`
    
- **Déploiement :**
    
    - Tout : `firebase deploy`
        
    - Fonctions seulement : `firebase deploy --only functions`
        
    - Firestore (Règles/Index) : `firebase deploy --only firestore`
        

---

## 🌍 2. Cloud Functions (Le Serveur)

Logique backend en Node.js (V2).

### API REST avec Express

JavaScript

```
const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const app = express();

app.get("/status", (req, res) => res.status(200).send({ status: "En ligne" }));

// Endpoint accessible via : https://<region>-<project-id>.cloudfunctions.net/api
exports.api = onRequest(app);
```

### Triggers (Déclencheurs automatiques)

JavaScript

```
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

// Se déclenche à chaque création de document dans "orders"
exports.processOrder = onDocumentCreated("orders/{orderId}", (event) => {
    const newOrder = event.data.data();
    // Logique métier ici...
});
```

---

## 🔐 3. Authentification

Gérer les utilisateurs et sécuriser les accès.

- **Vérifier un token (Backend) :**
    

JavaScript

```
const admin = require("firebase-admin");

async function checkAuth(idToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken.uid; 
  } catch (error) {
    throw new Error("Non autorisé");
  }
}
```

- **Actions courantes (Admin SDK) :**
    
    - Créer un user : `admin.auth().createUser({ email, password })`
        
    - Supprimer : `admin.auth().deleteUser(uid)`
        
    - Lister : `admin.auth().listUsers()`
        

---

## 📦 4. Firestore (Base de données)

Base de données NoSQL orientée documents.

### Opérations CRUD (Admin SDK)

JavaScript

```
const db = admin.firestore();

// AJOUTER (ID auto)
await db.collection("users").add({ name: "Alice", active: true });

// SET (ID spécifique)
await db.collection("users").doc("uid_123").set({ name: "Bob" });

// UPDATE
await db.doc("users/uid_123").update({ active: false });

// LIRE (un seul)
const snap = await db.doc("users/uid_123").get();
const userData = snap.data();

// REQUÊTE (Multiple)
const q = await db.collection("users").where("active", "==", true).limit(10).get();
q.forEach(doc => console.log(doc.id, doc.data()));
```

---

## 🔔 5. Cloud Messaging (Notifications)

Envoyer des alertes push aux utilisateurs.

JavaScript

```
const message = {
  notification: {
    title: "Vente Flash !",
    body: "Profitez de -50% aujourd'hui seulement."
  },
  topic: "promotions" // Ou token: "registration-token-device"
};

await admin.messaging().send(message);
```

---

## 🛡 6. Règles de Sécurité (Firestore)

Fichier `firestore.rules`. Définit qui accède à quoi.

JavaScript

```
service cloud.firestore {
  match /databases/{database}/documents {
    // Par défaut : Tout bloquer
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Règle spécifique pour le profil utilisateur
    match /users/{userId} {
      allow read: if request.auth != null; // Connecté
      allow write: if request.auth.uid == userId; // Propriétaire
    }
  }
}
```

---

## 📋 7. Boilerplate `index.js` (Départ rapide)

Fichier de base pour votre dossier `functions/`.

JavaScript

```
const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");

admin.initializeApp();

exports.helloWorld = onRequest((req, res) => {
  res.json({ message: "Hello from Firebase!" });
});
```

---

**Astuce Pro :** Utilisez l'**Emulator Suite** (`firebase emulators:start`) pour tester votre backend en local sans consommer de quota et sans frais de déploiement !