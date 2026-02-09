import { createApp } from 'vue';
import { IonicVue } from '@ionic/vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import App from './App.vue';
import router from './router';

// Importation des styles Ionic
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';
import './styles/notifications.css';

// Enregistrer le Service Worker pour les notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('✅ Service Worker enregistré:', registration);
      })
      .catch((error) => {
        console.error('❌ Erreur enregistrement Service Worker:', error);
      });
  });
}

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App)
  .use(IonicVue, {
    mode: 'md' // Material Design pour Android
  })
  .use(router)
  .use(pinia);

router.isReady().then(() => {
  app.mount('#app');
});