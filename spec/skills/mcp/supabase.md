---
name: mcp-supabase-data
description: Query and manipulate Supabase database - CRUD operations, RLS, real-time subscriptions for A'Space OS data
---

# MCP Skill: Supabase Database

This skill teaches any AI agent how to interact with the Supabase database for A'Space OS data storage and retrieval.

## When to Use This Skill

Load this skill when you need to:
- Query Life Domains scores
- Insert Business Pulse data
- Update system logs
- Subscribe to real-time changes
- Manage Row Level Security (RLS) policies

## Supabase Overview

**Project:** A'Space OS Core DB  
**URL:** `https://[project-id].supabase.co`  
**Tables:**
- `life_scores` → Life Domains tracking
- `business_pulse` → TMI, TVR, 12WY data
- `system_logs` → Daily Pulse, errors
- `uplinks` → Sunday summaries

## Prerequisites

- Supabase API URL and Anon Key (stored in `.env`)
- Understanding of PostgreSQL and RLS
- Supabase client library (or direct REST API)

## Authentication

All requests require the `apikey` header:

```bash
curl -H "apikey: $SUPABASE_ANON_KEY" \
     -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
     https://[project-id].supabase.co/rest/v1/...
```

## Commands Reference

### 1. Query Data (SELECT)

```bash
GET /rest/v1/<table>?select=*&<filters>
```

**Example: Get latest Life scores**
```bash
curl -H "apikey: $SUPABASE_ANON_KEY" \
  "https://[project-id].supabase.co/rest/v1/life_scores?select=*&order=created_at.desc&limit=1"
```

**Response:**
```json
{
  "id": "ls-123",
  "user_id": "amadeus",
  "health": 8,
  "finance": 7,
  "career": 9,
  "created_at": "2025-07-14T10:00:00Z"
}
```

### 2. Insert Data (INSERT)

```bash
POST /rest/v1/<table>
[{ "column": "value", ... }]
```

**Example: Log Business Pulse**
```bash
curl -X POST \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '[{
    "week": 28,
    "tmi_current": 2100,
    "tmi_target": 2000,
    "tvr_score": 0.85
  }]' \
  https://[project-id].supabase.co/rest/v1/business_pulse
```

### 3. Update Data (UPDATE)

```bash
PATCH /rest/v1/<table>?<filters>
{ "column": "new_value" }
```

**Example: Update Life Domain score**
```bash
curl -X PATCH \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"health": 9}' \
  "https://[project-id].supabase.co/rest/v1/life_scores?id=eq.ls-123"
```

### 4. Delete Data (DELETE)

```bash
DELETE /rest/v1/<table>?<filters>
```

**Example: Remove old logs**
```bash
curl -X DELETE \
  -H "apikey: $SUPABASE_ANON_KEY" \
  "https://[project-id].supabase.co/rest/v1/system_logs?created_at=lt.2025-01-01"
```

### 5. Real-time Subscription

**Via JavaScript client:**
```javascript
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

supabase
  .channel('life-scores')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'life_scores' },
    (payload) => {
      console.log('Life score updated:', payload.new);
    }
  )
  .subscribe();
```

**Use case:** Pulse Monitor component updates in real-time.

## Integration with A'Space OS

### Life Domains Tracking (Beth)

**Query current scores:**
```sql
SELECT * FROM life_scores 
WHERE user_id = 'amadeus' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Update score:**
```sql
INSERT INTO life_scores (user_id, health, finance, career, ...)
VALUES ('amadeus', 9, 7, 8, ...);
```

**Beth's validation:**
```javascript
// Check if any domain dropped significantly
const prevScore = await supabase
  .from('life_scores')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(2);

constDropThreshold = -2;  // Alert if domain drops > 2 points

prevScore.forEach(domain => {
  const diff = current[domain] - prev[domain];
  if (diff < DropThreshold) {
    alert(`⚠️ ${domain} dropped ${Math.abs(diff)} points`);
  }
});
```

### Business Pulse (Jerry)

**Insert weekly pulse:**
```sql
INSERT INTO business_pulse (week, tmi_current, tmi_target, tvr_score, domains)
VALUES (28, 2100, 2000, 0.85, '{"Growth": "🟢", "Product": "🟠"}');
```

**Query last 4 weeks:**
```sql
SELECT * FROM business_pulse 
ORDER BY week DESC 
LIMIT 4;
```

### Daily Pulse Logs (Morty)

**Insert system log:**
```sql
INSERT INTO system_logs (type, status, details)
VALUES ('daily-pulse', 'success', '{"services": "all-green", "disk": "72%"}');
```

**Query errors:**
```sql
SELECT * FROM system_logs 
WHERE type = 'error' 
AND created_at > NOW() - INTERVAL '24 hours';
```

## Row Level Security (RLS)

**Enable RLS:**
```sql
ALTER TABLE life_scores ENABLE ROW LEVEL SECURITY;
```

**Policy: Users see only their data**
```sql
CREATE POLICY "Users can view own scores"
ON life_scores
FOR SELECT
USING (auth.uid() = user_id);
```

**Policy: Users can insert own data**
```sql
CREATE POLICY "Users can insert own scores"
ON life_scores
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

## Guidelines for A'Space OS

### Security

- ❌ **Never** expose Service Key (only use Anon Key publicly)
- ✅ Use RLS policies to restrict data access
- ✅ Validate all inputs before insertion
- ✅ Sanitize user-generated content

### Efficiency (Rick Audit)

- ❌ Don't query entire tables (use SELECT with filters)
- ✅ Use indexes on frequently queried columns
- ✅ Batch inserts when possible (array of objects)
- ✅ Use real-time subscriptions instead of polling

### Air Lock Filtering

**Risk Level:** MEDIUM (database changes affect production data)

**Jerry's Decision:**
- `SELECT` → ALLOW (read-only)
- `INSERT` → ALLOW (reversible)
- `UPDATE` → MEDIUM (depends on what's being updated)
- `DELETE` → HIGH (Amadeus ACK for bulk deletes)

## Common Tasks

### Task: Get Current TMI Status

```bash
curl -H "apikey: $SUPABASE_ANON_KEY" \
  "https://[project-id].supabase.co/rest/v1/business_pulse?select=tmi_current,tmi_target&order=week.desc&limit=1"
```

### Task: Insert Life Score Update

```bash
curl -X POST \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '[{
    "user_id": "amadeus",
    "health": 8,
    "finance": 7,
    "career": 9,
    "relationships": 8,
    "environment": 7,
    "fun": 6,
    "contribution": 8,
    "cognition": 9
  }]' \
  https://[project-id].supabase.co/rest/v1/life_scores
```

### Task: Query Last Week's Logs

```bash
curl -H "apikey: $SUPABASE_ANON_KEY" \
  "https://[project-id].supabase.co/rest/v1/system_logs?created_at=gte.$(date -d '7 days ago' -Iminutes)&order=created_at.desc"
```

## Troubleshooting

### Problem: 401 Unauthorized

**Cause:** Invalid API key or expired token.

**Solution:**
```bash
# Verify API key
echo $SUPABASE_ANON_KEY

# If empty, source .env
source .env
```

### Problem: RLS Policy Blocking Query

**Cause:** User not authenticated or policy misconfigured.

**Solution:**
```sql
-- Temporarily disable RLS (dev only)
ALTER TABLE life_scores DISABLE ROW LEVEL SECURITY;

-- Or fix policy
DROP POLICY "Users can view own scores" ON life_scores;
CREATE POLICY "Users can view own scores" ON life_scores FOR SELECT USING (true);  -- Temp: allow all
```

### Problem: Slow Query

**Cause:** Missing index or full table scan.

**Solution:**
```sql
-- Create index
CREATE INDEX idx_life_scores_user_created 
ON life_scores(user_id, created_at DESC);

-- Verify query plan
EXPLAIN ANALYZE SELECT * FROM life_scores WHERE user_id = 'amadeus';
```

## Success Metrics

- **Query Time:** < 200ms for 95% of queries
- **Data Accuracy:** 100% (no duplicates, no missing required fields)
- **RLS Coverage:** 100% of tables have appropriate policies

---

> **For A'Space OS:** "Supabase is the canopy's roots. Query wisely, protect fiercely." — Beth
