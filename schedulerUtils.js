/**
 * schedulerUtils.js
 * Funciones de fecha, slots, y lógica de citas — AuraPlay Agenda
 */

export const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
export const DAY_SHORT = ['', 'Lun',   'Mar',    'Mié',       'Jue',    'Vie']

export const DURATION_OPTIONS = [
  { value: 30,  label: '30 min' },
  { value: 45,  label: '45 min' },
  { value: 60,  label: '60 min' },
  { value: 90,  label: '90 min' },
]

export const RECURRING_OPTIONS = [
  { value: 'weekly',    label: 'Semanal' },
  { value: 'biweekly',  label: 'Quincenal' },
  { value: 'monthly',   label: 'Mensual' },
  { value: null,        label: 'Solo esta vez' },
]

// ── Tiempo ────────────────────────────────────────────────────────────────────

/** 'HH:MM' → minutos desde medianoche */
export function timeToMinutes(t) {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/** minutos → 'HH:MM' */
export function minutesToTime(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, '0')
  const m = (mins % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

/** Calcula hora de fin en 'HH:MM' */
export function endTime(startTime, duration) {
  return minutesToTime(timeToMinutes(startTime) + duration)
}

/** Minutos hasta HH:MM desde ahora */
export function minutesUntilTime(timeStr) {
  const now  = new Date()
  const nowM = now.getHours() * 60 + now.getMinutes()
  return timeToMinutes(timeStr) - nowM
}

// ── Día de semana ─────────────────────────────────────────────────────────────

/** Date → 1 (lun) … 5 (vie) … null si fin de semana */
export function todayDayOfWeek() {
  const d = new Date().getDay() // 0=dom … 6=sab
  if (d === 0 || d === 6) return null
  return d  // 1=lun … 5=vie
}

/** dayOfWeek (1-5) → próxima fecha con ese día de semana */
export function nextDateForDay(dayOfWeek) {
  const today = new Date()
  const td    = today.getDay() === 0 ? 7 : today.getDay() // iso
  let diff    = dayOfWeek - td
  if (diff <= 0) diff += 7
  const d = new Date(today)
  d.setDate(today.getDate() + diff)
  return d
}

/** Date → 'YYYY-MM-DD' */
export function dateToKey(date) {
  return date.toISOString().slice(0, 10)
}

/** Fecha legible, ej: 'Jueves 15 mayo' */
export function formatDateLabel(date) {
  return date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
}

// ── Filtros de citas ──────────────────────────────────────────────────────────

/**
 * Retorna citas activas del día (por dayOfWeek, sin excepciones de fecha).
 * Ordena por startTime.
 */
export function getAppointmentsForToday(appointments) {
  const dow = todayDayOfWeek()
  if (!dow) return []

  const todayStr = dateToKey(new Date())

  return appointments
    .filter(a => {
      if (a.status === 'cancelled') return false
      if (a.dayOfWeek !== dow) return false
      // Respetar excepciones
      if (a.recurring?.exceptions?.includes(todayStr)) return false
      // Respetar endDate
      if (a.recurring?.endDate && todayStr > a.recurring.endDate) return false
      return true
    })
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
}

/**
 * Retorna citas de la semana actual agrupadas por dayOfWeek.
 * { 1: [...], 2: [...], 3: [...], 4: [...], 5: [...] }
 */
export function getAppointmentsForWeek(appointments) {
  const week = { 1: [], 2: [], 3: [], 4: [], 5: [] }
  const todayStr = dateToKey(new Date())

  appointments.forEach(a => {
    if (a.status === 'cancelled') return
    const dow = a.dayOfWeek
    if (!week[dow]) return
    if (a.recurring?.exceptions?.includes(todayStr)) return
    if (a.recurring?.endDate && todayStr > a.recurring.endDate) return
    week[dow].push(a)
  })

  Object.keys(week).forEach(d => {
    week[d].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
  })

  return week
}

/**
 * Próxima cita futura desde ahora (para HomeModeScreen familia)
 */
export function getNextAppointment(appointments) {
  const dow    = todayDayOfWeek()
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()

  // Primero buscar hoy si hay alguna que no pasó
  if (dow) {
    const todayPending = getAppointmentsForToday(appointments).find(
      a => timeToMinutes(a.startTime) > nowMin
    )
    if (todayPending) return { appointment: todayPending, daysUntil: 0 }
  }

  // Buscar en los próximos días
  for (let offset = 1; offset <= 7; offset++) {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    const wd = d.getDay()
    if (wd === 0 || wd === 6) continue  // fin de semana
    const isoWd = wd
    const dayAppts = appointments.filter(
      a => a.dayOfWeek === isoWd && a.status !== 'cancelled'
    ).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
    if (dayAppts.length > 0) return { appointment: dayAppts[0], daysUntil: offset }
  }

  return null
}

/**
 * Detectar conflicto de horario al crear/editar cita
 */
export function detectConflict(appointments, dayOfWeek, startTime, duration, excludeId = null) {
  const newStart = timeToMinutes(startTime)
  const newEnd   = newStart + duration

  return appointments.find(a => {
    if (a.id === excludeId) return false
    if (a.dayOfWeek !== dayOfWeek) return false
    if (a.status === 'cancelled') return false
    const aStart = timeToMinutes(a.startTime)
    const aEnd   = aStart + a.duration + (a.bufferAfter ?? 0)
    return newStart < aEnd && newEnd > aStart
  }) ?? null
}

/**
 * Estado visual de una cita según hora actual
 */
export function getAppointmentTimeStatus(appt) {
  const dow    = todayDayOfWeek()
  if (appt.dayOfWeek !== dow) return 'future'

  const nowMin   = new Date().getHours() * 60 + new Date().getMinutes()
  const startMin = timeToMinutes(appt.startTime)
  const endMin   = startMin + appt.duration

  if (nowMin < startMin - 5) return 'upcoming'    // más de 5 min antes
  if (nowMin >= startMin - 5 && nowMin < startMin) return 'soon'  // 5 min antes
  if (nowMin >= startMin && nowMin < endMin)        return 'now'   // en curso
  return 'past'                                                    // ya pasó
}

/** Formato amigable de duración */
export function formatDuration(mins) {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

/** Colores por estado */
export const STATUS_COLORS = {
  upcoming:  { bg: '#f0fdf4', border: '#86efac', text: '#16a34a', dot: '#22c55e' },
  soon:      { bg: '#fefce8', border: '#fde047', text: '#ca8a04', dot: '#eab308' },
  now:       { bg: '#eff6ff', border: '#93c5fd', text: '#2563eb', dot: '#3b82f6' },
  past:      { bg: '#f9fafb', border: '#e5e7eb', text: '#9ca3af', dot: '#d1d5db' },
  future:    { bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280', dot: '#9ca3af' },
  completed: { bg: '#f0fdf4', border: '#86efac', text: '#15803d', dot: '#22c55e' },
  'no-show': { bg: '#fff1f2', border: '#fca5a5', text: '#dc2626', dot: '#ef4444' },
}

/** Genera slots de hora disponibles entre workHours */
export function generateTimeSlots(start = '08:00', end = '19:00', step = 15) {
  const slots = []
  let cur = timeToMinutes(start)
  const fin = timeToMinutes(end)
  while (cur < fin) {
    slots.push(minutesToTime(cur))
    cur += step
  }
  return slots
}
