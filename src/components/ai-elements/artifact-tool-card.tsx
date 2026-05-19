"use client";

import type { ToolUIPart } from "ai";
import { DownloadIcon, ExternalLinkIcon } from "lucide-react";
import type * as React from "react";
import type { ComponentType, SVGProps } from "react";
import { Shimmer } from "@/components/ai-elements/shimmer";
import type { ArtifactToolUIOutput } from "@/types/ui-message";

export type ArtifactCardIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type ArtifactToolCardProps = {
  Icon: ArtifactCardIcon;
  title: string;
  state: ToolUIPart["state"];
  output?: ArtifactToolUIOutput | null;
  errorText?: string;
};

export const artifactViewUrl = (downloadUrl: string): string => {
  const url = new URL(downloadUrl, "http://artifact.local");
  url.searchParams.set("disposition", "inline");
  const path = `${url.pathname}${url.search}${url.hash}`;

  return url.origin === "http://artifact.local" ? path : url.toString();
};

export function ArtifactToolCard({
  Icon,
  title,
  state,
  output,
  errorText,
}: ArtifactToolCardProps): React.JSX.Element | null {
  if (state === "input-streaming" || state === "input-available") {
    const message =
      state === "input-streaming"
        ? `Preparing ${title.toLowerCase()}…`
        : `Generating ${title.toLowerCase()}…`;

    return (
      <div className="not-prose w-full rounded-lg border bg-card px-3 py-3 sm:max-w-sm">
        <div className="flex items-center gap-3">
          <Icon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs">{title}</p>
            <Shimmer as="p" className="text-xs">
              {message}
            </Shimmer>
          </div>
        </div>
      </div>
    );
  }

  if (state === "output-error") {
    return (
      <div
        role="alert"
        className="not-prose w-full rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-3 sm:max-w-sm"
      >
        <div className="flex items-start gap-3">
          <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs">{title}</p>
            <p className="text-destructive/90 text-xs">
              {errorText ?? `Could not generate ${title.toLowerCase()}.`}
            </p>
            <p className="mt-1 text-muted-foreground text-xs">Ask the agent to retry.</p>
          </div>
        </div>
      </div>
    );
  }

  if (state === "output-available" && output && output.status !== "ready") {
    return (
      <div className="not-prose w-full rounded-lg border bg-card px-3 py-3 sm:max-w-sm">
        <div className="flex items-center gap-3">
          <Icon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs">{output.title || title}</p>
            <Shimmer as="p" className="text-xs">
              {output.message}
            </Shimmer>
          </div>
        </div>
      </div>
    );
  }

  const pdf = output?.status === "ready" ? output.formats[0] : undefined;
  if (state === "output-available" && pdf?.downloadUrl) {
    const displayTitle = output?.title ?? title;
    const filename = pdf.filename;
    const viewUrl = artifactViewUrl(pdf.downloadUrl);
    return (
      <div className="not-prose w-full rounded-lg border bg-card px-3 py-3 sm:max-w-sm">
        <div className="flex items-start gap-3">
          <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs">{displayTitle}</p>
            <p className="truncate text-muted-foreground text-xs" title={filename}>
              {filename}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <a
            aria-label={`View ${filename} in a new tab`}
            className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 font-medium text-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            href={viewUrl}
            rel="noopener noreferrer"
            target="_blank"
            title={`View ${filename}`}
          >
            <ExternalLinkIcon aria-hidden className="size-3.5" />
            View
          </a>
          <a
            aria-label={`Download ${filename}`}
            className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 font-medium text-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            download={filename}
            href={pdf.downloadUrl}
            rel="noopener noreferrer"
            title={`Download ${filename}`}
          >
            <DownloadIcon aria-hidden className="size-3.5" />
            Download
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="not-prose w-full rounded-lg border bg-card px-3 py-3 sm:max-w-sm">
      <div className="flex items-center gap-3">
        <Icon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-xs">{title}</p>
          <Shimmer as="p" className="text-xs">
            {`Preparing ${title.toLowerCase()}…`}
          </Shimmer>
        </div>
      </div>
    </div>
  );
}
