import { defineStore } from 'pinia';
import ProfileService from '@/services/profile';

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null,
    activityHistory: [],
    loading: false,
    error: null
  }),

  getters: {
    fullName: (state) => {
      if (!state.profile?.user) return '';
      const user = state.profile.user;
      return `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email;
    },
    
    initials: (state) => {
      if (!state.profile?.user) return 'U';
      const user = state.profile.user;
      if (user.prenom && user.nom) {
        return `${user.prenom[0]}${user.nom[0]}`.toUpperCase();
      }
      return user.email ? user.email[0].toUpperCase() : 'U';
    },
    
    roleLabel: (state) => {
      const role = state.profile?.user?.role;
      switch (role) {
        case 1: return 'Manager';
        case 2: return 'Utilisateur';
        case 3: return 'Visiteur';
        default: return 'Utilisateur';
      }
    },
    
    canManageSignalements: (state) => {
      const role = state.profile?.user?.role;
      return role === 1; // Manager only
    },
    
    canCreateSignalements: (state) => {
      const role = state.profile?.user?.role;
      return role === 1 || role === 2; // Manager and User
    }
  },

  actions: {
    async fetchProfile() {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await ProfileService.getMyProfile();
        if (result.success) {
          this.profile = result;
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        this.error = 'Erreur lors du chargement du profil';
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(profileData) {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await ProfileService.updateProfile(profileData);
        if (result.success) {
          this.profile = { ...this.profile, ...result };
          return { success: true, data: result };
        }
        return { success: false, error: result.error?.message || 'Erreur lors de la mise à jour' };
      } catch (error) {
        console.error('Error updating profile:', error);
        this.error = 'Erreur lors de la mise à jour du profil';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async changePassword(currentPassword, newPassword) {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await ProfileService.changePassword(currentPassword, newPassword);
        return result;
      } catch (error) {
        console.error('Error changing password:', error);
        this.error = 'Erreur lors du changement du mot de passe';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async fetchActivityHistory() {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await ProfileService.getActivityHistory();
        if (result.success) {
          this.activityHistory = result.data;
        }
      } catch (error) {
        console.error('Error fetching activity history:', error);
        this.error = 'Erreur lors du chargement de l\'historique';
      } finally {
        this.loading = false;
      }
    },

    async deleteAccount() {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await ProfileService.deleteAccount();
        if (result.success) {
          this.profile = null;
          this.activityHistory = [];
        }
        return result;
      } catch (error) {
        console.error('Error deleting account:', error);
        this.error = 'Erreur lors de la suppression du compte';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    resetProfile() {
      this.profile = null;
      this.activityHistory = [];
    }
  }
});
