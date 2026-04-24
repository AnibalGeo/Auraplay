import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PatientProvider } from './context/PatientContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { migratePatientData } from './data/patients.js'

// Migración segura de datos existentes — idempotente
migratePatientData()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PatientProvider>
        <App />
      </PatientProvider>
    </AuthProvider>
  </StrictMode>
)
