# Research: May 2026 server-side PDF generation for Next.js App Router proposal artifacts

## Summary
For this project, the safest default is **HTML/CSS print rendering with Playwright or Puppeteer in a Node runtime when deployed to a real Node host/container**, but **not as the first choice for AWS Amplify Hosting compute** because Chromium-size and response-size constraints are material. If the target remains Amplify/Next route handlers, start with a **non-Chromium library** path: either `@react-pdf/renderer` for template-driven proposal PDFs after validating the Next bundling workaround, or **PDFKit** for maximum server compatibility and deterministic output. Use `pdf-lib` only for stamping/combining/editing PDFs, not markdown-to-PDF layout.

## Findings
1. **Next App Router Route Handlers can return non-UI binary responses, but runtime choice matters** — Route Handlers use Web `Request`/`Response` APIs and support non-UI responses; they also use route segment config, so PDF routes should explicitly stay in the Node.js runtime rather than Edge when using Node libraries or Chromium. [Next.js Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route)

2. **`@react-pdf/renderer` is attractive for React-first, no-browser PDF generation, but has App Router/RSC bundling risk** — Its Node API officially supports `renderToBuffer`, `renderToStream`, `renderToString`, and `renderToFile`, making it a small-runtime alternative to Chromium. However, Next App Router issues show failures such as `PDFDocument is not a constructor` / React reconciler constructor errors unless the package is externalized; one Next issue notes `serverComponentsExternalPackages: ['@react-pdf/renderer']` fixed an RSC-stripped React feature problem. [React PDF Node API](https://react-pdf.org/node), [react-pdf issue #3074](https://github.com/diegomura/react-pdf/issues/3074), [Next.js issue #61313](https://github.com/vercel/next.js/issues/61313)

3. **Playwright/Puppeteer give the best markdown-to-PDF fidelity because markdown can become HTML and print CSS** — Browser-based generation supports modern CSS, page breaks, headers/footers, fonts, syntax highlighting, and faithful rendering. Puppeteer’s `page.pdf()` generates PDFs with print CSS media and supports PDF options; Playwright has a comparable `page.pdf()` API and the docs indicate PDF generation is a Chromium/headless-browser feature. [Puppeteer Page.pdf](https://pptr.dev/next/api/puppeteer.page.pdf), [Puppeteer PDFOptions](https://pptr.dev/api/puppeteer.pdfoptions), [Playwright Page API](https://playwright.dev/docs/api/class-page)

4. **Browser-based PDF is operationally heavier on serverless platforms** — Vercel’s own Puppeteer guidance says standard `puppeteer` is too large for Vercel Functions and recommends `puppeteer-core` plus `@sparticuz/chromium-min` to fit the 250 MB bundle-size constraint. This is evidence that Chromium is a deployment concern even on platforms that document a workaround. [Vercel Puppeteer guide](https://vercel.com/kb/guide/deploying-puppeteer-with-nextjs-on-vercel)

5. **AWS Amplify Hosting compute is a poor fit for bundled Chromium in a Next route** — Amplify supports Next.js SSR/API routes and the app directory, but does not support Edge API routes, Next streaming, or responses larger than 5.72 MB. It also caps SSR build output at 220 MB. Chromium dependencies can threaten the build-output cap, and generated proposal PDFs could hit the response cap if documents include images or are long. [Amplify Next.js support](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html), [Amplify SSR troubleshooting](https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting-SSR.html)

6. **PDFKit is the strongest low-level Node fallback** — PDFKit is a Node/browser PDF generation library with text wrapping, fonts, images, tables, annotations, encryption, and accessibility support. It avoids browser binaries and should be friendlier to Amplify/Node route deployment, but requires building layout primitives yourself or via an internal markdown renderer; CSS/HTML fidelity will be much lower than Chromium. [PDFKit README](https://github.com/foliojs/pdfkit)

7. **`pdf-lib` is complementary, not a markdown proposal renderer** — `pdf-lib` is designed to create and modify PDFs in many JS runtimes, with strong support for loading existing PDFs, copying pages, drawing text/images, forms, metadata, and attachments. Its own motivation emphasizes PDF modification; it lacks an HTML/CSS layout engine, so it is best for post-processing generated PDFs. [pdf-lib README](https://github.com/Hopding/pdf-lib)

8. **`md-to-pdf` is a convenient wrapper but inherits Puppeteer/Chromium constraints** — `md-to-pdf` converts Markdown to HTML with Marked, then HTML to PDF with Puppeteer/headless Chromium. It has a programmatic API and markdown-friendly features, but it does not eliminate the browser-binary/runtime constraints that matter for Amplify/Vercel. [md-to-pdf README](https://github.com/simonhaenisch/md-to-pdf)

9. **HTML-to-PDF SaaS/services reduce deployment risk but add data, cost, and availability tradeoffs** — External services avoid bundling Chromium and can provide robust rendering at scale, but proposal artifacts may contain customer/project-sensitive content. For this project, a service should be considered only if PDFs become complex, high-volume, or operationally unreliable in Amplify, and only after privacy/security review.

## Recommendation
1. **If PDF generation is hosted in Amplify Next route handlers:** prototype `@react-pdf/renderer` first, but include a proof that `renderToBuffer` works in `app/api/.../route.ts` with the current Next/React versions and necessary externalization config. It best balances React ergonomics, no Chromium binary, and adequate proposal-style layout.
2. **If React PDF fails or layout control must be deterministic:** use PDFKit. It is more manual, but most compatible with Node runtime and Amplify limits.
3. **If design fidelity from Markdown/HTML/CSS is the priority and deployment can be a real Node server/container:** use Playwright or Puppeteer. Prefer this path for self-hosted Node, ECS/Fargate, or a separate PDF worker, not Amplify Hosting compute.
4. **Do not choose `pdf-lib` as the primary generator**; reserve it for merging, stamping, metadata, attachments, or post-processing.
5. **Avoid `md-to-pdf` in the Next route as a shortcut on Amplify** unless the team explicitly accepts Puppeteer/Chromium packaging and runtime constraints.

## Tradeoff table
| Option | Best for | Pros | Cons / risks | Fit for this project |
|---|---|---|---|---|
| `@react-pdf/renderer` | React-authored proposal templates | No browser binary; React component model; Node buffer/stream API | App Router/RSC bundling issues need validation; not HTML/CSS; custom styling model | **Recommended first prototype for Amplify** |
| Playwright/Chromium | High-fidelity markdown -> HTML -> PDF | Best CSS/print fidelity; easy preview/debug | Large browser binary; cold start/memory; Amplify build/output limits | Best only outside Amplify route, or separate worker |
| Puppeteer/Chromium | Same as Playwright, broader ecosystem | Mature PDF API; wrappers like `md-to-pdf` | Same Chromium constraints; standard package too large for Vercel without workaround | Good in container/Node host; risky in Amplify |
| PDFKit | Programmatic deterministic PDFs | Node-friendly; no browser; streams; rich low-level PDF features | Manual layout; weaker markdown/CSS fidelity | **Best fallback for Amplify** |
| `pdf-lib` | Editing/post-processing PDFs | Portable; great for merging/stamping/forms | Not an HTML/markdown layout engine | Complementary only |
| `md-to-pdf` | CLI/programmatic markdown conversion | Fast to adopt; headers/footers; code highlighting | Puppeteer dependency; deployment constraints inherited | Useful local/tooling; not ideal for Amplify route |
| HTML-to-PDF SaaS | Operational simplicity at scale | No browser in app; vendor handles rendering | Cost, latency, privacy/data governance | Later escape hatch |

## Sources
- Kept: Next.js Route Handlers (https://nextjs.org/docs/app/api-reference/file-conventions/route) — official App Router API route behavior and non-UI responses.
- Kept: React PDF Node API (https://react-pdf.org/node) — official server-side buffer/stream/file APIs.
- Kept: react-pdf issue #3074 (https://github.com/diegomura/react-pdf/issues/3074) — current evidence of Next 15 App Router `renderToBuffer` failure.
- Kept: Next.js issue #61313 (https://github.com/vercel/next.js/issues/61313) — evidence that `@react-pdf/renderer` may need server externalization in App Router/RSC.
- Kept: Puppeteer Page.pdf / PDFOptions docs (https://pptr.dev/next/api/puppeteer.page.pdf, https://pptr.dev/api/puppeteer.pdfoptions) — official PDF API behavior and options.
- Kept: Playwright Page API (https://playwright.dev/docs/api/class-page) — official browser page API and PDF-generation context.
- Kept: Vercel Puppeteer guide (https://vercel.com/kb/guide/deploying-puppeteer-with-nextjs-on-vercel) — official serverless Chromium packaging workaround and bundle-size constraint.
- Kept: AWS Amplify Next.js support (https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html) — official supported/unsupported Next features.
- Kept: AWS Amplify SSR troubleshooting (https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting-SSR.html) — official build-output and response-size limits.
- Kept: PDFKit README (https://github.com/foliojs/pdfkit) — primary source for Node PDFKit capabilities.
- Kept: pdf-lib README (https://github.com/Hopding/pdf-lib) — primary source for pdf-lib scope and runtime portability.
- Kept: md-to-pdf README (https://github.com/simonhaenisch/md-to-pdf) — primary source showing it is Marked + Puppeteer.
- Dropped: SEO/commercial comparison articles — useful for discovery but less authoritative than official docs and primary repositories.
- Dropped: npmtrends pages — useful for popularity, not decisive for architecture.
- Dropped: Medium/tutorial posts — implementation anecdotes, but not primary evidence.

## Gaps
- I did not run a live compatibility spike in this repository. The highest-risk unknown is whether the current project’s Next/React versions can run `@react-pdf/renderer` in an App Router API route with the required externalization setting.
- Amplify’s exact runtime memory/time limits for this app’s compute tier were not verified from project deployment settings.
- PDF artifact size is unknown; sample proposal content with images should be generated and measured against Amplify’s 5.72 MB response limit before committing to in-route delivery.

## Supervisor coordination
No coordination was needed; research completed read-only except for the requested artifact file.
