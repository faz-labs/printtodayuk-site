'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  UploadSimple,
  Trash,
  Star,
  ImageSquare,
  WarningCircle,
  CheckCircle,
  Plus,
  CloudArrowUp,
  Link as LinkIcon,
} from '@phosphor-icons/react';

interface MultiImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export function MultiImageUploader({
  images,
  onImagesChange,
}: MultiImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [s3Status, setS3Status] = useState<{
    checked: boolean;
    isConfigured: boolean;
    bucketName?: string;
    cloudFrontDomain?: string;
  }>({ checked: false, isConfigured: false });

  // Optional manual URL input toggle
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check S3 configuration status once on mount
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/upload');
        if (res.ok) {
          const data = await res.json();
          setS3Status({
            checked: true,
            isConfigured: Boolean(data.isConfigured),
            bucketName: data.bucketName || undefined,
            cloudFrontDomain: data.cloudFrontDomain || undefined,
          });
        }
      } catch (err) {
        console.warn('Unable to query S3 status:', err);
      }
    }
    checkStatus();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    await uploadFiles(Array.from(files));

    // Reset input so same files can be re-selected if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFiles = async (fileList: File[]) => {
    setErrorMessage('');
    setIsUploading(true);
    setUploadProgress(`Uploading ${fileList.length} image(s) to S3 (Print Today folder)...`);

    try {
      const formData = new FormData();
      fileList.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload images to S3.');
      }

      if (data.urls && Array.isArray(data.urls)) {
        // Append newly uploaded image URLs
        const newImages = [...images, ...data.urls];
        onImagesChange(newImages);
        setUploadProgress(
          `Successfully uploaded ${data.urls.length} image(s) to S3!`
        );
        setTimeout(() => setUploadProgress(''), 3000);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMessage(
        err.message || 'Image upload failed. Please verify your S3 configuration in .env.local.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onImagesChange(updated);
  };

  const handleSetCover = (indexToCover: number) => {
    if (indexToCover === 0) return;
    const target = images[indexToCover];
    const rest = images.filter((_, idx) => idx !== indexToCover);
    onImagesChange([target, ...rest]);
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    onImagesChange([...images, manualUrl.trim()]);
    setManualUrl('');
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-800">
            Product Pictures <span className="text-rose-500">*</span>
          </label>
          <p className="text-[11px] text-slate-500">
            Directly uploaded to AWS S3 bucket in{' '}
            <span className="font-semibold text-[#012169]">Print Today</span>{' '}
            folder. The first picture is the primary cover image.
          </p>
        </div>

        {s3Status.checked && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
              s3Status.isConfigured
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {s3Status.isConfigured ? (
              <>
                <CheckCircle weight="fill" className="h-3 w-3 text-emerald-600" />
                <span>S3 Ready ({s3Status.bucketName || 'Bucket'})</span>
              </>
            ) : (
              <>
                <WarningCircle weight="fill" className="h-3 w-3 text-amber-600" />
                <span>Save AWS keys in .env.local</span>
              </>
            )}
          </span>
        )}
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
          <WarningCircle weight="fill" className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Success progress */}
      {uploadProgress && (
        <div className="p-2.5 rounded-xl bg-blue-50 border border-[#012169]/15 text-xs text-[#012169] flex items-center gap-2">
          <CheckCircle weight="fill" className="h-4 w-4 text-[#012169] shrink-0" />
          <span className="font-medium">{uploadProgress}</span>
        </div>
      )}

      {/* Upload Drop Zone & Actions */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
          isUploading
            ? 'border-[#012169] bg-blue-50/50 cursor-wait'
            : 'border-slate-300 hover:border-[#012169] hover:bg-slate-50/80 bg-white'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="h-12 w-12 rounded-2xl bg-[#012169]/10 text-[#012169] flex items-center justify-center">
            {isUploading ? (
              <div className="h-6 w-6 border-2 border-[#012169]/30 border-t-[#012169] rounded-full animate-spin" />
            ) : (
              <CloudArrowUp weight="bold" className="h-6 w-6" />
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-slate-800">
              {isUploading ? 'Uploading to S3...' : 'Click to select pictures or drag & drop'}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select multiple pictures (JPG, PNG, WebP) to upload directly to S3
            </p>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#012169] text-white text-xs font-bold shadow-xs hover:bg-[#0A358C]">
              <UploadSimple weight="bold" className="h-3.5 w-3.5" />
              <span>Browse Pictures</span>
            </span>
          </div>
        </div>
      </div>

      {/* Optional fallback URL toggle */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-slate-500 hover:text-[#012169] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <LinkIcon weight="bold" className="h-3 w-3" />
          <span>{showUrlInput ? 'Hide URL input' : 'Or add via image URL'}</span>
        </button>

        {images.length > 0 && (
          <span className="text-[11px] font-bold text-slate-600">
            {images.length} {images.length === 1 ? 'picture' : 'pictures'} added
          </span>
        )}
      </div>

      {showUrlInput && (
        <div className="flex gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
          />
          <button
            type="button"
            onClick={handleAddManualUrl}
            className="px-3 h-9 bg-[#012169] text-white font-bold text-xs rounded-lg hover:bg-[#0A358C] cursor-pointer"
          >
            Add
          </button>
        </div>
      )}

      {/* Pictures Grid / Previews */}
      {images.length > 0 && (
        <div className="mt-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((imgUrl, index) => {
              const isCover = index === 0;
              return (
                <div
                  key={`${imgUrl}-${index}`}
                  className={`group relative rounded-xl border overflow-hidden bg-slate-100 aspect-square flex flex-col justify-between transition-all ${
                    isCover
                      ? 'border-[#012169] ring-2 ring-[#012169]/30 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Thumbnail Image */}
                  <div className="relative w-full h-full">
                    <Image
                      src={imgUrl}
                      alt={`Product picture ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 200px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1 pointer-events-none">
                    {isCover ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#012169] text-white text-[10px] font-bold shadow-xs">
                        <Star weight="fill" className="h-2.5 w-2.5 text-amber-300" />
                        <span>Cover</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs">
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  {/* Hover Overlay Actions */}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 text-white">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(index)}
                        className="w-full py-1 px-2 rounded-lg bg-white/90 hover:bg-white text-slate-900 text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-colors"
                      >
                        <Star weight="bold" className="h-3 w-3 text-amber-500" />
                        <span>Set as Cover</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="w-full py-1 px-2 rounded-lg bg-[#C8102E] hover:bg-[#A80C24] text-white text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-colors"
                    >
                      <Trash weight="bold" className="h-3 w-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
          <ImageSquare weight="duotone" className="h-7 w-7 text-slate-400 mx-auto mb-1" />
          <p className="text-xs text-slate-500">
            No pictures added yet. Please upload at least 1 picture for this product.
          </p>
        </div>
      )}
    </div>
  );
}
