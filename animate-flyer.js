const MOTION_PROMPT = `Ultra smooth cinematic 3D motion animation, realistic multilayer parallax effect, automatic foreground and background separation, true depth composition like Adobe After Effects, cinematic camera movement with smooth zoom and side drift, floating particles and golden dust, volumetric nightclub smoke, realistic neon reflections, cinematic lens flares, LED light glow, soft ambient lighting, animated shadows with realistic depth, premium motion graphics style, immersive nightclub atmosphere, luxury music festival aesthetic, subtle bass-reactive camera shake, smooth light sweep transitions across text and elements, realistic 3D extrusion feeling, dynamic depth of field, floating layer movement, elegant cinematic transitions, high-end promotional animation, ultra realistic After Effects style motion, smooth object displacement, vibrant magenta and cyan lighting, atmospheric haze, realistic particle simulation, seamless camera interpolation, dramatic but clean movement pacing, immersive concert trailer look, glossy reflections, soft motion blur, high contrast cinematic lighting, realistic environmental ambience.

ANIMATION RULES:
- Separate all flyer elements into independent 3D layers
- Apply foreground, midground and background depth
- Animate text independently with cinematic easing
- Add smooth parallax movement between layers
- Simulate realistic camera movement in 3D space
- Add floating particles and smoke effects
- Apply glow and bloom to neon/light elements
- Use slow cinematic zoom with subtle rotation
- Maintain readability of all flyer information
- Preserve original flyer design and identity
- Motion must feel premium and professional
- No cartoon effect
- No distortion of faces, logos or text
- No excessive shaking
- Seamless looping movement preferred

STYLE:
Premium After Effects animation, cinematic nightclub promo, luxury event trailer, ultra realistic motion graphics, modern concert visuals, social media viral advertisement aesthetic, immersive 3D flyer animation, professional VFX composition.

OUTPUT:
Vertical 9:16 format, ultra HD, smooth 60fps look, cinematic quality, Instagram Reels/TikTok ready.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  return res.status(200).json({
    motionPrompt: MOTION_PROMPT,
    videoStatus: "Prompt motion pronto. Conecte aqui Runway, Kling, Luma ou PixVerse para gerar vídeo real."
  });
}