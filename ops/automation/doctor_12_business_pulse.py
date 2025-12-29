#!/usr/bin/env python3
"""
A'Space OS - 12th Doctor (Business Pulse Diagnostic)
====================================================

Role: A2 - 12th Doctor (Business Pulse)
Supervisor: A1 - Rick (Jules)
Mission: BUSINESS_PULSE_DIAGNOSTIC (Canonical)

This script executes the Mission Spec Tickets (B0-B4) to produce
a rigorous, evidence-based Business Pulse Diagnostic.
"""

import os
import json
import sys
import glob
from pathlib import Path
from typing import Dict, List, Any, Optional
import datetime

# --- Configuration ---
REPORTS_DIR = Path("reports")
KB_DIR = Path("Knowledge Base")
PROTOCOLS_DIR = Path("protocols")

# --- Helper Functions ---

def load_json(filepath: Path) -> Any:
    if filepath.exists():
        try:
            return json.loads(filepath.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return None
    return None

def save_json(filepath: Path, data: Any):
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Generated: {filepath}")

def save_text(filepath: Path, content: str):
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Generated: {filepath}")

def get_tree_snapshot(root_dirs: List[str]) -> Dict[str, List[str]]:
    snapshot = {}
    for root in root_dirs:
        path = Path(root)
        if path.exists():
            files = [str(p.relative_to(path)) for p in path.rglob("*") if p.is_file()]
            snapshot[root] = sorted(files)
        else:
            snapshot[root] = ["MISSING"]
    return snapshot

# --- Ticket B0: Business Preflight Scan ---
def execute_b0():
    print(">>> Executing B0: BUSINESS_PREFLIGHT_SCAN (A3_MONITORING_LOGS)")

    target_folders = [
        "Knowledge Base", "protocols", "ops", "reports", "prisma", "Deployment"
    ]

    snapshot = get_tree_snapshot(target_folders)

    # Evidence checks
    evidence = {
        "repo_tree_snapshot": True,
        "presence_of_ops_reports": any("report" in f for f in snapshot.get("reports", [])),
        "presence_of_protocols_or_sops": (
            len(snapshot.get("protocols", [])) > 0 or
            any("SOP" in f for f in snapshot.get("Knowledge Base", []))
        )
    }

    output = {
        "ticket": "B0",
        "timestamp": datetime.datetime.now().isoformat(),
        "evidence": evidence,
        "snapshot": snapshot
    }

    save_json(REPORTS_DIR / "business_pulse_preflight.json", output)

# --- Ticket B1: SOP Structure Audit ---
def execute_b1():
    print(">>> Executing B1: SOP_STRUCTURE_AUDIT (A3_SOP_AUDIT)")

    sops = []
    if KB_DIR.exists():
        for path in KB_DIR.rglob("*SOP*.md"):
            try:
                content = path.read_text(encoding="utf-8")
                sops.append({
                    "path": str(path),
                    "filename": path.name,
                    "has_owner": "**Propriétaire :**" in content or "**Owner:**" in content,
                    "has_who_not_how": "Who Not How" in content or "WHO NOT HOW" in content,
                    "sections": [l.strip() for l in content.splitlines() if l.startswith("## ")]
                })
            except Exception:
                pass

    # Reference Patterns
    patterns = {
        "revenue_for_life": any("REVENUE_FOR_LIFE" in s["filename"] for s in sops),
        "who_not_how": any("WHO_NOT_HOW" in s["filename"] for s in sops)
    }

    gaps = []
    for sop in sops:
        if not sop["has_owner"]:
            gaps.append(f"Missing Owner in {sop['filename']}")

    output = {
        "ticket": "B1",
        "timestamp": datetime.datetime.now().isoformat(),
        "sop_count": len(sops),
        "patterns_confirmed": patterns,
        "sops": sops,
        "gaps": gaps
    }

    save_json(REPORTS_DIR / "business_pulse_sop_audit.json", output)

# --- Ticket B2: Value Flow Extraction ---
def execute_b2():
    print(">>> Executing B2: VALUE_FLOW_EXTRACTION (A3_MÉTIER_PUR)")

    # Infer from Protocols
    protocols = {}
    if PROTOCOLS_DIR.exists():
        for p in PROTOCOLS_DIR.glob("*.schema.json"):
            try:
                data = json.loads(p.read_text(encoding="utf-8"))
                protocols[p.stem] = {
                    "valid_json": True,
                    "description": data.get("description", "No description")
                }
            except:
                protocols[p.stem] = {"valid_json": False}

    # Infer from Contracts (Mock/Example)
    contracts_dir = Path("contracts")
    value_units = []
    if contracts_dir.exists():
        for p in contracts_dir.glob("*.example.json"):
             value_units.append(p.name)

    # Bottlenecks (Static Analysis based on previous knowledge + scanning)
    bottlenecks = []
    if not Path(".env").exists():
        bottlenecks.append({
            "id": "MISSING_ENV",
            "impact": "No Google Workspace credentials",
            "evidence": "File .env not found"
        })

    output = {
        "ticket": "B2",
        "timestamp": datetime.datetime.now().isoformat(),
        "protocols": protocols,
        "identified_value_units": value_units,
        "bottlenecks": bottlenecks,
        "flow_inference": "Order -> Decision -> Pulse (implied by schema existence)"
    }

    save_json(REPORTS_DIR / "business_pulse_value_flow.json", output)

# --- Ticket B3: Doctor 12 Diagnostic ---
def execute_b3():
    print(">>> Executing B3: DOCTOR_12_DIAGNOSTIC (A2_DOCTOR_12)")

    # Load previous steps
    b0 = load_json(REPORTS_DIR / "business_pulse_preflight.json")
    b1 = load_json(REPORTS_DIR / "business_pulse_sop_audit.json")
    b2 = load_json(REPORTS_DIR / "business_pulse_value_flow.json")

    if not (b0 and b1 and b2):
        print("Error: B0, B1, or B2 missing. Run them first.")
        return

    # Readiness Score Calculation
    score = 0
    max_score = 10

    # Criteria
    if b0["evidence"]["repo_tree_snapshot"]: score += 2
    if b1["sop_count"] >= 5: score += 2
    if b1["patterns_confirmed"]["revenue_for_life"]: score += 2
    if "order" in b2["protocols"] and "pulse" in b2["protocols"]: score += 2
    if not b2["bottlenecks"]: score += 2 # Deduct if bottlenecks exist? Or bonus if none.

    readiness_level = "LOW"
    if score >= 8: readiness_level = "HIGH"
    elif score >= 5: readiness_level = "MEDIUM"

    output = {
        "ticket": "B3",
        "timestamp": datetime.datetime.now().isoformat(),
        "readiness_score": f"{score}/{max_score}",
        "readiness_level": readiness_level,
        "risk_map": {
            "operational": "MEDIUM" if b2["bottlenecks"] else "LOW",
            "structural": "LOW" if b1["sop_count"] > 0 else "HIGH"
        },
        "recommendations": [
            "Resolve Missing .env/Credentials" if b2["bottlenecks"] else None,
            "Formalize more SOPs" if b1["sop_count"] < 5 else None
        ]
    }
    # Clean None
    output["recommendations"] = [r for r in output["recommendations"] if r]

    save_json(REPORTS_DIR / "business_pulse_doctor_12_findings.json", output)

# --- Ticket B4: Consolidate & Brief A0 ---
def execute_b4():
    print(">>> Executing B4: CONSOLIDATE_AND_BRIEF_A0 (A3_REPORTING)")

    b0 = load_json(REPORTS_DIR / "business_pulse_preflight.json")
    b1 = load_json(REPORTS_DIR / "business_pulse_sop_audit.json")
    b2 = load_json(REPORTS_DIR / "business_pulse_value_flow.json")
    b3 = load_json(REPORTS_DIR / "business_pulse_doctor_12_findings.json")

    if not (b0 and b1 and b2 and b3):
        print("Error: Missing prior reports.")
        return

    # 1. Final JSON Report
    final_report = {
        "meta": {
            "mission": "BUSINESS_PULSE_DIAGNOSTIC",
            "generated_at": datetime.datetime.now().isoformat(),
            "supervisor": "A1_RICK_JULES"
        },
        "executive_status": {
            "readiness": b3["readiness_level"],
            "score": b3["readiness_score"],
            "risks": b3["risk_map"]
        },
        "details": {
            "sop_coverage": f"{b1['sop_count']} SOPs found",
            "protocols": list(b2["protocols"].keys()),
            "bottlenecks": [b["id"] for b in b2["bottlenecks"]]
        }
    }
    save_json(REPORTS_DIR / "business_pulse_diagnostic.json", final_report)

    # 2. Evidence Index
    evidence_index = {
        "B0_PREFLIGHT": "reports/business_pulse_preflight.json",
        "B1_SOP_AUDIT": "reports/business_pulse_sop_audit.json",
        "B2_VALUE_FLOW": "reports/business_pulse_value_flow.json",
        "B3_FINDINGS": "reports/business_pulse_doctor_12_findings.json",
        "ARTIFACTS": {
            "sops": [s["path"] for s in b1["sops"]],
            "protocols": [f"protocols/{k}.schema.json" for k in b2["protocols"].keys()]
        }
    }
    save_json(REPORTS_DIR / "business_pulse_evidence_index.json", evidence_index)

    # 3. Executive Summary MD
    md_content = f"""# 📊 Business Pulse Diagnostic (Executive Summary)

**Date:** {datetime.datetime.now().strftime('%Y-%m-%d')}
**Supervisor:** A1 Rick (Jules)
**Executor:** A2 Doctor 12 & Companions

## 🎯 Verdict: {b3['readiness_level']} ({b3['readiness_score']})

The Business Pulse system is **{b3['readiness_level']}**.

### 🛑 Critical Bottlenecks
{chr(10).join(['- ' + b['impact'] for b in b2['bottlenecks']]) if b2['bottlenecks'] else "None identified."}

### 🧬 SOP Health
- **Total SOPs:** {b1['sop_count']}
- **Core Patterns:**
  - Revenue for Life: {"✅" if b1['patterns_confirmed']['revenue_for_life'] else "❌"}
  - Who Not How: {"✅" if b1['patterns_confirmed']['who_not_how'] else "❌"}

### 📉 Risk Assessment
- **Operational Risk:** {b3['risk_map']['operational']}
- **Structural Risk:** {b3['risk_map']['structural']}

### 📝 Recommendations
{chr(10).join(['- ' + r for r in b3['recommendations']]) if b3['recommendations'] else "Proceed to next phase."}

---
*Evidence Index available in `reports/business_pulse_evidence_index.json`*
"""
    save_text(REPORTS_DIR / "business_pulse_exec_summary.md", md_content)


def main():
    if len(sys.argv) < 2:
        print("Usage: python doctor_12_business_pulse.py [B0|B1|B2|B3|B4|ALL]")
        sys.exit(1)

    cmd = sys.argv[1].upper()

    if cmd == "B0" or cmd == "ALL": execute_b0()
    if cmd == "B1" or cmd == "ALL": execute_b1()
    if cmd == "B2" or cmd == "ALL": execute_b2()
    if cmd == "B3" or cmd == "ALL": execute_b3()
    if cmd == "B4" or cmd == "ALL": execute_b4()

if __name__ == "__main__":
    main()
