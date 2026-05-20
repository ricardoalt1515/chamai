import { describe, expect, it } from "vitest";
import type { PlaybookPayload } from "../payloads";
import { h2oBrand, themeAccentByIndex, themePalette } from "./brand-tokens";
import {
  buildPlaybookCustomerSite,
  playbookContinuationLabel,
  playbookIsSubPrompt,
  playbookPagePaddingTop,
  playbookThemeAccentColor,
  playbookThemeHeaderAccentBorderColor,
  renderPlaybookPdf,
  resolvePlaybookHeaderFields,
  resolvePlaybookThemeAccent,
  shouldRenderWhyItMatters,
} from "./playbook-document";
import { tier2ContinuationTopReserve } from "./shared-document";

const payload: PlaybookPayload = {
  customer: { location: "Prairie, TX", name: "Prairie Water", slug: "prairie-water" },
  stage: "Qualify",
  title: "Prairie Water Conversation Playbook",
  header: { insight: "Use these themes to advance from Qualify to Scope." },
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

// ─── Legacy payload — no new optional fields ──────────────────────────────────

const legacyPayload: PlaybookPayload = {
  customer: { name: "Legacy Corp", location: "Dallas, TX", slug: "legacy-corp" },
  themes: [
    {
      title: "Core theme",
      questions: ["What is the primary concern?"],
    },
  ],
};

const countPdfPages = (pdf: Buffer): number =>
  pdf.toString("latin1").match(/\/Type\s*\/Page\b/g)?.length ?? 0;

describe("renderPlaybookPdf", () => {
  it("renders a non-empty PDF from the typed Playbook payload", async () => {
    const pdf = await renderPlaybookPdf(payload);

    expect(pdf.byteLength).toBeGreaterThan(1000);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("renders a valid single-page PDF from a short legacy payload with no new optional fields", async () => {
    const pdf = await renderPlaybookPdf(legacyPayload);

    expect(pdf.byteLength).toBeGreaterThan(1000);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.toString("latin1").match(/\/Type\s*\/Page\b/g)?.length ?? 0).toBe(1);
  });

  it("uses the shared Tier 2 continuation top reserve for page body flow", () => {
    expect(playbookPagePaddingTop).toBe(tier2ContinuationTopReserve);
  });

  it("renders a forced multi-page Playbook with the continuation reserve", async () => {
    const densePayload: PlaybookPayload = {
      ...payload,
      themes: Array.from({ length: 18 }, (_, index) => ({
        title: `Dense theme ${index + 1}`,
        framing: "Use this theme to force enough body flow for a continuation page.",
        questions: Array.from(
          { length: 5 },
          (__, questionIndex) =>
            `Question ${index + 1}.${questionIndex + 1}: what evidence supports this lane?`,
        ),
      })),
    };

    const pdf = await renderPlaybookPdf(densePayload);

    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(countPdfPages(pdf)).toBeGreaterThan(1);
  });

  it("renders a valid PDF when all new optional fields are populated", async () => {
    const richPayload: PlaybookPayload = {
      customer: {
        name: "Prairie Water",
        location: "Prairie, TX",
        county: "Travis",
        state: "TX",
        basin: "Colorado River",
        slug: "prairie-water",
      },
      stage: "Qualify",
      header: {
        subStreams: ["Wet weather", "Permit", "Capital planning"],
        stageIntro: "This account is in active Qualify stage. Focus on timeline pressure.",
        insight: "NPDES renewal in 18 months creates urgent window.",
      },
      themes: [
        {
          title: "Service area, flow, and scale",
          questions: ["What is current average daily flow?", "— Follow-up on peak-day data"],
          accentIndex: 2,
          whyItMatters: ["Capacity constraint validates urgency", "Informs sizing assumptions"],
        },
        {
          title: "Permit and regulatory pressure",
          questions: ["What is the NPDES renewal date?"],
        },
      ],
    };

    const pdf = await renderPlaybookPdf(richPayload);

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

  it("delegates to themeAccentByIndex and returns the same value", () => {
    // Confirms playbookThemeAccentColor is a thin wrapper over the canonical helper
    expect(playbookThemeAccentColor(0)).toBe(themeAccentByIndex(0));
    expect(playbookThemeAccentColor(3)).toBe(themeAccentByIndex(3));
    expect(playbookThemeAccentColor(7)).toBe(themeAccentByIndex(7));
  });
});

describe("playbookContinuationLabel", () => {
  it("returns a label containing the customer name and continued marker", () => {
    expect(playbookContinuationLabel("Prairie Water")).toBe("Prairie Water · Playbook (continued)");
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

// ─── Slice D RED ──────────────────────────────────────────────────────────────

describe("buildPlaybookCustomerSite", () => {
  it("returns concatenation when location is present", () => {
    expect(buildPlaybookCustomerSite({ name: "Prairie Water", location: "Prairie, TX" })).toBe(
      "Prairie Water — Prairie, TX",
    );
  });

  it("returns name only when location is absent", () => {
    expect(buildPlaybookCustomerSite({ name: "Prairie Water" })).toBe("Prairie Water");
  });

  it("returns name only when location is undefined", () => {
    expect(buildPlaybookCustomerSite({ name: "Prairie Water", location: undefined })).toBe(
      "Prairie Water",
    );
  });
});

describe("shouldRenderWhyItMatters", () => {
  it("returns false when items is undefined", () => {
    expect(shouldRenderWhyItMatters(undefined)).toBe(false);
  });

  it("returns false when items is an empty array", () => {
    expect(shouldRenderWhyItMatters([])).toBe(false);
  });

  it("returns true when items has at least one string", () => {
    expect(shouldRenderWhyItMatters(["Validates urgency"])).toBe(true);
  });

  it("returns true when items has multiple strings", () => {
    expect(shouldRenderWhyItMatters(["Item 1", "Item 2", "Item 3"])).toBe(true);
  });
});

describe("resolvePlaybookThemeAccent", () => {
  it("uses explicit accentIndex instead of position when populated", () => {
    expect(resolvePlaybookThemeAccent({ accentIndex: 2 }, 0)).toBe(themeAccentByIndex(2));
    expect(resolvePlaybookThemeAccent({ accentIndex: 2 }, 0)).not.toBe(themeAccentByIndex(0));
  });

  it("falls back to position-based accent and wraps large indices", () => {
    expect(resolvePlaybookThemeAccent({}, themePalette.length)).toBe(themeAccentByIndex(0));
  });
});

describe("resolvePlaybookHeaderFields", () => {
  it("resolves only canonical header fields", () => {
    expect(
      resolvePlaybookHeaderFields({
        subStreams: ["Budget", "NPDES"],
        stageIntro: "Spec intro",
        insight: "Spec insight",
      }),
    ).toEqual({
      subStreamsLine: "Budget, NPDES",
      stageIntro: "Spec intro",
      insight: "Spec insight",
    });
  });

  it("leaves insight empty when no canonical header insight exists", () => {
    expect(resolvePlaybookHeaderFields(undefined).insight).toBeUndefined();
  });
});

// ─── T4-T7: Playbook TopHeader + OrientationCallout + intro + theme updates ───

describe("renderPlaybookPdf — T4-T7 TopHeader + new fields", () => {
  it("renders a valid PDF when title and subtitle are provided via payload", async () => {
    const pdf = await renderPlaybookPdf({
      ...payload,
      title: "Call Playbook",
      subtitle: "Question structure for the first operator conversation",
    });
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.byteLength).toBeGreaterThan(1000);
  });

  it("renders a valid PDF with orientationLine and introLine in header", async () => {
    const pdf = await renderPlaybookPdf({
      ...payload,
      header: {
        subStreams: ["pipeline integrity", "treatment train"],
        orientationLine:
          "Lead-stage call. No customer relationship yet. Goal is to anchor the systemic frame.",
        introLine: "Use the themes in roughly this order to guide the conversation.",
      },
    });
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.byteLength).toBeGreaterThan(1000);
  });

  it("renders without InsightBox when insight field is absent (TopHeader replaces it)", async () => {
    const pdf = await renderPlaybookPdf({
      customer: { name: "Acme Water", slug: "acme-water" },
      title: "Call Playbook",
      themes: [{ title: "Theme A", questions: ["What is the primary concern?"] }],
    });
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("renders a valid PDF with theme number size upgrade (24pt) without crashing", async () => {
    const pdf = await renderPlaybookPdf({
      customer: { name: "Prairie Water", slug: "prairie-water" },
      themes: [
        {
          title: "Service area, flow, and scale",
          framing: "Anchor the conversation on capacity strain.",
          questions: ["What is current average daily flow?"],
        },
        {
          title: "Permit and regulatory pressure",
          framing: "Probe the schedule the customer is racing.",
          questions: ["What is the NPDES renewal date?"],
        },
      ],
    });
    expect(pdf.byteLength).toBeGreaterThan(1000);
  });

  it("renders a valid PDF using legacy payload without new optional fields (backward compat)", async () => {
    const pdf = await renderPlaybookPdf(legacyPayload);
    expect(pdf.byteLength).toBeGreaterThan(1000);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  });
});

describe("resolvePlaybookHeaderFields — new fields (T4)", () => {
  it("resolves orientationLine from header", () => {
    expect(
      resolvePlaybookHeaderFields({
        orientationLine: "Lead-stage call. No relationship yet.",
      }),
    ).toMatchObject({
      orientationLine: "Lead-stage call. No relationship yet.",
    });
  });

  it("resolves introLine from header", () => {
    expect(
      resolvePlaybookHeaderFields({
        introLine: "Use the themes in roughly this order.",
      }),
    ).toMatchObject({
      introLine: "Use the themes in roughly this order.",
    });
  });

  it("returns undefined for orientationLine and introLine when header is absent", () => {
    const result = resolvePlaybookHeaderFields(undefined);
    expect(result.orientationLine).toBeUndefined();
    expect(result.introLine).toBeUndefined();
  });
});
