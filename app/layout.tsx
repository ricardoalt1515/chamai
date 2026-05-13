import "../src/styles.css";
import type { Metadata, Viewport } from "next";
import type * as React from "react";
import { AppShell } from "./shell";

export const metadata: Metadata = {
  title: "H2O Allegiant",
  description: "Your water intelligence assistant.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1917" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a
          href="#main-content"
          className="-translate-y-12 sr-only fixed top-2 left-2 z-[100] rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm shadow-lg transition-transform focus:not-sr-only focus:translate-y-0"
        >
          Skip to content
        </a>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
