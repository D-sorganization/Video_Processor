'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export type MeasurementType = 'angle' | 'distance' | 'line' | 'circle' | 'none';

interface Point {
  x: number;
  y: number;
}

interface Measurement {
  id: string;
  type: MeasurementType;
  points: Point[];
  value: number;
  unit: string;
  color: string;
}

interface MeasurementToolsProps {
  videoElement: HTMLVideoElement | null;
  width: number;
  height: number;
  currentTool: MeasurementType;
  color?: string;
  onMeasurementComplete?: (measurement: Measurement) => void;
}

export default function MeasurementTools({
  videoElement,
  width,
  height,
  currentTool,
  color = '#00ff00',
  onMeasurementComplete,
}: MeasurementToolsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  const getCanvasCoordinates = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const calculateAngle = useCallback((points: Point[]): number => {
    if (points.length !== 3) return 0;

    const [p1, p2, p3] = points;
    const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
    let angle = Math.abs(angle1 - angle2) * (180 / Math.PI);

    if (angle > 180) {
      angle = 360 - angle;
    }

    return Math.round(angle * 10) / 10;
  }, []);

  const calculateDistance = useCallback((p1: Point, p2: Point): number => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const drawMeasurements = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw completed measurements
    measurements.forEach((measurement) => {
      ctx.strokeStyle = measurement.color;
      ctx.fillStyle = measurement.color;
      ctx.lineWidth = 2;

      if (measurement.type === 'angle' && measurement.points.length === 3) {
        const [p1, p2, p3] = measurement.points;

        // Draw lines
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.stroke();

        // Draw points
        [p1, p2, p3].forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Draw angle arc
        const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
        const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, 30, angle1, angle2);
        ctx.stroke();

        // Draw angle value
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(`${measurement.value}°`, p2.x + 40, p2.y - 10);
        ctx.fillText(`${measurement.value}°`, p2.x + 40, p2.y - 10);
      } else if (measurement.type === 'distance' && measurement.points.length === 2) {
        const [p1, p2] = measurement.points;

        // Draw line
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Draw endpoints
        [p1, p2].forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Draw distance value
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(`${Math.round(measurement.value)}px`, midX + 10, midY - 10);
        ctx.fillText(`${Math.round(measurement.value)}px`, midX + 10, midY - 10);
      } else if (measurement.type === 'line' && measurement.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(measurement.points[0].x, measurement.points[0].y);
        measurement.points.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      } else if (measurement.type === 'circle' && measurement.points.length === 2) {
        const [center, edge] = measurement.points;
        const radius = calculateDistance(center, edge);
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });

    // Draw current measurement in progress
    if (currentPoints.length > 0) {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;

      currentPoints.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });

      if (currentTool === 'angle' && currentPoints.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        currentPoints.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      } else if (currentTool === 'distance' && currentPoints.length === 2) {
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        ctx.lineTo(currentPoints[1].x, currentPoints[1].y);
        ctx.stroke();
      }
    }
  }, [measurements, currentPoints, currentTool, color, calculateDistance]);

  useEffect(() => {
    drawMeasurements();
  }, [drawMeasurements]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (currentTool === 'none') return;

      const point = getCanvasCoordinates(e);
      setIsDrawing(true);
      setCurrentPoints([point]);
    },
    [currentTool, getCanvasCoordinates]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || currentTool === 'none') return;

      const point = getCanvasCoordinates(e);

      if (currentTool === 'distance' && currentPoints.length === 1) {
        setCurrentPoints([currentPoints[0], point]);
      }
    },
    [isDrawing, currentTool, currentPoints, getCanvasCoordinates]
  );

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (currentTool === 'none') return;

      const point = getCanvasCoordinates(e);

      if (currentTool === 'angle') {
        const newPoints = [...currentPoints, point];
        setCurrentPoints(newPoints);

        if (newPoints.length === 3) {
          const angle = calculateAngle(newPoints);
          const measurement: Measurement = {
            id: Date.now().toString(),
            type: 'angle',
            points: newPoints,
            value: angle,
            unit: '°',
            color,
          };
          setMeasurements([...measurements, measurement]);
          if (onMeasurementComplete) {
            onMeasurementComplete(measurement);
          }
          setCurrentPoints([]);
        }
      } else if (currentTool === 'distance') {
        const newPoints = [...currentPoints, point];
        setCurrentPoints(newPoints);

        if (newPoints.length === 2) {
          const distance = calculateDistance(newPoints[0], newPoints[1]);
          const measurement: Measurement = {
            id: Date.now().toString(),
            type: 'distance',
            points: newPoints,
            value: distance,
            unit: 'px',
            color,
          };
          setMeasurements([...measurements, measurement]);
          if (onMeasurementComplete) {
            onMeasurementComplete(measurement);
          }
          setCurrentPoints([]);
        }
      }
    },
    [
      currentTool,
      currentPoints,
      color,
      measurements,
      getCanvasCoordinates,
      calculateAngle,
      calculateDistance,
      onMeasurementComplete,
    ]
  );

  const clearMeasurements = useCallback(() => {
    setMeasurements([]);
    setCurrentPoints([]);
  }, []);

  useEffect(() => {
    if (videoElement && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoElement.videoWidth || width;
      canvas.height = videoElement.videoHeight || height;
    }
  }, [videoElement, width, height]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-auto cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        style={{ zIndex: 10 }}
      />
      {measurements.length > 0 && (
        <button
          onClick={clearMeasurements}
          className="absolute top-4 right-4 btn-glass text-white z-20"
        >
          Clear Measurements
        </button>
      )}
    </>
  );
}
