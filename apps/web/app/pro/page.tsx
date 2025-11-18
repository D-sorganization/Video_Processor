'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import EnhancedVideoPlayer from '@/components/video/EnhancedVideoPlayer';
import VideoUploader from '@/components/video/VideoUploader';
import EditorCanvas, { DrawingTool, EditorCanvasHandle } from '@/components/video/EditorCanvas';
import ProfessionalToolbar from '@/components/golf/ProfessionalToolbar';
import GridOverlay from '@/components/golf/GridOverlay';
import MeasurementTools, { MeasurementType } from '@/components/golf/MeasurementTools';
import SwingMetrics from '@/components/golf/SwingMetrics';
import FrameNavigator from '@/components/video/FrameNavigator';
import AudioRecorder from '@/components/audio/AudioRecorder';
import VideoEditor from '@/components/video/VideoEditor';
import PoseDetector from '@/components/ai/PoseDetector';
import AnnotationExportComponent from '@/components/annotations/AnnotationExport';
import { useVideoFrame } from '@/hooks/useVideoFrame';
import { logger } from '@/lib/logger';
import { getUserMessage, VideoProcessingError, AudioRecordingError } from '@/lib/errors';
import { fabric } from 'fabric';

export default function ProVideoProcessor() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [currentTool, setCurrentTool] = useState<string>('select');
  const [currentColor, setCurrentColor] = useState('#00ff00');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [annotations, setAnnotations] = useState<fabric.Object[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [poseDetectionEnabled, setPoseDetectionEnabled] = useState(false);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [measurementEnabled, setMeasurementEnabled] = useState(false);
  const [showMetrics, setShowMetrics] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const canvasRef = useRef<EditorCanvasHandle>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const DEFAULT_FPS = 30;

  const { getCurrentFrame, getTotalFrames } = useVideoFrame({
    videoElement,
    fps: DEFAULT_FPS,
  });

  const handleVideoUpload = (file: File) => {
    try {
      if (!file) {
        throw new VideoProcessingError('No file provided');
      }

      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);

      logger.info('Video uploaded successfully', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      toast.success(`Video loaded: ${file.name}`);
    } catch (error) {
      logger.error('Failed to upload video', { error, file });
      toast.error(getUserMessage(error));
    }
  };

  const handleClearVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl(null);
    setVideoElement(null);
    setAnnotations([]);
    setCurrentFrame(0);
    setTotalFrames(0);
    setPoseDetectionEnabled(false);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
    const frame = getCurrentFrame();
    setCurrentFrame(frame);
  };

  const handleVideoElementReady = (element: HTMLVideoElement | null) => {
    setVideoElement(element);
    videoRef.current = element;
    if (element) {
      const frames = getTotalFrames();
      setTotalFrames(frames);
    }
  };

  const handleAnnotationChange = (newAnnotations: fabric.Object[]) => {
    setAnnotations(newAnnotations);
  };

  const handleAudioRecorded = (audioBlob: Blob, startTime: number) => {
    try {
      if (!audioBlob || audioBlob.size === 0) {
        throw new AudioRecordingError('Empty audio blob received', {
          startTime,
          blobSize: audioBlob?.size,
        });
      }

      const audioUrl = URL.createObjectURL(audioBlob);

      logger.info('Audio recorded successfully', {
        audioUrl,
        startTime,
        duration: audioBlob.size,
        videoId: videoFile?.name,
      });

      toast.success('Audio commentary recorded successfully');
    } catch (error) {
      logger.error('Failed to process audio recording', { error, audioBlob, startTime });
      toast.error(getUserMessage(error));
    }
  };

  const handleVideoExport = (blob: Blob) => {
    try {
      if (!blob || blob.size === 0) {
        throw new VideoProcessingError('Empty video blob received', {
          blobSize: blob?.size,
        });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited-${videoFile?.name || 'video.mp4'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      logger.info('Video exported successfully', {
        fileName: a.download,
        fileSize: blob.size,
      });

      toast.success(`Video exported: ${a.download}`);
    } catch (error) {
      logger.error('Failed to export video', { error, blob });
      toast.error(getUserMessage(error));
    }
  };

  const handlePoseDetected = (landmarks: unknown) => {
    try {
      logger.debug('Pose detected', {
        landmarks,
        videoId: videoFile?.name,
        currentTime,
        currentFrame,
      });
    } catch (error) {
      logger.error('Failed to process pose detection', { error, landmarks });
    }
  };

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  useEffect(() => {
    if (canvasRef.current && ['select', 'line', 'arrow', 'freehand', 'text'].includes(currentTool)) {
      canvasRef.current.setTool(currentTool as DrawingTool);
      canvasRef.current.setColor(currentColor);
      canvasRef.current.setStrokeWidth(strokeWidth);
    }
  }, [currentTool, currentColor, strokeWidth]);

  useEffect(() => {
    if (videoElement && totalFrames === 0) {
      const frames = getTotalFrames();
      setTotalFrames(frames);
    }
  }, [videoElement, totalFrames, getTotalFrames]);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-animated border-b border-border/50">
        <div className="max-w-[2000px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Golf Swing Pro Analyzer
              </h1>
              <p className="text-white/80 text-sm">
                Professional video analysis with advanced measurement tools
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="btn-glass text-white"
              >
                {sidebarCollapsed ? '→' : '←'} {sidebarCollapsed ? 'Show' : 'Hide'} Tools
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[2000px] mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Area */}
          <div className={`${sidebarCollapsed ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-6`}>
            {/* Video Player */}
            <div className="card-glass p-6 animate-scale-in">
              {videoUrl ? (
                <div className="space-y-4">
                  <div className="relative">
                    <EnhancedVideoPlayer
                      videoUrl={videoUrl}
                      onClear={handleClearVideo}
                      onTimeUpdate={handleTimeUpdate}
                      onVideoElementReady={handleVideoElementReady}
                    />

                    {/* Canvas Overlays */}
                    <div className="absolute inset-0 pointer-events-none" style={{ top: 0 }}>
                      <EditorCanvas
                        ref={canvasRef}
                        videoElement={videoElement}
                        currentTime={currentTime}
                        onAnnotationChange={handleAnnotationChange}
                      />

                      {gridEnabled && videoElement && (
                        <GridOverlay
                          width={videoElement.videoWidth}
                          height={videoElement.videoHeight}
                          gridSize={50}
                          showRuleOfThirds={true}
                          showCrosshair={true}
                          color={currentColor}
                          opacity={0.3}
                        />
                      )}

                      {measurementEnabled && videoElement && (
                        <MeasurementTools
                          videoElement={videoElement}
                          width={videoElement.videoWidth}
                          height={videoElement.videoHeight}
                          currentTool={currentTool as MeasurementType}
                          color={currentColor}
                        />
                      )}

                      {poseDetectionEnabled && (
                        <PoseDetector
                          videoElement={videoElement}
                          enabled={poseDetectionEnabled}
                          onPoseDetected={handlePoseDetected}
                          disabled={!videoUrl}
                        />
                      )}
                    </div>
                  </div>

                  {/* Frame Navigator */}
                  {videoElement && totalFrames > 0 && (
                    <div className="card p-4">
                      <FrameNavigator
                        videoElement={videoElement}
                        currentFrame={currentFrame}
                        totalFrames={totalFrames}
                        fps={30}
                        onFrameChange={setCurrentFrame}
                        disabled={!videoUrl}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <VideoUploader onVideoUpload={handleVideoUpload} />
              )}
            </div>

            {/* Metrics Dashboard */}
            {videoUrl && showMetrics && (
              <div className="card-glass p-6 animate-slide-in-bottom">
                <SwingMetrics showEstimates={true} />
              </div>
            )}

            {/* Quick Actions */}
            {videoUrl && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-glass p-4">
                  <AudioRecorder
                    videoElement={videoElement}
                    onRecordingComplete={handleAudioRecorded}
                    disabled={!videoUrl}
                  />
                </div>

                <div className="card-glass p-4">
                  <VideoEditor
                    videoFile={videoFile}
                    onExport={handleVideoExport}
                    disabled={!videoUrl}
                  />
                </div>

                <div className="card-glass p-4">
                  <AnnotationExportComponent
                    annotations={annotations}
                    currentFrame={currentFrame}
                    totalFrames={totalFrames}
                    videoId={videoFile?.name}
                    canvas={fabricCanvas}
                    disabled={!videoUrl}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {!sidebarCollapsed && (
            <div className="space-y-6 animate-slide-in-right">
              {/* Professional Toolbar */}
              <div className="card-glass p-6">
                <ProfessionalToolbar
                  currentTool={currentTool}
                  onToolChange={setCurrentTool}
                  currentColor={currentColor}
                  onColorChange={setCurrentColor}
                  strokeWidth={strokeWidth}
                  onStrokeWidthChange={setStrokeWidth}
                  gridEnabled={gridEnabled}
                  onGridToggle={() => setGridEnabled(!gridEnabled)}
                  measurementEnabled={measurementEnabled}
                  onMeasurementToggle={() => setMeasurementEnabled(!measurementEnabled)}
                  disabled={!videoUrl}
                />
              </div>

              {/* AI Features */}
              <div className="card-glass p-6">
                <h3 className="text-sm font-semibold mb-4 gradient-text">AI Analysis</h3>

                <label className="flex items-center justify-between cursor-pointer group mb-4">
                  <span className="text-sm group-hover:text-primary transition-colors">
                    Pose Detection
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={poseDetectionEnabled}
                      onChange={(e) => setPoseDetectionEnabled(e.target.checked)}
                      disabled={!videoUrl}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-disabled:opacity-50 transition-colors"></div>
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm group-hover:text-primary transition-colors">
                    Show Metrics
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showMetrics}
                      onChange={(e) => setShowMetrics(e.target.checked)}
                      disabled={!videoUrl}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-disabled:opacity-50 transition-colors"></div>
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </div>
                </label>
              </div>

              {/* Video Info */}
              {videoFile && (
                <div className="card-glass p-6">
                  <h3 className="text-sm font-semibold mb-4 gradient-text">Video Info</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Filename</div>
                      <div className="font-medium truncate" title={videoFile.name}>
                        {videoFile.name}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Size</div>
                      <div className="font-medium">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Type</div>
                      <div className="font-medium">{videoFile.type}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Annotations</div>
                      <div className="font-medium">{annotations.length}</div>
                    </div>
                    {totalFrames > 0 && (
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Frames</div>
                        <div className="font-medium">
                          {totalFrames} ({(totalFrames / 30).toFixed(2)}s @ 30fps)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Tips */}
              <div className="card-glass p-6">
                <h3 className="text-sm font-semibold mb-4 gradient-text">Keyboard Shortcuts</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Play/Pause</span>
                    <kbd className="px-2 py-1 bg-muted rounded">Space</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Frame</span>
                    <kbd className="px-2 py-1 bg-muted rounded">→</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Prev Frame</span>
                    <kbd className="px-2 py-1 bg-muted rounded">←</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Delete</span>
                    <kbd className="px-2 py-1 bg-muted rounded">Del</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
