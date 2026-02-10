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
            <div v-if="statusStats.length === 0" class="empty-chart">
              <ion-icon :icon="documentText" size="large"></ion-icon>
              <p>Aucune donnée à traiter</p>
            </div>
            <div v-else>
              <!-- Affichage simple des données -->
              <div class="simple-chart">
                <div class="chart-bars">
                  <div 
                    v-for="status in statusStats" 
                    :key="status.name"
                    class="chart-bar"
                    :style="{ width: status.percentage + '%' }"
                  >
                    <span class="bar-label">{{ status.name }}</span>
                    <span class="bar-value">{{ status.count }} ({{ status.percentage }}%)</span>
                  </div>
                </div>
              </div>
              <ion-list>
                <ion-item v-for="status in statusStats" :key="status.name">
                  <ion-badge :color="getStatusColor(status.name)" slot="start"></ion-badge>
                  <ion-label>{{ status.name }}</ion-label>
                  <ion-note slot="end">{{ status.count }} ({{ status.percentage }}%)</ion-note>
                </ion-item>
              </ion-list>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Évolution temporelle -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Évolution temporelle</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div v-if="getTimelineData().length === 0" class="empty-chart">
              <ion-icon :icon="documentText" size="large"></ion-icon>
              <p>Aucune donnée à traiter</p>
            </div>
            <div v-else>
              <!-- Affichage simple de l'évolution -->
              <div class="simple-timeline">
                <div class="timeline-item" v-for="(period, index) in getTimelineData()" :key="index">
                  <div class="timeline-date">{{ period.date }}</div>
                  <div class="timeline-bar">
                    <div class="timeline-fill" :style="{ width: period.percentage + '%' }"></div>
                    <span class="timeline-count">{{ period.count }}</span>
                  </div>
                </div>
              </div>
              <p class="timeline-note">
                Évolution du nombre de signalements par {{ getPeriodLabel() }}
              </p>
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
  refresh, download, shareSocial, alertCircle, checkmarkCircle, time,
  warning, documentText
} from 'ionicons/icons';
import { useAuthStore } from '@/store/modules/auth';
import { useSignalementsStore } from '@/store/modules/signalements';

const router = useRouter();
const authStore = useAuthStore();
const signalementsStore = useSignalementsStore();

const loading = ref(true);
const selectedPeriod = ref('month');
const statusChart = ref(null);
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
  const result = Object.entries(statusCounts).map(([name, count]) => ({
    name,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  }));
  
  console.log('Status stats:', result);
  return result;
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

const getTimelineData = () => {
  const filtered = getFilteredSignalements();
  const timelineData = [];
  
  if (selectedPeriod.value === 'all') {
    // Group by month for "all" period
    const monthGroups = {};
    filtered.forEach(s => {
      const date = new Date(s.date_creation);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthGroups[monthKey] = (monthGroups[monthKey] || 0) + 1;
    });
    
    const sortedMonths = Object.keys(monthGroups).sort();
    const maxCount = Math.max(...Object.values(monthGroups));
    
    return sortedMonths.map(month => ({
      date: formatDateMonth(month),
      count: monthGroups[month],
      percentage: maxCount > 0 ? Math.round((monthGroups[month] / maxCount) * 100) : 0
    }));
  } else {
    // For other periods, show daily data
    const dayGroups = {};
    filtered.forEach(s => {
      const date = new Date(s.date_creation);
      const dayKey = date.toISOString().split('T')[0];
      dayGroups[dayKey] = (dayGroups[dayKey] || 0) + 1;
    });
    
    const sortedDays = Object.keys(dayGroups).sort().slice(-7); // Last 7 days
    const maxCount = Math.max(...Object.values(dayGroups));
    
    return sortedDays.map(day => ({
      date: formatDateDay(day),
      count: dayGroups[day],
      percentage: maxCount > 0 ? Math.round((dayGroups[day] / maxCount) * 100) : 0
    }));
  }
};

const getPeriodLabel = () => {
  switch (selectedPeriod.value) {
    case 'week': return 'jour';
    case 'month': return 'jour';
    case 'year': return 'mois';
    default: return 'mois';
  }
};

const formatDateMonth = (monthStr) => {
  const [year, month] = monthStr.split('-');
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('fr-MG', { month: 'short', year: 'numeric' });
};

const formatDateDay = (dayStr) => {
  const date = new Date(dayStr);
  return date.toLocaleDateString('fr-MG', { day: 'numeric', month: 'short' });
};

const initCharts = () => {
  // Les graphiques sont maintenant remplacés par des visualisations simples
  console.log('Simple charts initialized');
};

const loadStats = async () => {
  try {
    loading.value = true;
    await signalementsStore.fetchSignalements();
    await signalementsStore.fetchStatuts();
    
    console.log('Signalements loaded:', signalementsStore.signalements?.length);
    console.log('General stats:', generalStats.value);
    
    await nextTick();
    
    // Remplacer les graphiques vides par des affichages simples
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

/* Dark background for stats page */
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
  margin: 1rem;
}

ion-card:hover {
  --background: rgba(45, 55, 72, 1);
  --border-color: rgba(74, 85, 104, 0.8);
}

ion-card-header {
  --background: rgba(30, 41, 59, 0.8);
  --color: #f7fafc;
  --border-color: rgba(74, 85, 104, 0.6);
  padding-bottom: 0;
}

ion-card-title {
  --color: #f7fafc !important;
  font-size: 1.1rem;
  font-weight: 600;
}

ion-card-content {
  --color: #f7fafc;
}

/* Dark theme for loading container */
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

/* Dark theme for stat items */
.stat-item {
  text-align: center;
  padding: 1rem;
}

.stat-item ion-icon {
  margin-bottom: 0.5rem;
  color: #3182ce !important;
}

.stat-item h3 {
  margin: 0;
  font-size: 1.8rem;
  color: #3182ce !important;
}

.stat-item p {
  margin: 0.5rem 0 0;
  color: #cbd5e0 !important;
  font-size: 0.9rem;
}

/* Dark theme for chart container */
.chart-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 8px;
  margin-bottom: 1rem;
  color: #a0aec0;
}

/* Dark theme for simple charts */
.simple-chart {
  margin-bottom: 1rem;
}

.chart-bars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chart-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(49, 130, 206, 0.8);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  min-height: 2rem;
}

.bar-label {
  font-weight: 500;
}

.bar-value {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Dark theme for timeline */
.simple-timeline {
  margin-bottom: 1rem;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.timeline-date {
  font-size: 0.85rem;
  color: #a0aec0 !important;
  font-weight: 500;
}

.timeline-bar {
  display: flex;
  align-items: center;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 4px;
  height: 2rem;
  position: relative;
  overflow: hidden;
}

.timeline-fill {
  height: 100%;
  background: rgba(49, 130, 206, 0.8);
  transition: width 0.3s ease;
}

.timeline-count {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
}

.timeline-note {
  text-align: center;
  color: #a0aec0 !important;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  font-style: italic;
}

/* Dark theme for empty chart state */
.empty-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: #a0aec0 !important;
}

.empty-chart ion-icon {
  color: #a0aec0 !important;
  margin-bottom: 1rem;
}

.empty-chart p {
  margin: 0;
  font-size: 1rem;
  color: #a0aec0 !important;
}

/* Dark theme for segments */
ion-segment {
  --background: rgba(45, 55, 72, 0.8);
  --border-radius: 8px;
}

ion-segment-button {
  --color: #cbd5e0;
  --background: rgba(45, 55, 72, 0.6);
  --border-color: rgba(74, 85, 104, 0.6);
}

ion-segment-button.segment-button-checked {
  --color: #f7fafc;
  --background: rgba(49, 130, 206, 0.8);
  --border-color: rgba(49, 130, 206, 0.8);
}

/* Dark theme for list items */
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

ion-label {
  --color: #f7fafc !important;
  font-weight: 500;
}

/* Dark theme for spinner */
ion-spinner {
  color: #3182ce;
}

/* Dark theme for badges */
ion-badge {
  --background: #3182ce;
  --color: white;
}

/* Dark theme for notes */
ion-note {
  --color: #a0aec0 !important;
}

/* Responsive improvements */
@media (max-width: 768px) {
  ion-card {
    margin: 0.5rem;
  }
  
  .stat-item h3 {
    font-size: 1.5rem;
  }
  
  .timeline-date {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  ion-card {
    margin: 0.25rem;
  }
  
  .stat-item h3 {
    font-size: 1.3rem;
  }
  
  .timeline-date {
    font-size: 0.75rem;
  }
  
  .chart-bar {
    padding: 0.4rem 0.8rem;
    min-height: 1.8rem;
  }
}

</style>
