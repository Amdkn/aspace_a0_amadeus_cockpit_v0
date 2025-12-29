# Deployment Fix Summary

## Problem
The Coolify deployment was failing with the following issues:
1. **Missing database tables**: "The table `public.Contract` does not exist in the current database"
2. **No migrations found**: Prisma migrations directory was empty/gitignored
3. **Container health check failing**: Container was exiting immediately after running sync, causing Coolify to roll back the deployment

## Root Causes
1. `prisma/migrations` directory was in `.gitignore`, so no migration files existed in the repository
2. Application was designed as a one-shot job (sync and exit) rather than a long-running service
3. Healthcheck was too simple and didn't actually verify the application was working
4. No migrations existed to create the database schema

## Solutions Implemented

### 1. Created Initial Prisma Migration
- Created `prisma/migrations/20251229000000_init/migration.sql` with complete database schema
- Created `prisma/migrations/migration_lock.toml` to specify PostgreSQL provider
- Updated `.gitignore` to allow migrations directory to be committed

### 2. Added HTTP Server
- Created `scripts/server.ts` - a simple HTTP server that:
  - Runs initial contract sync on startup
  - Keeps the container alive (doesn't exit)
  - Provides `/health` endpoint for healthchecks
  - Provides `/sync` endpoint to manually trigger syncs
  - Provides `/status` endpoint to check sync results

### 3. Updated Dockerfile
- Installed `curl` for healthcheck support
- Changed healthcheck to use `curl -f http://localhost:3000/health`
- Increased start period to 40 seconds to allow time for migrations and initial sync

### 4. Updated Application Configuration
- Modified `package.json`:
  - `npm start` now runs the server (instead of one-shot sync)
  - Added `npm run start:sync` for one-shot sync behavior
  - Added `npm run server` for development
- Updated `DEPLOYMENT.md` with new architecture and API endpoints

## Verification Steps for User

1. **Redeploy on Coolify** with the latest changes
2. **Check deployment logs** - should see:
   - Migrations running successfully
   - Initial contract sync completing
   - Server starting on port 3000
   - Healthcheck passing

3. **Verify the service is running**:
   ```bash
   curl http://your-domain.com/health
   ```
   Should return:
   ```json
   {
     "status": "healthy",
     "uptime": 123.45,
     "lastSync": "2025-12-29T...",
     "syncing": false
   }
   ```

4. **Check database** - All tables should be created:
   - Contract (ledger)
   - Order
   - Pulse
   - Decision
   - Intent
   - Uplink

## API Endpoints Available

- `GET /` or `GET /health` - Health check (used by Coolify)
- `GET /sync` - Manually trigger contract sync
- `GET /status` - Get last sync status and results

## What Changed From Original Design

**Before**: Job runner that syncs contracts and exits
**After**: Long-running HTTP service that:
- Syncs contracts on startup
- Stays alive to pass healthchecks
- Can be triggered to sync again via HTTP endpoint
- Suitable for Coolify deployment with healthchecks

## Files Modified

1. `.gitignore` - Removed `prisma/migrations` from ignore list
2. `prisma/migrations/` - Added initial migration files
3. `scripts/server.ts` - New HTTP server implementation
4. `package.json` - Updated scripts
5. `Dockerfile` - Added curl, improved healthcheck
6. `DEPLOYMENT.md` - Updated documentation

## Next Steps

The repository is now production-ready for Coolify deployment. The changes ensure:
- ✅ Database schema is created via migrations
- ✅ Container stays alive for healthchecks
- ✅ Proper HTTP healthcheck endpoint
- ✅ Automatic contract sync on startup
- ✅ Manual sync capability via API
