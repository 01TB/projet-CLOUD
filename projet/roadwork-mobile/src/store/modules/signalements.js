import { defineStore } from 'pinia';
import signalementService from '@/services/signalements';
import api from '@/services/api';

export const useSignalementsStore = defineStore('signalements', {
  state: () => ({
    signalements: [],
    currentSignalement: null,
    mySignalements: [],
    statuts: [
      { id: "statut1", nom: "En attente", valeur: 0 },
      { id: "statut2", nom: "En cours", valeur: 25 },
      { id: "statut3", nom: "En validation", valeur: 50 },
      { id: "statut4", nom: "Validé", valeur: 75 },
      { id: "statut5", nom: "Terminé", valeur: 100 }
    ],
    stats: {
      total_signalements: 0,
      total_surface: 0,
      total_budget: 0,
      avancement_moyen: 0,
      signalements_par_statut: []
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
        const result = await signalementService.getSignalementsPaginated(page, limit, filters);
        if (result.success) {
          this.signalements = result.data;
          this.pagination = result.pagination;
          this.calculateStats(); // Calculer les stats après le fetch
        }
      } catch (error) {
        console.error('Error fetching signalements:', error);
        this.error = 'Erreur lors du chargement des signalements';
        
        // En cas d'erreur 500, ne pas vider la liste des signalements existants
        if (error.response && error.response.status === 500) {
          console.warn('🚨 ERREUR 500 DETECTEE - Conservation des données existantes');
          console.warn('📊 Signalements actuels conservés:', this.signalements.length);
          // Ne pas vider this.signalements pour garder les données déjà chargées
        } else {
          console.warn('🔴 Autre erreur - Vidage de la liste');
          // Pour les autres erreurs, vider la liste
          this.signalements = [];
        }
      } finally {
        this.loading = false;
      }
    },

    async createSignalement(signalementData) {
      this.loading = true;
      try {
        const result = await signalementService.createSignalement(signalementData);
        if (result.success) {
          this.signalements.unshift(result.data);
          this.calculateStats(); // Recalculer les stats après création
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

    async createSignalementWithPhotos(signalementData, photos = []) {
      this.loading = true;
      try {
        console.log('🏪 Store - Création avec photos, photos reçues:', photos.length);
        console.log('🏪 Store - Données photos:', photos.map(p => ({
          hasData: !!p.data,
          dataLength: p.data?.length || 0,
          name: p.name
        })));
        
        const result = await signalementService.createSignalementWithPhotos(signalementData, photos);
        
        console.log('🏪 Store - Résultat service:', result);
        console.log('🏪 Store - Signalement retourné:', result.data);
        console.log('🏪 Store - Photos dans signalement:', result.data?.photos?.length || 0);
        
        if (result.success || result.data) {
          // Ajouter le signalement complet avec photos au début de la liste
          const signalementToAdd = result.data || result;
          console.log('🏪 Store - Ajout du signalement:', signalementToAdd);
          console.log('🏪 Store - Photos dans signalement à ajouter:', signalementToAdd.photos);
          
          // Analyse spécifique de l'entreprise
          console.log('🏢 ANALYSE SIGNEMENT CRÉÉ:');
          console.log('  - ID:', signalementToAdd.id);
          console.log('  - id_entreprise:', signalementToAdd.id_entreprise);
          console.log('  - Type id_entreprise:', typeof signalementToAdd.id_entreprise);
          console.log('  - Description:', signalementToAdd.description?.substring(0, 50) + '...');
          
          this.signalements.unshift(signalementToAdd);
          this.calculateStats(); // Recalculer les stats après création
          
          return { success: true, data: signalementToAdd };
        }
        return { success: false, error: result.error?.message || 'Erreur lors de la création avec photos' };
      } catch (error) {
        console.error('Error creating signalement with photos:', error);
        
        // Gérer spécifiquement les erreurs 500
        if (error.response?.status === 500) {
          console.warn('⚠️ Erreur serveur 500 lors de la création avec photos');
          this.error = 'Erreur serveur temporaire, veuillez réessayer plus tard';
        } else {
          this.error = 'Erreur lors de la création du signalement avec photos';
        }
        
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async updateSignalement(id, signalementData) {
      this.loading = true;
      try {
        const result = await signalementService.updateSignalement(id, signalementData);
        if (result.success) {
          const index = this.signalements.findIndex(s => s.id === id);
          if (index !== -1) {
            this.signalements[index] = { ...this.signalements[index], ...result.data };
          }
          this.calculateStats(); // Recalculer les stats après mise à jour
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
        const result = await signalementService.deleteSignalement(id);
        if (result.success) {
          this.signalements = this.signalements.filter(s => s.id !== id);
          this.calculateStats(); // Recalculer les stats après suppression
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

    async fetchSignalementById(id) {
      this.loading = true;
      try {
        const result = await signalementService.getSignalementById(id);
        if (result.success) {
          this.currentSignalement = result.data;
        }
        return result;
      } catch (error) {
        console.error('Error fetching signalement by ID:', error);
        this.error = 'Erreur lors du chargement du signalement';
        throw error;
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

    calculateStats() {
      const signalements = this.signalements || [];
      
      // Stats générales
      this.stats.total_signalements = signalements.length;
      this.stats.total_surface = signalements.reduce((sum, s) => sum + (s.surface || 0), 0);
      this.stats.total_budget = signalements.reduce((sum, s) => sum + (s.budget || 0), 0);
      
      // Stats par statut
      const statusCounts = {};
      signalements.forEach(s => {
        const status = this.getCurrentStatus(s);
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      this.stats.signalements_par_statut = Object.entries(statusCounts).map(([statut, count]) => ({
        statut,
        count
      }));
      
      // Avancement moyen (basé sur les valeurs de l'API)
      const statusValues = {
        'En attente': 0,
        'En cours': 25,
        'En validation': 50,
        'Validé': 75,
        'Terminé': 100
      };
      
      const totalProgress = signalements.reduce((sum, s) => {
        const status = this.getCurrentStatus(s);
        return sum + (statusValues[status] || 0);
      }, 0);
      
      this.stats.avancement_moyen = signalements.length > 0 ? Math.round(totalProgress / signalements.length) : 0;
    },

    getCurrentStatus(signalement) {
      if (signalement.avancement_signalements && signalement.avancement_signalements.length > 0) {
        return signalement.avancement_signalements[0].statut_avancement?.nom || 'En attente';
      }
      return 'En attente';
    },

    async fetchStatuts() {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await signalementService.getStatuts();
        if (result.success && result.data && result.data.length > 0) {
          this.statuts = result.data;
        } else {
          // Statuts par défaut si l'API ne retourne rien
          this.statuts = [
            { id: "statut1", nom: "En attente", valeur: 0 },
            { id: "statut2", nom: "En cours", valeur: 25 },
            { id: "statut3", nom: "En validation", valeur: 50 },
            { id: "statut4", nom: "Validé", valeur: 75 },
            { id: "statut5", nom: "Terminé", valeur: 100 }
          ];
        }
      } catch (error) {
        console.error('Error fetching statuts:', error);
        // Statuts par défaut en cas d'erreur
        this.statuts = [
          { id: "statut1", nom: "En attente", valeur: 0 },
          { id: "statut2", nom: "En cours", valeur: 25 },
          { id: "statut3", nom: "En validation", valeur: 50 },
          { id: "statut4", nom: "Validé", valeur: 75 },
          { id: "statut5", nom: "Terminé", valeur: 100 }
        ];
      } finally {
        this.loading = false;
      }
    }
  }
});
