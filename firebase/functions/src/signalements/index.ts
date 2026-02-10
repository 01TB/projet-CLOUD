import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {
  db,
  isManager,
  isBlocked,
  successResponse,
  errorResponse,
  extractToken,
  verifyToken,
  generateUniqueIntId,
  getUserInfo,
} from "../utils/helpers";

// GET /api/signalements
export const getSignalements = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "GET") {
    const response = errorResponse(
      "METHOD_NOT_ALLOWED",
      "Méthode non autorisée",
      405,
    );
    res.status(response.status).json(response.body);
    return;
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const id_utilisateur_createur = req.query.id_utilisateur_createur as string;

    let query = db.collection("signalements").orderBy("date_creation", "desc");

    if (id_utilisateur_createur) {
      query = query.where(
        "id_utilisateur_createur",
        "==",
        Number(id_utilisateur_createur),
      ) as any;
    }

    const snapshot = await query.get();
    const total = snapshot.size;
    const totalPages = Math.ceil(total / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const signalements = await Promise.all(
      snapshot.docs.slice(startIndex, endIndex).map(async (doc) => {
        const data = doc.data();

        // Récupérer les avancements
        const avancementsSnapshot = await db
          .collection("avancements_signalement")
          .where("id_signalement", "==", data.id)
          .orderBy("date_modification", "desc")
          .get();

        const avancements = await Promise.all(
          avancementsSnapshot.docs.map(async (avDoc) => {
            const avData = avDoc.data();
            const statutDoc = await db
              .collection("statuts_avancement")
              .where("id", "==", avData.id_statut_avancement)
              .get();

            const utilisateurDoc = await db
              .collection("utilisateurs")
              .where("id", "==", avData.id_utilisateur)
              .get();

            return {
              id: avDoc.id,
              statut_avancement: {
                id: statutDoc.docs[0].id,
                nom: statutDoc.docs[0].data()?.nom,
              },
              utilisateur: {
                id: utilisateurDoc.docs[0].id,
                email: utilisateurDoc.docs[0].data()?.email || "",
              },
              date_creation: avData.date_modification,
              commentaire: avData.commentaire || "",
            };
          }),
        );

        const entrepriseSnapshot = await db
          .collection("entreprises")
          .where("id", "==", data.id_entreprise)
          .limit(1)
          .get();

        const photosSnapshot = await db
          .collection("signalements_photos")
          .where("id_signalement", "==", data.id)
          .get();

        const photos = await Promise.all(
          photosSnapshot.docs.map(async (photoDoc) => {
            const photoData = photoDoc.data();
            return {
              id: photoData.id,
              date_ajout: photoData.date_ajout || "",
              photo: photoData.photo, // Taille en caractères
            };
          }),
        );

        return {
          id: doc.id,
          description: data.description || "",
          surface: data.surface,
          budget: data.budget,
          adresse: data.adresse || "",
          localisation: {
            type: "Point",
            coordinates: [
              data.localisation.longitude,
              data.localisation.latitude,
            ],
          },
          id_entreprise: data.id_entreprise,
          nom_entreprise: entrepriseSnapshot.docs[0].data().nom || "",
          date_creation: data.date_creation,
          date_modification:
            data.date_modification ||
            data.date_creation,
          id_utilisateur_createur: data.id_utilisateur_createur,
          photos: photos,
          avancement_signalements: avancements,
        };
      }),
    );

    const response = successResponse({
      data: signalements,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });

    res.status(response.status).json(response.body);
  } catch (error: any) {
    const response = errorResponse("INTERNAL_ERROR", error.message, 500);
    res.status(response.status).json(response.body);
  }
});

// POST /api/signalements
export const createSignalement = functions.https.onRequest(async (req, res) => {
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

    const {
      description,
      surface,
      adresse,
      localisation,
    } = req.body;

    // Validation
    if (!surface || !localisation) {
      const response = errorResponse(
        "VALIDATION_ERROR",
        "Surface et localisation requis",
        400,
      );
      res.status(response.status).json(response.body);
      return;
    }

    if (surface <= 0) {
      const response = errorResponse(
        "VALIDATION_ERROR",
        "Surface doit être supérieur à 0",
        400,
      );
      res.status(response.status).json(response.body);
      return;
    }

    // Récupérer une entreprise par défaut si non fournie
    // let entrepriseId = id_entreprise;
    // if (!entrepriseId) {
    //   const entreprisesSnapshot = await db
    //     .collection("entreprises")
    //     .limit(1)
    //     .get();
    //   if (!entreprisesSnapshot.empty) {
    //     entrepriseId = entreprisesSnapshot.docs[0].data()?.id;
    //   }
    // }

    const userInfo = await getUserInfo(decodedToken.uid);

    if (!userInfo) {
      const response = errorResponse(
        "USER_NOT_FOUND",
        "Utilisateur non trouvé avec UID : " + decodedToken.uid,
        404,
      );
      res.status(response.status).json(response.body);
      return;
    }

    if (!userInfo.id) {
      const response = errorResponse(
        "INTERNAL_ERROR",
        "L'utilisateur n'a pas d'ID numérique. Veuillez vous réinscrire.",
        500,
      );
      res.status(response.status).json(response.body);
      return;
    }

    const userId = userInfo.id;

    const signalementNumericId = await generateUniqueIntId("signalements");

    // Date de création au format 'YYYY-MM-DD HH:mm:ss'
    const date = new Date();
    const formattedDate = date.getUTCFullYear() + '-' +
      String(date.getUTCMonth() + 1).padStart(2, '0') + '-' +
      String(date.getUTCDate()).padStart(2, '0') + ' ' +
      String(date.getUTCHours()).padStart(2, '0') + ':' +
      String(date.getUTCMinutes()).padStart(2, '0') + ':' +
      String(date.getUTCSeconds()).padStart(2, '0');


    const signalementData = {
      id: signalementNumericId,
      description: description || "",
      surface,
      budget: null,
      adresse: adresse || "",
      localisation: new admin.firestore.GeoPoint(
        localisation.coordinates[1], // latitude
        localisation.coordinates[0], // longitude
      ),
      date_creation: formattedDate,
      date_modification: formattedDate,
      id_utilisateur_createur: userId,
      id_entreprise: null,
      synchro: false,
    };

    const avancementNumericId = await generateUniqueIntId(
      "avancements_signalement",
    );

    const avancementData = {
      date_modification: formattedDate,
      id: avancementNumericId,
      id_signalement: signalementData.id,
      id_statut_avancement: 1, // "Nouveau"
      id_utilisateur: userId,
      last_modified: new Date().toISOString(),
      synchro: false,
    };

    await db
      .collection("signalements")
      .doc(String(signalementNumericId))
      .set(signalementData);

    await db
      .collection("avancements_signalement")
      .doc(String(avancementNumericId))
      .set(avancementData);

    const response = successResponse(
      {
        data: {
          id: signalementNumericId,
          description: signalementData.description,
          surface: signalementData.surface,
          adresse: signalementData.adresse,
          localisation: {
            type: "Point",
            coordinates: localisation.coordinates,
          },
          date_creation: signalementData.date_creation,
          id_utilisateur_createur: signalementData.id_utilisateur_createur,
          avancement_signalements: {
            id: signalementNumericId,
            id_statut_avancement: avancementData.id_statut_avancement,
            date_modification: avancementData.date_modification,
          },
        },
      },
      201,
    );

    res.status(response.status).json(response.body);
  } catch (error: any) {
    const response = errorResponse("INTERNAL_ERROR", error.message, 500);
    res.status(response.status).json(response.body);
  }
});

// GET /api/signalements/:id
export const getSignalement = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "GET") {
    const response = errorResponse(
      "METHOD_NOT_ALLOWED",
      "Méthode non autorisée",
      405,
    );
    res.status(response.status).json(response.body);
    return;
  }

  try {
    const id = req.path.split("/").pop();

    if (!id) {
      const response = errorResponse("VALIDATION_ERROR", "ID requis", 400);
      res.status(response.status).json(response.body);
      return;
    }

    const doc = await db.collection("signalements").doc(id).get();

    if (!doc.exists) {
      const response = errorResponse(
        "SIGNALEMENT_NOT_FOUND",
        "Signalement non trouvé",
        404,
      );
      res.status(response.status).json(response.body);
      return;
    }

    const data = doc.data();

    if (!data) {
      const response = errorResponse(
        "SIGNALEMENT_NOT_FOUND",
        "Signalement non trouvé",
        404,
      );
      res.status(response.status).json(response.body);
      return;
    }

    // Récupérer les avancements
    const avancementsSnapshot = await db
      .collection("avancements_signalement")
      .where("id_signalement", "==", data.id)
      .orderBy("date_modification", "desc")
      .get();

    const avancements = await Promise.all(
      avancementsSnapshot.docs.map(async (avDoc) => {
        const avData = avDoc.data();
        const statutDoc = await db
          .collection("statuts_avancement")
          .where("id", "==", avData.id_statut_avancement)
          .get();

        const utilisateurDoc = await db
          .collection("utilisateurs")
          .where("id", "==", avData.id_utilisateur)
          .get();

        return {
          id: avDoc.id,
          statut_avancement: {
            id: statutDoc.docs[0].id,
            nom: statutDoc.docs[0].data()?.nom,
          },
          utilisateur: {
            id: utilisateurDoc.docs[0].id,
            email: utilisateurDoc.docs[0].data()?.email || "",
          },
          date_creation: avData.date_modification,
          commentaire: avData.commentaire || "",
        };
      }),
    );

    const entrepriseSnapshot = await db
          .collection("entreprises")
          .where("id", "==", data.id_entreprise)
          .limit(1)
          .get();

    const photosSnapshot = await db
      .collection("signalements_photos")
      .where("id_signalement", "==", data.id)
      .get();

    const photos = await Promise.all(
      photosSnapshot.docs.map(async (photoDoc) => {
        const photoData = photoDoc.data();
        return {
          id: photoData.id,
          date_ajout: photoData.date_ajout || "",
          photo: photoData.photo, // Taille en caractères
        };
      }),
    );

    const response = successResponse({
      data: {
        id: doc.id,
        description: data?.description || "",
        surface: data?.surface,
        budget: data?.budget,
        adresse: data?.adresse || "",
        localisation: {
          type: "Point",
          coordinates: [
            data?.localisation.longitude,
            data?.localisation.latitude,
          ],
        },
        id_entreprise: data.id_entreprise,
        entreprise: entrepriseSnapshot.docs[0].data().nom || "",
        date_creation: data?.date_creation,
        date_modification:
          data?.date_modification ||
          data?.date_creation,
        id_utilisateur_createur: data?.id_utilisateur_createur,
        photos: photos,
        avancement_signalements: avancements,
      },
    });

    res.status(response.status).json(response.body);
  } catch (error: any) {
    const response = errorResponse("INTERNAL_ERROR", error.message, 500);
    res.status(response.status).json(response.body);
  }
});

// PUT /api/signalements/:id
export const updateSignalement = functions.https.onRequest(async (req, res) => {
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

    // Seuls les Managers peuvent modifier
    if (!(await isManager(decodedToken.uid))) {
      const response = errorResponse(
        "FORBIDDEN",
        "Seuls les Managers peuvent modifier les signalements",
        403,
      );
      res.status(response.status).json(response.body);
      return;
    }

    const id = req.path.split("/").pop();

    if (!id) {
      const response = errorResponse("VALIDATION_ERROR", "ID requis", 400);
      res.status(response.status).json(response.body);
      return;
    }

    const { description, surface, budget, adresse } = req.body;
    const updateData: any = {
      date_modification: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (description !== undefined) updateData.description = description;
    if (surface !== undefined) updateData.surface = surface;
    if (budget !== undefined) updateData.budget = budget;
    if (adresse !== undefined) updateData.adresse = adresse;

    await db.collection("signalements").doc(id).update(updateData);

    const doc = await db.collection("signalements").doc(id).get();
    const data = doc.data();

    const response = successResponse({
      data: {
        id: data?.id,
        description: data?.description || "",
        surface: data?.surface,
        budget: data?.budget,
        adresse: data?.adresse || "",
        date_modification: new Date().toISOString(),
      },
    });

    res.status(response.status).json(response.body);
  } catch (error: any) {
    const response = errorResponse("INTERNAL_ERROR", error.message, 500);
    res.status(response.status).json(response.body);
  }
});

// DELETE /api/signalements/:id
export const deleteSignalement = functions.https.onRequest(async (req, res) => {
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

    // Seuls les Managers peuvent supprimer
    if (!(await isManager(decodedToken.uid))) {
      const response = errorResponse(
        "FORBIDDEN",
        "Seuls les Managers peuvent supprimer les signalements",
        403,
      );
      res.status(response.status).json(response.body);
      return;
    }

    const id = req.path.split("/").pop();

    if (!id) {
      const response = errorResponse("VALIDATION_ERROR", "ID requis", 400);
      res.status(response.status).json(response.body);
      return;
    }

    await db.collection("signalements").doc(id).delete();

    const response = successResponse({
      message: "Signalement supprimé avec succès",
    });

    res.status(response.status).json(response.body);
  } catch (error: any) {
    const response = errorResponse("INTERNAL_ERROR", error.message, 500);
    res.status(response.status).json(response.body);
  }
});
