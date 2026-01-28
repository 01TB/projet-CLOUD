import axios from 'axios';
import { useAuthStore } from '@/store/modules/auth';

const API_URL = import.meta.env.VITE_API_URL || 'https://us-central1-projet-cloud-e2146.cloudfunctions.net';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor pour ajouter le token
api.interceptors.request.use(
  (config) => {
    // Essayer d'abord le localStorage, puis le store
    let token = localStorage.getItem('token');
    
    // Si pas dans localStorage, essayer depuis le store
    if (!token && typeof window !== 'undefined') {
      try {
        const authStore = useAuthStore();
        token = authStore.token;
      } catch (error) {
        console.warn('Impossible d\'accéder au store auth:', error);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;