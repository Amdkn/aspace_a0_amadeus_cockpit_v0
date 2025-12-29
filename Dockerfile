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
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma

# Copy application source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Copy Prisma generated client to dist folder
# TypeScript compiler doesn't copy generated assets, so we do it explicitly
RUN cp -r src/generated dist/src/generated

# Remove devDependencies and clean cache to reduce image size
RUN npm prune --production && npm cache clean --force

# Environment variables (override in Coolify)
ENV NODE_ENV=production
ENV ASPACE_AIR_LOCK_MODE=false
ENV DATABASE_URL=postgresql://user:password@localhost:5432/aspace

# Expose port (if running as API service in the future)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

# Default command: migrate database, then start application
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
