/* ============================================
   Messages
   Catálogo centralizado de los mensajes que el juego muestra
   cada vez que ocurre una acción (empezar misión, acierto,
   error, nivel completado, game over, etc.) + la lógica para
   mostrarlos como un banner flotante en pantalla.

   Se reutiliza en todos los niveles: cada nivel solo llama a
   Messages.showBanner(...) o Messages.showSequence(...) con el
   texto del catálogo (Messages.CATALOG.xxx) en el momento correcto.
   ============================================ */

const Messages = (() => {
  // Textos exactos pedidos para el juego. Los niveles se apoyan en
  // estas claves en vez de escribir el texto suelto, así el mensaje
  // es consistente sin importar desde qué nivel se dispare.
  const CATALOG = {
    missionStarted: "Mission Started!",
    goodLuck: "Good Luck!",
    correct: "Correct! +10 Points",
    wrongAnswer: "Wrong Answer!",
    wrongObject: "Wrong Object!",
    greatJob: "Great Job!",
    missionComplete: "Mission Complete!",
    roomComplete: "Room Complete!",
    wellDone: "Well Done!",
    gameOver: "Game Over – Try Again",
    congrats: "Congratulations! You Built the Perfect House!",
  };

  let bannerEl = null;
  let hideTimeoutId = null;

  function init() {
    bannerEl = document.getElementById("messageBanner");
  }

  /**
   * Muestra un mensaje flotante.
   * @param {string} text
   * @param {"info"|"success"|"error"} variant
   * @param {number} duration - ms visible en pantalla.
   */
  function showBanner(text, variant = "info", duration = 1300) {
    if (!bannerEl) return;

    bannerEl.textContent = text;
    bannerEl.className = `message-banner variant-${variant}`;
    // Forzamos reflow para poder re-disparar la animación aunque se
    // muestre el mismo texto/variante dos veces seguidas.
    void bannerEl.offsetWidth;
    bannerEl.classList.add("show");

    if (hideTimeoutId) clearTimeout(hideTimeoutId);
    hideTimeoutId = setTimeout(() => {
      bannerEl.classList.remove("show");
    }, duration);
  }

  /**
   * Muestra varios mensajes en fila (ej. "Mission Started!" -> "Good Luck!").
   * @param {string[]} list
   * @param {object} options - { variant, duration, gap, onComplete }
   */
  function showSequence(list, options = {}) {
    const variant = options.variant ?? "info";
    const duration = options.duration ?? 1200;
    const gap = options.gap ?? 200;
    const step = duration + gap;

    list.forEach((text, index) => {
      setTimeout(() => showBanner(text, variant, duration), index * step);
    });

    if (options.onComplete) {
      setTimeout(options.onComplete, list.length * step);
    }
  }

  return {
    CATALOG,
    init,
    showBanner,
    showSequence,
  };
})();
