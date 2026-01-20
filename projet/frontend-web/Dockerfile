# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copie du code source
COPY . .

# Build de l'application
RUN npm run build -- --configuration=production

# Runtime stage
FROM nginx:1.23-alpine

# Copie des fichiers buildés
COPY --from=build /app/dist/* /usr/share/nginx/html/

# Copie de la configuration nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exposition du port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Démarrage
CMD ["nginx", "-g", "daemon off;"]