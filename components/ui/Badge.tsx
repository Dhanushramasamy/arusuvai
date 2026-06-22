import React from 'react';

type BadgeVariant = 'active' | 'pending' | 'expired' | 'skipped' | 'delivered' | 'not_available' | 'assigned' | 'paid' | 'unpaid' | 'not_started' | 'approved' | 'rejected';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
}

const styles: Record<BadgeVariant, React.CSSProperties> = {
  active:        { background: '#EBF5EB', color: '#2C5E2E', border: '1px solid #A8D4A8' },
  delivered:     { background: '#EBF5EB', color: '#2C5E2E', border: '1px solid #A8D4A8' },
  paid:          { background: '#EBF5EB', color: '#2C5E2E', border: '1px solid #A8D4A8' },
  assigned:      { background: '#EBF5EB', color: '#2C5E2E', border: '1px solid #A8D4A8' },
  approved:      { background: '#EBF5EB', color: '#2C5E2E', border: '1px solid #A8D4A8' },
  pending:       { background: '#FEF3DC', color: '#D4891A', border: '1px solid #F5A623' },
  unpaid:        { background: '#FEF3DC', color: '#D4891A', border: '1px solid #F5A623' },
  not_available: { background: '#FEF3DC', color: '#D4891A', border: '1px solid #F5A623' },
  expired:       { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' },
  rejected:      { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' },
  skipped:       { background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB' },
  not_started:   { background: '#EFF6FF', color: '#3B82F6', border: '1px solid #BFDBFE' },
};

export default function Badge({ variant, children, dot = false }: BadgeProps) {
  return (
    <span
      style={{
        ...styles[variant],
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'currentColor',
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </span>
  );
}
