'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

export default function Desktop() {
  // Memoize particles to prevent recreation on each render
  const particles = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      width: Math.random() * 120 + 40,
      height: Math.random() * 120 + 40,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      x: Math.random() * 150 - 75,
      y: Math.random() * 150 - 75,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
      glowIntensity: Math.random() * 0.3 + 0.1,
    })), []
  );

  return (
    <div className="fixed inset-0 overflow-hidden bg-deep-DEFAULT">
      {/* Multi-layer Solarpunk Background */}
      <div className="absolute inset-0">
        {/* Deep radial gradient base */}
        <div className="absolute inset-0 bg-solarpunk-radial" />
        
        {/* Animated gradient overlay with glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800/90 via-primary-600/70 to-primary-400/50" />
        
        {/* Bioluminescent particles with glow */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full blur-sm"
            style={{
              width: particle.width,
              height: particle.height,
              left: particle.left,
              top: particle.top,
              background: `radial-gradient(circle, rgba(251, 191, 36, ${particle.glowIntensity}) 0%, transparent 70%)`,
              boxShadow: `0 0 ${particle.width * 0.5}px rgba(251, 191, 36, ${particle.glowIntensity * 0.5})`,
            }}
            animate={{
              x: [0, particle.x, 0],
              y: [0, particle.y, 0],
              opacity: [0.2, particle.glowIntensity + 0.3, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Teal accent glow spots */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(45, 212, 191, 0.12) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 10,
            delay: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Subtle depth overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-deep-100/30 via-transparent to-transparent" />
        
        {/* Glass effect with shimmer */}
        <div className="absolute inset-0 backdrop-blur-sm bg-glass-shimmer animate-shimmer" 
             style={{ backgroundSize: '200% 200%' }} />
      </div>

      {/* Enhanced grid pattern with glow */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(45, 212, 191, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(45, 212, 191, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Organic noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
