/**
 * LandingScreen.jsx — v2
 * Pantalla inicial de AuraPlay
 *
 * Flujos:
 *   Sin cuenta → RegisterScreen (solo primera vez)
 *   Selector   → Terapeuta | Familia
 *   Terapeuta  → TherapistLoginForm (username + password)
 *   Familia    → FamilyLoginForm (RUT + PIN)
 *               → si mustChangePin → ChangePinForm
 */

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LandingScreen({ onAuth }) {
  const { therapistExists, registerTherapist, loginTherapist, loginFamily } = useAuth()
  const [view, setView]   = useState('selector')
  const [familyState, setFamilyState] = useState(null) // { patient, mustChangePin }

  // Primera vez: sin cuenta de terapeuta
  if (!therapistExists() || view === 'register') {
    return <RegisterScreen onDone={() => { onAuth(); }} registerTherapist={registerTherapist} />
  }

  if (view === 'therapist') {
    return (
      <TherapistLoginForm
        onBack={() => setView('selector')}
        onDone={onAuth}
        loginTherapist={loginTherapist}
      />
    )
  }

  if (view === 'family') {
    if (familyState?.mustChangePin) {
      return (
        <ChangePinOnFirstLogin
          patient={familyState.patient}
          onDone={onAuth}
        />
      )
    }
    return (
      <FamilyLoginForm
        onBack={() => setView('selector')}
        loginFamily={loginFamily}
        onDone={(state) => {
          if (state.mustChangePin) setFamilyState(state)
          else onAuth()
        }}
      />
    )
  }

  return (
    <Selector
      onTherapist={() => setView('therapist')}
      onFamily={() => setView('family')}
    />
  )
}

// ─── Selector ─────────────────────────────────────────────────────────────────

function Selector({ onTherapist, onFamily }) {
  return (
    <div style={S.root}>
      <div style={S.card}>
        <div style={S.logoBox}>
          <span style={{ fontSize: 52, lineHeight: 1, marginBottom: 8, display: 'block' }}>🎯</span>
          <h1 style={S.appName}>AuraPlay</h1>
          <p style={S.appTag}>Plataforma clínica fonoaudiológica</p>
        </div>

        <div style={S.divider} />

        <p style={S.selectLabel}>¿Cómo deseas ingresar?</p>

        <button style={S.roleCard} onClick={onTherapist}>
          <div style={{ ...S.roleIcon, background: '#e6f7f0' }}>🔒</div>
          <div style={{ flex: 1 }}>
            <p style={S.roleTitle}>Terapeuta</p>
            <p style={S.roleDesc}>Panel clínico y gestión de pacientes</p>
          </div>
          <span style={S.arrow}>›</span>
        </button>

        <button style={{ ...S.roleCard, borderColor: '#f0e0a8' }} onClick={onFamily}>
          <div style={{ ...S.roleIcon, background: '#fff8e6' }}>👨‍👩‍👧</div>
          <div style={{ flex: 1 }}>
            <p style={S.roleTitle}>Familia</p>
            <p style={S.roleDesc}>Actividades en casa para practicar juntos</p>
          </div>
          <span style={S.arrow}>›</span>
        </button>

        <p style={S.legal}>AuraPlay · Fonoaudiología infantil</p>
      </div>
    </div>
  )
}

// ─── Registro (primera vez) ───────────────────────────────────────────────────

function RegisterScreen({ onDone, registerTherapist }) {
  const [f, setF]   = useState({ name: '', username: '', password: '', confirm: '' })
  const [show, setShow] = useState({ pw: false, cf: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(k, v) { setF(p => ({ ...p, [k]: v })); setError('') }

  function validate() {
    if (!f.name.trim())     return 'El nombre es obligatorio'
    if (!f.username.trim()) return 'El usuario es obligatorio'
    if (/\s/.test(f.username)) return 'El usuario no puede tener espacios'
    if (f.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
    if (f.password !== f.confirm) return 'Las contraseñas no coinciden'
    return null
  }

  function handleSubmit() {
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    setTimeout(() => {
      registerTherapist(f.name, f.username, f.password)
      setLoading(false)
      onDone()
    }, 300)
  }

  return (
    <div style={S.root}>
      <div style={S.card}>
        <div style={S.logoBox}>
          <span style={{ fontSize: 40, marginBottom: 6, display: 'block' }}>🎯</span>
          <h1 style={{ ...S.appName, fontSize: 22 }}>Bienvenido/a a AuraPlay</h1>
          <p style={S.appTag}>Crea tu cuenta de terapeuta para comenzar</p>
        </div>

        <div style={S.divider} />

        <div style={S.fields}>
          <Field label="Nombre profesional" placeholder="Ej: María González"
            value={f.name} onChange={v => set('name', v)} autoFocus />
          <Field label="Usuario" placeholder="Sin espacios (ej: mgonzalez)"
            value={f.username} onChange={v => set('username', v.toLowerCase().replace(/\s/g, ''))} />
          <PwField label="Contraseña" placeholder="Mínimo 6 caracteres"
            value={f.password} show={show.pw}
            onToggle={() => setShow(p => ({ ...p, pw: !p.pw }))}
            onChange={v => set('password', v)} />
          <PwField label="Confirmar contraseña" placeholder="Repite la contraseña"
            value={f.confirm} show={show.cf}
            onToggle={() => setShow(p => ({ ...p, cf: !p.cf }))}
            onChange={v => set('confirm', v)} />
        </div>

        {error && <p style={S.error}>{error}</p>}

        <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta y entrar →'}
        </button>

        <p style={S.legal}>Los datos se guardan localmente en este dispositivo.</p>
      </div>
    </div>
  )
}

// ─── Login terapeuta ──────────────────────────────────────────────────────────

function TherapistLoginForm({ onBack, onDone, loginTherapist }) {
  const name = localStorage.getItem('auraplay_therapist_name') ||
    (() => { try { return JSON.parse(localStorage.getItem('auraplay_therapist_creds'))?.name || '' } catch { return '' } })()

  const [f, setF]       = useState({ username: '', password: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(k, v) { setF(p => ({ ...p, [k]: v })); setError('') }

  function handleSubmit() {
    if (!f.username || !f.password) { setError('Completa todos los campos'); return }
    setLoading(true)
    setTimeout(() => {
      const r = loginTherapist(f.username, f.password)
      setLoading(false)
      if (r.ok) onDone()
      else setError(r.error)
    }, 300)
  }

  return (
    <div style={S.root}>
      <div style={S.card}>
        <button onClick={onBack} style={S.backBtn}>← Volver</button>
        <div style={S.loginHeader}>
          <span style={{ fontSize: 36 }}>🔒</span>
          <h2 style={S.loginTitle}>Acceso Terapeuta</h2>
          {name && <p style={S.loginSub}>Bienvenido/a, {name}</p>}
        </div>
        <div style={S.fields}>
          <Field label="Usuario" placeholder="Tu nombre de usuario"
            value={f.username} onChange={v => set('username', v)} autoFocus
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          <PwField label="Contraseña" placeholder="Tu contraseña"
            value={f.password} show={show}
            onToggle={() => setShow(p => !p)}
            onChange={v => set('password', v)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>
        {error && <p style={S.error}>{error}</p>}
        <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </div>
    </div>
  )
}

// ─── Login familia ────────────────────────────────────────────────────────────

function FamilyLoginForm({ onBack, loginFamily, onDone }) {
  const [rut, setRut]     = useState('')
  const [pin, setPin]     = useState('')
  const [show, setShow]   = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleRut(v) {
    // Formateo básico RUT chileno
    const clean = v.replace(/[^0-9kK]/g, '').toUpperCase()
    if (clean.length === 0) { setRut(''); return }
    const body = clean.slice(0, -1)
    const dv   = clean.slice(-1)
    const dots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    setRut(clean.length === 1 ? clean : `${dots}-${dv}`)
    setError('')
  }

  function handleSubmit() {
    if (!rut.trim() || !pin.trim()) { setError('Ingresa RUT y PIN'); return }
    setLoading(true)
    setTimeout(() => {
      const r = loginFamily(rut, pin)
      setLoading(false)
      if (r.ok) onDone({ patient: r.patient, mustChangePin: r.mustChangePin })
      else setError(r.error)
    }, 300)
  }

  return (
    <div style={S.root}>
      <div style={S.card}>
        <button onClick={onBack} style={S.backBtn}>← Volver</button>
        <div style={S.loginHeader}>
          <span style={{ fontSize: 36 }}>👨‍👩‍👧</span>
          <h2 style={S.loginTitle}>Modo Familia</h2>
          <p style={S.loginSub}>Ingresa el RUT del paciente y tu PIN</p>
        </div>

        <div style={S.fields}>
          {/* RUT */}
          <div style={S.fieldWrap}>
            <label style={S.fieldLabel}>RUT del paciente</label>
            <input
              style={S.fieldInput}
              type="text"
              placeholder="12.345.678-9"
              value={rut}
              onChange={e => handleRut(e.target.value)}
              autoComplete="off"
              inputMode="numeric"
            />
          </div>

          {/* PIN */}
          <div style={S.fieldWrap}>
            <label style={S.fieldLabel}>PIN de acceso</label>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...S.fieldInput, paddingRight: 48 }}
                type={show ? 'text' : 'password'}
                placeholder="PIN asignado por el/la terapeuta"
                value={pin}
                onChange={e => { setPin(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                autoComplete="off"
              />
              <button style={S.eyeBtn} onClick={() => setShow(p => !p)} type="button">
                {show ? '🙈' : '👁️'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: '#aaa', marginTop: 4, lineHeight: 1.4 }}>
              Tu primer PIN fue asignado por el/la terapeuta. Al ingresar podrás cambiarlo.
            </p>
          </div>
        </div>

        {error && <p style={S.error}>{error}</p>}

        <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Verificando...' : 'Ingresar'}
        </button>
      </div>
    </div>
  )
}

// ─── Cambio de PIN obligatorio (primer ingreso) ───────────────────────────────

function ChangePinOnFirstLogin({ patient, onDone }) {
  const { changeFamilyPin } = useAuth()
  const [current, setCurrent] = useState('')
  const [newPin, setNewPin]   = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow]       = useState({ cur: false, new: false, cf: false })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit() {
    if (!current || !newPin || !confirm) { setError('Completa todos los campos'); return }
    if (newPin.length < 4) { setError('El PIN debe tener al menos 4 caracteres'); return }
    if (newPin !== confirm) { setError('Los PINs no coinciden'); return }

    setLoading(true)
    setTimeout(() => {
      const r = changeFamilyPin(patient.id, current, newPin)
      setLoading(false)
      if (r.ok) onDone()
      else setError(r.error)
    }, 300)
  }

  return (
    <div style={S.root}>
      <div style={S.card}>
        <div style={S.loginHeader}>
          <span style={{ fontSize: 36 }}>🔑</span>
          <h2 style={S.loginTitle}>Crea tu PIN</h2>
          <p style={S.loginSub}>
            Es tu primer ingreso. Cambia el PIN temporal por uno que solo tú conozcas.
          </p>
        </div>

        <div style={S.fields}>
          <PwField label="PIN temporal (el que te dio el/la terapeuta)"
            placeholder="PIN temporal"
            value={current} show={show.cur}
            onToggle={() => setShow(p => ({ ...p, cur: !p.cur }))}
            onChange={v => { setCurrent(v); setError('') }} />
          <PwField label="Nuevo PIN (mínimo 4 caracteres)"
            placeholder="Tu nuevo PIN"
            value={newPin} show={show.new}
            onToggle={() => setShow(p => ({ ...p, new: !p.new }))}
            onChange={v => { setNewPin(v); setError('') }} />
          <PwField label="Confirmar nuevo PIN"
            placeholder="Repite tu nuevo PIN"
            value={confirm} show={show.cf}
            onToggle={() => setShow(p => ({ ...p, cf: !p.cf }))}
            onChange={v => { setConfirm(v); setError('') }} />
        </div>

        {error && <p style={S.error}>{error}</p>}

        <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar PIN y entrar →'}
        </button>

        <div style={S.infoBox}>
          <p style={S.infoText}>
            Si olvidas tu PIN, el/la terapeuta puede resetearlo desde el panel.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Field({ label, placeholder, value, onChange, autoFocus, onKeyDown }) {
  return (
    <div style={S.fieldWrap}>
      <label style={S.fieldLabel}>{label}</label>
      <input style={S.fieldInput} type="text"
        placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus={autoFocus} onKeyDown={onKeyDown}
        autoComplete="off" autoCapitalize="none" />
    </div>
  )
}

function PwField({ label, placeholder, value, show, onToggle, onChange, onKeyDown }) {
  return (
    <div style={S.fieldWrap}>
      <label style={S.fieldLabel}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input style={{ ...S.fieldInput, paddingRight: 48 }}
          type={show ? 'text' : 'password'}
          placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown} autoComplete="new-password" />
        <button style={S.eyeBtn} onClick={onToggle} type="button">
          {show ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const S = {
  root: {
    minHeight: '100dvh',
    background: 'linear-gradient(160deg, #f0faf6 0%, #fafafa 50%, #f5f0fa 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px 20px', fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  card: {
    background: '#fff', borderRadius: 24, padding: '32px 28px',
    width: '100%', maxWidth: 380,
    boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
    display: 'flex', flexDirection: 'column', gap: 0,
  },
  logoBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 20 },
  appName: { fontSize: 28, fontWeight: 900, color: '#1a2a1a', margin: '0 0 4px', letterSpacing: '-1px' },
  appTag:  { fontSize: 13, color: '#888', margin: 0 },
  divider: { height: 1, background: '#f0f0f0', margin: '0 0 20px' },
  selectLabel: { fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px', textAlign: 'center' },
  roleCard: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '16px', borderRadius: 16, border: '2px solid #e8f5f0',
    background: '#fff', cursor: 'pointer', textAlign: 'left',
    marginBottom: 10, width: '100%', transition: 'all 0.15s',
  },
  roleIcon: { width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 },
  roleTitle: { fontSize: 16, fontWeight: 700, color: '#1a2a1a', margin: '0 0 2px' },
  roleDesc:  { fontSize: 12, color: '#888', margin: 0 },
  arrow: { fontSize: 20, color: '#ccc' },
  loginHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 20, gap: 6 },
  loginTitle: { fontSize: 20, fontWeight: 700, color: '#1a2a1a', margin: 0, textAlign: 'center' },
  loginSub:   { fontSize: 13, color: '#888', margin: 0, textAlign: 'center', lineHeight: 1.5 },
  fields: { display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 5 },
  fieldLabel: { fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: '0.3px' },
  fieldInput: {
    padding: '12px 14px', borderRadius: 12, border: '2px solid #e8e8e8',
    fontSize: 15, color: '#1a2a1a', outline: 'none', width: '100%',
    boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s',
  },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 0 },
  btn: {
    width: '100%', padding: '15px',
    background: 'linear-gradient(135deg, #4aab8a 0%, #3d9478 100%)',
    color: '#fff', border: 'none', borderRadius: 14,
    fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.2px', marginTop: 4,
  },
  backBtn: { background: 'none', border: 'none', fontSize: 14, color: '#888', cursor: 'pointer', padding: '0 0 16px', fontWeight: 600, alignSelf: 'flex-start' },
  error: { color: '#e07a5f', fontSize: 13, fontWeight: 600, margin: '0 0 8px' },
  legal: { fontSize: 11, color: '#bbb', textAlign: 'center', margin: '16px 0 0' },
  infoBox: { background: '#f0faf6', borderRadius: 12, padding: 14, marginTop: 12, border: '1.5px solid #c8e8dc' },
  infoText: { fontSize: 12, color: '#2d7a62', margin: 0, lineHeight: 1.5, fontWeight: 500 },
}
