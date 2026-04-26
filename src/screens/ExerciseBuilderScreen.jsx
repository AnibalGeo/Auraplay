/**
 * ExerciseBuilderScreen.jsx — v3
 * Modo crear + modo editar | Toast | Wizard 2 pasos | Validación completa
 *
 * Props:
 *   onBack         () → void
 *   onSaved        () → void
 *   exerciseToEdit object|null  — si viene, activa modo edición
 */

import { useState, useEffect, useCallback } from 'react'
import { saveCustomExercise, updateCustomExercise } from '../data/customExercises'
import { getContent } from '../data/getContent'
import {
  ACTIVITY_TYPES, LEVELS, DIFFICULTIES, COMPONENTS, INITIAL_META,
  VALIDATORS, buildExerciseContent, parseExerciseForEdit,
} from '../data/exerciseBuilderUtils'
import {
  Field, TextInput, EmojiPicker,
  SyntaxForm, CategoryForm, FollowInstructionForm,
} from '../components/exerciseBuilderForms'

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message, type = 'success', visible }) {
  const colors = {
    success: 'bg-emerald-500',
    error:   'bg-red-500',
  }
  return (
    <div
      className={`fixed top-4 left-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg
        text-white text-sm font-semibold transition-all duration-300 max-w-xs
        ${colors[type]} ${visible ? 'opacity-100 -translate-x-1/2 translate-y-0' : 'opacity-0 -translate-x-1/2 -translate-y-4 pointer-events-none'}`}
      style={{ maxWidth: 320 }}
    >
      <span>{type === 'success' ? '✓' : '⚠️'}</span>
      <span>{message}</span>
    </div>
  )
}

function useToast() {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })

  const show = useCallback((message, type = 'success', duration = 2200) => {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), duration)
  }, [])

  return { toast, show }
}

// ── DuplicateNativePanel ───────────────────────────────────────────────────────

function DuplicateNativePanel({ onSelect, onCancel }) {
  const [levelId, setLevelId] = useState('N4')
  const [type, setType]       = useState('syntax')

  const nativeItems = (() => {
    const c = getContent(levelId)
    if (type === 'syntax')             return (c?.connectors?.inicial || []).slice(0, 6)
    if (type === 'category')           return (c?.categories?.inicial || []).slice(0, 6)
    if (type === 'follow-instruction') return (c?.instructions?.inicial || []).slice(0, 6)
    return []
  })()

  function previewNative(item) {
    if (type === 'syntax')   return item.sentence
    if (type === 'category') return `${item.category} — intruso: ${item.intruder?.word}`
    return item.instruction || item.text || JSON.stringify(item).slice(0, 60)
  }

  function buildContent(item) {
    if (type === 'syntax') return {
      sentence:    item.sentence,
      correct:     item.correct,
      distractors: item.options?.filter(o => o !== item.correct) || [],
      explanation: item.explanation || '',
    }
    if (type === 'category') return {
      category: item.category,
      intruder:  item.intruder,
      members:   item.options?.filter(o => o.word !== item.intruder?.word) || [],
    }
    return {
      instruction:     item.instruction || item.text || '',
      correctResponse: item.correctResponse || '',
      materials:       item.materials || '',
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
      <div className="bg-white rounded-t-3xl w-full max-h-[80vh] flex flex-col" style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-800">Duplicar ejercicio nativo</h2>
            <p className="text-xs text-gray-400">Elige uno como base y edítalo</p>
          </div>
          <button onClick={onCancel} className="w-8 h-8 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center text-lg">×</button>
        </div>

        {/* Filtro nivel */}
        <div className="px-4 py-3 flex gap-1 border-b border-gray-50 overflow-x-auto">
          {LEVELS.map(l => (
            <button key={l} onClick={() => setLevelId(l)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                levelId === l ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >{l}</button>
          ))}
        </div>

        {/* Filtro tipo */}
        <div className="px-4 py-2 flex gap-2 border-b border-gray-50">
          {[
            { id: 'syntax',             label: '🧩 Frases' },
            { id: 'category',           label: '🔍 Categorías' },
            { id: 'follow-instruction', label: '📢 Instrucciones' },
          ].map(t => (
            <button key={t.id} onClick={() => setType(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                type === t.id ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-500 border-gray-200'
              }`}
            >{t.label}</button>
          ))}
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {nativeItems.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">Sin ejercicios disponibles</p>
          )}
          {nativeItems.map((item, i) => (
            <button
              key={i}
              onClick={() => onSelect({ type, content: buildContent(item) })}
              className="w-full text-left bg-gray-50 hover:bg-teal-50 border border-gray-100 hover:border-teal-200 
                rounded-xl px-4 py-3 transition-all"
            >
              <p className="text-sm text-gray-700 truncate">{previewNative(item)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{levelId} · inicial</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function ExerciseBuilderScreen({ onBack, onSaved, exerciseToEdit = null }) {
  const isEditMode = Boolean(exerciseToEdit)

  const [step,       setStep]       = useState(1)
  const [meta,       setMeta]       = useState(INITIAL_META)
  const [content,    setContent]    = useState({})
  const [error,      setError]      = useState('')
  const [showNative, setShowNative] = useState(false)
  const { toast, show: showToast }  = useToast()

  // Pre-cargar datos si estamos en modo edición
  useEffect(() => {
    if (isEditMode && exerciseToEdit) {
      const { meta: parsedMeta, content: parsedContent } = parseExerciseForEdit(exerciseToEdit)
      setMeta(parsedMeta)
      setContent(parsedContent)
    }
  }, [exerciseToEdit])

  function handleMeta(changes) {
    // Si cambia el tipo de actividad, limpiar contenido solo si NO estamos editando
    if (changes.activityType && changes.activityType !== meta.activityType && !isEditMode) {
      setContent({})
    }
    setMeta(m => ({ ...m, ...changes }))
    setError('')
  }

  function handleNext() {
    if (!meta.title.trim()) { setError('El nombre es obligatorio'); return }
    if (!meta.activityType) { setError('Selecciona un tipo de actividad'); return }
    if (!meta.allLevels && !meta.levelId) { setError('Selecciona un nivel'); return }
    setStep(2)
    setError('')
  }

  function handleSave() {
    const validator = VALIDATORS[meta.activityType]
    const err = validator?.(content)
    if (err) { setError(err); return }

    const exerciseContent = buildExerciseContent(meta.activityType, content)

    const payload = {
      title:        meta.title,
      activityType: meta.activityType,
      levelId:      meta.levelId,
      allLevels:    meta.allLevels,
      difficulty:   meta.difficulty,
      components:   meta.components,
      content:      exerciseContent,
    }

    let result
    if (isEditMode) {
      result = updateCustomExercise(exerciseToEdit.id, payload)
    } else {
      result = saveCustomExercise(payload)
    }

    if (!result) {
      showToast('Error al guardar. Revisa los campos.', 'error')
      return
    }

    showToast(
      isEditMode ? '✓ Ejercicio actualizado' : '✓ Ejercicio guardado',
      'success'
    )
    setTimeout(() => onSaved?.(), 1400)
  }

  function handleNativeSelect({ type, content: nativeContent }) {
    handleMeta({ activityType: type })
    setContent(nativeContent)
    setShowNative(false)
    setStep(2)
  }

  const selectedType = ACTIVITY_TYPES.find(t => t.id === meta.activityType)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={step === 2 ? () => { setStep(1); setError('') } : onBack}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 text-sm hover:bg-gray-50 transition-colors"
        >←</button>

        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-gray-800 truncate">
            {isEditMode
              ? (step === 2 && meta.title ? meta.title : 'Editar ejercicio')
              : (step === 2 && meta.title ? meta.title : 'Nuevo ejercicio')
            }
          </h1>
          <p className="text-xs text-gray-400">
            {isEditMode
              ? (step === 1 ? 'Editando · Configuración' : 'Editando · Contenido')
              : (step === 1 ? 'Paso 1 de 2 · Configuración' : 'Paso 2 de 2 · Contenido')
            }
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 shrink-0">
          <div className={`h-1 rounded-full transition-all duration-300 ${step >= 1 ? 'w-8 bg-teal-500' : 'w-4 bg-gray-200'}`} />
          <div className={`h-1 rounded-full transition-all duration-300 ${step >= 2 ? 'w-8 bg-teal-500' : 'w-4 bg-gray-200'}`} />
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 px-4 pt-5 pb-32 max-w-lg mx-auto w-full space-y-6">

        {/* ── Paso 1: Configuración ─────────────────────────────────────────── */}
        {step === 1 && (
          <>
            {/* Duplicar nativo — solo en modo crear */}
            {!isEditMode && (
              <>
                <button
                  onClick={() => setShowNative(true)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border border-dashed border-teal-300 
                    rounded-2xl text-left hover:bg-teal-50 hover:border-teal-400 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-lg shrink-0 
                    group-hover:bg-teal-200 transition-colors">✨</div>
                  <div>
                    <p className="text-sm font-semibold text-teal-700">Partir de un ejercicio nativo</p>
                    <p className="text-xs text-teal-500">Elige uno existente y personalízalo</p>
                  </div>
                  <span className="ml-auto text-teal-400 text-sm">›</span>
                </button>

                <div className="relative flex items-center">
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="mx-3 text-xs text-gray-400 font-medium">o crea desde cero</span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>
              </>
            )}

            {/* Nombre */}
            <Field label="Nombre del ejercicio">
              <TextInput
                value={meta.title}
                onChange={v => handleMeta({ title: v })}
                placeholder='Ej: Conectores causales con animales'
                autoFocus={!isEditMode}
              />
            </Field>

            {/* Tipo de actividad */}
            <Field label="Tipo de actividad">
              <div className="space-y-2">
                {ACTIVITY_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => handleMeta({ activityType: type.id })}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${
                      meta.activityType === type.id
                        ? `${type.bg} ring-2 ${type.ring} border-transparent`
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${
                      meta.activityType === type.id ? type.bg : 'bg-gray-100'
                    }`}>{type.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{type.label}</p>
                      <p className="text-xs text-gray-400 truncate">{type.desc}</p>
                    </div>
                    {meta.activityType === type.id && (
                      <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Field>

            {/* Nivel */}
            <Field label="Nivel AuraPlay">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1.5 flex-wrap">
                  {!meta.allLevels && LEVELS.map(l => (
                    <button key={l} onClick={() => handleMeta({ levelId: l })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        meta.levelId === l
                          ? 'bg-teal-500 text-white border-teal-500'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300'
                      }`}
                    >{l}</button>
                  ))}
                  {meta.allLevels && (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-100 text-teal-700">
                      Todos los niveles
                    </span>
                  )}
                </div>
                <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer shrink-0 ml-2">
                  <input
                    type="checkbox"
                    checked={meta.allLevels}
                    onChange={e => handleMeta({ allLevels: e.target.checked })}
                    className="accent-teal-500 w-3.5 h-3.5"
                  />
                  Todos
                </label>
              </div>
            </Field>

            {/* Dificultad */}
            <Field label="Dificultad">
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map(d => (
                  <button key={d.id} onClick={() => handleMeta({ difficulty: d.id })}
                    className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                      meta.difficulty === d.id
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >{d.label}</button>
                ))}
              </div>
            </Field>

            {/* Componentes terapéuticos */}
            <Field label="Componentes terapéuticos" hint="opcional">
              <div className="flex flex-wrap gap-1.5">
                {COMPONENTS.map(c => {
                  const active = meta.components.includes(c)
                  return (
                    <button key={c}
                      onClick={() => handleMeta({
                        components: active
                          ? meta.components.filter(x => x !== c)
                          : [...meta.components, c]
                      })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        active
                          ? 'bg-teal-500 text-white border-teal-500'
                          : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                      }`}
                    >{c}</button>
                  )
                })}
              </div>
            </Field>
          </>
        )}

        {/* ── Paso 2: Contenido ─────────────────────────────────────────────── */}
        {step === 2 && (
          <>
            {/* Chip resumen */}
            <div className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-gray-100">
              <span className="text-lg">{selectedType?.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate">{selectedType?.label}</p>
                <p className="text-xs text-gray-400">
                  {meta.allLevels ? 'Todos los niveles' : meta.levelId} · {meta.difficulty}
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-teal-600 font-medium hover:underline shrink-0"
              >
                Editar
              </button>
            </div>

            {meta.activityType === 'syntax' && (
              <SyntaxForm content={content} onChange={setContent} />
            )}
            {meta.activityType === 'category' && (
              <CategoryForm content={content} onChange={setContent} />
            )}
            {meta.activityType === 'follow-instruction' && (
              <FollowInstructionForm content={content} onChange={setContent} />
            )}
          </>
        )}
      </div>

      {/* Footer fijo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto space-y-2">
          {error && (
            <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {step === 1 ? (
            <button
              onClick={handleNext}
              className="w-full py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm rounded-2xl transition-colors"
            >
              Continuar →
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setStep(1); setError('') }}
                className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-2xl hover:bg-gray-50 transition-colors"
              >
                ← Volver
              </button>
              <button
                onClick={handleSave}
                className="flex-[2] py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm rounded-2xl transition-colors"
              >
                {isEditMode ? '💾 Actualizar ejercicio' : '💾 Guardar ejercicio'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal duplicar nativo */}
      {showNative && (
        <DuplicateNativePanel
          onSelect={handleNativeSelect}
          onCancel={() => setShowNative(false)}
        />
      )}
    </div>
  )
}
