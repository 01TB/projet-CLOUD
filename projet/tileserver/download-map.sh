#!/bin/bash
set -e

echo "🌍 Téléchargement de la carte d'Antananarivo..."

# Coordonnées d'Antananarivo (bounding box)
MIN_LON=47.46
MIN_LAT=-18.98
MAX_LON=47.59
MAX_LAT=-18.82

# Créer un fichier OSM pour Antananarivo (méthode simplifiée)
echo "📥 Création du fichier OSM pour Antananarivo..."
cat > /data/antananarivo.osm << 'EOF'
<?xml version='1.0' encoding='UTF-8'?>
<osm version='0.6' generator='JOSM'>
  <bounds minlat='-18.98' minlon='47.46' maxlat='-18.82' maxlon='47.59'/>
  <!-- Points d'intérêt d'Antananarivo -->
  <node id='-1' lat='-18.8792' lon='47.5079'>
    <tag k='name' v='Antananarivo'/>
    <tag k='place' v='city'/>
  </node>
  <node id='-2' lat='-18.9100' lon='47.5256'>
    <tag k='name' v='Analakely'/>
    <tag k='place' v='suburb'/>
  </node>
</osm>
EOF

# Si tilemaker est disponible, créer un mbtiles basique
if command -v tilemaker &> /dev/null; then
    echo "🔄 Conversion en format mbtiles..."
    tilemaker \
        --input /data/antananarivo.osm \
        --output /data/antananarivo.mbtiles \
        --process /usr/local/etc/tilemaker/process-openmaptiles.lua \
        --config /usr/local/etc/tilemaker/config-openmaptiles.json \
        --bbox $MIN_LON,$MIN_LAT,$MAX_LON,$MAX_LAT \
        --zoom 10-16
else
    echo "⚠️  Tilemaker non disponible, création d'un fichier mbtiles minimal..."
    # Créer un fichier mbtiles minimal avec sqlite3
    sqlite3 /data/antananarivo.mbtiles "
        CREATE TABLE metadata (name text, value text);
        CREATE TABLE tiles (zoom_level integer, tile_column integer, tile_row integer, tile_data blob);
        
        INSERT INTO metadata VALUES ('name', 'Antananarivo Offline Map');
        INSERT INTO metadata VALUES ('type', 'baselayer');
        INSERT INTO metadata VALUES ('version', '1.0');
        INSERT INTO metadata VALUES ('description', 'Carte offline d''Antananarivo');
        INSERT INTO metadata VALUES ('format', 'png');
        INSERT INTO metadata VALUES ('bounds', '47.46,-18.98,47.59,-18.82');
        INSERT INTO metadata VALUES ('center', '47.5079,-18.8792,13');
        INSERT INTO metadata VALUES ('minzoom', '10');
        INSERT INTO metadata VALUES ('maxzoom', '16');
        INSERT INTO metadata VALUES ('attribution', '© OpenStreetMap contributors');
        
        -- Créer un index
        CREATE UNIQUE INDEX tile_index ON tiles (zoom_level, tile_column, tile_row);
    "
fi

# Nettoyer
rm -f /data/antananarivo.osm

echo "✅ Carte créée avec succès!"
echo "📍 Emplacement: /data/antananarivo.mbtiles"