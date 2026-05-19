import { existsSync } from "node:fs";
import { join } from "node:path";
import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { h2oBrand } from "./brand-tokens";

const DEFAULT_LOGO_PATH = join(process.cwd(), "public", "h2o-allegiant.png");

export const resolveH2oPdfLogoSource = (logoPath = DEFAULT_LOGO_PATH): string | null => {
  try {
    return existsSync(logoPath) ? logoPath : null;
  } catch {
    return null;
  }
};

export const stageBadgeColor = (stage: string): string => {
  const normalized = stage.trim().toLowerCase();
  if (normalized === "lead") return h2oBrand.colors.stage.lead;
  if (normalized === "qualify") return h2oBrand.colors.stage.qualify;
  if (normalized === "scope") return h2oBrand.colors.stage.scope;
  if (normalized === "position") return h2oBrand.colors.stage.position;
  if (normalized === "propose") return h2oBrand.colors.stage.propose;
  if (normalized === "close") return h2oBrand.colors.stage.close;
  return h2oBrand.colors.stage.default;
};

const styles = StyleSheet.create({
  logoImage: {
    height: h2oBrand.logo.height,
    objectFit: "contain",
    width: h2oBrand.logo.width,
  },
  logoFallback: {
    alignItems: "center",
    backgroundColor: h2oBrand.colors.navy,
    height: h2oBrand.logo.height,
    justifyContent: "center",
    paddingHorizontal: 6,
    width: h2oBrand.logo.width,
  },
  logoFallbackText: {
    color: h2oBrand.colors.white,
    fontFamily: h2oBrand.font.bold,
    fontSize: 7,
  },
  cover: {
    marginBottom: 16,
  },
  coverTop: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  title: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 16,
    lineHeight: 1.08,
    marginBottom: 2,
  },
  metadata: {
    borderBottomColor: h2oBrand.colors.line,
    borderBottomWidth: 1,
    color: h2oBrand.colors.muted,
    fontSize: 8,
    lineHeight: 1.25,
    paddingBottom: 4,
  },
  badge: {
    borderRadius: 999,
    color: h2oBrand.colors.white,
    fontFamily: h2oBrand.font.bold,
    fontSize: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  sectionHeaderRow: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    marginBottom: 6,
  },
  sectionDot: {
    backgroundColor: h2oBrand.colors.blue,
    borderRadius: 99,
    height: 7,
    marginRight: 5,
    width: 7,
  },
  sectionHeader: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 13,
    lineHeight: 1.1,
  },
  insight: {
    backgroundColor: h2oBrand.colors.panelBlue,
    borderLeftColor: h2oBrand.colors.blue,
    borderLeftWidth: 3,
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 9,
    lineHeight: 1.35,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  footer: {
    alignItems: "center",
    bottom: 18,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    left: h2oBrand.page.paddingX,
    position: "absolute",
    right: h2oBrand.page.paddingX,
  },
  footerText: {
    color: h2oBrand.colors.muted,
    fontFamily: h2oBrand.font.mono,
    fontSize: 7,
  },
});

export const LogoMark = () => {
  const logoSource = resolveH2oPdfLogoSource();

  if (logoSource) {
    return <Image src={logoSource} style={styles.logoImage} />;
  }

  return (
    <View style={styles.logoFallback}>
      <Text style={styles.logoFallbackText}>H2O Allegiant</Text>
    </View>
  );
};

export const StageBadge = ({ stage }: { stage: string }) => (
  <Text style={[styles.badge, { backgroundColor: stageBadgeColor(stage) }]}>Stage: {stage}</Text>
);

export const CoverBlock = ({
  artifactLabel,
  customerName,
  date,
  location,
  stage,
}: {
  artifactLabel: string;
  customerName: string;
  date?: string;
  location?: string;
  stage: string;
}) => (
  <View style={styles.cover}>
    <View style={styles.coverTop}>
      <LogoMark />
      <StageBadge stage={stage} />
    </View>
    <Text style={styles.title}>{customerName}</Text>
    <Text style={styles.metadata}>
      {[location, date, artifactLabel, "Internal handover"].filter(Boolean).join(" · ")}
    </Text>
  </View>
);

export const SectionHeader = ({ children, color }: { children: ReactNode; color?: string }) => (
  <View style={styles.sectionHeaderRow}>
    <View style={color ? [styles.sectionDot, { backgroundColor: color }] : styles.sectionDot} />
    <Text style={styles.sectionHeader}>{children}</Text>
  </View>
);

export const InsightBox = ({ children }: { children: ReactNode }) => (
  <Text style={styles.insight}>{children}</Text>
);

export const Footer = ({ label }: { label: string }) => (
  <View fixed style={styles.footer}>
    <Text style={styles.footerText}>{label} · Internal handover</Text>
    <Text
      render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
      style={styles.footerText}
    />
  </View>
);
