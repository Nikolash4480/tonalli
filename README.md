# Tonalli · Senda del Jaguar

Adaptación digital del juego de mesa Olvir con temática azteca. Pixel art HD-2D, de 1 a 4 jugadores en un dispositivo u online.

**Jugar:** https://nikolash4480.github.io/tonalli/

## Estructura
- `index.html`: el juego publicado (GitHub Pages).
- `config.js`: configuración de Firebase para el juego online.
- `src/`: código fuente (escena 3D, interfaz, reglas, sprites, audio, online).
- `tools/art/`: scripts que generaron el arte de héroes y bestias.
- `build.py`: arma `index.html` a partir de `src/`.

## Armar el juego
```
npm install
python3 build.py
```
