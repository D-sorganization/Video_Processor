'use client';

import AudioRecorder from '@/components/audio/AudioRecorder';
import ToolsPanel from '@/components/tools/ToolsPanel';
import EditorCanvas, { DrawingTool, EditorCanvasHandle } from '@/components/video/EditorCanvas';
import VideoEditor from '@/components/video/VideoEditor';
import VideoPlayer from '@/components/video/VideoPlayer';
import VideoUploader from '@/components/video/VideoUploader';
import { fabric } from 'fabric';
import { useEffect, useRef, useState } from 'react';

export default function HomePage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [currentTool, setCurrentTool] = useState<DrawingTool>('select');
  const [currentColor, setCurrentColor] = useState('#FF0000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [annotations, setAnnotations] = useState<fabric.Object[]>([]);
  const canvasRef = useRef<EditorCanvasHandle>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoUpload = (file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const handleClearVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl(null);
    setVideoElement(null);
    setAnnotations([]);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleVideoElementReady = (element: HTMLVideoElement | null) => {
    setVideoElement(element);
    videoRef.current = element;
  };

  const handleAnnotationChange = (newAnnotations: fabric.Object[]) => {
    setAnnotations(newAnnotations);
  };

  const handleAudioRecorded = (audioBlob: Blob, startTime: number) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    console.log('Audio recorded:', { audioUrl, startTime, duration: audioBlob.size });
  };

  const handleVideoExport = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edited-${videoFile?.name || 'video.mp4'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.setTool(currentTool);
      canvasRef.current.setColor(currentColor);
      canvasRef.current.setStrokeWidth(strokeWidth);
    }
  }, [currentTool, currentColor, strokeWidth]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Golf Swing Video Analyzer
          </h1>
          <p className="text-gray-600">
            Upload and analyze your golf swing videos with AI-powered tools
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {videoUrl ? (
                <div className="space-y-4">
                  <div className="relative">
                    <VideoPlayer
                      videoUrl={videoUrl}
                      onClear={handleClearVideo}
                      onTimeUpdate={handleTimeUpdate}
                      onVideoElementReady={handleVideoElementReady}
                    />
                    <EditorCanvas
                      ref={canvasRef}
                      videoElement={videoElement}
                      currentTime={currentTime}
                      onAnnotationChange={handleAnnotationChange}
                    />
                  </div>
                </div>
              ) : (
                <VideoUploader onVideoUpload={handleVideoUpload} />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <ToolsPanel
                currentTool={currentTool}
                onToolChange={setCurrentTool}
                currentColor={currentColor}
                onColorChange={setCurrentColor}
                strokeWidth={strokeWidth}
                onStrokeWidthChange={setStrokeWidth}
                onClear={() => canvasRef.current?.clearCanvas()}
                onDeleteSelected={() => canvasRef.current?.deleteSelected()}
                disabled={!videoUrl}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <AudioRecorder
                videoElement={videoElement}
                onRecordingComplete={handleAudioRecorded}
                disabled={!videoUrl}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <VideoEditor
                videoFile={videoFile}
                onExport={handleVideoExport}
                disabled={!videoUrl}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Video Info
              </h2>
              {videoFile ? (
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Name:</span> {videoFile.name}
                  </p>
                  <p>
                    <span className="font-medium">Size:</span>{' '}
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <p>
                    <span className="font-medium">Type:</span> {videoFile.type}
                  </p>
                  <p>
                    <span className="font-medium">Annotations:</span>{' '}
                    {annotations.length}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No video uploaded</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
