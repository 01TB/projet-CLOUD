#!/bin/bash
set -e

echo "========================================"
echo "Téléchargement de la carte d'Antananarivo"
echo "========================================"

# Créer le dossier si nécessaire
mkdir -p /data

OUTPUT_FILE="/data/antananarivo.mbtiles"

# Fonction pour créer une carte basique
create_basic_map() {
    echo "Création d'une carte de démonstration..."
    
    # Créer un fichier MBTiles avec quelques tuiles de test
    sqlite3 "$OUTPUT_FILE" "
        -- Créer les tables
        CREATE TABLE metadata (name text, value text);
        CREATE TABLE tiles (zoom_level integer, tile_column integer, tile_row integer, tile_data blob);
        
        -- Métadonnées
        INSERT INTO metadata VALUES ('name', 'Antananarivo Demo');
        INSERT INTO metadata VALUES ('type', 'baselayer');
        INSERT INTO metadata VALUES ('version', '1.0');
        INSERT INTO metadata VALUES ('description', 'Carte de démonstration pour Antananarivo, Madagascar');
        INSERT INTO metadata VALUES ('format', 'png');
        INSERT INTO metadata VALUES ('bounds', '-18.966,47.40,-18.792,47.59');
        INSERT INTO metadata VALUES ('center', '-18.8792,47.5079,13');
        INSERT INTO metadata VALUES ('minzoom', '10');
        INSERT INTO metadata VALUES ('maxzoom', '16');
        INSERT INTO metadata VALUES ('attribution', '© Démo GIS Madagascar');
        
        -- Créer une tuile de base (carré bleu)
        INSERT INTO tiles VALUES (
            13,
            4801,
            3201,
            X'89504e470d0a1a0a0000000d49484452000001000000010008060000005c72a866000000017352474200aece1ce90000000467414d410000b18f0bfc6105000000097048597300000ec300000ec301c76fa8640000001c49444154785eedc101010000008220ffaf6e484001000000000000000000000000000000'
        );
    "
    
    echo "✅ Carte de démonstration créée : $OUTPUT_FILE"
}

# Essayer de télécharger une carte de test
echo "Tentative de téléchargement d'une carte de test..."
if command -v wget &> /dev/null; then
    # URL d'une carte MBTiles de test plus petite
    TEST_MAP_URL="https://github.com/maptiler/tileserver-gl/raw/master/test/data/world_cities.mbtiles"
    
    if wget -q --spider "$TEST_MAP_URL"; then
        echo "Téléchargement de la carte de test..."
        wget -q -O "$OUTPUT_FILE" "$TEST_MAP_URL"
        if [ $? -eq 0 ]; then
            echo "✅ Carte de test téléchargée avec succès !"
        else
            echo "⚠ Téléchargement échoué, création d'une carte locale..."
            create_basic_map
        fi
    else
        echo "⚠ URL non accessible, création d'une carte locale..."
        create_basic_map
    fi
else
    echo "⚠ wget non disponible, création d'une carte locale..."
    create_basic_map
fi

# Vérifier si le fichier a été créé
if [ -f "$OUTPUT_FILE" ]; then
    echo "📊 Informations sur la carte :"
    echo "   Fichier: $OUTPUT_FILE"
    echo "   Taille: $(du -h "$OUTPUT_FILE" | cut -f1)"
    
    # Extraire les métadonnées
    if command -v sqlite3 &> /dev/null; then
        echo "   Métadonnées:"
        sqlite3 "$OUTPUT_FILE" "SELECT * FROM metadata;" 2>/dev/null | while read line; do
            echo "     $line"
        done || true
    fi
else
    echo "❌ Échec critique: Impossible de créer la carte"
    exit 1
fi

echo "========================================"
echo "✅ Téléchargement/creation terminé avec succès !"
echo "========================================"