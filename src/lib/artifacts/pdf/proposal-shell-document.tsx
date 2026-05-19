import { Document, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ProposalShellPayload } from "../payloads";
import { artifactLabels, h2oBrand } from "./brand-tokens";
import { CoverBlock, Footer, SectionHeader } from "./shared-document";

// ─── Pure helpers (testable, no React) ───────────────────────────────────────

export const proposalCommitBorderColor = (
  type: "commitTo" | "doNotCommitYet",
): string => (type === "commitTo" ? h2oBrand.colors.green : h2oBrand.colors.amber);

/** Returns the left-accent bar color for the executive summary block. */
export const proposalExecSummaryAccentColor = (): string => h2oBrand.colors.blue;

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
    marginBottom: 6,
  },
  body: {
    fontSize: 8.2,
    lineHeight: 1.15,
    marginBottom: 2,
  },
  // Executive summary block — left accent, denser line height
  execSummaryBlock: {
    backgroundColor: h2oBrand.colors.panelBlue,
    borderLeftColor: h2oBrand.colors.blue,
    borderLeftWidth: 3,
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 8.2,
    lineHeight: 1.15,
    marginBottom: 2,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  // Scope bullets — consistent glyph, tight indent matching Field Brief
  bullet: {
    display: "flex",
    flexDirection: "row",
    gap: 5,
    marginBottom: 1.5,
  },
  bulletDot: {
    color: h2oBrand.colors.blue,
    fontFamily: h2oBrand.font.bold,
    width: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 8.2,
    lineHeight: 1.15,
  },
  // Panel treatment for risk/funding blocks
  panelBlock: {
    backgroundColor: h2oBrand.colors.panel,
    borderColor: h2oBrand.colors.line,
    borderRadius: 3,
    borderWidth: 0.5,
    marginBottom: 2,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  panelBody: {
    fontSize: 8.2,
    lineHeight: 1.15,
  },
  // Commit cards — tighter internal spacing
  commitGrid: {
    display: "flex",
    flexDirection: "row",
    gap: 6,
    marginBottom: 3,
  },
  commitCard: {
    borderColor: h2oBrand.colors.line,
    borderRadius: 4,
    borderWidth: 0.8,
    flex: 1,
    padding: 5,
  },
  commitTitle: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 8,
    marginBottom: 2,
  },
});

// ─── Components ───────────────────────────────────────────────────────────────

const BulletList = ({ items }: { items: string[] }) => (
  <View>
    {items.map((item) => (
      <View key={item} style={styles.bullet}>
        <Text style={styles.bulletDot}>•</Text>
        <Text style={styles.bulletText}>{item}</Text>
      </View>
    ))}
  </View>
);

export const ProposalShellDocument = ({ payload }: { payload: ProposalShellPayload }) => {
  const commitTo = payload.commitments.commitTo ?? [];
  const doNotCommit = payload.commitments.doNotCommitYet ?? [];
  return (
    <Document
      author="SecondstreamAI"
      subject="H2O Allegiant Proposal Shell"
      title={`${payload.customer.name} Proposal Shell`}
    >
      <Page size={h2oBrand.page.size} style={styles.page}>
        <CoverBlock
          artifactLabel={artifactLabels.proposalShell}
          customerName={payload.title ?? `${payload.customer.name} Proposal Shell`}
          location={payload.customer.location}
          stage="Propose"
        />
        <View style={styles.section}>
          <SectionHeader color={proposalExecSummaryAccentColor()}>Executive summary</SectionHeader>
          <Text style={styles.execSummaryBlock}>{payload.executiveSummary}</Text>
        </View>
        <View style={styles.section}>
          <SectionHeader color={h2oBrand.colors.green}>Proposed scope</SectionHeader>
          <BulletList items={payload.proposedScope} />
        </View>
        <View style={styles.section}>
          <SectionHeader color={h2oBrand.colors.navy}>Sizing and pricing</SectionHeader>
          <Text style={styles.body}>{payload.sizingAndPricing}</Text>
        </View>
        <View style={styles.section}>
          <SectionHeader color={h2oBrand.colors.navy}>Schedule</SectionHeader>
          <Text style={styles.body}>{payload.schedule}</Text>
        </View>
        {commitTo.length || doNotCommit.length ? (
          <View style={styles.section} wrap={false}>
            <SectionHeader color={h2oBrand.colors.navy}>Commitments</SectionHeader>
            <View style={styles.commitGrid}>
              {commitTo.length ? (
                <View
                  style={[
                    styles.commitCard,
                    {
                      borderLeftColor: proposalCommitBorderColor("commitTo"),
                      borderLeftWidth: 3,
                    },
                  ]}
                >
                  <Text style={styles.commitTitle}>Commit to</Text>
                  <BulletList items={commitTo} />
                </View>
              ) : null}
              {doNotCommit.length ? (
                <View
                  style={[
                    styles.commitCard,
                    {
                      borderLeftColor: proposalCommitBorderColor("doNotCommitYet"),
                      borderLeftWidth: 3,
                    },
                  ]}
                >
                  <Text style={styles.commitTitle}>Do not commit yet</Text>
                  <BulletList items={doNotCommit} />
                </View>
              ) : null}
            </View>
          </View>
        ) : null}
        {payload.fundingPathway ? (
          <View style={styles.section}>
            <SectionHeader color={h2oBrand.colors.navy}>Funding pathway</SectionHeader>
            <View style={styles.panelBlock}>
              <Text style={styles.panelBody}>{payload.fundingPathway}</Text>
            </View>
          </View>
        ) : null}
        {payload.riskAllocation ? (
          <View style={styles.section}>
            <SectionHeader color={h2oBrand.colors.red}>Risk allocation</SectionHeader>
            <View style={[styles.panelBlock, { borderColor: h2oBrand.colors.red, borderLeftWidth: 2, borderLeftColor: h2oBrand.colors.red }]}>
              <Text style={styles.panelBody}>{payload.riskAllocation}</Text>
            </View>
          </View>
        ) : null}
        <Footer label="H2O Allegiant Proposal Shell" />
      </Page>
    </Document>
  );
};

export const renderProposalShellPdf = async (payload: ProposalShellPayload): Promise<Buffer> =>
  renderToBuffer(<ProposalShellDocument payload={payload} />);
