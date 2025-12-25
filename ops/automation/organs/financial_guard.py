#!/usr/bin/env python3
"""
A'Space OS - Financial Guard (Organe Économique)
=================================================

Purpose: AP2 Protocol implementation for token/API surveillance.
         Cuts processes if budget exceeded (Wallet Air Lock).

Author: Jerry (A1) - Business Pulse Guardian
Date: 2025-12-24
Version: V2 Phoenix Architect
"""

import os
import json
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Optional
from dataclasses import dataclass, field
import logging

logger = logging.getLogger('FinancialGuard')


@dataclass
class BudgetConfig:
    """Budget configuration from business-pulse"""
    daily_token_limit: int = 100_000  # Tokens per day
    daily_api_cost_limit: float = 5.00  # USD per day
    monthly_budget: float = 100.00  # USD per month
    warning_threshold: float = 0.80  # 80% = warning
    critical_threshold: float = 0.95  # 95% = critical
    auto_cutoff: bool = True  # Auto-stop at 100%


@dataclass
class UsageMetrics:
    """Real-time usage tracking"""
    tokens_used: int = 0
    api_cost: float = 0.0
    calls_count: int = 0
    last_reset: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict:
        return {
            'tokens_used': self.tokens_used,
            'api_cost': self.api_cost,
            'calls_count': self.calls_count,
            'last_reset': self.last_reset.isoformat()
        }


class FinancialGuard:
    """
    AP2 Financial Guardian - Wallet Air Lock
    
    Responsibilities:
    - Track token consumption across all agents
    - Monitor API costs in real-time
    - Generate Statusline for visibility
    - Auto-cutoff when budget exceeded
    - Report to Jerry (A1) for approval on large expenses
    """
    
    def __init__(self, config: Optional[BudgetConfig] = None):
        self.config = config or BudgetConfig()
        self.metrics = UsageMetrics()
        self.metrics_file = Path('logs/financial-metrics.json')
        self.is_locked = False
        
        # Load previous metrics if exists
        self._load_metrics()
        
        # Check if we need daily reset
        self._check_daily_reset()
        
        logger.info(f"FinancialGuard initialized - Daily budget: ${self.config.daily_api_cost_limit}")
    
    def _load_metrics(self):
        """Load metrics from persistent storage"""
        if self.metrics_file.exists():
            try:
                with open(self.metrics_file, 'r') as f:
                    data = json.load(f)
                    self.metrics.tokens_used = data.get('tokens_used', 0)
                    self.metrics.api_cost = data.get('api_cost', 0.0)
                    self.metrics.calls_count = data.get('calls_count', 0)
                    self.metrics.last_reset = datetime.fromisoformat(
                        data.get('last_reset', datetime.now().isoformat())
                    )
            except Exception as e:
                logger.error(f"Failed to load metrics: {e}")
    
    def _save_metrics(self):
        """Persist metrics to file"""
        self.metrics_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.metrics_file, 'w') as f:
            json.dump(self.metrics.to_dict(), f, indent=2)
    
    def _check_daily_reset(self):
        """Reset metrics if new day"""
        now = datetime.now()
        if now.date() > self.metrics.last_reset.date():
            logger.info("Daily reset triggered - clearing metrics")
            self.metrics = UsageMetrics()
            self.is_locked = False
            self._save_metrics()
    
    def get_status(self) -> Dict:
        """Get current financial status"""
        token_usage = self.metrics.tokens_used / self.config.daily_token_limit
        cost_usage = self.metrics.api_cost / self.config.daily_api_cost_limit
        
        # Determine status level
        max_usage = max(token_usage, cost_usage)
        if max_usage >= 1.0:
            status = 'LOCKED'
        elif max_usage >= self.config.critical_threshold:
            status = 'CRITICAL'
        elif max_usage >= self.config.warning_threshold:
            status = 'WARNING'
        else:
            status = 'NOMINAL'
        
        return {
            'status': status,
            'tokens': {
                'used': self.metrics.tokens_used,
                'limit': self.config.daily_token_limit,
                'percentage': round(token_usage * 100, 1)
            },
            'cost': {
                'used': round(self.metrics.api_cost, 4),
                'limit': self.config.daily_api_cost_limit,
                'percentage': round(cost_usage * 100, 1)
            },
            'calls': self.metrics.calls_count,
            'is_locked': self.is_locked
        }
    
    def can_proceed(self) -> bool:
        """Check if operations can proceed (Air Lock check)"""
        if self.is_locked:
            logger.warning("FinancialGuard: LOCKED - Operations blocked")
            return False
        
        status = self.get_status()
        
        if status['status'] == 'LOCKED':
            if self.config.auto_cutoff:
                self.is_locked = True
                logger.critical("FinancialGuard: Budget exceeded - AUTO CUTOFF")
                self._notify_jerry("BUDGET_EXCEEDED")
                return False
        
        if status['status'] == 'CRITICAL':
            logger.warning(f"FinancialGuard: CRITICAL - {status['cost']['percentage']}% budget used")
            self._notify_jerry("BUDGET_CRITICAL")
        
        return True
    
    def record_usage(self, tokens: int, cost: float, agent: str):
        """Record API/token usage for an operation"""
        self.metrics.tokens_used += tokens
        self.metrics.api_cost += cost
        self.metrics.calls_count += 1
        
        self._save_metrics()
        
        logger.info(
            f"Usage recorded: +{tokens} tokens, +${cost:.4f} "
            f"(Agent: {agent}, Total: ${self.metrics.api_cost:.4f})"
        )
        
        # Check if we should lock
        self.can_proceed()
    
    def estimate_cost(self, prompt_tokens: int, completion_tokens: int, 
                      model: str = 'gemini-3-flash') -> float:
        """Estimate cost for an operation before execution"""
        # Pricing per 1M tokens (approximate)
        pricing = {
            'gemini-3-flash': {'input': 0.075, 'output': 0.30},
            'deepseek-r1': {'input': 0.14, 'output': 0.28},  # DeepSeek pricing
            'gemma-3n': {'input': 0.0, 'output': 0.0},  # Local = free
            'opus-4.5': {'input': 15.0, 'output': 75.0},  # Claude Opus
            'claude-sonnet': {'input': 3.0, 'output': 15.0}
        }
        
        rates = pricing.get(model, {'input': 0.1, 'output': 0.3})
        
        input_cost = (prompt_tokens / 1_000_000) * rates['input']
        output_cost = (completion_tokens / 1_000_000) * rates['output']
        
        return input_cost + output_cost
    
    def request_approval(self, operation: str, estimated_cost: float) -> bool:
        """Request Jerry's approval for expensive operations"""
        if estimated_cost < 0.10:  # Auto-approve under $0.10
            return True
        
        logger.info(f"Requesting Jerry approval: {operation} (${estimated_cost:.4f})")
        
        # TODO: Integrate with Google Chat MCP for real approval
        # For now, auto-approve if under critical threshold
        status = self.get_status()
        remaining = self.config.daily_api_cost_limit - self.metrics.api_cost
        
        if estimated_cost <= remaining:
            logger.info("Jerry: APPROVED (within remaining budget)")
            return True
        else:
            logger.warning(f"Jerry: BLOCKED (would exceed budget by ${estimated_cost - remaining:.4f})")
            return False
    
    def _notify_jerry(self, event: str):
        """Notify Jerry (A1) of financial events"""
        notification = {
            'timestamp': datetime.now().isoformat(),
            'event': event,
            'metrics': self.get_status(),
            'action_required': event in ['BUDGET_EXCEEDED', 'BUDGET_CRITICAL']
        }
        
        # Log to file
        log_file = Path('logs/jerry-notifications.json')
        notifications = []
        if log_file.exists():
            with open(log_file, 'r') as f:
                notifications = json.load(f)
        notifications.append(notification)
        with open(log_file, 'w') as f:
            json.dump(notifications, f, indent=2)
        
        logger.info(f"Jerry notified: {event}")
    
    def generate_statusline(self) -> str:
        """Generate statusline string for terminal/UI"""
        status = self.get_status()
        
        # Status emoji
        status_emoji = {
            'NOMINAL': '🟢',
            'WARNING': '🟡',
            'CRITICAL': '🔴',
            'LOCKED': '🔒'
        }
        
        emoji = status_emoji.get(status['status'], '⚪')
        
        return (
            f"{emoji} A'Space | "
            f"Tokens: {status['tokens']['used']:,}/{status['tokens']['limit']:,} "
            f"({status['tokens']['percentage']}%) | "
            f"Cost: ${status['cost']['used']:.2f}/${status['cost']['limit']:.2f} "
            f"({status['cost']['percentage']}%) | "
            f"Calls: {status['calls']}"
        )
    
    def unlock(self, override_code: str = None):
        """Manually unlock (requires Amadeus A0 override)"""
        if override_code == "AMADEUS_A0_OVERRIDE":
            self.is_locked = False
            logger.info("FinancialGuard: UNLOCKED by Amadeus (A0)")
            return True
        else:
            logger.warning("FinancialGuard: Invalid unlock attempt")
            return False


# Singleton instance
_guard_instance = None

def get_financial_guard() -> FinancialGuard:
    """Get singleton FinancialGuard instance"""
    global _guard_instance
    if _guard_instance is None:
        _guard_instance = FinancialGuard()
    return _guard_instance


# CLI for testing
if __name__ == "__main__":
    import sys
    
    guard = get_financial_guard()
    
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        
        if cmd == 'status':
            print(guard.generate_statusline())
            print(json.dumps(guard.get_status(), indent=2))
        
        elif cmd == 'simulate':
            # Simulate some usage
            guard.record_usage(tokens=5000, cost=0.15, agent='gemini-3-flash')
            print(guard.generate_statusline())
        
        elif cmd == 'unlock':
            if len(sys.argv) > 2:
                guard.unlock(sys.argv[2])
            else:
                print("Usage: python financial_guard.py unlock AMADEUS_A0_OVERRIDE")
    else:
        print("A'Space OS Financial Guard (Jerry)")
        print("Commands: status, simulate, unlock <code>")
        print()
        print(guard.generate_statusline())
