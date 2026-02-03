<template>

  <ion-page>

    <ion-header>

      <ion-toolbar>

        <ion-buttons slot="start">

          <ion-back-button default-href="/map"></ion-back-button>

        </ion-buttons>

        <ion-title>Liste des Signalements</ion-title>

        <ion-buttons slot="end">

          <ion-button @click="toggleFilter">

            <ion-icon :icon="filter" slot="icon-only"></ion-icon>

          </ion-button>

          <ion-button @click="handleRefresh">

            <ion-icon :icon="refresh" slot="icon-only"></ion-icon>

          </ion-button>

        </ion-buttons>

      </ion-toolbar>

    </ion-header>



    <ion-content>

      <!-- Filtres -->

      <ion-card v-if="showFilters">

        <ion-card-header>

          <ion-card-title>Filtres par statut</ion-card-title>

        </ion-card-header>

        <ion-card-content>

          <ion-chip 

            color="primary"

            :outline="selectedStatus.length > 0"

            @click="resetStatusFilters"

          >

            <ion-label>Tous</ion-label>

            <ion-badge>{{ signalements.length }}</ion-badge>

          </ion-chip>

          

          <ion-chip 

            v-for="statut in statuts" 

            :key="statut.id"

            :color="getStatusColor(statut.nom)"

            :outline="!selectedStatus.includes(statut.nom)"

            @click="toggleStatusFilter(statut.nom)"

          >

            <ion-label>{{ statut.nom }}</ion-label>

            <ion-badge>{{ getStatusCount(statut.nom) }}</ion-badge>

          </ion-chip>

        </ion-card-content>

      </ion-card>



      <!-- Liste des signalements -->

      <div v-if="loading" class="loading-container">

        <ion-spinner></ion-spinner>

        <p>Chargement des signalements...</p>

      </div>



      <div v-else-if="filteredSignalements.length === 0" class="empty-state">

        <ion-icon :icon="documentText" size="large"></ion-icon>

        <h3>Aucun signalement</h3>

        <p>Aucun signalement "Nouveau" ne correspond aux filtres</p>

        <ion-button fill="outline" @click="router.push('/signalement/create')" v-if="isAuthenticated">

          Créer un signalement

        </ion-button>

      </div>



      <ion-list v-else>

        <ion-item-sliding 

          v-for="signalement in filteredSignalements" 

          :key="signalement.id"

        >

          <ion-item @click="toggleSignalementExpansion(signalement.id)" button>

            <ion-avatar slot="start">

              <ion-icon 

                :icon="getProblemIcon(signalement)" 

                :color="getStatusColor(getCurrentStatus(signalement))"

                size="large"

              ></ion-icon>

            </ion-avatar>

            

            <ion-label>

              <h2>Signalement #{{ signalement.id }}</h2>

              <p>{{ signalement.description?.substring(0, 50) }}...</p>

              <p>

                <ion-badge :color="getStatusColor(getCurrentStatus(signalement))">

                  {{ getCurrentStatus(signalement) }}

                </ion-badge>

                <small class="ion-margin-start">

                  {{ formatDate(signalement.date_creation) }}

                </small>

              </p>

            </ion-label>

            

            <ion-note slot="end">

              {{ signalement.surface ? signalement.surface + ' m²' : '—' }}

            </ion-note>

          </ion-item>

          <!-- Section développée avec détails -->
          <ion-item v-if="expandedSignalements.includes(signalement.id)" class="expanded-details">
            <ion-label class="ion-padding">
              <div class="details-container">
                <h4>Détails complets</h4>
                
                <div class="detail-row">
                  <strong>Description:</strong>
                  <p>{{ signalement.description || 'Non spécifiée' }}</p>
                </div>
                
                <div class="detail-row">
                  <strong>Surface:</strong>
                  <p>{{ signalement.surface ? signalement.surface + ' m²' : 'Non spécifiée' }}</p>
                </div>
                
                <div class="detail-row">
                  <strong>Budget:</strong>
                  <p>{{ formatBudget(signalement.budget) }}</p>
                </div>
                
                <div class="detail-row">
                  <strong>Adresse:</strong>
                  <p>{{ signalement.adresse || 'Non spécifiée' }}</p>
                </div>
                
                <div class="detail-row">
                  <strong>Date de création:</strong>
                  <p>{{ formatDate(signalement.date_creation) }}</p>
                </div>
                
                <div class="detail-row">
                  <strong>Statut:</strong>
                  <p>
                    <ion-badge :color="getStatusColor(getCurrentStatus(signalement))">
                      {{ getCurrentStatus(signalement) }}
                    </ion-badge>
                  </p>
                </div>
                
                <div class="detail-actions">
                  <ion-button 
                    size="small" 
                    fill="outline" 
                    @click="viewOnMap(signalement)"
                    class="ion-margin-end"
                  >
                    <ion-icon :icon="map" slot="start"></ion-icon>
                    Voir sur carte
                  </ion-button>
                  
                  <ion-button 
                    size="small" 
                    fill="outline" 
                    @click="shareSignalement(signalement)"
                    v-if="canShare"
                  >
                    <ion-icon :icon="share" slot="start"></ion-icon>
                    Partager
                  </ion-button>
                </div>
              </div>
            </ion-label>
          </ion-item>



          <ion-item-options side="end">

            <ion-item-option color="primary" @click="viewOnMap(signalement)">

              <ion-icon slot="icon-only" :icon="map"></ion-icon>

            </ion-item-option>

            <ion-item-option color="tertiary" @click="shareSignalement(signalement)" v-if="canShare">

              <ion-icon slot="icon-only" :icon="shareSocial"></ion-icon>

            </ion-item-option>

          </ion-item-options>

        </ion-item-sliding>

      </ion-list>



      <!-- Chargement infini -->

      <div v-if="hasMore && !loading" class="load-more">

        <ion-button expand="block" fill="clear" @click="loadMore">

          Charger plus de signalements

        </ion-button>

      </div>



      <!-- FAB pour créer un signalement -->

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" v-if="isAuthenticated">

        <ion-fab-button @click="router.push('/signalement/create')">

          <ion-icon :icon="add"></ion-icon>

        </ion-fab-button>

      </ion-fab>

    </ion-content>

  </ion-page>

</template>



<script setup>

import { ref, computed, onMounted } from 'vue';

import { useRouter } from 'vue-router';

import { 

  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,

  IonButton, IonIcon, IonBackButton, IonButtons,

  IonCard, IonCardContent, IonCardHeader, IonCardTitle,

  IonList, IonItem, IonLabel, IonAvatar, IonBadge,

  IonNote, IonSpinner, IonChip,

  IonItemSliding, IonItemOptions,

  IonItemOption, IonFab, IonFabButton,

  toastController

} from '@ionic/vue';

import {

  filter, refresh, documentText, map, shareSocial,

  add, alertCircle, checkmarkCircle, time, warning

} from 'ionicons/icons';

import { useAuthStore } from '@/store/modules/auth';

import { useSignalementsStore } from '@/store/modules/signalements';



const router = useRouter();

const authStore = useAuthStore();

const signalementsStore = useSignalementsStore();



// États

const loading = ref(true);

const showFilters = ref(true);

const selectedStatus = ref(['Nouveau']); // "Nouveau" sélectionné par défaut

const expandedSignalements = ref([]); // IDs des signalements développés

const page = ref(1);

const limit = ref(20);

const hasMore = ref(true);

const canShare = ref('share' in navigator);



// Computed

const isAuthenticated = computed(() => authStore.isAuthenticated);

const statuts = computed(() => signalementsStore.statuts || []);

const signalements = computed(() => signalementsStore.signalements || []);



const filteredSignalements = computed(() => {

  let filtered = [...signalements.value];

  

  // Filtrer par statut

  if (selectedStatus.value.length > 0) {

    filtered = filtered.filter(s => 

      selectedStatus.value.includes(getCurrentStatus(s))

    );

  }

  

  // Pagination

  return filtered.slice(0, page.value * limit.value);

});



// Méthodes

const getCurrentStatus = (signalement) => {

  if (signalement.avancement_signalements && signalement.avancement_signalements[0]) {

    return signalement.avancement_signalements[0].statut_avancement?.nom || 'Nouveau';

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



const getProblemIcon = (signalement) => {

  const status = getCurrentStatus(signalement);

  if (status === 'Terminé') return checkmarkCircle;

  if (status === 'En cours') return time;

  return alertCircle;

};



const getStatusCount = (statusName) => {

  return signalements.value.filter(s => 

    getCurrentStatus(s) === statusName

  ).length;

};



const formatDate = (dateString) => {

  return new Date(dateString).toLocaleDateString('fr-MG', {

    day: 'numeric',

    month: 'short',

    year: 'numeric'

  });

};



const toggleFilter = () => {

  showFilters.value = !showFilters.value;

};



const toggleStatusFilter = (status) => {

  const index = selectedStatus.value.indexOf(status);

  if (index > -1) {

    selectedStatus.value.splice(index, 1);

  } else {

    selectedStatus.value.push(status);

  }

};



const resetStatusFilters = () => {

  selectedStatus.value = [];

};



const handleRefresh = async () => {

  loading.value = true;

  await signalementsStore.fetchSignalements();

  loading.value = false;

  

  const toast = await toastController.create({

    message: 'Liste actualisée',

    duration: 2000,

    color: 'success'

  });

  await toast.present();

};



const loadSignalements = async () => {

  loading.value = true;

  try {

    await signalementsStore.fetchSignalements();

  } catch (error) {

    console.error('Error loading signalements:', error);

  } finally {

    loading.value = false;

  }

};



const loadMore = () => {

  page.value += 1;

  // Simuler le chargement

  setTimeout(() => {

    hasMore.value = filteredSignalements.value.length < signalements.value.length;

  }, 500);

};



const viewDetails = (id) => {

  router.push({ name: 'SignalementDetail', params: { id } });

};

const toggleSignalementExpansion = (signalementId) => {

  const index = expandedSignalements.value.indexOf(signalementId);

  if (index > -1) {

    expandedSignalements.value.splice(index, 1);

  } else {

    expandedSignalements.value.push(signalementId);

  }

};

const formatBudget = (budget) => {

  if (!budget) return 'Non spécifié';

  return new Intl.NumberFormat('fr-MG', {

    style: 'currency',

    currency: 'MGA',

    minimumFractionDigits: 0,

    maximumFractionDigits: 0

  }).format(budget);

};



const viewOnMap = async (signalement) => {

  // Retourner à la carte avec focus sur ce signalement

  await router.push({ 

    name: 'Map',

    query: { 

      focus: signalement.id,

      lat: signalement.localisation?.coordinates?.[1],

      lng: signalement.localisation?.coordinates?.[0]

    }

  });

};



const shareSignalement = async (signalement) => {

  if (!canShare.value) return;

  

  try {

    await navigator.share({

      title: `Signalement #${signalement.id}`,

      text: `Problème routier: ${signalement.description?.substring(0, 100)}...`,

      url: `${window.location.origin}/signalement/${signalement.id}`

    });

  } catch (error) {

    console.log('Share cancelled:', error);

  }

};



onMounted(async () => {

  await loadSignalements();

  await signalementsStore.fetchStatuts();

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

  text-align: center;

}

ion-chip {

  margin: 2px;

  cursor: pointer;

}

.expanded-details {

  --background: rgba(49, 130, 206, 0.05);

  border-left: 4px solid var(--ion-color-primary);

}

.details-container {

  padding: 1rem;

}

.details-container h4 {

  color: var(--ion-color-primary);

  margin-bottom: 1rem;

  font-weight: 600;

}

.detail-row {

  margin-bottom: 1rem;

}

.detail-row strong {

  color: var(--ion-color-dark);

  display: block;

  margin-bottom: 0.25rem;

  font-size: 0.9rem;

}

.detail-row p {

  color: var(--ion-color-medium);

  margin: 0;

  line-height: 1.4;

}

.detail-actions {

  margin-top: 1.5rem;

  padding-top: 1rem;

  border-top: 1px solid var(--ion-color-light);

}

</style>