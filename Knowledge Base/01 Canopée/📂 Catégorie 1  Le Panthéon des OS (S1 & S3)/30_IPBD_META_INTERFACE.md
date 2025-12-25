# 🖥️ META-IPBD : INTERFACE A'SPACE OS (V4)
**Propriétaire :** Amadeus (A0) & Kirby (A0-Manager)  
**Objectif :** Créer un cockpit visuel web-based pour superviser la flotte sans entrer dans le code.

## I. Intent (L'Intention)
* Remplacer la sidebar ChatGPT par un bureau virtuel souverain.
* Centraliser les logs de Jerry, les audits de Rick et les rituels de Beth.
* Donner à Amadeus (A0) une vision "Capitaine de Vaisseau" sur son écosystème agentique.

## II. Principles (La Philosophie)

### Visual Silence
Seuls les signaux "Orange" ou "Red" déclenchent des alertes visuelles.
> "L'absence de notification est une notification de santé."

### Fractal Navigation
Pouvoir zoomer d'une Area PARA vers un agent A3 Marvel en un clic.
> "De la forêt à la feuille, sans friction."

### Local-First
L'interface tourne sur ton VPS (Coolify) et communique via MCP.
> "Pas de SaaS. Pas de dépendance. Souveraineté totale."

### Esthétique Solarpunk
Inspirée de [ryo.lu](https://ryo.lu/) : minimaliste, organique, efficace.

## III. Blueprint (Structure de l'OS)

### Le Dock (Starfleet Vessels)
Accès rapide aux 8 domaines de la Roue de la Vie :
* **USS Discovery** : Santé & Biohacking
* **USS Voyager** : Finances & Économie
* **USS Enterprise** : Carrière & Vision
* **USS Defiant** : Relations & Amour
* **USS Deep Space 9** : Environnement & Habitat
* **USS Cerritos** : Loisirs & Plaisir
* **USS Titan** : Contribution & Mission
* **USS Reliant** : Cognition & Apprentissage

### Le Terminal (A0 Command)
Accès direct à `99_A0_COMMAND_TERMINAL` pour les commandes de Robin (Gemini CLI).

### Le Mycélium (PARA Visualizer)
Visualisation graphique des fichiers PARA :
* Projects (12WY active)
* Areas (Life Domains, SOB Pillars)
* Resources (SOP, Templates)
* Archives (Built to Sell completed)

### Le Pulse Monitor (Jerry's Dashboard)
Affichage en temps réel :
* TMI (Target Monthly Income)
* TVR (Time-Value-Revenue score)
* KPIs Business (par domaine Marvel)

### Le Sunday Uplink
Condensé hebdomadaire en 10 lignes maximum, prêt pour l'Architecte.

## IV. Non-Goals (Ce que l'Interface ne fera JAMAIS)

* ❌ Social media feeds
* ❌ Dopamine loops (likes, badges)
* ❌ Notifications push (sauf signaux Red/Orange)
* ❌ Tracking invasif
* ❌ Features "nice to have" qui diluent le focus

## V. Data Sources
* **Supabase** : Tables `life_scores`, `business_pulse`, `system_logs`
* **n8n Workflows** : Exposed as tools via MCP
* **Local files** : Contrats PARA (Intent, Decision, Order, Pulse, Uplink)
* **GitHub** : Sync avec le repo cockpit

---

> **"Une interface qui ne distrait jamais. Un cockpit qui protège toujours. Un OS qui ne triche jamais."**
