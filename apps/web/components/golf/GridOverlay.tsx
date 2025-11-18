'use client';

import { useEffect, useRef } from 'react';

interface GridOverlayProps {
  width: number;
  height: number;
  gridSize?: number;
  showCrosshair?: boolean;
  showRuleOfThirds?: boolean;
  showDiagonals?: boolean;
  color?: string;
  opacity?: number;
}

export default function GridOverlay({
  width,
  height,
  gridSize = 50,
  showCrosshair = false,
  showRuleOfThirds = false,
  showDiagonals = false,
  color = '#00ff00',
  opacity = 0.5,
}: GridOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = opacity;

    // Draw grid
    if (gridSize > 0) {
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Draw rule of thirds
    if (showRuleOfThirds) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;

      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(width / 3, 0);
      ctx.lineTo(width / 3, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo((width * 2) / 3, 0);
      ctx.lineTo((width * 2) / 3, height);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, height / 3);
      ctx.lineTo(width, height / 3);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, (height * 2) / 3);
      ctx.lineTo(width, (height * 2) / 3);
      ctx.stroke();

      // Draw intersection points
      ctx.fillStyle = color;
      const points = [
        { x: width / 3, y: height / 3 },
        { x: (width * 2) / 3, y: height / 3 },
        { x: width / 3, y: (height * 2) / 3 },
        { x: (width * 2) / 3, y: (height * 2) / 3 },
      ];

      points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Draw center crosshair
    if (showCrosshair) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;

      const centerX = width / 2;
      const centerY = height / 2;
      const crosshairSize = 20;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - crosshairSize);
      ctx.lineTo(centerX, centerY + crosshairSize);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(centerX - crosshairSize, centerY);
      ctx.lineTo(centerX + crosshairSize, centerY);
      ctx.stroke();

      // Center circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw diagonals
    if (showDiagonals) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width, 0);
      ctx.lineTo(0, height);
      ctx.stroke();

      ctx.setLineDash([]);
    }

    ctx.globalAlpha = 1;
  }, [width, height, gridSize, showCrosshair, showRuleOfThirds, showDiagonals, color, opacity]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
}
