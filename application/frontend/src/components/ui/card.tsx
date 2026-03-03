'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { scale: 1.01, borderColor: 'rgba(201,169,98,0.3)' } : undefined}
      onClick={onClick}
      className={cn(
        'rounded-2xl border border-[#1E2A45] bg-[#131A2E]/80 backdrop-blur-xl p-6',
        hover && 'cursor-pointer transition-colors',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
