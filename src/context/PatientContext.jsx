import { createContext, useContext, useState, useEffect } from 'react'
import { LEVELS, STIMULUS_CONFIG, DEFAULT_STIMULUS_SETTINGS, getLevelByAge, getLevelById } from '../data/levels'

const VALID_DIAGNOSES = ['tel', 'tl_tea', 'tl_tdah', 'tl_tea_tdah']
function normalizeDiagnosis(d) { return VALID_DIAGNOSES.includes(d) ? d : 'tel' }

const PatientContext = createContext(null)

/**
 * Shape completo de DEFAULT_PATIENT.
 * Cualquier campo nuevo aquí tiene fallback automático
 * para pacientes guardados antes de esta versión.
 *
 * Campos añadidos (v2):
 *   assessmentCompleted  — boolean: si el wizard de screening fue completado
 *   assessmentDate       — ISO string: cuándo se realizó la evaluación
 *   clinicalProfile      — objeto con el perfil clínico completo (ver computeClinicalProfile)
 *   recommendedFocus     — string[]: áreas prioritarias detectadas en el screening
 *   milestones           — objeto: hitos DIR y pre-habilidades Mize registrados
 */
const DEFAULT_PATIENT = {
  id: null,
  rut: '',
  name: 'Mateo',
  birthDate: '',
  ageMonths: 54,
  phone: '',
  guardianName: '',
  diagnosis: 'tel',
  levelId: 'N4',
  stars: 0,
  sessionsCompleted: 0,
  sessionHistory: [],
  profilePhoto: null,
  componentLevels: {
    fonologico:      'inicial',
    lexico:          'inicial',
    morfosintactico: 'inicial',
    pragmatico:      'inicial',
  },
  // ── Campos v2: screening clínico ──────────────────────────────────────────
  assessmentCompleted: false,
  assessmentDate: null,
  clinicalProfile: null,
  recommendedFocus: [],
  therapyPlan: null,
  // ── Campos v2: hitos clínicos ─────────────────────────────────────────────
  milestones: {
    dirLevel: null,        // 1-6: hito DIR estimado (Greenspan)
    preLinguisticSkills: { // true/false: checklist Mize
      regulation:          null,
      personInterest:      null,
      socialPlay:          null,
      eyeContact:          null,
      objectImitation:     null,
      bodyImitation:       null,
      soundImitation:      null,
      jointAttention:      null,
      communicativeIntent: null,
      wordImitation:       null,
      firstWords:          null,
    },
  },
  // ── Campos existentes ─────────────────────────────────────────────────────
  createdAt: null,
  updatedAt: null,
}

// ── localStorage helpers ───────────────────────────────────────────────────────

function loadFromStorage() {
  try {
    const saved = localStorage.getItem('auraplay_patient')
    if (!saved) return DEFAULT_PATIENT
    const parsed = JSON.parse(saved)
    // Merge con DEFAULT_PATIENT garantiza que campos nuevos tengan fallback
    return {
      ...DEFAULT_PATIENT,
      ...parsed,
      diagnosis: normalizeDiagnosis(parsed.diagnosis),
      // Merge profundo de componentLevels para no pisar valores existentes
      componentLevels: {
        ...DEFAULT_PATIENT.componentLevels,
        ...(parsed.componentLevels ?? {}),
      },
      // Merge profundo de milestones
      milestones: {
        ...DEFAULT_PATIENT.milestones,
        ...(parsed.milestones ?? {}),
        preLinguisticSkills: {
          ...DEFAULT_PATIENT.milestones.preLinguisticSkills,
          ...(parsed.milestones?.preLinguisticSkills ?? {}),
        },
      },
    }
  } catch {
    return DEFAULT_PATIENT
  }
}

function saveToStorage(patient) {
  try {
    localStorage.setItem('auraplay_patient', JSON.stringify(patient))
  } catch {
    console.warn('No se pudo guardar en localStorage')
  }
}

function loadStimulusSettingsFromStorage() {
  try {
    const saved = localStorage.getItem('auraplay_stimulus_settings')
    return saved
      ? { ...DEFAULT_STIMULUS_SETTINGS, ...JSON.parse(saved) }
      : { ...DEFAULT_STIMULUS_SETTINGS }
  } catch {
    return { ...DEFAULT_STIMULUS_SETTINGS }
  }
}

function saveStimulusSettings(settings) {
  try {
    localStorage.setItem('auraplay_stimulus_settings', JSON.stringify(settings))
  } catch {
    console.warn('No se pudo guardar stimulus settings')
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function PatientProvider({ children }) {
  const [patient, setPatient]                 = useState(loadFromStorage)
  const [estimulusSettings, setEstimulusSettings] = useState(loadStimulusSettingsFromStorage)

  useEffect(() => { saveToStorage(patient) }, [patient])
  useEffect(() => { saveStimulusSettings(estimulusSettings) }, [estimulusSettings])

  const level         = getLevelById(patient.levelId)
  const stimulusConfig = STIMULUS_CONFIG[patient.diagnosis] ?? STIMULUS_CONFIG['tel']

  // ── Actualizadores ───────────────────────────────────────────────────────

  function updatePatient(changes) {
    setPatient(prev => ({ ...prev, ...changes, updatedAt: new Date().toISOString() }))
  }

  function updateStimulusSettings(key, value) {
    setEstimulusSettings(prev => ({ ...prev, [key]: value }))
  }

  function loadStimulusSettings(settings) {
    setEstimulusSettings({ ...DEFAULT_STIMULUS_SETTINGS, ...settings })
  }

  // ── Nivel ────────────────────────────────────────────────────────────────

  function advanceLevel() {
    const ids = Object.keys(LEVELS)
    const current = ids.indexOf(patient.levelId)
    if (current < ids.length - 1) updatePatient({ levelId: ids[current + 1] })
  }

  function decreaseLevel() {
    const ids = Object.keys(LEVELS)
    const current = ids.indexOf(patient.levelId)
    if (current > 0) updatePatient({ levelId: ids[current - 1] })
  }

  function setLevelById(id) {
    if (LEVELS[id]) updatePatient({ levelId: id })
  }

  function setLevelByAge(ageMonths) {
    const found = getLevelByAge(ageMonths)
    updatePatient({ levelId: found.id, ageMonths })
  }

  // ── Estrellas y sesiones ─────────────────────────────────────────────────

  function addStars(n) {
    setPatient(prev => ({ ...prev, stars: prev.stars + n }))
  }

  function addSessionEntry(entry) {
    setPatient(prev => ({
      ...prev,
      sessionHistory: [...(prev.sessionHistory || []), entry],
      sessionsCompleted: (prev.sessionsCompleted || 0) + 1,
      updatedAt: new Date().toISOString(),
    }))
  }

  // ── Diagnóstico ──────────────────────────────────────────────────────────

  function setDiagnosis(diagnosis) {
    updatePatient({ diagnosis })
  }

  // ── Carga completa de paciente ───────────────────────────────────────────

  function loadPatient(data) {
    setPatient({
      ...DEFAULT_PATIENT,
      ...data,
      diagnosis: normalizeDiagnosis(data.diagnosis),
      componentLevels: {
        ...DEFAULT_PATIENT.componentLevels,
        ...(data.componentLevels ?? {}),
      },
      milestones: {
        ...DEFAULT_PATIENT.milestones,
        ...(data.milestones ?? {}),
        preLinguisticSkills: {
          ...DEFAULT_PATIENT.milestones.preLinguisticSkills,
          ...(data.milestones?.preLinguisticSkills ?? {}),
        },
      },
    })
    if (data.estimulusSettings) {
      loadStimulusSettings(data.estimulusSettings)
    }
  }

  // ── Screening clínico ────────────────────────────────────────────────────

  /**
   * Guarda el resultado del wizard de screening.
   * profile: objeto ClinicalProfile generado por computeClinicalProfile()
   */
  function completeAssessment(profile) {
    updatePatient({
      assessmentCompleted: true,
      assessmentDate: profile.assessmentDate,
      clinicalProfile: profile,
      recommendedFocus: profile.priorityAreas ?? [],
      levelId: profile.levelId,
      milestones: {
        ...patient.milestones,
        dirLevel: profile.dirLevel,
      },
    })
  }

  /**
   * Permite re-evaluar al paciente (resetea el screening).
   * Usar solo desde el panel del terapeuta (requiere PIN).
   */
  function resetAssessment() {
    updatePatient({
      assessmentCompleted: false,
      assessmentDate: null,
      clinicalProfile: null,
      recommendedFocus: [],
    })
  }

  // ── Reset completo ───────────────────────────────────────────────────────

  function resetPatient() {
    setPatient(DEFAULT_PATIENT)
    localStorage.removeItem('auraplay_patient')
  }

  // ── Context value ────────────────────────────────────────────────────────

  return (
    <PatientContext.Provider value={{
      patient,
      level,
      stimulusConfig,
      estimulusSettings,
      // Actualizadores
      updatePatient,
      updateStimulusSettings,
      loadStimulusSettings,
      // Nivel
      advanceLevel,
      decreaseLevel,
      setLevelById,
      setLevelByAge,
      // Sesiones
      addStars,
      addSessionEntry,
      // Diagnóstico
      setDiagnosis,
      // Paciente completo
      loadPatient,
      resetPatient,
      // Screening (nuevo v2)
      completeAssessment,
      resetAssessment,
      // Datos globales
      allLevels: LEVELS,
    }}>
      {children}
    </PatientContext.Provider>
  )
}

export function usePatient() {
  const ctx = useContext(PatientContext)
  if (!ctx) throw new Error('usePatient debe usarse dentro de PatientProvider')
  return ctx
}
