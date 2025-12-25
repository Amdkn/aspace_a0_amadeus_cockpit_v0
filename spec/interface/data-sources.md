# Data Sources : A'Space OS Interface

## Architecture de Données

L'interface consomme 3 sources de données principales :

### 1. **Local Files** (Cockpit Repository)
### 2. **Supabase** (Cloud Database)
### 3. **MCP Tools** (n8n Workflows via API)

---

## 1. Local Files (Priority: High)

**Principe :** La source de vérité primaire est **locale**.

### Fichiers Consommés

#### Contracts (Logs)
* **Path :** `/logs/intents/*.json`, `/logs/decisions/*.json`, etc.
* **Usage :** Afficher l'historique des Intents/Decisions/Orders
* **Refresh :** En temps réel (file watcher)

#### PARA (Projects/Areas/Resources)
* **Path :** `/para/projects/`, `/para/areas/`, etc.
* **Usage :** Afficher le tree view dans la sidebar "Forêt"
* **Refresh :** En temps réel (file watcher)

#### Knowledge Base
* **Path :** `/Knowledge Base/**/*.md`
* **Usage :** Search bar globale (fuzzy search)
* **Refresh :** À la demande (pas besoin de temps réel)

---

## 2. Supabase (Cloud, Sync avec Local)

**Principe :** Supabase stocke les données **agrégées** et **historiques** pour analyse.

### Tables Consommées

#### `life_scores`
```sql
SELECT domain, score, updated_at
FROM life_scores
WHERE user_id = $AMADEUS_USER_ID
ORDER BY updated_at DESC
LIMIT 1 PER domain;
```

**Usage :** Afficher le radar des Life Domains (Horizon)  
**Refresh :** Polling toutes les 30s (ou realtime subscription)

#### `business_pulse`
```sql
SELECT week, year, tmi_current, tmi_target, tvr_score
FROM business_pulse
WHERE project_id = 'ASPACE-GLOBAL'
ORDER BY created_at DESC
LIMIT 10;
```

**Usage :** Afficher les KPIs dans le Pulse Monitor  
**Refresh :** Polling toutes les 60s

#### `system_logs`
```sql
SELECT agent_id, event_type, message, created_at
FROM system_logs
WHERE event_type IN ('error', 'warning')
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

**Usage :** Afficher les alertes dans le Status Indicator (Horizon)  
**Refresh :** Polling toutes les 10s

---

## 3. MCP Tools (n8n Workflows)

**Principe :** Les workflows n8n sont exposés comme des **outils invocables**.

### Workflows Consommés

#### `business-pulse-aggregator`
```javascript
// Appelé manuellement (clic sur "Generate Pulse")
const result = await mcp.invoke("n8n/business-pulse", {
  week: currentWeek,
  year: currentYear
});

// Résultat: { tmi_total, tvr_avg, domains_status }
```

**Usage :** Générer un Pulse à la demande  
**Trigger :** Manuel (bouton "Generate Pulse")

#### `sunday-uplink-generator`
```javascript
// Appelé automatiquement (dimanche 6h00)
const uplink = await mcp.invoke("n8n/sunday-uplink", {
  week: currentWeek
});

// Résultat: { lines: ["1. ...", "2. ...", ...] }
```

**Usage :** Générer le Sunday Uplink  
**Trigger :** Automatique (cron) ou manuel

#### `deploy-summer`
```javascript
// Appelé depuis le terminal
const deployment = await mcp.invoke("coolify/deploy", {
  service: "summer-v1",
  env: "production"
});

// Résultat: { status: "success", url: "..." }
```

**Usage :** Déployer une instance Summer  
**Trigger :** Commande terminal ou bouton UI

---

## Data Flow Architecture

```
┌─────────────┐
│   USER      │
│  (Amadeus)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  A'SPACE OS INTERFACE (React + Vite)    │
│  ┌─────────┬──────────┬────────────┐   │
│  │ Local   │ Supabase │ MCP Tools  │   │
│  │ Files   │ API      │ (n8n)      │   │
│  └─────────┴──────────┴────────────┘   │
└─────────────────────────────────────────┘
       │          │            │
       ▼          ▼            ▼
┌──────────┐ ┌─────────┐ ┌──────────┐
│ Cockpit  │ │Supabase │ │ Coolify  │
│ Repo     │ │ Cloud   │ │  + n8n   │
└──────────┘ └─────────┘ └──────────┘
```

---

## Caching Strategy

### Local Cache (Browser)
* **Life Scores** : TTL 60s (évite le spam Supabase)
* **PARA Tree** : Pas de cache (file watcher local)
* **Pulse KPIs** : TTL 120s

### Offline Mode
Si Supabase/MCP indisponibles :
* **Fallback** : Lire uniquement les fichiers locaux
* **Warning** : Afficher un banner "Mode dégradé"
* **Retry** : Tentative de reconnexion toutes les 30s

---

> **"Local first. Cloud second. MCP third. Toujours un fallback."**
