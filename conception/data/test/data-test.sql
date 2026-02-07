-- 1. Insertion des Rôles
INSERT INTO role (nom, synchro) VALUES 
('Administrateur', true),
('Utilisateur', true);

-- 2. Insertion des Entreprises
INSERT INTO entreprise (nom, synchro) VALUES 
('BTP Rénovation', true),
('Eco-Construction', true),
('Travaux Express', true);

-- 3. Insertion des Statuts d''avancement
INSERT INTO statut_avancement (nom, valeur, synchro) VALUES 
('Nouveau', 0, true),
('En cours', 50, true),
('Terminé', 100, true);

-- 4. Insertion des Paramètres globaux
INSERT INTO parametre (nb_tentatives_connexion, duree_session, synchro) VALUES 
(5, 3600, true);

-- 5. Insertion des Utilisateurs
-- Note: Les mots de passe sont en clair ici pour l'exemple, mais devraient être hachés en prod.
INSERT INTO utilisateur (email, password, synchro, id_role) VALUES 
('admin@signalement.com', 'admin123', true, 1), -- ID 1 (Admin)
('jean.dupont@email.com', 'user123', true, 2), -- ID 2 (User)
('marie.curie@email.com', 'user456', true, 2), -- ID 3 (User)
('contact@btp-renovation.com', 'entr123', true, 2), -- ID 2
('spammeur@bad.com', 'badpass', true, 2); -- ID 5 (A bloquer)

-- 6. Insertion d'un Utilisateur bloqué
INSERT INTO utilisateur_bloque (date_blocage, synchro, id_utilisateur) VALUES 
('2023-10-25 14:00:00', true, 5);

-- 7. Insertion des Signalements
-- Note: Localisation utilise la syntaxe PostGIS (Longitude, Latitude). 
-- date_creation est un VARCHAR dans votre schéma.
INSERT INTO signalement (date_creation, surface, budget, localisation, synchro, id_utilisateur_createur, id_entreprise) VALUES 
(
    '2023-11-01 09:30:00', 
    45.5, 
    15000, 
    ST_GeographyFromText('POINT(47.50 18.90)'), -- Exemple coords Madagascar (Antananarivo approx)
    true, 
    2, -- Jean Dupont
    1  -- BTP Rénovation
),
(
    '2023-11-02 10:15:00', 
    120.0, 
    50000, 
    ST_GeographyFromText('POINT(49.29 -12.28)'), -- Exemple coords (Diego Suarez approx)
    true, 
    3, -- Marie Curie
    2  -- Eco-Construction
),
(
    '2023-11-03 16:00:00', 
    15.0, 
    2000, 
    ST_GeographyFromText('POINT(47.52 18.92)'), 
    true, 
    2, -- Jean Dupont
    3  -- Travaux Express
);

-- 8. Insertion de l'historique d'avancement (Avancement Signalement)
INSERT INTO avancement_signalement (date_modification, synchro, id_utilisateur, id_statut_avancement, id_signalement) VALUES 
-- Historique pour le signalement 1
(NOW() - INTERVAL '3 days', true, 2, 1, 1), -- Créé par l'utilisateur (Statut Nouveau)
(NOW() - INTERVAL '2 days', true, 1, 2, 1), -- Passé en analyse par l'admin

-- Historique pour le signalement 2
(NOW() - INTERVAL '5 days', true, 3, 1, 2), -- Créé
(NOW() - INTERVAL '4 days', true, 1, 2, 2), -- En analyse
(NOW() - INTERVAL '1 day', true, 4, 3, 2);  -- Terminé)