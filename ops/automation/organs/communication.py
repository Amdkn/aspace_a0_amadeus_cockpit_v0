#!/usr/bin/env python3
"""
A'Space OS - Communication Organ (Pont de Commandement)
=========================================================

Purpose: Human-in-the-Loop via Google Chat decision cards.
         Routes to appropriate spaces: Air Lock, Situation Room, Daily Pulse.

Author: Jerry (A1) + Robin (A'0)
Date: 2025-12-24
Version: V2 Phoenix Architect
"""

import os
import json
import requests
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger('CommunicationOrgan')


class ChatSpace(Enum):
    """Google Chat Spaces for A'Space OS"""
    AIR_LOCK = "air_lock"           # 🔴 Urgences, blocages, budgets (Jerry)
    SITUATION_ROOM = "situation_room"  # 🟡 Validations stratégiques (Rick, Robin)
    DAILY_PULSE = "daily_pulse"     # 🟢 Logs, rituels, succès (Codex, Jules)


class DecisionPriority(Enum):
    """Decision priority levels"""
    CRITICAL = "critical"  # Immediate attention required
    HIGH = "high"          # Within 1 hour
    NORMAL = "normal"      # Within 24 hours
    LOW = "low"            # Informational


@dataclass
class DecisionCard:
    """Google Chat decision card structure"""
    card_id: str
    title: str
    subtitle: str
    agent: str
    project: str
    action: str
    cost: Optional[float]
    risk_level: str
    options: List[Dict[str, str]]  # [{"text": "APPROVE", "action": "approve_xxx"}, ...]
    space: ChatSpace
    priority: DecisionPriority
    
    def to_google_chat_json(self) -> Dict:
        """Convert to Google Chat Cards V2 format"""
        # Icon based on priority
        icons = {
            DecisionPriority.CRITICAL: "https://img.icons8.com/color/48/error.png",
            DecisionPriority.HIGH: "https://img.icons8.com/color/48/lock.png",
            DecisionPriority.NORMAL: "https://img.icons8.com/color/48/question-mark.png",
            DecisionPriority.LOW: "https://img.icons8.com/color/48/info.png"
        }
        
        # Build description text
        description_parts = [f"<b>Projet :</b> {self.project}"]
        description_parts.append(f"<b>Action :</b> {self.action}")
        if self.cost:
            description_parts.append(f"<b>Coût estimé :</b> {self.cost:.2f}€")
        description_parts.append(f"<b>Risque :</b> {self.risk_level}")
        description_text = "<br>".join(description_parts)
        
        # Build buttons
        buttons = []
        for option in self.options:
            buttons.append({
                "text": option["text"],
                "onClick": {
                    "action": {
                        "actionMethodName": option["action"]
                    }
                }
            })
        
        return {
            "cardsV2": [
                {
                    "cardId": self.card_id,
                    "card": {
                        "header": {
                            "title": self.title,
                            "subtitle": f"Agent : {self.agent}",
                            "imageUrl": icons.get(self.priority, icons[DecisionPriority.NORMAL])
                        },
                        "sections": [
                            {
                                "widgets": [
                                    {"textParagraph": {"text": description_text}},
                                    {"buttonList": {"buttons": buttons}}
                                ]
                            }
                        ]
                    }
                }
            ]
        }


class HumanInTheLoopRules:
    """
    Les 3 Règles d'Or Human-in-the-Loop
    
    1. L'Autonomie d'Abord: <0.50€ + Low risk = auto-execute + log
    2. Le Seuil de Jerry: Budget dépassé ou Critique = Air Lock + block
    3. Le Paradoxe de l'Architecte: New project = 3 options in Situation Room
    """
    
    @staticmethod
    def should_auto_execute(cost: float, risk_level: str) -> bool:
        """Rule 1: L'Autonomie d'Abord"""
        return cost < 0.50 and risk_level.lower() == "low"
    
    @staticmethod
    def requires_jerry_approval(cost: float, weekly_budget: float, 
                                 is_critical: bool) -> bool:
        """Rule 2: Le Seuil de Jerry"""
        return cost > weekly_budget or is_critical
    
    @staticmethod
    def requires_architecture_review(is_new_project: bool) -> bool:
        """Rule 3: Le Paradoxe de l'Architecte"""
        return is_new_project


class CommunicationOrgan:
    """
    Pont de Commandement - Google Chat Integration
    
    Routes decisions to appropriate spaces via n8n webhook.
    """
    
    def __init__(self, n8n_webhook_url: Optional[str] = None):
        self.n8n_url = n8n_webhook_url or os.getenv('N8N_WEBHOOK_URL')
        self.rules = HumanInTheLoopRules()
        self.pending_decisions: Dict[str, DecisionCard] = {}
        self.logs_dir = Path('logs/communication')
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info("CommunicationOrgan initialized")
    
    def send_decision_card(self, card: DecisionCard) -> bool:
        """Send decision card to Google Chat via n8n"""
        logger.info(f"Sending card to {card.space.value}: {card.title}")
        
        # Store pending decision
        self.pending_decisions[card.card_id] = card
        
        # Prepare payload for n8n
        payload = {
            "space": card.space.value,
            "priority": card.priority.value,
            "card": card.to_google_chat_json(),
            "metadata": {
                "card_id": card.card_id,
                "timestamp": datetime.now().isoformat(),
                "agent": card.agent
            }
        }
        
        # Log the card
        self._log_card(card, "SENT")
        
        # Send to n8n webhook
        if self.n8n_url:
            try:
                response = requests.post(
                    self.n8n_url,
                    json=payload,
                    timeout=5  # Fail fast
                )
                
                if response.status_code == 200:
                    logger.info(f"Card sent successfully: {card.card_id}")
                    return True
                else:
                    logger.error(f"Failed to send card: {response.status_code}")
                    self._save_to_backlog(card)
                    return False
                    
            except Exception as e:
                logger.error(f"n8n webhook failed: {e}")
                # Fallback: save to backlog for resilience
                self._save_to_backlog(card)
                return False
        else:
            logger.warning("n8n URL not configured - saving to backlog")
            self._save_to_backlog(card)
            return True
    
    def _save_to_backlog(self, card: DecisionCard):
        """Save card to local backlog (Antifragility Pillar 3)"""
        backlog_file = Path('logs/communication/backlog.json')
        backlog_file.parent.mkdir(parents=True, exist_ok=True)
        
        entry = {
            "timestamp": datetime.now().isoformat(),
            "card_id": card.card_id,
            "payload": card.to_google_chat_json(),
            "retry_count": 0
        }
        
        backlog = []
        if backlog_file.exists():
            try:
                with open(backlog_file, 'r') as f:
                    backlog = json.load(f)
            except json.JSONDecodeError:
                pass
        
        backlog.append(entry)
        
        with open(backlog_file, 'w') as f:
            json.dump(backlog, f, indent=2)
            
        logger.info(f"💾 Saved to backlog: {card.card_id}")
    
    def _log_card(self, card: DecisionCard, status: str):
        """Log card to file"""
        log_entry = {
            "status": status,
            "timestamp": datetime.now().isoformat(),
            "card_id": card.card_id,
            "space": card.space.value,
            "title": card.title,
            "agent": card.agent,
            "priority": card.priority.value
        }
        
        log_file = self.logs_dir / f"cards-{datetime.now().strftime('%Y-%m-%d')}.json"
        
        logs = []
        if log_file.exists():
            with open(log_file, 'r') as f:
                logs = json.load(f)
        
        logs.append(log_entry)
        
        with open(log_file, 'w') as f:
            json.dump(logs, f, indent=2)
    
    def handle_response(self, card_id: str, action: str) -> Dict:
        """Handle response from Google Chat button click"""
        card = self.pending_decisions.get(card_id)
        
        if not card:
            return {"error": f"Unknown card: {card_id}"}
        
        logger.info(f"Response received: {card_id} -> {action}")
        
        # Log the response
        self._log_response(card_id, action)
        
        # Remove from pending
        del self.pending_decisions[card_id]
        
        # Determine result
        is_approved = action.startswith("approve") or action == "go"
        
        return {
            "card_id": card_id,
            "action": action,
            "approved": is_approved,
            "timestamp": datetime.now().isoformat()
        }
    
    def _log_response(self, card_id: str, action: str):
        """Log response to file"""
        log_file = self.logs_dir / f"responses-{datetime.now().strftime('%Y-%m-%d')}.json"
        
        logs = []
        if log_file.exists():
            with open(log_file, 'r') as f:
                logs = json.load(f)
        
        logs.append({
            "card_id": card_id,
            "action": action,
            "timestamp": datetime.now().isoformat()
        })
        
        with open(log_file, 'w') as f:
            json.dump(logs, f, indent=2)
    
    # Convenience methods for common card types
    
    def send_jerry_budget_alert(
        self,
        project: str,
        action: str,
        cost: float,
        current_budget: float
    ) -> bool:
        """Jerry sends budget alert to Air Lock"""
        card = DecisionCard(
            card_id=f"jerry_budget_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            title="A1-AUDIT : Validation de Budget",
            subtitle="Air Lock activé",
            agent="Jerry",
            project=project,
            action=action,
            cost=cost,
            risk_level="HIGH" if cost > current_budget else "MEDIUM",
            options=[
                {"text": "APPROUVER (GO)", "action": "approve_budget"},
                {"text": "REVOIR (NO-GO)", "action": "reject_budget"}
            ],
            space=ChatSpace.AIR_LOCK,
            priority=DecisionPriority.CRITICAL if cost > current_budget * 1.5 else DecisionPriority.HIGH
        )
        
        return self.send_decision_card(card)
    
    def send_robin_architecture_choice(
        self,
        project: str,
        options: List[Dict[str, str]]  # [{"name": "Option A", "description": "..."}]
    ) -> bool:
        """Robin sends architecture choice to Situation Room"""
        # Build button options
        button_options = []
        for i, opt in enumerate(options[:3], 1):  # Max 3 options
            button_options.append({
                "text": f"Option {i}: {opt['name']}",
                "action": f"choose_option_{i}"
            })
        
        card = DecisionCard(
            card_id=f"robin_arch_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            title="Le Paradoxe de l'Architecte",
            subtitle="Choix d'architecture requis",
            agent="Robin",
            project=project,
            action="Définir l'architecture du projet",
            cost=None,
            risk_level="STRATEGIC",
            options=button_options,
            space=ChatSpace.SITUATION_ROOM,
            priority=DecisionPriority.HIGH
        )
        
        return self.send_decision_card(card)
    
    def send_daily_pulse_success(
        self,
        project: str,
        action: str,
        agent: str
    ) -> bool:
        """Send success log to Daily Pulse (no approval needed)"""
        card = DecisionCard(
            card_id=f"pulse_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            title="✅ Exécution Réussie",
            subtitle="Log automatique",
            agent=agent,
            project=project,
            action=action,
            cost=None,
            risk_level="LOW",
            options=[{"text": "Voir détails", "action": "view_details"}],
            space=ChatSpace.DAILY_PULSE,
            priority=DecisionPriority.LOW
        )
        
        return self.send_decision_card(card)
    
    def evaluate_and_route(
        self,
        project: str,
        action: str,
        cost: float,
        risk_level: str,
        agent: str,
        weekly_budget: float = 50.0,
        is_new_project: bool = False
    ) -> Dict:
        """
        Apply the 3 Golden Rules and route appropriately
        
        Returns: {"auto_execute": bool, "space": str, "card_sent": bool}
        """
        # Rule 1: L'Autonomie d'Abord
        if self.rules.should_auto_execute(cost, risk_level):
            logger.info(f"Auto-executing: {action} (cost: {cost}, risk: {risk_level})")
            self.send_daily_pulse_success(project, action, agent)
            return {"auto_execute": True, "space": "daily_pulse", "card_sent": True}
        
        # Rule 2: Le Seuil de Jerry
        is_critical = risk_level.lower() == "critical"
        if self.rules.requires_jerry_approval(cost, weekly_budget, is_critical):
            logger.info(f"Jerry approval required: {action}")
            self.send_jerry_budget_alert(project, action, cost, weekly_budget)
            return {"auto_execute": False, "space": "air_lock", "card_sent": True}
        
        # Rule 3: Le Paradoxe de l'Architecte
        if self.rules.requires_architecture_review(is_new_project):
            logger.info(f"Architecture review required: {project}")
            # This needs options to be provided separately
            return {"auto_execute": False, "space": "situation_room", "card_sent": False,
                    "requires": "architecture_options"}
        
        # Default: Normal approval in Situation Room
        card = DecisionCard(
            card_id=f"approval_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            title=f"Approbation requise : {action[:30]}",
            subtitle="Validation standard",
            agent=agent,
            project=project,
            action=action,
            cost=cost,
            risk_level=risk_level,
            options=[
                {"text": "APPROUVER", "action": "approve"},
                {"text": "REJETER", "action": "reject"}
            ],
            space=ChatSpace.SITUATION_ROOM,
            priority=DecisionPriority.NORMAL
        )
        self.send_decision_card(card)
        
        return {"auto_execute": False, "space": "situation_room", "card_sent": True}


# Singleton
_comm_instance = None

def get_communication_organ() -> CommunicationOrgan:
    """Get singleton CommunicationOrgan instance"""
    global _comm_instance
    if _comm_instance is None:
        _comm_instance = CommunicationOrgan()
    return _comm_instance


# CLI
if __name__ == "__main__":
    import sys
    
    organ = get_communication_organ()
    
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        
        if cmd == 'test-jerry':
            # Test Jerry budget alert
            organ.send_jerry_budget_alert(
                project="Phoenix V2",
                action="Déploiement VPS Hostinger",
                cost=12.00,
                current_budget=50.00
            )
            print("Jerry alert sent (check logs)")
        
        elif cmd == 'test-robin':
            # Test Robin architecture choice
            organ.send_robin_architecture_choice(
                project="Licorne #1",
                options=[
                    {"name": "Microservices", "description": "Architecture distribuée"},
                    {"name": "Monolithe", "description": "Architecture simple"},
                    {"name": "Serverless", "description": "Architecture cloud-native"}
                ]
            )
            print("Robin card sent (check logs)")
        
        elif cmd == 'test-pulse':
            # Test Daily Pulse success
            organ.send_daily_pulse_success(
                project="A'Space OS",
                action="GitHub sync completed",
                agent="Codex"
            )
            print("Pulse log sent (check logs)")
        
        elif cmd == 'evaluate':
            # Test full evaluation
            result = organ.evaluate_and_route(
                project="Test Project",
                action="Deploy to production",
                cost=0.30,  # Low cost
                risk_level="low",  # Low risk
                agent="Codex"
            )
            print(f"Result: {json.dumps(result, indent=2)}")
        
        else:
            print("Commands: test-jerry, test-robin, test-pulse, evaluate")
    else:
        print("A'Space OS Communication Organ (Pont de Commandement)")
        print("Commands: test-jerry, test-robin, test-pulse, evaluate")
