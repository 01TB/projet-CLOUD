import * as admin from "firebase-admin";

export const db = admin.firestore();
export const auth = admin.auth();
export const apiKEY = "AIzaSyDhLRO2eNXgH2_qHnZeIZYmRjIJvwr38RU";

// Obtenir les paramètres (doc id = 1)
export async function getParameters(): Promise<{
  duree_session: number;
  nb_tentatives_connexion: number;
} | null> {
  try {
    const doc = await db.collection("parametres").doc("1").get();
    if (!doc.exists) return null;
    const data = doc.data();
    return {
      duree_session:
        typeof data?.duree_session === "number" ? data.duree_session : 3600,
      nb_tentatives_connexion:
        typeof data?.nb_tentatives_connexion === "number"
          ? data.nb_tentatives_connexion
          : 3,
    };
  } catch (error) {
    return null;
  }
}

// Vérifier si l'utilisateur est Manager
export async function isManager(uid: string): Promise<boolean> {
  try {
    const userDoc = await db.collection("utilisateurs").doc(uid).get();
    if (!userDoc.exists) return false;

    const userData = userDoc.data();
    const roleDoc = await db.collection("roles").doc(userData?.id_role).get();

    return roleDoc.exists && roleDoc.data()?.nom === "MANAGER";
  } catch (error) {
    return false;
  }
}

// Vérifier si l'utilisateur est bloqué
export async function isBlocked(uid: string): Promise<boolean> {
  try {
    // Récupérer l'ID numérique de l'utilisateur
    const userInfo = await getUserInfo(uid);
    if (!userInfo || !userInfo.id) return false;

    const blockedSnapshot = await db
      .collection("utilisateurs_bloques")
      .where("id_utilisateur", "==", userInfo.id)
      .limit(1)
      .get();

    return !blockedSnapshot.empty;
  } catch (error) {
    return false;
  }
}

// Obtenir les informations de l'utilisateur
export async function getUserInfo(uid: string): Promise<any | null> {
  try {
    const userDoc = await db.collection("utilisateurs").doc(uid).get();
    if (!userDoc.exists) return null;
    return userDoc.data();
  } catch (error) {
    return null;
  }
}

// Bloquer un utilisateur en créant une entrée dans `utilisateurs_bloques`.
export async function blockUser(id_utilisateur: number): Promise<boolean> {
  try {
    const newId = await generateUniqueIntId("utilisateurs_bloques");
    await db.collection("utilisateurs_bloques").doc(String(newId)).set({
      id: newId,
      date_blocage: admin.firestore.FieldValue.serverTimestamp(),
      synchro: false,
      id_utilisateur,
    });
    return true;
  } catch (error) {
    console.error("Erreur lors du blocage utilisateur:", error);
    return false;
  }
}

// Extraire le token du header Authorization
export function extractToken(req: any): string | null {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

// Vérifier et décoder le token (session cookie ou ID token)
export async function verifyToken(
  token: string,
): Promise<admin.auth.DecodedIdToken | null> {
  try {
    // Essayer de vérifier comme session cookie d'abord (utilisé après login)
    return await auth.verifySessionCookie(token, true);
  } catch (sessionError) {
    try {
      // Fallback : essayer de vérifier comme ID token (rétrocompatibilité)
      return await auth.verifyIdToken(token);
    } catch (idTokenError) {
      console.error(
        "Erreur de vérification du token (session cookie et ID token échoués):",
        sessionError,
      );
      return null;
    }
  }
}

// Format de réponse succès
export function successResponse(data: any, statusCode = 200) {
  return {
    status: statusCode,
    body: {
      success: true,
      ...data,
    },
  };
}

// Format de réponse erreur
export function errorResponse(
  code: string,
  message: string,
  statusCode = 400,
  details?: any,
) {
  return {
    status: statusCode,
    body: {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
  };
}

// Valider email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Valider mot de passe (min 8 caractères, 1 lettre, 1 chiffre)
export function isValidPassword(password: string): boolean {
  return (
    password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password)
  );
}

/**
 * Génère un ID entier unique compatible avec un INT SQL
 * @param {string} collectionName - Le nom de la collection Firestore à vérifier
 * @returns {Promise<number>} - Un nombre entier unique
 */
export async function generateUniqueIntId(
  collectionName: string,
): Promise<number> {
  const MIN_INT = 50000;
  const MAX_INT = 2147483647;
  const colRef = db.collection(collectionName);

  let isUnique = false;
  let candidateId: number = 0;
  const getRandomInt = (min: number, max: number): number => {
    // On utilise Math.floor pour obtenir un entier
    // Math.random() génère un float entre 0 (inclus) et 1 (exclu)
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  while (!isUnique) {
    // 1. Générer un candidat aléatoire
    candidateId = getRandomInt(MIN_INT, MAX_INT);

    // 2. Vérifier l'existence de cet ID dans Firestore
    // On utilise limit(1) et select() pour minimiser la consommation de ressources
    const snapshot = await colRef
      .where("id", "==", candidateId)
      .limit(1)
      .select() // Ne récupère aucun champ, juste l'existence du doc
      .get();

    if (snapshot.empty) {
      isUnique = true;
    } else {
      console.log(
        `Collision détectée pour l'ID ${candidateId}, on génère à nouveau...`,
      );
      candidateId = Math.floor(Math.random() * MAX_INT);
    }
  }

  return candidateId;
}
