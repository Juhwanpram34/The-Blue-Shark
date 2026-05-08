import { createClient } from '@supabase/supabase-js';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  // For now, process without signature verification
  // In production, verify the webhook signature
  let event;
  try {
    event = JSON.parse(rawBody.toString());
  } catch (err) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        const subscriptionId = session.subscription;

        if (userId && planId) {
          // Update user profile plan
          await supabase
            .from('profiles')
            .update({ plan: planId })
            .eq('id', userId);

          // Create subscription record
          await supabase.from('subscriptions').insert({
            user_id: userId,
            plan: planId,
            status: 'active',
            payment_provider: 'stripe',
            payment_id: subscriptionId,
            starts_at: new Date().toISOString(),
          });

          // Update query limits based on plan
          const limits = { free: 50, pro: 100, business: -1 };
          await supabase
            .from('profiles')
            .update({ queries_limit: limits[planId] || 50 })
            .eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const status = subscription.cancel_at_period_end ? 'cancelled' : 'active';

        await supabase
          .from('subscriptions')
          .update({ status })
          .eq('payment_id', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        // Downgrade to free
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('payment_id', subscription.id)
          .single();

        if (sub?.user_id) {
          await supabase
            .from('profiles')
            .update({ plan: 'free', queries_limit: 50 })
            .eq('id', sub.user_id);

          await supabase
            .from('subscriptions')
            .update({ status: 'expired', ends_at: new Date().toISOString() })
            .eq('payment_id', subscription.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('payment_id', subscriptionId);
        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
