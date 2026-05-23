# UniversalFlyer Component — Claude Code Reference

## §1 System Snapshot

### File Structure
```
components/
  universal-flyer.tsx      # Main component (A.C.T.I.O.N sections)
  ui/
    card.tsx               # Card, CardContent
    badge.tsx              # Badge
    button.tsx             # Button
    avatar.tsx             # Avatar, AvatarFallback, AvatarImage

app/
  page.tsx                 # Demo page rendering UniversalFlyer
  layout.tsx               # Root layout with Google Fonts
  globals.css              # Tailwind CSS v4 config
```

### FlyerConfig Interface
```typescript
interface FlyerData {
  logo?: string;                    // Business logo URL
  business_name: string;            // Required - displays in hero
  headline?: string;                // Hero headline
  subheadline?: string;             // Hero subheadline
  hero_image?: string;              // Hero background image URL
  trust_badge_1?: string;           // Credibility badge 1
  trust_badge_2?: string;           // Credibility badge 2
  trust_badge_3?: string;           // Credibility badge 3
  testimonial_quote?: string;       // Customer testimonial text
  testimonial_author?: string;      // Testimonial author name
  testimonial_rating?: number;      // Star rating (1-5)
  offer_1?: string;                 // Offer card 1 title
  offer_1_desc?: string;            // Offer card 1 description
  offer_1_price?: string;           // Offer card 1 price
  offer_2?: string;                 // Offer card 2 title
  offer_2_desc?: string;            // Offer card 2 description
  offer_2_price?: string;           // Offer card 2 price
  offer_3?: string;                 // Offer card 3 title
  offer_3_desc?: string;            // Offer card 3 description
  offer_3_price?: string;           // Offer card 3 price
  promo_offer?: string;             // Promotional offer headline
  promo_expiry?: string;            // Promo expiry text
  promo_code?: string;              // Copyable promo code
  cta_label?: string;               // WhatsApp button text
  whatsapp_number: string;          // Required - WhatsApp number
  phone_number?: string;            // Optional phone for tel: link
  location?: string;                // Business location text
  maps_link?: string;               // Google Maps URL override
}

interface FlyerConfig {
  niche: "food" | "beauty" | "education" | "services" | "luxury";
  data?: Partial<FlyerData>;
}
```

### Theme Tokens (11 per niche)
```
--color-primary       # Primary brand color
--color-accent        # Accent/highlight color
--color-bg            # Page background
--color-surface       # Card/section background
--color-text-on-primary   # Text on primary color
--color-text-primary      # Main text color
--color-text-muted        # Secondary text color
--font-display        # Heading font stack
--font-body           # Body font stack
--radius-brand        # Border radius
--spacing-section     # Section padding
```

---

## §2 Quick Start

### Switch Niche
```tsx
// In app/page.tsx or your page component:
import UniversalFlyer from "@/components/universal-flyer";

// Change niche prop to any of: "food" | "beauty" | "education" | "services" | "luxury"
<UniversalFlyer niche="beauty" />
```

### Update Defaults
```tsx
// Pass custom data to override niche defaults:
<UniversalFlyer
  niche="food"
  data={{
    business_name: "Mama's Kitchen",
    whatsapp_number: "+91 98765 43210",
    headline: "Taste the Love in Every Bite",
    promo_code: "MAMA20",
  }}
/>
```

### Run Preview
```bash
pnpm dev
# Open http://localhost:3000
```

### Export for WhatsApp
1. View flyer in browser at 1080px width
2. Screenshot or use browser "Save as PDF"
3. Share via WhatsApp as image/PDF

---

## §3 Debug Runbook

### Scenario 1: Theme Colors Not Applying
**SYMPTOM**: Flyer renders but uses wrong/default colors, or colors don't change when switching niche.

**DIAGNOSIS**: CSS custom properties not being set on document.documentElement.

**EXACT FIX**:
1. Check `useEffect` in UniversalFlyer runs on niche change
2. Verify `NICHE_THEMES[niche]` exists and has all 11 tokens
3. Confirm JSX uses `style={{ color: "var(--color-primary)" }}` not hardcoded hex
4. Check browser DevTools → Elements → html element → look for inline style properties

### Scenario 2: OfferSection Shows When It Shouldn't
**SYMPTOM**: Empty promo strip appears when no promo data is provided.

**DIAGNOSIS**: Null check in OfferSection not catching all empty states.

**EXACT FIX**:
1. Open `components/universal-flyer.tsx`
2. Find `OfferSection` function
3. Verify condition: `if (!data.promo_offer && !data.promo_expiry && !data.promo_code) return null;`
4. Ensure it returns literal `null`, not `<></>` or hidden div

### Scenario 3: WhatsApp Link Opens Wrong Number
**SYMPTOM**: Clicking WhatsApp button opens chat with wrong/invalid number.

**DIAGNOSIS**: WhatsApp number not sanitized — contains spaces, dashes, or country code format issues.

**EXACT FIX**:
1. Find `stripNonDigits` helper function
2. Verify it uses: `str.replace(/\D/g, "")`
3. Check `NextStepSection` calls `stripNonDigits(data.whatsapp_number)` before building URL
4. Test with number like "+91 98765-43210" → should become "919876543210"

### Scenario 4: Fonts Not Loading
**SYMPTOM**: Headings/body text fall back to system fonts instead of niche fonts.

**DIAGNOSIS**: Google Fonts not imported in layout.tsx or CSS variables not set.

**EXACT FIX**:
1. Check `app/layout.tsx` imports required fonts from `next/font/google`
2. Verify font variables are applied to `<html>` element: `className={...fontVar.variable}`
3. Check `app/globals.css` has `@theme inline { --font-sans: ... }`
4. Verify theme's `--font-display` value matches actual font family name

### Scenario 5: Sticky CTA Overlaps Content / Fixed in Wrong Position
**SYMPTOM**: WhatsApp button covers content, scrolls with page incorrectly, or doesn't stick at bottom.

**DIAGNOSIS**: Using `position: fixed` instead of `position: sticky`, or missing bottom/z-index.

**EXACT FIX**:
1. Find `NextStepSection` in `components/universal-flyer.tsx`
2. Verify className includes: `sticky bottom-0 z-50`
3. NOT `fixed` — sticky works better in iframe/preview contexts
4. Ensure parent container has `pb-24` to prevent content from being hidden behind sticky footer

---

## §4 Hand Off to Claude Code — Phase 2 Files

When extending this system, Claude Code should generate these 12 files:

```
1.  lib/flyer-generator.ts         # Server action to generate flyer from form data
2.  lib/flyer-validator.ts         # Zod schema for FlyerConfig validation
3.  lib/flyer-export.ts            # Export to PNG/PDF using html2canvas or similar
4.  components/flyer-editor.tsx    # Live editor UI with form inputs
5.  components/flyer-preview.tsx   # Real-time preview container
6.  components/niche-selector.tsx  # Niche selection cards with previews
7.  components/color-picker.tsx    # Theme customization color picker
8.  app/create/page.tsx            # Main flyer creation page
9.  app/api/flyer/route.ts         # API endpoint for flyer generation
10. app/api/export/route.ts        # API endpoint for PDF/image export
11. hooks/use-flyer-state.ts       # State management for editor
12. types/flyer.ts                 # Shared TypeScript types (extract from component)
```

---

## §5 Production Checklist

Before sharing any flyer, verify these 5 binary checks:

| # | Check | How to Verify |
|---|-------|---------------|
| 1 | WhatsApp number is valid | Click CTA → WhatsApp opens correct chat |
| 2 | All text is readable | Hero headline visible on image background |
| 3 | Promo code copies | Click code → paste elsewhere → matches |
| 4 | Links work | Phone link calls, location link opens maps |
| 5 | Mobile responsive | View at 375px width → no horizontal scroll, buttons tappable |

### Pre-Share Validation Script
```typescript
function validateFlyer(config: FlyerConfig): string[] {
  const errors: string[] = [];
  const data = config.data || {};
  
  // Check required fields
  if (!data.business_name) errors.push("Missing business_name");
  if (!data.whatsapp_number) errors.push("Missing whatsapp_number");
  
  // Validate WhatsApp number format
  const digits = (data.whatsapp_number || "").replace(/\D/g, "");
  if (digits.length < 10) errors.push("WhatsApp number too short");
  
  // Check niche is valid
  const validNiches = ["food", "beauty", "education", "services", "luxury"];
  if (!validNiches.includes(config.niche)) {
    errors.push(`Invalid niche: ${config.niche}`);
  }
  
  return errors;
}
```

---

## §6 Architecture Decisions

### Error severity collapse at the pipeline boundary

`error_governance.ts` uses four severity levels internally:

| Severity   | Meaning |
|------------|---------|
| `block`    | Cannot render — missing required data with no safe substitute |
| `warn`     | Render proceeds, user copy retained, quality issue noted |
| `fix`      | Value exceeded a hard constraint — truncated automatically |
| `fallback` | Value was absent or invalid — substituted with niche/system default |

When `applyErrorGovernance` reports are folded into the pipeline (`render_pipeline.ts` Step 8), these collapse to two:

```
block           → "blocking"   (stops render, sets ready: false)
warn / fix / fallback → "warning"    (render proceeds)
```

**Why this is intentional:** The render pipeline's consumer (`RenderPayload`) only needs a binary stop/proceed signal. Distinguishing `fix` from `fallback` is governance-layer detail, not render-layer concern.

**Known gap:** A `RenderError` with `severity: "warning"` can mean three different things — content quality issue (`warn`), auto-truncation (`fix`), or fallback substitution (`fallback`). **The distinction is preserved in `ErrorReport` (returned by `applyErrorGovernance`) but is lost in `RenderError` (stored in `RenderPayload.errors`).** If you build a user-facing audit trail or export manifest that needs to show *why* a field changed, read from `ErrorReport[]` directly rather than from `RenderPayload.errors`. The full four-severity report is available there before the collapse.

---

## §7 Known Gaps & Production Prerequisites

### Gap 1 — data_adapter.ts accepts Partial\<FlyerData\> objects only

`adaptFlyerData(partial, niche)` takes a `Partial<FlyerData>` object that has already been normalised by `sanitizeFlyerInput`. It has no CSV parser, no `FormData` reader, and no multi-source detection. The current input path is:

```
Record<string, unknown>   →  sanitizeFlyerInput()  →  Partial<FlyerData>  →  adaptFlyerData()
```

`renderBatch()` in `render_pipeline.ts` iterates over `Record<string, unknown>[]` and calls `renderSingle` on each item — it processes objects in memory, not CSV rows or HTTP form payloads. **For batch generation from a spreadsheet, CSV file, or form submission, a parsing layer upstream of `sanitizeFlyerInput` must be added.** This is a planned Phase 2 concern (`lib/flyer-generator.ts`), not something data_adapter handles today.

---

### Gap 2 — promo_expiry is type "string", not "date"

`promo_expiry` is declared as `string` in both `FlyerData` (niche_defaults.config.ts) and `PLACEHOLDER_SCHEMA` (placeholders.config.ts). The `"date"` type exists in the `PlaceholderConfig` union but is not assigned to this field.

**Sanitization behaviour** (`input_sanitization.ts → sanitizePromoExpiry`):
- If the raw value parses as a valid **future** date via `Date.parse()`, it is converted to human-readable format: `"31 Dec 2025"`.
- If the value is not parseable or is a past date, it is passed through unchanged (e.g. `"This week only"`, `"Limited seats available"`).
- The function never throws — all date parsing failures fall back to the raw trimmed string.

**Error governance** (`error_governance.ts → checkPromoDate`) adds a second layer: if a string matches a date-shaped pattern (`DATE_ATTEMPT_PATTERN`: `YYYY-MM-DD` or `D/M/YY` style) **but fails `Date.parse`**, the field is cleared to `""` and `OfferSection` hides. Plain prose values like `"This week only"` do not match the pattern and are left intact.

**Implication:** `promo_expiry` legitimately holds either a formatted date string or arbitrary descriptive text. Do not coerce it to a `Date` object downstream — treat it as display copy.

---

### Gap 3 — Local hero placeholder images do not exist on disk

`niche_defaults.config.ts` currently uses external Unsplash CDN URLs as fallback hero images (e.g. `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&q=80`). `asset_governance.ts → getFallbackImage()` returns these same URLs.

For a production deployment that is offline-capable or does not depend on a third-party CDN, local placeholder files are required. The expected paths follow the pattern:

```
/assets/placeholders/food-warm.jpg
/assets/placeholders/beauty-warm.jpg
/assets/placeholders/education-warm.jpg
/assets/placeholders/services-warm.jpg
/assets/placeholders/luxury-warm.jpg
```

**None of these files exist on disk yet.** Before switching `NICHE_DEFAULTS[niche].hero_image` entries to local paths, the image assets must be created and placed in the `public/assets/placeholders/` directory. Until that prerequisite is met, keep the Unsplash URLs in place — removing them without local replacements will leave the flyer hero blank when `validateHeroImage` rejects a user-supplied URL and the fallback is invoked.
