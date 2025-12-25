---
name: mcp-n8n-workflows
description: Create and manage n8n workflows - automation, webhooks, integrations for A'Space OS business processes
---

# MCP Skill: n8n Workflow Automation

This skill teaches any AI agent how to create and manage n8n workflows for automating A'Space OS business processes.

## When to Use This Skill

Load this skill when you need to:
- Create automated workflows (e.g., Sunday Uplink generation)
- Set up webhooks for external services
- Integrate multiple tools (Supabase → Email → Slack)
- Schedule recurring tasks
- Transform data between systems

## n8n Overview

**What it is:** Visual workflow automation tool (like Zapier, but self-hosted).

**Hosted on:** Hostinger VPS (Frankfurt)

**Access:** `https://n8n.aspace-os.com` (or VPS IP:5678)

## Prerequisites

- n8n API key (stored in `.env`)
- Basic understanding of n8n nodes (Trigger, Action, Function)
- Workflow ID (from n8n dashboard)

## API Authentication

```bash
curl -H "X-N8N-API-KEY: <N8N_API_KEY>" \
     https://n8n.aspace-os.com/api/v1/...
```

## Commands Reference

### 1. List All Workflows

```bash
GET /api/v1/workflows
```

**Purpose:** See all automation workflows.

**Example response:**
```json
{
  "data": [
    {
      "id": "wf-123",
      "name": "Sunday Uplink Generator",
      "active": true,
      "tags": ["ritual", "weekly"]
    }
  ]
}
```

### 2. Create New Workflow

```bash
POST /api/v1/workflows
{
  "name": "Daily Pulse Checker",
  "nodes": [
    {
      "type": "n8n-nodes-base.schedule",
      "parameters": {
        "rule": {"interval": [{"field": "hours", "value": 22}]}
      }
    },
    {
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "getAll",
        "table": "system_logs"
      }
    }
  ]
}
```

**When:** Creating a new automation.

### 3. Activate/Deactivate Workflow

```bash
PATCH /api/v1/workflows/<WORKFLOW_ID>
{
  "active": true
}
```

**When:** Enabling or pausing an automation.

### 4. Execute Workflow Manually

```bash
POST /api/v1/workflows/<WORKFLOW_ID>/execute
{"data": {"test": true}}
```

**When:** Testing a workflow before activation.

### 5. Get Workflow Execution History

```bash
GET /api/v1/executions?workflowId=<WORKFLOW_ID>&limit=10
```

**Purpose:** Debug failed runs.

**Example response:**
```json
{
  "data": [
    {
      "id": "exec-456",
      "finished": true,
      "mode": "trigger",
      "startedAt": "2025-07-14T10:00:00Z",
      "status": "success"
    }
  ]
}
```

## Integration with A'Space OS

### Example Workflow: Sunday Uplink Generator

**Purpose:** Every Sunday 6h00, generate the 10-line Uplink for Amadeus.

**Nodes:**
1. **Schedule Trigger** (6h00 every Sunday)
2. **Supabase Query** (Get Pulse files from past week)
3. **Function Node** (Aggregate data, format 10 lines)
4. **Email Node** (Send to Amadeus)
5. **Supabase Insert** (Log Uplink to `uplinks` table)

**n8n Workflow JSON:**
```json
{
  "name": "Sunday Uplink Generator",
  "nodes": [
    {
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {"dayOfWeek": 0, "hour": 6, "minute": 0}
      },
      "name": "Every Sunday 6AM"
    },
    {
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "getAll",
        "table": "business_pulse",
        "filters": "created_at.gte.{{$now.minus({days: 7})}}"
      },
      "name": "Get Pulses"
    },
    {
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Aggregate and format\nconst pulses = items.map(i => i.json);\nconst uplink = generateUplink(pulses); // See /ops/rituals/sunday-uplink.md\nreturn [{json: {uplink}}];"
      },
      "name": "Format Uplink"
    },
    {
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "to": "amadeus@aspace-os.com",
        "subject": "Sunday Uplink - Week {{$now.weekNumber}}",
        "text": "{{$json.uplink}}"
      },
      "name": "Send Email"
    }
  ],
  "active": true
}
```

### Workflow-as-a-Tool Pattern

**Concept:** Expose workflows as MCP tools that agents can trigger.

**Example:** Jerry needs to check TMI status

```bash
# Jerry calls n8n workflow
POST /api/v1/workflows/check-tmi/execute
{"month": "2025-07"}

# Workflow returns
{
  "tmi_current": 2100,
  "tmi_target": 2000,
  "status": "🟢 On track"
}
```

**A'Space OS Workflows:**
- `check-tmi` → Calculate current month income
- `health-check` → Verify all systems operational
- `backup-db` → Trigger Supabase backup
- `deploy-summer` → Orchestrate Coolify deployment

## Guidelines for A'Space OS

### Security

- ❌ **Never** expose sensitive data in workflow outputs
- ✅ Store credentials in n8n's credential manager
- ✅ Use webhook authentication (HMAC signatures)
- ✅ Validate all incoming webhook payloads

### Efficiency (Rick Audit)

- ❌ Don't create 10 workflows for similar tasks (use parameters)
- ✅ Reuse common nodes (Supabase connection, Email sender)
- ✅ Cache results when possible (avoid redundant queries)
- ✅ Use sub-workflows for complex logic

### Air Lock Filtering

**Risk Level:** MEDIUM (workflows can trigger external actions)

**Jerry's Decision:**
- Create workflow → ALLOW (can be deactivated)
- Execute workflow → MEDIUM (depends on what it does)
- Delete workflow → HIGH (Amadeus ACK for critical automations)

## Common Tasks

### Task: Create Sunday Uplink Workflow

1. **Via n8n UI:**
   - Go to https://n8n.aspace-os.com
   - Click "New Workflow"
   - Add nodes as per example above
   - Save & Activate

2. **Via API:**
```bash
curl -X POST \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @sunday-uplink-workflow.json \
  https://n8n.aspace-os.com/api/v1/workflows
```

### Task: Test Workflow Without Waiting

```bash
# Execute manually with test data
curl -X POST \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -d '{"test_mode": true}' \
  https://n8n.aspace-os.com/api/v1/workflows/sunday-uplink/execute
```

### Task: Check Last 5 Executions

```bash
curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "https://n8n.aspace-os.com/api/v1/executions?workflowId=sunday-uplink&limit=5"
```

## Troubleshooting

### Problem: Workflow Not Triggering

**Cause:** Workflow inactive or schedule timezone mismatch.

**Solution:**
```bash
# Check if active
GET /api/v1/workflows/sunday-uplink

# Activate if needed
PATCH /api/v1/workflows/sunday-uplink
{"active": true}
```

### Problem: Node Execution Failed

**Cause:** API credentials expired or service unavailable.

**Solution:**
1. Check execution logs: `GET /api/v1/executions/<EXEC_ID>`
2. Look for error message in failed node
3. Update credentials in n8n UI if expired

### Problem: Webhook Not Receiving Data

**Cause:** Firewall blocking or incorrect URL.

**Solution:**
```bash
# Test webhook manually
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  https://n8n.aspace-os.com/webhook/test-hook
```

## Success Metrics

- **Automation Rate:** 80% of repetitive tasks automated
- **Workflow Uptime:** > 99% (no missed schedule triggers)
- **Error Rate:** < 5% of executions fail

---

> **For A'Space OS:** "n8n automates the rituals. Jerry watches the pulse." — Morty
