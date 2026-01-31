import { defineStore } from 'pinia';
import SignalementService from '@/services/signalements';
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
      }
    ],
    currentSignalement: null,
    mySignalements: [],
    statuts: [],
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
    pagination: null,
    loading: false,
    error: null,
    filter: 'all'
  }),

  actions: {
    async fetchSignalements(page = 1, limit = 20, filters = {}) {
      this.loading = true;
      try {
        const result = await SignalementService.getSignalementsPaginated(page, limit, filters);
        if (result.success) {
          this.signalements = result.data;
          this.pagination = result.pagination;
        }
      } catch (error) {
        console.error('Error fetching signalements:', error);
        this.error = 'Erreur lors du chargement des signalements';
      } finally {
        this.loading = false;
      }
    },

    async createSignalement(signalementData) {
      this.loading = true;
      try {
        const result = await SignalementService.createSignalement(signalementData);
        if (result.success) {
          this.signalements.unshift(result.data);
          return { success: true, data: result.data };
        }
        return { success: false, error: result.error?.message || 'Erreur lors de la création' };
      } catch (error) {
        console.error('Error creating signalement:', error);
        this.error = 'Erreur lors de la création du signalement';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async updateSignalement(id, signalementData) {
      this.loading = true;
      try {
        const result = await SignalementService.updateSignalement(id, signalementData);
        if (result.success) {
          const index = this.signalements.findIndex(s => s.id === id);
          if (index !== -1) {
            this.signalements[index] = { ...this.signalements[index], ...result.data };
          }
          return { success: true, data: result.data };
        }
        return { success: false, error: result.error?.message || 'Erreur lors de la mise à jour' };
      } catch (error) {
        console.error('Error updating signalement:', error);
        this.error = 'Erreur lors de la mise à jour du signalement';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async deleteSignalement(id) {
      this.loading = true;
      try {
        const result = await SignalementService.deleteSignalement(id);
        if (result.success) {
          this.signalements = this.signalements.filter(s => s.id !== id);
          return { success: true };
        }
        return { success: false, error: result.error?.message || 'Erreur lors de la suppression' };
      } catch (error) {
        console.error('Error deleting signalement:', error);
        this.error = 'Erreur lors de la suppression du signalement';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    setFilter(filter) {
      this.filter = filter;
    },

    clearError() {
      this.error = null;
    },

    async fetchStatuts() {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await SignalementService.getStatuts();
        if (result.success) {
          this.statuts = result.data;
        }
      } catch (error) {
        console.error('Error fetching statuts:', error);
        this.error = 'Erreur lors du chargement des statuts';
      } finally {
        this.loading = false;
      }
    }
  }
});
