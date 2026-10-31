import React from 'react';

export default function EmptyState({
  title = 'No data found',
  message = 'There are no records to display at this time.',
  actionLabel,
  onAction,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        textAlign: 'center',
      }}
    >
      {/* Simple illustrative SVG */}
      <svg
        width="120"
        height="100"
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: 24, opacity: 0.55 }}
      >
        <rect x="20" y="20" width="80" height="60" rx="6" stroke="#1B2A4A" strokeWidth="2" fill="#F5F5F0" />
        <line x1="35" y1="42" x2="85" y2="42" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        <line x1="35" y1="52" x2="75" y2="52" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        <line x1="35" y1="62" x2="65" y2="62" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        <circle cx="95" cy="75" r="18" fill="#F5F5F0" stroke="#E8913A" strokeWidth="2" />
        <line x1="107" y1="88" x2="115" y2="96" stroke="#E8913A" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      <h3
        style={{
          margin: '0 0 8px',
          fontSize: 17,
          fontWeight: 600,
          color: '#1B2A4A',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: '0 0 24px',
          fontSize: 14,
          color: '#6b7280',
          maxWidth: 340,
          lineHeight: 1.55,
        }}
      >
        {message}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '9px 22px',
            fontSize: 13,
            fontWeight: 600,
            color: '#fff',
            backgroundColor: '#E8913A',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'background .15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d17e2f')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E8913A')}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
