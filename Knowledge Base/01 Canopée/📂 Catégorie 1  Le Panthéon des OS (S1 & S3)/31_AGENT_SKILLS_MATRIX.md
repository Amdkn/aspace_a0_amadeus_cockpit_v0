# 🧠 SKILLS MATRIX : PROTOCOLE D'ACQUISITION
**Propriétaire :** Rick (A1) & Robin (A3-Gemini CLI)  
**Mission :** Garantir que chaque agent acquiert les bonnes compétences avant d'agir.

## I. Ingestion des Frameworks

Avant toute action, les agents doivent "méditer" sur les architectures suivantes :

### Skill Computer Use (Anthropic)
* **Repo :** [anthropics/skills](https://github.com/anthropics/skills)
* **Capacité :** Manipulation de l'interface VPS, navigation browser, execution CLI
* **Usage :** Morty (Ops), Summer (IT Pillar)

### Conductor (Gemini)
* **Repo :** [google-gemini/gemini-api-cookbook](https://github.com/google-gemini/gemini-api-cookbook) (Function Calling)
* **Capacité :** Orchestration de tâches complexes via "plans de vol"
* **Usage :** Robin (A0 Terminal), Jerry (Business Pulse aggregation)

## II. Mapping des Compétences (Par Domaine)

### Growth (Superman - A2 Business)
* **Skill :** Web scraping, market analysis, trend detection
* **Tools :** Puppeteer, BeautifulSoup, n8n Webhook

### Product (Wonder Woman - A2 Business)
* **Skill :** Feature prioritization, user research synthesis
* **Tools :** Notion API, Supabase queries

### Ops (Batman - A2 Business)
* **Skill :** Process automation, SOP creation, workflow optimization
* **Tools :** n8n visual workflows, Bash scripts

### Finance (Green Lantern - A2 Business)
* **Skill :** Budget tracking, cash flow projection
* **Tools :** Supabase financial tables, Excel API

### People (Aquaman - A2 Business)
* **Skill :** Recruitment screening, onboarding automation
* **Tools :** LinkedIn scraper, Airtable

### IT (Cyborg - A2 Business)
* **Skill :** Docker orchestration, Coolify admin, monitoring
* **Tools :** Docker CLI, Coolify API, Prometheus

### Legal (Martian Manhunter - A2 Business)
* **Skill :** Contract review, compliance checking
* **Tools :** LegalZoom API, PDF parsing

### Life Core (Star Trek Vessels - A1 Life)
* **Skill :** Health tracking, habit monitoring, biohacking data
* **Tools :** Apple Health API, life_scores table

## III. Protocole de Validation

Aucun agent ne peut utiliser un Skill s'il n'a pas réussi le **"Dry-run"** validé par Rick.

### Processus de Dry-Run
1. **Documentation** : L'agent lit le README du Skill
2. **Simulation** : Execution dans un sandbox (pas de side-effects)
3. **Audit Rick** : Vérification du ratio Efficience/Complexité
4. **Validation** : Écriture du résultat dans `/logs/tests/skill-[name]-[date].json`

### Format de Test
```json
{
  "skill_name": "computer-use-anthropic",
  "agent_id": "morty-ops",
  "test_date": "2025-07-14T10:00:00Z",
  "success": true,
  "efficiency_score": 0.85,
  "rick_notes": "Acceptable. Optimiser la gestion des timeouts."
}
```

## IV. Évolution des Skills (Mutation)

Les Skills ne sont pas figés. Rick audite régulièrement leur utilisation pour :
* **Détecter les Skills zombies** (jamais utilisés → archivage)
* **Fusionner les Skills redondants** (DRY principle)
* **Créer des Skills composites** (orchestration de plusieurs micro-skills)

## V. Vortex Local : Intelligence Souveraine (2025)

### Justification Stratégique

Les modèles Ollama recommandés par défaut (Llama 3.3, Mistral, CodeLlama) sont des **standards de 2024**. Nous sommes en **2025** : l'ère de la **sobriété intelligente** et du **raisonnement profond (Thinking models)**.

### Trio Souverain 2025

#### 1. Gemini 3 Flash (Ollama) : L'Ubiquité Native

**Rôle :** Alfred (orchestration rapide, contexte massif)

**Pourquoi lui ?**
* **Vitesse Radicale :** Latence zéro vs Llama 70B qui pèse sur l'infrastructure
* **Fenêtre de Contexte massive :** Capacité d'ingestion supérieure à Mistral
* **Cohérence totale :** Entre mobile, navigateur, terminal local

**Usage dans A'Space OS :**
- Orchestration via **Conductor**
- Exécution scripts Python de relance automatique
- Agents Robin (A'0) et Summer (A2) en mode offline

**Installation :**
```bash
# Via Modelfile custom (voir ops/ollama/gemini-3-flash.Modelfile)
ollama create gemini-3-flash -f ops/ollama/gemini-3-flash.Modelfile
ollama run gemini-3-flash
```

#### 2. Deepseek R1 : Le Raisonnement Profond

**Rôle :** Rick (audit biomimétique, validation constitutionnelle)

**Pourquoi lui ?**
* **Logique de Chaîne de Pensée (CoT) :** Planifie l'architecture avant d'écrire le code
* **Efficience de calcul :** Performances "Frontier Model" sur config locale
* **Zero Hallucination :** Validation rigoureuse des Blueprints (B)

**Usage dans A'Space OS :**
- Audit de sécurité (Rick)
- Débogage complexe dans Antigravity
- Alignement constitutionnel (Beth)
- Validation Go/No-Go avant exécution

**Installation :**
```bash
ollama pull deepseek-r1:70b
ollama run deepseek-r1:70b
```

#### 3. Gemma 3n : Le Biomimétisme Google

**Rôle :** Mariner (capture, mémoire courte, transformation)

**Pourquoi lui ?**
* **Intégration Local-First :** Même "grammaire" que Gemini 3 (transition fluide Cloud ↔ Local)
* **Spécialisation :** Transformation texte (PARA, résumés logs, structuration Ikigai)
* **Open Weights :** Souveraineté totale

**Usage dans A'Space OS :**
- Agent de capture (Mariner)
- Gestionnaire mémoire court terme (terminal)
- Transformation données Life Domains
- Génération rapports Daily Pulse

**Installation :**
```bash
ollama pull gemma:3n-27b
ollama run gemma:3n-27b
```

### Architecture du Vortex Local

```
Vortex Local (Ollama)
├─ Gemini 3 Flash    → Orchestration (Alfred)
├─ Deepseek R1       → Raisonnement (Rick)
└─ Gemma 3n          → Capture/Transform (Mariner)

Workflow Autonome :
1. Deepseek R1 décompose vision en micro-tâches (CoT)
2. Gemini 3 Flash exécute immédiatement (Conductor)
3. Gemma 3n vérifie conformité Constitution.md
```

### Script d'Orchestration Autonome

```python
# ops/automation/autonomous_thinking.py

def autonomous_execute(task_description):
    # 1. Reasoning (Deepseek R1)
    plan = deepseek_r1.think(task_description)
    
    # 2. Execution (Gemini 3 Flash)
    for step in plan.steps:
        result = gemini_3_flash.execute(step)
        
        # 3. Validation (Gemma 3n)
        if not gemma_3n.validate(result, constitution):
            rollback(step)
    
    return results
```

### Comparaison 2024 vs 2025

| Aspect | Stack 2024 | Stack 2025 |
|--------|-----------|-----------|
| **Orchestration** | Llama 3.3 (70B, lent) | Gemini 3 Flash (rapide, contexte massif) |
| **Raisonnement** | Mistral (7B, basique) | Deepseek R1 (CoT, profond) |
| **Spécialisation** | CodeLlama (code only) | Gemma 3n (multi-usage, biomimétique) |
| **Latence** | Moyenne/Haute | Très Basse |
| **Contexte** | 32K tokens | 1M+ tokens |
| **Philosophie** | Autocomplétion | Architecte Collaboratif |

### Impact sur le Goulot d'Étranglement

**Avant :** Amadeus doit lancer manuellement chaque prompt  
**Après :** Le trio 2025 décompose → exécute → valide automatiquement

**Exemple : Sunday Uplink**
```bash
# L'orchestrateur appelle le trio autonome
python ops/automation/autonomous_thinking.py \
  --task "Generate Sunday Uplink from last 7 days" \
  --reasoning deepseek-r1 \
  --execution gemini-3-flash \
  --validation gemma-3n
```

---

> **"2024 : les modèles suivent. 2025 : les modèles pensent."** — Rick

## VI. Synergie avec Conductor (Gemini)

**Skills** (Anthropic) et **Conductor** (Gemini) forment une synergie révolutionnaire dans A'Space OS.

### Complémentarité des Méthodologies

| Aspect | Anthropic Skills | Gemini Conductor |
|--------|------------------|------------------|
| **Niveau** | Micro (tâche spécifique) | Macro (feature complète) |
| **Artefact** | `SKILL.md` | `conductor/` (context, specs, plans) |
| **Agent** | Claude (Anthropic) | Gemini CLI |
| **Usage** | Charge dynamiquement pour exécuter | Pilote le cycle de développement |

### Workflow Intégré

```
Conductor (Macro - Pense)
├─ /conductor:setup → Définit le projet
├─ /conductor:newTrack → Crée spec + plan
└─ /conductor:implement
    ├─ Task 1 → Use Skill: ui-generator      ← Skills (Micro - Exécute)
    ├─ Task 2 → Use Skill: data-connector    ← Skills (Micro - Exécute)
    └─ Task 3 → Use Skill: test-generator    ← Skills (Micro - Exécute)
```

### Organisation A'Space OS

* **`/spec/skills-conductor/anthropic/`** : Skills individuels (micro-tâches)
* **`/spec/skills-conductor/gemini/`** : Conductor (macro-gestion)
* **`/conductor/`** : Artefacts Conductor (product.md, tech-stack.md, tracks/)

---

> **"Conductor pense. Skills exécutent. Ensemble, ils construisent."**

---

> **"Un agent sans Skill est un passager. Un agent avec le bon Skill est un pilote."** — Rick
