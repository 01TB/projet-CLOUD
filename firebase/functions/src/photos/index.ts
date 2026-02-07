import * as functions from "firebase-functions";
import {
  db,
  successResponse,
  errorResponse,
  extractToken,
  verifyToken,
  isBlocked,
  generateUniqueIntId,
} from "../utils/helpers";

// POST /api/signalements_photos
export const addSignalementPhoto = functions.https.onRequest(
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
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

      // Vérifier si bloqué
      if (await isBlocked(decodedToken.uid)) {
        const response = errorResponse("FORBIDDEN", "Utilisateur bloqué", 403);
        res.status(response.status).json(response.body);
        return;
      }

      const { id_signalement, photo } = req.body;

      // Validation
      if (!id_signalement || !photo) {
        const response = errorResponse(
          "VALIDATION_ERROR",
          "id_signalement et photo requis",
          400,
        );
        res.status(response.status).json(response.body);
        return;
      }

      if (typeof photo !== "string" || photo.trim() === "") {
        const response = errorResponse(
          "VALIDATION_ERROR",
          "La photo doit être une chaîne de caractères non vide (base64)",
          400,
        );
        res.status(response.status).json(response.body);
        return;
      }

      // Vérifier que le signalement existe
      const signalementSnapshot = await db
        .collection("signalements")
        .where("id", "==", Number(id_signalement))
        .get();

      if (signalementSnapshot.empty) {
        const response = errorResponse(
          "SIGNALEMENT_NOT_FOUND",
          "Signalement non trouvé",
          404,
        );
        res.status(response.status).json(response.body);
        return;
      }

      // Générer un ID numérique unique pour la photo
      const photoNumericId = await generateUniqueIntId("signalements_photos");

      // Date de création au format 'YYYY-MM-DD HH:mm:ss'
      const date = new Date();
      const formattedDate =
        date.getUTCFullYear() +
        "-" +
        String(date.getUTCMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getUTCDate()).padStart(2, "0") +
        " " +
        String(date.getUTCHours()).padStart(2, "0") +
        ":" +
        String(date.getUTCMinutes()).padStart(2, "0") +
        ":" +
        String(date.getUTCSeconds()).padStart(2, "0");

      const photoData = {
        id: photoNumericId,
        id_signalement: Number(id_signalement),
        photo: photo, // Photo encodée en base64
        date_ajout: formattedDate,
        synchro: false,
      };

      await db
        .collection("signalements_photos")
        .doc(String(photoNumericId))
        .set(photoData);

      const response = successResponse(
        {
          data: {
            id: photoNumericId,
            id_signalement: photoData.id_signalement,
            date_ajout: photoData.date_ajout,
            photo_size: photo.length, // Taille en caractères
          },
        },
        201,
      );

      res.status(response.status).json(response.body);
    } catch (error: any) {
      const response = errorResponse("INTERNAL_ERROR", error.message, 500);
      res.status(response.status).json(response.body);
    }
  },
);
