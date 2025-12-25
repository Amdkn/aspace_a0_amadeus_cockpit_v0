# Python Dependencies

## Runtime Requirements
- **Python**: >= 3.11
- **Standard Library Only**: No external dependencies

## Development/Optional
- `schedule`: For orchestrator task scheduling (install via `pip install schedule`)
- `requests`: For HTTP communication with n8n/APIs (install via `pip install requests`)

## Installation

For core functionality:
```bash
# No installation needed - uses Python stdlib
python --version  # Verify Python 3.11+
```

For orchestrator features:
```bash
pip install schedule requests
```

## Virtual Environment (Recommended)

```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
pip install schedule requests
```

---
"Sovereignty through simplicity."
