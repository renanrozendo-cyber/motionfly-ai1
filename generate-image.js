export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { prompt } = req.body || {};

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "Configure OPENAI_API_KEY nas variáveis de ambiente da Vercel."
    });
  }

  if (!prompt) {
    return res.status(400).json({ error: "Prompt é obrigatório." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1024x1536"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Erro ao gerar imagem" });
    }

    const base64 = data.data?.[0]?.b64_json;
    if (!base64) {
      return res.status(500).json({ error: "A API não retornou imagem em base64." });
    }

    const imageUrl = `data:image/png;base64,${base64}`;
    return res.status(200).json({ imageUrl });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}