# Deployment Notes

## ⚠️ Summer_V1 Dockerfile (Legacy)

The `Deployment/Summer_V1/Dockerfile` is **NOT production-ready** for the current Cockpit Core deployment.

### Issues with Summer_V1 Dockerfile

1. **Missing Dependencies**: References folders that don't exist in this repo:
   - `./skills`
   - `./conductor`
   - `./summer_verse`

2. **Wrong Base Image**: Uses `python:3.11-slim-bookworm` instead of Node.js

3. **Different Purpose**: Designed for Summer agent system, not Cockpit Core

### ✅ Production Dockerfile

Use the **root-level `Dockerfile`** instead:
```
/Dockerfile  <-- Use this for Coolify/VPS deployment
```

This Dockerfile:
- Uses Node 20 slim
- Includes PostgreSQL support via Prisma
- Runs contract validation, migrations, and sync
- Properly configured for production deployment

See `DEPLOYMENT.md` for full deployment instructions.
