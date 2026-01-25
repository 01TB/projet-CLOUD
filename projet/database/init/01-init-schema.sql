-- ===============================
-- = INITIALISATION DE LA BASE
-- ===============================

-- Activation de l'extension PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Création des tables
CREATE TABLE IF NOT EXISTS role(
   id SERIAL,
   nom VARCHAR(50) NOT NULL,
   synchro BOOLEAN NOT NULL DEFAULT false,
   PRIMARY KEY(id),
   UNIQUE(nom)
);

CREATE TABLE IF NOT EXISTS entreprise(
   id SERIAL,
   nom VARCHAR(255) NOT NULL,
   synchro BOOLEAN NOT NULL DEFAULT false,
   PRIMARY KEY(id),
   UNIQUE(nom)
);

CREATE TABLE IF NOT EXISTS statut_avancement(
   id SERIAL,
   nom VARCHAR(50) NOT NULL,
   valeur INTEGER NOT NULL,
   synchro BOOLEAN NOT NULL DEFAULT false,
   PRIMARY KEY(id),
   UNIQUE(nom),
   UNIQUE(valeur)
);

CREATE TABLE IF NOT EXISTS parametre(
   id SERIAL,
   nb_tentatives_connexion INTEGER NOT NULL DEFAULT 3,
   duree_session INTEGER NOT NULL DEFAULT 3600,
   synchro BOOLEAN NOT NULL DEFAULT false,
   PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS utilisateur(
   id SERIAL,
   email VARCHAR(255) NOT NULL,
   password VARCHAR(255) NOT NULL,
   synchro BOOLEAN NOT NULL DEFAULT false,
   id_role INTEGER NOT NULL,
   PRIMARY KEY(id),
   UNIQUE(email),
   FOREIGN KEY(id_role) REFERENCES role(id)
);

CREATE TABLE IF NOT EXISTS utilisateur_bloque(
   id SERIAL,
   date_blocage TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   synchro BOOLEAN NOT NULL DEFAULT false,
   id_utilisateur INTEGER NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_utilisateur) REFERENCES utilisateur(id)
);

CREATE TABLE IF NOT EXISTS signalement(
   id SERIAL,
   date_creation VARCHAR(50) NOT NULL,
   surface DOUBLE PRECISION NOT NULL,
   budget INTEGER NOT NULL,
   localisation GEOGRAPHY NOT NULL,
   synchro BOOLEAN NOT NULL DEFAULT false,
   id_utilisateur_createur INTEGER NOT NULL,
   id_entreprise INTEGER NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_utilisateur_createur) REFERENCES utilisateur(id),
   FOREIGN KEY(id_entreprise) REFERENCES entreprise(id)
);

CREATE TABLE IF NOT EXISTS avancement_signalement(
   id SERIAL,
   date_modification TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   synchro BOOLEAN NOT NULL DEFAULT false,
   id_utilisateur INTEGER NOT NULL,
   id_statut_avancement INTEGER NOT NULL,
   id_signalement INTEGER NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_utilisateur) REFERENCES utilisateur(id),
   FOREIGN KEY(id_statut_avancement) REFERENCES statut_avancement(id),
   FOREIGN KEY(id_signalement) REFERENCES signalement(id)
);

-- Création d'index pour les performances
CREATE INDEX IF NOT EXISTS idx_utilisateur_email ON utilisateur(email);
CREATE INDEX IF NOT EXISTS idx_signalement_localisation ON signalement USING GIST(localisation);
CREATE INDEX IF NOT EXISTS idx_signalement_entreprise ON signalement(id_entreprise);
CREATE INDEX IF NOT EXISTS idx_signalement_createur ON signalement(id_utilisateur_createur);
CREATE INDEX IF NOT EXISTS idx_avancement_signalement ON avancement_signalement(id_signalement);

-- Affichage de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Schéma de base de données initialisé avec succès';
END $$;