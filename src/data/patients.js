const STORAGE_KEY = 'auraplay_patients'

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

export function getAllPatients() {
  return load()
}

export function getPatientById(id) {
  return load().find(p => p.id === id) ?? null
}

export function getPatientByRut(rut) {
  const normalized = rut.replace(/\s/g, '').toLowerCase()
  return load().find(p => p.rut.replace(/\s/g, '').toLowerCase() === normalized) ?? null
}

export function savePatient(patient) {
  const patients = load()
  const now = new Date().toISOString()
  const newPatient = {
    id: String(Date.now()),
    rut: '',
    name: '',
    birthDate: '',
    ageMonths: 0,
    phone: '',
    guardianName: '',
    diagnosis: 'tdl',
    levelId: 'N1',
    stars: 0,
    sessionsCompleted: 0,
    sessionHistory: [],
    updatedAt: now,
    ...patient,
    createdAt: patient.createdAt || now,
  }
  patients.push(newPatient)
  persist(patients)
  return newPatient
}

export function updatePatient(id, changes) {
  const patients = load()
  const idx = patients.findIndex(p => p.id === id)
  if (idx === -1) return null
  patients[idx] = { ...patients[idx], ...changes, updatedAt: new Date().toISOString() }
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

export function searchPatients(query) {
  if (!query || !query.trim()) return load()
  const q = query.trim().toLowerCase()
  return load().filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.rut.toLowerCase().includes(q) ||
    p.guardianName.toLowerCase().includes(q)
  )
}
