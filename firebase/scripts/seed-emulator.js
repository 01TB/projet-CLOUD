const admin = require("firebase-admin");

// Se connecter à l'émulateur
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";

admin.initializeApp({ projectId: "projet-cloud-e2146" });

const db = admin.firestore();
const auth = admin.auth();

async function clearData() {
  console.log("🧹 Nettoyage des données existantes...");

  // Supprimer tous les utilisateurs Auth
  try {
    const listUsersResult = await auth.listUsers();
    for (const user of listUsersResult.users) {
      await auth.deleteUser(user.uid);
    }
  } catch (error) {
    // Ignorer si pas d'utilisateurs
  }

  // Supprimer toutes les collections Firestore
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

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    for (const doc of snapshot.docs) {
      await doc.ref.delete();
    }
  }

  console.log("✅ Nettoyage terminé");
}

async function seedData() {
  console.log("🌱 Début du peuplement de la base de signalements...");

  // Nettoyer d'abord
  await clearData();

  // 1. CRÉER LES RÔLES
  console.log("📝 Création des rôles...");
  const roleAdministrateur = await db.collection("roles").add({
    nom: "Administrateur",
    synchro: true,
  });
  const roleUtilisateur = await db.collection("roles").add({
    nom: "Utilisateur",
    synchro: true,
  });
  const roleEntreprise = await db.collection("roles").add({
    nom: "Entreprise",
    synchro: true,
  });
  console.log("✅ Rôles créés");

  // 2. CRÉER LES ENTREPRISES
  console.log("🏢 Création des entreprises...");
  const entreprises = [];
  const entrepriseNames = [
    "BTP Rénovation",
    "Eco-Construction",
    "Travaux Express",
  ];
  for (const nom of entrepriseNames) {
    const entreprise = await db.collection("entreprises").add({
      nom: nom,
      synchro: true,
    });
    entreprises.push({ id: entreprise.id, nom });
  }
  console.log("✅ Entreprises créées");

  // 3. CRÉER LES STATUTS D'AVANCEMENT
  console.log("📊 Création des statuts d'avancement...");
  const statuts = [];
  const statutsData = [
    { nom: "Nouveau", valeur: 0 },
    { nom: "En cours d'analyse", valeur: 25 },
    { nom: "Travaux commencés", valeur: 50 },
    { nom: "Travaux terminés", valeur: 100 },
    { nom: "Rejeté", valeur: -1 },
  ];
  for (const statut of statutsData) {
    const statutRef = await db.collection("statuts_avancement").add({
      ...statut,
      synchro: true,
    });
    statuts.push({ id: statutRef.id, ...statut });
  }
  console.log("✅ Statuts d'avancement créés");

  // 4. CRÉER LES PARAMÈTRES
  console.log("⚙️ Création des paramètres...");
  await db.collection("parametres").add({
    nb_tentatives_connexion: 5,
    duree_session: 3600, // en secondes
    synchro: true,
  });
  console.log("✅ Paramètres créés");

  // 5. CRÉER LES UTILISATEURS (avec Firebase Auth)
  console.log("👥 Création des utilisateurs...");

  // Administrateur
  const adminAuth = await auth.createUser({
    uid: "admin001",
    email: "admin@signalement.com",
    password: "admin123",
    displayName: "Administrateur",
  });
  await db.collection("utilisateurs").doc("admin001").set({
    email: "admin@signalement.com",
    password: "hashed_password_admin", // En prod, utiliser bcrypt
    id_role: roleAdministrateur.id,
    synchro: true,
  });

  // Jean Dupont (Utilisateur)
  const user1Auth = await auth.createUser({
    uid: "user001",
    email: "jean.dupont@email.com",
    password: "user123",
    displayName: "Jean Dupont",
  });
  await db.collection("utilisateurs").doc("user001").set({
    email: "jean.dupont@email.com",
    password: "hashed_password_user1",
    id_role: roleUtilisateur.id,
    synchro: true,
  });

  // Marie Curie (Utilisateur)
  const user2Auth = await auth.createUser({
    uid: "user002",
    email: "marie.curie@email.com",
    password: "user456",
    displayName: "Marie Curie",
  });
  await db.collection("utilisateurs").doc("user002").set({
    email: "marie.curie@email.com",
    password: "hashed_password_user2",
    id_role: roleUtilisateur.id,
    synchro: true,
  });

  // Entreprise BTP Rénovation
  const entrepriseAuth = await auth.createUser({
    uid: "entreprise001",
    email: "contact@btp-renovation.com",
    password: "entr123",
    displayName: "BTP Rénovation",
  });
  await db.collection("utilisateurs").doc("entreprise001").set({
    email: "contact@btp-renovation.com",
    password: "hashed_password_entreprise",
    id_role: roleEntreprise.id,
    synchro: true,
  });

  // Spammeur (à bloquer)
  const user3Auth = await auth.createUser({
    uid: "user003",
    email: "spammeur@bad.com",
    password: "badpass",
    displayName: "Spammeur",
  });
  await db.collection("utilisateurs").doc("user003").set({
    email: "spammeur@bad.com",
    password: "hashed_password_user3",
    id_role: roleUtilisateur.id,
    synchro: true,
  });

  console.log("✅ Utilisateurs créés");

  // 6. BLOQUER UN UTILISATEUR
  console.log("🚫 Création d'utilisateur bloqué...");
  await db.collection("utilisateurs_bloques").add({
    id_utilisateur: "user003",
    date_blocage: admin.firestore.Timestamp.fromDate(
      new Date("2023-10-25T14:00:00Z"),
    ),
    synchro: true,
  });
  console.log("✅ Utilisateur bloqué");

  // 7. CRÉER DES SIGNALEMENTS
  console.log("📍 Création des signalements...");
  const signalements = [];

  const signalementsData = [
    {
      date_creation: "2023-11-01T09:30:00Z",
      surface: 45.5,
      budget: 15000,
      localisation: new admin.firestore.GeoPoint(18.9, 47.5), // SQL: POINT(47.50 18.90) → GeoPoint(lat, lng)
      id_utilisateur_createur: "user001", // Jean Dupont
      id_entreprise: entreprises[0].id, // BTP Rénovation
      synchro: true,
    },
    {
      date_creation: "2023-11-02T10:15:00Z",
      surface: 120.0,
      budget: 50000,
      localisation: new admin.firestore.GeoPoint(-12.28, 49.29), // SQL: POINT(49.29 -12.28) → GeoPoint(lat, lng)
      id_utilisateur_createur: "user002", // Marie Curie
      id_entreprise: entreprises[1].id, // Eco-Construction
      synchro: true,
    },
    {
      date_creation: "2023-11-03T16:00:00Z",
      surface: 15.0,
      budget: 2000,
      localisation: new admin.firestore.GeoPoint(18.92, 47.52), // SQL: POINT(47.52 18.92) → GeoPoint(lat, lng)
      id_utilisateur_createur: "user001", // Jean Dupont
      id_entreprise: entreprises[2].id, // Travaux Express
      synchro: true,
    },
  ];

  for (const signalement of signalementsData) {
    const signalementRef = await db.collection("signalements").add(signalement);
    signalements.push({ id: signalementRef.id, ...signalement });
  }
  console.log("✅ Signalements créés");

  // 8. CRÉER DES AVANCEMENTS DE SIGNALEMENT
  console.log("📈 Création des avancements...");

  // Historique pour le signalement 1 (2 avancements)
  // NOW() - INTERVAL '3 days' → 3 jours avant aujourd'hui
  const now = new Date();
  await db.collection("avancements_signalement").add({
    id_signalement: signalements[0].id,
    id_utilisateur: "user001", // Jean Dupont (créateur)
    id_statut_avancement: statuts[0].id, // Nouveau
    date_modification: admin.firestore.Timestamp.fromDate(
      new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    ),
    synchro: true,
  });
  await db.collection("avancements_signalement").add({
    id_signalement: signalements[0].id,
    id_utilisateur: "admin001", // Admin
    id_statut_avancement: statuts[1].id, // En cours d'analyse
    date_modification: admin.firestore.Timestamp.fromDate(
      new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    ),
    synchro: true,
  });

  // Historique pour le signalement 2 (3 avancements)
  await db.collection("avancements_signalement").add({
    id_signalement: signalements[1].id,
    id_utilisateur: "user002", // Marie Curie (créatrice)
    id_statut_avancement: statuts[0].id, // Nouveau
    date_modification: admin.firestore.Timestamp.fromDate(
      new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    ),
    synchro: true,
  });
  await db.collection("avancements_signalement").add({
    id_signalement: signalements[1].id,
    id_utilisateur: "admin001", // Admin
    id_statut_avancement: statuts[1].id, // En cours d'analyse
    date_modification: admin.firestore.Timestamp.fromDate(
      new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    ),
    synchro: true,
  });
  await db.collection("avancements_signalement").add({
    id_signalement: signalements[1].id,
    id_utilisateur: "entreprise001", // Entreprise
    id_statut_avancement: statuts[2].id, // Travaux commencés
    date_modification: admin.firestore.Timestamp.fromDate(
      new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    ),
    synchro: true,
  });

  console.log("✅ Avancements créés");

  console.log("\n🎉 Toutes les données ont été créées avec succès !");
  console.log("\n📊 RÉSUMÉ:");
  console.log(`   - 3 rôles (Administrateur, Utilisateur, Entreprise)`);
  console.log(`   - ${entreprises.length} entreprises`);
  console.log(`   - ${statuts.length} statuts d'avancement`);
  console.log(`   - 5 utilisateurs (dont 1 bloqué)`);
  console.log(`   - ${signalements.length} signalements`);
  console.log(`   - 5 avancements de signalement`);
  console.log("\n🌐 Accédez à l'interface: http://localhost:4000");

  process.exit(0);
}

seedData().catch((error) => {
  console.error("❌ Erreur:", error);
  process.exit(1);
});
