export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { artist, place, date, style, details } = req.body || {};

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "Configure OPENAI_API_KEY nas variáveis de ambiente da Vercel."
    });
  }

  const systemPrompt = `
Você é um diretor de arte especialista em flyers para shows, baladas, DJs, artistas, bares e eventos.
Crie prompts profissionais para gerar imagens de flyers em IA.
Sempre mantenha: composição premium, texto legível, hierarquia visual, estética comercial, formato vertical 9:16.
Responda apenas com o prompt final, sem explicações.
`;

  const userPrompt = `
Crie um prompt para flyer com estes dados:
Artista/evento: ${artist || "não informado"}
Local: ${place || "não informado"}
Data: ${date || "não informado"}
Estilo: ${style || "premium"}
Informações extras: ${details || "nenhuma"}

O prompt deve pedir uma arte profissional, moderna, vendável, com alta conversão visual.
`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Erro na OpenAI" });
    }

    const prompt =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "Não foi possível gerar o prompt.";

    return res.status(200).json({ prompt });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}