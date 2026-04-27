/**
 * AppointmentModal.jsx
 * Modal crear / editar cita — AuraPlay Agenda
 */

import { useState, useEffect } from 'react'
import { getAllPatients } from '../../data/patients'
import {
  DAY_NAMES, DURATION_OPTIONS, RECURRING_OPTIONS,
  detectConflict, generateTimeSlots, endTime,
} from './schedulerUtils'

function Field({ label, children, hint }) {
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

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 
        bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value ?? o.id} value={o.value ?? o.id}>{o.label}</option>
      ))}
    </select>
  )
}

const EMPTY_FORM = {
  patientId:     '',
  patientName:   '',
  patientPhone:  '',
  isAdHoc:       false,
  dayOfWeek:     '',
  startTime:     '09:00',
  duration:      45,
  bufferAfter:   15,
  recurringType: 'weekly',
  endDate:       '',
  notes:         '',
}

export default function AppointmentModal({ appointment, appointments, preselectedDay = null, onSave, onClose }) {
  const isEdit  = Boolean(appointment)
  const patients = getAllPatients()
  const timeSlots = generateTimeSlots('07:00', '20:00', 30)

  const [form,    setForm]    = useState(() => ({
    ...EMPTY_FORM,
    dayOfWeek: preselectedDay ? String(preselectedDay) : '',
  }))
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (appointment) {
      setForm({
        patientId:     appointment.patientId    ?? '',
        patientName:   appointment.patientName  ?? '',
        patientPhone:  appointment.patientPhone ?? '',
        isAdHoc:       !appointment.isRegistered,
        dayOfWeek:     String(appointment.dayOfWeek),
        startTime:     appointment.startTime,
        duration:      appointment.duration,
        bufferAfter:   appointment.bufferAfter  ?? 15,
        recurringType: appointment.recurring?.type ?? 'weekly',
        endDate:       appointment.recurring?.endDate ?? '',
        notes:         appointment.notes ?? '',
      })
    }
  }, [appointment])

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    setError('')
  }

  function handlePatientSelect(id) {
    const p = patients.find(x => x.id === id)
    if (p) {
      set('patientId', p.id)
      set('patientName', p.name)
    } else {
      set('patientId', '')
    }
  }

  function validate() {
    if (!form.isAdHoc && !form.patientId) return 'Selecciona un paciente'
    if (form.isAdHoc && !form.patientName.trim()) return 'Escribe el nombre del paciente'
    if (!form.dayOfWeek) return 'Selecciona el día'
    if (!form.startTime) return 'Selecciona la hora de inicio'

    // Detectar conflicto
    const conflict = detectConflict(
      appointments,
      Number(form.dayOfWeek),
      form.startTime,
      form.duration,
      appointment?.id
    )
    if (conflict) {
      return `Conflicto con cita de ${conflict.patientName} a las ${conflict.startTime}`
    }
    return null
  }

  function handleSubmit() {
    const err = validate()
    if (err) { setError(err); return }

    const payload = {
      patientId:     form.isAdHoc ? null  : form.patientId,
      patientName:   form.isAdHoc ? form.patientName.trim() : (patients.find(p => p.id === form.patientId)?.name ?? ''),
      patientPhone:  form.isAdHoc ? form.patientPhone.trim() : '',
      dayOfWeek:     Number(form.dayOfWeek),
      startTime:     form.startTime,
      duration:      Number(form.duration),
      bufferAfter:   Number(form.bufferAfter),
      recurringType: form.recurringType || null,
      endDate:       form.endDate || null,
      notes:         form.notes.trim(),
    }
    onSave(payload, appointment?.id)
  }

  const previewEnd = form.startTime && form.duration
    ? endTime(form.startTime, Number(form.duration))
    : null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="bg-white rounded-t-3xl w-full flex flex-col max-h-[92vh]"
        style={{ maxWidth: 480, margin: '0 auto' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-3 flex items-center justify-between border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              {isEdit ? 'Editar cita' : 'Nueva cita'}
            </h2>
            <p className="text-xs text-gray-400">
              {isEdit ? 'Modifica los datos de la cita' : 'Agenda una nueva sesión'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >✕</button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Tipo de paciente */}
          <div className="flex gap-2">
            <button
              onClick={() => set('isAdHoc', false)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                !form.isAdHoc ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-500 border-gray-200'
              }`}
            >👤 Desde mis pacientes</button>
            <button
              onClick={() => set('isAdHoc', true)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                form.isAdHoc ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-500 border-gray-200'
              }`}
            >➕ Cita puntual</button>
          </div>

          {/* Paciente */}
          {!form.isAdHoc ? (
            <Field label="Paciente">
              <Select
                value={form.patientId}
                onChange={handlePatientSelect}
                placeholder="Seleccionar paciente..."
                options={patients.map(p => ({ value: p.id, label: p.name }))}
              />
            </Field>
          ) : (
            <div className="space-y-3">
              <Field label="Nombre">
                <input
                  value={form.patientName}
                  onChange={e => set('patientName', e.target.value)}
                  placeholder="Nombre del paciente"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 
                    placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white"
                />
              </Field>
              <Field label="Teléfono" hint="opcional">
                <input
                  value={form.patientPhone}
                  onChange={e => set('patientPhone', e.target.value)}
                  placeholder="+56 9 ..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 
                    placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white"
                />
              </Field>
            </div>
          )}

          {/* Día */}
          <Field label="Día de la semana">
            <div className="flex gap-1.5">
              {[1,2,3,4,5].map(d => (
                <button
                  key={d}
                  onClick={() => set('dayOfWeek', String(d))}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    form.dayOfWeek === String(d)
                      ? 'bg-teal-500 text-white border-teal-500'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {['L','M','X','J','V'][d-1]}
                </button>
              ))}
            </div>
          </Field>

          {/* Hora */}
          <Field label="Hora de inicio">
            <Select
              value={form.startTime}
              onChange={v => set('startTime', v)}
              options={timeSlots.map(t => ({ value: t, label: t }))}
            />
          </Field>

          {/* Duración */}
          <Field label="Duración">
            <div className="grid grid-cols-4 gap-2">
              {DURATION_OPTIONS.map(d => (
                <button
                  key={d.value}
                  onClick={() => set('duration', d.value)}
                  className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                    Number(form.duration) === d.value
                      ? 'bg-teal-500 text-white border-teal-500'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >{d.label}</button>
              ))}
            </div>
          </Field>

          {/* Preview horario */}
          {previewEnd && form.dayOfWeek && (
            <div className="bg-teal-50 rounded-xl px-4 py-3 border border-teal-100 flex items-center gap-3">
              <span className="text-2xl">🕐</span>
              <div>
                <p className="text-sm font-semibold text-teal-800">
                  {DAY_NAMES[Number(form.dayOfWeek)]} {form.startTime} – {previewEnd}
                </p>
                <p className="text-xs text-teal-600">{form.duration} min de sesión + {form.bufferAfter} min buffer</p>
              </div>
            </div>
          )}

          {/* Recurrencia */}
          <Field label="Frecuencia">
            <div className="grid grid-cols-2 gap-2">
              {RECURRING_OPTIONS.map(r => (
                <button
                  key={String(r.value)}
                  onClick={() => set('recurringType', r.value)}
                  className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                    form.recurringType === r.value
                      ? 'bg-teal-500 text-white border-teal-500'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >{r.label}</button>
              ))}
            </div>
          </Field>

          {/* Fecha fin recurrencia */}
          {form.recurringType && (
            <Field label="Fin de la recurrencia" hint="opcional">
              <input
                type="date"
                value={form.endDate}
                onChange={e => set('endDate', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 
                  focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white"
              />
            </Field>
          )}

          {/* Notas */}
          <Field label="Notas" hint="opcional">
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Objetivos de la sesión, materiales, etc."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 
                placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 
                focus:border-transparent bg-white resize-none"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 space-y-2">
          {error && (
            <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-2xl hover:bg-gray-50 transition-colors"
            >Cancelar</button>
            <button
              onClick={handleSubmit}
              className="flex-[2] py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm rounded-2xl transition-colors"
            >{isEdit ? 'Guardar cambios' : 'Agendar cita'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
