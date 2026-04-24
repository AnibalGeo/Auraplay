/**
 * patients.js — CRUD del roster de pacientes en localStorage
 *
 * Cambios v2:
 *   - Template base de savePatient incluye campos de screening clínico
 *   - migratePatientData() migra pacientes antiguos al nuevo shape
 *   - Sin romper ningún campo existente
 */

const STORAGE_KEY = 'auraplay_patients'
const VALID_DIAGNOSES = ['tel', 'tl_tea', 'tl_tdah', 'tl_tea_tdah']

function normalizeDiagnosis(d) {
  return VALID_DIAGNOSES.includes(d) ? d : 'tel'
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persist(patients) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients))
  } catch {
    console.warn('No se pudo guardar en localStorage')
  }
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export function getAllPatients() {
  return load()
}

export function getPatientById(id) {
  return load().find(p => p.id === id) ?? null
}

export function getPatientByRut(rut) {
  const normalized = rut.replace(/\s/g, '').toLowerCase()
  return load().find(p =>
    p.rut.replace(/\s/g, '').toLowerCase() === normalized
  ) ?? null
}

/**
 * Crea un nuevo paciente con todos los campos del shape v2.
 * Los campos que vengan en `patient` sobrescriben los defaults.
 */
export function savePatient(patient) {
  const patients = load()
  const now = new Date().toISOString()

  const newPatient = {
    // ── Campos base (v1) ────────────────────────────────────────────────────
    id: String(Date.now()),
    rut: '',
    name: '',
    birthDate: '',
    ageMonths: 0,
    phone: '',
    guardianName: '',
    diagnosis: normalizeDiagnosis(patient.diagnosis),
    levelId: 'N1',
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
    // ── Campos screening clínico (v2) ────────────────────────────────────────
    assessmentCompleted: false,
    assessmentDate: null,
    clinicalProfile: null,
    recommendedFocus: [],
    milestones: {
      dirLevel: null,
      preLinguisticSkills: {
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
    // ── Timestamps ───────────────────────────────────────────────────────────
    createdAt: now,
    updatedAt: now,
    // ── Override con datos reales del paciente ────────────────────────────────
    ...patient,
    // Normalizar diagnosis por si viene mal
    diagnosis: normalizeDiagnosis(patient.diagnosis ?? 'tel'),
    // Forzar createdAt si no viene
    createdAt: patient.createdAt || now,
  }

  patients.push(newPatient)
  persist(patients)
  return newPatient
}

/**
 * Actualiza campos de un paciente existente.
 * Merge shallow — no pisa campos no incluidos en `changes`.
 */
export function updatePatient(id, changes) {
  const patients = load()
  const idx = patients.findIndex(p => p.id === id)
  if (idx === -1) return null
  patients[idx] = {
    ...patients[idx],
    ...changes,
    updatedAt: new Date().toISOString(),
  }
  persist(patients)
  return patients[idx]
}

export function deletePatient(id) {
  const patients = load()
  const idx = patients.findIndex(p => p.id === id)
  if (idx === -1) return false
  patients.splice(idx, 1)
  persist(patients)
  return true
}

// ── Búsqueda ──────────────────────────────────────────────────────────────────

export function searchPatients(query) {
  if (!query || !query.trim()) return load()
  const q = query.trim().toLowerCase()
  return load().filter(p =>
    p.name?.toLowerCase().includes(q) ||
    p.rut?.toLowerCase().includes(q) ||
    p.guardianName?.toLowerCase().includes(q)
  )
}

// ── Migración ─────────────────────────────────────────────────────────────────

const DIAGNOSIS_MIGRATION = {
  neurodiverse:      'tl_tea',
  tdl_neurodiverse:  'tl_tea_tdah',
}

/**
 * Migra todos los pacientes al shape v2.
 * Seguro de ejecutar múltiples veces — idempotente.
 * Llama esta función al inicio de la app (en main.jsx o App.jsx).
 */
export function migratePatientData() {
  // ── Migrar roster ──────────────────────────────────────────────────────────
  try {
    const patients = load()
    let changed = false

    patients.forEach(p => {
      // Migrar diagnosis obsoletos
      if (DIAGNOSIS_MIGRATION[p.diagnosis]) {
        p.diagnosis = DIAGNOSIS_MIGRATION[p.diagnosis]
        changed = true
      }
      // Agregar campos v2 si faltan (retrocompatibilidad)
      if (p.assessmentCompleted === undefined) {
        p.assessmentCompleted = false
        changed = true
      }
      if (p.assessmentDate === undefined) {
        p.assessmentDate = null
        changed = true
      }
      if (p.clinicalProfile === undefined) {
        p.clinicalProfile = null
        changed = true
      }
      if (p.recommendedFocus === undefined) {
        p.recommendedFocus = []
        changed = true
      }
      if (!p.milestones) {
        p.milestones = {
          dirLevel: null,
          preLinguisticSkills: {
            regulation: null, personInterest: null, socialPlay: null,
            eyeContact: null, objectImitation: null, bodyImitation: null,
            soundImitation: null, jointAttention: null,
            communicativeIntent: null, wordImitation: null, firstWords: null,
          },
        }
        changed = true
      }
    })

    if (changed) persist(patients)
  } catch {
    console.warn('Error migrando roster de pacientes')
  }

  // ── Migrar paciente activo en contexto ────────────────────────────────────
  try {
    const raw = localStorage.getItem('auraplay_patient')
    if (!raw) return
    const p = JSON.parse(raw)
    let changed = false

    if (DIAGNOSIS_MIGRATION[p.diagnosis]) {
      p.diagnosis = DIAGNOSIS_MIGRATION[p.diagnosis]
      changed = true
    }
    if (p.assessmentCompleted === undefined) {
      p.assessmentCompleted = false
      changed = true
    }
    if (p.assessmentDate === undefined)  { p.assessmentDate = null;  changed = true }
    if (p.clinicalProfile === undefined) { p.clinicalProfile = null; changed = true }
    if (p.recommendedFocus === undefined){ p.recommendedFocus = [];  changed = true }
    if (p.therapyPlan === undefined)    { p.therapyPlan = null;     changed = true }
    if (!p.milestones) {
      p.milestones = {
        dirLevel: null,
        preLinguisticSkills: {
          regulation: null, personInterest: null, socialPlay: null,
          eyeContact: null, objectImitation: null, bodyImitation: null,
          soundImitation: null, jointAttention: null,
          communicativeIntent: null, wordImitation: null, firstWords: null,
        },
      }
      changed = true
    }

    if (changed) localStorage.setItem('auraplay_patient', JSON.stringify(p))
  } catch {
    console.warn('Error migrando paciente activo')
  }
}
