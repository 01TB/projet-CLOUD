import { createRouter, createWebHistory } from '@ionic/vue-router';
import { useAuthStore } from '@/store/modules/auth';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/map',
    name: 'Map',
    component: () => import('@/views/Map.vue'),
    meta: { requiresAuth: false } // Accessible aux visiteurs
  },
  {
    path: '/signalement/create',
    name: 'SignalementCreate',
    component: () => import('@/views/SignalementCreate.vue'),
    meta: { requiresAuth: true } // Tous les utilisateurs connectés
  },
  {
    path: '/signalements',
    name: 'SignalementList',
    component: () => import('@/views/SignalementList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/signalement/:id',
    name: 'SignalementDetail',
    component: () => import('@/views/SignalementDetail.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('@/views/Stats.vue'),
    meta: { requiresAuth: false }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Garde de navigation
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Vérifier l'authentification si nécessaire
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
    return;
  }
  
  // Vérifier le rôle si spécifié
  if (to.meta.role && authStore.user?.role !== to.meta.role) {
    if (to.meta.role === 2 && authStore.user?.role === 1) {
      // Les managers peuvent accéder aux pages utilisateurs
      next();
    } else {
      next('/map'); // Redirection vers la carte
    }
    return;
  }
  
  next();
});

export default router;