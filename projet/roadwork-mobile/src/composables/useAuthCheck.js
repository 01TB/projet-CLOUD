import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/modules/auth';

export function useAuthCheck() {
  const router = useRouter();
  const authStore = useAuthStore();

  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const user = computed(() => authStore.user);

  const checkAuthAndRedirect = () => {
    const currentRoute = router.currentRoute.value;
    const publicRoutes = ['/login', '/register', '/'];
    
    // Si personne n'est connecté ET n'est pas en mode visiteur, rediriger vers login
    // SAUF si on est déjà sur une page publique
    if (!isAuthenticated.value && !authStore.isVisitor && !publicRoutes.includes(currentRoute.path)) {
      console.log('Utilisateur non connecté et non visiteur, redirection vers login');
      router.push('/login');
      return false;
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
