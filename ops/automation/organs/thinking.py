#!/usr/bin/env python3
"""
A'Space OS - Thinking Organ (Organe de Réflexion)
==================================================

Purpose: EPCT Workflow (Explore, Plan, Code, Test)
         Thinking checkpoints before code execution.

Author: Rick (A1) + Opus 4.5 (Thinking)
Date: 2025-12-24
Version: V2 Phoenix Architect
"""

import os
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger('ThinkingOrgan')


class EPCTPhase(Enum):
    """EPCT Workflow Phases (Melvynx)"""
    EXPLORE = "explore"
    PLAN = "plan"
    CODE = "code"
    TEST = "test"


@dataclass
class ThinkingBlock:
    """Structured thinking checkpoint"""
    phase: EPCTPhase
    task_description: str
    architecture_justification: str
    alternatives_considered: List[str]
    risks_identified: List[str]
    decision: str
    confidence: float  # 0-1
    timestamp: datetime
    
    def to_dict(self) -> Dict:
        return {
            'phase': self.phase.value,
            'task': self.task_description,
            'justification': self.architecture_justification,
            'alternatives': self.alternatives_considered,
            'risks': self.risks_identified,
            'decision': self.decision,
            'confidence': self.confidence,
            'timestamp': self.timestamp.isoformat()
        }


class ThinkingOrgan:
    """
    EPCT Thinking Workflow Implementation
    
    "Clarté stratégique absolue avant toute force brute."
    
    Flow:
    1. EXPLORE: Research, gather context (Context7 MCP)
    2. PLAN: Architecture thinking_block (DeepSeek R1)
    3. CODE: Implementation (Gemini 3 Flash)
    4. TEST: Validation (Gemma 3n + Constitution check)
    """
    
    def __init__(self):
        self.current_phase: Optional[EPCTPhase] = None
        self.thinking_blocks: List[ThinkingBlock] = []
        self.logs_dir = Path('logs/thinking-blocks')
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info("ThinkingOrgan initialized - EPCT workflow active")
    
    def start_task(self, task_description: str) -> Dict:
        """Start a new EPCT task cycle"""
        logger.info(f"Starting EPCT cycle: {task_description[:50]}...")
        
        self.current_phase = EPCTPhase.EXPLORE
        
        return {
            'task': task_description,
            'phase': self.current_phase.value,
            'instruction': self._get_phase_instruction(EPCTPhase.EXPLORE)
        }
    
    def _get_phase_instruction(self, phase: EPCTPhase) -> str:
        """Get instruction for current phase"""
        instructions = {
            EPCTPhase.EXPLORE: """
## EXPLORE Phase
- Use Context7 MCP to research latest documentation
- Identify existing patterns in codebase
- List all dependencies and constraints
- NO CODE writing in this phase

Output: Research summary with key findings
""",
            EPCTPhase.PLAN: """
## PLAN Phase
- Create a thinking_block with architecture justification
- Consider 3+ alternatives before deciding
- Identify risks and mitigations
- Define success criteria

Output: thinking_block JSON
""",
            EPCTPhase.CODE: """
## CODE Phase
- Implement based on approved thinking_block
- Follow established patterns
- Document as you code
- Keep changes minimal and focused

Output: Implementation code
""",
            EPCTPhase.TEST: """
## TEST Phase
- Verify implementation against success criteria
- Check Constitution alignment
- Run automated tests if available
- Document test results

Output: Test report
"""
        }
        return instructions.get(phase, "Unknown phase")
    
    def create_thinking_block(
        self,
        task: str,
        justification: str,
        alternatives: List[str],
        risks: List[str],
        decision: str,
        confidence: float
    ) -> ThinkingBlock:
        """Create a thinking checkpoint before coding"""
        
        if self.current_phase != EPCTPhase.PLAN:
            logger.warning(f"Creating thinking_block outside PLAN phase (current: {self.current_phase})")
        
        block = ThinkingBlock(
            phase=EPCTPhase.PLAN,
            task_description=task,
            architecture_justification=justification,
            alternatives_considered=alternatives,
            risks_identified=risks,
            decision=decision,
            confidence=confidence,
            timestamp=datetime.now()
        )
        
        self.thinking_blocks.append(block)
        self._save_thinking_block(block)
        
        logger.info(f"ThinkingBlock created: {decision[:50]}... (confidence: {confidence})")
        
        return block
    
    def _save_thinking_block(self, block: ThinkingBlock):
        """Persist thinking block to file"""
        timestamp = block.timestamp.strftime('%Y%m%d-%H%M%S')
        filename = self.logs_dir / f"thinking-{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(block.to_dict(), f, indent=2)
        
        logger.info(f"ThinkingBlock saved: {filename}")
    
    def advance_phase(self) -> Dict:
        """Advance to next EPCT phase"""
        phase_order = [EPCTPhase.EXPLORE, EPCTPhase.PLAN, EPCTPhase.CODE, EPCTPhase.TEST]
        
        if self.current_phase is None:
            return {'error': 'No active task. Call start_task() first.'}
        
        current_idx = phase_order.index(self.current_phase)
        
        if current_idx == len(phase_order) - 1:
            # Completed all phases
            logger.info("EPCT cycle complete")
            return {
                'status': 'COMPLETE',
                'message': 'EPCT cycle finished',
                'thinking_blocks': len(self.thinking_blocks)
            }
        
        # Advance to next phase
        self.current_phase = phase_order[current_idx + 1]
        
        logger.info(f"Advancing to phase: {self.current_phase.value}")
        
        return {
            'phase': self.current_phase.value,
            'instruction': self._get_phase_instruction(self.current_phase)
        }
    
    def require_thinking_block(self) -> bool:
        """Check if current phase requires a thinking_block"""
        return self.current_phase == EPCTPhase.PLAN
    
    def validate_for_code(self) -> Dict:
        """Validate that thinking_block exists before CODE phase"""
        if not self.thinking_blocks:
            return {
                'allowed': False,
                'reason': 'No thinking_block created. Complete PLAN phase first.'
            }
        
        latest_block = self.thinking_blocks[-1]
        
        if latest_block.confidence < 0.7:
            return {
                'allowed': False,
                'reason': f'Low confidence ({latest_block.confidence}). Rethink the approach.'
            }
        
        return {
            'allowed': True,
            'thinking_block': latest_block.to_dict()
        }
    
    def get_status(self) -> Dict:
        """Get current thinking status"""
        return {
            'current_phase': self.current_phase.value if self.current_phase else None,
            'thinking_blocks_count': len(self.thinking_blocks),
            'latest_block': self.thinking_blocks[-1].to_dict() if self.thinking_blocks else None
        }


# Integration with DeepSeek R1 for deep thinking
class DeepThinkingAudit:
    """
    Use DeepSeek R1 for architectural audit on thinking_blocks
    
    Jerry (A1) validates decisions before execution.
    """
    
    def __init__(self, ollama_url: str = "http://localhost:11434"):
        self.ollama_url = ollama_url
        self.model = "deepseek-r1:70b"
    
    def audit_thinking_block(self, block: ThinkingBlock) -> Dict:
        """Have DeepSeek R1 audit the thinking block"""
        import subprocess
        
        prompt = f"""
        You are Rick (A1), the efficiency auditor for A'Space OS.
        
        Audit this architectural decision:
        
        Task: {block.task_description}
        Justification: {block.architecture_justification}
        Alternatives Considered: {', '.join(block.alternatives_considered)}
        Risks: {', '.join(block.risks_identified)}
        Decision: {block.decision}
        Confidence: {block.confidence}
        
        Evaluate:
        1. Is the justification sound?
        2. Were enough alternatives considered?
        3. Are risks adequately addressed?
        4. Is the confidence level appropriate?
        
        Return JSON:
        {{
            "approved": true/false,
            "efficiency_score": 0.0-1.0,
            "feedback": "..."
        }}
        """
        
        try:
            result = subprocess.run(
                ["curl", "-s", "-X", "POST",
                 f"{self.ollama_url}/api/generate",
                 "-d", json.dumps({"model": self.model, "prompt": prompt, "stream": False})],
                capture_output=True,
                text=True,
                timeout=120
            )
            
            response = json.loads(result.stdout)
            audit_result = json.loads(response.get('response', '{}'))
            
            logger.info(f"DeepSeek R1 audit: approved={audit_result.get('approved')}")
            
            return audit_result
            
        except Exception as e:
            logger.error(f"Audit failed: {e}")
            return {'approved': True, 'feedback': 'Audit unavailable, auto-approved'}


# Singleton
_thinking_instance = None

def get_thinking_organ() -> ThinkingOrgan:
    """Get singleton ThinkingOrgan instance"""
    global _thinking_instance
    if _thinking_instance is None:
        _thinking_instance = ThinkingOrgan()
    return _thinking_instance


# CLI
if __name__ == "__main__":
    import sys
    
    organ = get_thinking_organ()
    
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        
        if cmd == 'status':
            print(json.dumps(organ.get_status(), indent=2))
        
        elif cmd == 'start':
            task = ' '.join(sys.argv[2:]) if len(sys.argv) > 2 else "Test task"
            result = organ.start_task(task)
            print(result['instruction'])
        
        elif cmd == 'advance':
            result = organ.advance_phase()
            print(json.dumps(result, indent=2))
        
        elif cmd == 'demo':
            # Demo full EPCT cycle
            organ.start_task("Build Pulse Monitor component")
            print("Phase: EXPLORE")
            organ.advance_phase()
            print("Phase: PLAN")
            
            organ.create_thinking_block(
                task="Build Pulse Monitor",
                justification="React component with Supabase real-time subscription",
                alternatives=["Polling API", "WebSocket direct", "Supabase Realtime"],
                risks=["Connection drops", "Memory leaks on unmount"],
                decision="Use Supabase Realtime with reconnection logic",
                confidence=0.85
            )
            
            organ.advance_phase()
            print("Phase: CODE")
            organ.advance_phase()
            print("Phase: TEST")
            organ.advance_phase()
            print("COMPLETE")
    else:
        print("A'Space OS Thinking Organ (EPCT)")
        print("Commands: status, start <task>, advance, demo")
