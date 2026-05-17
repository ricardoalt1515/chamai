I completed the read-only investigation and saved the main discovery to Engram project `secondstreamai`.

I did **not** write `/Users/ricardoaltamirano/Developer/SecondstreamAI/attachment-readiness-ai-elements.md` because the task explicitly said **Do not edit files**, and review-only/no-edit wins over artifact-writing.

## Findings

### Evidence paths

- `src/components/chat-prompt-composer.tsx`
  - Uses AI Elements `PromptInput`, `PromptInputProvider`, `PromptInputAttachments`, `PromptInputAttachmentPreview`, `PromptInputSubmit`.
  - Accepts `SUPPORTED_ATTACHMENT_MIME_PATTERNS.join(",")`.
  - Enforces `MAX_ATTACHMENT_BYTES` and `MAX_ATTACHMENTS_PER_REQUEST`.
  - Shows attachment validation errors and chat runtime errors inline.
  - Disables PDF-only submit until text is added.

- `src/components/ai-elements/prompt-input.tsx`
  - Handles file dialog, drag/drop, paste, backspace-remove.
  - Converts `blob:` URLs to `data:` URLs before submit.
  - Clears input only after successful submit.
  - Leaves attachments/text in place on submit failure.

- `src/components/ai-elements/attachments.tsx`
  - Image previews render thumbnails.
  - PDF/text render only generic document icons in grid mode.
  - Grid mode hides filename/media info unless additional info component is used.

- `src/components/chat-interface.tsx`
  - Sends `PromptInputMessage` through AI SDK `sendMessage`.
  - Renders reloaded/current message parts:
    - images as `<Image src={part.url}>`
    - non-image files as a simple `Attachment: filename` chip
    - text through `MessageResponse`
    - reasoning, web search, working memory tool parts with AI Elements components.

- `src/config/models.ts`
  - UI/model config advertises:
    - `text/*`
    - `image/*`
    - `application/pdf`
  - Current model claims capabilities: `["text", "image", "pdf"]`.

- `src/lib/chat-helpers.ts`
  - Server validation accepts any `text/*` via `normalizeAttachmentCapability`.
  - Enforces max 5 attachments, 4MB, PDF instruction requirement, model capability match, data URL or persisted reference.

- `src/lib/storage/attachment-metadata.ts`
  - Persistence support is narrower:
    - `image/*`
    - `application/pdf`
    - only `text/plain`, `text/markdown`

- `src/lib/chat-handler.ts`
  - Persists incoming data URL attachments to blob storage.
  - Rehydrates persisted references back to data URLs before `convertToModelMessages`.
  - Persistence-time unsupported MIME errors can occur after parse validation.

- `app/actions/messages.ts`
  - Reload hydration converts persisted attachment refs back to file parts with public URL and metadata.

## Main mismatches

1. **UI accepts `text/*`, but storage only supports `text/plain` and `text/markdown`.**
   - `src/config/models.ts` advertises `text/*`.
   - `src/lib/chat-helpers.ts` accepts any `text/*`.
   - `src/lib/storage/attachment-metadata.ts` rejects most text MIME subtypes during persistence.
   - UX risk: user can select a valid-by-UI text file that fails later.

2. **Validation errors are split across layers.**
   - Client catches size/count/accept/read failures.
   - Server catches parse-time validation with clean 400 responses.
   - But `withAttachmentPersistence` can throw after parse handling, likely producing a rougher failure path.

3. **PDF instruction UX is functional but minimal.**
   - Submit is disabled when PDF exists and text is blank.
   - Hint says only “Add a short instruction.”
   - Risk: disabled submit without an explicit reason tied to the button may be unclear.

4. **Attachment rendering after reload is technically supported but visually thin.**
   - Images render inline.
   - PDFs/text files render as generic filename chips.
   - No preview/open affordance, size, MIME, or persisted-state indicator.

5. **Attachment menu copy is broader than actual supported UX.**
   - AI Elements label says “Add photos or files.”
   - Accept config says images/PDF/text.
   - Actual storage text support is narrower.

## UX risks before prompt/skills/tools work

- Users may attach unsupported text subtypes and hit server/storage failure.
- PDF-only flow blocks submit but does not strongly explain why.
- Non-image attachment previews are easy to miss and provide little context.
- Reloaded non-image attachments prove persistence exists but do not feel like durable document attachments.
- Runtime error display is visible, but attachment-specific server failures may not be normalized into friendly actionable messages.

## Recommended next tests/changes

1. Align accepted MIME types:
   - Either narrow UI to `text/plain,text/markdown,image/*,application/pdf`
   - or broaden persistence support for all `text/*`.

2. Add tests for:
   - unsupported text subtype selected client-side/server-side,
   - PDF-only submit disabled,
   - PDF + instruction submit allowed,
   - pasted/dropped oversized or unsupported files,
   - persisted attachment reload rendering,
   - persistence-time validation error response.

3. Improve PDF UX:
   - make hint explicit: “PDFs need an instruction, e.g. ‘Summarize this.’”
   - add accessible relation between hint and disabled submit.

4. Improve non-image attachment display:
   - show filename, MIME/type, maybe size when metadata exists,
   - provide open/download affordance for persisted URLs,
   - use AI Elements `AttachmentInfo` or a richer list/inline variant.

5. Normalize server-side attachment errors:
   - catch `ChatRequestValidationError` around persistence/model prep as well as parse validation.