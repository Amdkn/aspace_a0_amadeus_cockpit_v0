# A'Space OS - Multi-Agent Interoperability Guide

**Purpose:** Enable seamless resource sharing between Gemini (Antigravity), Claude, and OpenAI Codex agents.

**Date:** 2025-12-24

---

## Architecture Overview

```
A'Space OS Repository
├── .gemini/config.json       # Gemini CLI + Conductor + MCP
├── .claude/config.json       # Claude + MCP (Conductor-aware)
├── .agent/config.json        # OpenAI Codex + MCP
├── spec/skills/              # Universal Skills (SKILL.md format)
│   ├── conductor.md         # Gemini Conductor workflow
│   └── mcp/                 # MCP Skills (all agents can use)
├── conductor/               # Conductor artifacts (shared context)
│   ├── product.md
│   ├── tech-stack.md
│   └── tracks/
└── ops/automation/
    └── orchestrator.py      # Autonomous task executor
```

---

## Agent Capabilities Matrix

| Feature | Gemini (Antigravity) | Claude | OpenAI Codex |
|---------|---------------------|--------|--------------|
| **Conductor** | ✅ Native support | ✅ Can read artifacts | ❌ No (but can read docs) |
| **MCP** | ✅ Via `.gemini/config.json` | ✅ Via `.claude/config.json` | ✅ Via `.agent/config.json` |
| **Skills** | ✅ Auto-load from `spec/skills/` | ✅ Load via prompt | ✅ Load via prompt |
| **Orchestrator** | ✅ Primary (via CLI) | ⚠️ If CLI available | ⚠️ If CLI available |

---

## 1. Unified MCP Configuration

All three agents share the **same MCP servers** (Hostinger, Coolify, n8n, GitHub, Supabase).

### Configuration Files

**Gemini:** `.gemini/config.json`
```json
{
  "mcpServers": { ... },
  "skills": {
    "path": "spec/skills",
    "autoload": ["conductor.md", "mcp/*.md"]
  },
  "conductor": {
    "enabled": true,
    "product": "conductor/product.md"
  }
}
```

**Claude:** `.claude/config.json`
```json
{
  "mcpServers": { ... },
  "skills": {
    "path": "spec/skills",
    "note": "Claude can load SKILL.md files from this directory"
  }
}
```

**OpenAI:** `.agent/config.json`
```json
{
  "mcpServers": { ... },
  "skills": {
    "path": "spec/skills",
    "note": "Codex can reference SKILL.md files for MCP usage"
  }
}
```

### Environment Variables (Shared)

All agents use the **same `.env` file**:

```bash
# VPS Access
VPS_IP=123.45.67.89
SSH_KEY_PATH=/path/to/key

# Coolify
COOLIFY_API_TOKEN=...

# n8n
N8N_API_KEY=...

# GitHub
GITHUB_PAT=...

# Supabase
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_CONNECTION_STRING=...
```

---

## 2. Skills Interoperability

All agents can load **universal Skills** from `spec/skills/`.

### Loading Skills

**Gemini (auto-load):**
```bash
# Gemini CLI auto-loads skills listed in .gemini/config.json
gemini chat --message "Use conductor to create a new track"
```

**Claude (manual load):**
```
Please load the skill: spec/skills/conductor.md

Now create a new track for Sunday Uplink automation.
```

**OpenAI Codex (reference):**
```
Reference the MCP usage patterns in spec/skills/mcp/supabase.md

Query the life_scores table for the latest entry.
```

### Available Skills

| Skill | Purpose | Used By |
|-------|---------|---------|
| `conductor.md` | Gemini Conductor workflow | Gemini, Claude (concept) |
| `mcp/hostinger.md` | VPS SSH management | All agents |
| `mcp/coolify.md` | Deployment API | All agents |
| `mcp/n8n.md` | Workflow automation | All agents |
| `mcp/github.md` | Version control | All agents |
| `mcp/supabase.md` | Database operations | All agents |
| `mcp/dokploy.md` | Alternative deployment | All agents |

---

## 3. Conductor Sharing

**Gemini** uses Conductor natively. **Claude** can read Conductor artifacts. **OpenAI** can reference them as documentation.

### Workflow

1. **Gemini creates track:**
```bash
gemini chat --message "/conductor:newTrack 'Build Pulse Monitor component'"
```

2. **Conductor generates files:**
```
conductor/tracks/track-001/
├── spec.md   # Requirements
└── plan.md   # Implementation steps
```

3. **Claude reads the plan:**
```
Load file: conductor/tracks/track-001/plan.md

Implement Phase 1 of the plan: Create React component structure.
```

4. **OpenAI can also reference:**
```
Read conductor/tracks/track-001/spec.md for context.

Write tests for the Pulse Monitor component.
```

### Shared Context Files

- **`conductor/product.md`** : Project vision (all agents read this)
- **`conductor/tech-stack.md`** : Technical choices (all agents follow)
- **`conductor/workflow.md`** : Team processes (all agents adhere)

---

## 4. Autonomous Orchestration

The **orchestrator.py** script eliminates the human bottleneck.

### How It Works

```python
# Define autonomous tasks
Task(
    name='sunday-uplink',
    agent='gemini-cli',  # Or 'claude', 'openai-codex'
    prompt='Load skill: conductor.md. Create Sunday Uplink track.',
    schedule_type='interval',
    interval=10080  # 7 days
)
```

### Running the Orchestrator

```bash
# Start daemon (runs tasks on schedule)
python ops/automation/orchestrator.py start

# Run specific task once
python ops/automation/orchestrator.py run sunday-uplink

# List all tasks
python ops/automation/orchestrator.py list
```

### Predefined A'Space OS Tasks

| Task | Agent | Schedule | Purpose |
|------|-------|----------|---------|
| `sunday-uplink` | Gemini CLI | Weekly (Sunday 6AM) | Generate weekly summary |
| `daily-pulse` | Gemini CLI | Daily (10PM) | Check system health |
| `rick-audit` | Gemini CLI | Weekly (Friday 6PM) | Efficiency audit |
| `github-sync` | Gemini CLI | Hourly | Commit logs automatically |

---

## 5. Multi-Agent Collaboration Patterns

### Pattern 1: Conductor → Claude → OpenAI

1. **Gemini (Conductor)** creates the track and plan
2. **Claude** implements the code
3. **OpenAI Codex** writes the tests

### Pattern 2: Orchestrator Relay

```python
# Task 1: Gemini creates plan
Task(
    name='create-plan',
    agent='gemini-cli',
    prompt='/conductor:newTrack "Feature X"'
)

# Task 2: Claude implements (triggered after Task 1)
Task(
    name='implement',
    agent='claude',
    prompt='Load conductor/tracks/latest/plan.md. Implement Phase 1.',
    depends_on='create-plan'
)

# Task 3: OpenAI tests (triggered after Task 2)
Task(
    name='test',
    agent='openai-codex',
    prompt='Load conductor/tracks/latest/spec.md. Write unit tests.',
    depends_on='implement'
)
```

### Pattern 3: MCP Concurrent Access

All agents can use the **same MCP servers** simultaneously:

- **Gemini** deploys via Coolify
- **Claude** updates Supabase
- **OpenAI** commits to GitHub

---

## 6. Setup Instructions

### Step 1: Install Dependencies

```bash
# Python orchestrator dependencies
pip install schedule

# Gemini CLI (if not installed)
npm install -g @google/generative-ai-cli

# Claude CLI (when available)
# OpenAI CLI (when available)
```

### Step 2: Configure MCPs

```bash
# Copy config templates
cp .gemini/config.json.template .gemini/config.json
cp .claude/config.json.template .claude/config.json
cp .agent/config.json.template .agent/config.json

# Update with your credentials in .env
```

### Step  3: Test MCPs

```bash
# Test Gemini MCP
gemini mcp list

# Test manually
curl -H "apikey: $SUPABASE_ANON_KEY" \
  "https://$SUPABASE_URL/rest/v1/life_scores?select=*&limit=1"
```

### Step 4: Start Orchestrator

```bash
# Test a single task
python ops/automation/orchestrator.py run daily-pulse

# Start daemon
python ops/automation/orchestrator.py start &
```

---

## 7. Security & Access Control

### Air Lock Filtering

All agents go through **Jerry's Air Lock**:

- **LOW risk** (SELECT, read-only) → Auto-approve
- **MEDIUM risk** (deploy, update) → Rick audit
- **HIGH risk** (delete, production) → Amadeus ACK

### MCP Credentials Isolation

Each agent has its **own credential scope**:

```bash
# Gemini (full access)
GEMINI_CREDENTIALS=read+write+deploy

# Claude (limited)
CLAUDE_CREDENTIALS=read+write

# OpenAI (read-only)
OPENAI_CREDENTIALS=read
```

---

## 8. Success Metrics

Track these to validate interoperability:

- **Shared MCP Usage:** All 3 agents successfully use same MCPs
- **Conductor Adoption:** Claude can read and follow Conductor plans
- **Orchestrator Uptime:** 99%+ autonomous task completion
- **Human Intervention:** < 10% of tasks require manual approval

---

> **"Three agents, one mycelium. Conductor guides, Skills execute, Orchestrator automates."** — Robin (A'0)
