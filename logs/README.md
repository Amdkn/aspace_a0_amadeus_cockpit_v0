# Logs Directory Structure

This directory contains the file-based event system for A'Space OS V2 Phoenix Architect.

## Structure

- `intents/` - Intent files (INT-YYYYMMDD-NNN.json) - The source events
- `decisions/` - Type 4 decision files (DEC-YYYYMMDD-NNN.json) - High-stakes decisions
- `assessments/` - Beth assessment files (beth_assessment_*.md) - Life Core evaluations
- `orders/` - Order files (ORD-YYYYMMDD-NNN.json) - Execution directives

## File-Based Events Philosophy

Following the Solarpunk approach: **the file is the event**, not a platform.

- Cron detects new intent files
- Conductor processes and generates orders
- All tracking is file-based, local-first
- No platform dependencies

## Example Intent

See `intents/INT-20251226-001.json` for the first initialization intent that injects Ikigai temporal filtering into Beth.
