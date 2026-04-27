/**
 * OnboardingScreen.jsx
 * Empty state profesional para terapeuta sin pacientes
 */

export default function OnboardingScreen({ onOpenScheduler, onNewPatient, onImportPatient }) {
  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'linear-gradient(145deg, #e8f5f0 0%, #ffffff 50%, #f0ecfa 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 20px', boxSizing: 'border-box',
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 24, background: 'white',
        boxShadow: '0 8px 32px rgba(74,171,138,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 42, marginBottom: 24,
      }}>🎯</div>

      <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a2a1a', margin: '0 0 8px', textAlign: 'center' }}>
        Bienvenido a AuraPlay
      </h1>
      <p style={{ fontSize: 15, color: '#666', textAlign: 'center', margin: '0 0 40px', maxWidth: 320, lineHeight: 1.5 }}>
        Organiza tu práctica clínica y atiende a tus pacientes desde un solo lugar
      </p>

      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>

        <button onClick={onOpenScheduler} style={{
          width: '100%', padding: '16px 20px', background: '#4aab8a', color: 'white',
          border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 700,
          cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 4px 16px rgba(74,171,138,0.3)',
        }}>
          <span style={{ fontSize: 28 }}>📅</span>
          <div>
            <div>Abrir agenda</div>
            <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.85, marginTop: 2 }}>Ver y gestionar citas de la semana</div>
          </div>
        </button>

        <button onClick={onNewPatient} style={{
          width: '100%', padding: '16px 20px', background: 'white', color: '#2d7a62',
          border: '2px solid #4aab8a', borderRadius: 16, fontSize: 16, fontWeight: 700,
          cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: 28 }}>➕</span>
          <div>
            <div>Registrar paciente nuevo</div>
            <div style={{ fontSize: 12, fontWeight: 400, color: '#888', marginTop: 2 }}>Ingreso manual de datos clínicos</div>
          </div>
        </button>

        <button onClick={onImportPatient} style={{
          width: '100%', padding: '16px 20px', background: 'white', color: '#6a4c9c',
          border: '2px solid #c4b0e8', borderRadius: 16, fontSize: 16, fontWeight: 700,
          cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: 28 }}>📁</span>
          <div>
            <div>Importar ficha clínica</div>
            <div style={{ fontSize: 12, fontWeight: 400, color: '#888', marginTop: 2 }}>Lee PDF o DOCX y extrae datos automáticamente</div>
          </div>
        </button>
      </div>

      <p style={{ fontSize: 12, color: '#aaa', marginTop: 32, textAlign: 'center' }}>
        AuraPlay · Plataforma clínica fonoaudiológica
      </p>
    </div>
  )
}
