// universal_flyer_system v1.0.0 · input_sanitization.ts
// Responsibility: Sanitize raw user input before it reaches the generation pipeline
// SAFE TO EDIT: field-level helpers, dropped-reason messages
// DO NOT MODIFY: sanitizeFlyerInput signature, SanitizationResult shape

import type { FlyerData, NicheType } from "./niche_defaults.config";
import { PLACEHOLDER_SCHEMA } from "./placeholders.config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SanitizationResult {
  data: Partial<FlyerData>;
  niche: NicheType | undefined;
  dropped: { field: string; reason: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function toHumanDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Normalises promo_expiry.
 * - Valid future date  →  human format "31 Dec 2025"
 * - Not parseable / past date  →  passed through unchanged
 * Never throws.
 */
function sanitizePromoExpiry(value: string): string {
  const trimmed = value.trim();
  const ts = Date.parse(trimmed);
  if (!isNaN(ts) && ts > Date.now()) {
    return toHumanDate(new Date(ts));
  }
  return trimmed;
}

// ─── Main sanitizer ───────────────────────────────────────────────────────────

export function sanitizeFlyerInput(
  raw: Record<string, unknown>
): SanitizationResult {
  const out: Record<string, unknown> = {};
  let niche: NicheType | undefined;
  const dropped: { field: string; reason: string }[] = [];

  for (const [key, config] of Object.entries(PLACEHOLDER_SCHEMA)) {
    const rawValue = raw[key];
    if (rawValue === undefined || rawValue === null || rawValue === "") continue;

    // ── niche (enum) ──────────────────────────────────────────────────────────
    if (key === "niche") {
      const v = String(rawValue).trim().toLowerCase();
      if (config.pattern && !config.pattern.test(v)) {
        dropped.push({ field: "niche", reason: `Unknown niche: "${v}"` });
      } else {
        niche = v as NicheType;
      }
      continue;
    }

    const field = key as keyof FlyerData;

    switch (config.type) {
      case "string": {
        const str = String(rawValue).trim();
        out[field] =
          field === "promo_expiry"
            ? sanitizePromoExpiry(str)
            : str.slice(0, config.maxLength);
        break;
      }

      case "url":
      case "tel": {
        const str = String(rawValue).trim();
        if (config.pattern && !config.pattern.test(str)) {
          dropped.push({ field, reason: `Invalid format for "${field}"` });
        } else {
          out[field] = str.slice(0, config.maxLength);
        }
        break;
      }

      case "rating": {
        const n = Number(rawValue);
        if (isNaN(n) || n < 1 || n > 5) {
          dropped.push({ field, reason: `"${field}" must be 1–5, got "${rawValue}"` });
        } else {
          out[field] = Math.round(Math.min(5, Math.max(1, n)));
        }
        break;
      }

      case "number": {
        const n = Number(rawValue);
        if (isNaN(n)) {
          dropped.push({ field, reason: `"${field}" must be a number` });
        } else {
          out[field] = n;
        }
        break;
      }

      default: {
        out[field] = String(rawValue ?? "").trim().slice(0, config.maxLength);
      }
    }
  }

  return { data: out as Partial<FlyerData>, niche, dropped };
}
