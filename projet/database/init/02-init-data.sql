-- ===============================
-- = DONNÉES DE TEST MINIMALES
-- ===============================

-- Insertion des rôles
INSERT INTO role (nom, synchro) VALUES 
    ('ADMIN', false),
    ('UTILISATEUR', false),
    ('SUPERVISEUR', false)
ON CONFLICT (nom) DO NOTHING;

-- Insertion des statuts d'avancement
INSERT INTO statut_avancement (nom, valeur, synchro) VALUES 
    ('EN_ATTENTE', 0, false),
    ('EN_COURS', 1, false),
    ('TERMINE', 2, false),
    ('ANNULE', 3, false)
ON CONFLICT (nom) DO NOTHING;

-- Insertion des entreprises de test
INSERT INTO entreprise (nom, synchro) VALUES 
    ('Entreprise Madagascar Routes', false),
    ('Construction Tana', false),
    ('BTP Services', false)
ON CONFLICT (nom) DO NOTHING;

-- Insertion des paramètres système
INSERT INTO parametre (nb_tentatives_connexion, duree_session, synchro) 
SELECT 3, 3600, false
WHERE NOT EXISTS (SELECT 1 FROM parametre LIMIT 1);

-- Insertion d'utilisateurs de test (password: 'password123' hashé avec BCrypt)
-- Note: Vous devriez remplacer ces passwords par des hashs BCrypt réels
INSERT INTO utilisateur (email, password, synchro, id_role) VALUES 
    ('admin@signalisation.mg', 'password123', false, 
     (SELECT id FROM role WHERE nom = 'ADMIN')),
    ('user@signalisation.mg', 'password123', false, 
     (SELECT id FROM role WHERE nom = 'UTILISATEUR')),
    ('superviseur@signalisation.mg', 'password123', false, 
     (SELECT id FROM role WHERE nom = 'SUPERVISEUR'))
ON CONFLICT (email) DO NOTHING;

-- Insertion d'un signalement de test pour Antananarivo
-- Coordonnées: Place de l'Indépendance, Antananarivo (-18.9137, 47.5361)
INSERT INTO signalement (date_creation, surface, budget, localisation, synchro, id_utilisateur_createur, id_entreprise) VALUES 
    (
        '2026-01-20T10:30:00',
        150.5,
        5000000,
        ST_GeogFromText('POINT(47.5361 -18.9137)'),
        false,
        (SELECT id FROM utilisateur WHERE email = 'admin@signalisation.mg'),
        (SELECT id FROM entreprise WHERE nom = 'Entreprise Madagascar Routes')
    )
ON CONFLICT DO NOTHING;

-- Insertion d'un avancement pour le signalement de test
INSERT INTO avancement_signalement (date_modification, synchro, id_utilisateur, id_statut_avancement, id_signalement)
SELECT 
    CURRENT_TIMESTAMP,
    false,
    (SELECT id FROM utilisateur WHERE email = 'admin@signalisation.mg'),
    (SELECT id FROM statut_avancement WHERE nom = 'EN_COURS'),
    (SELECT id FROM signalement ORDER BY id DESC LIMIT 1)
WHERE EXISTS (SELECT 1 FROM signalement);

-- Affichage de confirmation
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Données de test insérées avec succès';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Utilisateurs créés:';
    RAISE NOTICE '  - admin@signalisation.mg (ADMIN)';
    RAISE NOTICE '  - user@signalisation.mg (UTILISATEUR)';
    RAISE NOTICE '  - superviseur@signalisation.mg (SUPERVISEUR)';
    RAISE NOTICE 'Password par défaut: password123';
    RAISE NOTICE '===========================================';
END $$;