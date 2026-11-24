import { NextRequest, NextResponse } from 'next/server';
import { submitInquiry } from '@/lib/db';
import { sendUploadOrderEmail } from '@/lib/email';
import { downloadBufferFromS3 } from '@/lib/s3';

export const dynamic = 'force-dynamic';

/**
 * P0-1: POST /api/upload-order
 * Receives order details and uploaded artwork file URL.
 * Records inquiry in database and emails artwork@ & sales@.
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let name = '';
    let phone = '';
    let email = '';
    let product = '';
    let quantity: string | number = '';
    let deliveryOption = '';
    let urgency = '';
    let notes = '';
    let fileName = '';
    let fileSize = 0;
    let fileKey = '';
    let fileUrl = '';
    let fileBuffer: Buffer | undefined;

    if (contentType.includes('application/json')) {
      const body = await req.json();
      name = body.name?.trim() || '';
      phone = body.phone?.trim() || '';
      email = body.email?.trim() || '';
      product = body.product?.trim() || '';
      quantity = body.quantity || '';
      deliveryOption = body.deliveryOption?.trim() || '';
      urgency = body.urgency?.trim() || '';
      notes = body.notes?.trim() || '';
      fileName = body.fileName?.trim() || '';
      fileSize = Number(body.fileSize) || 0;
      fileKey = body.fileKey?.trim() || '';
      fileUrl = body.fileUrl?.trim() || body.downloadUrl?.trim() || '';
    } else if (contentType.includes('multipart/form-data')) {
      // Fallback multipart handler
      const formData = await req.formData();
      name = String(formData.get('name') || '').trim();
      phone = String(formData.get('phone') || '').trim();
      email = String(formData.get('email') || '').trim();
      product = String(formData.get('product') || '').trim();
      quantity = String(formData.get('quantity') || '').trim();
      deliveryOption = String(formData.get('deliveryOption') || '').trim();
      urgency = String(formData.get('urgency') || '').trim();
      notes = String(formData.get('notes') || '').trim();
      fileUrl = String(formData.get('fileUrl') || '').trim();
      fileKey = String(formData.get('fileKey') || '').trim();

      const rawFile = formData.get('file');
      if (rawFile instanceof File && rawFile.size > 0) {
        fileName = rawFile.name;
        fileSize = rawFile.size;
        const arrayBuf = await rawFile.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuf);
      } else {
        fileName = String(formData.get('fileName') || '').trim();
        fileSize = Number(formData.get('fileSize')) || 0;
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid content type. Expected application/json or multipart/form-data.' },
        { status: 400 }
      );
    }

    // Validation
    if (!name) {
      return NextResponse.json({ error: 'Please provide your full name.' }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: 'Please provide a contact phone number.' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }
    if (!product) {
      return NextResponse.json({ error: 'Please specify the product you want printed.' }, { status: 400 });
    }
    if (!quantity) {
      return NextResponse.json({ error: 'Please provide the quantity needed.' }, { status: 400 });
    }
    if (!fileName) {
      return NextResponse.json({ error: 'Please select an artwork file to upload.' }, { status: 400 });
    }

    // Attempt to download file buffer if under 10MB to attach directly to email
    if (!fileBuffer && fileKey && fileSize > 0 && fileSize <= 10 * 1024 * 1024) {
      try {
        const downloaded = await downloadBufferFromS3(fileKey);
        if (downloaded) {
          fileBuffer = downloaded;
        }
      } catch (dlErr) {
        console.warn('Could not download buffer for email attachment, will provide download link only:', dlErr);
      }
    }

    // 1. Record inquiry in database for CMS Inbox
    let inquiryId: string | undefined;
    try {
      const dbRes = await submitInquiry({
        name,
        email,
        phone,
        productContext: `Quick Upload Order: ${product} (${quantity} units)`,
        details: `Item: ${product}\nQuantity: ${quantity}\nDelivery/Collection: ${deliveryOption || 'Collection'}\nUrgency: ${urgency || 'Standard'}\nFile: ${fileName} (${fileUrl || fileKey})\nNotes: ${notes || 'None'}`,
        status: 'pending',
      });
      inquiryId = dbRes.id;
    } catch (dbErr) {
      console.warn('Failed to record upload inquiry in Firestore:', dbErr);
    }

    // 2. Dispatch email to artwork@ & sales@
    const emailRes = await sendUploadOrderEmail({
      name,
      phone,
      email,
      product,
      quantity,
      deliveryOption: deliveryOption || 'Studio Collection (75 Green St, London E7)',
      urgency,
      notes,
      fileName,
      fileSize,
      downloadUrl: fileUrl,
      fileBuffer,
    });

    return NextResponse.json({
      success: true,
      inquiryId,
      emailSent: emailRes.sent,
      message: 'Received. We will call you to confirm your order during opening hours.',
    });
  } catch (error: any) {
    console.error('Upload Order API error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while processing your upload order.' },
      { status: 500 }
    );
  }
}
