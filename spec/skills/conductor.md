---
name: gemini-conductor-workflow
description: Master Gemini Conductor for Context-Driven Development - setup projects, create tracks, implement features with persistent memory
---

# Gemini Conductor Workflow

This skill teaches any AI agent how to use **Gemini Conductor** for managing software development with persistent context and structured planning.

## When to Use This Skill

Load this skill when you need to:
- Initialize a new project with structured context
- Create a feature or bug fix with proper spec and plan
- Implement features following a predefined workflow
- Maintain project memory across sessions

## Core Philosophy

> "Measure twice, code once. Context is not a prompt, it's an artifact."

Conductor transforms the development cycle from **Chat → Code** to **Context → Spec → Plan → Implement**.

## Installation

```bash
gemini extensions install https://github.com/gemini-cli-extensions/conductor --auto-update
```

## Commands Reference

### 1. `/conductor:setup` - Project Initialization

**Purpose:** Create the foundational context files for the project.

**When:** Run once per project or when joining a new codebase.

**What it does:**
- Interviews you about product goals, users, tech stack
- Generates `conductor/product.md` (source of truth)
- Creates `conductor/tech-stack.md` (technical preferences)
- Sets up `conductor/workflow.md` (team processes)

**Example dialogue:**
```
AI: What is the main goal of this project?
You: Personal Solarpunk interface for managing life domains and business KPIs

AI: Who are the primary users?
You: Amadeus (single user - the architect)

AI: What's your tech stack?
You: React 18, Vite 5, Supabase, Zero NPM dependencies

AI: What's your preferred workflow?
You: Validation Continue, Go/No-Go checkpoints, Rick efficiency audits
```

### 2. `/conductor:newTrack` - Create Feature/Bug Track

**Purpose:** Define WHAT to build and WHY before coding.

**When:** Starting any new feature, bug fix, or refactor.

**What it does:**
- Creates `conductor/tracks/<id>/spec.md` (requirements)
- Generates `conductor/tracks/<id>/plan.md` (implementation steps)
- Updates `conductor/tracks.md` (master tracking file)

**Example:**
```bash
/conductor:newTrack "Build Pulse Monitor UI component for system health"
```

**Output:**
```
Spec Created: conductor/tracks/track-001/spec.md
Plan Created: conductor/tracks/track-001/plan.md

Next step: Review the plan and approve with /conductor:implement
```

### 3. `/conductor:implement` - Execute the Plan

**Purpose:** Work through the plan.md checklist systematically.

**When:** After reviewing and approving the plan.

**What it does:**
- Reads the current track's `plan.md`
- Executes tasks in order
- Updates task status as it progresses
- Pauses for manual verification at phase boundaries

**Example:**
```bash
/conductor:implement
```

**Behavior:**
- Selects next pending task
- Follows workflow (e.g., TDD: Write Test → Fail → Implement → Pass)
- Updates `plan.md` with `[x]` for completed tasks
- Prompts for verification at end of each phase

### 4. `/conductor:status` - Check Progress

**Purpose:** Get a high-level overview of all tracks.

**When:** Want to see what's in progress, completed, or blocked.

**Example:**
```bash
/conductor:status
```

**Output:**
```
Active Tracks:
- track-001 (In Progress): Build Pulse Monitor - Phase 2/4
- track-002 (Pending): Add dark mode toggle

Completed Tracks:
- track-000 (Done): Initial project setup
```

### 5. `/conductor:revert` - Undo Work

**Purpose:** Rollback a track, phase, or specific task.

**When:** Something went wrong and you need to undo changes.

**Example:**
```bash
/conductor:revert track-001
/conductor:revert track-001 phase-2
/conductor:revert track-001 phase-2 task-3
```

**Safety:** Git history remains intact, only logical work units are reverted.

## Guidelines for A'Space OS Project

### Project Context

When using Conductor for A'Space OS, ensure these values are set during `/conductor:setup`:

**Product:**
- Goal: Personal Solarpunk interface for Ikigai management
- User: Amadeus (A0 - The Architect)
- Features: Life Domains tracking, Business Pulse, 12WY execution

**Tech Stack:**
- Frontend: React 18, Vite 5
- Database: Supabase
- External: MCP (Hostinger, Coolify, n8n, GitHub)
- Constraint: **Zero NPM dependencies** (biomimetic efficiency)

**Workflow:**
- Validation: All contracts validated with `node validate_contracts.js`
- Review: Go/No-Go checkpoints with Amadeus
- Audit: Rick efficiency audits (ratio > 0.70)
- Protection: Air Lock filtering via Jerry

### Example Track Workflow

**Scenario:** Add Sunday Uplink automation

1. **Create Track:**
```bash
/conductor:newTrack "Automate Sunday Uplink generation (10 lines max)"
```

2. **Review Generated Plan:**
```markdown
## Phase 1: Analyze Requirements
- [/] Review Sunday Uplink ritual documentation
- [ ] Identify data sources (Pulse files, Life scores)
- [ ] Define output format (10 lines max)

## Phase 2: Create Skill
- [ ] Use skill-generator to create sunday-uplink-generator
- [ ] Test skill with sample data
- [ ] Validate with Rick (efficiency)

## Phase 3: Integration
- [ ] Add to ops/rituals workflow
- [ ] Test end-to-end
- [ ] Document usage in README
```

3. **Approve & Implement:**
```bash
/conductor:implement
```

4. **Monitor Progress:**
```bash
/conductor:status
```

## Integration with MCP Skills

Conductor is the **macro-manager**. During implementation, you'll often use **MCP Skills** for specific tasks:

```
Conductor Track: "Deploy Pulse Monitor to production"
├─ Phase 1: Build component
│  └─ Use MCP Skill: supabase (query life_scores)
├─ Phase 2: Test locally
│  └─ Use MCP Skill: n8n (create test workflow)
└─ Phase 3: Deploy
   └─ Use MCP Skill: coolify (deploy to VPS)
```

See `/spec/skills/mcp/` for individual MCP Skills.

## Common Pitfalls

### ❌ Don't Skip Setup
Without `/conductor:setup`, the AI lacks project context and will "vomit code".

### ❌ Don't Implement Without Reviewing Plan
Always review `plan.md` before `/conductor:implement`. Catch design flaws early.

### ❌ Don't Forget to Commit
Commit `conductor/` files to Git so context persists across sessions.

### ✅ Do Use for Complete Features
Conductor shines for full features, not micro-edits.

### ✅ Do Keep product.md Updated
As the project evolves, update `conductor/product.md` to reflect new goals.

## Success Metrics

Track these to validate Conductor usage:

- **Context Retention:** Can you restore full project context from `conductor/` files?
- **Plan Accuracy:** Are generated plans actionable without major revisions?
- **Revert Safety:** Can you rollback cleanly without breaking Git history?

**Target:** All metrics should be "Yes" after first track completion.

---

> **For A'Space OS:** "Conductor penses. Skills exécutent. Ensemble, ils construisent." — Rick
