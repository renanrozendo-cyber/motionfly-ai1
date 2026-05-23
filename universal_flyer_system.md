# Universal Flyer System — Technical Reference
# Documents the implemented system in core/ + components/universal-flyer.tsx
# Last updated: 2026-05-12

---

## §1 System Overview

The Universal Flyer System generates WhatsApp-shareable business flyers for five niches
(food, beauty, education, services, luxury) from a typed data object. The output is a
structured React component or an exported HTML artifact — not an image at generation time.

**Design centre:** Every field has a niche default. A caller needs only a business name and
a WhatsApp number to get a complete, render-ready flyer. Everything else degrades gracefully
to the niche default.

**Pipeline summary:**

```
raw Record<string,unknown>
  → sanitizeFlyerInput()         # type-coerce, pattern-validate, drop bad fields
  → adaptFlyerData()             # merge with niche defaults, enforce required fields, asset fallback
  → runContentQA()               # copy quality validators, non-blocking
  → applyErrorGovernance()       # auto-fix/fallback remaining issues, classify remainder
  → resolveActiveSections()      # gate Section O when all promo fields empty
  → RenderPayload                # render-ready, with errors[], ready flag, exportReady flag
```

The pipeline is **non-throwing**. Every step accumulates errors into `RenderPayload.errors`
instead of raising. A `ready: false` payload has at least one `severity: "blocking"` error.

**Sections rendered (always in this order):**

| Letter | Name        | Always rendered? |
|--------|-------------|-----------------|
| A      | Attention   | Yes (locked)    |
| C      | Credibility | Yes             |
| T      | Trust       | Yes             |
| I      | Information | Yes             |
| O      | Offer       | Only when ≥1 promo field non-empty |
| N      | Next Step   | Yes (locked)    |

---

## §2 Module Map & Dependency Graph

```
components/
  universal-flyer.tsx          Client component. Owns rendering, theming, animation.

core/
  niche_defaults.config.ts     FlyerData type, NicheType, NICHE_DEFAULTS, getDefaults()
  placeholders.config.ts       PLACEHOLDER_SCHEMA — field registry (types, tiers, patterns)
  action_framework.ts          ACTION_FRAMEWORK, SECTION_ORDER, STRUCTURAL_INVARIANTS
  input_sanitization.ts        sanitizeFlyerInput(), sanitizePromoExpiry()
  data_adapter.ts              adaptFlyerData() — merges partial with defaults
  content_governance.ts        Validators, COPY_FORMULAS, FORBIDDEN_PATTERNS, runContentQA()
  asset_governance.ts          validateHeroImage(), getFallbackImage(), ASSET_RULES
  error_governance.ts          ERROR_MAP, applyErrorGovernance(), ErrorReport
  render_pipeline.ts           runRenderPipeline(), renderSingle(), renderBatch(), renderPreview()
  export_engine.ts             exportHTML(), exportOfflineHTML(), exportOGMeta(), exportPrintCSS()
  niche_copy_bank.ts           NICHE_COPY_BANK, getRandomCopy()
```

**Import dependency graph (no cycles):**

```
niche_defaults.config.ts      ← (no core imports)
placeholders.config.ts        ← niche_defaults.config.ts
action_framework.ts           ← (no core imports)
content_governance.ts         ← niche_defaults.config.ts
asset_governance.ts           ← niche_defaults.config.ts
input_sanitization.ts         ← niche_defaults.config.ts, placeholders.config.ts
data_adapter.ts               ← niche_defaults.config.ts, asset_governance.ts
error_governance.ts           ← placeholders.config.ts, niche_defaults.config.ts,
                                 content_governance.ts, asset_governance.ts
render_pipeline.ts            ← input_sanitization.ts, data_adapter.ts,
                                 content_governance.ts, action_framework.ts,
                                 niche_defaults.config.ts, error_governance.ts
export_engine.ts              ← asset_governance.ts, niche_defaults.config.ts
niche_copy_bank.ts            ← niche_defaults.config.ts
```

`universal-flyer.tsx` does **not** import from `core/`. It carries its own inline
`NICHE_DEFAULTS` and `NICHE_THEMES`. See §20 Known Gaps for the implications.

---

## §3 FlyerData Schema

Canonical definition in `core/niche_defaults.config.ts`. All fields are non-optional in
this interface — every field has a value in `NICHE_DEFAULTS`. Callers pass
`Partial<FlyerData>` into the pipeline; the adapter fills the rest.

```typescript
export interface FlyerData {
  // Section A — Attention
  logo:                string;   // URL or "" — shown as circular avatar top-left of hero
  business_name:       string;   // Required. Shown in hero and exported HTML title.
  headline:            string;   // Hero headline — ≤60 chars, active voice
  subheadline:         string;   // Hero subheadline — ≤100 chars
  hero_image:          string;   // https URL. Falls back to niche default if invalid.

  // Section C — Credibility
  trust_badge_1:       string;   // Badge text ≤40 chars
  trust_badge_2:       string;
  trust_badge_3:       string;

  // Section T — Trust
  testimonial_quote:   string;   // ≤120 chars (WhatsApp preview limit)
  testimonial_author:  string;   // ≤60 chars
  testimonial_rating:  number;   // 1–5, clamped and rounded by sanitizer

  // Section I — Information
  offer_1:             string;   // Offer card title ≤60 chars
  offer_1_desc:        string;   // ≤80 chars — outcome language, not feature lists
  offer_1_price:       string;   // ≤30 chars — displayed as-is
  offer_2:             string;
  offer_2_desc:        string;
  offer_2_price:       string;
  offer_3:             string;
  offer_3_desc:        string;
  offer_3_price:       string;

  // Section O — Offer
  promo_offer:         string;   // Promo headline ≤80 chars
  promo_expiry:        string;   // String, not date — see §9 for sanitization behaviour
  promo_code:          string;   // ≤20 chars, pattern /^[A-Z0-9]{3,20}$/

  // Section N — Next Step
  cta_label:           string;   // ≤60 chars, starts with approved action verb
  whatsapp_number:     string;   // Required. E.164-style. Sanitized before wa.me URL.
  phone_number:        string;   // Optional tel: link — "" means hidden
  location:            string;   // Display text for location row
  maps_link:           string;   // If set, wraps location text as anchor
}
```

**Field count:** 27 fields + `niche` (enum, not in FlyerData) = 28 entries in PLACEHOLDER_SCHEMA.

**Note on the component interface:** `universal-flyer.tsx` defines its own local `FlyerData`
with all fields marked optional except `business_name` and `whatsapp_number`. This is a
looser type used only within the component. The authoritative schema for the pipeline is
the one above.

---

## §4 NicheType & NICHE_DEFAULTS

```typescript
export type NicheType = "food" | "beauty" | "education" | "services" | "luxury";
```

`NICHE_DEFAULTS` in `core/niche_defaults.config.ts` provides a complete `FlyerData` for
each niche. The adapter uses `getDefaults(niche)` which returns a shallow copy.

### Hero images (current defaults — all external Unsplash CDN URLs)

| Niche       | Unsplash photo ID                         |
|-------------|-------------------------------------------|
| food        | photo-1504674900247-0877df9cc836          |
| beauty      | photo-1560066984-138dadb4c035             |
| education   | photo-1523050854058-8df90110c9f1          |
| services    | photo-1581092921461-eab62e97a780          |
| luxury      | photo-1441986300917-64674bd600d8          |

All URLs use `?w=1080&q=80` query params.

### promo_expiry default values by niche

| Niche       | Default promo_expiry value        | Type at runtime |
|-------------|-----------------------------------|-----------------|
| food        | `"2025-12-31"`                    | Date string → sanitized to `"31 Dec 2025"` |
| beauty      | `"2025-12-31"`                    | Same            |
| education   | `"Limited seats available"`       | Passthrough string |
| services    | `"This week only"`                | Passthrough string |
| luxury      | `"For orders above ₹10,000"`      | Passthrough string |

### Accessor

```typescript
export function getDefaults(niche: NicheType): FlyerData {
  return { ...NICHE_DEFAULTS[niche] };   // shallow copy — safe to mutate
}
```

---

## §5 PLACEHOLDER_SCHEMA — Field Registry

Defined in `core/placeholders.config.ts`. One entry per `keyof FlyerData | "niche"`.

```typescript
export type PlaceholderConfig = {
  type:         "string" | "url" | "tel" | "number" | "rating" | "date" | "enum";
  required:     boolean;
  tier:         1 | 2 | 3;
  section:      "A" | "C" | "T" | "I" | "O" | "N";
  maxLength:    number;
  pattern:      RegExp | null;
  themeWeight:  "display" | "body" | "accent" | "ui";
  fallbackSafe: true;      // constant true on every field
  hasNicheDefault: true;   // constant true on every field
};
```

`fallbackSafe` and `hasNicheDefault` are both `true` on every entry — they function as
documentation markers, not per-field flags.

### Tier assignments

**Tier 1 — Required / Core identity** (3 fields)

| Field            | Type   | Pattern                              |
|------------------|--------|--------------------------------------|
| `niche`          | enum   | `/^(food\|beauty\|education\|services\|luxury)$/` |
| `business_name`  | string | null                                 |
| `whatsapp_number`| tel    | `/^\+?[\d\s\-()​]{7,20}$/`           |

**Tier 2 — Hero visuals + offer titles** (5 fields)

| Field       | Type   | maxLength | Pattern              |
|-------------|--------|-----------|----------------------|
| `headline`  | string | 80        | null                 |
| `hero_image`| url    | 500       | `/^https?:\/\/.+/`   |
| `offer_1`   | string | 60        | null                 |
| `offer_2`   | string | 60        | null                 |
| `offer_3`   | string | 60        | null                 |

**Tier 3 — All remaining fields** (21 fields — see §3 for full list)

Notable tier 3 entries:

| Field              | Type   | maxLength | Pattern                    |
|--------------------|--------|-----------|----------------------------|
| `promo_expiry`     | string | 60        | null                       |
| `promo_code`       | string | 20        | `/^[A-Z0-9]{3,20}$/`       |
| `testimonial_rating` | rating | 1      | `/^[1-5]$/`                |
| `logo`             | url    | 500       | `/^https?:\/\/.+/`         |
| `maps_link`        | url    | 500       | `/^https?:\/\/.+/`         |

`promo_expiry` is type `"string"` — not `"date"`. The `"date"` type exists in the union
but is not assigned to any current field.

---

## §6 A.C.T.I.O.N Framework

Defined in `core/action_framework.ts`. The framework is a registry — it describes the
intended conversion role of each section. Render order is always A→C→T→I→O→N.

```typescript
export const ACTION_FRAMEWORK = [ ... ] as const;
export const SECTION_ORDER = ["A", "C", "T", "I", "O", "N"] as const;
export type SectionLetter = (typeof SECTION_ORDER)[number];
```

### Section registry

| Letter | Name        | KPI                                     | Locked | Key conversion logic |
|--------|-------------|----------------------------------------|--------|----------------------|
| A      | Attention   | Business identity clear within 2s      | true   | Hero dominates. Business name + headline legible on any hero image. |
| C      | Credibility | 3 trust signals visible without scroll | false  | Icons reduce cognitive load. All 3 scannable in <1s. |
| T      | Trust       | Social proof read rate >60%            | false  | Real names + star ratings. Specificity converts. |
| I      | Information | All 3 offers visible in one scroll     | false  | Pricing upfront. Three offers create choice without overwhelm. |
| O      | Offer       | Promo code copy rate >15%              | false  | Urgency via expiry + one-tap copy. **Hides entirely when all three promo fields absent.** |
| N      | Next Step   | WhatsApp tap-through rate >8%          | true   | Sticky. Single primary action only — WhatsApp. Phone and location are secondary. |

**Locked sections (A and N):** Always rendered regardless of data completeness. Their
fields carry fallback values specifically for this reason.

### Placeholders per section

```
A: logo, business_name, headline, subheadline, hero_image
C: trust_badge_1, trust_badge_2, trust_badge_3
T: testimonial_quote, testimonial_author, testimonial_rating
I: offer_1, offer_1_desc, offer_1_price, offer_2, offer_2_desc, offer_2_price,
   offer_3, offer_3_desc, offer_3_price
O: promo_offer, promo_expiry, promo_code
N: cta_label, whatsapp_number, phone_number, location, maps_link
```

---

## §7 Structural Invariants

All 14 invariants are in `core/action_framework.ts → STRUCTURAL_INVARIANTS`. Any change
that violates one requires explicit sign-off and a new invariant entry.

1. Section render order is always A→C→T→I→O→N and must never be reordered.
2. AttentionSection (A) is always rendered — it holds business identity, is the scroll anchor, and carries the hero visual.
3. NextStepSection (N) is always rendered and always positioned `sticky bottom-0 z-50` — it is the conversion goal.
4. OfferSection (O) must return `null` when `promo_offer`, `promo_expiry`, and `promo_code` are all absent — never render an empty promo strip.
5. `mergedData` must always guarantee `business_name` and `whatsapp_number` via fallback values before passing to any section.
6. All theming is applied as CSS custom properties on `document.documentElement` — never hardcode hex values in JSX style props.
7. `NICHE_THEMES` tokens must be removed from `document.documentElement` on component unmount via `useEffect` cleanup to prevent niche bleed.
8. `stripNonDigits()` must sanitize `whatsapp_number` before every `wa.me` URL construction — spaces, dashes, and parentheses must not reach the URL.
9. Parent container must carry `pb-24` to prevent the sticky `NextStepSection` from obscuring the last content section.
10. All section components must use the `fadeUp` variant inside the `staggerContainer` animation — do not introduce new motion variants without updating this registry.
11. User-supplied data always overrides niche defaults — spread order in `mergedData` is always `{ ...defaults, ...data }`, never reversed.
12. `NICHE_DEFAULTS` in `niche_defaults.config.ts` is the authoritative source of defaults — the component must import from there, never define inline defaults.
13. Locked sections (A and N) must always render regardless of data completeness — their fields carry fallback values for this reason.
14. The `whatsapp_number` fallback in `mergedData` must always be a valid E.164-style number to prevent a broken `wa.me` URL on first load.

**Note:** Invariant 12 is violated in the current implementation — `universal-flyer.tsx`
defines its own inline `NICHE_DEFAULTS` instead of importing from `core/`. See §20.

---

## §8 Theme System

Two independent theme systems exist: one for the React component, one for the export engine.
They are not shared and use different token names and color values.

### Component theme — NICHE_THEMES (universal-flyer.tsx)

Applied as CSS custom properties on `document.documentElement` via `useEffect`. Removed on
unmount. 11 tokens per niche.

| Token                    | Role                                    |
|--------------------------|-----------------------------------------|
| `--color-primary`        | Primary brand color (buttons, headers)  |
| `--color-accent`         | Accent / highlight                      |
| `--color-bg`             | Page background                         |
| `--color-surface`        | Card / section background               |
| `--color-text-on-primary`| Text rendered on primary color          |
| `--color-text-primary`   | Main body text                          |
| `--color-text-muted`     | Secondary / caption text                |
| `--font-display`         | Heading font stack                      |
| `--font-body`            | Body font stack                         |
| `--radius-brand`         | Border radius                           |
| `--spacing-section`      | Section padding                         |

Color palette summary per niche (component):

| Niche      | Primary   | Accent    | Background |
|------------|-----------|-----------|------------|
| food       | `#C8440A` | `#F5A623` | `#FFFBF5`  |
| beauty     | `#9B7B5B` | `#C9A07A` | `#FAF7F4`  |
| education  | `#1B4FBF` | `#3B82F6` | `#F8FAFF`  |
| services   | `#1A1A2E` | `#FF6B35` | `#FAFAFA`  |
| luxury     | `#0A0A0A` | `#C9A84C` | `#F8F4EE`  |

### Export engine theme — NICHE_TOKENS (export_engine.ts)

Used only in `exportHTML` and `exportOfflineHTML`. Different token names, different
color values. Dark backgrounds — designed for standalone HTML files.

| Token            | Role                   |
|------------------|------------------------|
| `colorAccent`    | Accent color           |
| `colorBg`        | Page background        |
| `colorSurface`   | Card background        |
| `colorText`      | Primary text           |
| `colorMutedText` | Secondary text         |
| `colorBorder`    | Border color           |
| `fontDisplay`    | Heading font stack     |
| `fontBody`       | Body font stack        |
| `googleFontFamily` | Font name for CDN link |
| `googleFontParam`  | Google Fonts URL param |

Color palette summary per niche (export engine):

| Niche      | Accent    | Background | Text      |
|------------|-----------|------------|-----------|
| food       | `#f59e0b` | `#0f1107`  | `#fef3c7` |
| beauty     | `#ec4899` | `#100810`  | `#fce7f3` |
| education  | `#3b82f6` | `#080e1a`  | `#eff6ff` |
| services   | `#10b981` | `#071410`  | `#ecfdf5` |
| luxury     | `#d4a017` | `#09080a`  | `#fef9e7` |

The export engine also maintains `SYSTEM_FONTS: Record<NicheType, string>` — used in
`exportOfflineHTML` to replace Google Fonts with system font stacks.

---

## §9 Input Sanitization

**File:** `core/input_sanitization.ts`

### SanitizationResult

```typescript
export interface SanitizationResult {
  data:    Partial<FlyerData>;
  niche:   NicheType | undefined;
  dropped: { field: string; reason: string }[];
}
```

### sanitizeFlyerInput(raw: Record<string, unknown>): SanitizationResult

Iterates over `PLACEHOLDER_SCHEMA` entries. For each key, processes `raw[key]` according
to the field's `config.type`. Fields missing from `raw` (undefined/null/"") are skipped
entirely — they do not appear in the output `data` and are not counted as dropped.

**Per-type handling:**

| type     | Behaviour |
|----------|-----------|
| `"enum"` | Lowercased, tested against pattern. No match → pushed to `dropped`. |
| `"string"` | Stringified, trimmed. If `field === "promo_expiry"`, passed to `sanitizePromoExpiry()`. Otherwise sliced to `maxLength`. |
| `"url"` | Stringified, trimmed, pattern-tested. Fail → dropped. Pass → sliced to maxLength. |
| `"tel"` | Same as `"url"`. |
| `"rating"` | Coerced to Number. NaN or out of 1–5 range → dropped. Valid → `Math.round(Math.min(5, Math.max(1, n)))`. |
| `"number"` | Coerced to Number. NaN → dropped. |
| default | Stringified, trimmed, sliced to maxLength. |

`niche` is extracted separately into the `niche` output field, not into `data`.

### sanitizePromoExpiry(value: string): string

```
Input trimmed
  ↓
Date.parse(trimmed)
  ├─ NaN or past timestamp  →  return trimmed (passthrough unchanged)
  └─ valid future timestamp →  return toHumanDate(new Date(ts))
                                  format: "D Mon YYYY" e.g. "31 Dec 2025"
```

- Never throws.
- Past dates pass through unchanged — they are NOT cleared here. Clearing malformed
  date-pattern strings happens later in `error_governance.ts → checkPromoDate()`.
- Non-date strings (e.g. "This week only") pass `Date.parse()` as NaN and are returned as-is.

---

## §10 Data Adapter

**File:** `core/data_adapter.ts`

### AdapterResult

```typescript
export interface AdapterResult {
  data:          FlyerData;
  assetWarnings: string[];
}
```

### adaptFlyerData(partial: Partial<FlyerData>, niche: NicheType): AdapterResult

**Step 1 — Merge.** Spread order is fixed; user data always wins:
```typescript
const merged: FlyerData = { ...getDefaults(niche), ...partial };
```

**Step 2 — Required field enforcement.**
- If `merged.business_name.trim() === ""` → replaced with `"Your Business"`
- If `merged.whatsapp_number.trim() === ""` → replaced with `"+919999999999"`

**Step 3 — Asset fallback.**
Calls `validateHeroImage(merged.hero_image)`.
- `pass: false` → logs warnings to `assetWarnings`, replaces `merged.hero_image`
  with `getFallbackImage(niche)` (the niche default Unsplash URL).
- `pass: true` with warnings → warnings appended, hero image kept.
- `pass: true` no warnings → hero image kept as-is.

**Input type:** `Partial<FlyerData>` only. CSV parsing, `FormData` reading, and
multi-source detection are not implemented here. See §20 Known Gaps.

---

## §11 Content Governance

**File:** `core/content_governance.ts`

### Validators

All validators have signature `(text: string): ValidationResult` where:
```typescript
export interface ValidationResult {
  pass:    boolean;
  reason?: string;
}
```

| Validator                  | Field          | Checks |
|----------------------------|----------------|--------|
| `validateHeadline`         | headline       | Non-empty, ≤60 chars, no passive voice (`\b(is\|are\|was\|...)\s+\w+(?:ed\|en)\b`), no unsubstantiated superlatives (best/amazing/great/awesome without a proof marker), no FORBIDDEN_PATTERNS phrase |
| `validateSubheadline`      | subheadline    | Non-empty, ≤100 chars |
| `validateOfferDesc`        | offer_*_desc   | Non-empty, ≤80 chars, does not start with feature language (`includes?/features?/has\s/with\s`) |
| `validateCTA`              | cta_label      | Non-empty, ≤30 chars, starts with: Order/Book/Get/Call/Message/Enroll |
| `validateTestimonialQuote` | testimonial_quote | Non-empty, ≤120 chars |

**Proof markers** (allow superlatives): `\d+%?`, `#\s*1`, `rated`, `award`, `certified`, `proven`

### FORBIDDEN_PATTERNS

23 phrases that must not appear in headlines. Examples:
`"best in class"`, `"world class"`, `"revolutionary"`, `"game changer"`, `"cutting edge"`,
`"state of the art"`, `"next level"`, `"unbeatable"`, `"jaw dropping"`, `"one stop shop"`.
Full list in `content_governance.ts`.

### COPY_FORMULAS

Reference formulas for five field types. Not enforced by validators — provided as
guidance for copy generation tools. Fields: `headline`, `subheadline`, `offerDesc`,
`cta`, `testimonial`.

### runContentQA(data: Partial<FlyerData>): ContentQAReport

Runs 7 field checks in order: headline, subheadline, offer_1_desc, offer_2_desc,
offer_3_desc, cta_label, testimonial_quote. Fields that are `undefined` or `""` are
skipped (not treated as errors).

```typescript
export interface ContentQAReport {
  passed:   boolean;
  warnings: { field: string; reason: string }[];
}
```

QA warnings are **non-blocking** — `passed: false` does not prevent render.

---

## §12 Asset Governance

**File:** `core/asset_governance.ts`

### AssetValidationResult

```typescript
export interface AssetValidationResult {
  pass:     boolean;
  warnings: string[];
}
```

### validateHeroImage(url: string): AssetValidationResult

Validation sequence:
1. Empty or whitespace → `pass: false`
2. Not a valid `http`/`https` URL → `pass: false`
3. Host matches `KNOWN_PLACEHOLDER_HOSTS` or path matches `PLACEHOLDER_URL_PATTERNS` → `pass: false`
4. File extension not in `["jpg","jpeg","webp","png","gif","avif"]` → `pass: true` with warning
5. Otherwise → `pass: true`, no warnings

### KNOWN_PLACEHOLDER_HOSTS (8 entries)

`via.placeholder.com`, `placeholder.com`, `dummyimage.com`, `lorempixel.com`,
`fakeimg.pl`, `placeholdit.imgix.net`, `placehold.co`, `placeimg.com`

### PLACEHOLDER_URL_PATTERNS (3 patterns)

`/\/placeholder[-_]?(image)?/i`, `/sample[-_]image/i`, `/test[-_]image/i`, `/dummy[-_]image/i`

### getFallbackImage(niche: NicheType): string

Returns `NICHE_DEFAULTS[niche].hero_image` — the Unsplash CDN URL for that niche.
This is the only function in the system that resolves a niche-level image fallback.

### validateGalleryImage(url: string): AssetValidationResult

Same logic as `validateHeroImage`. Exists for future gallery section use; not called
anywhere in the current render pipeline.

### ASSET_RULES

Documented content guidelines and technical constraints for `heroImage`, `galleryImage`,
and `logo`. Not enforced programmatically — used as reference for asset upload validation
in future UI layers.

---

## §13 Error Governance

**File:** `core/error_governance.ts`

### ErrorSeverity (4 levels — governance layer)

```typescript
export type ErrorSeverity = "block" | "warn" | "fix" | "fallback";
```

| Level      | Meaning                                                        | Data mutated? |
|------------|----------------------------------------------------------------|---------------|
| `block`    | Cannot render — required data missing with no safe substitute  | No            |
| `warn`     | Render proceeds, user copy retained, quality issue noted       | No            |
| `fix`      | Value exceeded a hard constraint — auto-truncated              | Yes           |
| `fallback` | Value absent or invalid — substituted with niche/system default| Yes           |

### ErrorReport

```typescript
export interface ErrorReport {
  field:          string;
  errorType:      string;
  severity:       ErrorSeverity;
  action:         string;
  resolvedValue?: unknown;   // present for fix and fallback entries
}
```

### applyErrorGovernance(data: FlyerData, niche: NicheType)

Works on a shallow copy of `data`. Runs 9 checks in sequence. Returns the (possibly
mutated) copy plus the accumulated `ErrorReport[]`.

```typescript
export function applyErrorGovernance(
  data:  FlyerData,
  niche: NicheType
): { data: FlyerData; errors: ErrorReport[] }
```

### The 9 checks

| Check function         | errorType           | Severity   | Mutation |
|------------------------|---------------------|------------|----------|
| `checkUndefinedFields` | `undefined_field`   | fallback   | Sets field to niche default or system default |
| `checkEmptyBusinessName` | `empty_business_name` | block  | None |
| `checkWhatsapp`        | `invalid_whatsapp`  | block      | None |
| `checkMissingHero`     | `missing_hero`      | fallback   | Replaces `hero_image` with `getFallbackImage(niche)` |
| `checkWeakHeadline`    | `weak_headline`     | warn       | None — user copy retained |
| `checkMissingOffers`   | `missing_offer`     | fallback   | Replaces empty offer_1/2/3 with niche defaults |
| `checkOversizedCopy`   | `oversized_copy`    | fix        | Truncates to `maxLength - 1` and appends `…` |
| `checkPromoDate`       | `invalid_promo_date`| fix        | Clears `promo_expiry` to `""` |
| `checkMissingTheme`    | `missing_theme`     | block      | None |

**checkPromoDate detail:** Only fires when `promo_expiry` matches `DATE_ATTEMPT_PATTERN`
(`^\d{4}-\d{2}-\d{2}$` or `^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$`) AND `Date.parse`
returns NaN. Non-date prose strings (e.g. `"This week only"`) do not match the pattern
and are left intact.

**System default:** `checkUndefinedFields` falls back to the niche default first, then
to a system default map. The only system default currently defined is
`{ testimonial_rating: 5 }`.

---

## §14 Render Pipeline

**File:** `core/render_pipeline.ts`

### ErrorSeverity (2 levels — pipeline layer)

```typescript
export type ErrorSeverity = "blocking" | "warning";
```

This is a different type from `error_governance.ts`. The 4-level governance severity
collapses to 2 at this boundary. See §20 for the audit trail implication.

### RenderPayload

```typescript
export interface RenderPayload {
  data:           FlyerData;
  niche:          NicheType;
  activeSections: SectionLetter[];
  errors:         RenderError[];
  warnings:       string[];
  qaReport:       ContentQAReport;
  ready:          boolean;
  exportReady:    boolean;
}

export type RenderResult = RenderPayload;   // alias
```

`ready` and `exportReady` are both `!errors.some(e => e.severity === "blocking")`.
In `runRenderPipeline` they are always equal. `renderPreview` sets `exportReady: false`
regardless.

`warnings` is a separate `string[]` for pipeline-level informational messages (e.g.
"Niche not specified — defaulting to food"). This is distinct from `errors`.

### RenderError

```typescript
export interface RenderError {
  code:      string;
  field?:    string;
  message:   string;
  severity:  ErrorSeverity;   // "blocking" | "warning"
}
```

### runRenderPipeline(raw: Record<string, unknown>): RenderPayload

8 steps — all non-throwing:

| Step | Operation                          | Output added to              |
|------|------------------------------------|------------------------------|
| 1    | `sanitizeFlyerInput(raw)`          | Dropped fields → `errors[]` as `FIELD_DROPPED / warning` |
| 2    | Resolve niche (default: `"food"`)  | Missing niche → `warnings[]` |
| 3    | `adaptFlyerData(sanitized.data, niche)` | Asset warnings → `errors[]` as `ASSET_WARNING / warning` (Step 5) |
| 4    | `runContentQA(data)`               | QA warnings → `errors[]` as `CONTENT_QA / warning` |
| 5    | Asset warnings from Step 3         | `errors[]` as `ASSET_WARNING / warning` |
| 6    | `resolveActiveSections(data)`      | Hidden Section O → `warnings[]` |
| 7    | Invariant check: A and N active    | Violation → `errors[]` as `INVARIANT_VIOLATION / blocking` |
| 8    | `applyErrorGovernance(data, niche)`| All ErrorReports → `errors[]` with severity mapped: `block→"blocking"`, others→`"warning"` |

Severity mapping at Step 8:
```typescript
severity: report.severity === "block" ? "blocking" : "warning"
```

`DEFAULT_NICHE = "food"` is used when `sanitized.niche` is undefined.

---

## §15 Batch & Preview Render Variants

**File:** `core/render_pipeline.ts`

### renderSingle(config: Record<string, unknown>): RenderResult

Direct wrapper around `runRenderPipeline`. No additional logic.

### renderBatch(configs: Record<string, unknown>[]): BatchResult

```typescript
export interface BatchResult {
  results:        RenderResult[];
  totalProcessed: number;
  totalFailed:    number;
}
```

Iterates over `configs`. For each item:
- Calls `renderSingle`.
- If result has any `severity: "blocking"` error → increments `totalFailed`, **skips** —
  the failed item is NOT included in `results`.
- Otherwise → appended to `results`.

`totalProcessed` is always `configs.length` (the input count, not the success count).
`totalFailed + results.length` may be less than `totalProcessed` if any items produced
only warnings (all such items are included in `results`).

### renderPreview(partial: Record<string, unknown>): RenderResult

Used for live preview contexts where QA and asset warnings should not block rendering.

Differences from `renderSingle`:
1. Strips all errors with `code === "CONTENT_QA"` or `code === "ASSET_WARNING"`.
2. Overrides `qaReport` with `{ passed: true, warnings: [] }`.
3. Sets `exportReady: false` unconditionally.

`ready` is still computed from remaining errors — a blocking error (e.g. missing
`business_name`) will still set `ready: false` in preview mode.

---

## §16 Section Render Logic

**File:** `core/render_pipeline.ts → resolveActiveSections()`

```typescript
function resolveActiveSections(data: FlyerData): SectionLetter[]
```

Filters `SECTION_ORDER` using `ACTION_FRAMEWORK` metadata:

1. **Missing entry** (should never occur with valid niche) → section excluded.
2. **Locked sections** (A and N) → always included.
3. **Section O** → included only if at least one of `promo_offer`, `promo_expiry`,
   `promo_code` is non-empty after trim.
4. **All other sections** (C, T, I) → always included; field-level emptiness is handled
   per component (e.g. badges with empty labels are filtered inside `CredibilitySection`).

**Component-level gates** (in `universal-flyer.tsx`, independent of the pipeline):
- `OfferSection` returns `null` when `!data.promo_offer && !data.promo_expiry && !data.promo_code`.
- `CredibilitySection` filters out badges where `label` is falsy.
- `TrustSection` renders unconditionally (empty quote renders as empty quote text).
- `InformationSection` filters offers where `offer.name` is falsy.

---

## §17 Export Engine

**File:** `core/export_engine.ts`

All functions are server-safe unless noted. Two functions are browser-only stubs.

### EXPORT_MODES registry

```typescript
export const EXPORT_MODES = {
  html:        { serverSafe: true,  selfContained: false },
  offlineHTML: { serverSafe: true,  selfContained: true  },
  printCSS:    { serverSafe: true,  selfContained: true  },
  jpg:         { serverSafe: false, selfContained: true  },
  pdf:         { serverSafe: false, selfContained: true  },
} as const;
```

### exportHTML(data: FlyerData, niche: NicheType): string

Full HTML document. Includes:
- Google Fonts CDN `<link>` tags using `NICHE_TOKENS[niche].googleFontParam`.
- CSS custom properties from `NICHE_TOKENS[niche]` injected into `:root`.
- Complete base CSS (600+ chars) with all six section class definitions.
- OG and Twitter Card meta tags (uses `hero_image` or `getFallbackImage(niche)` for og:image).
- `max-width: 480px` body constraint.
- All 6 section HTML builders.
- Footer: `"{business_name} · Powered by WhatsApp"`.
- Framer-motion animations are **omitted** — HTML export is static.

### exportOfflineHTML(data: FlyerData, niche: NicheType): string

Same as `exportHTML` but:
- Replaces `fontDisplay` and `fontBody` tokens with `SYSTEM_FONTS[niche]`.
- No Google Fonts CDN links.
- No Twitter Card meta tags.
- Otherwise identical structure.

### exportOGMeta(data: FlyerData, niche: NicheType = "food"): OGMeta

```typescript
export type OGMeta = {
  title:       string;
  description: string;
  image:       string;
  imageWidth:  1200;
  imageHeight: 630;
  url?:        string;
};
```

Returns `{ title: business_name, description: headline, image: hero_image || fallback }`.
`imageWidth` and `imageHeight` are literal types (`1200` and `630`) — not configurable.

### exportPrintCSS(): string

Returns a `@media print { ... }` CSS string. Does not accept data — purely structural.
Key rules: removes sticky/fixed positioning, disables animations, sets
`-webkit-print-color-adjust: exact`, adds visible border fallback on Section O for
greyscale printers. Intended to be injected into any page before printing.

### Browser-only stubs

```typescript
export function exportJPG(): never {
  throw new Error("JPG export requires browser environment");
}
export function exportPDF(): never {
  throw new Error("PDF export requires browser environment");
}
```

Both throw at call time. They exist to make the export surface complete for future
client-side implementation.

### HTML output — security

All user-supplied strings pass through `escHtml()` before insertion:
```typescript
function escHtml(s: string): string {
  // escapes: & < > " '
}
```

`waHref()` strips all non-digit characters (except leading `+`) from `whatsapp_number`
before building the `wa.me` URL.

---

## §18 Niche Copy Bank

**File:** `core/niche_copy_bank.ts`

### CopyBank

```typescript
export interface CopyBank {
  headlines:    string[];
  subheadlines: string[];
  cta_labels:   string[];
  testimonials: Array<{ quote: string; author: string; rating: number }>;
}
```

### NICHE_COPY_BANK

A/B-testable copy variants for all 5 niches. Variant counts per niche:

| Field        | Variants per niche |
|--------------|-------------------|
| headlines    | 3                 |
| subheadlines | 3                 |
| cta_labels   | 3                 |
| testimonials | 2                 |

All copy conforms to `content_governance.ts` rules:
- Headlines ≤60 chars, active voice, no forbidden phrases.
- Subheadlines ≤100 chars.
- CTA labels ≤30 chars, start with approved action verbs.
- Testimonials ≤120 chars, real Indian names and cities.

### getRandomCopy(niche: NicheType, field: keyof CopyBank): string

Returns a uniformly random item from the specified field's array.

**Special case:** When `field === "testimonials"`, returns only the `quote` string — not
the full `{ quote, author, rating }` object. Callers needing author or rating must access
`NICHE_COPY_BANK[niche].testimonials` directly.

---

## §19 Component Architecture

**File:** `components/universal-flyer.tsx`

### Props

```typescript
interface FlyerConfig {
  niche: "food" | "beauty" | "education" | "services" | "luxury";
  data?: Partial<FlyerData>;
}

export default function UniversalFlyer({ niche, data = {} }: FlyerConfig)
```

### Data merge (component-internal)

The component does not call the `core/` pipeline. It performs its own merge:
```typescript
const mergedData: FlyerData = {
  business_name:    data.business_name    || "Your Business Name",
  whatsapp_number:  data.whatsapp_number  || "+919999999999",
  ...NICHE_DEFAULTS[niche],  // inline NICHE_DEFAULTS, not core/niche_defaults.config.ts
  ...data,
};
```

`NICHE_DEFAULTS` is defined inline in the component file, not imported from core.

### Theme application

```typescript
useEffect(() => {
  const theme = NICHE_THEMES[niche];
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  return () => {
    Object.keys(theme).forEach((key) => {
      root.style.removeProperty(key);
    });
  };
}, [niche]);
```

Cleanup on unmount prevents niche bleed when the component is removed from the tree.

### Section components

| Component           | Props         | Conditional render |
|---------------------|---------------|--------------------|
| `AttentionSection`  | data, niche   | Always             |
| `CredibilitySection`| data          | Always (filters empty badges internally) |
| `TrustSection`      | data          | Always             |
| `InformationSection`| data          | Always (filters empty offers internally) |
| `OfferSection`      | data          | Returns null when all 3 promo fields absent |
| `NextStepSection`   | data          | Always (sticky)    |

### Animation system

Two Framer Motion variants — both defined at module level:

```typescript
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};
```

`UniversalFlyer` renders a `motion.div` with `staggerContainer`. Every section renders
as `motion.section` with `fadeUp`. Adding new variants requires updating
`STRUCTURAL_INVARIANTS` entry 10.

### Helper functions

```typescript
function stripNonDigits(str: string): string  // /\D/g → "" — used before wa.me URL
function getInitials(name: string): string     // first char of each word, uppercased, ≤2 chars
```

### Container constraints

```
max-width: 1080px   (mx-auto max-w-[1080px])
pb-24               (prevents sticky CTA from obscuring last section)
overflow-x: hidden
```

---

## §20 Known Gaps

### Gap 1 — data_adapter.ts accepts Partial\<FlyerData\> objects only

`adaptFlyerData` takes a `Partial<FlyerData>` produced by `sanitizeFlyerInput`. There is
no CSV parser, no `FormData` reader, and no multi-source detection. The full pipeline
entry point (`runRenderPipeline`) takes `Record<string, unknown>` — one object per flyer.

`renderBatch` iterates in memory over already-constructed objects. For batch generation
from a spreadsheet or CSV file, a parsing layer must be added upstream of
`sanitizeFlyerInput`. This is a planned Phase 2 concern.

### Gap 2 — promo_expiry is type "string", not "date"

`promo_expiry` is `string` in `FlyerData` and has `type: "string"` in `PLACEHOLDER_SCHEMA`.
The `"date"` type exists in the `PlaceholderConfig` union but is not assigned to any field.

Sanitization (`sanitizePromoExpiry`) reformats valid future dates to human-readable strings
but passes all other values through unchanged — including past dates. Non-date prose
strings are never rejected by the sanitizer.

Error governance (`checkPromoDate`) clears date-shaped strings that fail `Date.parse`
(e.g. `"2025-13-99"`) but does not touch prose strings. The net result: `promo_expiry`
can hold any string at render time. Do not coerce it to a `Date` downstream.

### Gap 3 — Local placeholder images do not exist on disk

All five niche defaults use external Unsplash CDN URLs. For an offline or CDN-independent
deployment, local fallback images would need to be placed at paths such as:

```
public/assets/placeholders/food-warm.jpg
public/assets/placeholders/beauty-warm.jpg
public/assets/placeholders/education-warm.jpg
public/assets/placeholders/services-warm.jpg
public/assets/placeholders/luxury-warm.jpg
```

None of these files exist. Until they are created, `NICHE_DEFAULTS[niche].hero_image` and
`getFallbackImage()` must remain as Unsplash URLs. Removing the Unsplash URLs without
local replacements leaves the hero blank whenever `validateHeroImage` rejects a
caller-supplied URL.

### Gap 4 — ErrorReport severity is lost in RenderPayload.errors

`applyErrorGovernance` returns `ErrorReport[]` with four severity levels
(`block`, `warn`, `fix`, `fallback`). The render pipeline maps these to two:

```typescript
severity: report.severity === "block" ? "blocking" : "warning"
```

A `RenderError` with `severity: "warning"` can represent a content quality issue, an
auto-truncation, or a fallback substitution — the distinction is gone. **The full
four-level report is available in `ErrorReport[]` returned directly by
`applyErrorGovernance` before this collapse.** Any future audit trail or export manifest
that needs to explain field changes must read from that return value, not from
`RenderPayload.errors`.

### Gap 5 — Component NICHE_DEFAULTS diverge from core/niche_defaults.config.ts

`universal-flyer.tsx` defines its own inline `NICHE_DEFAULTS` object and does not import
from `core/niche_defaults.config.ts`. The two datasets are currently in sync by convention,
but there is no structural enforcement. A change to the core defaults will not be reflected
in the component unless the component is manually updated.

Structural Invariant 12 requires the component to import from core. This invariant is
currently violated.

---

## §21 Error Code Reference

All error codes, their governance-layer severity, the pipeline-layer severity they map to,
and what action is taken on the data.

| Error code           | Gov. severity | Pipeline severity | Data mutated?          | When fired |
|----------------------|--------------|-------------------|------------------------|-----------|
| `FIELD_DROPPED`      | —            | warning           | Field excluded from data | `sanitizeFlyerInput` drops field (invalid pattern, bad format) |
| `CONTENT_QA`         | —            | warning           | No                     | `runContentQA` finds a violation in headline / subheadline / offer desc / CTA / testimonial |
| `ASSET_WARNING`      | —            | warning           | hero_image replaced    | `validateHeroImage` returns `pass: false`; hero replaced by niche default |
| `INVARIANT_VIOLATION`| —            | blocking          | No                     | Section A or N absent from `activeSections` (should never occur in normal flow) |
| `undefined_field`    | fallback     | warning           | Field set to niche/system default | A field in `FlyerData` is `null` or `undefined` after merge |
| `empty_business_name`| block        | blocking          | No                     | `business_name.trim() === ""` after all fallbacks |
| `invalid_whatsapp`   | block        | blocking          | No                     | `whatsapp_number` non-empty but fails `/^\+?[\d\s\-()​]{7,20}$/` |
| `missing_hero`       | fallback     | warning           | hero_image → niche default URL | `hero_image` empty or not a valid http URL |
| `weak_headline`      | warn         | warning           | No                     | `validateHeadline` returns `pass: false` |
| `missing_offer`      | fallback     | warning           | offer_1/2/3 → niche default | offer_1, offer_2, or offer_3 is empty after merge |
| `oversized_copy`     | fix          | warning           | Field truncated to maxLength-1 + `…` | Any string field exceeds its `PLACEHOLDER_SCHEMA.maxLength` |
| `invalid_promo_date` | fix          | warning           | promo_expiry → `""` (OfferSection may hide) | promo_expiry matches date pattern but `Date.parse` returns NaN |
| `missing_theme`      | block        | blocking          | No                     | `niche` not in valid set — should never occur after sanitization |

**Codes that strip in renderPreview:** `CONTENT_QA` and `ASSET_WARNING` are removed from
`errors[]` by `renderPreview`. All other codes are preserved.
