export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { prompt, artistPhotoBase64 } = req.body || {};

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Configure OPENAI_API_KEY nas variáveis de ambiente da Vercel." });
  }

  if (!prompt) {
    return res.status(400).json({ error: "Prompt é obrigatório." });
  }

  try {
    let finalPrompt = prompt;

    if (artistPhotoBase64) {
      finalPrompt = `${prompt}

Use the uploaded artist photo as the main visual reference. Preserve the person's face, identity, body proportions, clothing, pose, tattoos, hairstyle and accessories as much as possible. Create a professional event flyer around the artist, with premium lighting, typography hierarchy and commercial composition.`;
    }

    const body = artistPhotoBase64
      ? {
          model: "gpt-image-1",
          prompt: finalPrompt,
          image: artistPhotoBase64,
          size: "1024x1536"
        }
      : {
          model: "gpt-image-1",
          prompt: finalPrompt,
          size: "1024x1536"
        };

    // Observação:
    // Algumas contas/modelos podem exigir outro endpoint para edição com imagem.
    // Se sua conta não aceitar o campo "image", use a API oficial de image edits ou troque por Replicate/Flux/Kling/Runway.

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Erro ao gerar imagem. Se enviou foto, talvez precise configurar endpoint de edição de imagem."
      });
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