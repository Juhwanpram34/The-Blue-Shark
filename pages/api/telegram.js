import { AGENTS } from '../../lib/agents';

// Agent selection state per chat (in-memory, resets on cold start)
const chatState = {};

function getAgentKeyboard() {
  const rows = [];
  for (let i = 0; i < AGENTS.length; i += 2) {
    const row = [{ text: `${AGENTS[i].icon} ${AGENTS[i].name}`, callback_data: `agent:${AGENTS[i].id}` }];
    if (AGENTS[i + 1]) {
      row.push({ text: `${AGENTS[i + 1].icon} ${AGENTS[i + 1].name}`, callback_data: `agent:${AGENTS[i + 1].id}` });
    }
    rows.push(row);
  }
  return { inline_keyboard: rows };
}

function getMainMenuKeyboard() {
  return {
    keyboard: [
      [{ text: '🤖 Pilih Agen' }, { text: '🤝 Multi-Agent' }],
      [{ text: '📋 Agen Aktif' }, { text: '🌐 Buka Platform' }],
      [{ text: 'ℹ️ Bantuan' }],
    ],
    resize_keyboard: true,
  };
}

async function sendTelegram(method, body) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN not set');
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function callAgent(agentId, userMessage) {
  const agent = AGENTS.find(a => a.id === agentId);
  if (!agent) return 'Agen tidak ditemukan.';

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return '⚠️ OpenAI API belum dikonfigurasi.';

  try {
    const today = new Date().toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const systemPrompt = agent.systemPrompt +
      `\n\nToday is ${today}. Keep responses concise for Telegram (max 3000 chars). Use markdown formatting compatible with Telegram (bold: *text*, italic: _text_, code: \`code\`).`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (data.error) return `⚠️ Error: ${data.error.message}`;
    return data.choices?.[0]?.message?.content || 'Maaf, tidak ada respons.';
  } catch (e) {
    console.error('Agent call error:', e);
    return '⚠️ Terjadi kesalahan. Silakan coba lagi.';
  }
}

async function callMultiAgent(userMessage, agentIds) {
  const results = await Promise.all(
    agentIds.map(async (id) => {
      const agent = AGENTS.find(a => a.id === id);
      const result = await callAgent(id, userMessage);
      return { agent, result };
    })
  );

  let response = `🤝 *Multi-Agent Collaboration*\n\n`;
  response += `📝 *Pertanyaan:* ${userMessage}\n\n`;
  response += `───────────────\n\n`;

  for (const { agent, result } of results) {
    // Truncate each agent result for Telegram limit
    const truncated = result.length > 800 ? result.substring(0, 800) + '...' : result;
    response += `${agent.icon} *${agent.name}*\n${truncated}\n\n───────────────\n\n`;
  }

  response += `_Hasil lengkap tersedia di platform web_`;
  return response;
}

// Convert markdown bold **text** to Telegram *text*
function toTelegramMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '*$1*')
    .replace(/#{1,3}\s/g, '')  // remove headers
    .substring(0, 4000); // Telegram limit
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'Blue Shark Telegram Bot' });
  }

  const { message, callback_query } = req.body;

  try {
    // Handle callback queries (inline button clicks)
    if (callback_query) {
      const chatId = callback_query.message.chat.id;
      const data = callback_query.data;

      if (data.startsWith('agent:')) {
        const agentId = data.replace('agent:', '');
        const agent = AGENTS.find(a => a.id === agentId);

        chatState[chatId] = { agentId, mode: 'single' };

        await sendTelegram('answerCallbackQuery', {
          callback_query_id: callback_query.id,
          text: `${agent.icon} ${agent.name} dipilih!`,
        });

        await sendTelegram('sendMessage', {
          chat_id: chatId,
          text: `${agent.icon} *${agent.name} Agent* aktif!\n\n${agent.description}\n\n💬 Silakan ketik pertanyaan Anda sekarang.\n\n💡 *Contoh:*\n${(agent.suggestions || []).map(s => `• ${s}`).join('\n')}`,
          parse_mode: 'Markdown',
          reply_markup: getMainMenuKeyboard(),
        });
      }

      if (data.startsWith('collab:')) {
        const agentId = data.replace('collab:', '');
        const state = chatState[chatId] || {};

        if (!state.collabAgents) state.collabAgents = [];

        if (state.collabAgents.includes(agentId)) {
          state.collabAgents = state.collabAgents.filter(id => id !== agentId);
        } else if (state.collabAgents.length < 4) {
          state.collabAgents.push(agentId);
        }

        state.mode = 'collab';
        chatState[chatId] = state;

        const selected = state.collabAgents.map(id => {
          const a = AGENTS.find(ag => ag.id === id);
          return `${a.icon} ${a.name}`;
        }).join(', ') || 'Belum ada';

        // Build collab keyboard with checkmarks
        const rows = [];
        for (let i = 0; i < AGENTS.length; i += 2) {
          const row = AGENTS.slice(i, i + 2).map(a => ({
            text: `${state.collabAgents.includes(a.id) ? '✅' : ''} ${a.icon} ${a.name}`,
            callback_data: `collab:${a.id}`,
          }));
          rows.push(row);
        }
        if (state.collabAgents.length >= 2) {
          rows.push([{ text: '🚀 Mulai Kolaborasi', callback_data: 'collab:start' }]);
        }

        await sendTelegram('answerCallbackQuery', {
          callback_query_id: callback_query.id,
        });

        await sendTelegram('editMessageText', {
          chat_id: chatId,
          message_id: callback_query.message.message_id,
          text: `🤝 *Multi-Agent Collaboration*\n\nPilih 2-4 agen untuk kolaborasi:\n\n*Terpilih:* ${selected}`,
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: rows },
        });
      }

      if (data === 'collab:start') {
        const state = chatState[chatId] || {};
        if (state.collabAgents && state.collabAgents.length >= 2) {
          state.mode = 'collab';
          state.collabReady = true;
          chatState[chatId] = state;

          const selected = state.collabAgents.map(id => {
            const a = AGENTS.find(ag => ag.id === id);
            return `${a.icon} ${a.name}`;
          }).join(', ');

          await sendTelegram('answerCallbackQuery', {
            callback_query_id: callback_query.id,
            text: 'Kolaborasi siap!',
          });

          await sendTelegram('sendMessage', {
            chat_id: chatId,
            text: `🤝 *Mode Kolaborasi Aktif*\n\n*Agen:* ${selected}\n\n💬 Kirim pertanyaan Anda dan semua agen akan menganalisis bersama.`,
            parse_mode: 'Markdown',
            reply_markup: getMainMenuKeyboard(),
          });
        }
      }

      return res.status(200).json({ ok: true });
    }

    // Handle text messages
    if (!message?.text) return res.status(200).json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text.trim();
    const firstName = message.from?.first_name || 'User';

    // /start command
    if (text === '/start') {
      chatState[chatId] = {};
      await sendTelegram('sendMessage', {
        chat_id: chatId,
        text: `🦈 *Selamat Datang di The Blue Shark!*\n\nHai ${firstName}! Saya adalah AI Multi-Agent Platform dengan berbagai agen AI spesialis.\n\n🤖 *Pilih Agen* — Chat dengan agen AI tertentu\n🤝 *Multi-Agent* — Beberapa agen analisis bersama\n🌐 *Buka Platform* — Akses fitur lengkap di web\n\nMulai dengan memilih agen atau langsung ketik pertanyaan! 👇`,
        parse_mode: 'Markdown',
        reply_markup: getMainMenuKeyboard(),
      });
      return res.status(200).json({ ok: true });
    }

    // /help command
    if (text === '/help' || text === 'ℹ️ Bantuan') {
      await sendTelegram('sendMessage', {
        chat_id: chatId,
        text: `🦈 *Panduan The Blue Shark Bot*\n\n*Perintah:*\n/start — Mulai ulang\n/agents — Pilih agen AI\n/collab — Mode multi-agen\n/status — Lihat agen aktif\n\n*Cara Pakai:*\n1️⃣ Pilih agen dengan tombol "🤖 Pilih Agen"\n2️⃣ Ketik pertanyaan Anda\n3️⃣ Tunggu analisis dari AI\n\n*Agen Tersedia:*\n${AGENTS.map(a => `${a.icon} *${a.name}* — ${a.description}`).join('\n')}\n\n🌐 Platform web: the-blue-shark-ars8.vercel.app`,
        parse_mode: 'Markdown',
        reply_markup: getMainMenuKeyboard(),
      });
      return res.status(200).json({ ok: true });
    }

    // Agent selection
    if (text === '/agents' || text === '🤖 Pilih Agen') {
      await sendTelegram('sendMessage', {
        chat_id: chatId,
        text: '🤖 *Pilih Agen AI:*\n\nKlik agen yang ingin Anda gunakan:',
        parse_mode: 'Markdown',
        reply_markup: getAgentKeyboard(),
      });
      return res.status(200).json({ ok: true });
    }

    // Collab mode
    if (text === '/collab' || text === '🤝 Multi-Agent') {
      chatState[chatId] = { mode: 'collab', collabAgents: [] };

      const rows = [];
      for (let i = 0; i < AGENTS.length; i += 2) {
        const row = AGENTS.slice(i, i + 2).map(a => ({
          text: `${a.icon} ${a.name}`,
          callback_data: `collab:${a.id}`,
        }));
        rows.push(row);
      }

      await sendTelegram('sendMessage', {
        chat_id: chatId,
        text: `🤝 *Multi-Agent Collaboration*\n\nPilih 2-4 agen untuk kolaborasi:\n\n*Terpilih:* Belum ada`,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: rows },
      });
      return res.status(200).json({ ok: true });
    }

    // Status
    if (text === '/status' || text === '📋 Agen Aktif') {
      const state = chatState[chatId] || {};
      if (state.agentId) {
        const agent = AGENTS.find(a => a.id === state.agentId);
        await sendTelegram('sendMessage', {
          chat_id: chatId,
          text: `📋 *Status:*\n\n*Mode:* ${state.mode === 'collab' ? 'Multi-Agent Collaboration' : 'Single Agent'}\n*Agen Aktif:* ${agent.icon} ${agent.name}\n\nKetik pertanyaan untuk mulai chat.`,
          parse_mode: 'Markdown',
        });
      } else if (state.mode === 'collab' && state.collabAgents?.length > 0) {
        const selected = state.collabAgents.map(id => {
          const a = AGENTS.find(ag => ag.id === id);
          return `${a.icon} ${a.name}`;
        }).join(', ');
        await sendTelegram('sendMessage', {
          chat_id: chatId,
          text: `📋 *Status:*\n\n*Mode:* Multi-Agent Collaboration\n*Agen:* ${selected}`,
          parse_mode: 'Markdown',
        });
      } else {
        await sendTelegram('sendMessage', {
          chat_id: chatId,
          text: `📋 *Status:* Belum ada agen aktif.\n\nGunakan "🤖 Pilih Agen" untuk memulai.`,
          parse_mode: 'Markdown',
          reply_markup: getMainMenuKeyboard(),
        });
      }
      return res.status(200).json({ ok: true });
    }

    // Open platform
    if (text === '🌐 Buka Platform') {
      await sendTelegram('sendMessage', {
        chat_id: chatId,
        text: `🌐 *Buka The Blue Shark Platform*\n\nAkses semua fitur lengkap di web:`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🦈 Buka Platform', url: 'https://the-blue-shark-ars8.vercel.app' }],
            [{ text: '📖 Landing Page', url: 'https://the-blue-shark-ars8.vercel.app/landing' }],
          ],
        },
      });
      return res.status(200).json({ ok: true });
    }

    // Process chat message with active agent
    const state = chatState[chatId] || {};

    // If no agent selected, default to market-research
    if (!state.agentId && !state.collabReady) {
      chatState[chatId] = { agentId: 'market-research', mode: 'single' };
      state.agentId = 'market-research';
      state.mode = 'single';
    }

    // Send typing indicator
    await sendTelegram('sendChatAction', { chat_id: chatId, action: 'typing' });

    if (state.mode === 'collab' && state.collabReady && state.collabAgents?.length >= 2) {
      // Multi-agent collaboration
      const response = await callMultiAgent(text, state.collabAgents);
      const truncated = response.substring(0, 4000);

      await sendTelegram('sendMessage', {
        chat_id: chatId,
        text: truncated,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🌐 Lihat Hasil Lengkap', url: 'https://the-blue-shark-ars8.vercel.app' }],
          ],
        },
      });
    } else {
      // Single agent chat
      const agent = AGENTS.find(a => a.id === state.agentId);
      const rawResponse = await callAgent(state.agentId, text);
      const response = toTelegramMarkdown(rawResponse);

      await sendTelegram('sendMessage', {
        chat_id: chatId,
        text: `${agent.icon} *${agent.name}*\n\n${response}`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🌐 Buka di Platform', url: 'https://the-blue-shark-ars8.vercel.app' }],
          ],
        },
      });
    }
  } catch (error) {
    console.error('Telegram bot error:', error);
    if (message?.chat?.id) {
      await sendTelegram('sendMessage', {
        chat_id: message.chat.id,
        text: '⚠️ Terjadi kesalahan. Silakan coba lagi atau kunjungi platform web kami.',
        reply_markup: getMainMenuKeyboard(),
      }).catch(() => {});
    }
  }

  return res.status(200).json({ ok: true });
}
