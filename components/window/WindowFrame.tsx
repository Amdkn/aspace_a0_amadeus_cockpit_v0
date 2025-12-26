'use client';

import { motion, useDragControls } from 'framer-motion';
import { useRef, ReactNode, useState } from 'react';
import { useOS, WindowState } from '../os/WindowManager';

interface WindowFrameProps {
  window: WindowState;
}

export default function WindowFrame({ window }: WindowFrameProps) {
  const { closeWindow, minimizeWindow, focusWindow, updateWindowPosition } = useOS();
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  if (window.minimized) return null;

  return (
    <motion.div
      ref={constraintsRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: window.zIndex }}
    >
      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={constraintsRef}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(_, info) => {
          setIsDragging(false);
          updateWindowPosition(window.id, {
            x: window.position.x + info.offset.x,
            y: window.position.y + info.offset.y,
          });
        }}
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 20 }}
        transition={{
          duration: 0.3,
          ease: [0.34, 1.56, 0.64, 1], // bounce-soft
        }}
        className="glass-dark rounded-2xl pointer-events-auto border-glow-teal"
        style={{
          position: 'absolute',
          left: window.position.x,
          top: window.position.y,
          width: window.size.width,
          height: window.size.height,
          boxShadow: isDragging
            ? '0 16px 64px rgba(0, 0, 0, 0.7), 0 0 40px rgba(45, 212, 191, 0.4)'
            : '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 30px rgba(45, 212, 191, 0.25)',
        }}
        onClick={() => focusWindow(window.id)}
      >
        {/* Title Bar with enhanced depth */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-b border-primary-500/20 cursor-move relative overflow-hidden"
          onPointerDown={(e) => dragControls.start(e)}
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.1) 100%)',
          }}
        >
          {/* Animated gradient background on drag */}
          {isDragging && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary-400/10 via-transparent to-primary-400/10"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}
          
          <div className="flex items-center gap-3 relative z-10">
            <span className="text-white font-bold text-glow-teal">{window.title}</span>
          </div>

          {/* Window Controls with glow */}
          <div className="flex items-center gap-2.5 relative z-10">
            <WindowButton
              color="yellow"
              onClick={() => minimizeWindow(window.id)}
              title="Minimize"
            />
            <WindowButton
              color="red"
              onClick={() => closeWindow(window.id)}
              title="Close"
            />
          </div>
          
          {/* Title bar glow accent */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(45, 212, 191, 0.5) 50%, transparent 100%)',
              boxShadow: '0 0 10px rgba(45, 212, 191, 0.3)',
            }}
          />
        </div>

        {/* Window Content with inner glow */}
        <div 
          className="p-5 overflow-auto relative" 
          style={{ 
            height: 'calc(100% - 56px)',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
          }}
        >
          {window.component}
          
          {/* Inner ambient glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-400/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-400/5 rounded-full blur-3xl pointer-events-none" />
        </div>
        
        {/* Window edge glow */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 30px rgba(45, 212, 191, 0.05)',
          }}
        />
      </motion.div>
    </motion.div>
  );
}

function WindowButton({ color, onClick, title }: { color: 'yellow' | 'red' | 'green'; onClick: () => void; title: string }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const colors = {
    yellow: {
      bg: 'bg-accent-400',
      glow: 'rgba(251, 191, 36, 0.6)',
    },
    red: {
      bg: 'bg-red-500',
      glow: 'rgba(239, 68, 68, 0.6)',
    },
    green: {
      bg: 'bg-primary-500',
      glow: 'rgba(20, 184, 166, 0.6)',
    },
  };

  const colorConfig = colors[color];

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`w-3.5 h-3.5 rounded-full ${colorConfig.bg} relative`}
      whileHover={{ scale: 1.3 }}
      whileTap={{ scale: 0.8 }}
      title={title}
      style={{
        boxShadow: isHovered
          ? `0 0 12px ${colorConfig.glow}, 0 0 6px ${colorConfig.glow}`
          : `0 0 4px ${colorConfig.glow}`,
      }}
    >
      {/* Inner shine */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 70%)',
        }}
      />
    </motion.button>
  );
}
