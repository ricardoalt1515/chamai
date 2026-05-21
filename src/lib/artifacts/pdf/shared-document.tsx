import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { bannerTone, h2oBrand, severityBg } from "./brand-tokens";

export const tier2ContinuationTopReserve = 48;

const DEFAULT_LOGO_PATH = join(process.cwd(), "public", "h2o-allegiant.png");

const logoMimeType = (logoPath: string): string => {
  const extension = extname(logoPath).toLowerCase();
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  return "image/png";
};

export const resolveH2oPdfLogoSource = (logoPath = DEFAULT_LOGO_PATH): string | null => {
  try {
    if (!existsSync(logoPath)) {
      console.warn(`H2O PDF logo not found at ${logoPath}`);
      return null;
    }

    const data = readFileSync(logoPath).toString("base64");
    return `data:${logoMimeType(logoPath)};base64,${data}`;
  } catch (error) {
    console.warn("Failed to load H2O PDF logo", error);
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
    marginBottom: 10,
  },
  coverTop: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  title: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 15,
    lineHeight: 1.04,
    marginBottom: 1,
  },
  metadata: {
    borderBottomColor: h2oBrand.colors.line,
    borderBottomWidth: 1,
    color: h2oBrand.colors.muted,
    fontSize: 7.5,
    lineHeight: 1.15,
    paddingBottom: 3,
  },
  badge: {
    borderRadius: 999,
    color: h2oBrand.colors.white,
    fontFamily: h2oBrand.font.bold,
    fontSize: 7.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sectionHeaderRow: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    marginBottom: 4,
  },
  sectionDot: {
    backgroundColor: h2oBrand.colors.blue,
    borderRadius: 99,
    height: 6,
    marginRight: 5,
    width: 6,
  },
  sectionHeader: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 12,
    lineHeight: 1.05,
  },
  insight: {
    backgroundColor: h2oBrand.colors.panelBlue,
    borderLeftColor: h2oBrand.colors.blue,
    borderLeftWidth: 3,
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 10,
    lineHeight: 1.2,
    marginBottom: 3,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  footer: {
    alignItems: "center",
    bottom: 11,
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

/**
 * H2O Allegiant logo mark.
 * - `md` = full size (102×20) — used by Tier 2 docs that still want the original cover scale.
 * - `sm` = compact (76×15) — Field Brief cover, sized to roughly match the sidebar wordmark's visual weight.
 * - `xs` = micro (38×8) — Field Brief continuation strip; same visual weight as the boss page-2 mark.
 *
 * The PNG asset (`public/h2o-allegiant.png`) is a wordmark with ~5:1 aspect ratio (1696×333).
 * Each preset preserves that ratio.
 */
export const LogoMark = ({ size = "md" }: { size?: "xs" | "sm" | "md" }) => {
  const logoSource = resolveH2oPdfLogoSource();
  const width = size === "xs" ? 38 : size === "sm" ? 76 : h2oBrand.logo.width;
  const height = size === "xs" ? 8 : size === "sm" ? 15 : h2oBrand.logo.height;

  if (logoSource) {
    return <Image src={logoSource} style={[styles.logoImage, { width, height }]} />;
  }

  return (
    <View style={[styles.logoFallback, { width, height }]}>
      <Text style={styles.logoFallbackText}>H2O Allegiant</Text>
    </View>
  );
};

export const StageBadge = ({ stage }: { stage: string }) => (
  <Text style={[styles.badge, { backgroundColor: stageBadgeColor(stage) }]}>Stage: {stage}</Text>
);

/**
 * @deprecated CoverBlock is Tier 1 only (Field Brief). Tier 2 documents must use MinimalHeader.
 * This component will be removed in a future change once all Tier 2 renderers have migrated.
 */
export const CoverBlock = ({
  artifactLabel,
  customerName,
  date,
  location,
  logoSize,
  stage,
}: {
  artifactLabel: string;
  customerName: string;
  date?: string;
  location?: string;
  /** Optional logo size override. Defaults to "md" (full size). Use "sm" for continuation headers. */
  logoSize?: "sm" | "md";
  stage: string;
}) => (
  <View style={styles.cover}>
    <View style={styles.coverTop}>
      <LogoMark size={logoSize} />
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

/**
 * Text-only footer: left `H2O Allegiant Discovery Agent · Internal handover`, right `Page N`.
 * `paddingX` overrides the default left/right anchor (defaults to brand-tokens.paddingX). Pass it
 * when a document uses a different page margin (e.g. Field Brief uses 54pt instead of 44pt).
 * The `label` prop is retained as a no-op for legacy callers.
 */
export const Footer = ({ paddingX }: { label?: string; paddingX?: number } = {}) => (
  <View
    fixed
    style={
      paddingX !== undefined ? [styles.footer, { left: paddingX, right: paddingX }] : styles.footer
    }
  >
    <Text style={styles.footerText}>H2O Allegiant Discovery Agent · Internal handover</Text>
    <Text render={({ pageNumber }) => `Page ${pageNumber}`} style={styles.footerText} />
  </View>
);

// ─── Slice A — New shared primitives ──────────────────────────────────────────

const newStyles = StyleSheet.create({
  // MinimalHeader
  minimalHeaderWrap: {
    marginBottom: 8,
  },
  minimalHeaderTitle: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 15,
    lineHeight: 1.04,
    marginBottom: 1,
  },
  minimalHeaderMeta: {
    borderBottomColor: h2oBrand.colors.line,
    borderBottomWidth: 1,
    color: h2oBrand.colors.muted,
    fontSize: 7.5,
    lineHeight: 1.15,
    paddingBottom: 3,
  },
  // MinimalContinuationHeader
  continuationStripWrap: {
    alignItems: "center",
    borderBottomColor: h2oBrand.colors.line,
    borderBottomWidth: 1,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    left: h2oBrand.page.paddingX,
    paddingBottom: 3,
    position: "absolute",
    right: h2oBrand.page.paddingX,
    top: 16,
  },
  continuationStripText: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 7.5,
  },
  continuationStripPage: {
    color: h2oBrand.colors.muted,
    fontFamily: h2oBrand.font.mono,
    fontSize: 7,
  },
  // StatusBanner
  statusBannerWrap: {
    borderLeftWidth: 3,
    marginBottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusBannerLabel: {
    fontFamily: h2oBrand.font.bold,
    fontSize: 8,
    lineHeight: 1.1,
    marginBottom: 2,
  },
  statusBannerBody: {
    fontSize: 7.8,
    lineHeight: 1.15,
  },
  // FullWidthBanner
  fullWidthBannerWrap: {
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  fullWidthBannerText: {
    fontFamily: h2oBrand.font.bold,
    fontSize: 8,
    letterSpacing: 0.5,
    lineHeight: 1.1,
    textTransform: "uppercase",
  },
  // SeverityToken
  severityTokenText: {
    borderRadius: 2,
    fontFamily: h2oBrand.font.bold,
    fontSize: 6.5,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  // FlagListItem
  flagItemWrap: {
    display: "flex",
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
    alignItems: "flex-start",
  },
  flagItemId: {
    flexBasis: 80,
    flexShrink: 0,
    fontFamily: h2oBrand.font.mono,
    fontSize: 7.2,
    lineHeight: 1.1,
    color: h2oBrand.colors.ink,
  },
  flagItemEvidence: {
    flex: 1,
    fontSize: 7.8,
    lineHeight: 1.15,
  },
  flagItemStatus: {
    color: h2oBrand.colors.muted,
    fontSize: 7.2,
    lineHeight: 1.1,
    marginLeft: 4,
  },
  // EvidenceAnchorInline
  evidenceAnchor: {
    fontFamily: h2oBrand.font.mono,
    fontSize: 6.5,
    color: h2oBrand.colors.muted,
  },
  // DataTable
  dataTableWrap: {
    marginBottom: 4,
  },
  dataTableRow: {
    borderBottomColor: h2oBrand.colors.line,
    borderBottomWidth: 0.5,
    display: "flex",
    flexDirection: "row",
  },
  dataTableHeaderNavyDark: {
    backgroundColor: h2oBrand.colors.navy,
  },
  dataTableHeaderNavyLight: {
    backgroundColor: h2oBrand.colors.panelBlue,
  },
  dataTableHeaderPlain: {
    backgroundColor: h2oBrand.colors.panel,
    borderBottomColor: h2oBrand.colors.navy,
    borderBottomWidth: 0.8,
  },
  dataTableHeaderCellNavyDark: {
    color: h2oBrand.colors.white,
    fontFamily: h2oBrand.font.bold,
    fontSize: 7,
    lineHeight: 1.1,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  dataTableHeaderCellNavyLight: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 7,
    lineHeight: 1.1,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  dataTableHeaderCellPlain: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 7,
    lineHeight: 1.1,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  dataTableBodyCell: {
    fontSize: 7.2,
    lineHeight: 1.1,
    paddingHorizontal: 5,
    paddingVertical: 2.5,
  },
  // KVTable
  kvTableWrap: {
    marginBottom: 4,
  },
  kvTableRow: {
    borderBottomColor: h2oBrand.colors.line,
    borderBottomWidth: 0.5,
    display: "flex",
    flexDirection: "row",
  },
  kvTableLabel: {
    color: h2oBrand.colors.navy,
    flexBasis: "40%",
    fontFamily: h2oBrand.font.bold,
    fontSize: 7.2,
    lineHeight: 1.1,
    paddingHorizontal: 5,
    paddingVertical: 2.5,
  },
  kvTableValue: {
    flex: 1,
    fontSize: 7.2,
    lineHeight: 1.1,
    paddingHorizontal: 5,
    paddingVertical: 2.5,
  },
  // SectionHeading
  sectionHeadingWrap: {
    borderBottomWidth: 1.5,
    marginBottom: 5,
    paddingBottom: 3,
  },
  sectionHeadingRow: {
    alignItems: "baseline",
    display: "flex",
    flexDirection: "row",
    gap: 6,
  },
  sectionHeadingIndex: {
    fontSize: 13,
    lineHeight: 1.0,
  },
  sectionHeadingTitle: {
    fontFamily: h2oBrand.font.bold,
    fontSize: 11,
    lineHeight: 1.05,
  },
  sectionHeadingSubLine: {
    fontSize: 8,
    fontStyle: "italic",
    lineHeight: 1.2,
    marginTop: 1,
  },
  // WhyItMattersCallout
  whyCalloutWrap: {
    borderTopWidth: 2,
    marginBottom: 6,
    marginTop: 3,
    paddingHorizontal: 8,
    paddingTop: 5,
    paddingBottom: 5,
  },
  whyCalloutTitle: {
    fontFamily: h2oBrand.font.bold,
    fontSize: 7.5,
    lineHeight: 1.1,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  whyCalloutItem: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
    marginBottom: 2,
  },
  whyCalloutBullet: {
    fontSize: 7.5,
    width: 6,
  },
  whyCalloutText: {
    flex: 1,
    fontSize: 7.5,
    lineHeight: 1.15,
  },
});

// ─── Pure helpers ──────────────────────────────────────────────────────────────

type StatusBannerSeverity =
  | "open"
  | "open-with-conditions"
  | "conditionally-open"
  | "closed"
  | "stop"
  | "specialist"
  | "attention"
  | "clear";

export const statusBannerBackground = (severity: StatusBannerSeverity): string => {
  if (severity === "stop" || severity === "closed") return severityBg.stop;
  if (
    severity === "specialist" ||
    severity === "open-with-conditions" ||
    severity === "conditionally-open"
  )
    return severityBg.specialist;
  if (severity === "attention") return severityBg.attention;
  if (severity === "open") return severityBg.openGreen;
  return severityBg.clear;
};

export const statusBannerAccent = (severity: StatusBannerSeverity): string => {
  if (severity === "stop" || severity === "closed") return h2oBrand.colors.severity.stop;
  if (
    severity === "specialist" ||
    severity === "open-with-conditions" ||
    severity === "conditionally-open"
  )
    return h2oBrand.colors.severity.specialist;
  if (severity === "attention") return h2oBrand.colors.severity.attention;
  if (severity === "open") return h2oBrand.colors.green;
  return h2oBrand.colors.muted;
};

// ─── Components ────────────────────────────────────────────────────────────────

/**
 * Text-only header for Tier 2 documents (Playbook, Analytical Read, Proposal Shell).
 * Renders: bold navy title `{customerName} — {site?}`, metadata line with county/state/basin?/date/artifactLabel,
 * followed by a 1px bottom-border rule. No logo, no stage badge.
 */
export type MinimalHeaderMetadataInput = {
  artifactLabel: string;
  basin?: string;
  county?: string;
  date?: string;
  state?: string;
};

const trimmedOrUndefined = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const buildMinimalHeaderMetadataLine = ({
  artifactLabel,
  basin,
  county,
  date,
  state,
}: MinimalHeaderMetadataInput): string => {
  const normalizedCounty = trimmedOrUndefined(county);
  const normalizedState = trimmedOrUndefined(state);
  const normalizedBasin = trimmedOrUndefined(basin);
  const normalizedDate = trimmedOrUndefined(date);
  const normalizedArtifactLabel = artifactLabel.trim();
  const location =
    normalizedCounty && normalizedState ? `${normalizedCounty}, ${normalizedState}` : undefined;
  const locationWithBasin =
    location && normalizedBasin ? `${location} (${normalizedBasin})` : location;

  return [locationWithBasin, normalizedDate, normalizedArtifactLabel, "Internal handover"]
    .filter(Boolean)
    .join(" · ");
};

export const MinimalHeader = ({
  customerName,
  site,
  county,
  state,
  basin,
  date,
  artifactLabel,
}: {
  customerName: string;
  site?: string;
  county?: string;
  state?: string;
  basin?: string;
  date?: string;
  artifactLabel: string;
}) => {
  const title = site ? `${customerName} — ${site}` : customerName;
  const metadataLine = buildMinimalHeaderMetadataLine({
    artifactLabel,
    basin,
    county,
    date,
    state,
  });

  return (
    <View style={newStyles.minimalHeaderWrap}>
      <Text style={newStyles.minimalHeaderTitle}>{title}</Text>
      <Text style={newStyles.minimalHeaderMeta}>{metadataLine}</Text>
    </View>
  );
};

/**
 * Text-only continuation header strip for Tier 2 documents (page 2+).
 * Render inside a parent fixed wrapper that returns null on page 1 and this strip on page 2+.
 * No logo, no stage badge.
 */
export const MinimalContinuationHeader = ({
  customerName,
  site,
  artifactLabel,
  pageNumber,
}: {
  customerName: string;
  site?: string;
  artifactLabel: string;
  pageNumber?: number;
}) => {
  const label = site
    ? `${customerName} — ${site} · ${artifactLabel} (continued)`
    : `${customerName} · ${artifactLabel} (continued)`;

  return (
    <View fixed style={newStyles.continuationStripWrap}>
      <Text style={newStyles.continuationStripText}>{label}</Text>
      {pageNumber !== undefined ? (
        <Text style={newStyles.continuationStripPage}>Page {pageNumber}</Text>
      ) : (
        <Text
          render={({ pageNumber: pn }) => `Page ${pn}`}
          style={newStyles.continuationStripPage}
        />
      )}
    </View>
  );
};

/**
 * Colored-bar callout for qualification gate state or compliance/safety flag severity.
 * Background and accent color driven by `statusBannerBackground` + `statusBannerAccent` helpers.
 */
export const StatusBanner = ({
  severity,
  label,
  body,
  children,
}: {
  severity: StatusBannerSeverity;
  label: string;
  body?: string;
  children?: ReactNode;
}) => {
  const bg = statusBannerBackground(severity);
  const accent = statusBannerAccent(severity);

  return (
    <View style={[newStyles.statusBannerWrap, { backgroundColor: bg, borderLeftColor: accent }]}>
      <Text style={[newStyles.statusBannerLabel, { color: accent }]}>{label}</Text>
      {body ? <Text style={newStyles.statusBannerBody}>{body}</Text> : null}
      {children}
    </View>
  );
};

/**
 * Full-width inverted uppercase banner. Used for DRAFT INTENT (red), internal-only footers (red),
 * or navy section dividers.
 */
export const FullWidthBanner = ({
  tone,
  text,
}: {
  tone: "red" | "amber" | "navy";
  text: string;
}) => {
  const { bg, text: textColor } = bannerTone[tone];

  return (
    <View style={[newStyles.fullWidthBannerWrap, { backgroundColor: bg }]}>
      <Text style={[newStyles.fullWidthBannerText, { color: textColor }]}>{text}</Text>
    </View>
  );
};

type FlagSeverity = "stop" | "specialist" | "attention" | "clear";

/**
 * Inline severity pill text — must live inside a Text parent for true inline flow.
 * Uses `severityBg` background tint and the severity foreground color.
 */
export const SeverityToken = ({ severity }: { severity: FlagSeverity }) => {
  const bg = severityBg[severity];
  const color =
    severity === "stop"
      ? h2oBrand.colors.severity.stop
      : severity === "specialist"
        ? h2oBrand.colors.severity.specialist
        : severity === "attention"
          ? h2oBrand.colors.severity.attention
          : h2oBrand.colors.muted;
  const label = severity.toUpperCase();

  return <Text style={[newStyles.severityTokenText, { backgroundColor: bg, color }]}>{label}</Text>;
};

/**
 * Flag list row: monospace ID + SeverityToken pill + evidence text + optional status.
 * Per design §2: `flexBasis: 80` + `flexShrink: 0` on ID column to prevent wrap on long IDs.
 */
export const FlagListItem = ({
  id,
  severity,
  evidence,
  status,
}: {
  id: string;
  severity: FlagSeverity;
  evidence: string;
  status?: string;
}) => (
  <View style={newStyles.flagItemWrap}>
    <Text style={newStyles.flagItemId}>{id}</Text>
    <SeverityToken severity={severity} />
    <Text style={newStyles.flagItemEvidence}>{evidence}</Text>
    {status ? <Text style={newStyles.flagItemStatus}>{status}</Text> : null}
  </View>
);

/**
 * Small-caps inline evidence anchor `[ID]`. Must be nested inside a `Text` parent — drops chip
 * background to support true inline @react-pdf nested-text per design §2 + risk #8.
 * @example <Text>Body text <EvidenceAnchorInline id="PW-01" /></Text>
 */
export const EvidenceAnchorInline = ({ id }: { id: string }) => (
  <Text style={newStyles.evidenceAnchor}>[{id}]</Text>
);

type DataTableColumn = {
  key: string;
  header: string;
  flexBasis: number;
  align?: "left" | "right" | "center";
  cellRender?: (value: string, row: Record<string, string>) => ReactNode;
};

/**
 * Generic data table with explicit `flexBasis` per column to defeat @react-pdf auto-sizing.
 * `headerStyle` controls the header row background treatment.
 */
export const DataTable = ({
  columns,
  rows,
  headerStyle,
}: {
  columns: DataTableColumn[];
  rows: Array<Record<string, string>>;
  headerStyle: "navy-dark" | "navy-light" | "plain";
}) => {
  const headerRowStyle =
    headerStyle === "navy-dark"
      ? newStyles.dataTableHeaderNavyDark
      : headerStyle === "navy-light"
        ? newStyles.dataTableHeaderNavyLight
        : newStyles.dataTableHeaderPlain;

  const headerCellStyle =
    headerStyle === "navy-dark"
      ? newStyles.dataTableHeaderCellNavyDark
      : headerStyle === "navy-light"
        ? newStyles.dataTableHeaderCellNavyLight
        : newStyles.dataTableHeaderCellPlain;

  return (
    <View style={newStyles.dataTableWrap}>
      <View style={[newStyles.dataTableRow, headerRowStyle]}>
        {columns.map((col) => (
          <Text
            key={col.key}
            style={[headerCellStyle, { flexBasis: col.flexBasis, textAlign: col.align ?? "left" }]}
          >
            {col.header}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: rows have no stable id
        <View key={rowIndex} style={newStyles.dataTableRow}>
          {columns.map((col) => (
            <View key={col.key} style={[{ flexBasis: col.flexBasis }]}>
              {col.cellRender ? (
                col.cellRender(row[col.key] ?? "", row)
              ) : (
                <Text style={[newStyles.dataTableBodyCell, { textAlign: col.align ?? "left" }]}>
                  {row[col.key] ?? ""}
                </Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

/**
 * Key-value table: 40% label / 60% value split with thin separators.
 */
export const KVTable = ({ rows }: { rows: Array<{ label: string; value: string }> }) => (
  <View style={newStyles.kvTableWrap}>
    {rows.map((row) => (
      <View key={row.label} style={newStyles.kvTableRow}>
        <Text style={newStyles.kvTableLabel}>{row.label}</Text>
        <Text style={newStyles.kvTableValue}>{row.value}</Text>
      </View>
    ))}
  </View>
);

/**
 * Section heading with accent bottom border and flat numeral.
 * Optional `italicSubLine` renders a colored italic sub-line below the title.
 * New export — `SectionHeader` (dot variant) is kept unchanged for Field Brief Tier 1.
 */
export const SectionHeading = ({
  index,
  title,
  accentColor,
  italicSubLine,
}: {
  index: number;
  title: string;
  accentColor: string;
  italicSubLine?: string;
}) => (
  <View style={[newStyles.sectionHeadingWrap, { borderBottomColor: accentColor }]}>
    <View style={newStyles.sectionHeadingRow}>
      <Text style={[newStyles.sectionHeadingIndex, { color: accentColor }]}>{index}</Text>
      <Text style={[newStyles.sectionHeadingTitle, { color: h2oBrand.colors.navy }]}>{title}</Text>
    </View>
    {italicSubLine ? (
      <Text style={[newStyles.sectionHeadingSubLine, { color: accentColor }]}>{italicSubLine}</Text>
    ) : null}
  </View>
);

/**
 * "Why it matters" accent callout panel with top accent border and bullet list.
 */
export const WhyItMattersCallout = ({
  items,
  accentColor,
}: {
  items: string[];
  accentColor: string;
}) => (
  <View
    style={[
      newStyles.whyCalloutWrap,
      { borderTopColor: accentColor, backgroundColor: h2oBrand.colors.panel },
    ]}
  >
    <Text style={[newStyles.whyCalloutTitle, { color: accentColor }]}>Why it matters</Text>
    {items.map((item) => (
      <View key={item} style={newStyles.whyCalloutItem}>
        <Text style={[newStyles.whyCalloutBullet, { color: accentColor }]}>•</Text>
        <Text style={newStyles.whyCalloutText}>{item}</Text>
      </View>
    ))}
  </View>
);

// ─── T2: TopHeader — Tier 2 document header ───────────────────────────────────

const topHeaderStyles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  brandRow: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  metadataLine: {
    color: h2oBrand.colors.muted,
    flex: 1,
    fontSize: 8,
    lineHeight: 1.15,
    marginLeft: 12,
    textAlign: "right",
  },
  title: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 22,
    lineHeight: 1.05,
    marginBottom: 2,
  },
  subtitle: {
    color: h2oBrand.colors.muted,
    fontFamily: "Helvetica-Oblique",
    fontSize: 10,
    lineHeight: 1.2,
    marginBottom: 2,
  },
  subStreamsLine: {
    color: h2oBrand.colors.muted,
    fontFamily: "Helvetica-Oblique",
    fontSize: 9,
    lineHeight: 1.15,
    marginBottom: 3,
  },
  hr: {
    borderBottomColor: h2oBrand.colors.line,
    borderBottomWidth: 0.5,
    marginBottom: 6,
    marginTop: 2,
  },
});

/**
 * Tier 2 document header. Renders:
 * - compact H2O Allegiant logo + 8pt muted metadata line
 * - 22pt navy bold title
 * - 10pt italic muted subtitle (optional)
 * - 9pt italic muted sub-streams line (optional)
 * - 0.5pt neutral hr rule
 *
 * Used by Call Playbook, Proposal Shell, and Analytical Read.
 * `paddingX` is unused here (layout is flow-relative) but accepted for forward-compat.
 */
export const TopHeader = ({
  metadataLine,
  title,
  subtitle,
  subStreamsLine,
}: {
  metadataLine: string;
  title: string;
  subtitle?: string;
  subStreamsLine?: string;
  paddingX?: number;
}) => (
  <View style={topHeaderStyles.wrap}>
    <View style={topHeaderStyles.brandRow}>
      <LogoMark size="sm" />
      <Text style={topHeaderStyles.metadataLine}>{metadataLine}</Text>
    </View>
    <Text style={topHeaderStyles.title}>{title}</Text>
    {subtitle ? <Text style={topHeaderStyles.subtitle}>{subtitle}</Text> : null}
    {subStreamsLine ? <Text style={topHeaderStyles.subStreamsLine}>{subStreamsLine}</Text> : null}
    <View style={topHeaderStyles.hr} />
  </View>
);

// ─── T3: StrategicInsightCallout ─────────────────────────────────────────────

const strategicInsightStyles = StyleSheet.create({
  wrap: {
    backgroundColor: h2oBrand.colors.lightCyan,
    borderColor: h2oBrand.colors.blue,
    borderWidth: 1,
    marginBottom: 6,
    marginTop: 4,
    padding: 12,
  },
  text: {
    color: h2oBrand.colors.navy,
    fontFamily: "Helvetica-Oblique",
    fontSize: 11,
    lineHeight: 1.3,
    textAlign: "center",
  },
});

/**
 * Closing strategic insight callout. Centered italic 11pt navy text on lightCyan background
 * with brand-blue 1pt border. Used as the closing element in Analytical Read (boss ref §8).
 */
export const StrategicInsightCallout = ({ children }: { children: ReactNode }) => (
  <View style={strategicInsightStyles.wrap}>
    <Text style={strategicInsightStyles.text}>{children}</Text>
  </View>
);
