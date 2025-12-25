# 🔌 TECH STACK & ENDPOINTS (API/INFRA)
**Propriétaire :** A'0 (Directeur des Opérations)
**Rôle :** Annuaire technique et cartographie des accès de l'empire A'Space.

## I. Couche d'Infrastructure (Sovereign Hosting)
* **Conteneurisation :** Coolify (Instance sur Hostinger VPS).
* **Reverse Proxy :** Traefik (Gestion des certificats SSL et routage des sous-domaines).
* **Stockage :** Supabase (Backend PostgreSQL, Mémoire Vectorielle/RAG et Logs).
* **Base de Données Exécution :** Airtable (Exécution 12WY).

## II. Couche d'Intelligence & Context (MCP)
* **Model Context Protocol (MCP) :** Utilisé pour protocoliser l'accès aux fichiers et bases de données.
* **Servers MCP Actifs :**
    * `github-mcp` : Pour la gestion des dépôts de Skills.
    * `docker-mcp` : Pour le monitoring des conteneurs Summers.
    * `postgres-mcp` : Pour les requêtes directes sur Supabase.
* **CLI :** Gemini CLI / Conductor Extension pour le "Context-Driven Development".

## III. Couche d'Orchestration (Workflows)
* **Engine :** n8n (Auto-hébergé via Coolify).
* **Fonction :** Aiguilleur Galactique pour le routage IPBD → Projects PARA.
* **Interface utilisateur :** Notion (Mémoire PARA) et ClickUp (Tâches GTD).

## IV. Points d'Entrée Stratégiques (Endpoints)
* **Admin Dashboard :** `https://coolify.aspace.os` (Gestion des serveurs).
* **Identity API :** `https://supabase.aspace.os/rest/v1` (Noyau d'Identité/Ikigai).
* **Workflow Webhooks :** `https://n8n.aspace.os/webhook/v1/ipbd-inbound`.
* **Knowledge Base Path :** `Documents/A'Space OS/aspaceos-a0-amadeus-cockpit/Knowledge Base`.

## V. Sécurité & Accès
* Les clés d'API (Coolify, GitHub, Supabase) ne sont JAMAIS stockées en clair dans ce fichier.
* A'0 doit extraire les secrets depuis les variables d'environnement sécurisées de l'agent Antigravity.