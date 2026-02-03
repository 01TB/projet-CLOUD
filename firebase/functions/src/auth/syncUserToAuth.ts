import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

/**
 * Trigger Firestore : Synchronisation utilisateur → Firebase Authentication
 *
 * Ce trigger s'exécute automatiquement lorsqu'un nouveau document est créé
 * dans la collection "utilisateurs" et crée l'utilisateur correspondant
 * dans Firebase Authentication.
 */
export const syncUserToAuth = functions.firestore
  .document("utilisateurs/{userId}")
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    const userId = context.params.userId;

    try {
      // Vérifier que les champs nécessaires sont présents
      if (!userData.email || !userData.password) {
        console.error(
          `❌ Utilisateur ${userId}: email ou password manquant`,
          userData,
        );
        return;
      }

      // Construire le displayName à partir de nom et prenom
      let displayName = userData.email;

      // Créer l'utilisateur dans Firebase Authentication
      const userRecord = await admin.auth().createUser({
        uid: userId, // Utiliser l'ID du document Firestore comme UID Firebase Auth
        email: userData.email,
        password: userData.password, // ⚠️ En production, ne jamais stocker le password en clair
        displayName: displayName
      });

      console.log(
        `✅ Utilisateur créé dans Firebase Auth: ${userRecord.uid} (${userRecord.email})`,
      );

      // Optionnel: Mettre à jour le document Firestore avec l'UID Firebase Auth
      // (déjà fait car on utilise le même ID)
      await snap.ref.update({
        firebase_auth_synced: true,
        firebase_auth_uid: userRecord.uid,
        date_sync_auth: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(
        `✅ Document Firestore mis à jour avec firebase_auth_synced = true`,
      );
    } catch (error: any) {
      console.error(
        `❌ Erreur lors de la synchronisation de l'utilisateur ${userId}:`,
        error,
      );

      // Gérer les erreurs spécifiques
      if (error.code === "auth/email-already-exists") {
        console.error(
          `⚠️  Email ${userData.email} déjà existant dans Firebase Auth`,
        );
        // Marquer comme erreur dans Firestore
        await snap.ref.update({
          firebase_auth_synced: false,
          firebase_auth_error: "EMAIL_ALREADY_EXISTS",
          date_sync_auth: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else if (error.code === "auth/invalid-email") {
        console.error(`⚠️  Email ${userData.email} invalide`);
        await snap.ref.update({
          firebase_auth_synced: false,
          firebase_auth_error: "INVALID_EMAIL",
          date_sync_auth: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else if (error.code === "auth/uid-already-exists") {
        console.error(
          `⚠️  UID ${userId} déjà existant dans Firebase Auth (utilisateur déjà créé)`,
        );
        // L'utilisateur existe déjà, on peut le marquer comme synchronisé
        await snap.ref.update({
          firebase_auth_synced: true,
          firebase_auth_uid: userId,
          date_sync_auth: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        // Erreur générique
        await snap.ref.update({
          firebase_auth_synced: false,
          firebase_auth_error: error.message || "UNKNOWN_ERROR",
          date_sync_auth: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  });
