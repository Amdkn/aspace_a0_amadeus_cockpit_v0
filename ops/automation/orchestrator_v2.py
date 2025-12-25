#!/usr/bin/env python3
"""
A'Space OS - Orchestrator V2 (Phoenix Architect)
=================================================

Evolution from V1 (Manual) to V2 (Autonomous Management)

Organs:
- Communication: Google Workspace MCP (Human-in-the-loop)
- Reflection: Thinking Checkpoints (EPCT Workflow)
- Economic: Financial Guard (AP2 Wallet Air Lock)
- Visual: AGUI (Pending)

Author: Robin (A'0) + Opus 4.5
Date: 2025-12-24
Version: V2 Phoenix Architect
"""

import os
import sys
import time
import json
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
import schedule
import logging

# Import V2 organs
sys.path.insert(0, str(Path(__file__).parent))
from organs.financial_guard import get_financial_guard, FinancialGuard
from organs.thinking import get_thinking_organ, ThinkingOrgan, EPCTPhase

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/orchestrator.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('OrchestratorV2')


class AgentConfig:
    """Configuration for each agent type"""
    
    GEMINI_CLI = {
        'name': 'Gemini CLI (Robin)',
        'command': 'gemini',
        'config_dir': '.gemini',
        'mcp_config': '.gemini/config.json',
        'supports_conductor': True,
        'supports_mcp': True,
        'cost_per_1k_input': 0.075,
        'cost_per_1k_output': 0.30
    }
    
    CLAUDE = {
        'name': 'Claude (Opus 4.5)',
        'command': 'claude',
        'config_dir': '.claude',
        'mcp_config': '.claude/config.json',
        'supports_conductor': True,
        'supports_mcp': True,
        'cost_per_1k_input': 15.0,
        'cost_per_1k_output': 75.0
    }
    
    DEEPSEEK_R1 = {
        'name': 'DeepSeek R1 (Local)',
        'command': 'ollama',
        'model': 'deepseek-r1:70b',
        'supports_conductor': False,
        'supports_mcp': False,
        'cost_per_1k_input': 0.0,  # Local = free
        'cost_per_1k_output': 0.0
    }
    
    GEMINI_3_FLASH = {
        'name': 'Gemini 3 Flash (Local)',
        'command': 'ollama',
        'model': 'gemini-3-flash',
        'supports_conductor': True,
        'supports_mcp': False,
        'cost_per_1k_input': 0.0,
        'cost_per_1k_output': 0.0
    }


class TaskV2:
    """Enhanced task with V2 capabilities"""
    
    def __init__(
        self,
        name: str,
        agent: str,
        prompt: str,
        schedule_type: str = 'manual',
        interval: Optional[int] = None,
        requires_thinking: bool = False,
        requires_approval: bool = False,
        estimated_tokens: int = 1000,
        priority: str = 'normal'  # low, normal, high, critical
    ):
        self.name = name
        self.agent = agent
        self.prompt = prompt
        self.schedule_type = schedule_type
        self.interval = interval
        self.requires_thinking = requires_thinking
        self.requires_approval = requires_approval
        self.estimated_tokens = estimated_tokens
        self.priority = priority
        self.last_run = None
        self.status = 'pending'
    
    def execute(self, guard: FinancialGuard, thinking: ThinkingOrgan) -> bool:
        """Execute task with V2 organs"""
        logger.info(f"[V2] Executing task: {self.name}")
        
        # Phase 1: Financial Guard check
        if not guard.can_proceed():
            logger.warning(f"Task {self.name} blocked by Financial Guard")
            self.status = 'blocked_financial'
            return False
        
        # Estimate cost
        estimated_cost = guard.estimate_cost(
            self.estimated_tokens, 
            self.estimated_tokens * 2,  # Assume 2x output
            self._get_model_name()
        )
        
        # Request approval for expensive operations
        if self.requires_approval or estimated_cost > 0.50:
            if not guard.request_approval(self.name, estimated_cost):
                logger.warning(f"Task {self.name} not approved by Jerry")
                self.status = 'blocked_approval'
                return False
        
        # Phase 2: Thinking checkpoint (if required)
        if self.requires_thinking:
            thinking.start_task(self.prompt)
            
            # For complex tasks, require thinking_block
            if thinking.require_thinking_block():
                logger.info(f"Task {self.name} requires thinking_block")
                # In real implementation, this would pause for thinking
                # For now, we auto-advance
                thinking.advance_phase()
        
        # Phase 3: Execute
        result = self._execute_agent()
        
        self.last_run = datetime.now()
        self.status = 'completed' if result else 'failed'
        
        # Phase 4: Record usage
        if result:
            guard.record_usage(
                tokens=self.estimated_tokens,
                cost=estimated_cost,
                agent=self.agent
            )
        
        self._log_execution(result)
        
        return result
    
    def _get_model_name(self) -> str:
        """Get model name for cost estimation"""
        if self.agent == 'gemini-cli':
            return 'gemini-3-flash'
        elif self.agent == 'claude':
            return 'opus-4.5'
        elif self.agent == 'deepseek-r1':
            return 'deepseek-r1'
        return 'gemini-3-flash'
    
    def _execute_agent(self) -> bool:
        """Execute via appropriate agent"""
        try:
            if self.agent == 'gemini-cli':
                return self._execute_gemini_cli()
            elif self.agent == 'deepseek-r1':
                return self._execute_ollama('deepseek-r1:70b')
            elif self.agent == 'gemini-3-flash':
                return self._execute_ollama('gemini-3-flash')
            else:
                logger.error(f"Unknown agent: {self.agent}")
                return False
        except Exception as e:
            logger.error(f"Execution failed: {e}")
            return False
    
    def _execute_gemini_cli(self) -> bool:
        """Execute via Gemini CLI"""
        cmd = ['gemini', 'chat', '--message', self.prompt]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        logger.info(f"Gemini output: {result.stdout[:200]}...")
        return result.returncode == 0
    
    def _execute_ollama(self, model: str) -> bool:
        """Execute via Ollama (local)"""
        payload = json.dumps({
            "model": model,
            "prompt": self.prompt,
            "stream": False
        })
        
        result = subprocess.run(
            ["curl", "-s", "-X", "POST",
             "http://localhost:11434/api/generate",
             "-d", payload],
            capture_output=True,
            text=True,
            timeout=300
        )
        
        response = json.loads(result.stdout)
        logger.info(f"Ollama output: {response.get('response', '')[:200]}...")
        return response.get('done', False)
    
    def _log_execution(self, success: bool):
        """Log execution"""
        log_entry = {
            'task': self.name,
            'agent': self.agent,
            'timestamp': datetime.now().isoformat(),
            'status': 'success' if success else 'failed',
            'priority': self.priority
        }
        
        log_file = Path('logs/task-executions.json')
        logs = []
        if log_file.exists():
            with open(log_file, 'r') as f:
                logs = json.load(f)
        logs.append(log_entry)
        with open(log_file, 'w') as f:
            json.dump(logs, f, indent=2)


class OrchestratorV2:
    """
    V2 Orchestrator with integrated organs
    
    Evolution:
    - V1: Manual task execution
    - V2: Autonomous management with guards
    """
    
    def __init__(self):
        self.tasks: List[TaskV2] = []
        self.running = False
        
        # Initialize organs
        self.financial_guard = get_financial_guard()
        self.thinking_organ = get_thinking_organ()
        
        logger.info("OrchestratorV2 initialized (Phoenix Architect)")
        logger.info(self.financial_guard.generate_statusline())
    
    def add_task(self, task: TaskV2):
        """Add task with scheduling"""
        self.tasks.append(task)
        logger.info(f"Added task: {task.name} (priority: {task.priority})")
        
        if task.schedule_type == 'interval' and task.interval:
            schedule.every(task.interval).minutes.do(
                task.execute, 
                self.financial_guard, 
                self.thinking_organ
            )
            logger.info(f"Scheduled: {task.name} every {task.interval} min")
    
    def start(self):
        """Start orchestrator in daemon mode"""
        self.running = True
        logger.info("OrchestratorV2 started")
        
        try:
            while self.running:
                # Check financial status
                if not self.financial_guard.can_proceed():
                    logger.warning("Financial Guard: LOCKED - pausing execution")
                    time.sleep(60)
                    continue
                
                schedule.run_pending()
                time.sleep(10)
                
        except KeyboardInterrupt:
            logger.info("OrchestratorV2 stopped by user")
            self.running = False
    
    def stop(self):
        """Stop orchestrator"""
        self.running = False
    
    def execute_once(self, task_name: str) -> bool:
        """Execute specific task once"""
        task = next((t for t in self.tasks if t.name == task_name), None)
        if not task:
            logger.error(f"Task not found: {task_name}")
            return False
        
        return task.execute(self.financial_guard, self.thinking_organ)
    
    def get_status(self) -> Dict:
        """Get orchestrator status"""
        return {
            'running': self.running,
            'tasks_count': len(self.tasks),
            'financial': self.financial_guard.get_status(),
            'thinking': self.thinking_organ.get_status()
        }


def create_aspace_tasks_v2() -> List[TaskV2]:
    """Create predefined A'Space OS V2 tasks"""
    return [
        TaskV2(
            name='sunday-uplink',
            agent='gemini-cli',
            prompt='/conductor:newTrack "Generate Sunday Uplink - Analyze business pulse from past week"',
            schedule_type='cron',
            requires_thinking=True,
            requires_approval=True,
            estimated_tokens=5000,
            priority='high'
        ),
        TaskV2(
            name='daily-pulse',
            agent='gemini-3-flash',  # Local for cost efficiency
            prompt='Check VPS health, Docker containers, disk space. Generate status report.',
            schedule_type='interval',
            interval=1440,
            requires_thinking=False,
            estimated_tokens=2000,
            priority='normal'
        ),
        TaskV2(
            name='rick-audit',
            agent='deepseek-r1',  # Deep reasoning for audits
            prompt='Analyze efficiency metrics from past week. Generate KKM report.',
            schedule_type='interval',
            interval=10080,
            requires_thinking=True,
            estimated_tokens=10000,
            priority='high'
        ),
        TaskV2(
            name='github-sync',
            agent='gemini-3-flash',
            prompt='Check for uncommitted changes in /logs/. Commit and push if found.',
            schedule_type='interval',
            interval=60,
            requires_thinking=False,
            estimated_tokens=500,
            priority='low'
        )
    ]


# CLI
if __name__ == "__main__":
    orchestrator = OrchestratorV2()
    
    for task in create_aspace_tasks_v2():
        orchestrator.add_task(task)
    
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        
        if cmd == 'start':
            logger.info("Starting OrchestratorV2 (Phoenix Architect)...")
            orchestrator.start()
        
        elif cmd == 'run' and len(sys.argv) > 2:
            task_name = sys.argv[2]
            orchestrator.execute_once(task_name)
        
        elif cmd == 'list':
            print("\n📋 A'Space OS V2 Tasks:")
            for task in orchestrator.tasks:
                status_emoji = {'pending': '⏳', 'completed': '✅', 'failed': '❌', 
                               'blocked_financial': '💰', 'blocked_approval': '🔒'}
                emoji = status_emoji.get(task.status, '⚪')
                print(f"  {emoji} {task.name} ({task.agent}) - {task.priority}")
        
        elif cmd == 'status':
            print("\n" + orchestrator.financial_guard.generate_statusline())
            status = orchestrator.get_status()
            print(f"\nTasks: {status['tasks_count']}")
            print(f"Financial: {status['financial']['status']}")
        
        elif cmd == 'statusbar':
            # Continuous statusbar
            while True:
                print(orchestrator.financial_guard.generate_statusline(), end='\r')
                time.sleep(5)
        
        else:
            print("A'Space OS Orchestrator V2 (Phoenix Architect)")
            print("Commands: start, run <task>, list, status, statusbar")
    else:
        print("A'Space OS Orchestrator V2")
        print(orchestrator.financial_guard.generate_statusline())
        print("\nUsage: python orchestrator_v2.py [start|run|list|status|statusbar]")
