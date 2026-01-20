<template>
  <ion-app>
    <ion-menu side="start" content-id="main-content">
      <ion-header>
        <ion-toolbar>
          <ion-title>Menu</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-list>
          <ion-item button @click="navigateTo('/map')">
            <ion-icon :icon="map" slot="start"></ion-icon>
            <ion-label>Carte</ion-label>
          </ion-item>
          
          <ion-item button @click="navigateTo('/signalements')">
            <ion-icon :icon="list" slot="start"></ion-icon>
            <ion-label>Signalements</ion-label>
          </ion-item>
          
          <ion-item button @click="navigateTo('/stats')">
            <ion-icon :icon="barChart" slot="start"></ion-icon>
            <ion-label>Statistiques</ion-label>
          </ion-item>
          
          <ion-item button @click="navigateTo('/profile')">
            <ion-icon :icon="person" slot="start"></ion-icon>
            <ion-label>Profil</ion-label>
          </ion-item>
          
          <hr style="margin: 16px 0; border: 1px solid #e0e0e0;">
          
          <ion-item button @click="navigateTo('/login')" v-if="!isAuthenticated">
            <ion-icon :icon="logIn" slot="start"></ion-icon>
            <ion-label>Connexion</ion-label>
          </ion-item>
          
          <ion-item button @click="navigateTo('/register')" v-if="!isAuthenticated">
            <ion-icon :icon="personAdd" slot="start"></ion-icon>
            <ion-label>Inscription</ion-label>
          </ion-item>
          
          <ion-item button @click="logout" v-if="isAuthenticated">
            <ion-icon :icon="logOut" slot="start"></ion-icon>
            <ion-label>Déconnexion</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>

    <ion-router-outlet id="main-content"></ion-router-outlet>
  </ion-app>
</template>

<script setup>
import { IonApp, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, 
         IonList, IonItem, IonIcon, IonLabel, 
         IonRouterOutlet } from '@ionic/vue';
import { map, list, barChart, person, logIn, logOut, personAdd } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import { useAuthStore } from '@/store/modules/auth';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);

const navigateTo = (path) => {
  router.push(path);
};

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};

// Vérifier l'authentification au démarrage
authStore.checkAuth();
</script>

<style>
/* Styles globaux */
ion-content {
  --background: #f5f5f5;
}

ion-toolbar {
  --background: #2c3e50;
  --color: white;
}

.map-container {
  width: 100%;
  height: 100%;
}

/* Styles pour le menu */
ion-menu ion-content {
  --background: #ffffff;
}

ion-menu ion-item {
  --background: transparent;
  --color: #2c3e50;
}

ion-menu ion-item:hover {
  --background: #f0f0f0;
}
</style>