import { describe, expect, it } from "vitest";
import type { PlaybookPayload } from "../payloads";
import {
  playbookContinuationLabel,
  playbookIsSubPrompt,
  playbookThemeAccentColor,
  playbookThemeHeaderAccentBorderColor,
  renderPlaybookPdf,
} from "./playbook-document";
import { h2oBrand, themePalette } from "./brand-tokens";

const payload: PlaybookPayload = {
  customer: { location: "Prairie, TX", name: "Prairie Water", slug: "prairie-water" },
  stage: "Qualify",
  title: "Prairie Water Conversation Playbook",
  orientation: "Use these themes to advance from Qualify to Scope.",
  themes: [
    {
      title: "Service area, flow, and scale",
      framing: "Anchor the conversation on capacity strain.",
      substreamTag: "Wet weather",
      questions: ["What is current average daily flow?", "When did flow last exceed permit?"],
    },
    {
      title: "Permit and regulatory pressure",
      framing: "Probe the schedule the customer is racing.",
      questions: ["What is the NPDES renewal date?", "Are surcharges already accruing?"],
    },
  ],
};

describe("renderPlaybookPdf", () => {
  it("renders a non-empty PDF from the typed Playbook payload", async () => {
    const pdf = await renderPlaybookPdf(payload);

    expect(pdf.byteLength).toBeGreaterThan(1000);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  });
});

describe("playbookThemeAccentColor", () => {
  it("returns the correct accent color for each theme index via themePalette", () => {
    expect(playbookThemeAccentColor(0)).toBe(themePalette[0]);
    expect(playbookThemeAccentColor(1)).toBe(themePalette[1]);
    expect(playbookThemeAccentColor(6)).toBe(themePalette[6]);
  });

  it("cycles back through the palette for index >= palette length", () => {
    expect(playbookThemeAccentColor(7)).toBe(themePalette[0]);
  });

  it("accent color is a valid hex string from the v3 brand palette", () => {
    const color = playbookThemeAccentColor(0);
    expect(color).toBe(h2oBrand.colors.blue);
  });
});

describe("playbookContinuationLabel", () => {
  it("returns a label containing the customer name and continued marker", () => {
    expect(playbookContinuationLabel("Prairie Water")).toBe(
      "Prairie Water · Playbook (continued)",
    );
  });
});

// ─── Slice 3b RED ─────────────────────────────────────────────────────────────

describe("playbookIsSubPrompt", () => {
  it("returns true for questions that start with an em-dash marker", () => {
    expect(playbookIsSubPrompt("— When did flow last exceed permit?")).toBe(true);
  });

  it("returns true for questions that start with an en-dash marker", () => {
    expect(playbookIsSubPrompt("– Follow-up: confirm outfall location")).toBe(true);
  });

  it("returns false for standard primary questions", () => {
    expect(playbookIsSubPrompt("What is the current average daily flow?")).toBe(false);
  });
});

describe("playbookThemeHeaderAccentBorderColor", () => {
  it("returns the same accent color as playbookThemeAccentColor for a given index", () => {
    expect(playbookThemeHeaderAccentBorderColor(0)).toBe(playbookThemeAccentColor(0));
    expect(playbookThemeHeaderAccentBorderColor(3)).toBe(playbookThemeAccentColor(3));
  });
});
