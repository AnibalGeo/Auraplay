// src/data/levels.js
// Basado en: Krefft Moreno (Hitos del Desarrollo del Lenguaje),
// González Lajas & García Cruz (DSM-5, AEPap 2019),
// Lara Díaz & Araque (Comunicación y Lenguaje en TEA)

import n1 from './content/N1.json'
import n2 from './content/N2.json'
import n3 from './content/N3.json'
import n4 from './content/N4.json'
import n5 from './content/N5.json'
import n6 from './content/N6.json'
import n7 from './content/N7.json'

export const LEVELS = {
  N1: {
    id: 'N1',
    label: 'Nivel 1',
    ageRange: '18 – 24 meses',
    ageMonthsMin: 18,
    ageMonthsMax: 24,
    description: 'Holofrase y primeras combinaciones de dos palabras',
    fonologia: {
      description: 'Fonemas /p/, /t/, /k/, /m/. Sílabas CV.',
      minimalPairs: n1.minimalPairs,
      buildWords: n1.buildWords,
    },
    semantica: {
      description: 'Sustantivos y verbos de alta frecuencia. Categorías básicas.',
      categories: [
        {
          name: 'Animales',
          target: { word: 'PERRO', emoji: '🐶' },
          options: [
            { word: 'PERRO', emoji: '🐶', correct: true },
            { word: 'MESA', emoji: '🪑', correct: false },
            { word: 'PELOTA', emoji: '⚽', correct: false },
          ],
        },
        {
          name: 'Comida',
          target: { word: 'LECHE', emoji: '🥛' },
          options: [
            { word: 'LECHE', emoji: '🥛', correct: true },
            { word: 'PERRO', emoji: '🐶', correct: false },
            { word: 'SILLA', emoji: '🪑', correct: false },
          ],
        },
      ],
      listen: n1.listenRounds,
      opposites: n1.opposites,
      definitions: n1.definitions,
    },
    morfosintaxis: {
      description: 'Instrucciones de 1 elemento. Comprensión de "dame", "mira", "ven".',
      connectors: n1.connectors,
      orderSentences: [],
      completeSentences: [],
      narrativeSequence: n1.narrativeSequences,
    },
    pragmatica: {
      description: 'Función declarativa. Reconocimiento de rutinas cotidianas.',
      inferences: n1.inferences,
    },
  },

  N2: {
    id: 'N2',
    label: 'Nivel 2',
    ageRange: '2 – 2,11 años',
    ageMonthsMin: 24,
    ageMonthsMax: 35,
    description: 'Estructura S+V, habla telegráfica, negación',
    fonologia: {
      description: 'Fonemas /y/, /b/, /j/, /g/, /n/, /ch/. Emisiones de 2-3 elementos.',
      minimalPairs: n2.minimalPairs,
      buildWords: n2.buildWords,
    },
    semantica: {
      description: 'Acción locativa, posesión, cantidad. Verbos: ir, dar, caer, poner.',
      categories: [
        {
          name: 'Ropa',
          target: { word: 'ZAPATO', emoji: '👟' },
          options: [
            { word: 'ZAPATO', emoji: '👟', correct: true },
            { word: 'MANZANA', emoji: '🍎', correct: false },
            { word: 'PERRO', emoji: '🐶', correct: false },
          ],
        },
        {
          name: 'Frutas',
          target: { word: 'MANZANA', emoji: '🍎' },
          options: [
            { word: 'MANZANA', emoji: '🍎', correct: true },
            { word: 'PELOTA', emoji: '⚽', correct: false },
            { word: 'SILLA', emoji: '🪑', correct: false },
          ],
        },
      ],
      listen: n2.listenRounds,
      opposites: n2.opposites,
      definitions: n2.definitions,
    },
    morfosintaxis: {
      description: 'Comprensión de órdenes de 2 elementos. Inicio de "mío", preposiciones a/en.',
      connectors: n2.connectors,
      orderSentences: [
        { words: ['NENE', 'COME'], correctOrder: ['NENE', 'COME'], emoji: ['👶', '🍽️'] },
        { words: ['MAMÁ', 'DUERME'], correctOrder: ['MAMÁ', 'DUERME'], emoji: ['👩', '😴'] },
      ],
      completeSentences: [],
      narrativeSequence: n2.narrativeSequences,
    },
    pragmatica: {
      description: 'Mantención de tópico. Deícticos. Función heurística.',
      inferences: n2.inferences,
    },
  },

  N3: {
    id: 'N3',
    label: 'Nivel 3',
    ageRange: '3 – 3,11 años',
    ageMonthsMin: 36,
    ageMonthsMax: 47,
    description: 'Oraciones de 3-4 palabras. Nexos "que", "pero". Causa-efecto básica.',
    fonologia: {
      description: 'Fonemas /l/, /ñ/, /f/, /s/. Enunciados de 3-4 palabras.',
      minimalPairs: n3.minimalPairs,
      buildWords: n3.buildWords,
    },
    semantica: {
      description: 'Opuestos, causa-efecto básica, colores, posición espacial.',
      categories: [
        {
          name: 'Animales que vuelan',
          target: { word: 'PÁJARO', emoji: '🐦' },
          options: [
            { word: 'PÁJARO', emoji: '🐦', correct: true },
            { word: 'PERRO', emoji: '🐶', correct: true },
            { word: 'MARIPOSA', emoji: '🦋', correct: true },
            { word: 'PECES', emoji: '🐟', correct: false },
          ],
          multiSelect: true,
          instruction: '¿Cuáles pueden volar?',
        },
      ],
      listen: n3.listenRounds,
      opposites: n3.opposites,
      definitions: n3.definitions,
    },
    morfosintaxis: {
      description: 'S+V+O. Artículo indefinido. Pronombres yo/tú. Nexo "pero" y "que".',
      connectors: n3.connectors,
      orderSentences: [
        { words: ['LA', 'NIÑA', 'COME', 'MANZANA'], correctOrder: ['LA', 'NIÑA', 'COME', 'MANZANA'], emoji: ['👧', '🍎'] },
        { words: ['EL', 'PERRO', 'DUERME', 'AQUÍ'], correctOrder: ['EL', 'PERRO', 'DUERME', 'AQUÍ'], emoji: ['🐶', '😴'] },
      ],
      completeSentences: [],
      narrativeSequence: n3.narrativeSequences,
    },
    pragmatica: {
      description: 'Función reguladora. Comprensión de relaciones causa-efecto simples.',
      inferences: n3.inferences,
    },
  },

  N4: {
    id: 'N4',
    label: 'Nivel 4',
    ageRange: '4 – 4,11 años',
    ageMonthsMin: 48,
    ageMonthsMax: 59,
    description: 'Verbos auxiliares, causales y consecutivas. Conector "porque" y "entonces".',
    fonologia: {
      description: 'Fonemas /d/, /r/. Dífonos vocálicos. Desaparecen procesos de simplificación.',
      minimalPairs: n4.minimalPairs,
      buildWords: n4.buildWords,
    },
    semantica: {
      description: 'Conceptos de distancia, temporalidad, forma. Resolución de problemas simples.',
      categories: [
        {
          name: 'Frutas',
          instruction: '¿Cuáles son frutas?',
          multiSelect: true,
          options: [
            { word: 'MANZANA', emoji: '🍎', correct: true },
            { word: 'PELOTA', emoji: '⚽', correct: false },
            { word: 'PLÁTANO', emoji: '🍌', correct: true },
            { word: 'SILLA', emoji: '🪑', correct: false },
            { word: 'NARANJA', emoji: '🍊', correct: true },
            { word: 'LIBRO', emoji: '📚', correct: false },
          ],
        },
      ],
      listen: n4.listenRounds,
      opposites: n4.opposites,
      definitions: n4.definitions,
    },
    morfosintaxis: {
      description: 'Verbos auxiliares. Tiempos verbales. Causales y consecutivas.',
      connectors: n4.connectors,
      orderSentences: [
        { words: ['EL', 'NIÑO', 'ESTÁ', 'JUGANDO', 'FÚTBOL'], correctOrder: ['EL', 'NIÑO', 'ESTÁ', 'JUGANDO', 'FÚTBOL'], emoji: ['👦', '⚽'] },
        { words: ['LA', 'MAMÁ', 'ESTÁ', 'COCINANDO', 'ARROZ'], correctOrder: ['LA', 'MAMÁ', 'ESTÁ', 'COCINANDO', 'ARROZ'], emoji: ['👩', '🍚'] },
      ],
      completeSentences: [
        {
          sentence: 'Las mariposas ___ volar.',
          options: ['pueden', 'puedo', 'podemos'],
          correct: 'pueden',
          type: 'verbo_auxiliar',
        },
      ],
      narrativeSequence: n4.narrativeSequences,
    },
    pragmatica: {
      description: 'Toma de turnos básica. Resolución de problemas simples.',
      inferences: n4.inferences,
    },
  },

  N5: {
    id: 'N5',
    label: 'Nivel 5',
    ageRange: '5 – 5,11 años',
    ageMonthsMin: 60,
    ageMonthsMax: 71,
    description: 'Dominio gramatical básico. Conectores temporales. Narrativa con estructura.',
    fonologia: {
      description: 'Fonema /rr/, dífonos con /r/ y trabantes. Culminación del repertorio fonético.',
      minimalPairs: n5.minimalPairs,
      buildWords: n5.buildWords,
    },
    semantica: {
      description: 'Atributos de edad. Responde ¿qué? ¿cómo? ¿cuándo? ¿quién?',
      categories: [
        {
          name: 'Animales del mar',
          instruction: '¿Cuáles viven en el mar?',
          multiSelect: true,
          options: [
            { word: 'TIBURÓN', emoji: '🦈', correct: true },
            { word: 'PERRO', emoji: '🐶', correct: false },
            { word: 'PULPO', emoji: '🐙', correct: true },
            { word: 'ELEFANTE', emoji: '🐘', correct: false },
            { word: 'DELFÍN', emoji: '🐬', correct: true },
            { word: 'GATO', emoji: '🐱', correct: false },
          ],
        },
      ],
      listen: n5.listenRounds,
      opposites: n5.opposites,
      definitions: n5.definitions,
    },
    morfosintaxis: {
      description: 'Posesivos grupales. Conectores temporales: cuando, después, antes, primero.',
      connectors: n5.connectors,
      orderSentences: [
        { words: ['DESPUÉS', 'DE', 'CENAR', 'ME', 'LAVO', 'LOS', 'DIENTES'], correctOrder: ['DESPUÉS', 'DE', 'CENAR', 'ME', 'LAVO', 'LOS', 'DIENTES'], emoji: ['🍽️', '🦷'] },
        { words: ['CUANDO', 'LLUEVE', 'USO', 'PARAGUAS'], correctOrder: ['CUANDO', 'LLUEVE', 'USO', 'PARAGUAS'], emoji: ['🌧️', '☂️'] },
      ],
      completeSentences: [
        {
          sentence: 'Los pájaros ___ en el cielo.',
          options: ['vuelan', 'vuelo', 'volamos'],
          correct: 'vuelan',
          type: 'concordancia',
        },
        {
          sentence: 'Ayer ___ al parque con mamá.',
          options: ['fui', 'voy', 'iré'],
          correct: 'fui',
          type: 'tiempo_verbal_pasado',
        },
      ],
      narrativeSequence: n5.narrativeSequences,
    },
    pragmatica: {
      description: 'Función interaccional. Comprensión de contexto.',
      inferences: n5.inferences,
    },
  },

  N6: {
    id: 'N6',
    label: 'Nivel 6',
    ageRange: '6 – 6,11 años',
    ageMonthsMin: 72,
    ageMonthsMax: 83,
    description: 'Oraciones subordinadas. Conectores adversativos y concesivos complejos.',
    fonologia: {
      description: 'Afianzamiento generalizado. Habilidades metafonológicas.',
      minimalPairs: n6.minimalPairs,
      buildWords: n6.buildWords,
    },
    semantica: {
      description: 'Cantidades relativas. Referentes témporo-espaciales complejos. Semejanzas verbales.',
      categories: [
        {
          name: 'Medios de transporte',
          instruction: '¿Cuáles van por el aire?',
          multiSelect: true,
          options: [
            { word: 'AVIÓN', emoji: '✈️', correct: true },
            { word: 'AUTO', emoji: '🚗', correct: false },
            { word: 'HELICÓPTERO', emoji: '🚁', correct: true },
            { word: 'BARCO', emoji: '🚢', correct: false },
            { word: 'COHETE', emoji: '🚀', correct: true },
            { word: 'BICICLETA', emoji: '🚲', correct: false },
          ],
        },
      ],
      synonyms: [
        { word: 'CONTENTO', emoji: '😊', synonym: 'FELIZ', synonymEmoji: '😄' },
        { word: 'RÁPIDO', emoji: '⚡', synonym: 'VELOZ', synonymEmoji: '🏃' },
        { word: 'GRANDE', emoji: '🐘', synonym: 'ENORME', synonymEmoji: '🏔️' },
      ],
      listen: n6.listenRounds,
      opposites: n6.opposites,
      definitions: n6.definitions,
    },
    morfosintaxis: {
      description: 'Oraciones subordinadas. Voz pasiva. Cantidades relativas. Conectores: sin embargo, a pesar de.',
      connectors: n6.connectors,
      orderSentences: [
        { words: ['A', 'PESAR', 'DE', 'LLOVER', 'SALIMOS', 'AL', 'PARQUE'], correctOrder: ['A', 'PESAR', 'DE', 'LLOVER', 'SALIMOS', 'AL', 'PARQUE'], emoji: ['🌧️', '🌳'] },
        { words: ['EL', 'NIÑO', 'FUE', 'PREMIADO', 'POR', 'SU', 'MAESTRA'], correctOrder: ['EL', 'NIÑO', 'FUE', 'PREMIADO', 'POR', 'SU', 'MAESTRA'], emoji: ['👦', '🏆', '👩‍🏫'] },
      ],
      completeSentences: [
        {
          sentence: 'Ayer los niños ___ mucho en el recreo.',
          options: ['jugaron', 'juegan', 'jugarán'],
          correct: 'jugaron',
          type: 'tiempo_verbal_pasado_plural',
        },
        {
          sentence: 'El libro fue escrito ___ una famosa autora.',
          options: ['por', 'para', 'con'],
          correct: 'por',
          type: 'voz_pasiva',
        },
      ],
      narrativeSequence: n6.narrativeSequences,
    },
    pragmatica: {
      description: 'Comprensión de lenguaje no literal básico. Adecuación al contexto.',
      inferences: n6.inferences,
    },
  },

  N7: {
    id: 'N7',
    label: 'Nivel 7',
    ageRange: '7 – 12 años',
    ageMonthsMin: 84,
    ageMonthsMax: 144,
    description: 'Lenguaje figurado, metáforas, subordinadas complejas. Discurso narrativo avanzado.',
    fonologia: {
      description: 'Habilidades metafonológicas completas. Conciencia fonológica avanzada.',
      minimalPairs: n7.minimalPairs,
      buildWords: n7.buildWords,
    },
    semantica: {
      description: 'Lenguaje figurado. Polisemia. Sinónimos y antónimos avanzados. Metáforas.',
      categories: [
        {
          name: 'Verbos de comunicación',
          instruction: '¿Cuáles son formas de comunicarse?',
          multiSelect: true,
          options: [
            { word: 'HABLAR', emoji: '🗣️', correct: true },
            { word: 'CORRER', emoji: '🏃', correct: false },
            { word: 'ESCRIBIR', emoji: '✍️', correct: true },
            { word: 'DORMIR', emoji: '😴', correct: false },
            { word: 'GESTICULAR', emoji: '🤙', correct: true },
            { word: 'COMER', emoji: '🍽️', correct: false },
          ],
        },
      ],
      synonyms: [
        { word: 'COMENZAR', emoji: '▶️', synonym: 'INICIAR', synonymEmoji: '🚀' },
        { word: 'TERMINAR', emoji: '⏹️', synonym: 'CONCLUIR', synonymEmoji: '🏁' },
        { word: 'AYUDAR', emoji: '🤝', synonym: 'COLABORAR', synonymEmoji: '👥' },
      ],
      listen: n7.listenRounds,
      opposites: n7.opposites,
      definitions: n7.definitions,
    },
    morfosintaxis: {
      description: 'Conectores complejos. Subordinadas. Concordancia de tiempos verbales.',
      connectors: n7.connectors,
      orderSentences: [
        { words: ['AUNQUE', 'LLOVÍA', 'EL', 'EQUIPO', 'JUGÓ', 'EL', 'PARTIDO'], correctOrder: ['AUNQUE', 'LLOVÍA', 'EL', 'EQUIPO', 'JUGÓ', 'EL', 'PARTIDO'], emoji: ['🌧️', '⚽'] },
        { words: ['LOS', 'LIBROS', 'FUERON', 'ESCRITOS', 'POR', 'GRANDES', 'AUTORES'], correctOrder: ['LOS', 'LIBROS', 'FUERON', 'ESCRITOS', 'POR', 'GRANDES', 'AUTORES'], emoji: ['📚', '✍️'] },
      ],
      completeSentences: [
        {
          sentence: 'Si hubiera estudiado más, ___ aprobado.',
          options: ['habría', 'habrá', 'ha'],
          correct: 'habría',
          type: 'condicional_pasado',
        },
        {
          sentence: 'El científico descubrió que la Tierra ___ alrededor del Sol.',
          options: ['gira', 'giró', 'girará'],
          correct: 'gira',
          type: 'presente_habitual',
        },
      ],
      narrativeSequence: n7.narrativeSequences,
    },
    pragmatica: {
      description: 'Lenguaje figurado. Ironía. Metáforas. Adecuación a distintos interlocutores.',
      inferences: n7.inferences,
    },
  },
}

// Diagnósticos — solo etiqueta, descripción y color para UI
export const STIMULUS_CONFIG = {
  tdl: {
    label: 'TDL',
    color: '#4aab8a',
    description: 'Trastorno del desarrollo del lenguaje sin neurodivergencia',
  },
  tdl_tea: {
    label: 'TDL asociado a TEA',
    color: '#7c6bb0',
    description: 'TDL con Trastorno del Espectro Autista',
  },
  tdl_tdah: {
    label: 'TDL asociado a TDAH',
    color: '#e8a020',
    description: 'TDL con Trastorno por Déficit de Atención e Hiperactividad',
  },
  tdl_tea_tdah: {
    label: 'TDL + TEA y TDAH',
    color: '#c05c7e',
    description: 'TDL con TEA y TDAH asociados',
  },
}

// Configuración de estímulos independiente del diagnóstico
export const DEFAULT_STIMULUS_SETTINGS = {
  simultaneousAudioVisual: true,
  animationsEnabled: true,
  backgroundElements: true,
  reducedOptions: false,
  largerText: false,
  sequentialStimulus: false,
  extendedExposureTime: false,
  simplifiedInstructions: false,
}

export const LEVEL_IDS = Object.keys(LEVELS)

export function getLevelByAge(ageMonths) {
  return Object.values(LEVELS).find(
    l => ageMonths >= l.ageMonthsMin && ageMonths < l.ageMonthsMax
  ) || LEVELS.N7
}

export function getLevelById(id) {
  return LEVELS[id] || LEVELS.N1
}
