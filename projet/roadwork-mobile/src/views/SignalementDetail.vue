<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="backRoute"></ion-back-button>
        </ion-buttons>
        <ion-title>Signalement #{{ signalement?.id }}</ion-title>
        <ion-buttons slot="end" v-if="canEdit">
          <ion-button @click="editSignalement">
            <ion-icon :icon="create" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="loading" class="loading-container">
        <ion-spinner></ion-spinner>
        <p>Chargement du signalement...</p>
      </div>

      <div v-else-if="!signalement" class="empty-state">
        <ion-icon :icon="alertCircle" size="large"></ion-icon>
        <h3>Signalement introuvable</h3>
        <p>Ce signalement n'existe pas ou a été supprimé</p>
        <ion-button fill="outline" @click="router.push('/signalements')">
          Retour à la liste
        </ion-button>
      </div>

      <div v-else>
        <!-- Statut actuel -->
        <ion-card>
          <ion-card-content>
            <div class="status-header">
              <ion-badge :color="getStatusColor(getCurrentStatus())" class="status-badge">
                {{ getCurrentStatus() }}
              </ion-badge>
              <span class="date">{{ formatDate(signalement.date_creation) }}</span>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Informations principales -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Description</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p class="description">{{ signalement.description }}</p>
            
            <ion-list v-if="signalement.surface">
              <ion-item>
                <ion-icon :icon="resize" slot="start"></ion-icon>
                <ion-label>Surface affectée</ion-label>
                <ion-note slot="end">{{ signalement.surface }} m²</ion-note>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Localisation -->
        <ion-card v-if="signalement.localisation">
          <ion-card-header>
            <ion-card-title>Localisation</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="map-container" ref="mapContainer">
              <!-- La carte sera initialisée ici -->
            </div>
            <ion-button 
              expand="block" 
              fill="outline" 
              @click="viewOnMap"
              class="map-button"
            >
              <ion-icon :icon="map" slot="start"></ion-icon>
              Voir sur la carte
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Images -->
        <ion-card v-if="signalement.images && signalement.images.length > 0">
          <ion-card-header>
            <ion-card-title>Images</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-slides pager="true" :options="slideOptions">
              <ion-slide v-for="(image, index) in signalement.images" :key="index">
                <img :src="image.url" :alt="`Image ${index + 1}`" class="signalement-image" />
              </ion-slide>
            </ion-slides>
          </ion-card-content>
        </ion-card>

        <!-- Historique des avancements -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Historique des avancements</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-timeline>
              <ion-item v-for="avancement in sortedAvancements" :key="avancement.id">
                <div slot="start" class="timeline-dot" :class="getStatusClass(avancement.statut_avancement?.nom)"></div>
                <ion-label>
                  <h3>{{ avancement.statut_avancement?.nom || 'Nouveau' }}</h3>
                  <p>{{ formatDate(avancement.date_creation) }}</p>
                  <p v-if="avancement.commentaire">{{ avancement.commentaire }}</p>
                </ion-label>
              </ion-item>
            </ion-timeline>
          </ion-card-content>
        </ion-card>

        <!-- Actions -->
        <ion-card v-if="canEdit || canShare">
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="6" v-if="canEdit">
                  <ion-button expand="block" fill="outline" @click="editSignalement">
                    <ion-icon :icon="create" slot="start"></ion-icon>
                    Modifier
                  </ion-button>
                </ion-col>
                <ion-col size="6" v-if="canShare">
                  <ion-button expand="block" fill="outline" @click="shareSignalement">
                    <ion-icon :icon="shareSocial" slot="start"></ion-icon>
                    Partager
                  </ion-button>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonBackButton, IonButtons,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonList, IonItem, IonLabel, IonNote, IonBadge, IonSpinner,
  IonGrid, IonRow, IonCol, IonSlides, IonSlide, IonTimeline,
  toastController
} from '@ionic/vue';
import {
  create, alertCircle, map, shareSocial, resize
} from 'ionicons/icons';
import { useAuthStore } from '@/store/modules/auth';
import { useSignalementsStore } from '@/store/modules/signalements';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const signalementsStore = useSignalementsStore();

const loading = ref(true);
const signalement = ref(null);
const mapContainer = ref(null);

const slideOptions = {
  initialSlide: 0,
  speed: 400,
  spaceBetween: 10
};

const backRoute = computed(() => {
  return route.query.from || '/signalements';
});

const canEdit = computed(() => {
  return authStore.isAuthenticated && 
         signalement.value && 
         signalement.value.id_utilisateur_createur === authStore.user?.id;
});

const canShare = computed(() => {
  return 'share' in navigator;
});

const sortedAvancements = computed(() => {
  if (!signalement.value?.avancement_signalements) return [];
  return [...signalement.value.avancement_signalements].sort((a, b) => 
    new Date(b.date_creation) - new Date(a.date_creation)
  );
});

const getCurrentStatus = () => {
  if (signalement.value?.avancement_signalements && signalement.value.avancement_signalements[0]) {
    return signalement.value.avancement_signalements[0].statut_avancement?.nom || 'Nouveau';
  }
  return 'Nouveau';
};

const getStatusColor = (status) => {
  const colors = {
    'Nouveau': 'danger',
    'En cours': 'warning',
    'Terminé': 'success'
  };
  return colors[status] || 'medium';
};

const getStatusClass = (status) => {
  const classes = {
    'Nouveau': 'status-new',
    'En cours': 'status-progress',
    'Terminé': 'status-completed'
  };
  return classes[status] || 'status-default';
};

const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue';
  return new Date(dateString).toLocaleDateString('fr-MG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const editSignalement = () => {
  router.push(`/signalement/${signalement.value.id}/edit`);
};

const viewOnMap = () => {
  router.push({ 
    name: 'Map',
    query: { 
      focus: signalement.value.id,
      lat: signalement.value.localisation?.coordinates?.[1],
      lng: signalement.value.localisation?.coordinates?.[0]
    }
  });
};

const shareSignalement = async () => {
  if (!canShare.value) return;
  
  try {
    await navigator.share({
      title: `Signalement #${signalement.value.id}`,
      text: `Problème routier: ${signalement.value.description?.substring(0, 100)}...`,
      url: `${window.location.origin}/signalement/${signalement.value.id}`
    });
  } catch (error) {
    console.log('Share cancelled:', error);
  }
};

const loadSignalement = async () => {
  try {
    loading.value = true;
    const id = route.params.id;
    await signalementsStore.fetchSignalementById(id);
    signalement.value = signalementsStore.currentSignalement;
    
    // Initialiser la carte si nécessaire
    if (signalement.value?.localisation) {
      await nextTick();
      // TODO: Initialiser la carte ici
    }
  } catch (error) {
    console.error('Error loading signalement:', error);
    const toast = await toastController.create({
      message: 'Erreur lors du chargement du signalement',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadSignalement();
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

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
}

.date {
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.description {
  line-height: 1.5;
  margin-bottom: 1rem;
}

.map-container {
  height: 200px;
  background: var(--ion-color-light);
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ion-color-medium);
}

.map-button {
  margin-top: 0.5rem;
}

.signalement-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 1rem;
  flex-shrink: 0;
}

.status-new {
  background: var(--ion-color-danger);
}

.status-progress {
  background: var(--ion-color-warning);
}

.status-completed {
  background: var(--ion-color-success);
}

.status-default {
  background: var(--ion-color-medium);
}

ion-card {
  margin: 1rem;
}

ion-card-header {
  padding-bottom: 0;
}

ion-card-title {
  font-size: 1.1rem;
  font-weight: 600;
}
</style>
