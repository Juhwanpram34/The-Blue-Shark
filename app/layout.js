import './globals.css';

export const metadata = {
  title: 'The Blue Shark — AI Multi-Agent Platform',
  description: 'Platform AI Multi-Agent untuk riset pasar, content creation, analisis sentimen, optimasi pemasaran, dan lainnya.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
