import requests
import json
import os
from datetime import datetime
from typing import Optional

# Configuration
N8N_WEBHOOK_URL = os.getenv('N8N_WEBHOOK_URL', 'http://localhost:5678/webhook/test')

class HumanBridge:
    """
    Le Pont de Commandement : Relie l'IA à l'Architecte via Google Chat.
    (Module léger pour validation rapide avant commit)
    """
    
    @staticmethod
    def send_decision_card(agent_name: str, task_desc: str, cost_estimate: float) -> bool:
        """Envoie une carte de décision"""
        payload = {
            "agent": agent_name,
            "task": task_desc,
            "cost": cost_estimate,
            "type": "DECISION_REQUIRED",
            "timestamp": datetime.now().isoformat()
        }
        
        print(f"🌉 Bridge: Sending card for {agent_name}...")
        
        try:
            # Envoi vers n8n pour formatage Google Chat Card
            response = requests.post(N8N_WEBHOOK_URL, json=payload, timeout=5)
            
            if response.status_code == 200:
                print("✅ Bridge: Success")
                return True
            else:
                print(f"⚠️ Bridge Error: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            print(f"⚠️ Erreur de Pont : Sauvegarde en local. {e}")
            HumanBridge._save_local(payload)
            return False

    @staticmethod
    def _save_local(payload: dict):
        """Sauvegarde locale en cas d'échec réseau (Antifragilité)"""
        try:
            with open('logs/human_bridge_backlog.json', 'a') as f:
                f.write(json.dumps(payload) + "\n")
            print("💾 Saved to local bridge backlog")
        except Exception as e:
            print(f"❌ Critical Bridge Failure: {e}")

# Instance pour Jerry
jerry_bridge = HumanBridge()

if __name__ == "__main__":
    # Test simple
    jerry_bridge.send_decision_card("Jerry", "Test Bridge", 0.0)
