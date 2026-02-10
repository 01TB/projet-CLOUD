import * as admin from "firebase-admin";

// Initialiser Firebase Admin
admin.initializeApp();

// ========================================
// EXPORTS - API Routes
// ========================================

// Authentification
export { register, login, logout, me, update } from "./auth";

// Token FCM
export { updateFcmToken, deleteFcmToken } from "./utilisateurs/updateFcmToken";

// Trigger: Synchronisation utilisateur → Firebase Auth
export { syncUserToAuth } from "./auth/syncUserToAuth";

// Trigger: Notification push sur avancement de signalement
export { notifyUserOnAvancement } from "./signalements/notifyUserOnAvancement";

// Signalements
export {
  getSignalements,
  createSignalement,
  getSignalement,
  updateSignalement,
  deleteSignalement,
} from "./signalements";

// Statuts
export { getStatuts } from "./statuts";

// Entreprises
export { getEntreprises } from "./entreprises";

// Statistiques
export { getStats } from "./stats";

// Photos de signalements
export { addSignalementPhoto } from "./photos";

// Synchronisation
export { syncToBackend } from "./sync";
