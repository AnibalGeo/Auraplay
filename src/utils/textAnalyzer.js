// src/utils/textAnalyzer.js
// Analizador lingüístico para registros clínicos fonoaudiológicos en español

// ── Reglas por categoría ──────────────────────────────────────────────────────

const CONCORDANCIA_GENERO = [
  { re: /\bel\s+(niña|paciente femenina|terapeuta femenina)\b/gi, sug: s => s.replace(/\bel\b/i, 'la'), exp: 'Artículo masculino con sustantivo femenino.' },
  { re: /\bla\s+(niño|paciente masculino)\b/gi, sug: s => s.replace(/\bla\b/i, 'el'), exp: 'Artículo femenino con sustantivo masculino.' },
  { re: /\bsus\s+(amo|tutor masculino)\b/gi, sug: s => s.replace(/\bsus\b/i, 'su'), exp: 'Posesivo plural con sustantivo singular.' },
  { re: /\bun\s+(niña|paciente femenina)\b/gi, sug: s => s.replace(/\bun\b/i, 'una'), exp: 'Artículo indefinido masculino con sustantivo femenino.' },
  { re: /\buna\s+(niño|paciente masculino)\b/gi, sug: s => s.replace(/\buna\b/i, 'un'), exp: 'Artículo indefinido femenino con sustantivo masculino.' },
]

const CONCORDANCIA_NUMERO = [
  { re: /\blos\s+([a-záéíóúñü]+o)\b(?!s)/gi, test: m => !m[1].endsWith('s'), sug: s => s.replace(/\b(los\s+\w+)(o)\b/i, '$1$2s'), exp: 'Artículo plural con sustantivo en singular.' },
  { re: /\blas\s+([a-záéíóúñü]+a)\b(?!s)/gi, test: m => !m[1].endsWith('s'), sug: s => s.replace(/\b(las\s+\w+)(a)\b/i, '$1$2s'), exp: 'Artículo plural con sustantivo en singular.' },
  { re: /\blos\s+niño\b/gi, sug: () => 'los niños', exp: 'Artículo plural con sustantivo en singular.' },
  { re: /\blas\s+niña\b/gi, sug: () => 'las niñas', exp: 'Artículo plural con sustantivo en singular.' },
  { re: /\blos\s+paciente\b/gi, sug: () => 'los pacientes', exp: 'Artículo plural con sustantivo en singular.' },
]

const CONCORDANCIA_VERBAL = [
  { re: /\bellos\s+come\b/gi,    sug: () => 'ellos comen',    exp: 'Verbo no concuerda con sujeto plural.' },
  { re: /\bellos\s+habla\b/gi,   sug: () => 'ellos hablan',   exp: 'Verbo no concuerda con sujeto plural.' },
  { re: /\bellos\s+tiene\b/gi,   sug: () => 'ellos tienen',   exp: 'Verbo no concuerda con sujeto plural.' },
  { re: /\bellas\s+come\b/gi,    sug: () => 'ellas comen',    exp: 'Verbo no concuerda con sujeto plural.' },
  { re: /\bellas\s+habla\b/gi,   sug: () => 'ellas hablan',   exp: 'Verbo no concuerda con sujeto plural.' },
  { re: /\blos\s+niños\s+come\b/gi,  sug: () => 'los niños comen',  exp: 'Verbo no concuerda con sujeto plural.' },
  { re: /\blos\s+niños\s+tiene\b/gi, sug: () => 'los niños tienen', exp: 'Verbo no concuerda con sujeto plural.' },
  { re: /\byo\s+comes\b/gi,      sug: () => 'yo como',        exp: 'Verbo en 2ª persona con sujeto en 1ª.' },
  { re: /\btú\s+como\b/gi,       sug: () => 'tú comes',       exp: 'Verbo en 1ª persona con sujeto en 2ª.' },
  { re: /\bél\s+comen\b/gi,      sug: () => 'él come',        exp: 'Verbo en plural con sujeto singular.' },
  { re: /\bel\s+paciente\s+presentan\b/gi,  sug: () => 'el paciente presenta',  exp: 'Verbo en plural con sujeto singular.' },
  { re: /\bel\s+niño\s+presentan\b/gi,      sug: () => 'el niño presenta',      exp: 'Verbo en plural con sujeto singular.' },
  { re: /\bel\s+paciente\s+muestran\b/gi,   sug: () => 'el paciente muestra',   exp: 'Verbo en plural con sujeto singular.' },
]

const CONECTORES = [
  { re: /\ben\s+ves\s+de\b/gi,      sug: () => 'en vez de',      exp: '"En ves de" no existe; la forma correcta es "en vez de".' },
  { re: /\ba\s+ver\s+si\b/gi,       sug: () => 'a ver si',       exp: 'Correcto solo si significa "veamos si". Si expresa obligación, usar "haber".' },
  { re: /\baver\b/gi,               sug: () => 'a ver',          exp: '"Aver" no existe. Usar "a ver" (expresión) o "haber" (verbo).' },
  { re: /\balla\s+él\b/gi,          sug: () => 'allá él',        exp: 'Falta tilde diacrítica en "allá".' },
  { re: /\bsi\s+no\s+logra\b/gi,    sug: null, exp: 'Verificar: "si no" (condicional negativo) vs "sino" (adversativo).' },
  { re: /\bhay\s+que\s+ver\b/gi,    sug: null, exp: 'Verificar uso correcto de "hay" (existencia) vs "ahí" (lugar).' },
]

// "porque/por qué/por que/porqué"
const PORQUE_RULES = [
  {
    re: /\¿[^?]*\bporque\b[^?]*\?/gi,
    sug: s => s.replace(/\bporque\b/g, 'por qué'),
    exp: 'Dentro de pregunta directa usar "por qué" (interrogativo con tilde).',
  },
  {
    re: /\bporqué\b(?!\s+de\b)/gi,
    sug: s => s.replace(/\bporqué\b/g, 'porque'),
    exp: '"Porqué" (sustantivo) solo se usa con artículo: "el porqué". En otros casos usar "porque".',
  },
  {
    re: /\bpor\s+que\b(?!\s+sea|\s+pueda|\s+haya|\s+esté|\s+tenga)/gi,
    sug: null,
    exp: '"Por que" (separado sin tilde) es poco frecuente. Verificar si corresponde "porque" (conjunción) o "por qué" (interrogativo).',
  },
]

// Términos clínicos mal escritos
const TERMINOS_CLINICOS = [
  { re: /\bfonema(?!s)\b/gi,       sug: null, exp: null }, // correcto
  { re: /\bfonenas\b/gi,            sug: () => 'fonemas',         exp: 'Término clínico: "fonemas".' },
  { re: /\bfonem[aá]tica\b/gi,      sug: () => 'fonología',       exp: 'Preferir "fonología" o "fonética" según contexto clínico.' },
  { re: /\bmorfenas\b/gi,           sug: () => 'morfemas',         exp: 'Término clínico: "morfemas".' },
  { re: /\bpragmatica\b/gi,         sug: () => 'pragmática',       exp: 'Falta tilde en "pragmática" (esdrújula).' },
  { re: /\bpragmática\b/gi,         sug: null, exp: null }, // correcto
  { re: /\becolalía\b/gi,           sug: null, exp: null }, // correcto
  { re: /\becholalia\b/gi,          sug: () => 'ecolalia',         exp: 'Anglicismo; en español: "ecolalia".' },
  { re: /\becolia\b/gi,             sug: () => 'ecolalia',         exp: 'Grafía incorrecta; usar "ecolalia".' },
  { re: /\bdisfluencia\b/gi,        sug: null, exp: null }, // correcto
  { re: /\bdisfuencia\b/gi,         sug: () => 'disfluencia',      exp: 'Grafía incorrecta; usar "disfluencia".' },
  { re: /\bdisfluencies\b/gi,       sug: () => 'disfluencias',     exp: 'Anglicismo; usar "disfluencias".' },
  { re: /\bT\.E\.L\.?\b/gi,         sug: () => 'TEL',              exp: 'La sigla se escribe sin puntos: TEL.' },
  { re: /\bT\.E\.A\.?\b/gi,         sug: () => 'TEA',              exp: 'La sigla se escribe sin puntos: TEA.' },
  { re: /\bT\.D\.A\.H\.?\b/gi,      sug: () => 'TDAH',             exp: 'La sigla se escribe sin puntos: TDAH.' },
  { re: /\bMBCDI\b/gi,              sug: null, exp: null }, // correcto
  { re: /\bMBCDl\b/gi,              sug: () => 'MBCDI',            exp: 'Verificar: el último carácter debe ser "I" (mayúscula), no "l" (ele minúscula).' },
  { re: /\bTECAL\b/gi,              sug: null, exp: null }, // correcto
  { re: /\bBLOC\b/gi,               sug: null, exp: null }, // correcto
  { re: /\bmorfosintasis\b/gi,      sug: () => 'morfosintaxis',    exp: 'Grafía incorrecta; usar "morfosintaxis".' },
  { re: /\bsintasis\b/gi,           sug: () => 'sintaxis',         exp: 'Grafía incorrecta; usar "sintaxis".' },
  { re: /\bfonológico\b/gi,         sug: null, exp: null }, // correcto
  { re: /\bfonologico\b/gi,         sug: () => 'fonológico',       exp: 'Falta tilde en "fonológico" (esdrújula).' },
  { re: /\bsemántica\b/gi,          sug: null, exp: null }, // correcto
  { re: /\bsemantica\b/gi,          sug: () => 'semántica',        exp: 'Falta tilde en "semántica" (esdrújula).' },
  { re: /\bprosódia\b/gi,           sug: () => 'prosodia',         exp: 'La tilde está mal ubicada; la forma correcta es "prosodia" (llana).' },
  { re: /\bprosodia\b/gi,           sug: null, exp: null }, // correcto
]

// Detección de frases sin verbo (heurística simple)
const VERB_INDICATORS = /\b(es|son|está|están|tiene|tienen|presenta|presentan|logra|logran|puede|pueden|hace|hacen|dice|dicen|muestra|muestran|realiza|realizan|responde|responden|participa|participan|comprende|comprenden|produjo|produjo|fue|fueron|ha|han|había|habían|se|no)\b/i

function hasSuspectedMissingVerb(sentence) {
  const s = sentence.trim()
  if (s.length < 20) return false
  // Oración con sujeto aparente pero sin indicador verbal
  const hasSuj = /\b(el\s+paciente|la\s+paciente|el\s+niño|la\s+niña|el\s+usuario)\b/i.test(s)
  if (!hasSuj) return false
  return !VERB_INDICATORS.test(s)
}

// ── Función principal ─────────────────────────────────────────────────────────

export function analyzeText(text) {
  if (!text || !text.trim()) return { errors: [], summary: { total: 0, por_categoria: {} } }

  const errors = []

  function addErrors(rules, category) {
    for (const rule of rules) {
      if (rule.exp === null) continue // entrada marcada como correcta
      const matches = [...text.matchAll(rule.re)]
      for (const m of matches) {
        const original = m[0]
        const suggestion = typeof rule.sug === 'function' ? rule.sug(original) : null
        if (suggestion === original) continue
        errors.push({ original, suggestion, category, explanation: rule.exp })
      }
    }
  }

  addErrors(CONCORDANCIA_GENERO,  'concordancia_genero')
  addErrors(CONCORDANCIA_NUMERO,  'concordancia_numero')
  addErrors(CONCORDANCIA_VERBAL,  'concordancia_verbal')
  addErrors(CONECTORES,           'conector')
  addErrors(PORQUE_RULES,         'conector')
  addErrors(TERMINOS_CLINICOS,    'termino_clinico')

  // Frases sin verbo detectado
  const sentences = text.split(/[.!?;]+/).filter(s => s.trim().length > 0)
  for (const s of sentences) {
    if (hasSuspectedMissingVerb(s)) {
      errors.push({
        original: s.trim(),
        suggestion: null,
        category: 'frase_incompleta',
        explanation: 'Oración con sujeto identificado pero sin verbo detectado. Verificar si está completa.',
      })
    }
  }

  // Deduplicar por original+category
  const seen = new Set()
  const unique = errors.filter(e => {
    const key = e.original + '|' + e.category
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const por_categoria = {}
  for (const e of unique) {
    por_categoria[e.category] = (por_categoria[e.category] || 0) + 1
  }

  return { errors: unique, summary: { total: unique.length, por_categoria } }
}
