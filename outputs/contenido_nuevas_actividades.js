// ============================================================
// CONTENIDO CLÍNICO — NUEVAS ACTIVIDADES
// Agregar dentro de cada JSON de nivel correspondiente
// ============================================================

// ─────────────────────────────────────────────────────────────
// ACTIVIDAD: rhymes (Rimas) — componente: fonologico
// Disponible desde N3 (3 años). Evidencia: conciencia fonológica
// es el predictor más fuerte de lectoescritura (Narbona, 2001)
// ─────────────────────────────────────────────────────────────
// Estructura de cada ítem:
// {
//   word: "SOL",          ← palabra estímulo
//   emoji: "☀️",          ← imagen de apoyo
//   correct: "COL",       ← respuesta correcta
//   options: ["COL","PAN","MESA","TREN"]  ← 4 opciones (reducedOptions usa solo 2)
// }

// ── N1.json — rhymes: NO disponible (18-24m: aún no hay conciencia fonológica)
// Agregar en N1.json:
"rhymes": { "inicial": [], "intermedio": [], "avanzado": [] }

// ── N2.json — rhymes: NO disponible (2-3 años: emergente, no trabajar formalmente)
"rhymes": { "inicial": [], "intermedio": [], "avanzado": [] }

// ── N3.json — rhymes: INICIAL (3-4 años: rimas simples CV-CV)
// Agregar en N3.json:
"rhymes": {
  "inicial": [
    { "word": "SOL",  "emoji": "☀️",  "correct": "COL",  "options": ["COL","MESA","PERRO","SILLA"] },
    { "word": "PAN",  "emoji": "🍞",  "correct": "CAN",  "options": ["CAN","GATO","ÁRBOL","PELOTA"] },
    { "word": "MAR",  "emoji": "🌊",  "correct": "PAR",  "options": ["PAR","MESA","COCHE","FLOR"] },
    { "word": "PIE",  "emoji": "🦶",  "correct": "TIE",  "options": ["TIE","CASA","LIBRO","LUNA"] },
    { "word": "GOL",  "emoji": "⚽",  "correct": "ROL",  "options": ["ROL","PLATO","CAMA","PATO"] }
  ],
  "intermedio": [
    { "word": "TREN", "emoji": "🚂", "correct": "BIEN", "options": ["BIEN","COPA","ÁRBOL","PLAYA"] },
    { "word": "FLOR", "emoji": "🌸", "correct": "COLOR","options": ["COLOR","PERRO","MESA","LECHE"] },
    { "word": "PATO", "emoji": "🦆", "correct": "GATO", "options": ["GATO","SOPA","LIBRO","COCHE"] },
    { "word": "BOCA", "emoji": "👄", "correct": "FOCA", "options": ["FOCA","NIÑO","DEDO","CAMIÓN"] },
    { "word": "LUNA", "emoji": "🌙", "correct": "UNA",  "options": ["UNA","CAMA","PERA","BOLSA"] }
  ],
  "avanzado": [
    { "word": "NIEVE",  "emoji": "❄️",  "correct": "NUBE",   "options": ["NUBE","ÁRBOL","ZAPATO","TIJERA"] },
    { "word": "PUENTE", "emoji": "🌉", "correct": "FUENTE", "options": ["FUENTE","CAMINO","JARDÍN","PALOMA"] },
    { "word": "CIELO",  "emoji": "🌤️", "correct": "HIELO",  "options": ["HIELO","TIERRA","FLORES","BARCO"] },
    { "word": "PIEDRA", "emoji": "🪨", "correct": "MADERA", "options": ["MADERA","CAMISA","FRUTA","MÚSICA"] },
    { "word": "GLOBO",  "emoji": "🎈", "correct": "LOBO",   "options": ["LOBO","SILLA","COCINA","JARDÍN"] }
  ]
}

// ── N4.json — rhymes (4-5 años: rimas con palabras más largas)
"rhymes": {
  "inicial": [
    { "word": "CASA",   "emoji": "🏠", "correct": "MASA",   "options": ["MASA","PERRO","LLUVIA","CAMIÓN"] },
    { "word": "POLLO",  "emoji": "🐔", "correct": "ROLLO",  "options": ["ROLLO","PLAYA","CIUDAD","CUCHARA"] },
    { "word": "CINTA",  "emoji": "🎀", "correct": "PINTA",  "options": ["PINTA","ÁRBOL","ZAPATO","CIGÜEÑA"] },
    { "word": "RAMA",   "emoji": "🌿", "correct": "CAMA",   "options": ["CAMA","PÁJARO","ESCUELA","VENTANA"] }
  ],
  "intermedio": [
    { "word": "CAMINO", "emoji": "🛤️", "correct": "DESTINO","options": ["DESTINO","PELOTA","ESTRELLA","COLUMPIO"] },
    { "word": "JARDÍN", "emoji": "🌻", "correct": "DELFÍN", "options": ["DELFÍN","PALOMA","CAMISETA","PARAGUAS"] },
    { "word": "PALOMA", "emoji": "🕊️", "correct": "AROMA",  "options": ["AROMA","CIUDAD","ESCALERA","MONTAÑA"] },
    { "word": "DRAGÓN", "emoji": "🐉", "correct": "BALÓN",  "options": ["BALÓN","TORTUGA","PARAGUAS","SILENCIO"] }
  ],
  "avanzado": [
    { "word": "ESTRELLA","emoji": "⭐","correct": "BOTELLA", "options": ["BOTELLA","COLUMPIO","MARIPOSA","CAMISETA"] },
    { "word": "MONTAÑA", "emoji": "⛰️","correct": "CABAÑA", "options": ["CABAÑA","TORTUGA","HOSPITAL","PARAGUAS"] },
    { "word": "CORAZÓN", "emoji": "❤️","correct": "CANCIÓN","options": ["CANCIÓN","PARAGUAS","MARIPOSA","CHOCOLATE"] },
    { "word": "MARIPOSA","emoji": "🦋","correct": "ROSA",   "options": ["ROSA","CALENDARIO","PARAGUAS","DINOSAURIO"] }
  ]
}

// ── N5.json — rhymes (5-6 años: rimas con sílabas complejas, trabantes)
"rhymes": {
  "inicial": [
    { "word": "TROMPO", "emoji": "🪀", "correct": "CAMPO",  "options": ["CAMPO","CIUDAD","ESTRELLA","VENTANA"] },
    { "word": "FRUTA",  "emoji": "🍎", "correct": "BRUTA",  "options": ["BRUTA","CAMINO","PALOMA","DESIERTO"] },
    { "word": "BRAZO",  "emoji": "💪", "correct": "PLAZO",  "options": ["PLAZO","CIUDAD","COLMENA","ESCALERA"] },
    { "word": "PLANTA", "emoji": "🌱", "correct": "MANTA",  "options": ["MANTA","CAJÓN","ESPACIO","AVENTURA"] },
    { "word": "PREMIO", "emoji": "🏆", "correct": "REMEDIO","options": ["REMEDIO","PARAGUAS","CAMISETA","DINOSAURIO"] }
  ],
  "intermedio": [
    { "word": "CRISTAL",  "emoji": "💎", "correct": "METAL",    "options": ["METAL","CASCADA","ESPACIO","AVENTURA"] },
    { "word": "DRAGÓN",   "emoji": "🐉", "correct": "CAMIÓN",   "options": ["CAMIÓN","PALOMA","CAMISETA","ELEFANTE"] },
    { "word": "ESPADA",   "emoji": "⚔️", "correct": "GRANADA",  "options": ["GRANADA","TORTUGA","MARIPOSA","CHOCOLATE"] },
    { "word": "PRINCESA", "emoji": "👸", "correct": "MESA",     "options": ["MESA","DINOSAURIO","HELICÓPTERO","MARIPOSA"] },
    { "word": "CASTILLO", "emoji": "🏰", "correct": "ANILLO",   "options": ["ANILLO","MARIPOSA","CHOCOLATE","CALENDARIO"] }
  ],
  "avanzado": [
    { "word": "ELEFANTE",   "emoji": "🐘", "correct": "GIGANTE",    "options": ["GIGANTE","MARIPOSA","HELICÓPTERO","CALENDÁRIO"] },
    { "word": "AVENTURA",   "emoji": "🗺️", "correct": "TURA",      "options": ["TERNURA","MARIPOSA","CHOCOLATE","DINOSAURIO"] },
    { "word": "CHOCOLATE",  "emoji": "🍫", "correct": "TOMATE",     "options": ["TOMATE","HELICÓPTERO","MARIPOSA","CALENDARIO"] },
    { "word": "DINOSAURIO", "emoji": "🦕", "correct": "MARIO",      "options": ["MARIO","CHOCOLATE","HELICÓPTERO","MARIPOSA"] },
    { "word": "HELICÓPTERO","emoji": "🚁", "correct": "SOMBRERO",   "options": ["SOMBRERO","MARIPOSA","CHOCOLATE","DINOSAURIO"] }
  ]
}

// ── N6.json y N7.json — rhymes (6-12 años: conciencia fonológica avanzada,
//    rimas en contexto de versos simples)
// Agregar el mismo bloque de N5 como base; contenido avanzado con el fonoaudióloga

"rhymes": {
  "inicial":    [],
  "intermedio": [],
  "avanzado":   []
}


// ─────────────────────────────────────────────────────────────
// ACTIVIDAD: pointImages (Señala la Imagen) — componente: lexico
// Disponible N1-N3. Núcleo del diagnóstico receptivo temprano.
// Evidencia: Paul (2007), evaluación sin requerir producción oral
// ─────────────────────────────────────────────────────────────
// Estructura de cada ítem:
// {
//   word: "PERRO",        ← palabra que se dice en voz alta (TTS)
//   options: [            ← siempre 4 opciones (reducedOptions usa 2)
//     { word: "PERRO", emoji: "🐕" },   ← la correcta puede ir en cualquier posición
//     { word: "GATO",  emoji: "🐈" },
//     { word: "PÁJARO",emoji: "🐦" },
//     { word: "PEZ",   emoji: "🐟" }
//   ]
// }
// IMPORTANTE: La opción correcta es la que tiene word === item.word
// Mezclar el orden antes de renderizar (shuffle en la pantalla)

// ── N1.json — pointImages INICIAL: vocabulario primeras 50 palabras
//    (sustantivos alta frecuencia, objetos cotidianos, animales, familia)
"pointImages": {
  "inicial": [
    { "word": "MAMÁ",   "options": [{"word":"MAMÁ","emoji":"👩"},{"word":"PAPÁ","emoji":"👨"},{"word":"BEBÉ","emoji":"👶"},{"word":"ABUELA","emoji":"👵"}] },
    { "word": "PAPÁ",   "options": [{"word":"PAPÁ","emoji":"👨"},{"word":"MAMÁ","emoji":"👩"},{"word":"ABUELO","emoji":"👴"},{"word":"NIÑO","emoji":"🧒"}] },
    { "word": "PERRO",  "options": [{"word":"PERRO","emoji":"🐕"},{"word":"GATO","emoji":"🐈"},{"word":"PÁJARO","emoji":"🐦"},{"word":"PEZ","emoji":"🐟"}] },
    { "word": "GATO",   "options": [{"word":"GATO","emoji":"🐈"},{"word":"PERRO","emoji":"🐕"},{"word":"CONEJO","emoji":"🐰"},{"word":"VACA","emoji":"🐮"}] },
    { "word": "PELOTA", "options": [{"word":"PELOTA","emoji":"⚽"},{"word":"COCHE","emoji":"🚗"},{"word":"MUÑECA","emoji":"🪆"},{"word":"GLOBO","emoji":"🎈"}] },
    { "word": "AGUA",   "options": [{"word":"AGUA","emoji":"💧"},{"word":"LECHE","emoji":"🥛"},{"word":"ZUMO","emoji":"🧃"},{"word":"SOPA","emoji":"🍲"}] },
    { "word": "PAN",    "options": [{"word":"PAN","emoji":"🍞"},{"word":"MANZANA","emoji":"🍎"},{"word":"GALLETA","emoji":"🍪"},{"word":"HUEVO","emoji":"🥚"}] },
    { "word": "COCHE",  "options": [{"word":"COCHE","emoji":"🚗"},{"word":"BICI","emoji":"🚲"},{"word":"AVIÓN","emoji":"✈️"},{"word":"BARCO","emoji":"⛵"}] },
    { "word": "CASA",   "options": [{"word":"CASA","emoji":"🏠"},{"word":"ÁRBOL","emoji":"🌳"},{"word":"FLOR","emoji":"🌸"},{"word":"SOL","emoji":"☀️"}] },
    { "word": "LUNA",   "options": [{"word":"LUNA","emoji":"🌙"},{"word":"SOL","emoji":"☀️"},{"word":"ESTRELLA","emoji":"⭐"},{"word":"NUBE","emoji":"☁️"}] },
    { "word": "ZAPATO", "options": [{"word":"ZAPATO","emoji":"👟"},{"word":"GORRO","emoji":"🧢"},{"word":"CALCETÍN","emoji":"🧦"},{"word":"CHAQUETA","emoji":"🧥"}] },
    { "word": "MESA",   "options": [{"word":"MESA","emoji":"🪑"},{"word":"CAMA","emoji":"🛏️"},{"word":"SILLA","emoji":"💺"},{"word":"PUERTA","emoji":"🚪"}] }
  ],
  "intermedio": [
    { "word": "MANZANA","options": [{"word":"MANZANA","emoji":"🍎"},{"word":"PLÁTANO","emoji":"🍌"},{"word":"UVA","emoji":"🍇"},{"word":"NARANJA","emoji":"🍊"}] },
    { "word": "PLÁTANO","options": [{"word":"PLÁTANO","emoji":"🍌"},{"word":"PERA","emoji":"🍐"},{"word":"FRESA","emoji":"🍓"},{"word":"SANDÍA","emoji":"🍉"}] },
    { "word": "LIBRO",  "options": [{"word":"LIBRO","emoji":"📚"},{"word":"LÁPIZ","emoji":"✏️"},{"word":"TIJERAS","emoji":"✂️"},{"word":"MOCHILA","emoji":"🎒"}] },
    { "word": "CAMA",   "options": [{"word":"CAMA","emoji":"🛏️"},{"word":"MESA","emoji":"🪑"},{"word":"BAÑO","emoji":"🛁"},{"word":"ESPEJO","emoji":"🪞"}] },
    { "word": "ÁRBOL",  "options": [{"word":"ÁRBOL","emoji":"🌳"},{"word":"FLOR","emoji":"🌸"},{"word":"HOJA","emoji":"🍃"},{"word":"NUBE","emoji":"☁️"}] },
    { "word": "PÁJARO", "options": [{"word":"PÁJARO","emoji":"🐦"},{"word":"MARIPOSA","emoji":"🦋"},{"word":"ABEJA","emoji":"🐝"},{"word":"CARACOL","emoji":"🐌"}] },
    { "word": "TREN",   "options": [{"word":"TREN","emoji":"🚂"},{"word":"AVIÓN","emoji":"✈️"},{"word":"BARCO","emoji":"⛵"},{"word":"MOTO","emoji":"🏍️"}] },
    { "word": "LLUVIA", "options": [{"word":"LLUVIA","emoji":"🌧️"},{"word":"SOL","emoji":"☀️"},{"word":"NIEVE","emoji":"❄️"},{"word":"ARCOÍRIS","emoji":"🌈"}] }
  ],
  "avanzado": [
    { "word": "MARIPOSA","options": [{"word":"MARIPOSA","emoji":"🦋"},{"word":"ABEJA","emoji":"🐝"},{"word":"ARAÑA","emoji":"🕷️"},{"word":"LIBÉLULA","emoji":"🪲"}] },
    { "word": "ELEFANTE","options": [{"word":"ELEFANTE","emoji":"🐘"},{"word":"JIRAFA","emoji":"🦒"},{"word":"CEBRA","emoji":"🦓"},{"word":"HIPOPÓTAMO","emoji":"🦛"}] },
    { "word": "SEMÁFORO","options": [{"word":"SEMÁFORO","emoji":"🚦"},{"word":"SEÑAL","emoji":"🚧"},{"word":"PUENTE","emoji":"🌉"},{"word":"FAROLA","emoji":"🏮"}] },
    { "word": "PARAGUAS","options": [{"word":"PARAGUAS","emoji":"☂️"},{"word":"ABRIGO","emoji":"🧥"},{"word":"BUFANDA","emoji":"🧣"},{"word":"GUANTES","emoji":"🧤"}] }
  ]
}

// ── N2.json — pointImages: vocabulario ampliado, verbos y adjetivos simples
"pointImages": {
  "inicial": [
    { "word": "CORRER",  "options": [{"word":"CORRER","emoji":"🏃"},{"word":"DORMIR","emoji":"😴"},{"word":"COMER","emoji":"🍽️"},{"word":"SALTAR","emoji":"🦘"}] },
    { "word": "DORMIR",  "options": [{"word":"DORMIR","emoji":"😴"},{"word":"CORRER","emoji":"🏃"},{"word":"BAÑARSE","emoji":"🛁"},{"word":"JUGAR","emoji":"🎮"}] },
    { "word": "COMER",   "options": [{"word":"COMER","emoji":"🍽️"},{"word":"BEBER","emoji":"🥤"},{"word":"COCINAR","emoji":"👨‍🍳"},{"word":"LAVAR","emoji":"🧼"}] },
    { "word": "BEBER",   "options": [{"word":"BEBER","emoji":"🥤"},{"word":"COMER","emoji":"🍽️"},{"word":"JUGAR","emoji":"🎮"},{"word":"PINTAR","emoji":"🎨"}] },
    { "word": "GRANDE",  "options": [{"word":"GRANDE","emoji":"🐘"},{"word":"PEQUEÑO","emoji":"🐭"},{"word":"ALTO","emoji":"🦒"},{"word":"GORDO","emoji":"🐷"}] },
    { "word": "PEQUEÑO", "options": [{"word":"PEQUEÑO","emoji":"🐭"},{"word":"GRANDE","emoji":"🐘"},{"word":"LARGO","emoji":"🐍"},{"word":"REDONDO","emoji":"🌕"}] },
    { "word": "CALIENTE","options": [{"word":"CALIENTE","emoji":"🔥"},{"word":"FRÍO","emoji":"❄️"},{"word":"MOJADO","emoji":"💦"},{"word":"SECO","emoji":"🏜️"}] },
    { "word": "FRÍO",    "options": [{"word":"FRÍO","emoji":"❄️"},{"word":"CALIENTE","emoji":"🔥"},{"word":"SUAVE","emoji":"🪶"},{"word":"DURO","emoji":"🪨"}] }
  ],
  "intermedio": [
    { "word": "CONTENTO","options": [{"word":"CONTENTO","emoji":"😊"},{"word":"TRISTE","emoji":"😢"},{"word":"ENFADADO","emoji":"😠"},{"word":"ASUSTADO","emoji":"😨"}] },
    { "word": "TRISTE",  "options": [{"word":"TRISTE","emoji":"😢"},{"word":"CONTENTO","emoji":"😊"},{"word":"SORPRENDIDO","emoji":"😲"},{"word":"ABURRIDO","emoji":"😑"}] },
    { "word": "JUGAR",   "options": [{"word":"JUGAR","emoji":"🎮"},{"word":"ESTUDIAR","emoji":"📚"},{"word":"PINTAR","emoji":"🎨"},{"word":"CANTAR","emoji":"🎵"}] },
    { "word": "PINTAR",  "options": [{"word":"PINTAR","emoji":"🎨"},{"word":"CONSTRUIR","emoji":"🧱"},{"word":"LEER","emoji":"📖"},{"word":"ESCRIBIR","emoji":"✏️"}] },
    { "word": "ARRIBA",  "options": [{"word":"ARRIBA","emoji":"⬆️"},{"word":"ABAJO","emoji":"⬇️"},{"word":"DENTRO","emoji":"📦"},{"word":"FUERA","emoji":"🚪"}] },
    { "word": "ABAJO",   "options": [{"word":"ABAJO","emoji":"⬇️"},{"word":"ARRIBA","emoji":"⬆️"},{"word":"AL LADO","emoji":"↔️"},{"word":"LEJOS","emoji":"🌄"}] }
  ],
  "avanzado": [
    { "word": "ESCUELA", "options": [{"word":"ESCUELA","emoji":"🏫"},{"word":"HOSPITAL","emoji":"🏥"},{"word":"MERCADO","emoji":"🏪"},{"word":"PARQUE","emoji":"🌳"}] },
    { "word": "MÉDICO",  "options": [{"word":"MÉDICO","emoji":"👨‍⚕️"},{"word":"MAESTRO","emoji":"👨‍🏫"},{"word":"COCINERO","emoji":"👨‍🍳"},{"word":"BOMBERO","emoji":"👨‍🚒"}] },
    { "word": "COCINA",  "options": [{"word":"COCINA","emoji":"🍳"},{"word":"BAÑO","emoji":"🛁"},{"word":"DORMITORIO","emoji":"🛏️"},{"word":"SALÓN","emoji":"🛋️"}] },
    { "word": "PESADO",  "options": [{"word":"PESADO","emoji":"🏋️"},{"word":"LIGERO","emoji":"🪶"},{"word":"BLANDO","emoji":"🧸"},{"word":"RUIDOSO","emoji":"📢"}] }
  ]
}

// ── N3.json — pointImages: verbos de acción, categorías, adjetivos más complejos
"pointImages": {
  "inicial": [
    { "word": "VOLAR",    "options": [{"word":"VOLAR","emoji":"✈️"},{"word":"NADAR","emoji":"🏊"},{"word":"TREPAR","emoji":"🧗"},{"word":"RODAR","emoji":"🎳"}] },
    { "word": "NADAR",    "options": [{"word":"NADAR","emoji":"🏊"},{"word":"CORRER","emoji":"🏃"},{"word":"SALTAR","emoji":"🦘"},{"word":"GATEAR","emoji":"🧒"}] },
    { "word": "RÁPIDO",   "options": [{"word":"RÁPIDO","emoji":"🐆"},{"word":"LENTO","emoji":"🐌"},{"word":"SILENCIOSO","emoji":"🤫"},{"word":"FUERTE","emoji":"💪"}] },
    { "word": "PESADO",   "options": [{"word":"PESADO","emoji":"⚓"},{"word":"LIGERO","emoji":"🪶"},{"word":"DURO","emoji":"🪨"},{"word":"SUAVE","emoji":"🧸"}] },
    { "word": "COCINAR",  "options": [{"word":"COCINAR","emoji":"👨‍🍳"},{"word":"LIMPIAR","emoji":"🧹"},{"word":"CONSTRUIR","emoji":"🏗️"},{"word":"REPARAR","emoji":"🔧"}] }
  ],
  "intermedio": [
    { "word": "VERDURAS",  "options": [{"word":"VERDURAS","emoji":"🥦"},{"word":"FRUTAS","emoji":"🍎"},{"word":"CARNES","emoji":"🥩"},{"word":"LÁCTEOS","emoji":"🧀"}] },
    { "word": "HERRAMIENTA","options": [{"word":"HERRAMIENTA","emoji":"🔨"},{"word":"JUGUETE","emoji":"🧸"},{"word":"ROPA","emoji":"👕"},{"word":"ALIMENTO","emoji":"🍽️"}] },
    { "word": "PELIGROSO", "options": [{"word":"PELIGROSO","emoji":"⚠️"},{"word":"SEGURO","emoji":"✅"},{"word":"DIVERTIDO","emoji":"🎉"},{"word":"ABURRIDO","emoji":"😑"}] },
    { "word": "COMPARTIR", "options": [{"word":"COMPARTIR","emoji":"🤝"},{"word":"GUARDAR","emoji":"💾"},{"word":"ROMPER","emoji":"💥"},{"word":"ESCONDER","emoji":"🙈"}] },
    { "word": "INSTRUMENTO","options": [{"word":"INSTRUMENTO","emoji":"🎸"},{"word":"DEPORTE","emoji":"⚽"},{"word":"ANIMAL","emoji":"🐾"},{"word":"VEHÍCULO","emoji":"🚗"}] }
  ],
  "avanzado": [
    { "word": "TÍMIDO",    "options": [{"word":"TÍMIDO","emoji":"😳"},{"word":"VALIENTE","emoji":"🦁"},{"word":"GENEROSO","emoji":"🎁"},{"word":"CURIOSO","emoji":"🔍"}] },
    { "word": "GENEROSO",  "options": [{"word":"GENEROSO","emoji":"🎁"},{"word":"EGOÍSTA","emoji":"🙅"},{"word":"PACIENTE","emoji":"⏳"},{"word":"IMPULSIVO","emoji":"💥"}] },
    { "word": "RESOLVER",  "options": [{"word":"RESOLVER","emoji":"🧩"},{"word":"IGNORAR","emoji":"🙈"},{"word":"INVENTAR","emoji":"💡"},{"word":"IMAGINAR","emoji":"🌈"}] },
    { "word": "DIFERENTE", "options": [{"word":"DIFERENTE","emoji":"🦄"},{"word":"IGUAL","emoji":"👯"},{"word":"PARECIDO","emoji":"≈"},{"word":"OPUESTO","emoji":"↔️"}] }
  ]
}

// ── N4-N7: pointImages vacío (la actividad no aplica clínicamente en estos niveles)
"pointImages": { "inicial": [], "intermedio": [], "avanzado": [] }
