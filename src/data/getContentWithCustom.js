/**
 * getContentWithCustom.js — v2
 * Wrapper de getContent que inyecta ejercicios personalizados.
 * Soporta: syntax, category, follow-instruction
 */

import { getContent } from './getContent'
import { getCustomExercisesFor } from './customExercises'

// Mapeo activityType → clave en el JSON de contenido
const ACTIVITY_KEY_MAP = {
  'syntax':             'connectors',
  'category':           'categories',
  'follow-instruction': 'instructions',
}

export function getContentWithCustom(levelId, activityType = null, difficulty = 'inicial') {
  const native = getContent(levelId)
  if (!activityType || !ACTIVITY_KEY_MAP[activityType]) return native

  const contentKey  = ACTIVITY_KEY_MAP[activityType]
  const nativeItems = native?.[contentKey]?.[difficulty] ?? []
  const customItems = getCustomExercisesFor(activityType, levelId, difficulty)
    .map(ex => ex.content)

  return {
    ...native,
    [contentKey]: {
      ...(native?.[contentKey] ?? {}),
      [difficulty]: [...nativeItems, ...customItems],
    },
  }
}
