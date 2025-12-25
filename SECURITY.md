# Security Policy - A'Space OS

## Data Sovereignty First
A'Space OS is designed with **Privacy by Architecture**. 

### 1. Secret Management
- **NEVER** commit API keys or secrets to this repository.
- Use environment variables or a local `.env` file (which is ignored by Git).
- For production deployments, use the Secret Manager of your infrastructure (VPS/Coolify).

### 2. Local Vortex (Ollama)
- Sensitive data processing (Ikigai, PARA structure) should be routed to the **Local Vortex** (Ollama) rather than cloud APIs whenever possible.
- The `ThinkingOrgan` is configured to prioritize local models for architectural auditing.

### 3. Reporting Vulnerabilities
If you discover a security vulnerability, please open an issue or contact the maintainer directly.

---
"Sovereignty is not just a feature, it's the foundation."
