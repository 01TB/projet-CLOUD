import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { initializeApp } from 'firebase/app'
import { useAuthStore } from '@/store/modules/auth'
import { notificationService } from '@/services/notifications'

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

  // Sauvegarder le token FCM dans le backend
  const saveTokenToBackend = async (token) => {
    try {
      // Vérifier si l'utilisateur est connecté et a un token
      if (!authStore.token) {
        console.warn('❌ Aucun token d\'authentification disponible pour sauvegarder le token FCM')
        return false
      }

      // Vérifier la connectivité avec le backend
      const isConnected = await notificationService.checkBackendConnectivity()
      if (!isConnected) {
        console.warn('⚠️ Backend non accessible - token sauvegardé uniquement en local')
        return false
      }

      // Envoyer le token au backend avec authentification Bearer
      const response = await notificationService.saveFcmToken(token, authStore.token)
      console.log('✅ Token FCM sauvegardé dans le backend:', response)
      return true
    } catch (error) {
      console.error('❌ Erreur sauvegarde token FCM dans le backend:', error.message)
      
      // Ne pas bloquer l'expérience utilisateur si le backend ne répond pas
      // Le token reste sauvegardé en local
      return false
    }
  }

  // Demander la permission et obtenir le token
  const requestPermission = async () => {
    try {
      isLoading.value = true
      
      // Demander la permission de notification
      const result = await navigator.permissions.query({ name: 'notifications' })
      if (result.state === 'granted') {
        notificationPermission.value = 'granted'
        console.log('✅ Permission notification déjà accordée')
        
        // Obtenir le token FCM
        const token = await getToken(messaging, {
          vapidKey: 'BJKuYKYqZr4v8azAGVTKeFiFR8DHlbsKE2spbhC4GEWIt50xqeSBSX' // remplacé
        })
        
        if (token) {
          fcmToken.value = token
          console.log('🔑 Token FCM:', token)
          
          // Sauvegarder le token dans localStorage
          localStorage.setItem('fcmToken', token)
          
          // Envoyer le token au backend pour sauvegarde
          await saveTokenToBackend(token)
        }
      } else if (result.state === 'prompt') {
        // Demander la permission
        const permission = await Notification.requestPermission()
        notificationPermission.value = permission
        
        if (permission === 'granted') {
          console.log('✅ Permission notification accordée')
          
          // Obtenir le token FCM
          const token = await getToken(messaging, {
            vapidKey: 'BJKuYKYqZr4v8azAGVTKeFiFR8DHlbsKE2spbhC4GEWIt50xqeSBSX' // À remplacer avec votre vraie clé VAPID
          })
          
          if (token) {
            fcmToken.value = token
            console.log('🔑 Token FCM:', token)
            
            // Sauvegarder le token dans localStorage
            localStorage.setItem('fcmToken', token)
            
            // Envoyer le token au backend pour sauvegarde
            await saveTokenToBackend(token)
          }
        } else {
          console.warn('❌ Permission notification refusée')
          notificationPermission.value = 'denied'
        }
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

  // Écouter les messages au premier plan
  const setupMessageListener = () => {
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
      
      // Ajouter à la liste des notifications
      notifications.value.unshift(notification)
      
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
      toast.classList.remove('show')
      setTimeout(() => document.body.removeChild(toast), 300)
    }, 5000)
  }

  // Marquer une notification comme lue
  const markAsRead = (notificationId) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  // Supprimer une notification
  const removeNotification = (notificationId) => {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  // Vider toutes les notifications
  const clearAllNotifications = () => {
    notifications.value = []
  }

  // Compteur de notifications non lues
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  // Initialiser au montage
  onMounted(async () => {
    // Vérifier la permission actuelle
    const permissionResult = await navigator.permissions.query({ name: 'notifications' })
    notificationPermission.value = permissionResult.state
    
    // Récupérer le token sauvegardé
    const savedToken = localStorage.getItem('fcmToken')
    if (savedToken) {
      fcmToken.value = savedToken
    }
    
    // Si permission déjà accordée, configurer l'écoute
    if (permissionResult.state === 'granted') {
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
    markAsRead,
    removeNotification,
    clearAllNotifications
  }
}

