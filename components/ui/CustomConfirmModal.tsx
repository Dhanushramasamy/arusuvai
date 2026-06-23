'use client';

import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface CustomConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  variant?: 'danger' | 'primary';
}

export default function CustomConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  variant = 'primary',
}: CustomConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} maxWidth={380}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>
          {variant === 'danger' ? '⚠️' : '❓'}
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 8px', fontFamily: 'Georgia, serif' }}>
          {title}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          {message}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="ghost" fullWidth onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'accent' : 'primary'}
          fullWidth
          loading={loading}
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
