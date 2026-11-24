import { NextRequest, NextResponse } from 'next/server';
import { createPresignedUploadUrl, getS3Config } from '@/lib/s3';

export const dynamic = 'force-dynamic';

const ALLOWED_EXTENSIONS = new Set([
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'ai',
  'eps',
  'tiff',
  'tif',
  'svg',
]);

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

/**
 * POST /api/upload/presign
 * Generates an AWS S3 presigned PUT URL for direct browser uploads up to 50MB.
 * Bypasses Vercel request body limits and keeps files private in S3.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, fileType, fileSize } = body;

    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid file name.' },
        { status: 400 }
      );
    }

    const extMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';

    if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        {
          error: `Unsupported file type ".${ext}". Please upload a PDF, JPG, PNG, AI, or EPS file.`,
        },
        { status: 400 }
      );
    }

    if (fileSize && Number(fileSize) > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds 50 MB limit. Please compress your artwork or message us on WhatsApp.' },
        { status: 400 }
      );
    }

    const config = getS3Config();
    if (!config.isConfigured) {
      return NextResponse.json(
        { error: 'S3 cloud storage is not configured on the server.', fallback: true },
        { status: 503 }
      );
    }

    const contentType =
      fileType && typeof fileType === 'string' && fileType.includes('/')
        ? fileType
        : ext === 'pdf'
        ? 'application/pdf'
        : ext === 'png'
        ? 'image/png'
        : ext === 'ai'
        ? 'application/illustrator'
        : ext === 'eps'
        ? 'application/postscript'
        : 'image/jpeg';

    const presigned = await createPresignedUploadUrl({
      fileName,
      contentType,
      folder: 'UploadOrders',
    });

    return NextResponse.json({
      success: true,
      uploadUrl: presigned.uploadUrl,
      key: presigned.key,
      downloadUrl: presigned.downloadUrl,
      bucket: presigned.bucket,
    });
  } catch (error: any) {
    console.error('Presign API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate secure upload credentials.' },
      { status: 500 }
    );
  }
}
