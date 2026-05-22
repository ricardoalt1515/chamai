import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import type * as React from "react";
import { LandingEffects } from "@/components/landing-effects";

export const metadata: Metadata = {
  title: "H2O Allegiant — Win the wastewater deals you should be winning.",
  description:
    "H2O Allegiant is the AI agent for US wastewater BD. It reads the case file in an hour — NPDES, eDMRs, master plans — and produces the Field Brief, Playbook, Pursuit Memo, and Scope Outline priced on the customer's 5-year economics. Win the deals you should be winning.",
};

function getLandingHtml(): { body: string; styles: string } {
  const html = readFileSync(join(process.cwd(), "public/landing.html"), "utf8");
  const styles = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
  const body =
    html.match(/<body>([\s\S]*?)<\/body>/)?.[1]?.replace(/<script>[\s\S]*?<\/script>\s*$/, "") ??
    "";

  return { body, styles };
}

export default function Page(): React.JSX.Element {
  const { body, styles } = getLandingHtml();

  return (
    <>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: The static landing HTML is a checked-in trusted artifact. */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: The static landing HTML is a checked-in trusted artifact. */}
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <LandingEffects />
    </>
  );
}
