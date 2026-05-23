// universal_flyer_system v1.0.0 · render_pipeline.ts
// Responsibility: Orchestrate the full path from raw user input to a validated,
//   render-ready RenderPayload. All steps are non-throwing; errors accumulate.
// SAFE TO EDIT: DEFAULT_NICHE, error severity assignments, warning prose
// DO NOT MODIFY: RenderPayload shape, step order, runRenderPipeline signature, BatchResult shape

import { sanitizeFlyerInput } from "./input_sanitization";
import { adaptFlyerData } from "./data_adapter";
import { runContentQA } from "./content_governance";
import type { ContentQAReport } from "./content_governance";
import { ACTION_FRAMEWORK, SECTION_ORDER } from "./action_framework";
import type { SectionLetter } from "./action_framework";
import type { FlyerData, NicheType } from "./niche_defaults.config";
import { applyErrorGovernance } from "./error_governance";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ErrorSeverity = "blocking" | "warning";

export interface RenderError {
  code: string;
  field?: string;
  message: string;
  severity: ErrorSeverity;
}

export interface RenderPayload {
  data: FlyerData;
  niche: NicheType;
  activeSections: SectionLetter[];
  errors: RenderError[];
  warnings: string[];
  qaReport: ContentQAReport;
  ready: boolean;
  exportReady: boolean;
}

export type RenderResult = RenderPayload;

export interface BatchResult {
  results: RenderResult[];
  totalProcessed: number;
  totalFailed: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_NICHE: NicheType = "food";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveActiveSections(data: FlyerData): SectionLetter[] {
  return SECTION_ORDER.filter((letter) => {
    const section = ACTION_FRAMEWORK.find((s) => s.letter === letter);
    if (!section) return false;

    // Invariant: locked sections (A and N) always render regardless of data completeness
    if (section.locked) return true;

    // Invariant: Section O hides entirely when all three promo fields are absent
    if (letter === "O") {
      return (
        data.promo_offer.trim() !== "" ||
        data.promo_expiry.trim() !== "" ||
        data.promo_code.trim() !== ""
      );
    }

    // All other unlocked sections render — field-level emptiness is handled per-component
    return true;
  }) as SectionLetter[];
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export function runRenderPipeline(raw: Record<string, unknown>): RenderPayload {
  let errors: RenderError[] = [];
  const warnings: string[] = [];

  // Step 1: Sanitize raw input
  const sanitized = sanitizeFlyerInput(raw);
  for (const drop of sanitized.dropped) {
    errors.push({
      code: "FIELD_DROPPED",
      field: drop.field,
      message: drop.reason,
      severity: "warning",
    });
  }

  // Step 2: Resolve niche
  const niche: NicheType = sanitized.niche ?? DEFAULT_NICHE;
  if (!sanitized.niche) {
    warnings.push(`Niche not specified — defaulting to "${DEFAULT_NICHE}".`);
  }

  // Step 3: Adapt — merge with niche defaults, guarantee required fields, resolve asset fallbacks
  const adapted = adaptFlyerData(sanitized.data, niche);
  let data = adapted.data;

  // Step 4: Content QA
  const qaReport = runContentQA(data);
  for (const w of qaReport.warnings) {
    errors.push({
      code: "CONTENT_QA",
      field: w.field,
      message: w.reason,
      severity: "warning",
    });
  }

  // Step 5: Asset governance
  for (const w of adapted.assetWarnings) {
    errors.push({
      code: "ASSET_WARNING",
      field: "hero_image",
      message: w,
      severity: "warning",
    });
  }

  // Step 6: Section gating
  const activeSections = resolveActiveSections(data);
  if (!activeSections.includes("O")) {
    warnings.push("Promo section (O) hidden — all three promo fields are empty.");
  }

  // Step 7: Structural invariant checks — locked sections A and N must always be active
  if (!activeSections.includes("A")) {
    errors.push({
      code: "INVARIANT_VIOLATION",
      message: "Section A (Attention) must always be active — invariant violated.",
      severity: "blocking",
    });
  }
  if (!activeSections.includes("N")) {
    errors.push({
      code: "INVARIANT_VIOLATION",
      message: "Section N (Next Step) must always be active — invariant violated.",
      severity: "blocking",
    });
  }

  // Step 8: Error governance — auto-corrects fix/fallback fields, classifies remaining issues
  const governed = applyErrorGovernance(data, niche);
  data = governed.data;
  for (const report of governed.errors) {
    errors.push({
      code: report.errorType,
      field: report.field !== "" ? report.field : undefined,
      message: report.action,
      severity: report.severity === "block" ? "blocking" : "warning",
    });
  }

  const ready = !errors.some((e) => e.severity === "blocking");

  return { data, niche, activeSections, errors, warnings, qaReport, ready, exportReady: ready };
}

// ─── Named exports ────────────────────────────────────────────────────────────

export function renderSingle(config: Record<string, unknown>): RenderResult {
  return runRenderPipeline(config);
}

export function renderBatch(configs: Record<string, unknown>[]): BatchResult {
  const results: RenderResult[] = [];
  let totalFailed = 0;

  for (const config of configs) {
    const result = renderSingle(config);
    if (result.errors.some((e) => e.severity === "blocking")) {
      totalFailed++;
      continue;
    }
    results.push(result);
  }

  return { results, totalProcessed: configs.length, totalFailed };
}

export function renderPreview(partial: Record<string, unknown>): RenderResult {
  const result = renderSingle(partial);
  const errors = result.errors.filter(
    (e) => e.code !== "CONTENT_QA" && e.code !== "ASSET_WARNING"
  );
  return {
    ...result,
    errors,
    qaReport: { passed: true, warnings: [] },
    exportReady: false,
  };
}
