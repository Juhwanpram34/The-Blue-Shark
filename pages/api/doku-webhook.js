import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const event = req.body;

  try {
    const transactionStatus = event.transaction?.status;
    const invoiceNumber = event.order?.invoice_number || '';
    const metadata = event.additional_info?.metadata || {};
    const userId = metadata.userId || '';
    const planId = metadata.planId || '';

    // Extract from invoice number if metadata missing
    let resolvedPlanId = planId;
    if (!resolvedPlanId && invoiceNumber.startsWith('INV-')) {
      const parts = invoiceNumber.split('-');
      if (parts.length >= 3) {
        resolvedPlanId = parts[1].toLowerCase();
      }
    }

    if (transactionStatus === 'SUCCESS' || transactionStatus === 'AUTHORIZED') {
      if (userId && resolvedPlanId) {
        // Update user profile plan
        await supabase
          .from('profiles')
          .update({ plan: resolvedPlanId })
          .eq('id', userId);

        // Create subscription record
        await supabase.from('subscriptions').insert({
          user_id: userId,
          plan: resolvedPlanId,
          status: 'active',
          payment_provider: 'doku',
          payment_id: invoiceNumber,
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

        // Update query limits
        const limits = { free: 10, pro: 100, business: -1 };
        await supabase
          .from('profiles')
          .update({
            queries_limit: limits[resolvedPlanId] || 10,
            queries_used: 0,
          })
          .eq('id', userId);

        // Send confirmation email
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', userId)
            .single();

          const customerEmail = event.customer?.email;
          if (customerEmail) {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'welcome',
                to: customerEmail,
                name: profile?.full_name || 'User',
              }),
            });
          }
        } catch (e) {
          console.error('Email notification error:', e);
        }
      }
    } else if (transactionStatus === 'FAILED' || transactionStatus === 'EXPIRED') {
      console.log(`Payment ${transactionStatus}:`, invoiceNumber);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('DOKU webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
