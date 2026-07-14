import React from 'react';
import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer style={{
      background: 'linear-gradient(150deg, #0F2210 0%, #1A3A1C 50%, #2C5E2E 100%)',
      color: '#fff',
      padding: '64px 24px 36px',
      fontFamily: 'Quicksand, sans-serif',
    }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 48,
          marginBottom: 56,
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 20 }}>
              <div style={{
                width: 46, height: 46,
                borderRadius: 12,
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}>
                <img src="/logo.jpg" alt="Arusuvai Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'Quicksand, sans-serif', fontSize: 21, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>Arusuvai</div>
                <div style={{ fontFamily: 'Quicksand, sans-serif', fontSize: 8.5, fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Home Kitchen</div>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 22, maxWidth: 240 }}>
              Wholesome. Homemade. Delivered.<br />
              Freshly prepared home-cooked meals delivered to your doorstep daily, Monday to Saturday.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['🏠 Homemade', '🌿 Natural', '❤️ Hygienic'].map((t) => (
                <span key={t} style={{ fontSize: 10, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', padding: '5px 10px', borderRadius: 100, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 800, color: '#F5A623', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20, margin: '0 0 20px' }}>
              Quick Links
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[['/', 'Home'], ['/#about', 'About Us'], ['/menu/veg', 'Veg Menu'], ['/menu/non-veg', 'Non-Veg Menu'], ['/subscription', 'Subscription Plans'], ['/#how-it-works', 'How It Works']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} style={{
                    fontSize: 13.5, color: 'rgba(255,255,255,0.65)', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'color 0.15s',
                    fontWeight: 500,
                  }}>
                    <span style={{ color: '#F5A623', fontSize: 11, fontWeight: 900 }}>›</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Menu */}
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 800, color: '#F5A623', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20, margin: '0 0 20px' }}>
              Our Menu
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { href: '/menu/veg', label: '🌿 Veg Lunch & Dinner', bg: 'rgba(44,94,46,0.4)' },
                { href: '/menu/non-veg', label: '🍗 Non-Veg Lunch & Dinner', bg: 'rgba(180,83,9,0.4)' },
              ].map(({ href, label, bg }) => (
                <Link key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px',
                  background: bg,
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#fff', textDecoration: 'none',
                  fontSize: 13.5, fontWeight: 600,
                  transition: 'background 0.15s',
                }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 800, color: '#F5A623', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20, margin: '0 0 20px' }}>
              Get In Touch
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {[
                ['📞', 'Call or WhatsApp us'],
                ['⏰', 'Weekday Delivery'],
                ['📅', 'Monday – Saturday'],
                ['♻️', 'Eco-friendly steel containers'],
              ].map(([icon, text]) => (
                <div key={text as string} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
                  <span style={{ fontSize: 16 }}>{icon}</span>{text}
                </div>
              ))}
            </div>
            <Link href="/subscription" style={{
              display: 'block',
              padding: '12px 18px',
              background: '#F5A623',
              color: '#fff', textDecoration: 'none',
              borderRadius: 12, fontSize: 13.5, fontWeight: 800,
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(245,166,35,0.3)',
              transition: 'opacity 0.15s',
            }}>
              Subscribe Now →
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 500 }}>
            © {new Date().getFullYear()} Arusuvai Home Kitchen. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['🍛 Homemade', '🌿 No Preservatives', '⏰ On Time'].map((t) => (
              <span key={t} style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '5px 12px', borderRadius: 100, fontWeight: 600 }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
