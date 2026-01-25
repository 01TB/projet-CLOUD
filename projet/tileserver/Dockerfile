# Version la plus simple - Sans fichier config
FROM node:18-alpine AS download

WORKDIR /download

# Installer les outils nécessaires
RUN apk add --no-cache \
    wget \
    curl \
    python3 \
    py3-pip \
    git \
    sqlite \
    build-base \
    sqlite-dev \
    zlib-dev \
    bash

# Installer tippecanoe
RUN git clone https://github.com/felt/tippecanoe.git \
    && cd tippecanoe \
    && make -j \
    && make install \
    && cd .. \
    && rm -rf tippecanoe

# Télécharger les données OSM d'Antananarivo via Overpass API
RUN wget -O antananarivo.osm \
    "https://overpass-api.de/api/map?bbox=47.3,-18.95,47.6,-18.8"

# Convertir OSM XML en GeoJSON
RUN npm install -g osmtogeojson \
    && osmtogeojson antananarivo.osm > antananarivo.geojson

# Convertir GeoJSON en MBTiles
RUN tippecanoe \
    -o antananarivo.mbtiles \
    -z14 \
    -Z0 \
    --drop-densest-as-needed \
    --extend-zooms-if-still-dropping \
    --layer=osm \
    antananarivo.geojson

# Stage final
FROM maptiler/tileserver-gl:latest

WORKDIR /data

# Copier seulement le fichier mbtiles
COPY --from=download /download/antananarivo.mbtiles /data/antananarivo.mbtiles

EXPOSE 8080

# Lancer TileServer directement avec le fichier mbtiles
CMD ["tileserver-gl", "--mbtiles", "/data/antananarivo.mbtiles", "--verbose"]