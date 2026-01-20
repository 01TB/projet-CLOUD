<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup>
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { useAuthStore } from '@/store/modules/auth';

const authStore = useAuthStore();

onMounted(async () => {
  // Vérifier l'authentification au démarrage
  await authStore.checkAuth();
});
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
</style>