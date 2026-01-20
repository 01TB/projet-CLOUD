import { defineStore } from 'pinia';
import AuthService from '@/services/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      
      try {
        const { user, token } = await AuthService.login(credentials);
        
        this.user = user;
        this.token = token;
        this.isAuthenticated = true;
        
        // Sauvegarder le token
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        return { success: true, user };
      } catch (error) {
        this.error = error.message;
        return { success: false, error: error.message };
      } finally {
        this.loading = false;
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        const data = await AuthService.register(userData);
        
        this.user = data.user;
        this.token = data.token;
        this.isAuthenticated = true;
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return { success: true, user: data.user };
      } catch (error) {
        this.error = error.message;
        return { success: false, error: error.message };
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        await AuthService.logout();
      } catch (error) {
        console.warn('Logout error:', error);
      }
      
      // Nettoyer le store
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      this.error = null;
      
      // Nettoyer le localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    async checkAuth() {
      if (this.token) {
        try {
          const user = await AuthService.getCurrentUser();
          this.user = user;
          this.isAuthenticated = true;
          return true;
        } catch (error) {
          this.logout();
          return false;
        }
      }
      return false;
    },

    setUser(user) {
      this.user = user;
      this.isAuthenticated = true;
    }
  },

  getters: {
    isManager: (state) => state.user?.role === 1,
    isUser: (state) => state.user?.role === 2,
    isVisitor: (state) => !state.isAuthenticated || state.user?.role === 3,
    userName: (state) => state.user?.email?.split('@')[0] || 'Utilisateur'
  }
});