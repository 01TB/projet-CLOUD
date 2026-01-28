import api from './api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    
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
      const response = await api.post('/login', credentials);
      
      if (response.data.success) {
        this.token = response.data.token;
        this.user = response.data.user;
        
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return { 
          success: true, 
          user: this.user,
          token: this.token
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
        this.token = response.data.token;
        this.user = response.data.user;
        
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return { 
          success: true, 
          user: this.user,
          token: this.token
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
        error: error.response?.data?.error?.message || error.message || 'Erreur d\'inscription' 
      };
    }
  }

  async logout() {
    try {
      if (this.token) {
        await api.post('/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async checkAuth() {
    if (!this.token) {
      return false;
    }

    try {
      const response = await api.get('/me');
      
      if (response.data.success) {
        this.user = response.data.user;
        localStorage.setItem('user', JSON.stringify(this.user));
        return true;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      this.logout();
    }
    
    return false;
  }

  async updateProfile(userData) {
    try {
      const response = await api.put('/update', userData);
      
      if (response.data.success) {
        this.user = response.data.user;
        localStorage.setItem('user', JSON.stringify(this.user));
        return { success: true, user: this.user };
      }
      
      return { success: false, error: response.data.error?.message || 'Erreur de mise à jour' };
    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Erreur de mise à jour' 
      };
    }
  }

  isAuthenticated() {
    return !!this.token;
  }

  isUser() {
    return this.user?.role === 2; // Utilisateur
  }

  isManager() {
    return this.user?.role === 1; // Manager
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }
}

export default new AuthService();