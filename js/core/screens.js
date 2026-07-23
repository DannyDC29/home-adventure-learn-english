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

  const generalInstructionsImg = document.getElementById("generalInstructionsImg");

  // Ambos personajes pueden seleccionarse; cada uno usa sus propios
  // sprites y su propia imagen de instrucciones generales.
  const selectableCards = document.querySelectorAll(".character-card:not(.disabled)");
  let selectedCharacter = "girl";

  function showScreen(screenToShow) {
    allScreens.forEach((screen) => screen.classList.add("hidden"));
    screenToShow.classList.remove("hidden");
  }

  // Cambia la imagen de instrucciones generales según el personaje
  // elegido: assets/instructions/instructions-girl.png o
  // instructions-boy.png.
  function updateGeneralInstructionsImage() {
    const fileName = selectedCharacter === "boy" ? "instructions-boy.png" : "instructions-girl.png";
    generalInstructionsImg.src = `assets/instructions/${fileName}`;
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
    updateGeneralInstructionsImage();
    showScreen(generalInstructionsScreen);
  });

  // Instrucciones generales -> Juego (arranca Nivel 1 y muestra sus
  // instrucciones propias antes de dejar jugar; ver js/levels/level1.js)
  // El botón "Got it!" es una imagen (sin texto), así que mientras
  // carga solo se deshabilita y se atenúa un poco en vez de cambiar
  // su texto.
  continueToLevelBtn.addEventListener("click", async () => {
    continueToLevelBtn.disabled = true;
    continueToLevelBtn.classList.add("is-loading");

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
      continueToLevelBtn.classList.remove("is-loading");
    }
  });
})();
