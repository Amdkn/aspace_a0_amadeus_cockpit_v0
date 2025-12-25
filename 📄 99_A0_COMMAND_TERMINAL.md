# ⚡ 99_A0_COMMAND_TERMINAL : LE PONT DE COMMANDEMENT (ROOT)
**Propriétaire :** A'0 (Directeur des Opérations)
**Autorisation :** Accès Root délégué par Amadeus (A0).
**Objectif :** Interface de déploiement, gestion des accès API et exécution des commandes système.

## I. Endpoints d'Infrastructure (Hostinger / Coolify)
Ce terminal pilote ton "Souverain Cloud" via l'API Coolify.
* **API Endpoint :** `https://app.coolify.io/api/v1` (ou ton instance auto-hébergée).
* **Token de Connexion :** `{{env.COOLIFY_API_TOKEN}}`
* **Serveur Maître (IP) :** `{{env.SERVER_IP_PROD}}`
* **Fonctions Autorisées :**
    * `DEPLOY_NEW_INSTANCE` : Création d'un nouveau conteneur pour une Summer (A2).
    * `RESTART_SERVICE` : Redémarrage des workflows n8n ou Supabase.
    * `GET_LOGS` : Extraction des logs d'exécution pour l'audit de Rick.

## II. Gestion des Permissions Agentiques
La hiérarchie des droits d'exécution est strictement cloisonnée :

| Agent | Permission Terminal | Commande Critique |
| :--- | :--- | :--- |
| **A'0** | **SUPERUSER** | Déploiement infra, gestion Docker, rotation des clés. |
| **Morty** | **OPERATOR** | Lancement de containers, backup DB, scaling. |
| **Jerry** | **AUDITOR** | Lecture seule des logs financiers et d'usage. |
| **Summer** | **LOCAL** | Accès limité à son propre container et son repo GitHub. |

## III. Protocoles de Sécurité (Le Kill Switch)
1. **Validation Double-Step :** Tout déploiement impactant la base de données centrale `Supabase` doit être validé par un "ACK" manuel d'Amadeus via Google Chat.
2. **Auto-Containment :** Si une instance Summer consomme plus de 80% des ressources CPU du VPS, Morty a l'autorisation de la brider automatiquement (Biomimétisme : protection de l'organisme hôte).
3. **Emergency Wipe :** Commande `SYSTEM_RED_PURGE` : En cas de compromission, A'0 déconnecte tous les endpoints et sécurise le noyau d'Identité.

## IV. Scripts de Routine (Automatisations)
* **`sync_memory.sh`** : Synchronise les fichiers .md du cockpit avec le repo GitHub privé.
* **`check_health.sh`** : Vérifie la latence des serveurs MCP et des bases de données.
* **`spin_up_summer.sh`** : Script template pour créer instantanément l'environnement PARA d'un nouveau SOB.

## V. Logs de Commandes
Chaque commande exécutée par ce terminal est logguée dans `Supabase > table_system_logs` avec l'ID de l'agent initiateur.