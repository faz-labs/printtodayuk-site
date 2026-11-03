import { NextResponse } from 'next/server';
import { submitInquiry } from '@/lib/db';
import { sendInquiryEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, productContext, selectedOptions, details } = body;

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid phone number.' },
        { status: 400 }
      );
    }

    const cleanName = (name && typeof name === 'string' ? name.trim() : '') || 'Website Customer';
    const cleanPhone = phone.trim();
    const cleanEmail = email && typeof email === 'string' ? email.trim() : undefined;
    const cleanProductContext =
      (productContext && typeof productContext === 'string' ? productContext.trim() : '') ||
      'General Product Inquiry';
    const cleanDetails = details && typeof details === 'string' ? details.trim() : '';
    const cleanOptions: Record<string, string> =
      selectedOptions && typeof selectedOptions === 'object' ? selectedOptions : {};

    // 1. Record inquiry in Firestore / database for CMS dashboard
    let inquiryId: string | undefined;
    try {
      const res = await submitInquiry({
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        productContext: cleanProductContext,
        selectedOptions: cleanOptions,
        details: cleanDetails,
        status: 'pending',
      });
      inquiryId = res.id;
    } catch (dbErr) {
      console.warn('Inquiry DB record note:', dbErr);
    }

    // 2. Dispatch email to sales@printtodayuk.com with full product specifications
    let emailSent = false;
    try {
      const emailRes = await sendInquiryEmail({
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        productContext: cleanProductContext,
        selectedOptions: cleanOptions,
        details: cleanDetails,
      });
      emailSent = emailRes.sent;
    } catch (emailErr) {
      console.warn('Inquiry email dispatch note:', emailErr);
    }

    return NextResponse.json({
      success: true,
      inquiryId,
      emailSent,
      message: 'Call back request received successfully.',
    });
  } catch (error: any) {
    console.error('Inquiries API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process inquiry' },
      { status: 500 }
    );
  }
}

