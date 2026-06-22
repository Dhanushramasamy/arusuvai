'use client';

import React, { useEffect, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import { useTranslation } from '@/i18n';
import { countServiceDays } from '@/lib/dateUtils';

interface ClientRow {
  id: string; name: string; phone_number: string; location: string;
  username: string; delivery_note: string; is_active: boolean;
  sub_id?: string; sub_amount?: number; start_date?: string;
  end_date?: string; sub_status?: string; sub_type?: string;
  payment_status?: string;
  subscribe_lunch?: boolean;
  subscribe_dinner?: boolean;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminClientsPage() {
  const { t } = useTranslation();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const [clientToDeactivate, setClientToDeactivate] = useState<ClientRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '', phone_number: '', location: '', username: '',
    password: '', delivery_note: '',
    sub_amount: '', sub_start: '', sub_end: '',
    subscribe_lunch: true, subscribe_dinner: true,
  });

  const [editForm, setEditForm] = useState({
    name: '', phone_number: '', location: '', username: '', password: '', delivery_note: '',
    sub_amount: '', start_date: '', end_date: '',
    subscribe_lunch: true, subscribe_dinner: true,
  });

  const [renewForm, setRenewForm] = useState({
    amount: '', start_date: '', end_date: '',
  });

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
    if (!c.start_date || !c.end_date) return 'expired';
    const start = c.start_date.slice(0, 10);
    const end = c.end_date.slice(0, 10);
    if (todayStr < start) return 'not_started';
    if (todayStr > end) return 'expired';
    return c.sub_status === 'active' ? 'active' : 'expired';
  }

  function remainingDays(c: ClientRow) {
    if (!c.end_date || getSubStatus(c) === 'expired') return 0;
    return countServiceDays(new Date(todayStr), new Date(c.end_date));
  }

  async function addClient() {
    if (!form.name || !form.username || !form.password) {
      setError('Name, Username and Password are required.');
      return;
    }
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(t('clients.addSuccess'));
        setShowAddForm(false);
        setForm({
          name: '', phone_number: '', location: '', username: '', password: '', delivery_note: '',
          sub_amount: '', sub_start: '', sub_end: '', subscribe_lunch: true, subscribe_dinner: true,
        });
        loadClients();
      } else {
        setError(data.error ?? t('common.error'));
      }
    } catch (e) {
      setError(t('common.error'));
    } finally { setSaving(false); }
  }

  async function renewSubscription() {
    if (!selectedClient) return;
    if (!renewForm.amount || !renewForm.start_date || !renewForm.end_date) {
      setError('All fields are required.');
      return;
    }
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/admin/clients/${selectedClient.id}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(renewForm),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(t('clients.editSuccess'));
        setShowRenewModal(false);
        loadClients();
      } else {
        setError(data.error ?? t('common.error'));
      }
    } catch (e) {
      setError(t('common.error'));
    } finally { setSaving(false); }
  }

  async function editClient() {
    if (!selectedClient) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      const body: any = { ...editForm };
      if (!body.password) delete body.password; // do not update password if blank

      const res = await fetch(`/api/admin/clients/${selectedClient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(t('clients.editSuccess'));
        setShowEditModal(false);
        setSelectedClient(null);
        loadClients();
      } else {
        setError(data.error ?? t('common.error'));
      }
    } catch (e) {
      setError(t('common.error'));
    } finally { setSaving(false); }
  }

  async function confirmDeactivate() {
    if (!clientToDeactivate) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/clients/${clientToDeactivate.id}`, { method: 'DELETE' });
      setClientToDeactivate(null);
      loadClients();
    } catch (e) {
      setError(t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  function startEdit(c: ClientRow) {
    setSelectedClient(c);
    setEditForm({
      name: c.name,
      phone_number: c.phone_number || '',
      location: c.location || '',
      username: c.username || '',
      password: '',
      delivery_note: c.delivery_note || '',
      sub_amount: c.sub_amount ? String(c.sub_amount) : '',
      start_date: c.start_date ? c.start_date.slice(0, 10) : '',
      end_date: c.end_date ? c.end_date.slice(0, 10) : '',
      subscribe_lunch: c.subscribe_lunch !== false,
      subscribe_dinner: c.subscribe_dinner !== false,
    });
    setShowEditModal(true);
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-text)', fontFamily: "'Playfair Display', Georgia, serif", margin: 0 }}>
            {t('nav.clients')}
          </h1>
          <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 4 }}>
            {t('clients.total')}: <strong>{filtered.length}</strong> | {t('sub.active')}: <strong>{activeCount}</strong>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowAddForm(true)}>{t('admin.addClient')}</Button>
      </div>

      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder={t('clients.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputSm}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-light)' }}>{t('common.loading')}</div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-light)' }}>{t('common.noData')}</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
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
                        {status === 'active' ? t('sub.active') : status === 'not_started' ? t('sub.notStarted') : t('sub.expired')}
                      </Badge>
                    </div>

                    {isExpired ? (
                      <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '8px 12px', fontSize: 11, color: '#DC2626', fontWeight: 600 }}>
                        {c.end_date ? `${t('sub.expired')} ${new Date(c.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : t('common.noData')}
                      </div>
                    ) : (
                      <div style={{ background: 'var(--color-bg)', borderRadius: 10, padding: '8px 12px', fontSize: 11 }}>
                        {[
                          { label: t('sub.monthly'), value: c.sub_amount ? `₹${Number(c.sub_amount).toLocaleString('en-IN')} / month` : '—' },
                          { label: t('clients.mealsSubscribed'), value: c.subscribe_lunch !== false && c.subscribe_dinner !== false ? `${t('meal.lunch')} + ${t('meal.dinner')}` : c.subscribe_lunch !== false ? `${t('meal.lunch')} Only` : c.subscribe_dinner !== false ? `${t('meal.dinner')} Only` : 'None' },
                          { label: t('clients.expires'),       value: c.end_date ? new Date(c.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                          { label: t('sub.daysLeft'),     value: `${rem} days` },
                        ].map(({ label, value }) => (
                          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ color: 'var(--color-text-light)' }}>{label}</span>
                            <span style={{ fontWeight: 700, color: label === t('sub.daysLeft') ? 'var(--color-primary)' : 'var(--color-text)' }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                      <button
                        onClick={() => { setSelectedClient(c); setRenewForm({ amount: c.sub_amount ? String(c.sub_amount) : '', start_date: '', end_date: '' }); setShowRenewModal(true); }}
                        style={{ flex: 1, padding: '7px 4px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
                      >
                        {t('admin.renewSub')}
                      </button>
                      <button
                        onClick={() => startEdit(c)}
                        style={{ flex: 1, padding: '7px 4px', background: '#EFF6FF', color: '#3B82F6', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => setClientToDeactivate(c)}
                        style={{ flex: 1, padding: '7px 4px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
                      >
                        {t('clients.deactivate')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Add Client Modal */}
      <Modal open={showAddForm} onClose={() => { setShowAddForm(false); setError(''); }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text)', marginBottom: 16 }}>{t('clients.add')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          {[
            { label: t('clients.fullName') + ' *', key: 'name', type: 'text' },
            { label: t('clients.phoneNumber'), key: 'phone_number', type: 'text' },
            { label: t('clients.location'), key: 'location', type: 'text' },
            { label: t('clients.username') + ' *', key: 'username', type: 'text' },
            { label: t('clients.password') + ' *', key: 'password', type: 'password' },
            { label: t('clients.deliveryNote'), key: 'delivery_note', type: 'text' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label style={fieldLabel}>{label}</label>
              <input
                type={type}
                value={(form as any)[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                style={inputSm}
              />
            </div>
          ))}
        </div>

        {/* Subscription section inside add client */}
        <div style={{ background: 'var(--color-primary-light)', borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 10 }}>{t('clients.subDetails')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            {[
              { label: t('common.amount') + ' (₹)', key: 'sub_amount', type: 'number', placeholder: 'e.g. 2500' },
              { label: t('common.start'), key: 'sub_start', type: 'date' },
              { label: t('common.end'), key: 'sub_end', type: 'date' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label style={fieldLabel}>{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  style={inputSm}
                />
              </div>
            ))}
          </div>

          {form.sub_start && form.sub_end && (
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 10 }}>
              {countServiceDays(new Date(form.sub_start), new Date(form.sub_end))} {t('common.serviceDays')}
            </div>
          )}

          {/* Checkboxes for meal subscription */}
          <div style={{ display: 'flex', gap: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.subscribe_lunch}
                onChange={(e) => setForm((f) => ({ ...f, subscribe_lunch: e.target.checked }))}
              />
              {t('meal.lunch')} 🍱
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.subscribe_dinner}
                onChange={(e) => setForm((f) => ({ ...f, subscribe_dinner: e.target.checked }))}
              />
              {t('meal.dinner')} 🌙
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" fullWidth onClick={() => setShowAddForm(false)}>{t('common.cancel')}</Button>
          <Button loading={saving} fullWidth onClick={addClient}>{t('common.add')}</Button>
        </div>
      </Modal>

      {/* Renew Modal */}
      <Modal open={showRenewModal} onClose={() => { setShowRenewModal(false); setError(''); }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>{t('admin.renewSub')}</h3>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>For {selectedClient?.name}</p>
        {[
          { label: t('common.amount') + ' (₹)', key: 'amount', type: 'number' },
          { label: t('common.start'), key: 'start_date', type: 'date' },
          { label: t('common.end'),   key: 'end_date',   type: 'date' },
        ].map(({ label, key, type }) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={fieldLabel}>{label}</label>
            <input
              type={type}
              value={(renewForm as Record<string, string>)[key]}
              onChange={(e) => setRenewForm((f) => ({ ...f, [key]: e.target.value }))}
              style={{ ...inputSm, width: '100%' }}
            />
          </div>
        ))}
        {renewForm.start_date && renewForm.end_date && (
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 12 }}>
            {countServiceDays(new Date(renewForm.start_date), new Date(renewForm.end_date))} {t('common.serviceDays')}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" fullWidth onClick={() => setShowRenewModal(false)}>{t('common.cancel')}</Button>
          <Button loading={saving} fullWidth onClick={renewSubscription}>{t('admin.renewSub')}</Button>
        </div>
      </Modal>

      {/* Edit Client Modal */}
      <Modal open={showEditModal} onClose={() => { setShowEditModal(false); setError(''); }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>{t('clients.edit')}</h3>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>For {selectedClient?.name}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          {[
            { label: t('clients.fullName') + ' *', key: 'name', type: 'text' },
            { label: t('clients.phoneNumber'), key: 'phone_number', type: 'text' },
            { label: t('clients.location'), key: 'location', type: 'text' },
            { label: t('clients.username') + ' *', key: 'username', type: 'text' },
            { label: t('clients.password'), key: 'password', type: 'password' },
            { label: t('clients.deliveryNote'), key: 'delivery_note', type: 'text' },
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
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 10 }}>{t('clients.subDetails')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: t('common.amount') + ' (₹)', key: 'sub_amount', type: 'number', placeholder: 'e.g. 2500' },
              { label: t('common.start'), key: 'start_date', type: 'date' },
              { label: t('common.end'), key: 'end_date', type: 'date' },
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
              {countServiceDays(new Date(editForm.start_date), new Date(editForm.end_date))} {t('common.serviceDays')}
            </div>
          )}

          {/* Checkboxes for meal subscription in edit */}
          <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editForm.subscribe_lunch}
                onChange={(e) => setEditForm((f) => ({ ...f, subscribe_lunch: e.target.checked }))}
              />
              {t('meal.lunch')} 🍱
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editForm.subscribe_dinner}
                onChange={(e) => setEditForm((f) => ({ ...f, subscribe_dinner: e.target.checked }))}
              />
              {t('meal.dinner')} 🌙
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Button variant="ghost" fullWidth onClick={() => setShowEditModal(false)}>{t('common.cancel')}</Button>
          <Button loading={saving} fullWidth onClick={editClient}>{t('common.save')}</Button>
        </div>
      </Modal>

      {/* Custom Deactivate Confirm Modal */}
      <Modal open={!!clientToDeactivate} onClose={() => setClientToDeactivate(null)}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>⚠️</div>
          <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 8px' }}>
            {t('clients.deactivateConfirm')}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            {t('clients.deactivateConfirmBody')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" fullWidth onClick={() => setClientToDeactivate(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            fullWidth
            loading={saving}
            onClick={confirmDeactivate}
            style={{ background: '#DC2626', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700 }}
          >
            {t('clients.deactivate')}
          </Button>
        </div>
      </Modal>
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
