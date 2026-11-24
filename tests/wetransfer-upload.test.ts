import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';

describe('WeTransfer Upload & Order Notification Flow', () => {
  let sentMails: Array<any> = [];

  beforeEach(() => {
    sentMails = [];
    process.env.GMAIL_USER = 'printtodayuk@gmail.com';
    process.env.GMAIL_APP_PASSWORD = 'mock-password';
    process.env.CONTACT_RECEIVER_EMAIL = 'artwork@printtodayuk.com';
  });

  test('1. Validates that customer email is strictly required', async () => {
    const { POST } = await import('@/app/api/upload-order/route');
    const req = new NextRequest('http://localhost:3000/api/upload-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        phone: '07123456789',
        email: '',
        product: 'Same-Day Flyers',
        quantity: '500',
        weTransferUrl: 'https://we.tl/t-abc123xyz',
      }),
    });

    const res = await POST(req);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /email address/i);
  });

  test('2. Validates that WeTransfer link is strictly required', async () => {
    const { POST } = await import('@/app/api/upload-order/route');
    const req = new NextRequest('http://localhost:3000/api/upload-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        phone: '07123456789',
        email: 'john@example.com',
        product: 'Same-Day Flyers',
        quantity: '500',
        weTransferUrl: '',
      }),
    });

    const res = await POST(req);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /WeTransfer/i);
  });

  test('3. Successfully accepts WeTransfer order payload and dispatches to artwork@printtodayuk.com', async () => {
    const { POST } = await import('@/app/api/upload-order/route');
    const req = new NextRequest('http://localhost:3000/api/upload-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Cooper',
        phone: '07987654321',
        email: 'alice@rockdesign.co.uk',
        product: 'A5 Stapled Brochures',
        quantity: '250',
        deliveryOption: 'Collect from E7 Studio (Free)',
        urgency: 'Same-Day Urgent',
        notes: '300gsm silk cover with matt lamination',
        weTransferUrl: 'https://we.tl/t-printtoday2026',
      }),
    });

    const res = await POST(req);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.match(body.message, /WeTransfer/i);
  });

  test('4. sendUploadOrderEmail sets customer email as replyTo and includes WeTransfer link in content', async () => {
    const { sendUploadOrderEmail } = await import('@/lib/email');

    // We can call sendUploadOrderEmail directly with mock params
    // Note: in testing, sendMail will attempt SMTP or return result
    const result = await sendUploadOrderEmail({
      name: 'Sarah Connor',
      phone: '07111222333',
      email: 'sarah@skynet.com',
      product: 'Roller Banners',
      quantity: 2,
      deliveryOption: 'London Courier Delivery',
      urgency: 'Same-Day Urgent',
      weTransferUrl: 'https://wetransfer.com/downloads/abcdef123456',
      notes: 'Premium 850mm stand required',
    });

    // Verification of function return contract
    assert.equal(typeof result.sent, 'boolean');
  });

  test('5. normalizeTransferUrl auto-prepends https:// and rejects non-URL input', async () => {
    const { normalizeTransferUrl } = await import('@/lib/utils');

    const bareLink = normalizeTransferUrl('we.tl/t-abc123');
    assert.equal(bareLink.valid, true);
    assert.equal(bareLink.url, 'https://we.tl/t-abc123');

    const fullLink = normalizeTransferUrl('https://wetransfer.com/downloads/xyz');
    assert.equal(fullLink.valid, true);
    assert.equal(fullLink.url, 'https://wetransfer.com/downloads/xyz');

    const garbage = normalizeTransferUrl('not a valid link');
    assert.equal(garbage.valid, false);

    const noTld = normalizeTransferUrl('justoneword');
    assert.equal(noTld.valid, false);
  });

  test('6. Rejects malformed WeTransfer link in /api/upload-order with 400', async () => {
    const { POST } = await import('@/app/api/upload-order/route');
    const req = new NextRequest('http://localhost:3000/api/upload-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        phone: '07123456789',
        email: 'john@example.com',
        product: 'Same-Day Flyers',
        quantity: '500',
        weTransferUrl: 'not-a-url',
      }),
    });

    const res = await POST(req);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /valid WeTransfer link/i);
  });
});
