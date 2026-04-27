# SCHEDULER — Análisis + Mejoras Propuestas

## ✅ Lo que está bien

1. **Desacoplado** — módulo independiente sin tocar clínica existente ✓
2. **Modelo de datos simple** — extensible sin over-engineering ✓
3. **Jerarquía visual clara** — Hoy → Semana → Pacientes ✓
4. **Integración familia** — mostrar próxima sesión ✓
5. **UX intent** — "ordena el día" = propósito claro ✓

---

## 🎯 Mejoras que sugiero (críticas)

### 1. **Flujo de entrada más inteligente**
**ACTUAL:**
```
Login terapeuta → ¿Hoy hay citas? → Agenda | Calendario
```

**PROPUESTA:**
```
Login terapeuta → Dashboard Inteligente:
  - Hoy: cards de citas (con badge "Próximas" si es futura)
  - Sidebar compacto: próximas 7 días mini-view
  - CTA grande: "+ Nueva cita" flotante
  - Si 0 citas hoy: "Hoy libre — próximas citas: [list]"
```

**Por qué**: Evita el salto "hoy tiene → ve calendario". Un dashboard unificado es más SaaS.

---

### 2. **Estados de cita, no solo activo/inactivo**
**ACTUAL:**
```javascript
{ ..., active: true }
```

**PROPUESTA:**
```javascript
{
  id, patientId, patientName, dayOfWeek, startTime, endTime, duration,
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show',
  actualDuration,
  attendance: 'asistió' | 'no-asistió' | null,
  notes,
  followUpNotes,
  createdAt, updatedAt
}
```

**Por qué**: 
- Terapeuta necesita saber "qué pasó" no solo "está activa"
- Facilita reportería futura
- Conecta natural con sessionHistory que ya tienes

---

### 3. **Sincronización con SessionHistory**
**ACTUAL:**
```
Scheduler ↔ localStorage independiente
SessionHistory ↔ localStorage independiente
→ Desconectadas
```

**PROPUESTA:**
```
Cuando terapeuta termina actividad clínica:
- SessionHistory se crea (ya existe)
- Al volver a agenda, buscar cita con mismo paciente/hora
- Auto-marcar como "completed" + actualDuration
- Mostrar: "✓ Sesión registrada 45 min"

Sync bidirecional simple en PatientContext
```

**Por qué**: Una única fuente de verdad. No 2 historiales.

---

### 4. **Recordatorios y notificaciones (MVP)**
**FALTA:**
```javascript
// Scheduler no avisa de próximas citas
```

**PROPUESTA:**
```javascript
// Toast simple 5 minutos antes
useEffect(() => {
  const interval = setInterval(() => {
    const upcomingIn5min = appointments.filter(
      a => minutesUntil(a) === 5 && a.status === 'scheduled'
    )
    if (upcomingIn5min.length > 0) {
      showToast(`Próxima cita: ${upcomingIn5min[0].patientName} en 5 min`)
    }
  }, 1000)
})
```

**Por qué**: "Ordena el día" incluye NO olvidar citas.

---

### 5. **Duración inteligente con buffer**
**FALTA:**
```
{ duration: 45 } → pero ¿cuándo empieza la próxima?
```

**PROPUESTA:**
```javascript
{
  startTime: '09:00',
  duration: 45,           // sesión
  bufferAfter: 15,        // descanso automático
  // → próxima cita no puede ser antes de 10:00
}
```

**Por qué**: Terapeuta respira entre pacientes. Evita over-booking.

---

### 6. **Pacientes sin registro vs con registro**
**FALTA:**
```
Agenda solo muestra pacientes en roster actual
```

**PROPUESTA:**
```javascript
// Opción 1: Agregar paciente a agenda sin registrar (cita puntual)
// Opción 2: "Usar de mi roster" (lo normal)

{
  patientId: 'patient_123' | null,  // null = cita ad-hoc
  patientName: 'Mateo',
  patientPhone: '...',               // si no hay ID
  isRegistered: boolean
}
```

**Por qué**: Terapeuta vé clientes que a veces no son del roster (consultas puntuales).

---

### 7. **Recurringweekly debe ser más flexible**
**ACTUAL:**
```javascript
{ recurringWeekly: true }
// → repite cada semana indefinidamente
```

**PROPUESTA:**
```javascript
{
  recurring: {
    type: 'weekly' | 'biweekly' | 'monthly' | null,
    endDate: '2025-06-30' | null,  // null = indefinido
    exceptions: ['2025-05-09'],     // feriado, libre
  }
}
```

**Por qué**: Contratos reales tienen fin. Vacaciones existen.

---

### 8. **Nombre del módulo: Scheduler → ClinicScheduler**
```javascript
src/modules/clinicScheduler/  // mejor nombramiento
// O
src/modules/agenda/           // si es muy local
```

**Por qué**: Evita confusión con otros "schedulers" (ej: job schedulers en backend).

---

## 🏗️ Arquitectura mejorada

```javascript
// src/modules/clinicScheduler/
├── ClinicSchedulerDashboard.jsx      // entrada principal
├── components/
│   ├── TodayAgenda.jsx               // hoy
│   ├── WeekCalendar.jsx              // semana
│   ├── AppointmentCard.jsx           // card individual
│   ├── AppointmentModal.jsx          # crear/editar
│   ├── QuickPatientHistory.jsx       # historial inline
│   ├── ReminderBanner.jsx            # próximas en 5 min
│   └── SidebarUpcoming.jsx           # próximas 7 días mini
├── hooks/
│   ├── useScheduler.js               # CRUD appointments
│   ├── useReminders.js               # avisos
│   └── useSyncWithSession.js         # bidireccional con SessionHistory
├── utils/
│   ├── schedulerStorage.js
│   ├── schedulerUtils.js
│   └── appointmentValidation.js
└── constants.js                      # colors, durations, etc.
```

---

## 📊 Estado inicial del módulo

```javascript
// src/data/clinicScheduler/storage.js

export function initializeScheduler(username) {
  const key = `auraplay_schedule_${username}`
  const existing = localStorage.getItem(key)
  if (!existing) {
    localStorage.setItem(key, JSON.stringify({
      version: '1.0',
      appointments: [],
      settings: {
        workHours: { start: '08:00', end: '18:00' },
        defaultDuration: 45,
        bufferMinutes: 15,
      }
    }))
  }
}

export function getAppointmentsForDate(username, date) {
  // Retorna citas del día en orden
}

export function getAppointmentsForWeek(username, weekStart) {
  // Retorna citas de la semana
}
```

---

## 🔌 Integración limpia con App.jsx

```javascript
// App.jsx
import ClinicSchedulerDashboard from './modules/clinicScheduler/ClinicSchedulerDashboard'

return (
  <>
    {/* Luego de login terapeuta, ANTES de PatientSelect */}
    {isLoggedIn && isTherapist && !showSelect && (
      <ClinicSchedulerDashboard
        onSelectPatient={(patientId) => {
          loadPatient(getPatientById(patientId))
          setScreen('home')
        }}
        onNavigate={goTo}
      />
    )}
    
    {/* El resto del flujo actual se mantiene igual */}
  </>
)
```

---

## 🎨 Orden visual sugerido

### Desktop (nav lateral)
```
┌─────────────────────────────────────┐
│ AuraPlay                   [user ▼] │
├─────┬──────────────────────────────┤
│ ☰   │  HOY                         │
│ Hoy │  Próximas citas...           │
│     │                              │
│ Sem │  09:00 — Mateo (45 min)      │
│     │  10:00 — Josefa (60 min)     │
│ Pac │                              │
│ Opc │  [+ Nueva cita]              │
│     │                              │
│ Sal │                              │
└─────┴──────────────────────────────┘
```

### Mobile (tabs)
```
┌──────────────────────────────┐
│ Hoy    | Semana | Panel | ⊕  │
├──────────────────────────────┤
│ 09:00 Mateo                  │
│ 45 min                       │
│ [Iniciar] [Asistió]          │
│                              │
│ 10:00 Josefa                 │
│ 60 min                       │
│ [Iniciar] [No asistió]       │
└──────────────────────────────┘
```

---

## ✅ Checklist de implementación mejorada

- [ ] Módulo desacoplado con estructura clara
- [ ] Dashboard unificado (no bifurcar en hoy vs semana)
- [ ] Estados de cita (scheduled, completed, no-show)
- [ ] Sync bidireccional con SessionHistory
- [ ] Recordatorios 5 min antes (Toast)
- [ ] Buffer entre citas configurable
- [ ] Soporte pacientes ad-hoc (sin roster)
- [ ] Recurringweekly con endDate y excepciones
- [ ] QuickPatientHistory inline
- [ ] SidebarUpcoming para contexto
- [ ] Integración HomeModeScreen (próxima cita familia)
- [ ] localStorage versionado y validado
- [ ] Tests manuales: crear, editar, eliminar, sync

---

## 🚀 Timeline estimado

| Fase | Tiempo | Output |
|------|--------|--------|
| 1. Infraestructura + Storage | 2h | Module + CRUD |
| 2. TodayAgenda + WeekCalendar | 3h | Views + routing |
| 3. AppointmentModal | 2h | Create/Edit |
| 4. Sync SessionHistory | 2h | Bidireccional |
| 5. Reminders + sidebar | 1h | Toast + UX |
| 6. HomeModeScreen integration | 1h | Family view |
| 7. Pulido estético | 2h | Polish |
| **TOTAL** | **~13h** | **MVP completo** |

---

## 💡 Decisión: ¿Vamos así o quieres ajustar algo?

Yo recomiendo implementar **con las 8 mejoras** porque:
1. No agrega complejidad (solo campos)
2. Evita refactor futuro
3. Conecta natural con datos que ya tienes
4. Siente más "SaaS senior"

**¿Voy con esta propuesta o hay algo que quieras cambiar?**
