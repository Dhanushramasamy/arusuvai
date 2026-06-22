'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DatePickerModal from '@/components/ui/DatePickerModal';
import { useTranslation } from '@/i18n';
import type { DailyDelivery } from '@/types';

function dateStr(d: Date) {
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function formatDateDisplay(iso: string) {
  const d = new Date(iso);
  const isToday = iso === dateStr(new Date());
  const label = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return isToday ? `Today — ${label}` : label;
}

type MealTab = 'Lunch' | 'Dinner';

export default function AdminTodayPage() {
  const { t } = useTranslation();
  const [date, setDate] = useState(dateStr(new Date()));
  const [deliveries, setDeliveries] = useState<(DailyDelivery & { skip_req_id?: string; skip_status?: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [mealTab, setMealTab] = useState<MealTab>('Lunch');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deliveryPersons, setDeliveryPersons] = useState<{ id: string; name: string }[]>([]);
  const [assignPerson, setAssignPerson] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    const res = await fetch(`/api/admin/today?date=${date}`);
    const data = await res.json();
    setDeliveries(data.data ?? []);
    setLoading(false);
  }, [date]);

  useEffect(() => { loadDeliveries(); }, [loadDeliveries]);

  useEffect(() => {
    fetch('/api/admin/delivery-persons')
      .then((r) => r.json())
      .then((d) => {
        setDeliveryPersons(d.data ?? []);
        if (d.data?.length) setAssignPerson(d.data[0].id);
      });
  }, []);

  async function generateToday() {
    setGenerating(true);
    await fetch('/api/admin/generate-today', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    });
    await loadDeliveries();
    setGenerating(false);
  }

  async function approveSkip(skipId: string) {
    await fetch(`/api/admin/skip-requests/${skipId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });
    loadDeliveries();
  }

  async function rejectSkip(skipId: string) {
    await fetch(`/api/admin/skip-requests/${skipId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' }),
    });
    loadDeliveries();
  }

  async function adminSkip(delivery: DailyDelivery) {
    await fetch('/api/admin/skip-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: delivery.client_id, date: delivery.date, meal_type: delivery.meal_type }),
    });
    loadDeliveries();
  }

  async function bulkAssign() {
    if (!assignPerson || selected.size === 0) return;
    await fetch('/api/admin/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delivery_ids: Array.from(selected), delivery_person_id: assignPerson }),
    });
    setShowAssignModal(false);
    loadDeliveries();
  }

  const filtered = deliveries.filter((d) => d.meal_type === mealTab);
  const toDeliver = filtered.filter((d) => ['pending', 'assigned'].includes(d.status));
  const completedRows = filtered.filter((d) => ['delivered', 'not_available', 'skipped'].includes(d.status));
  const pendingSkips = filtered.filter((d) => d.skip_req_id && d.skip_status === 'pending').length;

  function navDate(dir: number) {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + dir);
    setDate(dateStr(d));
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>

      {/* Date navigator */}
      <div style={{
        background: 'white', border: '1px solid var(--color-border)',
        borderRadius: 16, padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <button onClick={() => navDate(-1)} style={navBtnStyle}>‹</button>
        <div onClick={() => setShowDatePicker(true)} style={{ textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: 10, color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t('admin.deliveryDate')}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)', fontFamily: "'Playfair Display', Georgia, serif" }}>
            {formatDateDisplay(date)} 📅
          </div>
        </div>
        <button onClick={() => navDate(1)} style={navBtnStyle}>›</button>
      </div>

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { label: t('history.deliveries'), value: filtered.length, style: { background: 'white', border: '1px solid var(--color-border)', color: 'var(--color-text)' } },
          { label: t('delivery.toDeliver'), value: toDeliver.length, style: { background: 'white', border: '1px solid var(--color-border)', color: 'var(--color-text)' } },
          { label: t('meal.delivered'), value: completedRows.filter((d) => d.status === 'delivered').length, style: { background: 'var(--color-primary-light)', border: '1px solid #A8D4A8', color: 'var(--color-primary)' } },
          pendingSkips > 0 ? { label: t('admin.skipPending'), value: pendingSkips, style: { background: 'var(--color-accent-light)', border: '1px solid var(--color-accent)', color: 'var(--color-accent-dark)' } } : null,
        ].filter(Boolean).map((p) => p && (
          <div key={p.label} style={{
            ...p.style, borderRadius: 12, padding: '8px 14px', fontSize: 12,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontWeight: 600 }}>{p.label}</span>
            <span style={{ fontWeight: 900, fontSize: 14 }}>{p.value}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Button size="sm" variant="ghost" onClick={generateToday} loading={generating}>
            ⟳ {t('admin.generateToday')}
          </Button>
        </div>
      </div>

      {/* Meal tabs */}
      <div style={{
        display: 'flex', gap: 6,
        background: 'white', border: '1px solid var(--color-border)',
        borderRadius: 14, padding: 5, marginBottom: 14,
      }}>
        {(['Lunch', 'Dinner'] as MealTab[]).map((tab) => {
          const count = deliveries.filter((d) => d.meal_type === tab).length;
          const labelText = tab === 'Lunch' ? t('meal.lunch') : t('meal.dinner');
          return (
            <button key={tab} onClick={() => { setMealTab(tab); setSelected(new Set()); }}
              style={{
                flex: 1, padding: '10px 8px',
                background: mealTab === tab ? 'var(--color-primary)' : 'transparent',
                color: mealTab === tab ? 'white' : 'var(--color-text-muted)',
                border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: mealTab === tab ? 700 : 600, cursor: 'pointer',
              }}
            >
              {tab === 'Lunch' ? '🍱' : '🌙'} {labelText} ({count})
            </button>
          );
        })}
      </div>

      {/* Bulk assign bar */}
      {selected.size > 0 && (
        <div style={{
          background: 'var(--color-primary-light)', border: '1px solid #A8D4A8',
          borderRadius: 12, padding: '12px 16px', marginBottom: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          animation: 'slideUp 0.2s ease',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>
            {selected.size} selected
          </span>
          <Button size="sm" onClick={() => setShowAssignModal(true)}>{t('admin.assign')}</Button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-light)' }}>{t('common.loading')}</div>
      ) : (
        <>
          {/* To Be Delivered */}
          {toDeliver.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={sectionHeader}>📦 {t('delivery.toDeliver')} — {toDeliver.length}</h3>
              {toDeliver.map((d) => (
                <DeliveryRow
                  key={d.id}
                  delivery={d}
                  selected={selected.has(d.id)}
                  onToggle={() => toggleSelect(d.id)}
                  onApproveSkip={() => d.skip_req_id && approveSkip(d.skip_req_id)}
                  onRejectSkip={() => d.skip_req_id && rejectSkip(d.skip_req_id)}
                  onAdminSkip={() => adminSkip(d)}
                  onRefresh={loadDeliveries}
                />
              ))}
            </div>
          )}

          {/* Completed */}
          {completedRows.length > 0 && (
            <div>
              <h3 style={{ ...sectionHeader, color: 'var(--color-primary)' }}>✅ {t('delivery.done')} — {completedRows.length}</h3>
              {completedRows.map((d) => (
                <CompletedRow key={d.id} delivery={d} />
              ))}
            </div>
          )}

          {deliveries.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-light)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t('common.noData')}</div>
            </div>
          )}
        </>
      )}

      {/* Date Picker Modal */}
      <DatePickerModal
        open={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        selectedDate={date}
        onSelect={setDate}
      />

      {/* Assign Modal */}
      <Modal open={showAssignModal} onClose={() => setShowAssignModal(false)}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text)', marginBottom: 16 }}>
          {t('admin.assignDeliveries')} ({selected.size})
        </h3>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{t('admin.selectRider')}</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto', padding: 2 }}>
            {deliveryPersons.map((dp) => {
              const isSel = assignPerson === dp.id;
              return (
                <button
                  key={dp.id}
                  onClick={() => setAssignPerson(dp.id)}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    background: isSel ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: isSel ? 'white' : 'var(--color-text)',
                    border: `1.5px solid ${isSel ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  🛵 {dp.name}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" fullWidth onClick={() => setShowAssignModal(false)}>{t('common.cancel')}</Button>
          <Button variant="primary" fullWidth onClick={bulkAssign}>{t('admin.assign')}</Button>
        </div>
      </Modal>
    </div>
  );
}

function DeliveryRow({
  delivery: d, selected, onToggle,
  onApproveSkip, onRejectSkip, onAdminSkip, onRefresh,
}: {
  delivery: DailyDelivery & { skip_req_id?: string; skip_status?: string };
  selected: boolean;
  onToggle: () => void;
  onApproveSkip: () => void;
  onRejectSkip: () => void;
  onAdminSkip: () => void;
  onRefresh: () => void;
}) {
  const { t } = useTranslation();
  const hasPendingSkip = !!d.skip_req_id && d.skip_status === 'pending';

  return (
    <div style={{
      background: 'white',
      border: `1.5px solid ${hasPendingSkip ? '#FEF3DC' : 'var(--color-border)'}`,
      borderRadius: 14, padding: '13px 16px', marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          style={{ marginTop: 4, accentColor: 'var(--color-primary)', width: 16, height: 16, cursor: 'pointer' }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text)' }}>{d.client_name}</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>📞 {d.phone_number}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {hasPendingSkip && <Badge variant="pending">⚠ {t('admin.skipPending')}</Badge>}
              {d.status === 'assigned' && d.delivery_person_name && (
                <Badge variant="assigned">{t('meal.assigned')} — {d.delivery_person_name}</Badge>
              )}
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginBottom: 4 }}>
            📍 {d.location}
          </div>
          {d.delivery_note_client && (
            <div style={{ fontSize: 11, color: 'var(--color-accent-dark)', fontStyle: 'italic', marginBottom: 6 }}>
              📝 &quot;{d.delivery_note_client}&quot;
            </div>
          )}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {hasPendingSkip && (
              <>
                <button onClick={onApproveSkip} style={approveStyle}>{t('admin.approveSkip')}</button>
                <button onClick={onRejectSkip}  style={rejectStyle}>{t('admin.rejectSkip')}</button>
              </>
            )}
            {!hasPendingSkip && (
              <button onClick={onAdminSkip} style={ghostSmStyle}>{t('admin.skipForUser')}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompletedRow({ delivery: d }: { delivery: DailyDelivery }) {
  const { t } = useTranslation();
  const isNA = d.status === 'not_available';
  const isSkipped = d.status === 'skipped';
  return (
    <div style={{
      background: isNA ? '#FFF7ED' : isSkipped ? '#F9FAFB' : '#F0FDF4',
      border: `1px solid ${isNA ? '#FED7AA' : isSkipped ? '#E5E7EB' : '#BBF7D0'}`,
      borderRadius: 14, padding: '11px 14px', marginBottom: 6,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      opacity: 0.9,
    }}>
      <div>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>{d.client_name}</span>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 8 }}>📍 {d.location}</span>
      </div>
      <div style={{ textAlign: 'right' }}>
        <Badge variant={d.status === 'delivered' ? 'delivered' : d.status === 'not_available' ? 'not_available' : 'skipped'}>
          {d.status === 'delivered' ? `✓ ${t('meal.delivered')}` : d.status === 'not_available' ? t('meal.notAvailable') : t('meal.skipped')}
        </Badge>
        {d.delivered_at && (
          <div style={{ fontSize: 10, color: 'var(--color-text-light)', marginTop: 2 }}>
            {new Date(d.delivered_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
            {d.delivery_person_name ? ` — ${d.delivery_person_name}` : ''}
          </div>
        )}
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  width: 36, height: 36,
  background: 'var(--color-primary-light)', border: 'none',
  borderRadius: 10, fontSize: 18, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--color-primary)', fontWeight: 700,
  transition: 'background 0.15s',
};

const sectionHeader: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.08em',
  marginBottom: 10, paddingLeft: 4,
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: 'var(--color-text-muted)', textTransform: 'uppercase',
  letterSpacing: '0.08em', marginBottom: 6,
};

const approveStyle: React.CSSProperties = {
  padding: '6px 14px', background: 'var(--color-primary)', color: 'white',
  border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: 'pointer',
};
const rejectStyle: React.CSSProperties = {
  padding: '6px 14px', background: 'white', color: '#DC2626',
  border: '1px solid #FECACA', borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: 'pointer',
};
const ghostSmStyle: React.CSSProperties = {
  padding: '5px 10px', background: 'var(--color-bg)', color: 'var(--color-text-muted)',
  border: '1px solid var(--color-border)', borderRadius: 8, fontWeight: 600, fontSize: 11, cursor: 'pointer',
};
