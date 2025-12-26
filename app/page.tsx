'use client';

import { AnimatePresence } from 'framer-motion';
import Desktop from '@/components/os/Desktop';
import StartMenu from '@/components/os/StartMenu';
import Taskbar from '@/components/os/Taskbar';
import WindowFrame from '@/components/window/WindowFrame';
import { useOS } from '@/components/os/WindowManager';

// App imports
import JerryBusinessPulse from '@/apps/Jerry_BusinessPulse';
import MortyExecutionEngine from '@/apps/Morty_ExecutionEngine';
import BethLifeCore from '@/apps/Beth_LifeCore';
import RickTerminal from '@/apps/Rick_Terminal';

export default function Home() {
  const { windows, openWindow } = useOS();

  const apps = [
    {
      id: 'jerry',
      name: 'Jerry - Business Pulse',
      icon: '💎',
      onClick: () => openWindow({
        title: 'Jerry - Business Pulse',
        component: <JerryBusinessPulse />,
        position: { x: 100, y: 100 },
        size: { width: 600, height: 500 },
      }),
    },
    {
      id: 'morty',
      name: 'Morty - Execution Engine',
      icon: '⚙️',
      onClick: () => openWindow({
        title: 'Morty - Execution Engine',
        component: <MortyExecutionEngine />,
        position: { x: 150, y: 150 },
        size: { width: 600, height: 500 },
      }),
    },
    {
      id: 'beth',
      name: 'Beth - Life Core',
      icon: '🌳',
      onClick: () => openWindow({
        title: 'Beth - Life Core',
        component: <BethLifeCore />,
        position: { x: 200, y: 200 },
        size: { width: 600, height: 550 },
      }),
    },
    {
      id: 'rick',
      name: 'Rick - Terminal',
      icon: '⌨️',
      onClick: () => openWindow({
        title: 'Rick - Terminal',
        component: <RickTerminal />,
        position: { x: 250, y: 250 },
        size: { width: 700, height: 500 },
      }),
    },
  ];

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* Desktop Background */}
      <Desktop />

      {/* Start Menu */}
      <StartMenu />

      {/* Windows */}
      <AnimatePresence>
        {windows.map((window) => (
          <WindowFrame key={window.id} window={window} />
        ))}
      </AnimatePresence>

      {/* Taskbar */}
      <Taskbar apps={apps} />
    </main>
  );
}
