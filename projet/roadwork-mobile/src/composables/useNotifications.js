import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { initializeApp } from 'firebase/app'
import { useAuthStore } from '@/store/modules/auth'
import { notificationService } from '@/services/notifications'
import '@/styles/notifications.css'

// Configuration Firebase (REMPLACER AVEC VOS VRAIES CLÉS)
const firebaseConfig = {
  apiKey: "AIzaSyDhLRO2eNXgH2_qHnZeIZYmRjIJvwr38RU", // remplacé
  authDomain: "projet-cloud-e2146.firebaseapp.com", // remplacé
  projectId: "projet-cloud-e2146", // remplacé
  storageBucket: "projet-cloud-e2146.appspot.com", // remplacé
  messagingSenderId: "536116876117", // Vérifier dans Firebase Console (remplacé)
  appId: "1:536116876117:web:6be40fecc75a39650e95dc" // remplacé
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

export function useNotifications() {
  const fcmToken = ref(null)
  const notificationPermission = ref('default')
  const notifications = ref([])
  const isLoading = ref(false)
  const authStore = useAuthStore()
  const isListenerActive = ref(false) // ← Flag pour éviter les activations multiples

  // Sauvegarder le token FCM dans le backend
  const saveTokenToBackend = async (token, authToken) => {
    try {
      // Vérifier si le token d'authentification est fourni
      if (!authToken) {
        console.warn('❌ Aucun token d\'authentification disponible pour sauvegarder le token FCM')
        return false
      }

      // Vérifier la connectivité avec le backend (avec authentification)
      const isConnected = await notificationService.checkBackendConnectivity(authToken)
      if (!isConnected) {
        console.warn('⚠️ Backend non accessible - token sauvegardé uniquement en local')
        return false
      }

      // Envoyer le token au backend avec authentification Bearer
      const response = await notificationService.saveFcmToken(token, authToken)
      console.log('✅ Token FCM sauvegardé dans le backend:', response)
      return true
    } catch (error) {
      console.error('❌ Erreur sauvegarde token FCM dans le backend:', error.message)
      
      // Ne pas bloquer l'expérience utilisateur si le backend ne répond pas
      // Le token reste sauvegardé en local
      return false
    }
  }

  // Générer le FCM Token pour les utilisateurs authentifiés
  const generateFcmToken = async () => {
    try {
      // Vérifier si l'utilisateur est authentifié
      if (!authStore.isAuthenticated) {
        console.warn('❌ Utilisateur non authentifié - Impossible de générer le FCM Token')
        return null
      }

      // Vérifier si le token existe déjà
      if (fcmToken.value) {
        console.log('ℹ️ FCM Token déjà existant:', fcmToken.value)
        return fcmToken.value
      }

      // Demander la permission si nécessaire
      if (notificationPermission.value !== 'granted') {
        const permission = await Notification.requestPermission()
        notificationPermission.value = permission
        
        if (permission !== 'granted') {
          console.warn('❌ Permission notification refusée')
          return null
        }
      }

      // Activer l'écouteur des messages
      setupMessageListener()

      // Générer le token FCM
      const token = await getToken(messaging, {
        vapidKey: 'BJKuYKYqZr4v8azAGVTKeFiFR8DHlbsKE2spbhC4GEWIt50xqeSBSXopPw-siBK--l4x0X4A6Tb4PlHlWYwtAN4'
      })

      if (token) {
        fcmToken.value = token
        localStorage.setItem('fcmToken', token)
        console.log('🔑 FCM Token généré:', token)
        
        // Envoyer le token au backend
        await saveTokenToBackend(token, authStore.token)
        
        return token
      }

      return null
    } catch (error) {
      console.error('❌ Erreur génération FCM Token:', error)
      return null
    }
  }

  // Demander la permission et obtenir le token (déclenché par utilisateur)
  const requestPermission = async () => {
    try {
      isLoading.value = true
      
      // Demander la permission de notification (doit être déclenché par utilisateur)
      const permission = await Notification.requestPermission()
      notificationPermission.value = permission
      
      if (permission === 'granted') {
        console.log('✅ Permission notification accordée')
        
        // Activer l'écoute des messages immédiatement
        setupMessageListener()
        
        // NE PAS générer le token FCM ici
        // Le token sera généré UNIQUEMENT lors de la connexion dans le store d'authentification
        console.log('ℹ️ Permission accordée - Token FCM sera généré lors de la connexion')
      } else {
        console.warn('❌ Permission notification refusée')
        notificationPermission.value = 'denied'
      }
    } catch (error) {
      console.error('❌ Erreur permission notification:', error)
      notificationPermission.value = 'denied'
    } finally {
      isLoading.value = false
    }
  }

  // Vérifier la permission actuelle sans la demander
  const checkPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'notifications' })
      notificationPermission.value = result.state
      
      if (result.state === 'granted') {
        console.log('✅ Permission notification déjà accordée')
        
        // Activer l'écoute des messages si permission accordée
        setupMessageListener()
      }
    } catch (error) {
      console.error('❌ Erreur vérification permission:', error)
      notificationPermission.value = 'default'
    }
  }

  // Écouter les messages au premier plan
  const setupMessageListener = () => {
    // Éviter d'activer l'écouteur plusieurs fois
    if (isListenerActive.value) {
      console.log('⚠️ Écouteur déjà actif, activation ignorée')
      return
    }
    
    console.log('🔧 Activation de l\'écouteur de messages Firebase...')
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('📨 Notification reçue au premier plan:', payload)
      
      const notification = {
        id: Date.now(),
        title: payload.notification?.title || 'Nouvelle notification',
        body: payload.notification?.body || 'Vous avez une nouvelle notification',
        icon: payload.notification?.icon || '/icons/icon-192x192.png',
        data: payload.data || {},
        timestamp: new Date().toISOString(),
        read: false
      }
      
      console.log('📝 Notification créée:', notification)
      console.log('📝 Notifications actuelles avant ajout:', notifications.value.length)
      
      // Ajouter à la liste des notifications
      notifications.value.unshift(notification)
      
      // Persister dans localStorage avec debounce
      debouncedSaveNotifications()
      
      console.log('📝 Notifications après ajout:', notifications.value.length)
      console.log('📝 Liste complète:', notifications.value)
      
      // Limiter à 50 notifications max
      if (notifications.value.length > 50) {
        notifications.value = notifications.value.slice(0, 50)
      }
      
      // Afficher une alerte dans l'application
      if (payload.notification?.title) {
        // Utiliser Ionic Alert ou Toast
        showInAppNotification(notification)
      }
    })
    
    isListenerActive.value = true
    console.log('✅ Écouteur de messages Firebase activé avec succès')
    return unsubscribe
  }

  // Afficher notification dans l'application
  const showInAppNotification = (notification) => {
    // Créer un toast ou alert simple
    const toast = document.createElement('div')
    toast.className = 'notification-toast'
    toast.innerHTML = `
      <div class="notification-content">
        <strong>${notification.title}</strong>
        <p>${notification.body}</p>
      </div>
    `
    
    document.body.appendChild(toast)
    
    // Animation d'entrée
    setTimeout(() => toast.classList.add('show'), 100)
    
    // Auto-suppression après 5 secondes
    setTimeout(() => {
      toast.classList.add('hide')
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast)
        }
      }, 300)
    }, 5000)
  }

  // Fonction de sauvegarde optimisée avec debounce
  let saveTimeout = null;
  const debouncedSaveNotifications = () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveNotificationsToStorage();
    }, 1000); // Attendre 1 seconde avant de sauvegarder
  };

  // Persister les notifications dans localStorage
  const saveNotificationsToStorage = () => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications.value));
      console.log('💾 Notifications sauvegardées dans localStorage')
    } catch (error) {
      console.error('❌ Erreur sauvegarde notifications:', error)
    }
  }

  // Charger les notifications depuis localStorage
  const loadNotificationsFromStorage = () => {
    try {
      const saved = localStorage.getItem('notifications')
      if (saved) {
        const parsed = JSON.parse(saved)
        notifications.value = parsed
        console.log('📂 Notifications chargées depuis localStorage:', parsed.length)
      }
    } catch (error) {
      console.error('❌ Erreur chargement notifications:', error)
    }
  }

  // Marquer une notification comme lue
  const markAsRead = (notificationId) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      debouncedSaveNotifications()
      console.log('📖 Notification marquée comme lue:', notificationId)
    }
  }

  // Supprimer une notification
  const removeNotification = (notificationId) => {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index > -1) {
      notifications.value.splice(index, 1)
      debouncedSaveNotifications()
      console.log('🗑️ Notification supprimée:', notificationId)
    }
  }

  // Vider toutes les notifications
  const clearAllNotifications = () => {
    notifications.value = []
    debouncedSaveNotifications()
    console.log('🗑️ Toutes les notifications supprimées')
  }

  // Supprimer le FCM Token localement (déconnexion)
  const removeFcmToken = async () => {
    try {
      // NE PAS supprimer le token du backend, seulement le token local
      // Le backend doit conserver le token pour les futures sessions
      
      // Nettoyer le token local uniquement
      fcmToken.value = null
      localStorage.removeItem('fcmToken')
      
      console.log('🗑️ FCM Token supprimé localement (backend conservé)')
      return true
    } catch (error) {
      console.error('❌ Erreur suppression locale FCM Token:', error)
      throw error
    }
  }

  // Compteur de notifications non lues
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  // Initialiser au montage
  onMounted(async () => {
    // Charger les notifications depuis localStorage
    loadNotificationsFromStorage()
    
    // Vérifier la permission actuelle sans la demander
    await checkPermission()
    
    // NE PAS générer automatiquement le token FCM ici
    // Le token sera généré uniquement lors de la connexion/inscription
    // dans le store d'authentification
    
    // Activer l'écoute des messages si permission accordée
    // (même sans token FCM pour les visiteurs)
    if (notificationPermission.value === 'granted') {
      setupMessageListener()
    }
  })

  return {
    fcmToken,
    notificationPermission,
    notifications,
    isLoading,
    unreadCount,
    requestPermission,
    checkPermission,
    markAsRead,
    removeNotification,
    clearAllNotifications,
    removeFcmToken,
    generateFcmToken
  }
}

