# MCP DRY-RUN : SUPABASE

## Objectif
Documenter l'intention de connexion à Supabase (PostgreSQL + API REST) pour stocker et récupérer les données du système (Life Domains, Business Pulse, System Logs).

## Informations Database

* **Project URL :** `https://[project-id].supabase.co`
* **Service Role Key :** `{{env.SUPABASE_SERVICE_KEY}}` (accès complet)
* **Anon Key :** `{{env.SUPABASE_ANON_KEY}}` (accès public limité)

## Tables Principales

### 1. `life_scores`
Stocke les scores des 8 Life Domains.

```sql
CREATE TABLE life_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  domain TEXT NOT NULL, -- "USS Enterprise", "USS Discovery", etc.
  score INT CHECK (score >= 0 AND score <= 10),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Accès :** Beth (lecture/écriture), Robin (lecture pour Uplinks)

### 2. `business_pulse`
Stocke les KPIs hebdomadaires des instances Summer.

```sql
CREATE TABLE business_pulse (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT NOT NULL,
  week INT NOT NULL,
  year INT NOT NULL,
  tmi_current DECIMAL,
  tmi_target DECIMAL,
  tvr_score DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Accès :** Jerry (écriture), Robin (lecture pour agrégation)

### 3. `system_logs`
Stocke les logs système pour audit Rick.

```sql
CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL, -- "morty-ops", "jerry-pulse"
  event_type TEXT NOT NULL, -- "deployment", "error", "audit"
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Accès :** Tous les agents (écriture), Rick (lecture pour analyse)

## Commandes Prévues

### 1. Lire les Life Scores
```javascript
const { data } = await supabase
  .from('life_scores')
  .select('*')
  .eq('user_id', amadeus_user_id);
```

### 2. Écrire un Pulse
```javascript
await supabase
  .from('business_pulse')
  .insert({
    project_id: 'summer-v1',
    week: 28,
    year: 2025,
    tmi_current: 2100,
    tmi_target: 2000,
    tvr_score: 0.85
  });
```

### 3. Logger un Événement
```javascript
await supabase
  .from('system_logs')
  .insert({
    agent_id: 'morty-ops',
    event_type: 'deployment',
    message: 'Summer-v1 deployed to production',
    metadata: { status: 'success', duration_ms: 3200 }
  });
```

## Row Level Security (RLS)

Toutes les tables ont RLS activé :
* **life_scores :** L'utilisateur ne peut voir que ses propres scores
* **business_pulse :** Lecture publique, écriture réservée aux agents authentifiés
* **system_logs :** Lecture publique (pour transparence), écriture réservée

## Risques Identifiés

* ⚠️ Service Role Key compromis = accès root à la DB
* ⚠️ Absence de backup = perte de données possible
* ⚠️ Requêtes non optimisées = latence élevée

## Rollback Plan

Si Supabase devient indisponible :
1. **Fallback** : Mode dégradé (lecture locale uniquement depuis `/logs`)
2. **Cache** : Les données critiques sont cachées localement (TTL 24h)
3. **Recovery** : Restauration depuis backup Supabase (quotidien)

---

**Status :** 🟡 Dry-Run (non connecté)  
**Prochaine étape :** Créer les tables + tester une insertion/lecture
