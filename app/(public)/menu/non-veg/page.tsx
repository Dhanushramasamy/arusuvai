import React from 'react';
import pool from '@/lib/db';
import MenuDayCard from '@/components/public/MenuDayCard';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Non-Vegetarian Weekly Menu | Arusuvai Home Kitchen',
  description: 'See this week\'s non-vegetarian meal menu. Fresh, home-cooked South Indian meals delivered daily.',
};

export const revalidate = 60;

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

async function getNonVegMenu() {
  try {
    const result = await pool.query(
      `SELECT day_of_week, meal_type, items FROM weekly_menu
       WHERE menu_type = 'non_veg'
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

export default async function NonVegMenuPage() {
  const menuRows = await getNonVegMenu();
  const byDay: Record<string, { lunch?: string[]; dinner?: string[] }> = {};
  for (const row of menuRows) {
    if (!byDay[row.day_of_week]) byDay[row.day_of_week] = {};
    if (row.meal_type === 'Lunch')  byDay[row.day_of_week].lunch  = row.items;
    if (row.meal_type === 'Dinner') byDay[row.day_of_week].dinner = row.items;
  }
  const fallback = ['Rice', 'Chicken Curry', 'Poriyal', 'Rasam', 'Buttermilk', 'Appalam'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap');
        .nvp { font-family: 'Quicksand', sans-serif; background: #FFFDF7; color: #1C2B1C; }
        .nvp * { box-sizing: border-box; }

        .nvp-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 50vh;
          align-items: stretch;
        }
        .nvp-hero-left {
          display: flex; flex-direction: column; justify-content: center;
          padding: 72px 56px 72px 80px;
          background: #FFFDF7;
          order: 2;
        }
        .nvp-hero-right {
          position: relative; overflow: hidden;
          order: 1;
        }
        .nvp-hero-right img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .nvp-hero-right::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(to left, rgba(255,253,247,0.3) 0%, transparent 50%);
        }
        .nvp-kicker {
          font-size: 10px; font-weight: 800; letter-spacing: 0.18em;
          text-transform: uppercase; color: #B45309;
          margin-bottom: 18px;
          display: flex; align-items: center; gap: 8px;
        }
        .nvp-kicker::before {
          content: ''; width: 20px; height: 2px; background: #E8A020; border-radius: 2px;
        }
        .nvp-h1 {
          font-size: clamp(34px, 5vw, 58px);
          font-weight: 800; color: #1A2E1A;
          line-height: 1.1; letter-spacing: -0.025em; margin-bottom: 16px;
        }
        .nvp-sub {
          font-size: 14px; color: #5C6E5C; line-height: 1.7; font-weight: 500; max-width: 380px; margin-bottom: 24px;
        }
        .nvp-pills {
          display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px;
        }
        .nvp-pill {
          font-size: 11px; font-weight: 700; padding: 6px 13px;
          border-radius: 100px; background: #FEF3DC; color: #B45309;
          border: 1px solid #F0D090;
        }
        .nvp-divider { height: 1px; background: #E8E2D5; }

        .nvp-section { padding: 72px 80px; }
        .nvp-inner { max-width: 1160px; margin: 0 auto; }
        .nvp-sec-label {
          font-size: 10px; font-weight: 800; letter-spacing: 0.15em;
          text-transform: uppercase; color: #B45309;
          margin-bottom: 28px;
          display: flex; align-items: center; gap: 8px;
        }
        .nvp-sec-label::after {
          content: ''; flex: 1; height: 1px; background: #E8E2D5;
        }
        .nvp-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 18px; margin-bottom: 48px;
        }

        .nvp-cta {
          background: #FEF3DC;
          border-top: 1px solid #F0D090;
          padding: 64px 80px;
          text-align: center;
        }
        .nvp-cta-inner { max-width: 520px; margin: 0 auto; }

        @media (max-width: 860px) {
          .nvp-hero { grid-template-columns: 1fr; min-height: auto; }
          .nvp-hero-left { padding: 48px 24px 36px; order: 1; }
          .nvp-hero-right { min-height: 240px; max-height: 320px; order: 2; aspect-ratio: 16/9; }
          .nvp-section, .nvp-cta { padding: 52px 24px; }
          .nvp-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .nvp-hero-right { min-height: 180px; max-height: 240px; }
          .nvp-h1 { font-size: 32px; }
          .nvp-pills { display: none; }
        }
      `}</style>

      <div className="nvp">

        <section className="nvp-hero">
          <div className="nvp-hero-right">
            <img src="/images/Non-Vegetarian Weekly Menu Page Header.png" alt="Non-vegetarian chicken curry" />
          </div>
          <div className="nvp-hero-left">
            <div className="nvp-kicker">Non-Vegetarian Menu</div>
            <h1 className="nvp-h1">Weekly Non-Veg<br />Menu</h1>
            <p className="nvp-sub">
              Rich, hearty home-cooked non-veg meals. Fresh meat, bold spices, pure comfort — delivered Monday to Saturday.
            </p>
            <div className="nvp-pills">
              {['🏠 Home Cooked', '🍗 Fresh Daily', '♻️ Steel Tiffin', '📅 Mon – Sat'].map(p => (
                <span key={p} className="nvp-pill">{p}</span>
              ))}
            </div>
          </div>
        </section>

        <div className="nvp-divider" />

        <section className="nvp-section">
          <div className="nvp-inner">
            <div className="nvp-sec-label">🍗 Lunch — This Week</div>
            <div className="nvp-grid">
              {DAYS.map(day => (
                <MenuDayCard key={day} day={day} items={byDay[day]?.lunch || fallback} menuType="non_veg" mealType="Lunch" />
              ))}
            </div>

            {Object.values(byDay).some(d => d.dinner) && (
              <>
                <div className="nvp-divider" style={{ margin: '0 0 40px' }} />
                <div className="nvp-sec-label">🍲 Dinner — This Week</div>
                <div className="nvp-grid">
                  {DAYS.filter(day => byDay[day]?.dinner).map(day => (
                    <MenuDayCard key={day} day={day} items={byDay[day].dinner!} menuType="non_veg" mealType="Dinner" />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <div className="nvp-divider" />

        <section className="nvp-cta">
          <div className="nvp-cta-inner">
            <div style={{ fontSize: 36, marginBottom: 12 }}>🍗</div>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800, color: '#1A2E1A', marginBottom: 10, letterSpacing: '-0.02em' }}>
              Ready to Subscribe?
            </h2>
            <p style={{ fontSize: 14, color: '#5C6E5C', marginBottom: 24, lineHeight: 1.7 }}>
              Get freshly prepared non-vegetarian meals delivered to your doorstep Monday to Saturday.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/subscription" style={{
                padding: '12px 26px', background: '#B45309', color: '#fff',
                borderRadius: 10, fontSize: 13.5, fontWeight: 800, textDecoration: 'none',
              }}>View Subscription Plans →</Link>
              <Link href="/menu/veg" style={{
                padding: '11px 22px', background: '#fff', color: '#2C5E2E',
                border: '1.5px solid #C8D8C8',
                borderRadius: 10, fontSize: 13.5, fontWeight: 700, textDecoration: 'none',
              }}>🌿 See Veg Menu</Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
