'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function StartMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Start Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 glass px-6 py-3 rounded-xl hover:bg-white/20 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="text-white font-semibold">A'Space OS</span>
        </div>
      </motion.button>

      {/* Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-20 left-6 z-50 w-80 glass rounded-2xl p-6 shadow-2xl"
            >
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-4">
                  A'Space OS V4
                </h2>
                
                <div className="space-y-2">
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

                <div className="pt-4 border-t border-white/10">
                  <div className="text-xs text-white/60 text-center">
                    Solarpunk Edition • V4.0
                  </div>
                </div>
              </div>
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
      <div className="text-xs font-semibold text-primary-300 mb-2">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white"
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm">{label}</span>
    </motion.button>
  );
}
