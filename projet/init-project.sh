#!/bin/bash

# ==========================================
# 📦 INITIALISATION PROJET SIGNALISATION ROUTIÈRE
# ==========================================

set -e

echo "=========================================="
echo "🚀 INITIALISATION DU PROJET"
echo "=========================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions
print_step() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Vérifier Docker
print_step "Vérification de Docker..."
if ! command -v docker &> /dev/null; then
    print_error "Docker n'est pas installé"
    exit 1
fi
print_success "Docker est installé"

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose n'est pas installé"
    exit 1
fi
print_success "Docker Compose est installé"

# Vérifier les fichiers
print_step "Vérification des fichiers..."
REQUIRED_FILES=("docker-compose.yml" ".env" "backend/Dockerfile" "frontend-web/Dockerfile")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        print_warning "Fichier manquant: $file"
    fi
done

# Créer les répertoires nécessaires
print_step "Création des répertoires..."
mkdir -p tileserver/data
mkdir -p nginx/ssl
mkdir -p nginx/logs
mkdir -p postgres/migrations
mkdir -p scripts

# Donner les permissions aux scripts
print_step "Configuration des permissions..."
chmod +x tileserver/entrypoint.sh 2>/dev/null || true
chmod +x tileserver/download-map.sh 2>/dev/null || true
chmod +x backend/docker-healthcheck.sh 2>/dev/null || true

# Générer certificats SSL auto-signés
print_step "Génération des certificats SSL..."
if [ ! -f "nginx/ssl/nginx.crt" ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/nginx.key \
        -out nginx/ssl/nginx.crt \
        -subj "/C=MG/ST=Antananarivo/L=Antananarivo/O=Signalisation/CN=localhost" 2>/dev/null
    print_success "Certificats SSL générés"
else
    print_success "Certificats SSL déjà existants"
fi

# Construire les images
print_step "Construction des images Docker..."
docker-compose build --parallel

# Télécharger la carte
print_step "Préparation de la carte d'Antananarivo..."
if [ ! -f "tileserver/data/antananarivo.mbtiles" ]; then
    print_warning "Carte non trouvée, création d'une carte minimale..."
    docker-compose run --rm tileserver /download-map.sh
else
    print_success "Carte déjà présente"
fi

# Démarrer les services
print_step "Démarrage des services..."
docker-compose up -d

# Attendre que les services soient prêts
print_step "Attente du démarrage des services..."
sleep 10

# Vérifier l'état des services
print_step "Vérification des services..."
docker-compose ps

# Afficher les informations d'accès
echo ""
echo "=========================================="
echo "✅ PROJET INITIALISÉ AVEC SUCCÈS"
echo "=========================================="
echo ""
echo "🌐 ACCÈS AUX SERVICES:"
echo "   ${BLUE}Frontend Web:${NC}    http://localhost:4200"
echo "   ${BLUE}Backend API:${NC}      http://localhost:8080/api"
echo "   ${BLUE}TileServer:${NC}       http://localhost:8081"
echo "   ${BLUE}Base de données:${NC}  localhost:5432"
echo "   ${BLUE}Adminer:${NC}          http://localhost:8082"
echo "   ${BLUE}Mobile API:${NC}       http://localhost:5000"
echo ""
echo "🔧 COMMANDES UTILES:"
echo "   ${YELLOW}Arrêter:${NC}         docker-compose down"
echo "   ${YELLOW}Redémarrer:${NC}      docker-compose restart"
echo "   ${YELLOW}Logs:${NC}            docker-compose logs -f"
echo "   ${YELLOW}Statut:${NC}          docker-compose ps"
echo ""
echo "🗺️  CONFIGURATION CARTE:"
echo "   ${GREEN}Centre:${NC}          -18.8792, 47.5079"
echo "   ${GREEN}Zoom:${NC}            13"
echo "   ${GREEN}Bounds:${NC}          47.46,-18.98,47.59,-18.82"
echo ""
echo "📱 EXEMPLE URL TILES:"
echo "   http://localhost:8081/data/antananarivo/14/12000/8000.png"
echo ""
echo "=========================================="