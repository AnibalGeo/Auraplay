/**
 * exerciseBuilderForms.jsx
 * Formularios de contenido por tipo de actividad — AuraPlay
 * SyntaxForm | CategoryForm | FollowInstructionForm | EmojiPicker | Field
 */

import { useState } from 'react'
import { EMOJIS } from './exerciseBuilderUtils'

// ── Field ──────────────────────────────────────────────────────────────────────

export function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

// ── TextInput ──────────────────────────────────────────────────────────────────

export function TextInput({ value, onChange, placeholder, className = '', ...props }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 
        placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent 
        transition-all bg-white ${className}`}
      {...props}
    />
  )
}

// ── EmojiPicker ────────────────────────────────────────────────────────────────

export function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-11 h-11 rounded-xl border-2 text-xl flex items-center justify-center transition-all
          ${open ? 'border-teal-400 bg-teal-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
      >
        {value || <span className="text-gray-300 text-base">+</span>}
      </button>
      {open && (
        <div className="absolute z-20 top-13 left-0 mt-1 bg-white border border-gray-100 rounded-2xl 
          shadow-xl p-3 grid grid-cols-5 gap-1 w-56">
          {EMOJIS.map(e => (
            <button
              key={e}
              type="button"
              onClick={() => { onChange(e); setOpen(false) }}
              className="w-9 h-9 text-lg rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── SyntaxForm ─────────────────────────────────────────────────────────────────

export function SyntaxForm({ content, onChange }) {
  const distractors = content.distractors || ['', '']

  function setDistractor(i, val) {
    const d = [...distractors]; d[i] = val
    onChange({ ...content, distractors: d })
  }

  return (
    <div className="space-y-5">
      <Field label="Frase incompleta" hint="usa ___ para el espacio">
        <TextInput
          value={content.sentence || ''}
          onChange={v => onChange({ ...content, sentence: v })}
          placeholder='Ej: El perro hace ___ cuando está feliz.'
        />
        {content.sentence && !content.sentence.includes('___') && (
          <p className="text-xs text-amber-500 mt-1">⚠️ Falta ___ en la frase</p>
        )}
      </Field>

      {/* Preview inline */}
      {content.sentence?.includes('___') && content.correct && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-xs text-gray-400 font-medium mb-1">Vista previa</p>
          <p className="text-sm text-gray-700">
            {content.sentence.split('___').map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="inline-block bg-teal-100 text-teal-700 font-semibold px-2 py-0.5 rounded-lg mx-1 text-xs">
                    {content.correct}
                  </span>
                )}
              </span>
            ))}
          </p>
        </div>
      )}

      <Field label="Respuesta correcta">
        <TextInput
          value={content.correct || ''}
          onChange={v => onChange({ ...content, correct: v })}
          placeholder='Ej: guau'
          className="border-emerald-200 focus:ring-emerald-400 bg-emerald-50"
        />
      </Field>

      <Field label="Opciones incorrectas" hint="mínimo 1">
        <div className="space-y-2">
          {distractors.map((d, i) => (
            <div key={i} className="flex gap-2 items-center">
              <TextInput
                value={d}
                onChange={v => setDistractor(i, v)}
                placeholder={`Distractor ${i + 1}`}
                className="border-rose-100 focus:ring-rose-300 bg-rose-50"
              />
              {distractors.length > 1 && (
                <button
                  type="button"
                  onClick={() => onChange({ ...content, distractors: distractors.filter((_, j) => j !== i) })}
                  className="w-9 h-9 rounded-xl bg-gray-100 text-gray-400 text-lg flex items-center justify-center hover:bg-gray-200 shrink-0"
                >×</button>
              )}
            </div>
          ))}
        </div>
        {distractors.length < 3 && (
          <button
            type="button"
            onClick={() => onChange({ ...content, distractors: [...distractors, ''] })}
            className="mt-1.5 text-xs text-teal-600 font-semibold hover:underline"
          >+ Agregar opción</button>
        )}
      </Field>

      <Field label="Explicación" hint="opcional, para el feedback">
        <TextInput
          value={content.explanation || ''}
          onChange={v => onChange({ ...content, explanation: v })}
          placeholder='Ej: "Guau" es el sonido del perro.'
        />
      </Field>
    </div>
  )
}

// ── CategoryForm ───────────────────────────────────────────────────────────────

export function CategoryForm({ content, onChange }) {
  const members = content.members || [{ word: '', emoji: '' }, { word: '', emoji: '' }]

  function setMember(i, field, val) {
    const m = [...members]; m[i] = { ...m[i], [field]: val }
    onChange({ ...content, members: m })
  }

  return (
    <div className="space-y-5">
      <Field label="Nombre de la categoría">
        <TextInput
          value={content.category || ''}
          onChange={v => onChange({ ...content, category: v })}
          placeholder='Ej: Animales domésticos'
        />
      </Field>

      {/* Intruso */}
      <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 space-y-2">
        <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide">Intruso — no pertenece</p>
        <div className="flex gap-2 items-center">
          <EmojiPicker
            value={content.intruder?.emoji}
            onChange={emoji => onChange({ ...content, intruder: { ...content.intruder, emoji } })}
          />
          <TextInput
            value={content.intruder?.word || ''}
            onChange={v => onChange({ ...content, intruder: { ...content.intruder, word: v.toUpperCase() } })}
            placeholder='Ej: TIGRE'
            className="uppercase"
          />
        </div>
      </div>

      {/* Miembros */}
      <Field label="Miembros del grupo" hint="mínimo 2">
        <div className="space-y-2">
          {members.map((m, i) => (
            <div key={i} className="flex gap-2 items-center">
              <EmojiPicker
                value={m.emoji}
                onChange={emoji => setMember(i, 'emoji', emoji)}
              />
              <TextInput
                value={m.word}
                onChange={v => setMember(i, 'word', v.toUpperCase())}
                placeholder={`Miembro ${i + 1}`}
                className="uppercase"
              />
              {members.length > 2 && (
                <button
                  type="button"
                  onClick={() => onChange({ ...content, members: members.filter((_, j) => j !== i) })}
                  className="w-9 h-9 rounded-xl bg-gray-100 text-gray-400 text-lg flex items-center justify-center hover:bg-gray-200 shrink-0"
                >×</button>
              )}
            </div>
          ))}
        </div>
        {members.length < 4 && (
          <button
            type="button"
            onClick={() => onChange({ ...content, members: [...members, { word: '', emoji: '' }] })}
            className="mt-1.5 text-xs text-purple-600 font-semibold hover:underline"
          >+ Agregar miembro</button>
        )}
      </Field>

      {/* Preview */}
      {content.category && content.intruder?.word && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-400 font-medium mb-2">Vista previa</p>
          <p className="text-xs text-gray-500 mb-3">
            ¿Cuál NO pertenece a <strong className="text-gray-700">{content.category}</strong>?
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[...members.filter(m => m.word), content.intruder].filter(Boolean).slice(0, 4).map((item, i) => (
              <div key={i} className={`rounded-xl p-2 text-center border ${
                item.word === content.intruder?.word
                  ? 'border-rose-300 bg-rose-50'
                  : 'border-gray-200 bg-white'
              }`}>
                <div className="text-2xl">{item.emoji || '?'}</div>
                <div className="text-xs font-bold mt-1 truncate">{item.word}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── FollowInstructionForm ──────────────────────────────────────────────────────

export function FollowInstructionForm({ content, onChange }) {
  return (
    <div className="space-y-5">
      <Field label="Instrucción" hint="lo que el terapeuta dice en voz alta">
        <textarea
          value={content.instruction || ''}
          onChange={e => onChange({ ...content, instruction: e.target.value })}
          placeholder='Ej: Toca primero la mesa y luego señala la puerta.'
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 
            placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 
            focus:border-transparent transition-all bg-white resize-none"
        />
      </Field>

      <Field label="Respuesta esperada" hint="lo que debe hacer el niño">
        <TextInput
          value={content.correctResponse || ''}
          onChange={v => onChange({ ...content, correctResponse: v })}
          placeholder='Ej: Toca la mesa y señala la puerta en ese orden.'
        />
      </Field>

      <Field label="Material necesario" hint="opcional">
        <TextInput
          value={content.materials || ''}
          onChange={v => onChange({ ...content, materials: v })}
          placeholder='Ej: Mesa, silla, objetos de colores'
        />
      </Field>

      <Field label="Apoyo visual" hint="opcional — emoji de referencia">
        <div className="flex gap-3 items-center">
          <EmojiPicker
            value={content.visual}
            onChange={v => onChange({ ...content, visual: v })}
          />
          <p className="text-xs text-gray-400">
            Elige un emoji que represente la instrucción
          </p>
        </div>
      </Field>

      {/* Preview */}
      {content.instruction && (
        <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
          <p className="text-xs text-teal-600 font-semibold mb-2">Vista previa</p>
          {content.visual && <div className="text-4xl mb-2">{content.visual}</div>}
          <p className="text-sm text-gray-700 font-medium">{content.instruction}</p>
          {content.correctResponse && (
            <p className="text-xs text-gray-400 mt-2">
              ✓ Respuesta esperada: {content.correctResponse}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
