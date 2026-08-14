'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Card3DProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  depth?: number;
}

export function Card3D({
  children,
  className,
  depth = 12,
  ...props
}: Card3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [depth, -depth]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-depth, depth]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      animate={{
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative rounded-2xl bg-white transition-shadow duration-300',
        isHovered
          ? 'shadow-2xl shadow-purple-950/10 ring-1 ring-[#4a0e35]/15'
          : 'shadow-md shadow-slate-200/60 border border-slate-200/60',
        className
      )}
      {...props}
    >
      <div style={{ transform: 'translateZ(20px)' }} className="h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
