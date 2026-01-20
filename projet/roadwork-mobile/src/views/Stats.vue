<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/map"></ion-back-button>
        </ion-buttons>
        <ion-title>Statistiques</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refreshStats">
            <ion-icon :icon="refresh" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="loading" class="loading-container">
        <ion-spinner></ion-spinner>
        <p>Chargement des statistiques...</p>
      </div>

      <div v-else>
        <!-- Période de filtrage -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Période</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-segment v-model="selectedPeriod" @ionChange="updateStats">
              <ion-segment-button value="week">
                <ion-label>Cette semaine</ion-label>
              </ion-segment-button>
              <ion-segment-button value="month">
                <ion-label>Ce mois</ion-label>
              </ion-segment-button>
              <ion-segment-button value="year">
                <ion-label>Cette année</ion-label>
              </ion-segment-button>
              <ion-segment-button value="all">
                <ion-label>Tout</ion-label>
              </ion-segment-button>
            </ion-segment>
          </ion-card-content>
        </ion-card>

        <!-- Statistiques générales -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Aperçu général</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="6" v-for="stat in generalStats" :key="stat.label">
                  <div class="stat-item">
                    <ion-icon :icon="stat.icon" :color="stat.color" size="large"></ion-icon>
                    <h3>{{ stat.value }}</h3>
                    <p>{{ stat.label }}</p>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>

        <!-- Graphique des statuts -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Répartition par statut</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="chart-container">
              <canvas ref="statusChart" width="400" height="200"></canvas>
            </div>
            <ion-list>
              <ion-item v-for="status in statusStats" :key="status.name">
                <ion-badge :color="getStatusColor(status.name)" slot="start"></ion-badge>
                <ion-label>{{ status.name }}</ion-label>
                <ion-note slot="end">{{ status.count }} ({{ status.percentage }}%)</ion-note>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Graphique des types de problèmes -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Types de problèmes</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="chart-container">
              <canvas ref="typeChart" width="400" height="200"></canvas>
            </div>
            <ion-list>
              <ion-item v-for="type in typeStats" :key="type.name">
                <ion-icon :icon="getTypeIcon(type.name)" slot="start" :color="getTypeColor(type.name)"></ion-icon>
                <ion-label>{{ type.name }}</ion-label>
                <ion-note slot="end">{{ type.count }}</ion-note>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Évolution temporelle -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Évolution temporelle</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="chart-container">
              <canvas ref="timelineChart" width="400" height="200"></canvas>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Top contributeurs -->
        <ion-card v-if="authStore.user?.role === 1">
          <ion-card-header>
            <ion-card-title>Top contributeurs</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item v-for="(user, index) in topContributors" :key="user.id">
                <ion-badge slot="start" :color="getMedalColor(index)">{{ index + 1 }}</ion-badge>
                <ion-label>
                  <h3>{{ user.nom }} {{ user.prenom }}</h3>
                  <p>{{ user.email }}</p>
                </ion-label>
                <ion-note slot="end">{{ user.count }} signalements</ion-note>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Actions -->
        <ion-card>
          <ion-card-content>
            <ion-grid>
              <ion-row>
                <ion-col size="6">
                  <ion-button expand="block" fill="outline" @click="exportStats">
                    <ion-icon :icon="download" slot="start"></ion-icon>
                    Exporter
                  </ion-button>
                </ion-col>
                <ion-col size="6">
                  <ion-button expand="block" fill="outline" @click="shareStats" v-if="canShare">
                    <ion-icon :icon="share" slot="start"></ion-icon>
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
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonBackButton, IonButtons,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonList, IonItem, IonLabel, IonNote, IonBadge, IonSpinner,
  IonGrid, IonRow, IonCol, IonSegment, IonSegmentButton,
  toastController
} from '@ionic/vue';
import {
  refresh, download, share, alertCircle, checkmarkCircle, time,
  warning, construct, water, warningOutline, pulse
} from 'ionicons/icons';
import { useAuthStore } from '@/store/modules/auth';
import { useSignalementsStore } from '@/store/modules/signalements';

const router = useRouter();
const authStore = useAuthStore();
const signalementsStore = useSignalementsStore();

const loading = ref(true);
const selectedPeriod = ref('month');
const statusChart = ref(null);
const typeChart = ref(null);
const timelineChart = ref(null);

const canShare = computed(() => 'share' in navigator);

const generalStats = computed(() => {
  const filtered = getFilteredSignalements();
  const total = filtered.length;
  const completed = filtered.filter(s => getCurrentStatus(s) === 'Terminé').length;
  const pending = filtered.filter(s => getCurrentStatus(s) === 'En cours').length;
  const newReports = filtered.filter(s => getCurrentStatus(s) === 'Nouveau').length;
  
  return [
    {
      label: 'Total',
      value: total,
      icon: alertCircle,
      color: 'primary'
    },
    {
      label: 'Terminés',
      value: completed,
      icon: checkmarkCircle,
      color: 'success'
    },
    {
      label: 'En cours',
      value: pending,
      icon: time,
      color: 'warning'
    },
    {
      label: 'Nouveaux',
      value: newReports,
      icon: warning,
      color: 'danger'
    }
  ];
});

const statusStats = computed(() => {
  const filtered = getFilteredSignalements();
  const statusCounts = {};
  
  filtered.forEach(s => {
    const status = getCurrentStatus(s);
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  
  const total = filtered.length;
  return Object.entries(statusCounts).map(([name, count]) => ({
    name,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  }));
});

const typeStats = computed(() => {
  const filtered = getFilteredSignalements();
  const typeCounts = {};
  
  filtered.forEach(s => {
    // Simuler des types de problèmes basés sur la description
    const type = inferProblemType(s.description);
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  
  return Object.entries(typeCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
});

const topContributors = computed(() => {
  const filtered = getFilteredSignalements();
  const userCounts = {};
  
  filtered.forEach(s => {
    if (s.id_utilisateur_createur) {
      userCounts[s.id_utilisateur_createur] = (userCounts[s.id_utilisateur_createur] || 0) + 1;
    }
  });
  
  return Object.entries(userCounts)
    .map(([userId, count]) => {
      const user = getUserById(userId);
      return { ...user, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
});

const getFilteredSignalements = () => {
  if (!signalementsStore.signalements) return [];
  
  const now = new Date();
  const signalements = [...signalementsStore.signalements];
  
  switch (selectedPeriod.value) {
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return signalements.filter(s => new Date(s.date_creation) >= weekAgo);
    
    case 'month':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return signalements.filter(s => new Date(s.date_creation) >= monthAgo);
    
    case 'year':
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      return signalements.filter(s => new Date(s.date_creation) >= yearAgo);
    
    default:
      return signalements;
  }
};

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

const inferProblemType = (description) => {
  const desc = (description || '').toLowerCase();
  
  if (desc.includes('nids de poule') || desc.includes('trou')) return 'Nids de poule';
  if (desc.includes('inondation') || desc.includes('eau')) return 'Inondation';
  if (desc.includes('signalisation') || desc.includes('panneau')) return 'Signalisation';
  if (desc.includes('éclairage') || desc.includes('lumière')) return 'Éclairage';
  if (desc.includes('chaussée') || desc.includes('route')) return 'Chaussée';
  
  return 'Autre';
};

const getTypeIcon = (type) => {
  const icons = {
    'Nids de poule': construct,
    'Inondation': water,
    'Signalisation': warningOutline,
    'Éclairage': pulse,
    'Chaussée': construct
  };
  return icons[type] || alertCircle;
};

const getTypeColor = (type) => {
  const colors = {
    'Nids de poule': 'warning',
    'Inondation': 'primary',
    'Signalisation': 'danger',
    'Éclairage': 'medium',
    'Chaussée': 'secondary'
  };
  return colors[type] || 'medium';
};

const getUserById = (userId) => {
  // Simuler la récupération d'utilisateur
  return {
    id: userId,
    nom: `Utilisateur ${userId}`,
    prenom: '',
    email: `user${userId}@example.com`
  };
};

const getMedalColor = (index) => {
  const colors = ['warning', 'medium', 'tertiary'];
  return colors[index] || 'medium';
};

const refreshStats = async () => {
  await loadStats();
  const toast = await toastController.create({
    message: 'Statistiques actualisées',
    duration: 2000,
    color: 'success'
  });
  await toast.present();
};

const updateStats = () => {
  // Les statistiques se mettront à jour automatiquement via les computed
  nextTick(() => {
    initCharts();
  });
};

const exportStats = () => {
  // TODO: Implémenter l'export des statistiques
  showToast('Fonctionnalité bientôt disponible');
};

const shareStats = async () => {
  if (!canShare.value) return;
  
  try {
    const stats = generalStats.value;
    await navigator.share({
      title: 'Statistiques des signalements',
      text: `Total: ${stats[0].value}, Terminés: ${stats[1].value}, En cours: ${stats[2].value}`,
      url: window.location.href
    });
  } catch (error) {
    console.log('Share cancelled:', error);
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

const initCharts = () => {
  // TODO: Initialiser les graphiques avec Chart.js ou une autre librairie
  console.log('Charts would be initialized here');
};

const loadStats = async () => {
  try {
    loading.value = true;
    await signalementsStore.fetchSignalements();
    await signalementsStore.fetchStatuts();
    
    await nextTick();
    initCharts();
  } catch (error) {
    console.error('Error loading stats:', error);
    const toast = await toastController.create({
      message: 'Erreur lors du chargement des statistiques',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadStats();
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

.stat-item {
  text-align: center;
  padding: 1rem;
}

.stat-item ion-icon {
  margin-bottom: 0.5rem;
}

.stat-item h3 {
  margin: 0;
  font-size: 1.8rem;
  color: var(--ion-color-primary);
}

.stat-item p {
  margin: 0.5rem 0 0;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.chart-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ion-color-light);
  border-radius: 8px;
  margin-bottom: 1rem;
  color: var(--ion-color-medium);
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
