/* ============================================
   Nivel 1.3 — Organize the Living Room
   Tablero con la imagen "fantasma" (objetos semi-transparentes) fija
   como fondo. El jugador arrastra cada objeto de la bandeja hasta su
   silueta correspondiente. Al acertar, el objeto se ancla en su lugar
   con un ✅ (no hace falta cambiar el fondo en cada arrastre). Al
   completar los 7, se revela la imagen final (todos los objetos ya
   puestos) como celebración.

   Funciona con mouse Y con dedo (Pointer Events), para que sea
   jugable también en tablet/celular.
   ============================================ */

(function initLevel1_3() {
  const LEVEL_KEY = "1.3";
  const ITEM_ICON_BASE = "assets/sprites/items/";
  const CHARACTER_IDLE = {
    girl: "assets/sprites/girl/Nina_Down_Idle.png",
    boy: "assets/sprites/boy/Nino_Down_Idle.png",
  };

  const BOARD_GHOST_IMAGE = "assets/backgrounds/living-room-organize-ghost.jpg";
  const BOARD_COMPLETE_IMAGE = "assets/backgrounds/living-room-organize-complete.jpg";

  // Zonas de destino: coordenadas medidas directamente sobre la imagen
  // de fondo (1319x720), expresadas en % para que escalen con el
  // tamaño real del tablero en pantalla. Cada una corresponde a la
  // silueta semi-transparente de un objeto en living-room-organize-ghost.jpg.
  const ZONES = [
    { id: "clock", icon: "Clock.png", label: "Clock", left: 30.9, top: 8.6, width: 10.0, height: 23.2 },
    { id: "tv", icon: "TV.png", label: "TV", left: 44.0, top: 29.2, width: 12.1, height: 26.2 },
    { id: "sofa", icon: "Sofa.png", label: "Sofa", left: 55.3, top: 34.7, width: 21.2, height: 24.9 },
    { id: "coffee_table", icon: "Coffee_Table.png", label: "Coffee Table", left: 57.6, top: 62.5, width: 12.6, height: 15.1 },
    { id: "armchair", icon: "Armchair.png", label: "Armchair", left: 70.9, top: 57.6, width: 13.4, height: 27.2 },
    { id: "carpet", icon: "Carpet.png", label: "Carpet", left: 33.4, top: 55.6, width: 36.3, height: 36.0 },
    // Zona de la lámpara ajustada al recuadro verde exacto que Daniela
    // marcó sobre el tablero (medido en píxeles sobre su captura:
    // x 17–139, y 316–608 de una imagen de 1317x715 ≈ el tablero
    // completo). Ajusta estos 4 números si hace falta mover/rotar
    // el recuadro un poco más.
    { id: "lamp", icon: "Lamp.png", label: "Lamp", left: 1.3, top: 44.2, width: 9.3, height: 40.8, iconScale: 0.9 },
  ];
  // Mapa por id para consultar rápido los datos de una zona (ej. su
  // iconScale) a partir del elemento .organize-zone soltado.
  const ZONES_BY_ID = Object.fromEntries(ZONES.map((zone) => [zone.id, zone]));
  // Orden de prioridad al detectar sobre qué zona se soltó un objeto:
  // las zonas más pequeñas (ej. coffee_table, que está DENTRO del área
  // de carpet) se revisan antes que las más grandes, para que no gane
  // siempre la zona más grande cuando se superponen.
  const ZONES_BY_PRIORITY = [...ZONES].sort((a, b) => a.width * a.height - b.width * b.height);

  const levelTitleEl = document.getElementById("levelTitle");
  const gameWrapperEl = document.querySelector("#gameScreen .game-wrapper");
  const quizWrapperEl = document.getElementById("quizWrapper");

  const organizeWrapper = document.getElementById("organizeWrapper");
  const organizeBoard = document.getElementById("organizeBoard");
  const organizeTray = document.getElementById("organizeTray");

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

  const organizeCompleteOverlay = document.getElementById("organizeCompleteOverlay");
  const organizeCompleteSummaryEl = document.getElementById("organizeCompleteSummary");
  const organizeNextLevelBtn = document.getElementById("organizeNextLevelBtn");
  const organizeFinalCharacterImg = document.getElementById("organizeFinalCharacter");

  const gameOverOverlay = document.getElementById("gameOverOverlay");
  const retryBtn = document.getElementById("retryBtn");

  let currentCharacter = "girl";
  let solvedCount = 0;
  let dragState = null; // info del arrastre en curso (o null si no hay ninguno)
  let isGameOver = false; // true mientras se muestra el overlay de Game Over: bloquea nuevos arrastres

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // ---------- Construcción del tablero ----------
  function setupBoard() {
    organizeBoard.style.backgroundImage = `url("${BOARD_GHOST_IMAGE}")`;
    // Solo quitamos las zonas viejas (elementos .organize-zone); el
    // personaje final y demás elementos estáticos del tablero se quedan.
    organizeBoard.querySelectorAll(".organize-zone").forEach((el) => el.remove());
    organizeFinalCharacterImg.classList.add("hidden");
    solvedCount = 0;
    isGameOver = false;

    ZONES.forEach((zone) => {
      const zoneEl = document.createElement("div");
      zoneEl.className = "organize-zone";
      zoneEl.dataset.zone = zone.id;
      zoneEl.style.left = `${zone.left}%`;
      zoneEl.style.top = `${zone.top}%`;
      zoneEl.style.width = `${zone.width}%`;
      zoneEl.style.height = `${zone.height}%`;
      organizeBoard.appendChild(zoneEl);
    });
  }

  function setupTray() {
    organizeTray.innerHTML = "";
    const shuffledZones = shuffle(ZONES);
    shuffledZones.forEach((zone) => {
      const item = document.createElement("img");
      item.className = "organize-item";
      item.src = ITEM_ICON_BASE + zone.icon;
      item.alt = zone.label;
      item.draggable = false;
      item.dataset.item = zone.id;
      item.addEventListener("pointerdown", onPointerDown);
      organizeTray.appendChild(item);
    });
  }

  // ---------- Arrastrar y soltar (Pointer Events: mouse + dedo) ----------
  function onPointerDown(event) {
    if (isGameOver) return; // el juego está en pausa mostrando Game Over
    const itemEl = event.currentTarget;
    if (itemEl.classList.contains("placed")) return; // ya resuelto, no se mueve más

    event.preventDefault();
    const rect = itemEl.getBoundingClientRect();

    dragState = {
      itemEl,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      startLeft: rect.left,
      startTop: rect.top,
      width: rect.width,
      height: rect.height,
    };

    itemEl.classList.add("dragging");
    itemEl.style.width = `${rect.width}px`;
    itemEl.style.height = `${rect.height}px`;
    itemEl.style.left = `${rect.left}px`;
    itemEl.style.top = `${rect.top}px`;

    itemEl.setPointerCapture(event.pointerId);
    itemEl.addEventListener("pointermove", onPointerMove);
    itemEl.addEventListener("pointerup", onPointerUp);
    itemEl.addEventListener("pointercancel", onPointerUp);
  }

  function onPointerMove(event) {
    if (!dragState) return;
    event.preventDefault();
    dragState.itemEl.style.left = `${event.clientX - dragState.offsetX}px`;
    dragState.itemEl.style.top = `${event.clientY - dragState.offsetY}px`;
  }

  function onPointerUp(event) {
    if (!dragState) return;
    const { itemEl } = dragState;

    itemEl.releasePointerCapture(event.pointerId);
    itemEl.removeEventListener("pointermove", onPointerMove);
    itemEl.removeEventListener("pointerup", onPointerUp);
    itemEl.removeEventListener("pointercancel", onPointerUp);
    itemEl.classList.remove("dragging");

    const dropZone = findZoneUnderPoint(event.clientX, event.clientY);
    const targetId = itemEl.dataset.item;

    if (dropZone && dropZone.dataset.zone === targetId) {
      snapItemIntoZone(itemEl, dropZone);
    } else {
      if (dropZone) {
        // Soltó sobre una zona, pero la que no es -> feedback de error
        // y cuesta una vida (compartida con el resto del juego).
        AudioManager.playIncorrect();
        Messages.showBanner(Messages.CATALOG.wrongObject, "error", 1000);
        returnItemToTray(itemEl);

        const remainingLives = HUD.loseLife();
        if (remainingLives <= 0) {
          dragState = null;
          onGameOver();
          return;
        }
      } else {
        returnItemToTray(itemEl);
      }
    }

    dragState = null;
  }

  // Detecta qué zona hay bajo el punto soltado, dando prioridad a las
  // zonas más pequeñas cuando hay superposición (ver ZONES_BY_PRIORITY).
  function findZoneUnderPoint(clientX, clientY) {
    const boardRect = organizeBoard.getBoundingClientRect();
    if (
      clientX < boardRect.left || clientX > boardRect.right ||
      clientY < boardRect.top || clientY > boardRect.bottom
    ) {
      return null;
    }

    const relX = ((clientX - boardRect.left) / boardRect.width) * 100;
    const relY = ((clientY - boardRect.top) / boardRect.height) * 100;

    for (const zone of ZONES_BY_PRIORITY) {
      const withinX = relX >= zone.left && relX <= zone.left + zone.width;
      const withinY = relY >= zone.top && relY <= zone.top + zone.height;
      if (withinX && withinY) {
        return organizeBoard.querySelector(`.organize-zone[data-zone="${zone.id}"]`);
      }
    }
    return null;
  }

  function snapItemIntoZone(itemEl, zoneEl) {
    AudioManager.playCorrect();
    AudioManager.speak(itemEl.alt);
    Messages.showBanner(Messages.CATALOG.correct, "success", 1000);

    // Tamaño del ícono dentro de su zona: 70% por defecto, salvo que la
    // zona tenga su propio iconScale (ver ZONES, ej. la lámpara).
    const zoneData = ZONES_BY_ID[zoneEl.dataset.zone];
    const scalePercent = (zoneData && zoneData.iconScale ? zoneData.iconScale : 0.7) * 100;

    // Quitamos el posicionamiento "libre" y lo anclamos dentro de la zona.
    itemEl.classList.add("placed");
    itemEl.style.position = "absolute";
    itemEl.style.left = "50%";
    itemEl.style.top = "50%";
    itemEl.style.transform = "translate(-50%, -50%)";
    itemEl.style.width = `${scalePercent}%`;
    itemEl.style.height = `${scalePercent}%`;
    zoneEl.appendChild(itemEl);
    // Solo queda el borde verde de la zona resuelta (.organize-zone.solved
    // en el CSS) — ya no se agrega el chulito ✅ encima.
    zoneEl.classList.add("solved");

    solvedCount += 1;
    if (solvedCount >= ZONES.length) {
      setTimeout(onOrganizeComplete, 500);
    }
  }

  function returnItemToTray(itemEl) {
    itemEl.style.position = "";
    itemEl.style.left = "";
    itemEl.style.top = "";
    itemEl.style.width = "";
    itemEl.style.height = "";
    organizeTray.appendChild(itemEl);
  }

  // ---------- Finalización del nivel ----------
  function onOrganizeComplete() {
    // Revelamos la imagen final (todos los objetos ya puestos) en vez
    // de los íconos arrastrados + fondo fantasma.
    organizeBoard.style.backgroundImage = `url("${BOARD_COMPLETE_IMAGE}")`;
    organizeBoard.querySelectorAll(".organize-zone").forEach((z) => (z.style.visibility = "hidden"));

    // El personaje que el jugador eligió aparece de pie en medio de la
    // sala como celebración (posicionado en CSS un poco más abajo del
    // centro para no tapar el TV).
    organizeFinalCharacterImg.src = CHARACTER_IDLE[currentCharacter];
    organizeFinalCharacterImg.classList.remove("hidden");

    Messages.showSequence(
      [Messages.CATALOG.greatJob, Messages.CATALOG.roomComplete],
      {
        variant: "success",
        duration: 1200,
        gap: 200,
        onComplete: () => {
          organizeCompleteOverlay.classList.remove("hidden");
        },
      }
    );
  }

  // Detiene el nivel y muestra el overlay de Game Over compartido. El
  // botón "Try Again" queda apuntando a retryHandler1_3 (reinicia ESTE
  // nivel desde cero: tablero y bandeja vacíos), no al Nivel 1.1.
  function onGameOver() {
    isGameOver = true;
    Messages.showBanner(Messages.CATALOG.gameOver, "error", 1500);
    setTimeout(() => {
      gameOverOverlay.classList.remove("hidden");
    }, 700);
  }

  function retryHandler1_3() {
    gameOverOverlay.classList.add("hidden");
    HUD.resetLives();
    setupBoard();
    setupTray();
  }

  organizeNextLevelBtn.addEventListener("click", () => {
    organizeCompleteOverlay.classList.add("hidden");
    // Todavía no existe el Room 2 (Kitchen): volvemos al mapita, donde
    // se ve bloqueado, y el jugador puede repetir cualquiera de los
    // niveles de la Living Room mientras tanto.
    window.LevelMap.completeLevel("1.3");
  });

  // ---------- Instrucciones del nivel (mismo overlay genérico) ----------
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
        onComplete: () => {
          setupBoard();
          setupTray();
        },
      }
    );
  }

  // ---------- Punto de entrada ----------
  // Llamado por js/levels/level1-2.js cuando el jugador termina el
  // Quiz (1.2) y presiona "Next Level".
  window.startLevel1_3 = async function startLevel1_3(character) {
    currentCharacter = character === "boy" ? "boy" : "girl";

    // Vidas completas al (re)entrar a este nivel desde el mapita, para
    // que rejugarlo sea siempre una partida justa desde cero.
    HUD.resetLives();

    if (gameWrapperEl) gameWrapperEl.classList.add("hidden");
    if (quizWrapperEl) quizWrapperEl.classList.add("hidden");
    organizeWrapper.classList.remove("hidden");

    levelTitleEl.textContent = "Level 1.3 — Organize the Living Room";

    startMissionBtn.onclick = beginMission;
    startMissionTextBtn.onclick = beginMission;

    // Igual con "Try Again": si el jugador muere en este nivel, debe
    // reiniciar este nivel (no volver al Nivel 1.1 ni al Quiz).
    retryBtn.onclick = retryHandler1_3;

    showLevelInstructions();
  };
})();
