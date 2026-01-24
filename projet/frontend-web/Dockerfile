# Stage 1: Build Angular app
FROM node:18-alpine AS angular-builder

# Install git et autres outils
RUN apk add --no-cache git python3 make g++

WORKDIR /app

# Copy package files first for better caching
COPY angular-app/package*.json ./

# Clean install with force flag to handle potential issues
RUN npm ci --force --legacy-peer-deps

# Copy Angular source code
COPY angular-app/ .

# Build Angular for production
RUN npm run build -- --configuration production --output-path=dist

# Stage 2: Final frontend with Nginx and Tileserver
FROM nginx:alpine

# Install dependencies
RUN apk add --no-cache \
    curl \
    bash \
    gettext \
    sqlite \
    nodejs \
    npm \
    python3 \
    py3-pip

# Install tileserver-gl globally
RUN npm install -g tileserver-gl

# Copy built Angular app
COPY --from=angular-builder /app/dist /usr/share/nginx/html

# Copy configuration files
COPY nginx.conf /etc/nginx/nginx.conf
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copy scripts
RUN mkdir -p /scripts
COPY scripts/download-map.sh /scripts/
RUN chmod +x /scripts/download-map.sh

# Create directories
RUN mkdir -p /data /usr/share/nginx/html/assets

# Create assets directory if not exists
RUN mkdir -p /usr/share/nginx/html/assets

# Copy Leaflet images
RUN mkdir -p /usr/share/nginx/html/assets/leaflet
COPY --from=angular-builder /app/node_modules/leaflet/dist/images/* /usr/share/nginx/html/assets/leaflet/

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]