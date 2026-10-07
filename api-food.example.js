// Ejemplo de backend serverless.
// NO pongas OPENAI_API_KEY en GitHub.
// Este archivo es una plantilla: despliega en un proveedor de Functions/Workers.
export default async function handler(req) {
  if (req.method !== "POST") return new Response("Method not allowed",{status:405});
  const {query, quantity=1, unit="portion"} = await req.json();
  const prompt = `Analiza nutricionalmente este alimento o platillo mexicano: ${query}.
Cantidad: ${quantity} ${unit}.
Devuelve SOLO JSON con name, serving, cal, pro, carb, fat, fiber.
Haz una estimación razonable y explícita de la porción solicitada.`;
  // Conecta aquí el SDK/API del modelo usando una variable secreta del servidor.
  // La respuesta final debe coincidir con el esquema del README.
  return Response.json({error:"Configura el proveedor de IA en este backend."},{status:501});
}
