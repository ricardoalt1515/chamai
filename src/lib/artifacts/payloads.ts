import type { ArtifactKind } from "./artifact-store";

export type ArtifactCustomer = {
  name: string;
  location?: string;
  slug?: string;
  /** County for MinimalHeader metadata line: "{County}, {State} ({Basin})? · {Date}" */
  county?: string;
  /** State abbreviation for MinimalHeader metadata line */
  state?: string;
  /** Sub-basin or watershed name. Omitted from metadata when absent. */
  basin?: string;
};

export type FieldBriefPayload = {
  customer: ArtifactCustomer;
  stage: string;
  confidence?: string;
  date?: string;
  stopFlags?: Array<{ title: string; summary: string }>;
  /**
   * Opt-in narrative risk callouts. When populated, renders risk context woven
   * into the prose instead of separate bordered stop-flag blocks. Both fields
   * can coexist; the renderer applies suppression at render time (Slice C).
   */
  narrativeRiskCallouts?: string[];
  sections: {
    whatThisIs: { insight: string; body: string };
    whatWeWouldPropose: {
      insight: string;
      recommendedApproach: string;
      winWinArguments: Array<{ lead: string; body: string }>;
      costOfAlternativeRows: Array<{
        component: string;
        theirPath: string;
        ourProposal: string;
        isTotal?: boolean;
      }>;
      dealSizeSensitivity?: string;
    };
    whatCouldKillIt: {
      insight: string;
      risks: Array<{ name: string; mechanism: string; mitigation: string }>;
    };
    doThisNext: {
      insight: string;
      actions: Array<{ title: string; timeframe: string; body: string }>;
    };
  };
};

export type PlaybookPayload = {
  customer: ArtifactCustomer;
  stage?: string;
  title?: string;
  subtitle?: string;
  /** Document-level header fields for TopHeader rendering. */
  header?: {
    /** Rendered as comma-separated sub-stream summary when populated. */
    subStreams?: string[];
    /** Rendered as the italic opening stage paragraph when populated. */
    stageIntro?: string;
    /** Rendered as the opening insight box when populated. */
    insight?: string;
    /** Orientation callout — grey-bordered italic block below TopHeader. */
    orientationLine?: string;
    /** Italic intro paragraph below the orientation callout. */
    introLine?: string;
  };
  themes: Array<{
    title: string;
    framing?: string;
    questions: string[];
    substreamTag?: string;
    /** 1–3 items for WhyItMattersCallout panel below the theme title. */
    whyItMatters?: string[];
    /** Explicit 0-based palette index. When absent uses position in array. */
    accentIndex?: number;
  }>;
};

export type AnalyticalReadPayload = {
  customer: ArtifactCustomer;
  title?: string;
  subtitle?: string;
  subStreamsLine?: string;
  closingInsight?: string;
  summary: string;
  /** Qualification Gate state. Renders amber QUALIFICATION GATE banner when present. */
  gateState?: "OPEN" | "OPEN_WITH_CONDITIONS" | "CONDITIONALLY_OPEN" | "CLOSED";
  /** Narrative explanation for the gate banner. */
  gateContent?: string;
  /** Compliance & Safety flags. Renders red banner with flag list when present. */
  flags?: Array<{
    id: string;
    severity: "STOP" | "SPECIALIST" | "ATTENTION" | "CLEAR";
    evidence: string;
    status?: string;
  }>;
  /** Sub-stream lens DataTable rows. */
  subStreamLens?: Array<{
    subStream: string;
    activeCondition: string;
    evidenceAnchor: string;
  }>;
  /** Stage gap analysis DataTable rows. */
  stageGapAnalysis?: Array<{
    required: string;
    status: string;
    source: string;
  }>;
  /** Cost-of-alternative rows. Confidence cells color-coded at render time. */
  costRows?: Array<{
    row: string;
    basis: string;
    confidence: "HIGH" | "MEDIUM" | "LOW" | "QUALITATIVE";
  }>;
  sections: Array<{
    heading: string;
    body: string;
    evidenceTags?: string[];
    table?: Array<Record<string, string>>;
    /** Inline evidence anchor reference rendered in small-caps after body. */
    evidenceSource?: string;
    /** Evidence quality tier for colored badge rendering. */
    confidenceTier?: "HIGH" | "MEDIUM" | "LOW";
    /** Explicit 1-based section number. When absent uses array position. */
    index?: number;
    /** Decimal subsections e.g. "3.1 Title". */
    subsections?: Array<{
      heading: string;
      body: string;
      evidenceSource?: string;
    }>;
  }>;
};

export type ProposalShellPayload = {
  customer: ArtifactCustomer;
  title?: string;
  subtitle?: string;
  phase2Prize?: string;
  executiveSummary: string;
  proposedScope: string[];
  sizingAndPricing: string;
  schedule: string;
  commitments: Array<{
    label: string;
    text: string;
    date?: string;
    owner?: string;
  }>;
  fundingPathway?: string;
  riskAllocation?: string;
  /** When true (default), renders full-width red DRAFT INTENT banner at top. */
  draftIntentBanner?: boolean;
  /** When true (default), renders full-width red INTERNAL ONLY banner at bottom. */
  internalOnlyFooterBanner?: boolean;
  /** Status line paragraph rendered below the executive summary. */
  statusOfDocument?: string;
  /** Work packages DataTable (navy-dark header). Renders when non-empty. */
  workPackages?: Array<{ id: string; name: string; outcome: string }>;
  /** Commercial shape KVTable rows. Renders when non-empty. */
  sizingRows?: Array<{ label: string; value: string }>;
  /** Out-of-scope items. Each renders as bold heading + paragraph. */
  outOfScope?: Array<{ heading: string; body: string }>;
  /** Gate-close DataTable rows. Renders when non-empty. */
  gatesToClose?: Array<{ gate: string; closer: string }>;
};

const slugify = (value: string): string => {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "artifact";
};

export const pdfFilename = (customerSlug: string | null | undefined, kind: ArtifactKind): string =>
  `${slugify(customerSlug ?? "artifact")}_${kind}.pdf`;
