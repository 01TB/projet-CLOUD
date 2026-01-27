import api from './api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  async login(credentials) {
    try {
      const response = await api.post('/login', credentials);
      
      if (response.data.success) {
        this.token = response.data.token;
        this.user = response.data.user;
        
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return { success: true, user: this.user };
      }
      
      return { success: false, error: response.data.error?.message || 'Erreur de connexion' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Erreur de connexion' 
      };
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
        
        return { success: true, user: this.user };
      }
      
      return { success: false, error: response.data.error?.message || 'Erreur d\'inscription' };
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Erreur d\'inscription' 
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