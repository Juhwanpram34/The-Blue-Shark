import { PLANS } from '../../lib/pricing';
import crypto from 'crypto';

const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID;
const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY;
const DOKU_BASE_URL = 'https://api.doku.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://the-blue-shark-ars8-juhwanpram34s-projects.vercel.app';

function generateSignature(clientId, requestId, requestTimestamp, requestTarget, body, secretKey) {
  const digest = crypto.createHash('sha256').update(JSON.stringify(body)).digest('base64');
  const componentSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;
  const signature = crypto.createHmac('sha256', secretKey).update(componentSignature).digest('base64');
  return `HMACSHA256=${signature}`;
}

function generateRequestId() {
  return 'BS-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!DOKU_CLIENT_ID || !DOKU_SECRET_KEY) {
    return res.status(500).json({ error: 'DOKU not configured' });
  }

  const { planId, userId, userEmail, userName } = req.body;

  if (!planId || !userId || !userEmail) {
    return res.status(400).json({ error: 'Missing planId, userId, or userEmail' });
  }

  const plan = PLANS.find(p => p.id === planId);
  if (!plan || plan.price === 0) {
    return res.status(400).json({ error: 'Paket tidak valid atau paket gratis' });
  }

  // Convert USD to IDR
  const usdToIdr = 16000;
  const amountIdr = plan.price * usdToIdr;

  const requestId = generateRequestId();
  const invoiceNumber = `INV-${planId.toUpperCase()}-${Date.now()}`;
  const requestTimestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const requestTarget = '/checkout/v1/payment';

  const body = {
    order: {
      amount: amountIdr,
      invoice_number: invoiceNumber,
      currency: 'IDR',
      session_id: requestId,
      callback_url: `${APP_URL}/api/doku-webhook`,
      redirect_url: `${APP_URL}?payment=success&plan=${planId}`,
      auto_redirect: true,
      language: 'ID',
    },
    payment: {
      payment_due_date: 1440, // 24 hours in minutes
    },
    customer: {
      id: userId,
      name: userName || 'User',
      email: userEmail,
    },
    additional_info: {
      metadata: {
        userId,
        planId,
        planName: plan.name,
      },
    },
  };

  const signature = generateSignature(
    DOKU_CLIENT_ID, requestId, requestTimestamp, requestTarget, body, DOKU_SECRET_KEY
  );

  try {
    const response = await fetch(`${DOKU_BASE_URL}${requestTarget}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': DOKU_CLIENT_ID,
        'Request-Id': requestId,
        'Request-Timestamp': requestTimestamp,
        'Signature': signature,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data.message && data.message[0] === 'SUCCESS') {
      return res.status(200).json({
        success: true,
        paymentUrl: data.response?.payment?.url || data.response?.payment?.payment_url,
        invoiceNumber,
        amount: amountIdr,
        currency: 'IDR',
        sessionId: data.response?.order?.session_id,
      });
    } else {
      console.error('DOKU error:', data);
      return res.status(500).json({
        error: data.error?.message || data.message?.[0] || 'Gagal membuat pembayaran',
      });
    }
  } catch (error) {
    console.error('DOKU checkout error:', error);
    return res.status(500).json({ error: 'Gagal memproses pembayaran' });
  }
}
