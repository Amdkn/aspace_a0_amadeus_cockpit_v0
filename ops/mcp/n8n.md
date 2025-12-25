# MCP DRY-RUN : N8N

## Objectif
Documenter l'intention de connexion à n8n (workflow automation) pour exposer les workflows comme des "tools" invocables par les agents.

## Informations API

* **Endpoint :** `https://n8n.amadeuspace.com/api/v1`
* **Auth :** API Key `{{env.N8N_API_KEY}}`
* **Documentation :** [n8n API Docs](https://docs.n8n.io/api/)

## Workflows Prévus

### 1. Business Pulse Aggregator
* **Trigger :** Webhook MCP (appelé par Jerry chaque dimanche)
* **Action :** Agréger les KPIs de toutes les instances Summer
* **Output :** JSON structuré vers `/ops/business-pulse/pulse-[date].json`

### 2. Life Domains Tracker
* **Trigger :** Daily Pulse (Morty, 22h00)
* **Action :** Récupérer les scores depuis Supabase `life_scores`
* **Output :** Calcul de la moyenne hebdomadaire

### 3. Email Sender (Sunday Uplink)
* **Trigger :** Webhook MCP (appelé par Robin après génération de l'Uplink)
* **Action :** Envoyer l'Uplink par email à Amadeus
* **Output :** Confirmation d'envoi

## Mode "Workflow-as-a-Tool"

Les workflows n8n deviennent des fonctions invocables :

```javascript
// Exemple: Appel au Business Pulse Aggregator
const result = await mcp_client.invoke_tool("n8n/business-pulse", {
  week: 28,
  year: 2025
});

console.log(result.tmi_total); // 2100€
```

## Workflow de Création

1. **Intent** : Créer un nouveau workflow pour automatiser X
2. **Design** : Kirby (A0-Manager) définit le flow dans n8n UI
3. **Test** : Morty teste en staging avec données fictives
4. **Validation Rick** : Audit d'efficience (ce workflow est-il nécessaire ?)
5. **Deployment** : Activation en production
6. **Monitoring** : Jerry surveille les exécutions (taux de succès)

## Risques Identifiés

* ⚠️ Workflow mal configuré = boucle infinie (DoS)
* ⚠️ Credentials exposés dans un workflow = fuite de sécurité
* ⚠️ Absence de retry logic = échecs silencieux

## Rollback Plan

Si un workflow cause des problèmes :
1. **Pause** : Désactiver le workflow via API
2. **Investigation** : Morty inspecte les logs d'exécution
3. **Fix** : Correction du workflow en staging
4. **Re-deploy** : Après validation Rick

---

**Status :** 🟡 Dry-Run (non connecté)  
**Prochaine étape :** Créer un workflow de test "Hello World" + exposer via webhook
