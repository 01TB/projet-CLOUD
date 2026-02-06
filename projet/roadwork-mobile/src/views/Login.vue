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
            <ion-label position="floating">Email</ion-label>
            <ion-item>
              <ion-input
                v-model="form.email"
                type="email"
                required
                placeholder="votre@email.com"
              ></ion-input>
            </ion-item>

            <ion-label position="floating">Mot de passe</ion-label>
            <ion-item>
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
          </ion-list>
        </form>

        <div class="guest-section ion-margin-bottom">
          <ion-text color="medium">
            <small>Ou continuer en tant que</small>
          </ion-text>
          <ion-button
            expand="block"
            fill="outline"
            @click="continueAsGuest"
            class="ion-margin-bottom"
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
  padding-top: 3rem;
}

.logo-section {
  text-align: center;
  margin-bottom: 3rem;
}

.logo-section h2 {
  margin: 1.5rem 0 0.5rem;
  color: #1a202c;
  font-weight: 700;
  font-size: 1.8rem;
  letter-spacing: -0.5px;
}

.logo-section p {
  color: #4a5568;
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  font-weight: 400;
}

/* Improved form styling */
ion-list {
  background: transparent;
  padding: 0;
}

ion-item {
  --background: rgba(255, 255, 255, 0.9);
  --border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

ion-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

ion-label {
  --color: #2d3748 !important;
  font-weight: 600;
  color: #2d3748;
}

ion-input {
  --color: #1a202c !important;
  --placeholder-color: #718096 !important;
  --placeholder-opacity: 0.7;
  color: #1a202c;
}

/* Button improvements */
ion-button[type="submit"] {
  --background: #3182ce;
  --background-hover: #2c5282;
  --background-activated: #2c5282;
  --border-radius: 12px;
  height: 48px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-top: 1.5rem;
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3);
  transition: all 0.2s ease;
  --color: white !important;
  color: white;
}

ion-button[type="submit"]:hover {
  box-shadow: 0 6px 16px rgba(49, 130, 206, 0.4);
  transform: translateY(-1px);
}

ion-button[fill="clear"] {
  --color: #3182ce !important;
  font-weight: 500;
  margin-top: 1rem;
  color: #3182ce;
}

ion-button[fill="outline"] {
  --border-color: #e2e8f0;
  --border-width: 2px;
  --border-radius: 12px;
  height: 48px;
  font-weight: 500;
  --color: #4a5568 !important;
  color: #4a5568;
  margin-top: 1rem;
  transition: all 0.2s ease;
}

ion-button[fill="outline"]:hover {
  --border-color: #3182ce;
  --color: #3182ce;
  background: rgba(49, 130, 206, 0.05);
}

/* Error and status improvements */
ion-text[color="danger"] {
  --color: #e53e3e;
  font-weight: 500;
  display: block;
  padding: 0.5rem 0;
  text-align: center;
}

.offline-mode {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #d69e2e;
  text-align: center;
  padding: 1rem;
  background: rgba(214, 158, 46, 0.1);
  border-radius: 8px;
  margin-top: 1rem;
  font-weight: 500;
}

.guest-section {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
  margin-top: 2rem;
}

.guest-section ion-text[color="medium"] {
  --color: #718096;
  font-weight: 500;
  display: block;
  margin-bottom: 1rem;
}

/* Content background */
ion-content {
  --background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
}

/* Responsive improvements */
@media (max-width: 480px) {
  .login-container {
    padding: 2rem 1rem;
  }
  
  .logo-section h2 {
    font-size: 1.6rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .logo-section h2 {
    color: hsl(204, 77%, 28%);
  }
  
  .logo-section p {
    color: hsl(204, 77%, 28%);
  }
  
  ion-item {
    --background: rgba(45, 55, 72, 0.9);
  }
  
  ion-label {
    --color: #f7fafc;
  }
  
  ion-input {
    --color: #f7fafc;
    --placeholder-color: #cbd5e0;
  }
}
</style>