import React from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  onClose?: () => void;
}

export default function Alert({ type, children, onClose }: AlertProps) {
  const styles = {
    success: { background: '#EBF5EB', border: '1.5px solid #A8D4A8', color: '#2C5E2E' },
    error:   { background: '#FEF2F2', border: '1.5px solid #FECACA', color: '#DC2626' },
    warning: { background: '#FFFBEB', border: '1.5px solid #FDE68A', color: '#B45309' },
    info:    { background: '#EFF6FF', border: '1.5px solid #BFDBFE', color: '#1E40AF' },
  };

  return (
    <div style={{
      ...styles[type],
      borderRadius: 12,
      padding: '12px 16px',
      fontSize: 13,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>
          {type === 'success' ? '✓' : type === 'error' ? '⚠' : type === 'warning' ? '⚡' : 'ℹ'}
        </span>
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'currentColor',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 800,
            padding: '2px 6px',
            opacity: 0.7,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
