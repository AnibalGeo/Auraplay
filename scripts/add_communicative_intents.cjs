const fs = require('fs')
const path = require('path')

const EMPTY = { "inicial": [], "intermedio": [], "avanzado": [] }

const N4 = {
  "inicial": [
    { "scenario": "Sofía dice: «¿Me das un poco de tu merienda, por favor?»", "emoji": "🙏", "correct": "Pedir", "options": ["Pedir","Rechazar","Saludar","Informar"] },
    { "scenario": "Lucas dice: «No quiero jugar ahora mismo»", "emoji": "🙅", "correct": "Rechazar", "options": ["Rechazar","Pedir","Agradecer","Saludar"] },
    { "scenario": "María entra a clase y dice: «¡Buenos días!»", "emoji": "👋", "correct": "Saludar", "options": ["Saludar","Pedir","Informar","Disculparse"] },
    { "scenario": "Pablo dice: «Gracias por ayudarme»", "emoji": "😊", "correct": "Agradecer", "options": ["Agradecer","Pedir","Rechazar","Quejarse"] },
    { "scenario": "Ana dice: «Lo siento, fue sin querer»", "emoji": "😔", "correct": "Disculparse", "options": ["Disculparse","Agradecer","Informar","Saludar"] }
  ],
  "intermedio": [
    { "scenario": "Carlos dice: «El recreo termina en cinco minutos»", "emoji": "📢", "correct": "Informar", "options": ["Informar","Pedir","Saludar","Rechazar"] },
    { "scenario": "Elena dice: «¿A qué hora llega el autobús?»", "emoji": "🤔", "correct": "Preguntar", "options": ["Preguntar","Informar","Pedir","Agradecer"] },
    { "scenario": "Tomás dice: «¿Quieres venir a mi cumpleaños el sábado?»", "emoji": "🎉", "correct": "Invitar", "options": ["Invitar","Pedir","Informar","Rechazar"] },
    { "scenario": "Laura dice: «¡Cuidado, el suelo está mojado!»", "emoji": "⚠️", "correct": "Advertir", "options": ["Advertir","Informar","Ordenar","Pedir"] },
    { "scenario": "Diego dice: «No te preocupes, todo va a salir bien»", "emoji": "🤗", "correct": "Consolar", "options": ["Consolar","Agradecer","Animar","Informar"] }
  ],
  "avanzado": [
    { "scenario": "Valeria lleva esperando mucho y dice: «Siempre llegas tarde, es muy molesto»", "emoji": "😤", "correct": "Protestar", "options": ["Protestar","Informar","Rechazar","Quejarse"] },
    { "scenario": "Iván dice: «¿Y si jugamos al escondite en vez de al fútbol?»", "emoji": "💡", "correct": "Proponer", "options": ["Proponer","Pedir","Invitar","Preguntar"] },
    { "scenario": "Marta dice: «No voy a hacer eso aunque me lo pidas»", "emoji": "🚫", "correct": "Negarse", "options": ["Negarse","Rechazar","Protestar","Informar"] },
    { "scenario": "El entrenador dice: «¡Tú puedes, no te rindas!»", "emoji": "🌟", "correct": "Animar", "options": ["Animar","Consolar","Felicitar","Informar"] }
  ]
}

const N5 = {
  "inicial": [
    { "scenario": "La maestra dice: «Qué bien lo has explicado hoy»", "emoji": "🎊", "correct": "Felicitar", "options": ["Felicitar","Informar","Animar","Agradecer"] },
    { "scenario": "Papá dice: «¡Cuántas veces te he dicho que recojas tu cuarto!»", "emoji": "😠", "correct": "Reprochar", "options": ["Reprochar","Ordenar","Protestar","Informar"] },
    { "scenario": "La profesora dice: «Sientate ya»", "emoji": "👆", "correct": "Ordenar", "options": ["Ordenar","Pedir","Informar","Advertir"] },
    { "scenario": "Sara dice: «Este trabajo me parece muy difícil y aburrido»", "emoji": "😒", "correct": "Quejarse", "options": ["Quejarse","Informar","Protestar","Rechazar"] },
    { "scenario": "Miguel dice: «Oye, tengo una idea: podríamos decorar el aula juntos»", "emoji": "💡", "correct": "Proponer", "options": ["Proponer","Invitar","Pedir","Informar"] }
  ],
  "intermedio": [
    { "scenario": "Alguien dice: «¡Qué calor hace aquí!» mirando la ventana cerrada", "emoji": "🥵", "question": "¿Qué quiere realmente decir?", "correct": "Pedir", "options": ["Pedir","Informar","Quejarse","Protestar"] },
    { "scenario": "Un niño dice: «¡Anda, qué bonito dibujo!» con tono burlón", "emoji": "😏", "question": "¿Qué intención tiene realmente?", "correct": "Reprochar", "options": ["Reprochar","Felicitar","Animar","Informar"] },
    { "scenario": "Lucía dice: «No me apetece mucho ir a esa fiesta...»", "emoji": "😬", "question": "¿Qué intenta comunicar Lucía?", "correct": "Rechazar", "options": ["Rechazar","Informar","Quejarse","Negarse"] },
    { "scenario": "El médico dice: «Sería bueno que tomases más agua cada día»", "emoji": "💧", "question": "¿Qué intención tiene el médico?", "correct": "Advertir", "options": ["Advertir","Informar","Ordenar","Pedir"] },
    { "scenario": "Una amiga que está llorando escucha: «Cuéntame qué pasó, aquí estoy»", "emoji": "🤗", "question": "¿Para qué sirve lo que dice?", "correct": "Consolar", "options": ["Consolar","Preguntar","Informar","Animar"] }
  ],
  "avanzado": [
    { "scenario": "En una reunión alguien dice: «Bueno, si nadie tiene más ideas, podríamos intentar lo que propuse antes»", "emoji": "💼", "question": "¿Cuál es la intención comunicativa?", "correct": "Proponer", "options": ["Proponer","Informar","Ordenar","Preguntar"] },
    { "scenario": "Un vendedor dice: «Este modelo es el más vendido, casi no quedan»", "emoji": "🛍️", "question": "¿Qué intenta conseguir el vendedor?", "correct": "Pedir", "options": ["Pedir","Informar","Advertir","Proponer"] },
    { "scenario": "La directora dice: «Me parece que este proyecto merece más atención»", "emoji": "📋", "question": "¿Qué intención tiene realmente?", "correct": "Ordenar", "options": ["Ordenar","Informar","Proponer","Advertir"] },
    { "scenario": "Un compañero dice: «No sé si podré terminar esto solo...» mirándote", "emoji": "😅", "question": "¿Qué intenta comunicar?", "correct": "Pedir", "options": ["Pedir","Informar","Quejarse","Advertir"] }
  ]
}

const N6 = {
  "inicial": [
    { "scenario": "Un cliente en un restaurante dice: «Este filete está un poco crudo»", "emoji": "🥩", "question": "¿Qué intenta conseguir el cliente?", "correct": "Quejarse", "options": ["Quejarse","Informar","Pedir","Protestar"] },
    { "scenario": "Una persona mayor dice: «¡En mis tiempos los jóvenes eran más respetuosos!»", "emoji": "👴", "question": "¿Cuál es la intención?", "correct": "Reprochar", "options": ["Reprochar","Informar","Quejarse","Protestar"] },
    { "scenario": "Un político dice: «Trabajaremos por el bienestar de todos los ciudadanos»", "emoji": "🏛️", "question": "¿Cuál es la intención comunicativa?", "correct": "Proponer", "options": ["Proponer","Informar","Animar","Pedir"] },
    { "scenario": "Una persona dice: «¡Vaya, qué oportuno que llegues justo cuando acabamos de fregar!»", "emoji": "😒", "question": "¿Qué intención tiene realmente?", "correct": "Reprochar", "options": ["Reprochar","Saludar","Informar","Felicitar"] }
  ],
  "intermedio": [
    { "scenario": "El jefe dice: «Cuando puedas, me mandas ese informe»", "emoji": "📊", "question": "¿Qué intención tiene realmente el jefe?", "correct": "Ordenar", "options": ["Ordenar","Pedir","Proponer","Informar"] },
    { "scenario": "Una amiga dice: «Tu nuevo corte de pelo es… diferente»", "emoji": "✂️", "question": "¿Qué intenta comunicar sin decirlo directamente?", "correct": "Quejarse", "options": ["Quejarse","Felicitar","Informar","Reprochar"] },
    { "scenario": "Alguien pregunta: «¿No crees que deberías pedir perdón?»", "emoji": "🤨", "question": "¿Qué intención hay detrás de la pregunta?", "correct": "Ordenar", "options": ["Ordenar","Preguntar","Advertir","Reprochar"] },
    { "scenario": "Un médico dice: «Los resultados son normales, no hay nada de qué preocuparse»", "emoji": "🩺", "question": "¿Para qué sirve lo que dice el médico?", "correct": "Consolar", "options": ["Consolar","Informar","Animar","Advertir"] }
  ],
  "avanzado": [
    { "scenario": "Un abogado dice: «Mi cliente no recuerda haber estado en ese lugar»", "emoji": "⚖️", "question": "¿Cuál es la intención comunicativa real?", "correct": "Negarse", "options": ["Negarse","Informar","Advertir","Proponer"] },
    { "scenario": "Un periodista pregunta: «¿No le parece que el gobierno podría haber actuado antes?»", "emoji": "🎙️", "question": "¿Qué intención tiene la pregunta?", "correct": "Reprochar", "options": ["Reprochar","Preguntar","Informar","Protestar"] },
    { "scenario": "Alguien dice: «Sí, claro, faltaría más» con cara de fastidio", "emoji": "😑", "question": "¿Qué intención tiene realmente?", "correct": "Protestar", "options": ["Protestar","Agradecer","Negarse","Informar"] },
    { "scenario": "Un profesor dice: «Interesante respuesta... aunque quizás podríamos pensarlo mejor»", "emoji": "🤔", "question": "¿Cuál es la intención del profesor?", "correct": "Reprochar", "options": ["Reprochar","Animar","Proponer","Informar"] }
  ]
}

const N7 = {
  "inicial": [
    { "scenario": "Un político dice en campaña: «Yo soy como vosotros, conozco vuestros problemas»", "emoji": "🗳️", "question": "¿Cuál es la intención comunicativa?", "correct": "Proponer", "options": ["Proponer","Informar","Animar","Pedir"] },
    { "scenario": "Alguien escribe en redes: «¡Qué calor hace aquí!» mirando la ventana cerrada", "emoji": "📱", "question": "¿Qué intención hay detrás del mensaje?", "correct": "Quejarse", "options": ["Quejarse","Informar","Protestar","Reprochar"] },
    { "scenario": "Un vendedor de seguros dice: «¿Ha pensado en lo que pasaría si mañana le ocurriera algo?»", "emoji": "📋", "question": "¿Qué intenta conseguir el vendedor?", "correct": "Advertir", "options": ["Advertir","Preguntar","Informar","Pedir"] },
    { "scenario": "Una madre dice: «¡Anda, mira qué ordenada está tu habitación!» con ironía", "emoji": "🙃", "question": "¿Cuál es la intención real?", "correct": "Reprochar", "options": ["Reprochar","Felicitar","Animar","Informar"] }
  ],
  "intermedio": [
    { "scenario": "Un negociador dice: «Creo que ambas partes podemos beneficiarnos de llegar a un acuerdo»", "emoji": "🤝", "question": "¿Cuál es la intención comunicativa?", "correct": "Proponer", "options": ["Proponer","Informar","Pedir","Animar"] },
    { "scenario": "Alguien dice: «No es que no quiera ayudarte, es que tengo muchas cosas hoy»", "emoji": "😅", "question": "¿Qué intenta comunicar?", "correct": "Negarse", "options": ["Negarse","Informar","Disculparse","Rechazar"] },
    { "scenario": "Un entrenador dice tras una derrota: «Hoy no fue nuestro día, pero hemos aprendido»", "emoji": "⚽", "question": "¿Cuál es la intención del entrenador?", "correct": "Animar", "options": ["Animar","Informar","Consolar","Reprochar"] },
    { "scenario": "Alguien publica: «Otra vez obras en mi calle. ¡Gracias por avisar!»", "emoji": "🚧", "question": "¿Qué intención tiene el mensaje?", "correct": "Protestar", "options": ["Protestar","Agradecer","Informar","Quejarse"] }
  ],
  "avanzado": [
    { "scenario": "Un abogado defensor dice: «Mi cliente siempre ha sido un ciudadano ejemplar»", "emoji": "⚖️", "question": "¿Cuál es la intención comunicativa en este contexto?", "correct": "Proponer", "options": ["Proponer","Informar","Animar","Negarse"] },
    { "scenario": "Alguien dice: «No te digo que no tengas razón, pero...»", "emoji": "🤷", "question": "¿Qué intención hay detrás?", "correct": "Rechazar", "options": ["Rechazar","Agradecer","Proponer","Informar"] },
    { "scenario": "Un médico dice: «Podríamos plantearnos reducir un poco el consumo de sal»", "emoji": "🧂", "question": "¿Cuál es la intención real del médico?", "correct": "Ordenar", "options": ["Ordenar","Proponer","Informar","Advertir"] },
    { "scenario": "Una persona escribe: «¡Qué maravillosa sorpresa encontrar el coche rayado!»", "emoji": "🚗", "question": "¿Cuál es la intención real del mensaje?", "correct": "Protestar", "options": ["Protestar","Felicitar","Informar","Quejarse"] }
  ]
}

const updates = {
  'N1.json': EMPTY,
  'N2.json': EMPTY,
  'N3.json': EMPTY,
  'N4.json': N4,
  'N5.json': N5,
  'N6.json': N6,
  'N7.json': N7,
}

const contentDir = path.join(__dirname, '..', 'src', 'data', 'content')

for (const [filename, data] of Object.entries(updates)) {
  const filepath = path.join(contentDir, filename)
  const json = JSON.parse(fs.readFileSync(filepath, 'utf8'))
  json.communicativeIntents = data
  fs.writeFileSync(filepath, JSON.stringify(json, null, 2), 'utf8')
  console.log(`Updated ${filename}`)
}

console.log('Done.')
