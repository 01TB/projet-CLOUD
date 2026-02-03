import * as functions from "firebase-functions";
import { db, successResponse, errorResponse } from "../utils/helpers";

// GET /api/entreprises
export const getEntreprises = functions.https.onRequest(async (req, res) => {
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
    const snapshot = await db.collection("entreprises").get();

    const entreprises = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const response = successResponse({
      data: entreprises,
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
