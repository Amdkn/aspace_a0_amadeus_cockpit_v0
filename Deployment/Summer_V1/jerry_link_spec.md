# 📡 PROTOCOLE DE LIAISON : SUMMER-TO-JERRY

**Propriétaire :** Jerry (Audit) & Morty (Execution)
**Format :** JSON over HTTPS (POST)
**Fréquence :** Asynchrone (Event-based) ou Heartbeat (Hourly)

## I. Philosophie du Signal
Ce protocole assure que Morty reçoit l'information vitale sans être noyé dans le bruit.
* **Signal Vert (Nominal) :** Archivage silencieux.
* **Signal Orange (Tactique) :** Intervention Ops requise.
* **Signal Rouge (Stratégique) :** Escalade immédiate à Beth.

## II. Structure du Payload (JSON)

Toute communication sortante d'une instance Summer doit respecter ce schéma strict :

```json
{
  "timestamp": "2025-12-22T20:48:27Z",
  "agent_id": "summer-v1-{unique_id}",
  "project_scope": "PARA_AREA_01", // Code projet associé
  "pillar_context": "FINANCE",      // GROWTH, PRODUCT, OPS, FINANCE, PEOPLE, IT, LEGAL
  
  // NIVEAU D'ALERTE (Morty Filter)
  // NOMINAL = Info pure, KPIs atteints.
  // WARN = Déviation mineure, besoin de ressources.
  // CRITICAL = Blocage bloquant, risque systémique.
  "status_level": "NOMINAL", 

  "payload": {
    "summary": "Monthly burn rate calculated: 20%",
    "kpis": {
      "metric_name": "burn_rate",
      "value": 20.0,
      "unit": "percent",
      "threshold": 30.0
    },
    // Détails optionnels pour audit (logs bruts)
    "details": "Server costs stable. SaaS subscriptions optimized."
  },

  // BIOMIMETIC HEALTH CHECK (Pour Auto-Containment)
  "resource_usage": {
    "cpu_load_percent": 12,
    "memory_mb": 350,
    "uptime_seconds": 3600
  }
}
```

## III. Endpoint de Réception (Supabase)

Les logs sont ingérés directement dans la table `system_logs` via l'API Supabase.

* **Target Table :** `system_logs`
* **Auth :** Service Role Key (injectée via variable d'environnement `SUPABASE_SERVICE_KEY`)

---
**Note d'Implémentation :**
Le module `conductor.main` doit implémenter un `JerryHandler` qui formate automatiquement les logs système en ce format JSON avant envoi.
