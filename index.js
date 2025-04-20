require("dotenv").config();
const express = require("express");
const cors = require("cors");

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/api/receta", async (req, res) => {
  const { ingredientes } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Tengo estos ingredientes: ${ingredientes}. ¿Qué receta puedo hacer con ellos?`
        }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const receta = data.choices?.[0]?.message?.content || "No se pudo generar receta 😢";
    console.log("Respuesta OpenRouter:", data);
    res.json({ receta });

  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ error: "Error interno en el servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});