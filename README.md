# GymTrack v2

## Qué cambió
- Interfaz nueva estilo Liquid Glass, negro/blanco/verde.
- Dashboard móvil con anillo de calorías y macros.
- NutriAI con cantidades y unidades: gramos, ml, porción, pieza, taza, cucharada y cucharadita.
- Registro de comidas.
- Entrenamiento con peso/repeticiones y comparación.
- Historial y progreso.
- Datos guardados en `localStorage`.

## IA real
GitHub Pages solo sirve archivos estáticos. Para que NutriAI analice cualquier platillo con un modelo de IA necesitas un backend seguro.

La app acepta un endpoint en **Ajustes → Conexión NutriAI**.

El frontend envía:
```json
{"query":"3 tacos de bistec con queso","quantity":1,"unit":"portion"}
```

El backend debe devolver:
```json
{
  "name":"Tacos de bistec con queso",
  "serving":"1 porción",
  "cal":650,
  "pro":38,
  "carb":55,
  "fat":28,
  "fiber":5
}
```

**No coloques una API key de OpenAI en `index.html` o `app.js`.** Si quieres IA real, usa un Worker/Function con la clave como secreto.

## Selector de cantidad
Al seleccionar un alimento/resultado de NutriAI, se abre una ventana donde eliges cantidad y unidad. Los macros se recalculan en tiempo real antes de confirmar.
