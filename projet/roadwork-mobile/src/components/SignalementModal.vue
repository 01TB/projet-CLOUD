<template>
  <ion-modal 
    :is-open="isOpen" 
    @did-dismiss="onDismiss"
    :initial-breakpoint="0.95"
    :breakpoints="[0.5, 0.8, 0.95]"
    style="height: 95vh;"
  >
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button @click="onDismiss"></ion-back-button>
        </ion-buttons>
        <ion-title>Créer un signalement</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form @submit.prevent="handleSubmit">
        <ion-list>
          <!-- Mini-carte -->
          <ion-item>
            <div class="mini-map-container">
              <div ref="miniMapContainer" class="mini-map"></div>
              <ion-chip color="primary" class="location-chip">
                <ion-icon :icon="pin"></ion-icon>
                <ion-label>{{ coordinates.lat.toFixed(6) }}, {{ coordinates.lng.toFixed(6) }}</ion-label>
              </ion-chip>
            </div>
          </ion-item>

          <!-- Description -->
          <ion-label position="floating">Description *</ion-label>
          <ion-item>
            <ion-textarea
              v-model="form.description"
              placeholder="Décrivez en détail le problème (nid de poule, fissure, chaussée dégradée, etc.)..."
              rows="3"
              required
              :counter="true"
              maxlength="500"
            ></ion-textarea>
          </ion-item>

          <!-- Surface -->
          <ion-label position="floating">Surface (m²) *</ion-label>
          <ion-item>
            <ion-input
              v-model="form.surface"
              type="number"
              min="0.1"
              step="0.1"
              placeholder="Ex: 150.5"
              required
              @input="validateSurface"
            ></ion-input>
            <ion-note slot="helper" v-if="!surfaceError">Surface estimée de la zone affectée</ion-note>
            <ion-note slot="error" v-if="surfaceError">{{ surfaceError }}</ion-note>
          </ion-item>

          <!-- Budget -->
            <ion-label position="floating">Budget estimé (Ar) *</ion-label>
          <ion-item>
            <ion-input
              v-model="form.budget"
              type="number"
              placeholder="Budget estimé en Ariary (ex: 2500000)"
              min="1000"
              step="1000"
              required
              @input="validateBudget"
            ></ion-input>
            <ion-note slot="error" v-if="budgetError">{{ budgetError }}</ion-note>
          </ion-item>

          <!-- ID Entreprise -->
          <ion-label position="floating">Entreprise</ion-label>
          <ion-item>
            <ion-select 
              v-model="form.id_entreprise" 
              placeholder="Choisir une entreprise si applicable"
              interface="alert"
              :cancelable="false"
            >
              <ion-select-option 
                v-for="entreprise in entreprises" 
                :key="entreprise.id" 
                :value="entreprise.id"
              >
                {{ entreprise.nom }}
              </ion-select-option>
            </ion-select>
            <!-- Debug info -->
            <small style="color: #666; font-size: 10px;">
              DEBUG: {{ entreprises.length }} entreprises disponibles
            </small>
          </ion-item>

          <!-- Photos -->
          <ion-label position="floating">Photos</ion-label>
          <ion-item>
            <div class="photo-section">
              <div class="photo-preview" v-if="form.photos.length > 0">
                <div 
                  v-for="(photo, index) in form.photos" 
                  :key="index"
                  class="photo-item"
                >
                  <img :src="photo.data" :alt="photo.name" class="photo-thumbnail" />
                  <ion-button 
                    size="small" 
                    fill="clear" 
                    color="danger"
                    @click="removePhoto(index)"
                    class="remove-photo-btn"
                  >
                    <ion-icon :icon="close"></ion-icon>
                  </ion-button>
                </div>
              </div>
              
              <div class="photo-actions" v-if="form.photos.length < 3">
                <ion-button 
                  size="small" 
                  fill="outline" 
                  @click="selectFromGallery"
                  color="primary"
                >
                  <ion-icon :icon="image" slot="start"></ion-icon>
                  Galerie
                </ion-button>
                
                <ion-button 
                  size="small" 
                  fill="outline" 
                  @click="takePhoto"
                  color="secondary"
                >
                  <ion-icon :icon="camera" slot="start"></ion-icon>
                  Appareil
                </ion-button>
              </div>
              
              <ion-text color="medium" v-if="form.photos.length >= 3">
                <small>Maximum 3 photos atteint</small>
              </ion-text>
            </div>
          </ion-item>

          <!-- Adresse -->
          <ion-label position="floating">Adresse</ion-label>
          <ion-item>
            <ion-input
              v-model="form.adresse"
              placeholder="Adresse précise ou point de repère (ex: près du marché Analakely)"
            ></ion-input>
          </ion-item>

          <!-- Validation errors -->
          <ion-item lines="none" v-if="error">
            <ion-text color="danger">
              <small>{{ error }}</small>
            </ion-text>
          </ion-item>
        </ion-list>
      </form>
      
      <div class="submit-section">
        <ion-button 
          expand="block" 
          @click="handleSubmit"
          :disabled="submitting || !formValid"
          class="ion-margin"
        >
          <ion-spinner v-if="submitting" slot="start"></ion-spinner>
          Envoyer le signalement
        </ion-button>
      </div>

      <!-- Bouton de retour-->
      <div class="cancel-section">
        <ion-button 
          expand="block" 
          fill="outline"
          color="medium"
          @click="onDismiss"
          class="ion-margin-horizontal ion-margin-top ion-margin-bottom"
        >
          Annuler
        </ion-button>
      </div>
    </ion-content>
    <IonFooter>
    </IonFooter>
  </ion-modal>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { 
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonInput, IonItem, IonLabel, IonList,
  IonIcon, IonText, IonSpinner, IonTextarea, IonChip,
  IonFooter, IonListHeader, toastController, IonButtons, IonBackButton, IonNote,
  IonSelect, IonSelectOption
} from '@ionic/vue';
import { pin, camera, image, close } from 'ionicons/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSignalementsStore } from '@/store/modules/signalements';
import { useEntreprisesStore } from '@/store/modules/entreprises';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  coordinates: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['dismiss', 'signalement-created']);

const miniMapContainer = ref(null);
let miniMap = null;
let miniMarker = null;

const signalementsStore = useSignalementsStore();
const entreprisesStore = useEntreprisesStore();

const form = ref({
  description: '',
  surface: '',
  budget: '',
  adresse: '',
  id_entreprise: '',
  // photos: [] // Temporairement désactivé
  photos: []
});

const submitting = ref(false);
const error = ref('');

const validationErrors = computed(() => {
  const errors = [];
  
  if (!form.value.description?.trim()) {
    errors.push('La description est requise');
  }
  
  const surface = parseFloat(form.value.surface);
  if (!form.value.surface || surface <= 0) {
    errors.push('La surface doit être supérieure à 0');
  }
  
  const budget = parseFloat(form.value.budget);
  if (!form.value.budget || budget < 1000) {
    errors.push('Le budget minimum est de 1000 Ar');
  }
  
  return errors;
});

const formValid = computed(() => {
  return validationErrors.value.length === 0;
});

// Validation refs
const surfaceError = ref('');
const budgetError = ref('');

// Validation functions
const validateSurface = () => {
  const surface = parseFloat(form.value.surface);
  if (!form.value.surface || surface <= 0) {
    surfaceError.value = 'La surface doit être supérieure à 0';
    return false;
  }
  surfaceError.value = '';
  return true;
};

const validateBudget = () => {
  const budget = parseFloat(form.value.budget);
  if (!form.value.budget || budget < 1000) {
    budgetError.value = 'Le budget minimum est de 1000 Ar';
    return false;
  }
  budgetError.value = '';
  return true;
};

const entreprises = computed(() => entreprisesStore.entreprises || []);

// Initialiser la mini carte
const initMiniMap = () => {
  if (!miniMapContainer.value) {
    console.log('miniMapContainer.value is null');
    return;
  }

  const lat = props.coordinates.lat;
  const lng = props.coordinates.lng;

  console.log('Initializing mini map at:', { lat, lng });

  // Nettoyer la carte existante
  if (miniMap) {
    miniMap.remove();
    miniMap = null;
  }

  try {
    // Créer la mini carte
    miniMap = L.map(miniMapContainer.value, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      tap: false,
      touchZoom: false
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      keepBuffer: 2,
      updateWhenIdle: true,
      updateWhenZooming: false,
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(miniMap);

    // Ajouter le marqueur
    miniMarker = L.marker([lat, lng], {
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      })
    }).addTo(miniMap);

    // Ajuster la taille de la carte après un court délai
    setTimeout(() => {
      if (miniMap) {
        miniMap.invalidateSize();
        console.log('Mini map initialized successfully');
      }
    }, 200);

  } catch (error) {
    console.error('Error initializing mini map:', error);
  }
};

const handleSubmit = async () => {
  // Valider explicitement tous les champs
  const isSurfaceValid = validateSurface();
  const isBudgetValid = validateBudget();
  
  if (!formValid.value || !isSurfaceValid || !isBudgetValid) {
    return;
  }

  submitting.value = true;
  error.value = '';

  try {
    const signalementData = {
      description: form.value.description.trim(),
      surface: parseFloat(form.value.surface),
      budget: parseFloat(form.value.budget),
      adresse: form.value.adresse.trim() || undefined,
      id_entreprise: form.value.id_entreprise ? String(form.value.id_entreprise) : null,
      localisation: {
        type: 'Point',
        coordinates: [props.coordinates.lng, props.coordinates.lat]
      }
    };

    console.log('📝 Données du signalement:', signalementData);
    console.log('🏢 ID Entreprise brut:', form.value.id_entreprise);
    console.log('🏢 ID Entreprise parsé:', parseInt(form.value.id_entreprise));
    console.log('📸 Photos à ajouter:', form.value.photos.length);
    console.log('📸 Données photos:', form.value.photos.map(p => ({
      hasData: !!p.data,
      dataLength: p.data?.length || 0,
      name: p.name,
      type: p.type
    })));
    
    // Vérifier que la méthode existe
    console.log('🔍 Méthodes disponibles dans le store:', Object.getOwnPropertyNames(Object.getPrototypeOf(signalementsStore)));
    console.log('🔍 createSignalementWithPhotos disponible:', typeof signalementsStore.createSignalementWithPhotos);
    
    // Vérifier le token d'authentification
    const token = localStorage.getItem('token') || localStorage.getItem('idToken');
    console.log('Token présent:', !!token);
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'none');
    
    // Utiliser la nouvelle méthode avec photos
    let result;
    if (typeof signalementsStore.createSignalementWithPhotos === 'function') {
      console.log('🚀 Utilisation de createSignalementWithPhotos');
      result = await signalementsStore.createSignalementWithPhotos(signalementData, form.value.photos);
    } else {
      console.log('⚠️ createSignalementWithPhotos non disponible, utilisation de la méthode standard');
      // Solution de secours : créer d'abord le signalement, puis ajouter les photos
      result = await signalementsStore.createSignalement(signalementData);
      
      // Ajouter les photos une par une si le signalement est créé
      if (result.success && form.value.photos.length > 0) {
        console.log('📸 Ajout des photos après création du signalement');
        try {
          const { signalementService } = await import('@/services/signalements');
          for (const photo of form.value.photos) {
            await signalementService.addPhotoToSignalement(result.data.id, photo.data);
          }
          console.log('✅ Photos ajoutées avec succès');
        } catch (photoError) {
          console.error('❌ Erreur ajout photos:', photoError);
        }
      }
    }
    
    console.log('✅ Result:', result);
    
    const toast = await toastController.create({
      message: form.value.photos.length > 0 
        ? `Signalement créé avec ${form.value.photos.length} photo(s) !`
        : 'Signalement créé avec succès !',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
    
    emit('signalement-created');
    emit('dismiss');
    
    // Reset form
    form.value = {
      description: '',
      surface: '',
      budget: '',
      adresse: '',
      id_entreprise: '',
      // photos: [] // Temporairement désactivé
      photos: []
    };
    
    // Reset validation errors
    surfaceError.value = '';
    budgetError.value = '';
    error.value = '';
    
  } catch (err) {
    console.error('Erreur création signalement:', err);
    error.value = err.message || 'Erreur lors de la création du signalement';
  } finally {
    submitting.value = false;
  }
};

const onDismiss = () => {
  emit('dismiss');
};

// Charger les entreprises
const loadEntreprises = async () => {
  try {
    console.log('🏢 Modal - Chargement des entreprises...');
    await entreprisesStore.fetchEntreprises();
    console.log('🏢 Modal - Entreprises chargées:', entreprisesStore.entreprises.length);
    console.log('🏢 Modal - Liste entreprises:', entreprisesStore.entreprises);
  } catch (error) {
    console.error('🏢 Modal - Error loading entreprises:', error);
  }
};

// Lifecycle hooks - must be registered before any async operations
onMounted(() => {
  // Charger les entreprises
  loadEntreprises();
  
  // Initialiser la mini carte si le modal est déjà ouvert
  if (props.isOpen) {
    setTimeout(() => {
      initMiniMap();
    }, 100);
  }
});

// Nettoyer la carte quand le composant est détruit
const cleanupMap = () => {
  if (miniMap) {
    miniMap.remove();
    miniMap = null;
  }
};

// Appeler le nettoyage manuellement quand nécessaire
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    // Initialiser la mini carte quand le modal s'ouvre
    setTimeout(() => {
      initMiniMap();
    }, 100);
  } else {
    // Nettoyer la carte quand le modal se ferme
    cleanupMap();
  }
}, { deep: true });

// Fonctions de gestion des photos
const selectFromGallery = async () => {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        await processPhoto(file);
      }
    };
    
    input.click();
  } catch (error) {
    console.error('Erreur sélection photo:', error);
    showToast('Erreur lors de la sélection de la photo', 'danger');
  }
};

const takePhoto = async () => {
  try {
    // Vérifier si l'appareil photo est disponible
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast('Appareil photo non disponible sur cet appareil', 'warning');
      return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        await processPhoto(file);
      }
    };
    
    input.click();
  } catch (error) {
    console.error('Erreur capture photo:', error);
    showToast('Erreur lors de la capture de la photo', 'danger');
  }
};

const processPhoto = async (file) => {
  try {
    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('L\'image est trop grande (max 5MB)', 'warning');
      return;
    }
    
    // Créer un canvas pour redimensionner l'image
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Dimensions maximales
      const maxWidth = 800;
      const maxHeight = 600;
      
      let width = img.width;
      let height = img.height;
      
      // Redimensionner si nécessaire
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Dessiner l'image redimensionnée
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir en base64 avec compression
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      
      // Ajouter la photo au formulaire
      form.value.photos.push({
        data: dataUrl,
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      showToast('Photo ajoutée avec succès', 'success');
    };
    
    img.src = URL.createObjectURL(file);
  } catch (error) {
    console.error('Erreur traitement photo:', error);
    showToast('Erreur lors du traitement de la photo', 'danger');
  }
};

const removePhoto = (index) => {
  form.value.photos.splice(index, 1);
  showToast('Photo supprimée', 'success');
};

const showToast = async (message, color = 'primary') => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color
  });
  await toast.present();
};

// Watch pour les changements de coordonnées
watch(() => props.coordinates, (newCoords) => {
  if (props.isOpen && newCoords) {
    // Réinitialiser la mini carte avec les nouvelles coordonnées
    setTimeout(() => {
      initMiniMap();
    }, 100);
  }
}, { deep: true });

// Watchers pour la validation en temps réel
watch(() => form.value.surface, () => {
  validateSurface();
});

watch(() => form.value.budget, () => {
  validateBudget();
});
</script>

<style scoped>
/* Mini map styling */
.mini-map-container {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mini-map {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.location-chip {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Form improvements */
ion-list {
  background: transparent;
  padding: 0;
  font-size: 0.9rem;
}

/* Photo section styles (temporairement désactivées) */
/*
.photo-section {
  width: 100%;
  padding: 0.5rem 0;
}

.photo-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.photo-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-photo-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  --padding-start: 4px;
  --padding-end: 4px;
  --padding-top: 4px;
  --padding-bottom: 4px;
  min-height: 24px;
  min-width: 24px;
}

.photo-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.photo-action-btn {
  flex: 1;
  min-width: 120px;
}
*/

ion-item {
  --background: rgba(255, 255, 255, 0.9);
  --border-radius: 12px;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  min-height: 50px;
}

ion-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

ion-label {
  --color: #2d3748 !important;
  font-weight: 600;
  font-size: 0.85rem;
}

ion-input, ion-textarea {
  --color: #2d3748 !important;
  --placeholder-color: #718096;
  font-size: 0.85rem;
}

ion-textarea {
  min-height: 80px;
}

/* Location chip improvements */
.location-chip {
  font-size: 0.75rem;
  padding: 4px 8px;
}

.location-chip ion-label {
  font-size: 0.75rem;
  color: #2d3748 !important;
}

/* Button improvements */
ion-button {
  font-size: 0.85rem;
  --border-radius: 8px;
  margin: 0.5rem 0;
  min-height: 40px;
}

ion-button[slot="start"] {
  margin-right: 0.5rem;
}

/* Modal content improvements */
ion-modal {
  --max-height: 90vh;
}

ion-content {
  --padding: 1rem;
  font-size: 0.9rem;
}

/* Footer improvements */
ion-footer {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid #e2e8f0;
}

ion-footer ion-toolbar {
  --background: transparent;
  --border-width: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}

ion-toolbar {
  --background: rgba(255, 255, 255, 0.98);
  --color: #2d3748;
}

ion-title {
  font-size: 1.1rem;
  color: #2d3748;
  font-weight: 600;
}

/* Header improvements */
ion-header {
  --background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
  --color: white;
}

ion-toolbar {
  --background: transparent;
  --color: white;
}

/* Back button */
ion-back-button {
  --color: white;
  --background: transparent;
}

ion-back-button:hover {
  --background: rgba(255, 255, 255, 0.1);
}

/* Input field improvements */
ion-input {
  --padding-start: 12px;
  --padding-end: 12px;
  --min-height: 40px;
}

ion-textarea {
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 12px;
  --padding-bottom: 12px;
}

/* Error text */
ion-note {
  font-size: 0.8rem;
  color: #e53e3e;
  margin: 0.25rem 0;
}

/* Loading state */
ion-spinner {
  width: 20px;
  height: 20px;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .mini-map-container {
    height: 150px;
  }
  
  ion-item {
    margin-bottom: 0.5rem;
    min-height: 45px;
  }
  
  ion-label {
    font-size: 0.8rem;
  }
  
  ion-input, ion-textarea {
    font-size: 0.8rem;
  }
  
  ion-button {
    font-size: 0.8rem;
    min-height: 36px;
  }
  
  ion-content {
    --padding: 0.75rem;
  }
  
  .location-chip {
    font-size: 0.7rem;
    padding: 3px 6px;
  }
}

@media (max-width: 480px) {
  .mini-map-container {
    height: 120px;
  }
  
  ion-item {
    margin-bottom: 0.4rem;
    min-height: 40px;
  }
  
  ion-label {
    font-size: 0.75rem;
  }
  
  ion-input, ion-textarea {
    font-size: 0.75rem;
    --padding-start: 10px;
    --padding-end: 10px;
    --padding-top: 10px;
    --padding-bottom: 10px;
  }
  
  ion-button {
    font-size: 0.75rem;
    min-height: 32px;
  }
  
  ion-content {
    --padding: 0.5rem;
  }
  
  .location-chip {
    font-size: 0.65rem;
    padding: 2px 4px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  ion-header {
    --background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  }
  
  ion-item {
    --background: rgba(45, 55, 72, 0.9);
  }
  
  ion-label {
    --color: #f7fafc !important;
  }
  
  ion-input, ion-textarea {
    --color: #f7fafc !important;
    --placeholder-color: #cbd5e0;
  }
  
  .location-chip {
    background: rgba(45, 55, 72, 0.95);
  }
  
  .location-chip ion-label {
    color: #f7fafc !important;
  }
}

ion-textarea {
  --padding-top: 12px;
  --padding-bottom: 12px;
}

/* Error styling */
ion-text[color="danger"] {
  --color: #e53e3e !important;
  font-weight: 500;
  display: block;
  padding: 0.5rem 0;
  line-height: 1.4;
  color: #e53e3e;
}

.error-item {
  display: block;
  margin: 0.25rem 0;
  line-height: 1.4;
}

/* Button improvements */
ion-button {
  --border-radius: 12px;
  height: 48px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

ion-button:hover {
  transform: translateY(-1px);
}

ion-button:disabled {
  opacity: 0.6;
  transform: none;
}

/* Footer button */
ion-footer ion-toolbar {
  --background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

ion-footer ion-button {
  --background: #3182ce;
  --background-hover: #2c5282;
  --background-activated: #2c5282;
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3);
  margin: 16px;
}

ion-footer ion-button:hover {
  box-shadow: 0 6px 16px rgba(49, 130, 206, 0.4);
}

/* Modal styling */
ion-modal {
  --background: rgba(0, 0, 0, 0.5);
  --backdrop-opacity: 0.8;
}

ion-header {
  --background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

ion-title {
  color: #1a202c;
  font-weight: 700;
  font-size: 1.2rem;
}

ion-content {
  --background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
}

/* Responsive improvements */
@media (max-width: 480px) {
  .mini-map-container {
    height: 150px;
  }
  
  ion-item {
    margin-bottom: 0.75rem;
    min-height: 56px;
  }
  
  ion-footer ion-button {
    margin: 12px;
    height: 44px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  ion-item {
    --background: rgba(45, 55, 72, 0.9);
  }
  
  ion-label {
    --color: #f7fafc;
  }
  
  ion-input, ion-textarea {
    --color: #f7fafc;
    --placeholder-color: #cbd5e0;
  }
  
  ion-header {
    --background: rgba(26, 32, 44, 0.98);
    border-bottom-color: rgba(74, 85, 104, 0.8);
  }
  
  ion-title {
    color: #f7fafc;
  }
  
  ion-footer ion-toolbar {
    --background: rgba(26, 32, 44, 0.98);
    border-top-color: rgba(74, 85, 104, 0.8);
  }
  
  ion-content {
    --background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }
  
  .location-chip {
    background: rgba(45, 55, 72, 0.95);
  }
}

/* Animation improvements */
ion-modal {
  --backdrop-opacity: 0;
  transition: all 0.3s ease;
}

ion-modal.show-modal {
  --backdrop-opacity: 0.8;
}

/* Focus states */
ion-input:focus, ion-textarea:focus {
  --highlight-color-focused: #3182ce;
  --highlight-height: 2px;
}

/* Loading state */
ion-spinner {
  --color: white;
  width: 20px;
  height: 20px;
}
</style>
