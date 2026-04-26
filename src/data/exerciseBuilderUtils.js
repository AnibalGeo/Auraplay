/**
 * exerciseBuilderUtils.js
 * Constantes, validaciones y estructura de ejercicios — AuraPlay
 */

export const ACTIVITY_TYPES = [
  {
    id:    'syntax',
    label: 'Completar Frases',
    emoji: '🧩',
    desc:  'El niño elige la palabra que completa la oración',
    ring:  'ring-orange-400',
    bg:    'bg-orange-50',
    dot:   'bg-orange-400',
    color: '#e07a5f',
  },
  {
    id:    'category',
    label: '¿Cuál no pertenece?',
    emoji: '🔍',
    desc:  'El niño identifica el intruso de un grupo',
    ring:  'ring-purple-400',
    bg:    'bg-purple-50',
    dot:   'bg-purple-400',
    color: '#7c6bb0',
  },
  {
    id:    'follow-instruction',
    label: 'Sigue la Instrucción',
    emoji: '📢',
    desc:  'El niño comprende y ejecuta una instrucción oral',
    ring:  'ring-teal-400',
    bg:    'bg-teal-50',
    dot:   'bg-teal-400',
    color: '#4aab8a',
  },
]

export const LEVELS = ['N1','N2','N3','N4','N5','N6','N7']

export const DIFFICULTIES = [
  { id: 'inicial',    label: 'Inicial' },
  { id: 'intermedio', label: 'Intermedio' },
  { id: 'avanzado',   label: 'Avanzado' },
]

export const COMPONENTS = [
  'Fonología','Semántica','Morfosintaxis','Pragmática',
  'Atención','Comprensión','Narrativa',
]

export const EMOJIS = [
  '🐕','🐈','🐰','🐯','🦁','🐘','🦊','🐧','🐦','🦋',
  '🍎','🍊','🍋','🍇','🍓','🍒','🥕','🌽','🥦','🍕',
  '⚽','🏀','🎮','📚','✏️','🎨','🏠','🚗','✈️','⭐',
  '🌈','🌟','🎵','🎪','🏖️','🌺','🍦','🎁','🔑','🧸',
]

export const INITIAL_META = {
  title: '',
  activityType: '',
  levelId: 'N4',
  difficulty: 'inicial',
  allLevels: false,
  components: [],
}

// ── Validaciones ──────────────────────────────────────────────────────────────

export function validateSyntax(c) {
  if (!c.sentence?.includes('___')) return 'La frase debe contener ___ donde va el espacio'
  if (!c.correct?.trim())           return 'Indica la respuesta correcta'
  const d = (c.distractors || []).filter(x => x.trim())
  if (d.length < 1)                 return 'Agrega al menos 1 distractor'
  if (d.includes(c.correct))        return 'El distractor no puede ser igual a la respuesta correcta'
  return null
}

export function validateCategory(c) {
  if (!c.category?.trim())          return 'Escribe el nombre de la categoría'
  if (!c.intruder?.word?.trim())    return 'Escribe la palabra intrusa'
  if (!c.intruder?.emoji)           return 'Elige un emoji para el intruso'
  const m = (c.members || []).filter(x => x.word?.trim())
  if (m.length < 2)                 return 'Agrega al menos 2 miembros del grupo'
  if (m.some(x => !x.emoji))        return 'Todos los miembros necesitan un emoji'
  return null
}

export function validateInstruction(c) {
  if (!c.instruction?.trim())       return 'Escribe la instrucción'
  if (!c.correctResponse?.trim())   return 'Describe la respuesta esperada'
  return null
}

export const VALIDATORS = {
  syntax:               validateSyntax,
  category:             validateCategory,
  'follow-instruction': validateInstruction,
}

// ── Estructura de guardado ────────────────────────────────────────────────────

export function buildExerciseContent(activityType, content) {
  if (activityType === 'syntax') {
    const distractors = (content.distractors || []).filter(d => d.trim())
    return {
      sentence:    content.sentence,
      correct:     content.correct,
      options:     [content.correct, ...distractors].sort(() => Math.random() - 0.5),
      explanation: content.explanation || '',
      level:       content.difficulty,
    }
  }
  if (activityType === 'category') {
    const members = (content.members || []).filter(m => m.word?.trim())
    return {
      category: content.category,
      intruder:  content.intruder,
      options:   [content.intruder, ...members],
    }
  }
  // follow-instruction
  return {
    instruction:     content.instruction,
    correctResponse: content.correctResponse,
    materials:       content.materials || '',
    visual:          content.visual || '',
  }
}

// ── Validación de estructura antes de persistir ───────────────────────────────

export function validateExerciseStructure(exercise) {
  if (!exercise.title?.trim())       return 'Falta título'
  if (!exercise.activityType)        return 'Falta tipo de actividad'
  if (!exercise.levelId && !exercise.allLevels) return 'Falta nivel'
  if (!exercise.difficulty)          return 'Falta dificultad'
  if (!exercise.content)             return 'Falta contenido'
  return null
}

// ── Parsear ejercicio existente para edición ──────────────────────────────────

export function parseExerciseForEdit(exercise) {
  const meta = {
    title:        exercise.title       || '',
    activityType: exercise.activityType || '',
    levelId:      exercise.levelId     || 'N4',
    difficulty:   exercise.difficulty  || 'inicial',
    allLevels:    exercise.allLevels   || false,
    components:   exercise.components  || [],
  }

  // Reconstruir content editable desde content guardado
  let content = {}
  const c = exercise.content || {}

  if (exercise.activityType === 'syntax') {
    const options = c.options || []
    content = {
      sentence:     c.sentence || '',
      correct:      c.correct  || '',
      distractors:  options.filter(o => o !== c.correct),
      explanation:  c.explanation || '',
    }
  } else if (exercise.activityType === 'category') {
    const members = (c.options || []).filter(o => o.word !== c.intruder?.word)
    content = {
      category: c.category || '',
      intruder:  c.intruder || { word: '', emoji: '' },
      members:   members.length ? members : [{ word: '', emoji: '' }, { word: '', emoji: '' }],
    }
  } else if (exercise.activityType === 'follow-instruction') {
    content = {
      instruction:     c.instruction     || '',
      correctResponse: c.correctResponse || '',
      materials:       c.materials       || '',
      visual:          c.visual          || '',
    }
  }

  return { meta, content }
}
