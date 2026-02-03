-- Données initiales pour les rôles
INSERT INTO role (nom) VALUES 
('Manager'),
('Utilisateur'),
('Visiteur')
ON CONFLICT DO NOTHING;

-- Données initiales pour les statuts d'avancement
INSERT INTO statut_avancement (nom, valeur) VALUES 
('Nouveau', 0),
('En cours', 50),
('Terminé', 100)
ON CONFLICT DO NOTHING;

-- Créer un compte manager par défaut (mot de passe: manager123)
INSERT INTO utilisateur (email, password, id_role) VALUES 
('manager@roadwork.local', '$2a$10$YourHashedPasswordHere', 1)
ON CONFLICT (email) DO NOTHING;

-- Données d'exemple pour les entreprises
INSERT INTO entreprise (nom) VALUES 
('Entreprise Travaux Publics Antananarivo'),
('Société de Construction Malagasy'),
('InfraMad')
ON CONFLICT DO NOTHING;