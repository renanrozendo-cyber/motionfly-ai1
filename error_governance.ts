// universal_flyer_system v1.0.0 · error_governance.ts
// Responsibility: Post-pipeline error classification, auto-correction for fix/fallback
//   severity issues, and field-constraint validation after adaptation.
// SAFE TO EDIT: severity assignments, ERROR_MAP action strings, date detection patterns
// DO NOT MODIFY: applyErrorGovernance signature, ErrorReport shape, ERROR_MAP keys

import { PLACEHOLDER_SCHEMA } from "./placeholders.config";
import { NICHE_DEFAULTS } from "./niche_defaults.config";
import type { FlyerData, NicheType } from "./niche_defaults.config";
import { validateHeadline } from "./content_governance";
import { getFallbackImage } from "./asset_governance";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ErrorSeverity = "block" | "warn" | "fix" | "fallback";

export interface ErrorReport {
  field: string;
  errorType: string;
  severity: ErrorSeverity;
  action: string;
  resolvedValue?: unknown;
}

interface ErrorMapEntry {
  severity: ErrorSeverity;
  action: string;
}

// ─── Error map ────────────────────────────────────────────────────────────────

export const ERROR_MAP: Record<string, ErrorMapEntry> = {
  missing_hero: {
    severity: "fallback",
    action: "Replaced with niche fallback image",
  },
  invalid_whatsapp: {
    severity: "block",
    action: "Cannot render CTA without valid number",
  },
  weak_headline: {
    severity: "warn",
    action: "Headline fails content governance — user copy retained",
  },
  missing_offer: {
    severity: "fallback",
    action: "Replaced with niche default offer",
  },
  oversized_copy: {
    severity: "fix",
    action: "Truncated to maxLength, appended …",
  },
  missing_theme: {
    severity: "block",
    action: "Cannot render without theme CSS",
  },
  undefined_field: {
    severity: "fallback",
    action: "Resolved via niche default → system default",
  },
  empty_business_name: {
    severity: "block",
    action: "business_name is required",
  },
  invalid_promo_date: {
    severity: "fix",
    action: "Invalid date cleared — OfferSection will hide",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WHATSAPP_PATTERN = /^\+?[\d\s\-()​]{7,20}$/;

// Matches strings that are clearly attempting a date format but may be invalid
const DATE_ATTEMPT_PATTERN =
  /^\d{4}-\d{2}-\d{2}$|^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/;

function isValidDate(value: string): boolean {
  const d = new Date(value);
  return !isNaN(d.getTime());
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function truncate(value: string, maxLength: number): string {
  return value.slice(0, maxLength - 1) + "…";
}

// ─── Individual checks ────────────────────────────────────────────────────────
// Each check mutates `d` in place for fix/fallback cases and pushes to errors.

function checkUndefinedFields(
  d: FlyerData,
  niche: NicheType,
  errors: ErrorReport[]
): void {
  const defaults = NICHE_DEFAULTS[niche];
  const systemDefaults: Partial<Record<keyof FlyerData, unknown>> = {
    testimonial_rating: 5,
  };

  for (const key of Object.keys(defaults) as (keyof FlyerData)[]) {
    if (d[key] === undefined || d[key] === null) {
      const nicheVal = defaults[key];
      const resolved =
        nicheVal !== undefined && nicheVal !== null
          ? nicheVal
          : (systemDefaults[key] ?? "");
      (d as unknown as Record<string, unknown>)[key] = resolved;
      errors.push({
        field: key,
        errorType: "undefined_field",
        severity: ERROR_MAP.undefined_field.severity,
        action: ERROR_MAP.undefined_field.action,
        resolvedValue: resolved,
      });
    }
  }
}

function checkEmptyBusinessName(d: FlyerData, errors: ErrorReport[]): void {
  if (String(d.business_name ?? "").trim() === "") {
    errors.push({
      field: "business_name",
      errorType: "empty_business_name",
      severity: ERROR_MAP.empty_business_name.severity,
      action: ERROR_MAP.empty_business_name.action,
    });
  }
}

function checkWhatsapp(d: FlyerData, errors: ErrorReport[]): void {
  const value = String(d.whatsapp_number ?? "").trim();
  if (value !== "" && !WHATSAPP_PATTERN.test(value)) {
    errors.push({
      field: "whatsapp_number",
      errorType: "invalid_whatsapp",
      severity: ERROR_MAP.invalid_whatsapp.severity,
      action: ERROR_MAP.invalid_whatsapp.action,
    });
  }
}

function checkMissingHero(
  d: FlyerData,
  niche: NicheType,
  errors: ErrorReport[]
): void {
  const value = String(d.hero_image ?? "").trim();
  if (value === "" || !isValidHttpUrl(value)) {
    const resolved = getFallbackImage(niche);
    d.hero_image = resolved;
    errors.push({
      field: "hero_image",
      errorType: "missing_hero",
      severity: ERROR_MAP.missing_hero.severity,
      action: ERROR_MAP.missing_hero.action,
      resolvedValue: resolved,
    });
  }
}

function checkWeakHeadline(d: FlyerData, errors: ErrorReport[]): void {
  const value = String(d.headline ?? "").trim();
  if (value === "") return;
  const result = validateHeadline(value);
  if (!result.pass) {
    errors.push({
      field: "headline",
      errorType: "weak_headline",
      severity: ERROR_MAP.weak_headline.severity,
      action: ERROR_MAP.weak_headline.action,
    });
  }
}

function checkMissingOffers(
  d: FlyerData,
  niche: NicheType,
  errors: ErrorReport[]
): void {
  const defaults = NICHE_DEFAULTS[niche];
  const offerFields = ["offer_1", "offer_2", "offer_3"] as const;

  for (const field of offerFields) {
    if (String(d[field] ?? "").trim() === "") {
      const resolved = defaults[field];
      d[field] = resolved;
      errors.push({
        field,
        errorType: "missing_offer",
        severity: ERROR_MAP.missing_offer.severity,
        action: ERROR_MAP.missing_offer.action,
        resolvedValue: resolved,
      });
    }
  }
}

function checkOversizedCopy(d: FlyerData, errors: ErrorReport[]): void {
  for (const [key, config] of Object.entries(PLACEHOLDER_SCHEMA)) {
    if (key === "niche" || config.type === "rating") continue;

    const field = key as keyof FlyerData;
    const value = String(d[field] ?? "");

    if (value.length > config.maxLength) {
      const resolved = truncate(value, config.maxLength);
      (d as unknown as Record<string, unknown>)[field] = resolved;
      errors.push({
        field,
        errorType: "oversized_copy",
        severity: ERROR_MAP.oversized_copy.severity,
        action: ERROR_MAP.oversized_copy.action,
        resolvedValue: resolved,
      });
    }
  }
}

function checkPromoDate(d: FlyerData, errors: ErrorReport[]): void {
  const value = String(d.promo_expiry ?? "").trim();
  if (value === "") return;
  if (DATE_ATTEMPT_PATTERN.test(value) && !isValidDate(value)) {
    d.promo_expiry = "";
    errors.push({
      field: "promo_expiry",
      errorType: "invalid_promo_date",
      severity: ERROR_MAP.invalid_promo_date.severity,
      action: ERROR_MAP.invalid_promo_date.action,
      resolvedValue: "",
    });
  }
}

const VALID_NICHES = new Set<string>([
  "food",
  "beauty",
  "education",
  "services",
  "luxury",
]);

function checkMissingTheme(niche: NicheType, errors: ErrorReport[]): void {
  if (!VALID_NICHES.has(niche)) {
    errors.push({
      field: "niche",
      errorType: "missing_theme",
      severity: ERROR_MAP.missing_theme.severity,
      action: ERROR_MAP.missing_theme.action,
    });
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function applyErrorGovernance(
  data: FlyerData,
  niche: NicheType
): { data: FlyerData; errors: ErrorReport[] } {
  const d: FlyerData = { ...data };
  const errors: ErrorReport[] = [];

  checkUndefinedFields(d, niche, errors);
  checkEmptyBusinessName(d, errors);
  checkWhatsapp(d, errors);
  checkMissingHero(d, niche, errors);
  checkWeakHeadline(d, errors);
  checkMissingOffers(d, niche, errors);
  checkOversizedCopy(d, errors);
  checkPromoDate(d, errors);
  checkMissingTheme(niche, errors);

  return { data: d, errors };
}
