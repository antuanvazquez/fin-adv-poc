'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Bell, Calendar, Sparkles, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/signals', label: 'Life Signals', icon: Bell },
  { href: '/meeting-prep', label: 'Meeting Prep', icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#0D1220] border-r border-[#1E2A45] flex flex-col z-50">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#C9A962]/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#C9A962]" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-[#F0F0F5]">ADVISOR</h1>
            <div className="h-0.5 w-full bg-gradient-to-r from-[#C9A962] to-transparent rounded" />
            <p className="text-[10px] tracking-[0.2em] text-[#8B8FA3] mt-0.5">PLATFORM</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
                isActive
                  ? 'bg-[#C9A962]/10 text-[#C9A962] font-medium'
                  : 'text-[#8B8FA3] hover:text-[#F0F0F5] hover:bg-[#1E2A45]/50'
              )}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C9A962]" />}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[#4A5068] hover:text-[#8B8FA3] hover:bg-[#1E2A45]/30 transition-all duration-200 group"
        >
          <ArrowLeft className="w-[15px] h-[15px] group-hover:-translate-x-0.5 transition-transform duration-200" />
          Back to Portal
        </Link>
      </div>
      <div className="p-4 border-t border-[#1E2A45]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9A962]/20 to-[#C9A962]/5 flex items-center justify-center text-[#C9A962] text-sm font-semibold">
            AV
          </div>
          <div>
            <p className="text-sm font-medium text-[#F0F0F5]">Alanna V.</p>
            <p className="text-xs text-[#8B8FA3]">Senior Advisor</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
