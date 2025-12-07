'use client';

import { useState, useRef, useEffect } from 'react';
import EnhancedVideoPlayer from '@/components/video/EnhancedVideoPlayer';

interface SwingComparisonProps {
  video1?: File;
  video2?: File;
  onClose?: () => void;
}

export default function SwingComparison({ video1, video2, onClose }: SwingComparisonProps) {
  const [url1, setUrl1] = useState<string | null>(null);
  const [url2, setUrl2] = useState<string | null>(null);
  const [syncPlayback, setSyncPlayback] = useState(true);
  const [showDifferences, setShowDifferences] = useState(false);
  const video1Ref = useRef<HTMLVideoElement | null>(null);
  const video2Ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (video1) {
      const url = URL.createObjectURL(video1);
      setUrl1(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [video1]);

  useEffect(() => {
    if (video2) {
      const url = URL.createObjectURL(video2);
      setUrl2(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [video2]);

  const handleVideo1Ready = (element: HTMLVideoElement | null) => {
    video1Ref.current = element;
  };

  const handleVideo2Ready = (element: HTMLVideoElement | null) => {
    video2Ref.current = element;
  };

  const handleTimeUpdate = (_time: number) => {
    if (syncPlayback && video1Ref.current && video2Ref.current) {
      const video = video1Ref.current;
      const otherVideo = video2Ref.current;

      if (Math.abs(video.currentTime - otherVideo.currentTime) > 0.1) {
        otherVideo.currentTime = video.currentTime;
      }
    }
  };

  const handlePlayPause = () => {
    if (syncPlayback) {
      const video1 = video1Ref.current;
      const video2 = video2Ref.current;

      if (video1 && video2) {
        if (video1.paused) {
          video1.play();
          video2.play();
        } else {
          video1.pause();
          video2.pause();
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Swing Comparison</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={syncPlayback}
                onChange={(e) => setSyncPlayback(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Sync Playback</span>
            </label>

            <label className="flex items-center gap-2 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={showDifferences}
                onChange={(e) => setShowDifferences(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Show Differences</span>
            </label>

            {onClose && (
              <button
                onClick={onClose}
                className="btn-glass text-white"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Video Comparison Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Video 1 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Video 1 - Your Swing</h3>
              <span className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded">
                Current
              </span>
            </div>
            {url1 ? (
              <EnhancedVideoPlayer
                videoUrl={url1}
                onVideoElementReady={handleVideo1Ready}
                onTimeUpdate={handleTimeUpdate}
              />
            ) : (
              <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📹</div>
                  <div>No video selected</div>
                </div>
              </div>
            )}

            {/* Metrics for Video 1 */}
            {url1 && (
              <div className="card-glass p-4 space-y-2 text-white">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Club Speed</span>
                  <span className="font-semibold text-green-400">95 mph</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Launch Angle</span>
                  <span className="font-semibold text-green-400">12.5°</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Carry Distance</span>
                  <span className="font-semibold text-green-400">245 yds</span>
                </div>
              </div>
            )}
          </div>

          {/* Video 2 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Video 2 - Pro Reference</h3>
              <span className="text-xs text-blue-400 bg-blue-400/20 px-2 py-1 rounded">
                Reference
              </span>
            </div>
            {url2 ? (
              <EnhancedVideoPlayer
                videoUrl={url2}
                onVideoElementReady={handleVideo2Ready}
              />
            ) : (
              <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📹</div>
                  <div>No video selected</div>
                </div>
              </div>
            )}

            {/* Metrics for Video 2 */}
            {url2 && (
              <div className="card-glass p-4 space-y-2 text-white">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Club Speed</span>
                  <span className="font-semibold text-blue-400">108 mph</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Launch Angle</span>
                  <span className="font-semibold text-blue-400">13.2°</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Carry Distance</span>
                  <span className="font-semibold text-blue-400">285 yds</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Difference Analysis */}
        {showDifferences && url1 && url2 && (
          <div className="mt-6 card-glass p-6">
            <h3 className="text-white font-semibold mb-4">Comparative Analysis</h3>
            <div className="grid grid-cols-3 gap-4 text-white">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-2">Club Speed Difference</div>
                <div className="text-2xl font-bold text-yellow-400">+13 mph</div>
                <div className="text-xs text-gray-400 mt-1">Reference faster</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-2">Launch Angle Difference</div>
                <div className="text-2xl font-bold text-green-400">+0.7°</div>
                <div className="text-xs text-gray-400 mt-1">Similar launch</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-2">Distance Gap</div>
                <div className="text-2xl font-bold text-red-400">-40 yds</div>
                <div className="text-xs text-gray-400 mt-1">Room for improvement</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-primary/20 border border-primary rounded-lg">
              <div className="text-sm text-white">
                <strong>Key Insights:</strong>
                <ul className="mt-2 space-y-1 text-gray-300 list-disc list-inside">
                  <li>Focus on increasing club head speed through better rotation</li>
                  <li>Launch angle is optimal - maintain current technique</li>
                  <li>Additional speed could add 30-40 yards to your drive</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Sync Controls */}
        {syncPlayback && url1 && url2 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handlePlayPause}
              className="btn-primary px-8 py-3 text-lg"
            >
              Play/Pause Both
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
