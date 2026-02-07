-- Activer PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Table role
CREATE TABLE IF NOT EXISTS role (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    synchro BOOLEAN DEFAULT FALSE NOT NULL
);

-- Table utilisateur
CREATE TABLE IF NOT EXISTS utilisateur (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    synchro BOOLEAN DEFAULT FALSE NOT NULL,
    id_role INTEGER NOT NULL REFERENCES role(id),
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table utilisateur_bloque
CREATE TABLE IF NOT EXISTS utilisateur_bloque (
    id SERIAL PRIMARY KEY,
    date_blocage TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    synchro BOOLEAN DEFAULT FALSE NOT NULL,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table entreprise
CREATE TABLE IF NOT EXISTS entreprise (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    synchro BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table signalement
CREATE TABLE IF NOT EXISTS signalement (
    id SERIAL PRIMARY KEY,
    date_creation VARCHAR(50) NOT NULL,
    surface DOUBLE PRECISION,
    budget INTEGER,
    localisation GEOGRAPHY(POINT, 4326) NOT NULL,
    synchro BOOLEAN DEFAULT FALSE NOT NULL,
    id_utilisateur_createur INTEGER NOT NULL REFERENCES utilisateur(id),
    id_entreprise INTEGER REFERENCES entreprise(id),
    description TEXT,
    adresse VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table statut_avancement
CREATE TABLE IF NOT EXISTS statut_avancement (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    valeur INTEGER NOT NULL,
    synchro BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table avancement_signalement
CREATE TABLE IF NOT EXISTS avancement_signalement (
    id SERIAL PRIMARY KEY,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    synchro BOOLEAN DEFAULT FALSE NOT NULL,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateur(id),
    id_statut_avancement INTEGER NOT NULL REFERENCES statut_avancement(id),
    id_signalement INTEGER NOT NULL REFERENCES signalement(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création des index pour les performances
CREATE INDEX idx_signalement_localisation ON signalement USING GIST(localisation);
CREATE INDEX idx_signalement_utilisateur ON signalement(id_utilisateur_createur);
CREATE INDEX idx_signalement_entreprise ON signalement(id_entreprise);
CREATE INDEX idx_avancement_signalement ON avancement_signalement(id_signalement);
CREATE INDEX idx_utilisateur_email ON utilisateur(email);
CREATE INDEX idx_utilisateur_role ON utilisateur(id_role);