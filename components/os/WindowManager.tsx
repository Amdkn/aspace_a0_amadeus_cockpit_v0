'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WindowState {
  id: string;
  title: string;
  component: ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  minimized: boolean;
}

interface OSContextType {
  windows: WindowState[];
  openWindow: (window: Omit<WindowState, 'id' | 'zIndex' | 'minimized'>) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
}

const OSContext = createContext<OSContextType | undefined>(undefined);

export function OSProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1000);

  const openWindow = (window: Omit<WindowState, 'id' | 'zIndex' | 'minimized'>) => {
    const id = `window-${Date.now()}`;
    const newWindow: WindowState = {
      ...window,
      id,
      zIndex: nextZIndex,
      minimized: false,
    };
    setWindows((prev) => [...prev, newWindow]);
    setNextZIndex((prev) => prev + 1);
  };

  const closeWindow = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  };

  const minimizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w))
    );
  };

  const focusWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: nextZIndex } : w))
    );
    setNextZIndex((prev) => prev + 1);
  };

  const updateWindowPosition = (id: string, position: { x: number; y: number }) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, position } : w))
    );
  };

  const updateWindowSize = (id: string, size: { width: number; height: number }) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, size } : w))
    );
  };

  return (
    <OSContext.Provider
      value={{
        windows,
        openWindow,
        closeWindow,
        minimizeWindow,
        focusWindow,
        updateWindowPosition,
        updateWindowSize,
      }}
    >
      {children}
    </OSContext.Provider>
  );
}

export function useOS() {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
}
