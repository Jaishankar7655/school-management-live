import React from 'react';

export default function StatsCard({ title, value, change, icon: Icon, color = '#1B2A4A' }) {
  const isPositive = typeof change === 'number' ? change >= 0 : false;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '22px 24px',
        backgroundColor: '#fff',
        borderRadius: 10,
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,.04)',
        transition: 'box-shadow .2s, transform .2s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,.07)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Icon circle */}
      {Icon && (
        <div
          style={{
            flexShrink: 0,
            width: 50,
            height: 50,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${color}14`,
            color,
          }}
        >
          <Icon size={24} />
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 500,
            color: '#6b7280',
            lineHeight: 1.3,
          }}
        >
          {title}
        </p>

        <p
          style={{
            margin: '4px 0 0',
            fontSize: 26,
            fontWeight: 700,
            color: '#1B2A4A',
            lineHeight: 1.1,
          }}
        >
          {value}
        </p>

        {typeof change === 'number' && (
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 12,
              fontWeight: 600,
              color: isPositive ? '#059669' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <span style={{ fontSize: 14 }}>{isPositive ? '↑' : '↓'}</span>
            {Math.abs(change)}%
            <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 3 }}>
              vs last month
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
