FROM maptiler/tileserver-gl:v5.1.0

# Mise à jour et installation des outils
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    unzip \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Installation d'outils supplémentaires
RUN pip3 install osmium

# Création des répertoires
RUN mkdir -p /data/styles /data/fonts /data/sprites

# Copie des configurations
COPY config.json /data/config.json
COPY entrypoint.sh /entrypoint.sh
COPY download-map.sh /download-map.sh

# Permissions
RUN chmod +x /entrypoint.sh /download-map.sh

# Téléchargement des styles par défaut
RUN curl -L https://github.com/maptiler/tileserver-gl/raw/master/styles/osm-bright/style.json \
    -o /data/styles/osm-bright.json

# Exposition du port
EXPOSE 8080

# Point d'entrée
ENTRYPOINT ["/entrypoint.sh"]