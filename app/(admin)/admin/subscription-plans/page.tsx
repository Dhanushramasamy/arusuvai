'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { swrFetch, invalidateCache } from '@/lib/clientCache';

interface Plan {
  id: number;
  plan_name: string;
  plan_type: string;
  price: number;
  duration_days: number;
  features: string[];
  whatsapp_number: string;
  is_active: boolean;
  sort_order: number;
}

type EditField = { plan_name: string; price: string; duration_days: string; whatsapp_number: string; features: string; is_active: boolean };

const PLAN_COLORS: Record<string, string> = {
  veg: '#2C5E2E',
  non_veg: '#C05621',
  dinner: '#5B3E1E',
};

const PLAN_ICONS: Record<string, string> = {
  veg: '🌿',
  non_veg: '🍗',
  dinner: '🌙',
};

export default function AdminSubscriptionPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditField>({ plan_name: '', price: '', duration_days: '', whatsapp_number: '', features: '', is_active: true });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [newPlanType, setNewPlanType] = useState<string>('veg');

  const load = useCallback((bypass = false) => {
    setLoading(true);
    return swrFetch('/api/admin/subscription-plans', (json) => {
      setPlans(json.data ?? []);
      setLoading(false);
    }, { bypassCache: bypass });
  }, []);

  useEffect(() => {
    const unsub = load();
    return unsub;
  }, [load]);

  function startEdit(plan: Plan) {
    setEditing(plan.id);
    setEditForm({
      plan_name: plan.plan_name,
      price: String(plan.price),
      duration_days: String(plan.duration_days),
      whatsapp_number: plan.whatsapp_number,
      features: plan.features.join(', '),
      is_active: plan.is_active,
    });
    setError('');
  }

  async function savePlan(id: number) {
    setSaving(true);
    setError('');
    try {
      const features = editForm.features.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await fetch(`/api/admin/subscription-plans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_name: editForm.plan_name,
          price: parseFloat(editForm.price),
          duration_days: parseInt(editForm.duration_days, 10),
          whatsapp_number: editForm.whatsapp_number.replace(/\D/g, ''),
          features,
          is_active: editForm.is_active,
        }),
      });
      const data = await res.json();
      if (data.success) {
        invalidateCache('/api/admin/subscription-plans');
        invalidateCache('/api/public/subscription-plans');
        setEditing(null);
        load(true);
        setSaved(id);
        setTimeout(() => setSaved(null), 2000);
      } else {
        setError(data.error ?? 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  }

  async function createPlan() {
    setSaving(true);
    setError('');
    try {
      const features = editForm.features.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await fetch(`/api/admin/subscription-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_name: editForm.plan_name,
          plan_type: newPlanType,
          price: parseFloat(editForm.price),
          duration_days: parseInt(editForm.duration_days, 10),
          whatsapp_number: editForm.whatsapp_number.replace(/\D/g, ''),
          features,
          is_active: editForm.is_active,
        }),
      });
      const data = await res.json();
      if (data.success) {
        invalidateCache('/api/admin/subscription-plans');
        invalidateCache('/api/public/subscription-plans');
        setCreating(false);
        load(true);
      } else {
        setError(data.error ?? 'Creation failed');
      }
    } finally {
      setSaving(false);
    }
  }

  async function deletePlan(id: number) {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/subscription-plans/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        invalidateCache('/api/admin/subscription-plans');
        invalidateCache('/api/public/subscription-plans');
        setEditing(null);
        load(true);
      } else {
        setError(data.error ?? 'Delete failed');
      }
    } finally {
      setSaving(false);
    }
  }

  const fieldLabel: React.CSSProperties = {
    display: 'block', fontSize: 10, fontWeight: 700,
    color: 'var(--color-text-light)', textTransform: 'uppercase',
    letterSpacing: '0.06em', marginBottom: 4,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid var(--color-border)', borderRadius: 10,
    fontSize: 13, fontWeight: 500, color: 'var(--color-text)',
    background: 'var(--color-bg)', boxSizing: 'border-box',
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-text)', fontFamily: 'Georgia, serif', margin: 0 }}>
            Subscription Plans
          </h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-light)', margin: '3px 0 0' }}>
            Update plan prices, features, and WhatsApp contact numbers. Changes appear live on the public site.
          </p>
        </div>
        <button
          onClick={() => {
            setCreating(true);
            setEditing(null);
            setEditForm({ plan_name: '', price: '', duration_days: '26', whatsapp_number: '', features: '', is_active: true });
            setError('');
          }}
          style={{
            padding: '10px 18px', background: '#2C5E2E', color: 'white',
            border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          + Add Plan
        </button>
      </div>

      {/* Info */}
      <div style={{
        background: '#F0F7EE', border: '1px solid #A8D4A8',
        borderRadius: 10, padding: '10px 14px',
        fontSize: 12, color: '#2C5E2E', fontWeight: 600,
        marginBottom: 20,
      }}>
        💡 The WhatsApp number should include the country code without &quot;+&quot;, e.g. <strong>919092724170</strong> for India (+91).
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-light)' }}>Loading…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {creating && (
            <div style={{
              background: 'white', border: '1.5px solid #2C5E2E', borderRadius: 16, padding: '20px',
              boxShadow: '0 0 0 3px rgba(44,94,46,0.1)',
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, color: '#1A2E1A' }}>Create New Plan</h3>
              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#DC2626', marginBottom: 14 }}>
                  ⚠ {error}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={fieldLabel}>Plan Name *</label>
                  <input type="text" value={editForm.plan_name} onChange={(e) => setEditForm(f => ({ ...f, plan_name: e.target.value }))} style={inputStyle} placeholder="e.g. Premium Veg Plan" />
                </div>
                <div>
                  <label style={fieldLabel}>Plan Type *</label>
                  <select value={newPlanType} onChange={(e) => setNewPlanType(e.target.value)} style={inputStyle}>
                    <option value="veg">Vegetarian</option>
                    <option value="non_veg">Non-Vegetarian</option>
                    <option value="combo">Combo</option>
                  </select>
                </div>
                <div>
                  <label style={fieldLabel}>Price (₹) *</label>
                  <input type="number" value={editForm.price} onChange={(e) => setEditForm(f => ({ ...f, price: e.target.value }))} style={inputStyle} placeholder="e.g. 3600" />
                </div>
                <div>
                  <label style={fieldLabel}>Duration (days) *</label>
                  <input type="number" value={editForm.duration_days} onChange={(e) => setEditForm(f => ({ ...f, duration_days: e.target.value }))} style={inputStyle} placeholder="e.g. 26" />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={fieldLabel}>WhatsApp Number (with country code, no +) *</label>
                <input type="text" value={editForm.whatsapp_number} onChange={(e) => setEditForm(f => ({ ...f, whatsapp_number: e.target.value }))} style={inputStyle} placeholder="e.g. 919092724170" />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={fieldLabel}>Features (comma-separated)</label>
                <textarea value={editForm.features} onChange={(e) => setEditForm(f => ({ ...f, features: e.target.value }))} style={{ ...inputStyle, minHeight: 72, resize: 'vertical', fontFamily: 'inherit' }} placeholder="e.g. Pure Vegetarian Meals, Freshly Cooked Daily" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <input type="checkbox" id="active_new" checked={editForm.is_active} onChange={(e) => setEditForm(f => ({ ...f, is_active: e.target.checked }))} />
                <label htmlFor="active_new" style={{ fontSize: 13, fontWeight: 600, color: '#1A2E1A' }}>Active (Show on public site)</label>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setCreating(false)} style={{ padding: '10px 20px', background: 'var(--color-bg)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={createPlan} disabled={saving} style={{ padding: '10px 24px', background: '#2C5E2E', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Creating…' : 'Create Plan'}</button>
              </div>
            </div>
          )}

          {plans.map((plan) => {
            const color = PLAN_COLORS[plan.plan_type] ?? '#2C5E2E';
            const isEditing = editing === plan.id;
            const isSaved = saved === plan.id;

            return (
              <div key={plan.id} style={{
                background: 'white',
                border: `1.5px solid ${isEditing ? color : 'var(--color-border)'}`,
                borderRadius: 16,
                padding: '20px',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                boxShadow: isEditing ? `0 0 0 3px ${color}20` : 'none',
              }}>
                {/* Plan header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isEditing ? 20 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 48, height: 48,
                      background: color,
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22,
                    }}>
                      {PLAN_ICONS[plan.plan_type] ?? '🍽️'}
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text)' }}>
                        {plan.plan_name} {!plan.is_active && <span style={{ fontSize: 10, background: '#FEE2E2', color: '#991B1B', padding: '2px 6px', borderRadius: 4, verticalAlign: 'middle', marginLeft: 6 }}>INACTIVE</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>
                        ₹{Number(plan.price).toLocaleString('en-IN')} / {plan.duration_days} days
                        {' · '}WhatsApp: +{plan.whatsapp_number || '—'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {isSaved && (
                      <span style={{
                        padding: '6px 12px', background: '#EBF5EB', color: '#2C5E2E',
                        borderRadius: 8, fontSize: 12, fontWeight: 700,
                      }}>
                        ✓ Saved
                      </span>
                    )}
                    <button
                      onClick={() => { isEditing ? setEditing(null) : startEdit(plan); setCreating(false); }}
                      style={{
                        padding: '7px 14px',
                        background: isEditing ? 'var(--color-bg)' : '#EFF6FF',
                        color: isEditing ? 'var(--color-text-muted)' : '#3B82F6',
                        border: 'none', borderRadius: 8,
                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      {isEditing ? '✕ Cancel' : '✏️ Edit'}
                    </button>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      style={{
                        padding: '7px 14px',
                        background: '#FEF2F2',
                        color: '#DC2626',
                        border: 'none', borderRadius: 8,
                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Edit form */}
                {isEditing && (
                  <div style={{ animation: 'slideUp 0.2s ease' }}>
                    {error && (
                      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#DC2626', marginBottom: 14 }}>
                        ⚠ {error}
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                      <div>
                        <label style={fieldLabel}>Plan Name *</label>
                        <input
                          type="text"
                          value={editForm.plan_name}
                          onChange={(e) => setEditForm((f) => ({ ...f, plan_name: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={fieldLabel}>Price (₹) *</label>
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={fieldLabel}>Duration (days) *</label>
                        <input
                          type="number"
                          value={editForm.duration_days}
                          onChange={(e) => setEditForm((f) => ({ ...f, duration_days: e.target.value }))}
                          style={inputStyle}
                          placeholder="e.g. 26"
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={fieldLabel}>WhatsApp Number (with country code, no +) *</label>
                      <input
                        type="text"
                        value={editForm.whatsapp_number}
                        onChange={(e) => setEditForm((f) => ({ ...f, whatsapp_number: e.target.value }))}
                        style={inputStyle}
                        placeholder="e.g. 919092724170"
                      />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <label style={fieldLabel}>Features (comma-separated)</label>
                      <textarea
                        value={editForm.features}
                        onChange={(e) => setEditForm((f) => ({ ...f, features: e.target.value }))}
                        style={{ ...inputStyle, minHeight: 72, resize: 'vertical', fontFamily: 'inherit' }}
                        placeholder="e.g. Pure Vegetarian Meals, Freshly Cooked Daily, Delivered in Steel Containers"
                      />
                      {/* Feature preview */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                        {editForm.features.split(',').map((s) => s.trim()).filter(Boolean).map((feat, i) => (
                          <span key={i} style={{
                            background: '#EBF5EB', color: '#2C5E2E',
                            padding: '3px 10px', borderRadius: 20,
                            fontSize: 11, fontWeight: 600,
                            border: '1px solid #A8D4A8',
                          }}>
                            ✓ {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                      <input type="checkbox" id={`active_${plan.id}`} checked={editForm.is_active} onChange={(e) => setEditForm(f => ({ ...f, is_active: e.target.checked }))} />
                      <label htmlFor={`active_${plan.id}`} style={{ fontSize: 13, fontWeight: 600, color: '#1A2E1A' }}>Active (Show on public site)</label>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => setEditing(null)}
                        style={{
                          padding: '10px 20px',
                          background: 'var(--color-bg)', color: 'var(--color-text-muted)',
                          border: '1px solid var(--color-border)', borderRadius: 10,
                          fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => savePlan(plan.id)}
                        disabled={saving}
                        style={{
                          padding: '10px 24px',
                          background: color, color: 'white',
                          border: 'none', borderRadius: 10,
                          fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        {saving ? 'Saving…' : '💾 Save Changes'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
