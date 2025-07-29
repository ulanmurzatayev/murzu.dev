"use client";

/**
 * Canvas-based ripple wave background
 * @description: High-performance canvas implementation of rippling wave paths
 * @version: 2.0.0 (canvas-based)
 * @license: MIT
 */

import { memo, useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
}

interface WaveLayer {
  count: number;
  baseAmplitude: number;
  rippleSpeed: number;
  opacity: number;
  strokeWidth: number;
  color: string;
}

// Wave layers configuration
const waveLayers: WaveLayer[] = [
  {
    count: 8,
    baseAmplitude: 80,
    rippleSpeed: 0.8,
    opacity: 0.3,
    strokeWidth: 3,
    color: '#9333ea' // purple
  },
  {
    count: 10,
    baseAmplitude: 60,
    rippleSpeed: 1.2,
    opacity: 0.25,
    strokeWidth: 2.5,
    color: '#3b82f6' // blue
  },
  {
    count: 6,
    baseAmplitude: 40,
    rippleSpeed: 1.6,
    opacity: 0.2,
    strokeWidth: 2,
    color: '#10b981' // emerald
  }
];

function generateWavePoints(
  index: number,
  layer: WaveLayer,
  time: number,
  canvasWidth: number,
  canvasHeight: number
): Point[] {
  const phase = index * 0.2;
  const points: Point[] = [];
  const segments = layer.count === 8 ? 10 : layer.count === 10 ? 8 : 6;
  
  // Fixed wave parameters - independent of screen size
  const fixedSpacing = 25; // Fixed pixel spacing between waves
  const baseViewportWidth = 1200; // Reference viewport width
  const baseViewportHeight = 800; // Reference viewport height
  
  // Create infinite background effect - waves extend beyond screen bounds
  const startX = -baseViewportWidth * 0.3;
  const startY = baseViewportHeight * 0.2;
  const endX = Math.max(canvasWidth * 1.3, baseViewportWidth * 1.3);
  const endY = Math.max(canvasHeight * 1.1, baseViewportHeight * 0.9) + index * fixedSpacing;

  for (let i = 0; i <= segments; i++) {
    const progress = i / segments;
    const eased = 1 - (1 - progress) ** 2; // Original easing curve
    
    const baseX = startX + (endX - startX) * eased;
    const baseY = startY + (endY - startY) * eased;
    
    const amplitudeFactor = 1 - eased * 0.3;
    const ripplePhase = time * layer.rippleSpeed + progress * Math.PI * 2;
    
    // Fixed amplitude - same across all screen sizes
    const wave1 = Math.sin(progress * Math.PI * 3 + phase + ripplePhase * 0.5) * (layer.baseAmplitude * 0.7 * amplitudeFactor);
    const wave2 = Math.cos(progress * Math.PI * 4 + phase + ripplePhase * 0.3) * (layer.baseAmplitude * 0.3 * amplitudeFactor);
    const wave3 = Math.sin(progress * Math.PI * 2 + phase + ripplePhase * 0.7) * (layer.baseAmplitude * 0.2 * amplitudeFactor);

    points.push({
      x: baseX,
      y: baseY + wave1 + wave2 + wave3,
    });
  }

  return points;
}

function drawSmoothCurve(ctx: CanvasRenderingContext2D, points: Point[]) {
  if (points.length < 2) return;
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1];
    const currentPoint = points[i];
    const tension = 0.4;
    
    const cp1x = prevPoint.x + (currentPoint.x - prevPoint.x) * tension;
    const cp1y = prevPoint.y;
    const cp2x = prevPoint.x + (currentPoint.x - prevPoint.x) * (1 - tension);
    const cp2y = currentPoint.y;
    
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, currentPoint.x, currentPoint.y);
  }
}

const CanvasWaves = memo(function CanvasWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>();
  const dimensionsRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      const width = container.clientWidth;
      const height = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      
      // Update canvas size
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      
      // Scale context for DPR
      ctx.scale(dpr, dpr);
      
      // Update dimensions reference
      dimensionsRef.current = { width, height };
    };

    updateCanvasSize();

    const handleResize = () => {
      updateCanvasSize();
    };

    window.addEventListener('resize', handleResize);

    const startTime = Date.now();
    
    const animate = () => {
      const time = (Date.now() - startTime) * 0.001;
      const { width, height } = dimensionsRef.current;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw wave layers - consistent across all screen sizes
      waveLayers.forEach((layer, layerIndex) => {
        for (let i = 0; i < layer.count; i++) {
          const points = generateWavePoints(i, layer, time, width, height);
          
          if (points.length > 1) {
            ctx.save();
            
            // Fixed stroke style - same proportions on all screens
            ctx.globalAlpha = Math.min(1, layer.opacity + (i * 0.01));
            ctx.strokeStyle = layer.color;
            ctx.lineWidth = layer.strokeWidth + (i * 0.2);
            ctx.lineCap = 'round';
            
            drawSmoothCurve(ctx, points);
            ctx.stroke();
            
            ctx.restore();
          }
        }
      });
      
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ 
        opacity: 0.8,
        background: 'transparent'
      }}
    />
  );
});

export default memo(function BackgroundPaths() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <CanvasWaves />
    </div>
  );
});