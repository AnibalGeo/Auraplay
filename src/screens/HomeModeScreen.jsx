/**
 * HomeModeScreen.jsx — v3
 * Modo Familia — AuraPlay
 *
 * Cambios v3:
 *   - useAuth importado → logout conectado al header
 *   - Botón "Salir" visible en header superior derecha (siempre)
 *   - Confirm dialog antes de cerrar sesión
 *   - Sin PIN interno (auth v3 ya maneja el acceso desde LandingScreen)
 *
 * Fix v2 mantenido:
 *   - buildDailyTask retorna steps como objetos completos { phase, emoji, title, instruction, tip, duration }
 *   - Lenguaje neutro e inclusivo
 */

import { useState, useMemo } from 'react'
import { usePatient } from '../context/PatientContext'
import { useAuth } from '../context/AuthContext'
import { updatePatient as persistPatient } from '../data/patients'
import { APP_CONFIG } from '../config/app.config'

// ─── buildDailyTask ───────────────────────────────────────────────────────────

function buildDailyTask(homeTask, patientName) {
  if (!homeTask) return null
  const n = patientName || 'él/ella'

  const TASK_BANK = {
    'Respuesta al nombre': {
      title: `Llama a ${n} por su nombre`,
      emoji: '📣',
      area: 'Respuesta al nombre',
      observe: ['¿Giró la cabeza hacia ti?', '¿Hizo contacto visual?', '¿Sonrió o reaccionó?'],
      steps: [
        { phase: 'Preparación', emoji: '🌱', title: 'Ubícate cerca',
          instruction: `Acércate a ${n} y espera que esté tranquilo/a. Ponerte a su altura ayuda.`,
          tip: 'No lo hagas desde lejos ni con distracciones. La cercanía importa.', duration: '1 minuto' },
        { phase: 'Actividad', emoji: '📣', title: 'Di su nombre con voz normal',
          instruction: `Di el nombre de ${n} una sola vez, con voz tranquila. Espera en silencio hasta 5 segundos.`,
          tip: 'Si no responde, no repitas de inmediato. La espera es parte de la actividad.', duration: '3 minutos' },
        { phase: 'Celebración', emoji: '🌟', title: 'Celebra cualquier reacción',
          instruction: `Cuando ${n} gire la cabeza o te mire, celebra: "¡Aquí estoy!" con cara alegre.`,
          tip: 'Cualquier reacción vale. El objetivo es que asocie su nombre con algo positivo.', duration: '1 minuto' },
      ],
    },
    'Contacto visual y engagement': {
      title: 'Juego cara a cara',
      emoji: '👀',
      area: 'Contacto visual y engagement',
      observe: ['¿Te buscó con la mirada?', '¿Cuánto tiempo sostuvo el contacto?', '¿Sonrió?'],
      steps: [
        { phase: 'Preparación', emoji: '🌱', title: 'Baja a su nivel',
          instruction: `Siéntate en el suelo frente a ${n}. Espera que te mire antes de hacer cualquier cosa.`,
          tip: 'Al nivel de sus ojos eres más interesante que desde arriba.', duration: '1 minuto' },
        { phase: 'Actividad', emoji: '👀', title: 'Haz algo inesperado y espera',
          instruction: `Haz algo divertido — una mueca, un sonido gracioso. Luego pausa y espera que ${n} te mire.`,
          tip: 'La clave es la pausa. No llenes el silencio. La espera crea la oportunidad.', duration: '5 minutos' },
        { phase: 'Celebración', emoji: '🌟', title: 'Nombra lo que hizo',
          instruction: `Cada vez que ${n} te mire, dilo: "¡Me miraste!" Termina con algo que le guste.`,
          tip: 'El elogio específico construye más que el "muy bien" genérico.', duration: '1 minuto' },
      ],
    },
    'Atención sostenida': {
      title: 'Actividad favorita sin interrupciones',
      emoji: '⏱️',
      area: 'Atención sostenida',
      observe: ['¿Cuántos minutos sostuvo la atención?', '¿Participó activamente?', '¿Pidió continuar?'],
      steps: [
        { phase: 'Preparación', emoji: '🌱', title: 'Elige UNA actividad',
          instruction: `Prepara solo UN juguete que a ${n} le guste. Sin pantallas ni otros juguetes cerca.`,
          tip: 'Menos opciones = más foco.', duration: '1 minuto' },
        { phase: 'Actividad', emoji: '⏱️', title: 'Juega junto a él/ella 5 minutos',
          instruction: `Únete sin tomar el control. Si arma bloques, arma tú también. Sin cambiar de actividad.`,
          tip: 'Si se distrae, no lo corrijas. Vuelve suavemente con tu propio ejemplo.', duration: '5 minutos' },
        { phase: 'Cierre', emoji: '🌟', title: 'Termina con aviso previo',
          instruction: `Avisa antes: "Dos veces más y guardamos". Luego cierra aunque quiera seguir.`,
          tip: 'Los cierres predecibles son tan importantes como la actividad misma.', duration: '1 minuto' },
      ],
    },
    'Señalamiento y atención conjunta': {
      title: 'Señalamos juntos',
      emoji: '👆',
      area: 'Señalamiento y atención conjunta',
      observe: ['¿Miró hacia donde señalaste?', '¿Señaló algo solo/a?', '¿Intentó nombrar algo?'],
      steps: [
        { phase: 'Preparación', emoji: '🌱', title: 'Busca un momento con cosas interesantes',
          instruction: 'Elige un paseo, el desayuno o una ventana. Necesitas cosas para señalar.',
          tip: 'Los paseos son ideales. El movimiento genera oportunidades naturales.', duration: '1 minuto' },
        { phase: 'Actividad', emoji: '👆', title: 'Señala y nombra',
          instruction: `Señala algo y nómbralo: "¡Mira, un perro!" Espera que ${n} siga tu señal con la mirada.`,
          tip: 'No preguntes "¿qué es eso?" todavía. Primero modela, después espera.', duration: '5 minutos' },
        { phase: 'Cierre', emoji: '🌟', title: 'Repite 3 favoritos',
          instruction: 'Señala de nuevo 3 cosas que llamaron su atención y repite los nombres.',
          tip: 'La repetición sin presión consolida el vocabulario.', duration: '1 minuto' },
      ],
    },
    'Imitación (prerequisito crítico)': {
      title: 'El juego del espejo',
      emoji: '🪞',
      area: 'Imitación',
      observe: ['¿Imitó alguna acción?', '¿Imitó algún sonido?', '¿Disfrutó el juego?'],
      steps: [
        { phase: 'Calentamiento', emoji: '🌱', title: 'Tú imitas primero',
          instruction: `Durante 2 minutos, copia exactamente lo que haga ${n} — sonidos, gestos, acciones.`,
          tip: 'Al imitarlo/a, le muestras que le prestas atención total.', duration: '2 minutos' },
        { phase: 'Actividad', emoji: '🪞', title: 'Ahora propones tú',
          instruction: `Haz una acción simple frente a ${n}: palmada, soplar. Espera hasta 5 segundos.`,
          tip: 'Empieza con acciones que ya hizo él/ella.', duration: '5 minutos' },
        { phase: 'Cierre', emoji: '🌟', title: 'Termina con éxito garantizado',
          instruction: 'Termina con algo que ya sabe hacer. Un abrazo o choque de manos al final.',
          tip: 'Nunca termines cuando está frustrado/a. Busca un pequeño éxito para cerrar.', duration: '1 minuto' },
      ],
    },
    'Primeras palabras funcionales': {
      title: 'Nombrar lo que quiere',
      emoji: '🗣️',
      area: 'Primeras palabras funcionales',
      observe: ['¿Vocalizó algo?', '¿Señaló o extendió la mano?', '¿Intentó imitar alguna palabra?'],
      steps: [
        { phase: 'Preparación', emoji: '🌱', title: 'Prepara algo que le guste mucho',
          instruction: `Elige un objeto o comida que ${n} desee. Tenlo a la vista pero fuera de su alcance.`,
          tip: 'La motivación es el motor del lenguaje. Usa lo que de verdad quiere.', duration: '1 minuto' },
        { phase: 'Actividad', emoji: '🗣️', title: 'Espera antes de dar',
          instruction: 'Ofrece con cara de expectativa y espera 5 segundos en silencio.',
          tip: 'No pidas que repita. No digas "di...". Solo espera.', duration: '5 minutos' },
        { phase: 'Celebración', emoji: '🌟', title: 'Celebra el intento',
          instruction: 'Si hace cualquier intento comunicativo, dáselo inmediatamente y celebra.',
          tip: '"Quieres leche" dicho por ti mientras se la das es más poderoso que pedir que repita.', duration: '1 minuto' },
      ],
    },
    'Combinación de dos palabras': {
      title: 'Frases de dos palabras',
      emoji: '💬',
      area: 'Combinación de dos palabras',
      observe: ['¿Usó dos palabras juntas?', '¿Intentó expandir lo que decía?', '¿Repitió alguna frase?'],
      steps: [
        { phase: 'Preparación', emoji: '🌱', title: 'Elige una rutina cotidiana',
          instruction: 'El desayuno, el baño o el juego libre son perfectos.',
          tip: 'Las rutinas cotidianas son el mejor contexto de aprendizaje.', duration: '1 minuto' },
        { phase: 'Actividad', emoji: '💬', title: 'Modela frases de dos palabras',
          instruction: 'Usa frases cortas en momentos naturales: "más leche", "nene salta", "pelota cae".',
          tip: 'No pidas que repita. Si dice solo una palabra, expándela tú.', duration: '5 minutos' },
        { phase: 'Cierre', emoji: '🌟', title: 'Repite las 3 mejores',
          instruction: 'Repite naturalmente 3 de las combinaciones que usaste. Sin presión.',
          tip: 'La repetición espaciada funciona mejor que una sesión larga.', duration: '1 minuto' },
      ],
    },
    'Pragmática social y atención conjunta': {
      title: 'Juego de turnos',
      emoji: '⚽',
      area: 'Pragmática social y turnos',
      observe: ['¿Tomó el turno?', '¿Hubo contacto visual?', '¿Pidió más?'],
      steps: [
        { phase: 'Preparación', emoji: '🌱', title: 'Prepara el espacio',
          instruction: `Siéntate en el suelo frente a ${n} con una pelota. Sin otras distracciones.`,
          tip: 'La posición cara a cara crea igualdad en el juego.', duration: '1 minuto' },
        { phase: 'Actividad', emoji: '⚽', title: 'Rueda y espera',
          instruction: `Rueda la pelota diciendo "tu turno" y espera hasta 10 segundos en silencio.`,
          tip: 'No importa cómo devuelve. Cualquier participación se celebra igual.', duration: '6 minutos' },
        { phase: 'Cierre', emoji: '🌟', title: 'Nombra lo que pasó',
          instruction: '"¡Me la pasaste! ¡Jugamos juntos!" Nombrar el logro lo consolida.',
          tip: 'El lenguaje que describe la experiencia justo después es el que más se aprende.', duration: '1 minuto' },
      ],
    },
    'Regulación atencional y sesiones cortas': {
      title: 'Actividad corta y predecible',
      emoji: '⏰',
      area: 'Regulación atencional',
      observe: ['¿Terminó sin crisis?', '¿Anticipó el fin?', '¿Pidió continuar?'],
      steps: [
        { phase: 'Preparación', emoji: '🌱', title: 'Avisa cuánto dura',
          instruction: '"Vamos a jugar 5 minutos y después guardamos." Muéstrale el timer si tienes.',
          tip: 'La anticipación reduce la resistencia al cambio.', duration: '1 minuto' },
        { phase: 'Actividad', emoji: '⏰', title: 'Actividad simple y motivante',
          instruction: 'Realiza una actividad que le guste durante exactamente 5 minutos.',
          tip: 'Cumple el tiempo acordado — siempre. La previsibilidad construye confianza.', duration: '5 minutos' },
        { phase: 'Cierre', emoji: '🌟', title: 'Cierra como dijiste',
          instruction: 'Al acabar: "Se acabó por hoy. Mañana jugamos de nuevo." Con calma.',
          tip: 'La consistencia hoy evita la batalla mañana.', duration: '1 minuto' },
      ],
    },
    'Regulación sensorial como prerequisito': {
      title: 'Momento de calma primero',
      emoji: '🌊',
      area: 'Regulación sensorial',
      observe: ['¿Se calmó visiblemente?', '¿Pudo sostener la actividad después?', '¿Cuánto tiempo?'],
      steps: [
        { phase: 'Preparación', emoji: '🌱', title: 'Identifica qué lo/la calma',
          instruction: `Observa qué calma a ${n}: saltar, apretar algo, balancearse, música tranquila.`,
          tip: 'Cada niño/a tiene su regulador sensorial propio.', duration: '1 minuto' },
        { phase: 'Actividad', emoji: '🌊', title: '3-5 minutos de regulación',
          instruction: 'Permite la actividad reguladora sin interrupciones ni objetivos.',
          tip: 'Su único propósito es preparar el sistema nervioso para aprender.', duration: '5 minutos' },
        { phase: 'Transición', emoji: '🌟', title: 'Transición suave',
          instruction: '"En un ratito vamos a hacer algo juntos." Espera que esté listo/a.',
          tip: 'Si se agita durante la actividad posterior, vuelve a la regulación.', duration: '1 minuto' },
      ],
    },
    'default': {
      title: 'Conversación en rutina',
      emoji: '🏠',
      area: 'Conversación cotidiana',
      observe: ['¿Respondió de alguna forma?', '¿Inició algo por su cuenta?', '¿Se mantuvo atento/a?'],
      steps: [
        { phase: 'Preparación', emoji: '🌱', title: 'Elige una rutina del día',
          instruction: 'Desayuno, baño, camino al jardín. Ocurren todos los días y son predecibles.',
          tip: 'No necesitas materiales. La rutina cotidiana es la mejor sala de terapia.', duration: '1 minuto' },
        { phase: 'Actividad', emoji: '🏠', title: 'Habla sobre lo que ven y hacen',
          instruction: 'Narra lo que ocurre con frases cortas. Señala lo que nombras. Deja silencios.',
          tip: 'Usa frases un poco más largas que las que él/ella usa.', duration: '6 minutos' },
        { phase: 'Cierre', emoji: '🌟', title: 'Reconoce el momento',
          instruction: '"Qué bien que conversamos." Aunque parezca pequeño, nombrarlo lo hace significativo.',
          tip: 'La conexión emocional durante el lenguaje es lo que hace que se aprenda.', duration: '1 minuto' },
      ],
    },
  }

  const area = homeTask.area || 'default'
  return { ...(TASK_BANK[area] || TASK_BANK['default']), rawTask: homeTask.task }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WEEKLY_TIPS = {
  tel:         ['No anticipes todo. Dale tiempo y espacio para pedir.', 'Una palabra en contexto real vale más que 10 repetidas en ejercicio.', 'El juego es la terapia. Si juegan juntos, están trabajando.', 'Las rutinas predecibles ayudan al lenguaje.'],
  tl_tea:      ['Sigue su interés, no el tuyo.', 'La mirada no siempre significa falta de atención.', 'Avisa antes de cada cambio: "En 2 minutos terminamos".', 'Tu entusiasmo es contagioso. Aunque no lo muestre, lo registra.'],
  tl_tdah:     ['Sesiones cortas y frecuentes funcionan mejor que una larga.', 'Mueve el cuerpo primero, luego la actividad de lenguaje.', 'Elige un solo objetivo por sesión.', 'El error no importa. Lo que importa es que lo intentó.'],
  tl_tea_tdah: ['Primero calma, luego lenguaje.', 'Menos estímulos = más atención. Un juguete a la vez.', 'Tu voz tranquila es más efectiva que la insistente.', 'Cada pequeño logro cuenta.'],
}

function getWeeklyTip(diagnosis, weekNumber) {
  const tips = WEEKLY_TIPS[diagnosis] || WEEKLY_TIPS.tel
  return tips[(weekNumber - 1) % tips.length]
}

function getCurrentPlanWeek(therapyPlan) {
  if (!therapyPlan) return null
  return therapyPlan.weeks.find(w => !w.completed) || therapyPlan.weeks[therapyPlan.weeks.length - 1]
}

function countHomeSessionsThisWeek(sessionHistory) {
  if (!sessionHistory?.length) return 0
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  return sessionHistory.filter(e => e.type === 'home_activity' && new Date(e.date).getTime() > cutoff).length
}

function doneToday(sessionHistory) {
  if (!sessionHistory?.length) return false
  const today = new Date().toISOString().slice(0, 10)
  return sessionHistory.some(e => e.type === 'home_activity' && e.date?.slice(0, 10) === today)
}

// ─── Header con logout ────────────────────────────────────────────────────────

function FamilyHeader({ name, onLogout }) {
  const [confirmLogout, setConfirmLogout] = useState(false)

  return (
    <>
      <div style={S.mainHeader}>
        <div>
          <p style={S.mainGreeting}>Hola 👋</p>
          <h1 style={S.mainName}>Actividades de {name}</h1>
        </div>

        {/* Botón cerrar sesión — visible siempre, esquina superior derecha */}
        <button
          onClick={() => setConfirmLogout(true)}
          style={S.logoutBtn}
        >
          <span style={{ fontSize: 14 }}>⎋</span> Salir
        </button>
      </div>

      {/* Confirm dialog */}
      {confirmLogout && (
        <div style={S.overlay}>
          <div style={S.confirmCard}>
            <span style={{ fontSize: 36 }}>👋</span>
            <div>
              <h3 style={S.confirmTitle}>¿Cerrar sesión?</h3>
              <p style={S.confirmText}>Volverás a la pantalla de inicio de {APP_CONFIG.name}.</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={S.cancelBtn} onClick={() => setConfirmLogout(false)}>Cancelar</button>
              <button style={S.confirmLogoutBtn} onClick={onLogout}>Cerrar sesión</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Steps View ───────────────────────────────────────────────────────────────

function StepsView({ task, onBack, onDone }) {
  const [idx, setIdx] = useState(0)
  const steps  = task.steps || []
  const step   = steps[idx]
  const isLast = idx === steps.length - 1

  if (!step) return null

  return (
    <div style={S.stepsRoot}>
      <div style={S.stepsHeader}>
        <button onClick={onBack} style={S.stepsBackBtn}>←</button>
        <div style={S.stepsProgressBar}>
          <div style={{ ...S.stepsProgressFill, width: `${((idx + 1) / steps.length) * 100}%` }} />
        </div>
        <span style={S.stepsCount}>{idx + 1}/{steps.length}</span>
      </div>

      <div style={S.stepsContent}>
        <div style={S.stepsPhaseTag}>{step.phase || 'Actividad'}</div>
        <div style={{ fontSize: 56, lineHeight: 1 }}>{step.emoji || task.emoji}</div>
        <h2 style={S.stepsTitle}>{step.title}</h2>
        <p style={S.stepsInstruction}>{step.instruction}</p>
        {step.tip && (
          <div style={S.stepsTipBox}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
            <p style={S.stepsTipText}>{step.tip}</p>
          </div>
        )}
        {step.duration && <div style={S.stepsDuration}>⏱ {step.duration}</div>}
      </div>

      <div style={S.stepsFooter}>
        {idx > 0 && <button style={S.stepsPrevBtn} onClick={() => setIdx(i => i - 1)}>← Anterior</button>}
        <button style={S.stepsNextBtn} onClick={() => isLast ? onDone() : setIdx(i => i + 1)}>
          {isLast ? '✅ Listo, lo hicimos' : 'Siguiente →'}
        </button>
      </div>
    </div>
  )
}

// ─── Feedback View ────────────────────────────────────────────────────────────

function FeedbackView({ patientName, feedback, setFeedback, saved, onSave }) {
  const opts = [
    { value: 'bien',    emoji: '😊', label: 'Muy bien',    desc: 'Participó con ganas' },
    { value: 'regular', emoji: '😐', label: 'Regular',     desc: 'Algo le costó' },
    { value: 'dificil', emoji: '😓', label: 'Fue difícil', desc: 'Hoy no era el día' },
  ]
  return (
    <div style={S.feedRoot}>
      <div style={S.feedCard}>
        <span style={{ fontSize: 48 }}>🎯</span>
        <h2 style={S.feedTitle}>¡Lo intentaron!</h2>
        <p style={{ fontSize: 15, color: '#666', margin: 0 }}>¿Cómo estuvo {patientName} hoy?</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          {opts.map(opt => (
            <button key={opt.value} style={{
              ...S.feedOption,
              borderColor: feedback === opt.value ? '#4aab8a' : '#e8e8e8',
              background: feedback === opt.value ? '#f0faf6' : '#fff',
            }} onClick={() => setFeedback(opt.value)}>
              <span style={{ fontSize: 28 }}>{opt.emoji}</span>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1a2a1a', margin: '0 0 2px' }}>{opt.label}</p>
                <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <button style={{ ...S.primaryBtn, opacity: saved ? 0.7 : 1 }} onClick={onSave} disabled={saved}>
          {saved ? '✓ Guardado' : '✅ Lo hicimos hoy'}
        </button>
        <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>
          El/la terapeuta verá esta información en la próxima sesión.
        </p>
      </div>
    </div>
  )
}

// ─── Done View ────────────────────────────────────────────────────────────────

function DoneView({ sessionsThisWeek, targetPerWeek, onBack }) {
  const meta = sessionsThisWeek >= targetPerWeek
  return (
    <div style={S.doneRoot}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, maxWidth: 360 }}>
        <span style={{ fontSize: 64 }}>{meta ? '🏆' : '⭐'}</span>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1a2a1a', margin: 0 }}>
          {meta ? '¡Meta cumplida!' : '¡Bien hecho!'}
        </h2>
        <p style={{ fontSize: 15, color: '#444', margin: 0, lineHeight: 1.6 }}>
          {meta
            ? 'Completaron todas las prácticas de la semana.'
            : `${sessionsThisWeek} de ${targetPerWeek} prácticas esta semana. ¡Sigan así!`}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {Array.from({ length: targetPerWeek }).map((_, i) => (
            <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: i < sessionsThisWeek ? '#4aab8a' : '#e8e8e8' }} />
          ))}
        </div>
        <button style={{ ...S.primaryBtn, padding: '14px 32px', width: 'auto', marginTop: 8 }} onClick={onBack}>
          Volver al inicio
        </button>
      </div>
    </div>
  )
}

// ─── Home Main Screen ─────────────────────────────────────────────────────────

function HomeMainScreen({ patient, onLogout }) {
  const { addSessionEntry } = usePatient()
  const [view,     setView]     = useState('main')
  const [feedback, setFeedback] = useState(null)
  const [saved,    setSaved]    = useState(false)

  const name             = patient.name?.split(' ')[0] || 'tu familiar'
  const alreadyDone      = doneToday(patient.sessionHistory)
  const sessionsThisWeek = countHomeSessionsThisWeek(patient.sessionHistory)
  const targetPerWeek    = patient.therapyPlan?.sessionsPerWeek || 3
  const currentWeek      = getCurrentPlanWeek(patient.therapyPlan)
  const dailyTask        = useMemo(() => buildDailyTask(currentWeek?.homeTask, name), [currentWeek?.homeTask?.area, name])
  const weeklyTip        = getWeeklyTip(patient.diagnosis, currentWeek?.week || 1)

  if (!patient.therapyPlan || !currentWeek || !dailyTask) {
    return (
      <div style={S.mainRoot}>
        <FamilyHeader name={name} onLogout={onLogout} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', gap: 16, textAlign: 'center' }}>
          <span style={{ fontSize: 40 }}>📋</span>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a2a1a', margin: 0 }}>Sin actividades por ahora</h2>
          <p style={{ fontSize: 14, color: '#666', margin: 0, lineHeight: 1.6, maxWidth: 300 }}>
            El/la terapeuta aún no ha generado el plan de {name}.
          </p>
        </div>
      </div>
    )
  }

  function handleSave() {
    const entry = {
      id: String(Date.now()), type: 'home_activity',
      date: new Date().toISOString(),
      area: dailyTask.area, taskTitle: dailyTask.title,
      feedback: feedback || 'sin_registrar',
      weekNumber: currentWeek.week,
    }
    addSessionEntry(entry)
    if (patient.id) persistPatient(patient.id, { sessionHistory: [...(patient.sessionHistory || []), entry] })
    setSaved(true)
    setTimeout(() => setView('done'), 1200)
  }

  if (view === 'steps')    return <StepsView task={dailyTask} onBack={() => setView('main')} onDone={() => setView('feedback')} />
  if (view === 'feedback') return <FeedbackView patientName={name} feedback={feedback} setFeedback={setFeedback} saved={saved} onSave={handleSave} />
  if (view === 'done')     return <DoneView sessionsThisWeek={sessionsThisWeek + 1} targetPerWeek={targetPerWeek} onBack={() => setView('main')} />

  return (
    <div style={S.mainRoot}>
      {/* Header con logout integrado */}
      <FamilyHeader name={name} onLogout={onLogout} />

      <div style={S.mainContent}>
        {/* Tarea del día */}
        <div style={S.taskCard}>
          <p style={S.taskMeta}>HOY TOCA · {currentWeek.sessionDuration} min</p>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 40, lineHeight: 1, flexShrink: 0 }}>{dailyTask.emoji}</span>
            <div>
              <h2 style={S.taskTitle}>{dailyTask.title}</h2>
              <p style={{ fontSize: 12, color: '#888', margin: 0, fontWeight: 600 }}>{dailyTask.area}</p>
            </div>
          </div>
          <div style={S.observeBox}>
            <p style={S.observeLabel}>Qué observar</p>
            {dailyTask.observe.map((obs, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4aab8a', flexShrink: 0, marginTop: 5 }} />
                <span style={{ fontSize: 13, color: '#444', lineHeight: 1.4 }}>{obs}</span>
              </div>
            ))}
          </div>
          {alreadyDone ? (
            <div style={S.doneBadge}>✅ Ya lo hicieron hoy — ¡Excelente!</div>
          ) : (
            <button style={S.primaryBtn} onClick={() => setView('steps')}>Ver cómo hacerlo →</button>
          )}
        </div>

        {/* Progreso */}
        <div style={S.progressCard}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1a2a1a', margin: '0 0 14px' }}>Progreso de la semana</p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            {Array.from({ length: targetPerWeek }).map((_, i) => (
              <div key={i} style={{
                width: 32, height: 32, borderRadius: 10, transition: 'all 0.2s',
                background: i < sessionsThisWeek ? '#4aab8a' : '#e8e8e8',
                transform: i < sessionsThisWeek ? 'scale(1.1)' : 'scale(1)',
              }} />
            ))}
          </div>
          <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
            {sessionsThisWeek === 0 ? 'Aún no hicieron prácticas esta semana'
              : sessionsThisWeek >= targetPerWeek ? '¡Meta de la semana cumplida! 🎉'
              : `${sessionsThisWeek} de ${targetPerWeek} prácticas hechas`}
          </p>
        </div>

        {/* Consejo */}
        <div style={S.tipCard}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#7a5c00', margin: '0 0 8px' }}>💡 Consejo de la semana</p>
          <p style={{ fontSize: 15, color: '#5a3c00', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{weeklyTip}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Export principal ─────────────────────────────────────────────────────────

export default function HomeModeScreen() {
  const { patient }  = usePatient()
  const { logout }   = useAuth()

  // logout() llama setSession(null) → App re-renderiza → Gate 0 muestra LandingScreen
  return <HomeMainScreen patient={patient} onLogout={logout} />
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const S = {
  // Header familia con logout
  mainHeader: {
    background: 'linear-gradient(135deg, #4aab8a 0%, #3d9478 100%)',
    padding: '32px 20px 20px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  mainGreeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: '0 0 4px', fontWeight: 600 },
  mainName:     { fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.5px' },
  // Botón logout — siempre visible, sin opacidad oculta
  logoutBtn: {
    background: 'rgba(255,255,255,0.15)',
    border: '1.5px solid rgba(255,255,255,0.4)',
    borderRadius: 10,
    padding: '8px 12px',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  // Confirm dialog
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200, padding: 24,
  },
  confirmCard: {
    background: '#fff', borderRadius: 20, padding: '28px 24px',
    maxWidth: 320, width: '100%', textAlign: 'center',
    boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
    display: 'flex', flexDirection: 'column', gap: 16,
  },
  confirmTitle: { margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#1a2a1a' },
  confirmText:  { margin: 0, fontSize: 13, color: '#666', lineHeight: 1.5 },
  cancelBtn: {
    flex: 1, padding: '12px', borderRadius: 12,
    border: '2px solid #e8e8e8', background: '#fff',
    fontSize: 14, fontWeight: 600, color: '#666', cursor: 'pointer',
  },
  confirmLogoutBtn: {
    flex: 1, padding: '12px', borderRadius: 12, border: 'none',
    background: 'linear-gradient(135deg, #e07a5f, #c0392b)',
    fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer',
  },
  // Main
  mainRoot:    { minHeight: '100dvh', background: '#f5f7f5', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', system-ui, sans-serif" },
  mainContent: { flex: 1, padding: '16px 16px 40px', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480, width: '100%', margin: '0 auto', boxSizing: 'border-box' },
  taskCard:    { background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' },
  taskMeta:    { fontSize: 11, fontWeight: 700, color: '#4aab8a', letterSpacing: '0.5px', margin: '0 0 12px' },
  taskTitle:   { fontSize: 20, fontWeight: 800, color: '#1a2a1a', margin: '0 0 4px', letterSpacing: '-0.3px' },
  observeBox:  { background: '#f8faf9', borderRadius: 12, padding: '12px 14px', marginBottom: 16 },
  observeLabel:{ fontSize: 11, fontWeight: 700, color: '#2d7a62', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  doneBadge:   { width: '100%', padding: '14px', background: '#f0faf6', border: '2px solid #4aab8a', borderRadius: 14, fontSize: 15, fontWeight: 700, color: '#2d7a62', textAlign: 'center', boxSizing: 'border-box' },
  progressCard:{ background: '#fff', borderRadius: 20, padding: '18px 20px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  tipCard:     { background: 'linear-gradient(135deg, #fff8e6, #fff3d6)', borderRadius: 20, padding: '18px 20px', border: '1.5px solid #f0d080' },
  // Steps
  stepsRoot:       { minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', system-ui, sans-serif" },
  stepsHeader:     { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #f0f0f0' },
  stepsBackBtn:    { width: 36, height: 36, borderRadius: 10, border: '2px solid #e8f5f0', background: '#fff', cursor: 'pointer', fontSize: 16, color: '#3a3a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepsProgressBar:{ flex: 1, height: 6, background: '#e8e8e8', borderRadius: 99, overflow: 'hidden' },
  stepsProgressFill:{ height: '100%', background: 'linear-gradient(90deg, #4aab8a, #7c6bb0)', borderRadius: 99, transition: 'width 0.4s ease' },
  stepsCount:      { fontSize: 12, fontWeight: 700, color: '#aaa', flexShrink: 0 },
  stepsContent:    { flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20, overflowY: 'auto' },
  stepsPhaseTag:   { background: '#f0faf6', color: '#2d7a62', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.5px' },
  stepsTitle:      { fontSize: 22, fontWeight: 800, color: '#1a2a1a', margin: 0, letterSpacing: '-0.4px' },
  stepsInstruction:{ fontSize: 16, color: '#333', margin: 0, lineHeight: 1.7, maxWidth: 380 },
  stepsTipBox:     { background: '#fffbe8', border: '1.5px solid #f0d080', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left', maxWidth: 380, width: '100%', boxSizing: 'border-box' },
  stepsTipText:    { fontSize: 13, color: '#7a5c00', margin: 0, lineHeight: 1.6, flex: 1 },
  stepsDuration:   { background: '#f0faf6', color: '#2d7a62', fontSize: 13, fontWeight: 700, padding: '6px 16px', borderRadius: 99 },
  stepsFooter:     { padding: '16px 20px 32px', display: 'flex', gap: 10 },
  stepsPrevBtn:    { flex: 1, padding: '14px', background: '#fff', border: '2px solid #e8e8e8', borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', color: '#666' },
  stepsNextBtn:    { flex: 2, padding: '14px', background: 'linear-gradient(135deg, #4aab8a, #3d9478)', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', color: '#fff' },
  // Feedback
  feedRoot: { minHeight: '100dvh', background: '#f5f7f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Segoe UI', system-ui, sans-serif" },
  feedCard: { background: '#fff', borderRadius: 24, padding: '32px 24px', width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 4px 32px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  feedTitle:{ fontSize: 24, fontWeight: 800, color: '#1a2a1a', margin: 0, letterSpacing: '-0.5px' },
  feedOption:{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, border: '2px solid #e8e8e8', background: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%' },
  // Done
  doneRoot: { minHeight: '100dvh', background: 'linear-gradient(160deg, #f0faf6, #f5f0fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Segoe UI', system-ui, sans-serif" },
  // Shared
  primaryBtn: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #4aab8a, #3d9478)', color: '#fff', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.2px' },
}
