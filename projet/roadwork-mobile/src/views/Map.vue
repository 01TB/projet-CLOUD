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
          <ion-button @click="toggleFilter" v-if="isAuthenticated">
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
                <h3>Signalement #{{ signalement.id }}</h3>
                <p><strong>Statut:</strong> {{ getCurrentStatus(signalement) }}</p>
                <p><strong>Surface:</strong> {{ signalement.surface }} m²</p>
                <p><strong>Budget:</strong> {{ formatBudget(signalement.budget) }}</p>
                <p><strong>Date:</strong> {{ formatDate(signalement.date_creation) }}</p>
                <ion-button size="small" expand="block" @click="viewDetails(signalement.id)">
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
      <ion-fab vertical="bottom" horizontal="end" slot="fixed" v-if="isAuthenticated && isUser">
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
            
            <ion-list-header v-if="isAuthenticated">
              <ion-label>Filtres personnels</ion-label>
            </ion-list-header>
            <ion-item v-if="isAuthenticated">
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
  square, cash, trendingUp
} from 'ionicons/icons';
import { LMap, LTileLayer, LMarker, LIcon, LPopup } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import { Geolocation } from '@capacitor/geolocation';
import { useAuthStore } from '@/store/modules/auth';
import { useSignalementsStore } from '@/store/modules/signalements';
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

// Références
const map = ref(null);

// États
const zoom = ref(13);
const center = ref([-18.8792, 47.5079]); // Antananarivo par défaut
const userLocation = ref(null);
const filterModalOpen = ref(false);
const showStats = ref(true);

// Filtres
const filters = ref({
  statuts: ['Nouveau', 'En cours', 'Terminé'],
  mesSignalements: false
});

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isUser = computed(() => authStore.isUser);
const hasGeolocation = computed(() => !!userLocation.value);
const statuts = computed(() => signalementsStore.statuts || []);
const stats = computed(() => signalementsStore.stats || {});

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
  await loadInitialData();
  await getCurrentLocation();
};

const loadInitialData = async () => {
  try {
    await signalementsStore.fetchSignalements();
    await signalementsStore.fetchStats();
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
    router.push({ 
      name: 'SignalementCreate',
      query: { 
        lat: userLocation.value[0],
        lng: userLocation.value[1] 
      }
    });
  } else {
    router.push({ name: 'SignalementCreate' });
  }
};

const viewDetails = (id) => {
  router.push({ name: 'SignalementDetail', params: { id } });
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

// Icône de position utilisateur
const userLocationIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Mise à jour de la position et du zoom
const centerUpdated = (newCenter) => {
  center.value = newCenter;
};

const zoomUpdated = (newZoom) => {
  zoom.value = newZoom;
};

// Lifecycle
onMounted(() => {
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
}

.stats-container {
  padding: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  text-align: center;
  padding: 1.5rem;
  background: var(--ion-color-light);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-card ion-icon {
  margin-bottom: 0.5rem;
}

.stat-card h3 {
  color: #2c3e50;
}

.stat-card p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9em;
}

.signalement-popup {
  min-width: 200px;
}

.signalement-popup h3 {
  margin-top: 0;
  color: #2c3e50;
}

.signalement-popup p {
  margin: 5px 0;
  font-size: 0.9em;
}
</style>