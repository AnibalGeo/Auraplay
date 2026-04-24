/**
 * HomeModeScreen.jsx
 * Modo Padres — AuraPlay
 *
 * Filosofía de diseño:
 *   Una sola tarea diaria. 3 pasos simples. Refuerzo emocional. Facilidad extrema.
 *
 * Flujo:
 *   1. PIN de acceso (separado del terapeuta)
 *   2. Si no hay plan activo → mensaje simple
 *   3. Pantalla principal: tarea del día + progreso semanal + consejo
 *   4. Botón "Lo hicimos" → registra en sessionHistory
 *
 * Acceso: PIN guardado en localStorage como 'auraplay_home_pin'
 * Si no está configurado → instrucción al terapeuta
 */

import { useState, useMemo } from 'react'
import { usePatient } from '../context/PatientContext'
import { updatePatient as persistPatient } from '../data/patients'

// ─── PIN helpers ──────────────────────────────────────────────────────────────

const HOME_PIN_KEY = 'auraplay_home_pin'

function getHomePin() {
  return localStorage.getItem(HOME_PIN_KEY) || null
}

// ─── Adaptador: task clínica → 3 pasos para padres ───────────────────────────
// Convierte el texto de homeTask.task (Hanen/ECO) en pasos legibles para no-clínicos

function buildDailyTask(homeTask, patientName) {
  if (!homeTask) return null

  // Banco de tareas mapeadas a steps simples
  // Las keys coinciden con HOME_TASKS_BY_FOCUS de generateTherapyPlan.js
  const TASK_STEPS = {
    'Respuesta al nombre': {
      title: `Llama a ${patientName} por su nombre`,
      emoji: '📣',
      steps: [
        'Ubícate cerca y di su nombre con voz normal — sin gritar.',
        'Espera hasta 5 segundos en silencio. No repitas todavía.',
        'Cuando te mire, sonríe y di "¡Hola!" o lo que venga natural.',
      ],
      observe: ['¿Giró la cabeza?', '¿Hizo contacto visual?', '¿Sonrió o reaccionó?'],
    },
    'Contacto visual y engagement': {
      title: 'Juego cara a cara',
      emoji: '👀',
      steps: [
        'Siéntate al nivel de sus ojos — en el suelo si hace falta.',
        'Haz algo divertido y espera que te mire antes de seguir.',
        'Cuando haga contacto visual, celebra con entusiasmo inmediato.',
      ],
      observe: ['¿Te buscó con la mirada?', '¿Cuánto tiempo sostuvo el contacto?', '¿Sonrió?'],
    },
    'Atención sostenida': {
      title: 'Actividad favorita sin interrupciones',
      emoji: '⏱️',
      steps: [
        'Elige UNA actividad que le guste. Sin pantallas ni juguetes de más.',
        'Juega junto a él/ella sin cambiar de actividad por 5 minutos.',
        'Si se distrae, no lo corrijas — vuelve suavemente a la actividad.',
      ],
      observe: ['¿Cuántos minutos sostuvo la atención?', '¿Participó activamente?', '¿Pedió más?'],
    },
    'Señalamiento y atención conjunta': {
      title: 'Señalamos juntos',
      emoji: '👆',
      steps: [
        'Señala un objeto que vean los dos y nómbralo con voz clara.',
        'Espera que él/ella mire el objeto — no lo apures.',
        'Si señala algo por su cuenta, nómbralo tú inmediatamente.',
      ],
      observe: ['¿Miró hacia donde señalaste?', '¿Señaló algún objeto solo/a?', '¿Intentó nombrar algo?'],
    },
    'Imitación (prerequisito crítico)': {
      title: 'El juego del espejo',
      emoji: '🪞',
      steps: [
        'Empieza imitando TODO lo que haga él/ella por 2 minutos — sonidos, gestos, acciones.',
        'Luego haz tú algo simple (palmada, soplar) y espera que lo repita.',
        'Si no lo repite en 5 segundos, vuelve a imitarlo a él/ella.',
      ],
      observe: ['¿Imitó alguna acción tuya?', '¿Imitó algún sonido?', '¿Le gustó el juego?'],
    },
    'Primeras palabras funcionales': {
      title: 'Nombrar lo que quiere',
      emoji: '🗣️',
      steps: [
        'Ofrece algo que le guste a medias — sin dárselo del todo.',
        'Espera 5 segundos en silencio con cara de expectativa.',
        'Si dice cualquier cosa (aunque sea un sonido), dáselo inmediatamente y celebra.',
      ],
      observe: ['¿Vocalizó algo?', '¿Señaló o extendió la mano?', '¿Intentó una palabra?'],
    },
    'Combinación de dos palabras': {
      title: 'Frases de dos palabras',
      emoji: '💬',
      steps: [
        'Durante una rutina normal, modela frases cortas: "más leche", "nene salta", "pelota cae".',
        'No pidas que repita — solo muestra cómo suena.',
        'Si dice una palabra sola, expándela tú: si dice "leche", di "quiero leche".',
      ],
      observe: ['¿Usó dos palabras juntas?', '¿Intentó expandir lo que dijo?', '¿Repitió alguna frase?'],
    },
    'Pragmática social y atención conjunta': {
      title: 'Juego de turnos',
      emoji: '⚽',
      steps: [
        'Rueda una pelota o empuja un carrito hacia él/ella y espera.',
        'Di "tu turno" antes de esperar — hasta 10 segundos en silencio.',
        'Celebra cualquier intento de devolver, aunque no sea perfecto.',
      ],
      observe: ['¿Tomó el turno?', '¿Hizo contacto visual durante el juego?', '¿Pidió más?'],
    },
    'Regulación atencional y sesiones cortas': {
      title: 'Actividad corta y predecible',
      emoji: '⏰',
      steps: [
        'Elige una actividad de máximo 5 minutos y avísalo: "Jugamos 5 minutos y listo".',
        'Usa una señal visual de fin: ponle un timer o cuenta hacia atrás desde 5.',
        'Termina cuando dices que vas a terminar, aunque esté bien. La consistencia importa más.',
      ],
      observe: ['¿Terminó la actividad sin crisis?', '¿Anticipó el fin?', '¿Pidió continuar?'],
    },
    'Regulación sensorial como prerequisito': {
      title: 'Momento de calma primero',
      emoji: '🌊',
      steps: [
        'Antes de cualquier actividad, 3-5 minutos de lo que lo/la calma: saltar, apretar, balancearse.',
        'Cuando veas que está más tranquilo/a, propón la actividad del día.',
        'Si se agita durante la actividad, vuelve al momento de calma — no lo fuercen.',
      ],
      observe: ['¿Se calmó antes de la actividad?', '¿Pudo sostener la actividad?', '¿Cuánto tiempo?'],
    },
    'default': {
      title: 'Conversación en rutina',
      emoji: '🏠',
      steps: [
        'Durante el desayuno, baño o paseo, habla sobre lo que ven y hacen.',
        'Usa frases cortas y claras. Señala lo que nombras.',
        'Espera siempre unos segundos antes de continuar — dale espacio para responder.',
      ],
      observe: ['¿Respondió de alguna forma?', '¿Inició algo por su cuenta?', '¿Se mantuvo atento/a?'],
    },
  }

  // Buscar la tarea que más se acerque al área
  const area = homeTask.area || 'default'
  const taskData = TASK_STEPS[area] || TASK_STEPS['default']

  return {
    ...taskData,
    area,
    rawTask: homeTask.task, // guardamos el original para referencia
  }
}

// ─── Consejo semanal por diagnóstico ─────────────────────────────────────────

const WEEKLY_TIPS = {
  tel: [
    'No anticipes todo. Dale tiempo y espacio para pedir.',
    'Una palabra dicha en contexto real vale más que 10 repetidas en ejercicio.',
    'El juego es la terapia. Si juegan juntos, están trabajando.',
    'Las rutinas predecibles ayudan al lenguaje. Lo que se repite, se aprende.',
  ],
  tl_tea: [
    'Sigue su interés, no el tuyo. Si le gustan los trenes, trabaja con trenes.',
    'La mirada no siempre significa falta de atención. A veces escucha sin mirar.',
    'Avisa antes de cada cambio: "En 2 minutos terminamos". Reduce la ansiedad.',
    'El entusiasmo tuyo es contagioso. Aunque no lo muestre, lo registra.',
  ],
  tl_tdah: [
    'Sesiones cortas y frecuentes funcionan mejor que una larga.',
    'Mueve el cuerpo primero: saltar, correr, y luego la actividad de lenguaje.',
    'Elige un solo objetivo por sesión. La variedad viene después.',
    'El error no importa. Lo que importa es que lo intentó.',
  ],
  tl_tea_tdah: [
    'Primero calma, luego lenguaje. No al revés.',
    'Menos estímulos = más atención. Un juguete a la vez.',
    'Tu voz tranquila es más efectiva que la voz insistente.',
    'Cada pequeño logro cuenta. Anótalo aunque sea mentalmente.',
  ],
}

function getWeeklyTip(diagnosis, weekNumber) {
  const tips = WEEKLY_TIPS[diagnosis] || WEEKLY_TIPS.tel
  return tips[(weekNumber - 1) % tips.length]
}

// ─── Semana actual del plan ───────────────────────────────────────────────────

function getCurrentPlanWeek(therapyPlan) {
  if (!therapyPlan) return null
  // Buscar primera semana no completada
  const active = therapyPlan.weeks.find(w => !w.completed)
  return active || therapyPlan.weeks[therapyPlan.weeks.length - 1]
}

// ─── Prácticas en casa esta semana ───────────────────────────────────────────

function countHomeSessionsThisWeek(sessionHistory) {
  if (!sessionHistory?.length) return 0
  const now = Date.now()
  const weekMs = 7 * 24 * 60 * 60 * 1000
  return sessionHistory.filter(e =>
    e.type === 'home_activity' &&
    (now - new Date(e.date).getTime()) < weekMs
  ).length
}

function doneToday(sessionHistory) {
  if (!sessionHistory?.length) return false
  const today = new Date().toISOString().slice(0, 10)
  return sessionHistory.some(e =>
    e.type === 'home_activity' && e.date?.slice(0, 10) === today
  )
}

// ─── Componente PIN ───────────────────────────────────────────────────────────

function HomePinScreen({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const storedPin = getHomePin()

  // Sin PIN configurado
  if (!storedPin) {
    return (
      <div style={pinStyles.root}>
        <div style={pinStyles.card}>
          <span style={{ fontSize: 48, marginBottom: 16, display: 'block' }}>🔒</span>
          <h2 style={pinStyles.title}>Acceso no configurado</h2>
          <p style={pinStyles.subtitle}>
            El terapeuta debe configurar un PIN para el modo padres desde el Panel del Terapeuta antes de que puedas acceder.
          </p>
          <p style={{ fontSize: 12, color: '#aaa', marginTop: 16, lineHeight: 1.5 }}>
            Si eres el terapeuta, ve al Panel → botón "Modo Padres" → configurar PIN.
          </p>
        </div>
      </div>
    )
  }

  function handleDigit(d) {
    if (error) { setError(false); setPin('') }
    const next = pin + d
    setPin(next)
    if (next.length === 4) {
      if (next === storedPin) {
        onUnlock()
      } else {
        setError(true)
        setShake(true)
        setTimeout(() => { setShake(false); setPin('') }, 700)
      }
    }
  }

  function handleDelete() {
    setError(false)
    setPin(p => p.slice(0, -1))
  }

  return (
    <div style={pinStyles.root}>
      <div style={{ ...pinStyles.card, animation: shake ? 'shake 0.5s' : 'none' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>👨‍👩‍👧</div>
        <h2 style={pinStyles.title}>Área para familias</h2>
        <p style={pinStyles.subtitle}>Ingresa el PIN que te dio el terapeuta</p>

        {/* Dots */}
        <div style={pinStyles.dots}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              ...pinStyles.dot,
              background: pin.length > i
                ? error ? '#e07a5f' : '#4aab8a'
                : '#e8e8e8',
              transform: pin.length > i ? 'scale(1.2)' : 'scale(1)',
              transition: 'all 0.15s',
            }} />
          ))}
        </div>

        {error && (
          <p style={{ color: '#e07a5f', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            PIN incorrecto. Intenta de nuevo.
          </p>
        )}

        {/* Teclado */}
        <div style={pinStyles.keypad}>
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} style={pinStyles.key} onClick={() => handleDigit(String(n))}>
              {n}
            </button>
          ))}
          <div style={pinStyles.keyEmpty} />
          <button style={pinStyles.key} onClick={() => handleDigit('0')}>0</button>
          <button style={{ ...pinStyles.key, fontSize: 18, color: '#888' }} onClick={handleDelete}>⌫</button>
        </div>
      </div>
    </div>
  )
}

// ─── Pantalla principal del padre ─────────────────────────────────────────────

function HomeMainScreen({ patient, onDone }) {
  const { addSessionEntry, updatePatient } = usePatient()
  const [view, setView] = useState('main') // 'main' | 'steps' | 'feedback'
  const [feedback, setFeedback] = useState(null) // 'bien' | 'regular' | 'dificil'
  const [saved, setSaved] = useState(false)

  const name = patient.name?.split(' ')[0] || 'tu hijo/a'
  const alreadyDoneToday = doneToday(patient.sessionHistory)
  const sessionsThisWeek = countHomeSessionsThisWeek(patient.sessionHistory)
  const targetPerWeek = patient.therapyPlan?.sessionsPerWeek || 3

  // Semana activa del plan
  const currentWeek = getCurrentPlanWeek(patient.therapyPlan)
  const dailyTask = useMemo(() =>
    buildDailyTask(currentWeek?.homeTask, name),
    [currentWeek?.homeTask?.area, name]
  )

  const weeklyTip = getWeeklyTip(
    patient.diagnosis,
    currentWeek?.week || 1
  )

  // Sin plan → mensaje simple
  if (!patient.therapyPlan || !currentWeek) {
    return (
      <div style={mainStyles.root}>
        <Header name={name} />
        <div style={mainStyles.noPlanCard}>
          <span style={{ fontSize: 40 }}>📋</span>
          <h2 style={mainStyles.noPlanTitle}>Sin actividades por ahora</h2>
          <p style={mainStyles.noPlanText}>
            El terapeuta aún no ha generado el plan de {name}. En la próxima sesión se configurará.
          </p>
        </div>
      </div>
    )
  }

  // ── Vista: pasos ────────────────────────────────────────────────────────────
  if (view === 'steps') {
    return (
      <StepsView
        task={dailyTask}
        patientName={name}
        onBack={() => setView('main')}
        onDone={() => setView('feedback')}
      />
    )
  }

  // ── Vista: feedback ─────────────────────────────────────────────────────────
  if (view === 'feedback') {
    return (
      <FeedbackView
        task={dailyTask}
        patientName={name}
        feedback={feedback}
        setFeedback={setFeedback}
        saved={saved}
        onSave={() => {
          const entry = {
            id: String(Date.now()),
            type: 'home_activity',
            date: new Date().toISOString(),
            area: dailyTask.area,
            taskTitle: dailyTask.title,
            feedback: feedback || 'sin_registrar',
            weekNumber: currentWeek.week,
          }
          addSessionEntry(entry)
          if (patient.id) {
            persistPatient(patient.id, {
              sessionHistory: [...(patient.sessionHistory || []), entry],
            })
          }
          setSaved(true)
          setTimeout(() => setView('done'), 1200)
        }}
      />
    )
  }

  // ── Vista: completado ───────────────────────────────────────────────────────
  if (view === 'done') {
    return (
      <DoneView
        patientName={name}
        sessionsThisWeek={sessionsThisWeek + 1}
        targetPerWeek={targetPerWeek}
        onBack={() => setView('main')}
      />
    )
  }

  // ── Vista: principal ────────────────────────────────────────────────────────
  return (
    <div style={mainStyles.root}>
      <Header name={name} />

      <div style={mainStyles.content}>

        {/* ── Tarea del día ── */}
        <div style={mainStyles.taskCard}>
          <p style={mainStyles.taskMeta}>HOY TOCA · {currentWeek.sessionDuration} min</p>

          <div style={mainStyles.taskHero}>
            <span style={mainStyles.taskEmoji}>{dailyTask.emoji}</span>
            <div>
              <h2 style={mainStyles.taskTitle}>{dailyTask.title}</h2>
              <p style={mainStyles.taskArea}>{dailyTask.area}</p>
            </div>
          </div>

          {/* Preview de qué observar */}
          <div style={mainStyles.observePreview}>
            <p style={mainStyles.observeLabel}>Qué observar</p>
            {dailyTask.observe.map((obs, i) => (
              <div key={i} style={mainStyles.observeRow}>
                <span style={mainStyles.observeDot} />
                <span style={mainStyles.observeText}>{obs}</span>
              </div>
            ))}
          </div>

          {alreadyDoneToday ? (
            <div style={mainStyles.doneTodayBadge}>
              ✅ Ya lo hicieron hoy — ¡Excelente!
            </div>
          ) : (
            <button style={mainStyles.startBtn} onClick={() => setView('steps')}>
              Ver cómo hacerlo →
            </button>
          )}
        </div>

        {/* ── Progreso semanal ── */}
        <div style={mainStyles.progressCard}>
          <p style={mainStyles.progressTitle}>Progreso de la semana</p>

          <div style={mainStyles.progressDots}>
            {Array.from({ length: targetPerWeek }).map((_, i) => (
              <div key={i} style={{
                ...mainStyles.progressDot,
                background: i < sessionsThisWeek ? '#4aab8a' : '#e8e8e8',
                transform: i < sessionsThisWeek ? 'scale(1.1)' : 'scale(1)',
              }} />
            ))}
          </div>

          <p style={mainStyles.progressText}>
            {sessionsThisWeek === 0
              ? 'Aún no hicieron prácticas esta semana'
              : sessionsThisWeek >= targetPerWeek
                ? '¡Meta de la semana cumplida! 🎉'
                : `${sessionsThisWeek} de ${targetPerWeek} prácticas hechas`}
          </p>
        </div>

        {/* ── Consejo de la semana ── */}
        <div style={mainStyles.tipCard}>
          <p style={mainStyles.tipLabel}>💡 Consejo de la semana</p>
          <p style={mainStyles.tipText}>{weeklyTip}</p>
        </div>

      </div>
    </div>
  )
}

// ─── Vista de pasos ───────────────────────────────────────────────────────────

function StepsView({ task, patientName, onBack, onDone }) {
  const [currentStep, setCurrentStep] = useState(0)
  const steps = task.steps

  const isLast = currentStep === steps.length - 1

  return (
    <div style={stepsStyles.root}>
      {/* Header */}
      <div style={stepsStyles.header}>
        <button onClick={onBack} style={stepsStyles.backBtn}>←</button>
        <div style={stepsStyles.progressBar}>
          <div style={{
            ...stepsStyles.progressFill,
            width: `${((currentStep + 1) / steps.length) * 100}%`,
          }} />
        </div>
        <span style={stepsStyles.stepCount}>{currentStep + 1}/{steps.length}</span>
      </div>

      <div style={stepsStyles.content}>
        {/* Paso actual */}
        <div style={stepsStyles.phaseTag}>{steps[currentStep].phase}</div>

        <div style={stepsStyles.stepEmoji}>{steps[currentStep].emoji}</div>
        <h2 style={stepsStyles.stepTitle}>{steps[currentStep].title}</h2>
        <p style={stepsStyles.stepInstruction}>{steps[currentStep].instruction}</p>

        {/* Tip del paso */}
        <div style={stepsStyles.tipBox}>
          <span style={{ fontSize: 16 }}>💡</span>
          <p style={stepsStyles.tipText}>{steps[currentStep].tip}</p>
        </div>

        {/* Duración del paso */}
        <div style={stepsStyles.durationBadge}>
          ⏱ {steps[currentStep].duration}
        </div>
      </div>

      {/* Footer navegación */}
      <div style={stepsStyles.footer}>
        {currentStep > 0 && (
          <button
            style={stepsStyles.prevBtn}
            onClick={() => setCurrentStep(s => s - 1)}
          >
            ← Anterior
          </button>
        )}
        <button
          style={stepsStyles.nextBtn}
          onClick={() => isLast ? onDone() : setCurrentStep(s => s + 1)}
        >
          {isLast ? '✅ Listo, lo hicimos' : 'Siguiente →'}
        </button>
      </div>
    </div>
  )
}

// ─── Vista de feedback ────────────────────────────────────────────────────────

function FeedbackView({ task, patientName, feedback, setFeedback, saved, onSave }) {
  const options = [
    { value: 'bien',    emoji: '😊', label: 'Muy bien',      desc: 'Participó con ganas' },
    { value: 'regular', emoji: '😐', label: 'Regular',       desc: 'Algo le costó' },
    { value: 'dificil', emoji: '😓', label: 'Fue difícil',   desc: 'Hoy no era el día' },
  ]

  return (
    <div style={feedbackStyles.root}>
      <div style={feedbackStyles.content}>
        <span style={{ fontSize: 48 }}>🎯</span>
        <h2 style={feedbackStyles.title}>¡Lo intentaron!</h2>
        <p style={feedbackStyles.subtitle}>¿Cómo estuvo {patientName} hoy?</p>

        <div style={feedbackStyles.options}>
          {options.map(opt => (
            <button
              key={opt.value}
              style={{
                ...feedbackStyles.option,
                borderColor: feedback === opt.value ? '#4aab8a' : '#e8e8e8',
                background: feedback === opt.value ? '#f0faf6' : '#fff',
              }}
              onClick={() => setFeedback(opt.value)}
            >
              <span style={{ fontSize: 28 }}>{opt.emoji}</span>
              <div>
                <p style={feedbackStyles.optionLabel}>{opt.label}</p>
                <p style={feedbackStyles.optionDesc}>{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          style={{
            ...feedbackStyles.saveBtn,
            opacity: saved ? 0.7 : 1,
          }}
          onClick={onSave}
          disabled={saved}
        >
          {saved ? '✓ Guardado' : '✅ Lo hicimos hoy'}
        </button>

        <p style={feedbackStyles.note}>
          El terapeuta verá esta información en la próxima sesión.
        </p>
      </div>
    </div>
  )
}

// ─── Vista de celebración ─────────────────────────────────────────────────────

function DoneView({ patientName, sessionsThisWeek, targetPerWeek, onBack }) {
  const metaCumplida = sessionsThisWeek >= targetPerWeek

  return (
    <div style={doneStyles.root}>
      <div style={doneStyles.content}>
        <span style={{ fontSize: 64 }}>{metaCumplida ? '🏆' : '⭐'}</span>
        <h2 style={doneStyles.title}>
          {metaCumplida ? '¡Meta cumplida!' : '¡Bien hecho!'}
        </h2>
        <p style={doneStyles.subtitle}>
          {metaCumplida
            ? `Completaron todas las prácticas de la semana. El terapeuta lo verá en la próxima sesión.`
            : `${sessionsThisWeek} de ${targetPerWeek} prácticas esta semana. ¡Sigan así!`}
        </p>

        <div style={doneStyles.dots}>
          {Array.from({ length: targetPerWeek }).map((_, i) => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: '50%',
              background: i < sessionsThisWeek ? '#4aab8a' : '#e8e8e8',
            }} />
          ))}
        </div>

        <button style={doneStyles.backBtn} onClick={onBack}>
          Volver al inicio
        </button>
      </div>
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ name }) {
  return (
    <div style={mainStyles.header}>
      <div>
        <p style={mainStyles.headerGreeting}>Hola 👋</p>
        <h1 style={mainStyles.headerName}>Actividades de {name}</h1>
      </div>
      <div style={mainStyles.headerLogo}>🎯</div>
    </div>
  )
}

// ─── Componente raíz ──────────────────────────────────────────────────────────

export default function HomeModeScreen({ onBack }) {
  const { patient } = usePatient()
  const [unlocked, setUnlocked] = useState(false)

  if (!unlocked) {
    return <HomePinScreen onUnlock={() => setUnlocked(true)} />
  }

  return <HomeMainScreen patient={patient} onDone={onBack} />
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const pinStyles = {
  root: {
    minHeight: '100dvh',
    background: 'linear-gradient(160deg, #f0faf6 0%, #fafafa 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    padding: '32px 28px',
    width: '100%',
    maxWidth: 340,
    textAlign: 'center',
    boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1a2a1a',
    margin: '0 0 8px',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    margin: '0 0 24px',
    lineHeight: 1.5,
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: '50%',
  },
  keypad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
  },
  key: {
    padding: '16px',
    borderRadius: 14,
    border: '2px solid #e8f5f0',
    background: '#fff',
    fontSize: 22,
    fontWeight: 600,
    cursor: 'pointer',
    color: '#1a2a1a',
    transition: 'background 0.1s',
  },
  keyEmpty: {
    padding: 16,
  },
}

const mainStyles = {
  root: {
    minHeight: '100dvh',
    background: '#f5f7f5',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  header: {
    background: 'linear-gradient(135deg, #4aab8a 0%, #3d9478 100%)',
    padding: '32px 24px 24px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    margin: '0 0 4px',
    fontWeight: 600,
  },
  headerName: {
    fontSize: 22,
    fontWeight: 800,
    color: '#fff',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  headerLogo: {
    fontSize: 32,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    width: 56,
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: '16px 16px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    maxWidth: 480,
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  // Task card
  taskCard: {
    background: '#fff',
    borderRadius: 20,
    padding: '20px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
  },
  taskMeta: {
    fontSize: 11,
    fontWeight: 700,
    color: '#4aab8a',
    letterSpacing: '0.5px',
    margin: '0 0 12px',
  },
  taskHero: {
    display: 'flex',
    gap: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  taskEmoji: {
    fontSize: 40,
    lineHeight: 1,
    flexShrink: 0,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: '#1a2a1a',
    margin: '0 0 4px',
    letterSpacing: '-0.3px',
  },
  taskArea: {
    fontSize: 12,
    color: '#888',
    margin: 0,
    fontWeight: 600,
  },
  observePreview: {
    background: '#f8faf9',
    borderRadius: 12,
    padding: '12px 14px',
    marginBottom: 16,
  },
  observeLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#2d7a62',
    margin: '0 0 8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  observeRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  observeDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#4aab8a',
    flexShrink: 0,
    marginTop: 5,
  },
  observeText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 1.4,
  },
  startBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #4aab8a 0%, #3d9478 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '-0.2px',
  },
  doneTodayBadge: {
    width: '100%',
    padding: '14px',
    background: '#f0faf6',
    border: '2px solid #4aab8a',
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 700,
    color: '#2d7a62',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  // Progress card
  progressCard: {
    background: '#fff',
    borderRadius: 20,
    padding: '18px 20px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1a2a1a',
    margin: '0 0 14px',
  },
  progressDots: {
    display: 'flex',
    gap: 10,
    marginBottom: 10,
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    transition: 'all 0.2s',
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    margin: 0,
    fontWeight: 500,
  },
  // Tip card
  tipCard: {
    background: 'linear-gradient(135deg, #fff8e6 0%, #fff3d6 100%)',
    borderRadius: 20,
    padding: '18px 20px',
    border: '1.5px solid #f0d080',
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#7a5c00',
    margin: '0 0 8px',
  },
  tipText: {
    fontSize: 15,
    color: '#5a3c00',
    margin: 0,
    lineHeight: 1.6,
    fontWeight: 500,
  },
  // No plan
  noPlanCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    gap: 16,
    textAlign: 'center',
  },
  noPlanTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1a2a1a',
    margin: 0,
  },
  noPlanText: {
    fontSize: 14,
    color: '#666',
    margin: 0,
    lineHeight: 1.6,
    maxWidth: 300,
  },
}

const stepsStyles = {
  root: {
    minHeight: '100dvh',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 20px',
    borderBottom: '1px solid #f0f0f0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: '2px solid #e8f5f0',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 16,
    color: '#3a3a3a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  progressBar: {
    flex: 1,
    height: 6,
    background: '#e8e8e8',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #4aab8a, #7c6bb0)',
    borderRadius: 99,
    transition: 'width 0.4s ease',
  },
  stepCount: {
    fontSize: 12,
    fontWeight: 700,
    color: '#aaa',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 16,
  },
  phaseTag: {
    background: '#f0faf6',
    color: '#2d7a62',
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 14px',
    borderRadius: 99,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  stepEmoji: {
    fontSize: 56,
    lineHeight: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: '#1a2a1a',
    margin: 0,
    letterSpacing: '-0.4px',
  },
  stepInstruction: {
    fontSize: 16,
    color: '#333',
    margin: 0,
    lineHeight: 1.7,
    maxWidth: 380,
  },
  tipBox: {
    background: '#fffbe8',
    border: '1.5px solid #f0d080',
    borderRadius: 14,
    padding: '14px 16px',
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    textAlign: 'left',
    maxWidth: 380,
    width: '100%',
  },
  tipText: {
    fontSize: 13,
    color: '#7a5c00',
    margin: 0,
    lineHeight: 1.6,
    flex: 1,
  },
  durationBadge: {
    background: '#f0faf6',
    color: '#2d7a62',
    fontSize: 13,
    fontWeight: 700,
    padding: '6px 16px',
    borderRadius: 99,
  },
  footer: {
    padding: '16px 20px 32px',
    display: 'flex',
    gap: 10,
  },
  prevBtn: {
    flex: 1,
    padding: '14px',
    background: '#fff',
    border: '2px solid #e8e8e8',
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    color: '#666',
  },
  nextBtn: {
    flex: 2,
    padding: '14px',
    background: 'linear-gradient(135deg, #4aab8a 0%, #3d9478 100%)',
    border: 'none',
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    color: '#fff',
  },
}

const feedbackStyles = {
  root: {
    minHeight: '100dvh',
    background: '#f5f7f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  content: {
    background: '#fff',
    borderRadius: 24,
    padding: '32px 24px',
    width: '100%',
    maxWidth: 400,
    textAlign: 'center',
    boxShadow: '0 4px 32px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: '#1a2a1a',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    margin: 0,
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    width: '100%',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 16px',
    borderRadius: 14,
    border: '2px solid #e8e8e8',
    background: '#fff',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
    width: '100%',
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: 700,
    color: '#1a2a1a',
    margin: '0 0 2px',
  },
  optionDesc: {
    fontSize: 12,
    color: '#888',
    margin: 0,
  },
  saveBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #4aab8a 0%, #3d9478 100%)',
    border: 'none',
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    color: '#fff',
    cursor: 'pointer',
  },
  note: {
    fontSize: 12,
    color: '#bbb',
    margin: 0,
  },
}

const doneStyles = {
  root: {
    minHeight: '100dvh',
    background: 'linear-gradient(160deg, #f0faf6 0%, #f5f0fa 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  content: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    maxWidth: 360,
  },
  title: {
    fontSize: 28,
    fontWeight: 900,
    color: '#1a2a1a',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: 15,
    color: '#444',
    margin: 0,
    lineHeight: 1.6,
  },
  dots: {
    display: 'flex',
    gap: 10,
    justifyContent: 'center',
  },
  backBtn: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #4aab8a 0%, #3d9478 100%)',
    border: 'none',
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 700,
    color: '#fff',
    cursor: 'pointer',
    marginTop: 8,
  },
}
