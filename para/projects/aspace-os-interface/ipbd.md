# IPBD : A'SPACE OS INTERFACE

## Intent (Pourquoi)
L'interface A'Space OS V4 existe pour donner à l'Architecte (Amadeus) une vision "Capitaine de Vaisseau" sur son écosystème agentique, sans jamais le distraire de sa mission principale.

## Problem (Pour qui)
**Utilisateur principal :** Amadeus (A0)  
**Personas secondaires :** Kirby (supervision), Beth (validation Ikigai)

### Ce qu'elle remplace
* La sidebar ChatGPT (dispersion cognitive)
* Les multiples onglets (friction mentale)
* Le chaos des notifications (dopamine loop)

## Blueprint (Comment - Vue d'Ensemble)

### Composants Principaux
1. **Le Dock** : 8 vaisseaux Starfleet (Life Domains)
2. **Le Terminal** : A0 Command (accès root)
3. **Le Mycélium** : Visualiseur PARA
4. **Le Pulse Monitor** : Dashboard Jerry (Business KPIs)
5. **Le Sunday Uplink** : Condensé hebdomadaire

### Architecture Technique
* **Frontend :** React + Vite (sobriété, vitesse)
* **Backend :** Coolify (auto-hébergé)
* **Data :** Supabase + MCP (n8n workflows)
* **Deployment :** Docker (Dockerfile déjà créé)

## Decision (Choix Architecturaux Clés)

### Choix 1 : Web-based vs Desktop App
**Décision :** Web-based (accessible depuis n'importe où)  
**Raison :** Mobilité + pas de maintenance desktop multi-OS

### Choix 2 : Visual Framework
**Décision :** Inspiration ryo.lu (minimaliste, zen)  
**Raison :** Alignement Solarpunk (sobriété esthétique)

### Choix 3 : Mode de Notifications
**Décision :** Pull uniquement (pas de push), sauf signaux Red/Orange  
**Raison :** Protection du focus de l'Architecte

---

> **Mission Statement :** "Un cockpit qui informe, jamais qui alarme. Un OS qui sert, jamais qui asservit."
