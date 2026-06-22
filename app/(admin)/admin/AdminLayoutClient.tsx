'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/i18n';

const adminTabs = [
  { href: '/admin',                   label: 'nav.today',    icon: '📦' },
  { href: '/admin/clients',           label: 'nav.clients',  icon: '👥' },
  { href: '/admin/delivery-persons',  label: 'nav.delivery', icon: '🛵' },
];

export default function AdminLayoutInner({ name, children }: { name: string; children: React.ReactNode }) {
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid var(--color-border)',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 20,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, background: 'var(--color-primary)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin</div>
            <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--color-primary)', fontFamily: "'Playfair Display', Georgia, serif" }}>Arusuvai</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>{name}</span>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              background: 'none', border: '1px solid var(--color-border)',
              borderRadius: 8, padding: '6px 12px',
              fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)',
              cursor: 'pointer',
            }}
          >
            {t('auth.signOut')}
          </button>
        </div>
      </header>

      {/* Nav tabs — horizontal scroll */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', padding: '6px 8px', gap: 4,
        overflowX: 'auto',
        position: 'sticky', top: 62, zIndex: 10,
      }}>
        {adminTabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              style={{
                padding: '9px 14px',
                background: active ? 'var(--color-primary)' : 'transparent',
                color: active ? 'white' : 'var(--color-text-muted)',
                border: 'none', borderRadius: 10,
                fontSize: 12, fontWeight: active ? 700 : 600,
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.icon} {t(tab.label)}
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <main style={{ flex: 1, maxWidth: 960, width: '100%', margin: '0 auto', padding: '20px 16px' }}>
        {children}
      </main>
    </div>
  );
}
