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
    // Nettoyer les anciens tokens pour éviter les conflits
    console.log(' Nettoyage des anciens tokens...');
    localStorage.removeItem('token');
    localStorage.removeItem('idToken');
    localStorage.removeItem('user');
    
    // Créer un objet simple avec seulement email et password
    const credentials = {
      email: String(form.value.email).trim(),
      password: String(form.value.password)
    };
    
    console.log(' Envoi des identifiants:', credentials);
    
    const result = await authStore.login(credentials);

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
      console.error(' Échec connexion:', result);
      error.value = result.error || 'Erreur de connexion';
      
      // Suggérer de créer un compte si identifiants incorrects
      if (result.error?.includes('incorrect') || result.error?.includes('trouvé')) {
        setTimeout(() => {
          if (confirm('Identifiants incorrects. Voulez-vous créer un nouveau compte ?')) {
            router.push('/register');
          }
        }, 1000);
      }
    }
  } catch (err) {
    console.error(' Erreur connexion:', err);
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
/* Dark background for login page */
ion-content {
  --background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
}

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
  color: #f7fafc !important;
  font-weight: 700;
  font-size: 1.8rem;
  letter-spacing: -0.5px;
}

.logo-section p {
  color: #cbd5e0 !important;
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  font-weight: 400;
}

/* Dark theme for form styling */
ion-list {
  background: transparent;
  padding: 0;
}

ion-item {
  --background: rgba(45, 55, 72, 0.8);
  --border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

ion-item:hover {
  box-shadow: 0 4px 12px rgba(240, 240, 240, 0.4);
  transform: translateY(-1px);
}

ion-label {
  --color: #f7fafc !important;
  font-weight: 600;
  font-size: 0.9rem;
}

ion-input {
  --color: #f7fafc !important;
  --placeholder-color: #a0aec0;
  --background: rgba(30, 41, 59, 0.6);
  --border-color: rgba(74, 85, 104, 0.8);
}

ion-input:focus {
  --background: rgba(30, 41, 59, 0.8);
  --border-color: #3182ce;
}

ion-button {
  --color: #f7fafc;
  font-weight: 600;
  margin-top: 1rem;
}

ion-button[color="primary"] {
  --background: rgba(49, 130, 206, 0.8);
  --color: #f7fafc;
}

ion-button[color="primary"]:hover {
  --background: rgba(49, 130, 206, 1);
}

ion-button[color="secondary"] {
  --background: rgba(72, 187, 120, 0.8);
  --color: #f7fafc;
}

ion-button[color="secondary"]:hover {
  --background: rgba(72, 187, 120, 1);
}

/* Dark theme for error messages */
ion-text[color="danger"] {
  --color: #ef4444 !important;
  font-weight: 500;
}

/* Dark theme for links */
ion-text[color="primary"] {
  --color: #3182ce !important;
  font-weight: 500;
}

ion-text[color="primary"]:hover {
  --color: #2c5282 !important;
}

/* Dark theme for loading spinner */
ion-spinner {
  color: #3182ce;
}

/* Dark theme for icons */
ion-icon[color="primary"] {
  color: #3182ce !important;
}

/* Dark theme for guest section */
.guest-section {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(74, 85, 104, 0.6);
  margin-top: 2rem;
}

.guest-section ion-text[color="medium"] {
  --color: #a0aec0 !important;
  font-weight: 500;
  display: block;
  margin-bottom: 1rem;
}

/* Dark theme for offline mode */
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

/* Responsive improvements */
@media (max-width: 768px) {
  .login-container {
    max-width: 350px;
    padding-top: 2rem;
  }
  
  .logo-section h2 {
    font-size: 1.5rem;
  }
  
  .logo-section p {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .login-container {
    max-width: 300px;
    padding-top: 1.5rem;
  }
  
  .logo-section h2 {
    font-size: 1.3rem;
  }
  
  .logo-section p {
    font-size: 0.85rem;
  }
  
  ion-item {
    margin-bottom: 0.75rem;
  }
}
</style>