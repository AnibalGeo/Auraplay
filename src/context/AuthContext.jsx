/**
 * AuthContext.jsx — v2
 * Autenticación persistente local-first — AuraPlay
 *
 * Terapeuta : username + password (hash btoa, migreable a bcrypt)
 * Familia   : RUT del paciente + PIN asignado por terapeuta
 *
 * Sesión en localStorage → persiste entre cierres de app.
 * Verificación activa de familyEnabled en cada render.
 *
 * MIGRACIÓN FUTURA — puntos marcados con 🔐 MIGRATE:
 *   hashPassword / verifyPassword → bcrypt / Argon2
 *   localStorage session → JWT con Supabase / Firebase
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { getAllPatients, updatePatient as persistPatient } from '../data/patients'

const CREDS_KEY   = 'auraplay_therapist_creds'
const SESSION_KEY = 'auraplay_session'

// ─── Hash ─────────────────────────────────────────────────────────────────────
// 🔐 MIGRATE → bcrypt

function hashPassword(plain) {
  return btoa(encodeURIComponent(plain + '_aura_v2_2025'))
}
function verifyPassword(plain, hash) {
  return hashPassword(plain) === hash
}

// ─── Session storage ──────────────────────────────────────────────────────────

function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null }
}
function saveSession(s) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)) } catch {}
}
function clearSession() {
  try { localStorage.removeItem(SESSION_KEY) } catch {}
}

// ─── Therapist creds ──────────────────────────────────────────────────────────

export function getTherapistCreds() {
  try { return JSON.parse(localStorage.getItem(CREDS_KEY)) } catch { return null }
}
export function therapistExists() { return getTherapistCreds() !== null }

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

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession)

  // Verificación activa: si familyEnabled cambia a false, cerrar sesión familia
  useEffect(() => {
    if (session?.role === 'family' && session?.patientId) {
      const p = getAllPatients().find(p => p.id === session.patientId)
      if (!p || !p.familyEnabled) {
        clearSession()
        setSession(null)
      }
    }
  }, [session])

  const role            = session?.role ?? null
  const isTherapist     = role === 'therapist'
  const isFamily        = role === 'family'
  const isLoggedIn      = role !== null
  const familyPatientId = session?.patientId ?? null

  // ── Registro terapeuta ─────────────────────────────────────────────────────

  function registerTherapist(name, username, password) {
    const creds = {
      name:         name.trim(),
      username:     username.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      createdAt:    new Date().toISOString(),
    }
    localStorage.setItem(CREDS_KEY, JSON.stringify(creds))
    const s = { role: 'therapist', loginAt: new Date().toISOString() }
    saveSession(s)
    setSession(s)
    return { ok: true }
  }

  // ── Login terapeuta ────────────────────────────────────────────────────────

  function loginTherapist(username, password) {
    const creds = getTherapistCreds()
    if (!creds) return { ok: false, error: 'No hay cuenta registrada' }
    if (creds.username !== username.trim().toLowerCase())
      return { ok: false, error: 'Usuario o contraseña incorrectos' }
    if (!verifyPassword(password, creds.passwordHash))
      return { ok: false, error: 'Usuario o contraseña incorrectos' }
    const s = { role: 'therapist', loginAt: new Date().toISOString() }
    saveSession(s)
    setSession(s)
    return { ok: true }
  }

  // ── Login familia ─────────────────────────────────────────────────────────

  function loginFamily(rut, pin) {
    const patient = findPatientByRut(rut)
    if (!patient)               return { ok: false, error: 'RUT no encontrado o acceso no habilitado' }
    if (!patient.familyEnabled) return { ok: false, error: 'Acceso familiar desactivado para este paciente' }
    if (!patient.familyPin)     return { ok: false, error: 'PIN no configurado. Contacta al/la terapeuta.' }
    // 🔐 MIGRATE → bcrypt.compare
    if (patient.familyPin !== hashPassword(pin))
      return { ok: false, error: 'PIN incorrecto' }

    persistPatient(patient.id, { familyLastLogin: new Date().toISOString() })
    const s = { role: 'family', patientId: patient.id, loginAt: new Date().toISOString() }
    saveSession(s)
    setSession(s)
    return { ok: true, patient, mustChangePin: patient.familyFirstLogin === true }
  }

  // ── Cambiar PIN familia ────────────────────────────────────────────────────

  function changeFamilyPin(patientId, currentPin, newPin) {
    const patient = getAllPatients().find(p => p.id === patientId)
    if (!patient) return { ok: false, error: 'Paciente no encontrado' }
    // 🔐 MIGRATE → bcrypt.compare
    if (patient.familyPin !== hashPassword(currentPin))
      return { ok: false, error: 'PIN actual incorrecto' }
    if (newPin.length < 4)
      return { ok: false, error: 'El PIN debe tener al menos 4 caracteres' }
    persistPatient(patientId, {
      familyPin:        hashPassword(newPin),
      familyFirstLogin: false,
    })
    return { ok: true }
  }

  // ── Logout ─────────────────────────────────────────────────────────────────

  function logout() {
    clearSession()
    setSession(null)
  }

  // ── Gestión acceso familiar (solo terapeuta) ───────────────────────────────

  function enableFamilyAccess(patientId) {
    const pin = generateDefaultPin()
    persistPatient(patientId, {
      familyEnabled:    true,
      familyPin:        hashPassword(pin),
      familyFirstLogin: true,
      familyLastLogin:  null,
    })
    return { ok: true, pin } // PIN en texto plano — mostrar UNA vez
  }

  function disableFamilyAccess(patientId) {
    persistPatient(patientId, { familyEnabled: false })
    if (session?.role === 'family' && session?.patientId === patientId) {
      clearSession()
      setSession(null)
    }
    return { ok: true }
  }

  function resetFamilyPin(patientId) {
    const pin = generateDefaultPin()
    persistPatient(patientId, {
      familyPin:        hashPassword(pin),
      familyFirstLogin: true,
    })
    return { ok: true, pin }
  }

  return (
    <AuthContext.Provider value={{
      session, role, isTherapist, isFamily, isLoggedIn, familyPatientId,
      registerTherapist, loginTherapist, loginFamily, changeFamilyPin, logout,
      enableFamilyAccess, disableFamilyAccess, resetFamilyPin, therapistExists,
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
