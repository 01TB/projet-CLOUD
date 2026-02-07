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
    // Nettoyer les tokens invalides au démarrage
    if (typeof window !== 'undefined') {
      const idToken = localStorage.getItem('idToken');
      const token = localStorage.getItem('token');
      
      if (idToken === 'undefined') localStorage.removeItem('idToken');
      if (token === 'undefined') localStorage.removeItem('token');
    }
    
    // Vérifier l'expiration du token avant de l'utiliser
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.session_expires_at) {
          const expirationTime = new Date(user.session_expires_at).getTime();
          const currentTime = new Date().getTime();
          
          if (currentTime >= expirationTime) {
            console.warn('Token expired in interceptor, skipping request...');
            // Retourner une promesse rejetée pour éviter la requête
            return Promise.reject(new Error('Token expired'));
          }
        }
      }
    } catch (error) {
      console.warn('Error checking token expiration in interceptor:', error);
    }
    
    // Essayer d'abord le localStorage avec idToken, puis token, puis le store
    let token = localStorage.getItem('idToken') || localStorage.getItem('token');
    
    // Si pas dans localStorage, essayer depuis le store
    if (!token && typeof window !== 'undefined') {
      try {
        const authStore = useAuthStore();
        token = authStore.token || authStore.idToken;
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
      localStorage.removeItem('idToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;