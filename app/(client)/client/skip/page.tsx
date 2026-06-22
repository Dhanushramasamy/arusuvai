'use client';

import React, { useEffect, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import DatePickerModal from '@/components/ui/DatePickerModal';
import { useTranslation } from '@/i18n';
import type { SkipRequest } from '@/types';

type MealType = 'Lunch' | 'Dinner';

function todayStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export default function SkipMealPage() {
  const { t } = useTranslation();
  const [sub, setSub] = useState<any | null>(null);
  const [date, setDate] = useState(todayStr());
  const [selectedMeals, setSelectedMeals] = useState<MealType[]>([]);
  const [requests, setRequests] = useState<SkipRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  function formatDateLabel(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  }

  useEffect(() => {
    fetch('/api/client/skip-requests')
      .then((r) => r.json())
      .then((d) => setRequests(d.data ?? []));

    fetch('/api/client/subscription')
      .then((r) => r.json())
      .then((d) => {
        setSub(d.data);
        if (d.data) {
          const today = todayStr();
          const start = d.data.start_date.slice(0, 10);
          const defaultDate = start > today ? start : today;
          setDate(defaultDate);

          const initialMeals: MealType[] = [];
          if (d.data.subscribe_lunch !== false) initialMeals.push('Lunch');
          if (d.data.subscribe_dinner !== false) {
            initialMeals.push('Dinner');
          }
          setSelectedMeals(initialMeals);
        }
      });
  }, []);

  const toggleMeal = (m: MealType) => {
    setSelectedMeals((prev) => {
      if (prev.includes(m)) {
        if (prev.length === 1) return prev;
        return prev.filter((x) => x !== m);
      } else {
        return [...prev, m];
      }
    });
  };

  function handleRequestClick() {
    setError('');
    const targetDate = new Date(date + 'T00:00:00');
    if (targetDate.getDay() === 0) {
      setError(t('skip.sundayError'));
      return;
    }
    setShowConfirm(true);
  }

  async function submitSkip() {
    setLoading(true);
    setError('');
    try {
      const promises = mealsToSkip.map((m) =>
        fetch('/api/client/skip-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, meal_type: m }),
        })
      );
      const responses = await Promise.all(promises);
      let successCount = 0;
      let lastError = '';
      const newRequests: SkipRequest[] = [];

      for (const res of responses) {
        const data = await res.json();
        if (data.success) {
          successCount++;
          newRequests.push(data.data);
        } else {
          lastError = data.error ?? 'Failed to submit skip request';
        }
      }

      if (successCount > 0) {
        setShowConfirm(false);
        setSuccessMsg(t('skip.success'));
        setRequests((prev) => [...newRequests, ...prev]);
      } else {
        setError(lastError || t('common.error'));
        setShowConfirm(false);
      }
    } catch (e) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  const existingLunchSkip = requests.find(
    (r) => r.date.slice(0, 10) === date && r.meal_type === 'Lunch'
  );
  const existingDinnerSkip = requests.find(
    (r) => r.date.slice(0, 10) === date && r.meal_type === 'Dinner'
  );

  const mealsToSkip = selectedMeals.filter((m) => {
    if (m === 'Lunch' && existingLunchSkip) return false;
    if (m === 'Dinner' && existingDinnerSkip) return false;
    return true;
  });

  const status = sub ? sub.status : 'expired';
  const isExpired = status === 'expired';

  const minDateStr = sub && sub.start_date.slice(0, 10) > todayStr() ? sub.start_date.slice(0, 10) : todayStr();
  const maxDateStr = sub ? sub.end_date.slice(0, 10) : '';

  const todayVal = todayStr();
  const tomorrowVal = tomorrowStr();
  const showTodayBtn = todayVal >= minDateStr && (!maxDateStr || todayVal <= maxDateStr) && new Date(todayVal + 'T00:00:00').getDay() !== 0;
  const showTomorrowBtn = tomorrowVal >= minDateStr && (!maxDateStr || tomorrowVal <= maxDateStr) && new Date(tomorrowVal + 'T00:00:00').getDay() !== 0;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <h1 style={{
        fontSize: 22, fontWeight: 900, color: 'var(--color-text)',
        fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 6,
      }}>
        {t('skip.title')}
      </h1>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
        {t('skip.daysLimitMsg')}
      </p>

      {successMsg && (
        <div style={{
          background: '#EBF5EB', border: '1px solid #A8D4A8',
          borderRadius: 12, padding: '12px 16px', marginBottom: 16,
          fontSize: 13, fontWeight: 600, color: '#2C5E2E',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          ✓ {successMsg}
        </div>
      )}

      {isExpired ? (
        <div style={{
          background: '#FEF2F2', border: '1.5px solid #FECACA',
          borderRadius: 20, padding: 20, marginBottom: 16, textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#DC2626', marginBottom: 6 }}>
            {t('sub.expired')}
          </div>
          <div style={{ fontSize: 13, color: '#7F1D1D', lineHeight: 1.5 }}>
            {t('sub.expiredMsg')}
          </div>
        </div>
      ) : (
        <>
          {/* Step 1: Date */}
          <div style={sectionCard}>
            <label style={sectionLabel}>1. {t('skip.selectDate')}</label>
            {(showTodayBtn || showTomorrowBtn) && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {showTodayBtn && (
                  <button
                    onClick={() => setDate(todayVal)}
                    style={{
                      flex: 1, padding: '10px 8px',
                      background: date === todayVal ? 'var(--color-primary)' : 'var(--color-bg)',
                      color: date === todayVal ? 'white' : 'var(--color-text-muted)',
                      border: `1.5px solid ${date === todayVal ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t('skip.today')}
                  </button>
                )}
                {showTomorrowBtn && (
                  <button
                    onClick={() => setDate(tomorrowVal)}
                    style={{
                      flex: 1, padding: '10px 8px',
                      background: date === tomorrowVal ? 'var(--color-primary)' : 'var(--color-bg)',
                      color: date === tomorrowVal ? 'white' : 'var(--color-text-muted)',
                      border: `1.5px solid ${date === tomorrowVal ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t('skip.tomorrow')}
                  </button>
                )}
              </div>
            )}
            <button
              onClick={() => setShowDatePicker(true)}
              style={{
                width: '100%', padding: '11px 14px',
                border: '1.5px solid var(--color-border)',
                borderRadius: 10, fontSize: 13, fontWeight: 700,
                color: 'var(--color-primary)', background: 'var(--color-primary-light)',
                cursor: 'pointer', textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              📅 {formatDateLabel(date)}
            </button>
          </div>

          {/* Step 2: Meal */}
          <div style={sectionCard}>
            <label style={sectionLabel}>2. {t('skip.selectMeal')}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {([['Lunch', '🍱', sub?.subscribe_lunch !== false], ['Dinner', '🌙', sub?.subscribe_dinner !== false]] as [MealType, string, boolean][])
                .filter(([,, active]) => active)
                .map(([m, icon]) => {
                  const isSel = selectedMeals.includes(m);
                  const mealText = m === 'Lunch' ? t('meal.lunch') : t('meal.dinner');
                  return (
                    <button
                      key={m}
                      onClick={() => toggleMeal(m)}
                      style={{
                        flex: 1, padding: '14px 8px',
                        background: isSel ? 'var(--color-primary)' : 'var(--color-bg)',
                        color: isSel ? 'white' : 'var(--color-text-muted)',
                        border: `1.5px solid ${isSel ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{icon}</span>
                      <span>{mealText}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 12, padding: '10px 14px', marginBottom: 12,
              fontSize: 13, fontWeight: 600, color: '#DC2626',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Existing skips warning */}
          {selectedMeals.map((m) => {
            const skip = m === 'Lunch' ? existingLunchSkip : existingDinnerSkip;
            if (!skip) return null;
            const mealText = m === 'Lunch' ? t('meal.lunch') : t('meal.dinner');
            return (
              <div key={m} style={{
                background: '#F7F8F5', border: '1.5px solid var(--color-border)',
                borderRadius: 12, padding: '12px 16px', marginBottom: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  {t('skip.existingSkip', { meal: mealText })}
                </div>
                <Badge variant={skip.status === 'approved' ? 'skipped' : skip.status}>
                  {skip.status === 'approved' ? t('meal.skipped') : t('skip.' + skip.status)}
                </Badge>
              </div>
            );
          })}

          {mealsToSkip.length > 0 && (
            <Button
              variant="accent"
              fullWidth
              onClick={handleRequestClick}
            >
              {t('skip.requestBtn')} ({mealsToSkip.map(m => m === 'Lunch' ? t('meal.lunch') : t('meal.dinner')).join(' & ')} ) →
            </Button>
          )}
        </>
      )}

      {/* My Skip Requests */}
      {requests.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{
            fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12,
          }}>
            {t('skip.myRequests')}
          </h3>
          {requests.map((r) => (
            <div
              key={r.id}
              style={{
                background: 'white',
                border: `1.5px solid ${r.status === 'pending' ? '#FEF3DC' : 'var(--color-border)'}`,
                borderRadius: 12, padding: '13px 16px',
                marginBottom: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
                  {r.meal_type === 'Lunch' ? t('meal.lunch') : t('meal.dinner')} — {formatDateLabel(r.date)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 2 }}>
                  {t('skip.confirmSubtitle')}
                </div>
              </div>
              <Badge variant={r.status === 'approved' ? 'skipped' : r.status}>
                {r.status === 'approved' ? t('meal.skipped') : t('skip.' + r.status)}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Date Picker Modal */}
      <DatePickerModal
        open={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        selectedDate={date}
        onSelect={setDate}
        minDate={minDateStr}
        maxDate={maxDateStr}
      />

      {/* Confirm Modal */}
      <Modal open={showConfirm} onClose={() => setShowConfirm(false)}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>⏭</div>
          <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 8px' }}>
            {t('skip.title')}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            {t('skip.confirm', {
              meal: mealsToSkip.map(m => m === 'Lunch' ? t('meal.lunch') : t('meal.dinner')).join(' & '),
              date: formatDateLabel(date),
            })}
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 6 }}>
            {t('skip.confirmSubtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" fullWidth onClick={() => setShowConfirm(false)}>{t('common.cancel')}</Button>
          <Button variant="primary" fullWidth loading={loading} onClick={submitSkip}>{t('skip.confirmBtn')}</Button>
        </div>
      </Modal>
    </div>
  );
}

const sectionCard: React.CSSProperties = {
  background: 'white',
  border: '1.5px solid var(--color-border)',
  borderRadius: 16, padding: 16, marginBottom: 14,
};

const sectionLabel: React.CSSProperties = {
  display: 'block',
  fontSize: 11, fontWeight: 700,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.08em',
  marginBottom: 10,
};
