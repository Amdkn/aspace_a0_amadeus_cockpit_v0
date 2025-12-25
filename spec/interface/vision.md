# Interface Vision : A'Space OS Desktop

## Inspiration Centrale

L'interface A'Space OS s'inspire de **[ryo.lu](https://ryo.lu/)** : minimaliste, organique, efficace.

### Principes Esthétiques
* **Solarpunk** : Nature + technologie (pas cyberpunk agressif)
* **Zen** : Espace négatif, respiration visuelle
* **Fonctionnel** : Chaque pixel a un but

## Philosophie "Visual Silence"

> "L'absence de notification est une notification de santé."

### Règles d'Affichage
* **Vert (Nominal)** : Aucun signal visuel (silence total)
* **Orange (Attention)** : Indicateur subtil (pas de popup)
* **Rouge (Critique)** : Alerte visible + notification

## Métaphore du Cockpit

L'interface est un **cockpit de vaisseau spatial**, pas un dashboard d'entreprise.

### Les 4 Quadrants

#### 1. Le Ciel (Top) - Horizon
* **Vision** : Life Domains (8 vaisseaux Starfleet)
* **Affichage** : Radar circulaire avec scores
* **Interaction** : Clic sur un vaisseau = zoom sur ce domaine

#### 2. La Forêt (Left) - Mycélium PARA
* **Vision** : Arborescence des projets/areas/resources
* **Affichage** : Tree view organique (branches, racines)
* **Interaction** : Navigation fractal (de la forêt à la feuille)

#### 3. Le Termin

al (Center) - A0 Command
* **Vision** : Accès root direct
* **Affichage** : Terminal minimaliste (style Warp.dev)
* **Interaction** : Commandes textuelles pour Robin

#### 4. Le Pulse (Right) - Business Monitor
* **Vision** : KPIs business en temps réel
* **Affichage** : Graphiques sobres (ligne, bar)
* **Interaction** : Hover = détails, clic = drill-down

## Design System

### Palette de Couleurs (mode sombre par défaut)
```css
--bg-primary: #0a0e1a;        /* Deep space */
--bg-secondary: #1a1f2e;      /* Lighter panel */
--accent-green: #4ade80;      /* Success / Green signal */
--accent-orange: #fb923c;     /* Warning / Orange signal */
--accent-red: #f87171;        /* Error / Red signal */
--text-primary: #e5e7eb;      /* Main text */
--text-secondary: #9ca3af;    /* Muted text */
```

### Typographie
* **Headings** : Inter (Google Fonts)
* **Body** : Inter (légèrement plus light)
* **Monospace** : JetBrains Mono (terminal)

### Animations
* **Principe** : Micro-animations uniquement (< 200ms)
* **Usage** : Feedback tactile (hover, clic)
* **Interdiction** : Animations infinies (distraction)

## Modes d'Affichage

### Mode Focus (Default)
* Seul le quadrant actif est visible en pleine largeur
* Les autres quadrants sont réduits en "tabs" latéraux

### Mode Overview
* Les 4 quadrants visibles simultanément (grid 2x2)
* Pour avoir une vision globale du système

### Mode Zen
* Aucun UI visible sauf le terminal
* Pour le deep work d'Amadeus

---

> **"Une interface qui ne distrait jamais. Un cockpit qui protège toujours. Un OS qui ne triche jamais."**
