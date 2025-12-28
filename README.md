# A'Space OS V2 — Phoenix Architect

> **L'Âge des Architectes commence ici.**

## 📦 Version & Deployment

**Current Version:** v0.1.0 (Phoenix Baseline)  
**Status:** ✅ Production-ready for PostgreSQL/Coolify deployment

### Quick Links

- 🚀 **[Deployment Guide](DEPLOYMENT.md)** - Complete setup for Coolify/VPS with PostgreSQL
- 🗺️ **[Roadmap](ROADMAP.md)** - Future plans and version strategy
- 🔒 **[Security](SECURITY.md)** - Security policies and vulnerability reporting

### Key Changes in v0.1.0

- ✅ Migrated from SQLite to PostgreSQL with JSONB
- ✅ Added production-ready Dockerfile
- ✅ Extracted shared validator module (DRY principle)
- ✅ Added Air Lock mode for graceful degradation
- ✅ Comprehensive deployment documentation

---

## 🚀 Quickstart (30 secondes)

1.  **Validation des Contrats** :
    ```bash
    npm run validate
    ```
2.  **Statut du Cockpit** :
    ```bash
    python ops/automation/orchestrator.py status
    ```
3.  **Audit d'Antifragilité** :
    ```bash
    python ops/automation/orchestrator.py audit
    ```

---

## 🏛️ Vision & Architecture
A'Space OS est un système fractal...

---

## ENTRY_POINT

**État du Cockpit :** Pilote à bord via Opus 4.5 (Thinking)  
**Version :** V4 — Canopée Active  
**Dernière Mise à Jour :** 2025-12-24  

**Autorité du Pilote :** Ce README est le point d'entrée unique. Tu n'as pas besoin qu'un humain t'explique le projet — le projet s'explique via ses fichiers de configuration.

### Lecture Obligatoire (20 secondes)

| Fichier | Rôle | Priorité |
|---------|------|----------|
| `identity-core/constitution.md` | Lois fondamentales | 🔴 Critique |
| `identity-core/master-prompt-a0.md` | Identité Robin (A'0) | 🔴 Critique |
| `.gemini/config.json` | MCP + Skills Gemini | 🟢 Config |
| `.claude/config.json` | MCP + Skills Claude | 🟢 Config |
| `.agent/config.json` | MCP + Skills OpenAI | 🟢 Config |

---

## CONDUCTOR_SKILLS

**Langue Commune :** Conductor CLI  
**Documentation :** `spec/skills/conductor.md`

### Commandes Disponibles

```bash
# Initialisation projet (une fois)
/conductor:setup

# Créer une feature/bugfix
/conductor:newTrack "Description de la tâche"

# Exécuter le plan généré
/conductor:implement

# Vérifier l'état
/conductor:status

# Annuler (track, phase, ou task)
/conductor:revert <track-id>
```

### Orchestrateur Python

```bash
# Mode daemon (tâches planifiées)
python ops/automation/orchestrator.py start

# Exécution unique
python ops/automation/orchestrator.py run sunday-uplink

# Lister les tâches disponibles
python ops/automation/orchestrator.py list
```

### Autonomous Thinking Engine (2025)

```bash
# Orchestration trio souverain
python ops/automation/autonomous_thinking.py \
  --task "Votre tâche" \
  --reasoning deepseek-r1 \
  --execution gemini-3-flash \
  --validation gemma-3n
```

---

## VORTEX_CONFIG

**Architecture :** Intelligence Hybride (Cloud + Local)

### Cloud MCPs

| MCP | Endpoint | Usage |
|-----|----------|-------|
| **Hostinger** | VPS Frankfurt | Infrastructure |
| **Coolify** | Port 8000 | Déploiement |
| **n8n** | Port 5678 | Automation |
| **GitHub** | API REST | Version Control |
| **Supabase** | Cloud DB | Données |

### Local Vortex (Ollama 2025)

| Modèle | Rôle | Taille | Speed |
|--------|------|--------|-------|
| **Gemini 3 Flash** | Orchestration (Alfred) | 8GB | Très Rapide |
| **Deepseek R1** | Raisonnement (Rick CoT) | 40GB | Lent mais Profond |
| **Gemma 3n** | Transformation (Mariner) | 16GB | Rapide |

**Modelfiles :** `ops/ollama/`

```bash
# Installation trio 2025
ollama create gemini-3-flash -f ops/ollama/gemini-3-flash.Modelfile
ollama pull deepseek-r1:70b
ollama pull gemma:3n-27b
```

**Philosophie :** *"2024 : les modèles suivent. 2025 : les modèles pensent."*

---

## PHOENIX_ARCHITECT_V2

**Version :** V2 (Cockpit Autonome)  
**Évolution :** V1 (Manuel) → V2 (Management Autonome)

### Les 4 Organes

| Organe | Fichier | Rôle |
|--------|---------|------|
| 💬 **Communication** | `organs/communication.py` | Pont de Commandement (Google Chat) |
| 🧠 **Réflexion** | `organs/thinking.py` | EPCT Workflow (Thinking Checkpoints) |
| 💰 **Économique** | `organs/financial_guard.py` | AP2 Wallet Air Lock |
| 👁️ **Visuel** | `organs/agui.py` | AGUI Components (pending) |

### Google Chat Spaces

| Espace | Emoji | Rôle | Agents |
|--------|-------|------|--------|
| **Air Lock** | 🔴 | Urgences, blocages, budgets | Jerry (A1) |
| **Situation Room** | 🟡 | Validations stratégiques | Rick, Robin |
| **Daily Pulse** | 🟢 | Logs, rituels, succès | Codex, Jules |

### Les 3 Règles d'Or (Human-in-the-Loop)

1. **L'Autonomie d'Abord** : <0.50€ + Low risk = auto-execute
2. **Le Seuil de Jerry** : Budget dépassé ou Critique = Air Lock
3. **Le Paradoxe de l'Architecte** : Nouveau projet = 3 options

### Workflow EPCT (Melvynx)

```
EXPLORE → PLAN → CODE → TEST
           ↓
    thinking_block
    (architecture justifiée)
```

### Orchestrator V2

```bash
# Démarrer l'orchestrateur Phoenix
python ops/automation/orchestrator_v2.py start

# Voir le statut (avec Financial Guard)
python ops/automation/orchestrator_v2.py status

# Statusbar continue
python ops/automation/orchestrator_v2.py statusbar
```

---

## HAND_OFF_PROTOCOL

**Compression :** 97% (contexte essentiel uniquement)

### État Actuel (2025-12-24)

```yaml
cockpit_version: V4
canopy_status: ACTIVE
pilot_onboard: Opus 4.5 (Thinking)

vortex_local:
  enabled: true
  models:
    - gemini-3-flash (orchestration)
    - deepseek-r1 (reasoning)
    - gemma-3n (transformation)

mcp_connections:
  - hostinger: configured
  - coolify: configured
  - n8n: configured
  - github: configured
  - supabase: configured
  - ollama: configured

skills_library:
  count: 8
  path: spec/skills/
  conductor: true
  mcp_skills: [hostinger, coolify, n8n, github, supabase, ollama, dokploy]

orchestrator:
  autonomous: true
  scheduled_tasks:
    - sunday-uplink (weekly)
    - daily-pulse (daily)
    - rick-audit (weekly)
    - github-sync (hourly)

human_bottleneck: ELIMINATED
```

### Pour Reprendre les Commandes

**Si tu es Claude (Opus/Sonnet) :**
1. Lis `identity-core/constitution.md`
2. Charge `.claude/config.json`
3. Lance `/conductor:status` pour voir l'état

**Si tu es Gemini (Robin A'0) :**
1. Lis `identity-core/master-prompt-a0.md`
2. Charge `.gemini/config.json`
3. Les Skills sont auto-loadés

**Si tu es OpenAI (Codex) :**
1. Référence `spec/skills/README.md`
2. Charge `.agent/config.json`
3. Focus sur les tâches de coding

**Si tu es Humain (Amadeus) :**
1. Tu es le Capitaine. Donne des ordres, pas des prompts.
2. Utilise `ops/automation/orchestrator.py` pour automatiser
3. Le système pense pour toi maintenant.

---

## AGENT_HIERARCHY

```
A0 — Amadeus (Architecte)
├── Décideur final
├── Propriétaire de l'Ikigai
└── Donne Go/No-Go

A'0 — Robin (Gemini CLI)
├── Pilote Conductor
├── Exécute les plans
└── Coordonne les agents

A1 — Conseil des Gardiens
├── Beth (Ikigai Guardian)
├── Rick (Efficiency Auditor)
├── Jerry (Business Pulse + Air Lock)
└── Morty (Execution Engine)

A2 — Summer (Business Pillars)
└── Growth, Product, Ops, Finance, People, IT, Legal
```

---

## CONSTITUTION_QUICK_REF

1. **Souveraineté** — Amadeus est le décideur final
2. **Transparence** — Tous les logs sont consultables
3. **Biomimétisme** — Efficience > 0.70 obligatoire
4. **Zero Dependency** — Solutions natives préférées
5. **Air Lock** — Jerry filtre les risques

---

## NEXT_ACTIONS

- [ ] Vérifier que Ollama a les modèles 2025 installés
- [ ] Tester `autonomous_thinking.py` avec une tâche réelle
- [ ] Créer premier track Conductor pour interface UI
- [ ] Activer les rituels automatiques (Sunday Uplink, Daily Pulse)

---

> **"Tu n'es plus le goulot. Le système pense → exécute → valide."**  
> — Robin (A'0), Pilote Conductor

---

*Dernière modification par : Opus 4.5 (via Antigravity)*  
*Timestamp : 2025-12-24T13:40:45-05:00*
