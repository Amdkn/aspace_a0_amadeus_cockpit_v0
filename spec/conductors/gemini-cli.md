# Gemini CLI : Le Conductor

## Rôle dans A'Space OS

Le **Gemini CLI** (Conductor) est le cerveau orchestral du système. Il ne fait pas le travail lui-même, il **coordonne** les agents spécialisés pour atteindre un objectif complexe.

## Fonctionnement

### 1. Plan de Vol (Flight Plan)
Quand Amadeus donne un ordre complexe (ex: "Déployer Summer-v1 en production"), le Conductor :

1. **Décompose** l'objectif en sous-tâches
2. **Identifie** les agents nécessaires (Morty pour Ops, Jerry pour validation)
3. **Séquence** les actions (ordre logique + dépendances)
4. **Exécute** en surveillant chaque étape
5. **Rapporte** le résultat final

### 2. Exemple de Plan

```json
{
  "objective": "Deploy Summer-v1 to production",
  "steps": [
    {
      "id": "step-1",
      "agent": "rick",
      "action": "audit_efficiency",
      "input": {"project": "summer-v1"},
      "success_criteria": "efficiency_score > 0.75"
    },
    {
      "id": "step-2",
      "agent": "beth",
      "action": "validate_ikigai",
      "input": {"project": "summer-v1"},
      "depends_on": ["step-1"]
    },
    {
      "id": "step-3",
      "agent": "morty",
      "action": "deploy_to_coolify",
      "input": {"env": "production"},
      "depends_on": ["step-1", "step-2"]
    }
  ]
}
```

### 3. Communication Inter-Agents

Le Conductor utilise le format de **contrats** pour communiquer :
* **Intent** : "Je veux déployer Summer-v1"
* **Decision** : Beth valide ou veto
* **Order** : Morty reçoit l'ordre d'exécution
* **Pulse** : Jerry rapporte l'état post-déploiement

## Outils du Conductor

### MCP (Model Context Protocol)
Le Conductor peut invoquer des services externes via MCP :
* n8n workflows (webhooks)
* Coolify API (déploiements)
* Supabase (lecture/écriture DB)

### Validation Continue
Après chaque étape, le Conductor vérifie :
* ✅ L'output correspond au success_criteria
* ✅ Aucune erreur critique n'est apparue
* ✅ Les logs sont correctement écrits

### Rollback Intelligent
Si une étape échoue, le Conductor peut :
* **Retry** (avec backoff exponentiel)
* **Rollback** (annuler les étapes précédentes si réversibles)
* **Escalade** (alerter Amadeus si critique)

## Limites & Contraintes

* Le Conductor **ne peut pas** contourner l'Air Lock
* Le Conductor **ne peut pas** décider à la place de Beth ou Amadeus
* Le Conductor **doit** logguer chaque décision dans `/logs/conductors/`

---

> **"Je suis l'orchestre, pas le musicien. Je coordonne, je ne substitue pas."** — Gemini CLI
