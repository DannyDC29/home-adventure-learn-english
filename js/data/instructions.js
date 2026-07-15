/* ============================================
   GAME_INSTRUCTIONS
   Catálogo de textos de instrucciones: las generales (se muestran
   una vez, tras elegir personaje) y las de cada sub-nivel (se
   muestran justo antes de empezar esa misión).

   Solo el nivel "1.1" está conectado a un nivel jugable por ahora
   (js/levels/level1.js). El resto de entradas (1.2, 1.3, 2.x, 3.x,
   4.x) ya están escritas y listas para usarse en cuanto se
   construyan esos niveles: solo hay que llamar a
   Messages/overlay con la clave correspondiente (ej. "2.1").
   ============================================ */

const GAME_INSTRUCTIONS = {
  general: [
    { icon: "🎯", text: "Complete every room by finishing its three missions." },
    { icon: "❤️", text: "Don't lose all your lives. If you lose your three hearts, you will die." },
    { icon: "🔊", text: "Listen to the English words." },
    { icon: "💯", text: "Earn 10 points for every correct answer or correct object." },
    { icon: "🏆", text: "Complete every room to build your perfect house." },
  ],

  levels: {
    "1.1": {
      room: "Living Room",
      title: "Level 1.1 – Living Room Hunt",
      mission: "Move around the room and collect only the living room objects. Avoid the wrong objects.",
      extra: ["❤️ If you lose your three hearts, you will die."],
    },
    "1.2": {
      room: "Living Room",
      title: "Level 1.2 – Living Room Quiz",
      mission: "Answer the questions by choosing the correct action for each living room object.",
      examples: [
        "Sofa → Sit on the sofa.",
        "Lamp → Turn on the lamp.",
        "Coffee table → Put a book on the table.",
      ],
      extra: ["💯 Correct answers give you 10 points."],
    },
    "1.3": {
      room: "Living Room",
      title: "Level 1.3 – Organize the Living Room",
      mission: "Drag each collected object to the correct place in the living room by following the highlighted location. Complete all the tasks to unlock the next room.",
    },

    "2.1": {
      room: "Kitchen",
      title: "Level 2.1 – Kitchen Hunt",
      mission: "Move around and collect only the kitchen objects. Avoid the wrong objects.",
      extra: ["❤️ If you lose your three hearts, you will die."],
    },
    "2.2": {
      room: "Kitchen",
      title: "Level 2.2 – Kitchen Quiz",
      mission: "Choose the correct action for each kitchen object.",
      examples: [
        "Stove → Cook food.",
        "Refrigerator → Store food.",
        "Sink → Wash the dishes.",
        "Microwave → Heat food.",
      ],
      extra: ["💯 Correct answers give you 10 points."],
    },
    "2.3": {
      room: "Kitchen",
      title: "Level 2.3 – Organize the Kitchen",
      mission: "Drag each collected object to the correct place by following the highlighted location.",
    },

    "3.1": {
      room: "Bathroom",
      title: "Level 3.1 – Bathroom Hunt",
      mission: "Collect only the bathroom objects. Avoid the wrong objects.",
      extra: ["❤️ If you lose your three hearts, you will die."],
    },
    "3.2": {
      room: "Bathroom",
      title: "Level 3.2 – Bathroom Quiz",
      mission: "Choose the correct action for each bathroom object.",
      examples: [
        "Shower → Take a shower.",
        "Sink → Wash your hands.",
        "Toilet → Flush the toilet.",
        "Mirror → Look in the mirror.",
      ],
      extra: ["💯 Correct answers give you 10 points."],
    },
    "3.3": {
      room: "Bathroom",
      title: "Level 3.3 – Organize the Bathroom",
      mission: "Drag each collected object to its correct place by following the highlighted location.",
    },

    "4.1": {
      room: "Bedroom",
      title: "Level 4.1 – Bedroom Hunt",
      mission: "Collect only the bedroom objects. Avoid the wrong objects.",
      extra: ["❤️ If you lose your three hearts, you will die."],
    },
    "4.2": {
      room: "Bedroom",
      title: "Level 4.2 – Bedroom Quiz",
      mission: "Choose the correct action for each bedroom object.",
      examples: [
        "Bed → Sleep in the bed.",
        "Wardrobe → Put away clothes.",
        "Desk → Study.",
        "Lamp → Turn on the lamp.",
      ],
      extra: ["💯 Correct answers give you 10 points."],
    },
    "4.3": {
      room: "Bedroom",
      title: "Level 4.3 – Organize the Bedroom",
      mission: "Drag each collected object to the correct place by following the highlighted location.",
    },
  },
};
