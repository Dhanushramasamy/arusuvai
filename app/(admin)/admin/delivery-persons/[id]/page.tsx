'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { swrFetch } from '@/lib/clientCache';

interface DeliveryLog {
  id: string;
  date: string;
  meal_type: string;
  client_name: string;
  client_location: string;
  status: string;
}

interface DeliveryPerson {
  id: string;
  name: string;
  phone_number: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DeliveryPersonDetailsPage({ params }: PageProps) {
  const { id } = React.use(params);
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState<DeliveryPerson | null>(null);
  const [logs, setLogs] = useState<DeliveryLog[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('this_month'); // 'this_month', 'last_month', 'all_time'

  useEffect(() => {
    setLoading(true);
    const unsub = swrFetch(`/api/admin/delivery-persons/${id}/logs?filter=${filter}`, (json) => {
      if (json.success) {
        setPerson(json.data.person);
        setLogs(json.data.logs);
        setTotal(json.data.totalDeliveries);
      }
      setLoading(false);
    }, { bypassCache: true }); // Always bypass cache for logs to ensure freshness when switching filters

    return unsub;
  }, [id, filter]);

  if (loading && !person) {
    return <div style={{ textAlign: 'center', padding: 50, color: 'var(--color-text-light)' }}>Loading details…</div>;
  }

  if (!person) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p style={{ color: 'var(--color-error)', fontWeight: 600 }}>Delivery person not found.</p>
        <Link href="/admin/delivery-persons" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>← Back to List</Link>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <Link href="/admin/delivery-persons" style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
          ← Back to Delivery Persons
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-text)', fontFamily: 'Georgia, serif', margin: 0 }}>
              {person.name}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-light)', margin: '4px 0 0' }}>
              📞 {person.phone_number || 'No phone number provided'}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '8px 14px', borderRadius: 10, border: '1.5px solid var(--color-border)', 
                fontSize: 13, fontWeight: 600, color: 'var(--color-text)', background: 'white', cursor: 'pointer'
              }}
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Previous Month</option>
              <option value="all_time">All Time</option>
            </select>
            
            <div style={{ background: '#EBF5EB', padding: '10px 16px', borderRadius: 12, border: '1.5px solid #C8D8C8', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#2C5E2E', lineHeight: 1 }}>{total}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#5C6E5C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deliveries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div style={{ background: 'white', border: '1.5px solid var(--color-border)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
           <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-light)' }}>Loading logs...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>
             No deliveries recorded for the selected time period.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg)', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={thStyle}>Date & Meal</th>
                  <th style={thStyle}>Client</th>
                  <th style={thStyle}>Location</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text)' }}>
                        {new Date(log.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 2 }}>{log.meal_type}</div>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--color-text)' }}>
                      {log.client_name || 'Unknown Client'}
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--color-text-muted)', fontSize: 12 }}>
                      {log.client_location || '—'}
                    </td>
                    <td style={tdStyle}>
                      <Badge variant={log.status === 'delivered' ? 'delivered' : log.status === 'not_available' ? 'not_available' : log.status === 'skipped' ? 'skipped' : 'pending'}>
                        {log.status === 'delivered' ? '✓ Delivered' : log.status === 'not_available' ? 'Not Available' : log.status === 'skipped' ? 'Skipped' : 'Pending'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px', fontSize: 11, fontWeight: 800, color: 'var(--color-text-light)', 
  textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap'
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px', fontSize: 13
};
