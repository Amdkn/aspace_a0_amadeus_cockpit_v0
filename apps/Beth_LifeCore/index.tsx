'use client';

export default function BethLifeCore() {
  return (
    <div className="text-white space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">🌳</span>
        <h1 className="text-2xl font-bold">Beth - Life Core</h1>
      </div>
      
      <div className="glass p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Ikigai Guardian</h2>
        <p className="text-white/70">Align your actions with your purpose.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <IkigaiCard title="Passion" icon="❤️" score={85} />
        <IkigaiCard title="Mission" icon="🎯" score={92} />
        <IkigaiCard title="Vocation" icon="💼" score={78} />
        <IkigaiCard title="Profession" icon="⚡" score={88} />
      </div>

      <div className="glass p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Life Balance</h3>
        <div className="space-y-2">
          <BalanceBar label="Health" value={80} color="bg-primary-500" />
          <BalanceBar label="Wealth" value={70} color="bg-accent-400" />
          <BalanceBar label="Wisdom" value={90} color="bg-primary-400" />
          <BalanceBar label="Happiness" value={85} color="bg-teal-400" />
        </div>
      </div>
    </div>
  );
}

function IkigaiCard({ title, icon, score }: { title: string; icon: string; score: number }) {
  return (
    <div className="glass p-4 rounded-lg text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-2xl font-bold text-primary-400">{score}%</div>
    </div>
  );
}

function BalanceBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
