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
    // Initialiser le store avec les données du localStorage et du service
    initializeAuth() {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      console.log('=== INITIALIZE AUTH ===');
      console.log('Token from localStorage:', token);
      console.log('User from localStorage:', userStr);
      
      if (token && token !== 'null' && token !== 'undefined') {
        this.token = token;
        // Synchroniser avec le service
        AuthService.token = token;
        console.log('Set token in store:', this.token);
      } else {
        console.log('No valid token found in localStorage');
        this.token = null;
      }
      
      if (userStr && userStr !== 'null' && userStr !== 'undefined') {
        try {
          this.user = JSON.parse(userStr);
          AuthService.user = this.user;
          console.log('Set user in store:', this.user);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          this.user = null;
          localStorage.removeItem('user');
        }
      } else {
        console.log('No valid user found in localStorage');
        this.user = null;
      }
      
      this.isAuthenticated = !!(this.token && this.user);
      console.log('Set isAuthenticated:', this.isAuthenticated);
      console.log('=== END INITIALIZE AUTH ===');
    },

    async login(credentials) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('=== LOGIN START ===');
        console.log('Credentials:', credentials);
        
        const result = await AuthService.login(credentials);
        console.log('Login result:', result);
        
        // Ne s'authentifier que si la connexion a réussi
        if (result.success) {
          console.log('Login successful, setting auth data...');
          console.log('Result user:', result.user);
          console.log('Result token:', result.token);
          
          this.user = result.user;
          this.token = result.token; // Utiliser le token retourné par le service
          this.isAuthenticated = true;
          
          console.log('Store token after login:', this.token);
          console.log('Store user after login:', this.user);
          
          localStorage.setItem('token', this.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          
          console.log('Token stored in localStorage:', localStorage.getItem('token'));
          console.log('User stored in localStorage:', localStorage.getItem('user'));
          
          return { success: true, user: result.user };
        } else {
          // La connexion a échoué, ne pas s'authentifier
          this.error = result.error;
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error('Login error:', error);
        this.error = error.message;
        return { success: false, error: error.message };
      } finally {
        this.loading = false;
        console.log('=== LOGIN END ===');
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
      // Si pas de token, pas authentifié
      if (!this.token) {
        return false;
      }

      try {
        const response = await AuthService.checkAuth();
        
        // Vérifier si la réponse existe et a des données
        if (!response || !response.data) {
          console.warn('No response data from API');
          return this.isAuthenticated; // Garder l'état actuel
        }
        
        if (response.data.success) {
          // Récupérer l'utilisateur depuis localStorage si la réponse API est valide
          const userStr = localStorage.getItem('user');
          if (userStr) {
            this.user = JSON.parse(userStr);
          }
          this.isAuthenticated = true;
          return true;
        } else {
          // Seulement déconnecter si la réponse API est explicitement un échec
          console.warn('API returned unsuccessful response:', response.data);
          this.logout();
          return false;
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Ne déconnecter automatiquement que pour les erreurs 401 (token invalide)
        if (error.response?.status === 401) {
          console.warn('Token invalid, logging out');
          this.logout();
          return false;
        }
        // Pour les autres erreurs (réseau, serveur), garder l'état actuel
        console.warn('Network/server error, keeping current auth state');
        return this.isAuthenticated;
      }
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