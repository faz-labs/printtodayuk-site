import nodemailer from 'nodemailer';

interface SendContactEmailParams {
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
}

/**
 * Creates a Nodemailer transporter using Gmail / SMTP credentials from environment variables.
 * Supported env variables in .env.local:
 * - GMAIL_USER or SMTP_USER
 * - GMAIL_APP_PASSWORD or SMTP_PASS
 * - CONTACT_RECEIVER_EMAIL (defaults to sales@printtodayuk.com)
 */
function getTransporter() {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  // Gmail SMTP transporter
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user.trim(),
      pass: pass.trim(),
    },
  });
}

/**
 * Sends a notification email to sales@printtodayuk.com when a customer submits the Contact Us form.
 */
export async function sendContactEmail(params: SendContactEmailParams): Promise<{
  sent: boolean;
  messageId?: string;
  error?: string;
}> {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(
      'Nodemailer: GMAIL_USER and GMAIL_APP_PASSWORD (or SMTP_USER/SMTP_PASS) are not set in .env.local. Skipping email dispatch.'
    );
    return {
      sent: false,
      error: 'SMTP credentials not configured in .env.local',
    };
  }

  const senderUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || 'sales@printtodayuk.com';

  const cleanSubject = params.subject?.trim() || 'New Customer Enquiry';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #012169; color: #ffffff; padding: 24px; text-align: center; border-bottom: 4px solid #C8102E; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; color: #cbd5e1; }
    .body-content { padding: 28px 24px; }
    .badge { display: inline-block; background: #f1f5f9; color: #012169; font-size: 11px; font-weight: 700; padding: 4px 10px; rounded: 6px; border: 1px solid #cbd5e1; margin-bottom: 16px; text-transform: uppercase; }
    .detail-row { margin-bottom: 16px; }
    .detail-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 4px; }
    .detail-val { font-size: 15px; font-weight: 600; color: #0f172a; }
    .message-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #012169; padding: 16px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap; margin-top: 8px; }
    .cta-bar { margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; gap: 12px; }
    .btn { display: inline-block; background: #012169; color: #ffffff !important; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; }
    .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PRINT TODAY UK</h1>
      <p>New Website Contact Form Enquiry</p>
    </div>

    <div class="body-content">
      <div class="badge">Enquiry: ${cleanSubject}</div>

      <div class="detail-row">
        <div class="detail-label">Customer Name</div>
        <div class="detail-val">${params.name}</div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Email Address</div>
        <div class="detail-val"><a href="mailto:${params.email}" style="color: #012169; text-decoration: none;">${params.email}</a></div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Phone Number</div>
        <div class="detail-val"><a href="tel:${params.phone}" style="color: #012169; text-decoration: none;">${params.phone}</a></div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Subject / Service Required</div>
        <div class="detail-val">${cleanSubject}</div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Message & Project Details</div>
        <div class="message-box">${params.message}</div>
      </div>

      <div style="margin-top: 24px;">
        <a href="mailto:${params.email}?subject=Re:%20${encodeURIComponent(cleanSubject)}%20-%20Print%20Today%20UK" class="btn">
          Reply to ${params.name} &rarr;
        </a>
      </div>
    </div>

    <div class="footer">
      Print Today UK · 75 Green Street, E7 8JF, London, United Kingdom<br>
      Studio Hotline: 0330 010 3521 · WhatsApp: +44 7969 559746
    </div>
  </div>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Print Today Website" <${senderUser}>`,
      to: receiverEmail,
      replyTo: `"${params.name}" <${params.email}>`,
      subject: `[Contact Form] ${cleanSubject} - ${params.name}`,
      text: `New contact enquiry from ${params.name}\n\nEmail: ${params.email}\nPhone: ${params.phone}\nSubject: ${cleanSubject}\n\nMessage:\n${params.message}\n\nPrint Today UK - 75 Green Street, London, E7 8JF`,
      html: htmlContent,
    });

    return { sent: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Nodemailer sendMail failed:', error);
    return { sent: false, error: error.message || 'Failed to dispatch email' };
  }
}
