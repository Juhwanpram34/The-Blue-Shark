import './globals.css';

export const metadata = {
  title: {
    default: 'The Blue Shark — AI Multi-Agent Platform Indonesia',
    template: '%s | The Blue Shark',
  },
  description: 'Platform AI Multi-Agent pertama di Indonesia. 8 agen AI spesialis untuk riset pasar, content creation, analisis sentimen, optimasi pemasaran, keamanan siber, dan otomatisasi bisnis. Powered by GPT-4o.',
  keywords: ['AI Indonesia', 'multi-agent AI', 'riset pasar AI', 'content creator AI', 'analisis sentimen', 'marketing AI', 'chatbot bisnis', 'GPT-4', 'SaaS Indonesia', 'The Blue Shark', 'AI platform', 'bisnis AI'],
  authors: [{ name: 'The Blue Shark', url: 'https://the-blue-shark-ars8.vercel.app' }],
  creator: 'The Blue Shark',
  publisher: 'The Blue Shark',
  metadataBase: new URL('https://the-blue-shark-ars8.vercel.app'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://the-blue-shark-ars8.vercel.app',
    siteName: 'The Blue Shark',
    title: 'The Blue Shark — AI Multi-Agent Platform Indonesia',
    description: 'Multi-Agent AI untuk dominasi pasar. Riset pasar, content creation, analisis sentimen, optimasi pemasaran, dan lebih banyak lagi.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'The Blue Shark - AI Multi-Agent Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Blue Shark — AI Multi-Agent Platform',
    description: 'Multi-Agent AI untuk dominasi pasar. Platform AI pertama di Indonesia.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  manifest: '/manifest.json',
  themeColor: '#00d4ff',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Blue Shark' },
  viewport: { width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

function ServiceWorkerRegistration() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                  console.log('🦈 Blue Shark SW registered:', registration.scope);
                })
                .catch(function(error) {
                  console.log('SW registration failed:', error);
                });
            });
          }
        `,
      }}
    />
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Blue Shark" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'The Blue Shark',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              description: 'Platform AI Multi-Agent pertama di Indonesia. 8 agen AI spesialis untuk riset pasar, content creation, analisis sentimen, dan optimasi bisnis.',
              url: 'https://the-blue-shark-ars8.vercel.app',
              offers: [
                { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free Plan' },
                { '@type': 'Offer', price: '29', priceCurrency: 'USD', name: 'Pro Plan' },
                { '@type': 'Offer', price: '99', priceCurrency: 'USD', name: 'Business Plan' },
              ],
              aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', ratingCount: '150' },
            }),
          }}
        />
      </head>
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
