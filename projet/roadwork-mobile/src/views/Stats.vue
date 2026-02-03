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

        <!-- Graphique des types de problèmes -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Types de problèmes</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div v-if="typeStats.length === 0" class="empty-chart">
              <ion-icon :icon="documentText" size="large"></ion-icon>
              <p>Aucune donnée à traiter</p>
            </div>
            <div v-else>
              <!-- Affichage simple des données -->
              <div class="simple-chart">
                <div class="chart-bars">
                  <div 
                    v-for="type in typeStats.slice(0, 5)" 
                    :key="type.name"
                    class="chart-bar"
                    :style="{ width: (type.count / Math.max(...typeStats.map(t => t.count)) * 100) + '%' }"
                  >
                    <span class="bar-label">{{ type.name }}</span>
                    <span class="bar-value">{{ type.count }}</span>
                  </div>
                </div>
              </div>
              <ion-list>
                <ion-item v-for="type in typeStats" :key="type.name">
                  <ion-icon :icon="getTypeIcon(type.name)" slot="start" :color="getTypeColor(type.name)"></ion-icon>
                  <ion-label>{{ type.name }}</ion-label>
                  <ion-note slot="end">{{ type.count }}</ion-note>
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
  const result = Object.entries(statusCounts).map(([name, count]) => ({
    name,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  }));
  
  console.log('Status stats:', result);
  return result;
});

const typeStats = computed(() => {
  const filtered = getFilteredSignalements();
  const typeCounts = {};
  
  filtered.forEach(s => {
    // Simuler des types de problèmes basés sur la description
    const type = inferProblemType(s.description);
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  
  const result = Object.entries(typeCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  
  console.log('Type stats:', result);
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

/* Styles pour les graphiques simples */
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
  background: var(--ion-color-primary);
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

/* Timeline styles */
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
  color: var(--ion-color-medium);
  font-weight: 500;
}

.timeline-bar {
  display: flex;
  align-items: center;
  background: var(--ion-color-light);
  border-radius: 4px;
  height: 2rem;
  position: relative;
  overflow: hidden;
}

.timeline-fill {
  height: 100%;
  background: var(--ion-color-primary);
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
  color: var(--ion-color-medium);
  font-size: 0.85rem;
  margin-top: 0.5rem;
  font-style: italic;
}

/* Styles pour l'état vide des graphiques */
.empty-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: var(--ion-color-medium);
}

.empty-chart ion-icon {
  color: var(--ion-color-medium);
  margin-bottom: 1rem;
}

.empty-chart p {
  margin: 0;
  font-size: 1rem;
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
