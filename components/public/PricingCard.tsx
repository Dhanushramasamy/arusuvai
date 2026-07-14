'use client';

import React from 'react';

interface SubscriptionPlan {
  id: number;
  plan_name: string;
  plan_type: string;
  price: number;
  duration_days: number;
  features: string[];
  whatsapp_number: string;
}

interface PricingCardProps {
  plan: SubscriptionPlan;
  featured?: boolean;
}

const PLAN_META: Record<string, { icon: string; color: string; bg: string; border: string; label: string }> = {
  veg:     { icon: '🌿', color: '#2C5E2E', bg: '#EBF5EB', border: '#C8D8C8', label: 'Vegetarian' },
  non_veg: { icon: '🍗', color: '#B45309', bg: '#FEF3DC', border: '#F0D090', label: 'Non-Vegetarian' },
  dinner:  { icon: '🍲', color: '#6D28D9', bg: '#F0EBFF', border: '#C4B5FD', label: 'Dinner' },
};

export default function PricingCard({ plan, featured = false }: PricingCardProps) {
  const meta = PLAN_META[plan.plan_type] || PLAN_META.veg;

  const whatsappMsg = encodeURIComponent(
    `Hi! I'm interested in the ${plan.plan_name} subscription (₹${Number(plan.price).toLocaleString('en-IN')} / ${plan.duration_days} days). Please let me know the next steps.`
  );
  const whatsappUrl = `https://wa.me/${plan.whatsapp_number}?text=${whatsappMsg}`;

  return (
    <div style={{
      background: '#FFFFFF',
      border: featured ? `2px solid ${meta.color}` : '1px solid #E8E2D5',
      borderRadius: 20,
      padding: featured ? '40px 28px' : '32px 24px',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      boxShadow: featured ? `0 16px 48px rgba(0,0,0,0.1)` : '0 2px 12px rgba(0,0,0,0.04)',
      fontFamily: 'Quicksand, sans-serif',
      transform: featured ? 'scale(1.04)' : 'scale(1)',
    }}>
      {featured && (
        <div style={{
          position: 'absolute',
          top: -14,
          left: '50%',
          transform: 'translateX(-50%)',
          background: meta.color,
          color: '#fff',
          fontSize: 10,
          fontWeight: 800,
          padding: '5px 18px',
          borderRadius: 100,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          whiteSpace: 'nowrap',
        }}>
          ✦ Most Popular
        </div>
      )}

      {/* Icon badge */}
      <div style={{
        width: 64, height: 64,
        borderRadius: '50%',
        background: meta.bg,
        border: `1.5px solid ${meta.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26, marginBottom: 18,
      }}>
        {meta.icon}
      </div>

      <div style={{
        fontSize: 9.5, fontWeight: 800, color: meta.color,
        textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6,
      }}>
        {meta.label}
      </div>

      <h3 style={{ fontSize: 21, fontWeight: 800, color: '#1A2E1A', margin: '0 0 6px' }}>
        {plan.plan_name}
      </h3>

      <p style={{ fontSize: 12, color: '#8FA48F', margin: '0 0 20px', fontWeight: 500 }}>
        {plan.plan_type === 'veg' && 'Pure Veg · Wholesome & Healthy'}
        {plan.plan_type === 'non_veg' && 'Tasty & Satisfying Non-Veg Meals'}
        {plan.plan_type === 'dinner' && 'Light, Healthy & Homely Dinners'}
      </p>

      {/* Price */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1, color: meta.color }}>
          <span style={{ fontSize: 20, fontWeight: 700 }}>₹</span>
          <span style={{ fontSize: 50, fontWeight: 900, lineHeight: 1 }}>{plan.price}</span>
        </div>
        <div style={{ fontSize: 11, color: '#8FA48F', fontWeight: 600, marginTop: 3 }}>
          / {plan.duration_days} Days
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '100%', height: 1, background: '#F0EDE5', marginBottom: 20 }} />

      {/* Features */}
      <ul style={{
        listStyle: 'none', padding: 0, margin: '0 0 24px',
        display: 'flex', flexDirection: 'column', gap: 10,
        width: '100%', alignItems: 'flex-start',
      }}>
        {plan.features.map((feature, i) => (
          <li key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 13, color: '#2E3E2E', fontWeight: 600, textAlign: 'left',
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: '50%',
              background: meta.bg,
              border: `1px solid ${meta.border}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: meta.color, fontSize: 9, fontWeight: 900, flexShrink: 0,
            }}>✓</span>
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block', width: '100%', padding: '13px',
          background: featured ? meta.color : '#fff',
          color: featured ? '#fff' : meta.color,
          border: `1.5px solid ${meta.color}`,
          textDecoration: 'none', borderRadius: 10,
          fontSize: 13.5, fontWeight: 800, textAlign: 'center',
          boxSizing: 'border-box',
          transition: 'background 0.15s, color 0.15s',
        }}
        onMouseEnter={e => {
          if (!featured) {
            e.currentTarget.style.background = meta.bg;
          } else {
            e.currentTarget.style.opacity = '0.9';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = featured ? meta.color : '#fff';
          e.currentTarget.style.opacity = '1';
        }}
      >
        Choose Plan →
      </a>
    </div>
  );
}
