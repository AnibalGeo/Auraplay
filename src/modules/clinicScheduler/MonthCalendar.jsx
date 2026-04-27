/**
 * MonthCalendar.jsx
 * Vista mensual — AuraPlay Scheduler
 * Permite navegar meses y ver gaps de citas
 */

import { useState, useMemo } from 'react'
import { DAY_NAMES } from './schedulerUtils'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function MonthCalendar({ appointments, onNew, onEdit, currentMonth = null }) {
  const [viewMonth, setViewMonth] = useState(currentMonth ?? new Date())

  const year  = viewMonth.getFullYear()
  const month = viewMonth.getMonth()

  // Obtener primer día y último día del mes
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1  // 0=lun, 6=dom
  const daysInMonth = lastDay.getDate()

  // Crear grid de semana
  const days = []
  for (let i = 0; i < startDow; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  // Agrupar por semanas
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  // Contar citas por día
  const appointmentsByDay = useMemo(() => {
    const map = {}
    appointments.forEach(a => {
      const dow = a.dayOfWeek  // 1=lun … 5=vie
      if (!a.dayOfWeek || a.status === 'cancelled') return

      const d = new Date(year, month, 1)
      while (d.getMonth() === month) {
        const wd = d.getDay() === 0 ? 6 : d.getDay() - 1  // 0=lun
        if (wd === dow - 1) {  // dow es 1-5, wd es 0-6
          const key = d.getDate()
          map[key] = (map[key] ?? 0) + 1
        }
        d.setDate(d.getDate() + 1)
      }
    })
    return map
  }, [appointments, year, month])

  const isToday = (d) => {
    if (!d) return false
    const today = new Date()
    return d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const isFuture = (d) => {
    if (!d) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const date = new Date(year, month, d)
    return date > today
  }

  const isPast = (d) => {
    if (!d) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const date = new Date(year, month, d)
    return date < today
  }

  function handlePrevMonth() {
    setViewMonth(new Date(year, month - 1, 1))
  }

  function handleNextMonth() {
    setViewMonth(new Date(year, month + 1, 1))
  }

  function handleDayClick(d) {
    if (!d) return
    // Abrir modal para crear cita en este día
    const date = new Date(year, month, d)
    const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1
    const isoDay = dayOfWeek + 1  // convert 0-6 to 1-7
    if (isoDay >= 1 && isoDay <= 5) {  // solo L-V
      onNew(isoDay)
    }
  }

  const monthName = new Date(year, month).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-4">
      {/* Header con navegación */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
        >‹</button>
        <h2 className="text-base font-bold text-gray-800 capitalize">{monthName}</h2>
        <button
          onClick={handleNextMonth}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
        >›</button>
      </div>

      {/* Grilla */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {WEEKDAYS.map(wd => (
            <div key={wd} className="py-2 text-center border-r border-gray-100 last:border-r-0">
              <p className="text-xs font-bold text-gray-400">{wd}</p>
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {weeks.map((week, wi) =>
            week.map((d, di) => {
              const count = d ? appointmentsByDay[d] ?? 0 : 0
              const today = isToday(d)
              const future = isFuture(d)
              const past = isPast(d)
              const workday = d && (di >= 0 && di <= 4)  // L-V
              return (
                <div
                  key={`${wi}-${di}`}
                  onClick={() => future && workday && handleDayClick(d)}
                  className={`aspect-square border-r border-b border-gray-100 last:border-r-0 p-1.5 ${
                    !d || past ? 'bg-gray-50' : future && workday ? 'cursor-pointer hover:bg-teal-50' : 'bg-white'
                  }`}
                >
                  {d && (
                    <div className="h-full flex flex-col">
                      <p className={`text-xs font-bold leading-none ${
                        today
                          ? 'text-white bg-teal-500 w-6 h-6 rounded-full flex items-center justify-center'
                          : past
                            ? 'text-gray-300'
                            : 'text-gray-700'
                      }`}>
                        {d}
                      </p>
                      {count > 0 && (
                        <div className="mt-0.5 flex-1 flex items-end">
                          <span className={`text-xs font-bold px-1 py-0.5 rounded ${
                            today
                              ? 'bg-teal-100 text-teal-700'
                              : count > 2
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-600'
                          }`}>
                            {count}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Leyenda */}
      <div className="text-xs text-gray-400 text-center">
        <p>Click en un día de la semana (L-V) para agendar una cita</p>
      </div>
    </div>
  )
}

export default MonthCalendar
