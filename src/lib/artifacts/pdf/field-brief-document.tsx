import { Document, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { FieldBriefPayload } from "../payloads";
import { artifactLabels, h2oBrand } from "./brand-tokens";
import {
  CoverBlock,
  Footer,
  InsightBox,
  LogoMark,
  SectionHeader,
  StageBadge,
} from "./shared-document";

const styles = StyleSheet.create({
  page: {
    color: h2oBrand.colors.ink,
    fontFamily: h2oBrand.font.family,
    fontSize: 9.3,
    lineHeight: 1.35,
    paddingBottom: 52,
    paddingHorizontal: h2oBrand.page.paddingX,
    paddingTop: h2oBrand.page.paddingY,
  },
  pageWithContinuation: {
    paddingTop: 62,
  },
  continuationHeader: {
    alignItems: "center",
    borderBottomColor: h2oBrand.colors.line,
    borderBottomWidth: 1,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    left: h2oBrand.page.paddingX,
    paddingBottom: 5,
    position: "absolute",
    right: h2oBrand.page.paddingX,
    top: 20,
  },
  continuationMiddle: {
    color: h2oBrand.colors.navy,
    flex: 1,
    fontFamily: h2oBrand.font.bold,
    fontSize: 8,
    marginHorizontal: 12,
    textAlign: "center",
  },
  section: {
    marginBottom: 13,
  },
  body: {
    fontSize: 9.3,
    lineHeight: 1.38,
    marginBottom: 7,
  },
  subhead: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 9.5,
    marginBottom: 4,
    marginTop: 3,
  },
  bullet: {
    display: "flex",
    flexDirection: "row",
    gap: 5,
    marginBottom: 4,
  },
  bulletDot: {
    color: h2oBrand.colors.blue,
    width: 7,
  },
  bulletText: {
    flex: 1,
  },
  table: {
    marginTop: 6,
  },
  tableRow: {
    borderBottomColor: h2oBrand.colors.line,
    borderBottomWidth: 0.5,
    display: "flex",
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: h2oBrand.colors.panel,
    borderBottomColor: h2oBrand.colors.navy,
    borderBottomWidth: 0.8,
  },
  tableTotal: {
    backgroundColor: h2oBrand.colors.panelBlue,
    borderBottomWidth: 0,
    paddingVertical: 2,
  },
  tableCell: {
    fontSize: 7.7,
    lineHeight: 1.25,
    paddingHorizontal: 5,
    paddingVertical: 4,
  },
  componentCell: {
    width: "30%",
  },
  pathCell: {
    borderLeftColor: h2oBrand.colors.line,
    borderLeftWidth: 0.5,
    width: "35%",
  },
  headerText: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
  },
  totalText: {
    fontFamily: h2oBrand.font.bold,
    fontSize: 8.2,
  },
  totalNegative: {
    color: h2oBrand.colors.red,
  },
  totalPositive: {
    color: h2oBrand.colors.green,
  },
  riskCard: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    marginBottom: 9,
    paddingTop: 1,
  },
  rankBadge: {
    alignItems: "center",
    borderRadius: 999,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  rankBadgeText: {
    color: h2oBrand.colors.white,
    fontFamily: h2oBrand.font.bold,
    fontSize: 11,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 9.8,
    marginBottom: 2,
  },
  mitigation: {
    color: h2oBrand.colors.muted,
    fontSize: 8.8,
    fontStyle: "italic",
    lineHeight: 1.25,
  },
  actionCard: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    marginBottom: 9,
    paddingTop: 1,
  },
  actionNumber: {
    alignItems: "center",
    backgroundColor: h2oBrand.colors.blue,
    borderRadius: 4,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  timeframe: {
    color: h2oBrand.colors.blue,
    fontFamily: h2oBrand.font.bold,
  },
  stopFlag: {
    borderColor: h2oBrand.colors.red,
    borderRadius: 5,
    borderWidth: 0.8,
    marginBottom: 6,
    padding: 7,
  },
  muted: {
    color: h2oBrand.colors.muted,
    fontSize: 8.6,
  },
});

export type FieldBriefSectionKey =
  | "what-this-is"
  | "what-we-would-propose"
  | "what-could-kill-it"
  | "do-this-next";

export const sectionMarkerColor = (section: FieldBriefSectionKey): string => {
  if (section === "what-we-would-propose") return h2oBrand.colors.green;
  if (section === "what-could-kill-it") return h2oBrand.colors.red;
  if (section === "do-this-next") return h2oBrand.colors.navy;
  return h2oBrand.colors.blue;
};

export const riskRankColor = (rank: number): string =>
  rank === 1 ? h2oBrand.colors.severity.stop : h2oBrand.colors.severity.specialist;

export const fieldBriefContinuationLabel = (customerName: string): string =>
  `${customerName} · Field Brief (continued)`;

export type CostColumn = "component" | "theirPath" | "ourProposal";
export type CostRowStyleRole = "body" | "total-label" | "total-negative" | "total-positive";

export const costRowStyleRole = ({
  column,
  isTotal,
}: {
  column: CostColumn;
  isTotal?: boolean;
}): CostRowStyleRole => {
  if (!isTotal) return "body";
  if (column === "theirPath") return "total-negative";
  if (column === "ourProposal") return "total-positive";
  return "total-label";
};

const costCellStyle = (column: CostColumn, isTotal?: boolean) => {
  const role = costRowStyleRole({ column, isTotal });
  const widthStyle = column === "component" ? styles.componentCell : styles.pathCell;

  if (role === "total-negative") {
    return [styles.tableCell, widthStyle, styles.totalText, styles.totalNegative];
  }
  if (role === "total-positive") {
    return [styles.tableCell, widthStyle, styles.totalText, styles.totalPositive];
  }
  if (role === "total-label") {
    return [styles.tableCell, widthStyle, styles.totalText];
  }
  return [styles.tableCell, widthStyle];
};

const Bullet = ({ lead, body }: { lead: string; body: string }) => (
  <View style={styles.bullet}>
    <Text style={styles.bulletDot}>•</Text>
    <Text style={styles.bulletText}>
      <Text style={{ fontFamily: h2oBrand.font.bold }}>{lead}: </Text>
      {body}
    </Text>
  </View>
);

const CostTable = ({
  rows,
}: {
  rows: FieldBriefPayload["sections"]["whatWeWouldPropose"]["costOfAlternativeRows"];
}) => (
  <View style={styles.table}>
    <View style={[styles.tableRow, styles.tableHeader]}>
      <Text style={[styles.tableCell, styles.componentCell, styles.headerText]}>
        Cost component
      </Text>
      <Text style={[styles.tableCell, styles.pathCell, styles.headerText]}>Their path</Text>
      <Text style={[styles.tableCell, styles.pathCell, styles.headerText]}>Our proposal</Text>
    </View>
    {rows.map((row) => (
      <View
        key={`${row.component}-${row.theirPath}`}
        style={row.isTotal ? [styles.tableRow, styles.tableTotal] : styles.tableRow}
      >
        <Text style={costCellStyle("component", row.isTotal)}>{row.component}</Text>
        <Text style={costCellStyle("theirPath", row.isTotal)}>{row.theirPath}</Text>
        <Text style={costCellStyle("ourProposal", row.isTotal)}>{row.ourProposal}</Text>
      </View>
    ))}
  </View>
);

const StopFlags = ({ flags }: { flags: NonNullable<FieldBriefPayload["stopFlags"]> }) => {
  if (!flags.length) return null;

  return (
    <View style={styles.section}>
      <SectionHeader color={sectionMarkerColor("what-could-kill-it")}>Stop flags</SectionHeader>
      {flags.map((flag) => (
        <View key={flag.title} style={styles.stopFlag} wrap={false}>
          <Text style={styles.cardTitle}>{flag.title}</Text>
          <Text>{flag.summary}</Text>
        </View>
      ))}
    </View>
  );
};

const ContinuationHeader = ({ customerName, stage }: { customerName: string; stage: string }) => (
  <View fixed style={styles.continuationHeader}>
    <LogoMark />
    <Text style={styles.continuationMiddle}>{fieldBriefContinuationLabel(customerName)}</Text>
    <StageBadge stage={stage} />
  </View>
);

const RiskCard = ({
  rank,
  risk,
}: {
  rank: number;
  risk: FieldBriefPayload["sections"]["whatCouldKillIt"]["risks"][number];
}) => (
  <View style={styles.riskCard} wrap={false}>
    <View style={[styles.rankBadge, { backgroundColor: riskRankColor(rank) }]}>
      <Text style={styles.rankBadgeText}>{rank}</Text>
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{risk.name}</Text>
      <Text style={styles.body}>{risk.mechanism}</Text>
      <Text style={styles.mitigation}>Mitigation: {risk.mitigation}</Text>
    </View>
  </View>
);

const ActionCard = ({
  action,
  index,
}: {
  action: FieldBriefPayload["sections"]["doThisNext"]["actions"][number];
  index: number;
}) => (
  <View style={styles.actionCard} wrap={false}>
    <View style={styles.actionNumber}>
      <Text style={styles.rankBadgeText}>{index + 1}</Text>
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>
        {action.title} <Text style={styles.timeframe}>· {action.timeframe}</Text>
      </Text>
      <Text>{action.body}</Text>
    </View>
  </View>
);

export const FieldBriefDocument = ({ payload }: { payload: FieldBriefPayload }) => {
  const proposal = payload.sections.whatWeWouldPropose;
  const risks = payload.sections.whatCouldKillIt.risks;
  const actions = payload.sections.doThisNext.actions;

  return (
    <Document
      author="SecondstreamAI"
      subject="H2O Allegiant Field Brief"
      title={`${payload.customer.name} Field Brief`}
    >
      <Page size={h2oBrand.page.size} style={styles.page}>
        <CoverBlock
          artifactLabel={artifactLabels.fieldBrief}
          customerName={`${payload.customer.name} Field Brief`}
          date={payload.date}
          location={payload.customer.location}
          stage={payload.stage}
        />
        <StopFlags flags={payload.stopFlags ?? []} />

        <View style={styles.section}>
          <SectionHeader color={sectionMarkerColor("what-this-is")}>What this is</SectionHeader>
          <InsightBox>{payload.sections.whatThisIs.insight}</InsightBox>
          <Text style={styles.body}>{payload.sections.whatThisIs.body}</Text>
        </View>

        <View style={styles.section}>
          <SectionHeader color={sectionMarkerColor("what-we-would-propose")}>
            What we'd propose
          </SectionHeader>
          <InsightBox>{proposal.insight}</InsightBox>
          <Text style={styles.subhead}>Recommended approach</Text>
          <Text style={styles.body}>{proposal.recommendedApproach}</Text>
          <Text style={styles.subhead}>
            Why the customer should want this — the win-win argument
          </Text>
          {proposal.winWinArguments.map((argument) => (
            <Bullet key={argument.lead} lead={argument.lead} body={argument.body} />
          ))}
          <Text style={styles.subhead}>Cost of the alternative — fully priced over 5 years</Text>
          <CostTable rows={proposal.costOfAlternativeRows} />
          {proposal.dealSizeSensitivity ? (
            <Text style={[styles.body, styles.muted]}>
              Sensitivity: {proposal.dealSizeSensitivity}
            </Text>
          ) : null}
        </View>
        <Footer label="H2O Allegiant Field Brief" />
      </Page>

      <Page size={h2oBrand.page.size} style={[styles.page, styles.pageWithContinuation]}>
        <ContinuationHeader customerName={payload.customer.name} stage={payload.stage} />
        <View style={styles.section}>
          <SectionHeader color={sectionMarkerColor("what-could-kill-it")}>
            What could kill it
          </SectionHeader>
          <InsightBox>{payload.sections.whatCouldKillIt.insight}</InsightBox>
          {risks.map((risk, index) => (
            <RiskCard key={risk.name} rank={index + 1} risk={risk} />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader color={sectionMarkerColor("do-this-next")}>Do this next</SectionHeader>
          <InsightBox>{payload.sections.doThisNext.insight}</InsightBox>
          {actions.map((action, index) => (
            <ActionCard key={action.title} action={action} index={index} />
          ))}
        </View>
        <Footer label="H2O Allegiant Field Brief" />
      </Page>
    </Document>
  );
};

export const renderFieldBriefPdf = async (payload: FieldBriefPayload): Promise<Buffer> =>
  renderToBuffer(<FieldBriefDocument payload={payload} />);
