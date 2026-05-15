'use client';

export default function TermsOfService() {
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
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Syarat & Ketentuan</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 40 }}>
          Terakhir diperbarui: 8 Mei 2026
        </p>

        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.9 }}>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>1. Penerimaan Ketentuan</h2>
          <p style={{ marginBottom: 16 }}>
            Dengan mengakses atau menggunakan platform The Blue Shark, Anda menyetujui untuk terikat oleh Syarat & Ketentuan ini. Jika Anda tidak menyetujui salah satu ketentuan, Anda tidak diperkenankan menggunakan layanan kami.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>2. Deskripsi Layanan</h2>
          <p style={{ marginBottom: 16 }}>
            The Blue Shark adalah platform AI Multi-Agent yang menyediakan layanan kecerdasan buatan untuk riset pasar, pembuatan konten, analisis sentimen, optimasi pemasaran, keamanan siber, otomatisasi alur kerja, machine learning, dan dukungan pelanggan. Layanan ini tersedia melalui antarmuka web dan aplikasi PWA.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>3. Akun Pengguna</h2>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Anda harus berusia minimal 17 tahun untuk mendaftar akun.
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Anda bertanggung jawab menjaga kerahasiaan password akun Anda.
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Informasi yang Anda berikan saat pendaftaran harus akurat dan terkini.
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Anda bertanggung jawab atas semua aktivitas yang terjadi di bawah akun Anda.
          </p>
          <p style={{ marginBottom: 16, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Kami berhak menangguhkan atau menghapus akun yang melanggar ketentuan ini.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>4. Paket Layanan & Pembayaran</h2>
          <p style={{ marginBottom: 12 }}>The Blue Shark tersedia dalam tiga paket:</p>
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14, padding: '20px 24px', marginBottom: 16,
          }}>
            <p style={{ marginBottom: 8 }}>🐟 <strong style={{ color: '#64ffda' }}>Free</strong> — Rp 0/selamanya, 3 agen, 10 query/hari</p>
            <p style={{ marginBottom: 8 }}>🦈 <strong style={{ color: '#00d4ff' }}>Pro</strong> — Rp 464.000/bulan, 8 agen, 100 query/hari, Multi-Agent</p>
            <p>🐋 <strong style={{ color: '#aa00ff' }}>Business</strong> — Rp 1.584.000/bulan, unlimited query, tim hingga 10 orang</p>
          </div>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Pembayaran diproses melalui Xendit dengan metode pembayaran yang tersedia di Indonesia.
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Langganan berlaku per bulan dan diperbarui secara otomatis.
          </p>
          <p style={{ marginBottom: 16, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Harga dapat berubah dengan pemberitahuan 30 hari sebelumnya.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>5. Pembatalan & Pengembalian Dana</h2>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Anda dapat membatalkan langganan kapan saja melalui dashboard atau menghubungi support.
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Setelah pembatalan, akses premium tetap berlaku hingga akhir periode yang sudah dibayar.
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Pengembalian dana tersedia dalam 7 hari pertama setelah pembayaran pertama, selama penggunaan tidak melebihi 20 query.
          </p>
          <p style={{ marginBottom: 16, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Untuk permintaan pengembalian dana, hubungi kami melalui email.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>6. Penggunaan yang Dilarang</h2>
          <p style={{ marginBottom: 12 }}>Anda dilarang menggunakan platform untuk:</p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#ff1744' }}>✕</span> Aktivitas ilegal atau melanggar hukum yang berlaku di Indonesia
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#ff1744' }}>✕</span> Menghasilkan konten yang mengandung kebencian, kekerasan, atau diskriminasi
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#ff1744' }}>✕</span> Menyebarkan informasi palsu, hoax, atau misinformasi
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#ff1744' }}>✕</span> Melakukan scraping, reverse engineering, atau menyalahgunakan API
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#ff1744' }}>✕</span> Membuat akun palsu atau menyamar sebagai orang/organisasi lain
          </p>
          <p style={{ marginBottom: 16, paddingLeft: 16 }}>
            <span style={{ color: '#ff1744' }}>✕</span> Mengganggu operasi platform atau mencoba mengakses data pengguna lain
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>7. Konten dan Kepemilikan</h2>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Hasil output dari agen AI adalah milik Anda dan dapat digunakan untuk keperluan bisnis.
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Platform The Blue Shark, termasuk kode, desain, dan konten, adalah milik kami dan dilindungi hak cipta.
          </p>
          <p style={{ marginBottom: 16, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Anda tidak boleh menyalin, mendistribusikan, atau menjual kembali output secara massal tanpa izin.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>8. Batasan Tanggung Jawab</h2>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Output AI bersifat informatif dan tidak menggantikan saran profesional (hukum, keuangan, medis).
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Kami tidak menjamin keakuratan 100% dari respons agen AI.
          </p>
          <p style={{ marginBottom: 8, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Kami tidak bertanggung jawab atas kerugian bisnis yang timbul dari penggunaan output platform.
          </p>
          <p style={{ marginBottom: 16, paddingLeft: 16 }}>
            <span style={{ color: '#00d4ff' }}>▸</span> Layanan disediakan "sebagaimana adanya" tanpa jaminan tertentu.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>9. Ketersediaan Layanan</h2>
          <p style={{ marginBottom: 16 }}>
            Kami berupaya menyediakan layanan 24/7, namun tidak menjamin ketersediaan tanpa gangguan. Kami dapat melakukan pemeliharaan terjadwal yang dapat menyebabkan downtime sementara. Kami akan memberitahukan sebelumnya untuk pemeliharaan yang direncanakan.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>10. Perubahan Ketentuan</h2>
          <p style={{ marginBottom: 16 }}>
            Kami berhak memperbarui Syarat & Ketentuan ini kapan saja. Perubahan material akan diberitahukan melalui email atau notifikasi platform minimal 14 hari sebelum berlaku. Penggunaan berkelanjutan setelah perubahan berlaku dianggap sebagai persetujuan Anda.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>11. Hukum yang Berlaku</h2>
          <p style={{ marginBottom: 16 }}>
            Syarat & Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. Setiap perselisihan yang timbul akan diselesaikan melalui musyawarah terlebih dahulu, dan jika tidak tercapai kesepakatan, melalui Pengadilan Negeri yang berwenang di Indonesia.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e8f0', marginTop: 32, marginBottom: 12 }}>12. Hubungi Kami</h2>
          <p style={{ marginBottom: 16 }}>
            Jika Anda memiliki pertanyaan tentang Syarat & Ketentuan ini, hubungi kami di:
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
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12 }}>
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 12 }}>Kebijakan Privasi</a>
          <a href="/terms" style={{ color: '#00d4ff', textDecoration: 'none', fontSize: 12 }}>Syarat & Ketentuan</a>
        </div>
        <p style={{
          fontSize: 11, color: 'rgba(255,255,255,0.2)',
          fontFamily: "'JetBrains Mono', monospace",
        }}>© 2026 The Blue Shark — AI Multi-Agent Platform</p>
      </div>
    </div>
  );
}
