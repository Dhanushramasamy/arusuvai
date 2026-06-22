'use client';

import React from 'react';
import { useTranslation } from '@/i18n';

export default function LanguageSwitcher() {
  const { locale, toggleLocale } = useTranslation();

  return (
    <button
      onClick={toggleLocale}
      title="Switch language"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 50,
        background: 'white',
        border: '1.5px solid #E2E8E2',
        borderRadius: 24,
        padding: '8px 16px',
        fontSize: 12,
        fontWeight: 700,
        color: '#5C6E5C',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
    >
      <span style={{ fontSize: 14 }}>🌐</span>
      {locale === 'en' ? 'தமிழ்' : 'English'}
    </button>
  );
}
