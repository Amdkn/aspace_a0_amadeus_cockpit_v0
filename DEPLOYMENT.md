# A'Space Cockpit - Deployment Guide

## 🚀 Coolify/VPS Deployment (PostgreSQL)

This guide covers deploying the A'Space Cockpit Core to Coolify with PostgreSQL.

### Prerequisites

- Coolify instance running
- PostgreSQL database available (Coolify managed or external)
- GitHub repository access

### Architecture Overview

**Contract-First Architecture:**
- JSON contracts define the "Law" (Constitution)
- ContractGuard enforces validation before any DB write
- Database = projection/cache (can be rebuilt from contracts)
- PostgreSQL stores contracts with JSONB for efficient querying

---

## 1. Database Setup

### Option A: Coolify Managed PostgreSQL

1. In Coolify, create a new PostgreSQL service
2. Note the connection details (auto-generated)
3. Coolify will provide a `DATABASE_URL` environment variable

### Option B: External PostgreSQL (Supabase, etc.)

1. Create a PostgreSQL database
2. Get connection string in format:
   ```
   postgresql://username:password@host:port/database?schema=public
   ```

---

## 2. Environment Variables

Configure these in Coolify:

### Required

```env
DATABASE_URL=postgresql://user:password@host:port/dbname?schema=public
NODE_ENV=production
```

### Optional

```env
# Air Lock Mode: Set to 'true' to disable DB writes (read-only safe mode)
ASPACE_AIR_LOCK_MODE=false

# For development/staging
NODE_ENV=staging
```

---

## 3. Coolify Configuration

### Build Settings

- **Build Pack:** Dockerfile
- **Dockerfile Path:** `./Dockerfile`
- **Context:** `.` (root)

### Port Configuration

- **Container Port:** 3000 (currently not exposed, for future API)
- **Public Port:** Not needed for job runner mode

### Deployment Mode

**Current Setup:** Job Runner
- Validates contracts on startup
- Runs migrations
- Syncs contracts to database
- Exits after completion

**Future Option:** API Server
- Add REST API endpoints for contract ingestion
- Keep container running with a Node.js server
- Use n8n or other tools to POST contracts

---

## 4. First Deployment

### Steps

1. **Create Application in Coolify**
   - Type: Docker
   - Repository: `https://github.com/Amdkn/aspace_a0_amadeus_cockpit_v0`
   - Branch: `main` or your deployment branch

2. **Configure PostgreSQL Service**
   - Link to Coolify PostgreSQL or set DATABASE_URL manually

3. **Set Environment Variables** (see section 2)

4. **Deploy**
   - Coolify will build the Docker image
   - Run migrations automatically
   - Sync contracts to database

5. **Verify Deployment**
   - Check logs for validation success
   - Verify database tables created
   - Confirm contracts synced

---

## 5. Build & Run Commands

### Local Development (PostgreSQL)

```bash
# Install dependencies
npm install

# Set DATABASE_URL
export DATABASE_URL="postgresql://user:password@localhost:5432/aspace"

# Generate Prisma Client
npm run prisma:generate

# Run migrations (dev)
npm run prisma:migrate

# Validate contracts
npm run validate

# Sync contracts to DB
npm run sync-contracts

# Run tests
npm run test

# Build TypeScript
npm run build
```

### Production Commands (Used in Dockerfile)

```bash
# Validate contracts (zero-dependency)
npm run validate

# Deploy migrations (production-safe)
npm run prisma:deploy

# Sync contracts to database
npm run sync-contracts
```

---

## 6. Database Schema

### PostgreSQL-Specific Features

The schema uses PostgreSQL's JSONB type for efficient storage and querying:

- `Contract.rawJson`: Complete contract as JSONB
- `Order.rockDoD, tactics, constraints, escalationRules`: JSONB arrays
- `Pulse.domains, type4DecisionsNeeded`: JSONB objects/arrays
- `Decision.options, rationale, a0Decision`: JSONB arrays/objects
- `Intent.domainsTouched, constraints, successCriteria, attachments`: JSONB arrays
- `Uplink.lines, linkedPulseIds`: JSONB arrays

### Benefits of JSONB

- Native PostgreSQL indexing
- Query JSON fields with SQL
- Better performance than text storage
- Type validation at DB level

---

## 7. Air Lock Mode

**Purpose:** Graceful degradation when DB is unavailable

### When to Use

- Initial deployment testing
- Database maintenance
- Read-only auditing mode

### How to Enable

```env
ASPACE_AIR_LOCK_MODE=true
```

**Behavior:**
- ContractGuard accepts validation requests
- DB writes are blocked (returns error)
- System remains operational for validation
- Logs warnings instead of crashing

---

## 8. Contract Validation Flow

### Validation → Ledger → Projection

```
1. JSON Contract → ContractGuard.validateContract()
   ↓
2. Validation Success/Failure
   ↓
3. Write to Contract Ledger (ACCEPTED/REJECTED + integrity hash)
   ↓
4. If ACCEPTED → Write to Projection Table (Order/Pulse/Decision/Intent/Uplink)
   ↓
5. Log result & return status
```

### Security Guarantees

- **All writes go through ContractGuard** (architectural rule)
- Invalid JSON is rejected before DB write
- Immutable ledger with SHA-256 integrity hashes
- Validation logs stored for rejected contracts

---

## 9. Monitoring & Logs

### Key Log Messages

```
✅ [ContractGuard] ACCEPTED: ORD-20250714-001
   📊 [ContractGuard] Projection written: Order

❌ [ContractGuard] REJECTED: DEC-INVALID-001
   Validation errors:
   - [Root] Missing required field: linked_intent_id

⚠️  [ContractGuard] Air Lock Mode: Database unavailable
```

### Health Checks

Docker health check runs every 30s:
- Verifies Node.js process is alive
- Can be extended to check DB connectivity

---

## 10. Troubleshooting

### Common Issues

**Problem:** `Error: P1001: Can't reach database server`
- **Solution:** Check DATABASE_URL format and network access

**Problem:** Migration fails with "relation already exists"
- **Solution:** Database may have old schema. Use `npm run db:reset` (dev only)

**Problem:** "Air Lock Mode: Database writes disabled"
- **Solution:** Set `ASPACE_AIR_LOCK_MODE=false` in environment

**Problem:** Validation fails for valid contracts
- **Solution:** Ensure `protocols/*.schema.json` files are in Docker image

---

## 11. Migration from SQLite

If migrating from existing SQLite database:

1. **Export data** from SQLite (if needed)
2. **Update DATABASE_URL** to PostgreSQL
3. **Run migrations:** `npm run prisma:migrate`
4. **Re-sync contracts:** `npm run sync-contracts`

**Note:** JSON fields are now stored as JSONB (not strings)

---

## 12. Future Enhancements (V2+)

### API Server Mode

Add REST endpoints:
```javascript
POST /contracts/order
POST /contracts/pulse
POST /contracts/decision
POST /contracts/intent
POST /contracts/uplink

GET /contracts/:contractId
GET /contracts?status=ACCEPTED&type=Order
```

### n8n Integration

- Webhook trigger to POST contracts
- ContractGuard validates and persists
- Respond with ACCEPTED/REJECTED status

### Backup & Audit

- Automated contract backup to Google Drive
- Audit log exports (CSV/JSON)
- Integrity hash verification script

---

## 13. Security Checklist

- [x] Contract-first architecture enforced
- [x] Zero direct DB writes outside ContractGuard
- [x] Immutable ledger with integrity hashes
- [x] Validation before persistence
- [x] Air Lock mode for graceful degradation
- [x] Environment variables for secrets (no hardcoded credentials)
- [ ] Add authentication for API endpoints (future)
- [ ] Implement rate limiting (future)
- [ ] Set up automated backups (future)

---

## 14. Support & References

- **Repository:** https://github.com/Amdkn/aspace_a0_amadeus_cockpit_v0
- **Issues:** https://github.com/Amdkn/aspace_a0_amadeus_cockpit_v0/issues
- **Prisma Docs:** https://www.prisma.io/docs
- **Coolify Docs:** https://coolify.io/docs

---

## Version History

- **v0.1.0** (2025-12-28): Initial PostgreSQL migration
  - Migrated from SQLite to PostgreSQL
  - Converted string JSON fields to JSONB
  - Created production Dockerfile
  - Added deployment documentation
