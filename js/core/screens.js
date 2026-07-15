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
  const generalInstructionsScreen = document.getElementById("generalInstructionsScreen");
  const gameScreen = document.getElementById("gameScreen");

  const playBtn = document.getElementById("playBtn");
  const startGameBtn = document.getElementById("startGameBtn");
  const continueToLevelBtn = document.getElementById("continueToLevelBtn");
  const allScreens = [coverScreen, characterSelectScreen, generalInstructionsScreen, gameScreen];

  // Por ahora solo la niña es jugable; el niño se muestra pero está
  // deshabilitado ("Coming soon") hasta que se creen sus sprites.
  const selectableCards = document.querySelectorAll(".character-card:not(.disabled)");
  let selectedCharacter = "girl";

  function showScreen(screenToShow) {
    allScreens.forEach((screen) => screen.classList.add("hidden"));
    screenToShow.classList.remove("hidden");
  }

  // Llena la lista de instrucciones generales una sola vez con los
  // datos de js/data/instructions.js (GAME_INSTRUCTIONS.general).
  function renderGeneralInstructions() {
    const list = document.getElementById("generalInstructionsList");
    if (!list || list.childElementCount > 0) return; // ya está llena
    GAME_INSTRUCTIONS.general.forEach(({ icon, text }) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="instructions-icon">${icon}</span><span>${text}</span>`;
      list.appendChild(li);
    });
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

  // Selección de personaje -> Instrucciones generales
  startGameBtn.addEventListener("click", () => {
    renderGeneralInstructions();
    showScreen(generalInstructionsScreen);
  });

  // Instrucciones generales -> Juego (arranca Nivel 1 y muestra sus
  // instrucciones propias antes de dejar jugar; ver js/levels/level1.js)
  continueToLevelBtn.addEventListener("click", async () => {
    continueToLevelBtn.disabled = true;
    continueToLevelBtn.textContent = "Loading...";

    try {
      await window.startLevel1(selectedCharacter);
      showScreen(gameScreen);
    } catch (err) {
      // Si algo falla, avisamos claramente en vez de quedar "colgados"
      // para siempre en Loading sin explicación.
      console.error("⚠️ No se pudo iniciar el juego:", err);
      alert("Hubo un problema al cargar el juego. Abre la consola (F12) para ver el detalle del error.");
    } finally {
      continueToLevelBtn.disabled = false;
      continueToLevelBtn.textContent = "Got it! ▶";
    }
  });
})();
