#!/bin/bash
set -e

echo "=========================================="
echo "🚀 TileServer GL - Antananarivo Offline"
echo "=========================================="

# Vérifier et télécharger la carte si nécessaire
if [ ! -f "/data/antananarivo.mbtiles" ]; then
    echo "🗺️  Carte non trouvée, téléchargement en cours..."
    /download-map.sh
else
    echo "✅ Carte trouvée: /data/antananarivo.mbtiles"
    echo "📊 Taille: $(du -h /data/antananarivo.mbtiles | cut -f1)"
fi

# Vérifier la configuration
if [ ! -f "/data/config.json" ]; then
    echo "⚠️  Configuration non trouvée, utilisation de la configuration par défaut"
    cp /app/config.json.default /data/config.json
fi

echo "🌍 Démarrage du serveur de tuiles..."
echo "🔗 URL: http://localhost:8080"
echo "📌 Carte: antananarivo"
echo "=========================================="

# Lancer TileServer GL
exec tileserver-gl-light \
    --config /data/config.json \
    --verbose \
    --public_url http://localhost:8080