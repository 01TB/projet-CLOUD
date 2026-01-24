#!/bin/bash
# Script simplifié qui utilise OpenStreetMap direct
echo "Téléchargement de la carte d'Antananarivo..."

# Créer un répertoire temporaire
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# Télécharger des tuiles OSM pour Antananarivo
ZOOMS="10 11 12 13 14 15 16"
for zoom in $ZOOMS; do
    echo "Zoom level $zoom..."
    mkdir -p "$zoom"
    
    # Calculer les coordonnées des tuiles pour le bounding box
    # Approximation simple pour Antananarivo
    if [ "$zoom" -eq 13 ]; then
        X_MIN=4800
        X_MAX=4802
        Y_MIN=3200
        Y_MAX=3202
        for x in $(seq $X_MIN $X_MAX); do
            for y in $(seq $Y_MIN $Y_MAX); do
                wget -q -O "${zoom}/${x}-${y}.png" "https://tile.openstreetmap.org/${zoom}/${x}/${y}.png"
            done
        done
    fi
done

echo "Carte téléchargée dans $TEMP_DIR"