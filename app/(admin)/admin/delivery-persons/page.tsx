'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import { useTranslation } from '@/i18n';

interface DeliveryPerson {
  id: string; name: string; phone_number: string;
  username: string; is_active: boolean; delivered_today: number;
}

export default function AdminDeliveryPersonsPage() {
  const { t } = useTranslation();
  const [persons, setPersons] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [dpToDeactivate, setDpToDeactivate] = useState<DeliveryPerson | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ name: '', phone_number: '', username: '', password: '' });
  const [selectedPerson, setSelectedPerson] = useState<DeliveryPerson | null>(null);
  const [editForm, setEditForm] = useState({ name: '', phone_number: '', username: '', password: '' });

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/delivery-persons');
    const data = await res.json();
    setPersons(data.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  async function add() {
    if (!form.name || !form.phone_number || !form.username || !form.password) {
      setError('All fields are required.');
      return;
    }
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/admin/delivery-persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(t('deliveryPersons.addSuccess'));
        setShowForm(false);
        setForm({ name: '', phone_number: '', username: '', password: '' });
        load();
      } else {
        setError(data.error ?? t('common.error'));
      }
    } catch (e) {
      setError(t('common.error'));
    } finally { setSaving(false); }
  }

  async function confirmDeactivate() {
    if (!dpToDeactivate) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/delivery-persons/${dpToDeactivate.id}`, { method: 'DELETE' });
      setDpToDeactivate(null);
      load();
    } catch (e) {
      setError(t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  function startEdit(p: DeliveryPerson) {
    setSelectedPerson(p);
    setEditForm({
      name: p.name,
      phone_number: p.phone_number || '',
      username: p.username || '',
      password: '',
    });
    setShowEditModal(true);
  }

  async function edit() {
    if (!selectedPerson) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/admin/delivery-persons/${selectedPerson.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(t('deliveryPersons.editSuccess'));
        setShowEditModal(false);
        setSelectedPerson(null);
        load();
      } else {
        setError(data.error ?? t('common.error'));
      }
    } catch (e) {
      setError(t('common.error'));
    } finally { setSaving(false); }
  }

  const COLORS = ['#2C5E2E', '#F5A623', '#3B82F6', '#8B5CF6', '#EF4444'];

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: 700, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-text)', fontFamily: "'Playfair Display', Georgia, serif", margin: 0 }}>
            {t('deliveryPersons.title')}
          </h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-light)', margin: '2px 0 0' }}>
            {persons.filter((p) => p.is_active).length} {t('sub.active').toLowerCase()}
          </p>
        </div>
        <Button onClick={() => { setShowForm((p) => !p); setError(''); setSuccess(''); }}>
          {showForm ? '✕ ' + t('common.cancel') : t('admin.addPerson')}
        </Button>
      </div>

      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

      {/* Add Form */}
      {showForm && (
        <div style={{
          background: 'white', border: '1.5px solid #A8D4A8',
          borderRadius: 16, padding: 18, marginBottom: 20,
          animation: 'slideUp 0.25s ease',
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 14px' }}>{t('deliveryPersons.add')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              { label: t('clients.fullName') + ' *', key: 'name',         placeholder: 'e.g. Murugan' },
              { label: t('clients.phoneNumber') + ' *', key: 'phone_number', placeholder: 'e.g. 99001 23456' },
              { label: t('clients.username') + ' *', key: 'username',     placeholder: 'e.g. murugan_driver' },
              { label: t('clients.password') + ' *', key: 'password',     placeholder: 'Initial password' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label style={fieldLabel}>{label}</label>
                <input
                  placeholder={placeholder}
                  type={key === 'password' ? 'password' : 'text'}
                  value={(form as Record<string, string>)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  style={inputSm}
                />
              </div>
            ))}
          </div>
          <Button loading={saving} onClick={add}>{t('common.add')} →</Button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-light)' }}>{t('common.loading')}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {persons.filter((p) => p.is_active).map((p, idx) => (
            <div key={p.id} style={{
              background: 'white', border: '1.5px solid var(--color-border)',
              borderRadius: 14, padding: '14px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'box-shadow 0.15s ease',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 46, height: 46,
                  background: COLORS[idx % COLORS.length],
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: 18,
                }}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>
                    📞 {p.phone_number || '—'} · @{p.username}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ textAlign: 'right', marginRight: 6 }}>
                  <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 900, color: 'var(--color-primary)' }}>
                    {p.delivered_today ?? 0}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-light)', fontWeight: 600 }}>{t('meal.delivered').toLowerCase()}</div>
                </div>
                <button
                  onClick={() => startEdit(p)}
                  style={{
                    padding: '6px 10px', background: '#EFF6FF', color: '#3B82F6',
                    border: 'none', borderRadius: 8,
                    fontWeight: 700, fontSize: 11, cursor: 'pointer',
                  }}
                >
                  {t('common.edit')}
                </button>
                <button
                  onClick={() => setDpToDeactivate(p)}
                  style={{
                    padding: '6px 10px', background: 'white', color: '#DC2626',
                    border: '1px solid #FECACA', borderRadius: 8,
                    fontWeight: 700, fontSize: 11, cursor: 'pointer',
                  }}
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
          {persons.filter((p) => p.is_active).length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-light)', fontSize: 14 }}>
              {t('common.noData')}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={showEditModal} onClose={() => { setShowEditModal(false); setError(''); }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>{t('deliveryPersons.edit')}</h3>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>For {selectedPerson?.name}</p>
        {[
          { label: t('clients.fullName') + ' *', key: 'name', type: 'text', placeholder: 'Name' },
          { label: t('clients.phoneNumber') + ' *', key: 'phone_number', type: 'text', placeholder: 'Phone Number' },
          { label: t('clients.username') + ' *', key: 'username', type: 'text', placeholder: 'Username' },
          { label: t('clients.password') + ' (' + t('clients.password').toLowerCase() + ' ' + t('clients.expires').toLowerCase() + ')', key: 'password', type: 'password', placeholder: 'New Password' },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={fieldLabel}>{label}</label>
            <input
              type={type}
              placeholder={placeholder}
              value={(editForm as Record<string, string>)[key]}
              onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
              style={{ ...inputSm, width: '100%' }}
            />
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Button variant="ghost" fullWidth onClick={() => setShowEditModal(false)}>{t('common.cancel')}</Button>
          <Button loading={saving} fullWidth onClick={edit}>{t('common.save')}</Button>
        </div>
      </Modal>

      {/* Custom Deactivate Confirm Modal */}
      <Modal open={!!dpToDeactivate} onClose={() => setDpToDeactivate(null)}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>⚠️</div>
          <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 8px' }}>
            {t('deliveryPersons.deactivateConfirm')}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            {t('deliveryPersons.deactivateConfirmBody')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" fullWidth onClick={() => setDpToDeactivate(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            fullWidth
            loading={saving}
            onClick={confirmDeactivate}
            style={{ background: '#DC2626', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700 }}
          >
            {t('deliveryPersons.deactivate')}
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
