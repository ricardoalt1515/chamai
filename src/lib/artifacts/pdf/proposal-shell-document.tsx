import { Document, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ProposalShellPayload } from "../payloads";
import { h2oBrand } from "./brand-tokens";
import {
  DataTable,
  Footer,
  FullWidthBanner,
  KVTable,
  TopHeader,
  tier2ContinuationTopReserve,
} from "./shared-document";

// ─── Pure helpers (testable, no React) ───────────────────────────────────────

/** Returns the left-accent bar color for the executive summary block. */
export const proposalExecSummaryAccentColor = (): string => h2oBrand.colors.blue;

export const proposalBannerDefaultsToTrue = (field?: boolean): boolean => field !== false;

export const PROPOSAL_TOP_BANNER_TEXT =
  "DRAFT INTENT — STAGE: LEAD · THIS IS NOT A CUSTOMER-FACING DRAFT";

export const PROPOSAL_BOTTOM_BANNER_TEXT =
  "Treat this document as Internal scoping intent only. Refresh at every stage advance.";

export const buildGatesToCloseColumns = (rows: Array<Record<string, string>>) => {
  const keys = Object.keys(rows[0] ?? {});
  if (!keys.length) {
    return [];
  }
  const flexBasis = Math.floor(450 / keys.length);
  return keys.map((key) => ({ key, header: key, flexBasis }));
};

type ProposalCommitment = ProposalShellPayload["commitments"][number];

export const shouldRenderCommitments = (
  commitments?: ProposalShellPayload["commitments"],
): boolean => Boolean(commitments?.length);

export const proposalCommitmentMetaLine = (
  commitment: Pick<ProposalCommitment, "date" | "owner">,
): string | undefined =>
  [commitment.date, commitment.owner].filter(Boolean).join(" · ") || undefined;

export const proposalShellPagePaddingTop = tier2ContinuationTopReserve;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    color: h2oBrand.colors.ink,
    fontFamily: h2oBrand.font.family,
    fontSize: 8.4,
    lineHeight: 1.18,
    paddingBottom: 34,
    paddingHorizontal: h2oBrand.page.paddingX,
    paddingTop: proposalShellPagePaddingTop,
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
  statusBody: {
    fontSize: 8.2,
    lineHeight: 1.16,
    marginBottom: 4,
  },
  outOfScopeItem: {
    marginBottom: 4,
  },
  outOfScopeHeading: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 8.1,
    marginBottom: 1,
  },
  commitmentMeta: {
    color: h2oBrand.colors.muted,
    fontFamily: "Helvetica-Oblique",
    fontSize: 7,
    marginTop: 1,
  },
  // Big navy bold section title (boss ref: no dot, no bullet)
  sectionTitle: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 12,
    lineHeight: 1.1,
    marginBottom: 4,
    marginTop: 2,
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

/**
 * Big navy bold section heading (no dot marker). Boss ref: plain bold text at ~12pt navy.
 */
const SectionTitle = ({ children }: { children: string }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

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

const Commitments = ({ items }: { items: ProposalCommitment[] }) => (
  <View style={styles.commitGrid}>
    {items.map((item) => {
      const meta = proposalCommitmentMetaLine(item);
      return (
        <View key={`${item.label}-${item.text}`} style={styles.commitCard}>
          <Text style={styles.commitTitle}>{item.label}</Text>
          <Text style={styles.bulletText}>{item.text}</Text>
          {meta ? <Text style={styles.commitmentMeta}>{meta}</Text> : null}
        </View>
      );
    })}
  </View>
);

export const ProposalShellDocument = ({ payload }: { payload: ProposalShellPayload }) => {
  const commitments = payload.commitments;
  const gatesColumns = buildGatesToCloseColumns(payload.gatesToClose ?? []);

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

  const docTitle = payload.title ?? "Proposal Shell — directional scoping";
  // Build subtitle: use payload.subtitle or compose from stage field
  const docSubtitle = payload.subtitle ?? "Stage: Lead · Intent-only · Not for customer delivery";

  return (
    <Document
      author="SecondstreamAI"
      subject="H2O Allegiant Proposal Shell"
      title={`${customer.name} Proposal Shell`}
    >
      <Page size={h2oBrand.page.size} style={styles.page}>
        <TopHeader metadataLine={metadataLine} title={docTitle} subtitle={docSubtitle} />
        {proposalBannerDefaultsToTrue(payload.draftIntentBanner) ? (
          <FullWidthBanner tone="red" text={PROPOSAL_TOP_BANNER_TEXT} />
        ) : null}
        {payload.statusOfDocument ? (
          <View style={styles.section}>
            <SectionTitle>Status of this document</SectionTitle>
            <Text style={styles.statusBody}>{payload.statusOfDocument}</Text>
          </View>
        ) : null}
        <View style={styles.section}>
          <SectionTitle>Scope intent (phase 1)</SectionTitle>
          <Text style={styles.execSummaryBlock}>{payload.executiveSummary}</Text>
          <BulletList items={payload.proposedScope} />
        </View>
        {payload.phase2Prize ? (
          <View style={styles.section}>
            <SectionTitle>Phase 2 prize</SectionTitle>
            <Text style={styles.body}>{payload.phase2Prize}</Text>
          </View>
        ) : null}
        {payload.workPackages?.length ? (
          <View style={styles.section}>
            <SectionTitle>Indicative commercial shape</SectionTitle>
            <DataTable
              columns={[
                { key: "name", header: "Work package", flexBasis: 200 },
                { key: "outcome", header: "Outcome / deliverable", flexBasis: 250 },
              ]}
              headerStyle="navy-dark"
              rows={payload.workPackages.map((row) => ({ name: row.name, outcome: row.outcome }))}
            />
          </View>
        ) : null}
        <View style={styles.section}>
          <SectionTitle>Indicative commercial shape</SectionTitle>
          {payload.sizingRows?.length ? (
            <KVTable rows={payload.sizingRows} />
          ) : (
            <Text style={styles.body}>{payload.sizingAndPricing}</Text>
          )}
          <Text style={styles.body}>{payload.schedule}</Text>
        </View>
        {payload.outOfScope?.length ? (
          <View style={styles.section}>
            <SectionTitle>Explicitly out of scope (or deferred)</SectionTitle>
            {payload.outOfScope.map((item) => (
              <View key={item.heading} style={styles.outOfScopeItem}>
                <Text style={styles.outOfScopeHeading}>{item.heading}</Text>
                <Text style={styles.body}>{item.body}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {payload.gatesToClose?.length ? (
          <View style={styles.section}>
            <SectionTitle>What needs to close before drafting a real proposal</SectionTitle>
            <DataTable
              columns={gatesColumns}
              headerStyle="navy-light"
              rows={payload.gatesToClose}
            />
          </View>
        ) : null}
        {shouldRenderCommitments(commitments) ? (
          <View style={styles.section} wrap={false}>
            <SectionTitle>Commitments</SectionTitle>
            <Commitments items={commitments} />
          </View>
        ) : null}
        {payload.fundingPathway ? (
          <View style={styles.section}>
            <SectionTitle>Funding pathway</SectionTitle>
            <View style={styles.panelBlock}>
              <Text style={styles.panelBody}>{payload.fundingPathway}</Text>
            </View>
          </View>
        ) : null}
        {payload.riskAllocation ? (
          <View style={styles.section}>
            <SectionTitle>Risk allocation</SectionTitle>
            <View
              style={[
                styles.panelBlock,
                {
                  borderColor: h2oBrand.colors.red,
                  borderLeftColor: h2oBrand.colors.red,
                  borderLeftWidth: 2,
                },
              ]}
            >
              <Text style={styles.panelBody}>{payload.riskAllocation}</Text>
            </View>
          </View>
        ) : null}
        {proposalBannerDefaultsToTrue(payload.internalOnlyFooterBanner) ? (
          <FullWidthBanner tone="red" text={PROPOSAL_BOTTOM_BANNER_TEXT} />
        ) : null}
        <Footer paddingX={h2oBrand.page.paddingX} />
      </Page>
    </Document>
  );
};

export const renderProposalShellPdf = async (payload: ProposalShellPayload): Promise<Buffer> =>
  renderToBuffer(<ProposalShellDocument payload={payload} />);
