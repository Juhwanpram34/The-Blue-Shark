'use client';

import { useState } from 'react';
import { PLANS } from '../../lib/pricing';
import { AGENTS } from '../../lib/agents';

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState(null);

  const faqs = [
    { q: 'Apa itu The Blue Shark?', a: 'The Blue Shark adalah platform AI Multi-Agent yang menggabungkan 8 agen AI spesialis untuk membantu bisnis Anda dalam riset pasar, pembuatan konten, analisis sentimen, optimasi pemasaran, keamanan siber, otomatisasi, machine learning, dan dukungan pelanggan.' },
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
        padding: '16px 40px',
        background: 'rgba(6,13,26,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🦈</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#00d4ff', letterSpacing: -0.5 }}>The Blue Shark</span>
        </div>
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
      </nav>

      {/* Hero Section */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '160px 40px 100px', textAlign: 'center',
        maxWidth: 900, margin: '0 auto',
      }}>
        <div style={{
          animation: 'float 4s ease-in-out infinite',
          fontSize: 72, marginBottom: 24,
        }}>🦈</div>
        <div style={{
          fontSize: 10, fontWeight: 600, color: '#00d4ff',
          textTransform: 'uppercase', letterSpacing: 4, marginBottom: 16,
          fontFamily: "'JetBrains Mono', monospace",
        }}>AI MULTI-AGENT PLATFORM</div>
        <h1 style={{
          fontSize: 52, fontWeight: 800, lineHeight: 1.15,
          marginBottom: 20, letterSpacing: -1,
          background: 'linear-gradient(135deg, #fff 0%, #00d4ff 50%, #aa00ff 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          8 Agen AI Bekerja Bersama Untuk Bisnis Anda
        </h1>
        <p style={{
          fontSize: 18, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7,
          maxWidth: 600, margin: '0 auto 40px',
        }}>
          Platform AI Multi-Agent pertama di Indonesia yang menggabungkan riset pasar, pembuatan konten, analisis sentimen, dan optimasi pemasaran dalam satu platform.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/" style={{
            padding: '14px 36px', borderRadius: 14,
            background: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)',
            color: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 600,
            boxShadow: '0 8px 32px rgba(0,212,255,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,212,255,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,212,255,0.3)'; }}
          >Coba Gratis Sekarang</a>
          <a href="#fitur" style={{
            padding: '14px 36px', borderRadius: 14,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e0e8f0', textDecoration: 'none', fontSize: 16, fontWeight: 500,
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >Pelajari Lebih Lanjut</a>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 40, justifyContent: 'center', marginTop: 60,
          flexWrap: 'wrap',
        }}>
          {[
            { value: '8', label: 'Agen AI Spesialis' },
            { value: '24/7', label: 'Selalu Online' },
            { value: 'Real-time', label: 'Data Terkini' },
            { value: '∞', label: 'Potensi Bisnis' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#00d4ff' }}>{s.value}</div>
              <div style={{
                fontSize: 11, color: 'rgba(255,255,255,0.35)',
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: 'uppercase', letterSpacing: 1, marginTop: 4,
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" style={{
        position: 'relative', zIndex: 1,
        padding: '80px 40px', maxWidth: 1100, margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            fontSize: 10, color: '#00d4ff', textTransform: 'uppercase',
            letterSpacing: 3, marginBottom: 12,
            fontFamily: "'JetBrains Mono', monospace",
          }}>FITUR UNGGULAN</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            Kenapa The Blue Shark?
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 500, margin: '0 auto' }}>
            Platform yang dirancang untuk memberikan keunggulan kompetitif bagi bisnis Anda
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {[
            { icon: '🤖', title: 'Multi-Agent Collaboration', desc: 'Beberapa agen AI bekerja bersama dalam satu pertanyaan, memberikan analisis komprehensif dari berbagai sudut pandang.', color: '#00d4ff' },
            { icon: '📡', title: 'Data Real-Time', desc: 'Terhubung dengan sumber data terkini melalui web search dan API integrations untuk informasi yang selalu up-to-date.', color: '#00e676' },
            { icon: '🛡️', title: 'Keamanan Terjamin', desc: 'Row Level Security, enkripsi SSL/TLS, dan kontrol akses ketat untuk melindungi data bisnis Anda.', color: '#ff1744' },
            { icon: '⚡', title: 'Respons Cepat', desc: 'Ditenagai oleh GPT-4o dengan optimasi kecepatan, memberikan jawaban berkualitas dalam hitungan detik.', color: '#ffd600' },
            { icon: '📊', title: 'Analisis Mendalam', desc: 'Dari riset pasar hingga analisis sentimen, dapatkan insight berbasis data yang actionable untuk bisnis Anda.', color: '#aa00ff' },
            { icon: '🌐', title: 'Siap Skala Global', desc: 'Arsitektur cloud-native yang siap menangani pertumbuhan bisnis Anda dari startup hingga enterprise.', color: '#ff6b35' },
          ].map((f, i) => (
            <div key={i} style={{
              padding: '28px 24px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 18,
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${f.color}08`; e.currentTarget.style.borderColor = `${f.color}25`; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
            >
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: f.color }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Agents Section */}
      <section id="agen" style={{
        position: 'relative', zIndex: 1,
        padding: '80px 40px', maxWidth: 1100, margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            fontSize: 10, color: '#00d4ff', textTransform: 'uppercase',
            letterSpacing: 3, marginBottom: 12,
            fontFamily: "'JetBrains Mono', monospace",
          }}>AGEN AI</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            8 Agen AI Spesialis
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 500, margin: '0 auto' }}>
            Setiap agen memiliki keahlian khusus untuk membantu aspek berbeda dari bisnis Anda
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {AGENTS.map((agent, i) => (
            <div key={i} style={{
              padding: '24px 20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, textAlign: 'center',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${agent.color}08`; e.currentTarget.style.borderColor = `${agent.color}25`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px',
                background: agent.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, boxShadow: `0 8px 24px ${agent.color}25`,
              }}>{agent.icon}</div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: agent.color, marginBottom: 6 }}>{agent.name}</h3>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{agent.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '80px 40px', maxWidth: 1100, margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            fontSize: 10, color: '#00d4ff', textTransform: 'uppercase',
            letterSpacing: 3, marginBottom: 12,
            fontFamily: "'JetBrains Mono', monospace",
          }}>TESTIMONI</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            Dipercaya oleh Profesional
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{
              padding: '28px 24px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 18,
            }}>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                "{t.text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700, color: '#fff',
                }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" style={{
        position: 'relative', zIndex: 1,
        padding: '80px 40px', maxWidth: 1100, margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            fontSize: 10, color: '#00d4ff', textTransform: 'uppercase',
            letterSpacing: 3, marginBottom: 12,
            fontFamily: "'JetBrains Mono', monospace",
          }}>HARGA</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            Pilih Paket yang Tepat
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 500, margin: '0 auto' }}>
            Mulai gratis, upgrade kapan saja sesuai kebutuhan bisnis Anda
          </p>
        </div>

        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              flex: '1 1 280px', maxWidth: 320, padding: '32px 28px',
              background: plan.popular
                ? 'linear-gradient(180deg, rgba(0,212,255,0.08) 0%, rgba(0,87,255,0.05) 100%)'
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${plan.popular ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 20, position: 'relative',
              display: 'flex', flexDirection: 'column',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  padding: '4px 18px', borderRadius: 20,
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)',
                  fontSize: 10, fontWeight: 700, color: '#fff',
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>Paling Populer</div>
              )}
              <div style={{ fontSize: 32, marginBottom: 10 }}>{plan.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: plan.color, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: '#fff' }}>{plan.priceLabel}</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>{plan.period}</span>
              </div>
              <div style={{ flex: 1, marginBottom: 24 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 8, alignItems: 'flex-start',
                    marginBottom: 10, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5,
                  }}>
                    <span style={{ color: plan.color, flexShrink: 0 }}>✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <a href="/" style={{
                display: 'block', width: '100%', padding: '14px 0', borderRadius: 12,
                background: plan.gradient, color: '#fff', textDecoration: 'none',
                textAlign: 'center', fontSize: 14, fontWeight: 600,
                boxShadow: `0 4px 16px ${plan.color}30`,
                transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >{plan.price === 0 ? 'Mulai Gratis' : `Pilih ${plan.name}`}</a>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{
        position: 'relative', zIndex: 1,
        padding: '80px 40px', maxWidth: 700, margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{
            fontSize: 10, color: '#00d4ff', textTransform: 'uppercase',
            letterSpacing: 3, marginBottom: 12,
            fontFamily: "'JetBrains Mono', monospace",
          }}>FAQ</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            Pertanyaan Umum
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, overflow: 'hidden',
              transition: 'all 0.3s ease',
            }}>
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{
                width: '100%', padding: '18px 20px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                color: faqOpen === i ? '#00d4ff' : '#e0e8f0',
                fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
                textAlign: 'left',
              }}>
                <span>{faq.q}</span>
                <span style={{
                  fontSize: 18, transition: 'transform 0.3s',
                  transform: faqOpen === i ? 'rotate(45deg)' : 'rotate(0)',
                }}>+</span>
              </button>
              {faqOpen === i && (
                <div style={{
                  padding: '0 20px 18px',
                  fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7,
                }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '80px 40px', textAlign: 'center',
      }}>
        <div style={{
          maxWidth: 600, margin: '0 auto',
          padding: '60px 40px',
          background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(170,0,255,0.08) 100%)',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 28,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🦈</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
            Siap Menjadi Predator Pasar?
          </h2>
          <p style={{
            fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7,
            maxWidth: 400, margin: '0 auto 28px',
          }}>
            Mulai gunakan The Blue Shark sekarang dan rasakan kekuatan 8 agen AI yang bekerja untuk bisnis Anda.
          </p>
          <a href="/" style={{
            display: 'inline-block', padding: '16px 40px', borderRadius: 14,
            background: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)',
            color: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 600,
            boxShadow: '0 8px 32px rgba(0,212,255,0.3)',
          }}>Mulai Gratis Sekarang</a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 1,
        padding: '40px 40px', textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>🦈</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#00d4ff' }}>The Blue Shark</span>
        </div>
        <p style={{
          fontSize: 11, color: 'rgba(255,255,255,0.2)',
          fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1,
        }}>
          © 2026 The Blue Shark. AI Multi-Agent Platform — Predator Edition
        </p>
      </footer>
    </div>
  );
}
