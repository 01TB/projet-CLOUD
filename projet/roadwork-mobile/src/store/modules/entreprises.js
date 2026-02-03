import { defineStore } from 'pinia';
import EntrepriseService from '@/services/entreprises';
import api from '@/services/api';

export const useEntreprisesStore = defineStore('entreprises', {
  state: () => ({
    entreprises: [
      {
        id: 1,
        nom: "Entreprise Routière Madagascar",
        description: "Spécialisée dans les travaux routiers",
        telephone: "+261340000001",
        email: "contact@erm.mg",
        date_creation: "2026-01-15T10:30:00.000Z",
        date_modification: "2026-01-15T10:30:00.000Z"
      },
      {
        id: 2,
        nom: "BTP Construction",
        description: "Construction et travaux publics",
        telephone: "+261340000002",
        email: "info@btp.mg",
        date_creation: "2026-01-16T14:20:00.000Z",
        date_modification: "2026-01-16T14:20:00.000Z"
      },
      {
        id: 3,
        nom: "Infrastructure SARL",
        description: "Développement d'infrastructures",
        telephone: "+261340000003",
        email: "contact@infra.mg",
        date_creation: "2026-01-17T09:15:00.000Z",
        date_modification: "2026-01-17T09:15:00.000Z"
      }
    ],
    loading: false,
    error: null,
    pagination: null
  }),

  getters: {
    // Récupérer toutes les entreprises
    getAllEntreprises: (state) => state.entreprises,
    
    // Récupérer une entreprise par son ID
    getEntrepriseById: (state) => (id) => {
      return state.entreprises.find(entreprise => entreprise.id === parseInt(id));
    },
    
    // Compter le nombre total d'entreprises
    getTotalCount: (state) => state.entreprises.length,
    
    // Vérifier si le store est en chargement
    isLoading: (state) => state.loading,
    
    // Récupérer l'erreur courante
    getError: (state) => state.error
  },

  actions: {
    // Récupérer toutes les entreprises
    async fetchEntreprises() {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await EntrepriseService.getAllEntreprises();
        if (result.success) {
          this.entreprises = result.data;
        }
      } catch (error) {
        console.error('Error fetching entreprises:', error);
        this.error = 'Erreur lors du chargement des entreprises';
      } finally {
        this.loading = false;
      }
    },

    // Récupérer les entreprises paginées
    async fetchEntreprisesPaginated(page = 1, limit = 20, filters = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await EntrepriseService.getEntreprisesPaginated(page, limit, filters);
        if (result.success) {
          this.entreprises = result.data;
          this.pagination = result.pagination;
        }
      } catch (error) {
        console.error('Error fetching entreprises paginated:', error);
        this.error = 'Erreur lors du chargement des entreprises';
      } finally {
        this.loading = false;
      }
    },

    // Créer une nouvelle entreprise
    async createEntreprise(entrepriseData) {
      this.loading = true;
      try {
        const result = await EntrepriseService.createEntreprise(entrepriseData);
        if (result.success) {
          this.entreprises.unshift(result.data);
          return { success: true, data: result.data };
        }
        return { success: false, error: result.error?.message || 'Erreur lors de la création' };
      } catch (error) {
        console.error('Error creating entreprise:', error);
        this.error = 'Erreur lors de la création de l\'entreprise';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Mettre à jour une entreprise
    async updateEntreprise(id, entrepriseData) {
      this.loading = true;
      try {
        const result = await EntrepriseService.updateEntreprise(id, entrepriseData);
        if (result.success) {
          const index = this.entreprises.findIndex(e => e.id === id);
          if (index !== -1) {
            this.entreprises[index] = { ...this.entreprises[index], ...result.data };
          }
          return { success: true, data: result.data };
        }
        return { success: false, error: result.error?.message || 'Erreur lors de la mise à jour' };
      } catch (error) {
        console.error('Error updating entreprise:', error);
        this.error = 'Erreur lors de la mise à jour de l\'entreprise';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Supprimer une entreprise
    async deleteEntreprise(id) {
      this.loading = true;
      try {
        const result = await EntrepriseService.deleteEntreprise(id);
        if (result.success) {
          this.entreprises = this.entreprises.filter(e => e.id !== id);
          return { success: true };
        }
        return { success: false, error: result.error?.message || 'Erreur lors de la suppression' };
      } catch (error) {
        console.error('Error deleting entreprise:', error);
        this.error = 'Erreur lors de la suppression de l\'entreprise';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Effacer l'erreur
    clearError() {
      this.error = null;
    }
  }
});
