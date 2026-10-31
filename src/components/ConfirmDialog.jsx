import React from 'react';
import Modal from './Modal';
import {
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlineShieldExclamation,
} from 'react-icons/hi2';

const TYPE_CONFIG = {
  danger: {
    icon: HiOutlineShieldExclamation,
    color: '#dc2626',
    bg: '#fef2f2',
    confirmBg: '#dc2626',
    confirmHover: '#b91c1c',
  },
  warning: {
    icon: HiOutlineExclamationTriangle,
    color: '#d97706',
    bg: '#fffbeb',
    confirmBg: '#d97706',
    confirmHover: '#b45309',
  },
  info: {
    icon: HiOutlineInformationCircle,
    color: '#2563eb',
    bg: '#eff6ff',
    confirmBg: '#2563eb',
    confirmHover: '#1d4ed8',
  },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = '',
  type = 'danger',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const IconComp = cfg.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
        {/* Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            margin: '0 auto 18px',
            borderRadius: '50%',
            backgroundColor: cfg.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconComp size={28} color={cfg.color} />
        </div>

        {/* Message */}
        <p style={{ margin: '0 0 28px', fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>
          {message}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 22px',
              fontSize: 13,
              fontWeight: 600,
              color: '#374151',
              background: '#fff',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'background .15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
          >
            {cancelLabel}
          </button>

          <button
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
            style={{
              padding: '9px 22px',
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
              backgroundColor: cfg.confirmBg,
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'background .15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cfg.confirmHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cfg.confirmBg)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
