import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import type * as React from "react";
import { LandingEffects } from "@/components/landing-effects";

const LANDING_TITLE = "H2O Allegiant — Win the wastewater deals you should be winning.";
const LANDING_DESCRIPTION =
  "H2O Allegiant is the AI agent for US wastewater BD. It reads the case file in an hour — NPDES, eDMRs, master plans — and produces the Field Brief, Playbook, Analytical Read, and Proposal Shell priced on the customer's 5-year economics. Win the deals you should be winning.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.h2oassistant.com"),
  title: LANDING_TITLE,
  description: LANDING_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: LANDING_TITLE,
    description: LANDING_DESCRIPTION,
    url: "https://www.h2oassistant.com",
    siteName: "H2O Allegiant",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "H2O Allegiant — AI agent for US wastewater BD",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: LANDING_TITLE,
    description: LANDING_DESCRIPTION,
    images: ["/assets/og-image.png"],
  },
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
