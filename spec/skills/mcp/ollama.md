---
name: mcp-ollama-local-ai
description: Run local LLMs via Ollama - sovereign intelligence without cloud dependency for A'Space OS offline capabilities
---

# MCP Skill: Ollama (Local AI)

This skill teaches any AI agent how to use Ollama for running local LLMs (Llama, Mistral, Gemma) on A'Space OS infrastructure.

## When to Use This Skill

Load this skill when you need to:
- Run LLM inference without internet (sovereign intelligence)
- Process sensitive data locally (privacy)
- Use specialized models (coding, reasoning, vision)
- Reduce cloud API costs
- Ensure availability during internet outages

## Ollama Overview

**What it is:** CLI tool for running LLMs locally (like Docker for AI models).

**Hosted on:** Hostinger VPS or local machine

**Access:** `http://localhost:11434` (or VPS IP:11434)

**Models Available:**
- **Llama 3.3** (70B) - General reasoning
- **Mistral** (7B) - Fast, efficient
- **Gemma 2** (9B, 27B) - Google's open model
- **CodeLlama** (34B) - Code generation
- **DeepSeek Coder** (33B) - Advanced coding

## Prerequisites

- Ollama installed (`curl -fsSL https://ollama.com/install.sh | sh`)
- At least 8GB RAM (16GB+ recommended for larger models)
- GPU optional (faster inference)

## Commands Reference

### 1. List Available Models

```bash
ollama list
```

**Example output:**
```
NAME                    ID              SIZE    MODIFIED
llama3.3:latest         abc123          40GB    2 days ago
mistral:7b             def456          4.1GB   1 week ago
```

### 2. Pull a Model

```bash
ollama pull <model-name>
```

**Example:**
```bash
# Pull Mistral 7B (fast, efficient)
ollama pull mistral:7b

# Pull Llama 3.3 70B (powerful reasoning)
ollama pull llama3.3:70b

# Pull CodeLlama (specialized for coding)
ollama pull codellama:34b
```

### 3. Run Interactive Chat

```bash
ollama run <model-name>
```

**Example:**
```bash
ollama run mistral:7b
>>> Explain biomimetic efficiency in one sentence
Biomimetic efficiency is designing systems that mimic nature's resource-optimized patterns.
```

### 4. API Inference (Programmatic)

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "mistral:7b",
  "prompt": "What is the capital of France?",
  "stream": false
}'
```

**Response:**
```json
{
  "model": "mistral:7b",
  "response": "The capital of France is Paris.",
  "done": true
}
```

### 5. Load Model (Keep in Memory)

```bash
ollama pull <model-name>
ollama run <model-name> --keepalive 24h
```

**When:** Pre-load for faster inference (model stays in RAM).

### 6. Delete Model

```bash
ollama rm <model-name>
```

**When:** Free up disk space.

## Integration with A'Space OS

### Use Case 1: Offline Sunday Uplink Generation

**Scenario:** Internet down, but Sunday Uplink still needs to be generated.

**Workflow:**
1. Orchestrator triggers `sunday-uplink` task
2. Detects internet unavailable
3. Falls back to Ollama (local Llama 3.3)

```python
# In orchestrator.py
def generate_uplink():
    if internet_available():
        use_gemini_cli()
    else:
        use_ollama("llama3.3:70b")
```

**API call:**
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.3:70b",
  "prompt": "Analyze these business pulse entries and generate a 10-line summary: [data]",
  "stream": false
}'
```

### Use Case 2: Data Privacy (Beth's Ikigai Data)

**Scenario:** Processing sensitive Life Domains scores without sending to cloud.

**Workflow:**
```bash
# Query Supabase locally
supabase_data=$(curl -H "apikey: $SUPABASE_ANON_KEY" \
  "http://localhost:54321/rest/v1/life_scores?select=*")

# Process with Ollama (stays on device)
ollama run mistral:7b <<< "Analyze this life data and suggest improvements: $supabase_data"
```

### Use Case 3: Rick's Code Audits

**Scenario:** Rick needs to audit code for efficiency without cloud dependency.

**Workflow:**
```bash
# Use CodeLlama for local code review
cat src/components/PulseMonitor.tsx | ollama run codellama:34b \
  "Review this React component for inefficiencies. Score efficiency 0-1."
```

### Use Case 4: Mobile Intelligence (Laptop Offline)

**Scenario:** Amadeus traveling without internet, needs Summer agent locally.

**Setup:**
```bash
# On laptop, install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull lightweight model
ollama pull mistral:7b

# Run Summer locally
python ops/automation/orchestrator.py run daily-pulse --agent ollama
```

## MCP Server Configuration

Add Ollama to MCP configs:

### .gemini/config.json
```json
{
  "mcpServers": {
    "ollama": {
      "command": "node",
      "args": ["mcp-servers/ollama/index.js"],
      "env": {
        "OLLAMA_URL": "http://localhost:11434"
      }
    }
  }
}
```

### .claude/config.json (same)
### .agent/config.json (same)

## Guidelines for A'Space OS

### Security

- ✅ **All processing local** (no data leaves device)
- ✅ Runs on VPS or laptop (sovereign infrastructure)
- ❌ Don't expose Ollama API to internet without auth

### Efficiency (Rick Audit)

**Model Selection:**
| Task | Model | Size | Speed | Quality |
|------|-------|------|-------|---------|
| Quick answers | Mistral 7B | 4GB | Very Fast | Good |
| Deep reasoning | Llama 3.3 70B | 40GB | Slow | Excellent |
| Code generation | CodeLlama 34B | 20GB | Medium | Very Good |
| Data analysis | Gemma 2 27B | 16GB | Fast | Very Good |

**Rick's Rule:** Use smallest model that meets quality threshold (efficiency).

### Air Lock Filtering

**Risk Level:** LOW (local processing, no external calls)

**Jerry's Decision:**
- Run Ollama → ALLOW (local only)
- Pull new model → MEDIUM (disk space check)
- Expose API publicly → HIGH (Amadeus ACK required)

## Common Tasks

### Task: Install Ollama on VPS

```bash
# SSH to VPS
ssh root@<VPS_IP>

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Verify
ollama --version

# Pull default model
ollama pull mistral:7b

# Test
ollama run mistral:7b "Hello, test message"
```

### Task: Generate Summary with Ollama

```bash
# Prepare data
data=$(cat logs/business-pulse/2025-W28.json)

# Generate summary
ollama run llama3.3:70b <<EOF
Analyze this business pulse data and create a 10-line summary:

$data

Format as markdown with bullet points.
EOF
```

### Task: Compare Cloud vs Local

```bash
# Benchmark response time
time curl -X POST https://api.openai.com/v1/completions ...  # Cloud
time curl -X POST http://localhost:11434/api/generate ...    # Local

# Compare costs
# Cloud: $0.01 per 1K tokens
# Local: $0 (electricity only)
```

## Model Recommendations for A'Space OS

### Primary Models (2025 Stack)

1. **Gemini 3 Flash** (orchestration) - Fast, massive context, 8GB
   - Conductor workflow execution
   - Autonomous task orchestration
   - Real-time agent responses

2. **Deepseek R1 70B** (reasoning) - Deep CoT, powerful, 40GB
   - Chain of Thought decomposition
   - Strategic decisions
   - Blueprint validation (Rick audits)

3. **Gemma 3n 27B** (transformation) - Biomimetic, balanced, 16GB
   - Data capture and structuring
   - PARA/Ikigai transformations
   - Daily Pulse generation

**Philosophy:** "2024: models follow. 2025: models think."

### Model Comparison

| Model | Size | Speed | Use Case | Agent |
|-------|------|-------|----------|-------|
| **Gemini 3 Flash** | 8GB | Very Fast | Orchestration | Robin (A'0) |
| **Deepseek R1** | 40GB | Slow (CoT) | Reasoning | Rick (A1) |
| **Gemma 3n** | 16GB | Fast | Transform | Mariner |

### Installation

```bash
# 1. Gemini 3 Flash (via Modelfile)
ollama create gemini-3-flash -f ops/ollama/gemini-3-flash.Modelfile
ollama run gemini-3-flash

# 2. Deepseek R1
ollama pull deepseek-r1:70b
ollama run deepseek-r1:70b

# 3. Gemma 3n
ollama pull gemma:3n-27b
ollama run gemma:3n-27b
```

### Legacy Models (2024 - Deprecated)

- ~~Llama 3.3 70B~~ → Replaced by Gemini 3 Flash (faster, bigger context)
- ~~Mistral 7B~~ → Replaced by Deepseek R1 (deeper reasoning)
- ~~CodeLlama 34B~~ → Replaced by Gemma 3n (multi-usage)

## Troubleshooting

### Problem: Model Won't Load (OOM)

**Cause:** Not enough RAM.

**Solution:**
```bash
# Check available memory
free -h

# Use smaller model
ollama pull mistral:7b  # Instead of llama3.3:70b

# Or use quantized version (lower quality, less RAM)
ollama pull llama3.3:70b-q4  # 4-bit quantization
```

### Problem: Slow Inference

**Cause:** CPU inference (no GPU).

**Solution:**
```bash
# Check if GPU available
nvidia-smi

# If no GPU, use smaller/faster model
ollama pull mistral:7b  # Faster on CPU
```

### Problem: Disk Full

**Cause:** Too many large models.

**Solution:**
```bash
# List models and sizes
ollama list

# Remove unused models
ollama rm llama3.3:70b

# Keep only essential models (Mistral + CodeLlama)
```

## Success Metrics

- **Sovereignty:** 80% of tasks run locally (no cloud dependency)
- **Uptime:** Ollama available 99%+ (offline resilience)
- **Cost Savings:** $0 cloud API fees for local tasks
- **Privacy:** 100% of sensitive data processed locally

---

> **For A'Space OS:** "Ollama is the mycélium's brain stem. Local, sovereign, unstoppable." — Rick
