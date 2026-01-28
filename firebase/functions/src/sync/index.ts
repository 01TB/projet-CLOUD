import * as functions from "firebase-functions";
import { db, successResponse, errorResponse } from "../utils/helpers";
import * as admin from "firebase-admin";

// POST /syncToBackend
export const syncToBackend = functions.https.onRequest(async (req, res) => {
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
    // Collections à synchroniser
    const collections = [
      "roles",
      "entreprises",
      "statuts_avancement",
      "parametres",
      "utilisateurs",
      "utilisateurs_bloques",
      "signalements",
      "avancements_signalement",
    ];

    const dataToSync: {
      [key: string]: Array<{ id: string; [key: string]: any }>;
    } = {};
    const updatedDocuments: { [key: string]: string[] } = {};

    // Parcourir chaque collection
    for (const collectionName of collections) {
      const snapshot = await db
        .collection(collectionName)
        .where("synchro", "==", false)
        .get();

      const collectionData: Array<{ id: string; [key: string]: any }> = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();

        // Convertir les types spéciaux Firestore
        const serializedData: { id: string; [key: string]: any } = { id: doc.id };

        for (const [key, value] of Object.entries(data)) {
          if (value instanceof admin.firestore.Timestamp) {
            // Convertir Timestamp en ISO 8601 string
            serializedData[key] = value.toDate().toISOString();
          } else if (value instanceof admin.firestore.GeoPoint) {
            // Convertir GeoPoint en objet {latitude, longitude}
            serializedData[key] = {
              latitude: value.latitude,
              longitude: value.longitude,
            };
          } else {
            serializedData[key] = value;
          }
        }

        collectionData.push(serializedData);
      }

      // Ajouter les données de cette collection si elle n'est pas vide
      if (collectionData.length > 0) {
        dataToSync[collectionName] = collectionData;
        updatedDocuments[collectionName] = [];
      }
    }

    // Mettre à jour synchro = true pour toutes les données récupérées
    for (const collectionName of Object.keys(dataToSync)) {
      const batch = db.batch();
      let batchCount = 0;

      for (const doc of dataToSync[collectionName]) {
        const docRef = db.collection(collectionName).doc(doc.id);
        batch.update(docRef, { synchro: true });
        updatedDocuments[collectionName].push(doc.id);
        batchCount++;

        // Firestore batch limite à 500 opérations
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }

      // Commit le batch restant
      if (batchCount > 0) {
        await batch.commit();
      }
    }

    // Calculer le nombre total de documents synchronisés
    const totalSynced = Object.values(dataToSync).reduce(
      (sum, arr) => sum + arr.length,
      0,
    );

    const response = successResponse({
      synced: totalSynced,
      timestamp: new Date().toISOString(),
      data: dataToSync,
      updated: updatedDocuments,
    });

    res.status(response.status).json(response.body);
  } catch (error: any) {
    console.error("Erreur lors de la synchronisation:", error);
    const response = errorResponse(
      "SYNC_ERROR",
      error.message || "Erreur lors de la synchronisation",
      500,
    );
    res.status(response.status).json(response.body);
  }
});
