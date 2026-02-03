-- =====================================================
-- Données de test pour le système de signalement
-- Générées à partir de seed-production.js / format_pull_firebase.json
-- =====================================================

-- Nettoyage des tables (dans l'ordre des dépendances)
TRUNCATE TABLE avancement_signalement CASCADE;
TRUNCATE TABLE signalement CASCADE;
TRUNCATE TABLE utilisateur_bloque CASCADE;
TRUNCATE TABLE utilisateur CASCADE;
TRUNCATE TABLE parametre CASCADE;
TRUNCATE TABLE statut_avancement CASCADE;
TRUNCATE TABLE entreprise CASCADE;
TRUNCATE TABLE role CASCADE;

-- Réinitialiser les séquences
ALTER SEQUENCE role_id_seq RESTART WITH 1;
ALTER SEQUENCE entreprise_id_seq RESTART WITH 1;
ALTER SEQUENCE statut_avancement_id_seq RESTART WITH 1;
ALTER SEQUENCE parametre_id_seq RESTART WITH 1;
ALTER SEQUENCE utilisateur_id_seq RESTART WITH 1;
ALTER SEQUENCE utilisateur_bloque_id_seq RESTART WITH 1;
ALTER SEQUENCE signalement_id_seq RESTART WITH 1;
ALTER SEQUENCE avancement_signalement_id_seq RESTART WITH 1;

-- =====================================================
-- 1. ROLES
-- =====================================================
INSERT INTO role (nom, synchro) VALUES
('Administrateur', true),
('Utilisateur', true),
('Entreprise', true);

-- =====================================================
-- 2. ENTREPRISES
-- =====================================================
INSERT INTO entreprise (nom, synchro) VALUES
('BTP Rénovation', true),
('Eco-Construction', true),
('Travaux Express', true);

-- =====================================================
-- 3. STATUTS D'AVANCEMENT
-- =====================================================
INSERT INTO statut_avancement (nom, valeur, synchro) VALUES
('Nouveau', 0, true),
('En cours d''analyse', 25, true),
('Travaux commencés', 50, true),
('Travaux terminés', 100, true),
('Rejeté', -1, true);

-- =====================================================
-- 4. PARAMETRES
-- =====================================================
INSERT INTO parametre (nb_tentatives_connexion, duree_session, synchro) VALUES
(5, 3600, true);

-- =====================================================
-- 5. UTILISATEURS
-- Firebase UID → PostgreSQL ID mapping:
--   firebase_auth_uid_admin      → 1
--   firebase_auth_uid_user1      → 2
--   firebase_auth_uid_user2      → 3
--   firebase_auth_uid_entreprise → 4
--   firebase_auth_uid_spammeur   → 5
-- =====================================================
INSERT INTO utilisateur (email, password, synchro, id_role) VALUES
('admin@signalement.com', 'hashed_password_admin', true, 1),
('jean.dupont@email.com', 'hashed_password_user1', true, 2),
('marie.curie@email.com', 'hashed_password_user2', true, 2),
('contact@btp-renovation.com', 'hashed_password_entreprise', true, 3),
('spammeur@bad.com', 'hashed_password_user3', true, 2);

-- =====================================================
-- 6. UTILISATEURS BLOQUES
-- =====================================================
INSERT INTO utilisateur_bloque (date_blocage, synchro, id_utilisateur) VALUES
('2023-10-25 14:00:00', true, 5);

-- =====================================================
-- 7. SIGNALEMENTS
-- Note: localisation utilise PostGIS GEOGRAPHY type
-- Format: ST_GeogFromText('POINT(longitude latitude)')
-- =====================================================
INSERT INTO signalement (date_creation, surface, budget, localisation, synchro, id_utilisateur_createur, id_entreprise) VALUES
('2023-11-01T09:30:00Z', 45.5, 15000, ST_GeogFromText('POINT(47.5 18.9)'), true, 2, 1),
('2023-11-02T10:15:00Z', 120.0, 50000, ST_GeogFromText('POINT(49.29 -12.28)'), true, 3, 2),
('2023-11-03T16:00:00Z', 15.0, 2000, ST_GeogFromText('POINT(47.52 18.92)'), true, 2, 3);

-- =====================================================
-- 8. AVANCEMENTS SIGNALEMENT
-- =====================================================
INSERT INTO avancement_signalement (date_modification, synchro, id_utilisateur, id_statut_avancement, id_signalement) VALUES
-- Historique signalement 1 (2 avancements)
('2025-02-01 00:00:00', true, 2, 1, 1),
('2025-02-02 00:00:00', true, 1, 2, 1),

-- Historique signalement 2 (3 avancements)
('2025-01-30 00:00:00', true, 3, 1, 2),
('2025-01-31 00:00:00', true, 1, 2, 2),
('2025-02-03 00:00:00', true, 4, 3, 2);

-- =====================================================
-- VERIFICATION DES DONNEES
-- =====================================================

-- Afficher le nombre d'enregistrements par table
SELECT 'role' as table_name, COUNT(*) as count FROM role
UNION ALL
SELECT 'entreprise', COUNT(*) FROM entreprise
UNION ALL
SELECT 'statut_avancement', COUNT(*) FROM statut_avancement
UNION ALL
SELECT 'parametre', COUNT(*) FROM parametre
UNION ALL
SELECT 'utilisateur', COUNT(*) FROM utilisateur
UNION ALL
SELECT 'utilisateur_bloque', COUNT(*) FROM utilisateur_bloque
UNION ALL
SELECT 'signalement', COUNT(*) FROM signalement
UNION ALL
SELECT 'avancement_signalement', COUNT(*) FROM avancement_signalement;

-- =====================================================
-- REQUETES DE VERIFICATION SUPPLEMENTAIRES
-- =====================================================

-- Vérifier les signalements avec leurs informations complètes
SELECT 
    s.id,
    s.date_creation,
    s.surface,
    s.budget,
    ST_AsText(s.localisation::geometry) as localisation_wkt,
    u.email as createur_email,
    e.nom as entreprise_nom
FROM signalement s
JOIN utilisateur u ON s.id_utilisateur_createur = u.id
JOIN entreprise e ON s.id_entreprise = e.id
ORDER BY s.id;

-- Vérifier l'historique des avancements par signalement
SELECT 
    s.id as signalement_id,
    a.date_modification,
    u.email as modificateur_email,
    st.nom as statut_nom,
    st.valeur as statut_valeur
FROM avancement_signalement a
JOIN signalement s ON a.id_signalement = s.id
JOIN utilisateur u ON a.id_utilisateur = u.id
JOIN statut_avancement st ON a.id_statut_avancement = st.id
ORDER BY s.id, a.date_modification;

-- Vérifier les utilisateurs avec leurs rôles
SELECT 
    u.id,
    u.email,
    r.nom as role_nom,
    CASE WHEN ub.id IS NOT NULL THEN 'Oui' ELSE 'Non' END as bloque
FROM utilisateur u
JOIN role r ON u.id_role = r.id
LEFT JOIN utilisateur_bloque ub ON u.id = ub.id_utilisateur
ORDER BY u.id;

-- =====================================================
-- RESUME DES DONNEES
-- =====================================================
/*
📊 RÉSUMÉ DES DONNÉES INSÉRÉES:
   - 3 rôles (Administrateur, Utilisateur, Entreprise)
   - 3 entreprises (BTP Rénovation, Eco-Construction, Travaux Express)
   - 5 statuts d'avancement (0%, 25%, 50%, 100%, -1%)
   - 1 configuration de paramètres
   - 5 utilisateurs (dont 1 bloqué)
   - 1 utilisateur bloqué (spammeur@bad.com)
   - 3 signalements avec coordonnées GPS
   - 5 avancements (historique des changements de statut)

📝 NOTES:
   - Les IDs Firebase UID ont été mappés vers des IDs séquentiels PostgreSQL
   - Les Timestamps Firebase ont été convertis en TIMESTAMP PostgreSQL
   - Les GeoPoint Firebase ont été convertis en GEOGRAPHY PostGIS
   - Les données correspondent exactement à seed-production.js

🔗 MAPPING IDS UTILISATEURS (Firebase → PostgreSQL):
   firebase_auth_uid_admin      → 1
   firebase_auth_uid_user1      → 2
   firebase_auth_uid_user2      → 3
   firebase_auth_uid_entreprise → 4
   firebase_auth_uid_spammeur   → 5
*/
