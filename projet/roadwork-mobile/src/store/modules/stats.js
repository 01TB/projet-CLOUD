import { defineStore } from 'pinia';
import StatsService from '@/services/stats';

export const useStatsStore = defineStore('stats', {
  state: () => ({
    globalStats: null,
    userStats: null,
    entrepriseStats: null,
    loading: false,
    error: null
  }),

  getters: {
    totalSignalements: (state) => state.globalStats?.total_signalements || 0,
    totalSurface: (state) => state.globalStats?.total_surface || 0,
    totalBudget: (state) => state.globalStats?.total_budget || 0,
    avancementMoyen: (state) => state.globalStats?.avancement_moyen || 0,
    
    signalementsParStatut: (state) => state.globalStats?.signalements_par_statut || [],
    
    // Formater le budget en Ariary
    formattedTotalBudget: (state) => {
      if (!state.globalStats?.total_budget) return '0 Ar';
      return new Intl.NumberFormat('fr-MG', {
        style: 'currency',
        currency: 'MGA',
        minimumFractionDigits: 0
      }).format(state.globalStats.total_budget);
    }
  },

  actions: {
    async fetchGlobalStats() {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await StatsService.getGlobalStats();
        if (result.success) {
          this.globalStats = result.data;
        }
      } catch (error) {
        console.error('Error fetching global stats:', error);
        this.error = 'Erreur lors du chargement des statistiques';
      } finally {
        this.loading = false;
      }
    },

    async fetchUserStats(userId) {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await StatsService.getUserStats(userId);
        if (result.success) {
          this.userStats = result.data;
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
        this.error = 'Erreur lors du chargement des statistiques utilisateur';
      } finally {
        this.loading = false;
      }
    },

    async fetchEntrepriseStats(entrepriseId) {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await StatsService.getEntrepriseStats(entrepriseId);
        if (result.success) {
          this.entrepriseStats = result.data;
        }
      } catch (error) {
        console.error('Error fetching entreprise stats:', error);
        this.error = 'Erreur lors du chargement des statistiques entreprise';
      } finally {
        this.loading = false;
      }
    },

    async fetchStatsByPeriod(startDate, endDate) {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await StatsService.getStatsByPeriod(startDate, endDate);
        if (result.success) {
          return { success: true, data: result.data };
        }
        return { success: false, error: result.error?.message || 'Erreur lors du chargement' };
      } catch (error) {
        console.error('Error fetching stats by period:', error);
        this.error = 'Erreur lors du chargement des statistiques par période';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    resetStats() {
      this.globalStats = null;
      this.userStats = null;
      this.entrepriseStats = null;
    }
  }
});
