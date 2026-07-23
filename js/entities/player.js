/* ============================================
   Player
   Representa al personaje controlado por el estudiante.
   Se mueve dentro del espacio lógico del GameEngine y se
   renderiza como un sprite (imagen PNG) que cambia según la
   dirección hacia la que camina y el fotograma de animación.

   Las 8 direcciones (down, up, left, right + las 4 diagonales)
   tienen su propio set de sprites: 1 frame idle (las diagonales
   reutilizan el idle de left/right) + 2 frames de caminata.
   ============================================ */

const SPRITE_FRAMES = {
  girl: {
    down: {
      idle: "assets/sprites/girl/Nina_Down_Idle.png",
      walk: ["assets/sprites/girl/Nina_Down_Walk_01.png", "assets/sprites/girl/Nina_Down_Walk_02.png"],
    },
    up: {
      idle: "assets/sprites/girl/Nina_Up_Idle.png",
      walk: ["assets/sprites/girl/Nina_Up_Walk_01.png", "assets/sprites/girl/Nina_Up_Walk_02.png"],
    },
    left: {
      idle: "assets/sprites/girl/Nina_Left_Idle.png",
      walk: ["assets/sprites/girl/Nina_Left_Walk_01.png", "assets/sprites/girl/Nina_Left_Walk_02.png"],
    },
    right: {
      idle: "assets/sprites/girl/Nina_Right_Idle.png",
      walk: ["assets/sprites/girl/Nina_Right_Walk_01.png", "assets/sprites/girl/Nina_Right_Walk_02.png"],
    },
    upLeft: {
      idle: "assets/sprites/girl/Nina_Left_Idle.png",
      walk: ["assets/sprites/girl/Nina_UpLeft_Walk_01.png", "assets/sprites/girl/Nina_UpLeft_Walk_02.png"],
    },
    upRight: {
      idle: "assets/sprites/girl/Nina_Right_Idle.png",
      walk: ["assets/sprites/girl/Nina_UpRight_Walk_01.png", "assets/sprites/girl/Nina_UpRight_Walk_02.png"],
    },
    downLeft: {
      idle: "assets/sprites/girl/Nina_Left_Idle.png",
      walk: ["assets/sprites/girl/Nina_DownLeft_Walk_01.png", "assets/sprites/girl/Nina_DownLeft_Walk_02.png"],
    },
    downRight: {
      idle: "assets/sprites/girl/Nina_Right_Idle.png",
      walk: ["assets/sprites/girl/Nina_DownRight_Walk_01.png", "assets/sprites/girl/Nina_DownRight_Walk_02.png"],
    },
  },
  boy: {
    down: {
      idle: "assets/sprites/boy/Nino_Down_Idle.png",
      walk: ["assets/sprites/boy/Nino_Down_Walk_01.png", "assets/sprites/boy/Nino_Down_Walk_02.png"],
    },
    up: {
      idle: "assets/sprites/boy/Nino_Up_Idle.png",
      walk: ["assets/sprites/boy/Nino_Up_Walk_01.png", "assets/sprites/boy/Nino_Up_Walk_02.png"],
    },
    left: {
      idle: "assets/sprites/boy/Nino_Left_Idle.png",
      walk: ["assets/sprites/boy/Nino_Left_Walk_01.png", "assets/sprites/boy/Nino_Left_Walk_02.png"],
    },
    right: {
      idle: "assets/sprites/boy/Nino_Right_Idle.png",
      walk: ["assets/sprites/boy/Nino_Right_Walk_01.png", "assets/sprites/boy/Nino_Right_Walk_02.png"],
    },
    // Fallback temporal: mientras llegan los diagonales, reutiliza el frame recto más cercano.
    upLeft: {
      idle: "assets/sprites/boy/Nino_Left_Idle.png",
      walk: ["assets/sprites/boy/Nino_Left_Walk_01.png", "assets/sprites/boy/Nino_Left_Walk_02.png"],
    },
    upRight: {
      idle: "assets/sprites/boy/Nino_Right_Idle.png",
      walk: ["assets/sprites/boy/Nino_Right_Walk_01.png", "assets/sprites/boy/Nino_Right_Walk_02.png"],
    },
    downLeft: {
      idle: "assets/sprites/boy/Nino_Left_Idle.png",
      walk: ["assets/sprites/boy/Nino_Left_Walk_01.png", "assets/sprites/boy/Nino_Left_Walk_02.png"],
    },
    downRight: {
      idle: "assets/sprites/boy/Nino_Right_Idle.png",
      walk: ["assets/sprites/boy/Nino_Right_Walk_01.png", "assets/sprites/boy/Nino_Right_Walk_02.png"],
    },
  },
};

const WALK_FRAME_DURATION = 0.15; // segundos que dura cada fotograma de caminata

class Player {
  /**
   * @param {HTMLElement} container - Elemento donde se inserta el jugador.
   * @param {object} options - { x, y, size, speed }
   */
  constructor(container, options = {}) {
    this.container = container;
    this.character = options.character ?? "girl";
    this.spriteFrames = SPRITE_FRAMES[this.character] ?? SPRITE_FRAMES.girl;
    this.size = options.size ?? 60;
    this.speed = options.speed ?? 300; // unidades lógicas por segundo
    this.x = options.x ?? (GameEngine.LOGICAL_WIDTH - this.size) / 2;
    this.y = options.y ?? (GameEngine.LOGICAL_HEIGHT - this.size) / 2;

    // Estado de animación / dirección.
    this.direction = "down"; // down | up | left | right
    this.isMoving = false;
    this.animTimer = 0;
    this.animFrameIndex = 0; // alterna entre 0 y 1 (walk_01 / walk_02)
    this.lastSrc = "";

    this.el = document.createElement("div");
    this.el.className = "player";

    this.imgEl = document.createElement("img");
    this.imgEl.className = "player-sprite-img";
    this.imgEl.alt = "Player character";
    this.imgEl.draggable = false;
    this.el.appendChild(this.imgEl);

    this.container.appendChild(this.el);

    this.updateSprite();
    this.render();
  }

  /**
   * Actualiza la posición y animación del jugador según el input.
   * @param {number} deltaSeconds
   */
  update(deltaSeconds) {
    let dx = 0;
    let dy = 0;

    if (InputManager.isPressed("up")) dy -= 1;
    if (InputManager.isPressed("down")) dy += 1;
    if (InputManager.isPressed("left")) dx -= 1;
    if (InputManager.isPressed("right")) dx += 1;

    this.isMoving = dx !== 0 || dy !== 0;

    if (this.isMoving) {
      // Determinamos la dirección (8 vías: 4 rectas + 4 diagonales)
      // ANTES de normalizar, para decidir qué sprite mostrar.
      if (dy !== 0 && dx !== 0) {
        // Movimiento diagonal (dos teclas presionadas a la vez).
        const vertical = dy < 0 ? "Up" : "Down";
        const horizontal = dx < 0 ? "Left" : "Right";
        this.direction = vertical.toLowerCase() + horizontal; // ej. "upLeft", "downRight"
      } else if (dy !== 0) {
        this.direction = dy < 0 ? "up" : "down";
      } else {
        this.direction = dx < 0 ? "left" : "right";
      }

      // Normalizamos el vector para que la diagonal no sea más rápida.
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;

      this.x += dx * this.speed * deltaSeconds;
      this.y += dy * this.speed * deltaSeconds;

      // Limitamos al jugador dentro del escenario.
      this.x = Math.max(0, Math.min(GameEngine.LOGICAL_WIDTH - this.size, this.x));
      this.y = Math.max(0, Math.min(GameEngine.LOGICAL_HEIGHT - this.size, this.y));

      // Avanzamos el ciclo de animación de caminata.
      this.animTimer += deltaSeconds;
      if (this.animTimer >= WALK_FRAME_DURATION) {
        this.animTimer = 0;
        this.animFrameIndex = (this.animFrameIndex + 1) % 2;
      }
    } else {
      this.animTimer = 0;
      this.animFrameIndex = 0;
    }

    this.updateSprite();
    this.render();
  }

  // Selecciona y aplica la imagen correcta según dirección + si camina.
  updateSprite() {
    const frames = this.spriteFrames[this.direction];
    const src = this.isMoving ? frames.walk[this.animFrameIndex] : frames.idle;

    if (src !== this.lastSrc) {
      this.imgEl.src = src;
      this.lastSrc = src;
    }
  }

  render() {
    this.el.style.left = `${GameEngine.toPercentX(this.x)}%`;
    this.el.style.top = `${GameEngine.toPercentY(this.y)}%`;
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.size, height: this.size };
  }
}
