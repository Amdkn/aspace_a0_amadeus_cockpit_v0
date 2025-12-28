#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════
# 🚀 Script d'Initialisation Souveraine — A'Space OS
# ═══════════════════════════════════════════════════════════════════════
# 
# Ce script configure l'environnement Coolify pour garantir
# une autonomie totale et une souveraineté des données.
#
# Usage: ./scripts/init-sovereign-db.sh
# ═══════════════════════════════════════════════════════════════════════

set -e  # Arrêt en cas d'erreur

echo "═══════════════════════════════════════════════════════════════════════"
echo "✨ Initialisation du Mycélium Stable — Architecture Souveraine"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

# 1. Création des répertoires de persistance
echo "📂 Création de l'arborescence de données..."
mkdir -p ./data
mkdir -p ./src/generated/client
mkdir -p ./logs
mkdir -p ./logs/intents
mkdir -p ./logs/decisions
mkdir -p ./logs/assessments
mkdir -p ./logs/orders

# 2. Sécurisation des permissions
echo "🔒 Sécurisation du dossier data..."
chmod 700 ./data
touch ./data/aspace_souverain.db
chmod 600 ./data/aspace_souverain.db

# 3. Injection des variables d'environnement antifragiles
echo "⚙️ Configuration du mode Zero-Dependence dans .env..."
cat > .env << 'EOF'
# ═══════════════════════════════════════════════════════════════════════
# Configuration Souveraine A'Space OS
# ═══════════════════════════════════════════════════════════════════════

# Base de données souveraine (SQLite local)
DATABASE_URL="file:./data/aspace_souverain.db"

# Prisma Zero-Dependence Configuration (Antifragilité)
PRISMA_SKIP_POSTINSTALL_GENERATE=1  # Désactive les appels externes
PRISMA_TELEMETRY_DISABLED=1          # Aucune télémétrie vers serveurs Prisma

# Air Lock Mode: Graceful degradation
ASPACE_AIR_LOCK_MODE=false           # Mettre à true pour mode lecture seule

# ═══════════════════════════════════════════════════════════════════════
# Le Mycélium est stable. La souveraineté est préservée. 🌿
# ═══════════════════════════════════════════════════════════════════════
EOF

echo "✅ Fichier .env créé avec succès"

# 4. Vérification de Node.js
echo ""
echo "🔍 Vérification des dépendances..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Installation requise."
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js détecté: $NODE_VERSION"

# 5. Installation des dépendances
echo ""
echo "📦 Installation des dépendances npm..."
npm install

# 6. Génération du client Prisma local
echo ""
echo "🔧 Génération du client Prisma (mode souverain)..."
npx prisma generate

# 7. Application des migrations
echo ""
echo "🗄️ Initialisation de la base de données..."
npx prisma migrate deploy

# 8. Synchronisation des contrats initiaux
echo ""
echo "📋 Synchronisation des contrats JSON..."
npm run sync-contracts

# 9. Vérification finale
echo ""
echo "🧪 Exécution des tests de validation..."
npm test

# 10. Résumé
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "✨ Initialisation Terminée — Mycélium Opérationnel"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "📊 Structure créée:"
echo "   ├── data/aspace_souverain.db     ✅ Base SQLite souveraine"
echo "   ├── src/generated/client/        ✅ Client Prisma local"
echo "   ├── logs/                        ✅ Logs d'audit"
echo "   └── .env                         ✅ Configuration zero-dependence"
echo ""
echo "🚀 Commandes disponibles:"
echo "   npm run validate         - Valider les contrats JSON"
echo "   npm run sync-contracts   - Synchroniser les contrats"
echo "   npm test                 - Lancer les tests"
echo "   npm run db:reset         - Réinitialiser la base"
echo ""
echo "📚 Documentation:"
echo "   DATABASE_README.md       - Architecture souveraine"
echo "   ZERO_DEPENDENCE.md       - Guide antifragile complet"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "La Loi est exécutée. Le Mycélium est stable. 🌿"
echo "L'autonomie est garantie. La souveraineté est préservée. 🏛️"
echo "═══════════════════════════════════════════════════════════════════════"
