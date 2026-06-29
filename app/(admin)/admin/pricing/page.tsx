'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { swrFetch, invalidateCache } from '@/lib/clientCache';

interface Fare { location: string; charge: number; }

export default function AdminPricingPage() {
  const [fares, setFares] = useState<Fare[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [newCharge, setNewCharge] = useState('');
  const [saving, setSaving] = useState(false);

  const load = (bypassCache = false) => {
    setLoading(true);
    const unsub = swrFetch('/api/admin/pricing', (json) => {
      setFares(json.data ?? []);
      setLoading(false);
    }, { bypassCache });
    return unsub;
  };

  useEffect(() => {
    const unsub = load();
    return unsub;
  }, []);

  async function save(location: string, charge: string) {
    setSaving(true);
    await fetch('/api/admin/pricing', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, charge: parseFloat(charge) }),
    });
    invalidateCache('/api/admin/pricing');
    setEditing(null);
    setSaving(false);
    load(true);
  }

  async function addNew() {
    if (!newLoc.trim() || !newCharge) return;
    setSaving(true);
    await fetch('/api/admin/pricing', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: newLoc.trim(), charge: parseFloat(newCharge) }),
    });
    invalidateCache('/api/admin/pricing');
    setNewLoc(''); setNewCharge('');
    setSaving(false);
    load(true);
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-text)', fontFamily: 'Georgia, serif', marginBottom: 20 }}>
        Delivery Pricing
      </h1>

      <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 20, padding: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
          Per-Location Delivery Charges
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-light)' }}>Loading…</div>
        ) : (
          <>
            {fares.map((f) => (
              <div key={f.location} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 14px',
                background: editing === f.location ? 'var(--color-primary-light)' : 'var(--color-bg)',
                border: editing === f.location ? '1px solid #A8D4A8' : '1px solid transparent',
                borderRadius: 10, marginBottom: 6,
                transition: 'all 0.15s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>📍</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>{f.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {editing === f.location ? (
                    <>
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>₹</span>
                      <input
                        type="number"
                        value={editVal}
                        onChange={(e) => setEditVal(e.target.value)}
                        style={{
                          width: 80, padding: '6px 10px',
                          border: '1.5px solid #A8D4A8', borderRadius: 8,
                          fontSize: 13, fontWeight: 700, textAlign: 'center',
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => save(f.location, editVal)}
                        style={saveBtnStyle}
                        disabled={saving}
                      >
                        Save
                      </button>
                      <button onClick={() => setEditing(null)} style={cancelBtnStyle}>×</button>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text)' }}>₹{Number(f.charge).toFixed(2)}</span>
                      <button
                        onClick={() => { setEditing(f.location); setEditVal(String(f.charge)); }}
                        style={editBtnStyle}
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {fares.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-light)', fontSize: 13 }}>
                No locations configured yet.
              </div>
            )}

            {/* Add new */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', marginBottom: 8 }}>
                Add New Location
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  placeholder="Area name"
                  value={newLoc}
                  onChange={(e) => setNewLoc(e.target.value)}
                  style={{ flex: 2, padding: '9px 12px', border: '1.5px solid var(--color-border)', borderRadius: 10, fontSize: 12 }}
                />
                <input
                  type="number"
                  placeholder="₹ charge"
                  value={newCharge}
                  onChange={(e) => setNewCharge(e.target.value)}
                  style={{ flex: 1, padding: '9px 12px', border: '1.5px solid var(--color-border)', borderRadius: 10, fontSize: 12 }}
                />
                <Button size="sm" loading={saving} onClick={addNew}>Add</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const saveBtnStyle: React.CSSProperties = {
  padding: '6px 12px', background: 'var(--color-primary)', color: 'white',
  border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: 'pointer',
};
const cancelBtnStyle: React.CSSProperties = {
  padding: '6px 10px', background: 'white', color: '#6B7280',
  border: '1px solid var(--color-border)', borderRadius: 8, fontWeight: 600, fontSize: 11, cursor: 'pointer',
};
const editBtnStyle: React.CSSProperties = {
  padding: '5px 10px', background: 'white', color: 'var(--color-primary)',
  border: '1px solid #A8D4A8', borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: 'pointer',
};
