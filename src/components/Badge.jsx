import React from 'react';

const COLOR_MAP = {
  /* green variants */
  active: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
  present: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
  paid: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
  enrolled: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },

  /* red variants */
  inactive: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
  absent: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
  overdue: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
  expelled: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },

  /* yellow/amber variants */
  late: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  pending: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  partial: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },

  /* blue fallback */
  default: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
};

const SIZES = {
  sm: { fontSize: 11, padding: '2px 8px' },
  md: { fontSize: 12, padding: '3px 10px' },
  lg: { fontSize: 13, padding: '4px 14px' },
};

export default function Badge({ status = 'default', size = 'md' }) {
  const key = status.toLowerCase();
  const colors = COLOR_MAP[key] || COLOR_MAP.default;
  const dims = SIZES[size] || SIZES.md;

  return (
    <span
      style={{
        display: 'inline-block',
        borderRadius: 999,
        fontWeight: 600,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        textTransform: 'capitalize',
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.bg,
        color: colors.text,
        ...dims,
      }}
    >
      {status}
    </span>
  );
}
