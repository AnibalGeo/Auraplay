/**
 * useRUT.js
 * Hook React para manejo de RUT Chile en formularios
 */

import { useState } from 'react'
import { formatRUT, validateRUT, sanitizeRUTInput } from '../utils/rutUtils'

export function useRUT(initialValue = '') {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState('')

  function onChange(raw) {
    const sanitized = sanitizeRUTInput(raw)
    const formatted = formatRUT(sanitized)
    setValue(formatted)

    // Validar solo si parece completo (tiene guión)
    if (formatted.includes('-')) {
      const { error: err } = validateRUT(formatted)
      setError(err ?? '')
    } else {
      setError('')
    }
  }

  function onBlur() {
    if (value) {
      const { error: err } = validateRUT(value)
      setError(err ?? '')
    }
  }

  function reset() {
    setValue('')
    setError('')
  }

  const isValid = value.length > 0 && !error && validateRUT(value).valid

  return { value, error, isValid, onChange, onBlur, reset, setValue }
}
