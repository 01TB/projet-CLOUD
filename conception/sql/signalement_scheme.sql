CREATE TABLE role(
   id SERIAL,
   nom VARCHAR(50)  NOT NULL,
   synchro BOOLEAN NOT NULL,
   PRIMARY KEY(id),
   UNIQUE(nom)
);

CREATE TABLE entreprise(
   id SERIAL,
   nom VARCHAR(255)  NOT NULL,
   synchro BOOLEAN NOT NULL,
   PRIMARY KEY(id),
   UNIQUE(nom)
);

CREATE TABLE statut_avancement(
   id SERIAL,
   nom VARCHAR(50)  NOT NULL,
   valeur INTEGER NOT NULL,
   synchro BOOLEAN NOT NULL,
   PRIMARY KEY(id),
   UNIQUE(nom),
   UNIQUE(valeur)
);

CREATE TABLE parametre(
   id SERIAL,
   nb_tentatives_connexion INTEGER NOT NULL,
   duree_session INTEGER NOT NULL,
   synchro BOOLEAN NOT NULL,
   PRIMARY KEY(id)
);

CREATE TABLE utilisateur(
   id SERIAL,
   email VARCHAR(255)  NOT NULL,
   password VARCHAR(255)  NOT NULL,
   synchro BOOLEAN NOT NULL,
   id_role INTEGER NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_role) REFERENCES role(id)
);

CREATE TABLE utilisateur_bloque(
   id SERIAL,
   date_blocage TIMESTAMP NOT NULL,
   synchro BOOLEAN NOT NULL,
   id_utilisateur INTEGER NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_utilisateur) REFERENCES utilisateur(id)
);

CREATE TABLE signalement(
   id SERIAL,
   date_creation VARCHAR(50)  NOT NULL,
   surface DOUBLE PRECISION NOT NULL,
   budget INTEGER NOT NULL,
   localisation GEOGRAPHY NOT NULL,
   synchro BOOLEAN NOT NULL,
   id_utilisateur_createur INTEGER NOT NULL,
   id_entreprise INTEGER NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_utilisateur_createur) REFERENCES utilisateur(id),
   FOREIGN KEY(id_entreprise) REFERENCES entreprise(id)
);

CREATE TABLE avancement_signalement(
   id SERIAL,
   date_modification TIMESTAMP NOT NULL,
   synchro BOOLEAN NOT NULL,
   id_utilisateur INTEGER NOT NULL,
   id_statut_avancement INTEGER NOT NULL,
   id_signalement INTEGER NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_utilisateur) REFERENCES utilisateur(id),
   FOREIGN KEY(id_statut_avancement) REFERENCES statut_avancement(id),
   FOREIGN KEY(id_signalement) REFERENCES signalement(id)
);

CREATE TABLE signalement_photo(
   id SERIAL,
   photo TEXT NOT NULL,
   synchro BOOLEAN NOT NULL,
   id_signalement INTEGER NOT NULL,
   PRIMARY KEY(id),
   FOREIGN KEY(id_signalement) REFERENCES signalement(id)
);
