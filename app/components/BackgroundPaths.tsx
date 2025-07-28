"use client";

/**
 * Adapted from KokonutUI background-paths component
 * @author: @dorian_baffier (original), adapted for Tailwind v4
 * @description: Background Paths with hydration-safe implementation
 * @version: 1.0.0 (adapted)
 * @license: MIT
 * @website: https://kokonutui.com
 */

import { memo, useMemo, useEffect, useState } from "react";

interface Point {
  x: number;
  y: number;
}

interface PathData {
  id: string;
  d: string;
  opacity: number;
  width: number;
}

// Fixed precision math functions to ensure identical server/client results
function fixedSin(x: number): number {
  return Math.round(Math.sin(x) * 1000000) / 1000000;
}

function fixedCos(x: number): number {
  return Math.round(Math.cos(x) * 1000000) / 1000000;
}

function generateAestheticPath(
  index: number,
  position: number,
  type: "primary" | "secondary" | "accent",
  time: number = 0
): string {
  const baseAmplitude = type === "primary" ? 150 : type === "secondary" ? 100 : 60;
  const phase = index * 0.2;
  const rippleSpeed = type === "primary" ? 0.8 : type === "secondary" ? 1.2 : 1.6;
  const points: Point[] = [];
  const segments = type === "primary" ? 10 : type === "secondary" ? 8 : 6;

  const startX = 2400;
  const startY = 800;
  const endX = -2400;
  const endY = -800 + index * 25;

  for (let i = 0; i <= segments; i++) {
    const progress = i / segments;
    const eased = 1 - (1 - progress) ** 2;

    const baseX = startX + (endX - startX) * eased;
    const baseY = startY + (endY - startY) * eased;

    const amplitudeFactor = 1 - eased * 0.3;
    const ripplePhase = time * rippleSpeed + progress * Math.PI * 2;
    const wave1 = fixedSin(progress * Math.PI * 3 + phase + ripplePhase * 0.5) * (baseAmplitude * 0.7 * amplitudeFactor);
    const wave2 = fixedCos(progress * Math.PI * 4 + phase + ripplePhase * 0.3) * (baseAmplitude * 0.3 * amplitudeFactor);
    const wave3 = fixedSin(progress * Math.PI * 2 + phase + ripplePhase * 0.7) * (baseAmplitude * 0.2 * amplitudeFactor);

    points.push({
      x: Math.round((baseX * position) * 1000) / 1000,
      y: Math.round((baseY + wave1 + wave2 + wave3) * 1000) / 1000,
    });
  }

  const pathCommands = points.map((point: Point, i: number) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prevPoint = points[i - 1];
    const tension = 0.4;
    const cp1x = Math.round((prevPoint.x + (point.x - prevPoint.x) * tension) * 1000) / 1000;
    const cp1y = Math.round(prevPoint.y * 1000) / 1000;
    const cp2x = Math.round((prevPoint.x + (point.x - prevPoint.x) * (1 - tension)) * 1000) / 1000;
    const cp2y = Math.round(point.y * 1000) / 1000;
    return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
  });

  return pathCommands.join(" ");
}

// Use deterministic IDs to avoid hydration issues
const generateDeterministicId = (prefix: string, index: number): string =>
  `${prefix}-${index}`;

const FloatingPaths = memo(function FloatingPaths({
  position,
}: {
  position: number;
}) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      setTime((Date.now() - startTime) * 0.001);
      requestAnimationFrame(animate);
    };
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);
  // Match original path counts: 12 primary, 15 secondary, 10 accent
  const primaryPaths: PathData[] = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: generateDeterministicId("primary", i),
        d: generateAestheticPath(i, position, "primary", time),
        opacity: 0.15 + i * 0.02,
        width: 4 + i * 0.3,
      })),
    [position, time]
  );

  const secondaryPaths: PathData[] = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: generateDeterministicId("secondary", i),
        d: generateAestheticPath(i, position, "secondary", time),
        opacity: 0.12 + i * 0.015,
        width: 3 + i * 0.25,
      })),
    [position, time]
  );

  const accentPaths: PathData[] = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: generateDeterministicId("accent", i),
        d: generateAestheticPath(i, position, "accent", time),
        opacity: 0.08 + i * 0.012,
        width: 2 + i * 0.2,
      })),
    [position, time]
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float-primary {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-8px) scale(1.02); }
          }
          @keyframes float-secondary {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-5px) scale(1.01); }
          }
          @keyframes float-accent {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-3px) scale(1.005); }
          }
          @keyframes gradient-wave {
            0% { 
              x1: -50%; x2: 50%; 
            }
            50% { 
              x1: 25%; x2: 125%; 
            }
            100% { 
              x1: -50%; x2: 50%; 
            }
          }
          @keyframes color-shift-start {
            0% { stop-color: rgba(147, 51, 234, 0.5); }
            25% { stop-color: rgba(59, 130, 246, 0.5); }
            50% { stop-color: rgba(16, 185, 129, 0.5); }
            75% { stop-color: rgba(236, 72, 153, 0.5); }
            100% { stop-color: rgba(147, 51, 234, 0.5); }
          }
          @keyframes color-shift-mid {
            0% { stop-color: rgba(16, 185, 129, 0.5); }
            25% { stop-color: rgba(236, 72, 153, 0.5); }
            50% { stop-color: rgba(147, 51, 234, 0.5); }
            75% { stop-color: rgba(59, 130, 246, 0.5); }
            100% { stop-color: rgba(16, 185, 129, 0.5); }
          }
          @keyframes color-shift-end {
            0% { stop-color: rgba(236, 72, 153, 0.5); }
            25% { stop-color: rgba(147, 51, 234, 0.5); }
            50% { stop-color: rgba(59, 130, 246, 0.5); }
            75% { stop-color: rgba(16, 185, 129, 0.5); }
            100% { stop-color: rgba(236, 72, 153, 0.5); }
          }
          .primary-waves {
            animation: float-primary 12s ease-in-out infinite;
          }
          .secondary-waves {
            animation: float-secondary 9s ease-in-out infinite;
          }
          .accent-waves {
            animation: float-accent 6s ease-in-out infinite;
          }
          .animated-gradient {
            animation: gradient-wave 8s ease-in-out infinite;
          }
          .animated-stop-start {
            animation: color-shift-start 12s ease-in-out infinite;
          }
          .animated-stop-mid {
            animation: color-shift-mid 12s ease-in-out infinite;
          }
          .animated-stop-end {
            animation: color-shift-end 12s ease-in-out infinite;
          }
        `
      }} />
      
      <svg
        className="w-full h-full text-slate-950/40 dark:text-white/40"
        viewBox="-2400 -800 4800 1600"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <title>Background Paths</title>
        <defs>
          <linearGradient
            id="animatedGradient1"
            className="animated-gradient"
            x1="-50%"
            y1="0%"
            x2="50%"
            y2="0%"
          >
            <stop offset="0%" className="animated-stop-start" stopColor="rgba(147, 51, 234, 0.5)" />
            <stop offset="50%" className="animated-stop-mid" stopColor="rgba(16, 185, 129, 0.5)" />
            <stop offset="100%" className="animated-stop-end" stopColor="rgba(236, 72, 153, 0.5)" />
          </linearGradient>
          <linearGradient
            id="animatedGradient2"
            className="animated-gradient"
            x1="-50%"
            y1="0%"
            x2="50%"
            y2="0%"
          >
            <stop offset="0%" className="animated-stop-end" stopColor="rgba(236, 72, 153, 0.5)" />
            <stop offset="50%" className="animated-stop-start" stopColor="rgba(147, 51, 234, 0.5)" />
            <stop offset="100%" className="animated-stop-mid" stopColor="rgba(16, 185, 129, 0.5)" />
          </linearGradient>
          <linearGradient
            id="animatedGradient3"
            className="animated-gradient"
            x1="-50%"
            y1="0%"
            x2="50%"
            y2="0%"
          >
            <stop offset="0%" className="animated-stop-mid" stopColor="rgba(16, 185, 129, 0.5)" />
            <stop offset="50%" className="animated-stop-end" stopColor="rgba(236, 72, 153, 0.5)" />
            <stop offset="100%" className="animated-stop-start" stopColor="rgba(147, 51, 234, 0.5)" />
          </linearGradient>
        </defs>

        <g className="primary-waves">
          {primaryPaths.map((path) => (
            <path
              key={path.id}
              d={path.d}
              stroke="url(#animatedGradient1)"
              strokeWidth={path.width}
              strokeLinecap="round"
              style={{ opacity: path.opacity }}
              fill="none"
            />
          ))}
        </g>

        <g className="secondary-waves" style={{ opacity: 0.8 }}>
          {secondaryPaths.map((path) => (
            <path
              key={path.id}
              d={path.d}
              stroke="url(#animatedGradient2)"
              strokeWidth={path.width}
              strokeLinecap="round"
              style={{ opacity: path.opacity }}
              fill="none"
            />
          ))}
        </g>

        <g className="accent-waves" style={{ opacity: 0.6 }}>
          {accentPaths.map((path) => (
            <path
              key={path.id}
              d={path.d}
              stroke="url(#animatedGradient3)"
              strokeWidth={path.width}
              strokeLinecap="round"
              style={{ opacity: path.opacity }}
              fill="none"
            />
          ))}
        </g>
      </svg>
    </div>
  );
});

export default memo(function BackgroundPaths() {
  return <FloatingPaths position={1} />;
});