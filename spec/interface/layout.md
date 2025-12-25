# Layout : A'Space OS Interface

## Structure Globale

```
┌─────────────────────────────────────────────────────────────┐
│  [HORIZON]  Life Domains Radar  🌟                          │
├─────────┬───────────────────────────────────┬───────────────┤
│         │                                   │               │
│ [FOREST]│       [TERMINAL]                  │   [PULSE]     │
│  PARA   │       A0 Command                  │   Business    │
│  Tree   │       > _                         │   Monitor     │
│         │                                   │               │
│         │                                   │   TMI: 2100€  │
│         │                                   │   TVR: 0.82   │
│         │                                   │               │
├─────────┴───────────────────────────────────┴───────────────┤
│  [DOCK]  USS Discovery | USS Enterprise | USS Voyager ...   │
└─────────────────────────────────────────────────────────────┘
```

## Zones Détaillées

### 1. Horizon (Top Bar - 10vh)
**Contenu :**
* Logo A'Space OS (left)
* Life Domains Radar (center) : radar circulaire avec 8 vaisseaux
* Status Indicator (right) : 🟢 Nominal | 🟠 Attention | 🔴 Critique

**Interaction :**
* Clic sur un vaisseau → Ouvre le Life Domain en modal
* Hover → Affiche le score actuel

### 2. Forêt PARA (Left Sidebar - 20vw)
**Contenu :**
* Tree view des projets PARA
* Filtres : Projects | Areas | Resources | Archives
* Search bar (top)

**Interaction :**
* Clic sur un projet → Affiche les détails dans le terminal
* Drag & drop → Déplacer entre Projects/Areas/Archives

### 3. Terminal A0 (Center - 60vw)
**Contenu :**
* Prompt : `amadeus@aspace-os:~$ _`
* Output zone (scrollable)
* Quick actions (top toolbar) : New Intent | Run Workflow | Deploy

**Interaction :**
* Commandes textuelles (ex: `deploy summer-v1 --env=prod`)
* Auto-complete (TAB)
* Historique (↑/↓)

### 4. Pulse Monitor (Right Sidebar - 20vw)
**Contenu :**
* KPI Cards :
  * TMI actuel / target
  * TVR score (graphique sparkline)
  * 12WY completion %
* Latest Pulse (Jerry, dernière mise à jour)
* Quick actions : View Full Report | Generate Uplink

**Interaction :**
* Clic sur un KPI → Drill-down dans le terminal
* Hover → Tooltip avec évolution vs semaine précédente

### 5. Dock (Bottom Bar - 8vh)
**Contenu :**
* 8 icônes des vaisseaux Starfleet (Life Domains)
* 2 icônes système : Settings | Help
* Status bar (right) : Date | Time | Network

**Interaction :**
* Clic sur un vaisseau → Ouvre le domaine
* Clic droit → Quick actions (ex: Update Score, View History)

## Responsive Behavior

### Desktop (>= 1920px)
* Layout complet (4 quadrants + dock)

### Laptop (1280-1920px)
* Sidebar collapsible (icons only)
* Terminal prend plus de place

### Tablet (< 1280px)
* Mode "Focus" par défaut
* Swipe pour changer de quadrant

## States & Transitions

### Loading State
```
┌─────────────────────────────────┐
│  Loading A'Space OS...          │
│  [████████████░░░░░░] 75%       │
│  Initializing Mycélium...       │
└─────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────┐
│  ⚠️ Connection Lost             │
│  Retrying in 5s...              │
│  [Retry Now] [Go Offline]       │
└─────────────────────────────────┘
```

### Empty State (First Launch)
```
┌─────────────────────────────────┐
│  Welcome, Amadeus.              │
│  Your mycélium is ready.        │
│  Type 'help' to begin.          │
└─────────────────────────────────┘
```

---

> **"Chaque pixel a un but. Chaque zone a un rôle. Aucune friction."**
