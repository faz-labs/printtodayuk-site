import { NextResponse } from 'next/server';
import { submitInquiry } from '@/lib/db';
import { sendContactEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Please provide your full name.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { error: 'Please provide a contact phone number.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Please provide project details or a message.' },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const cleanSubject = (subject && typeof subject === 'string' ? subject.trim() : '') || 'General Enquiry';
    const cleanMessage = message.trim();

    // 1. Record inquiry in database so it appears in the CMS Inbox
    let dbSuccess = false;
    let inquiryId: string | undefined;

    try {
      const res = await submitInquiry({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        productContext: `Contact Page: ${cleanSubject}`,
        details: cleanMessage,
        status: 'pending',
      });
      dbSuccess = res.success;
      inquiryId = res.id;
    } catch (dbErr) {
      console.warn('Failed to record contact inquiry in database:', dbErr);
    }

    // 2. Dispatch email to sales@printtodayuk.com via Nodemailer
    const emailResult = await sendContactEmail({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      subject: cleanSubject,
      message: cleanMessage,
    });

    return NextResponse.json({
      success: true,
      inquiryId,
      emailSent: emailResult.sent,
      emailError: emailResult.error || null,
      message: 'Thank you! Your message has been received. Our studio team will get back to you shortly.',
    });
  } catch (error: any) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while sending your message.' },
      { status: 500 }
    );
  }
}
