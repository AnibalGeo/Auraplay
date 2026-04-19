export const COMPONENT_MAP = {
  'minimal-pairs': 'fonologico',
  'build-word': 'fonologico',
  'listen': 'lexico',
  'syntax': 'morfosintactico',
  'semantic': 'lexico',
  'narrative': 'morfosintactico',
  'pragmatic': 'pragmatico',
  'rhyme': 'fonologico',
  'point-image': 'lexico',
  'category': 'lexico',
  'follow-instruction': 'morfosintactico',
  'communicative-intent': 'pragmatico',
};

export function getDifficultyForActivity(activityId, componentLevels = {}) {
  const compKey = COMPONENT_MAP[activityId];
  return componentLevels[compKey] ?? 'inicial';
}
