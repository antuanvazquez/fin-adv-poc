'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  color?: string;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function Progress({ value, color = 'bg-[#C9A962]', className, showLabel = false, size = 'md' }: ProgressProps) {
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';
  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full rounded-full bg-[#1E2A45] overflow-hidden', height)}>
        <motion.div
          className={cn('h-full rounded-full', color)}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {showLabel && <p className="text-xs text-[#8B8FA3] mt-1">{Math.round(value)}%</p>}
    </div>
  );
}
