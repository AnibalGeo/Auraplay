# ESTADO ACTUAL — AuraPlay
> Generado: 2026-04-18

---

## 1. Stack y configuración actual

| Elemento | Versión |
|---|---|
| React | 19.2.4 |
| React DOM | 19.2.4 |
| Vite | 8.0.4 |
| @vitejs/plugin-react | 6.0.1 |
| ESLint | 9.39.4 |

- Sin router (navegación por estado `screen` en App.jsx)
- Sin CSS framework (estilos inline + clases globales en CSS)
- Sin librería de testing
- Sin backend — todo en `localStorage`
- Sin gestión de audio externo — usa `window.speechSynthesis` (TTS nativo)

---

## 2. Estructura de archivos real

```
src/
├── App.jsx                          # Navegación central + WelcomeScreen inline
├── main.jsx
├── context/
│   └── PatientContext.jsx
├── data/
│   ├── levels.js                    # Definición de N1–N7 + STIMULUS_CONFIG
│   ├── patients.js                  # CRUD de roster en localStorage
│   ├── getContent.js                # Accessor para JSONs de contenido
│   └── content/
│       ├── N1.json … N7.json        # Contenido terapéutico por nivel
├── screens/
│   ├── HomeScreen.jsx
│   ├── TherapistPanel.jsx           # Panel terapeuta (PIN + tabs)
│   ├── PatientSelectScreen.jsx
│   ├── ProgressScreen.jsx
│   ├── SessionHistoryScreen.jsx
│   ├── ResultsScreen.jsx
│   ├── MinimalPairsScreen.jsx
│   ├── BuildWordScreen.jsx
│   ├── ListenScreen.jsx
│   ├── SemanticScreen.jsx
│   ├── SyntaxScreen.jsx
│   ├── NarrativeScreen.jsx
│   └── PragmaticScreen.jsx
├── components/
│   └── ProgressBar.jsx              # (existente, no relevado en detalle)
└── utils/
    ├── textAnalyzer.js              # Análisis lingüístico de notas clínicas
    ├── componentMap.js              # Mapeo actividad → componente del lenguaje
    └── audioFeedback.js
```

---

## 3. Estado de implementación por pantalla

### `App.jsx`
- **Funciona:** navegación por `screen` state, flujo de primer uso vs. roster existente, registro de sesión con duración y estrellas, persistencia dual (contexto + roster).
- **Problema:** `WelcomeScreen` inline usa `diagnosis: 'tdl'` como default — valor inválido (los válidos son `tel`, `tl_tea`, `tl_tdah`, `tl_tea_tdah`). Pasará por `normalizeDiagnosis` y quedará como `'tel'`, pero el formulario mostrará ningún botón seleccionado inicialmente.

### `HomeScreen.jsx`
- **Funciona:** card de paciente, secciones colapsables por componente, verificación de disponibilidad de actividades, sugerencias por diagnóstico.
- **Incompleto:** las barras de "Progreso de la semana" usan valores hardcodeados (`progressPct: 72, 60, 40, 55`) — no reflejan datos reales de sesión.

### `TherapistPanel.jsx`
- **Funciona:** PIN (hardcoded `'1234'`), tab Paciente, tab Nivel, tab Estímulos, tab Registro, búsqueda/creación de pacientes, hitos del desarrollo, análisis lingüístico de notas con `textAnalyzer`.
- **Bug:** `handleSaveSession` (menú principal del panel) referencia `estimulusSettings` que no está en el scope de `TherapistPanel` (solo desestructura `patient`, `level`, `loadPatient`, `setLevelById`). La función fallará silenciosamente.
- **Incompleto:** PIN hardcodeado `'1234'`, sin opción de cambiarlo.
- **Inconsistencia:** `NewPatientForm` dentro de TherapistPanel usa `diagnosis: 'tdl'` como default (igual que `PatientSelectScreen`).

### `PatientSelectScreen.jsx`
- **Funciona:** lista de pacientes recientes, búsqueda, `ConfirmCard` con resumen clínico, formulario de nuevo paciente.
- **Incompleto:** `NewPatientForm` usa `diagnosis: 'tdl'` como default (inválido).

### `ProgressScreen.jsx`
- **Funciona:** gráfico de barras de últimas 8 actividades, progreso por eje lingüístico, últimas 3 notas clínicas, exportar .txt.
- **Bug:** `noteEntries = history.filter(e => e.type === 'note')` — el tipo correcto guardado por `TherapistPanel` es `'nota_clinica'`, no `'note'`. `SessionHistoryScreen` maneja ambos; `ProgressScreen` no. Las sesiones guardadas desde el panel no aparecerán en el conteo de sesiones ni en las notas clínicas recientes.

### `SessionHistoryScreen.jsx`
- **Funciona:** listado filtrado (por fecha, actividad, nivel), resumen estadístico, exportar al portapapeles, expansión de detalles, notas clínicas asociadas. Maneja correctamente los tipos `'activity'`, `'nota_clinica'` y `'note'`.

### `ResultsScreen.jsx`
- **Funciona:** muestra resultado final, estrellas ganadas, porcentaje, diagnóstico activo. Completo y sin issues.

### `MinimalPairsScreen.jsx`
- **Funciona:** selección de par mínimo, feedback, TTS, soporte de `estimulusSettings` (animaciones, audio/visual, simplifiedInstructions, reducedOptions implícito para 2 opciones).
- **Nota:** `exposureMs` declarado pero no usado (variable muerta).

### `BuildWordScreen.jsx`
- **Funciona:** armar palabra por sílabas, drag-style tap, TTS.
- **Bug:** `onFinish(isCorrect ? 1 : 0, words.length)` — al terminar la última palabra, envía solo 0 o 1 como score en vez del score acumulado (`score`). Todas las sesiones de BuildWord reportarán score máximo 1.
- **Nota:** `exposureMs` declarado pero no usado.

### `ListenScreen.jsx`
- **Funciona:** discriminación auditiva, presentación secuencial opcional, opciones reducidas, TTS auto.
- **Nota:** `exposureMs` declarado pero no usado.

### `SemanticScreen.jsx`
- **Funciona:** ejercicios de opuestos + definiciones mezclados, TTS en cada opción, feedback.
- **Nota:** `exposureMs` declarado pero no usado.

### `SyntaxScreen.jsx`
- **Funciona:** completar frases con conectores, opciones reducidas, feedback con explicación.
- **Nota:** `exposureMs` declarado pero no usado.

### `NarrativeScreen.jsx`
- **Funciona:** reordenar viñetas de historia (swap por tap), verificar orden, feedback.
- **Nota:** `exposureMs` declarado pero no usado.

### `PragmaticScreen.jsx`
- **Funciona:** inferencias sociales con situación + pregunta, opciones reducidas.
- **Nota:** `exposureMs` declarado pero no usado.

---

## 4. Estado del PatientContext

### Campos del paciente

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string\|null | ID único (timestamp) |
| `rut` | string | RUT chileno formateado |
| `name` | string | Nombre del paciente |
| `birthDate` | string | ISO date |
| `ageMonths` | number | Edad en meses |
| `phone` | string | Teléfono opcional |
| `guardianName` | string | Nombre del tutor |
| `diagnosis` | `'tel'`\|`'tl_tea'`\|`'tl_tdah'`\|`'tl_tea_tdah'` | |
| `levelId` | `'N1'`…`'N7'` | Nivel actual |
| `stars` | number | Estrellas acumuladas |
| `sessionsCompleted` | number | Contador de sesiones |
| `sessionHistory` | array | Entradas de actividad y notas |
| `profilePhoto` | string\|null | Base64 de foto |
| `componentLevels` | `{fonologico, lexico, morfosintactico, pragmatico}` | Cada uno: `'inicial'`\|`'intermedio'`\|`'avanzado'` |
| `milestones` | `{[id]: state}` | Estado por hito (añadido dinámicamente) |
| `createdAt` | ISO string | |
| `updatedAt` | ISO string | |

### Acciones expuestas
`updatePatient`, `advanceLevel`, `decreaseLevel`, `addStars`, `setDiagnosis`, `setLevelById`, `setLevelByAge`, `loadPatient`, `addSessionEntry`, `resetPatient`, `updateStimulusSettings`, `loadStimulusSettings`

### Stimulus settings (separado del paciente)
Almacenado en `localStorage('auraplay_stimulus_settings')`. Campos: `simultaneousAudioVisual`, `animationsEnabled`, `backgroundElements`, `reducedOptions`, `largerText`, `sequentialStimulus`, `extendedExposureTime`, `simplifiedInstructions`, `wordSpeakDelay`, `slideTransitionDelay`, `exerciseCount` (por actividad, rango 8–20).

---

## 5. Estado de levels.js

### Niveles implementados

| ID | Rango | Descripción |
|---|---|---|
| N1 | 18–24 meses | Holofrase y primeras combinaciones |
| N2 | 2–2,11 años | Estructura S+V, habla telegráfica |
| N3 | 3–3,11 años | Oraciones 3-4 palabras, causa-efecto |
| N4 | 4–4,11 años | Verbos auxiliares, causales |
| N5 | 5–5,11 años | Dominio gramatical básico, narrativa |
| N6 | 6–6,11 años | Subordinadas, conectores adversativos |
| N7 | 7–12 años | Lenguaje figurado, metáforas |

### Diagnósticos implementados

| Key | Label | Color |
|---|---|---|
| `tel` | TEL/TDL | #4aab8a (verde) |
| `tl_tea` | TL asociado a TEA | #7c6bb0 (púrpura) |
| `tl_tdah` | TL asociado a TDAH | #e8a020 (naranja) |
| `tl_tea_tdah` | TL asociado a TEA y TDAH | #e07a5f (coral) |

Cada diagnóstico configura 8 parámetros de estímulo por defecto (animaciones, audio/visual, etc.).

---

## 6. Contenido JSON disponible

Cada nivel tiene 3 dificultades: `inicial`, `intermedio`, `avanzado`. Números = cantidad de ítems.

### minimalPairs

| Nivel | inicial | intermedio | avanzado |
|---|---|---|---|
| N1 | 6 | 6 | 5 |
| N2 | 6 | 5 | 5 |
| N3 | 5 | 5 | 5 |
| N4 | 4 | 4 | 4 |
| N5 | 4 | 4 | 4 |
| N6 | 4 | 4 | 4 |
| N7 | 4 | 4 | 4 |

### buildWords

| Nivel | inicial | intermedio | avanzado |
|---|---|---|---|
| N1 | 16 | 2 | **0** |
| N2 | 11 | 5 | **0** |
| N3 | 5 | 8 | 3 |
| N4 | 2 | 7 | 3 |
| N5 | 4 | 5 | 3 |
| N6 | **0** | 1 | 11 |
| N7 | 4 | 4 | 4 |

### listenRounds

| Nivel | inicial | intermedio | avanzado |
|---|---|---|---|
| N1 | 6 | 6 | 6 |
| N2 | 6 | 5 | 5 |
| N3–N7 | 4–5 | 4–5 | 4–5 |

### connectors (Sintaxis)

| Nivel | inicial | intermedio | avanzado |
|---|---|---|---|
| N1 | **0** | **0** | **0** |
| N2–N7 | 4–5 | 4–5 | 4–5 |

### opposites (Semántica)

| Nivel | inicial | intermedio | avanzado |
|---|---|---|---|
| N1 | **0** | **0** | **0** |
| N2 | **0** | **0** | **0** |
| N3–N7 | 4–5 | 4–5 | 4–5 |

### definitions (Semántica)

| Nivel | inicial | intermedio | avanzado |
|---|---|---|---|
| N1 | **0** | **0** | **0** |
| N2 | **0** | **0** | **0** |
| N3 | 4 | 4 | 4 |
| N4 | **0** | **0** | **0** |
| N5–N7 | 4 | 4 | 4 |

### narrativeSequences (Narrativa)

| Nivel | inicial | intermedio | avanzado |
|---|---|---|---|
| N1 | **0** | **0** | **0** |
| N2 | **0** | **0** | **0** |
| N3 | 4 | 4 | 4 |
| N4 | **0** | **0** | **0** |
| N5–N7 | 4 | 3 | 3 |

### inferences (Pragmática)

| Nivel | inicial | intermedio | avanzado |
|---|---|---|---|
| N1 | **0** | **0** | **0** |
| N2 | **0** | **0** | **0** |
| N3–N7 | 4–5 | 4–5 | 4–5 |

---

## 7. Pendientes detectados en el código

### Bugs confirmados

| Archivo | Línea aprox. | Problema |
|---|---|---|
| `BuildWordScreen.jsx` | 72 | `onFinish(isCorrect ? 1 : 0, words.length)` — score siempre ≤ 1; debe pasar `score` acumulado |
| `TherapistPanel.jsx` | 1322 | `estimulusSettings` no está en scope de `handleSaveSession`; referencia undefined |
| `ProgressScreen.jsx` | 105 | Filtra `e.type === 'note'` pero el tipo guardado es `'nota_clinica'`; conteo de sesiones y notas recientes siempre muestra 0 para entradas del Panel |

### Hardcodes / valores magic

| Archivo | Problema |
|---|---|
| `TherapistPanel.jsx:7` | `const PIN = '1234'` — sin configuración |
| `HomeScreen.jsx:16-50` | `progressPct` hardcodeados (72, 60, 40, 55) — no usa datos reales |
| `App.jsx:38`, `TherapistPanel.jsx:115`, `PatientSelectScreen.jsx:77` | `diagnosis: 'tdl'` como default — `'tdl'` no es un diagnóstico válido (debería ser `'tel'`) |

### Variables declaradas pero no usadas

`exposureMs` declarado en todas las pantallas de actividad (MinimalPairs, BuildWord, Listen, Semantic, Syntax, Narrative, Pragmatic) pero nunca leído. El delay entre ejercicios no está implementado vía este valor.

### Warnings de console esperados
- `console.warn('No se pudo guardar en localStorage')` en `patients.js` y `PatientContext.jsx` — manejo de errores correcto pero presente.

---

## 8. Lo que ya funciona vs. lo que falta

### ✅ Funciona

- Flujo completo: selección/creación de paciente → sesión → resultado → historial
- 7 actividades terapéuticas funcionales con feedback visual y TTS
- 7 niveles (N1–N7) con 3 dificultades por actividad basadas en `componentLevels`
- 4 diagnósticos con perfiles de estímulo independientes y configurables
- Panel del terapeuta con PIN, registro de notas clínicas con análisis lingüístico automático
- Exportación de informe (.txt) y historial al portapapeles
- Persistencia dual: contexto activo + roster de pacientes en localStorage
- Hitos del desarrollo por nivel con estados (no iniciado / en proceso / logrado)
- Configuración de estímulos (8 toggles + 2 sliders de velocidad + conteo de ejercicios por actividad)
- Migración de datos al cambiar nombres de diagnósticos

### ❌ Falta / Roto

- **Score acumulado en BuildWord** — bug crítico que afecta todas las sesiones de esa actividad
- **Filtro de tipo en ProgressScreen** — las notas clínicas del panel nunca aparecen en el progreso
- **Progreso semanal en HomeScreen** — barras no reflejan datos reales
- **Contenido vacío en N1 y N2** — las actividades Semántica, Sintaxis, Narrativa e Inferencias no tienen ítems; mostrarán "No hay ejercicios disponibles"
- **Definitions vacías en N4** — Semántica solo mostrará opuestos
- **Narrativa vacía en N4** — actividad no disponible para ese nivel
- **BuildWords sin datos** — N1/avanzado, N2/avanzado, N6/inicial están vacíos
- **PIN no configurable** — fijo en '1234'
- **`estimulusSettings` en handleSaveSession** — referencia rota; el botón "Guardar sesión" del menú principal del panel no guarda los settings de estímulo
- **Diagnosis default 'tdl' inválido** — en 3 formularios distintos
