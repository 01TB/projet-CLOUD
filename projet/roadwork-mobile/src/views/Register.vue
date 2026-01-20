<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/login"></ion-back-button>
        </ion-buttons>
        <ion-title>Inscription</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="register-container">
        <div class="logo-section">
          <ion-icon :icon="personAdd" size="large" color="primary"></ion-icon>
          <h2>Créer un compte</h2>
          <p>Rejoignez la communauté RoadWork</p>
        </div>

        <form @submit.prevent="handleRegister">
          <ion-list>
            <ion-item>
              <ion-label position="floating">Email</ion-label>
              <ion-input
                v-model="form.email"
                type="email"
                required
                placeholder="votre@email.com"
                @input="validateEmail"
              ></ion-input>
              <ion-note slot="error" v-if="emailError">{{ emailError }}</ion-note>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Mot de passe</ion-label>
              <ion-input
                v-model="form.password"
                type="password"
                required
                placeholder="••••••••"
                @input="validatePassword"
              ></ion-input>
              <ion-note slot="error" v-if="passwordError">{{ passwordError }}</ion-note>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Confirmer le mot de passe</ion-label>
              <ion-input
                v-model="form.confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                @input="validatePasswordMatch"
              ></ion-input>
              <ion-note slot="error" v-if="confirmPasswordError">{{ confirmPasswordError }}</ion-note>
            </ion-item>

            <ion-item lines="none">
              <ion-checkbox v-model="form.terms" slot="start"></ion-checkbox>
              <ion-label>
                J'accepte les 
                <a href="#" @click.prevent="showTerms">conditions d'utilisation</a>
              </ion-label>
              <ion-note slot="error" v-if="termsError">{{ termsError }}</ion-note>
            </ion-item>

            <ion-item lines="none" v-if="error">
              <ion-text color="danger">
                <small>{{ error }}</small>
              </ion-text>
            </ion-item>

            <ion-button
              expand="block"
              type="submit"
              :disabled="loading || !formValid"
              class="ion-margin-top"
            >
              <ion-spinner v-if="loading" slot="start"></ion-spinner>
              S'inscrire
            </ion-button>

            <div class="login-link ion-margin-top">
              <ion-text color="medium">
                <small>Déjà un compte ?</small>
              </ion-text>
              <ion-button
                fill="clear"
                size="small"
                @click="router.push('/login')"
              >
                Se connecter
              </ion-button>
            </div>
          </ion-list>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonInput, IonItem, IonLabel, IonList,
  IonIcon, IonText, IonSpinner, IonBackButton, IonButtons,
  IonCheckbox, IonNote, toastController, alertController
} from '@ionic/vue';
import { personAdd } from 'ionicons/icons';
import { useAuthStore } from '@/store/modules/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
  terms: false
});

const loading = ref(false);
const error = ref('');
const emailError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');
const termsError = ref('');

const formValid = computed(() => {
  return form.value.email && 
         form.value.password && 
         form.value.confirmPassword && 
         form.value.terms &&
         !emailError.value &&
         !passwordError.value &&
         !confirmPasswordError.value;
});

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.value.email) {
    emailError.value = 'Email requis';
  } else if (!emailRegex.test(form.value.email)) {
    emailError.value = 'Format email invalide';
  } else {
    emailError.value = '';
  }
};

const validatePassword = () => {
  if (!form.value.password) {
    passwordError.value = 'Mot de passe requis';
  } else if (form.value.password.length < 6) {
    passwordError.value = 'Minimum 6 caractères';
  } else {
    passwordError.value = '';
  }
  validatePasswordMatch();
};

const validatePasswordMatch = () => {
  if (!form.value.confirmPassword) {
    confirmPasswordError.value = 'Confirmation requise';
  } else if (form.value.password !== form.value.confirmPassword) {
    confirmPasswordError.value = 'Les mots de passe ne correspondent pas';
  } else {
    confirmPasswordError.value = '';
  }
};

const showTerms = async () => {
  const alert = await alertController.create({
    header: 'Conditions d\'utilisation',
    message: `
      <h3>RoadWork Mobile - Conditions d'utilisation</h3>
      <p>En utilisant cette application, vous acceptez de :</p>
      <ul>
        <li>Fournir des informations véridiques</li>
        <li>Respecter la vie privée des autres</li>
        <li>Utiliser l'application à des fins légales</li>
        <li>Ne pas créer de faux signalements</li>
        <li>Respecter les lois locales</li>
      </ul>
      <p>Vos données sont sécurisées et utilisées uniquement pour le service.</p>
    `,
    buttons: ['J\'ai compris']
  });
  await alert.present();
};

const handleRegister = async () => {
  // Validation finale
  validateEmail();
  validatePassword();
  validatePasswordMatch();
  
  if (!form.value.terms) {
    termsError.value = 'Vous devez accepter les conditions';
    return;
  }
  
  if (emailError.value || passwordError.value || confirmPasswordError.value) {
    return;
  }

  loading.value = true;
  error.value = '';
  termsError.value = '';

  try {
    const result = await authStore.register({
      email: form.value.email,
      password: form.value.password
    });

    if (result.success) {
      const toast = await toastController.create({
        message: 'Compte créé avec succès !',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
      
      router.push('/map');
    } else {
      error.value = result.error || 'Erreur d\'inscription';
    }
  } catch (err) {
    error.value = err.message || 'Erreur d\'inscription';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
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

.login-link {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>