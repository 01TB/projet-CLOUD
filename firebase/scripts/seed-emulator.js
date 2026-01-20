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
  const roleManager = await db.collection("roles").add({
    nom: "Manager",
    synchro: true,
  });
  const roleUtilisateur = await db.collection("roles").add({
    nom: "Utilisateur",
    synchro: true,
  });
  console.log("✅ Rôles créés");

  // 2. CRÉER LES ENTREPRISES
  console.log("🏢 Création des entreprises...");
  const entreprises = [];
  const entrepriseNames = [
    "JIRAMA",
    "TelMa",
    "Air Madagascar",
    "Orange Madagascar",
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
    { nom: "En attente", valeur: 0 },
    { nom: "En cours", valeur: 25 },
    { nom: "En validation", valeur: 50 },
    { nom: "Validé", valeur: 75 },
    { nom: "Terminé", valeur: 100 },
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
    nb_tentatives_connexion: 3,
    duree_session: 3600, // en secondes
    synchro: true,
  });
  console.log("✅ Paramètres créés");

  // 5. CRÉER LES UTILISATEURS (avec Firebase Auth)
  console.log("👥 Création des utilisateurs...");

  // Manager
  const managerAuth = await auth.createUser({
    uid: "manager001",
    email: "manager@signalement.mg",
    password: "manager123",
    displayName: "Jean Manager",
  });
  await db.collection("utilisateurs").doc("manager001").set({
    email: "manager@signalement.mg",
    password: "hashed_password_manager", // En prod, utiliser bcrypt
    id_role: roleManager.id,
    synchro: true,
  });

  // Utilisateur 1
  const user1Auth = await auth.createUser({
    uid: "user001",
    email: "rakoto@example.mg",
    password: "user123",
    displayName: "Rakoto Jean",
  });
  await db.collection("utilisateurs").doc("user001").set({
    email: "rakoto@example.mg",
    password: "hashed_password_user1",
    id_role: roleUtilisateur.id,
    synchro: true,
  });

  // Utilisateur 2
  const user2Auth = await auth.createUser({
    uid: "user002",
    email: "ravelo@example.mg",
    password: "user123",
    displayName: "Ravelo Marie",
  });
  await db.collection("utilisateurs").doc("user002").set({
    email: "ravelo@example.mg",
    password: "hashed_password_user2",
    id_role: roleUtilisateur.id,
    synchro: true,
  });

  // Utilisateur 3 (bloqué)
  const user3Auth = await auth.createUser({
    uid: "user003",
    email: "blocked@example.mg",
    password: "user123",
    displayName: "Utilisateur Bloqué",
  });
  await db.collection("utilisateurs").doc("user003").set({
    email: "blocked@example.mg",
    password: "hashed_password_user3",
    id_role: roleUtilisateur.id,
    synchro: true,
  });

  console.log("✅ Utilisateurs créés");

  // 6. BLOQUER UN UTILISATEUR
  console.log("🚫 Création d'utilisateur bloqué...");
  await db.collection("utilisateurs_bloques").add({
    id_utilisateur: "user003",
    date_blocage: admin.firestore.Timestamp.now(),
    synchro: true,
  });
  console.log("✅ Utilisateur bloqué");

  // 7. CRÉER DES SIGNALEMENTS
  console.log("📍 Création des signalements...");
  const signalements = [];

  const signalementsData = [
    {
      date_creation: "2026-01-15T10:30:00Z",
      surface: 150.5,
      budget: 5000000,
      localisation: new admin.firestore.GeoPoint(-18.8792, 47.5079), // Antananarivo
      id_utilisateur_createur: "user001",
      id_entreprise: entreprises[0].id, // JIRAMA
      synchro: true,
    },
    {
      date_creation: "2026-01-16T14:20:00Z",
      surface: 75.3,
      budget: 2500000,
      localisation: new admin.firestore.GeoPoint(-18.9333, 47.5167), // Ankatso
      id_utilisateur_createur: "user002",
      id_entreprise: entreprises[1].id, // TelMa
      synchro: true,
    },
    {
      date_creation: "2026-01-18T09:00:00Z",
      surface: 200.0,
      budget: 8000000,
      localisation: new admin.firestore.GeoPoint(-18.8955, 47.5235), // Analakely
      id_utilisateur_createur: "user001",
      id_entreprise: entreprises[0].id, // JIRAMA
      synchro: true,
    },
    {
      date_creation: "2026-01-19T16:45:00Z",
      surface: 120.8,
      budget: 3500000,
      localisation: new admin.firestore.GeoPoint(-18.91, 47.53), // Ambohijatovo
      id_utilisateur_createur: "user002",
      id_entreprise: entreprises[2].id, // Air Madagascar
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

  // Signalement 1 : progression complète
  await db.collection("avancements_signalement").add({
    id_signalement: signalements[0].id,
    id_utilisateur: "manager001",
    id_statut_avancement: statuts[0].id, // En attente
    date_modification: admin.firestore.Timestamp.fromDate(
      new Date("2026-01-15T11:00:00Z"),
    ),
    synchro: true,
  });
  await db.collection("avancements_signalement").add({
    id_signalement: signalements[0].id,
    id_utilisateur: "manager001",
    id_statut_avancement: statuts[1].id, // En cours
    date_modification: admin.firestore.Timestamp.fromDate(
      new Date("2026-01-16T08:00:00Z"),
    ),
    synchro: true,
  });

  // Signalement 2 : début de traitement
  await db.collection("avancements_signalement").add({
    id_signalement: signalements[1].id,
    id_utilisateur: "manager001",
    id_statut_avancement: statuts[0].id, // En attente
    date_modification: admin.firestore.Timestamp.fromDate(
      new Date("2026-01-16T15:00:00Z"),
    ),
    synchro: true,
  });

  // Signalement 3 : terminé
  await db.collection("avancements_signalement").add({
    id_signalement: signalements[2].id,
    id_utilisateur: "manager001",
    id_statut_avancement: statuts[4].id, // Terminé
    date_modification: admin.firestore.Timestamp.fromDate(
      new Date("2026-01-19T12:00:00Z"),
    ),
    synchro: true,
  });

  console.log("✅ Avancements créés");

  console.log("\n🎉 Toutes les données ont été créées avec succès !");
  console.log("\n📊 RÉSUMÉ:");
  console.log(`   - 2 rôles (Manager, Utilisateur)`);
  console.log(`   - ${entreprises.length} entreprises`);
  console.log(`   - ${statuts.length} statuts d'avancement`);
  console.log(`   - 4 utilisateurs (dont 1 bloqué)`);
  console.log(`   - ${signalements.length} signalements`);
  console.log(`   - 4 avancements de signalement`);
  console.log("\n🌐 Accédez à l'interface: http://localhost:4000");

  process.exit(0);
}

seedData().catch((error) => {
  console.error("❌ Erreur:", error);
  process.exit(1);
});
