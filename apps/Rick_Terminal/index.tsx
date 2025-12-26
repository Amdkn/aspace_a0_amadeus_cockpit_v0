'use client';

import { useState } from 'react';

export default function RickTerminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    '> A\'Space OS Terminal v4.0',
    '> Type "help" for available commands',
    '',
  ]);

  const handleCommand = (cmd: string) => {
    const newHistory = [...history, `> ${cmd}`];
    
    const command = cmd.trim().toLowerCase();
    if (command === 'help') {
      newHistory.push('Available commands:');
      newHistory.push('  status  - Show system status');
      newHistory.push('  agents  - List active agents');
      newHistory.push('  clear   - Clear terminal');
      newHistory.push('  help    - Show this message');
    } else if (command === 'status') {
      newHistory.push('System Status: ONLINE');
      newHistory.push('Agents: 4 active');
      newHistory.push('Efficiency: 0.95');
    } else if (command === 'agents') {
      newHistory.push('Active Agents:');
      newHistory.push('  • Beth (Life Core)');
      newHistory.push('  • Jerry (Business Pulse)');
      newHistory.push('  • Morty (Execution Engine)');
      newHistory.push('  • Rick (Terminal)');
    } else if (command === 'clear') {
      setHistory(['> A\'Space OS Terminal v4.0', '']);
      setInput('');
      return;
    } else if (command) {
      newHistory.push(`Command not found: ${cmd}`);
    }
    
    newHistory.push('');
    setHistory(newHistory);
    setInput('');
  };

  return (
    <div className="text-white h-full flex flex-col font-mono text-sm">
      <div className="flex items-center gap-3 mb-4 font-sans">
        <span className="text-4xl">⌨️</span>
        <h1 className="text-2xl font-bold">Rick - Terminal</h1>
      </div>
      
      <div className="glass p-4 rounded-lg flex-1 overflow-auto">
        <div className="space-y-1">
          {history.map((line, i) => (
            <div key={i} className={line.startsWith('>') ? 'text-primary-400' : 'text-white/70'}>
              {line}
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <span className="text-primary-400">{'>'}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) {
                handleCommand(input);
              }
            }}
            className="flex-1 bg-transparent outline-none text-white"
            placeholder="Enter command..."
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
