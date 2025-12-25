# Anthropic Skills

## Vue d'Ensemble

Les **Anthropic Skills** sont des dossiers d'instructions, scripts et ressources que Claude charge dynamiquement pour améliorer ses performances sur des tâches spécialisées.

**Repository :** [anthropics/skills](https://github.com/anthropics/skills)  
**Standard :** [agentskills.io](https://agentskills.io)

## Qu'est-ce qu'un Skill ?

Un Skill enseigne à Claude comment accomplir des tâches spécifiques de manière répétable :
* Créer des documents selon des guidelines de marque
* Analyser des données selon des workflows organisationnels
* Automatiser des tâches personnelles

### Format d'un Skill
Chaque Skill est un dossier contenant un fichier `SKILL.md` :

```markdown
---
name: my-skill-name
description: Description claire de ce que fait ce skill et quand l'utiliser
---

# My Skill Name

[Instructions que Claude suivra quand ce skill est actif]

## Examples
- Exemple d'usage 1

## Guidelines
- Directive 1
```

## Catégories de Skills (Repo Officiel)

* **Creative & Design** : Art, musique, design
* **Development & Technical** : Tests web apps, génération de serveurs MCP
* **Enterprise & Communication** : Communications, branding
* **Document Skills** : DOCX, PDF, PPTX, XLSX (source-available)

## Intégration A'Space OS

### Agents Utilisateurs
* **Robin (A'0)** : Charge des Skills pour orchestrer des tâches complexes
* **Summer (A2 Business)** : Utilise Skills spécialisés par domaine
* **Morty (Ops)** : Utilise Skills pour automatisation

### Protocole d'Acquisition

#### 1. Exploration du Skill
Avant d'utiliser un Skill :
* Lire le `SKILL.md` complet
* Comprendre les examples et guidelines
* Vérifier les dépendances (scripts, ressources)

#### 2. Test Local
Tester le Skill dans un contexte de dry-run :

```json
{
  "skill_name": "document-analyzer",
  "agent_id": "robin-a0",
  "test_scenario": "Analyser pulse-2025-W28.json",
  "success": true,
  "rick_efficiency_score": 0.85
}
```

#### 3. Validation Rick
Rick audite :
* **Nécessité** : Ce skill est-il vraiment nécessaire ?
* **Efficience** : Le skill produit-il de la valeur ?
* **Maintenabilité** : Les instructions sont-elles claires ?

#### 4. Documentation Usage
Logger chaque usage dans `/logs/skills/[skill-name]-[date].json`

## Création de Skills Personnalisés

Pour A'Space OS, créer des Skills dans `/spec/skills-conductor/custom/` :

```markdown
---
name: business-pulse-analyzer
description: Analyse les fichiers Pulse et génère un rapport synthétique
---

# Business Pulse Analyzer

Ce skill analyse les fichiers JSON de Business Pulse et extrait :
- TMI actuel vs target
- TVR score
- Domaines en alerte (Orange/Red)

## Usage
Charger ce skill et demander : "Analyse le pulse de la semaine 28"

## Guidelines
- Toujours vérifier le format JSON avant analyse
- Reporter les anomalies à Jerry
- Formater la sortie en 10 lignes maximum
```

## Exemples de Skills Utiles pour A'Space OS

* **sunday-uplink-generator** : Génère l'Uplink de 10 lignes
* **intent-validator** : Valide les Intents contre l'Ikigai
* **efficiency-auditor** : Assiste Rick dans l'audit hebdomadaire

## Synergie avec Conductor (Gemini)

**Skills** (Anthropic) et **Conductor** (Gemini) sont deux méthodologies révolutionnaires qui se complètent parfaitement dans A'Space OS.

### Différences Fondamentales

| Aspect | Anthropic Skills | Gemini Conductor |
|--------|------------------|------------------|
| **Niveau** | Tâche spécifique | Cycle de développement complet |
| **Artefact** | `SKILL.md` (instructions) | `conductor/` (context, specs, plans) |
| **Usage** | Claude charge dynamiquement | Gemini CLI gère le workflow |
| **Scope** | Micro (une tâche) | Macro (feature complète) |

### Complémentarité

**Conductor pilote, Skills exécutent :**

1. **Conductor** définit le contexte projet (`/conductor:setup`)
2. **Conductor** crée un track avec spec + plan (`/conductor:newTrack`)
3. **Skills** sont utilisés pour des tâches spécifiques dans le plan
4. **Conductor** orchestre l'implémentation (`/conductor:implement`)

### Workflow Intégré A'Space OS

```
┌─────────────────────────────────────────────────┐
│ Conductor (Macro)                               │
│ ├─ /conductor:setup (Define project context)   │
│ ├─ /conductor:newTrack "Build Pulse Monitor"   │
│ │   ├─ spec.md (WHAT to build)                │
│ │   └─ plan.md (HOW to build)                 │
│ └─ /conductor:implement                        │
│     ├─ Task 1: Design component                │
│     │   └─ Use Skill: ui-component-generator   │ ← Skills (Micro)
│     ├─ Task 2: Connect to Supabase             │
│     │   └─ Use Skill: data-connector           │ ← Skills (Micro)
│     └─ Task 3: Write tests                     │
│         └─ Use Skill: test-generator           │ ← Skills (Micro)
└─────────────────────────────────────────────────┘
```

### Principe d'Organisation A'Space OS

* **`/spec/skills-conductor/anthropic/`** : Skills individuels (micro-tâches)
* **`/spec/skills-conductor/gemini/`** : Conductor (macro-gestion)
* **`/conductor/`** : Artefacts Conductor (product, tech-stack, tracks)

---

> **"Conductor pense. Skills exécutent. Ensemble, ils construisent."**

## Relation avec Computer Use

**Important :** Skills ≠ Computer Use

* **Skills** : Instructions dynamiques pour tâches spécifiques
* **Computer Use** : Manipulation d'interfaces utilisateur (navigateur, terminal)

Les deux sont complémentaires mais distincts.

---

> **"Un Skill bien conçu ne fait qu'une chose, mais la fait parfaitement."** — Rick
