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

    let uploadResults: Array<{ url: string; key: string; name: string }> = [];

    if (config.isConfigured) {
      try {
        for (const file of uploadedFiles) {
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
            contentType: file.type || 'image/webp',
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
          storage: 's3',
        });
      } catch (s3Error: any) {
        console.warn('S3 upload encountered an error, falling back to local public storage:', s3Error);
        // Clear results and fall back to local disk storage below
        uploadResults = [];
      }
    }

    // Fallback: Save to /public/uploads/ directory locally
    // This guarantees image uploads ALWAYS succeed even without AWS credentials
    const fs = await import('node:fs/promises');
    const path = await import('node:path');

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    for (const file of uploadedFiles) {
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

      // Clean filename and ensure unique timestamp
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueName = `${Date.now()}-${cleanName}`;
      const filePath = path.join(uploadsDir, uniqueName);

      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/${uniqueName}`;
      uploadResults.push({
        url: publicUrl,
        key: uniqueName,
        name: file.name,
      });
    }

    return NextResponse.json({
      success: true,
      urls: uploadResults.map((r) => r.url),
      files: uploadResults,
      storage: 'local',
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to process image upload.',
      },
      { status: 500 }
    );
  }
}
