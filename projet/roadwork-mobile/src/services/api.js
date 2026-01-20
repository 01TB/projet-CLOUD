import axios from 'axios';
import { useAuthStore } from '@/store/modules/auth';

// Configuration de l'API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erreurs spécifiques
      switch (error.response.status) {
        case 401:
          // Token expiré ou invalide
          const authStore = useAuthStore();
          authStore.logout();
          window.location.href = '/login';
          break;
        case 423:
          // Compte bloqué
          console.error('Compte bloqué:', error.response.data);
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default api;