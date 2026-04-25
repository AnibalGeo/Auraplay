/**
 * LandingScreen.jsx — v3
 * Login premium — AuraPlay Beta
 *
 * Incluye:
 *   - Registro con pregunta de seguridad
 *   - Login terapeuta: show/hide password, loading, keepSession, bloqueo
 *   - Login familia: RUT + PIN, cambio obligatorio primer ingreso
 *   - Recuperación de contraseña por pregunta/respuesta
 *   - Último acceso terapeuta
 *   - Mensajes de error claros
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

// ─── Preguntas de seguridad predefinidas ──────────────────────────────────────

const SECURITY_QUESTIONS = [
  '¿Cuál es el nombre de tu primera mascota?',
  '¿En qué ciudad naciste?',
  '¿Cuál es el segundo nombre de tu madre?',
  '¿Cómo se llamaba tu colegio primario?',
  '¿Cuál es tu comida favorita de la infancia?',
  'Código personal (puedes inventar uno que recuerdes)',
]

// ─── Export principal ─────────────────────────────────────────────────────────

export default function LandingScreen({ onAuth }) {
  const { therapistExists } = useAuth()
  const [view, setView]         = useState('selector')
  const [familyState, setFamilyState] = useState(null)

  if (!therapistExists()) {
    return <RegisterScreen onDone={onAuth} />
  }

  if (view === 'therapist') {
    return (
      <TherapistLoginForm
        onBack={() => setView('selector')}
        onDone={onAuth}
        onForgot={() => setView('forgot')}
      />
    )
  }

  if (view === 'forgot') {
    return (
      <ForgotPasswordFlow
        onBack={() => setView('therapist')}
        onDone={() => setView('therapist')}
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
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={S.roleTitle}>Terapeuta</p>
            <p style={S.roleDesc}>Panel clínico y gestión de pacientes</p>
          </div>
          <span style={S.arrow}>›</span>
        </button>

        <button style={{ ...S.roleCard, borderColor: '#f0e0a8' }} onClick={onFamily}>
          <div style={{ ...S.roleIcon, background: '#fff8e6' }}>👨‍👩‍👧</div>
          <div style={{ flex: 1, textAlign: 'left' }}>
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

// ─── Registro ─────────────────────────────────────────────────────────────────

function RegisterScreen({ onDone }) {
  const { registerTherapist } = useAuth()
  const [step, setStep] = useState(1) // 1: datos básicos, 2: pregunta seguridad
  const [f, setF] = useState({
    name: '', username: '', password: '', confirm: '',
    securityQuestion: SECURITY_QUESTIONS[0], securityAnswer: '',
  })
  const [show, setShow]   = useState({ pw: false, cf: false, ans: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(k, v) { setF(p => ({ ...p, [k]: v })); setError('') }

  function validateStep1() {
    if (!f.name.trim())         return 'El nombre es obligatorio'
    if (!f.username.trim())     return 'El usuario es obligatorio'
    if (/\s/.test(f.username))  return 'El usuario no puede tener espacios'
    if (f.password.length < 6)  return 'La contraseña debe tener al menos 6 caracteres'
    if (f.password !== f.confirm) return 'Las contraseñas no coinciden'
    return null
  }

  function handleStep1() {
    const err = validateStep1()
    if (err) { setError(err); return }
    setStep(2)
  }

  async function handleSubmit() {
    if (!f.securityAnswer.trim()) { setError('La respuesta de seguridad es obligatoria'); return }
    setLoading(true)
    try {
      await registerTherapist(f.name, f.username, f.password, f.securityQuestion, f.securityAnswer)
      onDone()
    } catch (e) {
      setError('Error al crear cuenta. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.root}>
      <div style={S.card}>
        <div style={S.logoBox}>
          <span style={{ fontSize: 40, marginBottom: 6, display: 'block' }}>🎯</span>
          <h1 style={{ ...S.appName, fontSize: 22 }}>Bienvenido/a a AuraPlay</h1>
          <p style={S.appTag}>Crea tu cuenta profesional</p>
        </div>

        {/* Indicador de paso */}
        <div style={S.stepIndicator}>
          <div style={{ ...S.stepDot, background: '#4aab8a' }} />
          <div style={S.stepLine} />
          <div style={{ ...S.stepDot, background: step >= 2 ? '#4aab8a' : '#e0e0e0' }} />
        </div>
        <p style={S.stepLabel}>
          {step === 1 ? 'Paso 1 de 2 · Datos de acceso' : 'Paso 2 de 2 · Recuperación de contraseña'}
        </p>

        <div style={S.divider} />

        {step === 1 && (
          <div style={S.fields}>
            <Field label="Nombre profesional" placeholder="Ej: María González"
              value={f.name} onChange={v => set('name', v)} autoFocus />
            <Field label="Usuario" placeholder="Sin espacios (ej: mgonzalez)"
              value={f.username} onChange={v => set('username', v.toLowerCase().replace(/\s/g, ''))} />
            <PwField label="Contraseña (mín. 6 caracteres)" placeholder="••••••••"
              value={f.password} show={show.pw}
              onToggle={() => setShow(p => ({ ...p, pw: !p.pw }))}
              onChange={v => set('password', v)} />
            <PwField label="Confirmar contraseña" placeholder="••••••••"
              value={f.confirm} show={show.cf}
              onToggle={() => setShow(p => ({ ...p, cf: !p.cf }))}
              onChange={v => set('confirm', v)} />
          </div>
        )}

        {step === 2 && (
          <div style={S.fields}>
            <div style={S.fieldWrap}>
              <label style={S.fieldLabel}>Pregunta de seguridad</label>
              <select
                style={{ ...S.fieldInput, cursor: 'pointer' }}
                value={f.securityQuestion}
                onChange={e => set('securityQuestion', e.target.value)}
              >
                {SECURITY_QUESTIONS.map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
            <PwField label="Tu respuesta secreta" placeholder="Solo tú la sabrás"
              value={f.securityAnswer} show={show.ans}
              onToggle={() => setShow(p => ({ ...p, ans: !p.ans }))}
              onChange={v => set('securityAnswer', v)} />
            <div style={S.infoBox}>
              <p style={S.infoText}>
                Esta respuesta te permitirá recuperar acceso si olvidas tu contraseña. Recuérdala bien.
              </p>
            </div>
          </div>
        )}

        {error && <p style={S.error}>{error}</p>}

        {step === 1 ? (
          <button style={S.btn} onClick={handleStep1}>
            Continuar →
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta y entrar →'}
            </button>
            <button style={S.ghostBtn} onClick={() => { setStep(1); setError('') }}>
              ← Volver
            </button>
          </div>
        )}

        <p style={S.legal}>Los datos se guardan localmente en este dispositivo.</p>
      </div>
    </div>
  )
}

// ─── Login terapeuta ──────────────────────────────────────────────────────────

function TherapistLoginForm({ onBack, onDone, onForgot }) {
  const { loginTherapist, lastLoginDisplay, lockoutSeconds } = useAuth()
  const therapistName = (() => {
    try { return JSON.parse(localStorage.getItem('auraplay_therapist_creds'))?.name || '' } catch { return '' }
  })()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow]         = useState(false)
  const [keepSession, setKeep]  = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [countdown, setCountdown] = useState(lockoutSeconds)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [countdown])

  async function handleSubmit() {
    if (countdown > 0) return
    if (!username || !password) { setError('Completa todos los campos'); return }
    setLoading(true)
    setError('')
    try {
      const r = await loginTherapist(username, password, keepSession)
      if (r.ok) {
        onDone()
      } else {
        setError(r.error)
        if (r.locked) setCountdown(30)
      }
    } catch {
      setError('Error inesperado. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const isBlocked = countdown > 0

  return (
    <div style={S.root}>
      <div style={S.card}>
        <button onClick={onBack} style={S.backBtn}>← Volver</button>

        <div style={S.loginHeader}>
          <span style={{ fontSize: 36 }}>🔒</span>
          <h2 style={S.loginTitle}>Acceso Terapeuta</h2>
          {therapistName && <p style={S.loginSub}>Hola, {therapistName}</p>}
          {lastLoginDisplay && (
            <p style={S.lastLogin}>Último acceso: {lastLoginDisplay}</p>
          )}
        </div>

        <div style={S.fields}>
          <Field label="Usuario" placeholder="Tu nombre de usuario"
            value={username} onChange={v => { setUsername(v); setError('') }}
            autoFocus onKeyDown={e => e.key === 'Enter' && handleSubmit()} />

          <PwField label="Contraseña" placeholder="••••••••"
            value={password} show={show}
            onToggle={() => setShow(p => !p)}
            onChange={v => { setPassword(v); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>

        {/* Keep session */}
        <label style={S.checkRow}>
          <input
            type="checkbox"
            checked={keepSession}
            onChange={e => setKeep(e.target.checked)}
            style={{ accentColor: '#4aab8a', width: 16, height: 16 }}
          />
          <span style={S.checkLabel}>Mantener sesión iniciada</span>
        </label>

        {/* Error / bloqueo */}
        {isBlocked ? (
          <div style={S.lockoutBox}>
            <span style={{ fontSize: 20 }}>🔐</span>
            <div>
              <p style={S.lockoutTitle}>Demasiados intentos fallidos</p>
              <p style={S.lockoutTimer}>Intenta nuevamente en {countdown} segundos</p>
            </div>
          </div>
        ) : (
          error && <p style={S.error}>{error}</p>
        )}

        <button
          style={{
            ...S.btn,
            opacity: (loading || isBlocked) ? 0.6 : 1,
            cursor: (loading || isBlocked) ? 'not-allowed' : 'pointer',
          }}
          onClick={handleSubmit}
          disabled={loading || isBlocked}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <LoadingDots /> Verificando...
            </span>
          ) : 'Ingresar'}
        </button>

        <button style={S.forgotBtn} onClick={onForgot}>
          ¿Olvidaste tu contraseña?
        </button>
      </div>
    </div>
  )
}

// ─── Recuperación de contraseña ───────────────────────────────────────────────

function ForgotPasswordFlow({ onBack, onDone }) {
  const { getSecurityQuestion, verifySecurityAnswer, resetPasswordWithAnswer } = useAuth()
  const [step, setStep]   = useState(1) // 1: username, 2: respuesta, 3: nueva clave
  const [username, setUsername] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer]     = useState('')
  const [newPw, setNewPw]       = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [show, setShow]   = useState({ ans: false, pw: false, cf: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function handleStep1() {
    if (!username.trim()) { setError('Ingresa tu nombre de usuario'); return }
    const r = getSecurityQuestion(username)
    if (!r.ok) { setError(r.error); return }
    setQuestion(r.question)
    setStep(2)
    setError('')
  }

  async function handleStep2() {
    if (!answer.trim()) { setError('Ingresa tu respuesta'); return }
    setLoading(true)
    const r = await verifySecurityAnswer(username, answer)
    setLoading(false)
    if (!r.ok) { setError(r.error); return }
    setStep(3)
    setError('')
  }

  async function handleStep3() {
    if (newPw.length < 6)      { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (newPw !== confirmPw)   { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    const r = await resetPasswordWithAnswer(username, answer, newPw)
    setLoading(false)
    if (!r.ok) { setError(r.error); return }
    setSuccess(true)
    setTimeout(onDone, 2000)
  }

  if (success) {
    return (
      <div style={S.root}>
        <div style={S.card}>
          <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 48 }}>✅</span>
            <h2 style={S.loginTitle}>Contraseña actualizada</h2>
            <p style={S.loginSub}>Volviendo al login...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={S.root}>
      <div style={S.card}>
        <button onClick={onBack} style={S.backBtn}>← Volver al login</button>

        <div style={S.loginHeader}>
          <span style={{ fontSize: 36 }}>🔑</span>
          <h2 style={S.loginTitle}>Recuperar contraseña</h2>
          <p style={S.loginSub}>
            {step === 1 && 'Ingresa tu nombre de usuario'}
            {step === 2 && 'Responde tu pregunta de seguridad'}
            {step === 3 && 'Crea tu nueva contraseña'}
          </p>
        </div>

        <div style={S.fields}>
          {step >= 1 && (
            <div style={S.fieldWrap}>
              <label style={S.fieldLabel}>Usuario</label>
              <input style={{ ...S.fieldInput, background: step > 1 ? '#f8f8f8' : '#fff' }}
                type="text" value={username}
                onChange={e => { setUsername(e.target.value); setError('') }}
                disabled={step > 1} placeholder="Tu nombre de usuario"
                onKeyDown={e => e.key === 'Enter' && step === 1 && handleStep1()} />
            </div>
          )}

          {step >= 2 && (
            <>
              <div style={{ background: '#f0faf6', borderRadius: 12, padding: '12px 14px', border: '1.5px solid #c8e8dc' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#2d7a62', margin: '0 0 4px' }}>Tu pregunta de seguridad</p>
                <p style={{ fontSize: 13, color: '#333', margin: 0, lineHeight: 1.5 }}>{question}</p>
              </div>
              <PwField label="Tu respuesta" placeholder="Respuesta secreta"
                value={answer} show={show.ans}
                onToggle={() => setShow(p => ({ ...p, ans: !p.ans }))}
                onChange={v => { setAnswer(v); setError('') }}
                onKeyDown={e => e.key === 'Enter' && step === 2 && handleStep2()} />
            </>
          )}

          {step >= 3 && (
            <>
              <PwField label="Nueva contraseña (mín. 6 caracteres)" placeholder="••••••••"
                value={newPw} show={show.pw}
                onToggle={() => setShow(p => ({ ...p, pw: !p.pw }))}
                onChange={v => { setNewPw(v); setError('') }} />
              <PwField label="Confirmar nueva contraseña" placeholder="••••••••"
                value={confirmPw} show={show.cf}
                onToggle={() => setShow(p => ({ ...p, cf: !p.cf }))}
                onChange={v => { setConfirmPw(v); setError('') }} />
            </>
          )}
        </div>

        {error && <p style={S.error}>{error}</p>}

        <button
          style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}
          onClick={step === 1 ? handleStep1 : step === 2 ? handleStep2 : handleStep3}
          disabled={loading}
        >
          {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><LoadingDots /> Verificando...</span>
            : step === 1 ? 'Buscar cuenta →'
            : step === 2 ? 'Verificar respuesta →'
            : 'Guardar nueva contraseña →'}
        </button>
      </div>
    </div>
  )
}

// ─── Login familia ────────────────────────────────────────────────────────────

function FamilyLoginForm({ onBack, onDone }) {
  const { loginFamily } = useAuth()
  const [rut, setRut]       = useState('')
  const [pin, setPin]       = useState('')
  const [show, setShow]     = useState(false)
  const [keepSession, setKeep] = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function handleRut(v) {
    const clean = v.replace(/[^0-9kK]/g, '').toUpperCase()
    if (!clean) { setRut(''); return }
    const body = clean.slice(0, -1)
    const dv   = clean.slice(-1)
    setRut(clean.length === 1 ? clean : `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`)
    setError('')
  }

  function handleSubmit() {
    if (!rut.trim() || !pin.trim()) { setError('Ingresa RUT y PIN'); return }
    setLoading(true)
    setError('')
    setTimeout(() => {
      const r = loginFamily(rut, pin, keepSession)
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
          <div style={S.fieldWrap}>
            <label style={S.fieldLabel}>RUT del paciente</label>
            <input style={S.fieldInput} type="text"
              placeholder="12.345.678-9"
              value={rut} onChange={e => handleRut(e.target.value)}
              inputMode="numeric" autoComplete="off" />
          </div>

          <div style={S.fieldWrap}>
            <label style={S.fieldLabel}>PIN de acceso</label>
            <div style={{ position: 'relative' }}>
              <input style={{ ...S.fieldInput, paddingRight: 48 }}
                type={show ? 'text' : 'password'}
                placeholder="PIN asignado por el/la terapeuta"
                value={pin} onChange={e => { setPin(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                autoComplete="off" />
              <button style={S.eyeBtn} onClick={() => setShow(p => !p)} type="button">
                {show ? '🙈' : '👁️'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
              Tu primer PIN fue asignado por el/la terapeuta.
            </p>
          </div>
        </div>

        <label style={S.checkRow}>
          <input type="checkbox" checked={keepSession} onChange={e => setKeep(e.target.checked)}
            style={{ accentColor: '#4aab8a', width: 16, height: 16 }} />
          <span style={S.checkLabel}>Mantener sesión iniciada</span>
        </label>

        {error && <p style={S.error}>{error}</p>}

        <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading
            ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><LoadingDots /> Verificando...</span>
            : 'Ingresar'}
        </button>
      </div>
    </div>
  )
}

// ─── Cambio PIN obligatorio (primer ingreso) ──────────────────────────────────

function ChangePinOnFirstLogin({ patient, onDone }) {
  const { changeFamilyPin } = useAuth()
  const [cur, setCur]     = useState('')
  const [nw, setNw]       = useState('')
  const [cf, setCf]       = useState('')
  const [show, setShow]   = useState({ cur: false, nw: false, cf: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit() {
    if (!cur || !nw || !cf) { setError('Completa todos los campos'); return }
    if (nw.length < 4)      { setError('El PIN debe tener al menos 4 caracteres'); return }
    if (nw !== cf)           { setError('Los PINs no coinciden'); return }
    setLoading(true)
    setTimeout(() => {
      const r = changeFamilyPin(patient.id, cur, nw)
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
          <h2 style={S.loginTitle}>Crea tu PIN personal</h2>
          <p style={S.loginSub}>
            Es tu primer ingreso. Cambia el PIN temporal por uno que solo tú conozcas.
          </p>
        </div>
        <div style={S.fields}>
          <PwField label="PIN temporal (el que te dio el/la terapeuta)"
            placeholder="PIN temporal" value={cur} show={show.cur}
            onToggle={() => setShow(p => ({ ...p, cur: !p.cur }))}
            onChange={v => { setCur(v); setError('') }} />
          <PwField label="Nuevo PIN (mínimo 4 caracteres)"
            placeholder="Tu nuevo PIN" value={nw} show={show.nw}
            onToggle={() => setShow(p => ({ ...p, nw: !p.nw }))}
            onChange={v => { setNw(v); setError('') }} />
          <PwField label="Confirmar nuevo PIN"
            placeholder="Repite tu nuevo PIN" value={cf} show={show.cf}
            onToggle={() => setShow(p => ({ ...p, cf: !p.cf }))}
            onChange={v => { setCf(v); setError('') }} />
        </div>
        {error && <p style={S.error}>{error}</p>}
        <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar PIN y entrar →'}
        </button>
        <div style={S.infoBox}>
          <p style={S.infoText}>Si olvidas tu PIN, el/la terapeuta puede resetearlo desde el panel.</p>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Field({ label, placeholder, value, onChange, autoFocus, onKeyDown, disabled }) {
  return (
    <div style={S.fieldWrap}>
      <label style={S.fieldLabel}>{label}</label>
      <input style={{ ...S.fieldInput, background: disabled ? '#f8f8f8' : '#fff' }}
        type="text" placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus={autoFocus} onKeyDown={onKeyDown} disabled={disabled}
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

function LoadingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: '50%',
          background: 'rgba(255,255,255,0.8)',
          animation: `pulse 1s ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </span>
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
    display: 'flex', flexDirection: 'column',
  },
  logoBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 20 },
  appName: { fontSize: 28, fontWeight: 900, color: '#1a2a1a', margin: '0 0 4px', letterSpacing: '-1px' },
  appTag:  { fontSize: 13, color: '#888', margin: 0 },
  divider: { height: 1, background: '#f0f0f0', margin: '0 0 20px' },
  selectLabel: { fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px', textAlign: 'center' },
  roleCard: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '16px', borderRadius: 16, border: '2px solid #e8f5f0',
    background: '#fff', cursor: 'pointer', marginBottom: 10,
    width: '100%', transition: 'all 0.15s',
  },
  roleIcon: { width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 },
  roleTitle: { fontSize: 16, fontWeight: 700, color: '#1a2a1a', margin: '0 0 2px' },
  roleDesc:  { fontSize: 12, color: '#888', margin: 0 },
  arrow: { fontSize: 20, color: '#ccc' },
  loginHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 20, gap: 4 },
  loginTitle: { fontSize: 20, fontWeight: 700, color: '#1a2a1a', margin: 0, textAlign: 'center' },
  loginSub:   { fontSize: 13, color: '#888', margin: 0, textAlign: 'center', lineHeight: 1.5 },
  lastLogin:  { fontSize: 11, color: '#bbb', margin: 0, textAlign: 'center' },
  fields: { display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 14 },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 5 },
  fieldLabel: { fontSize: 12, fontWeight: 700, color: '#555', letterSpacing: '0.3px' },
  fieldInput: {
    padding: '12px 14px', borderRadius: 12, border: '2px solid #e8e8e8',
    fontSize: 15, color: '#1a2a1a', outline: 'none', width: '100%',
    boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s',
  },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 0 },
  checkRow: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 14 },
  checkLabel: { fontSize: 13, color: '#555', fontWeight: 500 },
  btn: {
    width: '100%', padding: '15px',
    background: 'linear-gradient(135deg, #4aab8a 0%, #3d9478 100%)',
    color: '#fff', border: 'none', borderRadius: 14,
    fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.2px',
    marginBottom: 8,
  },
  ghostBtn: {
    width: '100%', padding: '13px',
    background: 'none', border: '2px solid #e8e8e8',
    color: '#888', borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  backBtn: { background: 'none', border: 'none', fontSize: 14, color: '#888', cursor: 'pointer', padding: '0 0 16px', fontWeight: 600, alignSelf: 'flex-start' },
  forgotBtn: { background: 'none', border: 'none', fontSize: 13, color: '#4aab8a', cursor: 'pointer', textDecoration: 'underline', padding: '4px 0', fontWeight: 600 },
  error: { color: '#e07a5f', fontSize: 13, fontWeight: 600, margin: '0 0 10px' },
  lockoutBox: {
    background: '#fff8e6', border: '1.5px solid #f0d080',
    borderRadius: 12, padding: '12px 14px',
    display: 'flex', gap: 10, alignItems: 'center',
    marginBottom: 10,
  },
  lockoutTitle: { fontSize: 13, fontWeight: 700, color: '#7a5c00', margin: '0 0 2px' },
  lockoutTimer: { fontSize: 12, color: '#9a6d0a', margin: 0 },
  legal: { fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 16 },
  infoBox: { background: '#f0faf6', borderRadius: 12, padding: 14, marginTop: 8, border: '1.5px solid #c8e8dc' },
  infoText: { fontSize: 12, color: '#2d7a62', margin: 0, lineHeight: 1.5, fontWeight: 500 },
  stepIndicator: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 6 },
  stepDot: { width: 10, height: 10, borderRadius: '50%', transition: 'background 0.3s' },
  stepLine: { width: 40, height: 2, background: '#e0e0e0' },
  stepLabel: { fontSize: 11, color: '#888', textAlign: 'center', marginBottom: 16 },
}
