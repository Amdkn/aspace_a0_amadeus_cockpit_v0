# Gemini Conductor Extension

## Vue d'Ensemble

**Conductor** est une extension Gemini CLI qui permet le développement piloté par le contexte (Context-Driven Development). Il transforme Gemini CLI en un chef de projet proactif qui suit un protocole strict pour spécifier, planifier et implémenter des fonctionnalités logicielles et des corrections de bugs.

**Repository :** [gemini-cli-extensions/conductor](https://github.com/gemini-cli-extensions/conductor)

**Philosophie :** *"Measure twice, code once."*

## Qu'est-ce que Conductor ?

Plutôt que simplement écrire du code, Conductor garantit un cycle de vie cohérent et de haute qualité pour chaque tâche :

**Context → Spec & Plan → Implement**

En traitant le contexte comme un artefact géré aux côtés de votre code, vous transformez votre repository en une **source unique de vérité** qui pilote chaque interaction agent avec une conscience profonde et persistante du projet.

## Fonctionnalités Principales

* **Plan before you build** : Créer des specs et plans qui guident l'agent
* **Maintain context** : L'IA suit les style guides, choix tech, objectifs produit
* **Iterate safely** : Réviser les plans avant que le code soit écrit
* **Work as a team** : Contexte projet partagé pour toute l'équipe
* **Smart revert** : Commande git-aware qui comprend les unités logiques de travail

## Installation

```bash
gemini extensions install https://github.com/gemini-cli-extensions/conductor --auto-update
```

## Workflow Conductor

### 1. Setup Projet (Une fois)
`/conductor:setup`

Définir les composants fondamentaux du projet :
* **Product** : Contexte projet (utilisateurs, objectifs, features)
* **Product Guidelines** : Standards (style prose, branding, identité visuelle)
* **Tech Stack** : Préférences techniques (langage, DB, frameworks)
* **Workflow** : Préférences équipe (TDD, stratégie commit)

**Artefacts générés :**
```
conductor/product.md
conductor/product-guidelines.md
conductor/tech-stack.md
conductor/workflow.md
conductor/code_styleguides/
conductor/tracks.md
```

### 2. Démarrer un Track (Feature/Bug)
`/conductor:newTrack "Description de la feature"`

Initialise un **track** (unité de travail de haut niveau) et génère :
* **Spec** : Exigences détaillées (Quoi et pourquoi ?)
* **Plan** : To-do actionnable (phases, tasks, sub-tasks)

**Artefacts générés :**
```
conductor/tracks/<track_id>/spec.md
conductor/tracks/<track_id>/plan.md
conductor/tracks/<track_id>/metadata.json
```

### 3. Implémenter le Track
`/conductor:implement`

L'agent parcourt le `plan.md`, cochant les tâches au fur et à mesure :
* Sélectionne la prochaine tâche pending
* Suit le workflow défini (ex: TDD → Write Test → Fail → Implement → Pass)
* Met à jour le statut dans le plan
* Vérifie la progression (étape manuelle de vérification à la fin de chaque phase)

**Artefacts mis à jour :**
```
conductor/tracks.md (Status)
conductor/tracks/<track_id>/plan.md (Status)
Project context files (Sync on completion)
```

## Commandes Principales

| Commande | Description | Artefacts |
|----------|-------------|-----------|
| `/conductor:setup` | Initialisation projet Conductor | `product.md`, `tech-stack.md`, `workflow.md` |
| `/conductor:newTrack` | Démarre un nouveau track | `spec.md`, `plan.md` |
| `/conductor:implement` | Exécute les tâches du plan | Met à jour `plan.md` |
| `/conductor:status` | Affiche la progression | Lit `tracks.md` |
| `/conductor:revert` | Annule un track/phase/task | Revert git history |

## Synergie avec Skills (Anthropic)

**Conductor** (Gemini) et **Skills** (Anthropic) sont deux méthodologies révolutionnaires qui se complètent parfaitement dans A'Space OS.

### Différences Fondamentales

| Aspect | Gemini Conductor | Anthropic Skills |
|--------|------------------|------------------|
| **Niveau** | Cycle de développement complet | Tâche spécifique |
| **Artefact** | `conductor/` (context, specs, plans) | `SKILL.md` (instructions) |
| **Usage** | Gemini CLI gère le workflow | Claude charge dynamiquement |
| **Scope** | Macro (feature complète) | Micro (une tâche) |

### Complémentarité

**Conductor pilote, Skills exécutent :**

1. **Conductor** définit le contexte projet (`/conductor:setup`)
2. **Conductor** crée un track avec spec + plan (`/conductor:newTrack`)
3. **Skills** sont utilisés pour des tâches spécifiques dans le plan
4. **Conductor** orchestre l'implémentation (`/conductor:implement`)

### Exemple Concret A'Space OS

**Track:** Automatiser le Sunday Uplink

```bash
# Conductor définit le track
/conductor:newTrack "Automatiser la génération du Sunday Uplink"
```

Conductor génère le plan :
```markdown
## Phase 1: Analyze Requirements
- [ ] Review Sunday Uplink format (10 lines max)
- [ ] Identify data sources (Pulse files, Life scores)

## Phase 2: Create Skill
- [ ] Use Skill: skill-generator
- [ ] Test skill-sunday-uplink-generator
- [ ] Validate with Rick (efficiency)

## Phase 3: Integration
- [ ] Add to workflows
- [ ] Test end-to-end
```

Lors de l'implémentation, Conductor utilise le Skill `sunday-uplink-generator` créé spécifiquement pour cette tâche.

---

> **"Conductor pense. Skills exécutent. Ensemble, ils construisent."**

## Intégration A'Space OS

### Usage par Robin (A'0)
Robin peut utiliser Conductor pour :
* Gérer les tracks de développement de l'interface A'Space OS
* Maintenir le contexte du projet (Product, Tech Stack, Workflow)
* Suivre les plans d'implémentation des features

### Artefacts A'Space OS + Conductor
```
aspaceos-a0-amadeus-cockpit/
├── conductor/
│   ├── product.md (Vision A'Space OS)
│   ├── tech-stack.md (React, Vite, Supabase, MCP)
│   ├── workflow.md (Zero Dependency, Validation Continue)
│   └── tracks/
│       └── track-001-pulse-monitor/
│           ├── spec.md
│           └── plan.md
├── spec/skills-conductor/
│   ├── anthropic/ (Skills individuels)
│   └── gemini/ (Conductor documentation)
```

## Context-Driven Development : La Révolution

Contrairement aux chats IA classiques qui perdent le fil après 20 messages, **Conductor transforme Gemini en un Ingénieur Senior** avec mémoire à long terme.

### Les 4 Piliers

#### 1. Interview Initial (`/conductor:setup`)
Au lieu de "vomir du code", l'agent procède à une interview structurée pour comprendre :
- Le **Product Goal** (Vision, utilisateurs)
- La **Tech Stack** (Langages, frameworks, DB)
- Le **Workflow** (TDD, commit strategy, validation)

**Résultat :** Fichier `product.md` qui devient la **Source Unique de Vérité** du projet.

#### 2. Système de Tracks
Chaque feature = 1 Track avec :
- **`spec.md`** : WHAT to build & WHY
- **`plan.md`** : HOW to build (phases, tasks, sub-tasks)
- **Go/No-Go Checkpoint** : L'humain approuve avant exécution

**Avantage :** Pas d'actions irréversibles sans validation.

#### 3. Mémoire Partagée dans le Repo
Les fichiers `.md` vivent dans Git. Si tu changes de machine ou d'instance IA, tout le contexte est restauré instantanément.

**Impact A'Space OS :**
- Robin crashe → nouvelle instance lit `conductor/product.md`
- Amadeus change de machine → toute l'histoire conservée
- Summer rejoint le projet → hérite du contexte complet

#### 4. Contrôle Total
- `/conductor:status` : État d'avancement temps réel
- `/conductor:revert` : Annulation chirurgicale (track, phase, ou task)

**Sécurité :** Git history intact, seule la logique métier est annulée.

---

### Audit Rick : Score 9.6/10

Voir l'audit complet : [rick-audit-conductor.md](file:///c:/Users/amado/Documents/A%27Space%20OS/aspaceos-a0-amadeus-cockpit/spec/conductors/rick-audit-conductor.md)

**Métriques :**
- Nécessité : 10/10
- Efficience : 9/10
- Maintenabilité : 10/10
- Reversibilité : 10/10
- Biomimétisme : 9/10

**Source :** [Gemini Conductor Video](http://www.youtube.com/watch?v=ZDKmdhVtIoE)

---

> **"Conductor ne code pas. Il pilote. Et dans A'Space OS, seul Robin pilote."** — Rick

---

> **"Control your code. Context is not a prompt, it's an artifact."** — Conductor Philosophy
