import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { h2oBrand } from "./brand-tokens";
import { resolveH2oPdfLogoSource, stageBadgeColor } from "./shared-document";

describe("resolveH2oPdfLogoSource", () => {
  it("resolves the sidebar logo asset from public for server-side PDF rendering", () => {
    const expectedPath = join(process.cwd(), "public", "h2o-allegiant.png");

    expect(existsSync(expectedPath)).toBe(true);
    expect(resolveH2oPdfLogoSource()).toBe(expectedPath);
  });

  it("returns null for missing assets so renderers can use the fallback mark", () => {
    const missingPath = join(process.cwd(), "public", "missing-h2o-logo.png");

    expect(resolveH2oPdfLogoSource(missingPath)).toBeNull();
  });
});

describe("stageBadgeColor", () => {
  it.each([
    ["Lead", h2oBrand.colors.stage.lead],
    ["Qualify", h2oBrand.colors.stage.qualify],
    ["Scope", h2oBrand.colors.stage.scope],
    ["Position", h2oBrand.colors.stage.position],
    ["Propose", h2oBrand.colors.stage.propose],
    ["Close", h2oBrand.colors.stage.close],
  ])("maps %s to its semantic stage color", (stage, color) => {
    expect(stageBadgeColor(stage)).toBe(color);
  });

  it("uses the muted fallback for unknown stages", () => {
    expect(stageBadgeColor("Unknown")).toBe(h2oBrand.colors.stage.default);
  });
});
