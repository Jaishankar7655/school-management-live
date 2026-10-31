import React from 'react';
import { HiOutlineMagnifyingGlass, HiOutlinePlus } from 'react-icons/hi2';

export default function SearchFilter({
  searchValue = '',
  onSearchChange,
  filters = [],
  onFilterChange,
  onAdd,
  addLabel = 'Add New',
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 20,
      }}
    >
      {/* Search */}
      <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 340 }}>
        <HiOutlineMagnifyingGlass
          size={17}
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search…"
          style={{
            width: '100%',
            padding: '9px 12px 9px 38px',
            fontSize: 13,
            fontFamily: 'inherit',
            color: '#1B2A4A',
            backgroundColor: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color .15s',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#1B2A4A')}
          onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
        />
      </div>

      {/* Filters */}
      {filters.map((filter) => (
        <select
          key={filter.name}
          onChange={(e) => onFilterChange?.(filter.name, e.target.value)}
          style={{
            padding: '9px 12px',
            fontSize: 13,
            fontFamily: 'inherit',
            color: '#374151',
            backgroundColor: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            outline: 'none',
            cursor: 'pointer',
            minWidth: 140,
          }}
        >
          <option value="">{filter.label}</option>
          {(filter.options || []).map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
      ))}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Add button */}
      {onAdd && (
        <button
          onClick={onAdd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 20px',
            fontSize: 13,
            fontWeight: 600,
            color: '#fff',
            backgroundColor: '#E8913A',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'background .15s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d17e2f')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E8913A')}
        >
          <HiOutlinePlus size={16} />
          {addLabel}
        </button>
      )}
    </div>
  );
}
