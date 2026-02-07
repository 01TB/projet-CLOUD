-- Données initiales pour les rôles
INSERT INTO role (nom, synchro) VALUES 
('Manager', false),
('Utilisateur', false),
('Visiteur', false)
ON CONFLICT DO NOTHING;

-- Données initiales pour les statuts d'avancement
INSERT INTO statut_avancement (nom, valeur, synchro) VALUES 
('Nouveau', 0, false),
('En cours', 50, false),
('Terminé', 100, false)
ON CONFLICT DO NOTHING;

-- Créer un compte manager par défaut (mot de passe: manager123)
INSERT INTO utilisateur (email, password, synchro, id_role) VALUES 
('manager@roadwork.local', '$2a$10$YourHashedPasswordHere', false, 1)
ON CONFLICT (email) DO NOTHING;

-- Données d'exemple pour les entreprises
INSERT INTO entreprise (nom, synchro) VALUES 
('Entreprise Travaux Publics Antananarivo', false),
('Société de Construction Malagasy', false),
('InfraMad', false)
ON CONFLICT DO NOTHING;