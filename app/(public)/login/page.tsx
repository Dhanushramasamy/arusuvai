'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import { useTranslation } from '@/i18n';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(data.data.redirect);
        router.refresh();
      } else {
        setError(data.error ?? t('auth.error'));
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1E4020 0%, #2C5E2E 40%, #1A3820 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 320, height: 320, borderRadius: '50%',
        background: 'rgba(245,166,35,0.08)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -120, left: -80,
        width: 400, height: 400, borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
        pointerEvents: 'none',
      }} />

      {/* Login card */}
      <div
        style={{
          background: 'white',
          borderRadius: 28,
          padding: '40px 36px',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 32px 64px rgba(0,0,0,0.28)',
          animation: 'slideUp 0.4s ease',
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Logo size="lg" />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{t('auth.username')}</label>
            <div style={{ position: 'relative' }}>
              <span style={iconStyle}>👤</span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('auth.usernamePlaceholder')}
                required
                autoComplete="username"
                style={{ ...inputStyle, paddingLeft: 40 }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>{t('auth.password')}</label>
            <div style={{ position: 'relative' }}>
              <span style={iconStyle}>🔒</span>
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{ ...inputStyle, paddingLeft: 40, paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 14, color: '#8FA48F',
                  padding: 4,
                }}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: '#DC2626',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: loading
                ? '#8FA48F'
                : 'linear-gradient(135deg, #2C5E2E, #1E4020)',
              color: 'white',
              border: 'none',
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
              letterSpacing: '0.02em',
            }}
          >
            {loading ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 0.7s linear infinite' }}>⟳</span>
                Signing in…
              </>
            ) : (
              <>{t('auth.signIn')} →</>
            )}
          </button>
        </form>

        {/* Footer note */}
        <p style={{
          textAlign: 'center',
          marginTop: 24,
          fontSize: 11,
          color: '#8FA48F',
          fontWeight: 500,
        }}>
          Contact admin if you&apos;ve forgotten your credentials
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#5C6E5C',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid #E2E8E2',
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 600,
  color: '#1A2E1A',
  background: '#F7F8F5',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.15s ease',
};

const iconStyle: React.CSSProperties = {
  position: 'absolute',
  left: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  fontSize: 16,
  pointerEvents: 'none',
};
