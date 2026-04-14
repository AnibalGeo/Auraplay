import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PatientProvider } from './context/PatientContext.jsx'
import { migratePatientData } from './data/patients.js'

migratePatientData()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PatientProvider>
      <App />
    </PatientProvider>
  </StrictMode>,
)