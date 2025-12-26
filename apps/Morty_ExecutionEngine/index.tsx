'use client';

export default function MortyExecutionEngine() {
  return (
    <div className="text-white space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">⚙️</span>
        <h1 className="text-2xl font-bold">Morty - Execution Engine</h1>
      </div>
      
      <div className="glass p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Task Orchestrator</h2>
        <p className="text-white/70">Execute and monitor automated workflows.</p>
      </div>

      <div className="space-y-3">
        <TaskItem status="running" name="Daily Pulse" progress={65} />
        <TaskItem status="completed" name="Sunday Uplink" progress={100} />
        <TaskItem status="pending" name="Rick Audit" progress={0} />
        <TaskItem status="running" name="GitHub Sync" progress={45} />
      </div>
    </div>
  );
}

function TaskItem({ status, name, progress }: { status: string; name: string; progress: number }) {
  const statusColors = {
    running: 'bg-accent-400',
    completed: 'bg-primary-500',
    pending: 'bg-white/30',
  };

  return (
    <div className="glass p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">{name}</span>
        <span className="text-sm text-white/60 capitalize">{status}</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${statusColors[status as keyof typeof statusColors]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
