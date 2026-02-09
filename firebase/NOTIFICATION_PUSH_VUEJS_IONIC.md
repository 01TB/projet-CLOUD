# Implémentation des Notifications Push - VueJS + Ionic

Guide complet pour implémenter les notifications push Firebase Cloud Messaging (FCM) dans un projet VueJS avec Ionic/Capacitor.

## 📋 Prérequis

- Projet VueJS avec Ionic configuré
- Firebase configuré dans le projet
- Capacitor installé et configuré
- Compte Firebase avec Cloud Messaging activé

## 🚀 Installation des dépendances

```bash
# Firebase SDK
npm install firebase

# Plugin Capacitor pour les notifications push
npm install @capacitor/push-notifications

# Synchroniser Capacitor
npx cap sync
```

## 📱 Configuration Firebase

### 1. Créer le fichier de configuration Firebase

Créez `src/services/firebase.ts` :

```typescript
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJECT.firebaseapp.com",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID",
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Firebase Cloud Messaging
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
```

## 🔔 Service de gestion des notifications

Créez `src/services/notificationService.ts` :

```typescript
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
} from "@capacitor/push-notifications";
import { messaging, getToken } from "./firebase";
import { isPlatform } from "@ionic/vue";
import axios from "axios";

class NotificationService {
  private fcmToken: string | null = null;
  private userId: number | null = null;

  /**
   * Initialiser les notifications push
   */
  async initialize(userId: number): Promise<void> {
    this.userId = userId;

    if (isPlatform("capacitor")) {
      await this.initializeNativeNotifications();
    } else {
      await this.initializeWebNotifications();
    }
  }

  /**
   * Notifications pour mobile natif (Android/iOS)
   */
  private async initializeNativeNotifications(): Promise<void> {
    // Demander la permission
    const permission = await PushNotifications.requestPermissions();

    if (permission.receive !== "granted") {
      console.error("❌ Permission de notification refusée");
      return;
    }

    // Enregistrer les notifications
    await PushNotifications.register();

    // Événement : Token FCM reçu
    PushNotifications.addListener("registration", (token: Token) => {
      console.log("✅ Token FCM reçu:", token.value);
      this.fcmToken = token.value;
      this.saveTokenToFirestore(token.value);
    });

    // Événement : Erreur d'enregistrement
    PushNotifications.addListener("registrationError", (error: any) => {
      console.error("❌ Erreur d'enregistrement:", error);
    });

    // Événement : Notification reçue (app au premier plan)
    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification: PushNotificationSchema) => {
        console.log("📬 Notification reçue:", notification);
        this.handleNotificationReceived(notification);
      },
    );

    // Événement : Notification cliquée
    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action: ActionPerformed) => {
        console.log("👆 Notification cliquée:", action);
        this.handleNotificationClick(action);
      },
    );
  }

  /**
   * Notifications pour web (PWA)
   */
  private async initializeWebNotifications(): Promise<void> {
    try {
      // Demander la permission
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        console.error("❌ Permission de notification refusée");
        return;
      }

      // Récupérer le token FCM
      const token = await getToken(messaging, {
        vapidKey: "VOTRE_VAPID_KEY", // Clé publique depuis Firebase Console
      });

      if (token) {
        console.log("✅ Token FCM reçu:", token);
        this.fcmToken = token;
        this.saveTokenToFirestore(token);
      }

      // Écouter les messages pendant que l'app est ouverte
      const { onMessage } = await import("./firebase");
      onMessage(messaging, (payload) => {
        console.log("📬 Notification reçue:", payload);
        this.handleWebNotification(payload);
      });
    } catch (error) {
      console.error("❌ Erreur d'initialisation des notifications web:", error);
    }
  }

  /**
   * Sauvegarder le token FCM dans Firestore
   */
  private async saveTokenToFirestore(token: string): Promise<void> {
    if (!this.userId) {
      console.error("❌ User ID non défini");
      return;
    }

    try {
      // Mettre à jour le document utilisateur avec le token FCM
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/utilisateurs/${this.userId}`,
        { fcm_token: token },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );

      console.log("✅ Token FCM sauvegardé dans Firestore");
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde du token:", error);
    }
  }

  /**
   * Gérer la réception d'une notification (mobile)
   */
  private handleNotificationReceived(
    notification: PushNotificationSchema,
  ): void {
    // Afficher une notification locale si nécessaire
    // Ou mettre à jour l'interface utilisateur
    console.log("Titre:", notification.title);
    console.log("Message:", notification.body);
    console.log("Données:", notification.data);

    // Exemple: Émettre un événement global
    window.dispatchEvent(
      new CustomEvent("notification-received", {
        detail: notification,
      }),
    );
  }

  /**
   * Gérer le clic sur une notification (mobile)
   */
  private handleNotificationClick(action: ActionPerformed): void {
    const data = action.notification.data;

    // Navigation basée sur le type de notification
    if (data.type === "avancement_signalement") {
      // Naviguer vers la page de détail du signalement
      const idSignalement = data.id_signalement;
      window.location.href = `/signalements/${idSignalement}`;
    }
  }

  /**
   * Gérer une notification web (PWA)
   */
  private handleWebNotification(payload: any): void {
    const { notification, data } = payload;

    // Afficher une notification native du navigateur
    if (Notification.permission === "granted") {
      const notif = new Notification(notification.title, {
        body: notification.body,
        icon: "/assets/icon/favicon.png",
        badge: "/assets/icon/badge.png",
        data: data,
      });

      // Gérer le clic sur la notification
      notif.onclick = () => {
        if (data.type === "avancement_signalement") {
          window.location.href = `/signalements/${data.id_signalement}`;
        }
      };
    }
  }

  /**
   * Supprimer le token FCM (déconnexion)
   */
  async removeToken(): Promise<void> {
    if (!this.userId || !this.fcmToken) return;

    try {
      // Supprimer le token du document utilisateur
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/utilisateurs/${this.userId}`,
        { fcm_token: null },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );

      console.log("✅ Token FCM supprimé");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression du token:", error);
    }
  }

  /**
   * Obtenir le token FCM actuel
   */
  getToken(): string | null {
    return this.fcmToken;
  }
}

export default new NotificationService();
```

## 🎯 Utilisation dans les composants Vue

### Dans votre composant principal (App.vue ou après connexion)

```vue
<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import notificationService from "@/services/notificationService";
import { useAuthStore } from "@/stores/auth"; // Votre store d'authentification

const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  // Initialiser les notifications après connexion
  if (authStore.isAuthenticated && authStore.user?.id) {
    await notificationService.initialize(authStore.user.id);
  }

  // Écouter les notifications reçues
  window.addEventListener("notification-received", (event: any) => {
    const notification = event.detail;

    // Afficher une toast ou une alerte
    console.log("Nouvelle notification:", notification);

    // Vous pouvez utiliser Ionic Toast
    // presentToast(notification.title, notification.body);
  });
});

// Supprimer le token lors de la déconnexion
const logout = async () => {
  await notificationService.removeToken();
  authStore.logout();
  router.push("/login");
};
</script>
```

### Composant de liste de notifications (optionnel)

```vue
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Notifications</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item
          v-for="notif in notifications"
          :key="notif.id"
          @click="handleClick(notif)"
        >
          <ion-label>
            <h2>{{ notif.titre }}</h2>
            <p>{{ notif.message }}</p>
            <p class="date">{{ formatDate(notif.date_envoi) }}</p>
          </ion-label>
          <ion-badge v-if="!notif.lu" color="primary" slot="end">New</ion-badge>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
} from "@ionic/vue";
import axios from "axios";

const notifications = ref([]);

onMounted(async () => {
  await loadNotifications();
});

const loadNotifications = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/notifications`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      },
    );
    notifications.value = response.data.data;
  } catch (error) {
    console.error("Erreur de chargement des notifications:", error);
  }
};

const handleClick = async (notif: any) => {
  // Marquer comme lu
  await axios.put(
    `${import.meta.env.VITE_API_URL}/api/notifications/${notif.id}/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    },
  );

  // Naviguer vers le signalement
  if (notif.type === "avancement_signalement") {
    router.push(`/signalements/${notif.id_signalement}`);
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString("fr-FR");
};
</script>
```

## 🔧 Configuration Android

### 1. Ajouter le fichier `google-services.json`

Téléchargez depuis Firebase Console → Project Settings → Android App et placez-le dans :

```
android/app/google-services.json
```

### 2. Modifier `android/app/build.gradle`

```gradle
dependencies {
    // ... autres dépendances
    implementation 'com.google.firebase:firebase-messaging:23.0.0'
}

apply plugin: 'com.google.gms.google-services'
```

### 3. Modifier `android/build.gradle`

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

## 🍎 Configuration iOS

### 1. Ajouter le fichier `GoogleService-Info.plist`

Téléchargez depuis Firebase Console → Project Settings → iOS App et placez-le dans :

```
ios/App/App/GoogleService-Info.plist
```

### 2. Activer les notifications dans Xcode

1. Ouvrir le projet dans Xcode: `npx cap open ios`
2. Sélectionner le target "App"
3. Aller dans "Signing & Capabilities"
4. Cliquer sur "+ Capability"
5. Ajouter "Push Notifications"

### 3. Configurer l'APNs dans Firebase Console

1. Firebase Console → Project Settings → Cloud Messaging
2. Upload votre clé APNs (.p8) ou certificat (.p12)

## 🌐 Configuration Web (PWA)

### 1. Créer le fichier `firebase-messaging-sw.js`

Dans `public/firebase-messaging-sw.js` :

```javascript
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyDhLRO2eNXgH2_qHnZeIZYmRjIJvwr38RU",
  authDomain: "projet-cloud-e2146.firebaseapp.com",
  projectId: "projet-cloud-e2146",
  storageBucket: "projet-cloud-e2146.firebasestorage.app"
  messagingSenderId: "536116876117",
  appId: "1:536116876117:web:6be40fecc75a39650e95dc"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Message reçu en arrière-plan:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/assets/icon/favicon.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

### 2. Obtenir la clé VAPID

Firebase Console → Project Settings → Cloud Messaging → Web Push certificates

## 🧪 Tests

### Tester l'envoi de notification depuis Firebase Console

1. Firebase Console → Cloud Messaging → Send your first message
2. Entrer le titre et le message
3. Cliquer sur "Send test message"
4. Entrer votre token FCM
5. Cliquer sur "Test"

### Tester depuis le code

```typescript
// Fonction pour tester l'envoi manuel
async function testNotification() {
  const token = notificationService.getToken();
  console.log("Token FCM actuel:", token);

  // Créer manuellement un avancement pour déclencher le trigger
  // (ceci devrait être fait via votre API backend)
}
```

## 📝 Notes importantes

- **Token FCM** : Le token doit être régulièrement actualisé (il peut expirer)
- **Permissions** : Toujours demander l'autorisation à l'utilisateur de manière explicite
- **iOS** : Les notifications ne fonctionnent pas sur simulateur, uniquement sur device réel
- **Web** : Nécessite HTTPS (sauf localhost)
- **Collections Firestore** : Ajoutez un champ `fcm_token` dans vos documents `utilisateurs`

## 🐛 Dépannage

### Le token FCM n'est pas généré

- Vérifier que Firebase est correctement configuré
- Vérifier que les fichiers de config (`google-services.json`, `GoogleService-Info.plist`) sont présents
- Synchroniser Capacitor : `npx cap sync`

### Les notifications ne sont pas reçues

- Vérifier que le token est bien sauvegardé dans Firestore
- Vérifier les logs du trigger Firebase Function
- Vérifier les permissions de l'appareil
- Pour iOS : vérifier que l'APNs est configuré dans Firebase Console

### Erreur "messaging/invalid-registration-token"

- Le token FCM a expiré ou est invalide
- Supprimer le token de Firestore et en regénérer un nouveau

## 📚 Ressources

- [Documentation Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Documentation Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Documentation Ionic Vue](https://ionicframework.com/docs/vue/overview)
