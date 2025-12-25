# RITUEL : SUNDAY UPLINK

## Objectif
Synthétiser la semaine écoulée en **10 lignes maximum** pour Amadeus. Le Sunday Uplink est le **seul moment** où l'Architecte doit regarder le système en détail.

## Déclencheur
* **Fréquence :** Hebdomadaire (dimanche matin, 6h00)
* **Responsable :** Jerry (Business Pulse) + Beth (Life Core)
* **Format :** 10 lignes de texte pur (pas de JSON, pas de tableaux)

## Processus

### 1. Agrégation (Jerry)
Jerry collecte tous les Pulse de la semaine depuis `/logs/pulses/` et extrait :
* TMI atteint ou non
* TVR moyen de la semaine
* Projets 12WY : avancement global

### 2. Filtrage (Beth)
Beth analyse les Life Domains depuis `/ops/life-core/` et identifie :
* Domaines en baisse (scores < semaine précédente)
* Domaines en hausse
* Alertes santé/énergie

### 3. Synthèse (Robin)
Robin fusionne les deux rapports en **exactement 10 lignes** :

```
1. [Semaine XX] 12WY à 45% | TMI atteint (2 100€) | TVR = 0.82
2. Life Domains : USS Enterprise (+5) | USS Discovery (-3) | reste stable
3. Business : Summer-SOB-01 génère 800€/mois | ops fluides
4. Blocages : Aucun critique | 2 décisions Type 4 en attente
5. Audit Rick : Efficience globale = 0.78 | suggestion d'optimisation n8n
6. Nouvelles Intents : 3 validées par Beth | 1 en analyse
7. Highlights : Déploiement MCP Gateway réussi | logs propres
8. Lowlights : Domaine Santé en recul (manque de sommeil)
9. Next Rocks : Activer workflows n8n | finaliser interface UI
10. ACK requis : Validation du budget Q1 pour Summer-v2
```

## Output
* **Fichier :** `/ops/uplinks/uplink-YYYY-WXX.md`
* **Notification :** Email ou Google Chat vers Amadeus
* **Contrat :** `UPLN-YYYYMMDD.json` dans `/logs/pulses/`

## Validation
Beth s'assure que :
* ✅ Les 10 lignes respectent la contrainte (pas plus)
* ✅ Aucune information critique n'est omise
* ✅ Le ton est factuel, jamais alarmiste

---

> **"10 lignes. Pas une de plus. Le focus de l'Architecte est sacré."** — Jerry
