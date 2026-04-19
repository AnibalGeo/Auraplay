const fs = require('fs')
const path = require('path')

const contentDir = path.join(__dirname, '..', 'src', 'data', 'content')

const EMPTY_CI = { inicial: [], intermedio: [], avanzado: [] }

// ── Categories content per level ──────────────────────────────────────────────

const categoriesN3 = {
  inicial: [
    { category: "Animales", intruder: { word: "COCHE", emoji: "🚗" }, options: [{ word: "PERRO", emoji: "🐕" }, { word: "GATO", emoji: "🐈" }, { word: "PÁJARO", emoji: "🐦" }, { word: "COCHE", emoji: "🚗" }] },
    { category: "Comida", intruder: { word: "ZAPATO", emoji: "👟" }, options: [{ word: "MANZANA", emoji: "🍎" }, { word: "PAN", emoji: "🍞" }, { word: "HUEVO", emoji: "🥚" }, { word: "ZAPATO", emoji: "👟" }] },
    { category: "Juguetes", intruder: { word: "CUCHARA", emoji: "🥄" }, options: [{ word: "PELOTA", emoji: "⚽" }, { word: "MUÑECA", emoji: "🪆" }, { word: "TREN", emoji: "🚂" }, { word: "CUCHARA", emoji: "🥄" }] },
    { category: "Ropa", intruder: { word: "MESA", emoji: "🪑" }, options: [{ word: "CAMISETA", emoji: "👕" }, { word: "ZAPATO", emoji: "👟" }, { word: "GORRO", emoji: "🧢" }, { word: "MESA", emoji: "🪑" }] },
    { category: "Frutas", intruder: { word: "PERRO", emoji: "🐕" }, options: [{ word: "MANZANA", emoji: "🍎" }, { word: "PLÁTANO", emoji: "🍌" }, { word: "UVA", emoji: "🍇" }, { word: "PERRO", emoji: "🐕" }] }
  ],
  intermedio: [
    { category: "Vehículos", intruder: { word: "SILLA", emoji: "🪑" }, options: [{ word: "COCHE", emoji: "🚗" }, { word: "BICI", emoji: "🚲" }, { word: "AVIÓN", emoji: "✈️" }, { word: "SILLA", emoji: "🪑" }] },
    { category: "Animales del agua", intruder: { word: "PERRO", emoji: "🐕" }, options: [{ word: "PEZ", emoji: "🐟" }, { word: "DELFÍN", emoji: "🐬" }, { word: "CANGREJO", emoji: "🦀" }, { word: "PERRO", emoji: "🐕" }] },
    { category: "Cosas redondas", intruder: { word: "LIBRO", emoji: "📚" }, options: [{ word: "PELOTA", emoji: "⚽" }, { word: "LUNA", emoji: "🌙" }, { word: "NARANJA", emoji: "🍊" }, { word: "LIBRO", emoji: "📚" }] },
    { category: "Muebles", intruder: { word: "MANZANA", emoji: "🍎" }, options: [{ word: "SILLA", emoji: "🪑" }, { word: "MESA", emoji: "🪑" }, { word: "CAMA", emoji: "🛏️" }, { word: "MANZANA", emoji: "🍎" }] },
    { category: "Instrumentos", intruder: { word: "TIJERAS", emoji: "✂️" }, options: [{ word: "TAMBOR", emoji: "🥁" }, { word: "GUITARRA", emoji: "🎸" }, { word: "FLAUTA", emoji: "🎶" }, { word: "TIJERAS", emoji: "✂️" }] }
  ],
  avanzado: [
    { category: "Animales salvajes", intruder: { word: "VACA", emoji: "🐄" }, options: [{ word: "LEÓN", emoji: "🦁" }, { word: "TIGRE", emoji: "🐯" }, { word: "ELEFANTE", emoji: "🐘" }, { word: "VACA", emoji: "🐄" }] },
    { category: "Verduras", intruder: { word: "NARANJA", emoji: "🍊" }, options: [{ word: "ZANAHORIA", emoji: "🥕" }, { word: "LECHUGA", emoji: "🥬" }, { word: "TOMATE", emoji: "🍅" }, { word: "NARANJA", emoji: "🍊" }] },
    { category: "Herramientas", intruder: { word: "PELOTA", emoji: "⚽" }, options: [{ word: "MARTILLO", emoji: "🔨" }, { word: "LLAVE", emoji: "🔧" }, { word: "DESTORNILLADOR", emoji: "🪛" }, { word: "PELOTA", emoji: "⚽" }] },
    { category: "Animales con alas", intruder: { word: "PEZ", emoji: "🐟" }, options: [{ word: "PÁJARO", emoji: "🐦" }, { word: "MARIPOSA", emoji: "🦋" }, { word: "ABEJA", emoji: "🐝" }, { word: "PEZ", emoji: "🐟" }] },
    { category: "Medios de transporte acuáticos", intruder: { word: "AVIÓN", emoji: "✈️" }, options: [{ word: "BARCO", emoji: "⛵" }, { word: "SUBMARINO", emoji: "🤿" }, { word: "KAYAK", emoji: "🛶" }, { word: "AVIÓN", emoji: "✈️" }] }
  ]
}

const categoriesN4 = {
  inicial: [
    { category: "Animales domésticos", intruder: { word: "TIGRE", emoji: "🐯" }, options: [{ word: "PERRO", emoji: "🐕" }, { word: "GATO", emoji: "🐈" }, { word: "CONEJO", emoji: "🐰" }, { word: "TIGRE", emoji: "🐯" }] },
    { category: "Frutas", intruder: { word: "ZANAHORIA", emoji: "🥕" }, options: [{ word: "MANZANA", emoji: "🍎" }, { word: "PLÁTANO", emoji: "🍌" }, { word: "NARANJA", emoji: "🍊" }, { word: "ZANAHORIA", emoji: "🥕" }] },
    { category: "Útiles escolares", intruder: { word: "ZAPATO", emoji: "👟" }, options: [{ word: "LÁPIZ", emoji: "✏️" }, { word: "REGLA", emoji: "📏" }, { word: "GOMA", emoji: "🧹" }, { word: "ZAPATO", emoji: "👟" }] },
    { category: "Animales que vuelan", intruder: { word: "PERRO", emoji: "🐕" }, options: [{ word: "PÁJARO", emoji: "🐦" }, { word: "MARIPOSA", emoji: "🦋" }, { word: "AVIÓN", emoji: "✈️" }, { word: "PERRO", emoji: "🐕" }] }
  ],
  intermedio: [
    { category: "Cosas calientes", intruder: { word: "HELADO", emoji: "🍦" }, options: [{ word: "SOL", emoji: "☀️" }, { word: "FUEGO", emoji: "🔥" }, { word: "SOPA", emoji: "🍲" }, { word: "HELADO", emoji: "🍦" }] },
    { category: "Profesiones que ayudan", intruder: { word: "PIANO", emoji: "🎹" }, options: [{ word: "MÉDICO", emoji: "👨‍⚕️" }, { word: "BOMBERO", emoji: "👨‍🚒" }, { word: "POLICÍA", emoji: "👮" }, { word: "PIANO", emoji: "🎹" }] },
    { category: "Animales del campo", intruder: { word: "DELFÍN", emoji: "🐬" }, options: [{ word: "VACA", emoji: "🐄" }, { word: "CABALLO", emoji: "🐴" }, { word: "GALLINA", emoji: "🐓" }, { word: "DELFÍN", emoji: "🐬" }] },
    { category: "Cosas que se llevan puestas", intruder: { word: "SILLA", emoji: "🪑" }, options: [{ word: "GORRO", emoji: "🧢" }, { word: "GUANTES", emoji: "🧤" }, { word: "BUFANDA", emoji: "🧣" }, { word: "SILLA", emoji: "🪑" }] }
  ],
  avanzado: [
    { category: "Animales nocturnos", intruder: { word: "GALLINA", emoji: "🐓" }, options: [{ word: "BÚHO", emoji: "🦉" }, { word: "MURCIÉLAGO", emoji: "🦇" }, { word: "LOBO", emoji: "🐺" }, { word: "GALLINA", emoji: "🐓" }] },
    { category: "Cosas que flotan", intruder: { word: "PIEDRA", emoji: "🪨" }, options: [{ word: "BARCO", emoji: "⛵" }, { word: "CORCHO", emoji: "🍾" }, { word: "HOJA", emoji: "🍂" }, { word: "PIEDRA", emoji: "🪨" }] },
    { category: "Lugares para aprender", intruder: { word: "PLAYA", emoji: "🏖️" }, options: [{ word: "ESCUELA", emoji: "🏫" }, { word: "BIBLIOTECA", emoji: "📚" }, { word: "MUSEO", emoji: "🏛️" }, { word: "PLAYA", emoji: "🏖️" }] },
    { category: "Cosas que necesitan electricidad", intruder: { word: "BICICLETA", emoji: "🚲" }, options: [{ word: "TELEVISIÓN", emoji: "📺" }, { word: "ORDENADOR", emoji: "💻" }, { word: "LAVADORA", emoji: "🫧" }, { word: "BICICLETA", emoji: "🚲" }] }
  ]
}

const categoriesN5 = {
  inicial: [
    { category: "Animales salvajes africanos", intruder: { word: "PERRO", emoji: "🐕" }, options: [{ word: "JIRAFA", emoji: "🦒" }, { word: "CEBRA", emoji: "🦓" }, { word: "HIPOPÓTAMO", emoji: "🦛" }, { word: "PERRO", emoji: "🐕" }] },
    { category: "Deportes acuáticos", intruder: { word: "FÚTBOL", emoji: "⚽" }, options: [{ word: "NATACIÓN", emoji: "🏊" }, { word: "SURF", emoji: "🏄" }, { word: "KAYAK", emoji: "🛶" }, { word: "FÚTBOL", emoji: "⚽" }] },
    { category: "Alimentos de origen animal", intruder: { word: "ZANAHORIA", emoji: "🥕" }, options: [{ word: "HUEVO", emoji: "🥚" }, { word: "LECHE", emoji: "🥛" }, { word: "QUESO", emoji: "🧀" }, { word: "ZANAHORIA", emoji: "🥕" }] },
    { category: "Instrumentos de cuerda", intruder: { word: "TAMBOR", emoji: "🥁" }, options: [{ word: "GUITARRA", emoji: "🎸" }, { word: "VIOLÍN", emoji: "🎻" }, { word: "ARPA", emoji: "🪕" }, { word: "TAMBOR", emoji: "🥁" }] }
  ],
  intermedio: [
    { category: "Palabras que expresan alegría", intruder: { word: "LLORAR", emoji: "😢" }, options: [{ word: "REÍR", emoji: "😄" }, { word: "BAILAR", emoji: "💃" }, { word: "FESTEJAR", emoji: "🥳" }, { word: "LLORAR", emoji: "😢" }] },
    { category: "Elementos del sistema solar", intruder: { word: "MONTAÑA", emoji: "⛰️" }, options: [{ word: "SOL", emoji: "☀️" }, { word: "LUNA", emoji: "🌙" }, { word: "ESTRELLA", emoji: "⭐" }, { word: "MONTAÑA", emoji: "⛰️" }] },
    { category: "Animales que ponen huevos", intruder: { word: "VACA", emoji: "🐄" }, options: [{ word: "PÁJARO", emoji: "🐦" }, { word: "TORTUGA", emoji: "🐢" }, { word: "SERPIENTE", emoji: "🐍" }, { word: "VACA", emoji: "🐄" }] },
    { category: "Cosas que se ven en el cielo", intruder: { word: "PIEDRA", emoji: "🪨" }, options: [{ word: "NUBE", emoji: "☁️" }, { word: "SOL", emoji: "☀️" }, { word: "PÁJARO", emoji: "🐦" }, { word: "PIEDRA", emoji: "🪨" }] }
  ],
  avanzado: [
    { category: "Materiales que conducen electricidad", intruder: { word: "MADERA", emoji: "🪵" }, options: [{ word: "COBRE", emoji: "🔩" }, { word: "HIERRO", emoji: "⚙️" }, { word: "ALUMINIO", emoji: "🪙" }, { word: "MADERA", emoji: "🪵" }] },
    { category: "Verbos de movimiento rápido", intruder: { word: "DORMIR", emoji: "😴" }, options: [{ word: "CORRER", emoji: "🏃" }, { word: "SALTAR", emoji: "🦘" }, { word: "VOLAR", emoji: "🕊️" }, { word: "DORMIR", emoji: "😴" }] },
    { category: "Fuentes de energía renovable", intruder: { word: "CARBÓN", emoji: "⬛" }, options: [{ word: "SOL", emoji: "☀️" }, { word: "VIENTO", emoji: "💨" }, { word: "AGUA", emoji: "💧" }, { word: "CARBÓN", emoji: "⬛" }] },
    { category: "Países europeos", intruder: { word: "BRASIL", emoji: "🇧🇷" }, options: [{ word: "ESPAÑA", emoji: "🇪🇸" }, { word: "FRANCIA", emoji: "🇫🇷" }, { word: "ITALIA", emoji: "🇮🇹" }, { word: "BRASIL", emoji: "🇧🇷" }] }
  ]
}

const categoriesN6 = {
  inicial: [
    { category: "Mamíferos marinos", intruder: { word: "PÁJARO", emoji: "🐦" }, options: [{ word: "DELFÍN", emoji: "🐬" }, { word: "BALLENA", emoji: "🐋" }, { word: "FOCA", emoji: "🦭" }, { word: "PÁJARO", emoji: "🐦" }] },
    { category: "Deportes de equipo", intruder: { word: "TENIS", emoji: "🎾" }, options: [{ word: "FÚTBOL", emoji: "⚽" }, { word: "BALONCESTO", emoji: "🏀" }, { word: "VOLEIBOL", emoji: "🏐" }, { word: "TENIS", emoji: "🎾" }] },
    { category: "Partes del cuerpo interno", intruder: { word: "NARIZ", emoji: "👃" }, options: [{ word: "CORAZÓN", emoji: "❤️" }, { word: "PULMÓN", emoji: "🫁" }, { word: "HÍGADO", emoji: "🩺" }, { word: "NARIZ", emoji: "👃" }] },
    { category: "Figuras geométricas 3D", intruder: { word: "CÍRCULO", emoji: "⭕" }, options: [{ word: "CUBO", emoji: "🧊" }, { word: "ESFERA", emoji: "🔴" }, { word: "PIRÁMIDE", emoji: "🔺" }, { word: "CÍRCULO", emoji: "⭕" }] }
  ],
  intermedio: [
    { category: "Elementos del tiempo atmosférico", intruder: { word: "MONTAÑA", emoji: "⛰️" }, options: [{ word: "TORMENTA", emoji: "⛈️" }, { word: "NIEBLA", emoji: "🌫️" }, { word: "GRANIZO", emoji: "🌨️" }, { word: "MONTAÑA", emoji: "⛰️" }] },
    { category: "Sinónimos de 'decir'", intruder: { word: "SALTAR", emoji: "🦘" }, options: [{ word: "AFIRMAR", emoji: "✅" }, { word: "MENCIONAR", emoji: "💬" }, { word: "RELATAR", emoji: "📖" }, { word: "SALTAR", emoji: "🦘" }] },
    { category: "Animales en peligro de extinción", intruder: { word: "PALOMA", emoji: "🕊️" }, options: [{ word: "PANDA", emoji: "🐼" }, { word: "RINOCERONTE", emoji: "🦏" }, { word: "GORILA", emoji: "🦍" }, { word: "PALOMA", emoji: "🕊️" }] },
    { category: "Tipos de energía", intruder: { word: "DINERO", emoji: "💰" }, options: [{ word: "SOLAR", emoji: "☀️" }, { word: "EÓLICA", emoji: "💨" }, { word: "HIDRÁULICA", emoji: "💧" }, { word: "DINERO", emoji: "💰" }] }
  ],
  avanzado: [
    { category: "Ramas de la ciencia", intruder: { word: "PINTURA", emoji: "🖼️" }, options: [{ word: "BIOLOGÍA", emoji: "🔬" }, { word: "QUÍMICA", emoji: "⚗️" }, { word: "FÍSICA", emoji: "⚛️" }, { word: "PINTURA", emoji: "🖼️" }] },
    { category: "Verbos en subjuntivo", intruder: { word: "CORRO", emoji: "🏃" }, options: [{ word: "CORRA", emoji: "🏃" }, { word: "HABLE", emoji: "💬" }, { word: "PIENSE", emoji: "🤔" }, { word: "CORRO", emoji: "🏃" }] },
    { category: "Sistemas del cuerpo humano", intruder: { word: "MONTAÑA", emoji: "⛰️" }, options: [{ word: "DIGESTIVO", emoji: "🫀" }, { word: "NERVIOSO", emoji: "🧠" }, { word: "RESPIRATORIO", emoji: "🫁" }, { word: "MONTAÑA", emoji: "⛰️" }] },
    { category: "Ecosistemas", intruder: { word: "MESA", emoji: "🪑" }, options: [{ word: "SELVA", emoji: "🌿" }, { word: "DESIERTO", emoji: "🏜️" }, { word: "OCÉANO", emoji: "🌊" }, { word: "MESA", emoji: "🪑" }] }
  ]
}

const categoriesN7 = {
  inicial: [
    { category: "Formas de comunicación no verbal", intruder: { word: "GRITAR", emoji: "📢" }, options: [{ word: "GESTICULAR", emoji: "🤙" }, { word: "MIRADA", emoji: "👁️" }, { word: "POSTURA", emoji: "🧍" }, { word: "GRITAR", emoji: "📢" }] },
    { category: "Figuras retóricas", intruder: { word: "CORRER", emoji: "🏃" }, options: [{ word: "METÁFORA", emoji: "🎭" }, { word: "HIPÉRBOLE", emoji: "💬" }, { word: "IRONÍA", emoji: "😏" }, { word: "CORRER", emoji: "🏃" }] },
    { category: "Instituciones democráticas", intruder: { word: "HOSPITAL", emoji: "🏥" }, options: [{ word: "PARLAMENTO", emoji: "🏛️" }, { word: "TRIBUNAL", emoji: "⚖️" }, { word: "MINISTERIO", emoji: "🏢" }, { word: "HOSPITAL", emoji: "🏥" }] },
    { category: "Argumentos lógicos", intruder: { word: "OPINIÓN", emoji: "💭" }, options: [{ word: "PREMISA", emoji: "📌" }, { word: "CONCLUSIÓN", emoji: "✅" }, { word: "EVIDENCIA", emoji: "🔍" }, { word: "OPINIÓN", emoji: "💭" }] }
  ],
  intermedio: [
    { category: "Géneros literarios", intruder: { word: "HISTORIA", emoji: "📜" }, options: [{ word: "NOVELA", emoji: "📚" }, { word: "POESÍA", emoji: "🎵" }, { word: "TEATRO", emoji: "🎭" }, { word: "HISTORIA", emoji: "📜" }] },
    { category: "Conceptos matemáticos abstractos", intruder: { word: "MANZANA", emoji: "🍎" }, options: [{ word: "ÁLGEBRA", emoji: "🔢" }, { word: "GEOMETRÍA", emoji: "📐" }, { word: "PROBABILIDAD", emoji: "🎲" }, { word: "MANZANA", emoji: "🍎" }] },
    { category: "Valores democráticos", intruder: { word: "COMPETIR", emoji: "🏆" }, options: [{ word: "IGUALDAD", emoji: "⚖️" }, { word: "LIBERTAD", emoji: "🕊️" }, { word: "SOLIDARIDAD", emoji: "🤝" }, { word: "COMPETIR", emoji: "🏆" }] },
    { category: "Conectores adversativos", intruder: { word: "PORQUE", emoji: "🔗" }, options: [{ word: "AUNQUE", emoji: "🔄" }, { word: "SIN EMBARGO", emoji: "⛔" }, { word: "A PESAR DE", emoji: "🚧" }, { word: "PORQUE", emoji: "🔗" }] }
  ],
  avanzado: [
    { category: "Tipos de argumento", intruder: { word: "EMOCIÓN", emoji: "😊" }, options: [{ word: "DEDUCTIVO", emoji: "🔽" }, { word: "INDUCTIVO", emoji: "🔼" }, { word: "ANALÓGICO", emoji: "🔁" }, { word: "EMOCIÓN", emoji: "😊" }] },
    { category: "Elementos de la narrativa", intruder: { word: "SUMA", emoji: "➕" }, options: [{ word: "NUDO", emoji: "🪢" }, { word: "DESENLACE", emoji: "🔓" }, { word: "CLÍMAX", emoji: "⬆️" }, { word: "SUMA", emoji: "➕" }] },
    { category: "Procesos cognitivos superiores", intruder: { word: "CAMINAR", emoji: "🚶" }, options: [{ word: "RAZONAR", emoji: "🧠" }, { word: "INFERIR", emoji: "🔍" }, { word: "ABSTRAE R", emoji: "💡" }, { word: "CAMINAR", emoji: "🚶" }] },
    { category: "Disciplinas filosóficas", intruder: { word: "COCINAR", emoji: "👨‍🍳" }, options: [{ word: "ÉTICA", emoji: "⚖️" }, { word: "LÓGICA", emoji: "🔢" }, { word: "EPISTEMOLOGÍA", emoji: "📖" }, { word: "COCINAR", emoji: "👨‍🍳" }] }
  ]
}

// ── Instructions content per level ────────────────────────────────────────────

const instructionsN2 = {
  inicial: [
    { instruction: "Señala la luna", simplified: "Luna", elements: 1, correct: "LUNA", options: [{ word: "LUNA", emoji: "🌙" }, { word: "SOL", emoji: "☀️" }, { word: "NUBE", emoji: "☁️" }, { word: "ESTRELLA", emoji: "⭐" }] },
    { instruction: "Señala el pan", simplified: "Pan", elements: 1, correct: "PAN", options: [{ word: "PAN", emoji: "🍞" }, { word: "MANZANA", emoji: "🍎" }, { word: "HUEVO", emoji: "🥚" }, { word: "GALLETA", emoji: "🍪" }] }
  ],
  intermedio: [
    { instruction: "Toca el animal grande", simplified: "Grande", elements: 2, correct: "ELEFANTE", options: [{ word: "ELEFANTE", emoji: "🐘" }, { word: "RATÓN", emoji: "🐭" }, { word: "PÁJARO", emoji: "🐦" }, { word: "GATO", emoji: "🐈" }] },
    { instruction: "Señala la fruta roja", simplified: "Roja", elements: 2, correct: "MANZANA", options: [{ word: "MANZANA", emoji: "🍎" }, { word: "PLÁTANO", emoji: "🍌" }, { word: "UVA", emoji: "🍇" }, { word: "PERA", emoji: "🍐" }] },
    { instruction: "Toca el vehículo que vuela", simplified: "Vuela", elements: 2, correct: "AVIÓN", options: [{ word: "AVIÓN", emoji: "✈️" }, { word: "COCHE", emoji: "🚗" }, { word: "BICI", emoji: "🚲" }, { word: "BARCO", emoji: "⛵" }] },
    { instruction: "Señala el animal del mar", simplified: "Mar", elements: 2, correct: "PEZ", options: [{ word: "PEZ", emoji: "🐟" }, { word: "PERRO", emoji: "🐕" }, { word: "GATO", emoji: "🐈" }, { word: "CONEJO", emoji: "🐰" }] },
    { instruction: "Toca la ropa de abrigo", simplified: "Abrigo", elements: 2, correct: "CHAQUETA", options: [{ word: "CHAQUETA", emoji: "🧥" }, { word: "CAMISETA", emoji: "👕" }, { word: "BAÑADOR", emoji: "🩱" }, { word: "SANDALIA", emoji: "👡" }] }
  ],
  avanzado: [
    { instruction: "Toca el animal pequeño que vuela y hace miel", simplified: "Miel", elements: 3, correct: "ABEJA", options: [{ word: "ABEJA", emoji: "🐝" }, { word: "MARIPOSA", emoji: "🦋" }, { word: "PÁJARO", emoji: "🐦" }, { word: "MOSCA", emoji: "🪰" }] },
    { instruction: "Señala la fruta amarilla que se pela", simplified: "Amarilla", elements: 3, correct: "PLÁTANO", options: [{ word: "PLÁTANO", emoji: "🍌" }, { word: "LIMÓN", emoji: "🍋" }, { word: "MANZANA", emoji: "🍎" }, { word: "NARANJA", emoji: "🍊" }] },
    { instruction: "Toca el vehículo grande que va por el agua", simplified: "Agua grande", elements: 3, correct: "BARCO", options: [{ word: "BARCO", emoji: "⛵" }, { word: "AVIÓN", emoji: "✈️" }, { word: "TREN", emoji: "🚂" }, { word: "COCHE", emoji: "🚗" }] }
  ]
}

const instructionsN3 = {
  inicial: [
    { instruction: "Pon el gato encima de la mesa", simplified: "Encima", elements: 2, correct: "ENCIMA", options: [{ word: "ENCIMA", emoji: "⬆️" }, { word: "DEBAJO", emoji: "⬇️" }, { word: "DENTRO", emoji: "📦" }, { word: "AL LADO", emoji: "↔️" }] },
    { instruction: "Pon la pelota dentro de la caja", simplified: "Dentro", elements: 2, correct: "DENTRO", options: [{ word: "DENTRO", emoji: "📦" }, { word: "FUERA", emoji: "🚪" }, { word: "ENCIMA", emoji: "⬆️" }, { word: "DETRÁS", emoji: "🔙" }] },
    { instruction: "Pon el perro detrás del árbol", simplified: "Detrás", elements: 2, correct: "DETRÁS", options: [{ word: "DETRÁS", emoji: "🔙" }, { word: "DELANTE", emoji: "➡️" }, { word: "ENCIMA", emoji: "⬆️" }, { word: "DENTRO", emoji: "📦" }] },
    { instruction: "Señala el animal que corre rápido", simplified: "Rápido", elements: 2, correct: "GUEPARDO", options: [{ word: "GUEPARDO", emoji: "🐆" }, { word: "TORTUGA", emoji: "🐢" }, { word: "CARACOL", emoji: "🐌" }, { word: "PATO", emoji: "🦆" }] },
    { instruction: "Toca la fruta que es agria", simplified: "Agria", elements: 2, correct: "LIMÓN", options: [{ word: "LIMÓN", emoji: "🍋" }, { word: "MANGO", emoji: "🥭" }, { word: "PERA", emoji: "🍐" }, { word: "SANDÍA", emoji: "🍉" }] }
  ],
  intermedio: [
    { instruction: "Señala el niño que está triste y llorando", simplified: "Triste", elements: 3, correct: "TRISTE", options: [{ word: "TRISTE", emoji: "😢" }, { word: "CONTENTO", emoji: "😊" }, { word: "ASUSTADO", emoji: "😨" }, { word: "ENFADADO", emoji: "😠" }] },
    { instruction: "Toca el animal que es grande y tiene trompa", simplified: "Trompa", elements: 3, correct: "ELEFANTE", options: [{ word: "ELEFANTE", emoji: "🐘" }, { word: "HIPOPÓTAMO", emoji: "🦛" }, { word: "RINOCERONTE", emoji: "🦏" }, { word: "GORILA", emoji: "🦍" }] },
    { instruction: "Señala lo que usas cuando llueve y hace frío", simplified: "Lluvia frío", elements: 3, correct: "PARAGUAS", options: [{ word: "PARAGUAS", emoji: "☂️" }, { word: "GAFAS DE SOL", emoji: "🕶️" }, { word: "BAÑADOR", emoji: "🩱" }, { word: "ABANICO", emoji: "🪭" }] },
    { instruction: "Toca el vehículo que va bajo el agua", simplified: "Bajo agua", elements: 2, correct: "SUBMARINO", options: [{ word: "SUBMARINO", emoji: "🤿" }, { word: "BARCO", emoji: "⛵" }, { word: "AVIÓN", emoji: "✈️" }, { word: "TREN", emoji: "🚂" }] },
    { instruction: "Señala el lugar donde se compra comida", simplified: "Comprar comida", elements: 2, correct: "MERCADO", options: [{ word: "MERCADO", emoji: "🏪" }, { word: "HOSPITAL", emoji: "🏥" }, { word: "ESCUELA", emoji: "🏫" }, { word: "PARQUE", emoji: "🌳" }] }
  ],
  avanzado: [
    { instruction: "Toca al profesional que cura a los enfermos en el hospital", simplified: "Cura enfermos", elements: 3, correct: "MÉDICO", options: [{ word: "MÉDICO", emoji: "👨‍⚕️" }, { word: "MAESTRO", emoji: "👨‍🏫" }, { word: "BOMBERO", emoji: "👨‍🚒" }, { word: "COCINERO", emoji: "👨‍🍳" }] },
    { instruction: "Señala el animal nocturno que ve en la oscuridad y vuela", simplified: "Noche vuela", elements: 3, correct: "MURCIÉLAGO", options: [{ word: "MURCIÉLAGO", emoji: "🦇" }, { word: "BÚHO", emoji: "🦉" }, { word: "PÁJARO", emoji: "🐦" }, { word: "MARIPOSA", emoji: "🦋" }] },
    { instruction: "Toca la herramienta que se usa para clavar cosas en la pared", simplified: "Clavar", elements: 2, correct: "MARTILLO", options: [{ word: "MARTILLO", emoji: "🔨" }, { word: "TIJERAS", emoji: "✂️" }, { word: "REGLA", emoji: "📏" }, { word: "PEGAMENTO", emoji: "🧴" }] },
    { instruction: "Señala el lugar donde los niños van a aprender con un maestro", simplified: "Aprender", elements: 3, correct: "ESCUELA", options: [{ word: "ESCUELA", emoji: "🏫" }, { word: "HOSPITAL", emoji: "🏥" }, { word: "MERCADO", emoji: "🏪" }, { word: "ESTADIO", emoji: "🏟️" }] }
  ]
}

const instructionsN4 = {
  inicial: [
    { instruction: "Toca el que NO es un animal", simplified: "No animal", elements: 2, correct: "SILLA", options: [{ word: "SILLA", emoji: "💺" }, { word: "PERRO", emoji: "🐕" }, { word: "GATO", emoji: "🐈" }, { word: "PÁJARO", emoji: "🐦" }] },
    { instruction: "Señala el que NO se come", simplified: "No se come", elements: 2, correct: "PIEDRA", options: [{ word: "PIEDRA", emoji: "🪨" }, { word: "MANZANA", emoji: "🍎" }, { word: "PAN", emoji: "🍞" }, { word: "HUEVO", emoji: "🥚" }] },
    { instruction: "Toca todos los animales que puedas ver", simplified: "Animales", elements: 2, correct: "ANIMALES", options: [{ word: "ANIMALES", emoji: "🐾" }, { word: "VEHÍCULOS", emoji: "🚗" }, { word: "FRUTAS", emoji: "🍎" }, { word: "ROPA", emoji: "👕" }] },
    { instruction: "Señala el más pequeño de todos", simplified: "Más pequeño", elements: 2, correct: "RATÓN", options: [{ word: "RATÓN", emoji: "🐭" }, { word: "PERRO", emoji: "🐕" }, { word: "CABALLO", emoji: "🐴" }, { word: "ELEFANTE", emoji: "🐘" }] }
  ],
  intermedio: [
    { instruction: "Toca el animal que tiene cuatro patas y ladra", simplified: "Ladra", elements: 3, correct: "PERRO", options: [{ word: "PERRO", emoji: "🐕" }, { word: "GATO", emoji: "🐈" }, { word: "PÁJARO", emoji: "🐦" }, { word: "PEZ", emoji: "🐟" }] },
    { instruction: "Señala lo que usas para escribir que no es un lápiz", simplified: "Escribir no lápiz", elements: 3, correct: "BOLÍGRAFO", options: [{ word: "BOLÍGRAFO", emoji: "🖊️" }, { word: "LÁPIZ", emoji: "✏️" }, { word: "TIJERAS", emoji: "✂️" }, { word: "REGLA", emoji: "📏" }] },
    { instruction: "Toca el vehículo más rápido que hay", simplified: "Más rápido", elements: 2, correct: "AVIÓN", options: [{ word: "AVIÓN", emoji: "✈️" }, { word: "BICI", emoji: "🚲" }, { word: "COCHE", emoji: "🚗" }, { word: "BARCO", emoji: "⛵" }] },
    { instruction: "Señala el instrumento que se toca con las manos golpeando", simplified: "Golpear", elements: 3, correct: "TAMBOR", options: [{ word: "TAMBOR", emoji: "🥁" }, { word: "FLAUTA", emoji: "🎶" }, { word: "GUITARRA", emoji: "🎸" }, { word: "PIANO", emoji: "🎹" }] }
  ],
  avanzado: [
    { instruction: "Toca primero el animal y luego el vehículo", simplified: "Animal luego vehículo", elements: 3, correct: "ORDEN", options: [{ word: "ORDEN", emoji: "1️⃣2️⃣" }, { word: "INVERTIDO", emoji: "2️⃣1️⃣" }, { word: "SOLO ANIMAL", emoji: "🐾" }, { word: "SOLO VEHÍCULO", emoji: "🚗" }] },
    { instruction: "Señala lo que NO necesitas cuando hace sol y calor", simplified: "Sol calor no necesitas", elements: 3, correct: "PARAGUAS", options: [{ word: "PARAGUAS", emoji: "☂️" }, { word: "GAFAS SOL", emoji: "🕶️" }, { word: "CREMA", emoji: "🧴" }, { word: "GORRA", emoji: "🧢" }] },
    { instruction: "Toca el animal que puede vivir dentro y fuera del agua", simplified: "Agua tierra", elements: 3, correct: "RANA", options: [{ word: "RANA", emoji: "🐸" }, { word: "PEZ", emoji: "🐟" }, { word: "DELFÍN", emoji: "🐬" }, { word: "PERRO", emoji: "🐕" }] },
    { instruction: "Señala la profesión que ayuda cuando hay un incendio", simplified: "Incendio", elements: 2, correct: "BOMBERO", options: [{ word: "BOMBERO", emoji: "👨‍🚒" }, { word: "MÉDICO", emoji: "👨‍⚕️" }, { word: "MAESTRO", emoji: "👨‍🏫" }, { word: "POLICÍA", emoji: "👮" }] }
  ]
}

const instructionsN5 = {
  inicial: [
    { instruction: "Si el animal tiene alas, tócalo", simplified: "Alas", elements: 2, correct: "PÁJARO", options: [{ word: "PÁJARO", emoji: "🐦" }, { word: "PERRO", emoji: "🐕" }, { word: "GATO", emoji: "🐈" }, { word: "PEZ", emoji: "🐟" }] },
    { instruction: "Señala el que es más largo que un metro", simplified: "Más largo", elements: 2, correct: "SERPIENTE", options: [{ word: "SERPIENTE", emoji: "🐍" }, { word: "RATÓN", emoji: "🐭" }, { word: "PULGA", emoji: "🦟" }, { word: "HORMIGA", emoji: "🐜" }] },
    { instruction: "Toca lo que se hace ANTES de comer", simplified: "Antes comer", elements: 2, correct: "LAVARSE", options: [{ word: "LAVARSE", emoji: "🧼" }, { word: "DORMIR", emoji: "😴" }, { word: "CORRER", emoji: "🏃" }, { word: "PINTAR", emoji: "🎨" }] },
    { instruction: "Señala lo que ocurre DESPUÉS del día", simplified: "Después día", elements: 2, correct: "NOCHE", options: [{ word: "NOCHE", emoji: "🌙" }, { word: "MAÑANA", emoji: "🌅" }, { word: "TARDE", emoji: "🌇" }, { word: "MEDIODÍA", emoji: "☀️" }] },
    { instruction: "Toca el que es igual pero de diferente color", simplified: "Diferente color", elements: 3, correct: "DIFERENTE", options: [{ word: "DIFERENTE", emoji: "🎨" }, { word: "IGUAL", emoji: "👯" }, { word: "MÁS GRANDE", emoji: "🔝" }, { word: "MÁS PEQUEÑO", emoji: "🔽" }] }
  ],
  intermedio: [
    { instruction: "Si llueve, ¿qué coges para salir a la calle?", simplified: "Llueve qué", elements: 2, correct: "PARAGUAS", options: [{ word: "PARAGUAS", emoji: "☂️" }, { word: "GAFAS SOL", emoji: "🕶️" }, { word: "ABANICO", emoji: "🪭" }, { word: "GORRA", emoji: "🧢" }] },
    { instruction: "Señala lo que harías primero: ducharte o desayunar", simplified: "Primero", elements: 2, correct: "DUCHARSE", options: [{ word: "DUCHARSE", emoji: "🚿" }, { word: "DESAYUNAR", emoji: "🥐" }, { word: "JUGAR", emoji: "🎮" }, { word: "SALIR", emoji: "🚶" }] },
    { instruction: "Toca el que usarías si quisieras llamar a alguien", simplified: "Llamar", elements: 2, correct: "TELÉFONO", options: [{ word: "TELÉFONO", emoji: "📱" }, { word: "LIBRO", emoji: "📚" }, { word: "LÁPIZ", emoji: "✏️" }, { word: "PELOTA", emoji: "⚽" }] },
    { instruction: "Señala lo que NO deberías hacer en la biblioteca", simplified: "Biblioteca no", elements: 3, correct: "GRITAR", options: [{ word: "GRITAR", emoji: "📢" }, { word: "LEER", emoji: "📖" }, { word: "ESTUDIAR", emoji: "📝" }, { word: "BUSCAR LIBROS", emoji: "🔍" }] },
    { instruction: "Toca lo que sucede cuando plantas una semilla y la riegas", simplified: "Semilla", elements: 3, correct: "PLANTA", options: [{ word: "PLANTA", emoji: "🌱" }, { word: "LLUVIA", emoji: "🌧️" }, { word: "SOL", emoji: "☀️" }, { word: "TIERRA", emoji: "🪱" }] }
  ],
  avanzado: [
    { instruction: "Señala lo que NO harías si quisieras hacer amigos", simplified: "No amigos", elements: 3, correct: "IGNORAR", options: [{ word: "IGNORAR", emoji: "🙈" }, { word: "SONREÍR", emoji: "😊" }, { word: "COMPARTIR", emoji: "🤝" }, { word: "ESCUCHAR", emoji: "👂" }] },
    { instruction: "Toca lo que pasa cuando comes demasiado azúcar sin cepillarte", simplified: "Azúcar dientes", elements: 3, correct: "CARIES", options: [{ word: "CARIES", emoji: "🦷" }, { word: "MÚSCULO", emoji: "💪" }, { word: "ALTURA", emoji: "📏" }, { word: "VISTA", emoji: "👁️" }] },
    { instruction: "Señala la consecuencia de no dormir suficiente", simplified: "Sin dormir", elements: 2, correct: "CANSANCIO", options: [{ word: "CANSANCIO", emoji: "😴" }, { word: "ENERGÍA", emoji: "⚡" }, { word: "ALEGRÍA", emoji: "😊" }, { word: "CONCENTRACIÓN", emoji: "🎯" }] },
    { instruction: "Toca lo que necesitas para resolver un problema matemático", simplified: "Matemáticas", elements: 2, correct: "PENSAR", options: [{ word: "PENSAR", emoji: "🤔" }, { word: "CORRER", emoji: "🏃" }, { word: "DORMIR", emoji: "😴" }, { word: "CANTAR", emoji: "🎵" }] }
  ]
}

// ── Apply to each JSON file ───────────────────────────────────────────────────

const updates = [
  { file: 'N1.json', categories: EMPTY_CI, instructions: EMPTY_CI },
  { file: 'N2.json', categories: EMPTY_CI, instructions: instructionsN2 },
  { file: 'N3.json', categories: categoriesN3, instructions: instructionsN3 },
  { file: 'N4.json', categories: categoriesN4, instructions: instructionsN4 },
  { file: 'N5.json', categories: categoriesN5, instructions: instructionsN5 },
  { file: 'N6.json', categories: categoriesN6, instructions: EMPTY_CI },
  { file: 'N7.json', categories: categoriesN7, instructions: EMPTY_CI },
]

for (const { file, categories, instructions } of updates) {
  const filePath = path.join(contentDir, file)
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  data.categories = categories
  data.instructions = instructions
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
  console.log(`Updated ${file}`)
}

console.log('Done.')
