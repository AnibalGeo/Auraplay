/**
 * RUTInput.jsx
 * Input RUT Chile con validación y autoformato
 * Mobile-friendly: inputMode="text" para permitir K en teclado
 */

import { useRUT } from '../hooks/useRUT'

export default function RUTInput({ value, onChange, onBlur, error, label = 'RUT', placeholder = 'Ej: 12.345.678-9', disabled = false, style = {} }) {
  const hasError = !!error

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>{label}</label>
      )}
      <input
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 12,
          border: `1.5px solid ${hasError ? '#e07a5f' : '#ddd'}`,
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: 1,
          color: '#1a1a1a',
          background: disabled ? '#f5f5f5' : 'white',
          outline: 'none',
          transition: 'border-color 0.15s',
          boxSizing: 'border-box',
        }}
      />
      {error && (
        <span style={{ fontSize: 12, color: '#e07a5f', fontWeight: 500 }}>
          ⚠️ {error}
        </span>
      )}
    </div>
  )
}
