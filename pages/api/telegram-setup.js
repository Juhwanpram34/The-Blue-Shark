export default async function handler(req, res) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not set' });
  }

  const action = req.query.action || 'set';
  const webhookUrl = `https://the-blue-shark-ars8.vercel.app/api/telegram`;

  if (action === 'set') {
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true,
      }),
    });
    const data = await response.json();
    return res.status(200).json({ action: 'setWebhook', webhookUrl, result: data });
  }

  if (action === 'info') {
    const response = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const data = await response.json();
    return res.status(200).json({ action: 'getWebhookInfo', result: data });
  }

  if (action === 'delete') {
    const response = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
    const data = await response.json();
    return res.status(200).json({ action: 'deleteWebhook', result: data });
  }

  return res.status(400).json({ error: 'Invalid action. Use: set, info, delete' });
}
