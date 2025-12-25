#!/bin/bash
# A'Space OS Statusbar - Financial & System Metrics
# Author: Jerry (A1)
# Version: V2 Phoenix Architect

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
COCKPIT_DIR="${ASPACE_COCKPIT:-$HOME/Documents/A'Space OS/aspaceos-a0-amadeus-cockpit}"
METRICS_FILE="$COCKPIT_DIR/logs/financial-metrics.json"
PULSE_FILE="$COCKPIT_DIR/logs/business-pulse/current.json"

# Financial Guard Status
get_financial_status() {
    if [ -f "$METRICS_FILE" ]; then
        tokens=$(jq -r '.tokens_used // 0' "$METRICS_FILE" 2>/dev/null)
        cost=$(jq -r '.api_cost // 0' "$METRICS_FILE" 2>/dev/null)
        calls=$(jq -r '.calls_count // 0' "$METRICS_FILE" 2>/dev/null)
        
        # Calculate percentages (assuming limits)
        token_limit=100000
        cost_limit=5.00
        
        token_pct=$((tokens * 100 / token_limit))
        cost_pct=$(echo "scale=0; $cost * 100 / $cost_limit" | bc 2>/dev/null || echo "0")
        
        # Status emoji based on percentage
        if [ "$cost_pct" -ge 100 ]; then
            status="${RED}🔒 LOCKED${NC}"
        elif [ "$cost_pct" -ge 95 ]; then
            status="${RED}🔴 CRITICAL${NC}"
        elif [ "$cost_pct" -ge 80 ]; then
            status="${YELLOW}🟡 WARNING${NC}"
        else
            status="${GREEN}🟢 NOMINAL${NC}"
        fi
        
        echo -e "$status | Tokens: $tokens ($token_pct%) | Cost: \$$cost ($cost_pct%) | Calls: $calls"
    else
        echo -e "${BLUE}⚪ No metrics available${NC}"
    fi
}

# System Health
get_system_health() {
    # CPU
    cpu=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' 2>/dev/null || echo "N/A")
    
    # Memory
    mem=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}' 2>/dev/null || echo "N/A")
    
    # Disk
    disk=$(df -h / | tail -1 | awk '{print $5}' | tr -d '%' 2>/dev/null || echo "N/A")
    
    echo "CPU: ${cpu}% | Mem: ${mem}% | Disk: ${disk}%"
}

# Vortex Status (Ollama)
get_vortex_status() {
    if command -v ollama &> /dev/null; then
        models=$(ollama list 2>/dev/null | wc -l)
        if [ "$models" -gt 1 ]; then
            echo -e "${GREEN}🌀 Vortex: $((models-1)) models${NC}"
        else
            echo -e "${YELLOW}🌀 Vortex: No models${NC}"
        fi
    else
        echo -e "${RED}🌀 Vortex: Offline${NC}"
    fi
}

# Orchestrator Status
get_orchestrator_status() {
    if pgrep -f "orchestrator.py" > /dev/null; then
        echo -e "${GREEN}⚙️ Orchestrator: Running${NC}"
    else
        echo -e "${YELLOW}⚙️ Orchestrator: Stopped${NC}"
    fi
}

# Main statusbar
main() {
    clear
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}   A'Space OS V4 - Phoenix Architect Statusbar${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "💰 Financial Guard:"
    echo -e "   $(get_financial_status)"
    echo ""
    echo -e "🖥️ System Health:"
    echo -e "   $(get_system_health)"
    echo ""
    echo -e "$(get_vortex_status)"
    echo -e "$(get_orchestrator_status)"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "Last update: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
}

# Watch mode (refresh every 5 seconds)
watch_mode() {
    while true; do
        main
        sleep 5
    done
}

# One-liner for terminal prompt integration
oneliner() {
    if [ -f "$METRICS_FILE" ]; then
        cost=$(jq -r '.api_cost // 0' "$METRICS_FILE" 2>/dev/null)
        cost_pct=$(echo "scale=0; $cost * 100 / 5" | bc 2>/dev/null || echo "0")
        
        if [ "$cost_pct" -ge 95 ]; then
            echo "🔴"
        elif [ "$cost_pct" -ge 80 ]; then
            echo "🟡"
        else
            echo "🟢"
        fi
    else
        echo "⚪"
    fi
}

# Command handling
case "${1:-}" in
    watch)
        watch_mode
        ;;
    oneliner)
        oneliner
        ;;
    *)
        main
        ;;
esac
