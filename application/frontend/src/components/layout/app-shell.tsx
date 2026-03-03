import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Sidebar } from './sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* Mobile top bar — only visible when sidebar is hidden */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0A0F1C]/90 backdrop-blur-md border-b border-[#1E2A45]/50 lg:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#8B8FA3] hover:text-[#C9A962] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Portal
        </Link>
        <span className="text-xs text-[#4A5068] font-medium tracking-wide">POC Preview</span>
      </div>
      <main className="flex-1 lg:ml-[260px] p-4 pt-16 lg:pt-8 lg:p-8">
        {children}
      </main>
    </div>
  );
}
