# Firebase Backend - Cheat Sheet Complet

## Table des matières

- [Installation et Configuration](#installation-et-configuration)
- [Firebase Authentication](#firebase-authentication)
- [Cloud Firestore (Base de données)](#cloud-firestore-base-de-donn%C3%A9es)
- [Cloud Functions (API REST)](#cloud-functions-api-rest)
- [Firebase Cloud Messaging (FCM)](#firebase-cloud-messaging-fcm)
- [Firebase Storage](#firebase-storage)
- [Sécurité et Rules](#s%C3%A9curit%C3%A9-et-rules)
- [Déploiement](#d%C3%A9ploiement)

---

## Installation et Configuration

### Prérequis

```bash
# Installer Node.js (v18+ recommandé)
# Installer Firebase CLI
npm install -g firebase-tools

# Se connecter à Firebase
firebase login
```

### Initialiser un projet Firebase

```bash
# Créer un nouveau projet
firebase init

# Sélectionner les services :
# - Functions (pour API REST)
# - Firestore (pour base de données)
# - Hosting (optionnel)

# Structure du projet
my-firebase-project/
├── functions/
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── firestore.rules
├── firestore.indexes.json
└── firebase.json
```

### Configuration initiale (Admin SDK)

```typescript
// functions/src/index.ts
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();
const messaging = admin.messaging();
```

---

## Firebase Authentication

### Créer un utilisateur

```typescript
// Avec email/password
export const createUser = functions.https.onCall(async (data, context) => {
  const { email, password, displayName } = data;
  
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: false
    });
    
    return { uid: userRecord.uid, message: 'Utilisateur créé' };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

### Vérifier un token JWT

```typescript
export const verifyToken = async (idToken: string) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken; // { uid, email, ... }
  } catch (error) {
    throw new Error('Token invalide');
  }
};
```

### Middleware d'authentification

```typescript
const authenticate = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};
```

### Custom Claims (Rôles)

```typescript
// Attribuer un rôle admin
export const setAdminRole = functions.https.onCall(async (data, context) => {
  // Vérifier que l'appelant est admin
  if (context.auth?.token.admin !== true) {
    throw new functions.https.HttpsError('permission-denied', 'Non autorisé');
  }
  
  const { uid } = data;
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  
  return { message: `Rôle admin attribué à ${uid}` };
});
```

### Gérer les utilisateurs

```typescript
// Lister les utilisateurs
const listUsers = async () => {
  const listUsersResult = await admin.auth().listUsers(1000);
  return listUsersResult.users.map(user => ({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName
  }));
};

// Supprimer un utilisateur
const deleteUser = async (uid: string) => {
  await admin.auth().deleteUser(uid);
};

// Mettre à jour un utilisateur
const updateUser = async (uid: string, updates: any) => {
  await admin.auth().updateUser(uid, updates);
};
```

---

## Cloud Firestore (Base de données)

### Structure de données

```typescript
// Collections et documents
// users/{userId}/profile
// posts/{postId}
// posts/{postId}/comments/{commentId}
```

### Opérations CRUD

#### Créer (Create)

```typescript
// Ajouter un document avec ID auto-généré
const createPost = async (data: any) => {
  const docRef = await db.collection('posts').add({
    title: data.title,
    content: data.content,
    author: data.author,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    likes: 0
  });
  
  return { id: docRef.id };
};

// Créer avec ID personnalisé
const createUserProfile = async (userId: string, data: any) => {
  await db.collection('users').doc(userId).set({
    displayName: data.displayName,
    bio: data.bio,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
};
```

#### Lire (Read)

```typescript
// Lire un document
const getPost = async (postId: string) => {
  const doc = await db.collection('posts').doc(postId).get();
  
  if (!doc.exists) {
    throw new Error('Document non trouvé');
  }
  
  return { id: doc.id, ...doc.data() };
};

// Lire plusieurs documents (query)
const getPosts = async (limit: number = 10) => {
  const snapshot = await db.collection('posts')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Query avec conditions
const getPostsByAuthor = async (authorId: string) => {
  const snapshot = await db.collection('posts')
    .where('author', '==', authorId)
    .where('published', '==', true)
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

#### Mettre à jour (Update)

```typescript
// Mise à jour partielle
const updatePost = async (postId: string, updates: any) => {
  await db.collection('posts').doc(postId).update({
    ...updates,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
};

// Incrémenter une valeur
const incrementLikes = async (postId: string) => {
  await db.collection('posts').doc(postId).update({
    likes: admin.firestore.FieldValue.increment(1)
  });
};

// Ajouter à un array
const addTag = async (postId: string, tag: string) => {
  await db.collection('posts').doc(postId).update({
    tags: admin.firestore.FieldValue.arrayUnion(tag)
  });
};
```

#### Supprimer (Delete)

```typescript
// Supprimer un document
const deletePost = async (postId: string) => {
  await db.collection('posts').doc(postId).delete();
};

// Supprimer un champ
const removeField = async (postId: string) => {
  await db.collection('posts').doc(postId).update({
    fieldToRemove: admin.firestore.FieldValue.delete()
  });
};
```

### Transactions

```typescript
const transferPoints = async (fromUserId: string, toUserId: string, amount: number) => {
  const fromRef = db.collection('users').doc(fromUserId);
  const toRef = db.collection('users').doc(toUserId);
  
  await db.runTransaction(async (transaction) => {
    const fromDoc = await transaction.get(fromRef);
    const toDoc = await transaction.get(toRef);
    
    if (!fromDoc.exists || !toDoc.exists) {
      throw new Error('Utilisateur non trouvé');
    }
    
    const fromPoints = fromDoc.data()!.points;
    if (fromPoints < amount) {
      throw new Error('Points insuffisants');
    }
    
    transaction.update(fromRef, { points: fromPoints - amount });
    transaction.update(toRef, { points: (toDoc.data()!.points || 0) + amount });
  });
};
```

### Batch Writes

```typescript
const batchUpdate = async () => {
  const batch = db.batch();
  
  // Ajouter plusieurs opérations
  const ref1 = db.collection('posts').doc('post1');
  batch.update(ref1, { status: 'published' });
  
  const ref2 = db.collection('posts').doc('post2');
  batch.delete(ref2);
  
  const ref3 = db.collection('posts').doc();
  batch.set(ref3, { title: 'Nouveau post' });
  
  // Exécuter toutes les opérations
  await batch.commit();
};
```

---

## Cloud Functions (API REST)

### HTTP Functions (API REST)

#### GET Request

```typescript
import * as express from 'express';
import * as cors from 'cors';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// GET /api/posts
app.get('/posts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const snapshot = await db.collection('posts')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/posts/:id
app.get('/posts/:id', async (req, res) => {
  try {
    const doc = await db.collection('posts').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }
    
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export const api = functions.https.onRequest(app);
```

#### POST Request

```typescript
// POST /api/posts
app.post('/posts', authenticate, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Titre et contenu requis' });
    }
    
    const docRef = await db.collection('posts').add({
      title,
      content,
      authorId: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      likes: 0
    });
    
    res.status(201).json({ id: docRef.id, message: 'Post créé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### PUT/PATCH Request

```typescript
// PUT /api/posts/:id
app.put('/posts/:id', authenticate, async (req, res) => {
  try {
    const postRef = db.collection('posts').doc(req.params.id);
    const doc = await postRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }
    
    // Vérifier que l'utilisateur est l'auteur
    if (doc.data()!.authorId !== req.user.uid) {
      return res.status(403).json({ error: 'Non autorisé' });
    }
    
    await postRef.update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).json({ message: 'Post mis à jour' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### DELETE Request

```typescript
// DELETE /api/posts/:id
app.delete('/posts/:id', authenticate, async (req, res) => {
  try {
    const postRef = db.collection('posts').doc(req.params.id);
    const doc = await postRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }
    
    if (doc.data()!.authorId !== req.user.uid) {
      return res.status(403).json({ error: 'Non autorisé' });
    }
    
    await postRef.delete();
    res.status(200).json({ message: 'Post supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Callable Functions

```typescript
// Plus sécurisées, gèrent automatiquement l'authentification
export const createPost = functions.https.onCall(async (data, context) => {
  // Vérifier l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Vous devez être connecté'
    );
  }
  
  const { title, content } = data;
  
  // Validation
  if (!title || !content) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Titre et contenu requis'
    );
  }
  
  const docRef = await db.collection('posts').add({
    title,
    content,
    authorId: context.auth.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return { id: docRef.id, message: 'Post créé' };
});
```

### Triggers (Fonctions déclenchées)

#### Firestore Triggers

```typescript
// Déclenché à la création d'un document
export const onPostCreated = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snapshot, context) => {
    const postData = snapshot.data();
    const postId = context.params.postId;
    
    // Envoyer une notification
    console.log(`Nouveau post créé: ${postId}`);
    
    // Mettre à jour le compteur de posts
    await db.collection('stats').doc('posts').update({
      count: admin.firestore.FieldValue.increment(1)
    });
  });

// Déclenché lors de la mise à jour
export const onPostUpdated = functions.firestore
  .document('posts/{postId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Détecter les changements
    if (before.likes !== after.likes) {
      console.log(`Likes mis à jour: ${before.likes} -> ${after.likes}`);
    }
  });

// Déclenché à la suppression
export const onPostDeleted = functions.firestore
  .document('posts/{postId}')
  .onDelete(async (snapshot, context) => {
    // Nettoyer les données associées
    const postId = context.params.postId;
    
    // Supprimer les commentaires
    const comments = await db.collection('posts').doc(postId)
      .collection('comments').get();
    
    const batch = db.batch();
    comments.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  });
```

#### Auth Triggers

```typescript
// Déclenché à la création d'un utilisateur
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  // Créer un profil utilisateur
  await db.collection('users').doc(user.uid).set({
    email: user.email,
    displayName: user.displayName || 'Anonyme',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    points: 0
  });
  
  // Envoyer un email de bienvenue (si configuré)
  console.log(`Utilisateur créé: ${user.email}`);
});

// Déclenché à la suppression d'un utilisateur
export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  // Nettoyer les données
  await db.collection('users').doc(user.uid).delete();
});
```

---

## Firebase Cloud Messaging (FCM)

### Envoyer une notification à un appareil

```typescript
export const sendNotification = functions.https.onCall(async (data, context) => {
  const { token, title, body } = data;
  
  const message = {
    notification: {
      title,
      body,
    },
    token,
  };
  
  try {
    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

### Envoyer à plusieurs appareils (Topic)

```typescript
// S'abonner à un topic
export const subscribeToTopic = functions.https.onCall(async (data, context) => {
  const { tokens, topic } = data;
  
  try {
    const response = await admin.messaging().subscribeToTopic(tokens, topic);
    return { 
      success: true, 
      successCount: response.successCount,
      failureCount: response.failureCount 
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Envoyer à un topic
export const sendToTopic = functions.https.onCall(async (data, context) => {
  const { topic, title, body } = data;
  
  const message = {
    notification: {
      title,
      body,
    },
    topic,
  };
  
  const response = await admin.messaging().send(message);
  return { success: true, messageId: response };
});
```

### Notification avec données personnalisées

```typescript
const sendDataNotification = async (token: string) => {
  const message = {
    notification: {
      title: 'Nouveau message',
      body: 'Vous avez reçu un nouveau message',
    },
    data: {
      userId: '12345',
      messageId: 'msg_001',
      type: 'chat',
    },
    android: {
      priority: 'high' as const,
    },
    apns: {
      payload: {
        aps: {
          badge: 1,
          sound: 'default',
        },
      },
    },
    token,
  };
  
  await admin.messaging().send(message);
};
```

### Trigger automatique de notification

```typescript
// Envoyer une notification quand un nouveau post est créé
export const notifyNewPost = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snapshot, context) => {
    const postData = snapshot.data();
    
    const message = {
      notification: {
        title: 'Nouveau post',
        body: postData.title,
      },
      topic: 'new-posts',
    };
    
    await admin.messaging().send(message);
  });
```

---

## Firebase Storage

### Uploader un fichier

```typescript
import * as busboy from 'busboy';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export const uploadFile = functions.https.onRequest((req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  
  const bb = busboy({ headers: req.headers });
  const uploads: any = {};
  
  bb.on('file', (fieldname, file, info) => {
    const { filename } = info;
    const filepath = path.join(os.tmpdir(), filename);
    uploads[fieldname] = { file: filepath, filename };
    file.pipe(fs.createWriteStream(filepath));
  });
  
  bb.on('finish', async () => {
    const bucket = admin.storage().bucket();
    const uploadPromises = Object.values(uploads).map(async (upload: any) => {
      const destination = `uploads/${Date.now()}_${upload.filename}`;
      await bucket.upload(upload.file, { destination });
      
      // Obtenir l'URL publique
      const file = bucket.file(destination);
      await file.makePublic();
      
      return {
        filename: upload.filename,
        url: `https://storage.googleapis.com/${bucket.name}/${destination}`
      };
    });
    
    const results = await Promise.all(uploadPromises);
    res.status(200).json({ files: results });
  });
  
  bb.end(req.rawBody);
});
```

### Supprimer un fichier

```typescript
const deleteFile = async (filePath: string) => {
  const bucket = admin.storage().bucket();
  await bucket.file(filePath).delete();
};
```

### Trigger sur upload

```typescript
export const onFileUploaded = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  const contentType = object.contentType;
  
  console.log(`Fichier uploadé: ${filePath}`);
  
  // Générer une miniature pour les images
  if (contentType?.startsWith('image/')) {
    // Logique de redimensionnement
  }
});
```

---

## Sécurité et Rules

### Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Fonction helper pour vérifier l'authentification
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Fonction pour vérifier si l'utilisateur est propriétaire
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Fonction pour vérifier si l'utilisateur est admin
    function isAdmin() {
      return request.auth.token.admin == true;
    }
    
    // Collection users
    match /users/{userId} {
      // Lecture: utilisateur connecté ou admin
      allow read: if isAuthenticated();
      
      // Création: seulement pour son propre profil
      allow create: if isAuthenticated() && isOwner(userId);
      
      // Mise à jour: seulement son propre profil
      allow update: if isAuthenticated() && isOwner(userId);
      
      // Suppression: admin uniquement
      allow delete: if isAdmin();
    }
    
    // Collection posts
    match /posts/{postId} {
      // Lecture: tout le monde
      allow read: if true;
      
      // Création: utilisateur connecté
      allow create: if isAuthenticated() 
        && request.resource.data.authorId == request.auth.uid;
      
      // Mise à jour: auteur du post
      allow update: if isAuthenticated() 
        && resource.data.authorId == request.auth.uid;
      
      // Suppression: auteur ou admin
      allow delete: if isAuthenticated() 
        && (resource.data.authorId == request.auth.uid || isAdmin());
      
      // Sous-collection comments
      match /comments/{commentId} {
        allow read: if true;
        allow create: if isAuthenticated();
        allow update, delete: if isAuthenticated() 
          && resource.data.authorId == request.auth.uid;
      }
    }
  }
}
```

### Storage Security Rules

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Images de profil
    match /profile-images/{userId}/{allPaths=**} {
      // Lecture: tout le monde
      allow read: if true;
      
      // Écriture: seulement son propre dossier
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024  // Max 5MB
        && request.resource.contentType.matches('image/.*');
    }
    
    // Fichiers uploads
    match /uploads/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.resource.size < 10 * 1024 * 1024;  // Max 10MB
    }
  }
}
```

---

## Déploiement

### Déployer les functions

```bash
# Déployer toutes les functions
firebase deploy --only functions

# Déployer une function spécifique
firebase deploy --only functions:api

# Déployer plusieurs functions
firebase deploy --only functions:api,functions:createPost
```

### Déployer Firestore rules

```bash
firebase deploy --only firestore:rules
```

### Déployer tout

```bash
firebase deploy
```

### Variables d'environnement

```bash
# Définir une variable
firebase functions:config:set someservice.key="THE API KEY"

# Lire les variables dans le code
const apiKey = functions.config().someservice.key;

# Voir toutes les variables
firebase functions:config:get

# Utiliser localement (créer .runtimeconfig.json)
firebase functions:config:get > .runtimeconfig.json
```

### Secrets (recommandé pour données sensibles)

```bash
# Créer un secret
firebase functions:secrets:set SECRET_NAME

# Utiliser dans le code
export const myFunction = functions
  .runWith({ secrets: ["SECRET_NAME"] })
  .https.onRequest((req, res) => {
    const secret = process.env.SECRET_NAME;
  });
```

### Logs et monitoring

```bash
# Voir les logs en temps réel
firebase functions:log

# Voir les logs d'une function spécifique
firebase functions:log --only api

# Voir dans la console Firebase
# https://console.firebase.google.com/project/YOUR_PROJECT/functions/logs
```

---

## Bonnes pratiques

### 1. Structure du code

```typescript
// Organiser par domaine
functions/
├── src/
│   ├── index.ts           // Point d'entrée
│   ├── api/
│   │   ├── posts.ts
│   │   └── users.ts
│   ├── triggers/
│   │   ├── auth.ts
│   │   └── firestore.ts
│   ├── services/
│   │   ├── notification.ts
│   │   └── email.ts
│   └── middleware/
│       └── auth.ts
```

### 2. Gestion des erreurs

```typescript
// Toujours gérer les erreurs proprement
export const safeFunction = functions.https.onCall(async (data, context) => {
  try {
    // Validation
    if (!data.required) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Paramètre requis manquant'
      );
    }
    
    // Logique métier
    const result = await someOperation(data);
    return { success: true, data: result };
    
  } catch (error) {
    console.error('Erreur dans safeFunction:', error);
    
    // Retourner une erreur appropriée
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Une erreur est survenue');
  }
});
```

### 3. Validation des données

```typescript
const validatePostData = (data: any) => {
  const errors: string[] = [];
  
  if (!data.title || data.title.length < 3) {
    errors.push('Titre trop court');
  }
  
  if (!data.content || data.content.length < 10) {
    errors.push('Contenu trop court');
  }
  
  if (errors.length > 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      errors.join(', ')
    );
  }
};
```

### 4. Optimisation des requêtes

```typescript
// Utiliser select() pour limiter les champs
const getPostsTitles = async () => {
  const snapshot = await db.collection('posts')
    .select('title', 'createdAt')
    .get();
  
  return snapshot.docs.map(doc => doc.data());
};

// Pagination
const getPostsPaginated = async (lastDoc?: any, limit = 10) => {
  let query = db.collection('posts')
    .orderBy('createdAt', 'desc')
    .limit(limit);
  
  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }
  
  const snapshot = await query.get();
  
  return {
    posts: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1]
  };
};
```

### 5. Indexes composites

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "authorId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## Commandes utiles

```bash
# Émulateurs locaux
firebase emulators:start

# Émulateurs spécifiques
firebase emulators:start --only functions,firestore

# Voir l'URL de déploiement
firebase functions:list

# Supprimer une function
firebase functions:delete functionName

# Voir les quotas et limites
# Console Firebase > Usage and billing
```

---

## Ressources

- Documentation officielle: https://firebase.google.com/docs
- API Reference: https://firebase.google.com/docs/reference/admin/node
- Console Firebase: https://console.firebase.google.com
- Pricing: https://firebase.google.com/pricing
- Support: https://firebase.google.com/support