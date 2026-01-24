#!/bin/sh
set -e

echo "========================================"
echo "Starting GIS Application Container"
echo "========================================"

# Étape 1: Télécharger/créer la carte
echo "Étape 1/3: Gestion de la carte..."
if [ ! -f "/data/antananarivo.mbtiles" ]; then
    echo "Carte non trouvée, téléchargement..."
    /scripts/download-map.sh
else
    echo "✓ Carte déjà présente"
fi

# Étape 2: Démarrer tileserver en arrière-plan
echo "Étape 2/3: Démarrage du serveur de cartes..."
if [ -f "/data/antananarivo.mbtiles" ]; then
    echo "Démarrage de tileserver sur le port 8081..."
    tileserver-gl --port 8081 /data/antananarivo.mbtiles &
    echo "✓ Tileserver démarré"
else
    echo "⚠ Avertissement: Aucun fichier de carte trouvé"
fi

# Étape 3: Configurer Angular
echo "Étape 3/3: Configuration de l'application Angular..."

# Créer le fichier de configuration s'il n'existe pas
if [ ! -f "/usr/share/nginx/html/assets/config.json" ]; then
    echo "Création du fichier de configuration..."
    mkdir -p /usr/share/nginx/html/assets
    cat > /usr/share/nginx/html/assets/config.json << EOF
{
  "api": {
    "baseUrl": "http://backend:8080"
  },
  "map": {
    "tileserver": "http://localhost:8081",
    "defaultLocation": {
      "lat": -18.8792,
      "lng": 47.5079,
      "zoom": 13
    }
  }
}
EOF
fi

# Remplacer les variables d'environnement si besoin
if [ -f "/usr/share/nginx/html/assets/config.json" ]; then
    echo "Configuration de l'application..."
    envsubst < /usr/share/nginx/html/assets/config.json > /tmp/config.json
    mv /tmp/config.json /usr/share/nginx/html/assets/config.json
fi

echo "========================================"
echo "Démarrage de Nginx..."
echo "URLs:"
echo "  - Application: http://localhost"
echo "  - Tileserver: http://localhost:8081"
echo "  - Backend API: http://localhost:8080"
echo "========================================"

exec "$@"