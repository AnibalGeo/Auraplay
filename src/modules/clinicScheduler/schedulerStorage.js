/**
 * schedulerStorage.js
 * CRUD de citas clínicas — AuraPlay Agenda
 * Storage: auraplay_schedule_{username}
 */

import { getTherapistCreds } from '../../context/AuthContext'

const SCHEMA_VERSION = '1.0'

function storageKey() {
  const creds = getTherapistCreds()
  return `auraplay_schedule_${creds?.username ?? 'default'}`
}

const DEFAULT_SETTINGS = {
  workHours:       { start: '08:00', end: '19:00' },
  defaultDuration: 45,
  bufferMinutes:   15,
}

function loadStore() {
  try {
    const raw = localStorage.getItem(storageKey())
    if (!raw) return { version: SCHEMA_VERSION, appointments: [], settings: DEFAULT_SETTINGS }
    return JSON.parse(raw)
  } catch { return { version: SCHEMA_VERSION, appointments: [], settings: DEFAULT_SETTINGS } }
}

function persistStore(store) {
  try { localStorage.setItem(storageKey(), JSON.stringify(store)) }
  catch { console.warn('schedulerStorage: error al persistir') }
}

// ── Settings ──────────────────────────────────────────────────────────────────

export function getSchedulerSettings() {
  return loadStore().settings ?? DEFAULT_SETTINGS
}

export function updateSchedulerSettings(changes) {
  const store = loadStore()
  store.settings = { ...DEFAULT_SETTINGS, ...store.settings, ...changes }
  persistStore(store)
  return store.settings
}

// ── CRUD citas ────────────────────────────────────────────────────────────────

export function getAllAppointments() {
  return loadStore().appointments ?? []
}

export function getAppointmentById(id) {
  return getAllAppointments().find(a => a.id === id) ?? null
}

export function saveAppointment(data) {
  const store = loadStore()
  const now   = new Date().toISOString()
  const appt  = {
    id:             `appt_${Date.now()}`,
    patientId:      data.patientId ?? null,
    patientName:    data.patientName ?? '',
    patientPhone:   data.patientPhone ?? '',
    isRegistered:   Boolean(data.patientId),
    dayOfWeek:      data.dayOfWeek,        // 1=Lun … 5=Vie
    startTime:      data.startTime,        // 'HH:MM'
    duration:       data.duration ?? 45,   // minutos
    bufferAfter:    data.bufferAfter ?? 15,
    status:         'scheduled',
    attendance:     null,                  // 'asistió' | 'no-asistió' | null
    actualDuration: null,
    notes:          data.notes ?? '',
    followUpNotes:  '',
    recurring: {
      type:       data.recurringType ?? 'weekly', // 'weekly'|'biweekly'|'monthly'|null
      endDate:    data.endDate ?? null,
      exceptions: [],
    },
    version:   SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
  }
  store.appointments.push(appt)
  persistStore(store)
  return appt
}

export function updateAppointment(id, changes) {
  const store = loadStore()
  const idx   = store.appointments.findIndex(a => a.id === id)
  if (idx === -1) return null
  store.appointments[idx] = {
    ...store.appointments[idx],
    ...changes,
    id,
    updatedAt: new Date().toISOString(),
  }
  persistStore(store)
  return store.appointments[idx]
}

export function deleteAppointment(id) {
  const store = loadStore()
  store.appointments = store.appointments.filter(a => a.id !== id)
  persistStore(store)
  return true
}

export function addException(id, dateStr) {
  const appt = getAppointmentById(id)
  if (!appt) return null
  const exceptions = [...(appt.recurring?.exceptions ?? []), dateStr]
  return updateAppointment(id, { recurring: { ...appt.recurring, exceptions } })
}
