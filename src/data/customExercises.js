/**
 * customExercises.js
 * CRUD de ejercicios personalizados por terapeuta — AuraPlay
 *
 * Storage key: auraplay_custom_exercises_{username}
 * Estructura escalable a backend: cada ejercicio tiene owner + type + content
 *
 * Tipos soportados en MVP:
 *   'syntax'             → { sentence, options[], correct, explanation }
 *   'category'           → { category, intruder{word,emoji}, options[{word,emoji}] }
 *   'follow-instruction' → { instruction, correctResponse, materials, visual }
 */

import { getTherapistCreds } from '../context/AuthContext'

const SCHEMA_VERSION = '1.0'

function storageKey() {
  const creds = getTherapistCreds()
  const user  = creds?.username ?? 'default'
  return `auraplay_custom_exercises_${user}`
}

function load() {
  try { return JSON.parse(localStorage.getItem(storageKey())) || [] }
  catch { return [] }
}

function persist(list) {
  try { localStorage.setItem(storageKey(), JSON.stringify(list)) }
  catch { console.warn('customExercises: localStorage error') }
}

// ── Validación de estructura antes de persistir ───────────────────────────────

export function validateExerciseStructure(exercise) {
  if (!exercise.title?.trim())                      return 'Falta título'
  if (!exercise.activityType)                       return 'Falta tipo de actividad'
  if (!exercise.levelId && !exercise.allLevels)     return 'Falta nivel'
  if (!exercise.difficulty)                         return 'Falta dificultad'
  if (!exercise.content || typeof exercise.content !== 'object') return 'Falta contenido'
  return null
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getAllCustomExercises() {
  return load()
}

/**
 * Retorna ejercicios filtrados por activityType y levelId,
 * en el formato exacto que las pantallas de actividad esperan.
 */
export function getCustomExercisesFor(activityType, levelId, difficulty = 'inicial') {
  return load().filter(ex =>
    ex.activityType === activityType &&
    (ex.levelId === levelId || ex.allLevels) &&
    (ex.difficulty === difficulty || ex.difficulty === 'todas')
  )
}

export function saveCustomExercise(exercise) {
  const structError = validateExerciseStructure(exercise)
  if (structError) {
    console.warn('customExercises.saveCustomExercise:', structError)
    return null
  }

  const list  = load()
  const now   = new Date().toISOString()
  const creds = getTherapistCreds()

  const newEx = {
    id:        `custom_${Date.now()}`,
    owner:     creds?.username ?? 'default',
    isCustom:  true,
    version:   SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    ...exercise,
  }
  list.push(newEx)
  persist(list)
  return newEx
}

export function updateCustomExercise(id, changes) {
  const list = load()
  const idx  = list.findIndex(e => e.id === id)
  if (idx === -1) return null

  const updated = {
    ...list[idx],
    ...changes,
    id,                              // id nunca se sobreescribe
    updatedAt: new Date().toISOString(),
    version:   SCHEMA_VERSION,
  }

  const structError = validateExerciseStructure(updated)
  if (structError) {
    console.warn('customExercises.updateCustomExercise:', structError)
    return null
  }

  list[idx] = updated
  persist(list)
  return list[idx]
}

export function deleteCustomExercise(id) {
  const list = load().filter(e => e.id !== id)
  persist(list)
  return true
}

export function duplicateCustomExercise(id) {
  const list = load()
  const src  = list.find(e => e.id === id)
  if (!src) return null
  return saveCustomExercise({
    ...src,
    id:        undefined,
    title:     `${src.title} (copia)`,
    createdAt: undefined,
    updatedAt: undefined,
  })
}
