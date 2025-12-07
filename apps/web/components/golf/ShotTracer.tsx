'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

interface ShotTracerProps {
  videoElement: HTMLVideoElement | null;
  width: number;
  height: number;
  enabled: boolean;
  color?: string;
  trailLength?: number;
  showTrajectory?: boolean;
}

export default function ShotTracer({
  videoElement,
  width,
  height,
  enabled,
  color = '#00ff00',
  trailLength = 20,
  showTrajectory = true,
}: ShotTracerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [ballPath, setBallPath] = useState<Point[]>([]);
  const [currentBallPosition, setCurrentBallPosition] = useState<Point | null>(null);
  const animationFrameRef = useRef<number>();

  const drawShotTracer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ball path
    if (ballPath.length > 0) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Draw trajectory line with gradient
      const gradient = ctx.createLinearGradient(
        ballPath[0].x,
        ballPath[0].y,
        ballPath[ballPath.length - 1].x,
        ballPath[ballPath.length - 1].y
      );
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, `${color}80`);
      gradient.addColorStop(1, `${color}40`);

      ctx.strokeStyle = gradient;

      ctx.beginPath();
      ctx.moveTo(ballPath[0].x, ballPath[0].y);

      for (let i = 1; i < ballPath.length; i++) {
        ctx.lineTo(ballPath[i].x, ballPath[i].y);
      }
      ctx.stroke();

      // Draw dots along the path
      ctx.fillStyle = color;
      ballPath.forEach((point, index) => {
        if (index % 3 === 0) {
          const size = 3 + (index / ballPath.length) * 2;
          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      // Draw arrow at the end
      if (ballPath.length >= 2) {
        const lastPoint = ballPath[ballPath.length - 1];
        const secondLastPoint = ballPath[ballPath.length - 2];
        const angle = Math.atan2(lastPoint.y - secondLastPoint.y, lastPoint.x - secondLastPoint.x);

        const arrowLength = 15;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(
          lastPoint.x - arrowLength * Math.cos(angle - Math.PI / 6),
          lastPoint.y - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          lastPoint.x - arrowLength * Math.cos(angle + Math.PI / 6),
          lastPoint.y - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }
    }

    // Draw current ball position
    if (currentBallPosition) {
      // Glow effect
      ctx.shadowBlur = 20;
      ctx.shadowColor = color;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(currentBallPosition.x, currentBallPosition.y, 8, 0, 2 * Math.PI);
      ctx.fill();

      // Reset shadow
      ctx.shadowBlur = 0;

      // Ball highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(currentBallPosition.x - 2, currentBallPosition.y - 2, 3, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw trajectory arc (if enabled and path exists)
    if (showTrajectory && ballPath.length >= 3) {
      ctx.strokeStyle = `${color}40`;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      ctx.moveTo(ballPath[0].x, ballPath[0].y);

      // Use quadratic curve for smooth trajectory
      for (let i = 1; i < ballPath.length - 1; i += 2) {
        const xc = (ballPath[i].x + ballPath[i + 1].x) / 2;
        const yc = (ballPath[i].y + ballPath[i + 1].y) / 2;
        ctx.quadraticCurveTo(ballPath[i].x, ballPath[i].y, xc, yc);
      }
      ctx.stroke();

      ctx.setLineDash([]);
    }

    // Draw statistics
    if (ballPath.length >= 2) {
      const distance = calculateTotalDistance(ballPath);
      const apex = findApex(ballPath);

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.font = 'bold 14px sans-serif';

      // Distance label
      const text = `${Math.round(distance)}px`;
      const textX = ballPath[ballPath.length - 1].x + 15;
      const textY = ballPath[ballPath.length - 1].y;

      ctx.strokeText(text, textX, textY);
      ctx.fillText(text, textX, textY);

      // Apex marker
      if (apex) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(apex.x, apex.y, 6, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.font = 'bold 12px sans-serif';
        ctx.strokeText('APEX', apex.x - 15, apex.y - 15);
        ctx.fillText('APEX', apex.x - 15, apex.y - 15);
      }
    }
  }, [enabled, ballPath, currentBallPosition, color, showTrajectory]);

  const calculateTotalDistance = (path: Point[]): number => {
    let total = 0;
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      total += Math.sqrt(dx * dx + dy * dy);
    }
    return total;
  };

  const findApex = (path: Point[]): Point | null => {
    if (path.length === 0) return null;
    return path.reduce((highest, point) => (point.y < highest.y ? point : highest), path[0]);
  };

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!enabled) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const point: Point = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };

      if (isTracking) {
        setBallPath((prev) => {
          const newPath = [...prev, point];
          return newPath.slice(-trailLength);
        });
        setCurrentBallPosition(point);
      } else {
        setBallPath([point]);
        setCurrentBallPosition(point);
        setIsTracking(true);
      }
    },
    [enabled, isTracking, trailLength]
  );

  const handleDoubleClick = useCallback(() => {
    setIsTracking(false);
  }, []);

  const clearTracer = useCallback(() => {
    setBallPath([]);
    setCurrentBallPosition(null);
    setIsTracking(false);
  }, []);

  useEffect(() => {
    if (videoElement && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoElement.videoWidth || width;
      canvas.height = videoElement.videoHeight || height;
    }
  }, [videoElement, width, height]);

  useEffect(() => {
    const animate = () => {
      drawShotTracer();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (enabled) {
      animate();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, drawShotTracer]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-auto cursor-crosshair"
        onClick={handleCanvasClick}
        onDoubleClick={handleDoubleClick}
        style={{ zIndex: 15 }}
      />
      {enabled && ballPath.length > 0 && (
        <div className="absolute top-4 right-4 z-20 space-y-2">
          <button onClick={clearTracer} className="btn-glass text-white block w-full">
            Clear Tracer
          </button>
          <div className="card-glass p-3 text-white text-xs">
            <div className="mb-1">
              <strong>Points:</strong> {ballPath.length}
            </div>
            <div className="mb-1">
              <strong>Distance:</strong> {Math.round(calculateTotalDistance(ballPath))}px
            </div>
            <div className="text-gray-300 text-[10px] mt-2">
              Click to trace • Double-click to finish
            </div>
          </div>
        </div>
      )}
    </>
  );
}
