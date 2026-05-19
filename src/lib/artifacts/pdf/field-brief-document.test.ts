import { describe, expect, it } from "vitest";
import type { FieldBriefPayload } from "../payloads";
import { h2oBrand } from "./brand-tokens";
import {
  costRowStyleRole,
  fieldBriefContinuationLabel,
  riskRankColor,
  renderFieldBriefPdf,
  sectionMarkerColor,
  splitCostRowsForTwoPageBrief,
} from "./field-brief-document";

const countPdfPages = (pdf: Buffer): number =>
  pdf.toString("latin1").match(/\/Type\s*\/Page\b/g)?.length ?? 0;

const payload: FieldBriefPayload = {
  customer: { location: "Prairie, TX", name: "Prairie Water", slug: "prairie-water" },
  stage: "Qualify",
  confidence: "MEDIUM",
  date: "2026-05-15",
  stopFlags: [{ title: "Budget timing", summary: "Capital approval may slip." }],
  sections: {
    whatThisIs: {
      insight: "Lagoon pressure is the deal driver.",
      body: "Evidence points to capacity strain and NPDES schedule pressure.",
    },
    whatWeWouldPropose: {
      insight: "Lead with modular capacity and avoided surcharge exposure.",
      recommendedApproach: "Modular treatment-stage expansion with a narrow first-phase scope.",
      winWinArguments: [
        { lead: "Avoid delay", body: "Keeps the customer ahead of permit pressure." },
        { lead: "Control spend", body: "Makes the capital request easier to stage." },
      ],
      costOfAlternativeRows: [
        { component: "Delay", theirPath: "$1M+ exposure", ourProposal: "Controlled capex" },
        { component: "Total", theirPath: "Unbounded", ourProposal: "Phased", isTotal: true },
      ],
      dealSizeSensitivity: "Validate budget range before promising final design.",
    },
    whatCouldKillIt: {
      insight: "Budget timing can stall the deal.",
      risks: [
        {
          name: "Budget freeze",
          mechanism: "Capital window slips.",
          mitigation: "Anchor phased scope.",
        },
      ],
    },
    doThisNext: {
      insight: "Close the data gap this week.",
      actions: [
        { title: "Ask for NPDES schedule", timeframe: "7 days", body: "Confirm deadlines." },
        {
          title: "Map decision roles",
          timeframe: "14 days",
          body: "Identify utility and finance owners.",
        },
        { title: "Draft scope", timeframe: "21 days", body: "Prepare modular option." },
      ],
    },
  },
};

const richPayload: FieldBriefPayload = {
  ...payload,
  customer: {
    location: "Reeves County, TX",
    name: "Llano Vista Midstream — Pecos East Station",
    slug: "llano-vista",
  },
  stopFlags: [
    {
      title: "H2S active worker safety hazard",
      summary:
        "Portable monitor detected H2S at offload bay and EQ tanks. No fixed detection on site. Active inhalation pathway creates safety and liability exposure.",
    },
    {
      title: "Unpermitted surface discharge",
      summary:
        "Stormwater pond emergency spillway released produced-water-contaminated effluent to ephemeral drainage with multiple off-site exceedances.",
    },
  ],
  sections: {
    ...payload.sections,
    whatThisIs: {
      insight:
        "This isn't three discrete incidents — it is a systemic produced-water management failure across five systems, with brine and BTEX confirmed in off-site drainage right now.",
      body: `${payload.sections.whatThisIs.body} The facility has no TPDES/NPDES authorization for any surface discharge, and the enforcement exposure is live across TCEQ, RRC, and OSHA.`,
    },
    whatWeWouldPropose: {
      ...payload.sections.whatWeWouldPropose,
      recommendedApproach:
        "Phase 1: transfer-line integrity investigation, stormwater remediation, NORM characterization, H2S controls, manifest audit, and regulatory disclosure. Phase 2: separation, filtration, dosing automation, closed-loop segregation, disposal-well remediation, SCADA rationalization, training, and SOP package.",
      winWinArguments: [
        ...payload.sections.whatWeWouldPropose.winWinArguments,
        {
          lead: "Close safety exposure",
          body: "Fixed detection and controls remove the fastest-moving OSHA risk.",
        },
      ],
      costOfAlternativeRows: [
        {
          component: "Phase 1 point fix",
          theirPath: "$200K–$400K",
          ourProposal: "$800K–$2M integrated stabilization",
        },
        {
          component: "Civil penalties",
          theirPath: "$3M–$10M+ risk",
          ourProposal: "Mitigated through proactive disclosure",
        },
        {
          component: "NORM soil",
          theirPath: "$500K–$2M forced scope",
          ourProposal: "$200K–$600K controlled scope",
        },
        {
          component: "H2S incident",
          theirPath: "Material, uncapped",
          ourProposal: "$50K–$150K controls",
        },
        {
          component: "Reuse rejection",
          theirPath: "$300K–$800K/yr",
          ourProposal: "Eliminated after remediation",
        },
        {
          component: "5-year total",
          theirPath: "$5M–$15M+ uncapped",
          ourProposal: "$4M–$11.5M closed",
          isTotal: true,
        },
      ],
    },
    whatCouldKillIt: {
      insight:
        "Speed is the variable. The enforcement clock is running and point-fix contractors are the default.",
      risks: [
        {
          name: "Enforcement-forced fast path",
          mechanism:
            "If regulators issue formal written notice before we engage, legal counsel directs a minimum corrective-action procurement.",
          mitigation: "Engage immediately and lead with the regulatory disclosure package.",
        },
        {
          name: "No capital-authority decision maker",
          mechanism:
            "Facility EHS managers typically cannot commit remediation capex without corporate approval.",
          mitigation: "Map the approval chain in the first call.",
        },
        {
          name: "Point-fix contractors frame the scope",
          mechanism:
            "Pipeline and pond-liner contractors are faster to mobilize and cheaper on the visible scope.",
          mitigation: "Use the five-year cost table to show why point fixes are not cheaper.",
        },
      ],
    },
  },
};

describe("Field Brief v3 visual helpers", () => {
  it("maps section marker colors to the v3 reference categories", () => {
    expect(sectionMarkerColor("what-this-is")).toBe(h2oBrand.colors.blue);
    expect(sectionMarkerColor("what-we-would-propose")).toBe(h2oBrand.colors.green);
    expect(sectionMarkerColor("what-could-kill-it")).toBe(h2oBrand.colors.red);
    expect(sectionMarkerColor("do-this-next")).toBe(h2oBrand.colors.navy);
  });

  it("uses stop severity for the first risk and amber severity for follow-up risks", () => {
    expect(riskRankColor(1)).toBe(h2oBrand.colors.severity.stop);
    expect(riskRankColor(2)).toBe(h2oBrand.colors.severity.specialist);
    expect(riskRankColor(3)).toBe(h2oBrand.colors.severity.specialist);
  });

  it("classifies cost table rows so total cells get red/green emphasis", () => {
    expect(costRowStyleRole({ isTotal: false, column: "theirPath" })).toBe("body");
    expect(costRowStyleRole({ isTotal: true, column: "theirPath" })).toBe("total-negative");
    expect(costRowStyleRole({ isTotal: true, column: "ourProposal" })).toBe("total-positive");
  });

  it("builds the page-2 continuation header label from the customer name", () => {
    expect(fieldBriefContinuationLabel("Llano Vista Midstream")).toBe(
      "Llano Vista Midstream · Field Brief (continued)",
    );
  });

  it("splits dense cost rows so page 1 keeps only a compact table opening", () => {
    const rows = richPayload.sections.whatWeWouldPropose.costOfAlternativeRows;

    expect(splitCostRowsForTwoPageBrief(rows)).toMatchObject({
      pageOneRows: rows.slice(0, 2),
      pageTwoRows: rows.slice(2),
    });
  });
});

describe("renderFieldBriefPdf", () => {
  it("renders a non-empty PDF from the typed Field Brief payload", async () => {
    const pdf = await renderFieldBriefPdf(payload);

    expect(pdf.byteLength).toBeGreaterThan(1000);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("keeps a dense reference-like Field Brief to two rendered PDF pages", async () => {
    const pdf = await renderFieldBriefPdf(richPayload);

    expect(countPdfPages(pdf)).toBeLessThanOrEqual(2);
  });
});
