'use client';

import React, { useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Card3DProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  depth?: number;
}

/**
 * Elevated Card component optimized for razor-sharp typography without GPU text-blur.
 * Avoids 3D perspective / scale matrix distortions that cause font rasterization artifacts.
 */
export function Card3D({
  children,
  className,
  depth = 12,
  ...props
}: Card3DProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        y: isHovered ? -5 : 0,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'relative rounded-2xl bg-white transition-all duration-200',
        isHovered
          ? 'shadow-xl shadow-[#012169]/12 ring-2 ring-[#012169]/20'
          : 'shadow-sm shadow-slate-200/60 border border-slate-200/70',
        className
      )}
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitFontSmoothing: 'antialiased',
      }}
      {...props}
    >
      <div className="h-full w-full">{children}</div>
    </motion.div>
  );
}
