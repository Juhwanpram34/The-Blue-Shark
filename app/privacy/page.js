'use client';

export default function PrivacyPolicy() {
  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: 'linear-gradient(180deg, #060d1a 0%, #0a1628 50%, #0d1f3c 100%)',
      fontFamily: "'Outfit', sans-serif", color: '#e0e8f0',
      padding: '0',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(6,13,26,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href="/landing" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🦈</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#00d4ff' }}>The Blue Shark</span>
        </a>
        <a href="/landing" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>← Kembali</a>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{
          fontSize: 10, color: '#00d4ff', textTransform: 'uppercase',
          letterSpacing: 3, marginBottom: 12,
          fontFamily: "'JetBrains Mono', monospace",
        }}>LEGAL</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Kebijakan Privasi</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 40 }}>
          Terakhir diperbarui: 8 Mei 2026
        </p>

        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.9 }}>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>1. Pendahuluan</h2>
          <p style={{ marginBottom: 16 }}>
            The Blue Shark ("kami", "kita", atau "milik kami") mengoperasikan platform AI Multi-Agent yang dapat diakses melalui website kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat Anda menggunakan layanan kami.
          </p>
          <p style={{ marginBottom: 16 }}>
            Dengan menggunakan layanan The Blue Shark, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan kebijakan ini. Kebijakan ini disusun sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP) Republik Indonesia.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>2. Data yang Kami Kumpulkan</h2>
          <p style={{ marginBottom: 12 }}>Kami mengumpulkan beberapa jenis informasi untuk menyediakan dan meningkatkan layanan kami:</p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> <strong style={{ color: '#e0e8f0' }}>Data Akun:</strong> Nama, alamat email, dan password terenkripsi saat Anda mendaftar.
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> <strong style={{ color: '#e0e8f0' }}>Data Penggunaan:</strong> Riwayat percakapan dengan agen AI, jumlah query, dan preferensi penggunaan.
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> <strong style={{ color: '#e0e8f0' }}>Data Pembayaran:</strong> Informasi transaksi yang diproses melalui penyedia pembayaran pihak ketiga (Xendit). Kami tidak menyimpan data kartu kredit/debit Anda.
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> <strong style={{ color: '#e0e8f0' }}>Data Teknis:</strong> Alamat IP, jenis browser, sistem operasi, dan data analitik untuk peningkatan layanan.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>3. Penggunaan Data</h2>
          <p style={{ marginBottom: 12 }}>Data Anda digunakan untuk:</p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Menyediakan, mengoperasikan, dan memelihara layanan platform
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Memproses transaksi pembayaran dan mengelola langganan
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Mengirim notifikasi terkait akun, penggunaan, dan pembaruan layanan
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Meningkatkan kualitas respons agen AI dan pengalaman pengguna
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Mendeteksi dan mencegah penyalahgunaan, penipuan, atau aktivitas ilegal
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>4. Penyimpanan dan Keamanan Data</h2>
          <p style={{ marginBottom: 16 }}>
            Data Anda disimpan secara aman menggunakan Supabase dengan fitur Row Level Security (RLS), yang memastikan setiap pengguna hanya dapat mengakses data miliknya sendiri. Semua komunikasi antara browser Anda dan server kami dienkripsi menggunakan protokol SSL/TLS.
          </p>
          <p style={{ marginBottom: 16 }}>
            Password Anda di-hash menggunakan algoritma bcrypt dan tidak pernah disimpan dalam bentuk teks biasa. Kami tidak memiliki akses ke password asli Anda.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>5. Pihak Ketiga</h2>
          <p style={{ marginBottom: 12 }}>Kami menggunakan layanan pihak ketiga berikut untuk mengoperasikan platform:</p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> <strong style={{ color: '#e0e8f0' }}>Supabase</strong> — Database dan autentikasi pengguna
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> <strong style={{ color: '#e0e8f0' }}>OpenAI</strong> — Pemrosesan bahasa dan kecerdasan buatan untuk agen AI
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> <strong style={{ color: '#e0e8f0' }}>Xendit</strong> — Pemrosesan pembayaran dan langganan
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> <strong style={{ color: '#e0e8f0' }}>Vercel</strong> — Hosting dan deployment platform
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> <strong style={{ color: '#e0e8f0' }}>Resend</strong> — Pengiriman email notifikasi
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> <strong style={{ color: '#e0e8f0' }}>SerpAPI</strong> — Pencarian data real-time
          </p>
          <p style={{ marginBottom: 16, marginTop: 12 }}>
            Setiap pihak ketiga memiliki kebijakan privasi mereka sendiri. Kami hanya membagikan data minimum yang diperlukan untuk menjalankan layanan.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>6. Hak Anda</h2>
          <p style={{ marginBottom: 12 }}>Sesuai dengan UU PDP Indonesia, Anda memiliki hak untuk:</p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Mengakses data pribadi Anda yang kami simpan
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Memperbarui atau memperbaiki data yang tidak akurat
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Meminta penghapusan akun dan semua data terkait
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Menarik persetujuan penggunaan data kapan saja
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Mengajukan keluhan terkait pemrosesan data pribadi
          </p>
          <p style={{ marginBottom: 16, marginTop: 12 }}>
            Untuk melaksanakan hak-hak ini, silakan hubungi kami melalui email di bawah.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>7. Cookie</h2>
          <p style={{ marginBottom: 16 }}>
            Kami menggunakan cookie yang diperlukan untuk operasi platform, seperti menyimpan sesi login Anda. Kami tidak menggunakan cookie pelacakan pihak ketiga untuk iklan.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>8. Retensi Data</h2>
          <p style={{ marginBottom: 16 }}>
            Data akun dan riwayat percakapan disimpan selama akun Anda aktif. Jika Anda menghapus akun, semua data terkait akan dihapus secara permanen dalam waktu 30 hari. Data pembayaran disimpan sesuai ketentuan hukum yang berlaku.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>9. Perubahan Kebijakan</h2>
          <p style={{ marginBottom: 16 }}>
            Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi di platform. Tanggal pembaruan terakhir akan selalu ditampilkan di bagian atas halaman ini.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>10. Hubungi Kami</h2>
          <p style={{ marginBottom: 16 }}>
            Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini atau ingin melaksanakan hak Anda, hubungi kami di:
          </p>
          <div style={{
            background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: 14, padding: '20px 24px', marginBottom: 16,
          }}>
            <p style={{ marginBottom: 6 }}>📧 <strong style={{ color: '#e0e8f0' }}>Email:</strong> juhwan.pram34@gmail.com</p>
            <p>🦈 <strong style={{ color: '#e0e8f0' }}>Platform:</strong> The Blue Shark — AI Multi-Agent Platform</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '24px 20px', textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <p style={{
          fontSize: 11, color: 'rgba(255,255,255,0.2)',
          fontFamily: "'JetBrains Mono', monospace",
        }}>© 2026 The Blue Shark — AI Multi-Agent Platform</p>
      </div>
    </div>
  );
}
