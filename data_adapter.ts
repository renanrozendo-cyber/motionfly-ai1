// universal_flyer_system v1.0.0 · data_adapter.ts
// Responsibility: Merge sanitised Partial<FlyerData> with niche defaults to produce
//   a complete, render-ready FlyerData. Guarantees required fields. Resolves asset fallbacks.
// SAFE TO EDIT: FALLBACK_BUSINESS_NAME, FALLBACK_WHATSAPP, hero fallback logic
// DO NOT MODIFY: adaptFlyerData signature, AdapterResult shape, merge spread order

import { getDefaults } from "./niche_defaults.config";
import type { FlyerData, NicheType } from "./niche_defaults.config";
import { validateHeroImage, getFallbackImage } from "./asset_governance";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdapterResult {
  data: FlyerData;
  assetWarnings: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FALLBACK_BUSINESS_NAME = "Your Business";
// Must be a valid E.164-style number — prevents a broken wa.me URL on first load
const FALLBACK_WHATSAPP = "+919999999999";

// ─── Adapter ──────────────────────────────────────────────────────────────────

export function adaptFlyerData(
  partial: Partial<FlyerData>,
  niche: NicheType
): AdapterResult {
  const defaults = getDefaults(niche);

  // Invariant: user-supplied data always overrides niche defaults — spread order is fixed
  const merged: FlyerData = { ...defaults, ...partial };

  // Invariant: business_name and whatsapp_number must always be non-empty before render
  if (!merged.business_name.trim()) {
    merged.business_name = FALLBACK_BUSINESS_NAME;
  }
  if (!merged.whatsapp_number.trim()) {
    merged.whatsapp_number = FALLBACK_WHATSAPP;
  }

  // Asset governance: invalid or placeholder hero images fall back to the niche default
  const assetWarnings: string[] = [];
  const heroResult = validateHeroImage(merged.hero_image);
  if (!heroResult.pass) {
    assetWarnings.push(...heroResult.warnings);
    merged.hero_image = getFallbackImage(niche);
  } else if (heroResult.warnings.length > 0) {
    assetWarnings.push(...heroResult.warnings);
  }

  return { data: merged, assetWarnings };
}
