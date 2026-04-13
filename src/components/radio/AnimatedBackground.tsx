'use client';

import { useEffect, useRef } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import { getAdaptiveQuality, isLowEndDevice } from '@/lib/performance';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useRadioStore();
  const isDark = theme === 'dark';
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Skip heavy animations on low-end devices
    if (isLowEndDevice()) {
      // Just set a static CSS background, no canvas animation
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const quality = getAdaptiveQuality();
    let animationId: number;
    let particles: Particle[] = [];
    let isVisible = true;
    let frameCount = 0;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Pause animation when tab is hidden to save CPU/battery
    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
      if (isVisible) {
        // Resume animation
        animate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Create particles - use adaptive quality
    const createParticles = () => {
      particles = [];
      const particleCount = Math.min(quality.particlesCount, Math.floor((canvas.width * canvas.height) / 20000));
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.1,
          hue: isDark ? Math.random() * 60 + 220 : Math.random() * 60 + 20,
        });
      }
    };
    
    createParticles();
    
    const animate = () => {
      if (!isVisible) return; // Don't animate when tab is hidden
      
      frameCount++;
      
      // Skip frames on lower-end devices based on animationFrameSkip
      if (frameCount % quality.animationFrameSkip !== 0) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      
      if (isDark) {
        gradient.addColorStop(0, 'rgba(30, 30, 50, 0.3)');
        gradient.addColorStop(0.5, 'rgba(20, 20, 40, 0.2)');
        gradient.addColorStop(1, 'rgba(10, 10, 20, 0.1)');
      } else {
        gradient.addColorStop(0, 'rgba(255, 250, 240, 0.5)');
        gradient.addColorStop(0.5, 'rgba(255, 245, 230, 0.3)');
        gradient.addColorStop(1, 'rgba(250, 240, 220, 0.1)');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw floating orbs (only if enabled)
      if (quality.enableOrbs) {
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < 3; i++) {
          const x = canvas.width * (0.3 + 0.4 * Math.sin(time * 0.3 + i * 2));
          const y = canvas.height * (0.3 + 0.4 * Math.cos(time * 0.2 + i * 1.5));
          const radius = 100 + 50 * Math.sin(time * 0.5 + i);
          
          const orbGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          
          if (isDark) {
            orbGradient.addColorStop(0, 'rgba(100, 100, 200, 0.15)');
            orbGradient.addColorStop(0.5, 'rgba(80, 80, 180, 0.08)');
            orbGradient.addColorStop(1, 'rgba(60, 60, 160, 0)');
          } else {
            orbGradient.addColorStop(0, 'rgba(255, 200, 100, 0.15)');
            orbGradient.addColorStop(0.5, 'rgba(255, 180, 80, 0.08)');
            orbGradient.addColorStop(1, 'rgba(255, 160, 60, 0)');
          }
          
          ctx.fillStyle = orbGradient;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        
        if (isDark) {
          ctx.fillStyle = `hsla(${particle.hue}, 70%, 70%, ${particle.opacity})`;
        } else {
          ctx.fillStyle = `hsla(${particle.hue}, 80%, 60%, ${particle.opacity * 0.8})`;
        }
        ctx.fill();
      });
      
      // Draw connecting lines (only if enabled)
      if (quality.enableConnectingLines) {
        particles.forEach((p1, i) => {
          particles.slice(i + 1).forEach((p2) => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              
              const opacity = (1 - distance / 150) * 0.15;
              if (isDark) {
                ctx.strokeStyle = `rgba(100, 100, 200, ${opacity})`;
              } else {
                ctx.strokeStyle = `rgba(200, 150, 100, ${opacity})`;
              }
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          });
        });
      }
      
      // Draw wave effect at bottom (only if enabled)
      if (quality.enableWaves) {
        const time = Date.now() * 0.001;
        const waveHeight = 50;
        const waveY = canvas.height - waveHeight;
        
        ctx.beginPath();
        ctx.moveTo(0, waveY + waveHeight);
        
        for (let x = 0; x <= canvas.width; x += 10) {
          const y = waveY + Math.sin(time * 2 + x * 0.02) * 15;
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        
        const waveGradient = ctx.createLinearGradient(0, waveY, 0, canvas.height);
        if (isDark) {
          waveGradient.addColorStop(0, 'rgba(45, 139, 139, 0.1)');
          waveGradient.addColorStop(1, 'rgba(45, 139, 139, 0.05)');
        } else {
          waveGradient.addColorStop(0, 'rgba(45, 139, 139, 0.08)');
          waveGradient.addColorStop(1, 'rgba(45, 139, 139, 0.02)');
        }
        ctx.fillStyle = waveGradient;
        ctx.fill();
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isDark]);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        background: isDark 
          ? 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(180deg, #fefefe 0%, #f8f4f0 50%, #f0ebe5 100%)'
      }}
    />
  );
}
