# A'Space OS V2 - Implementation Guide (Post-Audit)
**Based on:** SITUATION_ROOM_A1_RICK.md  
**Target:** Bridge V0.1 → V2 (Phoenix Architect)  
**Timeline:** 1-2 weeks

---

## 🎯 Priority Matrix

| Task | Priority | Impact | Effort | Blocker V2? |
|------|----------|--------|--------|-------------|
| FG-COM Integration | HIGH | High | Medium | ✅ YES |
| Google Workspace MCP | HIGH | High | High | ✅ YES |
| External Budget Config | MEDIUM | Medium | Low | ❌ NO |
| Docker Optimization | LOW | Low | Low | ❌ NO |
| Path Renaming | LOW | Low | Medium | ❌ NO |

---

## 🔴 HIGH PRIORITY (Week 1)

### Task 1: Connect FinancialGuard → CommunicationOrgan
**ID:** FG-COM-001  
**Blocker:** YES - Required for Air Lock workflow  
**Effort:** 3-4 hours

#### Implementation Steps

1. **Modify financial_guard.py** (line ~197)
```python
# BEFORE (TODO comment)
# TODO: Integrate with Google Chat MCP for real approval

# AFTER
def request_approval(self, operation: str, cost: float, risk: str) -> bool:
    """Request A0 approval via Air Lock (Google Chat)"""
    from organs.communication import get_communication_organ, DecisionCard, ChatSpace, DecisionPriority
    
    comm = get_communication_organ()
    
    card = DecisionCard(
        card_id=f"FG-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
        title="🔴 Air Lock: Budget Approval Required",
        subtitle=f"Operation: {operation}",
        agent="Jerry (Financial Guard)",
        project="A'Space OS",
        action=operation,
        cost=cost,
        risk_level=risk,
        options=[
            {"text": "✅ APPROVE", "action": f"approve_{card_id}"},
            {"text": "❌ DENY", "action": f"deny_{card_id}"}
        ],
        space=ChatSpace.AIR_LOCK,
        priority=DecisionPriority.CRITICAL
    )
    
    try:
        response = comm.send_decision_card(card)
        logger.info(f"Air Lock decision card sent: {response}")
        
        # Wait for approval (sync or async based on implementation)
        # For now, log and return False (deny by default until callback implemented)
        return False
    except Exception as e:
        logger.error(f"Failed to send Air Lock card: {e}")
        # Fallback: save to backlog
        comm._save_to_backlog(card)
        return False
```

2. **Update can_proceed() method**
```python
def can_proceed(self, operation: str, estimated_tokens: int = 0, estimated_cost: float = 0.0) -> bool:
    """Check if operation can proceed within budget"""
    # Existing checks...
    
    # If critical threshold reached, trigger Air Lock
    if current_usage >= self.config.critical_threshold:
        logger.warning(f"Critical threshold reached - requesting Air Lock approval")
        return self.request_approval(
            operation=operation,
            cost=estimated_cost,
            risk="HIGH" if estimated_cost > 1.0 else "MEDIUM"
        )
    
    return True
```

3. **Test the integration**
```bash
# Create test script: test_airlock.py
python test_airlock.py
```

#### Acceptance Criteria
- [ ] FinancialGuard can call CommunicationOrgan
- [ ] DecisionCard created with budget info
- [ ] Card falls back to backlog if API fails
- [ ] Logs show successful card creation

---

### Task 2: Activate Google Workspace MCP
**ID:** GCP-MCP-001  
**Blocker:** YES - Required for human-in-the-loop  
**Effort:** 6-8 hours

#### Prerequisites

1. **Google Cloud Project Setup** (2 hours)
   - Create project at console.cloud.google.com
   - Enable APIs:
     - Google Chat API
     - Google Tasks API (optional)
   - Create Service Account
   - Download JSON credentials

2. **Create Google Chat Spaces** (30 min)
   - 🔴 Air Lock (Private, A0 only)
   - 🟡 Situation Room (Private, A0 + A1 agents)
   - 🟢 Daily Pulse (Private or Team)
   - Copy Space IDs (from URL: `spaces/AAAAA...`)

3. **Configure MCP Server** (2 hours)
   
   Create `.env` file:
   ```bash
   # Google Workspace
   GOOGLE_CREDENTIALS_PATH=/path/to/service-account.json
   GOOGLE_CHAT_AIR_LOCK_SPACE=spaces/AAAAA...
   GOOGLE_CHAT_SITUATION_ROOM_SPACE=spaces/BBBBB...
   GOOGLE_CHAT_DAILY_PULSE_SPACE=spaces/CCCCC...
   ```

   Update `.gemini/config.json`:
   ```json
   {
     "mcpServers": {
       "google-chat": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-google-chat"],
         "env": {
           "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account.json"
         }
       }
     }
   }
   ```

4. **Update communication.py** (2 hours)
```python
def send_decision_card(self, card: DecisionCard) -> Dict:
    """Send decision card to Google Chat Space"""
    space_id = self._get_space_id(card.space)
    
    if not space_id:
        logger.warning(f"Space ID not configured for {card.space}, using backlog")
        return self._save_to_backlog(card)
    
    try:
        # Use Google Chat API via MCP
        import requests
        
        headers = {
            "Authorization": f"Bearer {self._get_oauth_token()}",
            "Content-Type": "application/json"
        }
        
        url = f"https://chat.googleapis.com/v1/{space_id}/messages"
        payload = card.to_google_chat_json()
        
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        
        logger.info(f"Decision card sent successfully to {card.space}")
        return response.json()
        
    except Exception as e:
        logger.error(f"Failed to send card: {e}")
        return self._save_to_backlog(card)
```

5. **Setup n8n Webhooks** (2 hours)
   - Create n8n workflow: "Google Chat Callback Handler"
   - Trigger: Webhook (POST)
   - Steps:
     1. Parse button click payload
     2. Extract action (approve/deny)
     3. Update decision in database
     4. Notify FinancialGuard
   - Test with curl

#### Acceptance Criteria
- [ ] Google Cloud project configured
- [ ] Chat spaces created and IDs captured
- [ ] MCP server connects successfully
- [ ] Test card appears in Air Lock space
- [ ] Button clicks trigger n8n webhook
- [ ] Approval/denial updates FinancialGuard

---

## 🟡 MEDIUM PRIORITY (Week 2)

### Task 3: Externalize Budget Configuration
**ID:** CFG-001  
**Blocker:** NO - Quality of life improvement  
**Effort:** 1-2 hours

#### Implementation

1. **Update financial_guard.py**
```python
class FinancialGuard:
    def __init__(self, config: Optional[BudgetConfig] = None, config_file: Optional[str] = None):
        # Load from file if provided
        if config_file:
            config = self._load_config_from_file(config_file)
        
        self.config = config or BudgetConfig()
        # ... rest of init
    
    def _load_config_from_file(self, file_path: str) -> BudgetConfig:
        """Load budget config from JSON file"""
        import json
        from pathlib import Path
        
        config_path = Path(file_path)
        if not config_path.exists():
            logger.warning(f"Config file not found: {file_path}, using defaults")
            return BudgetConfig()
        
        with open(config_path, 'r') as f:
            data = json.load(f)
            
        # Get active profile
        profile_name = data.get('active_profile', 'development')
        profile = data['profiles'][profile_name]
        
        return BudgetConfig(
            daily_token_limit=profile['daily_token_limit'],
            daily_api_cost_limit=profile['daily_api_cost_limit'],
            monthly_budget=profile['monthly_budget'],
            warning_threshold=profile['warning_threshold'],
            critical_threshold=profile['critical_threshold'],
            auto_cutoff=profile['auto_cutoff']
        )
```

2. **Update instantiation in orchestrator_v2.py**
```python
# BEFORE
self.financial_guard = get_financial_guard()

# AFTER
self.financial_guard = get_financial_guard(config_file='config/financial-guard.json')
```

3. **Environment-specific profiles**
```bash
# Use different profiles based on environment
export ASPACE_ENV=production

# orchestrator reads ASPACE_ENV and selects profile
```

#### Acceptance Criteria
- [ ] Config loaded from `config/financial-guard.json`
- [ ] Multiple profiles work (dev/staging/prod)
- [ ] Fallback to defaults if file missing
- [ ] Changes in JSON reflected without code edits

---

## 🟢 LOW PRIORITY (Week 2-3)

### Task 4: Docker Optimization
**ID:** DOCKER-001  
**Effort:** 2-3 hours

#### Multi-stage Dockerfile

Create `Dockerfile` in root:
```dockerfile
# Stage 1: Build (if needed)
FROM python:3.11-slim AS builder
WORKDIR /app
COPY ops/automation/requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim
WORKDIR /app

# Copy only necessary files
COPY --from=builder /root/.local /root/.local
COPY ops/ ./ops/
COPY protocols/ ./protocols/
COPY contracts/examples/ ./contracts/examples/
COPY identity-core/ ./identity-core/
COPY validate_contracts.js ./
COPY package.json ./
COPY config/ ./config/

# Create logs directory
RUN mkdir -p logs

# Set PATH for pip-installed binaries
ENV PATH=/root/.local/bin:$PATH

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "from ops.automation.organs.financial_guard import get_financial_guard; get_financial_guard().get_status()" || exit 1

# Run orchestrator
CMD ["python", "ops/automation/orchestrator_v2.py", "start"]
```

#### Acceptance Criteria
- [ ] Image size reduced by >30%
- [ ] Build time improved
- [ ] Health check endpoint works
- [ ] Test on local Docker

---

### Task 5: Path Sanitization (Optional)
**ID:** PATH-001  
**Effort:** 1 hour

Only if Docker build issues occur with spaces/emojis:

```bash
# Rename files
mv "Knowledge Base" knowledge-base
mv "📄 99_A0_COMMAND_TERMINAL.md" 99-a0-command-terminal.md

# Update references in code
grep -r "Knowledge Base" --include="*.py" --include="*.md" -l | xargs sed -i 's/Knowledge Base/knowledge-base/g'
```

#### Acceptance Criteria
- [ ] No spaces in directory names
- [ ] No emojis in file names
- [ ] Git history preserved
- [ ] All references updated

---

## 🧪 Testing Strategy

### Unit Tests (Create if needed)
```bash
# Create tests/
mkdir -p tests

# Test financial guard
tests/test_financial_guard.py
tests/test_communication.py
tests/test_thinking.py
```

### Integration Tests
```bash
# End-to-end Air Lock flow
tests/integration/test_airlock_workflow.py

# Google Chat MCP connection
tests/integration/test_google_chat.py
```

### Manual Testing Checklist
- [ ] Budget warning triggers at 80%
- [ ] Budget critical triggers at 95%
- [ ] Air Lock card sent to Google Chat
- [ ] Button click returns approval/denial
- [ ] FinancialGuard updates state
- [ ] Local fallback works if API down
- [ ] Backlog restored on system restart

---

## 📊 Success Metrics

### Pre-Implementation (V0.1)
- Antifragility Score: 8.1/10
- Interoperability: 6/10
- Manual approval: 100%

### Post-Implementation (V2)
- Antifragility Score: 9.0/10 (target)
- Interoperability: 9/10 (target)
- Manual approval: <5% (auto-approve below threshold)
- Response time: <30s (Air Lock → Decision)

---

## 🚨 Rollback Plan

If V2 integration fails:

1. **Revert to V0.1**
```bash
git revert <commit-hash>
git push
```

2. **Disable MCP** (keep local backlog)
```python
# communication.py
USE_MCP = False  # Force backlog mode
```

3. **Use local Ollama** (zero cost)
```python
# financial_guard.py
auto_fallback_to_local = True
```

---

## 📞 Support & Documentation

### Resources
- Google Chat API: https://developers.google.com/chat
- MCP Servers: https://github.com/modelcontextprotocol
- n8n Webhooks: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/

### Contact
- **Technical Issues:** Rick (A1 - Efficiency Auditor)
- **Strategic Decisions:** Beth (A1 - Ikigai Guardian)
- **Final Approval:** Amadeus (A0 - Architect)

---

> **"Rick approuve ce plan. Concentration sur FG-COM-001 et GCP-MCP-001 en priorité."**
