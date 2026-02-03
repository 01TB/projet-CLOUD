<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/map"></ion-back-button>
        </ion-buttons>
        <ion-title>Profil</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="editProfile">
            <ion-icon :icon="create" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="loading" class="loading-container">
        <ion-spinner></ion-spinner>
        <p>Chargement du profil...</p>
      </div>

      <div v-else-if="!authStore.user" class="empty-state">
        <ion-icon :icon="person" size="large"></ion-icon>
        <h3>Non connecté</h3>
        <p>Veuillez vous connecter pour voir votre profil</p>
        <ion-button fill="outline" @click="router.push('/login')">
          Se connecter
        </ion-button>
      </div>

      <div v-else>
        <!-- Informations utilisateur -->
        <ion-card>
          <ion-card-header>
            <ion-avatar class="profile-avatar">
              <ion-icon :icon="person" size="large"></ion-icon>
            </ion-avatar>
            <ion-card-title>{{ authStore.user.nom }} {{ authStore.user.prenom }}</ion-card-title>
            <ion-card-subtitle>{{ getRoleLabel(authStore.user.role) }}</ion-card-subtitle>
          </ion-card-header>
          
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-icon :icon="mail" slot="start"></ion-icon>
                <ion-label>{{ authStore.user.email }}</ion-label>
              </ion-item>
              
              <ion-item v-if="authStore.user.telephone">
                <ion-icon :icon="call" slot="start"></ion-icon>
                <ion-label>{{ authStore.user.telephone }}</ion-label>
              </ion-item>
              
              <ion-item>
                <ion-icon :icon="calendar" slot="start"></ion-icon>
                <ion-label>Inscrit le {{ formatDate(authStore.user.date_creation) }}</ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Statistiques -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Mes statistiques</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="4" v-for="stat in userStats" :key="stat.label">
                  <div class="stat-item">
                    <h3>{{ stat.value }}</h3>
                    <p>{{ stat.label }}</p>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>

        <!-- Actions -->
        <ion-card>
          <ion-card-content>
            <ion-list>
              <ion-item button @click="router.push('/signalements')">
                <ion-icon :icon="list" slot="start"></ion-icon>
                <ion-label>Mes signalements</ion-label>
                <ion-icon :icon="chevronForward" slot="end"></ion-icon>
              </ion-item>
              
              <ion-item button @click="router.push('/stats')" v-if="authStore.user.role === 1">
                <ion-icon :icon="barChart" slot="start"></ion-icon>
                <ion-label>Statistiques générales</ion-label>
                <ion-icon :icon="chevronForward" slot="end"></ion-icon>
              </ion-item>
              
              <ion-item button @click="showSettings">
                <ion-icon :icon="settings" slot="start"></ion-icon>
                <ion-label>Paramètres</ion-label>
                <ion-icon :icon="chevronForward" slot="end"></ion-icon>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Déconnexion -->
        <ion-button 
          expand="block" 
          fill="outline" 
          color="danger" 
          @click="logout"
          class="logout-button"
        >
          <ion-icon :icon="logOut" slot="start"></ion-icon>
          Se déconnecter
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonBackButton, IonButtons,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonList, IonItem, IonLabel, IonAvatar, IonSpinner,
  IonGrid, IonRow, IonCol,
  toastController
} from '@ionic/vue';
import {
  person, create, mail, call, calendar, list, chevronForward,
  barChart, settings, logOut
} from 'ionicons/icons';
import { useAuthStore } from '@/store/modules/auth';
import { useSignalementsStore } from '@/store/modules/signalements';

const router = useRouter();
const authStore = useAuthStore();
const signalementsStore = useSignalementsStore();

const loading = ref(true);

const userStats = computed(() => {
  if (!authStore.user) return [];
  
  const userSignalements = signalementsStore.signalements?.filter(s => 
    s.id_utilisateur_createur === authStore.user.id
  ) || [];
  
  const total = userSignalements.length;
  const completed = userSignalements.filter(s => {
    const status = getCurrentStatus(s);
    return status === 'Terminé';
  }).length;
  const pending = userSignalements.filter(s => {
    const status = getCurrentStatus(s);
    return status !== 'Terminé';
  }).length;
  
  return [
    { label: 'Total', value: total },
    { label: 'Terminés', value: completed },
    { label: 'En attente', value: pending }
  ];
});

const getCurrentStatus = (signalement) => {
  if (signalement.avancement_signalements && signalement.avancement_signalements[0]) {
    return signalement.avancement_signalements[0].statut_avancement?.nom || 'Nouveau';
  }
  return 'Nouveau';
};

const getRoleLabel = (role) => {
  const roles = {
    1: 'Manager',
    2: 'Utilisateur',
    3: 'Administrateur'
  };
  return roles[role] || 'Utilisateur';
};

const formatDate = (dateString) => {
  if (!dateString) return 'Inconnue';
  return new Date(dateString).toLocaleDateString('fr-MG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const editProfile = () => {
  // TODO: Implémenter l'édition du profil
  showToast('Fonctionnalité bientôt disponible');
};

const showSettings = () => {
  // TODO: Implémenter la page des paramètres
  showToast('Fonctionnalité bientôt disponible');
};

const logout = async () => {
  try {
    await authStore.logout();
    await router.push('/login');
    
    const toast = await toastController.create({
      message: 'Vous êtes déconnecté',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  } catch (error) {
    console.error('Logout error:', error);
    const toast = await toastController.create({
      message: 'Erreur lors de la déconnexion',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  }
};

const showToast = async (message) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color: 'medium'
  });
  await toast.present();
};

onMounted(async () => {
  try {
    await signalementsStore.fetchSignalements();
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-container p {
  color: #4a5568;
  font-weight: 500;
  margin-top: 1rem;
}

/* Empty state improvements */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.empty-state ion-icon {
  color: #cbd5e0;
  margin-bottom: 1.5rem;
  font-size: 4rem;
}

.empty-state h3 {
  margin: 0.5rem 0;
  color: #4a5568;
  font-weight: 600;
  font-size: 1.3rem;
}

.empty-state p {
  color: #718096;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

/* Profile card improvements */
ion-card {
  margin: 1rem;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

ion-card-header {
  padding: 2rem 1.5rem 1.5rem;
  text-align: center;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

.profile-avatar {
  width: 90px;
  height: 90px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3);
}

.profile-avatar ion-icon {
  color: white;
  font-size: 2.5rem;
}

ion-card-title {
  color: #1a202c;
  font-weight: 700;
  font-size: 1.5rem;
  margin: 0.5rem 0;
  letter-spacing: -0.5px;
}

ion-card-subtitle {
  color: #4a5568;
  font-weight: 500;
  font-size: 1rem;
  margin-top: 0.5rem;
}

/* List improvements */
ion-list {
  background: transparent;
  padding: 0;
}

ion-item {
  --background: rgba(255, 255, 255, 0.9);
  --border-radius: 12px;
  margin: 0.5rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  min-height: 56px;
}

ion-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

ion-item ion-icon {
  color: #3182ce;
  margin-right: 1rem;
}

ion-label {
  color: #2d3748;
  font-weight: 500;
}

/* Stats improvements */
.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 12px;
  margin: 0.5rem;
  transition: all 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-item h3 {
  color: #1a202c;
  font-weight: 700;
  font-size: 1.8rem;
  margin: 0.5rem 0;
  letter-spacing: -0.5px;
}

.stat-item p {
  color: #4a5568;
  font-weight: 500;
  margin: 0;
  font-size: 0.9rem;
}

/* Button improvements */
ion-button {
  --border-radius: 12px;
  height: 48px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

ion-button[fill="outline"] {
  --border-color: #e2e8f0;
  --border-width: 2px;
  --color: #4a5568 !important;
  color: #4a5568;
}

ion-button[fill="outline"]:hover {
  --border-color: #3182ce;
  --color: #3182ce;
  background: rgba(49, 130, 206, 0.05);
}

/* Header improvements */
ion-header {
  --background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

ion-title {
  color: #1a202c !important;
  font-weight: 700;
  font-size: 1.1rem;
}

/* Content background */
ion-content {
  --background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
}

/* Responsive improvements */
@media (max-width: 768px) {
  ion-card {
    margin: 0.5rem;
  }
  
  ion-card-header {
    padding: 1.5rem 1rem 1rem;
  }
  
  .profile-avatar {
    width: 80px;
    height: 80px;
  }
  
  ion-card-title {
    font-size: 1.3rem;
  }
  
  ion-item {
    margin: 0.5rem;
  }
  
  .stat-item {
    padding: 1rem;
    margin: 0.25rem;
  }
  
  .stat-item h3 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .empty-state {
    padding: 2rem 1rem;
  }
  
  .empty-state ion-icon {
    font-size: 3rem;
  }
  
  .empty-state h3 {
    font-size: 1.2rem;
  }
  
  ion-card-header {
    padding: 1rem 0.75rem 0.75rem;
  }
  
  .profile-avatar {
    width: 70px;
    height: 70px;
  }
  
  ion-card-title {
    font-size: 1.2rem;
  }
  
  .stat-item {
    padding: 0.75rem;
  }
  
  .stat-item h3 {
    font-size: 1.3rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .loading-container p {
    color: #cbd5e0;
  }
  
  .empty-state ion-icon {
    color: #4a5568;
  }
  
  .empty-state h3 {
    color: #cbd5e0;
  }
  
  .empty-state p {
    color: #718096;
  }
  
  ion-card {
    border-color: rgba(74, 85, 104, 0.8);
  }
  
  ion-card-header {
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
    border-bottom-color: rgba(74, 85, 104, 0.8);
  }
  
  ion-card-title {
    color: #f7fafc;
  }
  
  ion-card-subtitle {
    color: #cbd5e0;
  }
  
  ion-item {
    --background: rgba(45, 55, 72, 0.9);
  }
  
  ion-label {
    color: #f7fafc;
  }
  
  ion-item ion-icon {
    color: #63b3ed;
  }
  
  .stat-item {
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  }
  
  .stat-item h3 {
    color: #f7fafc;
  }
  
  .stat-item p {
    color: #cbd5e0;
  }
  
  ion-header {
    --background: rgba(26, 32, 44, 0.98);
    border-bottom-color: rgba(74, 85, 104, 0.8);
  }
  
  ion-title {
    color: #f7fafc;
  }
  
  ion-content {
    --background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }
}

/* Animation improvements */
.stat-item {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading states */
ion-spinner {
  --color: #3182ce;
}

/* Focus states */
ion-button:focus {
  --box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
}
</style>
