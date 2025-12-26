'use client';

import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface TaskbarProps {
  apps: Array<{
    id: string;
    name: string;
    icon: ReactNode;
    onClick: () => void;
  }>;
}

export default function Taskbar({ apps }: TaskbarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass-dark flex items-end gap-3 px-4 py-3 rounded-3xl bio-depth border-glow-teal"
      >
        {apps.map((app, index) => (
          <motion.button
            key={app.id}
            onClick={app.onClick}
            onHoverStart={() => setHoveredId(app.id)}
            onHoverEnd={() => setHoveredId(null)}
            className="relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-white/5 hover:bg-primary-500/20 transition-all duration-300"
            style={{
              boxShadow: hoveredId === app.id 
                ? '0 0 30px rgba(45, 212, 191, 0.4), inset 0 0 20px rgba(45, 212, 191, 0.1)' 
                : '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
            whileHover={{ 
              scale: 1.3, 
              y: -15,
              transition: { 
                duration: 0.3,
                ease: [0.34, 1.56, 0.64, 1] // bounce-soft
              }
            }}
            whileTap={{ scale: 0.9 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              delay: index * 0.08,
              duration: 0.4,
              ease: 'easeOut'
            }}
          >
            {/* Icon with glow on hover */}
            <motion.div 
              className="text-3xl relative z-10"
              animate={{
                filter: hoveredId === app.id 
                  ? 'drop-shadow(0 0 8px rgba(45, 212, 191, 0.6))'
                  : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
              }}
            >
              {app.icon}
            </motion.div>
            
            {/* Hover glow indicator */}
            {hoveredId === app.id && (
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-primary-400/50"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  boxShadow: '0 0 20px rgba(45, 212, 191, 0.4), inset 0 0 20px rgba(45, 212, 191, 0.1)',
                }}
              />
            )}
            
            {/* Active indicator dot */}
            <motion.div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent-400"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: hoveredId === app.id ? 1 : 0.5, 
                scale: hoveredId === app.id ? 1.5 : 1,
              }}
              style={{
                boxShadow: hoveredId === app.id 
                  ? '0 0 10px rgba(251, 191, 36, 0.8)'
                  : '0 0 5px rgba(251, 191, 36, 0.4)',
              }}
              transition={{ duration: 0.2 }}
            />
            
            {/* Enhanced Tooltip with glow */}
            <motion.div
              className="absolute -top-14 left-1/2 -translate-x-1/2 glass-glow px-4 py-2 rounded-xl text-xs font-medium text-white whitespace-nowrap pointer-events-none"
              initial={{ opacity: 0, y: 5 }}
              animate={{ 
                opacity: hoveredId === app.id ? 1 : 0,
                y: hoveredId === app.id ? 0 : 5,
              }}
              transition={{ duration: 0.2 }}
              style={{
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5), 0 0 20px rgba(45, 212, 191, 0.3)',
              }}
            >
              {app.name}
              {/* Tooltip arrow with glow */}
              <div 
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-black/40 border-r border-b border-primary-400/30"
                style={{
                  boxShadow: '0 0 10px rgba(45, 212, 191, 0.2)',
                }}
              />
            </motion.div>
          </motion.button>
        ))}
      </motion.div>
      
      {/* Base glow reflection */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-8 blur-2xl opacity-30"
        style={{
          background: 'radial-gradient(ellipse, rgba(45, 212, 191, 0.4) 0%, transparent 70%)',
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
