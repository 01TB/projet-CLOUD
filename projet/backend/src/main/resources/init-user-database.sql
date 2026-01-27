CREATE DATABASE signalisation_prod;
CREATE USER signalisation_admin WITH PASSWORD 'signalisation_mdp';
GRANT ALL PRIVILEGES ON DATABASE signalisation_prod TO signalisation_admin;
GRANT USAGE ON SCHEMA public TO signalisation_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO signalisation_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO signalisation_admin;
