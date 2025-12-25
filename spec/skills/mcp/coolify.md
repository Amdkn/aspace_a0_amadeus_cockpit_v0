---
name: mcp-coolify-deploy
description: Deploy applications via Coolify API - create services, manage deployments, monitor status for A'Space OS agents
---

# MCP Skill: Coolify Deployment

This skill teaches any AI agent how to deploy applications using Coolify's API for the A'Space OS infrastructure.

## When to Use This Skill

Load this skill when you need to:
- Deploy a new Summer instance
- Update an existing application
- Check deployment status
- Manage environment variables
- View deployment logs

## Coolify Overview

**What it is:** Self-hosted Heroku alternative for deploying Docker containers.

**Hosted on:** Hostinger VPS (Frankfurt)

**Access:** `https://coolify.aspace-os.com` (or VPS IP:8000)

## Prerequisites

- Coolify API token (stored in `.env`)
- Project ID and Service ID (from Coolify dashboard)
- Docker image or GitHub repo to deploy

## API Authentication

All requests require the API token in headers:

```bash
curl -H "Authorization: Bearer <COOLIFY_API_TOKEN>" \
     https://coolify.aspace-os.com/api/...
```

## Commands Reference

### 1. List All Services

```bash
GET /api/v1/projects/<PROJECT_ID>/services
```

**Purpose:** See all deployed applications.

**Example response:**
```json
{
  "services": [
    {
      "id": "service-123",
      "name": "summer-v1",
      "status": "running",
      "url": "https://summer.aspace-os.com"
    }
  ]
}
```

### 2. Deploy New Service

```bash
POST /api/v1/projects/<PROJECT_ID>/services
{
  "name": "summer-growth-pilot",
  "source": "github",
  "repository": "amadeus/aspaceos-summer",
  "branch": "main",
  "dockerfile": "Deployment/Summer_V1/Dockerfile",
  "env": {
    "DOMAIN": "Growth",
    "SUPABASE_URL": "https://...",
    "SUPABASE_KEY": "..."
  }
}
```

**When:** Morty needs to deploy a new Summer instance.

**Response:**
```json
{
  "service_id": "service-456",
  "status": "deploying",
  "build_url": "https://coolify.../builds/789"
}
```

### 3. Trigger Redeployment

```bash
POST /api/v1/services/<SERVICE_ID>/redeploy
```

**When:** Code updated in GitHub, need to pull latest changes.

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  https://coolify.aspace-os.com/api/v1/services/service-123/redeploy
```

### 4. Get Deployment Status

```bash
GET /api/v1/services/<SERVICE_ID>
```

**Purpose:** Check if deployment succeeded.

**Example response:**
```json
{
  "id": "service-123",
  "name": "summer-v1",
  "status": "running",
  "last_deploy": "2025-07-14T10:00:00Z",
  "health": "healthy",
  "url": "https://summer.aspace-os.com"
}
```

### 5. View Logs

```bash
GET /api/v1/services/<SERVICE_ID>/logs?lines=100
```

**When:** Debugging deployment failures.

**Example:**
```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "https://coolify.aspace-os.com/api/v1/services/service-123/logs?lines=50"
```

### 6. Update Environment Variables

```bash
PATCH /api/v1/services/<SERVICE_ID>/env
{
  "DOMAIN": "Finance",
  "SUPABASE_KEY": "new-key"
}
```

**When:** Need to change config without rebuilding.

**Safety:** Always backup existing env before updating.

### 7. Stop/Start Service

```bash
POST /api/v1/services/<SERVICE_ID>/stop
POST /api/v1/services/<SERVICE_ID>/start
```

**When:** Maintenance or resource management.

## Integration with A'Space OS

### Deployment Workflow (Morty)

1. **Validate Intent:** Jerry checks risk level
2. **Create Deployment:**
```bash
# Morty calls Coolify API
POST /api/v1/projects/aspaceos/services
{
  "name": "summer-it-pilot",
  "source": "github",
  "repository": "amadeus/aspaceos-summer",
  "dockerfile": "Deployment/Summer_V1/Dockerfile"
}
```
3. **Monitor Status:**
```bash
# Poll every 30s until status = "running"
GET /api/v1/services/summer-it-pilot
```
4. **Log to `/logs/orders/`:**
```json
{
  "order_id": "ORD-20250714-001",
  "service_id": "summer-it-pilot",
  "status": "deployed",
  "url": "https://summer-it.aspace-os.com"
}
```

### Health Check (Daily Pulse)

**Morty's 22h00 ritual:**
```bash
# Check all Summer instances
for service in summer-growth summer-product summer-ops; do
  status=$(curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
    https://coolify.../api/v1/services/$service | jq -r '.status')
  
  if [ "$status" != "running" ]; then
    echo "🔴 ALERT: $service is $status" >> /logs/daily-pulse/$(date +%Y-%m-%d).log
  fi
done
```

## Guidelines for A'Space OS

### Security

- ❌ **Never** hardcode API tokens in code
- ✅ Store `COOLIFY_API_TOKEN` in `.env`
- ✅ Use service-specific env vars (not shared secrets)
- ✅ Rotate tokens quarterly

### Efficiency (Rick Audit)

- ❌ Don't poll status every second (rate limiting)
- ✅ Poll every 30s with exponential backoff
- ✅ Use webhooks when available (future enhancement)
- ✅ Batch multiple deployments if independent

### Air Lock Filtering

**Risk Level:** MEDIUM (deployment = production changes)

**Jerry's Decision:**
- New deployment → ALLOW (reversible via rollback)
- Delete service → HIGH (Amadeus ACK required)
- Update env vars → ALLOW (non-destructive)

## Common Tasks

### Task: Deploy Summer Instance for Growth Domain

```bash
curl -X POST \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "summer-growth",
    "source": "github",
    "repository": "amadeus/aspaceos-summer",
    "branch": "main",
    "dockerfile": "Deployment/Summer_V1/Dockerfile",
    "env": {
      "DOMAIN": "Growth",
      "SUPABASE_URL": "https://...",
      "SUPABASE_KEY": "..."
    }
  }' \
  https://coolify.aspace-os.com/api/v1/projects/aspaceos/services
```

### Task: Check if Deployment Succeeded

```bash
#!/bin/bash
SERVICE_ID="summer-growth"
MAX_WAIT=300  # 5 minutes
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT ]; do
  STATUS=$(curl -s -H "Authorization: Bearer $COOLIFY_TOKEN" \
    https://coolify.../api/v1/services/$SERVICE_ID | jq -r '.status')
  
  if [ "$STATUS" = "running" ]; then
    echo "✅ Deployment successful"
    exit 0
  elif [ "$STATUS" = "failed" ]; then
    echo "❌ Deployment failed"
    exit 1
  fi
  
  sleep 30
  ELAPSED=$((ELAPSED + 30))
done

echo "⏰ Timeout waiting for deployment"
exit 1
```

### Task: Rollback to Previous Version

```bash
# Coolify doesn't have built-in rollback, so redeploy from Git tag
curl -X POST \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -d '{"branch": "v1.0.0"}' \
  https://coolify.../api/v1/services/summer-growth/redeploy
```

## Troubleshooting

### Problem: Deployment Stuck in "building"

**Cause:** Docker build failure or resource exhaustion.

**Solution:**
1. Check logs: `GET /api/v1/services/<ID>/logs`
2. Look for `npm install` errors or `COPY` failures
3. Fix Dockerfile and trigger redeploy

### Problem: Service Shows "running" but URL 404

**Cause:** Container started but app crashed.

**Solution:**
```bash
# Access VPS and check container logs
ssh root@<VPS_IP>
docker logs <container_name> --tail 100
```

### Problem: Environment Var Not Applied

**Cause:** Coolify caches env vars, needs restart.

**Solution:**
```bash
POST /api/v1/services/<ID>/stop
POST /api/v1/services/<ID>/start
```

## Success Metrics

- **Deployment Time:** < 5 minutes from GitHub push to running
- **Success Rate:** > 95% of deployments succeed
- **Rollback Time:** < 2 minutes to revert to previous version

---

> **For A'Space OS:** "Coolify deploys the canopy. Morty watches the forest." — Robin
