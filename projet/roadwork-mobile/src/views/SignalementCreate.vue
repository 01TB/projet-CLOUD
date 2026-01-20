<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/map"></ion-back-button>
        </ion-buttons>
        <ion-title>Nouveau Signalement</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="getCurrentLocation" :disabled="loadingLocation">
            <ion-icon :icon="locate" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <form @submit.prevent="handleSubmit">
        <!-- Carte pour sélectionner l'emplacement -->
        <div class="map-section">
          <div class="map-container" ref="mapContainer"></div>
          <div class="map-overlay">
            <ion-chip color="primary">
              <ion-icon :icon="pin"></ion-icon>
              <ion-label>Cliquez sur la carte pour positionner</ion-label>
            </ion-chip>
          </div>
        </div>

        <ion-list class="ion-padding">
          <ion-list-header>
            <ion-label>Informations du signalement</ion-label>
          </ion-list-header>

          <ion-item>
            <ion-label position="floating">Description *</ion-label>
            <ion-textarea
              v-model="form.description"
              placeholder="Décrivez le problème routier..."
              rows="3"
              required
              :counter="true"
              maxlength="500"
            ></ion-textarea>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Adresse</ion-label>
            <ion-input
              v-model="form.adresse"
              placeholder="Rue, quartier..."
              @focus="geocodeLocation"
            ></ion-input>
            <ion-button slot="end" fill="clear" @click="geocodeLocation">
              <ion-icon :icon="search" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Type de problème</ion-label>
            <ion-segment v-model="form.problemType" @ionChange="updateProblemIcon">
              <ion-segment-button value="pothole">
                <ion-label>Nid de poule</ion-label>
              </ion-segment-button>
              <ion-segment-button value="crack">
                <ion-label>Fissure</ion-label>
              </ion-segment-button>
              <ion-segment-button value="other">
                <ion-label>Autre</ion-label>
              </ion-segment-button>
            </ion-segment>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Surface (m²)</ion-label>
            <ion-input
              v-model="form.surface"
              type="number"
              min="0"
              step="0.1"
              placeholder="Ex: 2.5"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Estimation budget (Ar)</ion-label>
            <ion-input
              v-model="form.budget"
              type="number"
              min="0"
              placeholder="Ex: 500000"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Photo (optionnel)</ion-label>
            <ion-button 
              expand="block" 
              fill="outline" 
              @click="takePhoto"
              class="ion-margin-top"
            >
              <ion-icon :icon="camera" slot="start"></ion-icon>
              Prendre une photo
            </ion-button>
            
            <div v-if="form.photo" class="photo-preview">
              <img :src="form.photo" alt="Photo du signalement" />
              <ion-button 
                fill="clear" 
                color="danger" 
                @click="form.photo = null"
                class="remove-photo"
              >
                <ion-icon :icon="closeCircle" slot="icon-only"></ion-icon>
              </ion-button>
            </div>
          </ion-item>

          <ion-item lines="none" v-if="error">
            <ion-text color="danger">
              <small>{{ error }}</small>
            </ion-text>
          </ion-item>
        </ion-list>
      </form>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-grid>
          <ion-row>
            <ion-col>
              <ion-button 
                expand="block" 
                @click="saveDraft"
                fill="outline"
                :disabled="submitting"
              >
                Sauvegarder brouillon
              </ion-button>
            </ion-col>
            <ion-col>
              <ion-button 
                expand="block" 
                @click="handleSubmit"
                :disabled="submitting || !formValid"
              >
                <ion-spinner v-if="submitting" slot="start"></ion-spinner>
                Envoyer le signalement
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonInput, IonItem, IonLabel, IonList,
  IonIcon, IonText, IonSpinner, IonBackButton, IonButtons,
  IonTextarea, IonSegment, IonSegmentButton, IonChip,
  IonFooter, IonGrid, IonRow, IonCol, IonListHeader,
  toastController, loadingController, alertController
} from '@ionic/vue';
import { 
  locate, pin, search, camera, closeCircle,
  warning, checkmarkCircle
} from 'ionicons/icons';
import { Geolocation, Camera } from '@capacitor/core';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSignalementsStore } from '@/store/modules/signalements';

const router = useRouter();
const route = useRoute();
const signalementsStore = useSignalementsStore();

const mapContainer = ref(null);
let map = null;
let marker = null;

const form = ref({
  description: '',
  adresse: '',
  surface: null,
  budget: null,
  problemType: 'pothole',
  photo: null,
  location: null
});

const loadingLocation = ref(false);
const submitting = ref(false);
const error = ref('');

const formValid = computed(() => {
  return form.value.description && 
         form.value.location && 
         form.value.location.coordinates;
});

// Initialiser la carte
const initMap = () => {
  if (!mapContainer.value) return;

  // Coordonnées par défaut ou depuis les query params
  const lat = parseFloat(route.query.lat) || -18.8792;
  const lng = parseFloat(route.query.lng) || 47.5079;
  
  form.value.location = {
    type: 'Point',
    coordinates: [lng, lat]
  };

  // Créer la carte
  map = L.map(mapContainer.value).setView([lat, lng], 16);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Ajouter le marqueur
  marker = L.marker([lat, lng], {
    draggable: true,
    icon: getProblemIcon()
  }).addTo(map);

  // Événements du marqueur
  marker.on('dragend', (e) => {
    const position = marker.getLatLng();
    form.value.location.coordinates = [position.lng, position.lat];
    reverseGeocode(position);
  });

  // Clic sur la carte
  map.on('click', (e) => {
    marker.setLatLng(e.latlng);
    form.value.location.coordinates = [e.latlng.lng, e.latlng.lat];
    reverseGeocode(e.latlng);
  });

  // Ajuster la taille de la carte
  setTimeout(() => {
    map.invalidateSize();
  }, 100);
};

const getProblemIcon = () => {
  const iconColors = {
    pothole: 'red',
    crack: 'orange',
    other: 'blue'
  };
  
  const color = iconColors[form.value.problemType] || 'blue';
  
  return L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });
};

const updateProblemIcon = () => {
  if (marker) {
    marker.setIcon(getProblemIcon());
  }
};

const getCurrentLocation = async () => {
  loadingLocation.value = true;
  
  try {
    const coordinates = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    });
    
    const lat = coordinates.coords.latitude;
    const lng = coordinates.coords.longitude;
    
    // Mettre à jour le marqueur
    if (marker) {
      marker.setLatLng([lat, lng]);
      map.setView([lat, lng], 16);
    }
    
    form.value.location.coordinates = [lng, lat];
    reverseGeocode({ lat, lng });
    
  } catch (err) {
    const toast = await toastController.create({
      message: 'Impossible d\'obtenir la localisation',
      duration: 3000,
      color: 'warning'
    });
    await toast.present();
  } finally {
    loadingLocation.value = false;
  }
};

const reverseGeocode = async (latlng) => {
  // Simulation de géocodage inversé
  // Dans une app réelle, utiliser un service comme Nominatim
  form.value.adresse = `Lat: ${latlng.lat.toFixed(6)}, Lng: ${latlng.lng.toFixed(6)}`;
};

const geocodeLocation = async () => {
  if (!form.value.adresse) return;
  
  const loading = await loadingController.create({
    message: 'Recherche de l\'adresse...'
  });
  await loading.present();
  
  try {
    // Simulation de géocodage
    // Dans une app réelle, utiliser un service de géocodage
    const fakeCoords = {
      lat: -18.8792 + (Math.random() - 0.5) * 0.01,
      lng: 47.5079 + (Math.random() - 0.5) * 0.01
    };
    
    if (marker) {
      marker.setLatLng([fakeCoords.lat, fakeCoords.lng]);
      map.setView([fakeCoords.lat, fakeCoords.lng], 16);
    }
    
    form.value.location.coordinates = [fakeCoords.lng, fakeCoords.lat];
    
    const toast = await toastController.create({
      message: 'Adresse localisée',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
    
  } catch (error) {
    const toast = await toastController.create({
      message: 'Impossible de localiser l\'adresse',
      duration: 3000,
      color: 'warning'
    });
    await toast.present();
  } finally {
    await loading.dismiss();
  }
};

const takePhoto = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: 'dataUrl'
    });
    
    form.value.photo = image.dataUrl;
    
  } catch (error) {
    console.log('User cancelled photo or error:', error);
  }
};

const saveDraft = async () => {
  // Sauvegarder en local storage
  const drafts = JSON.parse(localStorage.getItem('signalement_drafts') || '[]');
  drafts.push({
    ...form.value,
    savedAt: new Date().toISOString()
  });
  localStorage.setItem('signalement_drafts', JSON.stringify(drafts));
  
  const toast = await toastController.create({
    message: 'Brouillon sauvegardé',
    duration: 2000,
    color: 'success'
  });
  await toast.present();
};

const handleSubmit = async () => {
  if (!formValid.value) {
    error.value = 'Veuillez remplir tous les champs obligatoires';
    return;
  }
  
  submitting.value = true;
  error.value = '';
  
  try {
    const signalementData = {
      description: form.value.description,
      adresse: form.value.adresse,
      surface: form.value.surface ? parseFloat(form.value.surface) : null,
      budget: form.value.budget ? parseInt(form.value.budget) : null,
      localisation: form.value.location
    };
    
    const result = await signalementsStore.createSignalement(signalementData);
    
    if (result.success) {
      const toast = await toastController.create({
        message: 'Signalement envoyé avec succès !',
        duration: 3000,
        color: 'success',
        icon: checkmarkCircle
      });
      await toast.present();
      
      // Rediriger vers la carte
      router.push('/map');
    } else {
      error.value = result.error || 'Erreur lors de l\'envoi';
    }
  } catch (err) {
    error.value = err.message || 'Erreur lors de l\'envoi';
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (map) {
    map.remove();
  }
});
</script>

<style scoped>
.map-section {
  position: relative;
  height: 300px;
  width: 100%;
}

.map-container {
  height: 100%;
  width: 100%;
}

.map-overlay {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.photo-preview {
  position: relative;
  margin-top: 10px;
  width: 100%;
}

.photo-preview img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.remove-photo {
  position: absolute;
  top: 5px;
  right: 5px;
  --padding-start: 0;
  --padding-end: 0;
}
</style>