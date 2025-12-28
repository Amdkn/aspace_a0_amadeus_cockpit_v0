# A'SPACE COCKPIT CORE - PRODUCTION DOCKERFILE
# Contract-First Architecture for Coolify/VPS Deployment
# PostgreSQL + Prisma + Node.js/TypeScript

FROM node:20-slim

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy Prisma schema
COPY prisma ./prisma

# Copy application source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Environment variables (override in Coolify)
ENV NODE_ENV=production
ENV ASPACE_AIR_LOCK_MODE=false
ENV DATABASE_URL=postgresql://user:password@localhost:5432/aspace

# Expose port (if running as API service in the future)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

# Default command: validate contracts, migrate database, sync contracts
CMD ["sh", "-c", "npm run validate && npx prisma migrate deploy && npm run sync-contracts"]
