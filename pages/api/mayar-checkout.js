export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan, email, name } = req.body;

  if (!plan || !email) {
    return res.status(400).json({ error: 'Missing plan or email' });
  }

  // Mayar payment links — set these in Vercel env vars
  // Create payment links in Mayar dashboard for each plan
  const paymentLinks = {
    pro: process.env.MAYAR_PRO_LINK,
    business: process.env.MAYAR_BUSINESS_LINK,
  };

  const link = paymentLinks[plan];

  if (!link) {
    return res.status(400).json({ error: `Payment link for plan "${plan}" not configured` });
  }

  // Append customer info to Mayar payment link
  const separator = link.includes('?') ? '&' : '?';
  const checkoutUrl = `${link}${separator}email=${encodeURIComponent(email)}&name=${encodeURIComponent(name || '')}`;

  return res.status(200).json({
    success: true,
    checkoutUrl,
    plan,
  });
}
