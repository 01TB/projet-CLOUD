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
            <ion-label position="floating">Nom</ion-label>
            <ion-item>
              <ion-input
                v-model="form.nom"
                type="text"
                required
                placeholder="Votre nom"
                @ionInput="validateNom"
                @ionBlur="validateNom"
              ></ion-input>
              <ion-note slot="error" v-if="nomError">{{ nomError }}</ion-note>
            </ion-item>

            <ion-label position="floating">Prénom</ion-label>
            <ion-item>
              <ion-input
                v-model="form.prenom"
                type="text"
                required
                placeholder="Votre prénom"
                @ionInput="validatePrenom"
                @ionBlur="validatePrenom"
              ></ion-input>
              <ion-note slot="error" v-if="prenomError">{{ prenomError }}</ion-note>
            </ion-item>

            <ion-label position="floating">Email</ion-label>
            <ion-item>
              <ion-input
                v-model="form.email"
                type="email"
                required
                placeholder="votre@email.com"
                @ionInput="validateEmail"
                @ionBlur="validateEmail"
              ></ion-input>
              <ion-note slot="error" v-if="emailError">{{ emailError }}</ion-note>
            </ion-item>

            <ion-label position="floating">Téléphone</ion-label>
            <ion-item>
              <ion-input
                v-model="form.telephone"
                type="tel"
                placeholder="+261340000000"
                @ionInput="validateTelephone"
                @ionBlur="validateTelephone"
              ></ion-input>
              <ion-note slot="error" v-if="telephoneError">{{ telephoneError }}</ion-note>
            </ion-item>

            <ion-label position="floating">Mot de passe</ion-label>
            <ion-item>
              <ion-input
                v-model="form.password"
                type="password"
                required
                placeholder="••••••••"
                @ionInput="validatePassword"
                @ionBlur="validatePassword"
              ></ion-input>
              <ion-note slot="helper" v-if="!passwordError && form.password">Minimum 6 caractères</ion-note>
              <ion-note slot="error" v-if="passwordError">{{ passwordError }}</ion-note>
            </ion-item>

            <ion-label position="floating">Confirmer le mot de passe</ion-label>
            <ion-item>
              <ion-input
                v-model="form.confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                @ionInput="validatePasswordMatch"
                @ionBlur="validatePasswordMatch"
              ></ion-input>
              <ion-note slot="error" v-if="confirmPasswordError">{{ confirmPasswordError }}</ion-note>
            </ion-item>

            <ion-item lines="none" class="terms-item">
              <ion-checkbox v-model="form.terms" slot="start" @ionChange="validateTerms"></ion-checkbox>
              <ion-label class="terms-label">
                J'accepte les 
                <a href="#" @click.prevent="showTerms">conditions d'utilisation</a>
              </ion-label>
              <ion-note slot="error" v-if="termsError" class="terms-error">{{ termsError }}</ion-note>
            </ion-item>

            <ion-item lines="none" v-if="error" class="error-item">
              <ion-text color="danger">
                <div class="error-message">
                  <ion-icon :icon="warningOutline" class="error-icon"></ion-icon>
                  {{ error }}
                </div>
              </ion-text>
            </ion-item>

            <ion-button
              expand="block"
              type="submit"
              :disabled="!isFormValid || loading"
              class="ion-margin-top register-button"
            >
              <ion-spinner v-if="loading" slot="start"></ion-spinner>
              {{ loading ? 'Inscription en cours...' : 'S\'inscrire' }}
            </ion-button>
          </ion-list>
        </form>

        <div class="login-link ion-margin-top">
          <ion-text color="medium">
            Déjà un compte ?
          </ion-text>
          <ion-button
            fill="clear"
            size="small"
            @click="router.push('/login')"
          >
            Se connecter
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonInput, IonItem, IonLabel, IonList,
  IonIcon, IonText, IonSpinner, IonBackButton, IonButtons,
  IonCheckbox, IonNote, toastController, alertController
} from '@ionic/vue';
import { personAdd, warningOutline } from 'ionicons/icons';
import { useAuthStore } from '@/store/modules/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  password: '',
  confirmPassword: '',
  terms: false
});

const loading = ref(false);
const error = ref('');
const emailError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');
const nomError = ref('');
const prenomError = ref('');
const telephoneError = ref('');
const termsError = ref('');

// Tracking pour savoir si les champs ont été touchés
const touched = ref({
  nom: false,
  prenom: false,
  email: false,
  telephone: false,
  password: false,
  confirmPassword: false,
  terms: false
});

// Watch pour validation en temps réel
watch(() => form.value.terms, () => {
  touched.value.terms = true;
  validateTerms();
});

// Validation complète pour le bouton - CORRIGÉE
const isFormValid = computed(() => {
  // Vérifier que tous les champs requis sont remplis
  const hasRequiredFields = !!(form.value.nom && 
                           form.value.prenom &&
                           form.value.email && 
                           form.value.password && 
                           form.value.confirmPassword);
  
  // Vérifier qu'il n'y a aucune erreur de validation
  const noErrors = (!emailError.value || emailError.value === '') && 
                  (!passwordError.value || passwordError.value === '') && 
                  (!confirmPasswordError.value || confirmPasswordError.value === '') && 
                  (!nomError.value || nomError.value === '') && 
                  (!prenomError.value || prenomError.value === '') &&
                  (!telephoneError.value || telephoneError.value === ''); // AJOUTÉ
  
  // Vérifier que les conditions sont acceptées
  const termsAccepted = form.value.terms;
  
  console.log('Validation état:', {
    hasRequiredFields,
    noErrors,
    termsAccepted,
    errors: {
      nom: nomError.value,
      prenom: prenomError.value,
      email: emailError.value,
      telephone: telephoneError.value,
      password: passwordError.value,
      confirmPassword: confirmPasswordError.value,
      terms: termsError.value
    }
  });
  
  return hasRequiredFields && noErrors && termsAccepted;
});

const validateNom = () => {
  if (!form.value.nom) {
    nomError.value = 'Nom requis';
    return false;
  } else {
    nomError.value = '';
    return true;
  }
};

const validatePrenom = () => {
  if (!form.value.prenom) {
    prenomError.value = 'Prénom requis';
    return false;
  } else {
    prenomError.value = '';
    return true;
  }
};

const validateTelephone = () => {
  // Le téléphone est optionnel, donc toujours valide
  telephoneError.value = '';
  return true;
};

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.value.email) {
    emailError.value = 'Email requis';
    return false;
  } else if (!emailRegex.test(form.value.email)) {
    emailError.value = 'Format email invalide';
    return false;
  } else {
    emailError.value = '';
    return true;
  }
};

const validatePassword = () => {
  if (!form.value.password) {
    passwordError.value = 'Mot de passe requis';
    return false;
  } else if (form.value.password.length < 6) {
    passwordError.value = 'Minimum 6 caractères';
    return false;
  } else {
    passwordError.value = '';
    // Revalider la confirmation si elle existe
    if (form.value.confirmPassword) {
      validatePasswordMatch();
    }
    return true;
  }
};

const validatePasswordMatch = () => {
  if (!form.value.confirmPassword) {
    confirmPasswordError.value = 'Confirmation requise';
    return false;
  } else if (form.value.password !== form.value.confirmPassword) {
    confirmPasswordError.value = 'Les mots de passe ne correspondent pas';
    return false;
  } else {
    confirmPasswordError.value = '';
    return true;
  }
};

const validateTerms = () => {
  if (!form.value.terms) {
    termsError.value = 'Vous devez accepter les conditions';
    return false;
  } else {
    termsError.value = '';
    return true;
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
  console.log('handleRegister called');
  
  // Validation finale
  const isNomValid = validateNom();
  const isPrenomValid = validatePrenom();
  const isEmailValid = validateEmail();
  const isTelephoneValid = validateTelephone();
  const isPasswordValid = validatePassword();
  const isPasswordMatchValid = validatePasswordMatch();
  const isTermsValid = validateTerms();
  
  if (!isNomValid || !isPrenomValid || !isEmailValid || !isTelephoneValid || 
      !isPasswordValid || !isPasswordMatchValid || !isTermsValid) {
    console.log('Validation failed, stopping registration');
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    // Préparer les données à envoyer
    const registerData = {
      nom: form.value.nom,
      prenom: form.value.prenom,
      email: form.value.email,
      telephone: form.value.telephone || null, // Envoyer null si vide
      password: form.value.password
    };

    console.log('Données d\'inscription:', registerData);

    const result = await authStore.register(registerData);
    
    console.log('Register result:', result);

    if (result.success) {
      const toast = await toastController.create({
        message: 'Compte créé avec succès !',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
      
      // Redirection après un court délai
      setTimeout(() => {
        router.push('/map');
      }, 500);
    } else {
      error.value = result.error || 'Erreur d\'inscription';
      loading.value = false;
    }
  } catch (err) {
    console.error('Erreur dans handleRegister:', err);
    error.value = err.message || 'Erreur d\'inscription';
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
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

ion-textarea {
  --color: #1a202c !important;
  --placeholder-color: #718096 !important;
  --placeholder-opacity: 0.7;
  color: #1a202c;
}

/* Button improvements */
.register-button {
  --background: #38a169;
  --background-hover: #2f855a;
  --background-activated: #2f855a;
  --border-radius: 12px;
  height: 48px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-top: 1.5rem;
  box-shadow: 0 4px 12px rgba(56, 161, 105, 0.3);
  transition: all 0.2s ease;
  --color: white !important;
  color: white;
}

.register-button:hover {
  box-shadow: 0 6px 16px rgba(56, 161, 105, 0.4);
  transform: translateY(-1px);
}

.register-button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

/* Error improvements */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(229, 62, 62, 0.1);
  border-radius: 8px;
  border-left: 4px solid #e53e3e;
  width: 100%;
  margin: 1rem 0;
}

.error-icon {
  color: #e53e3e;
  font-size: 20px;
  flex-shrink: 0;
}

.error-item {
  margin: 1rem 0;
}

/* Notes styling */
ion-note[slot="error"] {
  color: #e53e3e;
  font-weight: 500;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

ion-note[slot="helper"] {
  color: #718096;
  font-weight: 400;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

/* Terms styling */
.terms-item {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.9);
  --border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 1rem;
}

.terms-label {
  font-size: 14px;
  white-space: normal;
  margin-left: 8px;
  color: #4a5568;
  line-height: 1.5;
}

.terms-label a {
  color: #3182ce;
  text-decoration: none;
  font-weight: 500;
}

.terms-label a:hover {
  text-decoration: underline;
}

.terms-error {
  color: #e53e3e;
  font-weight: 500;
  font-size: 12px;
  margin-top: 8px;
  width: 100%;
}

/* Login link */
.login-link {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.login-link ion-text {
  color: #4a5568;
  font-weight: 500;
}

.login-link ion-button {
  --color: #3182ce;
  font-weight: 600;
}

/* Content background */
ion-content {
  --background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
}

/* Responsive improvements */
@media (max-width: 480px) {
  .register-container {
    padding: 2rem 1rem;
  }
  
  .logo-section h2 {
    font-size: 1.6rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .logo-section h2 {
    color: #f7fafc;
  }
  
  .logo-section p {
    color: #cbd5e0;
  }
  
  ion-item {
    --background: rgba(45, 55, 72, 0.9);
  }
  
  .terms-item {
    --background: rgba(45, 55, 72, 0.9);
  }
  
  ion-label {
    --color: #f7fafc;
  }
  
  ion-input, ion-textarea {
    --color: #f7fafc;
    --placeholder-color: #cbd5e0;
  }
  
  .terms-label {
    color: #cbd5e0;
  }
  
  .login-link ion-text {
    color: #cbd5e0;
  }
}
</style>