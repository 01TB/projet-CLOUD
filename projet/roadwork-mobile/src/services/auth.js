import api from './api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    
    console.log('=== AUTH SERVICE CONSTRUCTOR ===');
    console.log('Token from localStorage:', this.token);
    
    // Parser l'utilisateur depuis localStorage avec gestion d'erreur
    const userStr = localStorage.getItem('user');
    console.log('User string from localStorage:', userStr);
    
    try {
      this.user = userStr ? JSON.parse(userStr) : null;
      console.log('Parsed user:', this.user);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      this.user = null;
      localStorage.removeItem('user'); // Nettoyer les données corrompues
    }
    
    console.log('=== END AUTH SERVICE CONSTRUCTOR ===');
  }

  async login(credentials) {
    try {
      console.log('=== AUTH SERVICE LOGIN ===');
      console.log('Sending credentials:', credentials);
      
      const response = await api.post('/login', credentials);
      
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response data success:', response.data.success);
      console.log('Response data idToken:', response.data.idToken);
      console.log('Response data user:', response.data.user);
      
      if (response.data.success) {
        this.token = response.data.idToken;
        this.user = response.data.user;
        
        console.log('Set service token:', this.token);
        console.log('Set service user:', this.user);
        
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        console.log('Token stored in localStorage:', localStorage.getItem('token'));
        
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
    } finally {
      console.log('=== END AUTH SERVICE LOGIN ===');
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/register', userData);
      
      if (response.data.success) {
        this.token = response.data.idToken;
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
      console.log('No token found in AuthService');
      return { success: false, error: 'No token' };
    }

    console.log('Checking auth with token:', this.token.substring(0, 20) + '...');
    
    try {
      const response = await api.get('/me');
      console.log('Auth check response:', response);
      
      if (response.data.success) {
        this.user = response.data.user;
        localStorage.setItem('user', JSON.stringify(this.user));
        console.log('Auth check successful');
        return response; // Retourner l'objet response complet
      }
    } catch (error) {
      console.error('Auth check error:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Ne pas faire logout ici, laisser le store gérer
      throw error; // Lancer l'erreur pour que le store la gère
    }
    
    return { success: false, error: 'Unknown error' };
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