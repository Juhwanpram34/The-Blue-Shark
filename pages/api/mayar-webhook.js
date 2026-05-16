import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'Mayar Webhook Endpoint' });
  }

  // Verify webhook signature (optional but recommended)
  const signature = req.headers['x-mayar-signature'] || '';
  const webhookSecret = process.env.MAYAR_WEBHOOK_SECRET;

  if (webhookSecret && signature) {
    const crypto = require('crypto');
    const expectedSig = crypto.createHmac('sha256', webhookSecret).update(JSON.stringify(req.body)).digest('hex');
    if (signature !== expectedSig) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  try {
    const { event, data } = req.body;

    console.log('Mayar webhook received:', event, JSON.stringify(data).substring(0, 200));

    // Handle payment success
    if (event === 'payment.success' || event === 'transaction.paid') {
      const email = data?.customer_email || data?.email || data?.customerEmail;
      const productName = data?.product_name || data?.productName || '';
      const amount = data?.amount || data?.total || 0;
      const transactionId = data?.id || data?.transaction_id || data?.transactionId || '';

      if (!email) {
        console.error('No email found in webhook data');
        return res.status(400).json({ error: 'Missing customer email' });
      }

      // Determine plan based on product name or amount
      let newPlan = 'free';
      const productLower = productName.toLowerCase();
      const amountNum = parseInt(amount);

      if (productLower.includes('business') || productLower.includes('bisnis') || amountNum >= 1500000) {
        newPlan = 'business';
      } else if (productLower.includes('pro') || amountNum >= 400000) {
        newPlan = 'pro';
      }

      // Find user by email
      const { data: users, error: userError } = await supabase.auth.admin.listUsers();
      
      let userId = null;
      if (!userError && users?.users) {
        const user = users.users.find(u => u.email === email);
        if (user) userId = user.id;
      }

      if (!userId) {
        // Try finding by email in profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();
        if (profile) userId = profile.id;
      }

      if (userId) {
        // Update user plan in profiles table
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            plan: newPlan,
            queries_used: 0, // Reset queries on upgrade
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

        if (updateError) {
          console.error('Failed to update plan:', updateError);
          return res.status(500).json({ error: 'Failed to update plan' });
        }

        // Log the payment
        await supabase.from('payments').insert({
          user_id: userId,
          plan: newPlan,
          amount: amountNum,
          transaction_id: transactionId,
          provider: 'mayar',
          status: 'success',
          metadata: JSON.stringify(data),
        }).catch(e => console.error('Payment log error:', e));

        // Send confirmation email
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://the-blue-shark-ars8.vercel.app'}/api/notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'payment-confirm',
              to: email,
              name: data?.customer_name || data?.customerName || 'User',
              data: {
                planName: newPlan === 'business' ? 'Business' : 'Pro',
                price: newPlan === 'business' ? 99 : 29,
                transactionId,
              },
            }),
          });
        } catch (e) { console.error('Email notification error:', e); }

        console.log(`✅ User ${email} upgraded to ${newPlan}`);
        return res.status(200).json({ success: true, plan: newPlan, userId });
      } else {
        console.error(`User not found for email: ${email}`);
        // Store pending upgrade for when user registers
        await supabase.from('pending_upgrades').insert({
          email,
          plan: newPlan,
          amount: amountNum,
          transaction_id: transactionId,
          provider: 'mayar',
          created_at: new Date().toISOString(),
        }).catch(e => console.error('Pending upgrade log error:', e));

        return res.status(200).json({ success: true, pending: true, email });
      }
    }

    // Handle subscription events
    if (event === 'subscription.active' || event === 'license.activated') {
      console.log('Subscription activated:', data);
      return res.status(200).json({ success: true, event });
    }

    if (event === 'subscription.expired' || event === 'subscription.cancelled') {
      const email = data?.customer_email || data?.email || data?.customerEmail;
      if (email) {
        // Downgrade to free
        const { data: users } = await supabase.auth.admin.listUsers();
        const user = users?.users?.find(u => u.email === email);
        if (user) {
          await supabase.from('profiles').update({ plan: 'free' }).eq('id', user.id);
          console.log(`User ${email} downgraded to free (subscription expired)`);
        }
      }
      return res.status(200).json({ success: true, event });
    }

    // Default response for unhandled events
    return res.status(200).json({ success: true, event: event || 'unknown' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
