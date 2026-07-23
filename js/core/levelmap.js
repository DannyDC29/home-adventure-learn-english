/* ============================================
   Level Map
   Pantalla intermedia entre "Instrucciones generales" y el juego:
   muestra los niveles como un mapita con circulitos (estilo
   Candy Crush). El jugador elige qué nivel jugar; los niveles que
   todavía no existen aparecen bloqueados con candado.

   No conoce la lógica interna de cada nivel: solo llama a las
   funciones que cada archivo de nivel ya expone en window
   (window.startLevel1, window.startLevel1_2, window.startLevel1_3).

   Expone window.LevelMap con:
   - show(character): primera vez que se llega al mapita (desde
     js/core/screens.js, justo después de las instrucciones generales).
   - completeLevel(levelId): llamado por cada nivel cuando el jugador
     lo termina y presiona su botón "Next Level" — marca ese nivel
     como completado, desbloquea el siguiente y vuelve al mapita en
     vez de encadenar directo al siguiente nivel.
   - returnToMapFromLevel(): llamado por el botón "🗺️ Map" dentro
     del juego — vuelve al mapita sin marcar nada como completado.
   ============================================ */

(function initLevelMap() {
  const CHARACTER_IDLE = {
    girl: "assets/sprites/girl/Nina_Down_Idle.png",
    boy: "assets/sprites/boy/Nino_Down_Idle.png",
  };

  // Los 3 niveles de la Sala (Living Room) ya implementados, en orden.
  // "starter" llama a la función que cada archivo de nivel expone.
  const LEVELS = [
    { id: "1.1", label: "1.1", title: "Living Room Hunt", starter: (c) => window.startLevel1(c) },
    { id: "1.2", label: "1.2", title: "Living Room Quiz", starter: (c) => window.startLevel1_2(c) },
    { id: "1.3", label: "1.3", title: "Organize the Room", starter: (c) => window.startLevel1_3(c) },
  ];

  const screens = {
    cover: document.getElementById("coverScreen"),
    characterSelect: document.getElementById("characterSelectScreen"),
    generalInstructions: document.getElementById("generalInstructionsScreen"),
    map: document.getElementById("levelMapScreen"),
    game: document.getElementById("gameScreen"),
  };
  const allScreens = Object.values(screens);

  const mapPathEl = document.getElementById("levelMapPath");
  const mapCharacterImg = document.getElementById("levelMapCharacterImg");
  const mapHomeBtn = document.getElementById("mapHomeBtn");
  const backToMapBtn = document.getElementById("backToMapBtn");

  const gameWrapperEl = document.querySelector("#gameScreen .game-wrapper");
  const quizWrapperEl = document.getElementById("quizWrapper");
  const organizeWrapperEl = document.getElementById("organizeWrapper");

  // Overlays que podrían haber quedado abiertos si el jugador salió de
  // un nivel a mitad de partida usando el botón "🗺️ Map" del header.
  const overlaysToClear = [
    "levelInstructionsOverlay",
    "levelCompleteOverlay",
    "quizCompleteOverlay",
    "organizeCompleteOverlay",
    "gameOverOverlay",
  ].map((id) => document.getElementById(id));

  let currentCharacter = "girl";
  // Índice del nivel más alto ya desbloqueado (0 = solo el 1.1 disponible).
  let unlockedIndex = 0;
  const completedIds = new Set();

  function showScreen(screenToShow) {
    allScreens.forEach((screen) => screen.classList.add("hidden"));
    screenToShow.classList.remove("hidden");
  }

  function hideLeftoverOverlays() {
    overlaysToClear.forEach((el) => el && el.classList.add("hidden"));
  }

  // Deja visible solo el "wrapper" del sub-nivel que se va a jugar, sin
  // importar en qué otro sub-nivel haya quedado el jugador antes (esto
  // es lo que permite, por ejemplo, volver a jugar el 1.1 después de
  // haber llegado ya al 1.2 o al 1.3).
  function showOnlyWrapper(wrapperEl) {
    [gameWrapperEl, quizWrapperEl, organizeWrapperEl].forEach((el) => {
      if (!el) return;
      if (el === wrapperEl) el.classList.remove("hidden");
      else el.classList.add("hidden");
    });
  }

  function wrapperForLevel(levelId) {
    if (levelId === "1.2") return quizWrapperEl;
    if (levelId === "1.3") return organizeWrapperEl;
    return gameWrapperEl;
  }

  function buildNode(label, { locked, completed, current }) {
    const wrap = document.createElement("div");
    wrap.className = "level-node-wrap";

    const node = document.createElement("button");
    node.type = "button";
    node.className = "level-node";
    if (locked) node.classList.add("locked");
    if (completed) node.classList.add("completed");
    if (current) node.classList.add("current");
    node.disabled = locked;
    node.textContent = locked ? "🔒" : completed ? "✓" : label;

    const labelEl = document.createElement("span");
    labelEl.className = "level-node-label";
    labelEl.textContent = label;

    wrap.appendChild(node);
    wrap.appendChild(labelEl);
    return { wrap, node };
  }

  function addConnector() {
    const connector = document.createElement("div");
    connector.className = "level-connector";
    mapPathEl.appendChild(connector);
  }

  function renderMap() {
    mapCharacterImg.src = CHARACTER_IDLE[currentCharacter] || CHARACTER_IDLE.girl;
    mapPathEl.innerHTML = "";

    LEVELS.forEach((level, index) => {
      if (index > 0) addConnector();

      const locked = index > unlockedIndex;
      const completed = completedIds.has(level.id);
      const current = index === unlockedIndex && !completed;

      const { wrap, node } = buildNode(level.label, { locked, completed, current });
      node.setAttribute("aria-label", `${level.title} (${level.label})`);
      if (!locked) {
        node.addEventListener("click", () => enterLevel(level));
      }
      mapPathEl.appendChild(wrap);
    });

    // Nodo informativo: la próxima sala (Kitchen, etc.) todavía no
    // está implementada. Se irán agregando más niveles reales aquí
    // más adelante; por ahora solo mostramos que viene algo más.
    addConnector();
    const { wrap: comingWrap } = buildNode("Room 2", { locked: true, completed: false, current: false });
    mapPathEl.appendChild(comingWrap);
  }

  function enterLevel(level) {
    hideLeftoverOverlays();
    showOnlyWrapper(wrapperForLevel(level.id));
    showScreen(screens.game);
    Promise.resolve(level.starter(currentCharacter)).catch((err) => {
      console.error(`⚠️ No se pudo iniciar el nivel ${level.id}:`, err);
      alert("Hubo un problema al cargar el nivel. Abre la consola (F12) para ver el detalle del error.");
    });
  }

  // Llamado por js/core/screens.js la primera vez que el jugador llega
  // al mapita (justo después de las instrucciones generales).
  function show(character) {
    if (character) currentCharacter = character === "boy" ? "boy" : "girl";
    renderMap();
    showScreen(screens.map);
  }

  // Llamado por cada nivel cuando el jugador lo termina y presiona su
  // botón "Next Level": marca el nivel como completado, desbloquea el
  // siguiente y vuelve al mapita en vez de encadenar directo al
  // siguiente nivel.
  function completeLevel(levelId) {
    completedIds.add(levelId);
    const index = LEVELS.findIndex((l) => l.id === levelId);
    if (index !== -1 && index + 1 > unlockedIndex) {
      unlockedIndex = Math.min(index + 1, LEVELS.length - 1);
    }
    renderMap();
    showScreen(screens.map);
  }

  // Llamado por el botón "🗺️ Map" dentro del juego: vuelve al mapita
  // sin marcar nada como completado (el jugador solo decidió salir a
  // mitad de partida).
  function returnToMapFromLevel() {
    if (typeof GameEngine !== "undefined") GameEngine.stop();
    hideLeftoverOverlays();
    renderMap();
    showScreen(screens.map);
  }

  // Botón "🏠 Home" del mapita: vuelve a la portada para que el jugador
  // pueda darle Play de nuevo y elegir otro personaje si quiere.
  mapHomeBtn.addEventListener("click", () => {
    showScreen(screens.cover);
  });

  backToMapBtn.addEventListener("click", () => {
    returnToMapFromLevel();
  });

  window.LevelMap = { show, completeLevel, returnToMapFromLevel };
})();
