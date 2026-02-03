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

  // Demander confirmation
  console.log("\n⏸️  Appuyez sur Ctrl+C pour annuler...");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // 1. CRÉER LES RÔLES
  console.log("\n📝 Création des rôles...");
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
    duree_session: 3600,
    synchro: true,
  });
  console.log("✅ Paramètres créés");

  // 5. CRÉER LES UTILISATEURS (avec Firebase Auth)
  console.log("👥 Création des utilisateurs...");

  // Administrateur
  const adminAuth = await auth.createUser({
    email: "admin@signalement.com",
    password: "Admin2024!Secure", // ⚠️ Changez ce mot de passe après !
    displayName: "Administrateur",
  });
  await db.collection("utilisateurs").doc(adminAuth.uid).set({
    email: "admin@signalement.com",
    password: "hashed_password_admin",
    id_role: roleAdministrateur.id,
    synchro: true,
  });

  // Jean Dupont (Utilisateur)
  const user1Auth = await auth.createUser({
    email: "jean.dupont@email.com",
    password: "User123!Secure",
    displayName: "Jean Dupont",
  });
  await db.collection("utilisateurs").doc(user1Auth.uid).set({
    email: "jean.dupont@email.com",
    password: "hashed_password_user1",
    id_role: roleUtilisateur.id,
    synchro: true,
  });

  // Marie Curie (Utilisateur)
  const user2Auth = await auth.createUser({
    email: "marie.curie@email.com",
    password: "User456!Secure",
    displayName: "Marie Curie",
  });
  await db.collection("utilisateurs").doc(user2Auth.uid).set({
    email: "marie.curie@email.com",
    password: "hashed_password_user2",
    id_role: roleUtilisateur.id,
    synchro: true,
  });

  // Entreprise BTP Rénovation
  const entrepriseAuth = await auth.createUser({
    email: "contact@btp-renovation.com",
    password: "Entr123!Secure",
    displayName: "BTP Rénovation",
  });
  await db.collection("utilisateurs").doc(entrepriseAuth.uid).set({
    email: "contact@btp-renovation.com",
    password: "hashed_password_entreprise",
    id_role: roleEntreprise.id,
    synchro: true,
  });

  // Spammeur (à bloquer)
  const user3Auth = await auth.createUser({
    email: "spammeur@bad.com",
    password: "BadPass123!",
    displayName: "Spammeur",
  });
  await db.collection("utilisateurs").doc(user3Auth.uid).set({
    email: "spammeur@bad.com",
    password: "hashed_password_user3",
    id_role: roleUtilisateur.id,
    synchro: true,
  });

  console.log("✅ Utilisateurs créés");

  // 6. BLOQUER UN UTILISATEUR
  console.log("🚫 Blocage d'utilisateur...");
  await db.collection("utilisateurs_bloques").add({
    id_utilisateur: user3Auth.uid,
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
      localisation: new admin.firestore.GeoPoint(18.9, 47.5),
      id_utilisateur_createur: user1Auth.uid,
      id_entreprise: entreprises[0].id,
      synchro: true,
    },
    {
      date_creation: "2023-11-02T10:15:00Z",
      surface: 120.0,
      budget: 50000,
      localisation: new admin.firestore.GeoPoint(-12.28, 49.29),
      id_utilisateur_createur: user2Auth.uid,
      id_entreprise: entreprises[1].id,
      synchro: true,
    },
    {
      date_creation: "2023-11-03T16:00:00Z",
      surface: 15.0,
      budget: 2000,
      localisation: new admin.firestore.GeoPoint(18.92, 47.52),
      id_utilisateur_createur: user1Auth.uid,
      id_entreprise: entreprises[2].id,
      synchro: true,
    },
  ];

  for (const signalement of signalementsData) {
    const signalementRef = await db.collection("signalements").add(signalement);
    signalements.push({ id: signalementRef.id, ...signalement });
  }
  console.log("✅ Signalements créés");

  // 8. CRÉER DES AVANCEMENTS
  console.log("📈 Création des avancements...");

  const now = new Date();

  // Historique pour le signalement 1 (2 avancements)
  await db.collection("avancements_signalement").add({
    id_signalement: signalements[0].id,
    id_utilisateur: user1Auth.uid,
    id_statut_avancement: statuts[0].id,
    date_modification: admin.firestore.Timestamp.fromDate(
      new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    ),
    synchro: true,
  });

  await db.collection("avancements_signalement").add({
    id_signalement: signalements[0].id,
    id_utilisateur: adminAuth.uid,
    id_statut_avancement: statuts[1].id,
    date_modification: admin.firestore.Timestamp.fromDate(
      new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    ),
    synchro: true,
  });

  // Historique pour le signalement 2 (3 avancements)
  await db.collection("avancements_signalement").add({
    id_signalement: signalements[1].id,
    id_utilisateur: user2Auth.uid,
    id_statut_avancement: statuts[0].id,
    date_modification: admin.firestore.Timestamp.fromDate(
      new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    ),
    synchro: true,
  });

  await db.collection("avancements_signalement").add({
    id_signalement: signalements[1].id,
    id_utilisateur: adminAuth.uid,
    id_statut_avancement: statuts[1].id,
    date_modification: admin.firestore.Timestamp.fromDate(
      new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    ),
    synchro: true,
  });

  await db.collection("avancements_signalement").add({
    id_signalement: signalements[1].id,
    id_utilisateur: entrepriseAuth.uid,
    id_statut_avancement: statuts[2].id,
    date_modification: admin.firestore.Timestamp.fromDate(
      new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    ),
    synchro: true,
  });

  console.log("✅ Avancements créés");

  console.log("\n🎉 Déploiement terminé avec succès !");
  console.log("\n📊 RÉSUMÉ:");
  console.log(`   - 3 rôles (Administrateur, Utilisateur, Entreprise)`);
  console.log(`   - ${entreprises.length} entreprises`);
  console.log(`   - ${statuts.length} statuts`);
  console.log(`   - 5 utilisateurs (dont 1 bloqué)`);
  console.log(`   - ${signalements.length} signalements`);
  console.log(`   - 5 avancements`);
  console.log(
    "\n🌐 Consultez Firebase Console: https://console.firebase.google.com/project/projet-cloud-e2146/firestore",
  );

  process.exit(0);
}

seedData().catch((error) => {
  console.error("❌ Erreur:", error);
  process.exit(1);
});
