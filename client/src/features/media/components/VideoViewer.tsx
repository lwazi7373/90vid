import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Play, Pause, Volume2, VolumeX,
  Maximize, Minimize, SkipForward,
} from "lucide-react";
import type { Video } from "../media.types";

interface VideoViewerProps {
  video: Video | null;
  onClose: () => void;
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

export const VideoViewer = ({ video, onClose }: VideoViewerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Reset state when video changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [video?.videoId]);

  // Auto-hide controls after 3s of inactivity
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
    resetHideTimer();
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const t = Number(e.target.value);
    v.currentTime = t;
    setCurrentTime(t);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = Number(e.target.value);
    v.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const skipForward = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(v.currentTime + 10, duration);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleEnded = () => setIsPlaying(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!video) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0d0e13] overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-8 h-20 shrink-0 bg-[#0d0e13]/85 backdrop-blur-md border-b border-[#424753]/30">
        <span className="font-['Manrope'] text-xl font-extrabold tracking-tighter text-[#e3e1e9]">
          The Vault
        </span>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-[#292a2f] transition-all duration-300 group"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-[#9497a1] group-hover:text-[#e3e1e9]">
            Close
          </span>
          <X size={16} className="text-[#9497a1] group-hover:text-[#e3e1e9]" />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col items-center px-6 md:px-12 lg:px-24 py-10">

        {/* Video stage */}
        <div
          ref={containerRef}
          onMouseMove={resetHideTimer}
          onMouseLeave={() => isPlaying && setShowControls(false)}
          className="w-full max-w-6xl aspect-video relative group overflow-hidden rounded-xl shadow-[0_32px_64px_rgba(0,0,0,0.6)] bg-[#1E1F25] cursor-pointer"
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src={video.fileUrl}
            poster={video.thumbnailUrl ?? undefined}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            className="w-full h-full object-contain"
            preload="metadata"
          />

          {/* Gradient overlay + controls */}
          <div
            className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-500 ${showControls ? "opacity-100" : "opacity-0"}`}
            style={{ background: "linear-gradient(to top, rgba(13,14,19,0.9) 0%, rgba(13,14,19,0) 40%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div className="px-8 pb-4">
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 appearance-none rounded-full cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #acc7ff ${progress}%, #292a2f ${progress}%)`,
                }}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between px-8 pb-8">
              <div className="flex items-center gap-6">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="text-[#e3e1e9] hover:scale-110 transition-transform"
                >
                  {isPlaying
                    ? <Pause size={24} className="fill-[#e3e1e9]" />
                    : <Play size={24} className="fill-[#e3e1e9]" />
                  }
                </button>

                {/* Skip +10s */}
                <button
                  onClick={skipForward}
                  className="text-[#e3e1e9] hover:scale-110 transition-transform"
                >
                  <SkipForward size={20} />
                </button>

                {/* Mute toggle */}
                <button
                  onClick={toggleMute}
                  className="text-[#e3e1e9] hover:scale-110 transition-transform"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                {/* Volume slider */}
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 appearance-none rounded-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #acc7ff ${(isMuted ? 0 : volume) * 100}%, #292a2f ${(isMuted ? 0 : volume) * 100}%)`,
                  }}
                />

                {/* Time */}
                <span className="text-xs text-[#9497a1] font-medium font-['Inter'] tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-6">
                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="text-[#e3e1e9] hover:scale-110 transition-transform"
                >
                  {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Central play button — shown when paused */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 rounded-full bg-[#acc7ff]/10 border border-[#acc7ff]/20 backdrop-blur-md flex items-center justify-center">
                <Play size={36} className="text-[#acc7ff] fill-[#acc7ff] ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="w-full max-w-6xl mt-10 grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <h1 className="font-['Manrope'] font-extrabold text-3xl md:text-4xl text-[#e3e1e9] tracking-tight leading-tight">
              {video.title}
            </h1>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#292a2f] border-2 border-[#424753]/20 flex items-center justify-center text-lg font-bold text-[#acc7ff] shrink-0">
                {video.uploadedByName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-['Manrope'] font-bold text-[#e3e1e9]">{video.uploadedByName}</span>
                <span className="text-sm text-[#9497a1]">
                  Uploaded on{" "}
                  {new Date(video.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            {video.description && (
              <p className="text-[#9497a1] leading-relaxed max-w-3xl">{video.description}</p>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};
