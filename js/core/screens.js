/* ============================================
   Screens
   Maneja el flujo: Portada -> Selección de personaje -> Juego.
   No conoce nada de la lógica del nivel; solo muestra/oculta
   pantallas y llama a window.startLevel1() (expuesto por
   js/levels/level1.js) cuando el jugador confirma su elección.
   ============================================ */

(function initScreens() {
  const coverScreen = document.getElementById("coverScreen");
  const characterSelectScreen = document.getElementById("characterSelectScreen");
  const gameScreen = document.getElementById("gameScreen");

  const playBtn = document.getElementById("playBtn");
  const startGameBtn = document.getElementById("startGameBtn");
  const allScreens = [coverScreen, characterSelectScreen, gameScreen];

  // Por ahora solo la niña es jugable; el niño se muestra pero está
  // deshabilitado ("Coming soon") hasta que se creen sus sprites.
  const selectableCards = document.querySelectorAll(".character-card:not(.disabled)");
  let selectedCharacter = "girl";

  function showScreen(screenToShow) {
    allScreens.forEach((screen) => screen.classList.add("hidden"));
    screenToShow.classList.remove("hidden");
  }

  // Portada -> Selección de personaje
  playBtn.addEventListener("click", () => {
    showScreen(characterSelectScreen);
  });

  // Elegir un personaje (solo tarjetas habilitadas responden al click)
  selectableCards.forEach((card) => {
    card.addEventListener("click", () => {
      selectableCards.forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedCharacter = card.dataset.character;
    });
  });

  // Selección de personaje -> Juego (Nivel 1)
  startGameBtn.addEventListener("click", async () => {
    startGameBtn.disabled = true;
    startGameBtn.textContent = "Loading...";

    await window.startLevel1(selectedCharacter);

    startGameBtn.disabled = false;
    startGameBtn.textContent = "▶ Play";
    showScreen(gameScreen);
  });
})();
