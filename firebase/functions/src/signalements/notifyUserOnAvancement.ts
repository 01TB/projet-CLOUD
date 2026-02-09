import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

/**
 * Trigger Firestore : Notification PUSH sur nouvel avancement
 *
 * Ce trigger s'exécute automatiquement lorsqu'un nouveau document est créé
 * dans la collection "avancements_signalement" et envoie une notification push
 * à l'utilisateur concerné.
 */
export const notifyUserOnAvancement = functions.firestore
  .document("avancements_signalement/{avancementId}")
  .onCreate(async (snap, context) => {
    const avancementData = snap.data();
    const avancementId = context.params.avancementId;
    const idUtilisateur = avancementData.id_utilisateur; // ID numérique de l'utilisateur

    try {
      // Vérifier que les champs nécessaires sont présents
      if (!idUtilisateur) {
        console.error(
          `❌ Avancement ${avancementId}: id_utilisateur manquant`,
          avancementData,
        );
        return;
      }

      // Récupérer l'utilisateur dans Firestore avec l'ID numérique
      const utilisateurSnapshot = await admin
        .firestore()
        .collection("utilisateurs")
        .where("id", "==", Number(idUtilisateur))
        .limit(1)
        .get();

      if (utilisateurSnapshot.empty) {
        console.error(
          `❌ Utilisateur avec id ${idUtilisateur} non trouvé dans Firestore`,
        );
        return;
      }

      const utilisateurDoc = utilisateurSnapshot.docs[0];
      const utilisateurData = utilisateurDoc.data();
      const firebaseAuthUid =
        utilisateurData.firebase_auth_uid || utilisateurData.id.toString();

      // Récupérer le token FCM de l'utilisateur
      // Le token FCM est généralement stocké dans le document utilisateur
      const fcmToken = utilisateurData.fcm_token;

      if (!fcmToken) {
        console.warn(
          `⚠️  Utilisateur ${idUtilisateur} n'a pas de token FCM enregistré`,
        );
        return;
      }

      // Récupérer les informations du signalement
      const idSignalement = avancementData.id_signalement;
      const signalementSnapshot = await admin
        .firestore()
        .collection("signalements")
        .where("id", "==", Number(idSignalement))
        .limit(1)
        .get();

      let signalementInfo = "";
      if (!signalementSnapshot.empty) {
        const signalementData = signalementSnapshot.docs[0].data();
        signalementInfo = signalementData.description
          ? ` - ${signalementData.description.substring(0, 50)}`
          : "";
      }

      // Récupérer le nom du statut d'avancement
      const idStatutAvancement = avancementData.id_statut_avancement;
      const statutSnapshot = await admin
        .firestore()
        .collection("statuts_avancement")
        .where("id", "==", Number(idStatutAvancement))
        .limit(1)
        .get();

      let statutNom = "mis à jour";
      if (!statutSnapshot.empty) {
        const statutData = statutSnapshot.docs[0].data();
        statutNom = statutData.nom || "mis à jour";
      }

      // Construire le message de notification
      const message = {
        token: fcmToken,
        notification: {
          title: "Nouvel avancement de signalement",
          body: `Votre signalement a été ${statutNom}${signalementInfo}`,
        },
        data: {
          type: "avancement_signalement",
          id_signalement: idSignalement.toString(),
          id_avancement: avancementId,
          id_statut_avancement: idStatutAvancement.toString(),
        },
        android: {
          priority: "high" as const,
          notification: {
            sound: "default",
            clickAction: "FLUTTER_NOTIFICATION_CLICK",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
      };

      // Envoyer la notification
      const response = await admin.messaging().send(message);

      console.log(
        `✅ Notification envoyée avec succès à l'utilisateur ${idUtilisateur} (${firebaseAuthUid}): ${response}`,
      );

      // Optionnel : Enregistrer la notification dans une collection
      await admin
        .firestore()
        .collection("notifications")
        .add({
          id_utilisateur: idUtilisateur,
          firebase_auth_uid: firebaseAuthUid,
          type: "avancement_signalement",
          id_signalement: idSignalement,
          id_avancement: snap.id,
          titre: "Nouvel avancement de signalement",
          message: `Votre signalement a été ${statutNom}${signalementInfo}`,
          date_envoi: admin.firestore.FieldValue.serverTimestamp(),
          lu: false,
        });

      console.log(
        `✅ Notification enregistrée dans la collection "notifications"`,
      );
    } catch (error: any) {
      console.error(
        `❌ Erreur lors de l'envoi de la notification pour l'avancement ${avancementId}:`,
        error,
      );

      // Gérer les erreurs spécifiques FCM
      if (error.code === "messaging/invalid-registration-token") {
        console.error(
          `⚠️  Token FCM invalide pour l'utilisateur ${idUtilisateur}`,
        );
        // Optionnel : Supprimer le token invalide du document utilisateur
        const utilisateurSnapshot = await admin
          .firestore()
          .collection("utilisateurs")
          .where("id", "==", Number(idUtilisateur))
          .limit(1)
          .get();

        if (!utilisateurSnapshot.empty) {
          await utilisateurSnapshot.docs[0].ref.update({
            fcm_token: admin.firestore.FieldValue.delete(),
          });
          console.log(
            `✅ Token FCM invalide supprimé pour l'utilisateur ${idUtilisateur}`,
          );
        }
      } else if (error.code === "messaging/registration-token-not-registered") {
        console.error(
          `⚠️  Token FCM non enregistré pour l'utilisateur ${idUtilisateur}`,
        );
      } else {
        console.error(`⚠️  Erreur générique:`, error.message);
      }
    }
  });
