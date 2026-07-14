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

  const container = document.getElementById("gameContainer");
  const toastEl = document.getElementById("toast");
  const overlayEl = document.getElementById("levelCompleteOverlay");
  const overlaySummaryEl = document.getElementById("overlaySummary");
  const nextLevelBtn = document.getElementById("nextLevelBtn");

  let player = null;
  let items = [];
  let toastTimeoutId = null;
  const incorrectCooldowns = new WeakMap(); // evita spam de sonido/toast por overlap continuo

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

  // ---------- Inicialización del nivel ----------
  function setup() {
    HUD.init({ objectsTotal: CORRECT_ITEMS.length });

    // Jugador centrado en el escenario.
    player = new Player(container, {
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

    GameEngine.start(update);
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
  }

  function onLevelComplete() {
    GameEngine.stop();
    const state = HUD.getState();
    overlaySummaryEl.textContent =
      `You collected all 7 Living Room objects! Final score: ${state.score} points.`;
    overlayEl.classList.remove("hidden");
  }

  nextLevelBtn.addEventListener("click", () => {
    alert("¡Nivel 2 — Organize the Living Room llegará pronto! 🚧");
  });

  // ---------- Arranque ----------
  InputManager.init();
  setup();
})();
