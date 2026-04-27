/**
 * rutUtils.js
 * Lógica pura de RUT Chile — sin dependencias React
 * Soporta K como dígito verificador, nunca reemplaza por 0
 */

/**
 * Calcula dígito verificador de RUT
 * Retorna: '0'-'9' | 'K'
 */
export function calcDV(numericStr) {
  const digits = String(parseInt(numericStr, 10))
  if (!digits || isNaN(parseInt(digits, 10))) return null

  let sum = 0
  let mul = 2
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += parseInt(digits[i], 10) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const dv = 11 - (sum % 11)
  if (dv === 11) return '0'
  if (dv === 10) return 'K'
  return String(dv)
}

/**
 * Limpia input: solo números y K
 */
export function cleanRUT(rut) {
  return rut.toUpperCase().replace(/[^0-9K]/g, '')
}

/**
 * Formatea: XX.XXX.XXX-K
 */
export function formatRUT(rut) {
  if (!rut) return ''
  const clean = cleanRUT(rut)
  if (clean.length < 2) return clean

  // Separar DV del resto
  const hasDV  = clean.length >= 2
  const dv     = hasDV ? clean.slice(-1) : ''
  const num    = hasDV ? clean.slice(0, -1) : clean

  if (!num) return dv ? `-${dv}` : ''

  // Formatear parte numérica con puntos
  let formatted = ''
  const len = num.length
  if (len <= 3)      formatted = num
  else if (len <= 6) formatted = num.slice(0, len - 3) + '.' + num.slice(-3)
  else               formatted = num.slice(0, len - 6) + '.' + num.slice(-6, -3) + '.' + num.slice(-3)

  return dv ? `${formatted}-${dv}` : formatted
}

/**
 * Valida RUT completo
 * Retorna: { valid: boolean, error: string | null }
 */
export function validateRUT(rut) {
  if (!rut?.trim()) return { valid: false, error: 'RUT requerido' }

  const clean = cleanRUT(rut)
  if (clean.length < 2) return { valid: false, error: 'RUT incompleto' }

  const dv  = clean.slice(-1)
  const num = clean.slice(0, -1)

  if (!/^[0-9]+$/.test(num))   return { valid: false, error: 'RUT inválido' }
  if (!/^[0-9K]$/.test(dv))    return { valid: false, error: 'Dígito verificador inválido' }

  const expected = calcDV(num)
  if (dv !== expected) {
    return { valid: false, error: `Dígito verificador incorrecto (esperado: ${expected})` }
  }

  return { valid: true, error: null }
}

/**
 * Sanitiza input en tiempo real (para onChange)
 * Solo permite: números, K/k, puntos, guiones
 * Máx 15 caracteres
 */
export function sanitizeRUTInput(input) {
  return input.toUpperCase().replace(/[^0-9K.\-]/g, '').slice(0, 15)
}
