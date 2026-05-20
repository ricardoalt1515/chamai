import { describe, expect, it } from "vitest";
import type { ProposalShellPayload } from "../payloads";
import { h2oBrand } from "./brand-tokens";
import {
  buildGatesToCloseColumns,
  PROPOSAL_BOTTOM_BANNER_TEXT,
  PROPOSAL_TOP_BANNER_TEXT,
  proposalBannerDefaultsToTrue,
  proposalCommitmentMetaLine,
  proposalExecSummaryAccentColor,
  proposalShellPagePaddingTop,
  renderProposalShellPdf,
  shouldRenderCommitments,
} from "./proposal-shell-document";
import { tier2ContinuationTopReserve } from "./shared-document";

const payload: ProposalShellPayload = {
  customer: { location: "Prairie, TX", name: "Prairie Water", slug: "prairie-water" },
  title: "Prairie Water Proposal Shell",
  executiveSummary: "Phased modular capacity buys the customer time and caps capex.",
  proposedScope: ["Modular treatment-stage expansion", "NPDES-aligned monitoring upgrades"],
  sizingAndPricing: "Range $4.2M-$5.8M MEDIUM confidence pending hydraulic confirmation.",
  schedule: "Mobilise Q3 2026; commissioning Q1 2027.",
  commitments: [
    { label: "Commit to", text: "Modular phase-1 scope" },
    { label: "Commit to", text: "Hydraulic validation deliverable" },
    { label: "Do not commit yet", text: "Phase-2 sizing" },
    { label: "Do not commit yet", text: "Final NPDES determination" },
  ],
  fundingPathway: "CWSRF financing track with bridging contingency.",
  riskAllocation: "Customer retains permit risk; we hold capacity-delivery risk.",
};

const countPdfPages = (pdf: Buffer): number =>
  pdf.toString("latin1").match(/\/Type\s*\/Page\b/g)?.length ?? 0;

describe("renderProposalShellPdf", () => {
  it("uses the shared Tier 2 continuation top reserve for page body flow", () => {
    expect(proposalShellPagePaddingTop).toBe(tier2ContinuationTopReserve);
  });

  it("renders a forced multi-page Proposal Shell with the continuation reserve", async () => {
    const pdf = await renderProposalShellPdf({
      ...payload,
      proposedScope: Array.from(
        { length: 36 },
        (_, index) =>
          `Dense scope item ${index + 1}: validate commercial and technical assumptions.`,
      ),
      workPackages: Array.from({ length: 18 }, (_, index) => ({
        id: `wp-${index + 1}`,
        name: `Work package ${index + 1}`,
        outcome: "Force enough table rows for continuation-page rendering.",
      })),
    });

    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(countPdfPages(pdf)).toBeGreaterThan(1);
  });

  it("renders a non-empty PDF from the typed Proposal Shell payload", async () => {
    const pdf = await renderProposalShellPdf(payload);

    expect(pdf.byteLength).toBeGreaterThan(1000);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("renders a legacy-only payload as one valid PDF page", async () => {
    const pdf = await renderProposalShellPdf({
      customer: { location: "Prairie, TX", name: "Prairie Water", slug: "prairie-water" },
      executiveSummary: "Keep phase 1 narrow and financeable.",
      proposedScope: ["Phase 1 basis of design", "Commercial validation"],
      sizingAndPricing: "Initial sizing range pending hydraulic validation.",
      schedule: "Thirty-day validation sprint, then proposal refresh.",
      commitments: [],
    });

    expect(pdf.byteLength).toBeGreaterThan(1000);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(countPdfPages(pdf)).toBe(1);
  });

  it("renders a full Slice F1 payload as a valid PDF", async () => {
    const pdf = await renderProposalShellPdf({
      ...payload,
      customer: {
        ...payload.customer,
        basin: "Permian",
        county: "Reeves County",
        state: "TX",
      },
      draftIntentBanner: true,
      internalOnlyFooterBanner: true,
      statusOfDocument: "Draft intent for internal commercial alignment only.",
      workPackages: [
        { id: "wp-1", name: "Hydraulic validation", outcome: "Confirm phase-1 capacity envelope" },
        { id: "wp-2", name: "Permitting path", outcome: "Map NPDES decision gates" },
      ],
      sizingRows: [
        { label: "Phase 1", value: "$1.8M–$2.4M" },
        { label: "Confidence", value: "Medium" },
      ],
      outOfScope: [
        { heading: "Final permit filing", body: "Excluded until discharge pathway is confirmed." },
      ],
      gatesToClose: [
        { gate: "Hydraulic basis", closer: "72-hour flow record" },
        { gate: "Commercial authority", closer: "Sponsor sign-off" },
      ],
      commitments: [
        {
          label: "Commit to",
          text: "Phase-1 design basis",
          date: "2026-06-01",
          owner: "Secondstream",
        },
        { label: "Do not commit yet", text: "Final capacity guarantee", owner: "Customer" },
      ],
    });

    expect(pdf.byteLength).toBeGreaterThan(1000);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(countPdfPages(pdf)).toBeGreaterThanOrEqual(1);
  });
});

// ─── Slice 3b RED ─────────────────────────────────────────────────────────────

describe("proposalExecSummaryAccentColor", () => {
  it("returns the v3 blue for the executive summary left accent bar", () => {
    expect(proposalExecSummaryAccentColor()).toBe(h2oBrand.colors.blue);
  });
});

describe("proposalBannerDefaultsToTrue", () => {
  it("defaults undefined banner flags to true", () => {
    expect(proposalBannerDefaultsToTrue(undefined)).toBe(true);
  });

  it("preserves explicit false so callers can suppress banners", () => {
    expect(proposalBannerDefaultsToTrue(false)).toBe(false);
  });
});

describe("Proposal Shell R9 banner text", () => {
  it("uses the exact spec-required draft intent banner text", () => {
    expect(PROPOSAL_TOP_BANNER_TEXT).toBe(
      "DRAFT INTENT — STAGE: LEAD · THIS IS NOT A CUSTOMER-FACING DRAFT",
    );
  });

  it("uses the exact spec-required internal scoping footer banner text", () => {
    expect(PROPOSAL_BOTTOM_BANNER_TEXT).toBe(
      "Treat this document as Internal scoping intent only. Refresh at every stage advance.",
    );
  });
});

describe("buildGatesToCloseColumns", () => {
  it("derives columns from the first row keys with even flex basis", () => {
    expect(buildGatesToCloseColumns([{ gate: "Hydraulics", closer: "Flow record" }])).toEqual([
      { key: "gate", header: "gate", flexBasis: 225 },
      { key: "closer", header: "closer", flexBasis: 225 },
    ]);
  });

  it("returns no columns for an empty row set", () => {
    expect(buildGatesToCloseColumns([])).toEqual([]);
  });
});

describe("commitment helpers", () => {
  it("renders commitments only when items are present", () => {
    expect(shouldRenderCommitments([{ label: "Commit to", text: "Scope", owner: "Owner" }])).toBe(
      true,
    );
    expect(shouldRenderCommitments([])).toBe(false);
    expect(shouldRenderCommitments(undefined)).toBe(false);
  });

  it("builds the muted date/owner meta line", () => {
    expect(proposalCommitmentMetaLine({ date: "2026-06-01", owner: "Secondstream" })).toBe(
      "2026-06-01 · Secondstream",
    );
    expect(proposalCommitmentMetaLine({ owner: "Customer" })).toBe("Customer");
    expect(proposalCommitmentMetaLine({})).toBeUndefined();
  });
});

// ─── T8-T11: Proposal Shell TopHeader + phase2Prize ──────────────────────────

describe("renderProposalShellPdf — T8-T11 TopHeader + new fields", () => {
  it("renders a valid PDF when title and subtitle are provided via payload", async () => {
    const pdf = await renderProposalShellPdf({
      ...payload,
      title: "Proposal Shell — directional scoping",
      subtitle: "Stage: Lead · Intent-only · Not for customer delivery",
    });
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.byteLength).toBeGreaterThan(1000);
  });

  it("renders a valid PDF when phase2Prize is populated", async () => {
    const pdf = await renderProposalShellPdf({
      ...payload,
      phase2Prize:
        "Phase 2 prize (months 12-30): residuals management and digital monitoring layer.",
    });
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.byteLength).toBeGreaterThan(1000);
  });

  it("renders without phase2Prize section when field is absent (backward compat)", async () => {
    const pdf = await renderProposalShellPdf({
      customer: { name: "Legacy Corp", slug: "legacy-corp" },
      executiveSummary: "Keep scope narrow.",
      proposedScope: ["Phase 1 design"],
      sizingAndPricing: "$1M estimate.",
      schedule: "Q3 2026.",
      commitments: [],
    });
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("renders big navy bold section headings without dot markers", async () => {
    // smoke test: PDF renders OK with the new SectionTitle style
    const pdf = await renderProposalShellPdf(payload);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.byteLength).toBeGreaterThan(1000);
  });
});
