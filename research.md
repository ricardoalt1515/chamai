# Research: Amplify Gen 2 Lambda bundling for Markdown Agent Skills

## Summary
For SecondstreamAI, `next.config.js` `outputFileTracingIncludes` is not the right lever for `loadSkill`: the active skill loader runs inside the custom `ChatStreamingFunction` Lambda declared as a CDK `NodejsFunction` in `amplify/backend.ts`, not in the Next server bundle. Official docs support both esbuild loader configuration and CDK `commandHooks`, but with the current `readFile(process.cwd()/src/ai/skills/...)` implementation, the correct low-risk fix is to copy `src/ai/skills` into the Lambda asset during `NodejsFunction` bundling; `.md` text loaders only help after refactoring skills to be statically imported.

## Findings
1. **Amplify Gen 2 functions are CDK-backed Lambda resources; this project’s chat streaming function is explicitly a `NodejsFunction`.** Amplify documents that Amplify Functions use the CDK `NodejsFunction` construct and that generated Lambda resources can be modified with CDK; SecondstreamAI already creates `ChatStreamingFunction` directly with `new NodejsFunction(...)` in `amplify/backend.ts`. [Amplify Gen 2: Modify Lambda resources with CDK](https://docs.amplify.aws/react/build-a-backend/functions/modify-resources-with-cdk/) [CDK NodejsFunction](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs.NodejsFunction.html)
2. **`NodejsFunction` bundles with esbuild, and its `bundling` options are the official place for Lambda bundling changes.** CDK says `NodejsFunction` performs automatic transpiling/bundling with esbuild and exposes `bundling` options including `loader`, `esbuildArgs`, `commandHooks`, `format`, `banner`, etc. [CDK aws-lambda-nodejs README](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs-readme.html) [BundlingOptions](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs.BundlingOptions.html)
3. **Markdown-as-text via esbuild is valid in principle, but not sufficient for the current `loadSkill`.** CDK officially supports `bundling.loader` to “change how a given input file is interpreted” and `esbuildArgs` for additional esbuild flags; esbuild’s `text` loader loads a file as a string at build time and exports it as the default export. However, SecondstreamAI’s `loadSkill` dynamically calls `readFile(join(process.cwd(), "src/ai/skills", name, "SKILL.md"))`; esbuild loaders only apply to imported/required files, not arbitrary runtime filesystem reads. [CDK BundlingOptions: loader/esbuildArgs](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs.BundlingOptions.html) [esbuild content types: text loader](https://esbuild.github.io/content-types/#text)
4. **`bundling: { esbuildArgs: { '--loader:.md': 'text' } }` is plausibly valid, but `bundling.loader: { '.md': 'text' }` is the documented/cleaner CDK API.** CDK documents `esbuildArgs` as a map of extra flags and shows flags such as `"--log-limit": "0"`; esbuild documents CLI loader flags such as `--loader:.js=jsx`, and the `text` loader is valid. But CDK’s first-class `loader` property is explicitly documented for extension loaders and avoids relying on exact CLI serialization. [CDK README: configuring esbuild](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs-readme.html#configuring-esbuild) [esbuild getting started loader flag](https://esbuild.github.io/getting-started/) [esbuild text loader](https://esbuild.github.io/content-types/#text)
5. **`commandHooks` are valid exactly under `NodejsFunction` `bundling.commandHooks`, not Amplify Gen 1 CLI hooks.** CDK documents `beforeBundling`, `beforeInstall`, and `afterBundling`; each receives `inputDir` and `outputDir`, returns shell commands, and commands run in the bundling environment. This is the correct place to copy static Markdown assets into the Lambda deployment package. [CDK README: command hooks](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs-readme.html#command-hooks)
6. **Lambda packages can include arbitrary files beyond handler code, and `/var/task` is the decompressed package root.** AWS Lambda’s Node.js packaging docs describe deployment packages containing handler code plus dependencies/modules, custom modules/files, and note the package is decompressed and mounted at `/var/task`; bundled code is recommended where possible for dependencies, but package files are valid. [AWS Lambda Node.js zip packaging](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html)

## Exact recommended implementation for SecondstreamAI
Use CDK `NodejsFunction` `bundling.commandHooks.afterBundling` in `amplify/backend.ts` for `ChatStreamingFunction`:

```ts
bundling: {
  banner: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  format: OutputFormat.ESM,
  commandHooks: {
    beforeBundling() {
      return [];
    },
    beforeInstall() {
      return [];
    },
    afterBundling(inputDir: string, outputDir: string) {
      return [
        `mkdir -p ${outputDir}/src/ai/skills`,
        `cp -R ${inputDir}/src/ai/skills/. ${outputDir}/src/ai/skills/`,
      ];
    },
  },
}
```

This preserves the existing runtime contract: `process.cwd()` in Lambda resolves to the package root (`/var/task`), so `src/ai/skills/<name>/SKILL.md` exists for the current filesystem-based `loadSkill`.

Optional future refactor: create a static skill registry that imports each `SKILL.md` and configure `bundling.loader: { '.md': 'text' }`. Do not use this as the immediate fix unless `loadSkill` is changed away from dynamic `readFile`.

## Realistic validation test
Best practical test: synthesize the Lambda bundle and inspect/run the produced asset, not `next build`.

1. Add a small integration test or script that creates a temporary CDK `App/Stack` with a `NodejsFunction` using the same `entry` and `bundling.commandHooks` as `ChatStreamingFunction`.
2. Run `app.synth()`; CDK bundling will execute esbuild/command hooks locally or in Docker, matching the Lambda asset build path.
3. Locate the synthesized asset directory/zip under the temp `cdk.out` and assert that `src/ai/skills/<known-skill>/SKILL.md` exists in the asset.
4. For stronger coverage, run a tiny fixture handler from inside the asset directory with `process.cwd()` set to the asset root and verify `readFile('src/ai/skills/<known-skill>/SKILL.md')` succeeds.

This validates the Lambda deployment artifact shape that `loadSkill` depends on. `next build` and `outputFileTracingIncludes` do not validate this Lambda bundle.

## Sources
- Kept: Amplify Gen 2 “Modify Amplify-generated Lambda resources with CDK” (https://docs.amplify.aws/react/build-a-backend/functions/modify-resources-with-cdk/) — confirms Amplify Functions use `NodejsFunction` and can be modified through CDK resources.
- Kept: AWS CDK `aws-lambda-nodejs` README (https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs-readme.html) — primary docs for esbuild bundling, loaders, and command hooks.
- Kept: AWS CDK `BundlingOptions` API (https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs.BundlingOptions.html) — exact property names/types: `loader`, `esbuildArgs`, `commandHooks`.
- Kept: esbuild Content Types (https://esbuild.github.io/content-types/) — official behavior of `text` loader.
- Kept: AWS Lambda Node.js packaging docs (https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html) — validates Lambda package file/dependency layout and `/var/task` search/root behavior.
- Dropped: Amplify Gen 1 command/build hooks docs — not applicable to Amplify Gen 2 CDK `NodejsFunction` bundling.
- Dropped: SEO/blog posts — unnecessary because official Amplify/CDK/esbuild/Lambda docs answer the question.

## Gaps
I did not find Amplify Gen 2 docs exposing `bundling` directly on `defineFunction`; the official path is either generated resource modification or, as in this project, direct CDK `NodejsFunction` construction. Engram save was requested if available, but no Engram memory tool is exposed in this subagent runtime.
