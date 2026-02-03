# ==========================================
# Build stage - Compilation Angular 20
# ==========================================
FROM node:18-alpine AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances avec legacy-peer-deps pour compatibilité
RUN npm ci --legacy-peer-deps

# Copier tout le code source
COPY . .

# Build de production Angular 20
# Output: dist/frontend-web/browser/
RUN npm run build -- --configuration production

# Vérifier que le build a réussi
RUN ls -la dist/antananarivo-map/ || (echo "Build failed: browser directory not found" && exit 1)

# ==========================================
# Production stage - Nginx
# ==========================================
FROM nginx:alpine

# Définir le répertoire de travail
WORKDIR /usr/share/nginx/html

# Supprimer les fichiers par défaut de Nginx
RUN rm -rf ./*

# Copier le build Angular depuis le stage de build
# Angular 20 utilise le format: dist/frontend-web/browser/
COPY --from=build /app/dist/antananarivo-map ./

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx en mode foreground
CMD ["nginx", "-g", "daemon off;"]