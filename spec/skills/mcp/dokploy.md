---
name: mcp-dokploy-deploy
description: Deploy via Dokploy as Coolify alternative - Docker orchestration, container management for A'Space OS
---

# MCP Skill: Dokploy Deployment

This skill teaches any AI agent how to use Dokploy as an alternative deployment platform to Coolify for A'Space OS.

## When to Use This Skill

Load this skill when you need to:
- Deploy applications if Coolify is unavailable
- Test deployment on a different platform
- Compare Coolify vs Dokploy performance
- Use Dokploy-specific features

## Dokploy Overview

**What it is:** Docker-based deployment platform (similar to Coolify).

**Hosted on:** Hostinger VPS or separate instance

**Access:** `https://dokploy.aspace-os.com` (if configured)

## Prerequisites

- Dokploy installed on VPS
- API token (if available)
- Understanding of Docker Compose

## Decision Matrix: Coolify vs Dokploy

**Use Coolify when:**
- Standard deployments (already configured)
- Team familiar with Coolify
- Need specific Coolify features

**Use Dokploy when:**
- Coolify experiencing issues
- Testing deployment resilience
- Specific Dokploy feature needed

**Rick's Rule:** Don't run both simultaneously (resource waste). Choose one primary, keep other as backup.

## Commands Reference

### 1. Deploy via Docker Compose

Dokploy typically uses Docker Compose for deployments:

```yaml
# docker-compose.yml for Summer instance
version: '3.8'
services:
  summer-growth:
    image: ghcr.io/amadeus/aspaceos-summer:latest
    environment:
      DOMAIN: Growth
      SUPABASE_URL: ${SUPABASE_URL}
      SUPABASE_KEY: ${SUPABASE_KEY}
    ports:
      - "3001:3000"
    restart: unless-stopped
```

**Deploy:**
```bash
docker-compose up -d
```

### 2. Check Container Status

```bash
docker ps | grep summer
```

**Expected output:**
```
summer-growth   Up 2 hours   0.0.0.0:3001->3000/tcp
```

### 3. View Logs

```bash
docker logs summer-growth --tail 100 --follow
```

### 4. Restart Container

```bash
docker restart summer-growth
```

### 5. Stop and Remove

```bash
docker-compose down
docker rm summer-growth
```

## Integration with A'Space OS

### Fallback Deployment Workflow

**Primary:** Coolify  
**Backup:** Dokploy

```bash
# Morty attempts Coolify deployment
if ! deploy_via_coolify; then
  echo "⚠️ Coolify unavailable, falling back to Dokploy"
  deploy_via_dokploy
fi
```

### Dokploy Deployment Script

```bash
#!/bin/bash
# deploy-dokploy.sh

SERVICE_NAME=$1
DOMAIN=$2

# Create docker-compose.yml
cat > docker-compose.yml <<EOF
version: '3.8'
services:
  $SERVICE_NAME:
    image: ghcr.io/amadeus/aspaceos-summer:latest
    environment:
      DOMAIN: $DOMAIN
      SUPABASE_URL: ${SUPABASE_URL}
      SUPABASE_KEY: ${SUPABASE_KEY}
    ports:
      - "300${RANDOM}:3000"
    restart: unless-stopped
EOF

# Deploy
docker-compose up -d

# Verify
docker ps | grep $SERVICE_NAME
```

**Usage:**
```bash
./deploy-dokploy.sh summer-product Product
```

## Guidelines for A'Space OS

### Security

- ❌ **Never** expose Docker socket without authentication
- ✅ Use environment files for secrets (`.env`)
- ✅ Limit container resource usage (CPU/memory limits)
- ✅ Keep Docker images up to date

### Efficiency (Rick Audit)

- ❌ Don't deploy to both Coolify AND Dokploy (choose one)
- ✅ Use Docker layer caching to speed up builds
- ✅ Prune unused images regularly
- ✅ Monitor resource usage (avoid over-provisioning)

### Air Lock Filtering

**Risk Level:** MEDIUM (deployment affects VPS resources)

**Jerry's Decision:**
- Deploy new service → ALLOW (can be stopped)
- Update running service → ALLOW (reversible)
- Remove service → HIGH (Amadeus ACK for production)

## Common Tasks

### Task: Deploy Summer Instance

```bash
# 1. SSH to VPS
ssh root@<VPS_IP>

# 2. Create deployment directory
mkdir -p /opt/dokploy/summer-ops
cd /opt/dokploy/summer-ops

# 3. Create docker-compose.yml
cat > docker-compose.yml <<EOF
version: '3.8'
services:
  summer-ops:
    image: ghcr.io/amadeus/aspaceos-summer:latest
    environment:
      DOMAIN: Ops
      SUPABASE_URL: https://...
    ports:
      - "3003:3000"
    restart: unless-stopped
EOF

# 4. Deploy
docker-compose up -d

# 5. Verify
docker logs summer-ops --tail 20
```

### Task: Update Deployment

```bash
# Pull latest image
docker pull ghcr.io/amadeus/aspaceos-summer:latest

# Restart service
cd /opt/dokploy/summer-ops
docker-compose up -d --force-recreate
```

### Task: Rollback Deployment

```bash
# Stop current version
docker-compose down

# Deploy specific version
docker run -d --name summer-ops \
  -e DOMAIN=Ops \
  ghcr.io/amadeus/aspaceos-summer:v1.0.0
```

## Comparison: Coolify vs Dokploy

| Feature | Coolify | Dokploy |
|---------|---------|---------|
| **UI** | Web-based | CLI/Docker |
| **Complexity** | Low | Medium |
| **Automation** | High (API) | Medium (Docker Compose) |
| **Learning Curve** | Easy | Moderate |
| **Ecosystem** | Growing | Mature (Docker) |

**Rick's Verdict:** Coolify for day-to-day, Dokploy for fallback.

## Troubleshooting

### Problem: Container Won't Start

**Cause:** Port conflict or missing environment variable.

**Solution:**
```bash
# Check logs
docker logs summer-ops

# Check port availability
netstat -tulpn | grep 3003

# Fix docker-compose.yml and redeploy
docker-compose up -d
```

### Problem: Out of Disk Space

**Cause:** Unused Docker images accumulating.

**Solution:**
```bash
# Clean up
docker system prune -af --volumes

# Check disk usage
df -h
```

### Problem: Image Pull Failed

**Cause:** Network issue or invalid image tag.

**Solution:**
```bash
# Verify image exists
docker pull ghcr.io/amadeus/aspaceos-summer:latest

# Check network
ping ghcr.io
```

## Success Metrics

- **Deployment Time:** < 3 minutes from start to running
- **Uptime:** > 99% (same as Coolify)
- **Fallback Activation:** < 5 minutes to switch from Coolify

---

> **For A'Space OS:** "Dokploy is the backup pilot. Ready, but not primary." — Morty
