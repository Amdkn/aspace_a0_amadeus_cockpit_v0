'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface TaskbarProps {
  apps: Array<{
    id: string;
    name: string;
    icon: ReactNode;
    onClick: () => void;
  }>;
}

export default function Taskbar({ apps }: TaskbarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass flex items-end gap-2 px-3 py-2 rounded-2xl shadow-2xl"
      >
        {apps.map((app, index) => (
          <motion.button
            key={app.id}
            onClick={app.onClick}
            className="relative flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            whileHover={{ 
              scale: 1.2, 
              y: -10,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="text-2xl">{app.icon}</div>
            
            {/* Tooltip */}
            <motion.div
              className="absolute -top-12 left-1/2 -translate-x-1/2 glass px-3 py-1 rounded-lg text-xs text-white whitespace-nowrap opacity-0 pointer-events-none"
              whileHover={{ opacity: 1 }}
            >
              {app.name}
            </motion.div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
