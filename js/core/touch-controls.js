/* ============================================
   TouchControls
   Conecta los botones del D-pad en pantalla (solo visibles en
   celular/tablet vía CSS) con el InputManager, para que funcionen
   exactamente igual que presionar las flechas o WASD.
   Usa Pointer Events para que sirva tanto con dedo (touch) como
   con mouse (útil también para probar en computador).
   ============================================ */

const TouchControls = (() => {
  function bindButton(button) {
    const direction = button.dataset.direction;
    if (!direction) return;

    const press = (e) => {
      e.preventDefault();
      InputManager.setPressed(direction, true);
      button.classList.add("active");
    };

    const release = (e) => {
      e.preventDefault();
      InputManager.setPressed(direction, false);
      button.classList.remove("active");
    };

    // pointerdown/up cubre touch y mouse con la misma lógica.
    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    // Si el dedo/mouse se sale del botón sin soltar, también liberamos,
    // para que el personaje no quede "caminando" para siempre.
    button.addEventListener("pointerleave", release);
    button.addEventListener("pointercancel", release);
  }

  function init() {
    const buttons = document.querySelectorAll(".touch-btn");
    buttons.forEach(bindButton);
  }

  return { init };
})();
