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
  const levelMapScreen = document.getElementById("levelMapScreen");
  const gameScreen = document.getElementById("gameScreen");

  const playBtn = document.getElementById("playBtn");
  const startGameBtn = document.getElementById("startGameBtn");
  const continueToLevelBtn = document.getElementById("continueToLevelBtn");
  // levelMapScreen y gameScreen también se incluyen aquí (aunque los
  // controla principalmente js/core/levelmap.js) para que showScreen()
  // los oculte correctamente al volver a la portada o a la selección
  // de personaje.
  const allScreens = [coverScreen, characterSelectScreen, generalInstructionsScreen, levelMapScreen, gameScreen];

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

  // Instrucciones generales -> Mapa de niveles (ya no entra directo al
  // Nivel 1.1: el jugador elige qué nivel jugar desde el mapita, ver
  // js/core/levelmap.js).
  continueToLevelBtn.addEventListener("click", () => {
    window.LevelMap.show(selectedCharacter);
  });
})();
