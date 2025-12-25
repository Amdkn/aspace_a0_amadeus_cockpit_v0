# SUMMER-VERSE V1 DOCKERFILE - SOVEREIGN EDITION
# "Le chaos est une ressource, l'ordre est un outil, l'efficience est la seule religion." — Rick.

FROM python:3.11-slim-bookworm

# -----------------------------------------------------------------------------
# 1. NATIVE LAYER (SOBRIETY)
# Pure Node 20 is added for contract validation, keep it thin.
# -----------------------------------------------------------------------------
RUN apt-get update && apt-get install -y \
    curl \
    git \
    nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# -----------------------------------------------------------------------------
# 2. SOVEREIGN ASSETS
# Copying only the vital organs of the system.
# -----------------------------------------------------------------------------
COPY ./protocols ./protocols
COPY ./contracts/examples ./contracts/examples
COPY ./validate_contracts.js ./validate_contracts.js
COPY ./package.json ./package.json

# Run native validation before anything else (Kill switch)
RUN node validate_contracts.js

# -----------------------------------------------------------------------------
# 3. AGENTIC CORE
# Skills & Conductor (Modular & Decoupled)
# -----------------------------------------------------------------------------
COPY ./skills ./skills
COPY ./conductor ./conductor
COPY ./summer_verse ./summer_verse

# -----------------------------------------------------------------------------
# 4. EXECUTION
# -----------------------------------------------------------------------------
ENV AGENT_PROFILE="SUMMER_V1"
ENV PYTHONUNBUFFERED=1

# Autonomous heartbeat towards Jerry
CMD ["python", "-m", "conductor.main", "--mode=summer-autonomous"]
