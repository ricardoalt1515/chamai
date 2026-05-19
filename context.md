# Code Context

## Files Retrieved
1. `src/ai/tools/h2o-artifacts.ts` (lines 1-422) - defines the four H2O artifact tool schemas, tool entry points, eager PDF rendering, S3/storage write, metadata persistence, and result URLs.
2. `src/lib/artifacts/pdf-renderer-dispatch.ts` (lines 1-32) - central kind-to-renderer switch used by the eager generation path.
3. `src/lib/artifacts/pdf/brand-tokens.ts` (lines 1-43) - current React/@react-pdf brand token source.
4. `src/lib/artifacts/pdf/shared-document.tsx` (lines 1-142) - shared React PDF primitives: logo mark, cover block, section header, insight box, footer.
5. `src/lib/artifacts/payloads.ts` (lines 1-89) - TypeScript payload shapes and filename helper for all four PDFs.
6. `src/lib/artifacts/pdf/field-brief-document.tsx` (lines 1-256) - current Field Brief renderer structure.
7. `src/lib/artifacts/pdf/playbook-document.tsx` (lines 1-141) - current Conversation Playbook renderer structure.
8. `src/lib/artifacts/pdf/analytical-read-document.tsx` (lines 1-166) - current Analytical Read renderer structure.
9. `src/lib/artifacts/pdf/proposal-shell-document.tsx` (lines 1-147) - current Proposal Shell renderer structure.
10. `src/ai/skills/h2o-allegiant-brand/SKILL.md` (lines 1-264) - design rationale, ideal brand palette, typography, callouts, cover blocks, tables, and usage rules.
11. `H2O Allegiant Discovery Agent v3/h2o-allegiant-brand-brand.py` (lines 1-1633) - Python ReportLab reference implementation for the H2O Allegiant brand primitives.

## Key Code

### Generation flow

`src/ai/tools/h2o-artifacts.ts` defines four tool schemas and four AI SDK tools:

```ts
export const ARTIFACT_INPUT_SCHEMAS: Record<ArtifactKind, ZodTypeAny> = {
  "field-brief": fieldBriefInputSchema,
  playbook: playbookInputSchema,
  "analytical-read": analyticalReadInputSchema,
  "proposal-shell": proposalShellInputSchema,
};
```

The important path is `persistArtifact` (lines 216-342):

```ts
yield { artifactType: kind, title, status: "rendering", message: "Rendering PDF…" };
const pdfBytes = await renderArtifactPdf(kind, payload);

await ctx.pdfStorage.put({ bytes: pdfBytes, kind, threadId: ctx.threadId, userId: ctx.owner.userId });

artifact = await ctx.artifactStore.putArtifact({
  customerSlug,
  kind,
  payload,
  payloadVersion: 1,
  status: "ready",
  threadId: ctx.threadId,
  title,
}, ctx.owner);
```

Behavior:
- render is eager inside the tool, before persistence;
- PDF bytes are stored before DB metadata;
- DB failure triggers cleanup of the deterministic PDF key;
- the result returns a download URL under `/api/threads/:threadId/artifacts/:kind/pdf`.

`src/lib/artifacts/pdf-renderer-dispatch.ts` (lines 16-28) routes by `ArtifactKind`:

```ts
case "field-brief": return renderFieldBriefPdf(payload as FieldBriefPayload);
case "playbook": return renderPlaybookPdf(payload as PlaybookPayload);
case "analytical-read": return renderAnalyticalReadPdf(payload as AnalyticalReadPayload);
case "proposal-shell": return renderProposalShellPdf(payload as ProposalShellPayload);
```

### Payload contracts

`src/lib/artifacts/payloads.ts` is the cross-renderer contract:
- `FieldBriefPayload` (lines 9-38): customer, stage, confidence/date/stopFlags, and four required sections.
- `PlaybookPayload` (lines 40-51): customer, optional stage/title/orientation, 1-11 themes.
- `AnalyticalReadPayload` (lines 53-63): customer, title, summary, sections with evidence tags and optional generic tables.
- `ProposalShellPayload` (lines 65-80): executive summary, scope, sizing/pricing, schedule, commitments, optional funding/risk fields.
- `pdfFilename` (line 88) slugifies customer/kind into `<customer>_<kind>.pdf`.

### Current shared React PDF tokens/primitives

`src/lib/artifacts/pdf/brand-tokens.ts` currently uses a small token set:

```ts
colors: {
  ink: "#111827", muted: "#6B7280", line: "#D8DEE8",
  panel: "#F7FAFC", panelBlue: "#EEF7FF",
  navy: "#0B1F3A", blue: "#2563EB", cyan: "#0EA5E9",
  green: "#15803D", amber: "#B45309", red: "#B91C1C", white: "#FFFFFF",
},
font: { family: "Helvetica", bold: "Helvetica-Bold" },
page: { size: "LETTER", paddingX: 44, paddingY: 40, footerY: 752 }
```

`src/lib/artifacts/pdf/shared-document.tsx` provides:
- `LogoMark` (lines 92-100): navy rounded square with text `H2O`, not the real H2O Allegiant logo.
- `CoverBlock` (lines 102-126): pale blue rounded rectangle with logo, artifact label, title, stage badge, location/date metadata.
- `SectionHeader` (lines 128-130): navy text with bottom rule.
- `InsightBox` (lines 132-134): light panel box with cyan left border.
- `Footer` (lines 136-142): fixed page count footer.

### Per-PDF renderer structure

#### Field Brief

`src/lib/artifacts/pdf/field-brief-document.tsx`:
- Styles: lines 6-111.
- `Bullet`: lines 113-121.
- `CostTable`: lines 123-154; fixed 3-column table: Component / Their path / Our proposal.
- `StopFlags`: lines 156-170; optional simple red-outlined cards.
- `FieldBriefDocument`: lines 173-253.

Structure:
1. Page 1: shared `CoverBlock`, optional stop flags, `What this is`, `What we'd propose`, win-win bullets, cost-of-alternative table, sensitivity note.
2. Page 2: `What could kill it` risk cards and `Do this next` action cards.
3. Both pages use the same footer.

#### Conversation Playbook

`src/lib/artifacts/pdf/playbook-document.tsx`:
- Styles: lines 6-84.
- `ThemeBlock`: lines 86-114; cycles `themePalette`, displays number/title/framing/substream chip/questions.
- `PlaybookDocument`: lines 116-138.

Structure: one page with shared cover, optional orientation callout, then all themes. Each theme is `wrap={false}`, so large themes may move as blocks rather than splitting gracefully.

#### Analytical Read

`src/lib/artifacts/pdf/analytical-read-document.tsx`:
- Styles: lines 6-70.
- `collectTableHeaders`: lines 72-82.
- `SectionTable`: lines 84-125; generic table built from union of row keys.
- `AnalyticalReadDocument`: lines 127-163.

Structure: one page with shared cover, summary insight box, then arbitrary sections with body, evidence tag chips, and optional generic table.

#### Proposal Shell

`src/lib/artifacts/pdf/proposal-shell-document.tsx`:
- Styles: lines 6-64.
- `BulletList`: lines 66-75.
- `ProposalShellDocument`: lines 77-144.

Structure: one page with shared cover, executive summary insight box, proposed scope bullets, sizing/pricing, schedule, commitments grid, optional funding pathway and risk allocation.

### Python reference brand module

`src/ai/skills/h2o-allegiant-brand/SKILL.md` specifies the intended identity:
- Primary colors: `BRAND_NAVY #03045E`, `BRAND_BLUE #0090F0`, `BRAND_CYAN #ADFDFF` (lines 38-53).
- Functional accents: gate/flag/text/background/border tokens (lines 55-74).
- Chart palette (lines 76-83).
- Fonts: Inter Tight / Inter / JetBrains Mono with Helvetica/Courier fallback (lines 85-118).
- Callouts: gate, flag, strategic insight, why-it-matters, theme header (lines 120-184).
- Cover templates: ideation/analytical/playbook (lines 186-206).
- Tables: comparison, decision-maker matrix, solution fit (lines 208-237).
- Usage rule: never define colors/fonts directly in the reporting skill; import from brand primitives (line 241).

`H2O Allegiant Discovery Agent v3/h2o-allegiant-brand-brand.py` implements this in ReportLab:
- Color constants: lines 45-77.
- Font discovery/registration: lines 148-208.
- Type scale/styles: lines 226-310.
- Gate callout: lines 336-383.
- Flag callout: lines 385-440.
- Strategic insight callout: lines 442-471.
- Why-it-matters callout: lines 473-509.
- Playbook theme header: lines 511-559.
- Cover templates: lines 574-662.
- Table styles: lines 665-738.
- Field Brief v2 primitives: `LogoMark` lines 825-886, `StageBadge` lines 888-943, `InsightBox` lines 945-1003, `section_header` lines 1005-1059, `kill_risk_card` lines 1061-1150, `action_card` lines 1152-1227, `cost_of_alternative_table` lines 1229-1341, `cover_block` lines 1343-1431, page-2 header/templates lines 1438-1539.

## Architecture

The current app does not call Python. The Python brand file is a reference/legacy/ideal implementation. Runtime PDF generation is entirely TypeScript + React + `@react-pdf/renderer`:

1. Agent invokes one of four tools from `createH2oArtifactTools`.
2. Tool input is validated by Zod schema in `src/ai/tools/h2o-artifacts.ts`.
3. `persistArtifact` calls `renderArtifactPdf(kind, payload)`.
4. Dispatch maps kind to one of four React document renderers.
5. Renderer returns `Buffer` via `renderToBuffer(<Document />)`.
6. PDF bytes are written through `ArtifactPdfStorage`.
7. Artifact metadata/payload is persisted through `ArtifactStore`.
8. Tool returns PDF download metadata.

Renderer dependencies are shallow:
- all four renderers import payload types from `payloads.ts`;
- all four renderers import `h2oBrand` and some shared primitives;
- only Playbook imports `themePalette`;
- Field Brief has the most bespoke local components; Analytical/Proposal are generic and comparatively thin.

## Gaps vs Python Reference / Ideal Brand

No screenshot files were provided/read in this scouting pass, so screenshot gaps are inferred from the Python reference and brand skill.

1. Brand colors do not match the reference.
   - Current navy/blue/cyan: `#0B1F3A`, `#2563EB`, `#0EA5E9`.
   - Reference navy/blue/cyan: `#03045E`, `#0090F0`, `#ADFDFF`.
   - Current muted/body/border/background tokens also differ from `MUTED_TEXT #64748B`, `BODY_TEXT #0F172A`, `BORDER_NEUTRAL #CBD5E1`, `LIGHT_BG_NAVY #E8E9F4`, `LIGHT_BG_CYAN #F0FDFF`.

2. Typography is much simpler.
   - Current renderer uses Helvetica/Helvetica-Bold only.
   - Reference expects Inter Tight for headings, Inter for body, JetBrains Mono for evidence tags/IDs, with fallback.
   - Current renderer has no font registration path.

3. Logo is a placeholder.
   - Current `LogoMark` is a navy square containing `H2O`.
   - Reference `LogoMark` embeds actual PNG/SVG logo with fallback text.

4. Shared cover block is not the reference Field Brief cover.
   - Current cover is a large rounded blue panel with artifact label, title, pill, metadata.
   - Reference Field Brief v2 cover is a compact top row: real logo left, stage badge right, customer name, meta line, horizontal rule.
   - Reference later pages include a page-2+ top anchor header; current React renderer only uses fixed footers.

5. Field Brief card components are visually weaker/different.
   - Current risk cards use a left amber border for all risks; reference uses ranked colored circles, red for rank 1 and amber for others.
   - Current action cards use simple numbered titles; reference uses blue numbered boxes and inline blue timeframe.
   - Current section headers are bottom-rule headers; reference uses marker-dot section headers with category colors.
   - Current insight boxes are close in concept but use different colors, rounded box, and regular text; reference uses light navy tint, 3pt brand-blue left line, bold brand-navy text.

6. Cost-of-alternative table is similar structurally but not equivalent.
   - Both are 3-column tables.
   - Current table uses navy header, rounded border, generic total-row background.
   - Reference uses compact padding, light grey header, light navy total row, red/green total values, separator lines instead of full grid, and specific width ratios.

7. Gate/flag callouts are absent from React renderers.
   - Python reference has `gate_callout` and `flag_callout` for ideation/analytical covers.
   - Current schemas only expose `stopFlags` for Field Brief; no gate state/content or structured flag severity exists in current payloads.

8. Strategic/why-it-matters callouts are absent or underspecified.
   - Python has `strategic_insight_callout` and `why_it_matters_callout`.
   - Current Playbook only has orientation and question lists; no `whyItMatters` payload field.
   - Current Analytical/Proposal use generic `InsightBox`; no closing strategic insight field.

9. Analytical Read and Proposal Shell are generic shells, not deeply branded domain artifacts.
   - Analytical sections are arbitrary body/evidence/table blocks; no gate/flag cover, decision-maker matrix, solution-fit table, or strategic closing callout.
   - Proposal Shell has no specific Python cover primitive in the reference file beyond shared/report primitives; current renderer is serviceable but minimal.

10. Page count/layout behavior may diverge from requested artifact lengths.
   - Tool descriptions say Field Brief 1-2 pages, Playbook 1-2 pages, Analytical 3-6 pages, Proposal 1-5 pages.
   - Current Playbook/Analytical/Proposal render all content under a single `<Page>` and rely on React PDF wrapping; Field Brief is always exactly two declared pages.
   - No later-page headers except footers.

## Concrete Implementation Levers

1. Replace `brand-tokens.ts` values with reference token names/values.
   - Add direct equivalents for `BRAND_NAVY`, `BRAND_BLUE`, `BRAND_CYAN`, gate colors, flag colors, text colors, light backgrounds, border, chart palette.
   - Keep backward-compatible aliases (`navy`, `blue`, etc.) if minimizing diff.

2. Add font registration for React PDF.
   - Use `Font.register` from `@react-pdf/renderer` if font assets are packaged.
   - Mirror Python fallback semantics: Inter/Inter Tight/JetBrains Mono when available, Helvetica/Courier fallback otherwise.
   - Update evidence tags to use mono font.

3. Port Python primitives into `shared-document.tsx` or split by primitive category.
   - `RealLogoMark` / improved `LogoMark`.
   - `StageBadge` with stage-to-color mapping.
   - Field Brief `CoverBlock` variant matching Python `cover_block`.
   - `LaterPageHeader` equivalent may require per-page fixed top header components in React PDF.
   - `SectionHeader` with marker-dot and category color.
   - `InsightBox` with reference tint/left accent/bold text.
   - `RiskCard`, `ActionCard`, `CostOfAlternativeTable` as shared Field Brief primitives.

4. Expand payload schemas only where required by target visuals.
   - Gate/flag callouts require payload fields for gate state/content and flag severity/list.
   - Playbook why-it-matters requires per-theme `whyItMatters?: string[]` or similar.
   - Analytical strategic closing/gate/flag/structured matrix tables require schema additions.
   - Any schema change must update both `src/ai/tools/h2o-artifacts.ts` Zod schemas and `src/lib/artifacts/payloads.ts` types.

5. Migrate Field Brief first.
   - It has the richest Python v2 primitives and the current React renderer is closest structurally.
   - High-impact files: `brand-tokens.ts`, `shared-document.tsx`, `field-brief-document.tsx`.
   - No schema change is necessary for initial visual parity except maybe better logo/date/regression support; gate/flag expansion can be a later pass.

6. Then migrate Playbook theme/header/callout.
   - `themePalette` should match Python chart palette.
   - Theme header is already structurally similar; update colors/typography and optionally add `whyItMatters` payload support.

7. Treat Analytical Read as a schema/design decision, not just styling.
   - Current generic sections cannot reproduce Python-specific gate/flag cover, decision-maker matrix, solution-fit table, or strategic insight without more structured payload fields.

8. Add visual regression fixtures if screenshots are the acceptance target.
   - Generate PDFs from deterministic payload fixtures.
   - Compare rendered page images or at least inspect snapshot PDFs manually.
   - Existing code has no visible screenshot-based test harness in the files read.

## Start Here

Start with `src/lib/artifacts/pdf/brand-tokens.ts`, then `src/lib/artifacts/pdf/shared-document.tsx`, then `src/lib/artifacts/pdf/field-brief-document.tsx`.

Reason: most visual gaps are token/shared-primitive gaps. Updating these first gives all four PDFs a common brand foundation and lets the Field Brief become the first concrete parity target against the Python v2 primitives.
