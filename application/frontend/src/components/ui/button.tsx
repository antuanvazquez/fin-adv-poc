'use client';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-[#C9A962] text-[#0A0F1C] hover:bg-[#D4B872] font-semibold',
    secondary: 'border border-[#1E2A45] text-[#F0F0F5] hover:bg-[#1E2A45]/50',
    ghost: 'text-[#8B8FA3] hover:text-[#F0F0F5] hover:bg-[#1E2A45]/30',
    danger: 'bg-[#F87171]/10 text-[#F87171] hover:bg-[#F87171]/20 border border-[#F87171]/20',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  };
  return (
    <button className={cn('inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50', variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
