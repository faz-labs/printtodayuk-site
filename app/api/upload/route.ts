import { NextRequest, NextResponse } from 'next/server';
import { getS3Config, uploadBufferToS3 } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = getS3Config();
  return NextResponse.json({
    isConfigured: config.isConfigured,
    region: config.region,
    bucketName: config.bucketName || null,
    cloudFrontDomain: config.cloudFrontDomain || null,
    hasAccessKey: Boolean(config.accessKeyId),
    hasSecretKey: Boolean(config.secretAccessKey),
    folder: 'Print Today',
  });
}

export async function POST(req: NextRequest) {
  try {
    const config = getS3Config();

    if (!config.isConfigured) {
      const missingKeys = [];
      if (!config.accessKeyId) missingKeys.push('AWS_ACCESS_KEY_ID');
      if (!config.secretAccessKey) missingKeys.push('AWS_SECRET_ACCESS_KEY');
      if (!config.bucketName) missingKeys.push('AWS_S3_BUCKET_NAME');

      return NextResponse.json(
        {
          error: `AWS S3 credentials missing or incomplete. Missing: ${missingKeys.join(', ')}. Please ensure these are saved in .env.local and the dev server has been restarted.`,
          missingKeys,
          isConfigured: false,
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const uploadedFiles: File[] = [];

    // Support both 'files' (multiple) and 'file' (single)
    const filesList = formData.getAll('files');
    const singleFile = formData.getAll('file');

    for (const item of [...filesList, ...singleFile]) {
      if (item instanceof File && item.size > 0) {
        uploadedFiles.push(item);
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: 'No image files provided for upload.' },
        { status: 400 }
      );
    }

    const uploadResults: Array<{ url: string; key: string; name: string }> = [];

    for (const file of uploadedFiles) {
      // Validate that file is an image
      const isImage =
        file.type.startsWith('image/') ||
        /\.(jpe?g|png|webp|gif|svg|avif|bmp|tiff)$/i.test(file.name);

      if (!isImage) {
        return NextResponse.json(
          { error: `File "${file.name}" is not a supported image format.` },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadBufferToS3({
        buffer,
        fileName: file.name,
        contentType: file.type || 'image/jpeg',
      });

      uploadResults.push({
        url: result.url,
        key: result.key,
        name: file.name,
      });
    }

    return NextResponse.json({
      success: true,
      urls: uploadResults.map((r) => r.url),
      files: uploadResults,
    });
  } catch (error: any) {
    console.error('S3 Upload Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to upload image(s) to AWS S3.',
      },
      { status: 500 }
    );
  }
}
