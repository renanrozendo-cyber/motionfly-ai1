# MotionFly AI integrado

Este projeto tem:

- Landing page profissional
- Formulário de briefing
- API para gerar prompt com OpenAI
- API para gerar flyer com OpenAI Images
- API com prompt padrão para animação 3D/parallax estilo After Effects

## Como testar localmente

1. Instale Node.js
2. Instale a Vercel CLI:

```bash
npm i -g vercel
```

3. Entre na pasta do projeto:

```bash
cd motionfly_ai_integrado
```

4. Crie um arquivo `.env.local`:

```bash
OPENAI_API_KEY=sua_chave_aqui
```

5. Rode:

```bash
vercel dev
```

6. Abra:

```bash
http://localhost:3000
```

## Como publicar na Vercel

1. Faça upload deste projeto na Vercel
2. Vá em Settings > Environment Variables
3. Adicione:

```bash
OPENAI_API_KEY=sua_chave_aqui
```

4. Clique em Deploy

## Próximo passo

A rota `/api/animate-flyer` já está preparada com o prompt padrão.
Para gerar vídeo de verdade, conecte uma API de vídeo como Runway, Kling, Luma ou PixVerse dentro dessa rota.
