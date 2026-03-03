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
  const [showFsTip, setShowFsTip] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = speed;
    v.preservesPitch = true;
    (v as HTMLVideoElement & { webkitPreservesPitch?: boolean }).webkitPreservesPitch = true;
  }, [speed]);

  useEffect(() => {
    const t = setTimeout(() => setShowFsTip(false), 12000);
    return () => clearTimeout(t);
  }, []);

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
    setShowFsTip(false);
    if (isFs) exitFullscreen();
    else enterFullscreen();
  };

  const handleProgressInteraction = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
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

  const handleVideoAreaTap = () => {
    if (!playing) {
      togglePlay();
    } else if (showControls) {
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

      <div className="flex-1 flex flex-col items-center justify-center px-0 sm:px-4 py-4 sm:py-12">
        <div className="w-full max-w-4xl mb-3 sm:mb-6 text-center px-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#F0F0F5] mb-1">
            Intro Video
          </h1>
          <p className="text-sm text-[#8B8FA3]">
            Advisory Intelligence Platform — Partner Preview
          </p>
        </div>

        <div
          ref={containerRef}
          className={`relative bg-black w-full max-w-4xl ${isFs ? '' : 'sm:rounded-2xl'} overflow-hidden`}
          style={{ aspectRatio: isFs ? undefined : '16/9' }}
        >
          {/* Tappable video area — handles play/pause and show controls */}
          <button
            type="button"
            className="absolute inset-0 z-10 w-full h-full cursor-pointer bg-transparent border-none outline-none"
            onClick={handleVideoAreaTap}
            aria-label={playing ? 'Pause' : 'Play'}
          />

          <video
            ref={videoRef}
            src="/video.mp4"
            className="w-full h-full object-contain"
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

          {/* Controls overlay — z-20 to sit above the tap area */}
          <div
            className={`absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Gradient scrim — sits behind controls */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />

            <div className="relative px-3 sm:px-5 pb-2 sm:pb-3 space-y-1.5">
              {/* Progress bar */}
              <div
                ref={progressRef}
                className="w-full py-2 cursor-pointer"
                onClick={handleProgressInteraction}
                onTouchStart={handleProgressInteraction}
                onTouchMove={handleProgressInteraction}
              >
                <div className="w-full h-[6px] sm:h-[5px] bg-white/20 rounded-full relative">
                  <div
                    className="h-full bg-[#C9A962] rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 sm:w-3 sm:h-3 bg-[#C9A962] rounded-full shadow-lg"
                    style={{ left: `${progress}%`, marginLeft: '-8px' }}
                  />
                </div>
              </div>

              {/* Controls row + time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePlay(); scheduleHide(); }}
                    className="w-10 h-10 flex items-center justify-center text-white active:scale-90 transition-transform"
                  >
                    {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); restart(); }}
                    className="w-9 h-10 flex items-center justify-center text-white/50 active:text-white transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                    className="w-9 h-10 flex items-center justify-center text-white/50 active:text-white transition-colors"
                  >
                    {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="text-[10px] sm:text-xs text-white/40 tabular-nums ml-1">
                    {fmtTime(adjustedCurrent)} / {fmtTime(adjustedDuration)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
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

                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                    className="h-8 px-2.5 rounded-lg bg-white/10 flex items-center gap-1.5 text-xs font-semibold text-white/80 active:bg-white/20 transition-colors"
                  >
                    {isFs ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{isFs ? 'Exit' : 'Full Screen'}</span>
                    <span className="sm:hidden">{isFs ? 'Exit' : 'Full'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Big center play button */}
          {!playing && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-transparent border-none outline-none"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/60 border border-white/20 flex items-center justify-center backdrop-blur-sm active:scale-90 transition-transform">
                <Play className="w-7 h-7 sm:w-9 sm:h-9 text-white ml-1" />
              </div>
            </button>
          )}
        </div>

        {/* Fullscreen tip — mobile only */}
        {showFsTip && (
          <div className="sm:hidden flex items-start justify-end mt-3 animate-pulse" style={{ paddingRight: '0.35rem' }}>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[#C9A962] text-xl leading-none">↑</span>
              <p className="text-xs text-[#C9A962] font-medium text-right leading-snug max-w-[200px]">
                Tap <strong>Full</strong> and turn your phone sideways for the best experience
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
