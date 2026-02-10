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
            
            <ion-list>
              <ion-item v-if="signalement.surface">
                <ion-icon :icon="resize" slot="start"></ion-icon>
                <ion-label>Surface affectée</ion-label>
                <ion-note slot="end">{{ signalement.surface }} m²</ion-note>
              </ion-item>
              
              <ion-item v-if="signalement.budget">
                <ion-icon :icon="cash" slot="start"></ion-icon>
                <ion-label>Budget</ion-label>
                <ion-note slot="end">{{ formatBudget(signalement.budget) }}</ion-note>
              </ion-item>
              
              <ion-item v-if="signalement.id_entreprise || signalement.nom_entreprise || signalement.entreprise">
                <ion-icon :icon="business" slot="start"></ion-icon>
                <ion-label>Entreprise responsable</ion-label>
                <ion-note slot="end">{{ getEntrepriseInfo(signalement) }}</ion-note>
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

        <!-- Photos -->
        <ion-card v-if="signalement.photos && Array.isArray(signalement.photos) && signalement.photos.length > 0">
          <ion-card-header>
            <ion-card-title>Photos ({{ signalement.photos.length }})</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <!-- Debug info -->
            <div v-if="signalement.photos" style="margin-bottom: 1rem; font-size: 0.8rem; color: #666;">
              Debug: {{ signalement.photos.length }} photos trouvées
            </div>
            
            <Swiper 
              :modules="[Pagination]"
              :pagination="{ clickable: true }"
              :space-between="10"
              class="signalement-swiper"
            >
              <SwiperSlide v-for="(photo, index) in signalement.photos" :key="index">
                <div class="photo-container">
                  <img 
                    :src="getPhotoSrc(photo)" 
                    :alt="`Photo ${index + 1}`" 
                    class="signalement-image" 
                    @error="handleImageError"
                    @load="handleImageLoad"
                  />
                  <div v-if="!getPhotoSrc(photo)" class="photo-error">
                    Format de photo invalide
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
          </ion-card-content>
        </ion-card>
        
        <!-- Fallback si photos existent mais ne s'affichent pas -->
        <ion-card v-else-if="signalement.photos && signalement.photos.length === 0">
          <ion-card-content>
            <p style="text-align: center; color: #666;">Aucune photo disponible</p>
          </ion-card-content>
        </ion-card>

        <!-- Historique des avancements -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Historique des avancements</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item v-for="avancement in sortedAvancements" :key="avancement.id">
                <div class="timeline-dot" :class="getStatusClass(avancement.statut_avancement?.nom)" slot="start"></div>
                <ion-label>
                  <h3>{{ avancement.statut_avancement?.nom || 'Statut inconnu' }}</h3>
                  <p>{{ formatDate(avancement.date_avancement) }}</p>
                  <p v-if="avancement.commentaire">{{ avancement.commentaire }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
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
  IonGrid, IonRow, IonCol,
  toastController
} from '@ionic/vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import {
  create, alertCircle, map, shareSocial, resize, cash, business
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
    return signalement.value.avancement_signalements[0].statut_avancement?.nom || 'En attente';
  }
  return 'En attente';
};

const getStatusColor = (status) => {
  const colors = {
    'En attente': 'danger',
    'En cours': 'warning',
    'En validation': 'tertiary',
    'Validé': 'success',
    'Terminé': 'success'
  };
  return colors[status] || 'medium';
};

const getStatusClass = (status) => {
  const classes = {
    'En attente': 'status-new',
    'En cours': 'status-progress',
    'En validation': 'status-validation',
    'Validé': 'status-completed',
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

const formatBudget = (budget) => {
  if (!budget || budget === 0) return 'Non assigné';
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(budget);
};

const getEntrepriseInfo = (signalement) => {
  if (!signalement.id_entreprise) {
    return 'Non assigné';
  }
  
  if (signalement.nom_entreprise) {
    return signalement.nom_entreprise;
  }
  
  if (signalement.entreprise) {
    return signalement.entreprise;
  }
  
  return `Entreprise #${signalement.id_entreprise}`;
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

const handleImageError = (event) => {
  console.error('Erreur de chargement de l\'image:', event);
  const img = event.target;
  img.style.display = 'none';
  
  // Afficher un message d'erreur
  const errorDiv = document.createElement('div');
  errorDiv.className = 'photo-error';
  errorDiv.textContent = 'Impossible de charger cette photo';
  errorDiv.style.cssText = 'text-align: center; padding: 20px; color: #ef4444; background: #fef2f2; border-radius: 8px;';
  img.parentNode.appendChild(errorDiv);
};

const handleImageLoad = (event) => {
  console.log('Image chargée avec succès:', event.target.src);
};

const getPhotoSrc = (photo) => {
  // Si photo est null ou undefined
  if (!photo) return null;
  
  // Si photo est une chaîne de caractères
  if (typeof photo === 'string') {
    // Si c'est déjà une URL data ou une URL complète
    if (photo.startsWith('data:') || photo.startsWith('http')) {
      return photo;
    }
    // Sinon, c'est probablement une URL relative
    return photo;
  }
  
  // Si photo est un objet avec propriété data
  if (typeof photo === 'object' && photo.data) {
    return photo.data;
  }
  
  // Si photo est un objet avec propriété photo (format utilisé dans Map/List)
  if (typeof photo === 'object' && photo.photo) {
    return photo.photo;
  }
  
  // Si photo est un objet avec propriété url
  if (typeof photo === 'object' && photo.url) {
    return photo.url;
  }
  
  // Si photo est un objet avec propriété src
  if (typeof photo === 'object' && photo.src) {
    return photo.src;
  }
  
  // Format non reconnu
  console.warn('Format de photo non reconnu:', photo);
  return null;
};

const loadSignalement = async () => {
  try {
    loading.value = true;
    const id = route.params.id;
    await signalementsStore.fetchSignalementById(id);
    signalement.value = signalementsStore.currentSignalement;
    
    // Debug spécifique pour les photos
    console.log('📸 DEBUG - Signalement chargé:', signalement.value);
    console.log('📸 DEBUG - Photos brutes:', signalement.value?.photos);
    console.log('📸 DEBUG - Type de photos:', typeof signalement.value?.photos);
    console.log('📸 DEBUG - Longueur photos:', signalement.value?.photos?.length);
    
    if (signalement.value?.photos && signalement.value.photos.length > 0) {
      console.log('📸 DEBUG - Analyse des photos:');
      signalement.value.photos.forEach((photo, index) => {
        const photoSrc = getPhotoSrc(photo);
        console.log(`📸 Photo ${index}:`, {
          type: typeof photo,
          hasData: !!photo.data,
          hasPhoto: !!photo.photo,
          dataLength: photo.data?.length || 0,
          photoLength: photo.photo?.length || 0,
          isString: typeof photo === 'string',
          startsWithData: typeof photo === 'string' && photo.startsWith('data:'),
          keys: Object.keys(photo),
          photoSrc: photoSrc,
          photoSrcType: typeof photoSrc,
          photoSrcLength: photoSrc?.length || 0,
          photoSrcStartsWithData: typeof photoSrc === 'string' && photoSrc.startsWith('data:')
        });
      });
    }
    
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
/* Dark background for signalement detail */
ion-content {
  --background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
}

/* Dark theme for cards */
ion-card {
  --background: rgba(45, 55, 72, 0.8);
  --color: #f7fafc;
  --border-color: rgba(74, 85, 104, 0.6);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
}

ion-card:hover {
  --background: rgba(45, 55, 72, 1);
  --border-color: rgba(74, 85, 104, 0.8);
}

ion-card-header {
  --background: rgba(30, 41, 59, 0.8);
  --color: #f7fafc;
  --border-color: rgba(74, 85, 104, 0.6);
}

ion-card-title {
  --color: #f7fafc !important;
  font-weight: 600;
}

ion-card-content {
  --color: #f7fafc;
}

/* Dark theme for loading and empty states */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-container p {
  color: #cbd5e0 !important;
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
  color: #a0aec0;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0.5rem 0;
  color: #cbd5e0 !important;
}

.empty-state p {
  color: #a0aec0;
  margin-bottom: 1rem;
}

/* Dark theme for status header */
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
  color: #a0aec0;
  font-size: 0.9rem;
}

/* Dark theme for labels and text */
ion-label {
  --color: #f7fafc !important;
  font-weight: 500;
}

ion-label h2 {
  color: #f7fafc !important;
  font-weight: 600;
}

ion-label h3 {
  color: #f7fafc !important;
  font-weight: 500;
}

ion-label p {
  color: #cbd5e0 !important;
}

/* Dark theme for buttons */
ion-button {
  --color: #f7fafc;
}

ion-button[color="primary"] {
  --background: rgba(49, 130, 206, 0.8);
  --color: #f7fafc;
}

ion-button[color="secondary"] {
  --background: rgba(72, 187, 120, 0.8);
  --color: #f7fafc;
}

ion-button[color="danger"] {
  --background: rgba(229, 62, 62, 0.8);
  --color: #f7fafc;
}

/* Dark theme for badges */
ion-badge {
  --background: #3182ce;
  --color: white;
}

/* Dark theme for items */
ion-item {
  --background: rgba(45, 55, 72, 0.8);
  --color: #f7fafc;
  --border-color: rgba(74, 85, 104, 0.6);
  --border-radius: 12px;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

ion-item:hover {
  --background: rgba(45, 55, 72, 1);
  --border-color: rgba(74, 85, 104, 0.8);
}

/* Dark theme for textareas and inputs */
ion-textarea {
  --color: #f7fafc !important;
  --placeholder-color: #a0aec0;
  --background: rgba(30, 41, 59, 0.6);
  --border-color: rgba(74, 85, 104, 0.8);
}

ion-textarea:focus {
  --background: rgba(30, 41, 59, 0.8);
  --border-color: #3182ce;
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

/* Dark theme for chips */
ion-chip {
  --background: rgba(49, 130, 206, 0.2);
  --color: #3182ce;
  --border-color: rgba(49, 130, 206, 0.4);
}

/* Dark theme for progress bars */
ion-progress-bar {
  --background: rgba(74, 85, 104, 0.6);
}

ion-progress-bar::part(progress) {
  background: #3182ce;
}

/* Dark theme for select */
ion-select {
  --color: #f7fafc !important;
  --placeholder-color: #a0aec0;
  --background: rgba(30, 41, 59, 0.6);
  --border-color: rgba(74, 85, 104, 0.8);
}

ion-select:focus {
  --background: rgba(30, 41, 59, 0.8);
  --border-color: #3182ce;
}

/* Dark theme for radio buttons */
ion-radio {
  --color: #f7fafc;
}

ion-radio::part(container) {
  --background: rgba(45, 55, 72, 0.6);
  --border-color: rgba(74, 85, 104, 0.8);
}

ion-radio::part(mark) {
  --background: #3182ce;
}

/* Dark theme for range sliders */
ion-range {
  --background: rgba(74, 85, 104, 0.6);
}

ion-range::part(knob) {
  --background: #3182ce;
}

ion-range::part(bar) {
  background: rgba(49, 130, 206, 0.6);
}

/* Dark theme for toggle */
ion-toggle {
  --background: rgba(74, 85, 104, 0.6);
}

ion-toggle::part(track) {
  background: rgba(49, 130, 206, 0.6);
}

ion-toggle::part(handle) {
  --background: #3182ce;
}

/* Dark theme for spinner */
ion-spinner {
  color: #3182ce;
}

/* Additional dark theme styles */
.description {
  line-height: 1.5;
  margin-bottom: 1rem;
  color: #cbd5e0 !important;
}

.map-container {
  height: 200px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a0aec0;
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
  background: #ef4444;
}

.status-progress {
  background: #f59e0b;
}

.status-validation {
  background: #06b6d4;
}

.status-completed {
  background: #10b981;
}

.status-default {
  background: #6b7280;
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

/* Swiper styles */
.signalement-swiper {
  height: 300px;
  width: 100%;
}

.signalement-swiper .swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
}

.photo-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.signalement-image {
  max-width: 100%;
  max-height: 280px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.photo-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  padding: 20px;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}

.signalement-swiper .swiper-pagination-bullet {
  background: #3182ce;
}

.signalement-swiper .swiper-pagination-bullet-active {
  background: #3182ce;
}

</style>
