# Non-Features : A'Space OS Interface

## Ce que l'interface ne sera JAMAIS

Ce document liste explicitement les **anti-patterns** à éviter.

---

## ❌ Social Features

### Interdits
* Likes / Reactions
* Comments / Discussions
* Sharing / Export vers social media
* Notifications push vers d'autres utilisateurs
* Leaderboards / Comparaisons

### Raison
L'interface est un **outil personnel**, pas une plateforme sociale. Amadeus travaille seul, pas dans une équipe compétitive.

---

## ❌ Gamification

### Interdits
* Badges / Achievements
* Points / XP systems
* Streaks (ex: "7 days in a row!")
* Progress bars inutiles (ex: "Profile 80% complete")
* Confetti / Celebrations automatiques

### Raison
La dopamine doit venir du **travail accompli**, pas des artifices. Rick rejette toute forme de manipulation psychologique.

---

## ❌ Notifications Push Agressives

### Interdits
* Pop-ups interruptifs
* Sons de notification
* Badges rouges avec compteurs
* Emails de rappel quotidiens
* "You haven't checked in today!"

### Raison
Philosophie "Visual Silence". Seuls les signaux **Orange/Red** déclenchent une alerte, et jamais de manière intrusive.

---

## ❌ Analytics Invasifs

### Interdits
* Tracking de chaque clic
* Heatmaps sans consentement
* Session recording
* A/B testing sur l'UI (il n'y a qu'un seul utilisateur !)
* Data selling / partage avec tiers

### Raison
Souveraineté des données. Amadeus possède 100% de son analytics. Pas de SaaS tiers.

---

## ❌ Complexité Inutile

### Interdits
* Menus à 3+ niveaux de profondeur
* Wizards avec 10 étapes
* Formulaires avec 50 champs
* Dashboards avec 20 widgets
* Customization infinie (paralysie du choix)

### Raison
Principe Rick : "Si c'est complexe, c'est cassé." Chaque feature ajoutée doit justifier son ratio Valeur/Complexité.

---

## ❌ Vendor Lock-In

### Interdits
* Formats propriétaires (export impossible)
* Dépendance à un seul cloud provider
* APIs fermées (pas de self-hosting possible)
* Encryption sans clé de récupération
* Abonnements forcés (freemium trap)

### Raison
Philosophie Solarpunk : **Open Source + Self-Hosted**. L'interface doit pouvoir survivre sans internet ni SaaS.

---

## ❌ Dark Patterns

### Interdits
* Boutons "Cancel" cachés
* Double negatives ("Don't not save?")
* Pre-checked boxes malveillantes
* Confirmations multiples inutiles
* Redirections trompeuses

### Raison
Respect de l'utilisateur (Amadeus). Pas de manipulation, jamais.

---

## ❌ Feature Bloat

### Interdits
* "Nice to have" qui diluent le focus
* Features demandées par personne
* Duplication d'outils (ex: 2 calendriers)
* Easter eggs / gimmicks
* Modes "Pro" / "Advanced" inutilisés

### Raison
Audit Rick systématique. Chaque feature doit être **utilisée** ou **supprimée**.

---

## ✅ Ce que l'interface DOIT être

* **Minimaliste** : Seulement l'essentiel
* **Fonctionnelle** : Chaque pixel a un but
* **Rapide** : < 2s pour toute action
* **Souveraine** : Aucune dépendance critique
* **Respectueuse** : Jamais de manipulation

---

> **"Une interface qui ajoute une feature inutile vole de l'énergie à l'Architecte."** — Rick

> **"Le meilleur code est celui qu'on n'écrit pas. La meilleure feature est celle qu'on n'ajoute pas."** — Constitution A'Space OS
