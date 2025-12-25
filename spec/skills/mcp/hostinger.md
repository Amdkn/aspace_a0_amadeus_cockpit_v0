---
name: mcp-hostinger-vps
description: Manage Hostinger VPS via SSH - server access, service monitoring, file operations for A'Space OS infrastructure
---

# MCP Skill: Hostinger VPS Management

This skill teaches any AI agent how to interact with the Hostinger VPS that hosts A'Space OS infrastructure.

## When to Use This Skill

Load this skill when you need to:
- Access the VPS via SSH
- Check server health (CPU, memory, disk)
- Manage services (Coolify, n8n, Docker)
- Deploy or update applications
- View logs for debugging

## Server Details

**Provider:** Hostinger  
**Location:** Frankfurt, Germany (eu-central)  
**Services Hosted:**
- Coolify (deployment platform)
- n8n (workflow automation)
- Docker (containerization)
- Supabase local instances (optional)

## Prerequisites

- SSH access configured
- VPS IP address (stored in `.env` or secrets)
- SSH key authentication enabled

## Commands Reference

### 1. SSH Connection

```bash
ssh root@<VPS_IP>
```

**When:** Need direct terminal access to the server.

**Safety:** Always verify you're on the correct server before running destructive commands.

### 2. Check Server Health

#### CPU & Memory
```bash
htop
# or
top
```

**What to look for:**
- CPU usage < 80% (normal operation)
- Memory usage < 90% (avoid OOM kills)

#### Disk Space
```bash
df -h
```

**Alert if:** Any filesystem > 85% full.

#### Docker Containers
```bash
docker ps
```

**Expected containers:**
- `coolify`
- `n8n`
- Summer instances (if deployed)

### 3. Service Management

#### Restart Coolify
```bash
cd /opt/coolify
docker compose restart
```

**When:** Coolify UI unresponsive or after config changes.

#### Restart n8n
```bash
cd /opt/n8n
docker compose restart
```

**When:** Workflows not triggering or n8n UI slow.

#### View Docker Logs
```bash
docker logs <container_name> --tail 100 --follow
```

**When:** Debugging service failures.

### 4. File Operations

#### Upload File
```bash
scp ./local-file.txt root@<VPS_IP>:/opt/destination/
```

#### Download File
```bash
scp root@<VPS_IP>:/opt/logs/error.log ./local-logs/
```

#### Edit Configuration
```bash
nano /opt/coolify/.env
# or
vim /opt/n8n/config.json
```

**Safety:** Always backup configs before editing:
```bash
cp /opt/coolify/.env /opt/coolify/.env.backup
```

## Integration with A'Space OS

### Deployment Workflow

When deploying a Summer instance:

1. **Morty (Ops)** triggers deployment
2. **Use MCP Skill: coolify** to create the deployment
3. Coolify pulls from GitHub and deploys to VPS
4. **Use this skill** to verify logs:
```bash
ssh root@<VPS_IP>
docker logs summer-v1 --tail 50
```

### Monitoring Workflow

**Daily Pulse (22h00):**
1. **Use this skill** to check server health
2. Log results to `/logs/daily-pulse/`
3. If any metric Orange/Red → Alert Jerry

```bash
# Quick health check script
ssh root@<VPS_IP> << 'EOF'
echo "=== CPU & Memory ==="
top -bn1 | head -5

echo "=== Disk Space ==="
df -h | grep -v tmpfs

echo "=== Docker Containers ==="
docker ps --format "table {{.Names}}\t{{.Status}}"
EOF
```

## Guidelines for A'Space OS

### Security

- ❌ **Never** hardcode VPS IP or SSH keys in code
- ✅ Store secrets in `.env` (excluded from Git)
- ✅ Use SSH key authentication (no passwords)
- ✅ Keep SSH sessions minimal (connect, execute, disconnect)

### Efficiency (Rick Audit)

- ❌ Don't SSH for every small check (use Coolify API instead)
- ✅ Batch multiple commands in one SSH session
- ✅ Use `docker logs` instead of SSH for debugging when possible

### Air Lock Filtering

**Risk Level:** HIGH (server access = destructive potential)

**Jerry's Decision:**
- `rm -rf /` → BLOCK (Superuser ACK required)
- `docker restart` → ALLOW (reversible)
- `apt-get install` → MEDIUM (Rick review for dependency vampires)

## Common Tasks

### Task: Check if Coolify is Running

```bash
ssh root@<VPS_IP> "docker ps | grep coolify"
```

**Expected output:**
```
coolify   Up 3 days   0.0.0.0:8000->8000/tcp
```

### Task: View n8n Workflow Errors

```bash
ssh root@<VPS_IP> "docker logs n8n 2>&1 | grep ERROR | tail -20"
```

### Task: Free Up Disk Space

```bash
ssh root@<VPS_IP> << 'EOF'
# Remove old Docker images
docker image prune -af

# Clear apt cache
apt-get clean
EOF
```

**When:** Disk usage > 85%.

## Troubleshooting

### Problem: SSH Connection Timeout

**Cause:** VPS may be rebooting or network issue.

**Solution:**
1. Check Hostinger control panel (server status)
2. Wait 5 minutes and retry
3. If persists → Contact Hostinger support

### Problem: Docker Container Won't Start

**Cause:** Resource exhaustion or config error.

**Solution:**
```bash
ssh root@<VPS_IP>
docker logs <container_name> --tail 50  # Check errors
docker inspect <container_name>         # Check config
systemctl restart docker               # Last resort
```

### Problem: Disk Full

**Cause:** Docker images, logs, or temp files accumulating.

**Solution:**
```bash
# Find largest directories
du -h /opt | sort -h | tail -10

# Clean Docker
docker system prune -af --volumes
```

## Success Metrics

- **Uptime:** VPS should be accessible 99.9% of time
- **Response Time:** SSH connection < 2 seconds
- **Resource Usage:** CPU < 80%, Memory < 90%, Disk < 85%

---

> **For A'Space OS:** "The VPS is the mycelium's root. Tend it, don't abuse it." — Rick
