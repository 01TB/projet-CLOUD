# Connexion à la base
docker exec -it postgres-signalisation psql -U signalisation_admin -d signalisation_prod

# Vérification de PostGIS
SELECT PostGIS_version();

# Liste des tables
\dt


# Créer un backup
docker exec postgres-signalisation pg_dump -U signalisation_admin signalisation_prod > database/backup/backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurer un backup
docker exec -i postgres-signalisation psql -U signalisation_admin signalisation_prod < database/backup/votre_backup.sql

# Arrêter et supprimer tous les conteneurs et volumes
docker-compose down -v

# Redémarrer (réinitialise la base)
docker-compose up --build -d


🔧 Changement d'environnement
Mode développement
bash# Dans .env, changez:
SPRING_PROFILE=dev

# Redémarrez le backend
docker-compose restart backend
Mode production
bash# Dans .env, changez:
SPRING_PROFILE=prod

# Redémarrez le backend
docker-compose restart backend
📊 Monitoring
bash# Logs de tous les services
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f database

# Statistiques des conteneurs
docker stats


🔍 Résolution de problèmes
Le backend ne démarre pas
bash# Vérifiez que la base est prête
docker-compose logs database

# Vérifiez les variables d'environnement
docker-compose exec backend env | grep DB_
Erreur de connexion à la base
bash# Testez la connexion depuis le backend
docker-compose exec backend ping database

# Vérifiez que PostgreSQL écoute
docker-compose exec database pg_isready -U signalisation_admin
PostGIS ne fonctionne pas
bash# Vérifiez l'extension
docker exec -it postgres-signalisation psql -U signalisation_admin -d signalisation_prod -c "SELECT PostGIS_version();"