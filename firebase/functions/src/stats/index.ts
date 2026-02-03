import * as functions from "firebase-functions";
import { db, successResponse, errorResponse } from "../utils/helpers";

// GET /api/stats
export const getStats = functions.https.onRequest(async (req, res) => {
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
    // Récupérer tous les signalements
    const signalementsSnapshot = await db.collection("signalements").get();

    let totalSignalements = 0;
    let totalSurface = 0;
    let totalBudget = 0;

    signalementsSnapshot.forEach((doc) => {
      const data = doc.data();
      totalSignalements++;
      totalSurface += data.surface || 0;
      totalBudget += data.budget || 0;
    });

    // Récupérer tous les avancements pour calculer l'avancement moyen
    const avancementsSnapshot = await db
      .collection("avancements_signalement")
      .get();
    const signalementAvancements: { [key: string]: number } = {};

    for (const avDoc of avancementsSnapshot.docs) {
      const avData = avDoc.data();
      const statutDoc = await db
        .collection("statuts_avancement")
        .doc(avData.id_statut_avancement)
        .get();
      const valeur = statutDoc.data()?.valeur || 0;

      // Garder seulement le dernier avancement (le plus élevé) par signalement
      if (
        !signalementAvancements[avData.id_signalement] ||
        signalementAvancements[avData.id_signalement] < valeur
      ) {
        signalementAvancements[avData.id_signalement] = valeur;
      }
    }

    const totalAvancement = Object.values(signalementAvancements).reduce(
      (sum, val) => sum + val,
      0,
    );
    const avancementMoyen =
      totalSignalements > 0 ? totalAvancement / totalSignalements : 0;

    // Compter les signalements par statut
    const statutsSnapshot = await db.collection("statuts_avancement").get();
    const signalementsParStatut: { [key: string]: number } = {};

    statutsSnapshot.forEach((doc) => {
      signalementsParStatut[doc.data().nom] = 0;
    });

    for (const valeur of Object.values(signalementAvancements)) {
      const statutDoc = statutsSnapshot.docs.find(
        (doc) => doc.data().valeur === valeur,
      );
      if (statutDoc) {
        const nom = statutDoc.data().nom;
        signalementsParStatut[nom] = (signalementsParStatut[nom] || 0) + 1;
      }
    }

    const signalementsSansStatut =
      totalSignalements - Object.values(signalementAvancements).length;
    if (signalementsSansStatut > 0) {
      signalementsParStatut["Non défini"] = signalementsSansStatut;
    }

    const response = successResponse({
      data: {
        total_signalements: totalSignalements,
        total_surface: parseFloat(totalSurface.toFixed(2)),
        total_budget: parseFloat(totalBudget.toFixed(2)),
        avancement_moyen: parseFloat(avancementMoyen.toFixed(2)),
        signalements_par_statut: Object.entries(signalementsParStatut).map(
          ([statut, count]) => ({
            statut,
            count,
          }),
        ),
      },
    });

    res.status(response.status).json(response.body);
  } catch (error: any) {
    const response = errorResponse(
      "INTERNAL_ERROR",
      error.message || "Erreur interne du serveur",
      500,
    );
    res.status(response.status).json(response.body);
  }
});
