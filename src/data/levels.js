// src/data/levels.js
// Basado en: Krefft Moreno (Hitos del Desarrollo del Lenguaje),
// González Lajas & García Cruz (DSM-5, AEPap 2019),
// Lara Díaz & Araque (Comunicación y Lenguaje en TEA)

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
      minimalPairs: [
        { word: 'MAMÁ', emoji: '👩', distractor: { word: 'PAPÁ', emoji: '👨' } },
        { word: 'PATO', emoji: '🦆', distractor: { word: 'GATO', emoji: '🐱' } },
        { word: 'MANO', emoji: '✋', distractor: { word: 'PANO', emoji: '🧻' } },
      ],
      buildWords: [
        { word: 'MAMÁ', emoji: '👩', syllables: ['MA', 'MÁ'], hint: '2 sílabas' },
        { word: 'PAPÁ', emoji: '👨', syllables: ['PA', 'PÁ'], hint: '2 sílabas' },
        { word: 'PATO', emoji: '🦆', syllables: ['PA', 'TO'], hint: '2 sílabas' },
      ],
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
      listen: [
        { sound: 'PERRO', correct: '🐶', label: 'Perro', options: [{ e: '🐶', l: 'Perro' }, { e: '🍎', l: 'Manzana' }, { e: '🚗', l: 'Auto' }] },
        { sound: 'LECHE', correct: '🥛', label: 'Leche', options: [{ e: '🥛', l: 'Leche' }, { e: '🐶', l: 'Perro' }, { e: '⚽', l: 'Pelota' }] },
        { sound: 'MAMÁ', correct: '👩', label: 'Mamá', options: [{ e: '👩', l: 'Mamá' }, { e: '👨', l: 'Papá' }, { e: '🐱', l: 'Gato' }] },
      ],
    },
    morfosintaxis: {
      description: 'Instrucciones de 1 elemento. Comprensión de "dame", "mira", "ven".',
      connectors: [],
      orderSentences: [],
      completeSentences: [],
    },
    pragmatica: {
      description: 'Función declarativa. Reconocimiento de rutinas cotidianas.',
      inferences: [],
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
      minimalPairs: [
        { word: 'PATO', emoji: '🦆', distractor: { word: 'GATO', emoji: '🐱' } },
        { word: 'BOCA', emoji: '👄', distractor: { word: 'VACA', emoji: '🐄' } },
        { word: 'NIDO', emoji: '🪺', distractor: { word: 'DEDO', emoji: '👆' } },
      ],
      buildWords: [
        { word: 'GATO', emoji: '🐱', syllables: ['GA', 'TO'], hint: '2 sílabas' },
        { word: 'NENE', emoji: '👶', syllables: ['NE', 'NE'], hint: '2 sílabas' },
        { word: 'JUGO', emoji: '🧃', syllables: ['JU', 'GO'], hint: '2 sílabas' },
      ],
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
      listen: [
        { sound: 'GATO', correct: '🐱', label: 'Gato', options: [{ e: '🐱', l: 'Gato' }, { e: '🐶', l: 'Perro' }, { e: '🐸', l: 'Rana' }] },
        { sound: 'MANZANA', correct: '🍎', label: 'Manzana', options: [{ e: '🍎', l: 'Manzana' }, { e: '🍌', l: 'Plátano' }, { e: '🍊', l: 'Naranja' }] },
      ],
    },
    morfosintaxis: {
      description: 'Comprensión de órdenes de 2 elementos. Inicio de "mío", preposiciones a/en.',
      connectors: [],
      orderSentences: [
        { words: ['NENE', 'COME'], correctOrder: ['NENE', 'COME'], emoji: ['👶', '🍽️'] },
        { words: ['MAMÁ', 'DUERME'], correctOrder: ['MAMÁ', 'DUERME'], emoji: ['👩', '😴'] },
      ],
      completeSentences: [],
    },
    pragmatica: {
      description: 'Mantención de tópico. Deícticos. Función heurística.',
      inferences: [],
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
      minimalPairs: [
        { word: 'PALA', emoji: '🪣', distractor: { word: 'BALA', emoji: '🎱' } },
        { word: 'SALA', emoji: '🛋️', distractor: { word: 'SOLA', emoji: '🧍' } },
        { word: 'FOCA', emoji: '🦭', distractor: { word: 'BOCA', emoji: '👄' } },
      ],
      buildWords: [
        { word: 'PELOTA', emoji: '⚽', syllables: ['PE', 'LO', 'TA'], hint: '3 sílabas' },
        { word: 'ZAPATO', emoji: '👟', syllables: ['ZA', 'PA', 'TO'], hint: '3 sílabas' },
        { word: 'CAMISA', emoji: '👕', syllables: ['CA', 'MI', 'SA'], hint: '3 sílabas' },
      ],
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
      opposites: [
        { word: 'GRANDE', emoji: '🐘', opposite: 'PEQUEÑO', oppositeEmoji: '🐭' },
        { word: 'CALIENTE', emoji: '☀️', opposite: 'FRÍO', oppositeEmoji: '❄️' },
        { word: 'ARRIBA', emoji: '⬆️', opposite: 'ABAJO', oppositeEmoji: '⬇️' },
      ],
      listen: [
        { sound: 'PÁJARO', correct: '🐦', label: 'Pájaro', options: [{ e: '🐦', l: 'Pájaro' }, { e: '🐟', l: 'Pez' }, { e: '🐶', l: 'Perro' }] },
        { sound: 'MARIPOSA', correct: '🦋', label: 'Mariposa', options: [{ e: '🦋', l: 'Mariposa' }, { e: '🐝', l: 'Abeja' }, { e: '🐛', l: 'Gusano' }] },
      ],
    },
    morfosintaxis: {
      description: 'S+V+O. Artículo indefinido. Pronombres yo/tú. Nexo "pero" y "que".',
      connectors: [
        {
          sentence: 'Quiero jugar ___ tengo sueño.',
          options: ['pero', 'porque', 'y'],
          correct: 'pero',
          explanation: '"Pero" indica contraste entre dos ideas.',
          level: 'coordinante_adversativo',
        },
        {
          sentence: 'El niño llora ___ tiene hambre.',
          options: ['porque', 'pero', 'y'],
          correct: 'porque',
          explanation: '"Porque" explica el motivo.',
          level: 'subordinante_causal',
        },
      ],
      orderSentences: [
        { words: ['LA', 'NIÑA', 'COME', 'MANZANA'], correctOrder: ['LA', 'NIÑA', 'COME', 'MANZANA'], emoji: ['👧', '🍎'] },
        { words: ['EL', 'PERRO', 'DUERME', 'AQUÍ'], correctOrder: ['EL', 'PERRO', 'DUERME', 'AQUÍ'], emoji: ['🐶', '😴'] },
      ],
      completeSentences: [],
    },
    pragmatica: {
      description: 'Función reguladora. Comprensión de relaciones causa-efecto simples.',
      inferences: [
        {
          situation: 'La niña está llorando. Tiene la rodilla roja.',
          question: '¿Qué pasó?',
          options: ['Se cayó', 'Tiene sueño', 'Tiene hambre'],
          correct: 'Se cayó',
          emoji: '😢',
        },
      ],
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
      minimalPairs: [
        { word: 'PERRO', emoji: '🐶', distractor: { word: 'PERO', emoji: '🚧' } },
        { word: 'CARRO', emoji: '🚗', distractor: { word: 'CARO', emoji: '💎' } },
        { word: 'ROSA', emoji: '🌹', distractor: { word: 'BOSA', emoji: '💊' } },
      ],
      buildWords: [
        { word: 'ELEFANTE', emoji: '🐘', syllables: ['E', 'LE', 'FAN', 'TE'], hint: '4 sílabas' },
        { word: 'MARIPOSA', emoji: '🦋', syllables: ['MA', 'RI', 'PO', 'SA'], hint: '4 sílabas' },
        { word: 'DORMIR', emoji: '😴', syllables: ['DOR', 'MIR'], hint: '2 sílabas' },
      ],
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
      opposites: [
        { word: 'RÁPIDO', emoji: '🐇', opposite: 'LENTO', oppositeEmoji: '🐢' },
        { word: 'LARGO', emoji: '📏', opposite: 'CORTO', oppositeEmoji: '✂️' },
        { word: 'GORDO', emoji: '🫃', opposite: 'DELGADO', oppositeEmoji: '🧍' },
      ],
      listen: [
        { sound: 'ELEFANTE', correct: '🐘', label: 'Elefante', options: [{ e: '🐘', l: 'Elefante' }, { e: '🦁', l: 'León' }, { e: '🦒', l: 'Jirafa' }] },
        { sound: 'MARIPOSA', correct: '🦋', label: 'Mariposa', options: [{ e: '🦋', l: 'Mariposa' }, { e: '🐝', l: 'Abeja' }, { e: '🐛', l: 'Gusano' }] },
      ],
    },
    morfosintaxis: {
      description: 'Verbos auxiliares. Tiempos verbales. Causales y consecutivas.',
      connectors: [
        {
          sentence: 'Tengo frío ___ me pongo el abrigo.',
          options: ['entonces', 'pero', 'aunque'],
          correct: 'entonces',
          explanation: '"Entonces" expresa consecuencia.',
          level: 'consecutivo',
        },
        {
          sentence: 'No puedo salir ___ está lloviendo.',
          options: ['porque', 'pero', 'entonces'],
          correct: 'porque',
          explanation: '"Porque" explica la razón.',
          level: 'causal',
        },
        {
          sentence: 'Me gusta el helado ___ el chocolate.',
          options: ['y', 'pero', 'porque'],
          correct: 'y',
          explanation: '"Y" une dos ideas similares.',
          level: 'coordinante_copulativo',
        },
      ],
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
    },
    pragmatica: {
      description: 'Toma de turnos básica. Resolución de problemas simples.',
      inferences: [
        {
          situation: 'Pedro tiene mucha hambre. Son las 12 del día.',
          question: '¿Qué va a hacer Pedro?',
          options: ['Comer almuerzo', 'Dormir', 'Jugar'],
          correct: 'Comer almuerzo',
          emoji: '🍽️',
        },
        {
          situation: 'Está lloviendo muy fuerte afuera.',
          question: '¿Qué necesita Ana para salir?',
          options: ['Un paraguas', 'Lentes de sol', 'Una pelota'],
          correct: 'Un paraguas',
          emoji: '🌧️',
        },
      ],
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
      minimalPairs: [
        { word: 'CARRO', emoji: '🚗', distractor: { word: 'CARO', emoji: '💎' } },
        { word: 'TIERRA', emoji: '🌍', distractor: { word: 'PERRA', emoji: '🐶' } },
        { word: 'ARROZ', emoji: '🍚', distractor: { word: 'AROS', emoji: '💍' } },
      ],
      buildWords: [
        { word: 'MARIPOSA', emoji: '🦋', syllables: ['MA', 'RI', 'PO', 'SA'], hint: '4 sílabas' },
        { word: 'MURCIÉLAGO', emoji: '🦇', syllables: ['MUR', 'CIÉ', 'LA', 'GO'], hint: '4 sílabas' },
        { word: 'TREN', emoji: '🚂', syllables: ['TREN'], hint: '1 sílaba con grupo consonántico' },
      ],
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
      definitions: [
        {
          definition: 'Es un animal grande, vive en la selva y tiene rayas negras y naranjas',
          options: [{ word: 'TIGRE', emoji: '🐯' }, { word: 'ELEFANTE', emoji: '🐘' }, { word: 'JIRAFA', emoji: '🦒' }],
          correct: 'TIGRE',
        },
        {
          definition: 'Es la comida favorita de los monos, es amarilla y larga',
          options: [{ word: 'MANZANA', emoji: '🍎' }, { word: 'PLÁTANO', emoji: '🍌' }, { word: 'NARANJA', emoji: '🍊' }],
          correct: 'PLÁTANO',
        },
      ],
      opposites: [
        { word: 'JOVEN', emoji: '👦', opposite: 'VIEJO', oppositeEmoji: '👴' },
        { word: 'LLENO', emoji: '🪣', opposite: 'VACÍO', oppositeEmoji: '🫙' },
        { word: 'SUCIO', emoji: '🐷', opposite: 'LIMPIO', oppositeEmoji: '🛁' },
      ],
      listen: [
        { sound: 'TIBURÓN', correct: '🦈', label: 'Tiburón', options: [{ e: '🦈', l: 'Tiburón' }, { e: '🐬', l: 'Delfín' }, { e: '🐙', l: 'Pulpo' }] },
      ],
    },
    morfosintaxis: {
      description: 'Posesivos grupales. Conectores temporales: cuando, después, antes, primero.',
      connectors: [
        {
          sentence: '___ termino de comer, me lavo los dientes.',
          options: ['Cuando', 'Porque', 'Aunque'],
          correct: 'Cuando',
          explanation: '"Cuando" indica el momento en que ocurre algo.',
          level: 'temporal',
        },
        {
          sentence: 'Primero me baño y ___ me pongo el pijama.',
          options: ['después', 'pero', 'porque'],
          correct: 'después',
          explanation: '"Después" indica que algo ocurre más tarde.',
          level: 'temporal_secuencial',
        },
        {
          sentence: 'Hace frío ___ no me pongo el abrigo.',
          options: ['aunque', 'porque', 'cuando'],
          correct: 'aunque',
          explanation: '"Aunque" indica que algo ocurre a pesar de una dificultad.',
          level: 'concesivo',
        },
      ],
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
      narrativeSequence: [
        {
          title: 'El día de lluvia',
          frames: [
            { emoji: '☀️', text: 'En la mañana hacía sol.' },
            { emoji: '🌧️', text: 'De repente empezó a llover.' },
            { emoji: '☂️', text: 'Ana agarró su paraguas.' },
            { emoji: '🏠', text: 'Llegó a casa seca.' },
          ],
          correctOrder: [0, 1, 2, 3],
        },
      ],
    },
    pragmatica: {
      description: 'Función interaccional. Comprensión de contexto.',
      inferences: [
        {
          situation: 'María llegó corriendo a casa. Estaba toda mojada.',
          question: '¿Qué pasó afuera?',
          options: ['Estaba lloviendo', 'Hacía calor', 'Había sol'],
          correct: 'Estaba lloviendo',
          emoji: '🌧️',
        },
        {
          situation: 'Carlos bosteza mucho y tiene los ojos cerrados.',
          question: '¿Cómo se siente Carlos?',
          options: ['Con sueño', 'Feliz', 'Enojado'],
          correct: 'Con sueño',
          emoji: '😴',
        },
      ],
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
      minimalPairs: [
        { word: 'CAZA', emoji: '🎯', distractor: { word: 'CASA', emoji: '🏠' } },
        { word: 'PECES', emoji: '🐟', distractor: { word: 'VECES', emoji: '🔢' } },
        { word: 'COSER', emoji: '🧵', distractor: { word: 'COCER', emoji: '🍳' } },
      ],
      buildWords: [
        { word: 'HELICÓPTERO', emoji: '🚁', syllables: ['HE', 'LI', 'CÓP', 'TE', 'RO'], hint: '5 sílabas' },
        { word: 'DINOSAURIO', emoji: '🦕', syllables: ['DI', 'NO', 'SAU', 'RIO'], hint: '4 sílabas' },
        { word: 'BIBLIOTECA', emoji: '📚', syllables: ['BI', 'BLIO', 'TE', 'CA'], hint: '4 sílabas' },
      ],
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
      definitions: [
        {
          definition: 'Es un lugar donde hay muchos libros y puedes ir a leer o pedir prestados',
          options: [{ word: 'BIBLIOTECA', emoji: '📚' }, { word: 'HOSPITAL', emoji: '🏥' }, { word: 'MERCADO', emoji: '🏪' }],
          correct: 'BIBLIOTECA',
        },
        {
          definition: 'Es lo que usamos para cortar el pan, tiene un mango y un filo',
          options: [{ word: 'CUCHILLO', emoji: '🔪' }, { word: 'TENEDOR', emoji: '🍴' }, { word: 'CUCHARA', emoji: '🥄' }],
          correct: 'CUCHILLO',
        },
      ],
      synonyms: [
        { word: 'CONTENTO', emoji: '😊', synonym: 'FELIZ', synonymEmoji: '😄' },
        { word: 'RÁPIDO', emoji: '⚡', synonym: 'VELOZ', synonymEmoji: '🏃' },
        { word: 'GRANDE', emoji: '🐘', synonym: 'ENORME', synonymEmoji: '🏔️' },
      ],
      listen: [
        { sound: 'HELICÓPTERO', correct: '🚁', label: 'Helicóptero', options: [{ e: '🚁', l: 'Helicóptero' }, { e: '✈️', l: 'Avión' }, { e: '🚀', l: 'Cohete' }] },
      ],
    },
    morfosintaxis: {
      description: 'Oraciones subordinadas. Voz pasiva. Cantidades relativas. Conectores: sin embargo, a pesar de.',
      connectors: [
        {
          sentence: 'Estudié mucho ___ saqué mala nota.',
          options: ['sin embargo', 'porque', 'cuando'],
          correct: 'sin embargo',
          explanation: '"Sin embargo" introduce una idea contraria a lo esperado.',
          level: 'adversativo_complejo',
        },
        {
          sentence: '___ estar cansado, terminó su tarea.',
          options: ['A pesar de', 'Porque', 'Entonces'],
          correct: 'A pesar de',
          explanation: '"A pesar de" indica que algo ocurre aunque hay un obstáculo.',
          level: 'concesivo_complejo',
        },
        {
          sentence: 'El perro ladra ___ el gato maúlla.',
          options: ['mientras que', 'porque', 'entonces'],
          correct: 'mientras que',
          explanation: '"Mientras que" compara dos situaciones simultáneas.',
          level: 'comparativo',
        },
      ],
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
      narrativeSequence: [
        {
          title: 'La tortuga y la liebre',
          frames: [
            { emoji: '🐢🐇', text: 'La tortuga y la liebre decidieron hacer una carrera.' },
            { emoji: '🏃🐇', text: 'La liebre corrió muy rápido y se adelantó mucho.' },
            { emoji: '😴🐇', text: 'La liebre se durmió porque pensó que ganaría igual.' },
            { emoji: '🚶🐢', text: 'La tortuga siguió caminando sin parar.' },
            { emoji: '🏆🐢', text: 'La tortuga llegó primero y ganó la carrera.' },
          ],
          correctOrder: [0, 1, 2, 3, 4],
        },
      ],
    },
    pragmatica: {
      description: 'Comprensión de lenguaje no literal básico. Adecuación al contexto.',
      inferences: [
        {
          situation: 'Paula dice: "Estoy tan cansada que me caigo de sueño".',
          question: '¿Qué quiere decir Paula realmente?',
          options: ['Que tiene mucho sueño', 'Que se va a caer', 'Que está enferma'],
          correct: 'Que tiene mucho sueño',
          emoji: '😴',
          type: 'lenguaje_figurado',
        },
        {
          situation: 'Tomás llega tarde a clases. La profesora lo mira y dice: "¡Qué puntual eres, Tomás!"',
          question: '¿Qué quiso decir realmente la profesora?',
          options: ['Que llegó tarde', 'Que es muy puntual', 'Que llegó temprano'],
          correct: 'Que llegó tarde',
          emoji: '⏰',
          type: 'ironia_basica',
        },
      ],
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
      minimalPairs: [
        { word: 'COSER', emoji: '🧵', distractor: { word: 'COCER', emoji: '🍳' } },
        { word: 'TUBO', emoji: '🚿', distractor: { word: 'TUVO', emoji: '✅' } },
        { word: 'ECHO', emoji: '📤', distractor: { word: 'HECHO', emoji: '✔️' } },
      ],
      buildWords: [
        { word: 'METEOROLOGÍA', emoji: '🌤️', syllables: ['ME', 'TE', 'O', 'RO', 'LO', 'GÍ', 'A'], hint: '7 sílabas' },
        { word: 'ELECTRICIDAD', emoji: '⚡', syllables: ['E', 'LEC', 'TRI', 'CI', 'DAD'], hint: '5 sílabas' },
        { word: 'TRANSFORMACIÓN', emoji: '🔄', syllables: ['TRANS', 'FOR', 'MA', 'CIÓN'], hint: '4 sílabas' },
      ],
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
      definitions: [
        {
          definition: 'Manera de decir algo de forma indirecta usando una comparación, como "sus ojos son estrellas"',
          options: [{ word: 'METÁFORA', emoji: '✨' }, { word: 'PREGUNTA', emoji: '❓' }, { word: 'ORDEN', emoji: '📢' }],
          correct: 'METÁFORA',
        },
        {
          definition: 'Cuando alguien dice lo contrario de lo que piensa, generalmente para bromear',
          options: [{ word: 'IRONÍA', emoji: '😏' }, { word: 'VERDAD', emoji: '✅' }, { word: 'MENTIRA', emoji: '🤥' }],
          correct: 'IRONÍA',
        },
      ],
      synonyms: [
        { word: 'COMENZAR', emoji: '▶️', synonym: 'INICIAR', synonymEmoji: '🚀' },
        { word: 'TERMINAR', emoji: '⏹️', synonym: 'CONCLUIR', synonymEmoji: '🏁' },
        { word: 'AYUDAR', emoji: '🤝', synonym: 'COLABORAR', synonymEmoji: '👥' },
      ],
      listen: [
        { sound: 'TRANSFORMACIÓN', correct: '🔄', label: 'Transformación', options: [{ e: '🔄', l: 'Transformación' }, { e: '⚡', l: 'Electricidad' }, { e: '🌤️', l: 'Meteorología' }] },
      ],
    },
    morfosintaxis: {
      description: 'Conectores complejos. Subordinadas. Concordancia de tiempos verbales.',
      connectors: [
        {
          sentence: 'El proyecto fracasó, ___ no habíamos planificado bien.',
          options: ['dado que', 'aunque', 'mientras'],
          correct: 'dado que',
          explanation: '"Dado que" introduce una causa formal.',
          level: 'causal_formal',
        },
        {
          sentence: '___ los resultados sean negativos, seguiremos intentando.',
          options: ['Aunque', 'Porque', 'Entonces'],
          correct: 'Aunque',
          explanation: '"Aunque" introduce una concesión formal.',
          level: 'concesivo_subjuntivo',
        },
        {
          sentence: 'Estudió mucho; ___, reprobó el examen.',
          options: ['sin embargo', 'porque', 'cuando'],
          correct: 'sin embargo',
          explanation: '"Sin embargo" contrasta dos ideas opuestas.',
          level: 'adversativo_formal',
        },
        {
          sentence: 'No solo llegó tarde, ___ tampoco trajo los materiales.',
          options: ['sino que', 'porque', 'aunque'],
          correct: 'sino que',
          explanation: '"Sino que" añade una idea negativa adicional.',
          level: 'adversativo_exclusivo',
        },
      ],
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
      narrativeSequence: [
        {
          title: 'El niño y el lobo',
          frames: [
            { emoji: '👦🐑', text: 'Un pastor cuidaba sus ovejas en el monte.' },
            { emoji: '😂👦', text: 'Para divertirse, gritó: "¡El lobo, el lobo!" aunque no había ninguno.' },
            { emoji: '🏃🏃', text: 'Los aldeanos corrieron a ayudarlo, pero no encontraron ningún lobo.' },
            { emoji: '🐺👦', text: 'Un día llegó un lobo de verdad y el niño pidió ayuda.' },
            { emoji: '🚫👥', text: 'Nadie le creyó esta vez. Aprendió que mentir trae consecuencias.' },
          ],
          correctOrder: [0, 1, 2, 3, 4],
        },
      ],
    },
    pragmatica: {
      description: 'Lenguaje figurado. Ironía. Metáforas. Adecuación a distintos interlocutores.',
      inferences: [
        {
          situation: 'Lucas dice: "Tengo tantas tareas que me estoy ahogando en libros".',
          question: '¿Qué significa eso realmente?',
          options: ['Tiene muchísimas tareas', 'Cayó dentro de libros', 'Le gustan los libros'],
          correct: 'Tiene muchísimas tareas',
          emoji: '📚',
          type: 'metafora',
        },
        {
          situation: 'Ana rompió accidentalmente un vaso. Su mamá dice: "¡Qué cuidadosa eres!"',
          question: '¿La mamá lo dice en serio o es ironía?',
          options: ['Es ironía, porque fue descuidada', 'Lo dice en serio, fue cuidadosa', 'No está segura'],
          correct: 'Es ironía, porque fue descuidada',
          emoji: '😏',
          type: 'ironia_compleja',
        },
        {
          situation: 'Estás hablando con tu abuela vs. hablando con tu mejor amigo.',
          question: '¿Cómo debería ser tu lenguaje con tu abuela?',
          options: ['Más formal y respetuoso', 'Igual que con tu amigo', 'Más rápido y con jerga'],
          correct: 'Más formal y respetuoso',
          emoji: '👵',
          type: 'adecuacion_interlocutor',
        },
      ],
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
  neurodiverse: {
    label: 'TEA / TDAH',
    color: '#7c6bb0',
    description: 'Neurodivergencia sin TDL primario',
  },
  tdl_neurodiverse: {
    label: 'TDL + TEA/TDAH',
    color: '#e8a020',
    description: 'TDL con neurodivergencia asociada',
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