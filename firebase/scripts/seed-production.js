const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json"); // À télécharger depuis Firebase Console

// Se connecter à Firebase Production
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

async function seedData() {
  console.log("🌱 Début du peuplement de Firebase Production...");
  console.log(
    "⚠️  ATTENTION: Cela va créer des données dans votre base RÉELLE!",
  );

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
    duree_session: 3600,
    synchro: true,
  });
  console.log("✅ Paramètres créés");

  // 5. CRÉER LES UTILISATEURS (avec Firebase Auth)
  console.log("👥 Création des utilisateurs...");

  // Manager
  const managerAuth = await auth.createUser({
    email: "manager@signalement.mg",
    password: "manager123456", // Changez ce mot de passe !
    displayName: "Jean Manager",
  });
  await db.collection("utilisateurs").doc(managerAuth.uid).set({
    email: "manager@signalement.mg",
    password: "hashed_password_manager",
    id_role: roleManager.id,
    synchro: true,
  });

  // Utilisateur 1
  const user1Auth = await auth.createUser({
    email: "rakoto@example.mg",
    password: "user123456",
    displayName: "Rakoto Jean",
  });
  await db.collection("utilisateurs").doc(user1Auth.uid).set({
    email: "rakoto@example.mg",
    password: "hashed_password_user1",
    id_role: roleUtilisateur.id,
    synchro: true,
  });

  // Utilisateur 2
  const user2Auth = await auth.createUser({
    email: "ravelo@example.mg",
    password: "user123456",
    displayName: "Ravelo Marie",
  });
  await db.collection("utilisateurs").doc(user2Auth.uid).set({
    email: "ravelo@example.mg",
    password: "hashed_password_user2",
    id_role: roleUtilisateur.id,
    synchro: true,
  });

  console.log("✅ Utilisateurs créés");

  // 6. CRÉER DES SIGNALEMENTS
  console.log("📍 Création des signalements...");
  const signalements = [];

  const signalementsData = [
    {
      date_creation: "2026-01-15T10:30:00Z",
      surface: 150.5,
      budget: 5000000,
      localisation: new admin.firestore.GeoPoint(-18.8792, 47.5079),
      id_utilisateur_createur: user1Auth.uid,
      id_entreprise: entreprises[0].id,
      synchro: true,
    },
    {
      date_creation: "2026-01-16T14:20:00Z",
      surface: 75.3,
      budget: 2500000,
      localisation: new admin.firestore.GeoPoint(-18.9333, 47.5167),
      id_utilisateur_createur: user2Auth.uid,
      id_entreprise: entreprises[1].id,
      synchro: true,
    },
    {
      date_creation: "2026-01-18T09:00:00Z",
      surface: 200.0,
      budget: 8000000,
      localisation: new admin.firestore.GeoPoint(-18.8955, 47.5235),
      id_utilisateur_createur: user1Auth.uid,
      id_entreprise: entreprises[0].id,
      synchro: true,
    },
  ];

  for (const signalement of signalementsData) {
    const signalementRef = await db.collection("signalements").add(signalement);
    signalements.push({ id: signalementRef.id, ...signalement });
  }
  console.log("✅ Signalements créés");

  // 7. CRÉER DES AVANCEMENTS
  console.log("📈 Création des avancements...");

  await db.collection("avancements_signalement").add({
    id_signalement: signalements[0].id,
    id_utilisateur: managerAuth.uid,
    id_statut_avancement: statuts[0].id,
    date_modification: admin.firestore.Timestamp.fromDate(
      new Date("2026-01-15T11:00:00Z"),
    ),
    synchro: true,
  });

  await db.collection("avancements_signalement").add({
    id_signalement: signalements[1].id,
    id_utilisateur: managerAuth.uid,
    id_statut_avancement: statuts[1].id,
    date_modification: admin.firestore.Timestamp.fromDate(
      new Date("2026-01-16T15:00:00Z"),
    ),
    synchro: true,
  });

  console.log("✅ Avancements créés");

  console.log("\n🎉 Déploiement terminé avec succès !");
  console.log("\n📊 RÉSUMÉ:");
  console.log(`   - 2 rôles`);
  console.log(`   - ${entreprises.length} entreprises`);
  console.log(`   - ${statuts.length} statuts`);
  console.log(`   - 3 utilisateurs`);
  console.log(`   - ${signalements.length} signalements`);
  console.log(`   - 2 avancements`);
  console.log(
    "\n🌐 Consultez Firebase Console: https://console.firebase.google.com",
  );

  process.exit(0);
}

seedData().catch((error) => {
  console.error("❌ Erreur:", error);
  process.exit(1);
});
