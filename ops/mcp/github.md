# MCP DRY-RUN : GITHUB

## Objectif
Documenter l'intention de connexion au repo GitHub du cockpit pour automatiser les backups et la synchronisation de la mémoire.

## Informations Repo

* **Repository :** `amadeuspace/aspaceos-a0-amadeus-cockpit` (privé)
* **Auth :** Personal Access Token (PAT) `{{env.GITHUB_PAT}}`
* **Branch principal :** `main`

## Commandes Prévues

### 1. Synchroniser la Mémoire
```bash
# Script: sync_memory.sh
git add Knowledge\ Base/
git add para/
git add logs/
git commit -m "Sync $(date +%Y-%m-%d)"
git push origin main
```

**Fréquence :** Quotidienne (via Daily Pulse de Morty)  
**Permissions :** Morty (A1-Ops)

### 2. Créer une Issue (Escalation)
```bash
curl -X POST -H "Authorization: token $GITHUB_PAT" \
  -d '{
    "title": "Decision Type 4 Required",
    "body": "Intent INT-20250714-001 nécessite un ACK manuel.",
    "labels": ["type4", "urgent"]
  }' \
  https://api.github.com/repos/amadeuspace/aspaceos-cockpit/issues
```

**Usage :** Quand une Decision Type 4 est créée, automatiquement créer une issue GitHub pour traçabilité

### 3. Récupérer les Commits (Audit)
```bash
curl -H "Authorization: token $GITHUB_PAT" \
  https://api.github.com/repos/amadeuspace/aspaceos-cockpit/commits
```

**Usage :** Rick audite la fréquence des commits pour détecter les périodes de stagnation

## Workflow de Synchronisation

1. **Daily Pulse** : Morty détecte des changements dans `/para` ou `/Knowledge Base`
2. **Commit** : Morty crée un commit automatique avec un message descriptif
3. **Push** : Synchronisation vers GitHub
4. **Validation** : Si échec → Notification Amadeus (risque de perte de données)

## Risques Identifiés

* ⚠️ PAT compromis = accès total au repo
* ⚠️ Push forcé = perte d'historique Git
* ⚠️ Commits trop fréquents = pollution de l'historique

## Rollback Plan

Si la synchronisation échoue :
1. **Local Backup** : Les fichiers restent en local (pas de perte)
2. **Manual Push** : Amadeus peut pousser manuellement si nécessaire
3. **Investigation** : Vérifier les credentials + connectivité réseau

---

**Status :** 🟡 Dry-Run (non connecté)  
**Prochaine étape :** Générer un PAT avec scope `repo` + tester `git push`
