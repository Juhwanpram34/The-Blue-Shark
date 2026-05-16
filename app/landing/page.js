'use client';

import { useState, useEffect } from 'react';
import { PLANS } from '../../lib/pricing';
import { AGENTS } from '../../lib/agents';

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const onScroll = () => setMenuOpen(false);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const faqs = [
    { q: 'Apa itu The Blue Shark?', a: 'The Blue Shark adalah platform AI Multi-Agent yang menggabungkan berbagai agen AI spesialis untuk membantu bisnis Anda dalam riset pasar, pembuatan konten, analisis sentimen, optimasi pemasaran, keamanan siber, otomatisasi, machine learning, dan dukungan pelanggan.' },
    { q: 'Apakah data saya aman?', a: 'Ya, kami menggunakan Supabase dengan Row Level Security (RLS) untuk melindungi data Anda. Setiap pengguna hanya bisa mengakses data milik mereka sendiri. Semua komunikasi dienkripsi menggunakan SSL/TLS.' },
    { q: 'Apa bedanya Single Agent dan Multi-Agent?', a: 'Single Agent memungkinkan Anda berkomunikasi dengan satu agen AI secara langsung. Multi-Agent Collaboration menggabungkan beberapa agen sekaligus untuk memberikan analisis komprehensif dari berbagai sudut pandang dalam satu respons.' },
    { q: 'Bagaimana cara upgrade paket?', a: 'Anda bisa upgrade paket langsung dari dashboard setelah login. Klik tombol "Upgrade Plan" di sidebar, pilih paket yang diinginkan, dan ikuti instruksi pembayaran.' },
    { q: 'Apakah bisa dipakai untuk tim?', a: 'Ya, paket Business mendukung hingga 10 anggota tim. Setiap anggota mendapatkan akses penuh ke semua fitur platform.' },
  ];

  const testimonials = [
    { name: 'Rina S.', role: 'CEO Startup Fintech', text: 'The Blue Shark mengubah cara kami melakukan riset pasar. Multi-Agent Collaboration memberikan insight yang tidak mungkin kami dapatkan dari satu tool saja.', avatar: 'R' },
    { name: 'Budi W.', role: 'Digital Marketing Manager', text: 'Agen Marketing Optimizer sangat membantu optimasi campaign iklan kami. ROI meningkat 3x dalam 2 bulan pertama.', avatar: 'B' },
    { name: 'Dewi A.', role: 'Content Strategist', text: 'Content Creator Agent menghasilkan ide konten yang fresh dan relevan. Produktivitas tim konten kami meningkat drastis.', avatar: 'D' },
  ];

  const pad = isMobile ? '16px' : '40px';

  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: 'linear-gradient(180deg, #060d1a 0%, #0a1628 50%, #0d1f3c 100%)',
      fontFamily: "'Outfit', sans-serif", color: '#e0e8f0',
      overflowX: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes drift { 0%, 100% { transform: translate(0, 0); } 33% { transform: translate(2%, -1%); } 66% { transform: translate(-1%, 1%); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Background Effects */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        overflow: 'hidden', zIndex: 0, pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
          background: 'radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,87,255,0.04) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(170,0,255,0.03) 0%, transparent 50%)',
          animation: 'drift 25s ease-in-out infinite',
        }} />
      </div>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: isMobile ? '12px 16px' : '16px 40px',
        background: 'rgba(6,13,26,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🦈</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#00d4ff', letterSpacing: -0.5 }}>The Blue Shark</span>
        </div>

        {isMobile ? (
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 8,
            display: 'flex', flexDirection: 'column', gap: 5, zIndex: 51,
          }}>
            <span style={{
              display: 'block', width: 22, height: 2, background: '#00d4ff', borderRadius: 2,
              transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none',
            }} />
            <span style={{
              display: 'block', width: 22, height: 2, background: '#00d4ff', borderRadius: 2,
              transition: 'all 0.3s', opacity: menuOpen ? 0 : 1,
            }} />
            <span style={{
              display: 'block', width: 22, height: 2, background: '#00d4ff', borderRadius: 2,
              transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
            }} />
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            {['Fitur', 'Agen', 'Harga', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{
                color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13, fontWeight: 500,
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              >{item}</a>
            ))}
            <a href="/" style={{
              padding: '8px 20px', borderRadius: 10,
              background: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)',
              color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600,
              boxShadow: '0 4px 16px rgba(0,212,255,0.3)',
            }}>Mulai Sekarang</a>
          </div>
        )}

        {isMobile && menuOpen && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: 'rgba(6,13,26,0.95)', backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '16px', display: 'flex', flexDirection: 'column', gap: 4,
            animation: 'slideDown 0.3s ease-out',
          }}>
            {['Fitur', 'Agen', 'Harga', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)} style={{
                color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 15, fontWeight: 500,
                padding: '12px 16px', borderRadius: 10, display: 'block',
                background: 'rgba(255,255,255,0.03)',
              }}>{item}</a>
            ))}
            <a href="/" style={{
              padding: '12px 16px', borderRadius: 10, marginTop: 4,
              background: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)',
              color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 600,
              textAlign: 'center', boxShadow: '0 4px 16px rgba(0,212,255,0.3)',
            }}>Mulai Sekarang</a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: isMobile ? '120px 16px 60px' : '160px 40px 100px',
        textAlign: 'center', maxWidth: 900, margin: '0 auto',
      }}>
        <div style={{ animation: 'float 4s ease-in-out infinite', fontSize: isMobile ? 52 : 72, marginBottom: 24 }}>🦈</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: 4, marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>AI MULTI-AGENT PLATFORM</div>
        <h1 style={{
          fontSize: isMobile ? 28 : 52, fontWeight: 800, lineHeight: 1.15, marginBottom: 20, letterSpacing: -1,
          background: 'linear-gradient(135deg, #fff 0%, #00d4ff 50%, #aa00ff 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Multi-Agent AI Untuk Dominasi Pasar</h1>
        <p style={{ fontSize: isMobile ? 15 : 18, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 40px' }}>
          Platform AI Multi-Agent pertama di Indonesia yang menggabungkan riset pasar, pembuatan konten, analisis sentimen, dan optimasi pemasaran dalam satu platform.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/" style={{
            padding: isMobile ? '12px 28px' : '14px 36px', borderRadius: 14,
            background: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)',
            color: '#fff', textDecoration: 'none', fontSize: isMobile ? 14 : 16, fontWeight: 600,
            boxShadow: '0 8px 32px rgba(0,212,255,0.3)',
          }}>Coba Gratis Sekarang</a>
          <a href="#fitur" style={{
            padding: isMobile ? '12px 28px' : '14px 36px', borderRadius: 14,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#e0e8f0', textDecoration: 'none', fontSize: isMobile ? 14 : 16, fontWeight: 500,
          }}>Pelajari Lebih Lanjut</a>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? 20 : 40, marginTop: isMobile ? 40 : 60,
        }}>
          {[{ val: 'Multi', label: 'Agen AI Spesialis' }, { val: '24/7', label: 'Selalu Online' }, { val: 'Real-time', label: 'Data Terkini' }, { val: '∞', label: 'Potensi Bisnis' }].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800, color: '#00d4ff' }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="fitur" style={{ position: 'relative', zIndex: 1, padding: `80px ${pad}`, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: 10, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>FITUR UNGGULAN</div>
          <h2 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, marginBottom: 12 }}>Kenapa The Blue Shark?</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 500, margin: '0 auto' }}>Platform yang dirancang untuk memberikan keunggulan kompetitif bagi bisnis Anda</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {[
            { icon: '🤖', title: 'Multi-Agent Collaboration', color: '#00d4ff', desc: 'Beberapa agen AI bekerja bersama dalam satu pertanyaan, memberikan analisis komprehensif dari berbagai sudut pandang.' },
            { icon: '📡', title: 'Data Real-Time', color: '#00e676', desc: 'Terhubung dengan sumber data terkini melalui web search dan API integrations untuk informasi yang selalu up-to-date.' },
            { icon: '🛡️', title: 'Keamanan Terjamin', color: '#ff1744', desc: 'Row Level Security, enkripsi SSL/TLS, dan kontrol akses ketat untuk melindungi data bisnis Anda.' },
            { icon: '⚡', title: 'Respons Cepat', color: '#ffd600', desc: 'Ditenagai oleh GPT-4o dengan optimasi kecepatan, memberikan jawaban berkualitas dalam hitungan detik.' },
            { icon: '📊', title: 'Analisis Mendalam', color: '#aa00ff', desc: 'Dari riset pasar hingga analisis sentimen, dapatkan insight berbasis data yang actionable untuk bisnis Anda.' },
            { icon: '🌐', title: 'Siap Skala Global', color: '#ff6b35', desc: 'Arsitektur cloud-native yang siap menangani pertumbuhan bisnis Anda dari startup hingga enterprise.' },
          ].map(f => (
            <div key={f.title} style={{ padding: '28px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18 }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: f.color }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Agents */}
      <section id="agen" style={{ position: 'relative', zIndex: 1, padding: `80px ${pad}`, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: 10, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>AGEN AI</div>
          <h2 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, marginBottom: 12 }}>Agen AI Spesialis Kami</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 500, margin: '0 auto' }}>Setiap agen memiliki keahlian khusus untuk membantu aspek berbeda dari bisnis Anda</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {AGENTS.map(agent => (
            <div key={agent.id} style={{ padding: isMobile ? '20px 14px' : '24px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px', background: `linear-gradient(135deg, ${agent.color} 0%, ${agent.color}88 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: `0 8px 24px ${agent.color}25` }}>{agent.icon}</div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: agent.color, marginBottom: 6 }}>{agent.name}</h3>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{agent.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ position: 'relative', zIndex: 1, padding: `80px ${pad}`, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: 10, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>TESTIMONI</div>
          <h2 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, marginBottom: 12 }}>Dipercaya oleh Profesional</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {testimonials.map(t => (
            <div key={t.name} style={{ padding: '28px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18 }}>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="harga" style={{ position: 'relative', zIndex: 1, padding: `80px ${pad}`, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: 10, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>HARGA</div>
          <h2 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, marginBottom: 12 }}>Pilih Paket yang Tepat</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 500, margin: '0 auto' }}>Mulai gratis, upgrade kapan saja sesuai kebutuhan bisnis Anda</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20, maxWidth: 960, margin: '0 auto' }}>
          {PLANS.map(plan => {
            const icons = { free: '🐟', pro: '🦈', business: '🐋' };
            const colors = { free: '#64ffda', pro: '#00d4ff', business: '#aa00ff' };
            const isPro = plan.id === 'pro';
            return (
              <div key={plan.id} style={{
                padding: '32px 28px', position: 'relative',
                background: isPro ? 'linear-gradient(180deg, rgba(0,212,255,0.08) 0%, rgba(0,87,255,0.05) 100%)' : 'rgba(255,255,255,0.03)',
                border: isPro ? '1px solid rgba(0,212,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, display: 'flex', flexDirection: 'column',
              }}>
                {isPro && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 18px', borderRadius: 20, background: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)', fontSize: 10, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>Paling Populer</div>}
                <div style={{ fontSize: 32, marginBottom: 10 }}>{icons[plan.id]}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: colors[plan.id], marginBottom: 4 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: '#fff' }}>${plan.price}</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>{plan.price === 0 ? 'forever' : '/month'}</span>
                </div>
                <div style={{ flex: 1, marginBottom: 24 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                      <span style={{ color: colors[plan.id], flexShrink: 0 }}>✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="/" style={{ display: 'block', width: '100%', padding: '14px 0', borderRadius: 12, background: `linear-gradient(135deg, ${colors[plan.id]} 0%, ${colors[plan.id]}88 100%)`, color: '#fff', textDecoration: 'none', textAlign: 'center', fontSize: 14, fontWeight: 600, boxShadow: `0 4px 16px ${colors[plan.id]}30` }}>
                  {plan.price === 0 ? 'Mulai Gratis' : `Pilih ${plan.name}`}
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ position: 'relative', zIndex: 1, padding: isMobile ? '60px 16px' : '80px 40px', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: 10, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>FAQ</div>
          <h2 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, marginBottom: 12 }}>Pertanyaan Umum</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{
                width: '100%', padding: isMobile ? '14px 16px' : '18px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                color: '#e0e8f0', fontSize: isMobile ? 13 : 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif", textAlign: 'left',
              }}>
                <span>{faq.q}</span>
                <span style={{ fontSize: 18, transition: 'transform 0.3s', transform: faqOpen === i ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
              </button>
              {faqOpen === i && (
                <div style={{ padding: isMobile ? '0 16px 14px' : '0 20px 18px', fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, animation: 'slideDown 0.3s ease-out' }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: 'relative', zIndex: 1, padding: isMobile ? '60px 16px' : '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: isMobile ? '40px 24px' : '60px 40px', background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(170,0,255,0.08) 100%)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 28 }}>
          <div style={{ fontSize: isMobile ? 36 : 48, marginBottom: 16 }}>🦈</div>
          <h2 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, marginBottom: 12 }}>Siap Menjadi Predator Pasar?</h2>
          <p style={{ fontSize: isMobile ? 13 : 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 400, margin: '0 auto 28px' }}>Mulai gunakan The Blue Shark sekarang dan rasakan kekuatan Multi-Agent AI yang bekerja untuk bisnis Anda.</p>
          <a href="/" style={{ display: 'inline-block', padding: isMobile ? '14px 32px' : '16px 40px', borderRadius: 14, background: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)', color: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 600, boxShadow: '0 8px 32px rgba(0,212,255,0.3)' }}>Mulai Gratis Sekarang</a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '40px 16px 24px' : '60px 40px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr', gap: isMobile ? 32 : 40, textAlign: isMobile ? 'center' : 'left', marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <span style={{ fontSize: 24 }}>🦈</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#00d4ff' }}>The Blue Shark</span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>Platform AI Multi-Agent pertama di Indonesia untuk riset pasar, pembuatan konten, dan optimasi bisnis.</p>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Platform</div>
            {['Fitur', 'Agen', 'Harga', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: 10 }}
                onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >{item}</a>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Legal</div>
            <a href="/privacy" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: 10 }}
              onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >Kebijakan Privasi</a>
            <a href="/terms" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: 10 }}
              onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >Syarat & Ketentuan</a>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Akun</div>
            <a href="/" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: 10 }}
              onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >Login / Daftar</a>
            <a href="/" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: 10 }}
              onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >Dashboard</a>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>© 2026 The Blue Shark. AI Multi-Agent Platform — Predator Edition</p>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="/privacy" style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>Privacy</a>
            <a href="/terms" style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
