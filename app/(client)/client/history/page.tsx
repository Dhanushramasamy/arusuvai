'use client';

import React, { useEffect, useState } from 'react';
import Badge from '@/components/ui/Badge';
import { useTranslation } from '@/i18n';
import type { DailyDelivery, Payment } from '@/types';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ClientHistoryPage() {
  const { t } = useTranslation();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [deliveries, setDeliveries] = useState<DailyDelivery[]>([]);
  const [skips, setSkips] = useState<any[]>([]);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/client/history?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((d) => {
        setDeliveries(d.data?.deliveries ?? []);
        setPayment(d.data?.payment ?? null);
        setSkips(d.data?.skips ?? []);
      })
      .finally(() => setLoading(false));
  }, [year, month]);

  // Build month selector pills — last 6 months
  const monthOptions: { year: number; month: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthOptions.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }

  // Merge deliveries and skips for display
  const mergedList: DailyDelivery[] = [...deliveries];

  // For any skip request that does not have a corresponding daily delivery row, add it as a placeholder
  for (const s of skips) {
    const skipDateStr = s.date.slice(0, 10);
    const hasDelivery = deliveries.some(
      (d) => d.date.slice(0, 10) === skipDateStr && d.meal_type === s.meal_type
    );
    if (!hasDelivery) {
      mergedList.push({
        id: `temp_${s.id}`,
        client_id: s.client_id,
        date: s.date,
        meal_type: s.meal_type,
        status: s.status === 'approved' ? 'skipped' : 'pending_skip',
        skip_request_id: s.id,
      } as any);
    }
  }

  // Inject pending_skip status for deliveries that have an associated pending skip
  const finalMergedList = mergedList.map((d) => {
    const skip = skips.find(
      (s) => s.date.slice(0, 10) === d.date.slice(0, 10) && s.meal_type === d.meal_type
    );
    if (d.status === 'pending' && skip && skip.status === 'pending') {
      return { ...d, status: 'pending_skip' as any };
    }
    return d;
  });

  // Sort finalMergedList by date DESC, then meal_type
  finalMergedList.sort((a, b) => {
    const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (diff !== 0) return diff;
    return a.meal_type.localeCompare(b.meal_type);
  });

  // Filter for completed/past deliveries only, excluding upcoming days and today's pending meals
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const completedList = finalMergedList.filter((d) => {
    const datePart = d.date.slice(0, 10);
    if (datePart > todayStr) return false;
    if (datePart === todayStr) {
      return ['delivered', 'not_available', 'skipped'].includes(d.status);
    }
    return true;
  });

  const delivered     = completedList.filter((d) => d.status === 'delivered').length;
  const skipped       = completedList.filter((d) => d.status === 'skipped').length;
  const notAvailable  = completedList.filter((d) => d.status === 'not_available').length;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <h1 style={{
        fontSize: 22, fontWeight: 900, color: 'var(--color-text)',
        fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 18,
      }}>
        {t('history.title')}
      </h1>

      {/* Month selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, overflowX: 'auto', paddingBottom: 4 }}>
        {monthOptions.map(({ year: y, month: m }) => {
          const active = y === year && m === month;
          return (
            <button
              key={`${y}-${m}`}
              onClick={() => { setYear(y); setMonth(m); }}
              style={{
                padding: '8px 16px',
                background: active ? 'var(--color-primary)' : 'white',
                color: active ? 'white' : 'var(--color-text-muted)',
                border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 20,
                fontSize: 12, fontWeight: active ? 700 : 600,
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {t('month.' + MONTHS[m - 1].toLowerCase())} {y}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-light)' }}>{t('common.loading')}</div>
      ) : (
        <>
          {/* Summary card */}
          <div style={{
            background: 'white', border: '1.5px solid var(--color-border)',
            borderRadius: 20, padding: 18, marginBottom: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                  {t('history.summary', { month: t('month.' + MONTHS[month - 1].toLowerCase()) })}
                </div>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 900, color: 'var(--color-primary)' }}>
                  {payment?.amount ? `₹${Number(payment.amount).toLocaleString('en-IN')}` : '—'}
                </div>
              </div>
              {payment && (
                <Badge variant={payment.status === 'paid' ? 'paid' : 'unpaid'}>
                  {payment.status === 'paid' ? t('payment.paid') : t('payment.unpaid')}
                </Badge>
              )}
            </div>
            {payment?.settled_at && (
              <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginBottom: 10 }}>
                {t('payment.paid')} on {new Date(payment.settled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            )}
            <div style={{
              display: 'flex', gap: 20, paddingTop: 12,
              borderTop: '1px solid var(--color-border)',
            }}>
              {[
                { label: t('history.deliveries'), value: delivered },
                { label: t('history.skipped'), value: skipped },
                { label: t('history.notAvailable'), value: notAvailable },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 10, color: 'var(--color-text-light)', fontWeight: 700 }}>{label}</div>
                  <div style={{ fontWeight: 800, color: 'var(--color-text)', fontSize: 16 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery log */}
          {completedList.length > 0 ? (
            <>
              <h3 style={{
                fontSize: 12, fontWeight: 700, color: 'var(--color-text-light)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
              }}>
                {t('history.deliveryLog')}
              </h3>
              {completedList.map((d) => {
                const date = new Date(d.date);
                const dow = date.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' }).toUpperCase();
                const day = date.getUTCDate();
                const skipped = d.status === 'skipped';
                const pendingSkip = d.status === 'pending_skip';

                return (
                  <div
                    key={d.id}
                    style={{
                      background: skipped ? '#FAFAFA' : pendingSkip ? '#FFFDF5' : 'white',
                      border: `1px solid ${skipped ? 'var(--color-border)' : pendingSkip ? '#F5A623' : 'var(--color-border)'}`,
                      borderRadius: 12, padding: '13px 16px', marginBottom: 6,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      opacity: skipped ? 0.75 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Day badge */}
                      <div style={{
                        width: 38, height: 38,
                        background: skipped ? '#F3F4F6' : pendingSkip ? '#FEF3DC' : 'var(--color-primary-light)',
                        borderRadius: 10,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: skipped ? '#9CA3AF' : 'var(--color-text-muted)', textTransform: 'uppercase' }}>{dow}</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: skipped ? '#6B7280' : 'var(--color-text)' }}>{day}</span>
                      </div>
                      <div>
                        <div style={{
                          fontSize: 13, fontWeight: 700,
                          color: skipped ? '#6B7280' : 'var(--color-text)',
                          textDecoration: skipped ? 'line-through' : 'none',
                        }}>
                          {d.meal_type === 'Lunch' ? t('meal.lunch') : t('meal.dinner')}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-light)' }}>
                          {d.status === 'delivered' && d.delivered_at
                            ? `${t('meal.delivered')} ${new Date(d.delivered_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}`
                            : d.status === 'skipped' ? t('meal.skipped')
                            : pendingSkip ? t('skip.pending')
                            : d.status === 'not_available' ? t('meal.notAvailable')
                            : t('meal.pending')
                          }
                        </div>
                      </div>
                    </div>
                    <Badge variant={d.status === 'delivered' ? 'delivered' : d.status === 'skipped' ? 'skipped' : d.status === 'not_available' ? 'not_available' : pendingSkip ? 'pending' : 'pending'}>
                      {d.status === 'delivered' ? `✓ ${t('meal.delivered')}`
                        : d.status === 'skipped' ? t('meal.skipped')
                        : d.status === 'not_available' ? t('meal.notAvailable')
                        : pendingSkip ? t('skip.pending')
                        : t('meal.pending')}
                    </Badge>
                  </div>
                );
              })}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-light)', fontSize: 14 }}>
              {t('common.noData')}
            </div>
          )}
        </>
      )}
    </div>
  );
}
