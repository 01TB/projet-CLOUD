import * as admin from "firebase-admin";

export const db = admin.firestore();
export const auth = admin.auth();
export const apiKEY = 'AIzaSyDhLRO2eNXgH2_qHnZeIZYmRjIJvwr38RU';

// Vérifier si l'utilisateur est Manager
export async function isManager(uid: string): Promise<boolean> {
  try {
    const userDoc = await db.collection("utilisateurs").doc(uid).get();
    if (!userDoc.exists) return false;

    const userData = userDoc.data();
    const roleDoc = await db.collection("roles").doc(userData?.id_role).get();

    return roleDoc.exists && roleDoc.data()?.nom === "Manager";
  } catch (error) {
    return false;
  }
}

// Vérifier si l'utilisateur est bloqué
export async function isBlocked(uid: string): Promise<boolean> {
  try {
    const blockedSnapshot = await db
      .collection("utilisateurs_bloques")
      .where("id_utilisateur", "==", uid)
      .limit(1)
      .get();

    return !blockedSnapshot.empty;
  } catch (error) {
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

// Vérifier et décoder le token
export async function verifyToken(
  token: string,
): Promise<admin.auth.DecodedIdToken | null> {
  try {
    return await auth.verifyIdToken(token);
  } catch (error) {
    console.error("Erreur détaillée :", error); // Regardez les logs dans la console Firebase
    return null;
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
