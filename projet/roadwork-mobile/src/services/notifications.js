import axios from 'axios'

// Service pour la gestion des notifications Firebase
class NotificationService {
  constructor() {
    this.api = axios.create({
      baseURL: 'https://us-central1-projet-cloud-e2146.cloudfunctions.net',
      timeout: 10000
    })
  }

  /**
   * Sauvegarder le token FCM de l'utilisateur connecté
   * @param {string} token - Token FCM généré
   * @param {string} authToken - Token d'authentification Bearer
   * @returns {Promise} Réponse du backend
   */
  async saveFcmToken(token, authToken) {
    try {
      const response = await this.api.put('/updateFcmToken', {
        fcm_token: token
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      console.log('✅ Token FCM sauvegardé dans le backend:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Erreur sauvegarde token FCM:', error)
      
      // Gérer les erreurs spécifiques
      if (error.response?.status === 401) {
        throw new Error('Token d\'authentification invalide ou expiré')
      } else if (error.response?.status === 400) {
        throw new Error('Token FCM invalide')
      } else if (error.response?.status === 404) {
        throw new Error('Endpoint updateFcmToken non trouvé')
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout - le backend ne répond pas')
      } else {
        throw new Error('Erreur réseau ou serveur')
      }
    }
  }

  /**
   * Supprimer le token FCM d'un utilisateur (déconnexion)
   * @param {string} authToken - Token d'authentification Bearer
   * @returns {Promise} Réponse du backend
   */
  async removeFcmToken(authToken) {
    try {
      const response = await this.api.put('/updateFcmToken', {
        fcm_token: null // Envoyer null pour supprimer
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      console.log('✅ Token FCM supprimé du backend:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Erreur suppression token FCM:', error)
      throw error
    }
  }

  /**
   * Vérifier la connectivité avec le backend Firebase Cloud Functions
   * @returns {Promise<boolean} True si connecté
   */
  async checkBackendConnectivity() {
    try {
      // Test simple avec HEAD request pour vérifier la disponibilité
      await this.api.head('/updateFcmToken', { 
        timeout: 5000
      })
      return true
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.warn('⚠️ Backend non accessible - timeout')
        return false
      } else if (error.response?.status >= 500) {
        console.warn('⚠️ Backend en erreur - serveur indisponible')
        return false
      } else {
        // Erreurs 4xx ou 405 = backend accessible mais méthode non autorisée (normal)
        console.log('✅ Backend accessible')
        return true
      }
    }
  }

  /**
   * Récupérer les notifications d'un utilisateur (si endpoint existe)
   * @param {string} authToken - Token d'authentification Bearer
   * @returns {Promise} Liste des notifications
   */
  async getUserNotifications(authToken) {
    try {
      const response = await this.api.get('/getUserNotifications', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      return response.data
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error)
      throw error
    }
  }
}

// Exporter une instance singleton
export const notificationService = new NotificationService()
export default notificationService
