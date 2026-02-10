import { defineStore } from 'pinia';
import AuthService from '@/services/auth';
import { nextTick } from 'vue';

export const useAuthStore = defineStore('auth', {
  state: () => {
    const idToken = localStorage.getItem('idToken');
    const token = localStorage.getItem('token');
    const isVisitor = localStorage.getItem('isVisitor') === 'true';
    
    // Ne stocker que les tokens valides (non "undefined" et non null)
    const validIdToken = (idToken && idToken !== 'undefined') ? idToken : null;
    const validToken = (token && token !== 'undefined') ? token : null;
    
    return {
      user: null,
      token: validIdToken || validToken || null,
      idToken: validIdToken || null,
      isAuthenticated: false,
      isVisitor: isVisitor,
      loading: false,
      error: null
    };
  },

  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await AuthService.login(credentials);
        
        // Ne s'authentifier que si la connexion a réussi
        if (result.success) {
          this.user = result.user;
          this.token = result.token || result.idToken; // Utiliser le token retourné par le service
          this.idToken = result.idToken || result.token;
          this.isAuthenticated = true;
          this.isVisitor = false; // S'assurer que le mode visiteur est désactivé
          
          localStorage.setItem('token', this.token);
          localStorage.setItem('idToken', this.idToken);
          localStorage.setItem('user', JSON.stringify(result.user));
          localStorage.removeItem('isVisitor'); // Nettoyer le mode visiteur
          
          // Générer le FCM Token après connexion réussie (avec nextTick pour éviter les problèmes de lifecycle)
          nextTick(async () => {
            try {
              // Import dynamique pour éviter les problèmes de lifecycle
              const { useNotifications } = await import('@/composables/useNotifications');
              const { generateFcmToken } = useNotifications();
              await generateFcmToken();
              console.log(' FCM Token généré et envoyé après connexion');
            } catch (error) {
              console.warn(' Erreur génération FCM Token après connexion:', error);
            }
          });
          
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
          this.token = result.token || result.idToken;
          this.idToken = result.idToken || result.token;
          this.isAuthenticated = true;
          this.isVisitor = false; // S'assurer que le mode visiteur est désactivé
          
          localStorage.setItem('token', this.token);
          localStorage.setItem('idToken', this.idToken);
          localStorage.setItem('user', JSON.stringify(result.user));
          localStorage.removeItem('isVisitor'); // Nettoyer le mode visiteur
          
          // Générer le FCM Token après inscription réussie (avec nextTick pour éviter les problèmes de lifecycle)
          nextTick(async () => {
            try {
              // Import dynamique pour éviter les problèmes de lifecycle
              const { useNotifications } = await import('@/composables/useNotifications');
              const { generateFcmToken } = useNotifications();
              await generateFcmToken();
              console.log(' FCM Token généré et envoyé après inscription');
            } catch (error) {
              console.warn(' Erreur génération FCM Token après inscription:', error);
            }
          });
          
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
      this.idToken = null;
      this.isAuthenticated = false;
      this.isVisitor = false;
      this.error = null;
      
      // Nettoyer le localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('idToken');
      localStorage.removeItem('user');
      localStorage.removeItem('fcmToken'); // Nettoyer aussi le FCM token
      localStorage.removeItem('isVisitor'); // Nettoyer aussi le mode visiteur
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
    },

    // Initialiser l'authentification depuis localStorage
    initializeAuth() {
      const idToken = localStorage.getItem('idToken');
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const isVisitor = localStorage.getItem('isVisitor') === 'true';
      
      // Nettoyer les tokens invalides
      if (idToken === 'undefined') localStorage.removeItem('idToken');
      if (token === 'undefined') localStorage.removeItem('token');
      
      const validToken = (idToken && idToken !== 'undefined') ? idToken : 
                        (token && token !== 'undefined') ? token : null;
      
      if (validToken && userStr) {
        try {
          this.user = JSON.parse(userStr);
          this.token = validToken;
          this.idToken = (idToken && idToken !== 'undefined') ? idToken : null;
          this.isAuthenticated = true;
          this.isVisitor = false;
          console.log('Auth initialized from localStorage:', {
            user: this.user,
            hasToken: !!this.token,
            hasIdToken: !!this.idToken,
            tokenValue: this.token,
            isVisitor: false
          });
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          this.logout();
        }
      } else if (isVisitor) {
        // Mode visiteur
        this.isVisitor = true;
        console.log('Visitor mode initialized:', { isVisitor: true });
      } else {
        // Nettoyer les données invalides
        this.logout();
      }
    },

    // Activer le mode visiteur
    enableVisitorMode() {
      this.isVisitor = true;
      localStorage.setItem('isVisitor', 'true');
      console.log('👋 Mode visiteur activé');
    },

    // Désactiver le mode visiteur
    disableVisitorMode() {
      this.isVisitor = false;
      localStorage.removeItem('isVisitor');
      console.log('👤 Mode visiteur désactivé');
    }
  },

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    isManager: (state) => state.user?.role === 1,
    isUser: (state) => state.user?.role === 2,
    userName: (state) => state.user?.email?.split('@')[0] || 'Visiteur'
  }
});