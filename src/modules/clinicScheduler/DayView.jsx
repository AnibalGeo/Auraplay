/**
 * DayView.jsx
 * Vista de un día específico desde el calendario mensual — AuraPlay Scheduler
 * Bottom sheet: muestra citas del día + historial rápido del paciente
 *
 * Sub-componente PatientQuickHistory:
 * Últimas 4 sesiones del paciente: nota clínica + actividades trabajadas
 */

import { useState, useMemo } from 'react'
import { getPatientById }    from '../../data/patients'
import {
  DAY_NAMES, endTime, formatDuration,
  getAppointmentTimeStatus, STATUS_COLORS, timeToMinutes,
} from './schedulerUtils'

// ── Helpers ───────────────────────────────────────────────────────────────────

const ACTIVITY_EMOJIS = {
  'minimal-pairs':        '👂',
  'build-word':           '🔤',
  'listen':               '🎧',
  'syntax':               '📝',
  'semantic':             '💡',
  'narrative':            '📖',
  'pragmatic':            '🧠',
  'rhyme':                '🎵',
  'point-image':          '👆',
  'category':             '🔍',
  'follow-instruction':   '📢',
  'communicative-intent': '💬',
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

function formatShortDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

// ── PatientQuickHistory ────────────────────────────────────────────────────────

function PatientQuickHistory({ patientId, onClose }) {
  const patient = getPatientById(patientId)

  if (!patient) return (
    <div className="text-center py-6 text-gray-400 text-sm">Paciente no encontrado</div>
  )

  const history = (patient.sessionHistory ?? [])
    .filter(e => e.type === 'activity' || e.type === 'nota_clinica' || e.type === 'note')
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  // Agrupar por fecha de sesión (misma fecha = misma sesión)
  const sessionGroups = []
  history.forEach(entry => {
    const dateKey = entry.date?.slice(0, 10)
    const existing = sessionGroups.find(g => g.dateKey === dateKey)
    if (existing) {
      existing.entries.push(entry)
    } else {
      sessionGroups.push({ dateKey, date: entry.date, entries: [entry] })
    }
  })

  const last4 = sessionGroups.slice(0, 4)

  return (
    <div className="space-y-3">
      {/* Header paciente */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-xl shrink-0">
          {patient.profilePhoto
            ? <img src={patient.profilePhoto} alt="" className="w-full h-full rounded-xl object-cover" />
            : '🧒'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{patient.name}</p>
          <p className="text-xs text-gray-400">{patient.levelId} · Últimas 4 sesiones</p>
        </div>
      </div>

      {/* Sesiones */}
      {last4.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-2xl">
          <p className="text-2xl mb-2">📭</p>
          <p className="text-sm text-gray-400">Sin sesiones registradas aún</p>
        </div>
      )}

      {last4.map((group, gi) => {
        const notes = group.entries.filter(e => e.type === 'nota_clinica' || e.type === 'note')
        const activities = group.entries.filter(e => e.type === 'activity')

        return (
          <div key={gi} className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
            {/* Fecha sesión */}
            <div className="px-4 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-600 capitalize">{formatShortDate(group.date)}</p>
              <div className="flex items-center gap-1">
                {activities.length > 0 && (
                  <span className="text-xs bg-teal-100 text-teal-700 font-semibold px-2 py-0.5 rounded-md">
                    {activities.length} actividad{activities.length > 1 ? 'es' : ''}
                  </span>
                )}
                {notes.length > 0 && (
                  <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-md">
                    📋 nota
                  </span>
                )}
              </div>
            </div>

            <div className="px-4 py-3 space-y-3">
              {/* Notas clínicas */}
              {notes.map((n, ni) => (
                <div key={ni} className="space-y-1">
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Nota clínica</p>
                  {n.notes && (
                    <p className="text-xs text-gray-600 leading-relaxed bg-purple-50 rounded-xl px-3 py-2 border border-purple-100">
                      {n.notes}
                    </p>
                  )}
                  {n.testsApplied?.length > 0 && (
                    <p className="text-xs text-gray-400">Tests: {n.testsApplied.join(', ')}</p>
                  )}
                </div>
              ))}

              {/* Actividades */}
              {activities.length > 0 && (
                <div className="space-y-2">
                  {notes.length > 0 && (
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Actividades</p>
                  )}
                  {activities.map((a, ai) => {
                    const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : null
                    const color = pct >= 80 ? '#4aab8a' : pct >= 60 ? '#e8a020' : '#e07a5f'
                    return (
                      <div key={ai} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2 border border-gray-100">
                        <span className="text-lg shrink-0">
                          {ACTIVITY_EMOJIS[a.activityId] || '📌'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700 truncate">
                            {a.activityLabel || a.activityId}
                          </p>
                          {a.clinicalNote && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">{a.clinicalNote}</p>
                          )}
                        </div>
                        {pct !== null && (
                          <span className="text-xs font-bold shrink-0" style={{ color }}>
                            {pct}%
                          </span>
                        )}
                        {a.earned > 0 && (
                          <span className="text-xs shrink-0">{'⭐'.repeat(a.earned)}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── AppointmentRow (dentro de DayView) ────────────────────────────────────────

function AppointmentRow({ appt, onEdit, onAttendance, onStartSession, onShowHistory }) {
  const [expanded, setExpanded] = useState(false)
  const timeStatus = getAppointmentTimeStatus(appt)
  const statusKey  = appt.attendance === 'asistió' ? 'completed'
    : appt.attendance === 'no-asistió' ? 'no-show'
    : timeStatus
  const colors = STATUS_COLORS[statusKey]
  const end    = endTime(appt.startTime, appt.duration)

  return (
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: colors.border }}>
      <div className="h-1" style={{ background: colors.dot }} />
      
      {/* Header clickeable — zona táctil 56px mínimo */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100"
        style={{ minHeight: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Hora */}
          <div style={{ textAlign: 'center', minWidth: '48px', flexShrink: 0 }}>
            <p style={{ fontSize: 16, fontWeight: 900, lineHeight: 1, color: colors.text }}>{appt.startTime}</p>
            <p style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{end}</p>
          </div>
          <div style={{ width: 1, alignSelf: 'stretch', background: colors.border }} />
          
          {/* Info paciente */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: '0 0 2px' }}>
              {appt.patientName}
            </p>
            <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
              {formatDuration(appt.duration)}
              {appt.isRegistered && appt.patientId ? '' : ' · Puntual'}
            </p>
          </div>
        </div>

        {/* Chevron */}
        <div style={{ color: colors.text, marginLeft: 8, fontSize: 14, fontWeight: 700 }}>
          {expanded ? '▲' : '▼'}
        </div>
      </button>

      {/* Acciones expandidas */}
      {expanded && (
        <div style={{ padding: '12px 16px 16px', borderTop: `1px solid ${colors.border}`, background: '#fafafa', display: 'flex', flexDirection: 'column', gap: 10 }}>
          
          {/* Estado asistencia */}
          {!appt.attendance && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => onAttendance(appt.id, 'asistió')}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 12, border: 'none',
                  background: '#d1f2e8', color: '#2d7a62', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.target.style.background = '#b8ebe0'}
                onMouseLeave={e => e.target.style.background = '#d1f2e8'}
              >✓ Asistió</button>
              <button
                onClick={() => onAttendance(appt.id, 'no-asistió')}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 12, border: 'none',
                  background: '#fde8e8', color: '#c63c3c', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.target.style.background = '#f5d5d5'}
                onMouseLeave={e => e.target.style.background = '#fde8e8'}
              >✗ No asistió</button>
            </div>
          )}

          {appt.attendance && (
            <div style={{
              padding: '12px 16px', borderRadius: 12, background: colors.bg,
              color: colors.text, fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <span>{appt.attendance === 'asistió' ? '✓ Asistió' : '✗ No asistió'}</span>
              <button
                onClick={() => onAttendance(appt.id, null)}
                style={{
                  background: 'none', border: 'none', color: 'inherit', cursor: 'pointer',
                  fontSize: 11, textDecoration: 'underline', opacity: 0.7,
                }}
              >Deshacer</button>
            </div>
          )}

          {/* Acciones principales */}
          <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
            {/* Iniciar sesión - SIEMPRE mostrar */}
            <button
              onClick={() => onStartSession(appt.patientId || appt.patientName)}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 12, border: 'none',
                background: '#4aab8a', color: 'white', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.target.style.background = '#3d8a6e'}
              onMouseLeave={e => e.target.style.background = '#4aab8a'}
            >▶ INICIAR SESIÓN</button>

            {/* Historial (si es registrado) */}
            {appt.isRegistered && appt.patientId && (
              <button
                onClick={() => onShowHistory(appt.patientId)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12, border: 'none',
                  background: '#f3e8ff', color: '#6a4c9c', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.target.style.background = '#ede9fe'}
                onMouseLeave={e => e.target.style.background = '#f3e8ff'}
              >📋 Ver historial</button>
            )}

            {/* Editar */}
            <button
              onClick={() => onEdit(appt)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #ddd',
                background: 'white', color: '#666', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.target.style.background = '#f9f9f9'; e.target.style.borderColor = '#ccc' }}
              onMouseLeave={e => { e.target.style.background = 'white'; e.target.style.borderColor = '#ddd' }}
            >✏️ Editar</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── DayView ───────────────────────────────────────────────────────────────────

export default function DayView({
  dayOfWeek,         // 1-5
  appointments,      // todas las citas (sin filtrar)
  onClose,
  onNew,             // (dayOfWeek) → abrir modal con día pre-seleccionado
  onEdit,
  onAttendance,
  onStartSession,
}) {
  const [historyPatientId, setHistoryPatientId] = useState(null)

  // Filtrar citas de este día
  const dayAppts = useMemo(() =>
    appointments
      .filter(a => a.dayOfWeek === dayOfWeek && a.status !== 'cancelled')
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)),
    [appointments, dayOfWeek]
  )

  const dayName = DAY_NAMES[dayOfWeek] ?? ''

  return (
    <>
      {/* DayView Bottom Sheet */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-end"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div
          className="bg-gray-50 rounded-t-3xl w-full flex flex-col"
          style={{ maxWidth: 480, margin: '0 auto', maxHeight: '88vh' }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 pt-2 pb-3 flex items-center justify-between bg-gray-50">
            <div>
              <h2 className="text-base font-bold text-gray-800">{dayName}</h2>
              <p className="text-xs text-gray-400">
                {dayAppts.length === 0
                  ? 'Sin citas'
                  : `${dayAppts.length} cita${dayAppts.length > 1 ? 's' : ''} programada${dayAppts.length > 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNew(dayOfWeek)}
                className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-xl transition-colors"
              >+ Nueva cita</button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-300 transition-colors"
              >✕</button>
            </div>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-3">

            {/* Sin citas */}
            {dayAppts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl mb-4">☀️</div>
                <h3 className="text-sm font-bold text-gray-600 mb-1">Sin citas el {dayName}</h3>
                <p className="text-xs text-gray-400 mb-5">Este día está disponible para agendar.</p>
                <button
                  onClick={() => onNew(dayOfWeek)}
                  className="px-5 py-2.5 bg-teal-500 text-white text-sm font-bold rounded-xl hover:bg-teal-600 transition-colors"
                >+ Agendar paciente</button>
              </div>
            )}

            {/* Lista de citas */}
            {dayAppts.map(appt => (
              <AppointmentRow
                key={appt.id}
                appt={appt}
                onEdit={onEdit}
                onAttendance={onAttendance}
                onStartSession={onStartSession}
                onShowHistory={setHistoryPatientId}
              />
            ))}
          </div>
        </div>
      </div>

      {/* PatientQuickHistory — segundo bottom sheet encima del primero */}
      {historyPatientId && (
        <div
          className="fixed inset-0 bg-black/60 z-60 flex items-end"
          onClick={e => e.target === e.currentTarget && setHistoryPatientId(null)}
        >
          <div
            className="bg-white rounded-t-3xl w-full flex flex-col"
            style={{ maxWidth: 480, margin: '0 auto', maxHeight: '80vh' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header historial */}
            <div className="px-5 pt-2 pb-3 flex items-center justify-between border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-800">Historial reciente</h2>
                <p className="text-xs text-gray-400">Últimas 4 sesiones · Solo lectura</p>
              </div>
              <button
                onClick={() => setHistoryPatientId(null)}
                className="w-8 h-8 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >✕</button>
            </div>

            {/* Historial scrolleable */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <PatientQuickHistory
                patientId={historyPatientId}
                onClose={() => setHistoryPatientId(null)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
