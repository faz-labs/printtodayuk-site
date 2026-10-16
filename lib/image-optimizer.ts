'use client';

/**
 * Automatically optimizes and converts any uploaded image (JPEG, PNG, HEIC, etc.)
 * to modern .webp format, automatically scaling dimensions and drastically reducing file size
 * before uploading to S3, while preserving full transparency and visual fidelity.
 */
export async function convertAndOptimizeImage(
  file: File,
  maxDimension: number = 1600,
  quality: number = 0.85
): Promise<File> {
  // If it's an SVG, keep it as SVG
  if (file.type === 'image/svg+xml') {
    return file;
  }

  // If in SSR or no browser canvas, return file as is
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Auto-scale if dimensions exceed maxDimension (e.g. 1600px)
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw image onto canvas (alpha channel is automatically preserved for transparent PNGs)
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp with high quality compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const rawName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            // Clean slug filename
            const cleanName = rawName.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
            const webpFile = new File([blob], `${cleanName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => resolve(file);
      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
