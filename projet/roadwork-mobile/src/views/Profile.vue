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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.empty-state ion-icon {
  color: var(--ion-color-medium);
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0.5rem 0;
  color: var(--ion-color-medium);
}

.empty-state p {
  color: var(--ion-color-medium);
  margin-bottom: 1rem;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ion-color-light);
}

.profile-avatar ion-icon {
  color: var(--ion-color-medium);
}

.stat-item {
  text-align: center;
  padding: 1rem;
}

.stat-item h3 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--ion-color-primary);
}

.stat-item p {
  margin: 0.5rem 0 0;
  color: var(--ion-color-medium);
  font-size: 0.8rem;
}

.logout-button {
  margin: 1rem;
}

ion-card {
  margin: 1rem;
}

ion-card-header {
  text-align: center;
}
</style>
