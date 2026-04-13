import { usePatient } from '../context/PatientContext'
import { STIMULUS_CONFIG } from '../data/levels'

function ResultsScreen({ result, onHome }) {
  const { patient, level } = usePatient()

  if (!result) return null

  const { score, total, earned } = result
  const percentage = Math.round((score / total) * 100)

  const getMessage = () => {
    if (earned === 3) return `¡Increíble, ${patient.name}!`
    if (earned === 2) return `¡Muy bien, ${patient.name}!`
    return `¡Buen intento, ${patient.name}!`
  }

  const getSubMessage = () => {
    if (earned === 3) return 'Lo hiciste perfecto 🎉'
    if (earned === 2) return 'Vas muy bien, sigue así 💪'
    return 'La práctica hace al maestro 🌱'
  }

  return (
    <div className="screen results-screen">
      <div className="results-area">

        <div style={{ fontSize: '80px', animation: 'bounce 0.6s ease' }}>
          {earned === 3 ? '🏆' : earned === 2 ? '🌟' : '⭐'}
        </div>

        <h2 className="results-title">{getMessage()}</h2>
        <p style={{ fontSize: '15px', color: 'var(--text2)' }}>
          {getSubMessage()}
        </p>

        <div className="stars-row">
          {'⭐'.repeat(earned)}{'☆'.repeat(3 - earned)}
        </div>

        <div className="results-stats">
          <div className="stat-row">
            <span className="stat-label">Respuestas correctas</span>
            <span className="stat-value">{score}/{total}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Porcentaje logrado</span>
            <span className="stat-value">{percentage}%</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Estrellas ganadas</span>
            <span className="stat-value">⭐ +{earned}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Total acumulado</span>
            <span className="stat-value">⭐ {patient.stars}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Nivel trabajado</span>
            <span className="stat-value" style={{ color: 'var(--purple)' }}>
              {level.label} · {level.ageRange}
            </span>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '14px 20px',
          width: '100%',
          maxWidth: '320px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>
            Diagnóstico activo
          </p>
          <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--teal)' }}>
            {STIMULUS_CONFIG[patient.diagnosis]?.label ?? patient.diagnosis}
          </p>
        </div>

        <button className="check-btn" onClick={onHome}>
          Volver al inicio 🏠
        </button>

      </div>
    </div>
  )
}

export default ResultsScreen