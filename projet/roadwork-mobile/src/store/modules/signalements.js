import { defineStore } from 'pinia';
import api from '@/services/api';

export const useSignalementsStore = defineStore('signalements', {
  state: () => ({
    signalements: [],
    statuts: [],
    stats: {},
    loading: false,
    error: null
  }),

  actions: {
    async fetchSignalements() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get('/signalements');
        this.signalements = response.data;
      } catch (error) {
        this.error = error.message || 'Erreur lors du chargement des signalements';
        console.error('Error fetching signalements:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchSignalementById(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get(`/signalements/${id}`);
        this.currentSignalement = response.data;
        return response.data;
      } catch (error) {
        this.error = error.message || 'Erreur lors du chargement du signalement';
        console.error('Error fetching signalement:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createSignalement(signalementData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.post('/signalements', signalementData);
        this.signalements.unshift(response.data);
        return response.data;
      } catch (error) {
        this.error = error.message || 'Erreur lors de la création du signalement';
        console.error('Error creating signalement:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateSignalement(id, signalementData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.put(`/signalements/${id}`, signalementData);
        const index = this.signalements.findIndex(s => s.id === id);
        if (index > -1) {
          this.signalements[index] = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.message || 'Erreur lors de la mise à jour du signalement';
        console.error('Error updating signalement:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteSignalement(id) {
      this.loading = true;
      this.error = null;
      
      try {
        await api.delete(`/signalements/${id}`);
        this.signalements = this.signalements.filter(s => s.id !== id);
      } catch (error) {
        this.error = error.message || 'Erreur lors de la suppression du signalement';
        console.error('Error deleting signalement:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchStatuts() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get('/statuts');
        this.statuts = response.data;
      } catch (error) {
        this.error = error.message || 'Erreur lors du chargement des statuts';
        console.error('Error fetching statuts:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchStats() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get('/stats');
        this.stats = response.data;
      } catch (error) {
        this.error = error.message || 'Erreur lors du chargement des statistiques';
        console.error('Error fetching stats:', error);
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    setLoading(loading) {
      this.loading = loading;
    }
  },

  getters: {
    getSignalementById: (state) => (id) => {
      return state.signalements.find(s => s.id === id);
    },

    getSignalementsByStatus: (state) => (status) => {
      return state.signalements.filter(s => {
        if (s.avancement_signalements && s.avancement_signalements[0]) {
          return s.avancement_signalements[0].statut_avancement?.nom === status;
        }
        return false;
      });
    },

    getSignalementsByUser: (state) => (userId) => {
      return state.signalements.filter(s => s.id_utilisateur_createur === userId);
    },

    totalSignalements: (state) => state.signalements.length,
    
    totalSurface: (state) => {
      return state.signalements.reduce((total, s) => total + (s.surface || 0), 0);
    },

    totalBudget: (state) => {
      return state.signalements.reduce((total, s) => total + (s.budget || 0), 0);
    },

    averageProgress: (state) => {
      if (state.signalements.length === 0) return 0;
      const completed = state.signalements.filter(s => {
        if (s.avancement_signalements && s.avancement_signalements[0]) {
          return s.avancement_signalements[0].statut_avancement?.nom === 'Terminé';
        }
        return false;
      }).length;
      return Math.round((completed / state.signalements.length) * 100);
    }
  }
});
