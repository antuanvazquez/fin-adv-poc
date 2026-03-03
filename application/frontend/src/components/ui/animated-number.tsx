'use client';
import { useEffect, useState } from 'react';
import { useMotionValue, animate } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
}

export function AnimatedNumber({ value, format, className, duration = 1 }: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(format ? format(0) : '0');

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplay(format ? format(latest) : Math.round(latest).toString());
      },
    });
    return () => controls.stop();
  }, [value, format, duration, motionValue]);

  return <span className={className}>{display}</span>;
}
