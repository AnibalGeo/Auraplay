/**
 * TodayAgenda.jsx
 * Agenda del día — AuraPlay Scheduler
 */

import { useState } from 'react'
import {
  getAppointmentTimeStatus, STATUS_COLORS,
  endTime, formatDuration, DAY_NAMES, todayDayOfWeek,
} from '../schedulerUtils'

// ── AppointmentCard ────────────────────────────────────────────────────────────

function AppointmentCard({ appt, onEdit, onAttendance, onSkip, onStartSession }) {
  const [expanded, setExpanded] = useState(false)
  const timeStatus = getAppointmentTimeStatus(appt)
  const colors     = STATUS_COLORS[appt.attendance === 'no-asistió' ? 'no-show' : appt.attendance === 'asistió' ? 'completed' : timeStatus]
  const end        = endTime(appt.startTime, appt.duration)

  const statusLabel = {
    upcoming:  'Próxima',
    soon:      'En 5 min',
    now:       'En curso',
    past:      'Pasada',
    future:    '',
    completed: 'Completada',
    'no-show': 'No asistió',
  }

  return (
    <div
      className="bg-white rounded-2xl border overflow-hidden transition-all"
      style={{ borderColor: colors.border }}
    >
      {/* Barra de estado superior */}
      <div className="h-1" style={{ background: colors.dot }} />

      <div className="px-4 pt-3 pb-2">
        {/* Fila principal */}
        <div className="flex items-start gap-3">
          {/* Hora */}
          <div className="text-center shrink-0">
            <p className="text-lg font-black leading-none" style={{ color: colors.text }}>{appt.startTime}</p>
            <p className="text-xs text-gray-400 mt-0.5">{end}</p>
          </div>

          {/* Divisor */}
          <div className="w-px self-stretch" style={{ background: colors.border }} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-bold text-gray-800 truncate">{appt.patientName}</p>
              {!appt.isRegistered && (
                <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-md font-medium shrink-0">
                  Ad-hoc
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">{formatDuration(appt.duration)}</p>
            {appt.notes && (
              <p className="text-xs text-gray-500 mt-1 truncate">{appt.notes}</p>
            )}
          </div>

          {/* Badge estado */}
          {(timeStatus === 'soon' || timeStatus === 'now' || appt.attendance) && (
            <span
              className="text-xs font-semibold px-2 py-1 rounded-lg shrink-0"
              style={{ background: colors.bg, color: colors.text }}
            >
              {statusLabel[appt.attendance === 'asistió' ? 'completed' : appt.attendance === 'no-asistió' ? 'no-show' : timeStatus]}
            </span>
          )}

          {/* Toggle */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs shrink-0 hover:bg-gray-200 transition-colors"
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>

        {/* Acciones expandidas */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            {/* Asistencia */}
            {!appt.attendance && (
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1.5">Registrar asistencia</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAttendance(appt.id, 'asistió')}
                    className="flex-1 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >✓ Asistió</button>
                  <button
                    onClick={() => onAttendance(appt.id, 'no-asistió')}
                    className="flex-1 py-2 text-xs font-semibold text-red-500 bg-red-50 rounded-xl border border-red-200 hover:bg-red-100 transition-colors"
                  >✗ No asistió</button>
                </div>
              </div>
            )}

            {/* Asistencia registrada */}
            {appt.attendance && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: colors.bg }}>
                <span className="text-sm">{appt.attendance === 'asistió' ? '✓' : '✗'}</span>
                <span className="text-xs font-semibold" style={{ color: colors.text }}>
                  {appt.attendance === 'asistió' ? 'Asistió a la sesión' : 'No asistió'}
                </span>
                <button
                  onClick={() => onAttendance(appt.id, null)}
                  className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline"
                >Deshacer</button>
              </div>
            )}

            {/* Acciones secundarias */}
            <div className="flex gap-2">
              {appt.isRegistered && (
                <button
                  onClick={() => onStartSession(appt.patientId)}
                  className="flex-1 py-2 text-xs font-semibold text-teal-600 bg-teal-50 rounded-xl border border-teal-200 hover:bg-teal-100 transition-colors"
                >▶ Iniciar sesión</button>
              )}
              <button
                onClick={() => onEdit(appt)}
                className="py-2 px-3 text-xs font-semibold text-gray-500 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
              >✏️</button>
              <button
                onClick={() => onSkip(appt.id)}
                className="py-2 px-3 text-xs font-semibold text-amber-500 bg-amber-50 rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors"
              >⏭ Saltar hoy</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── TodayAgenda ───────────────────────────────────────────────────────────────

export default function TodayAgenda({ appointments, onEdit, onAttendance, onSkip, onStartSession, onNew }) {
  const dow  = todayDayOfWeek()
  const date = new Date().toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  const completed = appointments.filter(a => a.attendance === 'asistió').length
  const pending   = appointments.filter(a => !a.attendance).length

  return (
    <div className="space-y-4">
      {/* Header del día */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium capitalize">{date}</p>
          <h2 className="text-xl font-black text-gray-800 leading-tight">Hoy</h2>
        </div>
        <div className="flex items-center gap-2">
          {appointments.length > 0 && (
            <span className="text-xs text-gray-400">
              {completed}/{appointments.length} completadas
            </span>
          )}
          <button
            onClick={onNew}
            className="w-9 h-9 bg-teal-500 hover:bg-teal-600 text-white rounded-xl flex items-center justify-center text-lg font-bold transition-colors"
          >+</button>
        </div>
      </div>

      {/* Sin citas hoy */}
      {appointments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl mb-4">
            {dow ? '☀️' : '🏖️'}
          </div>
          <h3 className="text-sm font-bold text-gray-600 mb-1">
            {dow ? 'Hoy sin citas' : 'Fin de semana'}
          </h3>
          <p className="text-xs text-gray-400 mb-5 max-w-xs">
            {dow
              ? 'No tienes sesiones agendadas para hoy.'
              : 'Hoy es fin de semana. Descansa — tus pacientes también.'}
          </p>
          {dow && (
            <button
              onClick={onNew}
              className="px-5 py-2.5 bg-teal-500 text-white text-sm font-bold rounded-xl hover:bg-teal-600 transition-colors"
            >+ Agendar cita</button>
          )}
        </div>
      )}

      {/* Cards */}
      {appointments.map(appt => (
        <AppointmentCard
          key={appt.id}
          appt={appt}
          onEdit={onEdit}
          onAttendance={onAttendance}
          onSkip={onSkip}
          onStartSession={onStartSession}
        />
      ))}

      {/* Resumen si hay citas */}
      {appointments.length > 0 && pending === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-2xl border border-emerald-100">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="text-sm font-bold text-emerald-700">¡Jornada completa!</p>
            <p className="text-xs text-emerald-600">Todas las citas de hoy están registradas.</p>
          </div>
        </div>
      )}
    </div>
  )
}
