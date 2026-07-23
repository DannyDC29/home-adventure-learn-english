/* ============================================
   Nivel 1 — Living Room Hunt
   El jugador recorre la sala recolectando únicamente los
   objetos que pertenecen al Living Room.
   ============================================ */

(function initLevel1() {
  // ---------- Datos del nivel ----------
  const CORRECT_ITEMS = ["Sofa", "TV", "Carpet", "Lamp", "Coffee Table", "Armchair", "Clock"];
  const INCORRECT_ITEMS = ["Toilet", "Bed", "Frying Pan", "Shower"];

  // Ícono visual (imagen PNG) para representar qué es cada objeto,
  // además del nombre en inglés. Los archivos van en assets/sprites/items/.
  const ITEM_ICON_BASE = "assets/sprites/items/";
  const ICONS = {
    "Sofa": ITEM_ICON_BASE + "Sofa.png",
    "TV": ITEM_ICON_BASE + "TV.png",
    "Carpet": ITEM_ICON_BASE + "Carpet.png",
    "Lamp": ITEM_ICON_BASE + "Lamp.png",
    "Coffee Table": ITEM_ICON_BASE + "Coffee_Table.png",
    "Armchair": ITEM_ICON_BASE + "Armchair.png",
    "Clock": ITEM_ICON_BASE + "Clock.png",
    "Toilet": ITEM_ICON_BASE + "Toilet.png",
    "Bed": ITEM_ICON_BASE + "Bed.png",
    "Frying Pan": ITEM_ICON_BASE + "Frying_Pan.png",
    "Shower": ITEM_ICON_BASE + "Shower.png",
  };

  const ITEM_SIZE = 70;
  const PLAYER_SIZE = 60;
  const MARGIN = 10; // margen respecto a los bordes del escenario
  const LEVEL_KEY = "1.1"; // clave en GAME_INSTRUCTIONS.levels (js/data/instructions.js)

  const container = document.getElementById("gameContainer");
  const toastEl = document.getElementById("toast");
  const overlayEl = document.getElementById("levelCompleteOverlay");
  const overlaySummaryEl = document.getElementById("overlaySummary");
  const nextLevelBtn = document.getElementById("nextLevelBtn");

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

  const gameOverOverlay = document.getElementById("gameOverOverlay");
  const gameOverSummaryEl = document.getElementById("gameOverSummary");
  const retryBtn = document.getElementById("retryBtn");

  let player = null;
  let items = [];

  // ---------- Precarga de imágenes ----------
  // Descarga TODAS las imágenes (sprites del personaje en las 8 direcciones
  // + íconos de los objetos) ANTES de empezar a jugar. Esto evita que la
  // animación se vea lenta/entrecortada la primera vez que se necesita cada
  // imagen (algo que se nota mucho más cuando el juego está en internet,
  // ej. GitHub Pages, que al abrirlo localmente desde el disco).
  function collectAllImageUrls() {
    const urls = new Set();

    try {
      // Sprites del personaje: SPRITE_FRAMES está definido en player.js y es
      // visible aquí porque ambos scripts comparten el mismo scope global.
      Object.values(SPRITE_FRAMES).forEach((characterFrames) => {
        Object.values(characterFrames).forEach((frames) => {
          urls.add(frames.idle);
          frames.walk.forEach((src) => urls.add(src));
        });
      });
    } catch (err) {
      console.error("⚠️ No se pudo leer SPRITE_FRAMES (¿player.js cargó bien?):", err);
    }

    // Íconos de los objetos del nivel.
    Object.values(ICONS).forEach((src) => urls.add(src));

    return [...urls];
  }

  function preloadImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ url, ok: true });
      img.onerror = () => resolve({ url, ok: false });
      img.src = url;
    });
  }

  async function preloadAllImages(onProgress) {
    const urls = collectAllImageUrls();
    let loaded = 0;
    const results = await Promise.all(
      urls.map((url) =>
        preloadImage(url).then((result) => {
          loaded += 1;
          if (onProgress) onProgress(loaded, urls.length);
          return result;
        })
      )
    );

    // Si alguna imagen no cargó, lo avisamos en la consola con su ruta
    // exacta — el motivo más común es una diferencia de mayúsculas/
    // minúsculas entre el nombre del archivo y el nombre usado en el
    // código (en GitHub Pages esto SÍ importa, aunque en tu computador
    // no se note).
    const failed = results.filter((r) => !r.ok);
    if (failed.length > 0) {
      console.warn(
        "⚠️ No se pudieron cargar estas imágenes (revisa mayúsculas/minúsculas y que el archivo exista en esa ruta exacta):",
        failed.map((f) => f.url)
      );
    }
  }

  let toastTimeoutId = null;
  const incorrectCooldowns = new WeakMap(); // evita spam de sonido/toast por overlap continuo
  let currentCharacter = "girl";

  // ---------- Utilidades de posicionamiento ----------

  // Genera una posición aleatoria dentro del espacio lógico, evitando
  // solaparse demasiado con posiciones ya ocupadas.
  function randomPosition(existingRects, size) {
    const maxAttempts = 60;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = MARGIN + Math.random() * (GameEngine.LOGICAL_WIDTH - size - MARGIN * 2);
      const y = MARGIN + 40 + Math.random() * (GameEngine.LOGICAL_HEIGHT - size - MARGIN * 2 - 40);
      const candidate = { x, y, width: size, height: size };

      const overlaps = existingRects.some((rect) => GameEngine.rectsOverlap(candidate, rect));
      if (!overlaps) return { x, y };
    }
    // Si no encontramos hueco libre tras varios intentos, devolvemos
    // igualmente una posición (mejor mostrar algo que fallar).
    return {
      x: MARGIN + Math.random() * (GameEngine.LOGICAL_WIDTH - size - MARGIN * 2),
      y: MARGIN + 40 + Math.random() * (GameEngine.LOGICAL_HEIGHT - size - MARGIN * 2 - 40),
    };
  }

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // ---------- Toast ----------
  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.remove("hidden");
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(() => {
      toastEl.classList.add("hidden");
    }, 1200);
  }

  // ---------- Instrucciones del nivel ----------
  // Llena el overlay con el texto de GAME_INSTRUCTIONS.levels[LEVEL_KEY]
  // (definido en js/data/instructions.js) y lo muestra. El juego queda
  // en pausa (GameEngine no ha arrancado todavía) hasta que el jugador
  // presiona "Start Mission".
  function populateLevelInstructions() {
    const data = GAME_INSTRUCTIONS.levels[LEVEL_KEY];
    if (!data) return;

    const isLevel11 = LEVEL_KEY === "1.1";

    if (isLevel11) {
      levelInstructionsVisualEl.classList.remove("hidden");
      levelInstructionsTextEl.classList.add("hidden");
    } else {
      levelInstructionsVisualEl.classList.add("hidden");
      levelInstructionsTextEl.classList.remove("hidden");

      levelInstructionsRoomEl.textContent = data.room;
      levelInstructionsTitleEl.textContent = data.title;
      levelInstructionsMissionEl.textContent = data.mission;

      if (data.examples && data.examples.length > 0) {
        levelInstructionsExamplesEl.innerHTML = data.examples
          .map((ex) => `<li>${ex}</li>`)
          .join("");
        levelInstructionsExamplesEl.classList.remove("hidden");
      } else {
        levelInstructionsExamplesEl.innerHTML = "";
        levelInstructionsExamplesEl.classList.add("hidden");
      }

      if (data.extra && data.extra.length > 0) {
        levelInstructionsExtraEl.innerHTML = data.extra
          .map((ex) => `<li>${ex}</li>`)
          .join("");
        levelInstructionsExtraEl.classList.remove("hidden");
      } else {
        levelInstructionsExtraEl.innerHTML = "";
        levelInstructionsExtraEl.classList.add("hidden");
      }
    }
  }

  function showLevelInstructions() {
    populateLevelInstructions();
    levelInstructionsOverlay.classList.remove("hidden");
  }

  function hideLevelInstructions() {
    levelInstructionsOverlay.classList.add("hidden");
  }

  // Oculta las instrucciones, muestra "Mission Started! / Good Luck!"
  // y, una vez terminada esa secuencia, arranca el loop del juego.
  function beginMission() {
    hideLevelInstructions();
    Messages.showSequence(
      [Messages.CATALOG.missionStarted, Messages.CATALOG.goodLuck],
      {
        variant: "info",
        duration: 1100,
        gap: 150,
        onComplete: () => GameEngine.start(update),
      }
    );
  }

  function startMissionHandler() {
    beginMission();
  }

  startMissionBtn.addEventListener("click", startMissionHandler);
  startMissionTextBtn.addEventListener("click", startMissionHandler);

  // Quita del escenario al jugador y los objetos de la partida
  // anterior (usado por el botón "Try Again" antes de reconstruir
  // el tablero), sin tocar la etiqueta de la habitación.
  function clearBoard() {
    container.querySelectorAll(".player, .item").forEach((el) => el.remove());
  }

  // ---------- Inicialización del nivel ----------
  // Construye el tablero (jugador + objetos) pero NO arranca el loop
  // del juego todavía: eso ocurre en beginMission(), después de que
  // el jugador ve las instrucciones y presiona "Start Mission".
  function setup() {
    HUD.init({ objectsTotal: CORRECT_ITEMS.length });

    // Jugador centrado en el escenario.
    player = new Player(container, {
      character: currentCharacter,
      size: PLAYER_SIZE,
      speed: 300,
      x: (GameEngine.LOGICAL_WIDTH - PLAYER_SIZE) / 2,
      y: (GameEngine.LOGICAL_HEIGHT - PLAYER_SIZE) / 2,
    });

    // Preparamos la lista completa de objetos (correctos + incorrectos)
    // y les asignamos colores variados sin relación con su corrección,
    // para que el jugador deba reconocer el vocabulario, no el color.
    const allDefs = [
      ...CORRECT_ITEMS.map((name) => ({ name, correct: true })),
      ...INCORRECT_ITEMS.map((name) => ({ name, correct: false })),
    ];
    const colorClasses = shuffle([
      "item-color-1", "item-color-2", "item-color-3", "item-color-4",
      "item-color-5", "item-color-6", "item-color-7", "item-color-8",
      "item-color-9", "item-color-10", "item-color-11",
    ]);

    const placedRects = [player.getBounds()];
    items = allDefs.map((def, index) => {
      const pos = randomPosition(placedRects, ITEM_SIZE);
      const rect = { x: pos.x, y: pos.y, width: ITEM_SIZE, height: ITEM_SIZE };
      placedRects.push(rect);

      return new Item(container, {
        name: def.name,
        correct: def.correct,
        x: pos.x,
        y: pos.y,
        size: ITEM_SIZE,
        colorClass: colorClasses[index % colorClasses.length],
        icon: ICONS[def.name],
      });
    });
  }

  // ---------- Loop principal ----------
  function update(deltaSeconds) {
    player.update(deltaSeconds);
    checkCollisions();
  }

  function checkCollisions() {
    const playerBounds = player.getBounds();

    for (const item of items) {
      if (item.collected) continue;

      const overlap = GameEngine.rectsOverlap(playerBounds, item.getBounds());
      if (!overlap) continue;

      if (item.correct) {
        handleCorrectPickup(item);
      } else {
        handleIncorrectTouch(item);
      }
    }
  }

  function handleCorrectPickup(item) {
    item.markCollected();
    HUD.addScore(10);
    HUD.incrementObjectsCollected();
    AudioManager.playCorrect();
    AudioManager.speak(item.name);
    Messages.showBanner(Messages.CATALOG.correct, "success", 900);

    if (HUD.isLevelComplete()) {
      onLevelComplete();
    }
  }

  function handleIncorrectTouch(item) {
    const now = performance.now();
    const cooldownUntil = incorrectCooldowns.get(item) || 0;
    if (now < cooldownUntil) return; // evita repetir sonido mientras el jugador sigue encima

    incorrectCooldowns.set(item, now + 1000); // 1 segundo de margen antes de repetir
    AudioManager.playIncorrect();
    item.shake();
    showToast(`❌ "${item.name}" doesn't belong in the Living Room!`);
    Messages.showBanner(Messages.CATALOG.wrongObject, "error", 900);

    // Cada objeto incorrecto cuesta una vida. Al llegar a 0, termina
    // la partida (antes esto nunca se descontaba).
    const remainingLives = HUD.loseLife();
    if (remainingLives <= 0) {
      onGameOver();
    }
  }

  function onLevelComplete() {
    GameEngine.stop();
    const state = HUD.getState();
    Messages.showSequence(
      [Messages.CATALOG.greatJob, Messages.CATALOG.missionComplete],
      {
        variant: "success",
        duration: 1100,
        gap: 150,
        onComplete: () => {
          overlaySummaryEl.textContent =
            `You collected all 7 Living Room objects! Final score: ${state.score} points.`;
          overlayEl.classList.remove("hidden");
        },
      }
    );
  }

  // Detiene el juego, avisa con el banner y muestra el overlay de
  // Game Over con el botón para reintentar el mismo nivel.
  function onGameOver() {
    GameEngine.stop();
    Messages.showBanner(Messages.CATALOG.gameOver, "error", 1500);
    gameOverSummaryEl.textContent = Messages.CATALOG.gameOver;
    setTimeout(() => {
      gameOverOverlay.classList.remove("hidden");
    }, 700);
  }

  retryBtn.addEventListener("click", () => {
    gameOverOverlay.classList.add("hidden");
    clearBoard();
    setup();
    HUD.resetLevelProgress();
    beginMission();
  });

  nextLevelBtn.addEventListener("click", () => {
    alert("¡Nivel 2 — Organize the Living Room llegará pronto! 🚧");
  });

  // ---------- Arranque ----------
  // La precarga de imágenes empieza YA, en segundo plano, mientras el
  // jugador todavía está en la portada / pantalla de selección de
  // personaje — así, para cuando presione "Play", lo más probable es
  // que las imágenes ya estén en caché y el nivel arranque sin demora.
  const preloadPromise = preloadAllImages();

  // window.startLevel1 lo llama js/core/screens.js cuando el jugador
  // confirma las instrucciones generales. Prepara el tablero y muestra
  // las instrucciones propias del nivel; el juego en sí no arranca
  // hasta que el jugador presiona "Start Mission" (ver beginMission()).
  //
  // IMPORTANTE: está envuelto en try/catch/finally para que, si alguna
  // imagen falla en cargar o algo sale mal durante la preparación,
  // el juego arranque igual (en vez de quedarse "colgado" mostrando
  // "Loading..." para siempre). El error se imprime en la consola
  // (F12 → Console) para poder diagnosticarlo.
  window.startLevel1 = async function startLevel1(selectedCharacter) {
    currentCharacter = selectedCharacter === "boy" ? "boy" : "girl";
    try {
      await preloadPromise;
    } catch (err) {
      console.error("⚠️ Falló la precarga de imágenes, se inicia el juego de todos modos:", err);
    }
    Messages.init();
    InputManager.init();
    TouchControls.init();
    setup();
    showLevelInstructions();
  };
})();
