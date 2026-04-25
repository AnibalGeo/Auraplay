/**
 * ThemeManager.jsx
 * Envuelve pantallas de actividades con el tema del componente clínico.
 * Inyecta data-theme en el DOM → las CSS variables cambian automáticamente.
 *
 * Uso básico:
 *   <ThemeManager componentType="fonologico">
 *     <MinimalPairsScreen ... />
 *   </ThemeManager>
 *
 * Uso con inferencia automática desde PatientContext:
 *   <ThemeManager>
 *     <MinimalPairsScreen ... />
 *   </ThemeManager>
 */

import { useRef, useEffect } from 'react'
import { usePatient } from '../context/PatientContext'

// Mapeo de actividad → componente clínico
// Permite que ThemeManager infiera el tema sin prop explícita.
export const ACTIVITY_THEME_MAP = {
  'minimal-pairs':        'fonologico',
  'build-word':           'fonologico',
  'rhyme':                'fonologico',
  'listen':               'lexico',
  'semantic':             'lexico',
  'point-image':          'lexico',
  'category':             'lexico',
  'syntax':               'morfosintactico',
  'narrative':            'morfosintactico',
  'follow-instruction':   'morfosintactico',
  'pragmatic':            'pragmatico',
  'communicative-intent': 'pragmatico',
}

// Temas válidos
const VALID_THEMES = ['fonologico', 'lexico', 'morfosintactico', 'pragmatico']

/**
 * ThemeManager
 *
 * @param {object}  props
 * @param {string}  [props.componentType] - tema explícito; si no se pasa,
 *                  se infiere del historial de actividad activa en PatientContext
 * @param {string}  [props.activityId]    - para inferencia automática
 * @param {boolean} [props.professional]  - activa la capa de terapeuta (glassmorphism)
 * @param {node}    props.children
 */
export default function ThemeManager({
  componentType,
  activityId,
  professional = false,
  children,
}) {
  const { patient } = usePatient()
  const ref = useRef(null)

  // Resolver el tema
  const resolvedTheme = (() => {
    // 1. Prop explícita — máxima prioridad
    if (componentType && VALID_THEMES.includes(componentType)) return componentType
    // 2. Inferencia por activityId
    if (activityId && ACTIVITY_THEME_MAP[activityId]) return ACTIVITY_THEME_MAP[activityId]
    // 3. Fallback al componentLevel prioritario del paciente
    const focus = patient?.clinicalProfile?.recommendedFocus
    if (focus && VALID_THEMES.includes(focus)) return focus
    // 4. Default
    return 'fonologico'
  })()

  // Inyectar data-theme en el elemento raíz
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.setAttribute('data-theme', resolvedTheme)
    if (professional) el.setAttribute('data-layer', 'professional')
    else el.removeAttribute('data-layer')
    return () => {
      el.removeAttribute('data-theme')
      el.removeAttribute('data-layer')
    }
  }, [resolvedTheme, professional])

  return (
    <div ref={ref} style={{ display: 'contents' }}>
      {children}
    </div>
  )
}

/**
 * withTheme — HOC alternativo para pantallas de actividad
 * Permite no tocar el JSX del componente existente.
 *
 * Uso:
 *   export default withTheme(MinimalPairsScreen, 'fonologico')
 *
 * @param {React.Component} Component
 * @param {string} theme
 */
export function withTheme(Component, theme) {
  return function ThemedComponent(props) {
    return (
      <ThemeManager componentType={theme}>
        <Component {...props} />
      </ThemeManager>
    )
  }
}

/**
 * useThemeColors — hook para obtener los colores del tema activo
 * Útil para inline styles que necesiten los valores exactos.
 *
 * @param {string} [override] - sobreescribe el tema inferido del contexto
 * @returns {{ main, dark, light, surface, shadow }}
 */
const THEME_COLORS = {
  fonologico:      { main: '#4aab8a', dark: '#2d7a62', light: '#e8f5ee', surface: '#e8f5f0', shadow: 'rgba(74,171,138,0.12)' },
  lexico:          { main: '#7c6bb0', dark: '#4a3880', light: '#f0edf8', surface: '#e8e0f5', shadow: 'rgba(124,107,176,0.12)' },
  morfosintactico: { main: '#e07a5f', dark: '#993C1D', light: '#fdf0ec', surface: '#f5e6de', shadow: 'rgba(224,122,95,0.12)' },
  pragmatico:      { main: '#e8a020', dark: '#854F0B', light: '#fff8e1', surface: '#fff3c4', shadow: 'rgba(232,160,32,0.12)' },
}

export function useThemeColors(override) {
  const { patient } = usePatient()
  const theme = override
    || patient?.clinicalProfile?.recommendedFocus
    || 'fonologico'
  return THEME_COLORS[theme] ?? THEME_COLORS.fonologico
}
