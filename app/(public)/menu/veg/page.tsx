import React from 'react';
import pool from '@/lib/db';
import MenuDayCard from '@/components/public/MenuDayCard';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Vegetarian Weekly Menu | Arusuvai Home Kitchen',
  description: 'See this week\'s vegetarian meal menu. Fresh, home-cooked South Indian meals delivered daily.',
};

export const revalidate = 60;

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

async function getVegMenu() {
  try {
    const result = await pool.query(
      `SELECT day_of_week, meal_type, items FROM weekly_menu
       WHERE menu_type = 'veg'
       ORDER BY CASE day_of_week
         WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
         WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 ELSE 7 END,
         CASE meal_type WHEN 'Lunch' THEN 1 ELSE 2 END`
    );
    return result.rows;
  } catch {
    return [];
  }
}

export default async function VegMenuPage() {
  const menuRows = await getVegMenu();
  const byDay: Record<string, { lunch?: string[]; dinner?: string[] }> = {};
  for (const row of menuRows) {
    if (!byDay[row.day_of_week]) byDay[row.day_of_week] = {};
    if (row.meal_type === 'Lunch')  byDay[row.day_of_week].lunch  = row.items;
    if (row.meal_type === 'Dinner') byDay[row.day_of_week].dinner = row.items;
  }
  const fallback = ['Rice', 'Sambar', 'Poriyal', 'Rasam', 'Buttermilk', 'Appalam'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap');
        .vp { font-family: 'Quicksand', sans-serif; background: #FFFDF7; color: #1C2B1C; }
        .vp * { box-sizing: border-box; }

        .vp-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 50vh;
          align-items: stretch;
        }
        .vp-hero-left {
          display: flex; flex-direction: column; justify-content: center;
          padding: 72px 56px 72px 80px;
          background: #FFFDF7;
        }
        .vp-hero-right {
          position: relative; overflow: hidden;
        }
        .vp-hero-right img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .vp-hero-right::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(to right, rgba(255,253,247,0.3) 0%, transparent 50%);
        }
        .vp-kicker {
          font-size: 10px; font-weight: 800; letter-spacing: 0.18em;
          text-transform: uppercase; color: #2C5E2E;
          margin-bottom: 18px;
          display: flex; align-items: center; gap: 8px;
        }
        .vp-kicker::before {
          content: ''; width: 20px; height: 2px; background: #E8A020; border-radius: 2px;
        }
        .vp-h1 {
          font-size: clamp(34px, 5vw, 58px);
          font-weight: 800; color: #1A2E1A;
          line-height: 1.1; letter-spacing: -0.025em; margin-bottom: 16px;
        }
        .vp-sub {
          font-size: 14px; color: #5C6E5C; line-height: 1.7; font-weight: 500; max-width: 380px; margin-bottom: 24px;
        }
        .vp-pills {
          display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px;
        }
        .vp-pill {
          font-size: 11px; font-weight: 700; padding: 6px 13px;
          border-radius: 100px; background: #EBF5EB; color: #2C5E2E;
          border: 1px solid #C8D8C8;
        }
        .vp-divider { height: 1px; background: #E8E2D5; }

        .vp-section { padding: 72px 80px; }
        .vp-section-alt { background: #F7F4EE; }
        .vp-inner { max-width: 1160px; margin: 0 auto; }
        .vp-sec-label {
          font-size: 10px; font-weight: 800; letter-spacing: 0.15em;
          text-transform: uppercase; color: #2C5E2E;
          margin-bottom: 28px;
          display: flex; align-items: center; gap: 8px;
        }
        .vp-sec-label::after {
          content: ''; flex: 1; height: 1px; background: #E8E2D5;
        }
        .vp-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 18px; margin-bottom: 48px;
        }

        .vp-cta {
          background: #EBF5EB;
          border-top: 1px solid #C8D8C8;
          padding: 64px 80px;
          text-align: center;
        }
        .vp-cta-inner { max-width: 520px; margin: 0 auto; }

        @media (max-width: 860px) {
          .vp-hero { grid-template-columns: 1fr; min-height: auto; }
          .vp-hero-left { padding: 48px 24px 36px; order: 2; }
          .vp-hero-right { min-height: 250px; max-height: 380px; order: 1; }
          .vp-section, .vp-cta { padding: 52px 24px; }
          .vp-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .vp-hero-right { min-height: 200px; }
          .vp-h1 { font-size: 32px; }
          .vp-pills { display: none; }
        }
      `}</style>

      <div className="vp">

        {/* Hero */}
        <section className="vp-hero">
          <div className="vp-hero-left">
            <div className="vp-kicker">Vegetarian Menu</div>
            <h1 className="vp-h1">Weekly Veg<br />Menu</h1>
            <p className="vp-sub">
              Wholesome South Indian vegetarian meals prepared fresh every morning. Delivered to your doorstep, Monday to Saturday.
            </p>
            <div className="vp-pills">
              {['🏠 Home Cooked', '🌿 No Preservatives', '♻️ Steel Tiffin', '📅 Mon – Sat'].map(p => (
                <span key={p} className="vp-pill">{p}</span>
              ))}
            </div>
          </div>
          <div className="vp-hero-right">
            <img src="/images/Vegetarian Weekly Menu Page Header.png" alt="Vegetarian South Indian thali" />
          </div>
        </section>

        <div className="vp-divider" />

        {/* Lunch menu */}
        <section className="vp-section">
          <div className="vp-inner">
            <div className="vp-sec-label">🌿 Lunch — This Week</div>
            <div className="vp-grid">
              {DAYS.map(day => (
                <MenuDayCard key={day} day={day} items={byDay[day]?.lunch || fallback} menuType="veg" mealType="Lunch" />
              ))}
            </div>

            {Object.values(byDay).some(d => d.dinner) && (
              <>
                <div className="vp-divider" style={{ margin: '0 0 40px' }} />
                <div className="vp-sec-label">🍲 Dinner — This Week</div>
                <div className="vp-grid">
                  {DAYS.filter(day => byDay[day]?.dinner).map(day => (
                    <MenuDayCard key={day} day={day} items={byDay[day].dinner!} menuType="veg" mealType="Dinner" />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <div className="vp-divider" />

        {/* CTA */}
        <section className="vp-cta">
          <div className="vp-cta-inner">
            <div style={{ fontSize: 36, marginBottom: 12 }}>🍛</div>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800, color: '#1A2E1A', marginBottom: 10, letterSpacing: '-0.02em' }}>
              Ready to Subscribe?
            </h2>
            <p style={{ fontSize: 14, color: '#5C6E5C', marginBottom: 24, lineHeight: 1.7 }}>
              Get freshly prepared vegetarian meals at your doorstep Monday to Saturday.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/subscription" style={{
                padding: '12px 26px', background: '#2C5E2E', color: '#fff',
                borderRadius: 10, fontSize: 13.5, fontWeight: 800, textDecoration: 'none',
              }}>View Subscription Plans →</Link>
              <Link href="/menu/non-veg" style={{
                padding: '11px 22px', background: '#fff', color: '#B45309',
                border: '1.5px solid #F0D090',
                borderRadius: 10, fontSize: 13.5, fontWeight: 700, textDecoration: 'none',
              }}>🍗 See Non-Veg Menu</Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
