import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/i18n';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export const metadata: Metadata = {
  title: 'Arusuvai — The Home Kitchen',
  description: 'Tiffin subscription management system. Manage daily Lunch & Dinner deliveries, subscriptions, and payments.',
  keywords: 'tiffin, home kitchen, meal delivery, subscription, arusuvai',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%232C5E2E'/><text y='.9em' font-size='80' x='10'>✦</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <I18nProvider>
          {children}
          <LanguageSwitcher />
        </I18nProvider>
      </body>
    </html>
  );
}
