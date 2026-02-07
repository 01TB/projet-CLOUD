import * as admin from "firebase-admin";

// Initialiser Firebase Admin
admin.initializeApp();

// ========================================
// EXPORTS - API Routes
// ========================================

// Authentification
export { register, login, logout, me, update } from "./auth";

// Trigger: Synchronisation utilisateur → Firebase Auth
export { syncUserToAuth } from "./auth/syncUserToAuth";

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
