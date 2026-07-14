/* ============================================
   GameEngine
   Motor genérico reutilizable por todos los niveles:
   - Define un espacio de coordenadas lógico (independiente
     del tamaño real en píxeles de la pantalla), lo que hace
     que el juego sea responsive "gratis": todo se posiciona
     en porcentajes calculados a partir de este espacio.
   - Expone un loop basado en requestAnimationFrame con delta time.
   - Provee una función de detección de colisiones por rectángulos.
   ============================================ */

const GameEngine = (() => {
  // Espacio lógico de referencia: todas las posiciones y velocidades
  // de las entidades se calculan en este sistema de coordenadas,
  // luego se convierten a porcentaje para el CSS (responsive).
  const LOGICAL_WIDTH = 800;
  const LOGICAL_HEIGHT = 500;

  let loopCallback = null;
  let lastTimestamp = null;
  let rafId = null;
  let running = false;

  function toPercentX(logicalX) {
    return (logicalX / LOGICAL_WIDTH) * 100;
  }

  function toPercentY(logicalY) {
    return (logicalY / LOGICAL_HEIGHT) * 100;
  }

  /**
   * Detección de colisión simple entre dos rectángulos definidos en
   * el espacio lógico: { x, y, width, height }.
   */
  function rectsOverlap(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  function start(update) {
    loopCallback = update;
    running = true;
    lastTimestamp = null;
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  }

  function tick(timestamp) {
    if (!running) return;
    if (lastTimestamp === null) lastTimestamp = timestamp;
    const deltaSeconds = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (loopCallback) {
      loopCallback(deltaSeconds);
    }

    rafId = requestAnimationFrame(tick);
  }

  return {
    LOGICAL_WIDTH,
    LOGICAL_HEIGHT,
    toPercentX,
    toPercentY,
    rectsOverlap,
    start,
    stop,
  };
})();
