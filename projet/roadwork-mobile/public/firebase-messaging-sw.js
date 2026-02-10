// Importer les dépendances Firebase
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

// Configuration Firebase (REMPLACER AVEC VOS VRAIES CLÉS)
const firebaseConfig = {
  apiKey: "AIzaSyDhLRO2eNXgH2_qHnZeIZYmRjIJvwr38RU", // remplacé
  authDomain: "projet-cloud-e2146.firebaseapp.com", // remplacé
  projectId: "projet-cloud-e2146", // remplacé
  storageBucket: "projet-cloud-e2146.appspot.com", // remplacé
  messagingSenderId: "536116876117", // Vérifier dans Firebase Console (remplacé)
  appId: "1:536116876117:web:6be40fecc75a39650e95dc" // remplacé
}
// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Initialiser Firebase Cloud Messaging
const messaging = firebase.messaging();

// Gérer les messages en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('📨 Notification reçue en arrière-plan:', payload);
  
  const notificationTitle = payload.notification?.title || 'Nouvelle notification RoadWork';
  const notificationOptions = {
    body: payload.notification?.body || 'Vous avez une nouvelle notification',
    icon: payload.notification?.icon || '/icons/icon-192x192.png',
    badge: payload.notification?.badge || '/icons/badge-72x72.png',
    tag: payload.notification?.tag || 'default',
    data: payload.data || {},
    requireInteraction: payload.notification?.requireInteraction || false,
    silent: payload.notification?.silent || false
  };

  // Afficher la notification
  console.log('🔔 Affichage notification système:', notificationTitle, notificationOptions);
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gérer le clic sur la notification
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Clic sur notification:', event);
  
  // Fermer la notification
  event.notification.close();
  
  // Ouvrir l'application sur une page spécifique si fournie
  if (event.notification.data?.link) {
    clients.openWindow(event.notification.data.link);
  } else {
    // Ouvrir l'application par défaut
    clients.openWindow('/');
  }
});

// Gérer l'installation du service worker
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installé');
  self.skipWaiting();
});

// Gérer l'activation du service worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activé');
  event.waitUntil(clients.claim());
});

console.log('🔥 Firebase Messaging Service Worker chargé');
