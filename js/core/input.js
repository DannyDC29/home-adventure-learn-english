/* ============================================
   InputManager
   Traduce teclas físicas (flechas y WASD) a acciones lógicas
   (up, down, left, right) para que el resto del código no
   dependa de qué tecla exacta presionó el jugador.
   ============================================ */

const InputManager = (() => {
  const keyMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    KeyW: "up",
    KeyS: "down",
    KeyA: "left",
    KeyD: "right",
    // Soporte adicional por si el layout de teclado no usa "code" en inglés
    w: "up",
    s: "down",
    a: "left",
    d: "right",
  };

  const state = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  function handleKeyDown(e) {
    const action = keyMap[e.code] || keyMap[e.key];
    if (action) {
      state[action] = true;
      e.preventDefault();
    }
  }

  function handleKeyUp(e) {
    const action = keyMap[e.code] || keyMap[e.key];
    if (action) {
      state[action] = false;
      e.preventDefault();
    }
  }

  function init() {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
  }

  function isPressed(action) {
    return !!state[action];
  }

  function isMoving() {
    return state.up || state.down || state.left || state.right;
  }

  return {
    init,
    isPressed,
    isMoving,
  };
})();
