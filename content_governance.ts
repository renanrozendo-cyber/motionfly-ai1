// universal_flyer_system v1.0.0 · content_governance.ts
// Responsibility: Validators for every user-facing copy field + QA runner
// SAFE TO EDIT: FORBIDDEN_PATTERNS list, COPY_FORMULAS docs, char limits
// DO NOT MODIFY: validator function signatures, ContentQAReport shape

import type { FlyerData } from "./niche_defaults.config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ValidationResult {
  pass: boolean;
  reason?: string;
}

export interface ContentQAReport {
  passed: boolean;
  warnings: { field: string; reason: string }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const FORBIDDEN_PATTERNS: string[] = [
  "best in class",
  "world class",
  "world-class",
  "number one",
  "no. 1",
  "top notch",
  "top-notch",
  "cutting edge",
  "cutting-edge",
  "state of the art",
  "state-of-the-art",
  "revolutionary",
  "game changer",
  "game-changer",
  "next level",
  "next-level",
  "unbeatable",
  "unrivalled",
  "unrivaled",
  "jaw dropping",
  "jaw-dropping",
  "one stop shop",
  "one-stop shop",
  "one-stop-shop",
];

export const COPY_FORMULAS = {
  headline: {
    formula: "Problem + Solution  OR  Outcome + Timeframe",
    maxChars: 60,
    examples: [
      "Fresh Home Meals Delivered to Your Doorstep",
      "From Struggling to Scoring 90+ in 90 Days",
      "Your Problem Fixed. Today. No Waiting.",
    ],
    avoid:
      "Passive voice, unsubstantiated superlatives (best/amazing/great/awesome), forbidden generic phrases",
  },
  subheadline: {
    formula: "3 proof points separated by periods or em-dashes",
    maxChars: 100,
    examples: [
      "Small batches. Experienced faculty. Proven results.",
      "Licensed technicians. Same-day service. Guaranteed.",
      "Expert hands. Premium products. Slots 7 days a week.",
    ],
    avoid: "Repeating the headline, vague filler, more than 3 clauses",
  },
  offerDesc: {
    formula: "Outcome or transformation in ≤ 6 words. No feature lists.",
    maxChars: 80,
    examples: [
      "Exam-ready in 30 days.",
      "Full bridal makeover.",
      "Cooked fresh for 4 people.",
    ],
    avoid: 'Starting with "Includes", "Has", "Features". Pure spec lists.',
  },
  cta: {
    formula: "Action verb + specific next step",
    maxChars: 30,
    actionVerbs: ["Order", "Book", "Get", "Call", "Message", "Enroll"],
    examples: [
      "Order Now on WhatsApp",
      "Book Your Slot Today",
      "Enroll for Free Demo Class",
    ],
    avoid: "Weak verbs: Learn More, Click Here, Submit, Continue",
  },
  testimonial: {
    formula: "Specific result + emotional outcome. Real name + city.",
    maxChars: 120,
    examples: [
      "Scored 94% in boards after joining. Teachers explain very clearly.",
      "AC fixed same evening. No waiting, no surprise charges.",
    ],
    avoid:
      "Generic praise, superlatives without specifics, unnamed authors, invented locations",
  },
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

const PASSIVE_VOICE_PATTERN = /\b(is|are|was|were|be|been|being)\s+\w+(?:ed|en)\b/i;

const UNSUBSTANTIATED_SUPERLATIVES = ["best", "amazing", "great", "awesome"];
const PROOF_MARKERS = /(\d+%?|#\s*1|\brated\b|\baward\b|\bcertified\b|\bproven\b)/i;

const CTA_ACTION_VERBS = /^(Order|Book|Get|Call|Message|Enroll)\b/i;

const FEATURE_LANGUAGE_START = /^(includes?|features?|has\s|with\s)/i;

// ─── Validators ───────────────────────────────────────────────────────────────

export function validateHeadline(text: string): ValidationResult {
  const t = text.trim();
  if (t.length === 0) {
    return { pass: false, reason: "Headline is empty." };
  }
  if (t.length > 60) {
    return { pass: false, reason: `Headline exceeds 60 characters (${t.length} chars).` };
  }
  if (PASSIVE_VOICE_PATTERN.test(t)) {
    return {
      pass: false,
      reason: 'Passive voice detected. Rewrite active: "We deliver" not "Food is delivered".',
    };
  }
  const lower = t.toLowerCase();
  for (const word of UNSUBSTANTIATED_SUPERLATIVES) {
    if (new RegExp(`\\b${word}\\b`).test(lower) && !PROOF_MARKERS.test(t)) {
      return {
        pass: false,
        reason: `"${word}" needs substantiation — add a number, rating, or award, or remove it.`,
      };
    }
  }
  const forbidden = FORBIDDEN_PATTERNS.find((p) => lower.includes(p.toLowerCase()));
  if (forbidden) {
    return {
      pass: false,
      reason: `Headline contains a forbidden generic phrase: "${forbidden}". Be specific.`,
    };
  }
  return { pass: true };
}

export function validateSubheadline(text: string): ValidationResult {
  const t = text.trim();
  if (t.length === 0) {
    return { pass: false, reason: "Subheadline is empty." };
  }
  if (t.length > 100) {
    return { pass: false, reason: `Subheadline exceeds 100 characters (${t.length} chars).` };
  }
  return { pass: true };
}

export function validateOfferDesc(text: string): ValidationResult {
  const t = text.trim();
  if (t.length === 0) {
    return { pass: false, reason: "Offer description is empty." };
  }
  if (t.length > 80) {
    return { pass: false, reason: `Offer description exceeds 80 characters (${t.length} chars).` };
  }
  if (FEATURE_LANGUAGE_START.test(t)) {
    return {
      pass: false,
      reason: 'Feature language detected. Lead with the outcome, not "Includes" or "Has".',
    };
  }
  return { pass: true };
}

export function validateCTA(text: string): ValidationResult {
  const t = text.trim();
  if (t.length === 0) {
    return { pass: false, reason: "CTA label is empty." };
  }
  if (t.length > 30) {
    return { pass: false, reason: `CTA label exceeds 30 characters (${t.length} chars).` };
  }
  if (!CTA_ACTION_VERBS.test(t)) {
    return {
      pass: false,
      reason: "CTA must start with: Order, Book, Get, Call, Message, or Enroll.",
    };
  }
  return { pass: true };
}

export function validateTestimonialQuote(text: string): ValidationResult {
  const t = text.trim();
  if (t.length === 0) {
    return { pass: false, reason: "Testimonial quote is empty." };
  }
  if (t.length > 120) {
    return {
      pass: false,
      reason: `Testimonial exceeds 120 characters (${t.length} chars) — WhatsApp preview will truncate.`,
    };
  }
  return { pass: true };
}

// ─── QA Runner ────────────────────────────────────────────────────────────────

export function runContentQA(data: Partial<FlyerData>): ContentQAReport {
  const warnings: { field: string; reason: string }[] = [];

  const checks: [string, string | undefined, (t: string) => ValidationResult][] = [
    ["headline", data.headline, validateHeadline],
    ["subheadline", data.subheadline, validateSubheadline],
    ["offer_1_desc", data.offer_1_desc, validateOfferDesc],
    ["offer_2_desc", data.offer_2_desc, validateOfferDesc],
    ["offer_3_desc", data.offer_3_desc, validateOfferDesc],
    ["cta_label", data.cta_label, validateCTA],
    ["testimonial_quote", data.testimonial_quote, validateTestimonialQuote],
  ];

  for (const [field, value, validator] of checks) {
    if (value !== undefined && value !== "") {
      const result = validator(value);
      if (!result.pass && result.reason) {
        warnings.push({ field, reason: result.reason });
      }
    }
  }

  return { passed: warnings.length === 0, warnings };
}
