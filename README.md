# GymTrack v3 — NutriAI + Cantidad obligatoria

Versión mobile-first para GitHub Pages.

## Cambios principales
- Interfaz blanca con texto negro y verde como color de acento.
- Ningún producto se agrega directamente: siempre se abre el selector de cantidad.
- Cantidades en gramos, mililitros, porción, pieza, taza, cucharada y cucharadita.
- Macros recalculados en tiempo real.
- Buscador de productos y creación de alimentos personalizados.
- NutriAI ahora tiene una sección completa con análisis, recomendaciones, recetas, pre/post-entreno, sustituciones y auditoría del día.
- Seguimiento de entrenamiento y progreso.
- Datos guardados en localStorage.

## IA real
GitHub Pages no debe contener claves privadas. Para IA generativa real configura un backend seguro en Ajustes y usa `api-food.example.js` como referencia.

Respuesta esperada del backend:
```json
{"name":"Tacos de bistec","serving":"1 porción","cal":650,"pro":38,"carb":55,"fat":28,"fiber":5}
```

Abre `index.html` para probarlo o súbelo a un repositorio de GitHub Pages.


PUBLICACIÓN: En GitHub sube TODOS los archivos de este ZIP a la misma carpeta que index.html, sustituyendo versiones anteriores. Comprueba que style.css y app.js existen al lado de index.html. En Pages usa Settings > Pages > Deploy from branch > main > /(root). Espera el despliegue y recarga Safari.
