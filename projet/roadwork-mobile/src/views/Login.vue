<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/map"></ion-back-button>
        </ion-buttons>
        <ion-title>Connexion</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="login-container">
        <div class="logo-section">
          <ion-icon :icon="map" size="large" color="primary"></ion-icon>
          <h2>RoadWork Mobile</h2>
          <p>Connectez-vous pour signaler des problèmes routiers</p>
        </div>

        <form @submit.prevent="handleLogin">
          <ion-list>
            <ion-item>
              <ion-label position="floating">Email</ion-label>
              <ion-input
                v-model="form.email"
                type="email"
                required
                placeholder="votre@email.com"
              ></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Mot de passe</ion-label>
              <ion-input
                v-model="form.password"
                type="password"
                required
                placeholder="••••••••"
              ></ion-input>
            </ion-item>

            <ion-item lines="none" v-if="error">
              <ion-text color="danger">
                <small>{{ error }}</small>
              </ion-text>
            </ion-item>

            <ion-button
              expand="block"
              type="submit"
              :disabled="loading"
              class="ion-margin-top"
            >
              <ion-spinner v-if="loading" slot="start"></ion-spinner>
              Se connecter
            </ion-button>

            <ion-button
              expand="block"
              fill="clear"
              @click="router.push('/register')"
              class="ion-margin-top"
            >
              Créer un compte
            </ion-button>

            <div class="offline-mode ion-margin-top" v-if="!isOnline">
              <ion-icon :icon="warning" color="warning"></ion-icon>
              <small>Mode hors ligne - Connexion locale seulement</small>
            </div>
          </ion-list>
        </form>

        <div class="guest-section ion-margin-top">
          <ion-text color="medium">
            <small>Ou continuer en tant que</small>
          </ion-text>
          <ion-button
            expand="block"
            fill="outline"
            @click="continueAsGuest"
            class="ion-margin-top"
          >
            Visiteur
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonInput, IonItem, IonLabel, IonList,
  IonIcon, IonText, IonSpinner, IonBackButton, IonButtons,
  toastController
} from '@ionic/vue';
import { map, warning } from 'ionicons/icons';
import { useAuthStore } from '@/store/modules/auth';
import { Network } from '@capacitor/network';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  email: '',
  password: ''
});
const loading = ref(false);
const error = ref('');
const isOnline = ref(true);

const handleLogin = async () => {
  if (!form.value.email || !form.value.password) {
    error.value = 'Veuillez remplir tous les champs';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const result = await authStore.login({
      email: form.value.email,
      password: form.value.password
    });

    if (result.success) {
      const toast = await toastController.create({
        message: 'Connexion réussie !',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
      
      // Rediriger vers la carte
      router.push('/map');
    } else {
      error.value = result.error || 'Erreur de connexion';
    }
  } catch (err) {
    error.value = err.message || 'Erreur de connexion';
  } finally {
    loading.value = false;
  }
};

const continueAsGuest = () => {
  router.push('/map');
};

const checkNetworkStatus = async () => {
  const status = await Network.getStatus();
  isOnline.value = status.connected;
};

// Écouter les changements de réseau
let networkListener;
onMounted(async () => {
  await checkNetworkStatus();
  
  networkListener = await Network.addListener('networkStatusChange', (status) => {
    isOnline.value = status.connected;
  });
});

onUnmounted(() => {
  if (networkListener) {
    networkListener.remove();
  }
});
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding-top: 2rem;
}

.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-section h2 {
  margin: 1rem 0 0.5rem;
  color: #2c3e50;
}

.logo-section p {
  color: #7f8c8d;
  margin: 0;
}

.offline-mode {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #f39c12;
  text-align: center;
}

.guest-section {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}
</style>