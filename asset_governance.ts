// universal_flyer_system v1.0.0 · asset_governance.ts
// Responsibility: URL validators for images + fallback resolution per niche
// SAFE TO EDIT: KNOWN_PLACEHOLDER_HOSTS list, ASSET_RULES docs
// DO NOT MODIFY: function signatures, AssetValidationResult shape

import { NICHE_DEFAULTS } from "./niche_defaults.config";
import type { NicheType } from "./niche_defaults.config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AssetValidationResult {
  pass: boolean;
  warnings: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const ASSET_RULES = {
  heroImage: {
    minWidth: 1080,
    minHeight: 720,
    aspectRatio: "3:2 or 16:9 preferred",
    maxFileSizeKB: 2048,
    formats: ["jpg", "jpeg", "webp", "png"],
    contentGuidelines: [
      "Show the product, service, or business environment — not a generic stock photo",
      "No watermarks or third-party branding visible",
      "Bright, well-lit, high-contrast — optimised for WhatsApp preview thumbnails",
      "Avoid text-heavy images: headline and CTA render as an overlay",
      "Food: close-up plating shot or overhead flat-lay, warm tones",
      "Beauty: before/after or treatment-in-progress, clean background",
      "Education: students engaged with learning materials, not empty desks",
      "Services: technician on-site with tools in hand, not a logo",
      "Luxury: product on neutral/dark surface, controlled studio lighting",
    ],
  },
  galleryImage: {
    minWidth: 800,
    minHeight: 600,
    aspectRatio: "1:1 or 4:3 preferred for grid layouts",
    maxFileSizeKB: 1024,
    formats: ["jpg", "jpeg", "webp", "png"],
    contentGuidelines: [
      "Show the actual product, menu item, or service outcome",
      "Consistent lighting and colour temperature across all gallery images",
      "No duplicates or near-duplicates within the same flyer",
      "Each image should tell a different part of the business story",
    ],
  },
  logo: {
    preferredFormat: "PNG with transparent background",
    minWidth: 200,
    contentGuidelines: [
      "Must be legible on both dark and light backgrounds",
      "Avoid heavy drop shadows — they degrade on dark flyer themes",
      "Square or near-square crop: logo container is always 1:1",
    ],
  },
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

const KNOWN_PLACEHOLDER_HOSTS = [
  "via.placeholder.com",
  "placeholder.com",
  "dummyimage.com",
  "lorempixel.com",
  "fakeimg.pl",
  "placeholdit.imgix.net",
  "placehold.co",
  "placeimg.com",
];

const PLACEHOLDER_URL_PATTERNS = [
  /\/placeholder[-_]?(image)?/i,
  /sample[-_]image/i,
  /test[-_]image/i,
  /dummy[-_]image/i,
];

const SUPPORTED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "webp", "png", "gif", "avif"];

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isKnownPlaceholder(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (KNOWN_PLACEHOLDER_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
      return true;
    }
    return PLACEHOLDER_URL_PATTERNS.some((p) => p.test(parsed.pathname));
  } catch {
    return false;
  }
}

function getExtension(url: string): string | undefined {
  return url.split("?")[0].split(".").pop()?.toLowerCase();
}

// ─── Validators ───────────────────────────────────────────────────────────────

export function validateHeroImage(url: string): AssetValidationResult {
  const warnings: string[] = [];

  if (!url || url.trim() === "") {
    return {
      pass: false,
      warnings: ["Hero image URL is empty. A strong visual is required for flyer effectiveness."],
    };
  }

  const t = url.trim();

  if (!isValidHttpUrl(t)) {
    return { pass: false, warnings: ["Hero image URL is not a valid http/https URL."] };
  }

  if (isKnownPlaceholder(t)) {
    return {
      pass: false,
      warnings: [
        "Hero image points to a placeholder service. Replace with a real business photo before publishing.",
      ],
    };
  }

  const ext = getExtension(t);
  if (ext && !SUPPORTED_IMAGE_EXTENSIONS.includes(ext)) {
    warnings.push(
      `File extension ".${ext}" may not render reliably. Prefer jpg, jpeg, webp, or png.`
    );
  }

  return { pass: true, warnings };
}

export function getFallbackImage(niche: NicheType): string {
  return NICHE_DEFAULTS[niche].hero_image;
}

export function validateGalleryImage(url: string): AssetValidationResult {
  const warnings: string[] = [];

  if (!url || url.trim() === "") {
    return { pass: false, warnings: ["Gallery image URL is empty."] };
  }

  const t = url.trim();

  if (!isValidHttpUrl(t)) {
    return { pass: false, warnings: ["Gallery image URL is not a valid http/https URL."] };
  }

  if (isKnownPlaceholder(t)) {
    return {
      pass: false,
      warnings: [
        "Gallery image points to a placeholder service. Replace with an actual photo of your product or service.",
      ],
    };
  }

  const ext = getExtension(t);
  if (ext && !SUPPORTED_IMAGE_EXTENSIONS.includes(ext)) {
    warnings.push(
      `File extension ".${ext}" may not render reliably in gallery layouts. Prefer jpg, jpeg, webp, or png.`
    );
  }

  return { pass: true, warnings };
}
