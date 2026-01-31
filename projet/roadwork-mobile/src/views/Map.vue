<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Carte des Signalements</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refreshData">
            <ion-icon :icon="refresh" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button @click="centerOnLocation" v-if="hasGeolocation">
            <ion-icon :icon="locate" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button @click="toggleFilter" v-if="authStatus">
            <ion-icon :icon="filter" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Carte Leaflet -->
      <div class="map-container">
        <l-map
          ref="map"
          :zoom="zoom"
          :center="center"
          @ready="onMapReady"
          @update:center="centerUpdated"
          @update:zoom="zoomUpdated"
          @click="onMapClick"
        >
          <l-tile-layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            layer-type="base"
            name="OpenStreetMap"
          ></l-tile-layer>
          
          <!-- Marqueurs des signalements -->
          <l-marker
            v-for="signalement in filteredSignalements"
            :key="signalement.id"
            :lat-lng="getLatLng(signalement)"
            @click="showSignalementDetail(signalement)"
          >
            <l-icon
              :icon-url="getMarkerIcon(signalement)"
              :icon-size="[32, 32]"
              :icon-anchor="[16, 32]"
            />
            <l-popup>
              <div class="signalement-popup">
                <h3>{{ signalement.description }}</h3>
                <p><strong>Statut:</strong> {{ getCurrentStatus(signalement) }}</p>
                <p><strong>Surface:</strong> {{ signalement.surface }} m²</p>
                <p><strong>Budget:</strong> {{ formatBudget(signalement.budget) }}</p>
                <p><strong>Date:</strong> {{ formatDate(signalement.date_creation) }}</p>
                
                <!-- Actions CRUD pour utilisateur connecté -->
                <div v-if="authStatus" class="popup-actions">
                  <!-- Actions pour le propriétaire du signalement -->
                  <template v-if="canEditSignalement(signalement)">
                    <ion-button 
                      size="small" 
                      expand="block" 
                      fill="outline"
                      @click="editSignalement(signalement)"
                      class="action-button"
                    >
                      <ion-icon :icon="create" slot="start"></ion-icon>
                      Modifier
                    </ion-button>
                    <ion-button 
                      size="small" 
                      expand="block" 
                      fill="outline"
                      color="danger"
                      @click="confirmDeleteSignalement(signalement)"
                      class="action-button"
                    >
                      <ion-icon :icon="trash" slot="start"></ion-icon>
                      Supprimer
                    </ion-button>
                  </template>
                  
                  <!-- Actions pour tous les utilisateurs connectés -->
                  <ion-button 
                    size="small" 
                    expand="block" 
                    fill="outline"
                    @click="addProgress(signalement)"
                    class="action-button"
                  >
                    <ion-icon :icon="chatbubble" slot="start"></ion-icon>
                    Ajouter un commentaire
                  </ion-button>
                  
                  <ion-button 
                    size="small" 
                    expand="block" 
                    @click="viewDetails(signalement.id)"
                    class="action-button"
                  >
                    <ion-icon :icon="eye" slot="start"></ion-icon>
                    Détails complets
                  </ion-button>
                </div>
                
                <!-- Action pour les non-connectés -->
                <ion-button 
                  v-else-if="!authStatus"
                  size="small" 
                  expand="block" 
                  @click="viewDetails(signalement.id)"
                >
                  Détails
                </ion-button>
              </div>
            </l-popup>
          </l-marker>
          
          <!-- Position de l'utilisateur -->
          <l-marker
            v-if="userLocation"
            :lat-lng="userLocation"
            :icon="userLocationIcon"
          >
            <l-popup>
              <div>Votre position</div>
            </l-popup>
          </l-marker>
        </l-map>
      </div>

      <!-- Bouton flottant pour créer un signalement -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed" v-if="authStatus">
        <ion-fab-button @click="createSignalement">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <!-- Statistiques simplifiées (temporairement sans slides) -->
      <div v-if="showStats" class="stats-container">
        <div class="stats-grid">
          <div class="stat-card">
            <ion-icon :icon="alertCircle" size="large"></ion-icon>
            <h3>{{ stats.total_signalements || 0 }}</h3>
            <p>Signalements</p>
          </div>
          <div class="stat-card">
            <ion-icon :icon="square" size="large"></ion-icon>
            <h3>{{ stats.total_surface || 0 }} m²</h3>
            <p>Surface totale</p>
          </div>
          <div class="stat-card">
            <ion-icon :icon="cash" size="large"></ion-icon>
            <h3>{{ formatBudget(stats.total_budget) }}</h3>
            <p>Budget total</p>
          </div>
          <div class="stat-card">
            <ion-icon :icon="trendingUp" size="large"></ion-icon>
            <h3>{{ stats.avancement_moyen || 0 }}%</h3>
            <p>Avancement moyen</p>
          </div>
        </div>
      </div>

      <!-- Filtre modal -->
      <ion-modal 
        :is-open="filterModalOpen" 
        @didDismiss="filterModalOpen = false"
      >
        <ion-header>
          <ion-toolbar>
            <ion-title>Filtrer les signalements</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="filterModalOpen = false">Fermer</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-list>
            <ion-list-header>
              <ion-label>Statut</ion-label>
            </ion-list-header>
            <ion-item v-for="statut in statuts" :key="statut.id">
              <ion-checkbox
                slot="start"
                :checked="filters.statuts.includes(statut.nom)"
                @ionChange="toggleStatutFilter(statut.nom)"
              ></ion-checkbox>
              <ion-label>{{ statut.nom }}</ion-label>
              <ion-badge slot="end">{{ getStatutCount(statut.nom) }}</ion-badge>
            </ion-item>
            
            <ion-list-header v-if="authStatus">
              <ion-label>Filtres personnels</ion-label>
            </ion-list-header>
            <ion-item v-if="authStatus">
              <ion-checkbox
                slot="start"
                :checked="filters.mesSignalements"
                @ionChange="filters.mesSignalements = !filters.mesSignalements"
              ></ion-checkbox>
              <ion-label>Mes signalements uniquement</ion-label>
            </ion-item>
            
            <ion-item>
              <ion-button expand="block" @click="resetFilters">
                Réinitialiser les filtres
              </ion-button>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-modal>

      <!-- Modal de création de signalement -->
      <SignalementModal 
        :is-open="signalementModalOpen"
        :coordinates="selectedCoordinates"
        @dismiss="signalementModalOpen = false"
        @signalement-created="onSignalementCreated"
      />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonButtons, IonMenuButton, IonFab,
  IonFabButton, IonModal, IonList,
  IonListHeader, IonItem, IonCheckbox, IonLabel, IonBadge,
  alertController 
} from '@ionic/vue';
import {
  refresh, locate, filter, add, alertCircle,
  square, cash, trendingUp, create, trash, chatbubble, eye
} from 'ionicons/icons';
import { LMap, LTileLayer, LMarker, LIcon, LPopup } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import { Geolocation } from '@capacitor/geolocation';
import { useAuthStore } from '@/store/modules/auth';
import { useSignalementsStore } from '@/store/modules/signalements';
import { useAuthCheck } from '@/composables/useAuthCheck';
import SignalementModal from '@/components/SignalementModal.vue';
import L from 'leaflet';

// Configuration Leaflet avec URLs CDN
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const router = useRouter();
const authStore = useAuthStore();
const signalementsStore = useSignalementsStore();
const { checkAuthAndRedirect } = useAuthCheck();

// Références
const map = ref(null);

// États
const zoom = ref(13);
const center = ref([-18.8792, 47.5079]); // Antananarivo par défaut
const userLocation = ref(null);
const filterModalOpen = ref(false);
const showStats = ref(true);
const signalementModalOpen = ref(false);
const selectedCoordinates = ref({ lat: -18.8792, lng: 47.5079 });

// Filtres
const filters = ref({
  statuts: ['Nouveau', 'En cours', 'Terminé'],
  mesSignalements: false
});

// Computed
const isLoggedIn = computed(() => authStore.isLoggedIn);
const isUser = computed(() => authStore.isUser);
const hasGeolocation = computed(() => !!userLocation.value);
const statuts = computed(() => signalementsStore.statuts || []);
const stats = computed(() => signalementsStore.stats || {});

const authStatus = computed(() => {
  console.log('Auth status check:', {
    isLoggedIn: authStore.isLoggedIn,
    token: authStore.token,
    user: authStore.user
  });
  return authStore.isLoggedIn && authStore.token;
});

const userLocationIcon = computed(() => {
  return L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });
});

const filteredSignalements = computed(() => {
  let signalements = signalementsStore.signalements || [];
  
  // Filtrer par statut
  if (filters.value.statuts.length > 0) {
    signalements = signalements.filter(sig => {
      const currentStatus = getCurrentStatus(sig);
      return filters.value.statuts.includes(currentStatus);
    });
  }
  
  // Filtrer mes signalements
  if (filters.value.mesSignalements && authStore.user) {
    signalements = signalements.filter(sig => 
      sig.id_utilisateur_createur === authStore.user.id
    );
  }
  
  return signalements;
});

// Méthodes
const onMapReady = async () => {
  // Vérifier l'authentification avant de charger les données
  // await authStore.checkAuth();
  await loadInitialData();
  await getCurrentLocation();
};

const onMapClick = async (event) => {
  // Vérifier si l'utilisateur est connecté (utiliser authStatus)
  if (!authStatus.value) {
    const alert = await alertController.create({
      header: 'Connexion requise',
      message: 'Vous devez être connecté pour créer un signalement',
      buttons: ['OK']
    });
    await alert.present();
    return;
  }

  // Debug logs
  console.log('=== AUTH DEBUG ===');
  console.log('authStore.isAuthenticated:', authStore.isAuthenticated);
  console.log('authStore.token:', authStore.token);
  console.log('authStore.user:', authStore.user);
  console.log('authStatus.value:', authStatus.value);
  console.log('==================');
  
  // Obtenir les coordonnées du clic
  const { lat, lng } = event.latlng;
  
  // Confirmer la création d'un signalement à cet endroit
  const alert = await alertController.create({
    header: 'Créer un signalement',
    message: `Voulez-vous créer un signalement à cette position ?<br><br>
      <strong>Coordonnées:</strong><br>
      Latitude: ${lat.toFixed(6)}<br>
      Longitude: ${lng.toFixed(6)}`,
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Créer',
        handler: () => {
          // Ouvrir le modal avec les coordonnées
          selectedCoordinates.value = { lat, lng };
          signalementModalOpen.value = true;
        }
      }
    ]
  });
  
  await alert.present();
};

const onSignalementCreated = () => {
  // Recharger les données après création
  loadInitialData();
};

const loadInitialData = async () => {
  try {
    await signalementsStore.fetchSignalements();
    // fetchStats n'existe plus dans le store, les stats sont déjà dans le state
    await signalementsStore.fetchStatuts();
  } catch (error) {
    console.error('Erreur chargement données:', error);
  }
};

const getCurrentLocation = async () => {
  try {
    const coordinates = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 5000
    });
    
    userLocation.value = [
      coordinates.coords.latitude,
      coordinates.coords.longitude
    ];
    
    // Centrer sur la position de l'utilisateur
    if (map.value?.leafletObject) {
      map.value.leafletObject.setView(userLocation.value, 15);
    }
  } catch (error) {
    console.warn('Erreur géolocalisation:', error.message);
  }
};

const centerOnLocation = async () => {
  if (userLocation.value && map.value?.leafletObject) {
    map.value.leafletObject.setView(userLocation.value, 15);
  } else {
    await getCurrentLocation();
  }
};

const centerUpdated = (newCenter) => {
  center.value = newCenter;
};

const zoomUpdated = (newZoom) => {
  zoom.value = newZoom;
};

const getLatLng = (signalement) => {
  if (signalement.localisation && signalement.localisation.coordinates) {
    return [
      signalement.localisation.coordinates[1],
      signalement.localisation.coordinates[0]
    ];
  }
  return [0, 0];
};

const getMarkerIcon = (signalement) => {
  const status = getCurrentStatus(signalement);
  const colors = {
    'Nouveau': 'red',
    'En cours': 'orange',
    'Terminé': 'green'
  };
  
  const color = colors[status] || 'blue';
  return `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`;
};

const getCurrentStatus = (signalement) => {
  if (signalement.avancement_signalements && signalement.avancement_signalements[0]) {
    return signalement.avancement_signalements[0].statut_avancement?.nom || 'Nouveau';
  }
  return 'Nouveau';
};

const formatBudget = (budget) => {
  if (!budget) return '0 Ar';
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
    minimumFractionDigits: 0
  }).format(budget);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-MG');
};

const createSignalement = () => {
  if (userLocation.value) {
    selectedCoordinates.value = { 
      lat: userLocation.value[0], 
      lng: userLocation.value[1] 
    };
    signalementModalOpen.value = true;
  } else {
    selectedCoordinates.value = { lat: -18.8792, lng: 47.5079 };
    signalementModalOpen.value = true;
  }
};

const viewDetails = (id) => {
  router.push({ name: 'SignalementDetail', params: { id } });
};

const canEditSignalement = (signalement) => {
  // Vérifier si l'utilisateur est connecté et est le propriétaire du signalement
  return authStore.user && signalement.id_utilisateur_createur === authStore.user.id;
};

const editSignalement = (signalement) => {
  // TODO: Implémenter l'édition de signalement
  console.log('Edit signalement:', signalement);
};

const confirmDeleteSignalement = (signalement) => {
  // TODO: Implémenter la suppression de signalement
  console.log('Delete signalement:', signalement);
};

const addProgress = (signalement) => {
  // TODO: Implémenter l'ajout de progression
  console.log('Add progress to signalement:', signalement);
};

const showSignalementDetail = async (signalement) => {
  const alert = await alertController.create({
    header: `Signalement #${signalement.id}`,
    message: `
      <p><strong>Statut:</strong> ${getCurrentStatus(signalement)}</p>
      <p><strong>Description:</strong> ${signalement.description || 'Non spécifiée'}</p>
      <p><strong>Surface:</strong> ${signalement.surface || 'Non spécifiée'} m²</p>
      <p><strong>Budget:</strong> ${formatBudget(signalement.budget)}</p>
      <p><strong>Adresse:</strong> ${signalement.adresse || 'Non spécifiée'}</p>
      <p><strong>Créé le:</strong> ${formatDate(signalement.date_creation)}</p>
    `,
    buttons: [
      {
        text: 'Fermer',
        role: 'cancel'
      },
      {
        text: 'Voir détails',
        handler: () => viewDetails(signalement.id)
      }
    ]
  });
  
  await alert.present();
};

const toggleFilter = () => {
  filterModalOpen.value = !filterModalOpen.value;
};

const toggleStatutFilter = (statut) => {
  const index = filters.value.statuts.indexOf(statut);
  if (index > -1) {
    filters.value.statuts.splice(index, 1);
  } else {
    filters.value.statuts.push(statut);
  }
};

const getStatutCount = (statutName) => {
  return (signalementsStore.signalements || []).filter(sig => 
    getCurrentStatus(sig) === statutName
  ).length;
};

const resetFilters = () => {
  filters.value = {
    statuts: ['Nouveau', 'En cours', 'Terminé'],
    mesSignalements: false
  };
};

const refreshData = async () => {
  await loadInitialData();
};

// Lifecycle
onMounted(async () => {
  // Initialiser l'authentification depuis localStorage
  authStore.initializeAuth();
  
  // Désactiver temporairement le checkAuth pour éviter les déconnexions
  // setTimeout(async () => {
  //   await authStore.checkAuth();
  // }, 1000);
  
  // Actualiser les données toutes les 5 minutes
  const interval = setInterval(loadInitialData, 5 * 60 * 1000);
  
  onUnmounted(() => {
    clearInterval(interval);
  });
});

</script>

<style scoped>
  .map-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card ion-icon {
  margin-bottom: 0.75rem;
  color: #3182ce;
  filter: drop-shadow(0 2px 4px rgba(49, 130, 206, 0.2));
}

.stat-card h3 {
  color: #1a202c;
  font-weight: 700;
  font-size: 1.5rem;
  margin: 0.5rem 0;
  letter-spacing: -0.5px;
}

.stat-card p {
  margin: 0;
  color: #4a5568;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.3;
}

/* Popup improvements */
.signalement-popup {
  min-width: 250px;
  max-width: 300px;
}

.signalement-popup h3 {
  margin-top: 0;
  color: #1a202c;
  font-weight: 600;
  font-size: 1.1rem;
  line-height: 1.3;
}

.signalement-popup p {
  margin: 6px 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.signalement-popup p strong {
  color: #2d3748;
  font-weight: 600;
}

/* Action buttons in popup */
.popup-actions {
  margin-top: 12px;
  border-top: 1px solid #e2e8f0;
  padding-top: 12px;
}

.action-button {
  margin: 4px 0;
  --border-radius: 8px;
  height: 36px;
  font-size: 0.85rem;
  font-weight: 500;
}

.action-button:hover {
  transform: translateY(-1px);
}

/* Floating action button improvements */
ion-fab-button {
  --background: #3182ce;
  --background-hover: #2c5282;
  --background-activated: #2c5282;
  --box-shadow: 0 4px 12px rgba(49, 130, 206, 0.4);
  width: 56px;
  height: 56px;
  transition: all 0.2s ease;
}

ion-fab-button:hover {
  transform: scale(1.05);
  --box-shadow: 0 6px 16px rgba(49, 130, 206, 0.5);
}

/* Header improvements */
ion-header {
  --background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

ion-title {
  color: rgba(255, 255, 255, 0.98) !important;
  font-weight: 700;
  font-size: 1.1rem;
}

ion-button[slot="end"] {
  --color: #4a5568 !important;
  --ripple-color: rgba(49, 130, 206, 0.2);
}

ion-button[slot="end"]:hover {
  --color: #3182ce;
}

/* Modal improvements */
ion-modal {
  --background: rgba(0, 0, 0, 0.5);
  --backdrop-opacity: 0.8;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .stats-container {
    margin: 0.5rem;
    padding: 0.75rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-card h3 {
    font-size: 1.3rem;
  }
  
  .stat-card p {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .stats-container {
    margin: 0.25rem;
    padding: 0.5rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.4rem;
  }
  
  .stat-card {
    padding: 0.75rem;
  }
  
  .stat-card h3 {
    font-size: 1.2rem;
  }
  
  .stat-card p {
    font-size: 0.75rem;
  }
  
  .signalement-popup {
    min-width: 200px;
    max-width: 250px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .stats-container {
    background: rgba(26, 32, 44, 0.95);
    border-color: rgba(74, 85, 104, 0.8);
  }
  
  .stat-card {
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
    border-color: rgba(74, 85, 104, 0.8);
  }
  
  .stat-card h3 {
    color: #f7fafc;
  }
  
  .stat-card p {
    color: #cbd5e0;
  }
  
  .stat-card ion-icon {
    color: #63b3ed;
  }
  
  .signalement-popup h3 {
    color: #f7fafc;
  }
  
  .signalement-popup p strong {
    color: #e2e8f0;
  }
  
  .popup-actions {
    border-top-color: rgba(74, 85, 104, 0.8);
  }
  
  ion-header {
    --background: rgba(26, 32, 44, 0.98);
    border-bottom-color: rgba(74, 85, 104, 0.8);
  }
  
  ion-title {
    color: #f7fafc;
  }
}

/* Animation improvements */
.stat-card {
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