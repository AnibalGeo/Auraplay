/**
 * generateTherapyPlan.js
 * Motor de generación de plan terapéutico automático — AuraPlay
 *
 * Fuentes clínicas:
 *   - Laura Mize: jerarquía de pre-habilidades, sesiones cortas en TDAH
 *   - Hanen Centre: participación parental, OWL, tareas en casa
 *   - James MacDonald ECO: secuencia de dominios comunicativos
 *   - Stanley Greenspan DIR: hito DIR como ancla de progresión
 *   - Elena Plante: spacing effect (distribución de práctica)
 *   - González Lajas & García Cruz: perfiles diagnósticos DSM-5
 *
 * Actividades disponibles en el sistema (de App.jsx):
 *   minimal-pairs    → Fonológico
 *   build-word       → Fonológico
 *   listen           → Léxico-Semántico
 *   semantic         → Léxico-Semántico
 *   syntax           → Morfosintáctico
 *   narrative        → Morfosintáctico
 *   pragmatic        → Pragmático
 *   point-image      → Léxico / Comprensión
 *   category         → Léxico-Semántico
 *   follow-instruction → Comprensión / Morfosintáctico
 *   communicative-intent → Pragmático / Léxico
 *   rhyme            → Fonológico / Conciencia fonológica
 */

// ─── Catálogo de actividades ──────────────────────────────────────────────────

export const ACTIVITY_META = {
  'point-image': {
    id: 'point-image',
    label: 'Señala la Imagen',
    component: 'lexico',
    emoji: '👆',
    minLevel: 'N1',
    maxLevel: 'N4',
    clinicalFocus: ['comprensión', 'vocabulario', 'atención conjunta'],
    goodFor: ['tel', 'tl_tea', 'tl_tdah', 'tl_tea_tdah'],
    durationMin: 8,
  },
  'communicative-intent': {
    id: 'communicative-intent',
    label: '¿Para qué sirve?',
    component: 'pragmatico',
    emoji: '💡',
    minLevel: 'N1',
    maxLevel: 'N5',
    clinicalFocus: ['función comunicativa', 'pragmática básica', 'uso de objetos'],
    goodFor: ['tel', 'tl_tea', 'tl_tdah', 'tl_tea_tdah'],
    durationMin: 8,
  },
  'follow-instruction': {
    id: 'follow-instruction',
    label: 'Sigue la Instrucción',
    component: 'morfosintactico',
    emoji: '📢',
    minLevel: 'N1',
    maxLevel: 'N5',
    clinicalFocus: ['comprensión', 'atención auditiva', 'seguimiento de instrucciones'],
    goodFor: ['tel', 'tl_tdah', 'tl_tea_tdah'],
    durationMin: 8,
  },
  'listen': {
    id: 'listen',
    label: 'Escucha Atento',
    component: 'lexico',
    emoji: '👂',
    minLevel: 'N1',
    maxLevel: 'N7',
    clinicalFocus: ['atención auditiva', 'vocabulario', 'discriminación'],
    goodFor: ['tel', 'tl_tea', 'tl_tdah', 'tl_tea_tdah'],
    durationMin: 10,
  },
  'category': {
    id: 'category',
    label: '¿Cuál no pertenece?',
    component: 'lexico',
    emoji: '🗂️',
    minLevel: 'N2',
    maxLevel: 'N7',
    clinicalFocus: ['categorización', 'léxico semántico', 'razonamiento'],
    goodFor: ['tel', 'tl_tea', 'tl_tdah'],
    durationMin: 10,
  },
  'semantic': {
    id: 'semantic',
    label: 'Semántica',
    component: 'lexico',
    emoji: '📚',
    minLevel: 'N2',
    maxLevel: 'N7',
    clinicalFocus: ['vocabulario expresivo', 'definiciones', 'opuestos'],
    goodFor: ['tel', 'tl_tdah'],
    durationMin: 12,
  },
  'minimal-pairs': {
    id: 'minimal-pairs',
    label: 'Palabras Similares',
    component: 'fonologico',
    emoji: '🔊',
    minLevel: 'N1',
    maxLevel: 'N7',
    clinicalFocus: ['discriminación fonológica', 'pares mínimos', 'conciencia fonológica'],
    goodFor: ['tel', 'tl_tdah'],
    durationMin: 10,
  },
  'build-word': {
    id: 'build-word',
    label: 'Armar Palabras',
    component: 'fonologico',
    emoji: '🔤',
    minLevel: 'N1',
    maxLevel: 'N7',
    clinicalFocus: ['conciencia fonológica', 'estructura silábica', 'fonología'],
    goodFor: ['tel', 'tl_tdah'],
    durationMin: 10,
  },
  'rhyme': {
    id: 'rhyme',
    label: 'Rimas',
    component: 'fonologico',
    emoji: '🎵',
    minLevel: 'N2',
    maxLevel: 'N6',
    clinicalFocus: ['conciencia fonológica', 'rima', 'ritmo'],
    goodFor: ['tel', 'tl_tea', 'tl_tdah'],
    durationMin: 8,
  },
  'syntax': {
    id: 'syntax',
    label: 'Completar Frases',
    component: 'morfosintactico',
    emoji: '🧩',
    minLevel: 'N3',
    maxLevel: 'N7',
    clinicalFocus: ['morfosintaxis', 'estructura oracional', 'verbos'],
    goodFor: ['tel', 'tl_tdah'],
    durationMin: 12,
  },
  'narrative': {
    id: 'narrative',
    label: 'Ordenar Historia',
    component: 'morfosintactico',
    emoji: '📖',
    minLevel: 'N3',
    maxLevel: 'N7',
    clinicalFocus: ['narrativa', 'secuencia temporal', 'discurso'],
    goodFor: ['tel', 'tl_tdah'],
    durationMin: 12,
  },
  'pragmatic': {
    id: 'pragmatic',
    label: 'Inferencias',
    component: 'pragmatico',
    emoji: '💬',
    minLevel: 'N3',
    maxLevel: 'N7',
    clinicalFocus: ['inferencias', 'lenguaje no literal', 'pragmática'],
    goodFor: ['tel', 'tl_tea', 'tl_tdah'],
    durationMin: 12,
  },
}

// Orden de niveles para comparación
const LEVEL_ORDER = ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7']
function levelIndex(id) { return LEVEL_ORDER.indexOf(id) }

// ─── Reglas clínicas ──────────────────────────────────────────────────────────

/**
 * Configuración base por diagnóstico.
 * Basado en González Lajas, Lara Díaz, Greenspan, Mize.
 */
const DIAGNOSIS_RULES = {
  tel: {
    sessionDuration: 30,
    sessionsPerWeek: 3,
    exercisesPerSession: 12,
    weekProgression: 'gradual',       // sube dificultad cada semana
    priorityComponents: ['fonologico', 'lexico', 'morfosintactico'],
    avoidActivities: [],
  },
  tl_tea: {
    sessionDuration: 20,
    sessionsPerWeek: 4,
    exercisesPerSession: 8,
    weekProgression: 'consolidate',   // consolida antes de avanzar
    priorityComponents: ['pragmatico', 'lexico', 'fonologico'],
    avoidActivities: ['syntax', 'narrative'], // demasiado abstractas sin base pragmática
  },
  tl_tdah: {
    sessionDuration: 15,
    sessionsPerWeek: 4,
    exercisesPerSession: 8,
    weekProgression: 'varied',        // alta variabilidad anti-habituación
    priorityComponents: ['lexico', 'fonologico', 'pragmatico'],
    avoidActivities: [],
  },
  tl_tea_tdah: {
    sessionDuration: 15,
    sessionsPerWeek: 4,
    exercisesPerSession: 8,
    weekProgression: 'consolidate',
    priorityComponents: ['pragmatico', 'lexico'],
    avoidActivities: ['syntax', 'narrative', 'semantic'],
  },
}

/**
 * Tareas en casa por área de foco clínico.
 * Basado en estrategias Hanen (OWL, Follow the lead) y MacDonald (ECO).
 */
const HOME_TASKS_BY_FOCUS = {
  'Respuesta al nombre':           'Llamar al niño por su nombre 5 veces al día en contextos distintos. Esperar 3 segundos antes de repetir.',
  'Contacto visual y engagement':  'Durante el juego, ubicarse al nivel del niño. Pausar y esperar que mire antes de continuar (estrategia OWL).',
  'Atención sostenida':            'Elegir 1 actividad favorita del niño. Sostenerla 5 minutos sin interrupciones ni pantallas.',
  'Señalamiento y atención conjunta': 'Señalar objetos cotidianos y nombrarlos. Esperar que el niño mire el objeto antes de continuar.',
  'Imitación (prerequisito crítico)': 'Imitar todo lo que haga el niño durante 5 minutos: sonidos, gestos, acciones con objetos.',
  'Primeras palabras funcionales':  'Ofrecer objetos deseados parcialmente. Esperar 5 segundos antes de dárselos para provocar petición verbal.',
  'Combinación de dos palabras':    'Modelar combinaciones simples en rutinas: "más leche", "nene come", "mamá ven". Sin forzar repetición.',
  'Pragmática social y atención conjunta': 'Juegos de turnos simples: pelota de ida y vuelta, burbujas (soplar y esperar). 5-10 minutos diarios.',
  'Regulación atencional y sesiones cortas': 'Actividades de máximo 5 minutos. Anticipar el fin: "3 veces más y terminamos". Rutina predecible.',
  'Regulación sensorial como prerequisito': 'Antes de trabajar lenguaje, 5 minutos de actividad sensorial preferida del niño (saltar, apretar, balancearse).',
  'default': 'Hablar con el niño durante las rutinas cotidianas (baño, comida, juego). Nombrar lo que hace y lo que ve.',
}

// ─── Selector de actividades por semana ──────────────────────────────────────

/**
 * Selecciona actividades apropiadas para una semana dada.
 * Considera: diagnóstico, nivel, componente prioritario, semana del plan.
 */
function selectActivitiesForWeek(levelId, diagnosis, primaryComponent, focusAreas, weekNumber, rules) {
  const avoided = rules.avoidActivities
  const levelIdx = levelIndex(levelId)

  // Filtrar actividades disponibles para este perfil
  const available = Object.values(ACTIVITY_META).filter(act => {
    if (avoided.includes(act.id)) return false
    if (!act.goodFor.includes(diagnosis)) return false
    if (levelIndex(act.minLevel) > levelIdx) return false
    return true
  })

  // Separar por componente
  const byComponent = {}
  available.forEach(act => {
    if (!byComponent[act.component]) byComponent[act.component] = []
    byComponent[act.component].push(act)
  })

  const selected = []

  // Semana 1-2: foco en componente prioritario + comprensión básica
  // Semana 3-4: ampliar a componentes secundarios
  const priorityComp = primaryComponent
  const secondaryComps = rules.priorityComponents.filter(c => c !== priorityComp)

  if (weekNumber <= 2) {
    // 2 actividades del componente prioritario
    const primary = byComponent[priorityComp] || []
    selected.push(...primary.slice(0, 2))

    // 1-2 actividades de comprensión base (siempre point-image o listen para N1-N3)
    if (levelIdx <= 2) {
      if (available.find(a => a.id === 'point-image'))
        selected.push(ACTIVITY_META['point-image'])
      if (available.find(a => a.id === 'communicative-intent') && selected.length < 4)
        selected.push(ACTIVITY_META['communicative-intent'])
    } else {
      const secondary = byComponent[secondaryComps[0]] || []
      if (secondary[0]) selected.push(secondary[0])
    }
  } else {
    // Semana 3-4: más variedad
    rules.priorityComponents.forEach((comp, i) => {
      const pool = byComponent[comp] || []
      // Componente prioritario: 2, secundarios: 1 cada uno
      const count = i === 0 ? 2 : 1
      selected.push(...pool.slice(0, count))
    })
  }

  // Deduplicar
  const seen = new Set()
  return selected.filter(a => {
    if (seen.has(a.id)) return false
    seen.add(a.id)
    return true
  }).slice(0, 4) // máximo 4 actividades por semana
}

/**
 * Genera tarea en casa basada en las áreas de foco.
 */
function selectHomeTask(focusAreas, diagnosis, weekNumber) {
  if (focusAreas && focusAreas.length > 0) {
    // Semana 1-2: primer área prioritaria. Semana 3-4: segunda si existe.
    const idx = weekNumber <= 2 ? 0 : Math.min(1, focusAreas.length - 1)
    const area = focusAreas[idx]
    const task = HOME_TASKS_BY_FOCUS[area]
    if (task) return { area, task }
  }
  // Fallback por diagnóstico
  const diagFocus = {
    tl_tea:      'Pragmática social y atención conjunta',
    tl_tdah:     'Regulación atencional y sesiones cortas',
    tl_tea_tdah: 'Regulación sensorial como prerequisito',
    tel:         'default',
  }
  const area = diagFocus[diagnosis] || 'default'
  return { area, task: HOME_TASKS_BY_FOCUS[area] }
}

// ─── Función principal ────────────────────────────────────────────────────────

/**
 * Genera un plan terapéutico de 4 semanas.
 *
 * @param {object} patient - objeto paciente completo del contexto
 * @returns {TherapyPlan} plan estructurado listo para guardar en patient.therapyPlan
 */
export function generateTherapyPlan(patient) {
  const profile     = patient.clinicalProfile
  const levelId     = profile?.levelId || patient.levelId || 'N1'
  const diagnosis   = patient.diagnosis || 'tel'
  const focusAreas  = patient.recommendedFocus || []
  const ageMonths   = patient.ageMonths || 36
  const confidence  = profile?.confidence || 'Media'
  const dirLevel    = profile?.dirLevel || 1
  const primaryComp = profile?.primaryComponent || 'lexico'

  const rules = DIAGNOSIS_RULES[diagnosis] || DIAGNOSIS_RULES.tel

  // Ajuste de duración por DIR y edad
  let sessionDuration = rules.sessionDuration
  if (dirLevel <= 2 || ageMonths <= 30) sessionDuration = Math.min(sessionDuration, 15)
  if (ageMonths <= 24) sessionDuration = 10

  // Objetivo general del plan
  const planGoal = buildPlanGoal(levelId, diagnosis, primaryComp, focusAreas)

  // Generar las 4 semanas
  const weeks = [1, 2, 3, 4].map(weekNum => {
    const activities = selectActivitiesForWeek(
      levelId, diagnosis, primaryComp, focusAreas, weekNum, rules
    )
    const homeTask = selectHomeTask(focusAreas, diagnosis, weekNum)
    const weekGoal = buildWeekGoal(weekNum, activities, primaryComp, levelId)

    return {
      week:       weekNum,
      label:      `Semana ${weekNum}`,
      goal:       weekGoal,
      activities: activities.map(act => ({
        id:            act.id,
        label:         act.label,
        emoji:         act.emoji,
        component:     act.component,
        sessionsCount: weekNum <= 2 ? 2 : 2, // siempre 2 veces por semana por actividad
        clinicalFocus: act.clinicalFocus.slice(0, 2),
      })),
      sessionsPerWeek:     rules.sessionsPerWeek,
      sessionDuration,
      exercisesPerSession: rules.exercisesPerSession,
      homeTask,
      clinicalNote: buildWeekNote(weekNum, diagnosis, dirLevel, confidence),
    }
  })

  return {
    id:           `plan_${Date.now()}`,
    generatedAt:  new Date().toISOString(),
    levelId,
    diagnosis,
    primaryComponent: primaryComp,
    focusAreas,
    ageMonths,
    dirLevel,
    confidence,
    sessionDuration,
    sessionsPerWeek: rules.sessionsPerWeek,
    goal:         planGoal,
    weeks,
    status:       'active', // active | completed | archived
    completedWeeks: 0,
  }
}

// ─── Helpers de texto clínico ─────────────────────────────────────────────────

const COMPONENT_NAMES = {
  fonologico:      'Fonológico',
  lexico:          'Léxico-Semántico',
  morfosintactico: 'Morfosintáctico',
  pragmatico:      'Pragmático',
}

const LEVEL_DESCRIPTIONS = {
  N1: 'primeras palabras y comunicación pre-verbal',
  N2: 'combinaciones de dos palabras y vocabulario básico',
  N3: 'oraciones simples y vocabulario en expansión',
  N4: 'oraciones complejas y conectores causales',
  N5: 'narrativa y lenguaje funcional avanzado',
  N6: 'lenguaje escolar y comprensión inferencial',
  N7: 'lenguaje académico y discurso argumentativo',
}

function buildPlanGoal(levelId, diagnosis, primaryComp, focusAreas) {
  const compName = COMPONENT_NAMES[primaryComp] || primaryComp
  const levelDesc = LEVEL_DESCRIPTIONS[levelId] || levelId
  const mainFocus = focusAreas[0] || compName
  return `Desarrollar ${levelDesc}, con foco prioritario en ${mainFocus.toLowerCase()}.`
}

function buildWeekGoal(weekNum, activities, primaryComp, levelId) {
  const compName = COMPONENT_NAMES[primaryComp] || primaryComp
  const goals = {
    1: `Establecer línea base y explorar respuesta a actividades de ${compName}`,
    2: `Consolidar habilidades iniciales y aumentar número de respuestas correctas`,
    3: `Introducir mayor variedad de estímulos y reducir ayudas progresivamente`,
    4: `Evaluar progreso, identificar logros y ajustar objetivos para el próximo ciclo`,
  }
  return goals[weekNum] || `Trabajar objetivos de ${compName} en ${levelId}`
}

function buildWeekNote(weekNum, diagnosis, dirLevel, confidence) {
  const notes = {
    1: dirLevel <= 2
      ? 'Priorizar regulación y engagement antes de iniciar actividades cognitivas.'
      : 'Observar respuesta al estímulo y registrar iniciativas espontáneas del niño.',
    2: 'Ajustar dificultad según respuesta de la semana anterior. No subir si score < 60%.',
    3: diagnosis === 'tl_tea' || diagnosis === 'tl_tea_tdah'
      ? 'Mantener rutina predecible. Anticipar cambios verbalmente antes de realizarlos.'
      : 'Introducir mayor autonomía. Reducir modelado si el niño responde sin ayuda.',
    4: confidence === 'Baja'
      ? 'Plan generado con confianza baja. Validar con evaluación formal antes del siguiente ciclo.'
      : 'Documentar logros. Evaluar si continuar con mismo nivel o avanzar al siguiente.',
  }
  return notes[weekNum] || ''
}
