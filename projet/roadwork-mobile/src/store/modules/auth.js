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
        const result = await AuthService.login(credentials);
        
        // Ne s'authentifier que si la connexion a réussi
        if (result.success) {
          this.user = result.user;
          this.token = result.token; // Utiliser le token retourné par le service
          this.isAuthenticated = true;
          
          localStorage.setItem('token', this.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          
          return { success: true, user: result.user };
        } else {
          // La connexion a échoué, ne pas s'authentifier
          this.error = result.error;
          return { success: false, error: result.error };
        }
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
        const result = await AuthService.register(userData);
        
        // Ne s'authentifier que si l'inscription a réussi
        if (result.success) {
          this.user = result.user;
          this.token = result.token; // Utiliser le token retourné par le service
          this.isAuthenticated = true;
          
          localStorage.setItem('token', this.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          
          return { success: true, user: result.user };
        } else {
          // L'inscription a échoué, ne pas s'authentifier
          this.error = result.error;
          return { success: false, error: result.error };
        }
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
          const isValid = await AuthService.checkAuth();
          if (isValid) {
            // Récupérer l'utilisateur depuis localStorage
            const userStr = localStorage.getItem('user');
            if (userStr) {
              this.user = JSON.parse(userStr);
            }
            this.isAuthenticated = true;
            return true;
          } else {
            this.logout();
            return false;
          }
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
    isLoggedIn: (state) => state.isAuthenticated,
    isManager: (state) => state.user?.role === 1,
    isUser: (state) => state.user?.role === 2,
    isVisitor: (state) => !state.isAuthenticated || state.user?.role === 3,
    userName: (state) => state.user?.email?.split('@')[0] || 'Utilisateur'
  }
});