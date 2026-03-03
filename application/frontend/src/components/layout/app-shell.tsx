'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Menu } from 'lucide-react';
import { Sidebar } from './sidebar';

const DESKTOP_WIDTH = 1100;
const TOP_BAR_HEIGHT = 52;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      const mobile = vw < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setScale(Math.min(1, vw / DESKTOP_WIDTH));
      } else {
        setScale(1);
      }
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const scaledHeight = isMobile ? `${100 / scale}%` : 'auto';

  return (
    <div className="flex min-h-screen">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-[#0A0F1C]/90 backdrop-blur-md border-b border-[#1E2A45]/50 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8B8FA3] hover:text-[#F0F0F5] hover:bg-[#1E2A45]/50 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#8B8FA3] hover:text-[#C9A962] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Portal
          </Link>
        </div>
        <span className="text-xs text-[#4A5068] font-medium tracking-wide">POC Preview</span>
      </div>

      {isMobile ? (
        <div
          className="flex-1 overflow-x-hidden"
          style={{ paddingTop: TOP_BAR_HEIGHT }}
        >
          <div
            style={{
              width: DESKTOP_WIDTH,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              minHeight: scaledHeight,
            }}
          >
            <main className="p-8">
              {children}
            </main>
          </div>
        </div>
      ) : (
        <main className="flex-1 lg:ml-[260px] p-8">
          {children}
        </main>
      )}
    </div>
  );
}
