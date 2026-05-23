// universal_flyer_system v1.0.0 · action_framework.ts
// Responsibility: A.C.T.I.O.N section registry — conversion logic, field mapping, structural invariants
// SAFE TO EDIT: kpi strings, conversionLogic strings
// DO NOT MODIFY: letter values, section order, placeholders arrays, locked flags, SECTION_ORDER, STRUCTURAL_INVARIANTS
// Claude Code: see docs/CLAUDE_CODE_README.md

// ─────────────────────────────────────────────────────
// FRAMEWORK REGISTRY
// ─────────────────────────────────────────────────────

export const ACTION_FRAMEWORK = [
  {
    letter: "A",
    name: "Attention",
    kpi: "Business identity clear within 2 seconds",
    placeholders: [
      "logo",
      "business_name",
      "headline",
      "subheadline",
      "hero_image",
    ] as const,
    locked: true,
    conversionLogic:
      "Hero dominates. Scroll-stopping visual. Identity first. Business name and headline must be legible on any hero image.",
  },
  {
    letter: "C",
    name: "Credibility",
    kpi: "3 trust signals visible without scrolling",
    placeholders: [
      "trust_badge_1",
      "trust_badge_2",
      "trust_badge_3",
    ] as const,
    locked: false,
    conversionLogic:
      "Icons reduce cognitive load. Badges confirm legitimacy instantly. All 3 should be scannable in under 1 second.",
  },
  {
    letter: "T",
    name: "Trust",
    kpi: "Social proof read rate > 60%",
    placeholders: [
      "testimonial_quote",
      "testimonial_author",
      "testimonial_rating",
    ] as const,
    locked: false,
    conversionLogic:
      "Real names and star ratings beat generic praise. Specificity converts. Quote must be concrete, not vague.",
  },
  {
    letter: "I",
    name: "Information",
    kpi: "All 3 offers visible in one scroll",
    placeholders: [
      "offer_1",
      "offer_1_desc",
      "offer_1_price",
      "offer_2",
      "offer_2_desc",
      "offer_2_price",
      "offer_3",
      "offer_3_desc",
      "offer_3_price",
    ] as const,
    locked: false,
    conversionLogic:
      "Pricing visible upfront. No click required to know cost. Three offers create choice without overwhelm.",
  },
  {
    letter: "O",
    name: "Offer",
    kpi: "Promo code copy rate > 15%",
    placeholders: [
      "promo_offer",
      "promo_expiry",
      "promo_code",
    ] as const,
    locked: false,
    conversionLogic:
      "Urgency via expiry + one-tap code copy eliminates friction. Section hides entirely when all three promo fields are absent.",
  },
  {
    letter: "N",
    name: "Next Step",
    kpi: "WhatsApp tap-through rate > 8%",
    placeholders: [
      "cta_label",
      "whatsapp_number",
      "phone_number",
      "location",
      "maps_link",
    ] as const,
    locked: true,
    conversionLogic:
      "Sticky position ensures CTA is always in thumb reach. Single primary action only — WhatsApp. Phone and location are secondary affordances.",
  },
] as const;

// ─────────────────────────────────────────────────────
// DERIVED EXPORTS
// ─────────────────────────────────────────────────────

export const SECTION_ORDER = ["A", "C", "T", "I", "O", "N"] as const;

export type SectionLetter = (typeof SECTION_ORDER)[number];

// ─────────────────────────────────────────────────────
// STRUCTURAL INVARIANTS
// Rules that must never be broken — any change that violates
// one of these requires explicit sign-off and a new invariant entry.
// ─────────────────────────────────────────────────────

export const STRUCTURAL_INVARIANTS: string[] = [
  "Section render order is always A→C→T→I→O→N and must never be reordered",
  "AttentionSection (A) is always rendered — it holds business identity, is the scroll anchor, and carries the hero visual",
  "NextStepSection (N) is always rendered and always positioned sticky bottom-0 z-50 — it is the conversion goal",
  "OfferSection (O) must return null when promo_offer, promo_expiry, and promo_code are all absent — never render an empty promo strip",
  "mergedData must always guarantee business_name and whatsapp_number via fallback values before passing to any section",
  "All theming is applied as CSS custom properties on document.documentElement — never hardcode hex values in JSX style props",
  "NICHE_THEMES tokens must be removed from document.documentElement on component unmount via useEffect cleanup to prevent niche bleed",
  "stripNonDigits() must sanitize whatsapp_number before every wa.me URL construction — spaces, dashes, and parentheses must not reach the URL",
  "Parent container must carry pb-24 to prevent the sticky NextStepSection from obscuring the last content section",
  "All section components must use the fadeUp variant inside the staggerContainer animation — do not introduce new motion variants without updating this registry",
  "User-supplied data always overrides niche defaults — spread order in mergedData is always { ...defaults, ...data }, never reversed",
  "NICHE_DEFAULTS in niche_defaults.config.ts is the authoritative source of defaults — the component must import from there, never define inline defaults",
  "Locked sections (A and N) must always render regardless of data completeness — their fields carry fallback values for this reason",
  "The whatsapp_number fallback in mergedData must always be a valid E.164-style number to prevent a broken wa.me URL on first load",
];
