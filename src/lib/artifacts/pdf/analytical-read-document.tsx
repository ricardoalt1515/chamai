import { Document, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { AnalyticalReadPayload } from "../payloads";
import { h2oBrand } from "./brand-tokens";
import {
  DataTable,
  FlagListItem,
  Footer,
  StatusBanner,
  StrategicInsightCallout,
  TopHeader,
  tier2ContinuationTopReserve,
} from "./shared-document";

// ─── Pure helpers (testable, no React) ───────────────────────────────────────

export const analyticalSectionDefaultColor = (): string => h2oBrand.colors.blue;

/** Returns the border color for evidence tag chips (v3 muted line). */
export const analyticalEvidenceTagBorderColor = (): string => h2oBrand.colors.line;

export const collectTableHeaders = (rows: Array<Record<string, string>>): string[] => {
  const seen = new Map<string, true>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.set(key, true);
      }
    }
  }
  return Array.from(seen.keys());
};

type SharedFlagSeverity = "stop" | "specialist" | "attention" | "clear";

type AnalyticalGateState = "OPEN" | "OPEN-WITH-CONDITIONS" | "CONDITIONALLY-OPEN" | "CLOSED";
type AnalyticalGateSeverity = "open" | "open-with-conditions" | "conditionally-open" | "closed";

export type AnalyticalGateBanner = {
  state: AnalyticalGateState;
  severity: AnalyticalGateSeverity;
  label: string;
};

const analyticalGateBannerByState: Record<AnalyticalGateState, AnalyticalGateBanner> = {
  CLOSED: {
    label: "QUALIFICATION GATE — CLOSED",
    severity: "closed",
    state: "CLOSED",
  },
  "CONDITIONALLY-OPEN": {
    label: "QUALIFICATION GATE — CONDITIONALLY OPEN",
    severity: "conditionally-open",
    state: "CONDITIONALLY-OPEN",
  },
  OPEN: {
    label: "QUALIFICATION GATE — OPEN",
    severity: "open",
    state: "OPEN",
  },
  "OPEN-WITH-CONDITIONS": {
    label: "QUALIFICATION GATE — OPEN (with conditions)",
    severity: "open-with-conditions",
    state: "OPEN-WITH-CONDITIONS",
  },
};

export const normalizeGateState = (raw?: string): AnalyticalGateState => {
  const normalized = raw?.trim().toUpperCase().replaceAll("_", "-");
  if (
    normalized === "OPEN" ||
    normalized === "OPEN-WITH-CONDITIONS" ||
    normalized === "CONDITIONALLY-OPEN" ||
    normalized === "CLOSED"
  ) {
    return normalized;
  }
  return "CLOSED";
};

export const gateStateToBanner = (raw?: string): AnalyticalGateBanner =>
  analyticalGateBannerByState[normalizeGateState(raw)];

export const analyticalFlagSeverity = (raw: string): SharedFlagSeverity => {
  const normalized = raw.toLowerCase().replace(/[^a-z]+/g, " ");
  if (normalized.includes("stop")) {
    return "stop";
  }
  if (normalized.includes("specialist")) {
    return "specialist";
  }
  if (normalized.includes("clear")) {
    return "clear";
  }
  return "attention";
};

export const costConfidenceColor = (tier: string): string => {
  const normalized = tier.toUpperCase();
  if (normalized.includes("HIGH")) {
    return h2oBrand.colors.navy;
  }
  if (normalized.includes("MEDIUM")) {
    return h2oBrand.colors.amber;
  }
  if (normalized.includes("LOW")) {
    return h2oBrand.colors.red;
  }
  return h2oBrand.colors.muted;
};

export const shouldRenderAnalyticalBanners = ({
  gateState,
  flags,
}: {
  gateState?: string;
  flags?: Array<{ id: string; severity: string; evidence: string }>;
}): { gate: boolean; compliance: boolean } => ({
  gate: Boolean(gateState),
  compliance: Boolean(flags?.length),
});

const dataTableColumnsFor = (rows: Array<Record<string, string>>, width = 450) => {
  const headers = collectTableHeaders(rows);
  const flexBasis = Math.floor(width / Math.max(headers.length, 1));
  return headers.map((header) => ({ key: header, header, flexBasis }));
};

const subStreamLensRows = (rows: NonNullable<AnalyticalReadPayload["subStreamLens"]>) =>
  rows.map((row) => ({
    "Sub-stream": row.subStream,
    "Active condition": row.activeCondition,
    Evidence: row.evidenceAnchor,
  }));

const stageGapRows = (rows: NonNullable<AnalyticalReadPayload["stageGapAnalysis"]>) =>
  rows.map((row) => ({ Required: row.required, Status: row.status, Source: row.source }));

export const analyticalReadPagePaddingTop = tier2ContinuationTopReserve;

/**
 * Monospace evidence anchor `[ID]` — plain inline text in Courier font.
 * Replaces the chip-style EvidenceAnchorInline per boss ref: inline `[PW-01]` text.
 * Must be nested inside a Text parent for @react-pdf inline flow.
 */
export const EvidenceTagMono = ({ id }: { id: string }) => (
  <Text style={{ fontFamily: h2oBrand.font.mono, fontSize: 7, color: h2oBrand.colors.muted }}>
    [{id}]
  </Text>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    color: h2oBrand.colors.ink,
    fontFamily: h2oBrand.font.family,
    fontSize: 8.4,
    lineHeight: 1.18,
    paddingBottom: 34,
    paddingHorizontal: h2oBrand.page.paddingX,
    paddingTop: analyticalReadPagePaddingTop,
  },
  section: {
    marginBottom: 7,
  },
  body: {
    fontSize: 8.2,
    lineHeight: 1.18,
    marginBottom: 3,
  },
  tableSectionTitle: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 8,
    marginBottom: 3,
    marginTop: 2,
    textTransform: "uppercase",
  },
  tagRow: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 4,
    marginTop: 3,
  },
  tag: {
    backgroundColor: h2oBrand.colors.panel,
    borderColor: h2oBrand.colors.line,
    borderRadius: 3,
    borderWidth: 0.6,
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 6.6,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    textTransform: "uppercase",
  },
  // Section heading: BIG navy bold "N. Title"
  sectionHeadingText: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 12,
    lineHeight: 1.1,
    marginBottom: 3,
    marginTop: 2,
  },
  // Subsection heading: "N.M Title" navy bold, smaller
  subsectionHeading: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 9.5,
    lineHeight: 1.1,
    marginBottom: 2,
    marginTop: 3,
  },
  costTable: {
    borderColor: h2oBrand.colors.line,
    borderWidth: 0.5,
    marginBottom: 7,
    marginTop: 4,
  },
  costRow: {
    borderTopColor: h2oBrand.colors.line,
    borderTopWidth: 0.5,
    display: "flex",
    flexDirection: "row",
  },
  costHeaderRow: {
    backgroundColor: h2oBrand.colors.panel,
    borderTopWidth: 0,
  },
  costCell: {
    borderRightColor: h2oBrand.colors.line,
    borderRightWidth: 0.5,
    flex: 1,
    fontSize: 7,
    lineHeight: 1.1,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  costHeaderCell: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
  },
  costConfidenceCell: {
    fontFamily: h2oBrand.font.bold,
    textTransform: "uppercase",
  },
});

// ─── Components ───────────────────────────────────────────────────────────────

const TableBlock = ({ title, rows }: { title: string; rows: Array<Record<string, string>> }) => {
  if (!rows.length) {
    return null;
  }
  return (
    <View style={styles.section}>
      <Text style={styles.tableSectionTitle}>{title}</Text>
      <DataTable columns={dataTableColumnsFor(rows)} rows={rows} headerStyle="navy-light" />
    </View>
  );
};

const CostRowsTable = ({ rows }: { rows: NonNullable<AnalyticalReadPayload["costRows"]> }) => {
  if (!rows.length) {
    return null;
  }
  return (
    <View style={styles.section}>
      <Text style={styles.tableSectionTitle}>Cost of alternative</Text>
      <View style={styles.costTable}>
        <View style={[styles.costRow, styles.costHeaderRow]}>
          <Text style={[styles.costCell, styles.costHeaderCell]}>Row</Text>
          <Text style={[styles.costCell, styles.costHeaderCell]}>Basis</Text>
          <Text style={[styles.costCell, styles.costHeaderCell, { borderRightWidth: 0 }]}>
            Confidence
          </Text>
        </View>
        {rows.map((row) => (
          <View key={`${row.row}-${row.basis}`} style={styles.costRow}>
            <Text style={styles.costCell}>{row.row}</Text>
            <Text style={styles.costCell}>{row.basis}</Text>
            <Text
              style={[
                styles.costCell,
                styles.costConfidenceCell,
                { borderRightWidth: 0, color: costConfidenceColor(row.confidence) },
              ]}
            >
              {row.confidence}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export const AnalyticalReadDocument = ({ payload }: { payload: AnalyticalReadPayload }) => {
  const banners = shouldRenderAnalyticalBanners(payload);
  const gateBanner = gateStateToBanner(payload.gateState);
  const legacySectionTables = payload.sections.flatMap((section) => section.table ?? []);

  // Build metadata line for TopHeader
  const customer = payload.customer;
  const metadataParts: string[] = [customer.name];
  if (customer.location) metadataParts.push(customer.location);
  const locationParts: string[] = [];
  if (customer.county && customer.state)
    locationParts.push(`${customer.county}, ${customer.state}`);
  if (customer.basin) locationParts.push(customer.basin);
  if (locationParts.length) metadataParts.push(locationParts.join(" · "));
  metadataParts.push("Internal handover");
  const metadataLine = metadataParts.join(" · ");

  const docTitle = payload.title ?? "Analytical Read";

  return (
    <Document
      author="SecondstreamAI"
      subject="H2O Allegiant Analytical Read"
      title={`${customer.name} Analytical Read`}
    >
      <Page size={h2oBrand.page.size} style={styles.page}>
        <TopHeader
          metadataLine={metadataLine}
          title={docTitle}
          subtitle={payload.subtitle}
          subStreamsLine={payload.subStreamsLine}
        />
        {banners.gate ? (
          <StatusBanner
            severity={gateBanner.severity}
            label={gateBanner.label}
            body={payload.gateContent ?? gateBanner.state}
          />
        ) : null}
        {banners.compliance ? (
          <StatusBanner severity="stop" label="COMPLIANCE & SAFETY">
            {payload.flags?.map((flag) => (
              <FlagListItem
                key={flag.id}
                id={flag.id}
                severity={analyticalFlagSeverity(flag.severity)}
                evidence={flag.evidence}
                status={flag.status}
              />
            ))}
          </StatusBanner>
        ) : null}
        <View style={styles.section}>
          <Text style={styles.sectionHeadingText}>Summary</Text>
          <Text style={styles.body}>{payload.summary}</Text>
        </View>
        {payload.subStreamLens?.length ? (
          <TableBlock title="Sub-stream lens" rows={subStreamLensRows(payload.subStreamLens)} />
        ) : null}
        {payload.flags?.length ? (
          <TableBlock
            title="Active flag inventory"
            rows={payload.flags.map((flag) => ({
              ID: flag.id,
              Severity: flag.severity,
              Evidence: flag.evidence,
              Status: flag.status ?? "",
            }))}
          />
        ) : null}
        {payload.stageGapAnalysis?.length ? (
          <TableBlock title="Stage gap analysis" rows={stageGapRows(payload.stageGapAnalysis)} />
        ) : null}
        {payload.costRows?.length ? <CostRowsTable rows={payload.costRows} /> : null}
        {payload.sections.map((section, arrayIndex) => {
          const sectionNum = section.index ?? arrayIndex + 1;
          return (
            <View key={section.heading} style={styles.section}>
              <Text style={styles.sectionHeadingText}>
                {sectionNum}. {section.heading}
              </Text>
              <Text style={styles.body}>
                {section.body}
                {section.evidenceSource ? (
                  <>
                    {" "}
                    <EvidenceTagMono id={section.evidenceSource} />
                  </>
                ) : null}
              </Text>
              {section.evidenceTags?.length ? (
                <View style={styles.tagRow}>
                  {section.evidenceTags.map((tag) => (
                    <Text key={tag} style={styles.tag}>
                      {tag}
                    </Text>
                  ))}
                </View>
              ) : null}
              {section.subsections?.map((sub, subIndex) => (
                <View key={sub.heading} style={styles.section}>
                  <Text style={styles.subsectionHeading}>
                    {sectionNum}.{subIndex + 1} {sub.heading}
                  </Text>
                  <Text style={styles.body}>
                    {sub.body}
                    {sub.evidenceSource ? (
                      <>
                        {" "}
                        <EvidenceTagMono id={sub.evidenceSource} />
                      </>
                    ) : null}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
        {legacySectionTables.length ? (
          <TableBlock title="Legacy evidence table" rows={legacySectionTables} />
        ) : null}
        {payload.closingInsight ? (
          <StrategicInsightCallout>{payload.closingInsight}</StrategicInsightCallout>
        ) : null}
        <Footer paddingX={h2oBrand.page.paddingX} />
      </Page>
    </Document>
  );
};

export const renderAnalyticalReadPdf = async (payload: AnalyticalReadPayload): Promise<Buffer> =>
  renderToBuffer(<AnalyticalReadDocument payload={payload} />);
