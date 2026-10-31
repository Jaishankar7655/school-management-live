import React from 'react';

const baseInput = {
  width: '100%',
  padding: '9px 12px',
  fontSize: 14,
  fontFamily: 'inherit',
  color: '#1B2A4A',
  backgroundColor: '#fff',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
  boxSizing: 'border-box',
};

const errorInput = {
  borderColor: '#ef4444',
  boxShadow: '0 0 0 2px rgba(239,68,68,.12)',
};

const focusRing = {
  borderColor: '#1B2A4A',
  boxShadow: '0 0 0 2px rgba(27,42,74,.1)',
};

export default function FormField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  options = [],
  rows = 4,
  disabled = false,
}) {
  const inputStyle = {
    ...baseInput,
    ...(error ? errorInput : {}),
  };

  const handleFocus = (e) => {
    if (!error) {
      Object.assign(e.target.style, focusRing);
    }
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = error ? '#ef4444' : '#d1d5db';
    e.target.style.boxShadow = error ? '0 0 0 2px rgba(239,68,68,.12)' : 'none';
  };

  const renderInput = () => {
    const common = {
      id: name,
      name,
      value: value ?? '',
      onChange,
      placeholder,
      disabled,
      required,
      onFocus: handleFocus,
      onBlur: handleBlur,
    };

    if (type === 'select') {
      return (
        <select style={{ ...inputStyle, cursor: 'pointer' }} {...common}>
          <option value="">{placeholder || 'Select…'}</option>
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
          rows={rows}
          {...common}
        />
      );
    }

    return <input type={type} style={inputStyle} {...common} />;
  };

  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            display: 'block',
            marginBottom: 5,
            fontSize: 13,
            fontWeight: 600,
            color: '#374151',
          }}
        >
          {label}
          {required && (
            <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>
          )}
        </label>
      )}

      {renderInput()}

      {error && (
        <p
          style={{
            margin: '5px 0 0',
            fontSize: 12,
            color: '#ef4444',
            lineHeight: 1.4,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
