'use client';

export default function JerryBusinessPulse() {
  return (
    <div className="text-white space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">💎</span>
        <h1 className="text-2xl font-bold">Jerry - Business Pulse</h1>
      </div>
      
      <div className="glass p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Financial Dashboard</h2>
        <p className="text-white/70">Monitor your business metrics and financial health.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Revenue" value="$12,450" change="+12%" />
        <MetricCard label="Expenses" value="$8,200" change="-5%" />
        <MetricCard label="Profit" value="$4,250" change="+18%" />
        <MetricCard label="Budget" value="85%" change="+3%" />
      </div>
    </div>
  );
}

function MetricCard({ label, value, change }: { label: string; value: string; change: string }) {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="glass p-4 rounded-lg">
      <div className="text-sm text-white/60 mb-1">{label}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className={`text-sm ${isPositive ? 'text-primary-400' : 'text-red-400'}`}>
        {change}
      </div>
    </div>
  );
}
