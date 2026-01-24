import * as admin from "firebase-admin";

// Initialiser Firebase Admin
admin.initializeApp();

// ========================================
// EXPORTS - API Routes
// ========================================

// Authentification
export { register, login, logout, me, update } from "./auth";

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

// Statistiques
export { getStats } from "./stats";
