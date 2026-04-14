import { createContext, useContext, useState, useEffect } from 'react'
import { LEVELS, STIMULUS_CONFIG, DEFAULT_STIMULUS_SETTINGS, getLevelByAge, getLevelById } from '../data/levels'

const PatientContext = createContext(null)

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
  createdAt: null,
  updatedAt: null,
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem('auraplay_patient')
    return saved ? { ...DEFAULT_PATIENT, ...JSON.parse(saved) } : DEFAULT_PATIENT
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
    return saved ? { ...DEFAULT_STIMULUS_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_STIMULUS_SETTINGS }
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

export function PatientProvider({ children }) {
  const [patient, setPatient] = useState(loadFromStorage)
  const [estimulusSettings, setEstimulusSettings] = useState(loadStimulusSettingsFromStorage)

  function loadStimulusSettings(settings) {
    setEstimulusSettings({ ...DEFAULT_STIMULUS_SETTINGS, ...settings })
  }

  useEffect(() => { saveToStorage(patient) }, [patient])
  useEffect(() => { saveStimulusSettings(estimulusSettings) }, [estimulusSettings])

  const level = getLevelById(patient.levelId)
  const stimulusConfig = STIMULUS_CONFIG[patient.diagnosis] ?? STIMULUS_CONFIG['tel']

  function updatePatient(changes) {
    setPatient(prev => ({ ...prev, ...changes }))
  }

  function updateStimulusSettings(key, value) {
    setEstimulusSettings(prev => ({ ...prev, [key]: value }))
  }

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

  function addStars(n) {
    setPatient(prev => ({ ...prev, stars: prev.stars + n }))
  }

  function setDiagnosis(diagnosis) {
    updatePatient({ diagnosis })
  }

  function setLevelById(id) {
    if (LEVELS[id]) updatePatient({ levelId: id })
  }

  function setLevelByAge(ageMonths) {
    const found = getLevelByAge(ageMonths)
    updatePatient({ levelId: found.id, ageMonths })
  }

  function loadPatient(data) {
    setPatient({ ...DEFAULT_PATIENT, ...data })
    if (data.estimulusSettings) {
      loadStimulusSettings(data.estimulusSettings)
    }
  }

  function addSessionEntry(entry) {
    setPatient(prev => ({
      ...prev,
      sessionHistory: [...(prev.sessionHistory || []), entry],
      sessionsCompleted: (prev.sessionsCompleted || 0) + 1,
      updatedAt: new Date().toISOString(),
    }))
  }

  function resetPatient() {
    setPatient(DEFAULT_PATIENT)
    localStorage.removeItem('auraplay_patient')
  }

  return (
    <PatientContext.Provider value={{
      patient,
      level,
      stimulusConfig,
      estimulusSettings,
      updatePatient,
      updateStimulusSettings,
      advanceLevel,
      decreaseLevel,
      addStars,
      setDiagnosis,
      setLevelById,
      setLevelByAge,
      loadPatient,
      loadStimulusSettings,
      addSessionEntry,
      resetPatient,
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
