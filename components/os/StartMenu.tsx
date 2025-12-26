'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function StartMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Enhanced Start Button with HUD glow */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 glass-glow px-6 py-3 rounded-2xl hover:bg-primary-500/20 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          boxShadow: isOpen 
            ? '0 0 30px rgba(45, 212, 191, 0.5), 0 4px 16px rgba(0, 0, 0, 0.5)'
            : '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 15px rgba(45, 212, 191, 0.2)',
        }}
        animate={{
          boxShadow: isOpen
            ? '0 0 30px rgba(45, 212, 191, 0.5), 0 4px 16px rgba(0, 0, 0, 0.5)'
            : [
                '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 15px rgba(45, 212, 191, 0.2)',
                '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 20px rgba(45, 212, 191, 0.35)',
                '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 15px rgba(45, 212, 191, 0.2)',
              ],
        }}
        transition={{
          duration: 2,
          repeat: isOpen ? 0 : Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="flex items-center gap-3">
          <motion.span 
            className="text-2xl"
            animate={{
              filter: isOpen
                ? 'drop-shadow(0 0 8px rgba(45, 212, 191, 0.8))'
                : 'drop-shadow(0 0 4px rgba(45, 212, 191, 0.4))',
            }}
          >
            🌿
          </motion.span>
          <span className="text-white font-bold text-glow-teal">A'Space OS</span>
        </div>
      </motion.button>

      {/* Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Enhanced Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
            />

            {/* Menu with enhanced depth and glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: -30, y: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -30, y: -10 }}
              transition={{ 
                duration: 0.3,
                ease: [0.34, 1.56, 0.64, 1] // bounce-soft
              }}
              className="fixed top-24 left-6 z-50 w-96 glass-dark rounded-3xl p-6 bio-depth border-glow-teal"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 40px rgba(45, 212, 191, 0.3)',
              }}
            >
              <div className="space-y-5">
                {/* Header with glow */}
                <div className="pb-4 border-b border-primary-500/30">
                  <h2 className="text-2xl font-bold text-white text-glow-teal">
                    A'Space OS V4
                  </h2>
                  <p className="text-xs text-primary-300 mt-1">Solarpunk Interface</p>
                </div>
                
                <div className="space-y-3">
                  <MenuSection title="System">
                    <MenuItem icon="⚙️" label="Settings" onClick={() => {}} />
                    <MenuItem icon="📊" label="Dashboard" onClick={() => {}} />
                  </MenuSection>

                  <MenuSection title="Agents">
                    <MenuItem icon="💎" label="Jerry - Business Pulse" onClick={() => {}} />
                    <MenuItem icon="⚙️" label="Morty - Execution Engine" onClick={() => {}} />
                    <MenuItem icon="🌳" label="Beth - Life Core" onClick={() => {}} />
                    <MenuItem icon="⌨️" label="Rick - Terminal" onClick={() => {}} />
                  </MenuSection>
                </div>

                {/* Footer with accent glow */}
                <div className="pt-4 border-t border-accent-400/20">
                  <div className="text-xs text-accent-400 text-center font-medium">
                    <span className="inline-block" style={{
                      textShadow: '0 0 10px rgba(251, 191, 36, 0.5)',
                    }}>
                      ✨ Solarpunk Edition • V4.0
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Ambient glow corners */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-400/10 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-400/10 rounded-full blur-3xl -z-10" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-bold text-primary-400 mb-2 uppercase tracking-wider"
           style={{ textShadow: '0 0 8px rgba(45, 212, 191, 0.3)' }}>
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary-500/20 transition-all duration-300 text-white relative overflow-hidden"
      style={{
        boxShadow: isHovered 
          ? '0 0 15px rgba(45, 212, 191, 0.2), inset 0 0 15px rgba(45, 212, 191, 0.05)'
          : 'none',
        border: isHovered ? '1px solid rgba(45, 212, 191, 0.3)' : '1px solid transparent',
      }}
      whileHover={{ x: 6 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Hover glow effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary-400/10 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      )}
      
      <motion.span 
        className="text-xl relative z-10"
        animate={{
          filter: isHovered
            ? 'drop-shadow(0 0 6px rgba(45, 212, 191, 0.6))'
            : 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.3))',
        }}
      >
        {icon}
      </motion.span>
      <span className="text-sm font-medium relative z-10">{label}</span>
      
      {/* Hover indicator */}
      {isHovered && (
        <motion.div
          className="absolute right-3 w-1.5 h-1.5 rounded-full bg-accent-400"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            boxShadow: '0 0 8px rgba(251, 191, 36, 0.8)',
          }}
        />
      )}
    </motion.button>
  );
}
