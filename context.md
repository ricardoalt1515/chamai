# Code Context

## Files Retrieved
1. `package.json` (lines 1-84) - script/dependency source of truth; `test` is `vitest run`, no `@react-pdf/renderer` dependency yet.
2. `docs/agent-audit-and-artifact-plan.md` (lines 259-318) - §6 PDF stack/route/Field Brief visual gate.
3. `openspec/changes/add-h2o-downloadable-artifacts/tasks.md` (lines 1-111) - corrective PR3A scope and test expectations.
4. `openspec/changes/add-h2o-downloadable-artifacts/design.md` (lines 150-184) - affected files and slice plan; broader items must be deferred.
5. `openspec/changes/add-h2o-downloadable-artifacts/specs/h2o-downloadable-artifacts/spec.md` (lines 1-119) - PDF-first requirements and explicit non-goals.
6. `src/ai/tools/h2o-artifacts.ts` (lines 1-250) - artifact schemas, tool result contract, and current Markdown-only URLs.
7. `src/lib/artifacts/artifact-store.ts` (lines 1-101) - artifact kinds/store API; no PDF metadata needed for on-demand route rendering.
8. `src/lib/artifacts/markdown-renderers.ts` (lines 1-321) - Field Brief payload type and filename helper usable for `.pdf` names.
9. `app/api/threads/[threadId]/artifacts/[kind]/[format]/route.ts` (lines 1-93) - download handler; currently returns 501 for all PDFs.
10. `app/api/threads/[threadId]/artifacts/[kind]/[format]/route.test.ts` (lines 1-187) - route coverage; last test asserts PDF 501 and must flip for Field Brief only.
11. `src/ai/tools/h2o-artifacts.test.ts` (lines 120-173) - tool test currently asserts Markdown-only and no PDF.
12. `src/lib/artifacts/markdown-renderers.test.ts` (lines 1-58) and `src/lib/artifacts/markdown-renderers.pr2.test.ts` (lines 1-112) - existing markdown tests; mostly leave as mirror coverage.
13. `next.config.ts` (lines 1-12) - may need `serverExternalPackages` if React-PDF fails under Next App Router.
14. `H2O Allegiant Discovery Agent v3/Reference/render_field_brief.py` (lines 1-290) - canonical Field Brief structure/content flow.
15. `H2O Allegiant Discovery Agent v3/h2o-allegiant-brand-brand.py` (lines 1-220, 825-1496 by grep) - brand tokens and Field Brief primitives to port conceptually.
16. `/Users/ricardoaltamirano/Developer/SecondStream/backend/app/services/pdf_renderer.py` (lines 1-52) - older server-side PDF precedent, but WeasyPrint/Jinja not the selected implementation here.
17. `/Users/ricardoaltamirano/Developer/SecondStream/frontend/components/chat-ui/pdf-document-card.tsx` (lines 1-220) - older UI precedent only; out of PR3A scope unless tool output card becomes necessary later.

## Key Code

### Current route behavior to change
`app/api/threads/[threadId]/artifacts/[kind]/[format]/route.ts` currently authenticates owner, checks thread ownership, fetches the active artifact, then hard-fails PDF:

```ts
if (format === "pdf") {
  return textResponse(
    "PDF rendering is not available for this artifact yet.",
    501,
    "ARTIFACT_FORMAT_UNAVAILABLE",
  );
}
```

For corrective PR3A, change only `kind === "field-brief" && format === "pdf"` to render a real PDF. Keep Playbook/Analytical/Proposal PDF paths unavailable.

### Current Field Brief tool contract to change
`src/ai/tools/h2o-artifacts.ts` has a generic `persistArtifact()` returning only Markdown:

```ts
formats: [{
  format: "md",
  mediaType: "text/markdown",
  filename: filename(...),
  downloadUrl: artifactUrl(ctx, kind),
}]
```

`generateFieldBrief.description` also says PDF is not available. For PR3A, update Field Brief result only to include PDF (`/api/threads/${threadId}/artifacts/field-brief/pdf`, `application/pdf`, `.pdf`). Do not advertise PDF for other artifact kinds yet.

### Typed Field Brief payload exists
`src/lib/artifacts/markdown-renderers.ts` defines `FieldBriefPayload` with:
- `customer`, `stage`, optional `confidence/date/stopFlags`
- four fixed sections: `whatThisIs`, `whatWeWouldPropose`, `whatCouldKillIt`, `doThisNext`
- cost table rows, kill risks, and exactly three action cards by schema in `h2o-artifacts.ts`

Use this payload directly for PDF rendering. Do not introduce Markdown-to-PDF conversion.

### H2O v3 Field Brief reference
Reference implementation is `H2O Allegiant Discovery Agent v3/Reference/render_field_brief.py`:
- cover: `cover_block(customer_name, location, stage, date_str)` (lines 92-97)
- sections: What this is, What we'd propose, What could kill it, Do this next (lines 99-290)
- mandatory elements: `InsightBox`, `cost_of_alternative_table`, `kill_risk_card`, `action_card`, page break before sections 3/4

Brand primitives/tokens are in `H2O Allegiant Discovery Agent v3/h2o-allegiant-brand-brand.py`:
- colors/font fallback: lines 35-142
- Field Brief primitives: `LogoMark` 825, `StageBadge` 888, `InsightBox` 945, `section_header` 1005, `kill_risk_card` 1061, `action_card` 1152, `cost_of_alternative_table` 1229, `cover_block` 1343, `later_page_header` 1438, `build_field_brief_templates` 1494.

## Architecture

- Artifact generation tools persist typed JSON payloads through `ArtifactStore`; downloads are generated on demand by the Next route.
- The route owns authentication/authorization: `getCurrentOwner()`, `getThread(threadId)`, then `artifactStore.getActiveArtifact(threadId, kind, owner)`.
- Markdown mirror is generated on demand from the same payload; PR3A should add a parallel PDF renderer boundary under `src/lib/artifacts/pdf/*`.
- Keep `@react-pdf/renderer` imports out of chat Lambda/tool code. Route can import a small seam such as `renderArtifactPdf()` or `renderFieldBriefPdf()` from `src/lib/artifacts/pdf`.

## Exact Files / Functions to Edit

1. `package.json` (+ `bun.lock`) - add runtime dependency `@react-pdf/renderer`.
2. `next.config.ts` - only if spike/test shows Next 16 App Router bundling requires externalization; likely setting is `serverExternalPackages: ["@react-pdf/renderer"]` but validate after install.
3. Add `src/lib/artifacts/pdf/brand-tokens.ts` - H2O colors, page constants, Helvetica typography.
4. Add `src/lib/artifacts/pdf/shared-document.tsx` - shared React-PDF primitives needed for Field Brief only: logo/fallback mark, footer/page number, cover block, stage badge, insight box, section header.
5. Add `src/lib/artifacts/pdf/field-brief-document.tsx` - `FieldBriefDocument` and `renderFieldBriefPdf(payload)` or equivalent.
6. Optional/add seam `src/lib/artifacts/pdf/render-artifact-pdf.ts` - dispatch `field-brief` only; throw/return unavailable for other kinds.
7. `app/api/threads/[threadId]/artifacts/[kind]/[format]/route.ts` - replace PDF 501 for `field-brief` with PDF response; keep auth, thread, and artifact checks unchanged.
8. `src/ai/tools/h2o-artifacts.ts` - update `ArtifactToolResult` format union and Field Brief URL/filename/media type. Keep other tools Markdown-only/unimplemented for PDF in this slice.
9. Tests listed below.

## Tests to Add / Change

Use scripts from `package.json`: `bun run test <file>`, then `bun run test`; optionally `bunx tsc --noEmit`, `bun run check`.

1. `app/api/threads/[threadId]/artifacts/[kind]/[format]/route.test.ts`
   - Replace `returns 501 for PDF until PR3 implements the renderer` with Field Brief PDF success.
   - Use a valid typed `FieldBriefPayload`, not the current generic `{title, sections, body}` fixture, for the PDF test.
   - Assert `200`, `content-type` starts/equals `application/pdf`, `content-disposition` is `attachment; filename="prairie-water_field-brief.pdf"`, `cache-control: private, no-store`, and response bytes start with `%PDF` if buffer-based.
   - Add/keep one test that e.g. `kind=playbook&format=pdf` still returns `501 ARTIFACT_FORMAT_UNAVAILABLE` for PR3A.
2. `src/ai/tools/h2o-artifacts.test.ts`
   - Rename Markdown-only test.
   - Assert `generateFieldBrief` returns PDF format/media/url/filename.
   - Assert no fake PDF for `generatePlaybook`, `generateAnalyticalRead`, or `generateProposalShell` if adding coverage.
3. Add `src/lib/artifacts/pdf/field-brief-document.test.ts` or `pdf-renderers.test.ts`
   - Minimal renderer smoke: `renderFieldBriefPdf(validPayload)` returns non-empty bytes beginning `%PDF`.
   - Structural smoke should exercise stop flags, cost table, risks, and three actions. Do not binary snapshot PDFs.
4. Existing markdown tests can remain, but do not let them imply Markdown primary output.

## @react-pdf/renderer Gotchas in This Next Route

- Dependency is not installed now. Install before coding and verify actual API (`renderToBuffer`, `renderToStream`, or `pdf(<Doc />).toBuffer()`) against React 19 / Next 16.
- App Router/RSC bundling risk is documented in `artifact-plan-pdf-research.md`; errors may require `serverExternalPackages` in `next.config.ts`.
- Keep PDF code server-only and isolated under `src/lib/artifacts/pdf/*`; never import React-PDF from `src/ai/tools/h2o-artifacts.ts` or chat Lambda paths.
- `renderToStream` returns a Node stream; Web `Response` may need `Readable.toWeb(stream)` from `node:stream`. Buffer-based rendering is simpler for tests (`%PDF` byte assertion) but less stream-oriented.
- React-PDF styling is not CSS/HTML. Port visual primitives conceptually from ReportLab: use `View`, `Text`, `StyleSheet`, fixed footer, and Helvetica. Do not attempt to reuse Python/ReportLab or WeasyPrint templates.
- PDF binaries are not deterministic; avoid snapshots. Test headers and magic bytes, then rely on manual Prairie visual gate.

## Narrow Implementation Sequence

1. RED: update route/tool tests for Field Brief PDF success and Markdown-only contract removal.
2. Install `@react-pdf/renderer`; run the smallest renderer smoke in route/test context.
3. Add PDF boundary and Field Brief-only brand primitives/doc.
4. Wire `field-brief/pdf` route after existing auth/artifact checks; return private attachment headers.
5. Update `generateFieldBrief` result to PDF-first. Leave follow-on artifact tools/routes untouched except keeping their PDF unavailable.
6. Run targeted tests, then full `bun run test`, `bunx tsc --noEmit`, and `bun run check`.
7. Record/manual-check Prairie structural comparison against `H2O Allegiant Discovery Agent v3/Reference/prairie_field_brief_example.pdf` before declaring PR3A complete.

## Risks / Blockers

- `@react-pdf/renderer` compatibility with Next 16 + React 19 is the main blocker; spike first.
- Current route PDF test fixture is not a valid typed Field Brief payload, so renderer tests must not reuse it unchanged.
- Review budget risk: porting all brand primitives can balloon. PR3A should implement Field Brief only; do not expand to Playbook/Analytical/Proposal, preview panel, section streaming, trigger package behavior, or KB injection.
- Logo asset handling may be tricky in route runtime. Use SVG/PNG only if easy; a text/vector fallback `LogoMark` is acceptable for first Field Brief structural pass.
- If choosing on-demand PDF, no `ArtifactStore` schema change is needed. Do not add PDF metadata/storage fields unless on-demand rendering fails and a storage design is explicitly chosen.

## Start Here

Open `app/api/threads/[threadId]/artifacts/[kind]/[format]/route.ts` first. It is the narrow PR3A integration point: auth/thread/artifact flow already exists, and the only behavioral gap is replacing the Field Brief PDF 501 with a real renderer response.
