/**
 * MyExercisesScreen.jsx — v2
 * Gestión de ejercicios personalizados — AuraPlay
 * Polish visual completo: jerarquía clara, badges neutros, acciones limpias
 */

import { useState } from 'react'
import {
  getAllCustomExercises,
  deleteCustomExercise,
  duplicateCustomExercise,
} from '../data/customExercises'

// ─── Config visual ────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  syntax:              { label: 'Completar Frases',    emoji: '🧩', dot: 'bg-orange-300' },
  category:            { label: '¿Cuál no pertenece?', emoji: '🔍', dot: 'bg-purple-300' },
  'follow-instruction':{ label: 'Sigue la Instrucción',emoji: '📢', dot: 'bg-teal-400'   },
}

const DIFF_LABEL = {
  inicial:    'Inicial',
  intermedio: 'Intermedio',
  avanzado:   'Avanzado',
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', year: '2-digit',
  })
}

function previewText(ex) {
  if (ex.activityType === 'syntax')
    return ex.content?.sentence || '—'
  if (ex.activityType === 'category')
    return ex.content?.category
      ? `📦 ${ex.content.category} · intruso: ${ex.content.intruder?.word || '—'}`
      : '—'
  if (ex.activityType === 'follow-instruction')
    return ex.content?.instruction || '—'
  return '—'
}

// ─── Card de ejercicio ────────────────────────────────────────────────────────

function ExerciseCard({ ex, onEdit, onDuplicate, onDelete }) {
  const type = TYPE_CONFIG[ex.activityType] || { label: ex.activityType, emoji: '📝', dot: 'bg-gray-300' }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        {/* Fila superior: tipo + fecha */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${type.dot}`} />
            <span className="text-xs text-gray-400 font-medium">{type.label}</span>
          </div>
          <span className="text-xs text-gray-300">{formatDate(ex.createdAt)}</span>
        </div>

        {/* Título */}
        <p className="text-sm font-bold text-gray-800 leading-snug mb-2">{ex.title}</p>

        {/* Chips de nivel y dificultad */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <span className="text-xs bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-md">
            {ex.allLevels ? 'Todos los niveles' : ex.levelId}
          </span>
          {ex.difficulty && (
            <span className="text-xs bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-md">
              {DIFF_LABEL[ex.difficulty] || ex.difficulty}
            </span>
          )}
        </div>

        {/* Preview del contenido */}
        <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 truncate leading-relaxed">
          {previewText(ex)}
        </p>
      </div>

      {/* Acciones */}
      <div className="border-t border-gray-50 px-4 py-2.5 flex gap-1">
        <button
          onClick={() => onEdit(ex)}
          className="flex-1 py-2 text-xs font-semibold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          ✏️ Editar
        </button>
        <div className="w-px bg-gray-100 my-1" />
        <button
          onClick={() => onDuplicate(ex.id)}
          className="flex-1 py-2 text-xs font-semibold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          📋 Duplicar
        </button>
        <div className="w-px bg-gray-100 my-1" />
        <button
          onClick={() => onDelete(ex.id)}
          className="flex-1 py-2 text-xs font-semibold text-red-400 rounded-lg hover:bg-red-50 transition-colors"
        >
          🗑 Eliminar
        </button>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filtered, onNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-4">
        {filtered ? '🔍' : '📝'}
      </div>
      <h3 className="text-sm font-bold text-gray-600 mb-1">
        {filtered ? 'Sin resultados' : 'Sin ejercicios aún'}
      </h3>
      <p className="text-xs text-gray-400 mb-5 max-w-xs">
        {filtered
          ? 'No hay ejercicios de este tipo. Prueba con otro filtro.'
          : 'Crea tu primer ejercicio personalizado para adaptarlo a tus pacientes.'}
      </p>
      {!filtered && (
        <button
          onClick={onNew}
          className="px-5 py-2.5 bg-teal-500 text-white text-sm font-bold rounded-xl"
        >
          ✨ Crear ejercicio
        </button>
      )}
    </div>
  )
}

// ─── Confirm delete modal ─────────────────────────────────────────────────────

function DeleteModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-2xl mb-4">
          🗑
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-1">¿Eliminar ejercicio?</h3>
        <p className="text-sm text-gray-400 mb-5">Esta acción no se puede deshacer.</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Export principal ─────────────────────────────────────────────────────────

const FILTERS = [
  { id: 'all',               label: 'Todos' },
  { id: 'syntax',            label: '🧩 Frases' },
  { id: 'category',          label: '🔍 Categorías' },
  { id: 'follow-instruction',label: '📢 Instrucciones' },
]

export default function MyExercisesScreen({ onBack, onEdit, onNew }) {
  const [exercises,      setExercises]      = useState(getAllCustomExercises)
  const [confirmDelete,  setConfirmDelete]  = useState(null)
  const [filter,         setFilter]         = useState('all')

  const filtered = filter === 'all'
    ? exercises
    : exercises.filter(e => e.activityType === filter)

  function handleDelete(id) {
    deleteCustomExercise(id)
    setExercises(getAllCustomExercises())
    setConfirmDelete(null)
  }

  function handleDuplicate(id) {
    duplicateCustomExercise(id)
    setExercises(getAllCustomExercises())
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 text-sm hover:bg-gray-50 transition-colors"
        >←</button>

        <div className="flex-1">
          <h1 className="text-sm font-bold text-gray-800">Mis ejercicios</h1>
          <p className="text-xs text-gray-400">
            {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={onNew}
          className="px-3 py-1.5 bg-teal-500 text-white text-xs font-bold rounded-xl hover:bg-teal-600 transition-colors"
        >
          + Nuevo
        </button>
      </div>

      {/* Filtros */}
      <div className="px-4 pt-3 pb-2 flex gap-1.5 overflow-x-auto">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap transition-all ${
              filter === f.id
                ? 'bg-teal-500 text-white border-teal-500'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="flex-1 px-4 py-3 max-w-lg mx-auto w-full space-y-3 pb-8">
        {filtered.length === 0 ? (
          <EmptyState filtered={filter !== 'all'} onNew={onNew} />
        ) : (
          filtered.map(ex => (
            <ExerciseCard
              key={ex.id}
              ex={ex}
              onEdit={onEdit}
              onDuplicate={handleDuplicate}
              onDelete={setConfirmDelete}
            />
          ))
        )}
      </div>

      {/* Modal eliminar */}
      {confirmDelete && (
        <DeleteModal
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
