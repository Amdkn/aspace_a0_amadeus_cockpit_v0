# RITUEL : AIR LOCK FLOW

## Objectif
Garantir que **aucune Intent** n'atteint Amadeus sans avoir été filtrée par Jerry et validée (si nécessaire) par Beth.

## Déclencheur
* **Fréquence :** Continu (en temps réel, dès qu'une Intent est créée)
* **Responsable :** Jerry (Business Pulse) + Beth (Ikigai)
* **Durée :** < 30 secondes par Intent

## Flux de Traitement

### 1. Capture de l'Intent
Un agent (A2/A3) crée un fichier `INT-YYYYMMDD-NNN.json` dans `/logs/intents/`.

**Exemple :**
```json
{
  "id": "INT-20250714-001",
  "title": "Déployer Summer-v1 en production",
  "risk_level": "medium",
  "expected_energy_cost": "medium",
  "needs_type4_decision": true
}
```

### 2. Analyse Automatique (Jerry)
Jerry lit le fichier et calcule un **score de risque** :

```python
risk_score = 0

# Facteur 1: Niveau de risque déclaré
if intent["risk_level"] == "high":
    risk_score += 3
elif intent["risk_level"] == "medium":
    risk_score += 2
else:
    risk_score += 1

# Facteur 2: Coût énergétique
if intent["expected_energy_cost"] == "high":
    risk_score += 2

# Facteur 3: Type 4 nécessaire ?
if intent["needs_type4_decision"]:
    risk_score += 2

# Résultat
# risk_score <= 3 → Auto-approve
# risk_score 4-6 → Escalade Beth
# risk_score >= 7 → Blocage + ACK Amadeus
```

### 3. Décision

#### Cas A : Auto-Approve (risk_score ≤ 3)
→ Jerry crée automatiquement une **Decision** avec `decision = "approve"`  
→ L'Intent passe directement en **Order** vers Morty

#### Cas B : Escalade Beth (risk_score 4-6)
→ Jerry crée une **Decision** avec `decision = null` (en attente)  
→ Beth lit l'Intent et valide contre l'Ikigai  
→ Si aligné : `decision = "approve"` | Sinon : `decision = "reject"`

#### Cas C : Blocage Amadeus (risk_score ≥ 7)
→ Jerry crée une **Decision** avec `signal_level = "red"`  
→ Notification immédiate à Amadeus (Google Chat)  
→ Attente d'un ACK manuel avant toute exécution

## Output

**Fichiers générés :**
* `/logs/intents/INT-[id].json` (Intent originale)
* `/logs/decisions/DEC-[id].json` (Décision de Jerry/Beth)
* Si approuvé : `/logs/orders/ORD-[id].json` (Ordre d'exécution pour Morty)

## Validation
* ✅ Aucune Intent contourne le flux
* ✅ Tous les scores de risque sont justifiés et logués
* ✅ Les décisions de Beth respectent les critères Ikigai

---

> **"Le filtrage n'est pas de la bureaucratie. C'est de la protection cognitive."** — Jerry
