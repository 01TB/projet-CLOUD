<template>
  <ion-modal
    :is-open="isOpen"
    @did-dismiss="$emit('dismiss')"
    :initial-breakpoint="0.75"
    :breakpoints="[0, 0.5, 0.75, 1]"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <div style="display: flex; align-items: center; gap: 8px;">
            <ion-icon :icon="notificationsOutline" />
            Notifications
            <ion-badge v-if="unreadCount > 0" color="danger">
              {{ unreadCount }}
            </ion-badge>
          </div>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button @click="clearAll" fill="clear" color="medium">
            <ion-icon :icon="trashOutline" slot="start" />
            Tout effacer
          </ion-button>
          <ion-button @click="$emit('dismiss')">
            Fermer
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <ion-spinner name="dots" />
        <p>Chargement des notifications...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="notifications.length === 0" class="notifications-empty">
        <ion-icon :icon="notificationsOffOutline" class="notifications-empty-icon" />
        <p class="notifications-empty-text">Aucune notification</p>
        
        <!-- Bouton pour activer les notifications -->
        <div v-if="notificationPermission !== 'granted'" class="permission-prompt">
          <ion-button 
            @click="requestPermission" 
            :disabled="isLoading"
            fill="outline" 
            color="primary"
            class="permission-button"
          >
            <ion-icon :icon="notificationsOutline" slot="start" />
            {{ isLoading ? 'Demande en cours...' : 'Activer les notifications' }}
          </ion-button>
          <p class="permission-text">
            Activez les notifications pour recevoir des alertes importantes sur les signalements et mises à jour.
          </p>
        </div>
      </div>

      <!-- Notifications List -->
      <div v-else class="notifications-list" :key="notifications.length">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          :class="['notification-item', { 'unread': !notification.read }]"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-header">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
          </div>
          
          <div class="notification-body">{{ notification.body }}</div>
          
          <div class="notification-actions">
            <button 
              v-if="!notification.read"
              @click.stop="markAsRead(notification.id)"
              class="notification-action-btn mark-read"
            >
              Marquer comme lu
            </button>
            <button 
              @click.stop="removeNotification(notification.id)"
              class="notification-action-btn delete"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup>
import { computed, watch } from 'vue';
import { 
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonSpinner, IonIcon, IonBadge
} from '@ionic/vue';
import { 
  notificationsOutline, notificationsOffOutline, trashOutline 
} from 'ionicons/icons';
import { useNotifications } from '@/composables/useNotifications';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['dismiss'])

// Importer le composable de notifications
const { 
  notifications, 
  isLoading, 
  unreadCount, 
  notificationPermission,
  requestPermission, 
  markAsRead, 
  removeNotification, 
  clearAllNotifications 
} = useNotifications()

// Formater l'heure de notification
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) {
    return 'À l\'instant'
  } else if (diffMins < 60) {
    return `Il y a ${diffMins} min`
  } else if (diffHours < 24) {
    return `Il y a ${diffHours}h`
  } else if (diffDays < 7) {
    return `Il y a ${diffDays}j`
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

// Vider toutes les notifications
const clearAll = () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
    clearAllNotifications()
  }
}

// Watcher pour forcer la mise à jour du modal
watch(() => notifications.value.length, (newLength, oldLength) => {
  console.log('🔄 NotificationsModal: Nombre de notifications changé de', oldLength, 'à', newLength)
}, { immediate: true })
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 16px;
}

.notifications-list {
  max-height: 100%;
  overflow-y: auto;
}

.notification-item {
  position: relative;
  padding: 16px;
  border-bottom: 1px solid var(--ion-color-light);
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-item:hover {
  background: var(--ion-color-light);
}

.notification-item.unread {
  background: #eff6ff;
  border-left: 4px solid var(--ion-color-primary);
}

.notification-item.unread::before {
  content: '';
  position: absolute;
  top: 16px;
  left: 8px;
  width: 8px;
  height: 8px;
  background: var(--ion-color-primary);
  border-radius: 50%;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notification-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--ion-color-dark);
  flex: 1;
}

.notification-time {
  font-size: 12px;
  color: var(--ion-color-medium);
}

.notification-body {
  font-size: 13px;
  color: var(--ion-color-medium);
  line-height: 1.4;
  margin-bottom: 12px;
}

.notification-actions {
  display: flex;
  gap: 8px;
}

.notification-action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-action-btn.mark-read {
  background: var(--ion-color-primary);
  color: white;
}

.notification-action-btn.mark-read:hover {
  opacity: 0.8;
}

.notification-action-btn.delete {
  background: var(--ion-color-danger);
  color: white;
}

.notification-action-btn.delete:hover {
  opacity: 0.8;
}

/* Permission Prompt Styles */
.permission-prompt {
  text-align: center;
  padding: 20px;
  margin-top: 20px;
}

.permission-button {
  margin: 16px 0;
  min-height: 44px;
}

.permission-text {
  font-size: 13px;
  color: var(--ion-color-medium);
  line-height: 1.4;
  margin: 12px 0 0 0;
  max-width: 280px;
  margin-left: auto;
  margin-right: auto;
}
</style>
