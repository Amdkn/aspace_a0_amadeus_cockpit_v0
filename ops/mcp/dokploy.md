# MCP DRY-RUN : DOKPLOY

## Objectif
Documenter l'intention de connexion à Dokploy (alternative à Coolify) si nécessaire pour le déploiement d'applications.

## Informations API

* **Endpoint :** `https://dokploy.amadeuspace.com/api`
* **Auth :** Bearer Token `{{env.DOKPLOY_API_TOKEN}}`
* **Documentation :** [Dokploy Docs](https://dokploy.com/docs)

## Cas d'Usage

Dokploy est utilisé **si et seulement si** Coolify ne peut pas gérer un besoin spécifique :
* Déploiement de stacks Docker Compose complexes
* Gestion de multiples environnements (dev/staging/prod)
* Monitoring avancé intégré

**Philosophie Rick :** "Ne pas dupliquer les outils. Si Coolify suffit, ne pas utiliser Dokploy."

## Commandes Prévues

### 1. Déployer une Stack
```bash
curl -X POST -H "Authorization: Bearer $DOKPLOY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stack": "summer-v1",
    "compose_file": "docker-compose.prod.yml"
  }' \
  https://dokploy.amadeuspace.com/api/deploy
```

### 2. Lister les Déploiements
```bash
curl -H "Authorization: Bearer $DOKPLOY_API_TOKEN" \
  https://dokploy.amadeuspace.com/api/stacks
```

### 3. Récupérer les Logs
```bash
curl -H "Authorization: Bearer $DOKPLOY_API_TOKEN" \
  https://dokploy.amadeuspace.com/api/stacks/summer-v1/logs
```

## Workflow de Décision

Avant d'utiliser Dokploy :
1. **Audit Rick** : Est-ce que Coolify peut le faire ?
2. **Validation Beth** : Le coût (complexité) justifie-t-il le bénéfice ?
3. **ACK Amadeus** : Confirmation du besoin (éviter la duplication d'outils)

## Risques Identifiés

* ⚠️ Duplication d'outils = overhead de maintenance
* ⚠️ Confusion sur "où est déployé quoi ?"
* ⚠️ Coût supplémentaire (si service payant)

## Rollback Plan

Si Dokploy est finalement inutile :
1. **Migration** : Tout déplacer vers Coolify
2. **Archivage** : Documenter pourquoi Dokploy n'a pas été retenu
3. **Kill** : Désactiver le service (principe Rick)

---

**Status :** 🟡 Dry-Run (non connecté)  
**Prochaine étape :** Évaluer si Coolify suffit avant d'activer Dokploy
