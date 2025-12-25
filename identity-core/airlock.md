# AIR LOCK : PROTOCOLE DE FILTRAGE

## Objectif
Protéger Amadeus (A0) du bruit opérationnel en filtrant toutes les "Intents" via Jerry avant qu'elles n'atteignent le niveau supérieur.

## Mécanisme

### 1. Capture de l'Intent
Toute action demandée par un agent A2/A3 est capturée sous forme de contrat `Intent.json`.

### 2. Analyse Multi-Critères (Jerry)

Jerry évalue selon 3 axes :

#### Risque
* **Low :** Lecture seule, actions reversibles
* **Medium :** Modifications de fichiers locaux
* **High :** Déploiements, modifications DB, suppression de données

#### Impact
* **Reversible :** Peut être annulé sans perte
* **Irreversible :** Modification permanente (ex: suppression DB, déploiement prod)

#### Permission Level
* **Local :** Accès au cockpit uniquement
* **Operator :** Accès aux outils externes (Coolify, n8n)
* **Superuser :** Modifications critiques (DB, secrets)

### 3. Décision Automatique

```
SI (risque == Low ET impact == Reversible ET permission == Local)
  ALORS → Exécution automatique
SINON SI (risque == Medium OU impact == Irreversible)
  ALORS → Escalade vers Beth (Decision contract)
SINON
  ALORS → Blocage + ACK manuel d'Amadeus requis
```

### 4. Traçabilité
Tous les filtres sont logués dans `/logs/airlock/filter-[date].json` pour audit Rick.

## Exemple

**Intent:** "Déployer Summer-v1 sur Coolify"  
**Risque:** Medium  
**Impact:** Irreversible  
**Permission:** Operator  
→ **Résultat:** Escalade vers Beth → Création d'une Decision → Attente ACK Amadeus

---

> **"L'Air Lock n'est pas une barrière. C'est un filtre intelligent."** — Jerry
