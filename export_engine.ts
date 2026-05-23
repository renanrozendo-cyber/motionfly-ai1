// universal_flyer_system v1.0.0 · export_engine.ts
// Responsibility: Render FlyerData to exportable artifacts — HTML, OG meta, print CSS.
//   Browser-only formats (JPG, PDF) are stubs that throw at runtime.
// SAFE TO EDIT: NICHE_TOKENS values, CSS prose, SVG icon strings
// DO NOT MODIFY: function signatures, OGMeta shape, EXPORT_MODES keys, exportJPG/exportPDF stubs

import { getFallbackImage } from "./asset_governance";
import type { FlyerData, NicheType } from "./niche_defaults.config";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OGMeta = {
  title: string;
  description: string;
  image: string;
  imageWidth: 1200;
  imageHeight: 630;
  url?: string;
};

interface NicheTokens {
  colorAccent: string;
  colorBg: string;
  colorSurface: string;
  colorText: string;
  colorMutedText: string;
  colorBorder: string;
  fontDisplay: string;
  fontBody: string;
  googleFontFamily: string;
  googleFontParam: string;
}

// ─── Export modes registry ────────────────────────────────────────────────────

export const EXPORT_MODES = {
  html: {
    label: "HTML (online)",
    description: "Full HTML with Google Fonts CDN. Requires internet for fonts.",
    serverSafe: true,
    selfContained: false,
    constraints: ["Framer-motion animations omitted (client-only)", "Google Fonts CDN required for display font"],
  },
  offlineHTML: {
    label: "HTML (offline)",
    description: "Single self-contained file. No CDN dependencies.",
    serverSafe: true,
    selfContained: true,
    constraints: ["System font stack — display font may differ from online version", "Lucide icons inlined as SVG"],
  },
  printCSS: {
    label: "Print CSS",
    description: "CSS string for @media print. Inject into any page before printing.",
    serverSafe: true,
    selfContained: true,
    constraints: ["Requires existing HTML structure", "Not a standalone document"],
  },
  jpg: {
    label: "JPG image",
    description: "Rasterised flyer image via html2canvas.",
    serverSafe: false,
    selfContained: true,
    constraints: ["Browser-only — requires html2canvas", "Must call from client component"],
  },
  pdf: {
    label: "PDF document",
    description: "Print-ready PDF via puppeteer or browser print dialog.",
    serverSafe: false,
    selfContained: true,
    constraints: ["Browser-only — requires puppeteer or window.print()", "Must call from client component"],
  },
} as const;

// ─── Niche design tokens ──────────────────────────────────────────────────────

const NICHE_TOKENS: Record<NicheType, NicheTokens> = {
  food: {
    colorAccent: "#f59e0b",
    colorBg: "#0f1107",
    colorSurface: "#1a1209",
    colorText: "#fef3c7",
    colorMutedText: "#a16207",
    colorBorder: "#292110",
    fontDisplay: "'Lora', 'Georgia', serif",
    fontBody: "system-ui, -apple-system, sans-serif",
    googleFontFamily: "Lora",
    googleFontParam: "family=Lora:wght@700",
  },
  beauty: {
    colorAccent: "#ec4899",
    colorBg: "#100810",
    colorSurface: "#1a0d16",
    colorText: "#fce7f3",
    colorMutedText: "#9d174d",
    colorBorder: "#2d1424",
    fontDisplay: "'Playfair Display', 'Palatino Linotype', serif",
    fontBody: "system-ui, -apple-system, sans-serif",
    googleFontFamily: "Playfair+Display",
    googleFontParam: "family=Playfair+Display:wght@700",
  },
  education: {
    colorAccent: "#3b82f6",
    colorBg: "#080e1a",
    colorSurface: "#0d1526",
    colorText: "#eff6ff",
    colorMutedText: "#93c5fd",
    colorBorder: "#1e2f52",
    fontDisplay: "system-ui, -apple-system, sans-serif",
    fontBody: "system-ui, -apple-system, sans-serif",
    googleFontFamily: "Inter",
    googleFontParam: "family=Inter:wght@700;800",
  },
  services: {
    colorAccent: "#10b981",
    colorBg: "#071410",
    colorSurface: "#0a1c16",
    colorText: "#ecfdf5",
    colorMutedText: "#6ee7b7",
    colorBorder: "#134e37",
    fontDisplay: "system-ui, -apple-system, sans-serif",
    fontBody: "system-ui, -apple-system, sans-serif",
    googleFontFamily: "Inter",
    googleFontParam: "family=Inter:wght@700;800",
  },
  luxury: {
    colorAccent: "#d4a017",
    colorBg: "#09080a",
    colorSurface: "#150f00",
    colorText: "#fef9e7",
    colorMutedText: "#d4a017",
    colorBorder: "#2a2000",
    fontDisplay: "'Playfair Display', 'Didot', Georgia, serif",
    fontBody: "system-ui, -apple-system, sans-serif",
    googleFontFamily: "Playfair+Display",
    googleFontParam: "family=Playfair+Display:wght@700",
  },
};

// ─── System font stacks (offline mode) ───────────────────────────────────────

const SYSTEM_FONTS: Record<NicheType, string> = {
  food: "'Georgia', 'Times New Roman', serif",
  beauty: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
  education: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  services: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  luxury: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",
};

// ─── Lucide SVG icons (inlined, no CDN) ──────────────────────────────────────

const ICON = {
  check:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  mapPin:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  phone:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.59 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10.4a16 16 0 0 0 5.69 5.69l1.96-1.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  message:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  externalLink:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function waHref(number: string): string {
  const digits = number.replace(/[^+\d]/g, "").replace(/^\+/, "");
  return `https://wa.me/${digits}`;
}

function buildStars(rating: number): string {
  const filled = Math.min(5, Math.max(0, Math.round(rating)));
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

function buildCSSTokens(tokens: NicheTokens): string {
  return `:root {
  --color-accent:     ${tokens.colorAccent};
  --color-bg:         ${tokens.colorBg};
  --color-surface:    ${tokens.colorSurface};
  --color-text:       ${tokens.colorText};
  --color-muted-text: ${tokens.colorMutedText};
  --color-border:     ${tokens.colorBorder};
  --font-display:     ${tokens.fontDisplay};
  --font-body:        ${tokens.fontBody};
}`;
}

function buildBaseCSS(): string {
  return `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
}
a { color: inherit; text-decoration: none; }
img { display: block; max-width: 100%; }
.flyer { display: flex; flex-direction: column; }

/* Section A — Attention */
.section-a { position: relative; }
.section-a__hero { width: 100%; aspect-ratio: 16/9; object-fit: cover; }
.section-a__logo {
  position: absolute; top: 14px; left: 14px;
  width: 52px; height: 52px; border-radius: 8px;
  object-fit: contain; background: rgba(0,0,0,0.45);
}
.section-a__body { padding: 22px 20px; background: var(--color-surface); }
.section-a__name {
  font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--color-accent); margin-bottom: 8px;
}
.section-a__headline {
  font-family: var(--font-display); font-size: 26px;
  font-weight: 700; line-height: 1.25; margin-bottom: 8px;
}
.section-a__subheadline {
  font-size: 14px; color: var(--color-muted-text); line-height: 1.65;
}

/* Section C — Credibility */
.section-c { padding: 20px; display: flex; gap: 10px; background: var(--color-bg); }
.section-c__badge {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 7px; text-align: center;
}
.section-c__icon { color: var(--color-accent); }
.section-c__label { font-size: 12px; font-weight: 600; }

/* Section T — Trust */
.section-t {
  margin: 0 18px; padding: 20px;
  background: var(--color-surface);
  border-left: 3px solid var(--color-accent);
  border-radius: 4px;
}
.section-t__stars { color: var(--color-accent); font-size: 15px; margin-bottom: 10px; }
.section-t__quote { font-size: 14px; font-style: italic; line-height: 1.65; margin-bottom: 10px; }
.section-t__author { font-size: 12px; font-weight: 600; color: var(--color-muted-text); }

/* Section I — Information */
.section-i { padding: 22px 18px; background: var(--color-bg); }
.section-i__label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--color-accent); margin-bottom: 14px;
}
.section-i__offers { display: flex; flex-direction: column; gap: 10px; }
.offer-card {
  padding: 16px; background: var(--color-surface);
  border-radius: 8px; border: 1px solid var(--color-border);
}
.offer-card__name { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
.offer-card__desc { font-size: 13px; color: var(--color-muted-text); margin-bottom: 8px; line-height: 1.5; }
.offer-card__price { font-size: 20px; font-weight: 800; color: var(--color-accent); }

/* Section O — Offer */
.section-o {
  margin: 18px; padding: 20px;
  background: var(--color-accent); border-radius: 8px; text-align: center;
}
.section-o__offer {
  font-family: var(--font-display); font-size: 21px;
  font-weight: 800; color: var(--color-bg); margin-bottom: 6px;
}
.section-o__expiry { font-size: 12px; color: var(--color-bg); opacity: 0.75; margin-bottom: 10px; }
.section-o__code {
  display: inline-block; padding: 6px 18px;
  background: var(--color-bg); color: var(--color-accent);
  font-size: 15px; font-weight: 800; letter-spacing: 0.1em; border-radius: 4px;
}

/* Section N — Next Step */
.section-n { padding: 22px 18px; background: var(--color-bg); display: flex; flex-direction: column; gap: 14px; }
.section-n__cta {
  display: block; width: 100%; padding: 16px;
  background: var(--color-accent); color: var(--color-bg);
  font-size: 16px; font-weight: 800; text-align: center;
  border-radius: 8px;
}
.section-n__meta {
  display: flex; flex-direction: column; gap: 10px;
  padding-top: 10px; border-top: 1px solid var(--color-border);
}
.section-n__item {
  display: flex; align-items: center; gap: 9px;
  font-size: 13px; color: var(--color-muted-text);
}
.section-n__item .icon { color: var(--color-accent); flex-shrink: 0; }

/* Footer */
.flyer-footer {
  padding: 12px 18px; text-align: center;
  font-size: 11px; color: var(--color-muted-text);
  border-top: 1px solid var(--color-border);
}`;
}

// ─── Section builders ─────────────────────────────────────────────────────────

function buildSectionA(data: FlyerData): string {
  const logoTag = data.logo
    ? `<img class="section-a__logo" src="${escHtml(data.logo)}" alt="${escHtml(data.business_name)} logo" />`
    : "";
  return `
  <section class="section-a">
    <img class="section-a__hero" src="${escHtml(data.hero_image)}" alt="${escHtml(data.business_name)}" />
    ${logoTag}
    <div class="section-a__body">
      <div class="section-a__name">${escHtml(data.business_name)}</div>
      <h1 class="section-a__headline">${escHtml(data.headline)}</h1>
      <p class="section-a__subheadline">${escHtml(data.subheadline)}</p>
    </div>
  </section>`;
}

function buildSectionC(data: FlyerData): string {
  const badges = [data.trust_badge_1, data.trust_badge_2, data.trust_badge_3];
  const badgeHTML = badges
    .filter((b) => b.trim() !== "")
    .map(
      (b) => `
    <div class="section-c__badge">
      <span class="section-c__icon">${ICON.check}</span>
      <span class="section-c__label">${escHtml(b)}</span>
    </div>`
    )
    .join("");
  if (!badgeHTML) return "";
  return `
  <section class="section-c">${badgeHTML}
  </section>`;
}

function buildSectionT(data: FlyerData): string {
  if (!data.testimonial_quote.trim()) return "";
  return `
  <section class="section-t">
    <div class="section-t__stars">${buildStars(data.testimonial_rating)}</div>
    <blockquote class="section-t__quote">"${escHtml(data.testimonial_quote)}"</blockquote>
    <cite class="section-t__author">— ${escHtml(data.testimonial_author)}</cite>
  </section>`;
}

function buildOfferCard(
  name: string,
  desc: string,
  price: string
): string {
  if (!name.trim()) return "";
  return `
    <div class="offer-card">
      <div class="offer-card__name">${escHtml(name)}</div>
      ${desc.trim() ? `<div class="offer-card__desc">${escHtml(desc)}</div>` : ""}
      ${price.trim() ? `<div class="offer-card__price">${escHtml(price)}</div>` : ""}
    </div>`;
}

function buildSectionI(data: FlyerData): string {
  const cards = [
    buildOfferCard(data.offer_1, data.offer_1_desc, data.offer_1_price),
    buildOfferCard(data.offer_2, data.offer_2_desc, data.offer_2_price),
    buildOfferCard(data.offer_3, data.offer_3_desc, data.offer_3_price),
  ].filter(Boolean);
  if (cards.length === 0) return "";
  return `
  <section class="section-i">
    <div class="section-i__label">What We Offer</div>
    <div class="section-i__offers">${cards.join("")}
    </div>
  </section>`;
}

function buildSectionO(data: FlyerData): string {
  const hasPromo =
    data.promo_offer.trim() ||
    data.promo_expiry.trim() ||
    data.promo_code.trim();
  if (!hasPromo) return "";
  const codeTag = data.promo_code.trim()
    ? `<div class="section-o__code">${escHtml(data.promo_code)}</div>`
    : "";
  const expiryTag = data.promo_expiry.trim()
    ? `<div class="section-o__expiry">Valid: ${escHtml(data.promo_expiry)}</div>`
    : "";
  return `
  <section class="section-o">
    <div class="section-o__offer">${escHtml(data.promo_offer)}</div>
    ${expiryTag}
    ${codeTag}
  </section>`;
}

function buildSectionN(data: FlyerData): string {
  const metaItems: string[] = [];
  if (data.phone_number.trim()) {
    metaItems.push(
      `<div class="section-n__item"><span class="icon">${ICON.phone}</span><span>${escHtml(data.phone_number)}</span></div>`
    );
  }
  if (data.location.trim()) {
    const locationContent = data.maps_link.trim()
      ? `<a href="${escHtml(data.maps_link)}" target="_blank" rel="noopener">${escHtml(data.location)} ${ICON.externalLink}</a>`
      : escHtml(data.location);
    metaItems.push(
      `<div class="section-n__item"><span class="icon">${ICON.mapPin}</span><span>${locationContent}</span></div>`
    );
  }
  const metaSection = metaItems.length
    ? `<div class="section-n__meta">${metaItems.join("")}</div>`
    : "";
  return `
  <section class="section-n">
    <a class="section-n__cta" href="${waHref(data.whatsapp_number)}" target="_blank" rel="noopener">
      <span>${ICON.message}</span> ${escHtml(data.cta_label)}
    </a>
    ${metaSection}
  </section>`;
}

function buildBody(data: FlyerData): string {
  return [
    buildSectionA(data),
    buildSectionC(data),
    buildSectionT(data),
    buildSectionI(data),
    buildSectionO(data),
    buildSectionN(data),
  ].join("\n");
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function exportHTML(data: FlyerData, niche: NicheType): string {
  const tokens = NICHE_TOKENS[niche];
  const googleFontsLink = `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?${tokens.googleFontParam}&display=swap" rel="stylesheet" />`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(data.business_name)}</title>
  <meta name="description" content="${escHtml(data.headline)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escHtml(data.business_name)}" />
  <meta property="og:description" content="${escHtml(data.headline)}" />
  <meta property="og:image" content="${escHtml(data.hero_image || getFallbackImage(niche))}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escHtml(data.business_name)}" />
  <meta name="twitter:description" content="${escHtml(data.headline)}" />
  <meta name="twitter:image" content="${escHtml(data.hero_image || getFallbackImage(niche))}" />${googleFontsLink}
  <style>
${buildCSSTokens(tokens)}
${buildBaseCSS()}
  </style>
</head>
<body>
  <main class="flyer">
${buildBody(data)}
    <footer class="flyer-footer">${escHtml(data.business_name)} · Powered by WhatsApp</footer>
  </main>
</body>
</html>`;
}

export function exportOGMeta(data: FlyerData, niche: NicheType = "food"): OGMeta {
  return {
    title: data.business_name,
    description: data.headline,
    image: data.hero_image || getFallbackImage(niche),
    imageWidth: 1200,
    imageHeight: 630,
  };
}

export function exportOfflineHTML(data: FlyerData, niche: NicheType): string {
  const tokens: NicheTokens = {
    ...NICHE_TOKENS[niche],
    fontDisplay: SYSTEM_FONTS[niche],
    fontBody: SYSTEM_FONTS[niche],
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(data.business_name)}</title>
  <meta name="description" content="${escHtml(data.headline)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escHtml(data.business_name)}" />
  <meta property="og:description" content="${escHtml(data.headline)}" />
  <meta property="og:image" content="${escHtml(data.hero_image || getFallbackImage(niche))}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <style>
${buildCSSTokens(tokens)}
${buildBaseCSS()}
  </style>
</head>
<body>
  <main class="flyer">
${buildBody(data)}
    <footer class="flyer-footer">${escHtml(data.business_name)} · Powered by WhatsApp</footer>
  </main>
</body>
</html>`;
}

export function exportPrintCSS(): string {
  return `@media print {
  /* Layout */
  body { max-width: 100%; margin: 0; background: #fff; color: #000; }
  .flyer { page-break-inside: avoid; }

  /* Bleed and safe zone */
  @page {
    margin: 10mm;
    bleed: 3mm;
    marks: crop cross;
  }

  /* Remove sticky/fixed positioning */
  * { position: static !important; }

  /* Expand all sections — no overflow clipping */
  .section-a,
  .section-c,
  .section-t,
  .section-i,
  .section-o,
  .section-n { overflow: visible !important; height: auto !important; }

  /* Disable animations and transitions */
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
  }

  /* Preserve accent colour on print (requires -webkit-print-color-adjust) */
  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }

  /* Section O promo box: visible border fallback for greyscale printers */
  .section-o { border: 2px solid #000; }

  /* Hide CTAs and external links on paper */
  .section-n__cta { display: block; border: 2px solid #000; color: #000; background: transparent; }
  .section-n__item a { color: #000; }

  /* Footer: force display */
  .flyer-footer { display: block !important; border-top: 1px solid #ccc; }
}`;
}

// ─── Browser-only stubs ───────────────────────────────────────────────────────

export function exportJPG(): never {
  throw new Error("JPG export requires browser environment");
}

export function exportPDF(): never {
  throw new Error("PDF export requires browser environment");
}
