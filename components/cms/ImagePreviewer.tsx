'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ImageSquare, WarningCircle, CheckCircle } from '@phosphor-icons/react';
import { isValidUrl } from '@/lib/utils';

interface ImagePreviewerProps {
  url: string;
  onUrlChange: (url: string) => void;
  label?: string;
}

export function ImagePreviewer({
  url,
  onUrlChange,
  label = 'Product Image (Remote URL)',
}: ImagePreviewerProps) {
  const [imgError, setImgError] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setImgError(false);
    setIsValid(isValidUrl(url));
  }, [url]);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-700">
        {label} <span className="text-rose-500">*</span>
      </label>

      <div className="flex gap-2">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://images.unsplash.com/... or https://your-domain.com/image.jpg"
          className="flex-1 h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/15 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Live Preview Box: 1:1 Square Ratio */}
      <div className="relative h-[265px] max-w-[265px] aspect-square mx-auto w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center p-2">
        {isValid && !imgError && url.trim() ? (
          <div className="relative h-full w-full rounded-xl overflow-hidden">
            <Image
              src={url}
              alt="Live URL Preview"
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-contain p-1"
              onError={() => setImgError(true)}
            />
            <div className="absolute bottom-2 right-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1 shadow-sm">
              <CheckCircle weight="fill" className="h-3 w-3" />
              <span>Valid URL</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            {imgError ? (
              <>
                <WarningCircle weight="fill" className="h-8 w-8 text-amber-500 mb-1" />
                <span className="text-xs font-bold text-amber-800">
                  Image failed to load
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Check if the remote URL allows direct hotlinking.
                </span>
              </>
            ) : (
              <>
                <ImageSquare weight="duotone" className="h-8 w-8 text-slate-300 mb-1" />
                <span className="text-xs font-semibold text-slate-500">
                  Live Image Preview
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Paste any remote image link above (Unsplash, Pexels, Cloudinary, AWS S3, etc.)
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
