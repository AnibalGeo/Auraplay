/**
 * WeekCalendar.jsx
 * Calendario semanal — AuraPlay Scheduler
 */

import { DAY_NAMES, DAY_SHORT, endTime, timeToMinutes, STATUS_COLORS, getAppointmentTimeStatus } from '../schedulerUtils'

const HOUR_START = 7
const HOUR_END   = 20
const HOUR_COUNT = HOUR_END - HOUR_START
const PX_PER_MIN = 1.5   // 90px por hora

function minutesFromDayStart(time) {
  return timeToMinutes(time) - HOUR_START * 60
}

function AppointmentBlock({ appt, onClick }) {
  const timeStatus = getAppointmentTimeStatus(appt)
  const statusKey  = appt.attendance === 'asistió' ? 'completed' : appt.attendance === 'no-asistió' ? 'no-show' : timeStatus
  const colors     = STATUS_COLORS[statusKey]

  const top    = minutesFromDayStart(appt.startTime) * PX_PER_MIN
  const height = Math.max(appt.duration * PX_PER_MIN, 28)

  return (
    <div
      onClick={() => onClick(appt)}
      className="absolute left-1 right-1 rounded-lg px-1.5 py-1 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
      style={{
        top,
        height,
        background: colors.bg,
        borderLeft: `3px solid ${colors.dot}`,
        borderTop: `1px solid ${colors.border}`,
        borderRight: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <p className="text-xs font-bold truncate leading-tight" style={{ color: colors.text }}>
        {appt.patientName.split(' ')[0]}
      </p>
      {height > 36 && (
        <p className="text-xs truncate" style={{ color: colors.text, opacity: 0.7 }}>
          {appt.startTime}
        </p>
      )}
    </div>
  )
}

export default function WeekCalendar({ weekAppointments, onAppointmentClick, onNew }) {
  const totalHeight = HOUR_COUNT * 60 * PX_PER_MIN

  const today = new Date().getDay()  // 0=dom … 6=sab
  const todayDow = today === 0 || today === 6 ? null : today

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-800">Semana</h2>
        <button
          onClick={onNew}
          className="w-9 h-9 bg-teal-500 hover:bg-teal-600 text-white rounded-xl flex items-center justify-center text-lg font-bold transition-colors"
        >+</button>
      </div>

      {/* Grilla */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Headers días */}
        <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: '36px repeat(5, 1fr)' }}>
          <div className="border-r border-gray-100" />
          {[1,2,3,4,5].map(d => (
            <div
              key={d}
              className={`py-2.5 text-center border-r border-gray-100 last:border-r-0 ${
                todayDow === d ? 'bg-teal-50' : ''
              }`}
            >
              <p className={`text-xs font-bold ${todayDow === d ? 'text-teal-600' : 'text-gray-500'}`}>
                {DAY_SHORT[d]}
              </p>
              {todayDow === d && (
                <div className="w-1 h-1 rounded-full bg-teal-500 mx-auto mt-0.5" />
              )}
            </div>
          ))}
        </div>

        {/* Grilla de horas */}
        <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
          <div className="relative" style={{ height: totalHeight }}>

            {/* Líneas de hora */}
            <div className="absolute inset-0 grid" style={{ gridTemplateColumns: '36px repeat(5, 1fr)' }}>
              {/* Horas */}
              <div className="relative border-r border-gray-100">
                {Array.from({ length: HOUR_COUNT }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full flex items-start justify-end pr-1"
                    style={{ top: i * 60 * PX_PER_MIN }}
                  >
                    <span className="text-xs text-gray-300 font-medium leading-none">
                      {String(HOUR_START + i).padStart(2,'0')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Columnas de días */}
              {[1,2,3,4,5].map(d => (
                <div
                  key={d}
                  className={`relative border-r border-gray-100 last:border-r-0 ${todayDow === d ? 'bg-teal-50/30' : ''}`}
                >
                  {/* Líneas horizontales cada hora */}
                  {Array.from({ length: HOUR_COUNT }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-full border-t border-gray-100"
                      style={{ top: i * 60 * PX_PER_MIN }}
                    />
                  ))}

                  {/* Línea de ahora */}
                  {todayDow === d && (() => {
                    const now = new Date()
                    const nowMin = now.getHours() * 60 + now.getMinutes()
                    const top = (nowMin - HOUR_START * 60) * PX_PER_MIN
                    if (top < 0 || top > totalHeight) return null
                    return (
                      <div
                        className="absolute left-0 right-0 z-10"
                        style={{ top }}
                      >
                        <div className="relative">
                          <div className="absolute left-0 w-2 h-2 rounded-full bg-teal-500 -translate-y-1" />
                          <div className="h-px bg-teal-500" />
                        </div>
                      </div>
                    )
                  })()}

                  {/* Citas del día */}
                  {(weekAppointments[d] ?? []).map(appt => (
                    <AppointmentBlock
                      key={appt.id}
                      appt={appt}
                      onClick={onAppointmentClick}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex gap-3 px-1 flex-wrap">
        {[
          { label: 'Completada', color: STATUS_COLORS.completed.dot },
          { label: 'En curso',   color: STATUS_COLORS.now.dot },
          { label: 'Próxima',    color: STATUS_COLORS.upcoming.dot },
          { label: 'No asistió', color: STATUS_COLORS['no-show'].dot },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
            <span className="text-xs text-gray-400">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
