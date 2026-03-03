'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Home,
  Play,
  Pause,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react';

const SPEEDS = [1, 1.2, 1.5, 2];
const DEFAULT_SPEED = 1.2;

function fmtTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${ss.toString().padStart(2, '0')}`;
}

export default function VideoPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [muted, setMuted] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedPicker, setShowSpeedPicker] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = speed;
    v.preservesPitch = true;
    (v as HTMLVideoElement & { webkitPreservesPitch?: boolean }).webkitPreservesPitch = true;
  }, [speed]);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => {
      const active = !!(
        document.fullscreenElement ||
        (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement
      );
      setIsFs(active);
    };
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
    };
  }, []);

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowControls(true);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
        setShowSpeedPicker(false);
      }
    }, 3500);
  }, []);

  useEffect(() => {
    if (!playing) {
      setShowControls(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    } else {
      scheduleHide();
    }
  }, [playing, scheduleHide]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }, []);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const enterFullscreen = async () => {
    // On iOS Safari, use the video element's native fullscreen for true fullscreen
    const v = videoRef.current;
    const el = containerRef.current;

    if (v && typeof (v as HTMLVideoElement & { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen === 'function') {
      (v as HTMLVideoElement & { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
      return;
    }

    if (el?.requestFullscreen) {
      await el.requestFullscreen();
    } else if ((el as HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> })?.webkitRequestFullscreen) {
      await (el as HTMLDivElement & { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
    }
  };

  const exitFullscreen = async () => {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if ((document as Document & { webkitExitFullscreen?: () => void }).webkitExitFullscreen) {
      (document as Document & { webkitExitFullscreen: () => void }).webkitExitFullscreen();
    }
  };

  const toggleFullscreen = () => {
    if (isFs) exitFullscreen();
    else enterFullscreen();
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar || !v.duration) return;
    const rect = bar.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
    scheduleHide();
  };

  const restart = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play();
    scheduleHide();
  };

  const handleContainerTap = (e: React.MouseEvent | React.TouchEvent) => {
    // Don't toggle play if tapping on controls
    if ((e.target as HTMLElement).closest('[data-controls]')) return;
    if (showControls && playing) {
      togglePlay();
    } else {
      scheduleHide();
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const adjustedCurrent = duration > 0 ? currentTime / speed : 0;
  const adjustedDuration = duration > 0 ? duration / speed : 0;
  const adjustedRemaining = adjustedDuration - adjustedCurrent;

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0F1C]">
      {/* Nav */}
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

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-0 sm:px-4 py-4 sm:py-12">
        <div className="w-full max-w-4xl mb-3 sm:mb-6 text-center px-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#F0F0F5] mb-1">
            Intro Video
          </h1>
          <p className="text-sm text-[#8B8FA3]">
            Advisory Intelligence Platform — Partner Preview
          </p>
        </div>

        {/* Video container */}
        <div
          ref={containerRef}
          className={`relative bg-black w-full max-w-4xl ${isFs ? '' : 'sm:rounded-2xl'} overflow-hidden`}
          style={{ aspectRatio: isFs ? undefined : '16/9' }}
          onClick={handleContainerTap}
          onTouchEnd={(e) => {
            if ((e.target as HTMLElement).closest('[data-controls]')) return;
            e.preventDefault();
            if (showControls && playing) {
              togglePlay();
            } else {
              scheduleHide();
            }
          }}
        >
          <video
            ref={videoRef}
            src="/video.mp4"
            className={`w-full h-full ${isFs ? 'object-contain' : 'object-contain'}`}
            playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
            onLoadedMetadata={() => {
              const v = videoRef.current;
              if (v) {
                setDuration(v.duration);
                v.playbackRate = speed;
              }
            }}
            onEnded={() => setPlaying(false)}
          />

          {/* Controls overlay */}
          <div
            data-controls
            className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Gradient scrim */}
            <div className="absolute inset-x-0 bottom-0 h-28 sm:h-36 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

            <div className="relative z-10 px-3 sm:px-5 pb-3 sm:pb-4 space-y-2.5">
              {/* Progress bar */}
              <div
                ref={progressRef}
                className="w-full h-[6px] sm:h-[5px] bg-white/20 rounded-full cursor-pointer touch-none"
                onClick={(e) => { e.stopPropagation(); seekTo(e); }}
                onTouchStart={(e) => { e.stopPropagation(); seekTo(e); }}
              >
                <div
                  className="h-full bg-[#C9A962] rounded-full relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-3 sm:h-3 bg-[#C9A962] rounded-full shadow-lg" />
                </div>
              </div>

              {/* Time row */}
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-white/50 tabular-nums px-0.5">
                <span>{fmtTime(adjustedCurrent)}</span>
                <span>{fmtTime(adjustedRemaining)} left</span>
              </div>

              {/* Controls row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {/* Play/pause */}
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePlay(); scheduleHide(); }}
                    className="w-10 h-10 flex items-center justify-center text-white active:scale-90 transition-transform"
                  >
                    {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>

                  {/* Restart */}
                  <button
                    onClick={(e) => { e.stopPropagation(); restart(); }}
                    className="w-10 h-10 flex items-center justify-center text-white/50 active:text-white transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Mute */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                    className="w-10 h-10 flex items-center justify-center text-white/50 active:text-white transition-colors"
                  >
                    {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {/* Speed */}
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowSpeedPicker(!showSpeedPicker); scheduleHide(); }}
                      className="h-8 px-2.5 rounded-lg bg-white/10 text-xs font-semibold text-white/80 active:bg-white/20 transition-colors"
                    >
                      {speed}×
                    </button>
                    {showSpeedPicker && (
                      <div className="absolute bottom-full right-0 mb-2 bg-[#1A1F35] border border-[#2A2F45] rounded-xl overflow-hidden shadow-2xl">
                        {SPEEDS.map((s) => (
                          <button
                            key={s}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSpeed(s);
                              setShowSpeedPicker(false);
                              scheduleHide();
                            }}
                            className={`block w-full px-5 py-2.5 text-sm text-left transition-colors ${
                              speed === s
                                ? 'bg-[#C9A962]/15 text-[#C9A962] font-semibold'
                                : 'text-white/70 active:bg-white/5'
                            }`}
                          >
                            {s}×
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fullscreen */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                    className="w-10 h-10 flex items-center justify-center text-white/50 active:text-white transition-colors"
                  >
                    {isFs ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Big play button when paused and not scrubbing */}
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/60 border border-white/20 flex items-center justify-center backdrop-blur-sm active:scale-90 transition-transform"
              >
                <Play className="w-7 h-7 sm:w-9 sm:h-9 text-white ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
