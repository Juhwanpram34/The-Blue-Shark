'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { AGENTS } from '../lib/agents';

function formatMessage(text) {
  if (!text) return '';
  const lines = text.split('\n');
  return lines.map((line, i) => {
    let processed = line.replace(/\*\*(.+?)\*\*/g, (_, m) =>
      `<strong style="color:#fff;font-weight:600">${m}</strong>`
    );
    const isBullet = /^[\s]*[-•]\s/.test(processed);
    if (isBullet) {
      processed = processed.replace(/^[\s]*[-•]\s/, '');
      return `<div style="padding-left:16px;position:relative;margin:3px 0"><span style="position:absolute;left:0;color:rgba(0,212,255,0.6)">▸</span>${processed}</div>`;
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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentMessages = conversations[activeAgent.id] || [];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
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
    setConversations(Object.fromEntries(AGENTS.map(a => [a.id, []])));
    setTotalQueries(0);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...currentMessages, userMessage];
    setConversations(prev => ({ ...prev, [activeAgent.id]: updatedMessages }));
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          agentId: activeAgent.id,
        }),
      });
      const data = await res.json();
      const content = data.content || data.error || 'Maaf, terjadi kesalahan.';
      setConversations(prev => ({
        ...prev,
        [activeAgent.id]: [...updatedMessages, { role: 'assistant', content }],
      }));
      setTotalQueries(prev => prev + 1);
    } catch (error) {
      setConversations(prev => ({
        ...prev,
        [activeAgent.id]: [...updatedMessages, {
          role: 'assistant',
          content: '⚠️ Terjadi kesalahan koneksi. Coba lagi.',
        }],
      }));
    } finally { setIsLoading(false); }
  };

  const sendCollaboration = async () => {
    if (!input.trim() || isLoading) return;
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
        background: 'linear-gradient(180deg, #060d1a 0%, #0a1628 50%, #0d1f3c 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
          background: 'radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,87,255,0.06) 0%, transparent 50%)',
          animation: 'drift 20s ease-in-out infinite',
        }} />
        <div style={{
          position: 'relative', zIndex: 10, width: '100%', maxWidth: 420, padding: '0 20px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🦈</div>
            <h1 style={{
              fontSize: 28, fontWeight: 800, color: '#00d4ff',
              letterSpacing: -0.5, marginBottom: 6,
            }}>The Blue Shark</h1>
            <p style={{
              fontSize: 12, color: 'rgba(255,255,255,0.35)',
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase', letterSpacing: 2,
            }}>AI Multi-Agent Platform</p>
          </div>

          <form onSubmit={handleAuth} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: '32px 28px',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{
              display: 'flex', gap: 0, marginBottom: 24,
              background: 'rgba(255,255,255,0.04)', borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
            }}>
              {['login', 'signup'].map(mode => (
                <button key={mode} type="button" onClick={() => { setAuthMode(mode); setAuthError(''); }}
                  style={{
                    flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                    background: authMode === mode ? 'rgba(0,212,255,0.15)' : 'transparent',
                    color: authMode === mode ? '#00d4ff' : 'rgba(255,255,255,0.4)',
                    fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
                    transition: 'all 0.2s ease',
                  }}
                >{mode === 'login' ? 'Login' : 'Sign Up'}</button>
              ))}
            </div>

            {authMode === 'signup' && (
              <input type="text" placeholder="Nama lengkap" value={authName}
                onChange={e => setAuthName(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', marginBottom: 12,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, color: '#e0e8f0', fontSize: 14,
                  fontFamily: "'Outfit', sans-serif", outline: 'none',
                }}
              />
            )}
            <input type="email" placeholder="Email" value={authEmail} required
              onChange={e => setAuthEmail(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', marginBottom: 12,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, color: '#e0e8f0', fontSize: 14,
                fontFamily: "'Outfit', sans-serif", outline: 'none',
              }}
            />
            <input type="password" placeholder="Password" value={authPassword} required
              onChange={e => setAuthPassword(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', marginBottom: 20,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, color: '#e0e8f0', fontSize: 14,
                fontFamily: "'Outfit', sans-serif", outline: 'none',
              }}
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
                borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 600,
                fontFamily: "'Outfit', sans-serif", cursor: authLoading ? 'wait' : 'pointer',
                boxShadow: '0 4px 20px rgba(0,212,255,0.3)',
                opacity: authLoading ? 0.7 : 1,
                transition: 'all 0.2s ease',
              }}
            >{authLoading ? '...' : authMode === 'login' ? 'Login' : 'Buat Akun'}</button>
          </form>
        </div>
      </div>
    );
  }

  // ==================== MAIN PLATFORM ====================
  return (
    <div style={{
      width: '100%', height: '100vh',
      background: 'linear-gradient(180deg, #060d1a 0%, #0a1628 50%, #0d1f3c 100%)',
      display: 'flex', fontFamily: "'Outfit', sans-serif",
      color: '#e0e8f0', position: 'relative', overflow: 'hidden',
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
        height: '100%', background: 'rgba(6,13,26,0.9)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.3s ease', overflow: 'hidden', zIndex: 10,
      }}>
        <div style={{
          padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: 28 }}>🦈</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#00d4ff', letterSpacing: -0.5 }}>
              The Blue Shark
            </div>
            <div style={{
              fontSize: 9, color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase', letterSpacing: 2,
              fontFamily: "'JetBrains Mono', monospace",
            }}>AI Multi-Agent Platform</div>
          </div>
        </div>

        {/* User Info */}
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#fff',
          }}>{(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e0e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.user_metadata?.full_name || 'User'}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
          </div>
          <button onClick={handleLogout} style={{
            padding: '5px 10px', borderRadius: 8,
            background: 'rgba(255,23,68,0.1)', border: '1px solid rgba(255,23,68,0.2)',
            color: '#ff1744', fontSize: 10, cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
          }}>Logout</button>
        </div>

        {/* Stats */}
        <div style={{
          padding: '12px 16px', display: 'flex', gap: 8,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {[
            { label: 'Agents', value: AGENTS.length, c: '#00d4ff' },
            { label: 'Active', value: activeAgentsCount, c: '#00e676' },
            { label: 'Queries', value: totalQueries, c: '#ff6b35' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '8px 10px', background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, flex: 1,
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.c }}>{s.value}</div>
              <div style={{
                fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 2,
                textTransform: 'uppercase', letterSpacing: 1,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mode Switcher */}
        <div style={{
          padding: '12px 10px', display: 'flex', gap: 4,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button onClick={() => setMode('single')} style={{
            flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: mode === 'single' ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.03)',
            color: mode === 'single' ? '#00d4ff' : 'rgba(255,255,255,0.4)',
            fontSize: 11, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
            transition: 'all 0.2s ease',
          }}>🎯 Single Agent</button>
          <button onClick={() => setMode('collab')} style={{
            flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: mode === 'collab' ? 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(170,0,255,0.15))' : 'rgba(255,255,255,0.03)',
            color: mode === 'collab' ? '#00d4ff' : 'rgba(255,255,255,0.4)',
            fontSize: 11, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
            transition: 'all 0.2s ease',
          }}>🦈 Multi-Agent</button>
        </div>

        {/* Agents List */}
        <div style={{ padding: '12px 10px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{
            fontSize: 9, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
            letterSpacing: 2, padding: '0 6px', marginBottom: 4,
            fontFamily: "'JetBrains Mono', monospace",
          }}>{mode === 'collab' ? 'Select Agents (min 2)' : 'AI Agents'}</div>
          {AGENTS.map(agent => (
            <button key={agent.id} onClick={() => {
              if (mode === 'collab') {
                toggleCollabAgent(agent.id);
              } else {
                setActiveAgent(agent);
              }
            }}
              style={{
                width: '100%', padding: '12px', display: 'flex', alignItems: 'center', gap: 10,
                background: mode === 'collab'
                  ? (selectedCollabAgents.includes(agent.id) ? `linear-gradient(135deg, ${agent.color}15 0%, ${agent.color}08 100%)` : 'rgba(255,255,255,0.02)')
                  : (activeAgent.id === agent.id ? `linear-gradient(135deg, ${agent.color}15 0%, ${agent.color}08 100%)` : 'rgba(255,255,255,0.02)'),
                border: `1px solid ${
                  mode === 'collab'
                    ? (selectedCollabAgents.includes(agent.id) ? `${agent.color}50` : 'rgba(255,255,255,0.06)')
                    : (activeAgent.id === agent.id ? `${agent.color}50` : 'rgba(255,255,255,0.06)')
                }`,
                borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.2s ease', outline: 'none',
              }}
            >
              {mode === 'collab' && (
                <div style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  border: `2px solid ${selectedCollabAgents.includes(agent.id) ? agent.color : 'rgba(255,255,255,0.2)'}`,
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
                  color: (mode === 'collab' ? selectedCollabAgents.includes(agent.id) : activeAgent.id === agent.id) ? agent.color : '#c0c8d4',
                }}>{agent.name}</div>
                <div style={{
                  fontSize: 9, color: 'rgba(255,255,255,0.3)',
                  fontFamily: "'JetBrains Mono', monospace",
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{agent.description}</div>
              </div>
              {(conversations[agent.id] || []).length > 0 && (
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: agent.color, flexShrink: 0,
                  boxShadow: `0 0 8px ${agent.color}80`,
                }} />
              )}
            </button>
          ))}
        </div>

        <div style={{
          padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: 8, color: 'rgba(255,255,255,0.15)',
          fontFamily: "'JetBrains Mono', monospace", textAlign: 'center', letterSpacing: 1,
        }}>POWERED BY GPT-4 × BLUE SHARK ENGINE</div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 5 }}>
        {/* Header */}
        <div style={{
          padding: '12px 20px', background: 'rgba(6,13,26,0.6)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#c0c8d4', cursor: 'pointer',
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
                <div style={{ fontSize: 14, fontWeight: 600 }}>Multi-Agent Collaboration</div>
                <div style={{
                  fontSize: 10, color: '#00d4ff',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>● {selectedCollabAgents.length > 0 ? `${selectedCollabAgents.length} agents selected` : 'Auto-select mode'}</div>
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
                <div style={{ fontSize: 14, fontWeight: 600 }}>{activeAgent.name}</div>
                <div style={{
                  fontSize: 10, color: activeAgent.color,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>● Online — Ready to analyze</div>
              </div>
            </>
          )}
          <div style={{ flex: 1 }} />
          <div style={{
            padding: '5px 12px', borderRadius: 20,
            background: `${activeAgent.color}12`, border: `1px solid ${activeAgent.color}25`,
            fontSize: 10, color: activeAgent.color,
            fontFamily: "'JetBrains Mono', monospace",
          }}>{currentMessages.filter(m => m.role === 'user').length} queries</div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
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
                  fontSize: 13, color: 'rgba(255,255,255,0.4)',
                  textAlign: 'center', maxWidth: 420, lineHeight: 1.6, marginBottom: 28,
                }}>
                  Kirim satu pertanyaan, beberapa agen AI bekerja bareng dan memberikan analisis dari berbagai sudut pandang. Hasilnya digabung jadi satu laporan komprehensif.
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 500 }}>
                  {['Analisis peluang bisnis AI di Indonesia 2026', 'Strategi launch produk SaaS baru', 'Evaluasi kompetitor marketplace fashion'].map((s, i) => (
                    <button key={i} onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      style={{
                        padding: '8px 14px', borderRadius: 20,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.45)', fontSize: 12, cursor: 'pointer',
                        fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.15)'; e.currentTarget.style.color = '#00d4ff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                    >{s}</button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {isLoading && (
                  <div style={{ textAlign: 'center', padding: 40, animation: 'fadeInUp 0.3s ease-out' }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>🦈</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#00d4ff', marginBottom: 8 }}>Multi-Agent Collaboration in Progress...</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {selectedCollabAgents.length > 0 ? `${selectedCollabAgents.length} agents` : 'Auto-selected agents'} working together
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
                        color: '#d0d8e4', fontSize: 14, lineHeight: 1.7,
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
                        }}>🦈 EXECUTIVE SUMMARY</div>
                        <div style={{ color: '#d0d8e4', fontSize: 14, lineHeight: 1.7, wordBreak: 'break-word' }}
                          dangerouslySetInnerHTML={{ __html: formatMessage(collabResults.executiveSummary) }}
                        />
                      </div>
                    )}

                    {/* Individual Agent Results */}
                    {collabResults.agentResults.map((result, i) => (
                      <div key={i} style={{
                        padding: '16px 18px', marginBottom: 12,
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${result.agentColor || 'rgba(255,255,255,0.08)'}25`,
                        borderRadius: 14,
                      }}>
                        <div style={{
                          fontSize: 11, fontWeight: 600, color: result.agentColor || '#00d4ff',
                          marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>{result.agentIcon} {result.agentName}</div>
                        <div style={{ color: '#d0d8e4', fontSize: 13, lineHeight: 1.7, wordBreak: 'break-word' }}
                          dangerouslySetInnerHTML={{ __html: formatMessage(result.content) }}
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
              animation: 'fadeInUp 0.6s ease-out',
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
                fontSize: 13, color: 'rgba(255,255,255,0.4)',
                textAlign: 'center', maxWidth: 380, lineHeight: 1.6, marginBottom: 28,
              }}>{activeAgent.description}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 460 }}>
                {(activeAgent.suggestions || []).map((s, i) => (
                  <button key={i} onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    style={{
                      padding: '8px 14px', borderRadius: 20,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.45)', fontSize: 12, cursor: 'pointer',
                      fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = `${activeAgent.color}15`;
                      e.currentTarget.style.borderColor = `${activeAgent.color}40`;
                      e.currentTarget.style.color = activeAgent.color;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
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
                }}>
                  <div style={{
                    maxWidth: '82%', padding: '14px 18px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(0,87,255,0.15) 100%)'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${msg.role === 'user' ? 'rgba(0,212,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    color: '#d0d8e4', fontSize: 14, lineHeight: 1.7,
                  }}>
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
                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
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
                    marginLeft: 8, fontSize: 13, color: 'rgba(255,255,255,0.4)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>Blue Shark is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )
          )}
        </div>

        {/* Input */}
        <div style={{ padding: '14px 20px 20px', background: 'linear-gradient(180deg, transparent 0%, rgba(6,13,26,0.8) 100%)' }}>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-end',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '6px 6px 6px 18px',
          }}>
            <textarea ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); mode === 'collab' ? sendCollaboration() : sendMessage(); }}}
              placeholder={mode === 'collab' ? 'Kirim pertanyaan untuk multi-agent collaboration...' : activeAgent.placeholder} rows={1}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#e0e8f0', fontSize: 14, fontFamily: "'Outfit', sans-serif",
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
            color: 'rgba(255,255,255,0.15)',
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1.5,
          }}>THE BLUE SHARK v1.0 — AI MULTI-AGENT PLATFORM — PREDATOR EDITION</div>
        </div>
      </div>
    </div>
  );
}
