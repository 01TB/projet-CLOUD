-- -- 1. Insertion des Rôles
-- INSERT INTO roles (nom, synchro) VALUES 
-- ('MANAGER', false),
-- ('UTILISATEUR', false);

-- -- 2. Insertion des Entreprises
-- INSERT INTO entreprises (nom, synchro) VALUES 
-- ('BTP Rénovation', false),
-- ('Eco-Construction', false),
-- ('Travaux Express', false);

-- -- 3. Insertion des Statuts d''avancement
-- INSERT INTO statuts_avancement (nom, valeur, synchro) VALUES 
-- ('NOUVEAU', 0, false),
-- ('EN_COURS', 50, false),
-- ('TERMINE', 100, false);

-- -- 4. Insertion des Paramètres globaux
-- INSERT INTO parametres (nb_tentatives_connexion, duree_session, synchro) VALUES 
-- (5, 3600, false);

-- -- 5. Insertion des Utilisateurs
-- -- Note: Les mots de passe sont en clair ici pour l'exemple, mais devraient être hachés en prod.
-- INSERT INTO utilisateurs (email, password, synchro, id_role) VALUES 
-- ('admin@signalement.com', 'admin123', false, 1), -- ID 1 (Admin)
-- ('jean.dupont@email.com', 'user123', false, 2), -- ID 2 (User)
-- ('marie.curie@email.com', 'user456', false, 2), -- ID 3 (User)
-- ('contact@btp-renovation.com', 'entr123', false, 2), -- ID 2
-- ('spammeur@bad.com', 'badpass', false, 2); -- ID 5 (A bloquer)

-- -- 6. Insertion d'un Utilisateur bloqué
-- INSERT INTO utilisateurs_bloques (date_blocage, synchro, id_utilisateur) VALUES 
-- ('2026-10-25 14:00:00', false, 5);

-- -- 7. Insertion des Signalements
-- -- Note: Localisation utilise la syntaxe PostGIS (Longitude, Latitude). 
-- -- date_creation est un VARCHAR dans votre schéma.
-- INSERT INTO signalements (date_creation, surface, budget, localisation, synchro, id_utilisateur_createur, id_entreprise) VALUES 
-- (
--     '2026-11-01 09:30:00', 
--     45.5, 
--     15000, 
--     ST_GeographyFromText('POINT(47.50 18.90)'), -- Exemple coords Madagascar (Antananarivo approx)
--     false, 
--     2, -- Jean Dupont
--     1  -- BTP Rénovation
-- ),
-- (
--     '2026-11-02 10:15:00', 
--     120.0, 
--     50000, 
--     ST_GeographyFromText('POINT(49.29 -12.28)'), -- Exemple coords (Diego Suarez approx)
--     false, 
--     3, -- Marie Curie
--     2  -- Eco-Construction
-- ),
-- (
--     '2026-11-03 16:00:00', 
--     15.0, 
--     2000, 
--     ST_GeographyFromText('POINT(47.52 18.92)'), 
--     false, 
--     2, -- Jean Dupont
--     3  -- Travaux Express
-- );

-- -- 8. Insertion de l'historique d'avancement (Avancement Signalement)
-- INSERT INTO avancements_signalement (date_modification, synchro, id_utilisateur, id_statut_avancement, id_signalement) VALUES 
-- -- Historique pour le signalement 1
-- (NOW() - INTERVAL '3 days', false, 2, 1, 1), -- Créé par l'utilisateur (Statut Nouveau)
-- (NOW() - INTERVAL '2 days', false, 1, 2, 1), -- Passé en analyse par l'admin

-- -- Historique pour le signalement 2
-- (NOW() - INTERVAL '5 days', false, 3, 1, 2), -- Créé
-- (NOW() - INTERVAL '4 days', false, 1, 2, 2), -- En analyse
-- (NOW() - INTERVAL '1 day', false, 4, 3, 2);  -- Terminé)

INSERT INTO mvt_prix_signalements (date_creation, montant) VALUES 
('2026-11-01', 15000);