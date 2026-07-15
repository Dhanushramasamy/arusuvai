'use client';

import React, { useState } from 'react';

interface MenuDayCardProps {
  day: string;
  items: string[];
  menuType: 'veg' | 'non_veg' | 'premium_non_veg';
  mealType?: 'Lunch' | 'Dinner';
  isVegOverride?: boolean;
}

const DAY_THEMES: Record<string, { bg: string; border: string; accent: string; shadow: string }> = {
  Monday:    { bg: 'linear-gradient(135deg, #F8FAF8 0%, #FFFFFF 100%)', border: '#E8EFE8', accent: '#2C5E2E', shadow: 'rgba(44,94,46,0.12)' },
  Tuesday:   { bg: 'linear-gradient(135deg, #FFFAF5 0%, #FFFFFF 100%)', border: '#F5E6D3', accent: '#B45309', shadow: 'rgba(180,83,9,0.12)' },
  Wednesday: { bg: 'linear-gradient(135deg, #F8FAF8 0%, #FFFFFF 100%)', border: '#E8EFE8', accent: '#2C5E2E', shadow: 'rgba(44,94,46,0.12)' },
  Thursday:  { bg: 'linear-gradient(135deg, #FFF9F5 0%, #FFFFFF 100%)', border: '#F5E1D3', accent: '#9A3412', shadow: 'rgba(154,52,18,0.12)' },
  Friday:    { bg: 'linear-gradient(135deg, #F8FAF8 0%, #FFFFFF 100%)', border: '#E8EFE8', accent: '#2C5E2E', shadow: 'rgba(44,94,46,0.12)' },
  Saturday:  { bg: 'linear-gradient(135deg, #F9F8FC 0%, #FFFFFF 100%)', border: '#E4DEF2', accent: '#6D28D9', shadow: 'rgba(109,40,217,0.12)' },
  Sunday:    { bg: 'linear-gradient(135deg, #FCF8F8 0%, #FFFFFF 100%)', border: '#F2DEDE', accent: '#B91C1C', shadow: 'rgba(185,28,28,0.12)' },
};

export default function MenuDayCard({ day, items, menuType, mealType, isVegOverride = false }: MenuDayCardProps) {
  const [hovered, setHovered] = useState(false);
  const theme = DAY_THEMES[day] || DAY_THEMES.Monday;
  const isVeg = menuType === 'veg' || isVegOverride;

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: theme.bg,
        border: `1.5px solid ${hovered ? theme.accent + '50' : theme.border}`,
        borderRadius: 24,
        padding: '32px 28px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Quicksand, sans-serif',
        boxShadow: hovered ? `0 16px 40px ${theme.shadow}` : '0 4px 14px rgba(0,0,0,0.03)',
        transform: hovered ? 'translateY(-4px) scale(1.01)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      {/* Background large text watermark */}
      <div style={{
        position: 'absolute',
        top: -15,
        right: -15,
        fontSize: 120,
        fontWeight: 900,
        color: theme.accent,
        opacity: 0.03,
        zIndex: -1,
        userSelect: 'none',
        letterSpacing: '-0.05em',
        textTransform: 'uppercase',
        lineHeight: 1,
        pointerEvents: 'none',
      }}>
        {day.substring(0, 3)}
      </div>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 28,
      }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#1A2E1A', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {day}
          </div>
          <div style={{ fontSize: 11, color: '#8FA48F', fontWeight: 800, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {mealType || 'Lunch'} Menu
          </div>
        </div>
        <div style={{
          fontSize: 10,
          fontWeight: 800,
          color: theme.accent,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          background: theme.accent + '15',
          padding: '6px 14px',
          borderRadius: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: `inset 0 0 0 1px ${theme.accent}30`,
        }}>
          {isVeg ? '🌿 VEG' : '🍗 NON-VEG'}
        </div>
      </div>

      {/* Items as elegant pills */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        {items.map((item, i) => (
          <div key={i} style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: '#3A4E3A',
            background: '#FFFFFF',
            border: `1.5px solid ${theme.border}`,
            padding: '8px 16px',
            borderRadius: 14,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'border-color 0.2s',
          }}>
            <span style={{ color: theme.accent, fontSize: 16, lineHeight: 1 }}>•</span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
