# MCP DRY-RUN : HOSTINGER

## Objectif
Documenter l'intention de connexion au VPS Hostinger **sans exécuter** de commandes réelles. C'est un exercice de planification.

## Informations Serveur

* **Provider :** Hostinger VPS
* **IP :** `{{env.SERVER_IP_PROD}}` (à définir dans les secrets)
* **SSH Access :** `root@[IP]` (clé SSH, pas de password)
* **OS :** Ubuntu 22.04 LTS

## Services Hébergés

1. **Coolify** : Plateforme de déploiement (PaaS self-hosted)
2. **n8n** : Workflows automation
3. **Supabase** : Base de données (si auto-hébergé)
4. **MCP Gateway** : Point d'entrée pour les agents

## Connexion Prévue

### Via SSH (Maintenance)
```bash
ssh -i ~/.ssh/aspace_vps root@$SERVER_IP_PROD
```

**Permissions :** Morty uniquement (A1-Ops)  
**Usage :** Debugging, maintenance serveur, logs inspection

### Via API Coolify (Déploiements)
Toutes les actions de déploiement passeront par l'API Coolify, **jamais** en SSH direct.

## Risques Identifiés

* ⚠️ Accès root = destructif si mal utilisé
* ⚠️ Pas de backup automatique configuré (à mettre en place)
* ⚠️ Monitoring limité (besoin d'un outil type Prometheus)

## Rollback Plan

Si la connexion échoue ou cause des problèmes :
1. **Fallback** : Mode local uniquement (pas de déploiement distant)
2. **Investigation** : Logs SSH dans `/var/log/auth.log`
3. **Support** : Contacter Hostinger support si problème infrastructure

---

**Status :** 🟡 Dry-Run (non connecté)  
**Prochaine étape :** Valider les credentials + tester `ssh` en lecture seule
