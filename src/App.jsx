import { useState, useRef } from 'react'
import { usePatient } from './context/PatientContext'
import { LEVELS } from './data/levels'
import HomeScreen from './screens/HomeScreen'
import MinimalPairsScreen from './screens/MinimalPairsScreen'
import BuildWordScreen from './screens/BuildWordScreen'
import ListenScreen from './screens/ListenScreen'
import SyntaxScreen from './screens/SyntaxScreen'
import ResultsScreen from './screens/ResultsScreen'
import SemanticScreen from './screens/SemanticScreen'
import PragmaticScreen from './screens/PragmaticScreen'
import NarrativeScreen from './screens/NarrativeScreen'
import RhymeScreen from './screens/RhymeScreen'
import PointImageScreen from './screens/PointImageScreen'
import CategoryScreen from './screens/CategoryScreen'
import FollowInstructionScreen from './screens/FollowInstructionScreen'
import CommunicativeIntentScreen from './screens/CommunicativeIntentScreen'
import ProgressScreen from './screens/ProgressScreen'
import PatientSelectScreen from './screens/PatientSelectScreen'
import NewPatientForm from './components/NewPatientForm'
import SessionHistoryScreen from './screens/SessionHistoryScreen'
import { updatePatient as persistPatient, getPatientById, getAllPatients } from './data/patients'

const ACTIVITY_LABELS = {
  'minimal-pairs': 'Palabras Similares',
  'build-word': 'Armar Palabras',
  'listen': 'Escucha Atento',
  'syntax': 'Completar Frases',
  'semantic': 'Semántica',
  'narrative': 'Ordenar Historia',
  'pragmatic': 'Inferencias',
  'rhyme': 'Rimas',
  'point-image': 'Señala la Imagen',
  'category': '¿Cuál no pertenece?',
  'follow-instruction': 'Sigue la Instrucción',
  'communicative-intent': '¿Para qué sirve?',
}

const ACTIVITY_SCREENS = new Set(['minimal-pairs', 'build-word', 'listen', 'syntax', 'semantic', 'narrative', 'pragmatic', 'rhyme', 'point-image', 'category', 'follow-instruction', 'communicative-intent'])

// Mostrar selector si ya hay pacientes guardados; si no, directo al formulario de nuevo paciente
const hasPatients = getAllPatients().length > 0
const isFirstRun = !localStorage.getItem('auraplay_patient')

function App() {
  const [screen, setScreen] = useState('home')
  const [lastResult, setLastResult] = useState(null)
  // showSelect: pantalla de selección de paciente (si hay roster), showWelcome: formulario nuevo paciente (si no hay ninguno)
  const [showSelect, setShowSelect] = useState(hasPatients)
  const [welcomed, setWelcomed] = useState(!isFirstRun)
  const { patient, estimulusSettings, addStars, addSessionEntry } = usePatient()
  const activityStartRef = useRef(null)

  function goTo(screenName) {
    if (ACTIVITY_SCREENS.has(screenName)) {
      activityStartRef.current = Date.now()
    }
    setScreen(screenName)
  }

  function finishActivity(score, total, activityId) {
    const earned = score >= total ? 3 : score >= total * 0.6 ? 2 : 1
    const duration = activityStartRef.current
      ? Math.round((Date.now() - activityStartRef.current) / 1000)
      : 0
    activityStartRef.current = null

    const entry = {
      id: String(Date.now()),
      type: 'activity',
      date: new Date().toISOString(),
      activityId,
      activityLabel: ACTIVITY_LABELS[activityId] ?? activityId,
      score,
      total,
      earned,
      levelId: patient.levelId,
      levelLabel: LEVELS[patient.levelId]?.label ?? patient.levelId,
      duration,
      stimulusSettings: { ...estimulusSettings },
    }

    // 1. Actualiza el contexto (estado en memoria + localStorage 'auraplay_patient')
    addStars(earned)
    addSessionEntry(entry)

    // 2. Persiste en el roster de pacientes (localStorage 'auraplay_patients')
    if (patient.id) {
      const current = getPatientById(patient.id)
      if (current) {
        persistPatient(patient.id, {
          stars: (current.stars ?? 0) + earned,
          sessionHistory: [...(current.sessionHistory ?? []), entry],
        })
      }
    }

    setLastResult({ score, total, earned })
    setScreen('results')
  }

  if (showSelect) {
    return (
      <div className="app-wrapper">
        <PatientSelectScreen onDone={() => { setShowSelect(false); setWelcomed(true) }} />
      </div>
    )
  }

  if (!welcomed) {
    return (
      <div className="app-wrapper">
        <div className="screen" style={{ overflowY: 'auto', padding: '24px 20px' }}>
          <NewPatientForm onSaved={() => setWelcomed(true)} />
        </div>
      </div>
    )
  }

  return (
    <div className="app-wrapper">
      {screen === 'home' && (
        <HomeScreen onNavigate={goTo} />
      )}
      {screen === 'minimal-pairs' && (
        <MinimalPairsScreen
          onFinish={(s, t) => finishActivity(s, t, 'minimal-pairs')}
          onBack={() => goTo('home')}
        />
      )}
      {screen === 'build-word' && (
        <BuildWordScreen
          onFinish={(s, t) => finishActivity(s, t, 'build-word')}
          onBack={() => goTo('home')}
        />
      )}
      {screen === 'semantic' && (
        <SemanticScreen
          onFinish={(s, t) => finishActivity(s, t, 'semantic')}
          onBack={() => goTo('home')}
        />
      )}
      {screen === 'listen' && (
        <ListenScreen
          onFinish={(s, t) => finishActivity(s, t, 'listen')}
          onBack={() => goTo('home')}
        />
      )}
      {screen === 'syntax' && (
        <SyntaxScreen
          onFinish={(s, t) => finishActivity(s, t, 'syntax')}
          onBack={() => goTo('home')}
        />
      )}
      {screen === 'pragmatic' && (
        <PragmaticScreen
          onFinish={(s, t) => finishActivity(s, t, 'pragmatic')}
          onBack={() => goTo('home')}
        />
      )}
      {screen === 'narrative' && (
        <NarrativeScreen
          onFinish={(s, t) => finishActivity(s, t, 'narrative')}
          onBack={() => goTo('home')}
        />
      )}
      {screen === 'rhyme' && (
        <RhymeScreen onFinish={(s, t) => finishActivity(s, t, 'rhyme')} />
      )}
      {screen === 'point-image' && (
        <PointImageScreen onFinish={(s, t) => finishActivity(s, t, 'point-image')} />
      )}
      {screen === 'category' && (
        <CategoryScreen onFinish={(s, t) => finishActivity(s, t, 'category')} />
      )}
      {screen === 'follow-instruction' && (
        <FollowInstructionScreen onFinish={(s, t) => finishActivity(s, t, 'follow-instruction')} />
      )}
      {screen === 'communicative-intent' && (
        <CommunicativeIntentScreen onFinish={(s, t) => finishActivity(s, t, 'communicative-intent')} />
      )}
      {screen === 'progress' && (
        <ProgressScreen onBack={() => goTo('home')} />
      )}
      {screen === 'session-history' && (
        <SessionHistoryScreen onBack={() => goTo('home')} />
      )}
      {screen === 'results' && (
        <ResultsScreen
          result={lastResult}
          onHome={() => goTo('home')}
        />
      )}
    </div>
  )
}

export default App