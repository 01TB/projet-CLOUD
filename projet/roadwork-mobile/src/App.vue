<template>
  <ion-app>
    <ion-menu side="start" content-id="main-content" class="main-menu">
      <ion-header>
        <ion-toolbar>
          <div class="menu-header">
            <div class="menu-logo">
              <ion-icon :icon="map" size="large"></ion-icon>
              <h2>RoadWork</h2>
            </div>
            <p class="menu-subtitle">Gestion des signalements routiers</p>
          </div>
        </ion-toolbar>
      </ion-header>
      
      <ion-content class="ion-padding">
        <!-- Navigation principale -->
        <ion-list class="nav-section">
          <ion-list-header>
            <ion-label class="section-title">Navigation</ion-label>
          </ion-list-header>
          
          <ion-item button @click="navigateTo('/map')" class="menu-item">
            <ion-icon :icon="map" slot="start" class="menu-icon"></ion-icon>
            <ion-note slot="end" color="medium">Carte</ion-note>
          </ion-item>
          
          <ion-item button @click="navigateTo('/signalements')" class="menu-item">
            <ion-icon :icon="list" slot="start" class="menu-icon"></ion-icon>
            <ion-note slot="end" color="medium">Signalements</ion-note>
          </ion-item>
          
          <ion-item button @click="navigateTo('/stats')" class="menu-item">
            <ion-icon :icon="barChart" slot="start" class="menu-icon"></ion-icon>
            <ion-note slot="end" color="medium">Statistiques</ion-note>
          </ion-item>
          
          <ion-item button @click="navigateTo('/profile')" class="menu-item" v-if="isAuthenticated">
            <ion-icon :icon="person" slot="start" class="menu-icon"></ion-icon>
            <ion-note slot="end" color="medium">Mon compte</ion-note>
          </ion-item>
        </ion-list>
        
        <!-- Séparateur -->
        <div class="menu-divider"></div>
        
        <!-- Section authentification -->
        <ion-list class="auth-section">
          <ion-list-header>
            <ion-label class="section-title">Compte</ion-label>
          </ion-list-header>
          
          <ion-item button @click="navigateTo('/login')" class="menu-item auth-item" v-if="!isAuthenticated">
            <ion-icon :icon="logIn" slot="start" class="menu-icon auth-icon"></ion-icon>
            <ion-chip slot="end" color="primary" outline>Se connecter</ion-chip>
          </ion-item>
          
          <ion-item button @click="navigateTo('/register')" class="menu-item auth-item" v-if="!isAuthenticated">
            <ion-icon :icon="personAdd" slot="start" class="menu-icon auth-icon"></ion-icon>
            <ion-chip slot="end" color="success" outline>S'inscrire</ion-chip>
          </ion-item>
          
          <ion-item button @click="logout" class="menu-item logout-item" v-if="isAuthenticated">
            <ion-icon :icon="logOut" slot="start" class="menu-icon logout-icon"></ion-icon>
            <ion-note slot="end" color="danger">Quitter</ion-note>
          </ion-item>
        </ion-list>
        
        <!-- Footer du menu -->
        <div class="menu-footer">
          <div class="user-info" v-if="isAuthenticated && authStore.user">
            <ion-avatar class="user-avatar">
              <ion-icon :icon="person"></ion-icon>
            </ion-avatar>
            <div class="user-details">
              <p class="user-name">{{ authStore.user.nom }} {{ authStore.user.prenom }}</p>
              <p class="user-role">{{ getRoleLabel(authStore.user.role) }}</p>
            </div>
          </div>
          
          <div class="app-info">
            <p class="app-version">Version 1.0.0</p>
            <p class="app-copyright"> 2026 RoadWork Mobile</p>
          </div>
        </div>
      </ion-content>
    </ion-menu>

    <ion-router-outlet id="main-content"></ion-router-outlet>
  </ion-app>
</template>

<script setup>
import { IonApp, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, 
         IonList, IonItem, IonIcon, IonLabel, IonNote, IonChip, IonAvatar,
         IonListHeader, IonRouterOutlet } from '@ionic/vue';
import { map, list, barChart, person, logIn, logOut, personAdd } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import { useAuthStore } from '@/store/modules/auth';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);

const navigateTo = async (path) => {
  console.log('Navigating to:', path);
  await router.push(path);
  
  // Fermer le menu après navigation
  const menu = document.querySelector('ion-menu');
  if (menu) {
    await menu.close();
  }
};

const logout = async () => {
  await authStore.logout();
  await router.push('/login');
  
  // Fermer le menu après déconnexion
  const menu = document.querySelector('ion-menu');
  if (menu) {
    await menu.close();
  }
};

const getRoleLabel = (role) => {
  const roles = {
    1: 'Manager',
    2: 'Utilisateur',
    3: 'Administrateur'
  };
  return roles[role] || 'Utilisateur';
};

// Vérifier l'authentification au démarrage
authStore.checkAuth();
</script>

<style>
/* Global styles */
ion-content {
  --background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
}

/* Menu container */
.main-menu {
  --width: 280px;
  --max-width: 280px;
}

/* Menu header */
.menu-header {
  padding: 1.5rem 1rem;
  text-align: center;
  background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
  color: white;
}

.menu-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.menu-logo ion-icon {
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.menu-logo h2 {
  color: white !important;
  font-weight: 700;
  font-size: 1.5rem;
  margin: 0;
  letter-spacing: -0.5px;
}

.menu-subtitle {
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 0.875rem;
  margin: 0;
  font-weight: 400;
}

/* Menu toolbar */
.main-menu ion-toolbar {
  --background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
  --color: white;
  padding: 0;
}

/* Menu content */
.main-menu ion-content {
  --background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

/* Navigation section */
.nav-section {
  background: transparent;
  padding: 0;
  margin: 1rem 0;
}

.section-title {
  color: #4a5568 !important;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

/* Menu items */
.menu-item {
  --background: rgba(255, 255, 255, 0.9);
  --border-radius: 12px;
  margin: 0.5rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  min-height: 56px;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.menu-item:hover {
  --background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
  border-color: rgba(49, 130, 206, 0.3);
}

.menu-item:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.menu-icon {
  color: #3182ce !important;
  margin-right: 1rem;
  font-size: 1.25rem;
}

.menu-item ion-label {
  color: #2d3748 !important;
  font-weight: 500;
}

.menu-item ion-note {
  color: #718096 !important;
  font-size: 0.75rem;
  font-weight: 400;
}

/* Auth items */
.auth-item {
  --background: linear-gradient(135deg, rgba(49, 130, 206, 0.05) 0%, rgba(49, 130, 206, 0.02) 100%);
  border-color: rgba(49, 130, 206, 0.2);
}

.auth-item:hover {
  --background: linear-gradient(135deg, rgba(49, 130, 206, 0.1) 0%, rgba(49, 130, 206, 0.05) 100%);
  border-color: rgba(49, 130, 206, 0.4);
}

.auth-icon {
  color: #3182ce !important;
}

.logout-item {
  --background: linear-gradient(135deg, rgba(229, 62, 62, 0.05) 0%, rgba(229, 62, 62, 0.02) 100%);
  border-color: rgba(229, 62, 62, 0.2);
}

.logout-item:hover {
  --background: linear-gradient(135deg, rgba(229, 62, 62, 0.1) 0%, rgba(229, 62, 62, 0.05) 100%);
  border-color: rgba(229, 62, 62, 0.4);
}

.logout-icon {
  color: #e53e3e !important;
}

/* Menu divider */
.menu-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(226, 232, 240, 0.8), transparent);
  margin: 1.5rem 1rem;
}

/* Auth section */
.auth-section {
  background: transparent;
  padding: 0;
  margin: 1rem 0;
}

/* Menu footer */
.menu-footer {
  padding: 1.5rem 1rem;
  margin-top: auto;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.user-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(49, 130, 206, 0.3);
}

.user-avatar ion-icon {
  color: white;
  font-size: 1.5rem;
}

.user-details {
  flex: 1;
}

.user-name {
  color: #1a202c !important;
  font-weight: 600;
  font-size: 0.875rem;
  margin: 0 0 0.25rem 0;
}

.user-role {
  color: #4a5568 !important;
  font-size: 0.75rem;
  margin: 0;
  font-weight: 500;
}

.app-info {
  text-align: center;
}

.app-version {
  color: #718096 !important;
  font-size: 0.75rem;
  margin: 0 0 0.25rem 0;
  font-weight: 400;
}

.app-copyright {
  color: #a0aec0 !important;
  font-size: 0.7rem;
  margin: 0;
  font-weight: 400;
}

/* Chips */
ion-chip {
  --background: rgba(255, 255, 255, 0.9);
  --color: #3182ce;
  font-size: 0.7rem;
  font-weight: 500;
  border-radius: 16px;
  height: 24px;
}

ion-chip[color="primary"] {
  --color: #3182ce;
  --border-color: #3182ce;
}

ion-chip[color="success"] {
  --color: #38a169;
  --border-color: #38a169;
}

/* Lists */
ion-list {
  background: transparent;
  padding: 0;
}

ion-list-header {
  padding: 1rem 1rem 0.5rem;
  min-height: auto;
}

ion-list-header ion-label {
  color: #4a5568 !important;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive */
@media (max-width: 768px) {
  .main-menu {
    --width: 260px;
    --max-width: 260px;
  }
  
  .menu-header {
    padding: 1rem 0.75rem;
  }
  
  .menu-logo h2 {
    font-size: 1.3rem;
  }
  
  .menu-item {
    margin: 0.5rem 0.75rem;
  }
  
  .menu-footer {
    padding: 1rem 0.75rem;
  }
}

@media (max-width: 480px) {
  .main-menu {
    --width: 240px;
    --max-width: 240px;
  }
  
  .menu-header {
    padding: 0.75rem 0.5rem;
  }
  
  .menu-logo {
    gap: 0.5rem;
  }
  
  .menu-logo h2 {
    font-size: 1.2rem;
  }
  
  .menu-subtitle {
    font-size: 0.8rem;
  }
  
  .menu-item {
    margin: 0.5rem;
    min-height: 48px;
  }
  
  .menu-icon {
    font-size: 1.1rem;
    margin-right: 0.75rem;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
  }
  
  .user-avatar ion-icon {
    font-size: 1.2rem;
  }
  
  .user-name {
    font-size: 0.8rem;
  }
  
  .user-role {
    font-size: 0.7rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  ion-content {
    --background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }
  
  .main-menu ion-content {
    --background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  }
  
  .menu-item {
    --background: rgba(45, 55, 72, 0.9);
    border-color: rgba(74, 85, 104, 0.8);
  }
  
  .menu-item:hover {
    --background: rgba(45, 55, 72, 1);
    border-color: rgba(49, 130, 206, 0.4);
  }
  
  .menu-item ion-label {
    color: #f7fafc !important;
  }
  
  .menu-item ion-note {
    color: #cbd5e0 !important;
  }
  
  .section-title {
    color: #cbd5e0 !important;
  }
  
  .menu-divider {
    background: linear-gradient(90deg, transparent, rgba(74, 85, 104, 0.8), transparent);
  }
  
  .user-info {
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
    border-color: rgba(74, 85, 104, 0.8);
  }
  
  .user-name {
    color: #f7fafc !important;
  }
  
  .user-role {
    color: #cbd5e0 !important;
  }
  
  .menu-footer {
    border-top-color: rgba(74, 85, 104, 0.8);
  }
}

/* Animation improvements */
.menu-item {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Focus states */
.menu-item:focus {
  --box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
}

/* Legacy styles */
.map-container {
  width: 100%;
  height: 100%;
}
</style>