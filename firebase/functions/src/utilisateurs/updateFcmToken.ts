import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {
  db,
  successResponse,
  errorResponse,
  extractToken,
  verifyToken,
  getUserInfo,
} from "../utils/helpers";

/**
 * PUT /api/utilisateurs/fcm-token
 * Mettre à jour le token FCM de l'utilisateur connecté
 */
export const updateFcmToken = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "PUT, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "PUT") {
    const response = errorResponse(
      "METHOD_NOT_ALLOWED",
      "Méthode non autorisée",
      405,
    );
    res.status(response.status).json(response.body);
    return;
  }

  try {
    const token = extractToken(req);

    if (!token) {
      const response = errorResponse("AUTH_REQUIRED", "Token requis", 401);
      res.status(response.status).json(response.body);
      return;
    }

    const decodedToken = await verifyToken(token);

    if (!decodedToken) {
      const response = errorResponse("UNAUTHORIZED", "Token invalide", 401);
      res.status(response.status).json(response.body);
      return;
    }

    const { fcm_token } = req.body;

    if (!fcm_token) {
      const response = errorResponse(
        "VALIDATION_ERROR",
        "Le token FCM est requis",
        400,
      );
      res.status(response.status).json(response.body);
      return;
    }

    const userInfo = await getUserInfo(decodedToken.uid);

    if (!userInfo || !userInfo.id) {
      const response = errorResponse(
        "USER_NOT_FOUND",
        "Utilisateur non trouvé",
        404,
      );
      res.status(response.status).json(response.body);
      return;
    }

    // Récupérer le document utilisateur
    const utilisateurSnapshot = await db
      .collection("utilisateurs")
      .where("id", "==", userInfo.id)
      .limit(1)
      .get();

    if (utilisateurSnapshot.empty) {
      const response = errorResponse(
        "USER_NOT_FOUND",
        "Document utilisateur non trouvé",
        404,
      );
      res.status(response.status).json(response.body);
      return;
    }

    // Mettre à jour le token FCM dans la collection dédiée
    // ✅ Utilisation d'une collection séparée pour éviter les conflits avec la synchronisation PostgreSQL
    const fcmTokenRef = db
      .collection("utilisateurs_fcm_tokens")
      .doc(userInfo.id.toString());

    await fcmTokenRef.set(
      {
        id_utilisateur: userInfo.id,
        fcm_token: fcm_token,
        fcm_token_updated_at: admin.firestore.FieldValue.serverTimestamp(),
        last_updated: new Date().toISOString(),
      },
      { merge: true },
    );

    console.log(
      `✅ Token FCM mis à jour pour l'utilisateur ${userInfo.id} dans utilisateurs_fcm_tokens`,
    );

    const response = successResponse({
      message: "Token FCM enregistré avec succès",
      data: {
        id: userInfo.id,
        fcm_token_registered: true,
      },
    });

    res.status(response.status).json(response.body);
  } catch (error: any) {
    console.error("❌ Erreur mise à jour token FCM:", error);
    const response = errorResponse("INTERNAL_ERROR", error.message, 500);
    res.status(response.status).json(response.body);
  }
});

/**
 * DELETE /api/utilisateurs/fcm-token
 * Supprimer le token FCM de l'utilisateur (déconnexion)
 */
export const deleteFcmToken = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "DELETE") {
    const response = errorResponse(
      "METHOD_NOT_ALLOWED",
      "Méthode non autorisée",
      405,
    );
    res.status(response.status).json(response.body);
    return;
  }

  try {
    const token = extractToken(req);

    if (!token) {
      const response = errorResponse("AUTH_REQUIRED", "Token requis", 401);
      res.status(response.status).json(response.body);
      return;
    }

    const decodedToken = await verifyToken(token);

    if (!decodedToken) {
      const response = errorResponse("UNAUTHORIZED", "Token invalide", 401);
      res.status(response.status).json(response.body);
      return;
    }

    const userInfo = await getUserInfo(decodedToken.uid);

    if (!userInfo || !userInfo.id) {
      const response = errorResponse(
        "USER_NOT_FOUND",
        "Utilisateur non trouvé",
        404,
      );
      res.status(response.status).json(response.body);
      return;
    }

    // Récupérer le document utilisateur
    const utilisateurSnapshot = await db
      .collection("utilisateurs")
      .where("id", "==", userInfo.id)
      .limit(1)
      .get();

    if (utilisateurSnapshot.empty) {
      const response = errorResponse(
        "USER_NOT_FOUND",
        "Document utilisateur non trouvé",
        404,
      );
      res.status(response.status).json(response.body);
      return;
    }

    // Supprimer le token FCM de la collection dédiée
    const fcmTokenRef = db
      .collection("utilisateurs_fcm_tokens")
      .doc(userInfo.id.toString());

    await fcmTokenRef.delete();

    console.log(
      `✅ Token FCM supprimé pour l'utilisateur ${userInfo.id} de utilisateurs_fcm_tokens`,
    );

    const response = successResponse({
      message: "Token FCM supprimé avec succès",
    });

    res.status(response.status).json(response.body);
  } catch (error: any) {
    console.error("❌ Erreur suppression token FCM:", error);
    const response = errorResponse("INTERNAL_ERROR", error.message, 500);
    res.status(response.status).json(response.body);
  }
});
