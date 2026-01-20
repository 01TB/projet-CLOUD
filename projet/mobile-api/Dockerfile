FROM node:18-alpine

WORKDIR /app

# Installation des dépendances système
RUN apk add --no-cache curl

# Copie des fichiers package
COPY package*.json ./

# Installation des dépendances
RUN npm ci --only=production

# Copie du code source
COPY . .

# Exposition du port
EXPOSE 5000

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Démarrage
CMD ["node", "src/index.js"]