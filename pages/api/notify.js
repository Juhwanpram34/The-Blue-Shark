import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'The Blue Shark <noreply@resend.dev>';

// Email Templates
function welcomeEmail(name) {
  return {
    subject: '🦈 Selamat Datang di The Blue Shark!',
    html: `
      <div style="max-width:600px;margin:0 auto;background:#0a1628;color:#e0e8f0;font-family:Arial,sans-serif;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#00d4ff,#0057ff);padding:40px 30px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">🦈</div>
          <h1 style="color:#fff;font-size:24px;margin:0;">Selamat Datang, ${name}!</h1>
          <p style="color:rgba(255,255,255,0.8);font-size:14px;margin-top:8px;">Anda sekarang bagian dari The Blue Shark</p>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#00d4ff;font-size:18px;margin-bottom:16px;">8 Agen AI Siap Membantu Bisnis Anda</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#d0d8e4;font-size:13px;">🔍 Market Research</td><td style="padding:8px 0;color:#d0d8e4;font-size:13px;">✍️ Content Creator</td></tr>
            <tr><td style="padding:8px 0;color:#d0d8e4;font-size:13px;">📊 Sentiment Analysis</td><td style="padding:8px 0;color:#d0d8e4;font-size:13px;">🚀 Marketing Optimizer</td></tr>
            <tr><td style="padding:8px 0;color:#d0d8e4;font-size:13px;">🛡️ Cybersecurity</td><td style="padding:8px 0;color:#d0d8e4;font-size:13px;">⚙️ Workflow Automation</td></tr>
            <tr><td style="padding:8px 0;color:#d0d8e4;font-size:13px;">🧠 ML Performance</td><td style="padding:8px 0;color:#d0d8e4;font-size:13px;">💬 Customer Support</td></tr>
          </table>
          <div style="margin-top:24px;text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://the-blue-shark-ars8-juhwanpram34s-projects.vercel.app'}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#00d4ff,#0057ff);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;">Mulai Sekarang</a>
          </div>
          <div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.1);">
            <h3 style="color:#00d4ff;font-size:14px;margin-bottom:12px;">Tips Memulai:</h3>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.7;margin-bottom:8px;">1. Pilih agen AI yang sesuai kebutuhan Anda</p>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.7;margin-bottom:8px;">2. Coba Multi-Agent Collaboration untuk analisis komprehensif</p>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.7;">3. Upgrade ke Pro untuk akses semua fitur premium</p>
          </div>
        </div>
        <div style="background:rgba(0,0,0,0.3);padding:20px 30px;text-align:center;">
          <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;">© 2026 The Blue Shark — AI Multi-Agent Platform</p>
        </div>
      </div>
    `,
  };
}

function queryLimitEmail(name, used, limit) {
  const percentage = Math.round((used / limit) * 100);
  return {
    subject: `⚠️ Query Anda sudah ${percentage}% — ${used}/${limit} hari ini`,
    html: `
      <div style="max-width:600px;margin:0 auto;background:#0a1628;color:#e0e8f0;font-family:Arial,sans-serif;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#ff6b35,#ff2e63);padding:30px;text-align:center;">
          <div style="font-size:40px;margin-bottom:8px;">⚠️</div>
          <h1 style="color:#fff;font-size:20px;margin:0;">Query Limit Hampir Habis</h1>
        </div>
        <div style="padding:30px;">
          <p style="color:#d0d8e4;font-size:14px;line-height:1.7;margin-bottom:20px;">Halo ${name},</p>
          <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:20px;margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:rgba(255,255,255,0.5);font-size:13px;">Terpakai</span>
              <span style="color:#ff6b35;font-size:13px;font-weight:600;">${used} / ${limit}</span>
            </div>
            <div style="background:rgba(255,255,255,0.1);border-radius:10px;height:8px;overflow:hidden;">
              <div style="background:linear-gradient(90deg,#ff6b35,#ff2e63);height:100%;width:${percentage}%;border-radius:10px;"></div>
            </div>
          </div>
          <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.7;margin-bottom:20px;">Anda telah menggunakan ${percentage}% dari batas query harian Anda. Upgrade ke paket Pro atau Business untuk mendapatkan lebih banyak query.</p>
          <div style="text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://the-blue-shark-ars8-juhwanpram34s-projects.vercel.app'}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#00d4ff,#0057ff);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;">Upgrade Sekarang</a>
          </div>
        </div>
        <div style="background:rgba(0,0,0,0.3);padding:16px 30px;text-align:center;">
          <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;">© 2026 The Blue Shark — AI Multi-Agent Platform</p>
        </div>
      </div>
    `,
  };
}

function weeklySummaryEmail(name, stats) {
  return {
    subject: `📊 Ringkasan Mingguan The Blue Shark — ${stats.totalQueries} queries`,
    html: `
      <div style="max-width:600px;margin:0 auto;background:#0a1628;color:#e0e8f0;font-family:Arial,sans-serif;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#00d4ff,#aa00ff);padding:30px;text-align:center;">
          <div style="font-size:40px;margin-bottom:8px;">📊</div>
          <h1 style="color:#fff;font-size:20px;margin:0;">Ringkasan Mingguan Anda</h1>
          <p style="color:rgba(255,255,255,0.8);font-size:13px;margin-top:6px;">${stats.weekRange}</p>
        </div>
        <div style="padding:30px;">
          <p style="color:#d0d8e4;font-size:14px;line-height:1.7;margin-bottom:20px;">Halo ${name}, berikut ringkasan aktivitas Anda minggu ini:</p>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
            <div style="background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.2);border-radius:12px;padding:16px;text-align:center;">
              <div style="font-size:28px;font-weight:700;color:#00d4ff;">${stats.totalQueries}</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px;">Total Queries</div>
            </div>
            <div style="background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.2);border-radius:12px;padding:16px;text-align:center;">
              <div style="font-size:28px;font-weight:700;color:#00e676;">${stats.agentsUsed}</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px;">Agen Digunakan</div>
            </div>
            <div style="background:rgba(170,0,255,0.08);border:1px solid rgba(170,0,255,0.2);border-radius:12px;padding:16px;text-align:center;">
              <div style="font-size:28px;font-weight:700;color:#aa00ff;">${stats.collabSessions}</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px;">Kolaborasi</div>
            </div>
            <div style="background:rgba(255,107,53,0.08);border:1px solid rgba(255,107,53,0.2);border-radius:12px;padding:16px;text-align:center;">
              <div style="font-size:28px;font-weight:700;color:#ff6b35;">${stats.topAgent}</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px;">Agen Favorit</div>
            </div>
          </div>

          ${stats.topQueries && stats.topQueries.length > 0 ? `
          <div style="margin-bottom:20px;">
            <h3 style="color:#00d4ff;font-size:14px;margin-bottom:12px;">Topik Populer Minggu Ini:</h3>
            ${stats.topQueries.map((q, i) => `<p style="color:rgba(255,255,255,0.5);font-size:13px;margin-bottom:6px;">${i + 1}. ${q}</p>`).join('')}
          </div>
          ` : ''}

          <div style="text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://the-blue-shark-ars8-juhwanpram34s-projects.vercel.app'}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#00d4ff,#0057ff);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;">Buka Dashboard</a>
          </div>
        </div>
        <div style="background:rgba(0,0,0,0.3);padding:16px 30px;text-align:center;">
          <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;">© 2026 The Blue Shark — AI Multi-Agent Platform</p>
        </div>
      </div>
    `,
  };
}

function paymentConfirmEmail(name, planName, price, transactionId) {
  return {
    subject: `✅ Pembayaran Berhasil — Paket ${planName} Aktif!`,
    html: `
      <div style="max-width:600px;margin:0 auto;background:#0a1628;color:#e0e8f0;font-family:Arial,sans-serif;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#00e676,#00bfa5);padding:30px;text-align:center;">
          <div style="font-size:48px;margin-bottom:8px;">✅</div>
          <h1 style="color:#fff;font-size:22px;margin:0;">Pembayaran Berhasil!</h1>
          <p style="color:rgba(255,255,255,0.8);font-size:13px;margin-top:6px;">Paket ${planName} Anda sekarang aktif</p>
        </div>
        <div style="padding:30px;">
          <p style="color:#d0d8e4;font-size:14px;line-height:1.7;margin-bottom:20px;">Halo ${name},</p>
          <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;margin-bottom:20px;">Terima kasih atas pembayaran Anda. Berikut detail transaksi:</p>
          <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;margin-bottom:20px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;">Paket</td><td style="padding:8px 0;color:#00d4ff;font-size:13px;font-weight:600;text-align:right;">${planName}</td></tr>
              <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;">Harga</td><td style="padding:8px 0;color:#e0e8f0;font-size:13px;text-align:right;">$${price}/bulan</td></tr>
              <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;">ID Transaksi</td><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:11px;text-align:right;font-family:monospace;">${transactionId}</td></tr>
              <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;">Tanggal</td><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:12px;text-align:right;">${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
            </table>
          </div>
          <div style="text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://the-blue-shark-ars8.vercel.app'}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#00d4ff,#0057ff);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;">Buka Dashboard</a>
          </div>
          <p style="color:rgba(255,255,255,0.3);font-size:11px;text-align:center;margin-top:20px;">Simpan email ini sebagai bukti pembayaran.</p>
        </div>
        <div style="background:rgba(0,0,0,0.3);padding:16px 30px;text-align:center;">
          <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;">© 2026 The Blue Shark — AI Multi-Agent Platform</p>
        </div>
      </div>
    `,
  };
}

function upgradeEmail(name, planName) {
  return {
    subject: `🚀 Upgrade Berhasil — Selamat Datang di ${planName}!`,
    html: `
      <div style="max-width:600px;margin:0 auto;background:#0a1628;color:#e0e8f0;font-family:Arial,sans-serif;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#00d4ff,#aa00ff);padding:30px;text-align:center;">
          <div style="font-size:48px;margin-bottom:8px;">🚀</div>
          <h1 style="color:#fff;font-size:22px;margin:0;">Upgrade Berhasil!</h1>
          <p style="color:rgba(255,255,255,0.8);font-size:13px;margin-top:6px;">Anda sekarang pengguna ${planName}</p>
        </div>
        <div style="padding:30px;">
          <p style="color:#d0d8e4;font-size:14px;line-height:1.7;margin-bottom:20px;">Halo ${name},</p>
          <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;margin-bottom:20px;">Selamat! Anda sekarang memiliki akses ke fitur premium:</p>
          <div style="margin-bottom:20px;">
            <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:2;">✅ Akses semua 8 Agen AI</p>
            <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:2;">✅ Multi-Agent Collaboration</p>
            <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:2;">✅ ${planName === 'Business' ? 'Unlimited' : '100'} queries per hari</p>
            <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:2;">✅ Export hasil (PDF/CSV)</p>
            <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:2;">✅ Live data integrations</p>
          </div>
          <div style="text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://the-blue-shark-ars8.vercel.app'}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#00d4ff,#0057ff);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;">Mulai Gunakan Fitur Premium</a>
          </div>
        </div>
        <div style="background:rgba(0,0,0,0.3);padding:16px 30px;text-align:center;">
          <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;">© 2026 The Blue Shark — AI Multi-Agent Platform</p>
        </div>
      </div>
    `,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Resend API key not configured' });
  }

  const { type, to, name, data } = req.body;

  if (!type || !to) {
    return res.status(400).json({ error: 'Missing type or email' });
  }

  try {
    let emailContent;

    switch (type) {
      case 'welcome':
        emailContent = welcomeEmail(name || 'User');
        break;
      case 'query-limit':
        emailContent = queryLimitEmail(name || 'User', data?.used || 0, data?.limit || 10);
        break;
      case 'weekly-summary':
        emailContent = weeklySummaryEmail(name || 'User', data || {
          totalQueries: 0, agentsUsed: 0, collabSessions: 0,
          topAgent: '-', weekRange: '-', topQueries: [],
        });
        break;
      case 'payment-confirm':
        emailContent = paymentConfirmEmail(name || 'User', data?.planName || 'Pro', data?.price || 29, data?.transactionId || '-');
        break;
      case 'upgrade':
        emailContent = upgradeEmail(name || 'User', data?.planName || 'Pro');
        break;
      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    return res.status(200).json({ success: true, id: result.data?.id });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
