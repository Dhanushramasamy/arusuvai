'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/i18n';

interface ClientLayoutInnerProps {
  name: string;
  children: React.ReactNode;
}

const tabs = [
  { href: '/client',         label: 'nav.home',    icon: '🏠' },
  { href: '/client/skip',    label: 'nav.skip',    icon: '⏭' },
  { href: '/client/history', label: 'nav.history', icon: '📋' },
];

export default function ClientLayoutInner({ name, children }: ClientLayoutInnerProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid var(--color-border)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40,
            background: 'var(--color-primary)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {greeting}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text)', fontFamily: "'Playfair Display', Georgia, serif" }}>
              {name}
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            padding: '7px 14px',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
          }}
        >
          {t('auth.signOut')}
        </button>
      </header>

      {/* Tab nav */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        padding: '6px 8px',
        gap: 4,
      }}>
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              style={{
                flex: 1,
                padding: '10px 8px',
                background: active ? 'var(--color-primary)' : 'transparent',
                color: active ? 'white' : 'var(--color-text-muted)',
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: active ? 700 : 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.icon} {t(tab.label)}
            </button>
          );
        })}
      </nav>

      {/* Page content */}
      <main style={{ flex: 1, maxWidth: 520, width: '100%', margin: '0 auto', padding: '20px 16px' }}>
        {children}
      </main>
    </div>
  );
}
