import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import {
  db,
  auth,
  isValidEmail,
  isValidPassword,
  successResponse,
  errorResponse,
  extractToken,
  verifyToken,
  getParameters,
  blockUser,
  generateUniqueIntId,
  apiKEY,
} from "../utils/helpers";

// POST /api/auth/register
export const register = functions.https.onRequest(async (req, res) => {
  // CORS
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
    const { email, password, nom, prenom, telephone } = req.body;

    // Validation
    if (!email || !password || !nom || !prenom) {
      const response = errorResponse(
        "VALIDATION_ERROR",
        "Email, password, nom et prenom sont requis",
        400,
      );
      res.status(response.status).json(response.body);
      return;
    }

    if (!isValidEmail(email)) {
      const response = errorResponse(
        "VALIDATION_ERROR",
        "Format email invalide",
        400,
      );
      res.status(response.status).json(response.body);
      return;
    }

    if (!isValidPassword(password)) {
      const response = errorResponse(
        "VALIDATION_ERROR",
        "Le mot de passe doit contenir au moins 8 caractères, 1 lettre et 1 chiffre",
        400,
      );
      res.status(response.status).json(response.body);
      return;
    }

    // Récupérer le rôle "Utilisateur"
    const rolesSnapshot = await db
      .collection("roles")
      .where("nom", "==", "Utilisateur")
      .limit(1)
      .get();

    if (rolesSnapshot.empty) {
      const response = errorResponse(
        "INTERNAL_ERROR",
        "Rôle Utilisateur non trouvé",
        500,
      );
      res.status(response.status).json(response.body);
      return;
    }

    const roleUtilisateur = rolesSnapshot.docs[0];

    // Générer un ID numérique unique pour l'utilisateur
    const userNumericId = await generateUniqueIntId("utilisateurs");

    // Créer l'utilisateur dans Firebase Auth
    const userRecord = await auth.createUser({
      uid: userNumericId.toString(), 
      email,
      password,
      displayName: `${prenom} ${nom}`,
    });


    // Créer le document utilisateur dans Firestore
    await db
      .collection("utilisateurs")
      .doc(String(userNumericId))
      .set({
        id: userNumericId,
        email,
        password: password, // En production, hasher le mot de passe
        id_role: Number(roleUtilisateur.id),
        nom,
        prenom,
        telephone: telephone || null,
        synchro: false,
        date_creation: admin.firestore.FieldValue.serverTimestamp(),
        date_modification: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Générer un custom token
    const token = await auth.createCustomToken(userRecord.uid);

    const response = successResponse(
      {
        user: {
          id: userNumericId,
          firebase_uid: userRecord.uid,
          email,
          nom,
          prenom,
          telephone: telephone || null,
          role: roleUtilisateur.id,
          date_creation: new Date().toISOString(),
          date_modification: new Date().toISOString(),
        },
        token,
      },
      201,
    );

    res.status(response.status).json(response.body);
  } catch (error: any) {
    if (error.code === "auth/email-already-exists") {
      const response = errorResponse("EMAIL_EXISTS", "Email déjà utilisé", 400);
      res.status(response.status).json(response.body);
      return;
    }

    const response = errorResponse(
      "INTERNAL_ERROR",
      error.message || "Erreur interne du serveur",
      500,
    );
    res.status(response.status).json(response.body);
  }
});

// POST /api/auth/login
export const login = functions.https.onRequest(async (req, res) => {
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
    const { email, password } = req.body;

    if (!email || !password) {
      const response = errorResponse(
        "VALIDATION_ERROR",
        "Email et password requis",
        400,
      );
      res.status(response.status).json(response.body);
      return;
    }

    // Charger les paramètres (durée de session et nombre max tentatives)
    const params = (await getParameters()) || {
      duree_session: 3600,
      nb_tentatives_connexion: 3,
    };
    const duree_session = params.duree_session;
    const nb_tentatives_connexion = params.nb_tentatives_connexion;

    // Récupérer l'utilisateur Firestore par email (la collection `utilisateurs` stocke l'id numérique)
    const userSnapshot = await db
      .collection("utilisateurs")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      const response = errorResponse(
        "INVALID_CREDENTIALS",
        "Email ou mot de passe incorrect",
        401,
      );
      res.status(response.status).json(response.body);
      return;
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    const userNumericId = userData?.id;

    // Vérifier si l'utilisateur est déjà bloqué
    const blockedSnap = await db
      .collection("utilisateurs_bloques")
      .where("id_utilisateur", "==", userNumericId)
      .limit(1)
      .get();

    if (!blockedSnap.empty) {
      const response = errorResponse("ACCOUNT_BLOCKED", "Compte bloqué", 403);
      res.status(response.status).json(response.body);
      return;
    }

    // Vérifier le mot de passe (ici comparaison simple, en production hacher)
    const storedPassword = userData?.password || null;
    if (storedPassword !== password) {
      const failedAttempts = (userData?.failed_login_attempts || 0) + 1;
      await userDoc.ref.update({
        failed_login_attempts: failedAttempts,
        last_failed_login: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (failedAttempts >= nb_tentatives_connexion) {
        // Bloquer l'utilisateur
        await blockUser(userNumericId);
        const response = errorResponse(
          "ACCOUNT_BLOCKED",
          "Compte bloqué après trop de tentatives",
          403,
        );
        res.status(response.status).json(response.body);
        return;
      }

      const remaining = nb_tentatives_connexion - failedAttempts;
      const response = errorResponse(
        "INVALID_CREDENTIALS",
        `Email ou mot de passe incorrect. Il reste ${remaining} tentative(s).`,
        401,
      );
      res.status(response.status).json(response.body);
      return;
    }

    // Reset failed attempts on succès
    await userDoc.ref.update({ failed_login_attempts: 0 });

    // Récupérer l'utilisateur Firebase Auth pour créer le custom token
    const userRecord = await auth.getUserByEmail(email);

    // 1. Créer un custom token
    const token = await auth.createCustomToken(userRecord.uid);
    // 2. L'échanger immédiatement contre un ID Token via l'API REST de Google
    const responseIdentity = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKEY}`,
      {
        token: token,
        returnSecureToken: true,
      },
    );
    // 3. Récupérer le idToken de la réponse
    const idToken = responseIdentity.data.idToken;

    // 4. Créer un session cookie avec la durée souhaitée (en ms)
    const expiresIn = duree_session * 1000;
    let sessionCookie = null;
    try {
      sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    } catch (e) {
      // Si création de session cookie échoue, on continue en renvoyant au moins l'idToken
      console.error("Impossible de créer le sessionCookie :", e);
    }

    const response = successResponse({
      user: {
        id: userNumericId,
        email: userData?.email,
        nom: userData?.nom,
        prenom: userData?.prenom,
        telephone: userData?.telephone,
        role: userData?.id_role,
        date_creation:
          userData?.date_creation?.toDate?.()?.toISOString?.() || null,
        date_modification:
          userData?.date_modification?.toDate?.()?.toISOString?.() || null,
      },
      token: sessionCookie,
      session_expires_at: new Date(Date.now() + expiresIn).toISOString(),
    });

    res.status(response.status).json(response.body);
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      const response = errorResponse(
        "INVALID_CREDENTIALS",
        "Email ou mot de passe incorrect",
        401,
      );
      res.status(response.status).json(response.body);
      return;
    }

    const response = errorResponse(
      "INTERNAL_ERROR",
      error.message || "Erreur interne du serveur",
      500,
    );
    res.status(response.status).json(response.body);
  }
});

// GET /api/auth/me
export const me = functions.https.onRequest(async (req, res) => {
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

    const userDoc = await db
      .collection("utilisateurs")
      .doc(decodedToken.uid)
      .get();

    if (!userDoc.exists) {
      const response = errorResponse(
        "USER_NOT_FOUND",
        "Utilisateur non trouvé",
        404,
      );
      res.status(response.status).json(response.body);
      return;
    }

    const userData = userDoc.data();

    const response = successResponse({
      user: {
        id: decodedToken.uid,
        email: userData?.email,
        nom: userData?.nom,
        prenom: userData?.prenom,
        telephone: userData?.telephone,
        role: userData?.id_role,
        date_creation: userData?.date_creation?.toDate().toISOString(),
        date_modification: userData?.date_modification?.toDate().toISOString(),
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

// PUT /api/auth/update
export const update = functions.https.onRequest(async (req, res) => {
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

    const { nom, prenom, telephone } = req.body;
    const updateData: any = {
      date_modification: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (nom) updateData.nom = nom;
    if (prenom) updateData.prenom = prenom;
    if (telephone !== undefined) updateData.telephone = telephone;

    await db
      .collection("utilisateurs")
      .doc(decodedToken.uid)
      .update(updateData);

    const userDoc = await db
      .collection("utilisateurs")
      .doc(decodedToken.uid)
      .get();
    const userData = userDoc.data();

    const response = successResponse({
      user: {
        id: decodedToken.uid,
        email: userData?.email,
        nom: userData?.nom,
        prenom: userData?.prenom,
        telephone: userData?.telephone,
        role: userData?.id_role,
        date_creation: userData?.date_creation?.toDate().toISOString(),
        date_modification: new Date().toISOString(),
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

// POST /api/auth/logout
export const logout = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const response = successResponse({
    message: "Déconnexion réussie",
  });

  res.status(response.status).json(response.body);
});
