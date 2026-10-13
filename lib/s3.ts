import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Flexible environment variable resolver that safely checks process.env
 * for standard and alternate variable names (including case-insensitive matches).
 */
function getEnvValue(...candidateKeys: string[]): string {
  for (const key of candidateKeys) {
    const val = process.env[key];
    if (val && typeof val === 'string' && val.trim().length > 0) {
      return val.trim();
    }
  }

  // Fallback: case-insensitive check
  const envKeys = Object.keys(process.env);
  for (const candidate of candidateKeys) {
    const lowerCandidate = candidate.toLowerCase();
    const matchedKey = envKeys.find((k) => k.toLowerCase() === lowerCandidate);
    if (matchedKey) {
      const val = process.env[matchedKey];
      if (val && typeof val === 'string' && val.trim().length > 0) {
        return val.trim();
      }
    }
  }

  return '';
}

export function getS3Config() {
  const accessKeyId = getEnvValue(
    'AWS_ACCESS_KEY_ID',
    'AWS_ACCESS_KEY',
    'NEXT_PUBLIC_AWS_ACCESS_KEY_ID',
    'AWS_KEY'
  );
  const secretAccessKey = getEnvValue(
    'AWS_SECRET_ACCESS_KEY',
    'AWS_SECRET_KEY',
    'NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY',
    'AWS_SECRET'
  );
  const region =
    getEnvValue(
      'AWS_REGION',
      'AWS_DEFAULT_REGION',
      'NEXT_PUBLIC_AWS_REGION',
      'AWS_BUCKET_REGION'
    ) || 'eu-west-2';

  const bucketName = getEnvValue(
    'AWS_S3_BUCKET_NAME',
    'AWS_BUCKET_NAME',
    'AWS_S3_BUCKET',
    'S3_BUCKET_NAME',
    'NEXT_PUBLIC_AWS_S3_BUCKET_NAME',
    'NEXT_PUBLIC_AWS_BUCKET_NAME'
  );

  const cloudFrontDomain = getEnvValue(
    'AWS_CLOUDFRONT_DOMAIN',
    'CLOUDFRONT_DOMAIN',
    'CLOUDFRONT_URL',
    'NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN',
    'NEXT_PUBLIC_CLOUDFRONT_DOMAIN'
  );

  return {
    accessKeyId,
    secretAccessKey,
    region,
    bucketName,
    cloudFrontDomain,
    isConfigured: Boolean(accessKeyId && secretAccessKey && bucketName),
  };
}

let cachedS3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  const config = getS3Config();

  if (!config.isConfigured) {
    throw new Error(
      'AWS S3 is not configured. Missing AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, or AWS_BUCKET_NAME in environment.'
    );
  }

  if (!cachedS3Client) {
    cachedS3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return cachedS3Client;
}

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
}

/**
 * Uploads a file buffer directly to the S3 bucket under the "Print Today" folder.
 */
export async function uploadBufferToS3(params: {
  buffer: Buffer;
  fileName: string;
  contentType: string;
}): Promise<UploadResult> {
  const config = getS3Config();
  const s3 = getS3Client();

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  const extMatch = params.fileName.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';

  const baseName = params.fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 60);

  // Requirement: In S3 bucket create a folder named "Print Today" under which all pictures will be uploaded
  const s3Key = `Print Today/${timestamp}-${randomSuffix}-${baseName}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: s3Key,
    Body: params.buffer,
    ContentType: params.contentType || 'image/jpeg',
  });

  await s3.send(command);

  // Construct URL via CloudFront or S3
  const encodedKey = s3Key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  let publicUrl: string;
  if (config.cloudFrontDomain) {
    const cleanDomain = config.cloudFrontDomain
      .replace(/^https?:\/\//i, '')
      .replace(/\/+$/, '');
    publicUrl = `https://${cleanDomain}/${encodedKey}`;
  } else {
    publicUrl = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${encodedKey}`;
  }

  return {
    url: publicUrl,
    key: s3Key,
    bucket: config.bucketName,
  };
}
