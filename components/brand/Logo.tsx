import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
}

const sizes = {
  sm: { icon: 36, iconFont: 16, titleFont: 16, tagFont: 9 },
  md: { icon: 48, iconFont: 22, titleFont: 24, tagFont: 10 },
  lg: { icon: 64, iconFont: 28, titleFont: 32, tagFont: 11 },
};

export default function Logo({ size = 'md', variant = 'default' }: LogoProps) {
  const s = sizes[size];
  const titleColor = variant === 'white' ? 'white' : 'var(--color-primary)';
  const tagColor = 'var(--color-accent)';
  const iconBg = variant === 'white' ? 'rgba(255,255,255,0.15)' : 'var(--color-primary)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <img
        src="/logo.jpg"
        alt="Arusuvai Logo"
        style={{
          width: s.icon,
          height: s.icon,
          borderRadius: s.icon * 0.25,
          objectFit: 'cover',
          boxShadow: '0 4px 12px rgba(44,94,46,0.25)',
        }}
      />
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'Georgia, Cambria, serif',
            fontSize: s.titleFont,
            fontWeight: 900,
            color: titleColor,
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          Arusuvai
        </div>
        <div
          style={{
            fontSize: s.tagFont,
            fontWeight: 700,
            color: tagColor,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginTop: 4,
          }}
        >
          ✦ THE HOME KITCHEN ✦
        </div>
      </div>
    </div>
  );
}

export function LogoInline({ variant = 'default' }: { variant?: 'default' | 'white' }) {
  const titleColor = variant === 'white' ? 'white' : 'var(--color-primary)';
  const iconBg = variant === 'white' ? 'rgba(255,255,255,0.15)' : 'var(--color-primary)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img
        src="/logo.jpg"
        alt="Arusuvai Logo"
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
      <div>
        <div
          style={{
            fontFamily: 'Georgia, Cambria, serif',
            fontSize: 18,
            fontWeight: 900,
            color: titleColor,
            lineHeight: 1,
          }}
        >
          Arusuvai
        </div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: 'var(--color-accent)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginTop: 2,
          }}
        >
          THE HOME KITCHEN
        </div>
      </div>
    </div>
  );
}
