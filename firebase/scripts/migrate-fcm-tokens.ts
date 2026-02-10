// Script de Migration des Tokens FCM
// Migration de la collection "utilisateurs" vers "utilisateurs_fcm_tokens"
//
// Usage:
//   cd firebase/scripts
//   ts-node migrate-fcm-tokens.ts
//
// Ce script migre tous les tokens FCM existants dans la collection utilisateurs
// vers la nouvelle collection dédiée utilisateurs_fcm_tokens

const admin = require("firebase-admin");
const path = require("path");

// Initialiser Firebase Admin
const serviceAccountPath = path.join(__dirname, "..", "serviceAccountKey.json");
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

interface UtilisateurData {
  id: number;
  fcm_token?: string;
  fcm_token_updated_at?: admin.firestore.Timestamp;
  [key: string]: any;
}

async function migrateFcmTokens() {
  console.log("🔄 Début de la migration des tokens FCM...\n");

  try {
    // Récupérer tous les utilisateurs ayant un token FCM
    const utilisateursSnapshot = await db
      .collection("utilisateurs")
      .where("fcm_token", "!=", null)
      .get();

    console.log(
      `📊 ${utilisateursSnapshot.size} utilisateurs avec token FCM trouvés\n`,
    );

    if (utilisateursSnapshot.empty) {
      console.log("✅ Aucun token à migrer. Migration terminée.");
      return;
    }

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const doc of utilisateursSnapshot.docs) {
      const data = doc.data() as UtilisateurData;
      const userId = data.id;
      const fcmToken = data.fcm_token;

      if (!userId) {
        console.log(`⚠️  Document ${doc.id}: ID utilisateur manquant, ignoré`);
        skipped++;
        continue;
      }

      if (!fcmToken) {
        console.log(
          `⚠️  Utilisateur ${userId}: Token FCM vide ou invalide, ignoré`,
        );
        skipped++;
        continue;
      }

      try {
        // Vérifier si le token existe déjà dans la nouvelle collection
        const existingTokenDoc = await db
          .collection("utilisateurs_fcm_tokens")
          .doc(userId.toString())
          .get();

        if (existingTokenDoc.exists) {
          console.log(`⏭️  Utilisateur ${userId}: Token déjà migré, ignoré`);
          skipped++;
          continue;
        }

        // Créer le document dans la nouvelle collection
        await db
          .collection("utilisateurs_fcm_tokens")
          .doc(userId.toString())
          .set({
            id_utilisateur: userId,
            fcm_token: fcmToken,
            fcm_token_updated_at:
              data.fcm_token_updated_at ||
              admin.firestore.FieldValue.serverTimestamp(),
            last_updated: new Date().toISOString(),
          });

        console.log(`✅ Utilisateur ${userId}: Token migré avec succès`);
        migrated++;

        // Optionnel : Supprimer le champ fcm_token de la collection utilisateurs
        // Décommentez les lignes ci-dessous si vous voulez nettoyer l'ancienne collection
        /*
        await doc.ref.update({
          fcm_token: admin.firestore.FieldValue.delete(),
          fcm_token_updated_at: admin.firestore.FieldValue.delete(),
        });
        console.log(`  🗑️  Champs supprimés de la collection utilisateurs`);
        */
      } catch (error: any) {
        console.error(
          `❌ Erreur lors de la migration de l'utilisateur ${userId}:`,
          error.message,
        );
        errors++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 Résumé de la migration:");
    console.log("=".repeat(50));
    console.log(`✅ Tokens migrés avec succès : ${migrated}`);
    console.log(`⏭️  Tokens ignorés (déjà migrés) : ${skipped}`);
    console.log(`❌ Erreurs : ${errors}`);
    console.log(`📊 Total traités : ${utilisateursSnapshot.size}`);
    console.log("=".repeat(50) + "\n");

    if (migrated > 0) {
      console.log(
        "✅ Migration terminée ! Les tokens sont maintenant dans la collection 'utilisateurs_fcm_tokens'",
      );
      console.log("\n💡 Prochaines étapes:");
      console.log(
        "   1. Déployer les nouvelles fonctions : firebase deploy --only functions",
      );
      console.log(
        "   2. Déployer les règles Firestore : firebase deploy --only firestore:rules",
      );
      console.log("   3. Tester l'envoi de notifications");
    } else {
      console.log("ℹ️  Aucune migration effectuée.");
    }
  } catch (error: any) {
    console.error("❌ Erreur fatale lors de la migration:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Fonction pour nettoyer les anciens tokens de la collection utilisateurs
async function cleanupOldTokens() {
  console.log(
    "\n🗑️  Nettoyage des anciens tokens dans la collection utilisateurs...\n",
  );

  try {
    const utilisateursSnapshot = await db
      .collection("utilisateurs")
      .where("fcm_token", "!=", null)
      .get();

    if (utilisateursSnapshot.empty) {
      console.log("✅ Aucun token à nettoyer.");
      return;
    }

    console.log(`📊 ${utilisateursSnapshot.size} documents à nettoyer\n`);

    const batch = db.batch();
    let count = 0;

    for (const doc of utilisateursSnapshot.docs) {
      batch.update(doc.ref, {
        fcm_token: admin.firestore.FieldValue.delete(),
        fcm_token_updated_at: admin.firestore.FieldValue.delete(),
      });

      count++;

      // Firestore limite à 500 opérations par batch
      if (count >= 500) {
        await batch.commit();
        console.log(`✅ ${count} documents nettoyés (batch commit)`);
        count = 0;
      }
    }

    // Commit le batch restant
    if (count > 0) {
      await batch.commit();
      console.log(`✅ ${count} documents nettoyés (derniers)`);
    }

    console.log("\n✅ Nettoyage terminé !");
  } catch (error: any) {
    console.error("❌ Erreur lors du nettoyage:", error.message);
    throw error;
  }
}

// Parser les arguments de ligne de commande
const args = process.argv.slice(2);
const shouldCleanup = args.includes("--cleanup");

// Exécuter la migration
migrateFcmTokens()
  .then(async () => {
    if (shouldCleanup) {
      console.log("\n⚠️  Option --cleanup détectée");
      await cleanupOldTokens();
    } else {
      console.log(
        "\n💡 Pour supprimer les anciens tokens de la collection utilisateurs, exécutez:",
      );
      console.log("   ts-node migrate-fcm-tokens.ts --cleanup");
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration échouée:", error);
    process.exit(1);
  });
