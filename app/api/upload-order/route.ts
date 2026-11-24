import { NextRequest, NextResponse } from 'next/server';
import { submitInquiry } from '@/lib/db';
import { sendUploadOrderEmail } from '@/lib/email';
import { downloadBufferFromS3 } from '@/lib/s3';

export const dynamic = 'force-dynamic';

/**
 * POST /api/upload-order
 * Receives customer order details and WeTransfer artwork link.
 * Records inquiry in Firestore for CMS dashboard and dispatches notification email
 * to artwork@printtodayuk.com from printtodayuk@gmail.com with customer email for communication.
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
    let weTransferUrl = '';
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
      weTransferUrl = body.weTransferUrl?.trim() || body.downloadUrl?.trim() || body.fileUrl?.trim() || '';
      fileName = body.fileName?.trim() || (weTransferUrl ? 'WeTransfer Artwork Link' : '');
      fileSize = Number(body.fileSize) || 0;
      fileKey = body.fileKey?.trim() || '';
      fileUrl = weTransferUrl || body.fileUrl?.trim() || body.downloadUrl?.trim() || '';
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
      weTransferUrl = String(formData.get('weTransferUrl') || formData.get('fileUrl') || formData.get('downloadUrl') || '').trim();
      fileUrl = weTransferUrl || String(formData.get('fileUrl') || '').trim();
      fileKey = String(formData.get('fileKey') || '').trim();

      const rawFile = formData.get('file');
      if (rawFile instanceof File && rawFile.size > 0) {
        fileName = rawFile.name;
        fileSize = rawFile.size;
        const arrayBuf = await rawFile.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuf);
      } else {
        fileName = String(formData.get('fileName') || (weTransferUrl ? 'WeTransfer Artwork Link' : '')).trim();
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
      return NextResponse.json({ error: 'Please provide a valid email address so our team can communicate with you.' }, { status: 400 });
    }
    if (!product) {
      return NextResponse.json({ error: 'Please specify the product you want printed.' }, { status: 400 });
    }
    if (!quantity) {
      return NextResponse.json({ error: 'Please provide the quantity needed.' }, { status: 400 });
    }
    if (!weTransferUrl && !fileName && !fileUrl) {
      return NextResponse.json({ error: 'Please provide your WeTransfer artwork download link.' }, { status: 400 });
    }

    // Optional legacy: download file buffer if S3 key is present
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

    // 1. Record inquiry in Firestore for CMS Leads & Quotes Inbox
    let inquiryId: string | undefined;
    try {
      const dbRes = await submitInquiry({
        name,
        email,
        phone,
        productContext: `WeTransfer Order: ${product} (${quantity} units)`,
        details: `WeTransfer Link: ${weTransferUrl || fileUrl}\nCustomer Email: ${email}\nCustomer Phone: ${phone}\nItem: ${product}\nQuantity: ${quantity}\nDelivery/Collection: ${deliveryOption || 'Studio Collection'}\nUrgency: ${urgency || 'Standard'}\nNotes: ${notes || 'None'}`,
        status: 'pending',
      });
      inquiryId = dbRes.id;
    } catch (dbErr) {
      console.warn('Failed to record upload inquiry in Firestore:', dbErr);
    }

    // 2. Dispatch email to artwork@printtodayuk.com (from printtodayuk@gmail.com)
    const emailRes = await sendUploadOrderEmail({
      name,
      phone,
      email,
      product,
      quantity,
      deliveryOption: deliveryOption || 'Studio Collection (75 Green St, London E7)',
      urgency,
      notes,
      weTransferUrl: weTransferUrl || fileUrl,
      fileName: fileName || 'WeTransfer Link',
      fileSize,
      downloadUrl: weTransferUrl || fileUrl,
      fileBuffer,
    });

    return NextResponse.json({
      success: true,
      inquiryId,
      emailSent: emailRes.sent,
      message: 'Received. We will review your WeTransfer files and email you to confirm your order.',
    });
  } catch (error: any) {
    console.error('Upload Order API error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while processing your upload order.' },
      { status: 500 }
    );
  }
}
