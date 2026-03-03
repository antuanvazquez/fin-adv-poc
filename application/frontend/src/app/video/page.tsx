'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Play, Pause, Maximize, Minimize, Volume2, VolumeX, RotateCcw } from 'lucide-react';

const SPEEDS = [0.75, 1, 1.2, 1.5, 1.75, 2];
const DEFAULT_SPEED = 1.2;
const SOURCE_DURATION_S = 578; // 9m 38s at 1x

function fmtTime(seconds: number) {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${ss.toString().padStart(2, '0')}`;
}

function estimatedRemaining(currentTime: number, rate: number) {
  const remaining = Math.max(0, SOURCE_DURATION_S - currentTime) / rate;
  return fmtTime(remaining);
}

export default function VideoPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(SOURCE_DURATION_S);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);

  // Apply playback rate on mount and when speed changes
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = speed;
    // preservesPitch is standard; webkit prefix for older Safari
    v.preservesPitch = true;
    (v as HTMLVideoElement & { webkitPreservesPitch?: boolean }).webkitPreservesPitch = true;
  }, [speed]);

  // Orientation detection
  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight);
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);
    return () => {
      document.removeEventListener('fullscreenchange', onFs);
      document.removeEventListener('webkitfullscreenchange', onFs);
    };
  }, []);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    if (!playing) {
      setShowControls(true);
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    } else {
      resetHideTimer();
    }
  }, [playing, resetHideTimer]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
    } else {
      v.pause();
    }
    resetHideTimer();
  }, [resetHideTimer]);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await (el.requestFullscreen?.() ?? (el as HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen?.());
    } else {
      await (document.exitFullscreen?.() ?? (document as Document & { webkitExitFullscreen?: () => void }).webkitExitFullscreen?.());
    }
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
    resetHideTimer();
  };

  const restart = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play();
    resetHideTimer();
  };

  const adjustedDuration = duration / speed;
  const adjustedRemaining = estimatedRemaining(currentTime, speed);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // On mobile landscape, overlay fullscreen styling
  const mobileFullscreen = isLandscape && !fullscreen;

  return (
    <div
      className={
        mobileFullscreen
          ? 'fixed inset-0 z-50 bg-black flex flex-col'
          : 'min-h-screen flex flex-col'
      }
    >
      {/* Nav — hidden in mobile landscape */}
      {!mobileFullscreen && (
        <nav className="sticky top-0 z-20 backdrop-blur-md bg-[#0A0F1C]/80 border-b border-[#1E2A45]/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[#8B8FA3] hover:text-[#C9A962] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[#8B8FA3] hover:text-[#C9A962] transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </nav>
      )}

      {/* Main content */}
      <div
        className={
          mobileFullscreen
            ? 'flex-1 flex flex-col justify-center px-0'
            : 'flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12'
        }
      >
        {!mobileFullscreen && (
          <div className="w-full max-w-4xl mb-4 sm:mb-6 text-center">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#F0F0F5] mb-1">
              Intro Video
            </h1>
            <p className="text-sm text-[#8B8FA3]">
              Advisory Intelligence Platform — Partner Preview
            </p>
          </div>
        )}

        {/* Video container */}
        <div
          ref={containerRef}
          className={`relative bg-black group ${
            mobileFullscreen || fullscreen
              ? 'w-full h-full'
              : 'w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl shadow-black/60'
          }`}
          onMouseMove={resetHideTimer}
          onTouchStart={resetHideTimer}
          onClick={togglePlay}
          style={{ aspectRatio: mobileFullscreen || fullscreen ? undefined : '16/9' }}
        >
          <video
            ref={videoRef}
            src="/video.mp4"
            className="w-full h-full object-contain"
            playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? SOURCE_DURATION_S)}
            onEnded={() => setPlaying(false)}
          />

          {/* Controls overlay */}
          <div
            className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient scrim */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

            <div className="relative z-10 px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
              {/* Progress bar */}
              <div
                ref={progressRef}
                className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer group/bar"
                onClick={seekTo}
              >
                <div
                  className="h-full bg-[#C9A962] rounded-full relative transition-all duration-100 group-hover/bar:h-2"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#C9A962] rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Controls row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Play/pause */}
                  <button
                    onClick={togglePlay}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-white hover:text-[#C9A962] transition-colors"
                    aria-label={playing ? 'Pause' : 'Play'}
                  >
                    {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>

                  {/* Restart */}
                  <button
                    onClick={restart}
                    className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    aria-label="Restart"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Mute */}
                  <button
                    onClick={toggleMute}
                    className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    aria-label={muted ? 'Unmute' : 'Mute'}
                  >
                    {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  {/* Time */}
                  <span className="text-xs text-white/60 tabular-nums hidden sm:inline">
                    {fmtTime(currentTime / speed)} / {fmtTime(adjustedDuration)}
                  </span>
                  <span className="text-xs text-white/40 tabular-nums hidden sm:inline">
                    · {adjustedRemaining} left
                  </span>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Speed selector */}
                  <div className="flex items-center gap-0.5 bg-white/10 rounded-lg p-0.5">
                    {SPEEDS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSpeed(s)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                          speed === s
                            ? 'bg-[#C9A962] text-[#0A0F1C]'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {s}×
                      </button>
                    ))}
                  </div>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  >
                    {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Mobile time */}
              <div className="sm:hidden flex justify-between text-xs text-white/40 tabular-nums px-0.5">
                <span>{fmtTime(currentTime / speed)} / {fmtTime(adjustedDuration)}</span>
                <span>{adjustedRemaining} left</span>
              </div>
            </div>
          </div>

          {/* Big play button when paused */}
          {!playing && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/50 border border-white/20 flex items-center justify-center backdrop-blur-sm pointer-events-auto cursor-pointer hover:bg-black/70 transition-colors">
                <Play className="w-7 h-7 sm:w-9 sm:h-9 text-white ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Speed note below video */}
        {!mobileFullscreen && (
          <p className="text-xs text-[#4A5068] mt-4 text-center">
            Default speed is 1.2× — audio pitch is preserved at all speeds.
          </p>
        )}
      </div>
    </div>
  );
}
