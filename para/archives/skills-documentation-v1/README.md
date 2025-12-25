# Archives : Skills Documentation V1

**Date d'archivage :** 2025-12-23  
**Raison :** Restructuration de `/spec/skills/` pour Skills universels

## Contexte

Ces fichiers représentent la première version de la documentation Skills avant la restructuration vers le format universel (SKILL.md standard).

### Évolution de l'Architecture

**V1 (Archivé):**
```
/spec/skills/
├── anthropic/README.md  → Documentation framework Anthropic Skills
└── gemini/README.md     → Documentation extension Gemini Conductor
```

**V2 (Actuel):**
```
/spec/skills/               # Skills universels (format SKILL.md)
├── conductor.md           # Workflow Conductor
├── mcp/                   # MCPs (Hostinger, Coolify, n8n, etc.)
└── README.md              # Index

/spec/skills-conductor/     # Documentation technique
├── anthropic/README.md    # Framework Anthropic (mis à jour)
└── gemini/README.md       # Extension Conductor (mis à jour + audit Rick)
```

## Fichiers Archivés

- **anthropic-README-v1.md** : Première version de la doc Anthropic Skills
- **gemini-README-v1.md** : Première version de la doc Gemini Conductor

## Différences Clés V1 → V2

### Anthropic Skills
- **V1** : Description basique du framework
- **V2** : Compréhension correcte (dossiers d'instructions SKILL.md)
- **V2** : Ajout section synergie avec Conductor

### Gemini Conductor
- **V1** : Description workflow basique
- **V2** : Intégration audit Rick (score 9.6/10)
- **V2** : Section "Context-Driven Development" avec 4 piliers
- **V2** : Exemples concrets A'Space OS

## Prochaine Étape

Les anciens dossiers `/spec/skills/anthropic/` et `/spec/skills/gemini/` peuvent maintenant être supprimés manuellement si souhaité.

---

> **"Le mycélium n'oublie jamais. Il archive."** — Rick
