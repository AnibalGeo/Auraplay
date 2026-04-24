/**
 * HomeModeScreen.jsx
 * Modo Familia — AuraPlay v2
 *
 * Fix principal:
 *   buildDailyTask ahora retorna steps como objetos completos
 *   { phase, emoji, title, instruction, tip, duration }
 *   en lugar de strings planos — resuelve la pantalla en blanco en StepsView.
 *
 * Cambios adicionales:
 *   - "Modo Padres" → "Modo Familia" en todos los textos
 *   - Lenguaje neutro e inclusivo ("el/la terapeuta", "tutor/a", "él/ella")
 */

import { useState, useMemo } from 'react'
import { usePatient } from '../context/PatientContext'
import { updatePatient as persistPatient } from '../data/patients'

// ─── PIN helpers ──────────────────────────────────────────────────────────────

const HOME_PIN_KEY = 'auraplay_home_pin'
function getHomePin() { return localStorage.getItem(HOME_PIN_KEY) || null }

// ─── buildDailyTask ───────────────────────────────────────────────────────────
// Cada step es un objeto con: phase, emoji, title, instruction, tip, duration
// ANTES era un array de strings — eso causaba la pantalla en blanco.

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
        {
          phase: 'Preparación', emoji: '🌱',
          title: 'Ubícate cerca',
          instruction: `Acércate a ${n} y espera que esté relativamente tranquilo/a. Ponerte a su altura ayuda mucho — agáchate si es necesario.`,
          tip: 'No lo hagas desde lejos ni con distracciones de fondo. La cercanía importa.',
          duration: '1 minuto',
        },
        {
          phase: 'Actividad', emoji: '📣',
          title: 'Di su nombre con voz normal',
          instruction: `Di el nombre de ${n} una sola vez, con voz tranquila y clara. Luego espera en silencio hasta 5 segundos — sin repetir todavía.`,
          tip: 'Si no responde, no repitas de inmediato. La espera es parte de la actividad, no un error.',
          duration: '3 minutos',
        },
        {
          phase: 'Celebración', emoji: '🌟',
          title: 'Celebra cualquier reacción',
          instruction: `Cuando ${n} gire la cabeza, te mire o reaccione de alguna forma, celebra con entusiasmo: "¡Aquí estoy!" con cara alegre y voz cálida.`,
          tip: 'Cualquier reacción vale — no esperes que sea perfecta. El objetivo es que asocie su nombre con algo positivo.',
          duration: '1 minuto',
        },
      ],
    },

    'Contacto visual y engagement': {
      title: 'Juego cara a cara',
      emoji: '👀',
      area: 'Contacto visual y engagement',
      observe: ['¿Te buscó con la mirada?', '¿Cuánto tiempo sostuvo el contacto?', '¿Sonrió o mostró interés?'],
      steps: [
        {
          phase: 'Preparación', emoji: '🌱',
          title: 'Baja a su nivel',
          instruction: `Siéntate en el suelo frente a ${n}. Espera que te mire antes de hacer cualquier cosa. No empieces la actividad hasta que haya al menos un momento de contacto visual.`,
          tip: 'La posición importa. Al nivel de sus ojos eres más interesante que desde arriba.',
          duration: '1 minuto',
        },
        {
          phase: 'Actividad', emoji: '👀',
          title: 'Haz algo inesperado y espera',
          instruction: `Haz algo divertido — una mueca, un sonido gracioso, esconder la cara y aparecer. Luego pausa y espera que ${n} te mire para continuar.`,
          tip: 'La clave es la pausa. No llenes el silencio. La espera crea la oportunidad de comunicación.',
          duration: '5 minutos',
        },
        {
          phase: 'Celebración', emoji: '🌟',
          title: 'Nombra lo que hizo',
          instruction: `Cada vez que ${n} te mire, dilo en voz alta: "¡Me miraste!" o "¡Ahí estás!". Termina con algo que claramente le guste.`,
          tip: 'El elogio específico construye más que el "muy bien" genérico.',
          duration: '1 minuto',
        },
      ],
    },

    'Atención sostenida': {
      title: 'Actividad favorita sin interrupciones',
      emoji: '⏱️',
      area: 'Atención sostenida',
      observe: ['¿Cuántos minutos sostuvo la atención?', '¿Participó activamente?', '¿Pidió continuar?'],
      steps: [
        {
          phase: 'Preparación', emoji: '🌱',
          title: 'Elige UNA actividad',
          instruction: `Prepara solo UN juguete o actividad que a ${n} le guste mucho. Sin pantallas, sin otros juguetes cerca. El ambiente despejado ayuda a la atención.`,
          tip: 'Menos opciones = más foco. No le des a elegir entre varias cosas al mismo tiempo.',
          duration: '1 minuto',
        },
        {
          phase: 'Actividad', emoji: '⏱️',
          title: 'Juega junto a él/ella 5 minutos',
          instruction: `Únete a la actividad sin tomar el control. Si arma bloques, arma bloques tú también. Si dibuja, dibuja al lado. Sin cambiar de actividad aunque se distraiga brevemente.`,
          tip: 'Si se distrae, no lo corrijas. Vuelve suavemente a la actividad con tu propio ejemplo.',
          duration: '5 minutos',
        },
        {
          phase: 'Cierre', emoji: '🌟',
          title: 'Termina con aviso previo',
          instruction: `Avisa antes de terminar: "Dos veces más y guardamos". Luego cierra la actividad aunque quiera seguir. La consistencia en los cierres reduce la frustración con el tiempo.`,
          tip: 'Los cierres predecibles son tan importantes como la actividad misma.',
          duration: '1 minuto',
        },
      ],
    },

    'Señalamiento y atención conjunta': {
      title: 'Señalamos juntos',
      emoji: '👆',
      area: 'Señalamiento y atención conjunta',
      observe: ['¿Miró hacia donde señalaste?', '¿Señaló algún objeto solo/a?', '¿Intentó nombrar algo?'],
      steps: [
        {
          phase: 'Preparación', emoji: '🌱',
          title: 'Busca un momento con cosas interesantes',
          instruction: `Elige un momento tranquilo — paseo, desayuno, ventana. El entorno debe tener cosas para señalar: autos, perros, personas, objetos coloridos.`,
          tip: 'Los paseos son ideales. El movimiento y los cambios de escena generan oportunidades naturales.',
          duration: '1 minuto',
        },
        {
          phase: 'Actividad', emoji: '👆',
          title: 'Señala y nombra',
          instruction: `Señala algo con el dedo extendido y nómbralo con voz clara: "¡Mira, un perro!" Espera que ${n} siga tu señal con la mirada. Si señala algo solo/a, nómbralo tú inmediatamente.`,
          tip: 'No preguntes "¿qué es eso?" todavía. Primero modela, después espera. La pregunta viene más adelante.',
          duration: '5 minutos',
        },
        {
          phase: 'Cierre', emoji: '🌟',
          title: 'Repite 3 favoritos',
          instruction: `Al final, señala de nuevo 3 cosas que llamaron su atención y repite los nombres una vez más. Sin pedir que repita — solo modela.`,
          tip: 'La repetición sin presión es la forma más efectiva de consolidar vocabulario.',
          duration: '1 minuto',
        },
      ],
    },

    'Imitación (prerequisito crítico)': {
      title: 'El juego del espejo',
      emoji: '🪞',
      area: 'Imitación',
      observe: ['¿Imitó alguna acción que propusiste?', '¿Imitó algún sonido?', '¿Disfrutó el juego?'],
      steps: [
        {
          phase: 'Calentamiento', emoji: '🌱',
          title: 'Tú imitas primero',
          instruction: `Durante 2 minutos, copia exactamente lo que haga ${n} — si golpea la mesa, golpea la mesa. Si hace un sonido, repítelo igual. Sin agregar nada nuevo todavía.`,
          tip: 'Esto se llama imitación inversa. Al imitarlo/a, le muestras que le prestas atención total. Suele sorprender y enganchar.',
          duration: '2 minutos',
        },
        {
          phase: 'Actividad', emoji: '🪞',
          title: 'Ahora propones tú',
          instruction: `Haz una acción simple frente a ${n}: palmada, soplar, golpear la mesa. Espera hasta 5 segundos. Si no imita, vuelve a imitarlo/a a él/ella y comienza de nuevo.`,
          tip: 'Empieza con acciones que ya hizo él/ella — es más fácil imitar lo que ya se conoce.',
          duration: '5 minutos',
        },
        {
          phase: 'Cierre', emoji: '🌟',
          title: 'Termina con éxito garantizado',
          instruction: `Termina con una acción que ya sabe hacer, para que el cierre sea positivo. Un abrazo o choque de manos como ritual de fin.`,
          tip: 'Nunca termines cuando está frustrado/a. Busca un pequeño éxito para cerrar bien.',
          duration: '1 minuto',
        },
      ],
    },

    'Primeras palabras funcionales': {
      title: 'Nombrar lo que quiere',
      emoji: '🗣️',
      area: 'Primeras palabras funcionales',
      observe: ['¿Vocalizó algo, aunque no fuera completo?', '¿Señaló o extendió la mano?', '¿Intentó imitar alguna palabra?'],
      steps: [
        {
          phase: 'Preparación', emoji: '🌱',
          title: 'Prepara algo que le guste mucho',
          instruction: `Elige un objeto o comida que ${n} desee mucho. Tenlo a la vista pero fuera de su alcance, o dáselo a medias para crear la oportunidad de pedir.`,
          tip: 'La motivación es el motor del lenguaje. Usa lo que de verdad quiere.',
          duration: '1 minuto',
        },
        {
          phase: 'Actividad', emoji: '🗣️',
          title: 'Espera antes de dar',
          instruction: `Ofrece el objeto con cara de expectativa y espera 5 segundos en silencio. Si vocaliza cualquier cosa, dáselo inmediatamente y celebra. Si señala, di la palabra tú y dáselo.`,
          tip: 'No pidas que repita. No digas "di...". Solo espera. El silencio es la herramienta más poderosa.',
          duration: '5 minutos',
        },
        {
          phase: 'Celebración', emoji: '🌟',
          title: 'Celebra el intento, no la perfección',
          instruction: `Cada vez que haga cualquier intento comunicativo — sonido, gesto, señal — celebra con entusiasmo y dale lo que pidió. La consecuencia inmediata es lo que enseña.`,
          tip: '"Quieres leche" dicho por ti mientras se la das es más poderoso que pedir que lo repita.',
          duration: '1 minuto',
        },
      ],
    },

    'Combinación de dos palabras': {
      title: 'Frases de dos palabras',
      emoji: '💬',
      area: 'Combinación de dos palabras',
      observe: ['¿Usó dos palabras juntas?', '¿Intentó expandir lo que decía?', '¿Repitió alguna frase que modelaste?'],
      steps: [
        {
          phase: 'Preparación', emoji: '🌱',
          title: 'Elige una rutina cotidiana',
          instruction: `El desayuno, el baño o el juego libre son perfectos. Vas a modelar frases cortas durante esa actividad, sin pedir que repita nada.`,
          tip: 'Las rutinas cotidianas son el mejor contexto. Lo que ocurre todos los días se aprende antes.',
          duration: '1 minuto',
        },
        {
          phase: 'Actividad', emoji: '💬',
          title: 'Modela frases de dos palabras',
          instruction: `Durante la actividad, usa frases cortas en momentos naturales: "más leche", "nene salta", "pelota cae". No pidas que repita — solo muestra cómo suena.`,
          tip: `Si ${n} dice solo una palabra, expándela tú: si dice "leche", di "quiero leche". Eso es todo.`,
          duration: '5 minutos',
        },
        {
          phase: 'Cierre', emoji: '🌟',
          title: 'Repite las 3 mejores',
          instruction: `Al cerrar, repite naturalmente 3 de las combinaciones que usaste. Sin presión, como parte de la conversación.`,
          tip: 'La repetición espaciada (varias veces en el día) funciona mejor que una sesión larga.',
          duration: '1 minuto',
        },
      ],
    },

    'Pragmática social y atención conjunta': {
      title: 'Juego de turnos',
      emoji: '⚽',
      area: 'Pragmática social y turnos',
      observe: ['¿Tomó el turno cuando fue su momento?', '¿Hubo contacto visual durante el juego?', '¿Pidió más o buscó continuar?'],
      steps: [
        {
          phase: 'Preparación', emoji: '🌱',
          title: 'Prepara el espacio',
          instruction: `Siéntate en el suelo frente a ${n} con una pelota u objeto que ruede. Sin otras distracciones cerca.`,
          tip: 'El suelo y la posición cara a cara son clave. La altura igual crea igualdad en el juego.',
          duration: '1 minuto',
        },
        {
          phase: 'Actividad', emoji: '⚽',
          title: 'Rueda y espera',
          instruction: `Rueda la pelota hacia ${n} diciendo "tu turno" y espera en silencio hasta 10 segundos. Cuando devuelva (como sea), celebra con entusiasmo. Repite.`,
          tip: 'No importa cómo devuelve — con la mano, el pie, empujando. Cualquier participación vale y se celebra igual.',
          duration: '6 minutos',
        },
        {
          phase: 'Cierre', emoji: '🌟',
          title: 'Nombra lo que pasó',
          instruction: `Al terminar, di en voz alta: "¡Me la pasaste! ¡Jugamos juntos!" Nombrar el logro lo consolida.`,
          tip: 'El lenguaje que describe la experiencia justo después es el que más se aprende.',
          duration: '1 minuto',
        },
      ],
    },

    'Regulación atencional y sesiones cortas': {
      title: 'Actividad corta y predecible',
      emoji: '⏰',
      area: 'Regulación atencional',
      observe: ['¿Terminó la actividad sin crisis?', '¿Anticipó el fin cuando avisaste?', '¿Pidió continuar al terminar?'],
      steps: [
        {
          phase: 'Preparación', emoji: '🌱',
          title: 'Avisa cuánto dura',
          instruction: `Antes de empezar, avisa: "Vamos a jugar 5 minutos y después guardamos". Si tienes timer visual, muéstraselo. La anticipación reduce la resistencia al cambio.`,
          tip: 'Los niños/as con dificultades de atención manejan mejor los cambios cuando los ven venir.',
          duration: '1 minuto',
        },
        {
          phase: 'Actividad', emoji: '⏰',
          title: 'Actividad simple y motivante',
          instruction: `Realiza una actividad que le guste durante exactamente 5 minutos. Sin alargar aunque esté bien. La consistencia en el tiempo es más importante que la actividad misma.`,
          tip: 'Cumple el tiempo acordado — siempre. La previsibilidad es la base de la confianza.',
          duration: '5 minutos',
        },
        {
          phase: 'Cierre', emoji: '🌟',
          title: 'Cierra como dijiste',
          instruction: `Cuando el tiempo se acabe, cierra la actividad aunque proteste. Con calma: "Se acabó por hoy. Mañana jugamos de nuevo". Mantén la calma aunque haya reacción.`,
          tip: 'La consistencia hoy evita la batalla mañana. Cada vez que cumples lo que dijiste, construyes confianza.',
          duration: '1 minuto',
        },
      ],
    },

    'Regulación sensorial como prerequisito': {
      title: 'Momento de calma primero',
      emoji: '🌊',
      area: 'Regulación sensorial',
      observe: ['¿Se calmó visiblemente?', '¿Pudo sostener la actividad después?', '¿Cuánto tiempo logró regulado/a?'],
      steps: [
        {
          phase: 'Preparación', emoji: '🌱',
          title: 'Identifica qué lo/la calma',
          instruction: `Observa qué actividad sensorial regula a ${n}: saltar, apretar algo, balancearse, escuchar música tranquila. Prepara eso antes de cualquier tarea de lenguaje.`,
          tip: 'Cada niño/a tiene su regulador sensorial propio. No hay uno universal.',
          duration: '1 minuto',
        },
        {
          phase: 'Actividad', emoji: '🌊',
          title: '3-5 minutos de regulación',
          instruction: `Permite 3-5 minutos de la actividad reguladora sin interrupciones ni objetivos. Solo deja que ocurra. Cuando veas que está más tranquilo/a, propón suavemente la actividad del día.`,
          tip: 'No pongas objetivos durante la regulación. Su único propósito es preparar el sistema nervioso.',
          duration: '5 minutos',
        },
        {
          phase: 'Transición', emoji: '🌟',
          title: 'Transición suave',
          instruction: `Anuncia el cambio con anticipación: "En un ratito vamos a hacer algo juntos". Espera que esté listo/a — no apures la transición.`,
          tip: 'Si se agita durante la actividad posterior, vuelve a la regulación. No lo fuerces nunca.',
          duration: '1 minuto',
        },
      ],
    },

    'default': {
      title: 'Conversación en rutina',
      emoji: '🏠',
      area: 'Conversación cotidiana',
      observe: ['¿Respondió de alguna forma?', '¿Inició algo por su cuenta?', '¿Se mantuvo atento/a?'],
      steps: [
        {
          phase: 'Preparación', emoji: '🌱',
          title: 'Elige una rutina del día',
          instruction: `Escoge un momento cotidiano: desayuno, baño, camino al jardín, antes de dormir. Son los mejores contextos porque ocurren todos los días y son predecibles.`,
          tip: 'No necesitas materiales. La rutina cotidiana es la mejor sala de terapia.',
          duration: '1 minuto',
        },
        {
          phase: 'Actividad', emoji: '🏠',
          title: 'Habla sobre lo que ven y hacen',
          instruction: `Durante la rutina, narra lo que ocurre con frases cortas y claras. Señala lo que nombras. Deja siempre unos segundos de silencio — espacio para que responda.`,
          tip: 'Usa frases un poco más largas que las que él/ella usa. Si usa palabras sueltas, usa frases de dos palabras.',
          duration: '6 minutos',
        },
        {
          phase: 'Cierre', emoji: '🌟',
          title: 'Reconoce el momento',
          instruction: `Al terminar, di algo positivo: "Qué bien que conversamos mientras desayunamos". Aunque parezca pequeño, nombrar el momento lo hace significativo.`,
          tip: 'La conexión emocional durante el lenguaje es lo que hace que se aprenda y se quede.',
          duration: '1 minuto',
        },
      ],
    },
  }

  const area = homeTask.area || 'default'
  const taskData = TASK_BANK[area] || TASK_BANK['default']
  return { ...taskData, rawTask: homeTask.task }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WEEKLY_TIPS = {
  tel: [
    'No anticipes todo. Dale tiempo y espacio para pedir.',
    'Una palabra en contexto real vale más que 10 repetidas en ejercicio.',
    'El juego es la terapia. Si juegan juntos, están trabajando.',
    'Las rutinas predecibles ayudan al lenguaje. Lo que se repite, se aprende.',
  ],
  tl_tea: [
    'Sigue su interés, no el tuyo. Si le gustan los trenes, trabaja con trenes.',
    'La mirada no siempre significa falta de atención. A veces escucha sin mirar.',
    'Avisa antes de cada cambio: "En 2 minutos terminamos". Reduce la ansiedad.',
    'Tu entusiasmo es contagioso. Aunque no lo muestre, lo registra.',
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

function getCurrentPlanWeek(therapyPlan) {
  if (!therapyPlan) return null
  return therapyPlan.weeks.find(w => !w.completed) || therapyPlan.weeks[therapyPlan.weeks.length - 1]
}

function countHomeSessionsThisWeek(sessionHistory) {
  if (!sessionHistory?.length) return 0
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  return sessionHistory.filter(e =>
    e.type === 'home_activity' && new Date(e.date).getTime() > cutoff
  ).length
}

function doneToday(sessionHistory) {
  if (!sessionHistory?.length) return false
  const today = new Date().toISOString().slice(0, 10)
  return sessionHistory.some(e => e.type === 'home_activity' && e.date?.slice(0, 10) === today)
}

// ─── PIN Screen ───────────────────────────────────────────────────────────────

function HomePinScreen({ onUnlock }) {
  const [pin, setPin]     = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const storedPin = getHomePin()

  if (!storedPin) {
    return (
      <div style={S.pinRoot}>
        <div style={S.pinCard}>
          <span style={{ fontSize: 48, marginBottom: 16, display: 'block' }}>🔒</span>
          <h2 style={S.pinTitle}>Acceso no configurado</h2>
          <p style={S.pinSubtitle}>
            El/la terapeuta debe configurar un PIN para el Modo Familia desde el Panel del Terapeuta.
          </p>
          <p style={{ fontSize: 12, color: '#aaa', marginTop: 12, lineHeight: 1.5 }}>
            Terapeuta: Panel → pestaña Paciente → "PIN Modo Familia".
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
      if (next === storedPin) { onUnlock() }
      else {
        setError(true); setShake(true)
        setTimeout(() => { setShake(false); setPin('') }, 700)
      }
    }
  }

  return (
    <div style={S.pinRoot}>
      <div style={{ ...S.pinCard, animation: shake ? 'shake 0.5s' : 'none' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>👨‍👩‍👧</div>
        <h2 style={S.pinTitle}>Modo Familia</h2>
        <p style={S.pinSubtitle}>Ingresa el PIN que te dio el/la terapeuta</p>
        <div style={S.pinDots}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              ...S.pinDot,
              background: pin.length > i ? (error ? '#e07a5f' : '#4aab8a') : '#e8e8e8',
              transform: pin.length > i ? 'scale(1.2)' : 'scale(1)',
              transition: 'all 0.15s',
            }} />
          ))}
        </div>
        {error && <p style={{ color: '#e07a5f', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>PIN incorrecto.</p>}
        <div style={S.pinKeypad}>
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} style={S.pinKey} onClick={() => handleDigit(String(n))}>{n}</button>
          ))}
          <div />
          <button style={S.pinKey} onClick={() => handleDigit('0')}>0</button>
          <button style={{ ...S.pinKey, fontSize: 18, color: '#888' }} onClick={() => setPin(p => p.slice(0, -1))}>⌫</button>
        </div>
      </div>
    </div>
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
        {step.duration && (
          <div style={S.stepsDuration}>⏱ {step.duration}</div>
        )}
      </div>

      <div style={S.stepsFooter}>
        {idx > 0 && (
          <button style={S.stepsPrevBtn} onClick={() => setIdx(i => i - 1)}>← Anterior</button>
        )}
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
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1a2a1a', margin: 0, letterSpacing: '-0.5px' }}>
          {meta ? '¡Meta cumplida!' : '¡Bien hecho!'}
        </h2>
        <p style={{ fontSize: 15, color: '#444', margin: 0, lineHeight: 1.6 }}>
          {meta
            ? 'Completaron todas las prácticas de la semana. El/la terapeuta lo verá en la próxima sesión.'
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

function HomeMainScreen({ patient }) {
  const { addSessionEntry } = usePatient()
  const [view, setView]         = useState('main')
  const [feedback, setFeedback] = useState(null)
  const [saved, setSaved]       = useState(false)

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
        <div style={S.mainHeader}>
          <div><p style={S.mainGreeting}>Hola 👋</p><h1 style={S.mainName}>Actividades de {name}</h1></div>
          <div style={S.mainLogo}>🎯</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', gap: 16, textAlign: 'center' }}>
          <span style={{ fontSize: 40 }}>📋</span>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a2a1a', margin: 0 }}>Sin actividades por ahora</h2>
          <p style={{ fontSize: 14, color: '#666', margin: 0, lineHeight: 1.6, maxWidth: 300 }}>
            El/la terapeuta aún no ha generado el plan de {name}. En la próxima sesión se configurará.
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
      {/* Header */}
      <div style={S.mainHeader}>
        <div><p style={S.mainGreeting}>Hola 👋</p><h1 style={S.mainName}>Actividades de {name}</h1></div>
        <div style={S.mainLogo}>🎯</div>
      </div>

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

        {/* Progreso semanal */}
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
          <p style={{ fontSize: 13, color: '#666', margin: 0, fontWeight: 500 }}>
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

// ─── Export ───────────────────────────────────────────────────────────────────

export default function HomeModeScreen({ onBack }) {
  const { patient } = usePatient()
  const [unlocked, setUnlocked] = useState(false)
  if (!unlocked) return <HomePinScreen onUnlock={() => setUnlocked(true)} />
  return <HomeMainScreen patient={patient} />
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const S = {
  // PIN
  pinRoot: { minHeight: '100dvh', background: 'linear-gradient(160deg,#f0faf6,#fafafa)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Segoe UI',system-ui,sans-serif" },
  pinCard: { background: '#fff', borderRadius: 24, padding: '32px 28px', width: '100%', maxWidth: 340, textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' },
  pinTitle: { fontSize: 20, fontWeight: 700, color: '#1a2a1a', margin: '0 0 8px' },
  pinSubtitle: { fontSize: 14, color: '#666', margin: '0 0 24px', lineHeight: 1.5 },
  pinDots: { display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 },
  pinDot: { width: 18, height: 18, borderRadius: '50%' },
  pinKeypad: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 },
  pinKey: { padding: '16px', borderRadius: 14, border: '2px solid #e8f5f0', background: '#fff', fontSize: 22, fontWeight: 600, cursor: 'pointer', color: '#1a2a1a' },
  // Steps
  stepsRoot: { minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI',system-ui,sans-serif" },
  stepsHeader: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #f0f0f0' },
  stepsBackBtn: { width: 36, height: 36, borderRadius: 10, border: '2px solid #e8f5f0', background: '#fff', cursor: 'pointer', fontSize: 16, color: '#3a3a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepsProgressBar: { flex: 1, height: 6, background: '#e8e8e8', borderRadius: 99, overflow: 'hidden' },
  stepsProgressFill: { height: '100%', background: 'linear-gradient(90deg,#4aab8a,#7c6bb0)', borderRadius: 99, transition: 'width 0.4s ease' },
  stepsCount: { fontSize: 12, fontWeight: 700, color: '#aaa', flexShrink: 0 },
  stepsContent: { flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20, overflowY: 'auto' },
  stepsPhaseTag: { background: '#f0faf6', color: '#2d7a62', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.5px' },
  stepsTitle: { fontSize: 22, fontWeight: 800, color: '#1a2a1a', margin: 0, letterSpacing: '-0.4px' },
  stepsInstruction: { fontSize: 16, color: '#333', margin: 0, lineHeight: 1.7, maxWidth: 380 },
  stepsTipBox: { background: '#fffbe8', border: '1.5px solid #f0d080', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left', maxWidth: 380, width: '100%', boxSizing: 'border-box' },
  stepsTipText: { fontSize: 13, color: '#7a5c00', margin: 0, lineHeight: 1.6, flex: 1 },
  stepsDuration: { background: '#f0faf6', color: '#2d7a62', fontSize: 13, fontWeight: 700, padding: '6px 16px', borderRadius: 99 },
  stepsFooter: { padding: '16px 20px 32px', display: 'flex', gap: 10 },
  stepsPrevBtn: { flex: 1, padding: '14px', background: '#fff', border: '2px solid #e8e8e8', borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', color: '#666' },
  stepsNextBtn: { flex: 2, padding: '14px', background: 'linear-gradient(135deg,#4aab8a,#3d9478)', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', color: '#fff' },
  // Feedback
  feedRoot: { minHeight: '100dvh', background: '#f5f7f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Segoe UI',system-ui,sans-serif" },
  feedCard: { background: '#fff', borderRadius: 24, padding: '32px 24px', width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 4px 32px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  feedTitle: { fontSize: 24, fontWeight: 800, color: '#1a2a1a', margin: 0, letterSpacing: '-0.5px' },
  feedOption: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, border: '2px solid #e8e8e8', background: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%' },
  // Done
  doneRoot: { minHeight: '100dvh', background: 'linear-gradient(160deg,#f0faf6,#f5f0fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Segoe UI',system-ui,sans-serif" },
  // Main
  mainRoot: { minHeight: '100dvh', background: '#f5f7f5', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI',system-ui,sans-serif" },
  mainHeader: { background: 'linear-gradient(135deg,#4aab8a,#3d9478)', padding: '32px 24px 24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' },
  mainGreeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: '0 0 4px', fontWeight: 600 },
  mainName: { fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.5px' },
  mainLogo: { fontSize: 32, background: 'rgba(255,255,255,0.2)', borderRadius: 16, width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  mainContent: { flex: 1, padding: '16px 16px 40px', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480, width: '100%', margin: '0 auto', boxSizing: 'border-box' },
  taskCard: { background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' },
  taskMeta: { fontSize: 11, fontWeight: 700, color: '#4aab8a', letterSpacing: '0.5px', margin: '0 0 12px' },
  taskTitle: { fontSize: 20, fontWeight: 800, color: '#1a2a1a', margin: '0 0 4px', letterSpacing: '-0.3px' },
  observeBox: { background: '#f8faf9', borderRadius: 12, padding: '12px 14px', marginBottom: 16 },
  observeLabel: { fontSize: 11, fontWeight: 700, color: '#2d7a62', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  doneBadge: { width: '100%', padding: '14px', background: '#f0faf6', border: '2px solid #4aab8a', borderRadius: 14, fontSize: 15, fontWeight: 700, color: '#2d7a62', textAlign: 'center', boxSizing: 'border-box' },
  progressCard: { background: '#fff', borderRadius: 20, padding: '18px 20px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  tipCard: { background: 'linear-gradient(135deg,#fff8e6,#fff3d6)', borderRadius: 20, padding: '18px 20px', border: '1.5px solid #f0d080' },
  // Shared
  primaryBtn: { width: '100%', padding: '16px', background: 'linear-gradient(135deg,#4aab8a,#3d9478)', color: '#fff', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.2px' },
}
