'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { AGENTS } from '../lib/agents';
import { PLANS, getPlan, canUseAgent, canUseCollaboration } from '../lib/pricing';
import { exportToPDF, exportToCSV } from '../lib/export';

const PROMPT_TEMPLATES = {
  'market-research': [
    { icon: '📈', title: 'Analisis Pasar', desc: 'Ukuran pasar, tren, dan peluang', prompt: 'Lakukan analisis pasar lengkap untuk industri [sebutkan industri] di Indonesia tahun 2026. Sertakan ukuran pasar (TAM/SAM/SOM), tren utama, dan peluang pertumbuhan.' },
    { icon: '⚔️', title: 'Analisis Kompetitor', desc: 'SWOT dan positioning pesaing', prompt: 'Buat analisis kompetitor mendalam antara [Brand A] vs [Brand B]. Sertakan SWOT analysis, market share, pricing comparison, dan keunggulan kompetitif masing-masing.' },
    { icon: '🎯', title: 'Segmentasi Pelanggan', desc: 'Persona dan perilaku konsumen', prompt: 'Identifikasi segmentasi pelanggan untuk produk [sebutkan produk/jasa]. Buat 3-4 customer persona lengkap dengan demografi, pain points, dan buying behavior.' },
    { icon: '🌍', title: 'Market Entry', desc: 'Strategi masuk pasar baru', prompt: 'Buat strategi market entry untuk produk [sebutkan produk] ke pasar [sebutkan negara/kota]. Sertakan analisis PESTEL, barriers to entry, dan go-to-market plan.' },
  ],
  'content-creator': [
    { icon: '📱', title: 'Konten Media Sosial', desc: '10 ide post + caption siap pakai', prompt: 'Buatkan 10 ide konten media sosial untuk brand [sebutkan brand/industri] selama 1 bulan. Sertakan hook, caption siap pakai, hashtag, dan format terbaik untuk setiap platform.' },
    { icon: '✉️', title: 'Email Marketing', desc: 'Sequence email konversi tinggi', prompt: 'Buatkan email marketing sequence 5 email untuk [sebutkan produk/jasa]. Sertakan subject line, preview text, body email, dan CTA untuk setiap email.' },
    { icon: '📝', title: 'Blog SEO', desc: 'Artikel teroptimasi mesin pencari', prompt: 'Tulis artikel blog SEO-friendly (1500+ kata) tentang [sebutkan topik]. Sertakan meta title, meta description, heading structure (H1-H3), internal linking suggestion, dan target keyword.' },
    { icon: '🎬', title: 'Script Video', desc: 'Script konten video/reels', prompt: 'Buatkan script video TikTok/Reels 60 detik untuk mempromosikan [sebutkan produk]. Sertakan hook (3 detik pertama), body content, CTA, dan saran visual/B-roll.' },
  ],
  'sentiment-analysis': [
    { icon: '⭐', title: 'Analisis Review', desc: 'Sentimen dari review produk', prompt: 'Analisis sentimen dari review produk [sebutkan produk] di marketplace Indonesia. Identifikasi 5 pain point utama, 5 hal yang paling disukai, dan overall sentiment score.' },
    { icon: '📊', title: 'Brand Monitoring', desc: 'Reputasi brand di media sosial', prompt: 'Lakukan brand monitoring untuk [sebutkan brand]. Analisis sentimen di Twitter, Instagram, dan TikTok. Sertakan sentiment score, trending topics, dan competitor comparison.' },
    { icon: '🔥', title: 'Crisis Detection', desc: 'Deteksi potensi krisis brand', prompt: 'Identifikasi potensi crisis atau sentimen negatif yang sedang trending terkait [sebutkan industri/brand]. Sertakan severity level, root cause, dan crisis response plan.' },
    { icon: '📋', title: 'Feedback Analysis', desc: 'Analisis umpan balik pelanggan', prompt: 'Analisis feedback pelanggan untuk [sebutkan produk/layanan]. Kategorikan feedback menjadi feature requests, complaints, praise. Sertakan prioritas perbaikan.' },
  ],
  'marketing-optimizer': [
    { icon: '💰', title: 'Strategi Iklan Digital', desc: 'Campaign plan + budget allocation', prompt: 'Buat strategi iklan digital lengkap untuk [sebutkan produk/bisnis] dengan budget [sebutkan budget]/bulan. Sertakan channel allocation, targeting, ad copy, dan projected ROAS.' },
    { icon: '📈', title: 'Optimasi Konversi', desc: 'Tingkatkan conversion rate', prompt: 'Berikan 10 strategi untuk meningkatkan conversion rate landing page [sebutkan URL/jenis bisnis]. Sertakan A/B test ideas, CTA optimization, dan trust signals.' },
    { icon: '🚀', title: 'Growth Hacking', desc: 'Strategi pertumbuhan cepat', prompt: 'Buat growth hacking playbook untuk startup [sebutkan jenis startup] dengan budget terbatas. Sertakan 5 viral loop ideas, referral program design, dan content-led growth strategy.' },
    { icon: '🎯', title: 'Funnel Marketing', desc: 'Optimasi marketing funnel', prompt: 'Desain marketing funnel lengkap (TOFU → MOFU → BOFU) untuk [sebutkan bisnis]. Sertakan content strategy, nurturing sequence, dan conversion triggers di setiap tahap.' },
  ],
  'cybersecurity': [
    { icon: '🔒', title: 'Security Audit', desc: 'Audit keamanan aplikasi web', prompt: 'Lakukan security audit untuk aplikasi web [sebutkan tipe: e-commerce/SaaS/dll]. Periksa OWASP Top 10, API security, authentication, dan data protection. Berikan severity level tiap temuan.' },
    { icon: '📜', title: 'Compliance Check', desc: 'Cek kepatuhan regulasi', prompt: 'Buat compliance checklist untuk [sebutkan bisnis] terhadap UU PDP Indonesia dan ISO 27001. Identifikasi gap dan berikan remediation plan dengan timeline.' },
    { icon: '🛡️', title: 'Incident Response', desc: 'Plan tanggap insiden keamanan', prompt: 'Buat incident response plan untuk [sebutkan jenis serangan: data breach/ransomware/DDoS]. Sertakan detection, containment, eradication, recovery steps, dan communication template.' },
    { icon: '🔐', title: 'Security Architecture', desc: 'Desain arsitektur keamanan', prompt: 'Desain security architecture untuk aplikasi [sebutkan tipe aplikasi] yang akan di-deploy di cloud. Sertakan IAM, encryption, network security, dan monitoring stack.' },
  ],
  'workflow-automation': [
    { icon: '⚡', title: 'Otomatisasi Proses', desc: 'Automasi workflow bisnis', prompt: 'Desain otomatisasi untuk proses [sebutkan proses: onboarding/invoice/approval]. Sertakan workflow diagram, tools yang digunakan (Zapier/Make/n8n), setup steps, dan ROI calculation.' },
    { icon: '🔗', title: 'Integrasi Sistem', desc: 'Hubungkan tools & platform', prompt: 'Buat integration blueprint untuk menghubungkan [Tool A] dengan [Tool B]. Sertakan API endpoints, data mapping, trigger/action flow, dan error handling.' },
    { icon: '📧', title: 'Email Automation', desc: 'Otomatisasi email & notifikasi', prompt: 'Desain email automation system untuk [sebutkan use case: welcome series/abandoned cart/renewal]. Sertakan trigger conditions, email sequence, delay timing, dan personalization rules.' },
    { icon: '📊', title: 'Reporting Otomatis', desc: 'Laporan & dashboard otomatis', prompt: 'Buat automated reporting system yang mengumpulkan data dari [sebutkan sumber data] dan generate laporan mingguan/bulanan otomatis. Sertakan metrics, visualization, dan delivery method.' },
  ],
  'ml-performance': [
    { icon: '🤖', title: 'Model Selection', desc: 'Pilih model ML yang tepat', prompt: 'Rekomendasikan model machine learning terbaik untuk [sebutkan use case: recommendation/classification/NLP]. Bandingkan 3-5 model dengan accuracy, latency, dan cost. Sertakan code snippet.' },
    { icon: '⚙️', title: 'Fine-Tuning LLM', desc: 'Tuning model bahasa', prompt: 'Buat panduan fine-tuning LLM untuk [sebutkan use case: customer service/content generation]. Sertakan dataset preparation, training strategy, evaluation metrics, dan deployment plan.' },
    { icon: '📊', title: 'Data Pipeline', desc: 'Desain pipeline data', prompt: 'Desain data pipeline end-to-end untuk [sebutkan use case]. Sertakan data ingestion, preprocessing, feature engineering, model training, dan serving architecture.' },
    { icon: '🚀', title: 'Optimasi Model', desc: 'Tingkatkan performa model', prompt: 'Model [sebutkan model] saya mendapat accuracy [X]%. Bantu optimasi dengan hyperparameter tuning, feature engineering, dan architecture improvements. Target accuracy [Y]%.' },
  ],
  'customer-support': [
    { icon: '🤖', title: 'Desain Chatbot', desc: 'Buat chatbot FAQ otomatis', prompt: 'Desain chatbot FAQ untuk [sebutkan bisnis]. Buat 20 pertanyaan umum dengan jawaban, conversation flow, escalation rules, dan fallback responses.' },
    { icon: '📋', title: 'SOP Tim Support', desc: 'Template prosedur operasional', prompt: 'Buat SOP lengkap untuk tim customer support [sebutkan bisnis]. Sertakan ticket classification, response templates (20 template), SLA definitions, dan escalation matrix.' },
    { icon: '📈', title: 'Kurangi Tiket 50%', desc: 'Strategi self-service', prompt: 'Buat strategi untuk mengurangi volume tiket support 50% untuk [sebutkan bisnis]. Sertakan knowledge base structure, self-service portal design, dan proactive support automation.' },
    { icon: '⭐', title: 'Tingkatkan CSAT', desc: 'Strategi kepuasan pelanggan', prompt: 'Buat action plan untuk meningkatkan CSAT score dari [X] ke [Y] dalam 3 bulan. Sertakan quick wins, process improvements, training plan, dan measurement framework.' },
  ],
};

function formatMessage(text, isDark = true) {
  if (!text) return '';
  const boldColor = isDark ? '#fff' : '#1a2332';
  const bulletColor = isDark ? 'rgba(0,212,255,0.6)' : 'rgba(0,150,200,0.8)';
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Image markdown: ![alt](url)
    let processed = line.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) =>
      `<img src="${url}" alt="${alt}" style="max-width:100%;border-radius:12px;margin:8px 0;" />`
    );
    processed = processed.replace(/\*\*(.+?)\*\*/g, (_, m) =>
      `<strong style="color:${boldColor};font-weight:600">${m}</strong>`
    );
    const isBullet = /^[\s]*[-•]\s/.test(processed);
    if (isBullet) {
      processed = processed.replace(/^[\s]*[-•]\s/, '');
      return `<div style="padding-left:16px;position:relative;margin:3px 0"><span style="position:absolute;left:0;color:${bulletColor}">▸</span>${processed}</div>`;
    }
    return `<div style="margin:${line.trim() === '' ? '8' : '3'}px 0">${processed}</div>`;
  }).join('');
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [conversations, setConversations] = useState(
    Object.fromEntries(AGENTS.map(a => [a.id, []]))
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [totalQueries, setTotalQueries] = useState(0);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [mode, setMode] = useState('single'); // 'single' or 'collab'
  const [collabResults, setCollabResults] = useState(null);
  const [collabHistory, setCollabHistory] = useState([]);
  const [selectedCollabAgents, setSelectedCollabAgents] = useState([]);
  const [showPricing, setShowPricing] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [userPlan, setUserPlan] = useState('free');
  const [queriesUsed, setQueriesUsed] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [isMobile, setIsMobile] = useState(false);
  const [chatHistory, setChatHistory] = useState({}); // { agent_id: [{ id, title, updated_at }] }
  const [activeConvoId, setActiveConvoId] = useState({}); // { agent_id: convo_id }
  const [showHistory, setShowHistory] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Theme colors
  const T = theme === 'light' ? {
    bg: 'linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 50%, #dde3eb 100%)',
    bgSidebar: 'rgba(255,255,255,0.95)',
    bgHeader: 'rgba(255,255,255,0.9)',
    bgCard: 'rgba(0,0,0,0.04)',
    bgInput: 'rgba(0,0,0,0.04)',
    bgGlass: 'rgba(0,0,0,0.025)',
    bgDrift: 'radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,87,255,0.04) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(170,0,255,0.03) 0%, transparent 50%)',
    text: '#1a2332',
    textSecondary: '#4a5568',
    textMuted: 'rgba(0,0,0,0.45)',
    border: 'rgba(0,0,0,0.1)',
    borderHover: 'rgba(0,0,0,0.18)',
    msgUser: 'linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(0,87,255,0.12) 100%)',
    msgUserBorder: 'rgba(0,212,255,0.25)',
    msgBot: 'rgba(0,0,0,0.035)',
    msgBotBorder: 'rgba(0,0,0,0.08)',
    msgText: '#2d3748',
    inputBg: 'rgba(0,0,0,0.04)',
    inputBorder: 'rgba(0,0,0,0.1)',
    inputText: '#1a2332',
    modalBg: 'linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 100%)',
    modalOverlay: 'rgba(0,0,0,0.4)',
    authBg: 'linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 50%, #dde3eb 100%)',
    authCard: 'rgba(255,255,255,0.95)',
    authInput: 'rgba(0,0,0,0.05)',
    authInputBorder: 'rgba(0,0,0,0.12)',
    statBg: 'rgba(0,0,0,0.035)',
    statBorder: 'rgba(0,0,0,0.08)',
    footerText: 'rgba(0,0,0,0.35)',
    scrollThumb: 'rgba(0,212,255,0.3)',
    error: 'rgba(255,23,68,0.08)',
    errorBorder: 'rgba(255,23,68,0.2)',
    success: 'rgba(0,230,118,0.08)',
    successBorder: 'rgba(0,230,118,0.2)',
  } : {
    bg: 'linear-gradient(180deg, #060d1a 0%, #0a1628 50%, #0d1f3c 100%)',
    bgSidebar: 'rgba(6,13,26,0.92)',
    bgHeader: 'rgba(6,13,26,0.6)',
    bgCard: 'rgba(255,255,255,0.03)',
    bgInput: 'rgba(255,255,255,0.03)',
    bgGlass: 'rgba(255,255,255,0.02)',
    bgDrift: 'radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,87,255,0.04) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(170,0,255,0.03) 0%, transparent 50%)',
    text: '#e0e8f0',
    textSecondary: '#c0c8d4',
    textMuted: 'rgba(255,255,255,0.35)',
    border: 'rgba(255,255,255,0.06)',
    borderHover: 'rgba(255,255,255,0.12)',
    msgUser: 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(0,87,255,0.15) 100%)',
    msgUserBorder: 'rgba(0,212,255,0.25)',
    msgBot: 'rgba(255,255,255,0.04)',
    msgBotBorder: 'rgba(255,255,255,0.08)',
    msgText: '#d0d8e4',
    inputBg: 'rgba(255,255,255,0.03)',
    inputBorder: 'rgba(255,255,255,0.08)',
    inputText: '#e0e8f0',
    modalBg: 'linear-gradient(180deg, #0a1628 0%, #0d1f3c 100%)',
    modalOverlay: 'rgba(0,0,0,0.85)',
    authBg: 'linear-gradient(180deg, #060d1a 0%, #0a1628 50%, #0d1f3c 100%)',
    authCard: 'rgba(255,255,255,0.025)',
    authInput: 'rgba(255,255,255,0.04)',
    authInputBorder: 'rgba(255,255,255,0.07)',
    statBg: 'rgba(255,255,255,0.02)',
    statBorder: 'rgba(255,255,255,0.06)',
    footerText: 'rgba(255,255,255,0.15)',
    error: 'rgba(255,23,68,0.1)',
    errorBorder: 'rgba(255,23,68,0.3)',
    success: 'rgba(0,230,118,0.1)',
    successBorder: 'rgba(0,230,118,0.3)',
    scrollThumb: 'rgba(0,212,255,0.3)',
  };

  // Save theme to localStorage
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('bs-theme') : null;
    if (saved) setTheme(saved);
  }, []);

  // Mobile detection
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('bs-theme', next);
  };

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
      setDeferredPrompt(null);
    }
  };

  const currentMessages = conversations[activeAgent.id] || [];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserPlan(session.user.id);
        // Check if first time user
        const onboarded = localStorage.getItem('bs-onboarded');
        if (!onboarded) setShowOnboarding(true);
      }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserPlan(session.user.id);
        const onboarded = localStorage.getItem('bs-onboarded');
        if (!onboarded) setShowOnboarding(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchUserPlan = async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('plan, queries_used')
        .eq('id', userId)
        .single();
      if (data) {
        setUserPlan(data.plan || 'free');
        setQueriesUsed(data.queries_used || 0);
      }
    } catch (e) { console.error('Plan fetch error:', e); }
  };

  // === CHAT PERSISTENCE (localStorage + Supabase) ===
  
  // Save to localStorage immediately (fast, reliable)
  const saveToLocal = (convos) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bs-chats', JSON.stringify(convos));
      }
    } catch (e) { console.error('LocalStorage save error:', e); }
  };

  // Load from localStorage (instant on refresh)
  const loadFromLocal = () => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('bs-chats');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Object.keys(parsed).length > 0) {
            setConversations(prev => ({ ...prev, ...parsed }));
            return true;
          }
        }
      }
    } catch (e) { console.error('LocalStorage load error:', e); }
    return false;
  };

  // Load saved conversations from database (background sync)
  const loadSavedChats = async (userId) => {
    try {
      const { data: convos, error: convosError } = await supabase
        .from('conversations')
        .select('id, agent_id, title, updated_at')
        .eq('user_id', userId)
        .eq('is_archived', false)
        .order('updated_at', { ascending: false });

      if (convosError) { console.error('Load convos error:', convosError); return; }

      if (convos && convos.length > 0) {
        // Build chat history grouped by agent
        const history = {};
        const activeIds = {};
        convos.forEach(c => {
          if (!history[c.agent_id]) history[c.agent_id] = [];
          history[c.agent_id].push({ id: c.id, title: c.title || 'Chat tanpa judul', updated_at: c.updated_at });
        });
        setChatHistory(history);

        // Load messages for most recent conversation per agent
        const loaded = {};
        for (const agentId of Object.keys(history)) {
          const latestConvo = history[agentId][0]; // already sorted desc
          activeIds[agentId] = latestConvo.id;
          const { data: msgs, error: msgsError } = await supabase
            .from('messages')
            .select('role, content, created_at')
            .eq('conversation_id', latestConvo.id)
            .order('created_at', { ascending: true });

          if (msgsError) { console.error('Load msgs error:', msgsError); continue; }

          if (msgs && msgs.length > 0) {
            loaded[agentId] = msgs.map(m => ({ role: m.role, content: m.content }));
          }
        }
        setActiveConvoId(prev => ({ ...prev, ...activeIds }));
        if (Object.keys(loaded).length > 0) {
          setConversations(prev => {
            const merged = { ...prev, ...loaded };
            saveToLocal(merged);
            return merged;
          });
        }
      }
    } catch (e) { console.error('Load chats error:', e); }
  };

  // Load a specific conversation by ID
  const loadConversation = async (agentId, convoId) => {
    try {
      const { data: msgs, error } = await supabase
        .from('messages')
        .select('role, content, created_at')
        .eq('conversation_id', convoId)
        .order('created_at', { ascending: true });

      if (error) { console.error('Load convo error:', error); return; }

      const messages = (msgs || []).map(m => ({ role: m.role, content: m.content }));
      setConversations(prev => ({ ...prev, [agentId]: messages }));
      setActiveConvoId(prev => ({ ...prev, [agentId]: convoId }));
      saveToLocal({ ...conversations, [agentId]: messages });
    } catch (e) { console.error('Load conversation error:', e); }
  };

  // Start a new chat for an agent
  const startNewChat = (agentId) => {
    setConversations(prev => ({ ...prev, [agentId]: [] }));
    setActiveConvoId(prev => ({ ...prev, [agentId]: null }));
  };

  // Delete a conversation from history
  const deleteConversation = async (agentId, convoId) => {
    if (!confirm('Hapus percakapan ini?')) return;
    try {
      await supabase.from('messages').delete().eq('conversation_id', convoId);
      await supabase.from('conversations').delete().eq('id', convoId);
      setChatHistory(prev => ({
        ...prev,
        [agentId]: (prev[agentId] || []).filter(c => c.id !== convoId),
      }));
      // If we deleted the active conversation, start fresh
      if (activeConvoId[agentId] === convoId) {
        startNewChat(agentId);
      }
    } catch (e) { console.error('Delete convo error:', e); }
  };

  // Save conversation to database (background)
  const saveToDatabase = async (agentId, messages) => {
    if (!user || messages.length < 2) return;
    
    // Always save to localStorage first (instant)
    setConversations(prev => {
      const updated = { ...prev, [agentId]: messages };
      saveToLocal(updated);
      return prev; // don't update state again, already updated
    });

    try {
      const currentConvoId = activeConvoId[agentId];
      let conversationId = currentConvoId;
      const title = messages.find(m => m.role === 'user')?.content?.substring(0, 100) || 'Untitled';

      if (conversationId) {
        // Update existing conversation
        await supabase.from('conversations').update({ title, updated_at: new Date().toISOString() }).eq('id', conversationId);
        await supabase.from('messages').delete().eq('conversation_id', conversationId);
      } else {
        // Create new conversation
        const { data: newConvo, error: convoError } = await supabase
          .from('conversations')
          .insert({ user_id: user.id, agent_id: agentId, title })
          .select('id')
          .single();
        if (convoError) { console.error('Create conversation error:', convoError); return; }
        conversationId = newConvo?.id;
        setActiveConvoId(prev => ({ ...prev, [agentId]: conversationId }));
        // Add to chat history
        setChatHistory(prev => ({
          ...prev,
          [agentId]: [{ id: conversationId, title, updated_at: new Date().toISOString() }, ...(prev[agentId] || [])],
        }));
      }

      if (conversationId) {
        const msgRows = messages.map(m => ({
          conversation_id: conversationId,
          role: m.role,
          content: m.content,
        }));
        const { error: msgError } = await supabase.from('messages').insert(msgRows);
        if (msgError) console.error('Insert messages error:', msgError);
        // Update title in history
        setChatHistory(prev => ({
          ...prev,
          [agentId]: (prev[agentId] || []).map(c => c.id === conversationId ? { ...c, title, updated_at: new Date().toISOString() } : c),
        }));
      }
    } catch (e) { console.error('Save to DB error:', e); }
  };

  // Load chats: localStorage first (instant), then Supabase (background sync)
  useEffect(() => {
    if (user) {
      loadFromLocal();
      loadSavedChats(user.id);
    }
  }, [user]);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    if (!user) return;
    try {
      // Get all conversations
      const { data: convos } = await supabase
        .from('conversations')
        .select('id, agent_id, created_at, updated_at')
        .eq('user_id', user.id);

      // Get all messages count
      const { data: msgs } = await supabase
        .from('messages')
        .select('id, conversation_id, role, created_at')
        .in('conversation_id', (convos || []).map(c => c.id));

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, queries_used, queries_limit, created_at')
        .eq('id', user.id)
        .single();

      // Calculate stats
      const totalConversations = convos?.length || 0;
      const totalMessages = msgs?.filter(m => m.role === 'user')?.length || 0;
      const totalResponses = msgs?.filter(m => m.role === 'assistant')?.length || 0;

      // Agent usage breakdown
      const agentUsage = {};
      (convos || []).forEach(c => {
        agentUsage[c.agent_id] = (agentUsage[c.agent_id] || 0) + 1;
      });

      // Most used agent
      const topAgentId = Object.entries(agentUsage).sort((a, b) => b[1] - a[1])[0]?.[0];
      const topAgent = AGENTS.find(a => a.id === topAgentId);

      // Daily usage (last 7 days)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = (msgs || []).filter(m => m.role === 'user' && m.created_at?.startsWith(dateStr)).length;
        last7Days.push({ date: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }), count });
      }

      setAnalyticsData({
        totalConversations,
        totalMessages,
        totalResponses,
        agentUsage,
        topAgent: topAgent?.name || '-',
        topAgentIcon: topAgent?.icon || '🦈',
        queriesUsed: profile?.queries_used || 0,
        queriesLimit: profile?.queries_limit || 10,
        plan: profile?.plan || 'free',
        memberSince: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-',
        last7Days,
      });
      setShowAnalytics(true);
    } catch (e) {
      console.error('Analytics error:', e);
    }
  };

  // Clear chat for current agent
  const clearChat = async (agentId) => {
    if (!confirm('Hapus riwayat chat untuk agen ini?')) return;
    const updated = { ...conversations, [agentId]: [] };
    setConversations(updated);
    saveToLocal(updated);
    setActiveConvoId(prev => ({ ...prev, [agentId]: null }));
    if (user) {
      try {
        const { data: convos } = await supabase
          .from('conversations')
          .select('id')
          .eq('user_id', user.id)
          .eq('agent_id', agentId)
          .eq('is_archived', false);
        if (convos) {
          for (const c of convos) {
            await supabase.from('messages').delete().eq('conversation_id', c.id);
          }
          await supabase.from('conversations').delete().eq('user_id', user.id).eq('agent_id', agentId).eq('is_archived', false);
        }
        setChatHistory(prev => ({ ...prev, [agentId]: [] }));
      } catch (e) { console.error('Clear chat error:', e); }
    }
  };

  // Delete individual message pair (user + assistant response)
  const deleteMessage = (agentId, messageIndex) => {
    setConversations(prev => {
      const msgs = [...(prev[agentId] || [])];
      const msg = msgs[messageIndex];
      if (msg.role === 'user') {
        // Delete user message and its response (next message)
        msgs.splice(messageIndex, messageIndex + 1 < msgs.length && msgs[messageIndex + 1].role === 'assistant' ? 2 : 1);
      } else {
        // Delete assistant message and its question (previous message)
        const start = messageIndex > 0 && msgs[messageIndex - 1].role === 'user' ? messageIndex - 1 : messageIndex;
        msgs.splice(start, start === messageIndex ? 1 : 2);
      }
      // Save updated messages to database
      if (user && msgs.length > 0) {
        saveToDatabase(agentId, msgs);
      }
      return { ...prev, [agentId]: msgs };
    });
  };

  // Check payment success from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment') === 'success') {
        const plan = params.get('plan');
        if (plan) setUserPlan(plan);
        window.history.replaceState({}, '', '/');
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isLoading]);

  useEffect(() => { inputRef.current?.focus(); }, [activeAgent]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { data: { full_name: authName } },
        });
        if (error) throw error;
        // Send welcome email
        try {
          await fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'welcome', to: authEmail, name: authName || 'User' }),
          });
        } catch (e) { console.error('Welcome email error:', e); }
        setAuthError('✅ Cek email untuk verifikasi akun!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    const empty = Object.fromEntries(AGENTS.map(a => [a.id, []]));
    setConversations(empty);
    setTotalQueries(0);
    if (typeof window !== 'undefined') localStorage.removeItem('bs-chats');
  };

  const handleCheckout = async (planId) => {
    if (planId === 'free') return;
    try {
      const res = await fetch('/api/mayar-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planId,
          email: user.email,
          name: user.user_metadata?.full_name || 'User',
        }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
      } else {
        alert(data.error || 'Gagal membuat pembayaran. Hubungi admin.');
      }
    } catch (e) {
      alert('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Enforce plan limits
    const plan = getPlan(userPlan);

    // Check agent access
    if (!canUseAgent(userPlan, activeAgent.id)) {
      const allowedNames = plan.limits.agents.map(id => {
        const a = AGENTS.find(ag => ag.id === id);
        return a ? `${a.icon} ${a.name}` : id;
      }).join(', ');
      alert(`⚠️ Agen ${activeAgent.name} tidak tersedia di paket ${plan.name}.\n\nAgen yang tersedia: ${allowedNames}\n\nUpgrade ke Pro untuk akses semua agen.`);
      return;
    }

    // Check daily query limit
    if (plan.limits.queriesPerDay !== -1 && queriesUsed >= plan.limits.queriesPerDay) {
      alert(`⚠️ Batas query harian tercapai (${queriesUsed}/${plan.limits.queriesPerDay}).\n\nUpgrade ke Pro untuk 100 query/hari atau Business untuk unlimited.`);
      return;
    }

    const userInput = input.trim();
    const userMessage = { role: 'user', content: userInput };
    const updatedMessages = [...currentMessages, userMessage];
    setConversations(prev => ({ ...prev, [activeAgent.id]: updatedMessages }));
    setInput('');
    setIsLoading(true);

    // Check if user wants to generate an image
    const lowerInput = userInput.toLowerCase();
    const isImageRequest = lowerInput.startsWith('/gambar') || 
      lowerInput.startsWith('/image') || 
      lowerInput.startsWith('gambar ') ||
      lowerInput.startsWith('buat gambar') || 
      lowerInput.startsWith('buatkan gambar') || 
      lowerInput.startsWith('generate image') || 
      lowerInput.startsWith('generate foto') ||
      lowerInput.startsWith('bikin gambar') ||
      lowerInput.startsWith('tolong buatkan gambar') ||
      lowerInput.includes('buatkan gambar') ||
      lowerInput.includes('generate image');

    try {
      if (isImageRequest) {
        const imagePrompt = userInput.replace(/^(\/gambar|\/image|gambar|buat gambar|buatkan gambar|bikin gambar|generate image|generate foto|tolong buatkan gambar)\s*/i, '');
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: imagePrompt || userInput }),
        });
        const data = await res.json();
        let content;
        if (data.success && data.url) {
          content = `🎨 **Gambar berhasil dibuat!**\n\n![Generated Image](${data.url})\n\n**Prompt:** ${data.revisedPrompt || imagePrompt}\n**Model:** ${data.model}`;
        } else {
          content = `⚠️ Gagal membuat gambar: ${data.error || 'Unknown error'}`;
        }
        const finalMessages = [...updatedMessages, { role: 'assistant', content }];
        setConversations(prev => ({ ...prev, [activeAgent.id]: finalMessages }));
        setTotalQueries(prev => prev + 1);
        setQueriesUsed(prev => {
          const newCount = prev + 1;
          const qPlan = getPlan(userPlan);
          const qLimit = qPlan.limits.queriesPerDay;
          if (qLimit > 0 && newCount === Math.floor(qLimit * 0.8) && user?.email) {
            fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'query-limit', to: user.email, name: user.user_metadata?.full_name || 'User', data: { used: newCount, limit: qLimit } }),
            }).catch(() => {});
          }
          return newCount;
        });
        saveToDatabase(activeAgent.id, finalMessages);
      } else {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages,
            agentId: activeAgent.id,
          }),
        });
        const data = await res.json();

        // Handle rate limiting
        if (res.status === 429) {
          const retryMsg = `⚠️ ${data.message || 'Terlalu banyak request.'} Coba lagi dalam ${data.retryAfter || 60} detik.`;
          setConversations(prev => ({
            ...prev,
            [activeAgent.id]: [...updatedMessages, { role: 'assistant', content: retryMsg }],
          }));
          setIsLoading(false);
          return;
        }

        const content = data.content || data.error || 'Maaf, terjadi kesalahan.';
        
        // Simulate streaming effect - reveal text progressively
        const words = content.split(' ');
        let displayed = '';
        const streamId = activeAgent.id;
        
        for (let i = 0; i < words.length; i++) {
          displayed += (i === 0 ? '' : ' ') + words[i];
          const currentText = displayed;
          setConversations(prev => ({
            ...prev,
            [streamId]: [...updatedMessages, { role: 'assistant', content: currentText }],
          }));
          // Speed: faster for short responses, slower for long
          const delay = words.length > 100 ? 15 : words.length > 50 ? 25 : 35;
          await new Promise(r => setTimeout(r, delay));
        }
        
        const finalMessages = [...updatedMessages, { role: 'assistant', content }];
        setConversations(prev => ({
          ...prev,
          [activeAgent.id]: finalMessages,
        }));
        setTotalQueries(prev => prev + 1);
        setQueriesUsed(prev => {
          const newCount = prev + 1;
          const qPlan = getPlan(userPlan);
          const qLimit = qPlan.limits.queriesPerDay;
          if (qLimit > 0 && newCount === Math.floor(qLimit * 0.8) && user?.email) {
            fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'query-limit', to: user.email, name: user.user_metadata?.full_name || 'User', data: { used: newCount, limit: qLimit } }),
            }).catch(() => {});
          }
          return newCount;
        });
        saveToDatabase(activeAgent.id, finalMessages);
      }
    } catch (error) {
      let errorMsg = '⚠️ Terjadi kesalahan koneksi. Coba lagi.';
      if (error.message?.includes('429') || error.message?.includes('rate')) {
        errorMsg = '⚠️ Terlalu banyak request. Tunggu sebentar lalu coba lagi.';
      } else if (error.message?.includes('500')) {
        errorMsg = '⚠️ Server sedang bermasalah. Coba lagi dalam beberapa saat.';
      } else if (error.message?.includes('timeout') || error.message?.includes('network')) {
        errorMsg = '⚠️ Koneksi terputus. Periksa internet Anda dan coba lagi.';
      }
      setConversations(prev => ({
        ...prev,
        [activeAgent.id]: [...updatedMessages, { role: 'assistant', content: errorMsg }],
      }));
    } finally { setIsLoading(false); }
  };

  const sendCollaboration = async () => {
    if (!input.trim() || isLoading) return;

    // Enforce collab access
    if (!canUseCollaboration(userPlan)) {
      alert('⚠️ Multi-Agent Collaboration tidak tersedia di paket Free.\n\nUpgrade ke Pro atau Business untuk menggunakan fitur ini.');
      return;
    }

    // Check daily query limit
    const plan = getPlan(userPlan);
    if (plan.limits.queriesPerDay !== -1 && queriesUsed >= plan.limits.queriesPerDay) {
      alert(`⚠️ Batas query harian tercapai (${queriesUsed}/${plan.limits.queriesPerDay}).\n\nUpgrade untuk query lebih banyak.`);
      return;
    }

    const query = input.trim();
    setInput('');
    setIsLoading(true);
    setCollabResults(null);

    try {
      const res = await fetch('/api/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          agents: selectedCollabAgents.length > 0 ? selectedCollabAgents : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCollabResults(data);
        setCollabHistory(prev => [...prev, data]);
        setTotalQueries(prev => prev + data.agentsUsed.length);
      } else {
        setCollabResults({ error: data.error || 'Terjadi kesalahan.' });
      }
    } catch (error) {
      setCollabResults({ error: '⚠️ Terjadi kesalahan koneksi. Coba lagi.' });
    } finally { setIsLoading(false); }
  };

  const toggleCollabAgent = (agentId) => {
    setSelectedCollabAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const activeAgentsCount = Object.values(conversations).filter(m => m.length > 0).length;

  // ==================== AUTH SCREEN ====================
  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(180deg, #060d1a 0%, #0a1628 50%, #0d1f3c 100%)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🦈</div>
          <div style={{ color: '#00d4ff', fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
            Loading The Blue Shark...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: T.authBg,
        position: 'relative', overflow: 'hidden', padding: '20px',
      }}>
        <div style={{
          position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
          background: T.bgDrift,
          animation: 'drift 25s ease-in-out infinite',
        }} />
        {/* Theme toggle on login */}
        <button onClick={toggleTheme} style={{
          position: 'absolute', top: 20, right: 20, zIndex: 20,
          width: 40, height: 40, borderRadius: 12,
          background: T.bgCard, border: `1px solid ${T.border}`,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, transition: 'all 0.3s ease',
        }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
        <div style={{
          position: 'relative', zIndex: 10, width: '100%', maxWidth: 400,
          animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 52, marginBottom: 14, animation: 'float 4s ease-in-out infinite' }}>🦈</div>
            <h1 style={{
              fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginBottom: 6,
              background: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>The Blue Shark</h1>
            <p style={{
              fontSize: 11, color: T.textMuted,
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase', letterSpacing: 2.5,
            }}>AI Multi-Agent Platform</p>
            <a href="/landing" style={{
              display: 'inline-block', marginTop: 12,
              fontSize: 12, color: '#00d4ff', textDecoration: 'none',
              opacity: 0.7, transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
            >← Kembali ke halaman utama</a>
          </div>

          <form onSubmit={handleAuth} style={{
            background: T.authCard,
            border: `1px solid ${T.border}`,
            borderRadius: 22, padding: '28px 24px',
            backdropFilter: 'blur(24px)',
            boxShadow: theme === 'dark' ? '0 20px 60px rgba(0,0,0,0.3)' : '0 20px 60px rgba(0,0,0,0.08)',
          }}>
            <div style={{
              display: 'flex', gap: 0, marginBottom: 22,
              background: T.bgCard, borderRadius: 11,
              border: `1px solid ${T.border}`, overflow: 'hidden',
            }}>
              {['login', 'signup'].map(m => (
                <button key={m} type="button" onClick={() => { setAuthMode(m); setAuthError(''); }}
                  style={{
                    flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                    background: authMode === m ? 'rgba(0,212,255,0.12)' : 'transparent',
                    color: authMode === m ? '#00d4ff' : T.textMuted,
                    fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >{m === 'login' ? 'Masuk' : 'Daftar'}</button>
              ))}
            </div>

            {authMode === 'signup' && (
              <input type="text" placeholder="Nama lengkap" value={authName}
                onChange={e => setAuthName(e.target.value)}
                style={{
                  width: '100%', padding: '13px 16px', marginBottom: 10,
                  background: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: 11, color: T.text, fontSize: 14,
                  fontFamily: "'Outfit', sans-serif", outline: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.4)'; e.target.style.background = 'rgba(0,212,255,0.05)'; }}
                onBlur={e => { e.target.style.borderColor = T.authInputBorder; e.target.style.background = T.authInput; }}
              />
            )}
            <input type="email" placeholder="Email" value={authEmail} required
              onChange={e => setAuthEmail(e.target.value)}
              style={{
                width: '100%', padding: '13px 16px', marginBottom: 10,
                background: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: 11, color: T.text, fontSize: 14,
                fontFamily: "'Outfit', sans-serif", outline: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.4)'; e.target.style.background = 'rgba(0,212,255,0.05)'; }}
              onBlur={e => { e.target.style.borderColor = T.authInputBorder; e.target.style.background = T.authInput; }}
            />
            <input type="password" placeholder="Password" value={authPassword} required
              onChange={e => setAuthPassword(e.target.value)}
              style={{
                width: '100%', padding: '13px 16px', marginBottom: 18,
                background: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: 11, color: T.text, fontSize: 14,
                fontFamily: "'Outfit', sans-serif", outline: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.4)'; e.target.style.background = 'rgba(0,212,255,0.05)'; }}
              onBlur={e => { e.target.style.borderColor = T.authInputBorder; e.target.style.background = T.authInput; }}
            />

            {authError && (
              <div style={{
                marginBottom: 16, padding: '10px 14px', borderRadius: 10,
                background: authError.startsWith('✅') ? 'rgba(0,230,118,0.1)' : 'rgba(255,23,68,0.1)',
                border: `1px solid ${authError.startsWith('✅') ? 'rgba(0,230,118,0.3)' : 'rgba(255,23,68,0.3)'}`,
                color: authError.startsWith('✅') ? '#00e676' : '#ff1744',
                fontSize: 13,
              }}>{authError}</div>
            )}

            <button type="submit" disabled={authLoading}
              style={{
                width: '100%', padding: '14px 0', border: 'none',
                background: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)',
                borderRadius: 11, color: '#fff', fontSize: 15, fontWeight: 600,
                fontFamily: "'Outfit', sans-serif", cursor: authLoading ? 'wait' : 'pointer',
                boxShadow: '0 6px 24px rgba(0,212,255,0.25)',
                opacity: authLoading ? 0.7 : 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateY(0)',
              }}
              onMouseEnter={e => { if (!authLoading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,212,255,0.35)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,212,255,0.25)'; }}
            >{authLoading ? '⏳ Memproses...' : authMode === 'login' ? 'Masuk' : 'Buat Akun'}</button>
          </form>
        </div>
      </div>
    );
  }

  // ==================== MAIN PLATFORM ====================
  return (
    <div style={{
      width: '100%', height: '100vh',
      background: T.bg,
      display: 'flex', fontFamily: "'Outfit', sans-serif",
      color: T.text, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        overflow: 'hidden', zIndex: 0, pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
          background: 'radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,87,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(170,0,255,0.04) 0%, transparent 50%)',
          animation: 'drift 20s ease-in-out infinite',
        }} />
      </div>

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 280 : 0, minWidth: sidebarOpen ? 280 : 0,
        height: '100%', background: T.bgSidebar,
        backdropFilter: 'blur(24px)',
        borderRight: `1px solid ${T.border}`,
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden', zIndex: 10,
        position: isMobile ? 'absolute' : 'relative',
        boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
      }}>
        <div style={{
          padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: `1px solid ${T.border}`,
        }}>
          <div style={{ fontSize: 28 }}>🦈</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#00d4ff', letterSpacing: -0.5 }}>
              The Blue Shark
            </div>
            <div style={{
              fontSize: 9, color: T.textMuted,
              textTransform: 'uppercase', letterSpacing: 2,
              fontFamily: "'JetBrains Mono', monospace",
            }}>AI Multi-Agent Platform</div>
          </div>
        </div>

        {/* User Info */}
        <div style={{
          padding: '12px 16px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#fff',
          }}>{(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.user_metadata?.full_name || 'User'}
            </div>
            <div style={{ fontSize: 10, color: T.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
          </div>
          <button onClick={() => setShowSettings(true)} style={{
            padding: '5px 10px', borderRadius: 8,
            background: T.bgCard, border: `1px solid ${T.border}`,
            color: T.textSecondary, fontSize: 10, cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
          }}>⚙️</button>
          <button onClick={handleLogout} style={{
            padding: '5px 10px', borderRadius: 8,
            background: 'rgba(255,23,68,0.1)', border: '1px solid rgba(255,23,68,0.2)',
            color: '#ff1744', fontSize: 10, cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
          }}>Keluar</button>
        </div>

        {/* Stats */}
        <div style={{
          padding: '12px 16px', display: 'flex', gap: 8,
          borderBottom: `1px solid ${T.border}`,
        }}>
          {[
            { label: 'Agents', value: AGENTS.length, c: '#00d4ff' },
            { label: 'Active', value: activeAgentsCount, c: '#00e676' },
            { label: 'Queries', value: totalQueries, c: '#ff6b35' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '8px 10px', background: T.bgGlass,
              border: `1px solid ${T.border}`, borderRadius: 10, flex: 1,
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.c }}>{s.value}</div>
              <div style={{
                fontSize: 8, color: T.textMuted, marginTop: 2,
                textTransform: 'uppercase', letterSpacing: 1,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mode Switcher */}
        <div style={{
          padding: '12px 10px', display: 'flex', gap: 4,
          borderBottom: `1px solid ${T.border}`,
        }}>
          <button onClick={() => setMode('single')} style={{
            flex: 1, padding: '8px 0', borderRadius: 10, cursor: 'pointer',
            background: mode === 'single' ? 'rgba(0,212,255,0.15)' : T.bgCard,
            border: `1px solid ${mode === 'single' ? 'rgba(0,212,255,0.3)' : T.border}`,
            color: mode === 'single' ? '#00d4ff' : T.textSecondary,
            fontSize: 11, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
            transition: 'all 0.2s ease',
          }}>🎯 Single Agent</button>
          <button onClick={() => {
            if (!canUseCollaboration(userPlan)) {
              alert('⚠️ Multi-Agent Collaboration tidak tersedia di paket Free.\n\nUpgrade ke Pro atau Business.');
              return;
            }
            setMode('collab');
          }} style={{
            flex: 1, padding: '8px 0', borderRadius: 10, cursor: 'pointer',
            background: mode === 'collab' ? 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(170,0,255,0.15))' : T.bgCard,
            border: `1px solid ${mode === 'collab' ? 'rgba(0,212,255,0.3)' : T.border}`,
            color: mode === 'collab' ? '#00d4ff' : T.textSecondary,
            fontSize: 11, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
            transition: 'all 0.2s ease',
            opacity: canUseCollaboration(userPlan) ? 1 : 0.5,
          }}>{canUseCollaboration(userPlan) ? '🦈' : '🔒'} Multi-Agent</button>
        </div>

        {/* Agents List */}
        <div style={{ padding: '12px 10px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{
            fontSize: 9, color: T.textMuted, textTransform: 'uppercase',
            letterSpacing: 2, padding: '0 6px', marginBottom: 4,
            fontFamily: "'JetBrains Mono', monospace",
          }}>{mode === 'collab' ? 'Pilih Agen (min 2)' : 'AI Agents'}</div>
          {AGENTS.map(agent => (
            <button key={agent.id} onClick={() => {
              if (mode === 'collab') {
                toggleCollabAgent(agent.id);
              } else {
                setActiveAgent(agent);
                if (isMobile) setSidebarOpen(false);
              }
            }}
              style={{
                width: '100%', padding: '12px', display: 'flex', alignItems: 'center', gap: 10,
                background: mode === 'collab'
                  ? (selectedCollabAgents.includes(agent.id) ? `linear-gradient(135deg, ${agent.color}15 0%, ${agent.color}08 100%)` : T.bgGlass)
                  : (activeAgent.id === agent.id ? `linear-gradient(135deg, ${agent.color}15 0%, ${agent.color}08 100%)` : T.bgGlass),
                border: `1px solid ${
                  mode === 'collab'
                    ? (selectedCollabAgents.includes(agent.id) ? `${agent.color}50` : T.border)
                    : (activeAgent.id === agent.id ? `${agent.color}50` : T.border)
                }`,
                borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.2s ease', outline: 'none',
              }}
            >
              {mode === 'collab' && (
                <div style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  border: `2px solid ${selectedCollabAgents.includes(agent.id) ? agent.color : T.textMuted}`,
                  background: selectedCollabAgents.includes(agent.id) ? agent.color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: '#fff', transition: 'all 0.2s ease',
                }}>{selectedCollabAgents.includes(agent.id) ? '✓' : ''}</div>
              )}
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: (mode === 'collab' ? selectedCollabAgents.includes(agent.id) : activeAgent.id === agent.id) ? agent.gradient : 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
                boxShadow: (mode === 'collab' ? selectedCollabAgents.includes(agent.id) : activeAgent.id === agent.id) ? `0 4px 16px ${agent.color}30` : 'none',
              }}>{agent.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 600,
                  color: (mode === 'collab' ? selectedCollabAgents.includes(agent.id) : activeAgent.id === agent.id) ? agent.color : T.textSecondary,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>{agent.name}{!canUseAgent(userPlan, agent.id) && <span style={{ fontSize: 10, opacity: 0.5 }}>🔒</span>}</div>
                <div style={{
                  fontSize: 9, color: T.textMuted,
                  fontFamily: "'JetBrains Mono', monospace",
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{!canUseAgent(userPlan, agent.id) ? 'Upgrade ke Pro' : agent.description}</div>
              </div>
              {(conversations[agent.id] || []).length > 0 && (
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: agent.color, flexShrink: 0,
                  boxShadow: `0 0 8px ${agent.color}80`,
                }} />
              )}
              {(chatHistory[agent.id] || []).length > 1 && (
                <div style={{
                  fontSize: 9, color: T.textMuted, background: T.bgCard,
                  padding: '2px 6px', borderRadius: 8, flexShrink: 0,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>{(chatHistory[agent.id] || []).length}</div>
              )}
            </button>
          ))}
        </div>

        {/* Chat History */}
        {mode === 'single' && (
          <div style={{
            borderTop: `1px solid ${T.border}`,
            maxHeight: showHistory ? 200 : 0, overflow: 'hidden',
            transition: 'max-height 0.3s ease',
          }}>
            <div style={{ padding: '8px 10px' }}>
              <button onClick={() => startNewChat(activeAgent.id)} style={{
                width: '100%', padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
                color: '#00d4ff', fontSize: 11, fontWeight: 600,
                fontFamily: "'Outfit', sans-serif", marginBottom: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>＋ Chat Baru</button>
              <div style={{ overflowY: 'auto', maxHeight: 140, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {(chatHistory[activeAgent.id] || []).map(convo => (
                  <div key={convo.id} style={{
                    padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                    background: activeConvoId[activeAgent.id] === convo.id ? `${activeAgent.color}12` : T.bgGlass,
                    border: `1px solid ${activeConvoId[activeAgent.id] === convo.id ? `${activeAgent.color}30` : 'transparent'}`,
                    display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'all 0.2s ease',
                  }}
                    onClick={() => loadConversation(activeAgent.id, convo.id)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 11, fontWeight: 500, color: T.text,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{convo.title}</div>
                      <div style={{
                        fontSize: 9, color: T.textMuted,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>{new Date(convo.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteConversation(activeAgent.id, convo.id); }} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: T.textMuted, fontSize: 12, padding: '2px 4px', borderRadius: 4,
                      opacity: 0.5, transition: 'opacity 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                    >🗑</button>
                  </div>
                ))}
                {(chatHistory[activeAgent.id] || []).length === 0 && (
                  <div style={{ fontSize: 10, color: T.textMuted, textAlign: 'center', padding: '8px 0', fontStyle: 'italic' }}>
                    Belum ada riwayat chat
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History Toggle */}
        {mode === 'single' && (
          <button onClick={() => setShowHistory(!showHistory)} style={{
            width: '100%', padding: '6px 16px', cursor: 'pointer',
            background: 'transparent', border: 'none', borderTop: `1px solid ${T.border}`,
            color: T.textMuted, fontSize: 10, fontWeight: 600,
            fontFamily: "'JetBrains Mono', monospace",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            letterSpacing: 1, textTransform: 'uppercase',
          }}>
            <span style={{ transform: showHistory ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}>▾</span>
            {showHistory ? 'Sembunyikan Riwayat' : `Riwayat Chat (${(chatHistory[activeAgent.id] || []).length})`}
          </button>
        )}

        <div style={{
          padding: '12px 16px', borderTop: `1px solid ${T.border}`,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {showInstall && (
            <button onClick={handleInstallPWA} style={{
              width: '100%', padding: '10px 0', borderRadius: 10, border: '1px solid rgba(0,212,255,0.2)',
              background: 'rgba(0,212,255,0.08)', cursor: 'pointer',
              color: '#00d4ff', fontSize: 11, fontWeight: 600,
              fontFamily: "'Outfit', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>📲 Install Aplikasi</button>
          )}
          <button onClick={fetchAnalytics} style={{
            width: '100%', padding: '10px 0', borderRadius: 10,
            border: `1px solid ${T.border}`,
            background: T.bgCard, cursor: 'pointer',
            color: T.textSecondary, fontSize: 11, fontWeight: 600,
            fontFamily: "'Outfit', sans-serif",
          }}>📊 Dashboard Analytics</button>
          <button onClick={() => setShowPricing(true)} style={{
            width: '100%', padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: userPlan === 'free' ? 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)' : `${getPlan(userPlan).color}15`,
            color: userPlan === 'free' ? '#fff' : getPlan(userPlan).color,
            fontSize: 12, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
            boxShadow: userPlan === 'free' ? '0 4px 16px rgba(0,212,255,0.3)' : 'none',
          }}>{userPlan === 'free' ? '⚡ Upgrade Plan' : `${getPlan(userPlan).icon} ${getPlan(userPlan).name} Plan`}</button>
          <div style={{
            fontSize: 8, color: T.footerText,
            fontFamily: "'JetBrains Mono', monospace", textAlign: 'center', letterSpacing: 1,
          }}>DIDUKUNG OLEH GPT-4 × BLUE SHARK ENGINE</div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 9, backdropFilter: 'blur(4px)',
        }} />
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 5 }}>
        {/* Header */}
        <div style={{
          padding: isMobile ? '10px 12px' : '12px 20px', background: T.bgHeader,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            width: 34, height: 34, borderRadius: 10,
            background: T.bgCard,
            border: `1px solid ${T.border}`,
            color: T.textSecondary, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
          }}>☰</button>
          {mode === 'collab' ? (
            <>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'linear-gradient(135deg, #00d4ff 0%, #aa00ff 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, boxShadow: '0 4px 16px rgba(0,212,255,0.3)',
              }}>🦈</div>
              <div>
                <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600 }}>Multi-Agent Collaboration</div>
                {!isMobile && <div style={{
                  fontSize: 10, color: '#00d4ff',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>● {selectedCollabAgents.length > 0 ? `${selectedCollabAgents.length} agen dipilih` : 'Mode otomatis'}</div>}
              </div>
            </>
          ) : (
            <>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: activeAgent.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, boxShadow: `0 4px 16px ${activeAgent.color}30`,
              }}>{activeAgent.icon}</div>
              <div>
                <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600 }}>{activeAgent.name}</div>
                {!isMobile && <div style={{
                  fontSize: 10, color: activeAgent.color,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>● Online — Siap menganalisis</div>}
              </div>
            </>
          )}
          <div style={{ flex: 1 }} />
          {/* Theme Toggle */}
          <button onClick={toggleTheme} style={{
            width: 34, height: 34, borderRadius: 10,
            background: T.bgCard, border: `1px solid ${T.border}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, transition: 'all 0.3s ease',
          }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          {!isMobile && <div style={{
            padding: '5px 12px', borderRadius: 20,
            background: `${activeAgent.color}12`, border: `1px solid ${activeAgent.color}25`,
            fontSize: 10, color: activeAgent.color,
            fontFamily: "'JetBrains Mono', monospace",
          }}>{currentMessages.filter(m => m.role === 'user').length} pertanyaan</div>}
          {/* Export Buttons */}
          {!isMobile && ((mode === 'single' && currentMessages.length > 0) || (mode === 'collab' && collabResults && !collabResults.error)) && (
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => {
                if (!getPlan(userPlan).limits.exportResults) {
                  alert('⚠️ Export PDF tidak tersedia di paket Free.\n\nUpgrade ke Pro untuk menggunakan fitur export.');
                  return;
                }
                if (mode === 'collab' && collabResults) {
                  exportToPDF({
                    type: 'collab',
                    query: collabResults.query,
                    agentsUsed: collabResults.agentsUsed,
                    executiveSummary: collabResults.executiveSummary,
                    agentResults: collabResults.agentResults,
                  }, `blue-shark-collab-${Date.now()}`);
                } else {
                  exportToPDF({
                    type: 'chat',
                    agentName: activeAgent.name,
                    query: currentMessages.find(m => m.role === 'user')?.content,
                    messages: currentMessages,
                  }, `blue-shark-${activeAgent.id}-${Date.now()}`);
                }
              }} style={{
                padding: '5px 10px', borderRadius: 8,
                background: T.bgCard, border: `1px solid ${T.border}`,
                color: T.textMuted, fontSize: 10, cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.1)'; e.currentTarget.style.color = '#00d4ff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.bgCard; e.currentTarget.style.color = T.textMuted; }}
              >📄 PDF</button>
              <button onClick={() => {
                if (!getPlan(userPlan).limits.exportResults) {
                  alert('⚠️ Export CSV tidak tersedia di paket Free.\n\nUpgrade ke Pro untuk menggunakan fitur export.');
                  return;
                }
                if (mode === 'collab' && collabResults) {
                  exportToCSV({
                    type: 'collab',
                    executiveSummary: collabResults.executiveSummary,
                    agentResults: collabResults.agentResults,
                  }, `blue-shark-collab-${Date.now()}`);
                } else {
                  exportToCSV({
                    type: 'chat',
                    agentName: activeAgent.name,
                    messages: currentMessages,
                  }, `blue-shark-${activeAgent.id}-${Date.now()}`);
                }
              }} style={{
                padding: '5px 10px', borderRadius: 8,
                background: T.bgCard, border: `1px solid ${T.border}`,
                color: T.textMuted, fontSize: 10, cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,230,118,0.1)'; e.currentTarget.style.color = '#00e676'; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.bgCard; e.currentTarget.style.color = T.textMuted; }}
              >📊 CSV</button>
              {mode === 'single' && (
                <button onClick={() => clearChat(activeAgent.id)} style={{
                  padding: '5px 10px', borderRadius: 8,
                  background: T.bgCard, border: `1px solid ${T.border}`,
                  color: T.textMuted, fontSize: 10, cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,23,68,0.1)'; e.currentTarget.style.color = '#ff1744'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = T.bgCard; e.currentTarget.style.color = T.textMuted; }}
                >🗑️ Hapus</button>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '12px' : '20px' }}>
          {mode === 'collab' ? (
            /* COLLABORATION MODE */
            !collabResults && !isLoading ? (
              <div style={{
                height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                animation: 'fadeInUp 0.6s ease-out',
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 22,
                  background: 'linear-gradient(135deg, #00d4ff 0%, #aa00ff 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, marginBottom: 20,
                  boxShadow: '0 8px 32px rgba(0,212,255,0.25)',
                }}>🦈</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
                  Multi-Agent Collaboration
                </div>
                <div style={{
                  fontSize: 13, color: T.textMuted,
                  textAlign: 'center', maxWidth: 420, lineHeight: 1.6, marginBottom: 28,
                }}>
                  Kirim satu pertanyaan, beberapa agen AI bekerja bareng dan memberikan analisis dari berbagai sudut pandang. Hasilnya digabung jadi satu laporan komprehensif.
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 500 }}>
                  {['Analisis peluang bisnis AI di Indonesia 2026', 'Strategi launch produk SaaS baru', 'Evaluasi kompetitor marketplace fashion'].map((s, i) => (
                    <button key={i} onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      style={{
                        padding: '8px 14px', borderRadius: 20,
                        background: T.bgCard,
                        border: `1px solid ${T.border}`,
                        color: T.textSecondary, fontSize: 12, cursor: 'pointer',
                        fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.15)'; e.currentTarget.style.color = '#00d4ff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = T.bgCard; e.currentTarget.style.color = T.textMuted; }}
                    >{s}</button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {isLoading && (
                  <div style={{ textAlign: 'center', padding: 40, animation: 'fadeInUp 0.3s ease-out' }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>🦈</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#00d4ff', marginBottom: 8 }}>Kolaborasi Multi-Agen Sedang Berjalan...</div>
                    <div style={{ fontSize: 12, color: T.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                      {selectedCollabAgents.length > 0 ? `${selectedCollabAgents.length} agents` : 'Agen otomatis terpilih'} working together
                    </div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: 8, height: 8, borderRadius: '50%', background: '#00d4ff',
                          animation: 'typing 1.4s infinite', animationDelay: `${i * 0.2}s`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}
                {collabResults && !collabResults.error && (
                  <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                    {/* Query */}
                    <div style={{
                      display: 'flex', justifyContent: 'flex-end', marginBottom: 20,
                    }}>
                      <div style={{
                        padding: '14px 18px', maxWidth: '82%',
                        background: 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(0,87,255,0.15) 100%)',
                        border: '1px solid rgba(0,212,255,0.25)',
                        borderRadius: '18px 18px 4px 18px',
                        color: T.msgText, fontSize: 14, lineHeight: 1.7,
                      }}>{collabResults.query}</div>
                    </div>

                    {/* Agents Used */}
                    <div style={{
                      display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20,
                    }}>
                      {collabResults.agentsUsed.map(a => (
                        <div key={a.id} style={{
                          padding: '6px 12px', borderRadius: 20,
                          background: `${a.color}15`, border: `1px solid ${a.color}30`,
                          fontSize: 11, color: a.color,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>{a.icon} {a.name}</div>
                      ))}
                    </div>

                    {/* Executive Summary */}
                    {collabResults.executiveSummary && (
                      <div style={{
                        padding: '18px 20px', marginBottom: 20,
                        background: 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(170,0,255,0.08) 100%)',
                        border: '1px solid rgba(0,212,255,0.2)',
                        borderRadius: 16,
                      }}>
                        <div style={{
                          fontSize: 11, fontWeight: 600, color: '#00d4ff',
                          marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>🦈 RINGKASAN EKSEKUTIF</div>
                        <div style={{ color: T.msgText, fontSize: 14, lineHeight: 1.7, wordBreak: 'break-word' }}
                          dangerouslySetInnerHTML={{ __html: formatMessage(collabResults.executiveSummary, theme === 'dark') }}
                        />
                      </div>
                    )}

                    {/* Individual Agent Results */}
                    {collabResults.agentResults.map((result, i) => (
                      <div key={i} style={{
                        padding: '16px 18px', marginBottom: 12,
                        background: T.bgCard,
                        border: `1px solid ${result.agentColor || 'rgba(255,255,255,0.08)'}25`,
                        borderRadius: 14,
                      }}>
                        <div style={{
                          fontSize: 11, fontWeight: 600, color: result.agentColor || '#00d4ff',
                          marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>{result.agentIcon} {result.agentName}</div>
                        <div style={{ color: T.msgText, fontSize: 13, lineHeight: 1.7, wordBreak: 'break-word' }}
                          dangerouslySetInnerHTML={{ __html: formatMessage(result.content, theme === 'dark') }}
                        />
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
                {collabResults?.error && (
                  <div style={{
                    padding: '18px 20px', background: 'rgba(255,23,68,0.1)',
                    border: '1px solid rgba(255,23,68,0.3)', borderRadius: 14,
                    color: '#ff1744', fontSize: 14,
                  }}>{collabResults.error}</div>
                )}
              </>
            )
          ) : (
            /* SINGLE AGENT MODE */
            currentMessages.length === 0 ? (
            <div style={{
              height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              animation: 'fadeInUp 0.6s ease-out', padding: isMobile ? '0 4px' : '0',
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 22,
                background: activeAgent.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, marginBottom: 20,
                boxShadow: `0 8px 32px ${activeAgent.color}25`,
              }}>{activeAgent.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
                {activeAgent.name} Agent
              </div>
              <div style={{
                fontSize: 13, color: T.textMuted,
                textAlign: 'center', maxWidth: 380, lineHeight: 1.6, marginBottom: 20,
              }}>{activeAgent.description}</div>

              {/* Prompt Templates */}
              <div style={{
                width: '100%', maxWidth: 600,
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: 10, marginBottom: 16,
              }}>
                {(PROMPT_TEMPLATES[activeAgent.id] || []).map((tmpl, i) => (
                  <button key={i} onClick={() => { setInput(tmpl.prompt); inputRef.current?.focus(); }}
                    style={{
                      padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                      background: T.bgCard, border: `1px solid ${T.border}`,
                      textAlign: 'left', transition: 'all 0.2s ease',
                      fontFamily: "'Outfit', sans-serif",
                      display: 'flex', flexDirection: 'column', gap: 4,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = `${activeAgent.color}10`;
                      e.currentTarget.style.borderColor = `${activeAgent.color}30`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = T.bgCard;
                      e.currentTarget.style.borderColor = T.border;
                    }}
                  >
                    <div style={{ fontSize: 16 }}>{tmpl.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{tmpl.title}</div>
                    <div style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.4 }}>{tmpl.desc}</div>
                  </button>
                ))}
              </div>

              {/* Quick suggestions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 460 }}>
                {(activeAgent.suggestions || []).map((s, i) => (
                  <button key={i} onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    style={{
                      padding: '8px 14px', borderRadius: 20,
                      background: T.bgCard,
                      border: `1px solid ${T.border}`,
                      color: T.textSecondary, fontSize: 12, cursor: 'pointer',
                      fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = `${activeAgent.color}15`;
                      e.currentTarget.style.borderColor = `${activeAgent.color}40`;
                      e.currentTarget.style.color = activeAgent.color;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = T.bgCard;
                      e.currentTarget.style.borderColor = T.border;
                      e.currentTarget.style.color = T.textMuted;
                    }}
                  >{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {currentMessages.map((msg, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 16, animation: 'fadeInUp 0.3s ease-out',
                  position: 'relative', group: 'message',
                }}>
                  <div style={{
                    maxWidth: '82%', padding: '14px 18px',
                    background: msg.role === 'user' ? T.msgUser : T.msgBot,
                    border: `1px solid ${msg.role === 'user' ? T.msgUserBorder : T.msgBotBorder}`,
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    color: T.msgText, fontSize: 14, lineHeight: 1.7,
                    position: 'relative',
                  }}
                    onMouseEnter={e => { e.currentTarget.querySelectorAll('.del-btn').forEach(btn => btn.style.opacity = '1'); }}
                    onMouseLeave={e => { e.currentTarget.querySelectorAll('.del-btn').forEach(btn => btn.style.opacity = '0'); }}
                  >
                    <button className="del-btn" onClick={() => deleteMessage(activeAgent.id, i)} style={{
                      position: 'absolute', top: 6, right: 6,
                      width: 22, height: 22, borderRadius: 6,
                      background: 'rgba(255,23,68,0.15)', border: 'none',
                      color: '#ff1744', fontSize: 10, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'opacity 0.2s ease',
                    }}>✕</button>
                    {msg.role === 'assistant' && (
                      <button className="del-btn" onClick={(e) => {
                        const cleanText = msg.content.replace(/\*\*/g, '').replace(/^[\s]*[-•]\s/gm, '• ');
                        navigator.clipboard.writeText(cleanText);
                        e.currentTarget.textContent = '✓';
                        e.currentTarget.style.color = '#00e676';
                        const target = e.currentTarget;
                        setTimeout(() => { target.textContent = '📋'; target.style.color = T.textMuted; }, 1500);
                      }} style={{
                        position: 'absolute', top: 6, right: 32,
                        width: 22, height: 22, borderRadius: 6,
                        background: T.bgCard, border: 'none',
                        color: T.textMuted, fontSize: 10, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.2s ease',
                      }}>📋</button>
                    )}
                    {msg.role !== 'user' && (
                      <div style={{
                        fontSize: 10, fontWeight: 600, color: activeAgent.color,
                        marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1.5,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>● BLUE SHARK AI</div>
                    )}
                    {msg.role === 'user' ? (
                      <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</span>
                    ) : (
                      <div style={{ wordBreak: 'break-word' }}
                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content, theme === 'dark') }}
                      />
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div style={{ display: 'flex', gap: 6, padding: '16px 20px', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%', background: activeAgent.color,
                      animation: 'typing 1.4s infinite', animationDelay: `${i * 0.2}s`,
                    }} />
                  ))}
                  <span style={{
                    marginLeft: 8, fontSize: 13, color: T.textMuted,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>Blue Shark sedang berpikir...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )
          )}
        </div>

        {/* Input */}
        <div style={{ padding: isMobile ? '10px 12px 14px' : '14px 20px 20px', background: 'linear-gradient(180deg, transparent 0%, rgba(6,13,26,0.8) 100%)' }}>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-end',
            background: T.inputBg,
            border: `1px solid ${T.inputBorder}`,
            borderRadius: 16, padding: '6px 6px 6px 18px',
          }}>
            <textarea ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); mode === 'collab' ? sendCollaboration() : sendMessage(); }}}
              placeholder={mode === 'collab' ? 'Kirim pertanyaan untuk multi-agent collaboration...' : activeAgent.placeholder} rows={1}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: T.inputText, fontSize: 14, fontFamily: "'Outfit', sans-serif",
                resize: 'none', lineHeight: 1.6, maxHeight: 120, minHeight: 24, padding: '8px 0',
              }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
            />
            <button onClick={() => mode === 'collab' ? sendCollaboration() : sendMessage()} disabled={!input.trim() || isLoading}
              style={{
                width: 42, height: 42, borderRadius: 12,
                background: input.trim() && !isLoading
                  ? (mode === 'collab' ? 'linear-gradient(135deg, #00d4ff 0%, #aa00ff 100%)' : activeAgent.gradient)
                  : 'rgba(255,255,255,0.05)',
                border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, color: '#fff', transition: 'all 0.3s ease', flexShrink: 0,
                boxShadow: input.trim() && !isLoading ? '0 4px 16px rgba(0,212,255,0.4)' : 'none',
              }}
            >{isLoading ? '⏳' : '↑'}</button>
          </div>
          <div style={{
            textAlign: 'center', marginTop: 8, fontSize: 9,
            color: T.footerText,
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1.5,
          }}>THE BLUE SHARK v1.0 — AI MULTI-AGENT PLATFORM — PREDATOR EDITION</div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: T.modalOverlay, backdropFilter: 'blur(12px)',
          zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, animation: 'overlayIn 0.3s ease-out',
        }} onClick={() => setShowSettings(false)}>
          <div style={{
            width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto',
            background: T.modalBg,
            border: `1px solid ${T.border}`,
            borderRadius: 24, padding: '36px 30px',
            animation: 'modalIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>⚙️</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#00d4ff', marginBottom: 6 }}>Pengaturan</h2>
              <p style={{ fontSize: 12, color: T.textMuted }}>Kelola akun dan preferensi Anda</p>
            </div>

            {/* Profile Section */}
            <div style={{
              padding: '20px', background: T.statBg, border: `1px solid ${T.statBorder}`,
              borderRadius: 14, marginBottom: 12,
            }}>
              <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>👤 Profil</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 700, color: '#fff',
                }}>{(user?.user_metadata?.full_name || user?.email || '?')[0].toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{user?.user_metadata?.full_name || 'User'}</div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>{user?.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, padding: '8px 12px', background: T.bgCard, borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#00d4ff' }}>{getPlan(userPlan).icon} {getPlan(userPlan).name}</div>
                  <div style={{ fontSize: 9, color: T.textMuted, marginTop: 2 }}>PAKET</div>
                </div>
                <div style={{ flex: 1, padding: '8px 12px', background: T.bgCard, borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#00e676' }}>{queriesUsed}</div>
                  <div style={{ fontSize: 9, color: T.textMuted, marginTop: 2 }}>QUERY HARI INI</div>
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div style={{
              padding: '16px 20px', background: T.statBg, border: `1px solid ${T.statBorder}`,
              borderRadius: 14, marginBottom: 12,
            }}>
              <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>🎨 Tampilan</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: T.text }}>Mode Gelap / Terang</span>
                <button onClick={toggleTheme} style={{
                  padding: '6px 16px', borderRadius: 8,
                  background: theme === 'dark' ? 'rgba(255,213,0,0.15)' : 'rgba(0,0,0,0.1)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255,213,0,0.3)' : 'rgba(0,0,0,0.15)'}`,
                  color: theme === 'dark' ? '#ffd600' : '#1a2332',
                  fontSize: 12, cursor: 'pointer', fontWeight: 600,
                }}>{theme === 'dark' ? '☀️ Mode Terang' : '🌙 Mode Gelap'}</button>
              </div>
            </div>

            {/* Language */}
            <div style={{
              padding: '16px 20px', background: T.statBg, border: `1px solid ${T.statBorder}`,
              borderRadius: 14, marginBottom: 12,
            }}>
              <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>🌐 Bahasa Respons AI</div>
              <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 10, lineHeight: 1.6 }}>
                Agen AI akan otomatis merespons sesuai bahasa yang Anda gunakan. Ketik dalam Bahasa Indonesia untuk respons Indonesia, atau English untuk respons Inggris.
              </p>
              <div style={{ fontSize: 11, color: T.textMuted, fontStyle: 'italic' }}>
                💡 Tip: Mulai pertanyaan dengan "Jawab dalam Bahasa Indonesia:" untuk memastikan respons dalam bahasa yang diinginkan.
              </div>
            </div>

            {/* Data Management */}
            <div style={{
              padding: '16px 20px', background: T.statBg, border: `1px solid ${T.statBorder}`,
              borderRadius: 14, marginBottom: 12,
            }}>
              <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>🗂️ Data & Riwayat</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={async () => {
                  if (!confirm('Hapus SEMUA riwayat chat dari semua agen? Tindakan ini tidak bisa dibatalkan.')) return;
                  setConversations(Object.fromEntries(AGENTS.map(a => [a.id, []])));
                  if (user) {
                    const { data: convos } = await supabase.from('conversations').select('id').eq('user_id', user.id);
                    if (convos) {
                      for (const c of convos) { await supabase.from('messages').delete().eq('conversation_id', c.id); }
                      await supabase.from('conversations').delete().eq('user_id', user.id);
                    }
                  }
                  alert('Semua riwayat chat berhasil dihapus.');
                }} style={{
                  padding: '10px 16px', borderRadius: 10,
                  background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)',
                  color: '#ff6b35', fontSize: 12, cursor: 'pointer', fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif", textAlign: 'left',
                }}>🗑️ Hapus Semua Riwayat Chat</button>
                <button onClick={() => {
                  const allData = JSON.stringify(conversations, null, 2);
                  const blob = new Blob([allData], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = `blue-shark-backup-${Date.now()}.json`; a.click();
                  URL.revokeObjectURL(url);
                }} style={{
                  padding: '10px 16px', borderRadius: 10,
                  background: T.bgCard, border: `1px solid ${T.border}`,
                  color: T.textSecondary, fontSize: 12, cursor: 'pointer', fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif", textAlign: 'left',
                }}>💾 Backup Riwayat Chat (JSON)</button>
              </div>
            </div>

            {/* Account Actions */}
            <div style={{
              padding: '16px 20px', background: T.statBg, border: `1px solid ${T.statBorder}`,
              borderRadius: 14, marginBottom: 20,
            }}>
              <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>🔐 Akun</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => { setShowSettings(false); setShowPricing(true); }} style={{
                  padding: '10px 16px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)',
                  border: 'none', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif", textAlign: 'left',
                  boxShadow: '0 4px 16px rgba(0,212,255,0.25)',
                }}>⚡ Upgrade Paket</button>
                <button onClick={() => {
                  handleLogout();
                  setShowSettings(false);
                }} style={{
                  padding: '10px 16px', borderRadius: 10,
                  background: 'rgba(255,23,68,0.1)', border: '1px solid rgba(255,23,68,0.2)',
                  color: '#ff1744', fontSize: 12, cursor: 'pointer', fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif", textAlign: 'left',
                }}>🚪 Keluar dari Akun</button>
              </div>
            </div>

            <button onClick={() => setShowSettings(false)} style={{
              display: 'block', margin: '0 auto', padding: '8px 24px',
              background: 'transparent', border: `1px solid ${T.border}`,
              borderRadius: 10, color: T.textMuted, fontSize: 12,
              cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
            }}>Tutup</button>

            <div style={{
              textAlign: 'center', marginTop: 16, fontSize: 10, color: T.footerText,
              fontFamily: "'JetBrains Mono', monospace",
            }}>The Blue Shark v1.0 — Predator Edition</div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && analyticsData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: T.modalOverlay, backdropFilter: 'blur(12px)',
          zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, animation: 'overlayIn 0.3s ease-out',
        }} onClick={() => setShowAnalytics(false)}>
          <div style={{
            width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto',
            background: T.modalBg,
            border: `1px solid ${T.border}`,
            borderRadius: 24, padding: '36px 30px',
            animation: 'modalIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#00d4ff', marginBottom: 6 }}>
                Dashboard Analytics
              </h2>
              <p style={{ fontSize: 12, color: T.textMuted }}>
                Member sejak {analyticsData.memberSince} · Paket {analyticsData.plan.toUpperCase()}
              </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { value: analyticsData.totalMessages, label: 'Total Queries', color: '#00d4ff' },
                { value: analyticsData.totalResponses, label: 'Total Respons', color: '#00e676' },
                { value: analyticsData.totalConversations, label: 'Percakapan', color: '#ff6b35' },
                { value: `${analyticsData.queriesUsed}/${analyticsData.queriesLimit === -1 ? '∞' : analyticsData.queriesLimit}`, label: 'Query Hari Ini', color: '#aa00ff' },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: '16px 12px', background: T.statBg,
                  border: `1px solid ${T.statBorder}`, borderRadius: 14, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: T.textMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Top Agent */}
            <div style={{
              padding: '16px 20px', background: T.statBg,
              border: `1px solid ${T.statBorder}`, borderRadius: 14, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ fontSize: 28 }}>{analyticsData.topAgentIcon}</div>
              <div>
                <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" }}>Agen Favorit</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#00d4ff' }}>{analyticsData.topAgent}</div>
              </div>
            </div>

            {/* Agent Usage Breakdown */}
            <div style={{
              padding: '16px 20px', background: T.statBg,
              border: `1px solid ${T.statBorder}`, borderRadius: 14, marginBottom: 16,
            }}>
              <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>Penggunaan Per Agen</div>
              {AGENTS.map(agent => {
                const count = analyticsData.agentUsage[agent.id] || 0;
                const maxCount = Math.max(...Object.values(analyticsData.agentUsage), 1);
                const width = (count / maxCount) * 100;
                return (
                  <div key={agent.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 14, width: 24, textAlign: 'center' }}>{agent.icon}</span>
                    <span style={{ fontSize: 11, color: T.textSecondary, width: 120, flexShrink: 0 }}>{agent.name}</span>
                    <div style={{ flex: 1, height: 6, background: T.bgCard, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${width}%`, height: '100%', background: agent.gradient, borderRadius: 3, transition: 'width 0.5s ease' }} />
                    </div>
                    <span style={{ fontSize: 11, color: agent.color, fontWeight: 600, width: 20, textAlign: 'right' }}>{count}</span>
                  </div>
                );
              })}
            </div>

            {/* 7-Day Activity */}
            <div style={{
              padding: '16px 20px', background: T.statBg,
              border: `1px solid ${T.statBorder}`, borderRadius: 14, marginBottom: 20,
            }}>
              <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>Aktivitas 7 Hari Terakhir</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
                {analyticsData.last7Days.map((day, i) => {
                  const maxCount = Math.max(...analyticsData.last7Days.map(d => d.count), 1);
                  const height = (day.count / maxCount) * 60 + 4;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 9, color: '#00d4ff', fontWeight: 600 }}>{day.count}</span>
                      <div style={{
                        width: '100%', height, borderRadius: 4,
                        background: day.count > 0 ? 'linear-gradient(180deg, #00d4ff, #0057ff)' : T.bgCard,
                        transition: 'height 0.5s ease',
                      }} />
                      <span style={{ fontSize: 8, color: T.textMuted }}>{day.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button onClick={() => setShowAnalytics(false)} style={{
              display: 'block', margin: '0 auto', padding: '8px 24px',
              background: 'transparent', border: `1px solid ${T.border}`,
              borderRadius: 10, color: T.textMuted, fontSize: 12,
              cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
            }}>Tutup</button>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricing && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
          zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, animation: 'overlayIn 0.3s ease-out',
        }} onClick={() => setShowPricing(false)}>
          <div style={{
            width: '100%', maxWidth: 900, maxHeight: '90vh', overflowY: 'auto',
            background: 'linear-gradient(180deg, #0a1628 0%, #0d1f3c 100%)',
            border: `1px solid ${T.border}`,
            borderRadius: 24, padding: '40px 30px',
            animation: 'modalIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🦈</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#00d4ff', marginBottom: 8 }}>
                Pilih Paket Anda
              </h2>
              <p style={{ fontSize: 13, color: T.textMuted, maxWidth: 400, margin: '0 auto' }}>
                Upgrade untuk akses penuh ke semua agen AI, multi-agent collaboration, dan fitur premium lainnya.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {PLANS.map(plan => (
                <div key={plan.id} style={{
                  flex: '1 1 250px', maxWidth: 280, padding: '28px 24px',
                  background: plan.popular
                    ? 'linear-gradient(180deg, rgba(0,212,255,0.08) 0%, rgba(0,87,255,0.05) 100%)'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${plan.popular ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 18, position: 'relative',
                  display: 'flex', flexDirection: 'column',
                }}>
                  {plan.popular && (
                    <div style={{
                      position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                      padding: '4px 16px', borderRadius: 20,
                      background: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)',
                      fontSize: 10, fontWeight: 700, color: '#fff',
                      textTransform: 'uppercase', letterSpacing: 1,
                    }}>Paling Populer</div>
                  )}
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{plan.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: plan.color, marginBottom: 4 }}>
                    {plan.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{plan.priceLabel}</span>
                    <span style={{ fontSize: 13, color: T.textMuted }}>{plan.period}</span>
                  </div>
                  {plan.priceUsd && plan.price > 0 && (
                    <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 16 }}>
                      ≈ {plan.priceUsd}/bulan
                    </div>
                  )}
                  {plan.price === 0 && <div style={{ height: 16, marginBottom: 16 }} />}
                  <div style={{ flex: 1, marginBottom: 20 }}>
                    {plan.features.map((f, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: 8, alignItems: 'flex-start',
                        marginBottom: 8, fontSize: 12, color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.5,
                      }}>
                        <span style={{ color: plan.color, flexShrink: 0 }}>✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      if (plan.id === userPlan) return;
                      if (plan.id === 'free') return;
                      handleCheckout(plan.id);
                    }}
                    disabled={plan.id === userPlan}
                    style={{
                      width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
                      background: plan.id === userPlan
                        ? 'rgba(255,255,255,0.05)'
                        : plan.gradient,
                      color: plan.id === userPlan ? 'rgba(255,255,255,0.3)' : '#fff',
                      fontSize: 13, fontWeight: 600, cursor: plan.id === userPlan ? 'default' : 'pointer',
                      fontFamily: "'Outfit', sans-serif",
                      boxShadow: plan.id !== userPlan ? `0 4px 16px ${plan.color}30` : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {plan.id === userPlan ? 'Paket Aktif' : plan.price === 0 ? 'Gratis' : `Upgrade ke ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>

            <button onClick={() => setShowPricing(false)} style={{
              display: 'block', margin: '24px auto 0', padding: '8px 24px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, color: T.textMuted, fontSize: 12,
              cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
            }}>Tutup</button>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showOnboarding && (() => {
        const steps = [
          {
            icon: '🦈',
            title: 'Selamat Datang di The Blue Shark!',
            desc: 'Platform AI Multi-Agent pertama di Indonesia. Berbagai agen AI spesialis siap membantu bisnis Anda.',
            tip: 'Mari kita jelajahi fitur-fitur utama dalam 30 detik.',
          },
          {
            icon: '🤖',
            title: 'Pilih Agen AI',
            desc: 'Di sidebar kiri, pilih agen sesuai kebutuhan Anda. Setiap agen punya keahlian berbeda — mulai dari riset pasar hingga keamanan siber.',
            tip: '💡 Tip: Klik agen untuk langsung mulai chat!',
          },
          {
            icon: '⚡',
            title: 'Gunakan Template Prompt',
            desc: 'Setiap agen punya template pertanyaan siap pakai. Klik template, edit sesuai kebutuhan, lalu kirim.',
            tip: '💡 Tip: Template membantu Anda mendapat jawaban yang lebih detail dan terstruktur.',
          },
          {
            icon: '🤝',
            title: 'Multi-Agent Collaboration',
            desc: 'Kirim satu pertanyaan ke beberapa agen sekaligus! Dapatkan analisis komprehensif dari berbagai sudut pandang.',
            tip: '💡 Tip: Klik tombol "Collab" di sidebar untuk mengaktifkan mode ini.',
          },
          {
            icon: '🚀',
            title: 'Siap Mulai!',
            desc: 'Anda sudah siap menggunakan The Blue Shark. Mulai dengan bertanya apa saja kepada agen AI pilihan Anda.',
            tip: 'Selamat mengeksplorasi! 🦈',
          },
        ];
        const step = steps[onboardingStep];
        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, animation: 'overlayIn 0.3s ease-out',
          }}>
            <div style={{
              width: '100%', maxWidth: 440, background: T.bgSidebar,
              borderRadius: 24, padding: isMobile ? '32px 24px' : '40px 36px',
              border: `1px solid ${T.border}`, textAlign: 'center',
              animation: 'fadeInUp 0.4s ease-out',
            }}>
              <div style={{
                fontSize: 56, marginBottom: 20,
                animation: 'float 3s ease-in-out infinite',
              }}>{step.icon}</div>

              {/* Progress dots */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
                {steps.map((_, i) => (
                  <div key={i} style={{
                    width: i === onboardingStep ? 24 : 8, height: 8, borderRadius: 4,
                    background: i === onboardingStep ? '#00d4ff' : i < onboardingStep ? 'rgba(0,212,255,0.4)' : T.border,
                    transition: 'all 0.3s ease',
                  }} />
                ))}
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: T.text }}>{step.title}</h2>
              <p style={{ fontSize: 14, color: T.textSecondary, lineHeight: 1.7, marginBottom: 16 }}>{step.desc}</p>
              <p style={{
                fontSize: 12, color: '#00d4ff', lineHeight: 1.6,
                padding: '10px 16px', borderRadius: 12,
                background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)',
                marginBottom: 28,
              }}>{step.tip}</p>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                {onboardingStep > 0 && (
                  <button onClick={() => setOnboardingStep(onboardingStep - 1)} style={{
                    padding: '10px 24px', borderRadius: 12, cursor: 'pointer',
                    background: T.bgCard, border: `1px solid ${T.border}`,
                    color: T.textMuted, fontSize: 13, fontWeight: 500,
                    fontFamily: "'Outfit', sans-serif",
                  }}>← Kembali</button>
                )}
                {onboardingStep < steps.length - 1 ? (
                  <button onClick={() => setOnboardingStep(onboardingStep + 1)} style={{
                    padding: '10px 32px', borderRadius: 12, cursor: 'pointer',
                    background: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)',
                    border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
                    fontFamily: "'Outfit', sans-serif",
                    boxShadow: '0 4px 16px rgba(0,212,255,0.3)',
                  }}>Lanjut →</button>
                ) : (
                  <button onClick={() => {
                    setShowOnboarding(false);
                    setOnboardingStep(0);
                    localStorage.setItem('bs-onboarded', 'true');
                  }} style={{
                    padding: '10px 32px', borderRadius: 12, cursor: 'pointer',
                    background: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)',
                    border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
                    fontFamily: "'Outfit', sans-serif",
                    boxShadow: '0 4px 16px rgba(0,212,255,0.3)',
                  }}>Mulai Sekarang! 🦈</button>
                )}
              </div>

              {onboardingStep < steps.length - 1 && (
                <button onClick={() => {
                  setShowOnboarding(false);
                  setOnboardingStep(0);
                  localStorage.setItem('bs-onboarded', 'true');
                }} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: T.textMuted, fontSize: 11, marginTop: 16,
                  fontFamily: "'Outfit', sans-serif",
                }}>Lewati tutorial</button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
