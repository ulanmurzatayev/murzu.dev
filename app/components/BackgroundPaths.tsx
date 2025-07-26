"use client";

/**
 * Adapted from KokonutUI background-paths component
 * @author: @dorian_baffier (original), adapted for Tailwind v4
 * @description: Background Paths with hydration-safe implementation
 * @version: 1.0.0 (adapted)
 * @license: MIT
 * @website: https://kokonutui.com
 */

import { memo, useMemo } from "react";

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
  type: "primary" | "secondary" | "accent"
): string {
  const baseAmplitude = type === "primary" ? 150 : type === "secondary" ? 100 : 60;
  const phase = index * 0.2;
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
    const wave1 = fixedSin(progress * Math.PI * 3 + phase) * (baseAmplitude * 0.7 * amplitudeFactor);
    const wave2 = fixedCos(progress * Math.PI * 4 + phase) * (baseAmplitude * 0.3 * amplitudeFactor);
    const wave3 = fixedSin(progress * Math.PI * 2 + phase) * (baseAmplitude * 0.2 * amplitudeFactor);

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
  // Match original path counts: 12 primary, 15 secondary, 10 accent
  const primaryPaths: PathData[] = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: generateDeterministicId("primary", i),
        d: generateAestheticPath(i, position, "primary"),
        opacity: 0.15 + i * 0.02,
        width: 4 + i * 0.3,
      })),
    [position]
  );

  const secondaryPaths: PathData[] = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: generateDeterministicId("secondary", i),
        d: generateAestheticPath(i, position, "secondary"),
        opacity: 0.12 + i * 0.015,
        width: 3 + i * 0.25,
      })),
    [position]
  );

  const accentPaths: PathData[] = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: generateDeterministicId("accent", i),
        d: generateAestheticPath(i, position, "accent"),
        opacity: 0.08 + i * 0.012,
        width: 2 + i * 0.2,
      })),
    [position]
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float-primary {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
          @keyframes float-secondary {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes float-accent {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
          .primary-waves {
            animation: float-primary 8s ease-in-out infinite;
          }
          .secondary-waves {
            animation: float-secondary 6s ease-in-out infinite;
          }
          .accent-waves {
            animation: float-accent 4s ease-in-out infinite;
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
            id="sharedGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="rgba(147, 51, 234, 0.5)" />
            <stop offset="50%" stopColor="rgba(236, 72, 153, 0.5)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.5)" />
          </linearGradient>
        </defs>

        <g className="primary-waves">
          {primaryPaths.map((path) => (
            <path
              key={path.id}
              d={path.d}
              stroke="url(#sharedGradient)"
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
              stroke="url(#sharedGradient)"
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
              stroke="url(#sharedGradient)"
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