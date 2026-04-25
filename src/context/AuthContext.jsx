/**
 * AuthContext.jsx — v3
 * Autenticación beta profesional — AuraPlay
 *
 * Mejoras v3:
 *   - SHA-256 via Web Crypto API (async, nativo del navegador)
 *   - Migración automática btoa → SHA-256 al primer login exitoso
 *   - Recuperación de contraseña por pregunta/respuesta secreta
 *   - Bloqueo de 5 intentos fallidos por 30 segundos (sessionStorage)
 *   - "Mantener sesión iniciada" → localStorage vs sessionStorage
 *   - Registro de último acceso del terapeuta
 *
 * MIGRACIÓN FUTURA (🔐 MIGRATE):
 *   SHA-256 → Argon2 / bcrypt en backend
 *   localStorage/sessionStorage → JWT + Supabase / Firebase
 *
 * NOTA SOBRE ASYNC:
 *   hashPassword y verifyPassword son async (Web Crypto es async).
 *   Los métodos de login retornan Promises.
 *   En componentes: usar .then() o async/await.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getAllPatients, updatePatient as persistPatient } from '../data/patients'

// ─── Storage keys ─────────────────────────────────────────────────────────────

const CREDS_KEY    = 'auraplay_therapist_creds'
const SESSION_KEY  = 'auraplay_session'
const LOCKOUT_KEY  = 'auraplay_lockout' // sessionStorage — se resetea al cerrar

// ─── Lockout helpers (5 intentos → 30s bloqueo) ───────────────────────────────

const LOCKOUT_MAX_ATTEMPTS = 5
const LOCKOUT_DURATION_MS  = 30_000

function getLockout() {
  try {
    const raw = sessionStorage.getItem(LOCKOUT_KEY)
    return raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: null }
  } catch { return { attempts: 0, lockedUntil: null } }
}

function setLockout(data) {
  try { sessionStorage.setItem(LOCKOUT_KEY, JSON.stringify(data)) } catch {}
}

function clearLockout() {
  try { sessionStorage.removeItem(LOCKOUT_KEY) } catch {}
}

function isLocked() {
  const { lockedUntil } = getLockout()
  if (!lockedUntil) return false
  if (Date.now() < lockedUntil) return true
  clearLockout()
  return false
}

function lockoutSecondsLeft() {
  const { lockedUntil } = getLockout()
  if (!lockedUntil) return 0
  return Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
}

function recordFailedAttempt() {
  const lockout = getLockout()
  const attempts = lockout.attempts + 1
  if (attempts >= LOCKOUT_MAX_ATTEMPTS) {
    setLockout({ attempts, lockedUntil: Date.now() + LOCKOUT_DURATION_MS })
  } else {
    setLockout({ attempts, lockedUntil: null })
  }
  return attempts
}

// ─── SHA-256 hash (Web Crypto API) ───────────────────────────────────────────
// 🔐 MIGRATE → Argon2 / bcrypt en backend (SHA-256 no es password hashing real)

const SALT = 'auraplay_v3_2025'

async function hashPassword(plain) {
  const msg     = plain + SALT
  const encoded = new TextEncoder().encode(msg)
  const buf     = await crypto.subtle.digest('SHA-256', encoded)
  const arr     = Array.from(new Uint8Array(buf))
  return arr.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function verifyPassword(plain, storedHash) {
  // Detectar hash legacy btoa
  if (storedHash && storedHash.length < 60 && !storedHash.match(/^[0-9a-f]{64}$/)) {
    // Es hash btoa legacy — verificar con método antiguo
    const legacyHash = btoa(encodeURIComponent(plain + '_aura_v2_2025'))
    return legacyHash === storedHash
  }
  const newHash = await hashPassword(plain)
  return newHash === storedHash
}

function isLegacyHash(hash) {
  return hash && hash.length < 60 && !hash.match(/^[0-9a-f]{64}$/)
}

// ─── Familia: hash simple (sin async, para PIN) ───────────────────────────────
// PIN de familia no necesita Web Crypto — sigue con btoa por simplicidad en beta
// 🔐 MIGRATE → bcrypt en backend

function hashPin(pin) {
  return btoa(encodeURIComponent(pin + '_aura_v2_2025'))
}
function verifyPin(pin, hash) {
  return hashPin(pin) === hash
}

// ─── Session helpers ──────────────────────────────────────────────────────────

function loadSession() {
  try {
    return (
      JSON.parse(localStorage.getItem(SESSION_KEY)) ||
      JSON.parse(sessionStorage.getItem(SESSION_KEY))
    )
  } catch { return null }
}

function saveSession(session, persistent) {
  const str = JSON.stringify(session)
  if (persistent) {
    localStorage.setItem(SESSION_KEY, str)
    sessionStorage.removeItem(SESSION_KEY)
  } else {
    sessionStorage.setItem(SESSION_KEY, str)
    localStorage.removeItem(SESSION_KEY)
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

// ─── Therapist creds ──────────────────────────────────────────────────────────

export function getTherapistCreds() {
  try { return JSON.parse(localStorage.getItem(CREDS_KEY)) }
  catch { return null }
}

export function therapistExists() { return getTherapistCreds() !== null }

function saveTherapistCreds(creds) {
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds))
}

// ─── Helpers públicos ─────────────────────────────────────────────────────────

export function generateDefaultPin() {
  return `Aura${Math.floor(1000 + Math.random() * 9000)}`
}

export function normalizeRut(rut) {
  return rut.replace(/[\s.]/g, '').toLowerCase()
}

export function findPatientByRut(rut) {
  const norm = normalizeRut(rut)
  return getAllPatients().find(p =>
    p.familyEnabled && p.rut && normalizeRut(p.rut) === norm
  ) ?? null
}

// ─── Formato tiempo ───────────────────────────────────────────────────────────

export function timeAgo(iso) {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2)   return 'hace un momento'
  if (mins < 60)  return `hace ${mins} minutos`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `hace ${hrs} hora${hrs > 1 ? 's' : ''}`
  const days = Math.floor(hrs / 24)
  if (days < 7)   return `hace ${days} día${days > 1 ? 's' : ''}`
  return `hace ${Math.floor(days / 7)} semana${Math.floor(days/7) > 1 ? 's' : ''}`
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession)
  const [lockoutLeft, setLockoutLeft] = useState(0)

  // Verificación activa familyEnabled
  useEffect(() => {
    if (session?.role === 'family' && session?.patientId) {
      const p = getAllPatients().find(p => p.id === session.patientId)
      if (!p || !p.familyEnabled) {
        clearSession()
        setSession(null)
      }
    }
  }, [session])

  // Countdown del lockout
  useEffect(() => {
    if (!lockoutLeft) return
    const t = setInterval(() => {
      const left = lockoutSecondsLeft()
      setLockoutLeft(left)
      if (left <= 0) clearInterval(t)
    }, 1000)
    return () => clearInterval(t)
  }, [lockoutLeft])

  const role            = session?.role ?? null
  const isTherapist     = role === 'therapist'
  const isFamily        = role === 'family'
  const isLoggedIn      = role !== null
  const familyPatientId = session?.patientId ?? null

  // ── Registro terapeuta ─────────────────────────────────────────────────────

  async function registerTherapist(name, username, password, securityQuestion, securityAnswer) {
    const pwHash      = await hashPassword(password)
    const answerHash  = await hashPassword(securityAnswer.trim().toLowerCase())
    const now         = new Date().toISOString()

    const creds = {
      name:             name.trim(),
      username:         username.trim().toLowerCase(),
      passwordHash:     pwHash,
      securityQuestion: securityQuestion.trim(),
      securityAnswerHash: answerHash,
      createdAt:        now,
      lastLoginAt:      now,
      hashVersion:      'sha256', // marcar versión para migración futura
    }
    saveTherapistCreds(creds)
    const s = { role: 'therapist', loginAt: now }
    saveSession(s, true) // registro → sesión persistente por defecto
    setSession(s)
    return { ok: true }
  }

  // ── Login terapeuta ────────────────────────────────────────────────────────

  async function loginTherapist(username, password, keepSession = false) {
    // Verificar lockout
    if (isLocked()) {
      const left = lockoutSecondsLeft()
      return { ok: false, error: `Demasiados intentos. Intenta en ${left} segundos.`, locked: true }
    }

    const creds = getTherapistCreds()
    if (!creds) return { ok: false, error: 'No hay cuenta registrada' }
    if (creds.username !== username.trim().toLowerCase())  {
      recordFailedAttempt()
      setLockoutLeft(lockoutSecondsLeft())
      return { ok: false, error: 'Usuario o contraseña incorrectos' }
    }

    const valid = await verifyPassword(password, creds.passwordHash)
    if (!valid) {
      const attempts = recordFailedAttempt()
      setLockoutLeft(lockoutSecondsLeft())
      const remaining = LOCKOUT_MAX_ATTEMPTS - attempts
      if (remaining <= 0) {
        return { ok: false, error: `Demasiados intentos. Intenta en ${LOCKOUT_DURATION_MS / 1000} segundos.`, locked: true }
      }
      return {
        ok: false,
        error: `Contraseña incorrecta. ${remaining} intento${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}.`
      }
    }

    // Login exitoso — resetear lockout
    clearLockout()

    // Migración automática btoa → SHA-256
    if (isLegacyHash(creds.passwordHash)) {
      const newHash = await hashPassword(password)
      saveTherapistCreds({
        ...creds,
        passwordHash: newHash,
        hashVersion: 'sha256',
      })
    }

    // Actualizar último acceso
    saveTherapistCreds({ ...creds, lastLoginAt: new Date().toISOString() })

    const s = { role: 'therapist', loginAt: new Date().toISOString() }
    saveSession(s, keepSession)
    setSession(s)
    return { ok: true }
  }

  // ── Recuperación de contraseña ─────────────────────────────────────────────

  function getSecurityQuestion(username) {
    const creds = getTherapistCreds()
    if (!creds || creds.username !== username.trim().toLowerCase()) {
      return { ok: false, error: 'Usuario no encontrado' }
    }
    if (!creds.securityQuestion) {
      return { ok: false, error: 'Esta cuenta no tiene pregunta de seguridad configurada' }
    }
    return { ok: true, question: creds.securityQuestion }
  }

  async function verifySecurityAnswer(username, answer) {
    const creds = getTherapistCreds()
    if (!creds || creds.username !== username.trim().toLowerCase()) {
      return { ok: false, error: 'Usuario no encontrado' }
    }
    const answerHash = await hashPassword(answer.trim().toLowerCase())
    if (answerHash !== creds.securityAnswerHash) {
      return { ok: false, error: 'Respuesta incorrecta' }
    }
    return { ok: true }
  }

  async function resetPasswordWithAnswer(username, answer, newPassword) {
    const verify = await verifySecurityAnswer(username, answer)
    if (!verify.ok) return verify

    const creds   = getTherapistCreds()
    const pwHash  = await hashPassword(newPassword)
    saveTherapistCreds({
      ...creds,
      passwordHash: pwHash,
      hashVersion: 'sha256',
    })
    return { ok: true }
  }

  // ── Login familia ─────────────────────────────────────────────────────────

  function loginFamily(rut, pin, keepSession = false) {
    const patient = findPatientByRut(rut)
    if (!patient)               return { ok: false, error: 'RUT no encontrado o acceso no habilitado' }
    if (!patient.familyEnabled) return { ok: false, error: 'Acceso familiar desactivado' }
    if (!patient.familyPin)     return { ok: false, error: 'PIN no configurado. Contacta al/la terapeuta.' }
    if (!verifyPin(pin, patient.familyPin))
      return { ok: false, error: 'PIN incorrecto' }

    persistPatient(patient.id, { familyLastLogin: new Date().toISOString() })
    const s = { role: 'family', patientId: patient.id, loginAt: new Date().toISOString() }
    saveSession(s, keepSession)
    setSession(s)
    return { ok: true, patient, mustChangePin: patient.familyFirstLogin === true }
  }

  // ── Cambiar PIN familia ───────────────────────────────────────────────────

  function changeFamilyPin(patientId, currentPin, newPin) {
    const patient = getAllPatients().find(p => p.id === patientId)
    if (!patient)                    return { ok: false, error: 'Paciente no encontrado' }
    if (!verifyPin(currentPin, patient.familyPin))
      return { ok: false, error: 'PIN actual incorrecto' }
    if (newPin.length < 4)           return { ok: false, error: 'El PIN debe tener al menos 4 caracteres' }
    persistPatient(patientId, { familyPin: hashPin(newPin), familyFirstLogin: false })
    return { ok: true }
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  function logout() {
    clearSession()
    setSession(null)
  }

  // ── Gestión acceso familiar ───────────────────────────────────────────────

  function enableFamilyAccess(patientId) {
    const pin = generateDefaultPin()
    persistPatient(patientId, {
      familyEnabled: true, familyPin: hashPin(pin),
      familyFirstLogin: true, familyLastLogin: null,
    })
    return { ok: true, pin }
  }

  function disableFamilyAccess(patientId) {
    persistPatient(patientId, { familyEnabled: false })
    if (session?.role === 'family' && session?.patientId === patientId) {
      clearSession(); setSession(null)
    }
    return { ok: true }
  }

  function resetFamilyPin(patientId) {
    const pin = generateDefaultPin()
    persistPatient(patientId, { familyPin: hashPin(pin), familyFirstLogin: true })
    return { ok: true, pin }
  }

  // ── Datos sesión terapeuta ────────────────────────────────────────────────

  const therapistName    = getTherapistCreds()?.name || ''
  const lastLoginAt      = getTherapistCreds()?.lastLoginAt || null
  const lastLoginDisplay = timeAgo(lastLoginAt)
  const lockoutSeconds   = lockoutLeft

  return (
    <AuthContext.Provider value={{
      session, role, isTherapist, isFamily, isLoggedIn, familyPatientId,
      therapistName, lastLoginDisplay, lockoutSeconds,
      registerTherapist, loginTherapist, loginFamily, changeFamilyPin, logout,
      enableFamilyAccess, disableFamilyAccess, resetFamilyPin,
      getSecurityQuestion, verifySecurityAnswer, resetPasswordWithAnswer,
      therapistExists,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
