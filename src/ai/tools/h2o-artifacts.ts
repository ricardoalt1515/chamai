import { tool } from "ai";
import type { ZodTypeAny } from "zod";
import { z } from "zod";
import type { ArtifactKind, ArtifactStore } from "@/lib/artifacts/artifact-store";
import { pdfFilename } from "@/lib/artifacts/payloads";
import { renderArtifactPdf } from "@/lib/artifacts/pdf-renderer-dispatch";
import type { ArtifactPdfStorage } from "@/lib/artifacts/pdf-storage";
import type { OwnerContext } from "@/lib/auth/owner-context";

const customerSchema = z.object({
  name: z.string().min(1),
  location: z.string().optional(),
  slug: z.string().optional(),
  /** County for MinimalHeader metadata line: "{County}, {State} ({Basin})? · {Date}" */
  county: z.string().optional(),
  /** State abbreviation for MinimalHeader metadata line */
  state: z.string().optional(),
  /** Sub-basin or watershed name. Omitted from metadata when absent. */
  basin: z.string().optional(),
});

const stageSchema = z.enum(["Lead", "Qualify", "Scope", "Position", "Propose", "Close"]);
const confidenceSchema = z.enum(["HIGH", "MEDIUM", "LOW", "MEDIUM-LOW"]);

export const fieldBriefInputSchema = z.object({
  customer: customerSchema,
  stage: stageSchema,
  confidence: confidenceSchema.optional(),
  date: z.string().optional(),
  stopFlags: z
    .array(z.object({ title: z.string().min(1), summary: z.string().min(1) }))
    .default([]),
  /**
   * Opt-in narrative risk callouts. When populated, renders risk context woven
   * into the prose of whatThisIs / whatWeWouldPropose instead of separate bordered
   * stop-flag blocks. Both fields can coexist; the renderer applies suppression at
   * render time (Slice C). Populate when the LLM has already surfaced risks in the
   * main narrative and a separate flags block would be redundant.
   */
  narrativeRiskCallouts: z.array(z.string()).optional(),
  sections: z.object({
    whatThisIs: z.object({ insight: z.string().min(1), body: z.string().min(1) }),
    whatWeWouldPropose: z.object({
      insight: z.string().min(1),
      recommendedApproach: z.string().min(1),
      winWinArguments: z
        .array(z.object({ lead: z.string().min(1), body: z.string().min(1) }))
        .min(1)
        .max(3),
      costOfAlternativeRows: z
        .array(
          z.object({
            component: z.string().min(1),
            theirPath: z.string().min(1),
            ourProposal: z.string().min(1),
            isTotal: z.boolean().optional(),
          }),
        )
        .min(1),
      dealSizeSensitivity: z.string().optional(),
    }),
    whatCouldKillIt: z.object({
      insight: z.string().min(1),
      risks: z
        .array(
          z.object({
            name: z.string().min(1),
            mechanism: z.string().min(1),
            mitigation: z.string().min(1),
          }),
        )
        .min(1)
        .max(3),
    }),
    doThisNext: z.object({
      insight: z.string().min(1),
      actions: z
        .array(
          z.object({
            title: z.string().min(1),
            timeframe: z.string().min(1),
            body: z.string().min(1),
          }),
        )
        .length(3),
    }),
  }),
});

export const playbookInputSchema = z
  .object({
    customer: customerSchema,
    stage: stageSchema.optional(),
    /** Optional subtitle override (default "Question structure for the first operator conversation"). Title is fixed to "Call Playbook" — do NOT pass a title field. */
    subtitle: z.string().optional(),
    /** Optional document-level header fields for TopHeader rendering. */
    header: z
      .object({
        subStreams: z.array(z.string()).optional(),
        stageIntro: z.string().optional(),
        insight: z.string().optional(),
        /** Orientation callout block rendered below TopHeader. */
        orientationLine: z.string().optional(),
        /** Italic intro paragraph rendered below the orientation callout. */
        introLine: z.string().optional(),
      })
      .strict()
      .optional(),
    themes: z
      .array(
        z.object({
          title: z.string().min(1),
          framing: z.string().optional(),
          questions: z.array(z.string().min(1)).min(1).max(5),
          substreamTag: z.string().optional(),
          /**
           * Populate with 1–3 sentences explaining why this theme matters to the
           * customer at this stage. Rendered as a WhyItMattersCallout panel below
           * the theme title (Slice D).
           */
          whyItMatters: z.array(z.string()).optional(),
          /**
           * Explicit theme palette index (0-based). When absent the renderer uses
           * the theme's position in the array. Use accentIndex to pin a specific
           * accent color when theme ordering changes across revisions.
           */
          accentIndex: z.number().int().nonnegative().optional(),
        }),
      )
      .min(1)
      .max(11),
  })
  .strict();

/** Shared severity enum used by flags and per-section confidence */
const flagSeveritySchema = z.enum(["STOP", "SPECIALIST", "ATTENTION", "CLEAR"]);
/** Confidence tier enum for cost rows and per-section tagging */
const confidenceTierSchema = z.enum(["HIGH", "MEDIUM", "LOW", "QUALITATIVE"]);

export const analyticalReadInputSchema = z.object({
  customer: customerSchema,
  /** Optional subtitle override (e.g. "Evidenced read on the produced-water management failure at Pecos East"). Title is fixed to "Analytical Read" — do NOT pass a title field. */
  subtitle: z.string().optional(),
  subStreamsLine: z.string().optional(),
  closingInsight: z.string().optional(),
  summary: z.string().min(1),
  /**
   * Qualification Gate state. Populate to open the document with an amber
   * QUALIFICATION GATE banner. Use gateContent to provide the narrative
   * explanation rendered inside the banner.
   */
  gateState: z.enum(["OPEN", "OPEN_WITH_CONDITIONS", "CONDITIONALLY_OPEN", "CLOSED"]).optional(),
  /** Narrative explanation for the qualification gate banner. */
  gateContent: z.string().optional(),
  /**
   * Compliance & Safety flags. Populate to render a red COMPLIANCE & SAFETY
   * banner with a structured flag list. Each flag requires an id (monospace,
   * e.g. "PW-01"), severity, and evidence string. status is optional free text.
   * Gate banner (amber) renders above compliance banner (red) when both present.
   */
  flags: z
    .array(
      z.object({
        id: z.string().min(1),
        severity: flagSeveritySchema,
        evidence: z.string().min(1),
        status: z.string().optional(),
      }),
    )
    .optional(),
  /**
   * Sub-stream lens rows for the DataTable rendered in the body. Each row maps
   * a sub-stream to its active condition and the primary evidence anchor.
   */
  subStreamLens: z
    .array(
      z.object({
        subStream: z.string().min(1),
        activeCondition: z.string().min(1),
        evidenceAnchor: z.string().min(1),
      }),
    )
    .optional(),
  /**
   * Stage gap analysis rows. Rendered as a DataTable showing required items,
   * their current status, and the data source.
   */
  stageGapAnalysis: z
    .array(
      z.object({
        required: z.string().min(1),
        status: z.string().min(1),
        source: z.string().min(1),
      }),
    )
    .optional(),
  /**
   * Cost-of-alternative rows for the cost table. Confidence cells are
   * color-coded: HIGH=navy, MEDIUM=amber, LOW=red, QUALITATIVE=grey.
   */
  costRows: z
    .array(
      z.object({
        row: z.string().min(1),
        basis: z.string().min(1),
        confidence: confidenceTierSchema,
      }),
    )
    .optional(),
  sections: z
    .array(
      z.object({
        heading: z.string().min(1),
        body: z.string().min(1),
        evidenceTags: z.array(z.string()).default([]),
        table: z.array(z.record(z.string(), z.string())).optional(),
        /** Inline evidence anchor reference (e.g. "[PW-01]") rendered in small-caps after the section body. */
        evidenceSource: z.string().optional(),
        /** Confidence tier for this section's evidence quality. Rendered as a colored badge. */
        confidenceTier: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
        /** Explicit 1-based section number. When absent uses array position. */
        index: z.number().int().positive().optional(),
        /** Decimal subsections e.g. "3.1 Title". */
        subsections: z
          .array(
            z.object({
              heading: z.string().min(1),
              body: z.string().min(1),
              evidenceSource: z.string().optional(),
            }),
          )
          .optional(),
      }),
    )
    .min(1),
});

export const proposalShellInputSchema = z.object({
  customer: customerSchema,
  /** Optional subtitle override (default "Stage: {stage} · Intent-only · Not for customer delivery"). Title is fixed to "Proposal Shell — directional scoping" — do NOT pass a title field. */
  subtitle: z.string().optional(),
  phase2Prize: z.string().optional(),
  executiveSummary: z.string().min(1),
  proposedScope: z.array(z.string().min(1)).min(1),
  sizingAndPricing: z.string().min(1),
  schedule: z.string().min(1),
  commitments: z.array(
    z.object({
      label: z.string().min(1),
      text: z.string().min(1),
      date: z.string().optional(),
      owner: z.string().optional(),
    }),
  ),
  fundingPathway: z.string().optional(),
  riskAllocation: z.string().optional(),
  /**
   * When true (default) renders a full-width red DRAFT INTENT banner at the
   * top of the document. Set false explicitly to suppress it on clean drafts.
   */
  draftIntentBanner: z.boolean().default(true),
  /**
   * When true (default) renders a full-width red INTERNAL ONLY banner at the
   * bottom of the document. Set false explicitly to suppress for external
   * distribution copies.
   */
  internalOnlyFooterBanner: z.boolean().default(true),
  /** Status line rendered as a paragraph below the executive summary. */
  statusOfDocument: z.string().optional(),
  /**
   * Work packages for the structured DataTable (navy-dark header). Populate
   * when the deal is at Scope or later and discrete work units can be named.
   */
  workPackages: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        outcome: z.string().min(1),
      }),
    )
    .optional(),
  /**
   * Commercial shape rows for the KVTable. Use for CAPEX range, confidence
   * level, O&M impact, and funding pathway when structured display is clearer
   * than prose sizingAndPricing.
   */
  sizingRows: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      }),
    )
    .optional(),
  /**
   * Out-of-scope items. Each item renders as a bold heading followed by a
   * paragraph body. Populate to set clear exclusions that protect deal scope.
   */
  outOfScope: z
    .array(
      z.object({
        heading: z.string().min(1),
        body: z.string().min(1),
      }),
    )
    .optional(),
  /**
   * Gates to close before proposal can advance. Rendered as a two-column
   * DataTable: gate description and closer (responsible party).
   */
  gatesToClose: z
    .array(
      z.object({
        gate: z.string().min(1),
        closer: z.string().min(1),
      }),
    )
    .optional(),
});

// Single source of truth for kind → input schema. Imported by the download
// route to validate persisted payloads before rendering (defensive against
// schema drift between write and read).
export const ARTIFACT_INPUT_SCHEMAS: Record<ArtifactKind, ZodTypeAny> = {
  "field-brief": fieldBriefInputSchema,
  playbook: playbookInputSchema,
  "analytical-read": analyticalReadInputSchema,
  "proposal-shell": proposalShellInputSchema,
};

type ArtifactFormat = {
  format: "pdf";
  mediaType: "application/pdf";
  filename: string;
  downloadUrl: string;
};

export type ArtifactToolProgressStatus = "rendering" | "storing" | "persisting";

export type ArtifactToolProgress = {
  artifactType: ArtifactKind;
  title: string;
  status: ArtifactToolProgressStatus;
  message: string;
};

export type ArtifactToolResult = {
  artifactId: string;
  artifactType: ArtifactKind;
  title: string;
  status: "ready";
  createdAt: string;
  formats: ArtifactFormat[];
};

export type ArtifactToolOutput = ArtifactToolProgress | ArtifactToolResult;

export type ArtifactRequestContext = {
  owner: OwnerContext;
  threadId: string;
  artifactStore: ArtifactStore;
  pdfStorage: ArtifactPdfStorage;
  baseUrl?: string;
};

const titleFor = (
  kind: ArtifactKind,
  payload: { title?: string; customer?: { name?: string } },
): string => {
  if (payload.title) {
    return payload.title;
  }
  if (kind === "field-brief") {
    return `${payload.customer?.name ?? "Customer"} Field Brief`;
  }
  if (kind === "playbook") {
    return "Conversation Playbook";
  }
  if (kind === "analytical-read") {
    return "Analytical Read";
  }
  return "Proposal Shell";
};

const slugFor = (payload: { customer?: { slug?: string; name?: string } }): string | null =>
  payload.customer?.slug ?? payload.customer?.name ?? null;

const pdfDownloadUrl = (ctx: ArtifactRequestContext, kind: ArtifactKind): string => {
  const query = new URLSearchParams({ threadId: ctx.threadId, kind });
  const path = `?${query.toString()}`;
  return ctx.baseUrl ? new URL(path, ctx.baseUrl).toString() : path;
};

type ArtifactLogEvent = Record<string, unknown> & {
  event: string;
  kind: ArtifactKind;
  threadId: string;
};

const logArtifactInfo = (event: string, details: ArtifactLogEvent): void => {
  console.log(`[h2o-artifacts] ${event}`, details);
};

const logArtifactError = (event: string, details: ArtifactLogEvent): void => {
  console.error(`[h2o-artifacts] ${event}`, details);
};

const errorDetails = (error: unknown) => ({
  errorClass: error instanceof Error ? error.name : typeof error,
  errorMessage: "redacted",
});

async function* persistArtifact<
  TPayload extends { title?: string; customer?: { name?: string; slug?: string } },
>(
  ctx: ArtifactRequestContext,
  kind: ArtifactKind,
  payload: TPayload,
): AsyncGenerator<ArtifactToolOutput> {
  const customerSlug = slugFor(payload);
  const title = titleFor(kind, payload);

  // Eager render: produce the PDF bytes here so any render-time failure
  // (missing field, invalid value, library crash) surfaces as a tool-error
  // the model can retry against. The download route never has to call into
  // @react-pdf again — it just streams these bytes from S3.
  yield { artifactType: kind, title, status: "rendering", message: "Rendering PDF…" };
  const renderStartedAt = Date.now();
  logArtifactInfo("artifact_render_started", {
    event: "artifact_render_started",
    kind,
    threadId: ctx.threadId,
  });
  const pdfBytes = await renderArtifactPdf(kind, payload);
  logArtifactInfo("artifact_render_finished", {
    event: "artifact_render_finished",
    kind,
    threadId: ctx.threadId,
    durationMs: Date.now() - renderStartedAt,
    byteLength: pdfBytes.length,
  });

  yield { artifactType: kind, title, status: "storing", message: "Storing PDF…" };
  const storageStartedAt = Date.now();
  logArtifactInfo("artifact_pdf_storage_started", {
    event: "artifact_pdf_storage_started",
    kind,
    threadId: ctx.threadId,
  });
  await ctx.pdfStorage.put({
    bytes: pdfBytes,
    kind,
    threadId: ctx.threadId,
    userId: ctx.owner.userId,
  });
  logArtifactInfo("artifact_pdf_storage_finished", {
    event: "artifact_pdf_storage_finished",
    kind,
    threadId: ctx.threadId,
    durationMs: Date.now() - storageStartedAt,
    byteLength: pdfBytes.length,
  });

  // If the DynamoDB write rejects after S3 succeeded, delete the orphan
  // PDF so a never-retried kind doesn't accumulate dead bytes in S3.
  // The S3 key is deterministic per (user, thread, kind), so a successful
  // retry would overwrite anyway — this only matters when no retry happens.
  let artifact: Awaited<ReturnType<typeof ctx.artifactStore.putArtifact>>;
  try {
    yield { artifactType: kind, title, status: "persisting", message: "Saving artifact metadata…" };
    const persistStartedAt = Date.now();
    logArtifactInfo("artifact_db_persist_started", {
      event: "artifact_db_persist_started",
      kind,
      threadId: ctx.threadId,
    });
    artifact = await ctx.artifactStore.putArtifact(
      {
        customerSlug,
        kind,
        payload,
        payloadVersion: 1,
        status: "ready",
        threadId: ctx.threadId,
        title,
      },
      ctx.owner,
    );
    logArtifactInfo("artifact_db_persist_finished", {
      event: "artifact_db_persist_finished",
      kind,
      threadId: ctx.threadId,
      artifactId: artifact.id,
      durationMs: Date.now() - persistStartedAt,
    });
  } catch (error) {
    logArtifactError("artifact_db_persist_failed", {
      event: "artifact_db_persist_failed",
      kind,
      threadId: ctx.threadId,
      ...errorDetails(error),
    });
    await ctx.pdfStorage
      .delete({ kind, threadId: ctx.threadId, userId: ctx.owner.userId })
      .catch((cleanupError) => {
        console.error("[h2o-artifacts] s3-cleanup-failed", {
          event: "artifact_orphan_cleanup_failed",
          kind,
          threadId: ctx.threadId,
          ...errorDetails(cleanupError),
        });
      });
    throw error;
  }

  const formats: ArtifactFormat[] = [
    {
      format: "pdf",
      mediaType: "application/pdf",
      filename: pdfFilename(artifact.customerSlug ?? customerSlug, kind),
      downloadUrl: pdfDownloadUrl(ctx, kind),
    },
  ];

  yield {
    artifactId: artifact.id,
    artifactType: kind,
    title: artifact.title,
    status: "ready",
    createdAt: artifact.createdAtIso,
    formats,
  };
}

async function* runArtifactTool<
  TPayload extends { title?: string; customer?: { name?: string; slug?: string } },
>({
  ctx,
  input,
  kind,
  toolCallId,
}: {
  ctx: ArtifactRequestContext;
  input: TPayload;
  kind: ArtifactKind;
  toolCallId?: string;
}): AsyncGenerator<ArtifactToolOutput> {
  const startedAt = Date.now();
  logArtifactInfo("artifact_tool_started", {
    event: "artifact_tool_started",
    kind,
    threadId: ctx.threadId,
    toolCallId,
  });

  try {
    let finalResult: ArtifactToolResult | null = null;
    for await (const output of persistArtifact(ctx, kind, input)) {
      if (output.status === "ready") {
        finalResult = output;
      }
      yield output;
    }
    if (finalResult) {
      logArtifactInfo("artifact_tool_finished", {
        event: "artifact_tool_finished",
        kind,
        threadId: ctx.threadId,
        toolCallId,
        artifactId: finalResult.artifactId,
        durationMs: Date.now() - startedAt,
      });
    }
  } catch (error) {
    logArtifactError("artifact_tool_failed", {
      event: "artifact_tool_failed",
      kind,
      threadId: ctx.threadId,
      toolCallId,
      durationMs: Date.now() - startedAt,
      ...errorDetails(error),
    });
    throw error;
  }
}

export const createH2oArtifactTools = (ctx: ArtifactRequestContext) => ({
  generateFieldBrief: tool({
    description:
      "Render and persist the H2O Field Brief PDF — the 1-2 page strategic decision aid (cover, win-win argument, fully-priced cost-of-alternative table, kill risks, do-this-next actions). Returns the PDF download URL. " +
      "Set customer.location to the SITE / sub-asset name ONLY (e.g. 'Pecos East Station'). Do NOT include city, state, or basin in customer.location — those belong in customer.county / customer.state / customer.basin and are rendered in the metadata line as '{County}, {State} ({Basin})'. " +
      "Prefer narrativeRiskCallouts to weave risk context into the prose of 'What this is' / 'What we'd propose'. Stop-flag risks belong in the kill-risk section, not as separate bordered blocks.",
    inputSchema: fieldBriefInputSchema,
    execute: (input, { toolCallId }) =>
      runArtifactTool({ ctx, kind: "field-brief", input, toolCallId }),
  }),

  generatePlaybook: tool({
    description:
      "Render and persist the H2O Conversation Playbook PDF — themed question structure (1-2 pages) the field agent uses in the next customer conversation. Returns the PDF download URL. " +
      "Use header.subStreams, header.stageIntro, and header.insight for Playbook header context. " +
      "Populate themes[].whyItMatters (1-3 strings) when each theme needs a 'Why it matters' callout panel below the theme title. " +
      "Use themes[].accentIndex to pin a specific theme palette index when theme ordering changes across revisions.",
    inputSchema: playbookInputSchema,
    execute: (input, { toolCallId }) =>
      runArtifactTool({ ctx, kind: "playbook", input, toolCallId }),
  }),

  generateAnalyticalRead: tool({
    description:
      "Render and persist the H2O Analytical Read PDF — 3-6 page evidence-tagged write-up sent upward to leadership. Returns the PDF download URL. " +
      "Subtitle (optional) should be a short evidenced framing line e.g. 'Evidenced read on the produced-water management failure at Pecos East'. " +
      "Populate subStreamsLine with the comma-separated sub-stream summary rendered as an italic muted line below the subtitle (e.g. 'Sub-streams: pipeline integrity, treatment train, stormwater segregation, H2S management, NORM streams, reuse spec, SWD integrity'). " +
      "Populate gateState and gateContent when this Analytical Read should open with a Qualification Gate amber banner ('OPEN', 'OPEN_WITH_CONDITIONS', 'CONDITIONALLY_OPEN', or 'CLOSED'). " +
      "Populate flags when this Analytical Read should open with a Compliance & Safety red banner listing flag IDs and severities (STOP, SPECIALIST, ATTENTION, CLEAR); gate banner renders above compliance banner when both are present. " +
      "Populate subStreamLens rows — the renderer auto-inlines this table inside the section whose heading matches 'Lens classification' / 'Sub-stream decomposition'. " +
      "Populate stageGapAnalysis rows — auto-inlines inside the section whose heading matches 'Stage classification' / 'Gap analysis'. " +
      "Populate costRows with row, basis, and confidence (HIGH/MEDIUM/LOW/QUALITATIVE) — auto-inlines inside the section whose heading matches 'Cost of the alternative' / 'Alternative basis'. Confidence cells are color-coded. " +
      "Populate flags — the structured flag inventory table auto-inlines inside the section whose heading matches 'Active flag inventory' / 'Compliance & safety'. " +
      "Section headings: DO NOT pre-number them (no '1.', '#1', etc.). The renderer adds its own numbering. Same for subsections — pass the bare title only. " +
      "Inline evidence anchors: pass the anchor ID via `sections[].evidenceSource` (and `subsections[].evidenceSource`) which renders as monospace `[ID]` after the body — DO NOT embed `[[...]]` notation in the body string. " +
      "Closing: populate `closingInsight` (1-2 sentences) to render a centered italic cyan-bordered callout at the very end of the document. " +
      "Populate sections[].confidenceTier (HIGH/MEDIUM/LOW) when the section's evidence quality should be tagged with a colored badge.",
    inputSchema: analyticalReadInputSchema,
    execute: (input, { toolCallId }) =>
      runArtifactTool({ ctx, kind: "analytical-read", input, toolCallId }),
  }),

  generateProposalShell: tool({
    description:
      "Render and persist the H2O Proposal Shell PDF — scoping-language seed (1-5 pages, depth scales with deal stage: one paragraph at Lead, full draft at Propose). Returns the PDF download URL. " +
      "draftIntentBanner defaults to true — renders a full-width red DRAFT INTENT banner at the top; set false only when the document is a clean copy for external distribution. " +
      "internalOnlyFooterBanner defaults to true — renders a full-width red INTERNAL ONLY banner at the bottom; set false for external copies. " +
      "Populate statusOfDocument with a status line (e.g. 'DRAFT — not for distribution') rendered below the executive summary. " +
      "Populate workPackages when the deal is at Scope or later and discrete work units can be named; renders as a DataTable with Work Package / Outcome columns. " +
      "Populate sizingRows for a KVTable of commercial shape (CAPEX range, confidence, O&M impact) when structured display is clearer than prose. " +
      "Populate outOfScope items (heading + body) to set explicit exclusions; each renders as a bold heading followed by a paragraph. " +
      "Populate gatesToClose when qualification gates remain open; renders as a two-column DataTable of gate description and closer. " +
      "Populate commitments with enriched commitment cards (label, text, optional date, optional owner).",
    inputSchema: proposalShellInputSchema,
    execute: (input, { toolCallId }) =>
      runArtifactTool({ ctx, kind: "proposal-shell", input, toolCallId }),
  }),
});
