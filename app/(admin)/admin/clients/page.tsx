'use client';

import React, { useEffect, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { countServiceDays } from '@/lib/dateUtils';
import CustomConfirmModal from '@/components/ui/CustomConfirmModal';

function calculateEndDate(startDateStr: string, serviceDays: number): string {
  if (serviceDays <= 0) return startDateStr;
  const d = new Date(startDateStr + 'T00:00:00');
  let current = new Date(d);
  let serviceCount = 0;
  while (serviceCount < serviceDays) {
    if (current.getDay() !== 0) { // Not Sunday
      serviceCount++;
    }
    if (serviceCount < serviceDays) {
      current.setDate(current.getDate() + 1);
    }
  }
  return current.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

interface ClientRow {
  id: string; name: string; phone_number: string; location: string;
  username: string; delivery_note: string; is_active: boolean;
  sub_id?: string; sub_amount?: number; start_date?: string;
  end_date?: string; sub_status?: string; sub_type?: string;
  payment_status?: string;
  subscribe_lunch?: boolean;
  subscribe_dinner?: boolean;
  subscribe_breakfast?: boolean;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [confirmDeactivateId, setConfirmDeactivateId] = useState<string | null>(null);

  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string>('custom');
  const [selectedRenewPkgId, setSelectedRenewPkgId] = useState<string>('custom');

  const [form, setForm] = useState({
    name: '', phone_number: '', location: '',
    password: '', delivery_note: '',
    sub_amount: '', sub_start: '', sub_end: '',
    subscribe_breakfast: false,
    subscribe_lunch: true, subscribe_dinner: true,
  });

  const [editForm, setEditForm] = useState({
    name: '', phone_number: '', location: '', password: '', delivery_note: '',
    sub_amount: '', start_date: '', end_date: '',
    subscribe_breakfast: false,
    subscribe_lunch: true, subscribe_dinner: true,
  });

  const [renewForm, setRenewForm] = useState({
    amount: '', start_date: '', end_date: '',
  });

  useEffect(() => {
    fetch('/api/admin/packages')
      .then((r) => r.json())
      .then((d) => setPackages(d.data ?? []));
  }, []);

  function handleSelectPackage(pkg: any) {
    setSelectedPkgId(pkg.id);
    if (pkg.id === 'custom') {
      setForm((f) => ({
        ...f,
        sub_amount: '',
      }));
    } else {
      const meals = pkg.meal_type;
      const b = meals.includes('Breakfast');
      const l = meals.includes('Lunch');
      const d = meals.includes('Dinner');
      setForm((f) => {
        const next = {
          ...f,
          sub_amount: String(pkg.price),
          subscribe_breakfast: b,
          subscribe_lunch: l,
          subscribe_dinner: d,
        };
        if (f.sub_start) {
          next.sub_end = calculateEndDate(f.sub_start, pkg.days);
        }
        return next;
      });
    }
  }

  function handleStartDateChange(val: string) {
    setForm((f) => {
      const next = { ...f, sub_start: val };
      if (selectedPkgId !== 'custom') {
        const pkg = packages.find((p) => p.id === selectedPkgId);
        if (pkg) {
          next.sub_end = calculateEndDate(val, pkg.days);
        }
      }
      return next;
    });
  }

  function handleSelectRenewPackage(pkg: any) {
    setSelectedRenewPkgId(pkg.id);
    if (pkg.id === 'custom') {
      setRenewForm((f) => ({
        ...f,
        amount: '',
      }));
    } else {
      setRenewForm((f) => {
        const next = {
          ...f,
          amount: String(pkg.price),
        };
        if (f.start_date) {
          next.end_date = calculateEndDate(f.start_date, pkg.days);
        }
        return next;
      });
    }
  }

  function handleRenewStartDateChange(val: string) {
    setRenewForm((f) => {
      const next = { ...f, start_date: val };
      if (selectedRenewPkgId !== 'custom') {
        const pkg = packages.find((p) => p.id === selectedRenewPkgId);
        if (pkg) {
          next.end_date = calculateEndDate(val, pkg.days);
        }
      }
      return next;
    });
  }

  const loadClients = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/clients');
    const data = await res.json();
    setClients(data.data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadClients(); }, []);

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  function getSubStatus(c: ClientRow) {
    if (!c.end_date) return 'expired';
    const today = new Date(todayStr);
    const end = new Date(c.end_date);
    if (today > end) return 'expired';
    if (!c.start_date) return 'expired';
    if (today < new Date(c.start_date)) return 'not_started';
    return 'active';
  }

  function remainingDays(c: ClientRow) {
    if (!c.end_date) return 0;
    const today = new Date();
    const end = new Date(c.end_date);
    if (end < today) return 0;
    return countServiceDays(today, end);
  }

  async function addClient() {
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone_number: form.phone_number,
          location: form.location,
          password: form.password,
          delivery_note: form.delivery_note,
          subscription: form.sub_amount && form.sub_start && form.sub_end ? {
            amount: parseFloat(form.sub_amount),
            start_date: form.sub_start,
            end_date: form.sub_end,
            subscribe_breakfast: form.subscribe_breakfast,
            subscribe_lunch: form.subscribe_lunch,
            subscribe_dinner: form.subscribe_dinner,
          } : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddForm(false);
        setForm({
          name:'', phone_number:'', location:'', password:'', delivery_note:'',
          sub_amount:'', sub_start:'', sub_end:'',
          subscribe_breakfast: false,
          subscribe_lunch: true, subscribe_dinner: true
        });
        setSelectedPkgId('custom');
        loadClients();
      } else {
        setError(data.error ?? 'Failed to add client');
      }
    } finally { setSaving(false); }
  }

  async function renewSubscription() {
    if (!selectedClient) return;
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/admin/clients/${selectedClient.id}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(renewForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowRenewModal(false);
        setRenewForm({ amount: '', start_date: '', end_date: '' });
        setSelectedRenewPkgId('custom');
        setSelectedClient(null);
        loadClients();
      } else {
        setError(data.error ?? 'Failed to renew subscription');
      }
    } finally { setSaving(false); }
  }

  function startEdit(c: ClientRow) {
    setSelectedClient(c);
    setEditForm({
      name: c.name,
      phone_number: c.phone_number || '',
      location: c.location || '',
      password: '',
      delivery_note: c.delivery_note || '',
      sub_amount: c.sub_amount !== undefined ? String(c.sub_amount) : '',
      start_date: c.start_date ? c.start_date.slice(0, 10) : '',
      end_date: c.end_date ? c.end_date.slice(0, 10) : '',
      subscribe_breakfast: c.subscribe_breakfast === true,
      subscribe_lunch: c.subscribe_lunch !== false,
      subscribe_dinner: c.subscribe_dinner !== false,
    });
    setShowEditModal(true);
  }

  async function editClient() {
    if (!selectedClient) return;
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/admin/clients/${selectedClient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        setSelectedClient(null);
        loadClients();
      } else {
        setError(data.error ?? 'Failed to update client');
      }
    } finally { setSaving(false); }
  }

  async function handleConfirmDeactivate() {
    if (!confirmDeactivateId) return;
    await fetch(`/api/admin/clients/${confirmDeactivateId}`, { method: 'DELETE' });
    setConfirmDeactivateId(null);
    loadClients();
  }

  function deleteClient(id: string) {
    setConfirmDeactivateId(id);
  }

  const filtered = clients.filter((c) =>
    c.is_active && (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const activeCount = clients.filter((c) => c.is_active && getSubStatus(c) === 'active').length;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-text)', fontFamily: 'Georgia, serif', margin: 0 }}>Clients</h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-light)', margin: '2px 0 0' }}>{activeCount} active subscribers</p>
        </div>
        <Button onClick={() => setShowAddForm((p) => !p)}>
          {showAddForm ? '✕ Cancel' : '+ Add Client'}
        </Button>
      </div>

      {/* Add Client Form */}
      {showAddForm && (
        <div style={{
          background: 'white', border: '1.5px solid #A8D4A8',
          borderRadius: 20, padding: 20, marginBottom: 20,
          animation: 'slideUp 0.25s ease',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 16px' }}>Register New Client</h3>
          {error && <div style={errorStyle}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Full Name *', key: 'name', placeholder: 'e.g. Ramesh Kumar' },
              { label: 'Phone Number *', key: 'phone_number', placeholder: 'e.g. 9876543210' },
              { label: 'Location / Area', key: 'location', placeholder: 'e.g. Anna Nagar' },
              { label: 'Password *', key: 'password', placeholder: 'Initial password' },
              { label: 'Delivery Note', key: 'delivery_note', placeholder: 'e.g. Gate 2, ring bell' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label style={fieldLabel}>{label}</label>
                <input
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  style={inputSm}
                />
              </div>
            ))}
          </div>          {/* Subscription */}
          <div style={{ background: 'var(--color-primary-light)', borderRadius: 14, padding: 14, marginTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 10 }}>Subscription Details</div>
            
            {/* Package Selector */}
            <div style={{ marginBottom: 12 }}>
              <label style={fieldLabel}>Select Predefined Package</label>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
                <button
                  type="button"
                  onClick={() => handleSelectPackage({ id: 'custom', name: 'Custom Plan', days: '', price: '', meal_type: '', diet_type: '' })}
                  style={{
                    padding: '8px 12px', background: selectedPkgId === 'custom' ? 'var(--color-primary)' : 'white',
                    color: selectedPkgId === 'custom' ? 'white' : 'var(--color-text-muted)',
                    border: `1.5px solid ${selectedPkgId === 'custom' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  ⚙️ Custom Plan
                </button>
                {packages.map((pkg) => {
                  const isSel = selectedPkgId === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => handleSelectPackage(pkg)}
                      style={{
                        padding: '8px 12px', background: isSel ? 'var(--color-primary)' : 'white',
                        color: isSel ? 'white' : 'var(--color-text-muted)',
                        border: `1.5px solid ${isSel ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      {pkg.name} ({pkg.days}d • ₹{pkg.price})
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div>
                <label style={fieldLabel}>Amount (₹)</label>
                <input
                  type="number"
                  placeholder="2500"
                  disabled={selectedPkgId !== 'custom'}
                  value={form.sub_amount}
                  onChange={(e) => setForm((f) => ({ ...f, sub_amount: e.target.value }))}
                  style={inputSm}
                />
              </div>
              <div>
                <label style={fieldLabel}>Start Date</label>
                <input
                  type="date"
                  value={form.sub_start}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  style={inputSm}
                />
              </div>
              <div>
                <label style={fieldLabel}>End Date</label>
                <input
                  type="date"
                  disabled={selectedPkgId !== 'custom'}
                  value={form.sub_end}
                  onChange={(e) => setForm((f) => ({ ...f, sub_end: e.target.value }))}
                  style={inputSm}
                />
              </div>
            </div>
            {form.sub_start && form.sub_end && (
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', marginTop: 8 }}>
                {countServiceDays(new Date(form.sub_start), new Date(form.sub_end))} service days
              </div>
            )}

            {/* Checkboxes for meal subscription */}
            <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.subscribe_breakfast}
                  onChange={(e) => setForm((f) => ({ ...f, subscribe_breakfast: e.target.checked }))}
                />
                Subscribe Breakfast 🍳
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.subscribe_lunch}
                  onChange={(e) => setForm((f) => ({ ...f, subscribe_lunch: e.target.checked }))}
                />
                Subscribe Lunch 🍱
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.subscribe_dinner}
                  onChange={(e) => setForm((f) => ({ ...f, subscribe_dinner: e.target.checked }))}
                />
                Subscribe Dinner 🌙
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
            <Button variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button loading={saving} onClick={addClient}>Register Client</Button>
          </div>
        </div>
      )}

      {/* Search */}
      <input
        placeholder="🔍 Search by name or location…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ ...inputSm, marginBottom: 16, width: '100%' }}
      />

      {/* Client cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-light)' }}>Loading…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {filtered.map((c) => {
            const status = getSubStatus(c);
            const rem = remainingDays(c);
            const isExpired = status === 'expired';

            return (
              <div key={c.id} style={{
                background: 'white',
                border: `1.5px solid ${isExpired ? '#FECACA' : 'var(--color-border)'}`,
                borderRadius: 16, padding: 16, position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Top stripe */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: 3,
                  background: isExpired ? 'var(--color-error)' : 'var(--color-primary)',
                  borderRadius: '16px 16px 0 0',
                }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)' }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>📞 {c.phone_number || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 2 }}>📍 {c.location || '—'}</div>
                  </div>
                  <Badge variant={status === 'active' ? 'active' : status === 'not_started' ? 'not_started' : 'expired'}>
                    {status === 'active' ? 'Active' : status === 'not_started' ? 'Not Started' : 'Expired'}
                  </Badge>
                </div>

                {isExpired ? (
                  <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '8px 12px', fontSize: 11, color: '#DC2626', fontWeight: 600 }}>
                    {c.end_date ? `Subscription ended ${new Date(c.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'No active subscription'}
                  </div>
                ) : (
                  <div style={{ background: 'var(--color-bg)', borderRadius: 10, padding: '8px 12px', fontSize: 11 }}>
                    {[
                      { label: 'Subscription', value: c.sub_amount ? `₹${Number(c.sub_amount).toLocaleString('en-IN')} / month` : '—' },
                      { label: 'Subscribed Meals', value: [
                        c.subscribe_breakfast === true ? 'Breakfast 🍳' : null,
                        c.subscribe_lunch !== false ? 'Lunch 🍱' : null,
                        c.subscribe_dinner !== false ? 'Dinner 🌙' : null,
                      ].filter(Boolean).join(' + ') || 'None' },
                      { label: 'Expires',       value: c.end_date ? new Date(c.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                      { label: 'Days left',     value: `${rem} days` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ color: 'var(--color-text-light)' }}>{label}</span>
                        <span style={{ fontWeight: 700, color: label === 'Days left' ? 'var(--color-primary)' : 'var(--color-text)' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                  <button
                    onClick={() => {
                      setSelectedClient(c);
                      setRenewForm({ amount: '', start_date: '', end_date: '' });
                      setSelectedRenewPkgId('custom');
                      setShowRenewModal(true);
                    }}
                    style={{ flex: 1, padding: '7px 4px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
                  >
                    Renew
                  </button>
                  <button
                    onClick={() => startEdit(c)}
                    style={{ flex: 1, padding: '7px 4px', background: '#EFF6FF', color: '#3B82F6', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteClient(c.id)}
                    style={{ padding: '7px 8px', background: 'white', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-light)', fontSize: 14 }}>
          No clients found.
        </div>
      )}

      {/* Renew Modal */}
      <Modal open={showRenewModal} onClose={() => { setShowRenewModal(false); setError(''); }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>Renew Subscription</h3>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>For {selectedClient?.name}</p>
        {error && <div style={errorStyle}>{error}</div>}
        {/* Package Selector for Renew */}
        <div style={{ marginBottom: 12 }}>
          <label style={fieldLabel}>Select Predefined Package</label>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
            <button
              type="button"
              onClick={() => handleSelectRenewPackage({ id: 'custom', name: 'Custom Plan', days: '', price: '' })}
              style={{
                padding: '8px 12px', background: selectedRenewPkgId === 'custom' ? 'var(--color-primary)' : 'white',
                color: selectedRenewPkgId === 'custom' ? 'white' : 'var(--color-text-muted)',
                border: `1.5px solid ${selectedRenewPkgId === 'custom' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              ⚙️ Custom Plan
            </button>
            {packages.map((pkg) => {
              const isSel = selectedRenewPkgId === pkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => handleSelectRenewPackage(pkg)}
                  style={{
                    padding: '8px 12px', background: isSel ? 'var(--color-primary)' : 'white',
                    color: isSel ? 'white' : 'var(--color-text-muted)',
                    border: `1.5px solid ${isSel ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  {pkg.name} ({pkg.days}d • ₹{pkg.price})
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <label style={fieldLabel}>Amount (₹)</label>
            <input
              type="number"
              disabled={selectedRenewPkgId !== 'custom'}
              value={renewForm.amount}
              onChange={(e) => setRenewForm((f) => ({ ...f, amount: e.target.value }))}
              style={inputSm}
            />
          </div>
          <div>
            <label style={fieldLabel}>Start Date</label>
            <input
              type="date"
              value={renewForm.start_date}
              onChange={(e) => handleRenewStartDateChange(e.target.value)}
              style={inputSm}
            />
          </div>
          <div>
            <label style={fieldLabel}>End Date</label>
            <input
              type="date"
              disabled={selectedRenewPkgId !== 'custom'}
              value={renewForm.end_date}
              onChange={(e) => setRenewForm((f) => ({ ...f, end_date: e.target.value }))}
              style={inputSm}
            />
          </div>
        </div>
        {renewForm.start_date && renewForm.end_date && (
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 12 }}>
            {countServiceDays(new Date(renewForm.start_date), new Date(renewForm.end_date))} service days
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" fullWidth onClick={() => setShowRenewModal(false)}>Cancel</Button>
          <Button loading={saving} fullWidth onClick={renewSubscription}>Renew</Button>
        </div>
      </Modal>

      {/* Edit Client Modal */}
      <Modal open={showEditModal} onClose={() => { setShowEditModal(false); setError(''); }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>Edit Client Details</h3>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>For {selectedClient?.name}</p>
        {error && <div style={errorStyle}>{error}</div>}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          {[
            { label: 'Full Name *', key: 'name', type: 'text' },
            { label: 'Phone Number *', key: 'phone_number', type: 'text' },
            { label: 'Location / Area', key: 'location', type: 'text' },
            { label: 'Password (leave blank to keep current)', key: 'password', type: 'password' },
            { label: 'Delivery Note', key: 'delivery_note', type: 'text' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label style={fieldLabel}>{label}</label>
              <input
                type={type}
                value={(editForm as any)[key]}
                onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                style={inputSm}
              />
            </div>
          ))}
        </div>

        {/* Subscription section inside client edit */}
        <div style={{ background: 'var(--color-primary-light)', borderRadius: 14, padding: 14, marginTop: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 10 }}>Subscription Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: 'Amount (₹)', key: 'sub_amount', type: 'number', placeholder: 'e.g. 2500' },
              { label: 'Start Date', key: 'start_date', type: 'date' },
              { label: 'End Date', key: 'end_date', type: 'date' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label style={fieldLabel}>{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={(editForm as any)[key]}
                  onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                  style={inputSm}
                />
              </div>
            ))}
          </div>
          {editForm.start_date && editForm.end_date && (
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', marginTop: 8 }}>
              {countServiceDays(new Date(editForm.start_date), new Date(editForm.end_date))} service days
            </div>
          )}

          {/* Checkboxes for meal subscription in edit */}
          <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editForm.subscribe_breakfast}
                onChange={(e) => setEditForm((f) => ({ ...f, subscribe_breakfast: e.target.checked }))}
              />
              Subscribe Breakfast 🍳
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editForm.subscribe_lunch}
                onChange={(e) => setEditForm((f) => ({ ...f, subscribe_lunch: e.target.checked }))}
              />
              Subscribe Lunch 🍱
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editForm.subscribe_dinner}
                onChange={(e) => setEditForm((f) => ({ ...f, subscribe_dinner: e.target.checked }))}
              />
              Subscribe Dinner 🌙
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Button variant="ghost" fullWidth onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button loading={saving} fullWidth onClick={editClient}>Save Changes</Button>
        </div>
      </Modal>

      <CustomConfirmModal
        open={confirmDeactivateId !== null}
        onClose={() => setConfirmDeactivateId(null)}
        onConfirm={handleConfirmDeactivate}
        title="Deactivate Client"
        message="Are you sure you want to deactivate this client? They will no longer appear on active delivery checklists."
        confirmText="Deactivate"
        variant="danger"
      />
    </div>
  );
}

const fieldLabel: React.CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 700,
  color: 'var(--color-text-light)', textTransform: 'uppercase',
  letterSpacing: '0.06em', marginBottom: 4,
};
const inputSm: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  border: '1.5px solid var(--color-border)', borderRadius: 10,
  fontSize: 13, fontWeight: 500, color: 'var(--color-text)',
  background: 'var(--color-bg)', boxSizing: 'border-box',
};
const errorStyle: React.CSSProperties = {
  background: '#FEF2F2', border: '1px solid #FECACA',
  borderRadius: 10, padding: '8px 12px', fontSize: 12,
  fontWeight: 600, color: '#DC2626', marginBottom: 12,
};
