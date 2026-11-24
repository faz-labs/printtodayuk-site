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

export interface SendInquiryEmailParams {
  name: string;
  phone: string;
  email?: string;
  productContext?: string;
  selectedOptions?: Record<string, string>;
  details?: string;
}

/**
 * Sends an instant notification email to sales@printtodayuk.com when a customer requests a Call Back
 * or bespoke quote on any product, containing their phone number and selected specifications.
 */
export async function sendInquiryEmail(params: SendInquiryEmailParams): Promise<{
  sent: boolean;
  messageId?: string;
  error?: string;
}> {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(
      'Nodemailer: SMTP credentials not set in .env.local. Skipping inquiry email dispatch.'
    );
    return {
      sent: false,
      error: 'SMTP credentials not configured in .env.local',
    };
  }

  const senderUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || 'sales@printtodayuk.com';

  const customerName = params.name.trim() || 'Website Customer';
  const phone = params.phone.trim();
  const productContext = params.productContext || 'Print Callback Request';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('0') ? '44' + cleanPhone.slice(1) : cleanPhone;

  const specRows =
    params.selectedOptions && Object.keys(params.selectedOptions).length > 0
      ? Object.entries(params.selectedOptions)
          .map(
            ([k, v]) => `
            <tr>
              <td style="padding: 8px 12px; font-weight: 700; color: #475569; font-size: 13px; border-bottom: 1px solid #e2e8f0; width: 40%; background: #f8fafc;">${k}</td>
              <td style="padding: 8px 12px; font-weight: 600; color: #0f172a; font-size: 13px; border-bottom: 1px solid #e2e8f0;">${v}</td>
            </tr>`
          )
          .join('')
      : '<tr><td colspan="2" style="padding: 10px; color: #64748b; font-size: 12px; text-align: center;">Standard product defaults</td></tr>';

  const plainSpecs = params.selectedOptions
    ? Object.entries(params.selectedOptions)
        .map(([k, v]) => `  • ${k}: ${v}`)
        .join('\n')
    : '  • Standard product specifications';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #012169; color: #ffffff; padding: 24px; text-align: center; border-bottom: 4px solid #C8102E; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; color: #cbd5e1; }
    .body-content { padding: 28px 24px; }
    .badge-urgent { display: inline-block; background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; border: 1px solid #fecaca; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
    .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #012169; letter-spacing: 0.5px; margin: 20px 0 8px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; }
    .spec-table { width: 100%; border-collapse: collapse; margin-top: 8px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .detail-row { margin-bottom: 12px; }
    .detail-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
    .detail-val { font-size: 15px; font-weight: 600; color: #0f172a; }
    .message-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #012169; padding: 14px; border-radius: 8px; font-size: 13px; line-height: 1.6; color: #334155; margin-top: 6px; white-space: pre-wrap; }
    .btn-call { display: inline-block; background: #C8102E; color: #ffffff !important; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; }
    .btn-wa { display: inline-block; background: #25D366; color: #ffffff !important; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; margin-left: 8px; }
    .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PRINT TODAY UK</h1>
      <p>Instant Customer Call Back Request</p>
    </div>

    <div class="body-content">
      <div class="badge-urgent">⚡ Call Back Request — Target Response: ~15 Mins</div>

      <div class="detail-row">
        <div class="detail-label">Customer Name</div>
        <div class="detail-val">${customerName}</div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Phone Number</div>
        <div class="detail-val">
          <a href="tel:${phone}" style="color: #012169; font-weight: 800; font-size: 18px; text-decoration: none;">${phone}</a>
        </div>
      </div>

      ${
        params.email
          ? `
      <div class="detail-row">
        <div class="detail-label">Email Address</div>
        <div class="detail-val"><a href="mailto:${params.email}" style="color: #012169;">${params.email}</a></div>
      </div>`
          : ''
      }

      <div class="section-title">Product & Order Request</div>
      <div class="detail-val" style="color: #012169; font-size: 16px; font-weight: 800;">${productContext}</div>

      <div class="section-title">Selected Product Specifications</div>
      <table class="spec-table">
        <tbody>
          ${specRows}
        </tbody>
      </table>

      ${
        params.details
          ? `
      <div class="section-title">Customer Notes / Additional Request</div>
      <div class="message-box">${params.details}</div>`
          : ''
      }

      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <a href="tel:${phone}" class="btn-call">📞 Call ${customerName}</a>
        <a href="https://wa.me/${waPhone}" class="btn-wa">💬 Open WhatsApp Chat</a>
      </div>
    </div>

    <div class="footer">
      Print Today UK · 75 Green Street, London, E7 8JF · Studio: 0330 010 3521 · WhatsApp: +44 7969 559746
    </div>
  </div>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Print Today Leads" <${senderUser}>`,
      to: receiverEmail,
      subject: `[Call Back Request] ${productContext} - ${customerName} (${phone})`,
      text: `NEW CALL BACK REQUEST\n\nCustomer: ${customerName}\nPhone: ${phone}\nProduct: ${productContext}\n\nSelected Specifications:\n${plainSpecs}\n\n${
        params.details ? `Notes: ${params.details}\n\n` : ''
      }Print Today UK - 75 Green Street, London, E7 8JF`,
      html: htmlContent,
    });

    return { sent: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Nodemailer sendInquiryEmail failed:', error);
    return { sent: false, error: error.message || 'Failed to dispatch email' };
  }
}

export interface SendUploadOrderEmailParams {
  name: string;
  phone: string;
  email: string;
  product: string;
  quantity: string | number;
  deliveryOption: string;
  urgency?: string;
  notes?: string;
  weTransferUrl?: string;
  fileName?: string;
  fileSize?: number;
  downloadUrl?: string;
  fileBuffer?: Buffer;
  contentType?: string;
}

/**
 * Dispatches an urgent upload order email to artwork@printtodayuk.com & sales@printtodayuk.com.
 * Prominently presents the customer's WeTransfer link, customer email address,
 * contact phone number, and order specifications so the studio can communicate further.
 */
export async function sendUploadOrderEmail(params: SendUploadOrderEmailParams): Promise<{
  sent: boolean;
  messageId?: string;
  error?: string;
}> {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn('Nodemailer: SMTP credentials not set. Skipping upload order email dispatch.');
    return {
      sent: false,
      error: 'SMTP credentials not configured in .env.local',
    };
  }

  const senderUser = process.env.GMAIL_USER || process.env.SMTP_USER || 'printtodayuk@gmail.com';
  // Send to artwork@printtodayuk.com as primary recipient, plus sales@ & custom receiver
  const targetEmails = Array.from(
    new Set(
      [
        'artwork@printtodayuk.com',
        'sales@printtodayuk.com',
        process.env.CONTACT_RECEIVER_EMAIL,
      ].filter(Boolean)
    )
  ).join(', ');

  const activeLink = (params.weTransferUrl || params.downloadUrl || '').trim();
  const waPhone = params.phone.replace(/[^0-9]/g, '');

  const formatBytes = (bytes?: number) => {
    if (!bytes || isNaN(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  const formattedSize = formatBytes(params.fileSize);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #0f172a; }
    .container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #cbd5e1; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08); }
    .header { background: #012169; color: #ffffff; padding: 26px 24px; text-align: center; border-bottom: 4px solid #C8102E; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; color: #93c5fd; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .body-content { padding: 28px 24px; }
    .alert-badge { display: inline-block; background: #ecfdf5; color: #047857; font-size: 11px; font-weight: 800; padding: 5px 12px; border-radius: 9999px; border: 1px solid #a7f3d0; margin-bottom: 20px; text-transform: uppercase; }
    .transfer-card { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 14px; padding: 22px; margin: 20px 0; text-align: center; box-shadow: 0 4px 6px -1px rgba(34, 197, 94, 0.1); }
    .transfer-title { font-size: 16px; font-weight: 800; color: #15803d; }
    .btn-transfer { display: inline-block; background: #16a34a; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 800; margin-top: 12px; box-shadow: 0 4px 6px -1px rgba(22, 163, 74, 0.3); }
    .raw-link { margin-top: 14px; font-size: 12px; color: #334155; word-break: break-all; background: #ffffff; padding: 10px 14px; border-radius: 8px; border: 1px solid #dcfce7; }
    .table-details { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
    .table-details th { text-align: left; padding: 10px 12px; background: #f8fafc; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; width: 38%; }
    .table-details td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a; }
    .message-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #012169; padding: 14px; border-radius: 8px; font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-wrap; margin-top: 8px; }
    .cta-bar { margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; gap: 10px; flex-wrap: wrap; }
    .btn-reply { display: inline-block; background: #012169; color: #ffffff !important; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; }
    .btn-call { display: inline-block; background: #C8102E; color: #ffffff !important; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; }
    .btn-wa { display: inline-block; background: #25D366; color: #ffffff !important; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; }
    .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PRINT TODAY UK</h1>
      <p>📁 WETRANSFER ARTWORK &amp; PRINT ORDER SUBMISSION</p>
    </div>

    <div class="body-content">
      <div class="alert-badge">⚡ Action Required: WeTransfer Artwork Link Submitted</div>

      <!-- WeTransfer Download Card -->
      <div class="transfer-card">
        <div style="font-size: 32px; margin-bottom: 4px;">🚀</div>
        <div class="transfer-title">Customer WeTransfer Artwork Link</div>
        ${
          activeLink
            ? `
        <div style="margin-top: 10px;">
          <a href="${activeLink}" class="btn-transfer" target="_blank" rel="noopener noreferrer">
            DOWNLOAD FROM WETRANSFER &rarr;
          </a>
        </div>
        <div class="raw-link">
          <strong>Direct Link:</strong> <a href="${activeLink}" style="color: #047857; font-weight: 700;">${activeLink}</a>
        </div>`
            : '<p style="color: #64748b; font-size: 13px;">No external link provided.</p>'
        }
      </div>

      <!-- Customer & Order Specs -->
      <table class="table-details">
        <tr>
          <th>Customer Email</th>
          <td><a href="mailto:${params.email}" style="color: #012169; font-weight: 800; font-size: 15px; text-decoration: underline;">${params.email}</a></td>
        </tr>
        <tr>
          <th>Customer Name</th>
          <td>${params.name}</td>
        </tr>
        <tr>
          <th>Phone Number</th>
          <td><a href="tel:${params.phone}" style="color: #012169; text-decoration: none; font-weight: 800;">${params.phone}</a></td>
        </tr>
        <tr>
          <th>Requested Item</th>
          <td><strong style="color: #012169;">${params.product}</strong></td>
        </tr>
        <tr>
          <th>Quantity</th>
          <td>${params.quantity} units</td>
        </tr>
        <tr>
          <th>Delivery / Collection</th>
          <td>${params.deliveryOption}</td>
        </tr>
        ${params.urgency ? `<tr><th>Urgency</th><td><span style="color: #C8102E; font-weight: 800;">${params.urgency}</span></td></tr>` : ''}
      </table>

      ${
        params.notes
          ? `
      <div style="margin-top: 18px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b;">Special Customer Instructions:</div>
      <div class="message-box">${params.notes}</div>`
          : ''
      }

      <div class="cta-bar">
        <a href="mailto:${params.email}?subject=Re:%20WeTransfer%20Artwork%20Submission%20-%20${encodeURIComponent(params.product)}%20-%20Print%20Today%20UK" class="btn-reply">✉️ Reply to Client (${params.email})</a>
        <a href="tel:${params.phone}" class="btn-call">📞 Call ${params.name}</a>
        <a href="https://wa.me/${waPhone}" class="btn-wa">💬 WhatsApp</a>
      </div>
    </div>

    <div class="footer">
      Print Today UK · 75 Green Street, London, E7 8JF · Studio: 0330 010 3521 · WhatsApp: +44 7969 559746
    </div>
  </div>
</body>
</html>
  `;

  // Attach file directly if provided and under 10MB (for legacy uploads)
  const attachments: any[] = [];
  if (params.fileBuffer && params.fileBuffer.length <= 10 * 1024 * 1024) {
    attachments.push({
      filename: params.fileName || 'artwork.pdf',
      content: params.fileBuffer,
      contentType: params.contentType || 'application/octet-stream',
    });
  }

  try {
    const info = await transporter.sendMail({
      from: `"Print Today Artwork" <${senderUser}>`,
      to: targetEmails,
      replyTo: params.email,
      subject: `[WeTransfer Artwork] ${params.product} (${params.quantity} qty) - ${params.name} (${params.email})`,
      text: `NEW WETRANSFER ARTWORK ORDER\n\nWeTransfer Link: ${activeLink}\nCustomer Email: ${params.email}\nCustomer Name: ${params.name}\nCustomer Phone: ${params.phone}\nProduct: ${params.product}\nQuantity: ${params.quantity}\nFulfilment: ${params.deliveryOption}\n${params.urgency ? `Urgency: ${params.urgency}\n` : ''}${params.notes ? `Notes: ${params.notes}\n` : ''}\nReply directly to this email to communicate with the client.\n\nPrint Today UK - 75 Green Street, London E7 8JF`,
      html: htmlContent,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    return { sent: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Nodemailer sendUploadOrderEmail failed:', error);
    return { sent: false, error: error.message || 'Failed to dispatch email' };
  }
}
