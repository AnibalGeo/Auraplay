/**
 * useScheduler.js
 * Hook central de la agenda clínica — AuraPlay
 * Maneja CRUD, recordatorios y sync con sesión activa
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getAllAppointments, saveAppointment, updateAppointment,
  deleteAppointment, addException,
} from './schedulerStorage'
import {
  getAppointmentsForToday, getAppointmentsForWeek,
  getNextAppointment, minutesUntilTime,
} from './schedulerUtils'

export function useScheduler({ onReminder } = {}) {
  const [appointments, setAppointments] = useState([])
  const [loading,      setLoading]      = useState(true)
  const remindersSent  = useRef(new Set())

  // Carga inicial
  useEffect(() => {
    setAppointments(getAllAppointments())
    setLoading(false)
  }, [])

  // Recordatorios 5 min antes
  useEffect(() => {
    if (!onReminder) return
    const interval = setInterval(() => {
      const todayAppts = getAppointmentsForToday(getAllAppointments())
      todayAppts.forEach(a => {
        const minsUntil = minutesUntilTime(a.startTime)
        if (minsUntil === 5 && !remindersSent.current.has(a.id)) {
          remindersSent.current.add(a.id)
          onReminder(a)
        }
      })
    }, 30_000) // chequear cada 30s
    return () => clearInterval(interval)
  }, [onReminder])

  const refresh = useCallback(() => {
    setAppointments(getAllAppointments())
  }, [])

  // CRUD
  const create = useCallback((data) => {
    const appt = saveAppointment(data)
    refresh()
    return appt
  }, [refresh])

  const update = useCallback((id, changes) => {
    const appt = updateAppointment(id, changes)
    refresh()
    return appt
  }, [refresh])

  const remove = useCallback((id) => {
    deleteAppointment(id)
    refresh()
  }, [refresh])

  const markAttendance = useCallback((id, attendance) => {
    return update(id, {
      attendance,
      status: attendance === 'asistió' ? 'completed' : 'no-show',
    })
  }, [update])

  const skipToday = useCallback((id) => {
    const todayStr = new Date().toISOString().slice(0, 10)
    addException(id, todayStr)
    refresh()
  }, [refresh])

  // Vistas derivadas
  const todayAppointments = getAppointmentsForToday(appointments)
  const weekAppointments  = getAppointmentsForWeek(appointments)
  const nextAppointment   = getNextAppointment(appointments)

  return {
    appointments,
    todayAppointments,
    weekAppointments,
    nextAppointment,
    loading,
    refresh,
    create,
    update,
    remove,
    markAttendance,
    skipToday,
  }
}
