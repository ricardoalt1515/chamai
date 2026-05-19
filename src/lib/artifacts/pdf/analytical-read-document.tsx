import { Document, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { AnalyticalReadPayload } from "../payloads";
import { artifactLabels, h2oBrand } from "./brand-tokens";
import { CoverBlock, Footer, InsightBox, SectionHeader } from "./shared-document";

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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    color: h2oBrand.colors.ink,
    fontFamily: h2oBrand.font.family,
    fontSize: 8.4,
    lineHeight: 1.18,
    paddingBottom: 34,
    paddingHorizontal: h2oBrand.page.paddingX,
    paddingTop: h2oBrand.page.paddingY,
  },
  section: {
    marginBottom: 7,
  },
  body: {
    fontSize: 8.2,
    lineHeight: 1.18,
    marginBottom: 3,
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
  table: {
    borderColor: h2oBrand.colors.line,
    borderWidth: 0.5,
    marginTop: 4,
  },
  tableRow: {
    borderTopColor: h2oBrand.colors.line,
    borderTopWidth: 0.5,
    display: "flex",
    flexDirection: "row",
  },
  tableHeaderRow: {
    backgroundColor: h2oBrand.colors.panel,
    borderTopWidth: 0,
    borderBottomColor: h2oBrand.colors.navy,
    borderBottomWidth: 0.8,
  },
  tableHeaderCell: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
  },
  tableCell: {
    borderRightColor: h2oBrand.colors.line,
    borderRightWidth: 0.5,
    flex: 1,
    fontSize: 7,
    lineHeight: 1.1,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
});

// ─── Components ───────────────────────────────────────────────────────────────

const SectionTable = ({ rows }: { rows: Array<Record<string, string>> }) => {
  const headers = collectTableHeaders(rows);
  if (!headers.length) {
    return null;
  }
  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeaderRow]}>
        {headers.map((header, index) => (
          <Text
            key={header}
            style={[
              styles.tableCell,
              styles.tableHeaderCell,
              index === headers.length - 1 ? { borderRightWidth: 0 } : {},
            ]}
          >
            {header}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View
          key={`row-${rowIndex}-${headers.map((h) => row[h] ?? "").join("|")}`}
          style={styles.tableRow}
        >
          {headers.map((header, colIndex) => (
            <Text
              key={header}
              style={[
                styles.tableCell,
                colIndex === headers.length - 1 ? { borderRightWidth: 0 } : {},
              ]}
            >
              {row[header] ?? ""}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
};

export const AnalyticalReadDocument = ({ payload }: { payload: AnalyticalReadPayload }) => (
  <Document
    author="SecondstreamAI"
    subject="H2O Allegiant Analytical Read"
    title={`${payload.customer.name} Analytical Read`}
  >
    <Page size={h2oBrand.page.size} style={styles.page}>
      <CoverBlock
        artifactLabel={artifactLabels.analyticalRead}
        customerName={payload.title ?? `${payload.customer.name} Analytical Read`}
        location={payload.customer.location}
        stage="Record"
      />
      <View style={styles.section}>
        <SectionHeader color={analyticalSectionDefaultColor()}>Summary</SectionHeader>
        <InsightBox>{payload.summary}</InsightBox>
      </View>
      {payload.sections.map((section) => (
        <View key={section.heading} style={styles.section}>
          <SectionHeader color={analyticalSectionDefaultColor()}>{section.heading}</SectionHeader>
          <Text style={styles.body}>{section.body}</Text>
          {section.evidenceTags?.length ? (
            <View style={styles.tagRow}>
              {section.evidenceTags.map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          ) : null}
          {section.table?.length ? <SectionTable rows={section.table} /> : null}
        </View>
      ))}
      <Footer label="H2O Allegiant Analytical Read" />
    </Page>
  </Document>
);

export const renderAnalyticalReadPdf = async (payload: AnalyticalReadPayload): Promise<Buffer> =>
  renderToBuffer(<AnalyticalReadDocument payload={payload} />);
