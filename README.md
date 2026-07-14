# Home Adventure: Learn English

Videojuego educativo web para estudiantes de inglés nivel A1. Este entregable contiene la base del proyecto y el **Nivel 1 — Living Room Hunt** completamente jugable.

## Tecnología

- **HTML5 + CSS3 + JavaScript Vanilla** (sin frameworks ni dependencias externas).
- Personaje y objetos representados con **formas CSS** (divs con color, sin sprites ni imágenes).
- **Web Audio API** para efectos de sonido (generados por código, sin archivos de audio).
- **SpeechSynthesis (Web Speech API)** para pronunciar cada objeto en inglés al recogerlo.
- Diseño **responsive**: el escenario escala automáticamente a distintos tamaños de pantalla usando un sistema de coordenadas lógico (800×500) convertido a porcentajes.

## Cómo ejecutarlo

1. Descarga o clona la carpeta completa `home-adventure-learn-english/`.
2. Abre el archivo `index.html` directamente en un navegador moderno (Chrome, Edge o Firefox recomendados: mejor soporte de SpeechSynthesis).
   - No requiere servidor ni instalación de dependencias.
   - Si tu navegador bloquea el audio hasta la primera interacción, esto es normal: simplemente mueve al personaje o toca un objeto y el audio se activará.
3. Controles:
   - Movimiento: flechas del teclado (`↑ ↓ ← →`) o `W A S D`.
   - En dispositivos táctiles, el escenario es visualmente responsive, pero el movimiento del Nivel 1 está pensado para teclado (control táctil se puede agregar en una siguiente iteración).

## Cómo jugar el Nivel 1

- Recorre la sala y recolecta únicamente los 7 objetos correctos de la **Living Room**: Sofa, TV, Carpet, Lamp, Coffee Table, Armchair, Clock.
- Evita los objetos que no pertenecen a esta habitación: Toilet, Bed, Frying Pan, Shower (no se pierden vidas al tocarlos en este nivel, solo se muestra una advertencia).
- Cada objeto correcto suma 10 puntos, se pronuncia en inglés y desaparece del escenario.
- Al recolectar los 7 objetos correctos aparece la pantalla de "¡Nivel Completado!".

## Estructura del proyecto

```
home-adventure-learn-english/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── core/
│   │   ├── game.js       # Motor genérico: loop, coordenadas lógicas, colisiones
│   │   ├── input.js       # Manejo de teclado (flechas/WASD)
│   │   ├── audio.js       # Efectos de sonido + pronunciación
│   │   └── hud.js         # Puntaje, monedas, vidas, estrellas, contador
│   ├── entities/
│   │   ├── player.js       # Clase del personaje
│   │   └── item.js         # Clase de los objetos recolectables
│   └── levels/
│       └── level1.js       # Lógica específica del Nivel 1
├── assets/
│   ├── sprites/            # (reservado para assets futuros)
│   └── sounds/             # (reservado para assets futuros)
└── README.md
```

## Próximos pasos (para iterar)

- Añadir `level2.js` reutilizando `Player`, `HUD`, `AudioManager`, `GameEngine` — solo cambia la lógica de "arrastrar objetos a su lugar" y las acciones del living room.
- Sistema de vidas activo (actualmente el HUD las muestra pero el Nivel 1 no las descuenta, según especificación).
- Sistema de estrellas/medallas al finalizar niveles.
- Soporte de controles táctiles (botones direccionales en pantalla) para dispositivos móviles.
