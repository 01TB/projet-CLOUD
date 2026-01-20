import api from './api';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';

class AuthService {
  constructor() {
    this.firebaseApp = null;
    this.firebaseAuth = null;
    this.initializeFirebase();
  }

  initializeFirebase() {
    const firebaseConfig = {
      apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
      authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VUE_APP_FIREBASE_APP_ID
    };

    try {
      this.firebaseApp = initializeApp(firebaseConfig);
      this.firebaseAuth = getAuth(this.firebaseApp);
    } catch (error) {
      console.warn('Firebase initialization failed, using offline mode:', error.message);
    }
  }

  // Inscription
  async register(userData) {
    try {
      // Créer en local d'abord
      const response = await api.post('/auth/register', userData);
      
      // Synchroniser avec Firebase si disponible
      if (this.firebaseAuth) {
        try {
          await createUserWithEmailAndPassword(
            this.firebaseAuth,
            userData.email,
            userData.password
          );
        } catch (firebaseError) {
          console.warn('Firebase registration failed, continuing locally:', firebaseError.message);
        }
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Connexion
  async login(credentials) {
    try {
      let firebaseUser = null;
      
      // Essayer Firebase d'abord si en ligne
      if (this.firebaseAuth && navigator.onLine) {
        try {
          const firebaseCredential = await signInWithEmailAndPassword(
            this.firebaseAuth,
            credentials.email,
            credentials.password
          );
          firebaseUser = firebaseCredential.user;
        } catch (firebaseError) {
          console.warn('Firebase login failed, trying local:', firebaseError.message);
        }
      }
      
      // Toujours se connecter en local (mode offline)
      const response = await api.post('/auth/login', credentials);
      const { user, token } = response.data;
      
      return {
        user,
        token,
        firebaseUser
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Déconnexion
  async logout() {
    try {
      // Déconnecter de Firebase si disponible
      if (this.firebaseAuth) {
        await signOut(this.firebaseAuth);
      }
      
      // Appeler l'API de déconnexion
      await api.post('/auth/logout');
      
    } catch (error) {
      console.warn('Logout error:', error.message);
    }
  }

  // Récupérer l'utilisateur courant
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mettre à jour le profil
  async updateProfile(userData) {
    try {
      const response = await api.put('/auth/update', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Vérifier l'état d'authentification Firebase
  onAuthStateChanged(callback) {
    if (this.firebaseAuth) {
      return onAuthStateChanged(this.firebaseAuth, callback);
    }
    return () => {};
  }

  // Gestion des erreurs
  handleError(error) {
    if (error.response) {
      return {
        message: error.response.data.message || 'Erreur serveur',
        code: error.response.status,
        details: error.response.data
      };
    } else if (error.request) {
      return {
        message: 'Erreur réseau. Vérifiez votre connexion Internet.',
        code: 'NETWORK_ERROR'
      };
    } else {
      return {
        message: error.message || 'Erreur inconnue',
        code: 'UNKNOWN_ERROR'
      };
    }
  }
}

export default new AuthService();