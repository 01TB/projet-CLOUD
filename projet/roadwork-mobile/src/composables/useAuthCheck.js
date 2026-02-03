import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/modules/auth';

export function useAuthCheck() {
  const router = useRouter();
  const authStore = useAuthStore();

  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const user = computed(() => authStore.user);

  const checkAuthAndRedirect = () => {
    // Si personne n'est connecté, rediriger vers login
    if (!isAuthenticated.value) {
      const currentRoute = router.currentRoute.value;
      const publicRoutes = ['/login', '/register', '/'];
      
      if (!publicRoutes.includes(currentRoute.path)) {
        console.log('Utilisateur non connecté, redirection vers login');
        router.push('/login');
        return false;
      }
    }
    return true;
  };

  // Vérifier au montage du composant
  onMounted(() => {
    checkAuthAndRedirect();
  });

  return {
    isAuthenticated,
    user,
    checkAuthAndRedirect
  };
}
