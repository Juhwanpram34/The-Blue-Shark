import './globals.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'The Blue Shark — AI Multi-Agent Platform',
  description: 'Platform AI Multi-Agent untuk riset pasar, content creation, analisis sentimen, optimasi pemasaran, dan lainnya.',
  manifest: '/manifest.json',
  themeColor: '#00d4ff',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Blue Shark',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
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
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        {children}
        <ServiceWorkerRegistration />
        <Analytics />
      </body>
    </html>
  );
}
