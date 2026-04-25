/**
 * INTEGRACIÓN SPRINT 2 — Plan Terapéutico Automático
 * =====================================================
 * Este archivo documenta los 3 cambios quirúrgicos necesarios.
 * NO es un archivo que se copia — es la guía de integración.
 *
 * Archivos nuevos (copiar directamente):
 *   src/data/generateTherapyPlan.js    → motor de generación
 *   src/screens/TherapyPlanScreen.jsx  → pantalla del plan
 *
 * Archivos a modificar (cambios puntuales):
 *   src/context/PatientContext.jsx
 *   src/screens/TherapistPanel.jsx (ya entregado en sprint anterior)
 *   src/App.jsx
 */

// ═══════════════════════════════════════════════════════════════════
// CAMBIO 1 — PatientContext.jsx
// Agregar therapyPlan a DEFAULT_PATIENT
// ═══════════════════════════════════════════════════════════════════

/*
En DEFAULT_PATIENT, después de recommendedFocus: [], agregar:

  therapyPlan: null,        // TherapyPlan | null — generado por generateTherapyPlan()

En migratePatientData() de patients.js, dentro del bloque forEach:

  if (p.therapyPlan === undefined) {
    p.therapyPlan = null
    changed = true
  }

Y en el merge de loadFromStorage(), el spread ya maneja therapyPlan
automáticamente porque está en DEFAULT_PATIENT con valor null.
No necesita merge profundo — es un objeto que se reemplaza entero.
*/


// ═══════════════════════════════════════════════════════════════════
// CAMBIO 2 — TherapistPanel.jsx (ya entregado)
// Conectar "Iniciar Plan Terapéutico" a la nueva pantalla
// ═══════════════════════════════════════════════════════════════════

/*
El TherapistPanel que entregamos ya tiene:
  - prop onStartPlan
  - handleStartPlan() que llama onStartPlan() si existe

En App.jsx solo hay que pasar ese prop apuntando a 'therapy-plan'.
Ver Cambio 3 más abajo.
*/


// ═══════════════════════════════════════════════════════════════════
// CAMBIO 3 — App.jsx
// Registrar la nueva pantalla y pasar onStartPlan al panel
// ═══════════════════════════════════════════════════════════════════

/*
1. Importar la pantalla nueva al inicio de App.jsx:

  import TherapyPlanScreen from './screens/TherapyPlanScreen'

2. Registrar 'therapy-plan' en ACTIVITY_SCREENS:
   NO — therapy-plan no es una actividad, no va en ACTIVITY_SCREENS.

3. En el JSX del flujo normal, agregar el render de therapy-plan
   junto a los demás screens (después del bloque de session-history):

  {screen === 'therapy-plan' && (
    <TherapyPlanScreen
      onBack={() => goTo('home')}
      onNavigate={goTo}
    />
  )}

4. Pasar onStartPlan al TherapistPanel:
   Busca donde renderizas <TherapistPanel ... /> en tu HomeScreen
   o en App.jsx y agrega:

  onStartPlan={() => { goTo('therapy-plan') }}

   Si TherapistPanel se renderiza dentro de HomeScreen (no directamente
   en App.jsx), entonces HomeScreen necesita recibir un prop onStartPlan
   y pasarlo hacia abajo. Ejemplo en HomeScreen.jsx:

  <TherapistPanel
    onClose={...}
    onViewProgress={...}
    onViewHistory={...}
    onStartPlan={() => props.onNavigate('therapy-plan')}
  />
*/


// ═══════════════════════════════════════════════════════════════════
// RESUMEN DE ARCHIVOS
// ═══════════════════════════════════════════════════════════════════

/*
NUEVO  → src/data/generateTherapyPlan.js
NUEVO  → src/screens/TherapyPlanScreen.jsx
EDITAR → src/context/PatientContext.jsx    (agregar therapyPlan: null en DEFAULT_PATIENT)
EDITAR → src/data/patients.js              (agregar therapyPlan en migración)
EDITAR → src/App.jsx                       (importar + render + onStartPlan)
*/
