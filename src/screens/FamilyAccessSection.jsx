/**
 * FamilyAccessSection.jsx
 * Módulo de gestión de acceso familiar — para TherapistPanel pestaña Paciente
 *
 * Agregar en ConfigPanel, pestaña 'patient', antes de ChangePinSection:
 *   import FamilyAccessSection from './FamilyAccessSection'
 *   <FamilyAccessSection />
 *
 * Permite al terapeuta:
 *   - Activar acceso familia (genera PIN temporal)
 *   - Ver estado actual (activo/inactivo, último acceso)
 *   - Resetear PIN (genera nuevo PIN temporal)
 *   - Desactivar acceso (cierra sesión familia si está activa)
 */

import { useState } from 'react'
import { usePatient } from '../context/PatientContext'
import { useAuth } from '../context/AuthContext'
import { getPatientById } from '../data/patients'

export default function FamilyAccessSection() {
  const { patient, updatePatient } = usePatient()
  const { enableFamilyAccess, disableFamilyAccess, resetFamilyPin } = useAuth()

  const [newPin, setNewPin]   = useState(null)  // PIN recién generado para mostrar
  const [msg, setMsg]         = useState(null)  // { text, ok }
  const [confirmDisable, setConfirmDisable] = useState(false)

  // Leer estado actual desde el roster (no desde contexto — puede estar desactualizado)
  const fresh   = getPatientById(patient.id) || patient
  const enabled = fresh.familyEnabled ?? false
  const lastLogin = fresh.familyLastLogin

  function formatDate(iso) {
    if (!iso) return 'Nunca'
    return new Date(iso).toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  function handleEnable() {
    if (!patient.id) { setMsg({ text: 'Guarda el paciente primero', ok: false }); return }
    if (!patient.rut?.trim()) { setMsg({ text: 'El paciente necesita RUT para activar acceso familiar', ok: false }); return }

    const result = enableFamilyAccess(patient.id)
    if (result.ok) {
      updatePatient({ familyEnabled: true, familyFirstLogin: true })
      setNewPin(result.pin)
      setMsg({ text: 'Acceso familiar activado', ok: true })
    }
  }

  function handleReset() {
    if (!patient.id) return
    const result = resetFamilyPin(patient.id)
    if (result.ok) {
      updatePatient({ familyFirstLogin: true })
      setNewPin(result.pin)
      setMsg({ text: 'PIN reseteado correctamente', ok: true })
    }
  }

  function handleDisable() {
    if (!patient.id) return
    disableFamilyAccess(patient.id)
    updatePatient({ familyEnabled: false })
    setConfirmDisable(false)
    setNewPin(null)
    setMsg({ text: 'Acceso familiar desactivado', ok: true })
  }

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <p style={styles.title}>👨‍👩‍👧 ACCESO FAMILIAR</p>
          <p style={styles.subtitle}>Modo Familia para {patient.name}</p>
        </div>
        <div style={{
          ...styles.statusBadge,
          background: enabled ? '#e6f7f0' : '#f5f5f5',
          color: enabled ? '#2d7a62' : '#999',
          border: `1.5px solid ${enabled ? '#b0dece' : '#e0e0e0'}`,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: enabled ? '#4aab8a' : '#ccc', display: 'inline-block', marginRight: 5 }} />
          {enabled ? 'Activo' : 'Inactivo'}
        </div>
      </div>

      {/* Info estado */}
      <div style={styles.infoRow}>
        <div style={styles.infoItem}>
          <p style={styles.infoLabel}>Usuario</p>
          <p style={styles.infoValue}>{patient.rut || '(sin RUT)'}</p>
        </div>
        <div style={styles.infoItem}>
          <p style={styles.infoLabel}>Último acceso</p>
          <p style={styles.infoValue}>{formatDate(lastLogin)}</p>
        </div>
      </div>

      {/* PIN recién generado — mostrar UNA vez */}
      {newPin && (
        <div style={styles.pinBox}>
          <p style={styles.pinLabel}>🔑 PIN temporal generado</p>
          <p style={styles.pinValue}>{newPin}</p>
          <p style={styles.pinNote}>
            Comparte este PIN con la familia. Por seguridad se mostrará solo una vez. La familia deberá cambiarlo al ingresar.
          </p>
          <button style={styles.pinClose} onClick={() => setNewPin(null)}>
            Entendido, cerrar
          </button>
        </div>
      )}

      {/* Mensaje de estado */}
      {msg && !newPin && (
        <p style={{ ...styles.msg, color: msg.ok ? '#2d7a62' : '#e07a5f' }}>{msg.text}</p>
      )}

      {/* Acciones */}
      {!enabled ? (
        <button style={styles.enableBtn} onClick={handleEnable}>
          Activar acceso familiar
        </button>
      ) : (
        <div style={styles.actions}>
          <button style={styles.resetBtn} onClick={handleReset}>
            🔄 Resetear PIN
          </button>

          {!confirmDisable ? (
            <button style={styles.disableBtn} onClick={() => setConfirmDisable(true)}>
              Desactivar acceso
            </button>
          ) : (
            <div style={styles.confirmBox}>
              <p style={styles.confirmText}>
                ¿Desactivar acceso para {patient.name}? La sesión familiar se cerrará.
              </p>
              <div style={styles.confirmBtns}>
                <button style={styles.confirmYes} onClick={handleDisable}>Sí, desactivar</button>
                <button style={styles.confirmNo} onClick={() => setConfirmDisable(false)}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nota si no hay RUT */}
      {!patient.rut?.trim() && (
        <p style={styles.noRutNote}>
          ⚠️ Este paciente no tiene RUT registrado. Agrégalo en el formulario para poder activar el acceso familiar.
        </p>
      )}
    </div>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = {
  root: {
    background: '#f8f8f6',
    borderRadius: 14,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: { fontSize: 12, fontWeight: 700, color: '#555', margin: '0 0 2px' },
  subtitle: { fontSize: 11, color: '#999', margin: 0 },
  statusBadge: {
    fontSize: 11, fontWeight: 700,
    padding: '4px 10px', borderRadius: 99,
    display: 'flex', alignItems: 'center', flexShrink: 0,
  },
  infoRow: { display: 'flex', gap: 8 },
  infoItem: {
    flex: 1, background: '#fff', borderRadius: 10,
    padding: '8px 12px', border: '1px solid #ebebeb',
  },
  infoLabel: { fontSize: 9, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 2px' },
  infoValue: { fontSize: 12, fontWeight: 700, color: '#333', margin: 0 },
  // PIN box
  pinBox: {
    background: 'linear-gradient(135deg, #e6f7f0, #f0faf6)',
    border: '2px solid #4aab8a',
    borderRadius: 12,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  pinLabel: { fontSize: 12, fontWeight: 700, color: '#2d7a62', margin: 0 },
  pinValue: {
    fontSize: 24, fontWeight: 900, color: '#1a2a1a',
    letterSpacing: 2, margin: 0,
    fontFamily: 'monospace',
  },
  pinNote: { fontSize: 11, color: '#555', margin: 0, lineHeight: 1.5 },
  pinClose: {
    alignSelf: 'flex-start',
    background: '#4aab8a', color: '#fff',
    border: 'none', borderRadius: 8,
    padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
  },
  msg: { fontSize: 12, fontWeight: 600, margin: 0 },
  // Botones
  enableBtn: {
    width: '100%', padding: '12px',
    background: 'linear-gradient(135deg, #4aab8a, #3d9478)',
    color: '#fff', border: 'none', borderRadius: 12,
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
  actions: { display: 'flex', flexDirection: 'column', gap: 8 },
  resetBtn: {
    width: '100%', padding: '11px',
    background: '#fff', border: '2px solid #c8e8dc',
    borderRadius: 12, fontSize: 13, fontWeight: 600,
    color: '#2d7a62', cursor: 'pointer',
  },
  disableBtn: {
    width: '100%', padding: '11px',
    background: '#fef4f2', border: '2px solid #fde0da',
    borderRadius: 12, fontSize: 13, fontWeight: 600,
    color: '#e07a5f', cursor: 'pointer',
  },
  confirmBox: {
    background: '#fef4f2', borderRadius: 12,
    padding: 12, border: '1.5px solid #f0c8c0',
  },
  confirmText: { fontSize: 12, color: '#c0392b', fontWeight: 600, margin: '0 0 10px' },
  confirmBtns: { display: 'flex', gap: 8 },
  confirmYes: {
    flex: 1, padding: '9px',
    background: '#e07a5f', color: '#fff',
    border: 'none', borderRadius: 10,
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
  confirmNo: {
    flex: 1, padding: '9px',
    background: '#fff', color: '#666',
    border: '2px solid #e0e0e0', borderRadius: 10,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  noRutNote: {
    fontSize: 11, color: '#b07800', lineHeight: 1.5,
    background: '#fff8e6', borderRadius: 10,
    padding: '8px 12px', margin: 0,
    border: '1px solid #f0d080',
  },
}
