/* ============================================
   AudioManager
   - Efectos de sonido generados con Web Audio API (sin archivos externos).
   - Pronunciación de vocabulario con la Web Speech API (SpeechSynthesis).
   ============================================ */

const AudioManager = (() => {
  let audioCtx = null;

  // El AudioContext debe crearse tras una interacción del usuario
  // (requisito de los navegadores modernos), así que se inicializa
  // de forma perezosa en el primer sonido solicitado.
  function getContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  /**
   * Reproduce un tono simple.
   * @param {number} frequency - Frecuencia en Hz.
   * @param {number} duration - Duración en segundos.
   * @param {string} type - Tipo de onda ("sine", "square", "triangle").
   * @param {number} startTime - Delay en segundos antes de iniciar.
   */
  function playTone(frequency, duration, type = "sine", startTime = 0) {
    const ctx = getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    const now = ctx.currentTime + startTime;
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  // Sonido de acierto: arpegio ascendente y alegre.
  function playCorrect() {
    playTone(523.25, 0.12, "triangle", 0);      // C5
    playTone(659.25, 0.12, "triangle", 0.1);     // E5
    playTone(783.99, 0.18, "triangle", 0.2);     // G5
  }

  // Sonido de error: tono corto y grave tipo "buzz".
  function playIncorrect() {
    playTone(180, 0.18, "square", 0);
    playTone(140, 0.2, "square", 0.12);
  }

  // Sonido de victoria de nivel: pequeña fanfarria.
  function playLevelComplete() {
    playTone(523.25, 0.15, "triangle", 0);
    playTone(659.25, 0.15, "triangle", 0.15);
    playTone(783.99, 0.15, "triangle", 0.3);
    playTone(1046.5, 0.3, "triangle", 0.45);
  }

  /**
   * Pronuncia una palabra o frase en inglés usando la síntesis de voz
   * del navegador.
   * @param {string} text - Texto a pronunciar (en inglés).
   */
  function speak(text) {
    if (!("speechSynthesis" in window)) {
      console.warn("SpeechSynthesis no está disponible en este navegador.");
      return;
    }
    // Cancelamos cualquier pronunciación en curso para evitar solapes.
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }

  return {
    playCorrect,
    playIncorrect,
    playLevelComplete,
    speak,
  };
})();
