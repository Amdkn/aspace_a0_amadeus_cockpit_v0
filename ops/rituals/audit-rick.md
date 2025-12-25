# RITUEL : AUDIT RICK

## Objectif
Analyser l'**efficience biomimétique** du système pour éliminer les gaspillages et optimiser le ratio Valeur/Énergie.

## Déclencheur
* **Fréquence :** Hebdomadaire (vendredi 18h00)
* **Responsable :** Rick (A1 - Audit)
* **Durée :** ~30 minutes d'analyse automatique

## Métriques Analysées

### 1. Ratio Efficience Globale
```
Efficience = (Valeur Produite / Énergie Consommée)

Valeur Produite = TMI généré + Avancement 12WY + Life Domains améliorés
Énergie Consommée = Temps CPU + Coûts serveur + Temps cerveau Amadeus
```

**Seuil acceptable :** > 0.70

### 2. Vampires de Dépendance
Rick scanne le projet pour détecter :
* Librairies NPM inutilisées (`depcheck`)
* Services SaaS redondants (ex: 2 outils de monitoring)
* Workflows n8n qui tournent sans produire de valeur

### 3. Friction Points
Rick identifie les endroits où le système ralentit inutilement :
* Nombre de clics pour atteindre une info (doit être ≤ 3)
* Temps de réponse des APIs (doit être < 2s)
* Nombre d'agents impliqués dans une tâche simple (doit être ≤ 2)

## Processus

### 1. Collecte des Données
Rick lit tous les logs de la semaine :
* `/logs/intents/` : Combien d'Intents créés vs exécutés ?
* `/logs/pulses/` : Quel est le taux de réussite des déploiements ?
* `/ops/business-pulse/` : TMI vs coûts infrastructure

### 2. Analyse Comparative
Rick compare les métriques semaine N vs semaine N-1 :
* Efficience en hausse ou baisse ?
* Nouveaux gaspillages détectés ?
* Optimisations précédentes : impact mesuré ?

### 3. Recommandations
Rick génère un rapport avec 3 sections :
1. **Keep** : Ce qui fonctionne bien et doit être préservé
2. **Kill** : Ce qui doit être supprimé immédiatement
3. **Mutate** : Ce qui doit être optimisé/transformé

## Output

**Fichier :** `/ops/audits/rick/audit-YYYY-WXX.md`

**Format :**
```markdown
# Audit Rick - Semaine XX

## Ratio d'Efficience
Semaine actuelle : **0.82** (+0.05 vs semaine précédente)  
Tendance : 📈 Amélioration continue

## Vampires Détectés
- `ajv-cli` (NPM) : Jamais utilisé depuis 3 semaines → **Kill**
- Workflow n8n "daily-scraper" : N'a rien produit → **Kill ou Mutate**

## Friction Points
- Accès au Sunday Uplink : 5 clics nécessaires → **Mutate** (créer un bookmark direct)

## Recommandations
1. **Keep** : Le script `validate_contracts.js` (zéro dépendance, efficace)
2. **Kill** : L'ancien dossier `/legacy/` (100MB inutiles)
3. **Mutate** : Fusionner les 2 scripts de backup en un seul (DRY principle)
```

## Validation
Beth s'assure que les recommandations **Kill** ne violent pas l'Ikigai.

---

> **"Le chaos est une ressource, l'ordre est un outil, l'efficience est la seule religion."** — Rick
