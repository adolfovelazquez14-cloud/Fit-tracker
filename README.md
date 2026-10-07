# GymTrack — Macros & Entrenamiento

App web móvil para nutrición y entrenamiento.

## Archivos
- `index.html` — interfaz
- `style.css` — Liquid Glass
- `app.js` — lógica de macros, alimentos, entrenamientos e IA

## GitHub Pages
Sube los 4 archivos a la raíz del repositorio y activa **Settings → Pages → Deploy from a branch → main → / (root)**.

## IA nutricional
La interfaz incluye un analizador de alimentos preparado para un endpoint seguro. **No pongas una API key de OpenAI dentro de `app.js` ni en GitHub Pages.** Configura `window.GYMTRACK_AI_ENDPOINT` para apuntar a tu backend seguro.

Sin endpoint, la app funciona con una estimación local para alimentos conocidos y con los alimentos guardados por el usuario.
