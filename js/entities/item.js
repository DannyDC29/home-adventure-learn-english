/* ============================================
   Item
   Representa un objeto recolectable dentro del escenario
   (correcto o incorrecto según el nivel/habitación).
   ============================================ */

class Item {
  /**
   * @param {HTMLElement} container
   * @param {object} options - { name, correct, x, y, size, colorClass, icon }
   */
  constructor(container, options) {
    this.container = container;
    this.name = options.name;
    this.correct = options.correct;
    this.size = options.size ?? 70;
    this.x = options.x;
    this.y = options.y;
    this.collected = false;

    this.el = document.createElement("div");
    this.el.className = `item ${options.colorClass ?? "item-color-1"}`;
    // Cada objeto muestra una imagen PNG (qué es) además del nombre en inglés.
    const iconSrc = options.icon;
    this.el.innerHTML = `
      <img class="item-icon-img" src="${iconSrc}" alt="${options.name}" draggable="false">
      <span class="item-label">${options.name}</span>
    `;
    this.container.appendChild(this.el);

    this.render();
  }

  render() {
    this.el.style.left = `${GameEngine.toPercentX(this.x)}%`;
    this.el.style.top = `${GameEngine.toPercentY(this.y)}%`;
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.size, height: this.size };
  }

  // Marca el objeto como recolectado y lo desvanece del escenario.
  markCollected() {
    this.collected = true;
    this.el.classList.add("collected");
  }

  // Pequeña sacudida visual cuando el jugador toca un objeto incorrecto.
  shake() {
    this.el.classList.remove("shake");
    // Forzamos reflow para poder re-disparar la animación si se repite.
    void this.el.offsetWidth;
    this.el.classList.add("shake");
  }
}
