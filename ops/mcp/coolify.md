# MCP DRY-RUN : COOLIFY

## Objectif
Documenter l'intention de connexion à Coolify (auto-hosted PaaS) pour déployer les instances Summer et l'interface A'Space OS.

## Informations API

* **Endpoint :** `https://app.coolify.io/api/v1` (ou instance custom)
* **Auth :** Bearer Token `{{env.COOLIFY_API_TOKEN}}`
* **Documentation :** [Coolify API Docs](https://coolify.io/docs/api)

## Commandes Prévues

### 1. Lister les Services
```bash
curl -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
  https://app.coolify.io/api/v1/services
```

**Usage :** Vérifier l'état des instances Summer déployées

### 2. Déployer un Service
```bash
curl -X POST -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "summer-v1-prod",
    "image": "ghcr.io/amadeuspace/summer:latest",
    "env": {...}
  }' \
  https://app.coolify.io/api/v1/deploy
```

**Permissions :** Morty (A1-Ops) uniquement  
**Validation :** Dry-run obligatoire avant production

### 3. Récupérer les Logs
```bash
curl -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
  https://app.coolify.io/api/v1/services/summer-v1-prod/logs
```

**Usage :** Audit Rick, debugging

## Workflow de Déploiement

1. **Intent** : Un agent demande un déploiement
2. **Air Lock** : Jerry filtre (risque Medium → Escalade Beth)
3. **Decision** : Beth valide l'alignement Ikigai
4. **Order** : Morty reçoit l'ordre
5. **Execution** : Morty appelle Coolify API
6. **Pulse** : Jerry rapporte le succès/échec

## Risques Identifiés

* ⚠️ Token compromis = accès total aux déploiements
* ⚠️ Mauvaise configuration = downtime des services
* ⚠️ Absence de monitoring = incidents invisibles

## Rollback Plan

Si un déploiement échoue :
1. **Automatic Rollback** : Coolify revient à la version précédente
2. **Logs Analysis** : Morty inspecte les logs
3. **Escalation** : Si échec répété → Notification Amadeus

---

**Status :** 🟡 Dry-Run (non connecté)  
**Prochaine étape :** Générer un token API + tester en lecture seule
