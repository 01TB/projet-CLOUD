import { defineStore } from 'pinia';
import EntrepriseService from '@/services/entreprises';

export const useEntreprisesStore = defineStore('entreprises', {
  state: () => ({
    entreprises: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0
    }
  }),

  getters: {
    getEntrepriseById: (state) => (id) => {
      return state.entreprises.find(entreprise => entreprise.id === id);
    },
    
    getEntreprisesOptions: (state) => {
      return state.entreprises.map(entreprise => ({
        value: entreprise.id,
        label: entreprise.nom,
        ...entreprise
      }));
    }
  },

  actions: {
    async fetchEntreprises(page = 1, limit = 20) {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await EntrepriseService.getAllEntreprises();
        if (result.success) {
          this.entreprises = result.data;
          if (result.pagination) {
            this.pagination = result.pagination;
          }
        }
      } catch (error) {
        console.error('Error fetching entreprises:', error);
        this.error = 'Erreur lors du chargement des entreprises';
      } finally {
        this.loading = false;
      }
    },

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

    clearError() {
      this.error = null;
    }
  }
});
