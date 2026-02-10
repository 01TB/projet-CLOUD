<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Carte</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refreshData">
            <ion-icon :icon="refresh" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button @click="centerOnLocation" v-if="hasGeolocation">
            <ion-icon :icon="locate" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button @click="toggleMySignalements" v-if="authStatus" :color="filters.mesSignalements ? 'primary' : 'medium'">
            <ion-icon :icon="person" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button @click="toggleFilter">
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
            :options="tileOptions"
            layer-type="base"
            name="OpenStreetMap"
            @tileerror="onTileError"
            @tileload="onTileLoad"
          ></l-tile-layer>
          
          <!-- Marqueurs des signalements -->
          <!-- Marqueurs réels des signalements -->
          <l-marker
            v-for="signalement in validMarkers"
            :key="signalement.id"
            :lat-lng="getLatLng(signalement)"
          >
            <l-icon
              :icon-url="getMarkerIcon(signalement)"
              :icon-size="[32, 32]"
              :icon-anchor="[16, 32]"
            />
            <l-popup>
              <div class="signalement-popup">
                <h3>{{ signalement.description }}</h3>
                <p><strong>Surface:</strong> {{ signalement.surface ? signalement.surface + ' m²' : 'Non spécifiée' }}</p>
                <p><strong>Budget:</strong> {{ formatBudget(signalement.budget) }}</p>
                <p><strong>Entreprise responsable:</strong> {{ getEntrepriseInfo(signalement) }}</p>
                <p><strong>Adresse:</strong> {{ signalement.adresse || 'Non spécifiée' }}</p>
                <p><strong>Date:</strong> {{ formatDate(signalement.date_creation) }}</p>
                
                <!-- Photos -->
                <div v-if="signalement.photos && signalement.photos.length > 0" class="popup-photos">
                  <p><strong>Photos:</strong></p>
                  <div class="photo-gallery">
                    <img 
                      v-for="(photo, index) in signalement.photos.slice(0, 3)" 
                      :key="index"
                      :src="photo.photo" 
                      :alt="`Photo ${index + 1}`"
                      class="popup-photo"
                      @click="viewPhoto(photo)"
                      @error="console.error('❌ Erreur chargement photo:', photo)"
                      @load="console.log('✅ Photo chargée:', photo.id)"
                    />
                    <div v-if="signalement.photos.length > 3" class="more-photos">
                      +{{ signalement.photos.length - 3 }}
                    </div>
                  </div>
                </div>
                
                <!-- Actions CRUD pour utilisateur connecté -->
                <div v-if="authStatus" class="popup-actions">
                  <!-- Actions pour le propriétaire du signalement
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
                   -->
                  
                  <!-- Actions pour tous les utilisateurs connectés -->
                  
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
      <div v-show="showStats" class="stats-container">
        <div class="stats-container">
          <div class="stat-card">
            <ion-icon :icon="square" size="large"></ion-icon>
            <h3>{{ signalements.length }}</h3>
            <p>Total signalements</p>
          </div>
          <div class="stat-card">
            <ion-icon :icon="trendingUp" size="large"></ion-icon>
            <h3>{{ getStatsByStatus('En cours') }}</h3>
            <p>En cours</p>
          </div>
          <div class="stat-card">
            <ion-icon :icon="checkmarkCircle" size="large"></ion-icon>
            <h3>{{ getStatsByStatus('Terminé') }}</h3>
            <p>Terminés</p>
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
            
            <!-- Loading state -->
            <ion-item v-show="!statusesLoaded">
              <ion-spinner slot="start"></ion-spinner>
              <ion-label>Chargement des statuts...</ion-label>
            </ion-item>
            
            <!-- Status checkboxes -->
            <ion-item 
              v-for="statut in statuts" 
              :key="statut.id"
              v-show="statusesLoaded"
            >
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
                @ionChange="handleMesSignalementsChange"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonButtons, IonMenuButton, IonFab,
  IonFabButton, IonModal, IonList,
  IonListHeader, IonItem, IonCheckbox, IonLabel, IonBadge,
  IonSpinner, alertController 
} from '@ionic/vue';
import {
  refresh, locate, filter, add, alertCircle,
  square, trendingUp, create, trash, chatbubble, eye, person, checkmarkCircle
} from 'ionicons/icons';
import { LMap, LTileLayer, LMarker, LIcon, LPopup } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import { Geolocation } from '@capacitor/geolocation';
import { useAuthStore } from '@/store/modules/auth';
import { useSignalementsStore } from '@/store/modules/signalements';
import SignalementModal from '@/components/SignalementModal.vue';
import L from 'leaflet';

// Configuration optimisée pour mobile
const createOptimizedTileLayer = () => {
  return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 3,
    maxNativeZoom: 19,
    keepBuffer: 2,
    updateWhenIdle: true,
    updateWhenZooming: false,
    updateInterval: 200,
    tileSize: 256,
    zoomOffset: 0,
    zoomReverse: false,
    detectRetina: true,
    crossOrigin: true,
    reuseTiles: true,
    bounds: null,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
};

// Configuration Leaflet avec URLs CDN optimisés
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowAnchor: [2, -2]
});

const router = useRouter();
const route = useRoute();
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
const signalementModalOpen = ref(false);
const selectedCoordinates = ref({ lat: -18.8792, lng: 47.5079 });

// Filtres
const filters = ref({
  statuts: [], // Sera initialisé avec les statuts du backend
  mesSignalements: false
});

// Computed
const isLoggedIn = computed(() => authStore.isLoggedIn);
const isUser = computed(() => authStore.isUser);
const hasGeolocation = computed(() => !!userLocation.value);
const statuts = computed(() => signalementsStore.statuts || []);
const stats = computed(() => signalementsStore.stats || {});
const signalements = computed(() => signalementsStore.signalements || []);
const statusesLoaded = computed(() => statuts.value.length > 0);

// Watcher pour initialiser les filtres quand les statuts sont chargés
watch(statuts, (newStatuts) => {
  if (newStatuts.length > 0) {
    // Toujours réinitialiser les filtres avec les statuts du backend
    // pour s'assurer qu'ils sont à jour
    filters.value.statuts = newStatuts.map(s => s.nom);
  }
}, { immediate: true });

const authStatus = computed(() => {
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

// Options pour les tiles de la carte optimisées pour mobile
const tileOptions = {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
  errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhQDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  noWrap: false,
  tileSize: 256,
  zoomOffset: 0,
  keepBuffer: 2,
  updateWhenIdle: true,
  updateWhenZooming: false,
  updateInterval: 200,
  preferCanvas: true,
  reuseTiles: true,
  crossOrigin: true
};

const filteredSignalements = computed(() => {
  const allSignalements = signalementsStore.signalements || [];
  
  let filtered = allSignalements.filter(sig => {
    // Vérifier si le statut est dans les filtres
    const status = getCurrentStatus(sig);
    const statusMatch = filters.value.statuts.includes(status);
    
    // Vérifier si c'est un filtre "mes signalements"
    const userMatch = !filters.value.mesSignalements || 
                     (sig.id_utilisateur_createur === authStore.user?.id);
    
    return statusMatch && userMatch;
  });
  
  return filtered;
});

// Computed property pour les marqueurs valides uniquement
const validMarkers = computed(() => {
  const markers = filteredSignalements.value.filter(signalement => {
    if (!signalement || !signalement.id) {
      return false;
    }
    
    const latLng = getLatLng(signalement);
    return latLng !== null;
  });
  
  return markers;
});
  
  
// Gestion de la mémoire pour les marqueurs
const cleanupMarkers = () => {
  // Nettoyer les marqueurs quand ils ne sont plus visibles
  if (validMarkers.value.length > 100) {
    // Garder seulement les 50 marqueurs les plus récents
    const markersToKeep = validMarkers.value.slice(-50);
    validMarkers.value = markersToKeep;
  }
};

// Nettoyage complet des marqueurs
const clearAllMarkers = () => {
  validMarkers.value.forEach(marker => {
    if (marker.leafletObject) {
      map.value?.leafletObject?.removeLayer(marker.leafletObject);
    }
  });
  validMarkers.value = [];
};
const onMapReady = async () => {
  // Vérifier l'authentification avant de charger les données
  // await authStore.checkAuth();
  await loadInitialData();
  await getCurrentLocation();
};

const onMapClick = async (event) => {
  console.log('🗺️ Map clicked!', event);
  console.log('🗺️ Click coordinates:', event.latlng);
  console.log('🗺️ Auth status:', authStatus.value);
  
  // Vérifier si l'utilisateur est connecté (simple vérification de token)
  if (!authStatus.value) {
    console.log('🗺️ User not authenticated, showing login prompt');
    const alert = await alertController.create({
      header: 'Connexion requise',
      message: 'Veuillez vous connecter pour créer un signalement',
      buttons: ['OK']
    });
    
    await alert.present();
    return;
  }
  
  // Obtenir les coordonnées du clic
  const { lat, lng } = event.latlng;
  console.log('🗺️ Coordinates extracted:', { lat, lng });
  
  // Confirmer la création d'un signalement à cet endroit
  const alert = await alertController.create({
    header: 'Créer un signalement',
    message: `Voulez-vous créer un signalement à cette position ?
    Latitude: ${lat.toFixed(6)}
    Longitude: ${lng.toFixed(6)}
    Un formulaire s'ouvrira pour compléter les détails`,
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel',
        handler: () => {
          console.log('🗺️ User cancelled signalement creation');
        }
      },
      {
        text: 'Créer',
        handler: () => {
          console.log('🗺️ User confirmed signalement creation');
          // Ouvrir le modal avec les coordonnées
          selectedCoordinates.value = { lat, lng };
          signalementModalOpen.value = true;
          console.log('🗺️ Modal opened with coordinates:', selectedCoordinates.value);
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
    // En cas d'erreur 500, afficher un message plus informatif
    if (error.response && error.response.status === 500) {
      // Ne pas afficher d'erreur critique à l'utilisateur
    }
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
    // Erreur de géolocalisation silencieuse
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
  // Vérification de sécurité pour éviter les erreurs quand signalement est undefined
  if (!signalement || !signalement.id) {
    return null;
  }
  
  if (!signalement.localisation?.coordinates || !Array.isArray(signalement.localisation?.coordinates)) {
    return null;
  }
  
  if (signalement.localisation && 
      signalement.localisation.coordinates && 
      Array.isArray(signalement.localisation.coordinates) && 
      signalement.localisation.coordinates.length >= 2 &&
      signalement.localisation.coordinates[0] != null && 
      signalement.localisation.coordinates[1] != null) {
    // Format API : [longitude, latitude]
    // Leaflet attend : [latitude, longitude]
    const latLng = [
      signalement.localisation.coordinates[1], // latitude
      signalement.localisation.coordinates[0]  // longitude
    ];
    return latLng;
  }
  // Retourner null si les coordonnées sont invalides pour ne pas afficher le marqueur
  return null;
};

const getMarkerIcon = (signalement) => {
  // Vérification de sécurité
  if (!signalement || !signalement.id) {
    return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
  }
  
  const status = getCurrentStatus(signalement);
  
  // Récupérer la couleur depuis le backend si disponible, sinon utiliser des couleurs par défaut
  const statutBackend = statuts.value.find(s => s.nom === status);
  let color = 'red'; // Couleur par défaut
  
  if (statutBackend && statutBackend.couleur) {
    // Utiliser la couleur du backend (adapter si nécessaire)
    const backendColor = statutBackend.couleur.toLowerCase();
    // Mapper les couleurs du backend vers les couleurs disponibles dans Leaflet
    const colorMapping = {
      'rouge': 'red',
      'vert': 'green',
      'bleu': 'blue',
      'jaune': 'yellow',
      'orange': 'orange',
      'violet': 'violet',
      'lightgreen': 'lightgreen',
      'darkgreen': 'darkgreen',
      'gray': 'grey'
    };
    color = colorMapping[backendColor] || backendColor;
  } else {
    // Couleurs par défaut si pas de correspondance dans le backend
    const defaultColors = {
      'Nouveau': 'violet',
      'En attente': 'red',
      'En cours': 'orange', 
      'En validation': 'yellow',
      'Validé': 'lightgreen',
      'Terminé': 'green'
    };
    color = defaultColors[status] || 'red';
  }
  
  // URL valide pour les icônes Leaflet
  return `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`;
};

const getCurrentStatus = (signalement) => {
  if (signalement.avancement_signalements && signalement.avancement_signalements[0]) {
    return signalement.avancement_signalements[0].statut_avancement?.nom || 'En attente';
  }
  return 'En attente';
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-MG');
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
};

const confirmDeleteSignalement = (signalement) => {
  // TODO: Implémenter la suppression de signalement
};

const addProgress = (signalement) => {
  // TODO: Implémenter l'ajout de progression
};

const toggleFilter = () => {
  filterModalOpen.value = !filterModalOpen.value;
};

const toggleStatutFilter = (statut) => {
  // Permettre la modification des filtres de statut même si "Mes signalements uniquement" est actif
  // car nous voulons que tous les filtres soient toujours cochés
  
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

const getStatsByStatus = (statutName) => {
  return (signalementsStore.signalements || []).filter(sig => 
    getCurrentStatus(sig) === statutName
  ).length;
};

const resetFilters = () => {
  filters.value = {
    statuts: statuts.value.map(s => s.nom), // Utiliser les statuts du backend
    mesSignalements: false
  };
};

const refreshData = async () => {
  await loadInitialData();
};

// Gestion des erreurs de tiles
const onTileError = (error) => {
  // Les tiles qui échouent utiliseront automatiquement l'errorTileUrl (image vide)
};

const onTileLoad = (tile) => {
  // Log pour debugging si nécessaire
  // console.log('Tile loaded successfully');
};

const toggleMySignalements = async () => {
  if (!authStatus) {
    const alert = await alertController.create({
      header: 'Connexion requise',
      message: 'Vous devez être connecté pour filtrer vos signalements',
      buttons: ['OK']
    });
    await alert.present();
    return;
  }
  
  // Inverser l'état du filtre
  filters.value.mesSignalements = !filters.value.mesSignalements;
  
  // Garder tous les statuts cochés par défaut (ne pas vider les filtres de statut)
  // Les filtres de statut restent toujours cochés
};

const handleMesSignalementsChange = async () => {
  if (!authStatus) {
    const alert = await alertController.create({
      header: 'Connexion requise',
      message: 'Vous devez être connecté pour filtrer vos signalements',
      buttons: ['OK']
    });
    await alert.present();
    // Réinitialiser la checkbox
    filters.value.mesSignalements = false;
    return;
  }
  
  // Inverser l'état du filtre
  filters.value.mesSignalements = !filters.value.mesSignalements;
  
  // Garder tous les statuts cochés par défaut (ne pas vider les filtres de statut)
  // Les filtres de statut restent toujours cochés
};

const viewPhoto = async (photo) => {
  try {
    const alert = await alertController.create({
      header: 'Photo du signalement',
      message: `<img src="${photo.data}" style="max-width: 100%; max-height: 300px; border-radius: 8px;" />`,
      buttons: ['Fermer']
    });
    await alert.present();
  } catch (error) {
    // Erreur affichage photo silencieuse
  }
};

// Fonction pour gérer le focus sur un signalement
const handleSignalementFocus = () => {
  if (route.query.focus && route.query.lat && route.query.lng) {
    // Focus sur le signalement spécifique
    const targetLat = parseFloat(route.query.lat);
    const targetLng = parseFloat(route.query.lng);
    
    // Centrer la carte sur les coordonnées spécifiées
    center.value = [targetLat, targetLng];
    
    // Zoomer pour bien voir le marqueur
    zoom.value = 16;
    
    // Attendre que les données soient chargées puis mettre en évidence le marqueur
    setTimeout(() => {
      const targetSignalement = signalementsStore.signalements.find(sig => sig.id === route.query.focus);
      if (targetSignalement) {
        // Ouvrir le popup du marqueur si possible
        // TODO: Implémenter l'ouverture automatique du popup
      }
    }, 2000);
  }
};

// Watcher pour les query parameters
watch(() => route.query, () => {
  handleSignalementFocus();
}, { immediate: true });

// Lifecycle
onMounted(async () => {
  // Enregistrer le cleanup avant les await
  const interval = setInterval(loadInitialData, 5 * 60 * 1000);
  
  onUnmounted(() => {
    clearInterval(interval);
    // Nettoyer les marqueurs et la carte
    clearAllMarkers();
    if (map.value?.leafletObject) {
      map.value.leafletObject.remove();
    }
  });
  
  // Initialiser l'authentification depuis localStorage
  authStore.initializeAuth();
  
  // Vérifier l'authentification au montage
  await authStore.checkAuth();
  
  // Charger les statuts du backend
  await signalementsStore.fetchStatuts();
  
  // Gérer les query parameters pour focus sur un signalement
  handleSignalementFocus();
  
  // Optimiser la mémoire périodiquement
  setInterval(cleanupMarkers, 30000); // Nettoyer toutes les 30 secondes
});

</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

/* Ensure map container receives clicks */
.map-container .leaflet-container {
  z-index: 1;
  pointer-events: auto;
}

/* Fix for Ionic content overlay */
ion-content {
  --background: transparent;
}

ion-content::part(scroll) {
  z-index: 0;
}

/* Statistics improvements */
.stats-container {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  margin: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.stat-card {
  text-align: center;
  padding: 1.25rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
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

/* Tile loading improvements */
.leaflet-tile {
  transition: opacity 0.3s ease;
}

.leaflet-tile-loading {
  opacity: 0.6;
}

.leaflet-tile-error {
  opacity: 0.3;
  background: #f7fafc;
}

/* Map container improvements for better loading */
.map-container {
  background: #f8fafc;
}

.leaflet-container {
  background: #f8fafc;
}

/* Hide tile borders for cleaner look */
.leaflet-tile-pane {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
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

/* Popup photos */
.popup-photos {
  margin-top: 0.5rem;
}

.photo-gallery {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.popup-photo {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.popup-photo:hover {
  transform: scale(1.05);
}

.more-photos {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ion-color-medium);
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
    color: #002657;
  }
  
  .signalement-popup p strong {
    color: #0d3c7a;
  }
  
  .popup-actions {
    border-top-color: rgba(49, 68, 101, 0.8);
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

/* Filter disabled states */
.filter-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.text-disabled {
  color: #a0aec0 !important;
}

.filter-disabled ion-checkbox {
  --checkbox-background-disabled: #e2e8f0;
  --checkbox-background-checked-disabled: #cbd5e0;
}

.filter-disabled ion-badge {
  opacity: 0.6;
}
</style>
