// universal_flyer_system v1.0.0 · niche_themes.config.ts
// Responsibility: CSS custom property tokens for each niche
// SAFE TO EDIT: Color values, font stacks, radius, spacing values
// DO NOT MODIFY: Token key names, NicheType keys, export signature

import type { NicheType } from "@/core/niche_defaults.config";

export const NICHE_THEMES: Record<NicheType, Record<string, string>> = {
  food: {
    "--color-primary": "#C8440A",
    "--color-accent": "#F5A623",
    "--color-bg": "#FFFBF5",
    "--color-surface": "#FFF3E0",
    "--color-text-on-primary": "#FFFFFF",
    "--color-text-primary": "#1A0A00",
    "--color-text-muted": "#7A4A2A",
    "--font-display": "'Plus Jakarta Sans', 'Nunito', sans-serif",
    "--font-body": "'Inter', sans-serif",
    "--radius-brand": "16px",
    "--spacing-section": "1.5rem",
  },
  beauty: {
    "--color-primary": "#9B7B5B",
    "--color-accent": "#C9A07A",
    "--color-bg": "#FAF7F4",
    "--color-surface": "#F5EDE4",
    "--color-text-on-primary": "#FAF7F4",
    "--color-text-primary": "#2D1F14",
    "--color-text-muted": "#7D6455",
    "--font-display": "'Cormorant Garamond', 'Playfair Display', serif",
    "--font-body": "'Jost', sans-serif",
    "--radius-brand": "4px",
    "--spacing-section": "1.5rem",
  },
  education: {
    "--color-primary": "#1B4FBF",
    "--color-accent": "#3B82F6",
    "--color-bg": "#F8FAFF",
    "--color-surface": "#EEF3FF",
    "--color-text-on-primary": "#FFFFFF",
    "--color-text-primary": "#0D1B3E",
    "--color-text-muted": "#4A6FA5",
    "--font-display": "'DM Sans', 'Inter', sans-serif",
    "--font-body": "'Inter', sans-serif",
    "--radius-brand": "8px",
    "--spacing-section": "1.5rem",
  },
  services: {
    "--color-primary": "#1A1A2E",
    "--color-accent": "#FF6B35",
    "--color-bg": "#FAFAFA",
    "--color-surface": "#F0F0F0",
    "--color-text-on-primary": "#FFFFFF",
    "--color-text-primary": "#111111",
    "--color-text-muted": "#666666",
    "--font-display": "'Space Grotesk', 'Manrope', sans-serif",
    "--font-body": "'Inter', sans-serif",
    "--radius-brand": "6px",
    "--spacing-section": "1.5rem",
  },
  luxury: {
    "--color-primary": "#0A0A0A",
    "--color-accent": "#C9A84C",
    "--color-bg": "#F8F4EE",
    "--color-surface": "#EDE8DF",
    "--color-text-on-primary": "#F8F4EE",
    "--color-text-primary": "#0A0A0A",
    "--color-text-muted": "#6B5E4E",
    "--font-display": "'Playfair Display', 'Cormorant', serif",
    "--font-body": "'Jost', sans-serif",
    "--radius-brand": "2px",
    "--spacing-section": "2rem",
  },
};
