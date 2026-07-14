/* ============================================
   HUD
   Controla y refleja en pantalla: puntaje, monedas, vidas,
   estrellas y contador de objetos recolectados.
   Se reutiliza en todos los niveles del juego.
   ============================================ */

const HUD = (() => {
  const els = {
    score: null,
    coins: null,
    lives: null,
    stars: null,
    objects: null,
  };

  const state = {
    score: 0,
    coins: 0,
    lives: 3,
    maxLives: 3,
    stars: 0,
    objectsCollected: 0,
    objectsTotal: 0,
  };

  function init({ objectsTotal }) {
    els.score = document.getElementById("scoreValue");
    els.coins = document.getElementById("coinsValue");
    els.lives = document.getElementById("livesValue");
    els.stars = document.getElementById("starsValue");
    els.objects = document.getElementById("objectsValue");

    state.objectsTotal = objectsTotal;
    render();
  }

  function addScore(points) {
    state.score += points;
    render();
  }

  function addCoins(amount) {
    state.coins += amount;
    render();
  }

  function loseLife() {
    state.lives = Math.max(0, state.lives - 1);
    render();
    return state.lives;
  }

  function resetLives() {
    state.lives = state.maxLives;
    render();
  }

  function addStars(amount) {
    state.stars += amount;
    render();
  }

  function incrementObjectsCollected() {
    state.objectsCollected += 1;
    render();
    return state.objectsCollected;
  }

  function isLevelComplete() {
    return state.objectsCollected >= state.objectsTotal;
  }

  function render() {
    if (els.score) els.score.textContent = state.score;
    if (els.coins) els.coins.textContent = state.coins;
    if (els.lives) els.lives.textContent = "❤️".repeat(state.lives) + "🖤".repeat(state.maxLives - state.lives);
    if (els.stars) els.stars.textContent = state.stars;
    if (els.objects) els.objects.textContent = `${state.objectsCollected}/${state.objectsTotal}`;
  }

  function getState() {
    return { ...state };
  }

  return {
    init,
    addScore,
    addCoins,
    loseLife,
    resetLives,
    addStars,
    incrementObjectsCollected,
    isLevelComplete,
    getState,
  };
})();
