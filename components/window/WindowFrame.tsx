'use client';

import { motion, useDragControls } from 'framer-motion';
import { useRef, ReactNode } from 'react';
import { useOS, WindowState } from '../os/WindowManager';

interface WindowFrameProps {
  window: WindowState;
}

export default function WindowFrame({ window }: WindowFrameProps) {
  const { closeWindow, minimizeWindow, focusWindow, updateWindowPosition } = useOS();
  const dragControls = useDragControls();
  const constraintsRef = useRef(null);

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
        onDragEnd={(_, info) => {
          updateWindowPosition(window.id, {
            x: window.position.x + info.offset.x,
            y: window.position.y + info.offset.y,
          });
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass rounded-xl shadow-2xl pointer-events-auto"
        style={{
          position: 'absolute',
          left: window.position.x,
          top: window.position.y,
          width: window.size.width,
          height: window.size.height,
        }}
        onClick={() => focusWindow(window.id)}
      >
        {/* Title Bar */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-white/10 cursor-move"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">{window.title}</span>
          </div>

          {/* Window Controls */}
          <div className="flex items-center gap-2">
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
        </div>

        {/* Window Content */}
        <div className="p-4 overflow-auto" style={{ height: 'calc(100% - 52px)' }}>
          {window.component}
        </div>
      </motion.div>
    </motion.div>
  );
}

function WindowButton({ color, onClick, title }: { color: 'yellow' | 'red' | 'green'; onClick: () => void; title: string }) {
  const colors = {
    yellow: 'bg-accent-400 hover:bg-accent-400/80',
    red: 'bg-red-500 hover:bg-red-600',
    green: 'bg-primary-500 hover:bg-primary-600',
  };

  return (
    <motion.button
      onClick={onClick}
      className={`w-3 h-3 rounded-full ${colors[color as keyof typeof colors]}`}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      title={title}
    />
  );
}
