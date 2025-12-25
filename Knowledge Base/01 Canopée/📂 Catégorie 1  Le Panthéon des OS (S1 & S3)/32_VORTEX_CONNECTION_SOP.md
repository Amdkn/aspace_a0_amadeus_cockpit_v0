# 🌀 SOP : CONNEXION VORTEX (MCP GATEWAY)
**Propriétaire :** Morty (A1) & A'0 (Superuser)  
**Mission :** Connecter Antigravity à l'univers Hostinger/Coolify/n8n de manière sécurisée.

## I. Pré-requis (Checklist Go/No-Go)

Avant toute connexion, vérifier que :
- [x] La structure A'Space V2 est créée (`identity-core`, `spec`, `para`, `ops`, `logs`)
- [x] Les contrats sont validés (`npm run validate`)
- [x] Les rituels sont documentés (`ops/rituals/`)
- [ ] Les credentials sont sécurisés (variables d'environnement, pas de hardcode)
- [ ] L'Air Lock est armé (filtrage Jerry actif)

## II. Séquence d'Allumage

### Étape 1 : Lien Hostinger
Robin (Gemini CLI) vérifie l'état des records DNS :
```bash
dig mcp.amadeuspace.com
```

**Résultat attendu :** IP du VPS Hostinger + status A record.

### Étape 2 : Tunnel Coolify
Activation du service MCP Gateway sur Coolify :
* **URL :** `https://mcp.amadeuspace.com`
* **Port :** `3000` (ou custom)
* **Health check :** `GET /health` → `{"status": "online"}`

### Étape 3 : Poignée de main (Handshake)
Antigravity se connecte via l'URL `/sse` (Server-Sent Events) :
```javascript
const mcp_client = new MCPClient({
  endpoint: "https://mcp.amadeuspace.com/sse",
  token: process.env.MCP_GATEWAY_TOKEN
});
```

**Validation :** Un message `{"event": "connected", "agent": "robin-antigravity"}` est reçu.

## III. Déploiement n8n v2.0

### Mode "Workflow-as-a-Tool"
Activer le mode où chaque workflow n8n devient un outil invocable par les agents :
* **Workflow ID :** `business-pulse-aggregator`
* **Trigger :** Webhook MCP
* **Output :** JSON structuré vers `/ops/business-pulse/pulse-[date].json`

### Inspection par Kirby
Kirby (A0-Manager) inspecte les workflows disponibles :
```bash
curl https://mcp.amadeuspace.com/workflows
```

**Résultat :** Liste des workflows exposés + leurs inputs/outputs.

## IV. Sécurité "Air Lock"

### Principe
Le terminal est limité à l'**allowlist** définie dans `99_A0_COMMAND_TERMINAL.md`.

### Commandes Autorisées
* `DEPLOY_NEW_INSTANCE` (via Coolify API)
* `RESTART_SERVICE` (vie/mort des workflows n8n)
* `GET_LOGS` (lecture seule)

### Commandes Interdites
* ❌ `DELETE` opérations sur Supabase sans ACK
* ❌ `EXEC` arbitraire sur le VPS
* ❌ Modification des secrets (rotation nécessite ACK manuel d'Amadeus)

### Mécanisme de Filtrage (Jerry)
Tout "Intent" créé par un agent passe par Jerry qui analyse :
1. **Risque :** Low/Medium/High
2. **Impact :** Reversible/Irreversible
3. **Permission Level :** Local/Operator/Superuser

Si `risque = High` OU `impact = Irreversible` OU `permission = Superuser` :
→ **Blocage automatique + escalade vers Beth → Amadeus (ACK manuel requis)**.

## V. Rollback & Emergency Procedures

### En cas d'échec de connexion
1. **Logs de diagnostic :** `curl https://mcp.amadeuspace.com/logs/latest`
2. **Rollback DNS :** Retour au mode local (sans MCP)
3. **Audit Rick :** Analyse du ratio `temps perdu / valeur créée`

### Kill Switch
Commande d'urgence : `SYSTEM_RED_PURGE`
* Déconnecte tous les endpoints MCP
* Sécurise le noyau d'Identité
* Envoie une alerte à Amadeus via Google Chat

---

> **"La connexion n'est pas une fin. C'est un moyen. Si elle coûte plus qu'elle n'apporte, elle doit être coupée."** — Rick
