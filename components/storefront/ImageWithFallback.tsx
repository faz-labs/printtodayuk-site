'use client';

import React, { useState } from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { ImageSquare } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends Omit<NextImageProps, 'src'> {
  src?: string | null;
  fallbackText?: string;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackText,
  className,
  fill,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Validate src string
  const validSrc = src && typeof src === 'string' && src.trim().length > 0;

  if (error || !validSrc) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-4 text-center select-none overflow-hidden relative w-full h-full min-h-[140px]',
          className
        )}
      >
        <div className="rounded-full bg-white/80 p-3 shadow-xs mb-2 backdrop-blur-xs">
          <ImageSquare weight="duotone" className="h-6 w-6 text-[#012169]" />
        </div>
        <span className="text-xs font-bold text-slate-700 line-clamp-1 max-w-[90%]">
          {fallbackText || alt || 'Print Today'}
        </span>
        <span className="text-[10px] text-slate-400 font-medium mt-0.5">
          High Quality London Print
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100">
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200/80 animate-pulse z-10 flex items-center justify-center">
          <div className="h-6 w-6 border-2 border-[#012169]/30 border-t-[#012169] rounded-full animate-spin" />
        </div>
      )}
      <NextImage
        src={src}
        alt={alt || 'Product Image'}
        fill={fill ?? true}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
        className={cn(
          'transition-all duration-500 ease-out object-cover',
          isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100',
          className
        )}
        {...props}
      />
    </div>
  );
}
