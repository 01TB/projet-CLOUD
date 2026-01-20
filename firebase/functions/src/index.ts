const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// ========================================
// FONCTION 1 : Créer un utilisateur
// ========================================
exports.createUser = functions.https.onCall(async (data, context) => {
  // Vérifier l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Utilisateur non connecté');
  }
  
  const { displayName, email } = data;
  
  // Valider les données
  if (!displayName || !email) {
    throw new functions.https.HttpsError('invalid-argument', 'displayName et email requis');
  }
  
  try {
    const userRef = db.collection('users').doc(context.auth.uid);
    await userRef.set({
      email: email,
      displayName: displayName,
      role: 'user',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, userId: context.auth.uid };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ========================================
// FONCTION 2 : Créer un produit (admin)
// ========================================
exports.createProduct = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Non authentifié');
  }
  
  // Vérifier si admin
  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!userDoc.exists || userDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin uniquement');
  }
  
  const { name, description, price, stock, category, imageUrl } = data;
  
  const productRef = await db.collection('products').add({
    name,
    description,
    price,
    stock,
    category,
    imageUrl: imageUrl || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return { success: true, productId: productRef.id };
});

// ========================================
// FONCTION 3 : Créer une commande
// ========================================
exports.createOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Non authentifié');
  }
  
  const { items } = data; // items = [{productId, quantity, price}]
  
  if (!items || items.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Panier vide');
  }
  
  // Calculer le total
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Créer la commande
  const orderRef = await db.collection('orders').add({
    userId: context.auth.uid,
    items: items,
    total: total,
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // Mettre à jour le stock (transaction pour éviter les problèmes de concurrence)
  const batch = db.batch();
  
  for (const item of items) {
    const productRef = db.collection('products').doc(item.productId);
    batch.update(productRef, {
      stock: admin.firestore.FieldValue.increment(-item.quantity)
    });
  }
  
  await batch.commit();
  
  return { success: true, orderId: orderRef.id, total: total };
});

// ========================================
// FONCTION 4 : Trigger - Nouvelle commande
// ========================================
exports.onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    
    console.log('Nouvelle commande créée:', {
      orderId: context.params.orderId,
      userId: order.userId,
      total: order.total
    });
    
    // Ici vous pourriez :
    // - Envoyer un email de confirmation
    // - Créer une notification
    // - Déclencher un webhook
    
    return null;
  });

// ========================================
// FONCTION 5 : Trigger - Mise à jour lastLogin
// ========================================
exports.updateLastLogin = functions.auth.user().onCreate(async (user) => {
  const userRef = db.collection('users').doc(user.uid);
  
  await userRef.set({
    email: user.email,
    displayName: user.displayName || 'Utilisateur',
    role: 'user',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLogin: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return null;
});

// ========================================
// FONCTION 6 : HTTP - Obtenir les statistiques (admin)
// ========================================
exports.getStats = functions.https.onRequest(async (req, res) => {
  // Note: Pour une vraie app, vérifier l'authentification
  
  const [usersCount, productsCount, ordersCount] = await Promise.all([
    db.collection('users').count().get(),
    db.collection('products').count().get(),
    db.collection('orders').count().get()
  ]);
  
  res.json({
    users: usersCount.data().count,
    products: productsCount.data().count,
    orders: ordersCount.data().count
  });
});