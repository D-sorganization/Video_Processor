'use client';

import { useState, useEffect } from 'react';

export interface SwingMetricData {
  clubSpeed?: number; // mph
  ballSpeed?: number; // mph
  launchAngle?: number; // degrees
  spinRate?: number; // rpm
  carryDistance?: number; // yards
  totalDistance?: number; // yards
  smashFactor?: number;
  attackAngle?: number; // degrees
  clubPath?: number; // degrees
  faceAngle?: number; // degrees
  swingTempo?: number; // ratio
  backswingTime?: number; // seconds
  downswingTime?: number; // seconds
}

interface SwingMetricsProps {
  metrics?: SwingMetricData;
  showEstimates?: boolean;
}

export default function SwingMetrics({ metrics, showEstimates = false }: SwingMetricsProps) {
  const [displayMetrics, setDisplayMetrics] = useState<SwingMetricData>({});

  useEffect(() => {
    if (metrics) {
      setDisplayMetrics(metrics);
    } else if (showEstimates) {
      // Provide estimated metrics for demo purposes
      setDisplayMetrics({
        clubSpeed: 95,
        ballSpeed: 140,
        launchAngle: 12.5,
        spinRate: 2800,
        carryDistance: 245,
        totalDistance: 260,
        smashFactor: 1.47,
        attackAngle: -3.2,
        clubPath: 2.1,
        faceAngle: 0.5,
        swingTempo: 3.0,
        backswingTime: 0.75,
        downswingTime: 0.25,
      });
    }
  }, [metrics, showEstimates]);

  const getQualityColor = (metric: keyof SwingMetricData, value: number): string => {
    switch (metric) {
      case 'smashFactor':
        return value >= 1.45 ? 'text-green-500' : value >= 1.40 ? 'text-yellow-500' : 'text-red-500';
      case 'clubSpeed':
        return value >= 100 ? 'text-green-500' : value >= 90 ? 'text-yellow-500' : 'text-red-500';
      case 'launchAngle':
        return value >= 10 && value <= 15 ? 'text-green-500' : value >= 8 && value <= 18 ? 'text-yellow-500' : 'text-red-500';
      case 'spinRate':
        return value >= 2500 && value <= 3000 ? 'text-green-500' : value >= 2000 && value <= 3500 ? 'text-yellow-500' : 'text-red-500';
      default:
        return 'text-foreground';
    }
  };

  const MetricCard = ({ label, value, unit, metric }: { label: string; value: number; unit: string; metric: keyof SwingMetricData }) => (
    <div className="card-glass p-4 rounded-lg">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-2xl font-bold ${getQualityColor(metric, value)}`}>
        {value.toFixed(metric === 'smashFactor' ? 2 : 1)}
        <span className="text-sm ml-1">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Swing Metrics</h3>
        {showEstimates && (
          <span className="text-xs text-yellow-500 bg-yellow-500/20 px-2 py-1 rounded">
            Estimated
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {displayMetrics.clubSpeed !== undefined && (
          <MetricCard
            label="Club Speed"
            value={displayMetrics.clubSpeed}
            unit="mph"
            metric="clubSpeed"
          />
        )}
        {displayMetrics.ballSpeed !== undefined && (
          <MetricCard
            label="Ball Speed"
            value={displayMetrics.ballSpeed}
            unit="mph"
            metric="ballSpeed"
          />
        )}
        {displayMetrics.smashFactor !== undefined && (
          <MetricCard
            label="Smash Factor"
            value={displayMetrics.smashFactor}
            unit=""
            metric="smashFactor"
          />
        )}
        {displayMetrics.launchAngle !== undefined && (
          <MetricCard
            label="Launch Angle"
            value={displayMetrics.launchAngle}
            unit="°"
            metric="launchAngle"
          />
        )}
        {displayMetrics.spinRate !== undefined && (
          <MetricCard
            label="Spin Rate"
            value={displayMetrics.spinRate}
            unit="rpm"
            metric="spinRate"
          />
        )}
        {displayMetrics.carryDistance !== undefined && (
          <MetricCard
            label="Carry"
            value={displayMetrics.carryDistance}
            unit="yds"
            metric="carryDistance"
          />
        )}
        {displayMetrics.totalDistance !== undefined && (
          <MetricCard
            label="Total"
            value={displayMetrics.totalDistance}
            unit="yds"
            metric="totalDistance"
          />
        )}
        {displayMetrics.attackAngle !== undefined && (
          <MetricCard
            label="Attack Angle"
            value={displayMetrics.attackAngle}
            unit="°"
            metric="attackAngle"
          />
        )}
        {displayMetrics.clubPath !== undefined && (
          <MetricCard
            label="Club Path"
            value={displayMetrics.clubPath}
            unit="°"
            metric="clubPath"
          />
        )}
        {displayMetrics.faceAngle !== undefined && (
          <MetricCard
            label="Face Angle"
            value={displayMetrics.faceAngle}
            unit="°"
            metric="faceAngle"
          />
        )}
        {displayMetrics.swingTempo !== undefined && (
          <MetricCard
            label="Tempo Ratio"
            value={displayMetrics.swingTempo}
            unit=":1"
            metric="swingTempo"
          />
        )}
        {displayMetrics.backswingTime !== undefined && displayMetrics.downswingTime !== undefined && (
          <div className="col-span-2 card-glass p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-2">Swing Timing</div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-muted-foreground">Backswing</div>
                <div className="text-xl font-bold text-accent">
                  {displayMetrics.backswingTime.toFixed(2)}s
                </div>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div>
                <div className="text-sm text-muted-foreground">Downswing</div>
                <div className="text-xl font-bold text-primary">
                  {displayMetrics.downswingTime.toFixed(2)}s
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card-glass p-3 rounded-lg">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-muted-foreground">Excellent</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-muted-foreground">Good</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-muted-foreground">Needs Work</span>
          </div>
        </div>
      </div>
    </div>
  );
}
