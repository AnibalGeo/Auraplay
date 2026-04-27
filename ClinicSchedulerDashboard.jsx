/**
 * ClinicSchedulerDashboard.jsx
 * Dashboard principal de la agenda clínica — AuraPlay
 *
 * Props:
 *   onSelectPatient(patientId) — cargar paciente e ir a HomeScreen
 *   onNavigate(screen)         — navegar a otras pantallas de AuraPlay
 *   onClose                    — volver al flujo normal
 */

import { useState, useCallback } from 'react'
import { useScheduler }       from './useScheduler'
import TodayAgenda            from './TodayAgenda'
import WeekCalendar           from './WeekCalendar'
import AppointmentModal       from './AppointmentModal'
import { todayDayOfWeek }     from './schedulerUtils'
import { getPatientById }     from '../data/patients'
import { useAuth }            from '../context/AuthContext'
import { APP_CONFIG }         from '../config/app.config'

// ── Toast ligero ──────────────────────────────────────────────────────────────

function Toast({ message, visible }) {
  return (
    <div className={`fixed top-4 left-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg
      bg-emerald-500 text-white text-sm font-semibold transition-all duration-300 pointer-events-none
      ${visible ? 'opacity-100 -translate-x-1/2' : 'opacity-0 -translate-x-1/2 -translate-y-4'}`}
      style={{ maxWidth: 320 }}
    >
      ✓ {message}
    </div>
  )
}

// ── Sidebar: próximas citas ────────────────────────────────────────────────────

function UpcomingSidebar({ appointments, onNew }) {
  const sorted = [...appointments]
    .filter(a => a.status !== 'cancelled')
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
    .slice(0, 6)

  const DAY_SHORT = ['','L','M','X','J','V']

  if (sorted.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Esta semana</p>
      {sorted.map(a => (
        <div key={a.id} className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center text-xs font-black text-teal-600 shrink-0">
            {DAY_SHORT[a.dayOfWeek]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">{a.patientName}</p>
            <p className="text-xs text-gray-400">{a.startTime} · {a.duration} min</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Reminder banner ───────────────────────────────────────────────────────────

function ReminderBanner({ appointment, onDismiss }) {
  if (!appointment) return null
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3 animate-pulse">
      <span className="text-2xl">⏰</span>
      <div className="flex-1">
        <p className="text-sm font-bold text-amber-800">En 5 minutos</p>
        <p className="text-xs text-amber-600">{appointment.patientName} · {appointment.startTime}</p>
      </div>
      <button onClick={onDismiss} className="text-amber-400 hover:text-amber-600 text-lg">✕</button>
    </div>
  )
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function TabBar({ active, onChange, todayCount }) {
  return (
    <div className="flex bg-gray-100 rounded-2xl p-1">
      {[
        { id: 'today', label: 'Hoy', badge: todayCount },
        { id: 'week',  label: 'Semana' },
      ].map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            active === t.id
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t.label}
          {t.badge > 0 && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
              active === t.id ? 'bg-teal-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>{t.badge}</span>
          )}
        </button>
      ))}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function ClinicSchedulerDashboard({ onSelectPatient, onNavigate, onClose }) {
  const { therapistName, logout } = useAuth()
  const [reminder,  setReminder]  = useState(null)
  const [toast,     setToast]     = useState({ visible: false, message: '' })
  const [modal,     setModal]     = useState(null)   // null | 'new' | appt object
  const [activeTab, setActiveTab] = useState(() => todayDayOfWeek() ? 'today' : 'week')

  const showToast = useCallback((msg) => {
    setToast({ visible: true, message: msg })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2200)
  }, [])

  const {
    appointments, todayAppointments, weekAppointments,
    create, update, remove, markAttendance, skipToday,
  } = useScheduler({
    onReminder: useCallback((appt) => setReminder(appt), []),
  })

  function handleSaveModal(data, editId) {
    if (editId) {
      update(editId, data)
      showToast('Cita actualizada')
    } else {
      create(data)
      showToast('Cita agendada')
    }
    setModal(null)
  }

  function handleAttendance(id, attendance) {
    if (attendance === null) {
      update(id, { attendance: null, status: 'scheduled' })
    } else {
      markAttendance(id, attendance)
      if (attendance === 'asistió') showToast('Asistencia registrada')
    }
  }

  function handleStartSession(patientId) {
    const p = getPatientById(patientId)
    if (p) {
      onSelectPatient(patientId)
    }
  }

  function handleWeekApptClick(appt) {
    setModal(appt)
  }

  const firstName = therapistName?.split(' ')[0] || 'Terapeuta'
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <Toast message={toast.message} visible={toast.visible} />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">{greeting},</p>
            <h1 className="text-base font-black text-gray-800 leading-tight">{firstName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Actividades →
            </button>
            <button
              onClick={() => setModal('new')}
              className="w-9 h-9 bg-teal-500 hover:bg-teal-600 text-white rounded-xl flex items-center justify-center text-xl font-bold transition-colors"
            >+</button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 px-4 py-4 max-w-lg mx-auto w-full space-y-4 pb-8">

        {/* Reminder */}
        {reminder && (
          <ReminderBanner
            appointment={reminder}
            onDismiss={() => setReminder(null)}
          />
        )}

        {/* Tabs */}
        <TabBar
          active={activeTab}
          onChange={setActiveTab}
          todayCount={todayAppointments.filter(a => !a.attendance).length}
        />

        {/* Vista */}
        {activeTab === 'today' && (
          <>
            <TodayAgenda
              appointments={todayAppointments}
              onEdit={setModal}
              onAttendance={handleAttendance}
              onSkip={id => { skipToday(id); showToast('Cita saltada por hoy') }}
              onStartSession={handleStartSession}
              onNew={() => setModal('new')}
            />
            <UpcomingSidebar appointments={appointments} onNew={() => setModal('new')} />
          </>
        )}

        {activeTab === 'week' && (
          <WeekCalendar
            weekAppointments={weekAppointments}
            onAppointmentClick={handleWeekApptClick}
            onNew={() => setModal('new')}
          />
        )}
      </div>

      {/* Modal crear/editar */}
      {modal && (
        <AppointmentModal
          appointment={modal === 'new' ? null : modal}
          appointments={appointments}
          onSave={handleSaveModal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
