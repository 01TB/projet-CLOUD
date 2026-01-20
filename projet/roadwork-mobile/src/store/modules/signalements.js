import { defineStore } from 'pinia';
import api from '@/services/api';

export const useSignalementsStore = defineStore('signalements', {
  state: () => ({
    signalements: [
      {
        id: 1,
        description: "Nid-de-poule sur la route nationale 1",
        surface: 15.5,
        budget: 2500000,
        adresse: "RN1, Ambohimanoro",
        localisation: {
          type: "Point",
          coordinates: [47.5079, -18.8792]
        },
        date_creation: "2024-01-15T10:30:00Z",
        date_modification: "2024-01-15T10:30:00Z",
        id_utilisateur_createur: 1,
        avancement_signalements: [
          {
            id: 1,
            statut_avancement: {
              id: 1,
              nom: "Nouveau"
            },
            date_creation: "2024-01-15T10:30:00Z",
            commentaire: "Signalement initial"
          }
        ]
      },
      {
        id: 2,
        description: "Travaux de réparation de chaussée",
        surface: 25.0,
        budget: 5000000,
        adresse: "Boulevard de l'Europe, Antananarivo",
        localisation: {
          type: "Point",
          coordinates: [47.5179, -18.8692]
        },
        date_creation: "2024-01-10T14:20:00Z",
        date_modification: "2024-01-12T09:15:00Z",
        id_utilisateur_createur: 2,
        avancement_signalements: [
          {
            id: 2,
            statut_avancement: {
              id: 2,
              nom: "En cours"
            },
            date_creation: "2024-01-12T09:15:00Z",
            commentaire: "Travaux démarrés"
          }
        ]
      },
      {
        id: 3,
        description: "Réparation de pont endommagé",
        surface: 40.0,
        budget: 8000000,
        adresse: "Route d'Andohatapenaka",
        localisation: {
          type: "Point",
          coordinates: [47.5279, -18.8892]
        },
        date_creation: "2024-01-05T08:45:00Z",
        date_modification: "2024-01-18T16:30:00Z",
        id_utilisateur_createur: 1,
        avancement_signalements: [
          {
            id: 3,
            statut_avancement: {
              id: 3,
              nom: "Terminé"
            },
            date_creation: "2024-01-18T16:30:00Z",
            commentaire: "Travaux terminés avec succès"
          }
        ]
      },
      {
        id: 4,
        description: "Signalisation routière défectueuse",
        surface: 5.0,
        budget: 500000,
        adresse: "Carrefour de l'Aéroport",
        localisation: {
          type: "Point",
          coordinates: [47.4979, -18.8792]
        },
        date_creation: "2024-01-20T11:00:00Z",
        date_modification: "2024-01-20T11:00:00Z",
        id_utilisateur_createur: 3,
        avancement_signalements: [
          {
            id: 4,
            statut_avancement: {
              id: 1,
              nom: "Nouveau"
            },
            date_creation: "2024-01-20T11:00:00Z",
            commentaire: "Signalisation à remplacer"
          }
        ]
      },
      {
        id: 5,
        description: "Érosion de la chaussée après intempéries",
        surface: 30.0,
        budget: 4500000,
        adresse: "Route de Mahamasina",
        localisation: {
          type: "Point",
          coordinates: [47.4879, -18.8892]
        },
        date_creation: "2024-01-18T07:30:00Z",
        date_modification: "2024-01-19T14:20:00Z",
        id_utilisateur_createur: 2,
        avancement_signalements: [
          {
            id: 5,
            statut_avancement: {
              id: 2,
              nom: "En cours"
            },
            date_creation: "2024-01-19T14:20:00Z",
            commentaire: "Réparation en cours"
          }
        ]
      }
    ],
    statuts: [
      {
        id: 1,
        nom: "Nouveau"
      },
      {
        id: 2,
        nom: "En cours"
      },
      {
        id: 3,
        nom: "Terminé"
      }
    ],
    stats: {
      total_signalements: 5,
      total_surface: 115.5,
      total_budget: 20500000,
      avancement_moyen: 40,
      signalements_par_statut: [
        {
          statut: "Nouveau",
          count: 2
        },
        {
          statut: "En cours",
          count: 2
        },
        {
          statut: "Terminé",
          count: 1
        }
      ]
    },
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
