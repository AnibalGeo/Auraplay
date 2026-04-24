/**
 * patients.js — v3
 * CRUD del roster de pacientes — AuraPlay
 *
 * Novedades v3:
 *   familyEnabled    boolean  — acceso familia activo
 *   familyPin        string   — PIN hasheado
 *   familyFirstLogin boolean  — obliga cambiar PIN al primer ingreso
 *   familyLastLogin  string   — ISO timestamp último acceso
 */

const STORAGE_KEY     = 'auraplay_patients'
const VALID_DIAGNOSES = ['tel', 'tl_tea', 'tl_tdah', 'tl_tea_tdah']

function normalizeDiagnosis(d) {
  return VALID_DIAGNOSES.includes(d) ? d : 'tel'
}

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
  catch { return [] }
}

function persist(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) }
  catch { console.warn('localStorage error') }
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export function getAllPatients() { return load() }

export function getPatientById(id) {
  return load().find(p => p.id === id) ?? null
}

export function getPatientByRut(rut) {
  const n = rut.replace(/\s/g, '').toLowerCase()
  return load().find(p => p.rut.replace(/\s/g, '').toLowerCase() === n) ?? null
}

export function savePatient(patient) {
  const list = load()
  const now  = new Date().toISOString()

  const np = {
    id: String(Date.now()), rut: '', name: '', birthDate: '',
    ageMonths: 0, phone: '', guardianName: '',
    diagnosis: normalizeDiagnosis(patient.diagnosis),
    levelId: 'N1', stars: 0, sessionsCompleted: 0,
    sessionHistory: [], profilePhoto: null,
    componentLevels: { fonologico: 'inicial', lexico: 'inicial', morfosintactico: 'inicial', pragmatico: 'inicial' },
    // v2
    assessmentCompleted: false, assessmentDate: null,
    clinicalProfile: null, recommendedFocus: [], therapyPlan: null,
    milestones: { dirLevel: null, preLinguisticSkills: {
      regulation: null, personInterest: null, socialPlay: null,
      eyeContact: null, objectImitation: null, bodyImitation: null,
      soundImitation: null, jointAttention: null,
      communicativeIntent: null, wordImitation: null, firstWords: null,
    }},
    // v3
    familyEnabled: false, familyPin: '',
    familyFirstLogin: true, familyLastLogin: null,
    createdAt: now, updatedAt: now,
    ...patient,
    diagnosis: normalizeDiagnosis(patient.diagnosis ?? 'tel'),
    createdAt: patient.createdAt || now,
  }

  list.push(np)
  persist(list)
  return np
}

export function updatePatient(id, changes) {
  const list = load()
  const idx  = list.findIndex(p => p.id === id)
  if (idx === -1) return null
  list[idx] = { ...list[idx], ...changes, updatedAt: new Date().toISOString() }
  persist(list)
  return list[idx]
}

export function deletePatient(id) {
  const list = load()
  const idx  = list.findIndex(p => p.id === id)
  if (idx === -1) return false
  list.splice(idx, 1)
  persist(list)
  return true
}

export function searchPatients(query) {
  if (!query?.trim()) return load()
  const q = query.trim().toLowerCase()
  return load().filter(p =>
    p.name?.toLowerCase().includes(q) ||
    p.rut?.toLowerCase().includes(q) ||
    p.guardianName?.toLowerCase().includes(q)
  )
}

// ── Migración idempotente ─────────────────────────────────────────────────────

const DIAG_MAP = { neurodiverse: 'tl_tea', tdl_neurodiverse: 'tl_tea_tdah' }

function migrateOne(p) {
  let changed = false
  if (DIAG_MAP[p.diagnosis])         { p.diagnosis = DIAG_MAP[p.diagnosis]; changed = true }
  if (p.assessmentCompleted === undefined) { p.assessmentCompleted = false; changed = true }
  if (p.assessmentDate      === undefined) { p.assessmentDate      = null;  changed = true }
  if (p.clinicalProfile     === undefined) { p.clinicalProfile     = null;  changed = true }
  if (p.recommendedFocus    === undefined) { p.recommendedFocus    = [];    changed = true }
  if (p.therapyPlan         === undefined) { p.therapyPlan         = null;  changed = true }
  if (!p.milestones) { p.milestones = { dirLevel: null, preLinguisticSkills: {} }; changed = true }
  if (p.familyEnabled    === undefined) { p.familyEnabled    = false; changed = true }
  if (p.familyPin        === undefined) { p.familyPin        = '';    changed = true }
  if (p.familyFirstLogin === undefined) { p.familyFirstLogin = true;  changed = true }
  if (p.familyLastLogin  === undefined) { p.familyLastLogin  = null;  changed = true }
  return changed
}

export function migratePatientData() {
  try {
    const list    = load()
    let changed   = false
    list.forEach(p => { if (migrateOne(p)) changed = true })
    if (changed) persist(list)
  } catch { console.warn('Error migrando roster') }

  try {
    const raw = localStorage.getItem('auraplay_patient')
    if (!raw) return
    const p  = JSON.parse(raw)
    if (migrateOne(p)) localStorage.setItem('auraplay_patient', JSON.stringify(p))
  } catch { console.warn('Error migrando paciente activo') }
}
