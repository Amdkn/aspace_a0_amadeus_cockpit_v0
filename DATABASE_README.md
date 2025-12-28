# 📜 Architecture de Base de Données Souveraine — A'Space OS

Ce document définit les spécifications techniques du **Mycélium stable**, garantissant que le système reste fonctionnel et antifragile, même en mode **Zero-Dependence**.

## 🏗️ Principes d'Auto-Hébergement "Zero-Knowledge"

L'architecture est conçue pour fonctionner indépendamment des services tiers (Prisma Cloud, telemetry, etc.) afin d'assurer une **souveraineté totale** sur votre infrastructure [Coolify].

### Vue d'Ensemble

Cette implémentation établit une **architecture contract-first** avec **zéro dépendance externe**, où les contrats JSON sont la source de vérité, et la base de données (Prisma + SQLite) sert uniquement de couche de projection pour un accès optimisé en lecture.

## 🔒 Architecture Principles (Souveraineté)

1. **Contrats JSON = Source de Vérité**: Toute la logique métier et les données proviennent de fichiers JSON validés
2. **Base de Données = Cache**: La base de données sert uniquement de projection/lecture pour les tableaux de bord
3. **ContractGuard Middleware**: Le Douanier Numérique - Toutes les écritures doivent passer par la validation
4. **Audit Trail**: Chaque écriture est enregistrée dans le ledger Contract avec statut ACCEPTED/REJECTED
5. **Zéro Dépendance Externe**: Aucun appel à des services externes (télémétrie Prisma désactivée, checkpoint.prisma.io bloqué)
6. **Ledger Immuable**: Les hashes SHA-256 garantissent qu'aucune modification manuelle de la base de données ne passe inaperçue
7. **Mode Air Lock**: Dégradation gracieuse lorsque les dépendances sont indisponibles

## 🛠️ Configuration de l'Environnement Souverain

### 1. Isolation du Runtime Prisma (Antifragilité)

Pour éviter tout blocage lié au pare-feu ou à l'absence de réseau, le moteur Prisma est configuré en mode local strict.

#### Variables d'Environnement (.env)

Pour activer ces paramètres sur votre terminal [Coolify], votre fichier `.env` doit contenir :

```bash
# Prisma Sovereign Config
DATABASE_URL="file:./data/aspace_souverain.db"

# Prisma Zero-Dependence Configuration (Antifragilité)
PRISMA_SKIP_POSTINSTALL_GENERATE=1  # Désactive les appels externes
PRISMA_TELEMETRY_DISABLED=1          # Aucune télémétrie vers serveurs Prisma

# Air Lock Mode: Graceful degradation
ASPACE_AIR_LOCK_MODE=false           # Mettre à true pour mode lecture seule
```

#### Génération Interne du Client Prisma

Le client Prisma est généré dans `./src/generated/client` au lieu de `node_modules` pour assurer la **portabilité du dossier**.

**Configuration dans `prisma/schema.prisma`:**

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/client"  // Génération locale
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**Offline Force**: Les appels vers `checkpoint.prisma.io` sont désactivés via les variables d'environnement.

Cela permet au projet de "tenir par lui-même" même si les dépendances globales sont absentes.

## 🔐 ContractGuard : Le Douanier Numérique

La base de données n'est jamais la source de vérité ; elle n'est qu'une **projection persistée** des contrats validés.

### Validation Native (Durabilité)

La logique de `validate_contracts.js` est intégrée comme une **librairie interne sans dépendances API externes**.

```typescript
import ContractGuard from './src/lib/contract-guard';

const guard = new ContractGuard();
const result = await guard.writeContract({
  contractId: 'ORD-20250714-001',
  contractType: 'Order',
  data: orderJson
});

// Valide → Génère hash d'intégrité → Écrit dans ledger → Projette si accepté
```

### Air Lock Workflow

En cas de défaillance d'une dépendance ou d'un contrat invalide, le système bascule automatiquement en **lecture seule sécurisée**.

**Activation du Mode Air Lock:**

```bash
# Dans .env
ASPACE_AIR_LOCK_MODE=true
```

**Comportement en Mode Air Lock:**
- Toutes les opérations d'écriture sont bloquées avec avertissements
- Les opérations de lecture retournent des résultats vides gracieusement
- Le système enregistre l'état dégradé
- Aucun crash - dégradation gracieuse uniquement

## 📊 Ledger Immuable et Audit Trail (Souveraineté)

Chaque écriture en base de données doit laisser une trace indélébile pour garantir l'intégrité du cockpit.

### Table Contract : Registre "Append-only"

La table `Contract` est la source unique de vérité pour toutes les écritures en base de données, avec des hashes SHA-256 pour empêcher toute manipulation:

```prisma
model Contract {
  id            String   @id @default(cuid())
  contractId    String   @unique  // "ORD-20250714-001"
  contractType  String   // "Order", "Pulse", "Decision", "Intent", "Uplink"
  rawJson       String   // JSON complet en tant que texte
  status        String   // "ACCEPTED" ou "REJECTED"
  validationLog String?  // Erreurs de validation si REJECTED
  integrityHash String   // Hash SHA-256 pour vérification d'intégrité
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### Preuve d'Intégrité

Chaque entrée inclut un **hash SHA-256 généré localement**, empêchant toute modification manuelle de la base SQLite sans détection.

**Formule du Hash d'Intégrité:**
```
SHA256(contractId | contractType | rawJson | status | timestamp)
```

Cela garantit que toute modification manuelle de la base de données peut être détectée.

### Vérification de l'Intégrité

```typescript
const guard = new ContractGuard();

// Vérifier l'intégrité (audit)
const isValid = guard.verifyIntegrityHash(
  contractId,
  contractType,
  rawJson,
  status,
  timestamp,
  expectedHash
);

if (!isValid) {
  console.error('⚠️ Manipulation de la base de données détectée!');
}
```

## 🗂️ Structure du Projet Souverain

```
.
├── data/                           # Données persistantes (Coolify)
│   └── aspace_souverain.db        # Base SQLite souveraine
├── prisma/
│   ├── schema.prisma              # Schéma de base de données
│   └── migrations/                # Fichiers de migration SQL
├── src/
│   ├── generated/
│   │   └── client/                # Client Prisma généré localement (portable)
│   └── lib/
│       └── contract-guard.ts      # Middleware de sécurité (Le Gatekeeper)
├── scripts/
│   └── sync-contracts.ts          # Script pour rejouer les contrats JSON dans DB
├── tests/
│   └── contract-guard.test.ts     # Tests unitaires de validation
├── protocols/                      # Définitions JSON Schema (source de vérité)
│   ├── order.schema.json
│   ├── pulse.schema.json
│   ├── decision.schema.json
│   ├── intent.schema.json
│   └── uplink.schema.json
├── contracts/
│   ├── examples/                  # Exemples de contrats valides
│   └── invalid/                   # Exemples de contrats invalides (tests)
└── logs/                          # Logs d'audit des opérations de sync
```

## 5 Tables de Projection (Read Models)

Cinq tables de projection reflètent les cinq types de contrats:

1. **Order** - Ordres d'exécution de Morty vers Jerry/Summer
2. **Pulse** - Pulse métier hebdomadaire de Summer vers Jerry
3. **Decision** - Décisions Type 4 nécessitant l'approbation A0
4. **Intent** - Intentions stratégiques de A0
5. **Uplink** - Rapports de synthèse hebdomadaires de Jerry vers A0

Chaque table de projection stocke des versions aplaties et interrogeables des contrats JSON. Les tableaux JSON sont stockés en tant que texte, indexés sur les champs clés.

## 🚀 Scripts de Synchronisation

### Rejouer les Contrats JSON

```bash
npm run sync-contracts
# Valide 5 exemples → 5 ACCEPTED, 0 REJECTED
# Produit un log d'audit dans /logs/sync-*.json
# Génère des hashes d'intégrité pour toutes les entrées
```

Le script de synchronisation :
- Découvre tous les fichiers JSON dans `/contracts/examples`
- Valide chaque contrat via ContractGuard
- Écrit dans le ledger Contract + tables de projection
- Produit un log d'audit horodaté

### Réinitialiser la Base de Données

```bash
npm run db:reset
```

### Générer le Client Prisma

```bash
npm run prisma:generate
```

## 🧪 Tests et Validation

```bash
npm test
```

22 tests vérifient:
- Contrats valides acceptés (5/5) avec hashes d'intégrité
- Contrats invalides rejetés (11/11)
- Le ledger enregistre toutes les tentatives avec détection de manipulation
- Les tables de projection sont peuplées correctement
- Fonctionnement offline confirmé

Toute la validation est effectuée par les patterns existants de `validate_contracts.js` - aucune nouvelle dépendance.

## 📊 Garanties du Mycélium

✅ **Indépendance**: Fonctionnement garanti sans connexion au cloud de l'éditeur  
✅ **Souveraineté**: 100% des écritures sont validées par le [Gatekeeper] interne  
✅ **Cohérence**: Structure de données identique pour [Gemini CLI], Jules ou Codex  
✅ **Antifragilité**: Dégradation gracieuse via Mode Air Lock  
✅ **Durabilité**: Ledger immuable avec détection de manipulation  
✅ **Portabilité**: Structure de projet auto-contenue

## 🔧 Dépannage

### Problème: "Client Prisma introuvable"

**Cause**: Client non généré dans le répertoire local.

**Solution**:
```bash
npx prisma generate
```

### Problème: "Impossible de se connecter à la base de données"

**Cause**: Fichier de base de données manquant ou Mode Air Lock activé.

**Solution**:
```bash
# Vérifier le Mode Air Lock
grep ASPACE_AIR_LOCK_MODE .env

# Régénérer la base de données
npm run db:reset
npm run sync-contracts
```

### Problème: "Appels externes détectés"

**Cause**: Variables d'environnement non chargées.

**Solution**:
```bash
# Vérifier que .env existe
cat .env

# S'assurer que les variables sont définies
export PRISMA_TELEMETRY_DISABLED=1
export PRISMA_SKIP_POSTINSTALL_GENERATE=1
```

## 📚 Documentation Complémentaire

- **ZERO_DEPENDENCE.md** - Guide complet de l'architecture antifragile
- **validate_contracts.js** - Validateur JSON Schema sans dépendance
- **prisma/schema.prisma** - Configuration de génération du client local
- **.env** - Variables d'environnement pour souveraineté
- **src/lib/contract-guard.ts** - Implémentation du Mode Air Lock

## 🎯 Métriques de Succès

✅ **Zéro Appel Externe**: Aucun trafic réseau vers les serveurs Prisma  
✅ **Portable**: Le projet fonctionne dans n'importe quel environnement avec Node.js  
✅ **Antifragile**: Dégradation gracieuse lorsque les dépendances échouent  
✅ **Inviolable**: Les hashes d'intégrité détectent les modifications de base de données  
✅ **Auto-Contenu**: Toute la logique de validation est embarquée  
✅ **Offline-First**: Fonctionne sans connectivité Internet  

---

**Statut**: ✨ Architecture Souveraine Opérationnelle  
**La Loi est exécutée. Le Mycélium est stable.** 🌿  
**L'autonomie est garantie. La souveraineté est préservée.** 🏛️
