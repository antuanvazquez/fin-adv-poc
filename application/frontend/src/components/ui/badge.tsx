import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'critical' | 'info' | 'gold';
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

export function Badge({ variant = 'default', children, pulse = false, className }: BadgeProps) {
  const variants = {
    default: 'bg-[#1E2A45] text-[#8B8FA3]',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    gold: 'bg-[#C9A962]/10 text-[#C9A962] border-[#C9A962]/20',
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border', variants[variant], className)}>
      {pulse && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-current" /></span>}
      {children}
    </span>
  );
}
