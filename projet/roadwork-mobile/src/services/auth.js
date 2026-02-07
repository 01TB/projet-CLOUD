import api from './api';

class AuthService {
  constructor() {
    // Essayer d'abord idToken, puis token pour la compatibilité
    this.token = localStorage.getItem('idToken') || localStorage.getItem('token');
    
    // Parser l'utilisateur depuis localStorage avec gestion d'erreur
    const userStr = localStorage.getItem('user');
    try {
      this.user = userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      this.user = null;
      localStorage.removeItem('user'); // Nettoyer les données corrompues
    }
  }

  async login(credentials) {
    try {
      console.log('🔐 Tentative de connexion avec:', credentials);
      
      // Créer un objet propre avec seulement les champs requis
      const filteredCredentials = {
        email: String(credentials.email || '').trim(),
        password: String(credentials.password || '')
      };
      
      // Double vérification : s'assurer qu'aucune valeur n'est undefined
      Object.keys(filteredCredentials).forEach(key => {
        if (filteredCredentials[key] === 'undefined') {
          filteredCredentials[key] = '';
        }
      });
      
      console.log('🔐 Credentials finales:', filteredCredentials);
      
      const response = await api.post('/login', filteredCredentials);
      
      console.log('📥 Réponse serveur:', response.data);
      
      if (response.data.success) {
        // Utiliser idToken en priorité, puis token pour compatibilité
        this.token = response.data.idToken || response.data.token;
        this.user = response.data.user;
        
        // Stocker les deux tokens pour compatibilité
        localStorage.setItem('token', this.token);
        localStorage.setItem('idToken', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        console.log('✅ Connexion réussie:', { user: this.user, hasToken: !!this.token });
        
        return { 
          success: true, 
          user: this.user,
          token: this.token,
          idToken: this.token
        };
      }
      
      return { 
        success: response.data.success, 
        error: response.data.error?.message || 'Erreur de connexion' 
      };
    } catch (error) {
      console.error('Login error:', error);
      
      // Afficher plus de détails pour le débogage
      if (error.response) {
        console.error('Server response:', error.response.data);
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
      }
      
      // Extraire le message d'erreur de la réponse si disponible
      if (error.response?.data?.error?.message) {
        return { success: false, error: error.response.data.error.message };
      }
      
      return { success: false, error: error.message || 'Erreur de connexion' };
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/register', userData);
      
      if (response.data.success) {
        // Utiliser idToken en priorité, puis token pour compatibilité
        this.token = response.data.idToken || response.data.token;
        this.user = response.data.user;
        
        localStorage.setItem('token', this.token);
        localStorage.setItem('idToken', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return { 
          success: true, 
          user: this.user,
          token: this.token,
          idToken: this.token
        };
      }
      
      return { 
        success: response.data.success, 
        error: response.data.error?.message || 'Erreur d\'inscription' 
      };
    } catch (error) {
      console.error('Register error:', error);
      
      // Afficher plus de détails pour le débogage
      if (error.response) {
        console.error('Server response:', error.response.data);
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
      }
      
      // Extraire le message d'erreur de la réponse si disponible
      if (error.response?.data?.error?.message) {
        return { success: false, error: error.response.data.error.message };
      }
      
      // Pour les erreurs 500, essayer d'extraire plus d'informations
      if (error.response?.status === 500) {
        const serverError = error.response.data;
        if (serverError?.error?.details) {
          return { success: false, error: `Erreur serveur: ${serverError.error.details}` };
        }
        if (serverError?.message) {
          return { success: false, error: `Erreur serveur: ${serverError.message}` };
        }
        return { success: false, error: 'Erreur serveur interne. Veuillez réessayer plus tard.' };
      }
      
      return { 
        success: false, 
        error: error.message || 'Erreur d\'inscription' 
      };
    }
  }

  async logout() {
    try {
      await api.post('/logout');
    } catch (error) {
      console.warn('Logout error:', error);
    }
    
    // Nettoyer le service
    this.token = null;
    this.user = null;
    
    // Nettoyer localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('idToken');
    localStorage.removeItem('user');
  }

  async checkAuth() {
    if (!this.token) {
      return false;
    }
    
    // Vérifier si le token a expiré
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.session_expires_at) {
          const expirationTime = new Date(user.session_expires_at).getTime();
          const currentTime = new Date().getTime();
          
          if (currentTime >= expirationTime) {
            console.warn('Token expired, cleaning up...');
            this.logout(); // Nettoyer le token expiré
            return false;
          }
        }
      }
    } catch (error) {
      console.warn('Error checking token expiration:', error);
    }
    
    try {
      const baseURL = import.meta.env.VITE_API_URL || 'https://us-central1-projet-cloud-e2146.cloudfunctions.net';
      const fullUrl = `${baseURL}/me`;
      console.log('Checking auth at:', fullUrl);
      console.log('With token:', this.token ? 'present' : 'missing');
      
      const response = await api.get('/me');
      console.log('Auth check response:', response.data);
      return response.data.success;
    } catch (error) {
      console.warn('Auth check failed:', error);
      console.warn('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Gérer les différents types d'erreurs
      if (error.response?.status === 401) {
        console.warn('Token invalid, logging out...');
        this.logout();
        return false;
      } else if (error.response?.status === 404) {
        console.warn('Endpoint /me not implemented, but token exists and is not expired');
        // Si /me n'existe pas mais le token est valide, on considère l'utilisateur comme authentifié
        return !!this.token && !!this.user;
      } else {
        // Pour les autres erreurs (réseau, serveur), on garde l'utilisateur connecté
        console.warn('Network or server error, keeping user logged in');
        return !!this.token && !!this.user;
      }
    }
  }

  // Getters
  get isAuthenticated() {
    return !!this.token && !!this.user;
  }

  get currentUser() {
    return this.user;
  }

  get currentToken() {
    return this.token;
  }
}

export default new AuthService();
