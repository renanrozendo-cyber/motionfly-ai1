// universal_flyer_system v1.0.0 · placeholders.config.ts
// Responsibility: Typed schema for every FlyerData field + the niche selector
// SAFE TO EDIT: maxLength per field, pattern per field, themeWeight per field
// DO NOT MODIFY: field names, section assignments, tier assignments, type values, fallbackSafe, hasNicheDefault
// Claude Code: see docs/CLAUDE_CODE_README.md

import type { FlyerData } from "./niche_defaults.config";

// ─────────────────────────────────────────────────────
// TYPE
// ─────────────────────────────────────────────────────

export type PlaceholderConfig = {
  type: "string" | "url" | "tel" | "number" | "rating" | "date" | "enum";
  required: boolean;
  tier: 1 | 2 | 3;
  section: "A" | "C" | "T" | "I" | "O" | "N";
  maxLength: number;
  pattern: RegExp | null;
  themeWeight: "display" | "body" | "accent" | "ui";
  fallbackSafe: true;
  hasNicheDefault: true;
};

// ─────────────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────────────

export const PLACEHOLDER_SCHEMA: Record<keyof FlyerData | "niche", PlaceholderConfig> = {

  // ── TIER 1 · Core identity ────────────────────────────────────────────────

  niche: {
    type: "enum",
    required: true,
    tier: 1,
    section: "A",
    maxLength: 10,
    pattern: /^(food|beauty|education|services|luxury)$/,
    themeWeight: "ui",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  business_name: {
    type: "string",
    required: true,
    tier: 1,
    section: "A",
    maxLength: 60,
    pattern: null,
    themeWeight: "display",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  whatsapp_number: {
    type: "tel",
    required: true,
    tier: 1,
    section: "N",
    maxLength: 20,
    pattern: /^\+?[\d\s\-()​]{7,20}$/,
    themeWeight: "ui",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  // ── TIER 2 · Hero visuals + offer titles ─────────────────────────────────

  headline: {
    type: "string",
    required: false,
    tier: 2,
    section: "A",
    maxLength: 80,
    pattern: null,
    themeWeight: "display",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  hero_image: {
    type: "url",
    required: false,
    tier: 2,
    section: "A",
    maxLength: 500,
    pattern: /^https?:\/\/.+/,
    themeWeight: "ui",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  offer_1: {
    type: "string",
    required: false,
    tier: 2,
    section: "I",
    maxLength: 60,
    pattern: null,
    themeWeight: "display",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  offer_2: {
    type: "string",
    required: false,
    tier: 2,
    section: "I",
    maxLength: 60,
    pattern: null,
    themeWeight: "display",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  offer_3: {
    type: "string",
    required: false,
    tier: 2,
    section: "I",
    maxLength: 60,
    pattern: null,
    themeWeight: "display",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  // ── TIER 3 · All remaining fields ────────────────────────────────────────

  // Section A — Attention

  logo: {
    type: "url",
    required: false,
    tier: 3,
    section: "A",
    maxLength: 500,
    pattern: /^https?:\/\/.+/,
    themeWeight: "ui",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  subheadline: {
    type: "string",
    required: false,
    tier: 3,
    section: "A",
    maxLength: 120,
    pattern: null,
    themeWeight: "body",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  // Section C — Credibility

  trust_badge_1: {
    type: "string",
    required: false,
    tier: 3,
    section: "C",
    maxLength: 40,
    pattern: null,
    themeWeight: "ui",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  trust_badge_2: {
    type: "string",
    required: false,
    tier: 3,
    section: "C",
    maxLength: 40,
    pattern: null,
    themeWeight: "ui",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  trust_badge_3: {
    type: "string",
    required: false,
    tier: 3,
    section: "C",
    maxLength: 40,
    pattern: null,
    themeWeight: "ui",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  // Section T — Trust

  testimonial_quote: {
    type: "string",
    required: false,
    tier: 3,
    section: "T",
    maxLength: 200,
    pattern: null,
    themeWeight: "body",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  testimonial_author: {
    type: "string",
    required: false,
    tier: 3,
    section: "T",
    maxLength: 60,
    pattern: null,
    themeWeight: "body",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  testimonial_rating: {
    type: "rating",
    required: false,
    tier: 3,
    section: "T",
    maxLength: 1,
    pattern: /^[1-5]$/,
    themeWeight: "ui",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  // Section I — Information

  offer_1_desc: {
    type: "string",
    required: false,
    tier: 3,
    section: "I",
    maxLength: 100,
    pattern: null,
    themeWeight: "body",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  offer_1_price: {
    type: "string",
    required: false,
    tier: 3,
    section: "I",
    maxLength: 30,
    pattern: null,
    themeWeight: "accent",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  offer_2_desc: {
    type: "string",
    required: false,
    tier: 3,
    section: "I",
    maxLength: 100,
    pattern: null,
    themeWeight: "body",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  offer_2_price: {
    type: "string",
    required: false,
    tier: 3,
    section: "I",
    maxLength: 30,
    pattern: null,
    themeWeight: "accent",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  offer_3_desc: {
    type: "string",
    required: false,
    tier: 3,
    section: "I",
    maxLength: 100,
    pattern: null,
    themeWeight: "body",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  offer_3_price: {
    type: "string",
    required: false,
    tier: 3,
    section: "I",
    maxLength: 30,
    pattern: null,
    themeWeight: "accent",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  // Section O — Offer

  promo_offer: {
    type: "string",
    required: false,
    tier: 3,
    section: "O",
    maxLength: 80,
    pattern: null,
    themeWeight: "display",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  promo_expiry: {
    type: "string",
    required: false,
    tier: 3,
    section: "O",
    maxLength: 60,
    pattern: null,
    themeWeight: "body",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  promo_code: {
    type: "string",
    required: false,
    tier: 3,
    section: "O",
    maxLength: 20,
    pattern: /^[A-Z0-9]{3,20}$/,
    themeWeight: "accent",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  // Section N — Next Step

  cta_label: {
    type: "string",
    required: false,
    tier: 3,
    section: "N",
    maxLength: 60,
    pattern: null,
    themeWeight: "display",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  phone_number: {
    type: "tel",
    required: false,
    tier: 3,
    section: "N",
    maxLength: 20,
    pattern: /^\+?[\d\s\-()​]{7,20}$/,
    themeWeight: "ui",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  location: {
    type: "string",
    required: false,
    tier: 3,
    section: "N",
    maxLength: 100,
    pattern: null,
    themeWeight: "body",
    fallbackSafe: true,
    hasNicheDefault: true,
  },

  maps_link: {
    type: "url",
    required: false,
    tier: 3,
    section: "N",
    maxLength: 500,
    pattern: /^https?:\/\/.+/,
    themeWeight: "ui",
    fallbackSafe: true,
    hasNicheDefault: true,
  },
};
