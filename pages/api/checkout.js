import { PLANS } from '../../lib/pricing';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_API = 'https://api.stripe.com/v1';

async function stripeRequest(endpoint, body) {
  const res = await fetch(`${STRIPE_API}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body).toString(),
  });
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const { planId, userId, userEmail, action } = req.body;

  // Handle cancel subscription
  if (action === 'cancel') {
    const { subscriptionId } = req.body;
    if (!subscriptionId) {
      return res.status(400).json({ error: 'Missing subscriptionId' });
    }
    try {
      const result = await stripeRequest(`/subscriptions/${subscriptionId}`, {
        cancel_at_period_end: 'true',
      });
      return res.status(200).json({ success: true, subscription: result });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  }

  // Handle create checkout session
  if (!planId || !userId || !userEmail) {
    return res.status(400).json({ error: 'Missing planId, userId, or userEmail' });
  }

  const plan = PLANS.find(p => p.id === planId);
  if (!plan || plan.price === 0) {
    return res.status(400).json({ error: 'Invalid plan or free plan selected' });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.origin || 'http://localhost:3000';

  try {
    // Create Stripe Checkout Session
    const session = await stripeRequest('/checkout/sessions', {
      'payment_method_types[]': 'card',
      'mode': 'subscription',
      'customer_email': userEmail,
      'client_reference_id': userId,
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][unit_amount]': (plan.price * 100).toString(),
      'line_items[0][price_data][recurring][interval]': 'month',
      'line_items[0][price_data][product_data][name]': `The Blue Shark - ${plan.name} Plan`,
      'line_items[0][price_data][product_data][description]': plan.features.join(', '),
      'line_items[0][quantity]': '1',
      'success_url': `${baseUrl}?payment=success&plan=${planId}`,
      'cancel_url': `${baseUrl}?payment=cancelled`,
      'metadata[userId]': userId,
      'metadata[planId]': planId,
    });

    if (session.error) {
      return res.status(500).json({ error: session.error.message });
    }

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
