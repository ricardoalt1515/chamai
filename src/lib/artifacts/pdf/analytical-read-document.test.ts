import { describe, expect, it } from "vitest";
import type { AnalyticalReadPayload } from "../payloads";
import {
  analyticalEvidenceTagBorderColor,
  analyticalSectionDefaultColor,
  collectTableHeaders,
  renderAnalyticalReadPdf,
} from "./analytical-read-document";
import { h2oBrand } from "./brand-tokens";

const payload: AnalyticalReadPayload = {
  customer: { location: "Prairie, TX", name: "Prairie Water", slug: "prairie-water" },
  title: "Prairie Water Analytical Read",
  summary: "Capacity strain plus NPDES horizon define the deal.",
  sections: [
    {
      heading: "Evidence base",
      body: "Flow data and permit history support the wet-weather lens.",
      evidenceTags: ["FLOW-DATA", "NPDES-RENEWAL"],
      table: [
        { Metric: "ADF (MGD)", Value: "3.4", Source: "Utility 2024 report" },
        { Metric: "Permit renewal", Value: "2027-Q2", Source: "TCEQ schedule" },
      ],
    },
    {
      heading: "Decision-maker matrix",
      body: "Utility director leads; finance committee approves capex.",
    },
  ],
};

describe("renderAnalyticalReadPdf", () => {
  it("renders a non-empty PDF from the typed Analytical Read payload", async () => {
    const pdf = await renderAnalyticalReadPdf(payload);

    expect(pdf.byteLength).toBeGreaterThan(1000);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  });
});

describe("analyticalSectionDefaultColor", () => {
  it("returns the v3 brand blue for default section markers", () => {
    expect(analyticalSectionDefaultColor()).toBe(h2oBrand.colors.blue);
  });
});

describe("collectTableHeaders", () => {
  it("extracts all unique keys from an array of row objects in order", () => {
    const rows: Array<Record<string, string>> = [
      { Metric: "ADF", Value: "3.4" },
      { Metric: "Permit", Value: "2027", Source: "TCEQ" },
    ];
    expect(collectTableHeaders(rows)).toEqual(["Metric", "Value", "Source"]);
  });

  it("returns empty array for empty input", () => {
    expect(collectTableHeaders([])).toEqual([]);
  });
});

// ─── Slice 3b RED ─────────────────────────────────────────────────────────────

describe("analyticalEvidenceTagBorderColor", () => {
  it("returns the v3 line color for evidence tag chip border", () => {
    expect(analyticalEvidenceTagBorderColor()).toBe(h2oBrand.colors.line);
  });
});
