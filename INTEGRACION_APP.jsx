/**
 * INTEGRACIÓN SCHEDULER — Cambios en App.jsx y HomeModeScreen.jsx
 * Solo edits parciales — no tocar ningún otro bloque
 */

// ═══════════════════════════════════════════════════════════════════════
// 1. App.jsx — 4 cambios:
// ═══════════════════════════════════════════════════════════════════════

// ── 1A. Import al inicio del archivo (junto a los demás imports) ────────────

import ClinicSchedulerDashboard from './modules/clinicScheduler/ClinicSchedulerDashboard'

// ── 1B. Nuevo estado (junto a lastResult y exerciseToEdit) ──────────────────

const [showScheduler, setShowScheduler] = useState(true)  // true = abrir agenda al login

// ── 1C. REEMPLAZAR Gate 2 (selector paciente) completo ─────────────────────

// ANTES:
if (showSelect) {
  return (
    <div className="app-wrapper">
      <PatientSelectScreen onDone={() => { setShowSelect(false); setWelcomed(true) }} />
    </div>
  )
}

// DESPUÉS:
if (showScheduler) {
  return (
    <div className="app-wrapper">
      <ClinicSchedulerDashboard
        onSelectPatient={(patientId) => {
          const p = getPatientById(patientId)
          if (p) {
            loadPatient(p)
            setWelcomed(true)
          }
          setShowScheduler(false)
          setShowSelect(false)
        }}
        onClose={() => {
          setShowScheduler(false)
          // Si hay pacientes, mostrar selector; si no, ir a nuevo paciente
          setShowSelect(hasPatients)
        }}
      />
    </div>
  )
}

if (showSelect) {
  return (
    <div className="app-wrapper">
      <PatientSelectScreen onDone={() => { setShowSelect(false); setWelcomed(true) }} />
    </div>
  )
}

// ── 1D. En HomeScreen, agregar botón para volver a agenda ──────────────────
// Dentro del bloque screen === 'home', pasar onNavigate que ya llama goTo
// Agregar 'agenda' como nueva ruta:

{screen === 'agenda' && (
  <ClinicSchedulerDashboard
    onSelectPatient={(patientId) => {
      const p = getPatientById(patientId)
      if (p) loadPatient(p)
      setScreen('home')
    }}
    onClose={() => setScreen('home')}
    onNavigate={goTo}
  />
)}


// ═══════════════════════════════════════════════════════════════════════
// 2. HomeScreen.jsx — agregar botón Agenda en el header
// ═══════════════════════════════════════════════════════════════════════

// En el header, junto al botón "⎋ Salir", agregar:

<button
  onClick={() => onNavigate('agenda')}
  style={{
    background: '#e8f5ee',
    border: '1.5px solid #b2dfcc',
    borderRadius: 8,
    padding: '5px 10px',
    color: '#2d7a62',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  }}
>
  📅 Agenda
</button>


// ═══════════════════════════════════════════════════════════════════════
// 3. HomeModeScreen.jsx — mostrar próxima cita (familia)
// ═══════════════════════════════════════════════════════════════════════

// 3A. Import al inicio:
import { getAllAppointments } from '../modules/clinicScheduler/schedulerStorage'
import { getNextAppointment, DAY_NAMES } from '../modules/clinicScheduler/schedulerUtils'

// 3B. Dentro del componente HomeModeScreen, antes del return:
const nextAppt = useMemo(() => {
  const all = getAllAppointments()
  return getNextAppointment(all)
}, [])

// 3C. Agregar el banner de próxima sesión en el JSX,
// JUSTO ANTES del primer section de actividades (buscar el primer <div className="section-...">):

{nextAppt && (
  <div style={{
    background: 'linear-gradient(135deg, #e8f5ee, #f0fdf4)',
    border: '1.5px solid #86efac',
    borderRadius: 16,
    padding: '14px 16px',
    margin: '12px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      background: '#4aab8a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22, flexShrink: 0,
    }}>📅</div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#4aab8a', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Próxima sesión
      </p>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#1a2a1a', margin: '2px 0 0' }}>
        {nextAppt.daysUntil === 0
          ? `Hoy a las ${nextAppt.appointment.startTime}`
          : nextAppt.daysUntil === 1
            ? `Mañana a las ${nextAppt.appointment.startTime}`
            : `${DAY_NAMES[nextAppt.appointment.dayOfWeek]} a las ${nextAppt.appointment.startTime}`
        }
      </p>
    </div>
  </div>
)}


// ═══════════════════════════════════════════════════════════════════════
// 4. Estructura de archivos final
// ═══════════════════════════════════════════════════════════════════════

// src/modules/clinicScheduler/
// ├── ClinicSchedulerDashboard.jsx   ← pantalla principal
// ├── TodayAgenda.jsx                ← vista hoy
// ├── WeekCalendar.jsx               ← vista semana
// ├── AppointmentModal.jsx           ← modal crear/editar
// ├── schedulerStorage.js            ← CRUD localStorage
// ├── schedulerUtils.js              ← lógica de fechas/slots
// └── useScheduler.js                ← hook central
