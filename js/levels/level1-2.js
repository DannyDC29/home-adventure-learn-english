/* ============================================
   Nivel 1.2 — Living Room Quiz
   Se activa cuando el jugador termina el Nivel 1.1 (Hunt) y presiona
   "Next Level". Muestra al personaje elegido (niña o niño) al lado de
   una tarjeta con 10 preguntas de opción múltiple sobre los 7 objetos
   de la sala recolectados en el 1.1 ("¿Qué haces con el sofá?", etc.).

   Reutiliza el mismo HUD, el mismo sistema de mensajes (Messages) y el
   mismo overlay de instrucciones genérico que ya usa el Nivel 1.1
   (GAME_INSTRUCTIONS.levels["1.2"], definido en js/data/instructions.js).
   ============================================ */

(function initLevel1_2() {
  const LEVEL_KEY = "1.2"; // clave en GAME_INSTRUCTIONS.levels

  const ITEM_ICON_BASE = "assets/sprites/items/";
  const CHARACTER_IDLE = {
    girl: "assets/sprites/girl/Nina_Down_Idle.png",
    boy: "assets/sprites/boy/Nino_Down_Idle.png",
  };

  // Los mismos 7 objetos correctos del Nivel 1.1, cada uno con la acción
  // en inglés que le corresponde (base de las preguntas del quiz).
  const OBJECT_ACTIONS = [
    { name: "Sofa", icon: "Sofa.png", action: "Sit on the sofa." },
    { name: "TV", icon: "TV.png", action: "Turn on the TV." },
    { name: "Carpet", icon: "Carpet.png", action: "Walk on the carpet." },
    { name: "Lamp", icon: "Lamp.png", action: "Turn on the lamp." },
    { name: "Coffee Table", icon: "Coffee_Table.png", action: "Put a cup on the table." },
    { name: "Armchair", icon: "Armchair.png", action: "Sit in the armchair." },
    { name: "Clock", icon: "Clock.png", action: "Look at the clock." },
  ];

  const container = document.getElementById("gameContainer");
  const gameWrapperEl = document.querySelector("#gameScreen .game-wrapper");
  const levelTitleEl = document.getElementById("levelTitle");

  const quizWrapper = document.getElementById("quizWrapper");
  const quizCharacterImg = document.getElementById("quizCharacterImg");
  const quizProgressEl = document.getElementById("quizProgress");
  const quizQuestionTextEl = document.getElementById("quizQuestionText");
  const quizQuestionIconEl = document.getElementById("quizQuestionIcon");
  const quizOptionsEl = document.getElementById("quizOptions");

  const levelInstructionsOverlay = document.getElementById("levelInstructionsOverlay");
  const levelInstructionsVisualEl = document.getElementById("levelInstructionsVisual");
  const levelInstructionsTextEl = document.getElementById("levelInstructionsText");
  const levelInstructionsRoomEl = document.getElementById("levelInstructionsRoom");
  const levelInstructionsTitleEl = document.getElementById("levelInstructionsTitle");
  const levelInstructionsMissionEl = document.getElementById("levelInstructionsMission");
  const levelInstructionsExamplesEl = document.getElementById("levelInstructionsExamples");
  const levelInstructionsExtraEl = document.getElementById("levelInstructionsExtra");
  const startMissionBtn = document.getElementById("startMissionBtn");
  const startMissionTextBtn = document.getElementById("startMissionTextBtn");

  const quizCompleteOverlay = document.getElementById("quizCompleteOverlay");
  const quizCompleteSummaryEl = document.getElementById("quizCompleteSummary");
  const quizNextLevelBtn = document.getElementById("quizNextLevelBtn");

  let currentCharacter = "girl";
  let questions = [];
  let currentIndex = 0;
  let quizScore = 0;
  let answered = false;

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Arma las 10 preguntas: 7 del tipo "¿Qué haces con el objeto X?"
  // (una por cada objeto del Nivel 1.1) + 3 del tipo "¿Cuál objeto...?"
  // (mismo vocabulario, ángulo distinto, para reforzar el aprendizaje).
  function buildQuestions() {
    const objectQuestions = OBJECT_ACTIONS.map((obj) => {
      const distractors = shuffle(OBJECT_ACTIONS.filter((o) => o.name !== obj.name))
        .slice(0, 3)
        .map((o) => o.action);
      return {
        icon: ITEM_ICON_BASE + obj.icon,
        prompt: `What do you do with the ${obj.name}?`,
        options: shuffle([obj.action, ...distractors]),
        correctAnswer: obj.action,
        revealIconUpfront: true, // el objeto ya está en la pregunta, no es spoiler
        speakText: obj.action,
      };
    });

    const clueQuestions = [
      {
        icon: ITEM_ICON_BASE + "Clock.png",
        prompt: "Which object helps you know what time it is?",
        options: shuffle(["Clock", "Sofa", "Lamp", "TV"]),
        correctAnswer: "Clock",
        revealIconUpfront: false, // revelar el ícono antes sería dar la respuesta
        speakText: "Clock",
      },
      {
        icon: ITEM_ICON_BASE + "TV.png",
        prompt: "Which object do you turn on to watch your favorite show?",
        options: shuffle(["TV", "Carpet", "Armchair", "Coffee Table"]),
        correctAnswer: "TV",
        revealIconUpfront: false,
        speakText: "TV",
      },
      {
        icon: ITEM_ICON_BASE + "Armchair.png",
        prompt: "Which object is comfortable for sitting and reading a book?",
        options: shuffle(["Armchair", "Clock", "Lamp", "Carpet"]),
        correctAnswer: "Armchair",
        revealIconUpfront: false,
        speakText: "Armchair",
      },
    ];

    return shuffle([...objectQuestions, ...clueQuestions]);
  }

  // ---------- Instrucciones del nivel (mismo overlay genérico del 1.1) ----------
  function populateLevelInstructions() {
    const data = GAME_INSTRUCTIONS.levels[LEVEL_KEY];
    if (!data) return;

    levelInstructionsVisualEl.classList.add("hidden");
    levelInstructionsTextEl.classList.remove("hidden");

    levelInstructionsRoomEl.textContent = data.room;
    levelInstructionsTitleEl.textContent = data.title;
    levelInstructionsMissionEl.textContent = data.mission;

    if (data.examples && data.examples.length > 0) {
      levelInstructionsExamplesEl.innerHTML = data.examples.map((ex) => `<li>${ex}</li>`).join("");
      levelInstructionsExamplesEl.classList.remove("hidden");
    } else {
      levelInstructionsExamplesEl.innerHTML = "";
      levelInstructionsExamplesEl.classList.add("hidden");
    }

    if (data.extra && data.extra.length > 0) {
      levelInstructionsExtraEl.innerHTML = data.extra.map((ex) => `<li>${ex}</li>`).join("");
      levelInstructionsExtraEl.classList.remove("hidden");
    } else {
      levelInstructionsExtraEl.innerHTML = "";
      levelInstructionsExtraEl.classList.add("hidden");
    }
  }

  function showLevelInstructions() {
    populateLevelInstructions();
    levelInstructionsOverlay.classList.remove("hidden");
  }

  function hideLevelInstructions() {
    levelInstructionsOverlay.classList.add("hidden");
  }

  function beginMission() {
    hideLevelInstructions();
    Messages.showSequence(
      [Messages.CATALOG.missionStarted, Messages.CATALOG.goodLuck],
      {
        variant: "info",
        duration: 1100,
        gap: 150,
        onComplete: () => startQuiz(),
      }
    );
  }

  // ---------- Lógica del quiz ----------
  function startQuiz() {
    questions = buildQuestions();
    currentIndex = 0;
    quizScore = 0;
    renderQuestion();
  }

  function renderQuestion() {
    answered = false;
    const q = questions[currentIndex];

    quizProgressEl.textContent = `Question ${currentIndex + 1} / ${questions.length}`;
    quizQuestionTextEl.textContent = q.prompt;

    if (q.revealIconUpfront) {
      quizQuestionIconEl.src = q.icon;
      quizQuestionIconEl.classList.remove("hidden");
    } else {
      quizQuestionIconEl.classList.add("hidden");
    }

    quizOptionsEl.innerHTML = "";
    q.options.forEach((optionText) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-option-btn";
      btn.textContent = optionText;
      btn.addEventListener("click", () => handleAnswer(optionText, btn));
      quizOptionsEl.appendChild(btn);
    });
  }

  function handleAnswer(selectedText, btnEl) {
    if (answered) return;
    answered = true;

    const q = questions[currentIndex];
    const isCorrect = selectedText === q.correctAnswer;
    const allButtons = quizOptionsEl.querySelectorAll(".quiz-option-btn");
    allButtons.forEach((b) => (b.disabled = true));

    if (isCorrect) {
      btnEl.classList.add("correct");
      AudioManager.playCorrect();
      HUD.addScore(10);
      quizScore += 10;
      Messages.showBanner(Messages.CATALOG.correct, "success", 1000);
    } else {
      btnEl.classList.add("wrong");
      AudioManager.playIncorrect();
      Messages.showBanner(Messages.CATALOG.wrongAnswer, "error", 1000);
      // Resaltamos cuál era la opción correcta para que quede como aprendizaje.
      allButtons.forEach((b) => {
        if (b.textContent === q.correctAnswer) b.classList.add("correct");
      });
    }

    // Revela el ícono del objeto (si estaba oculto por ser pregunta tipo
    // "pista") y pronuncia la respuesta correcta en inglés — refuerza
    // vocabulario tanto visual como auditivo, sin importar si acertó.
    quizQuestionIconEl.src = q.icon;
    quizQuestionIconEl.classList.remove("hidden");
    AudioManager.speak(q.speakText);

    setTimeout(() => {
      currentIndex += 1;
      if (currentIndex >= questions.length) {
        onQuizComplete();
      } else {
        renderQuestion();
      }
    }, isCorrect ? 1200 : 1800);
  }

  function onQuizComplete() {
    Messages.showSequence(
      [Messages.CATALOG.wellDone, Messages.CATALOG.roomComplete],
      {
        variant: "success",
        duration: 1100,
        gap: 150,
        onComplete: () => {
          quizCompleteSummaryEl.textContent = `You scored ${quizScore} points in the quiz!`;
          quizCompleteOverlay.classList.remove("hidden");
        },
      }
    );
  }

  quizNextLevelBtn.addEventListener("click", () => {
    alert("¡Nivel 1.3 — Organize the Living Room llegará pronto! 🚧");
  });

  // ---------- Punto de entrada ----------
  // Llamado por js/levels/level1.js cuando el jugador termina el Hunt
  // (1.1) y presiona "Next Level". Oculta la escena del Hunt, muestra
  // el panel del Quiz con el personaje elegido, y toma control del
  // botón "Start Mission" (compartido con el 1.1) para esta misión.
  window.startLevel1_2 = async function startLevel1_2(character) {
    currentCharacter = character === "boy" ? "boy" : "girl";
    quizCharacterImg.src = CHARACTER_IDLE[currentCharacter];

    if (gameWrapperEl) gameWrapperEl.classList.add("hidden");
    quizWrapper.classList.remove("hidden");

    levelTitleEl.textContent = "Level 1.2 — Living Room Quiz";

    // Nos "apropiamos" del botón Start Mission mientras esta misión
    // esté activa (level1.js usa .onclick, no addEventListener, a
    // propósito para que esta reasignación reemplace limpiamente el
    // handler anterior sin quedar los dos sonando a la vez).
    startMissionBtn.onclick = beginMission;
    startMissionTextBtn.onclick = beginMission;

    showLevelInstructions();
  };
})();
