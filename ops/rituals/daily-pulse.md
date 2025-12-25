# RITUEL : DAILY PULSE

## Objectif
Vérifier chaque jour que le système est en **état nominal**. Pas de rapport vers Amadeus sauf signal Orange/Red.

## Déclencheur
* **Fréquence :** Quotidienne (22h00, fin de journée)
* **Responsable :** Morty (Execution Engine)
* **Durée :** < 2 minutes

## Checklist Automatique

### 1. Santé Infrastructure
```bash
# Coolify: tous les services up ?
curl https://mcp.amadeuspace.com/health

# Supabase: DB responsive ?
curl https://[project-id].supabase.co/rest/v1/
```

### 2. Validité des Contrats
```bash
# Tous les nouveaux contrats sont-ils valides ?
node validate_contracts.js
```

### 3. Logs d'Erreurs
```bash
# Y a-t-il des erreurs critiques dans les 24h ?
grep "ERROR" /logs/**/*.json | wc -l
```

### 4. TMI Tracking
```bash
# Le TMI est-il sur la trajectoire pour ce mois ?
# (TMI actuel / jours écoulés) * 30 >= TMI target ?
```

## Résultat

### Si TOUT est vert (Nominal)
→ **Aucune action**. Morty archive le pulse dans `/ops/daily-pulse/pulse-YYYY-MM-DD.json`

### Si 1+ indicateur est Orange
→ **Pulse vers Jerry** : Investigation requise (mais pas d'alerte Amadeus)

### Si 1+ indicateur est Red
→ **Escalade immédiate** : Notification Amadeus + création Intent de correction

## Output Format

```json
{
  "date": "2025-07-14",
  "status": "green",
  "checks": {
    "infrastructure": "green",
    "contracts": "green",
    "errors": "green",
    "tmi_tracking": "green"
  },
  "notes": "All systems nominal. No action required."
}
```

---

> **"Un day où rien ne casse est un jour réussi."** — Morty
