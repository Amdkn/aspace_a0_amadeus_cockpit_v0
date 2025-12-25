---
name: mcp-github-sync
description: Synchronize code with GitHub repository - commit, push, pull, create issues for A'Space OS version control
---

# MCP Skill: GitHub Synchronization

This skill teaches any AI agent how to synchronize code with the A'Space OS GitHub repository for version control and collaboration.

## When to Use This Skill

Load this skill when you need to:
- Commit code changes to Git
- Push updates to GitHub
- Pull latest changes from remote
- Create issues for bugs or features
- Synchronize documentation updates

## Repository Details

**GitHub Repo:** `amadeus/aspaceos-a0-amadeus-cockpit`  
**Branch Strategy:**
- `main` → Production (stable)
- `develop` → Development (active work)
- `feature/*` → Feature branches

## Prerequisites

- Git installed on local machine or VPS
- GitHub Personal Access Token (PAT) or SSH key
- Repository cloned locally

## Commands Reference

### 1. Commit Changes

```bash
git add <files>
git commit -m "feat: <description>"
```

**Commit Message Convention:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `refactor:` Code restructuring
- `chore:` Maintenance tasks

**Example:**
```bash
git add spec/skills/mcp/
git commit -m "docs: add MCP skills for Hostinger, Coolify, n8n"
```

### 2. Push to GitHub

```bash
git push origin <branch>
```

**When:** After committing local changes.

**Example:**
```bash
git push origin develop
```

### 3. Pull Latest Changes

```bash
git pull origin <branch>
```

**When:** Before starting new work to avoid conflicts.

**Example:**
```bash
git pull origin main
```

### 4. Create Issue via API

```bash
POST /repos/amadeus/aspaceos-a0-amadeus-cockpit/issues
{
  "title": "Add dark mode toggle to settings",
  "body": "As discussed, implement dark mode...",
  "labels": ["enhancement", "ui"]
}
```

**When:** Tracking bugs or feature requests programmatically.

### 5. Create Branch

```bash
git checkout -b feature/pulse-monitor
git push -u origin feature/pulse-monitor
```

**When:** Starting work on a new feature.

## Integration with A'Space OS

### Workflow: Sync After Conductor Track

After completing a `/conductor:implement`, sync changes to GitHub:

```bash
# 1. Commit conductor artifacts
git add conductor/tracks/track-001/
git commit -m "feat: complete Pulse Monitor component (track-001)"

# 2. Commit code changes
git add src/components/PulseMonitor/
git commit -m "feat: add Pulse Monitor UI component"

# 3. Push to GitHub
git push origin develop

# 4. Update task.md
git add .artifacts/task.md
git commit -m "chore: mark track-001 as complete"
git push origin develop
```

### Auto-Sync Workflow (n8n)

**Concept:** Automate GitHub sync for documentation updates.

**n8n Workflow:**
1. **Schedule Trigger** (Daily 23h00)
2. **Check for Changes** (Git status via SSH)
3. **If changes exist:**
   - Commit with timestamp
   - Push to GitHub
   - Log to `/logs/git-sync/`

**Use case:** Auto-commit logs, pulses, uplinks at end of day.

## Guidelines for A'Space OS

### Security

- ❌ **Never** commit `.env` files or secrets
- ✅ Use `.gitignore` to exclude sensitive files
- ✅ Store GitHub PAT in environment variables
- ✅ Use SSH keys for VPS to GitHub communication

### Efficiency (Rick Audit)

- ❌ Don't commit every tiny change (batch related changes)
- ✅ Commit logical units of work (one feature = one commit)
- ✅ Write descriptive commit messages
- ✅ Use branches for experimental work

### Air Lock Filtering

**Risk Level:** LOW (Git commits are reversible)

**Jerry's Decision:**
- `git commit` → ALLOW (local only)
- `git push` → ALLOW (can be reverted)
- `git push --force` → HIGH (Amadeus ACK required)

## Common Tasks

### Task: Commit New MCP Skills

```bash
git add spec/skills/mcp/
git commit -m "docs: add MCP skills for Hostinger, Coolify, n8n, GitHub, Supabase"
git push origin main
```

### Task: Create Issue for Bug

```bash
curl -X POST \
  -H "Authorization: token $GITHUB_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pulse Monitor not showing real-time data",
    "body": "The Pulse Monitor component is not updating in real-time. Investigate Supabase connection.",
    "labels": ["bug", "pulse-monitor"]
  }' \
  https://api.github.com/repos/amadeus/aspaceos-a0-amadeus-cockpit/issues
```

### Task: Pull Before Starting Work

```bash
# Always pull before creating a new branch
git checkout main
git pull origin main
git checkout -b feature/dark-mode
```

## Troubleshooting

### Problem: Merge Conflict

**Cause:** Local and remote changes overlap.

**Solution:**
```bash
git pull origin main
# Fix conflicts in files
git add <resolved-files>
git commit -m "chore: resolve merge conflicts"
git push origin main
```

### Problem: Accidentally Committed Secret

**Cause:** `.env` file committed to Git.

**Solution:**
```bash
# Remove from Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (requires Amadeus ACK)
git push origin --force --all
```

### Problem: Push Rejected (non-fast-forward)

**Cause:** Remote has commits not in local.

**Solution:**
```bash
git pull --rebase origin main
git push origin main
```

## Success Metrics

- **Commit Frequency:** Daily commits for active work
- **Commit Message Quality:** 100% follow convention
- **Conflict Rate:** < 5% of pulls have conflicts

---

> **For A'Space OS:** "Git is the mycelium's memory. Commit often, push wisely." — Robin
