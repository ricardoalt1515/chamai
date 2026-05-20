import { Document, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { FieldBriefPayload } from "../payloads";
import { h2oBrand } from "./brand-tokens";
import { Footer, InsightBox, LogoMark, SectionHeader, StageBadge } from "./shared-document";

// Type scale and layout mirror the canonical reference render_field_brief.py + brand.py +
// h2o-field-brief-SPEC.md from `H2O Allegiant Discovery Agent v3/`. Page margins 0.75" L/R,
// 0.45" T/B; body 9.5pt @ 1.26 leading; cover title 14pt navy; insight 10.5pt bold navy
// (rendered by shared-document.tsx InsightBox).
const FIELD_BRIEF_PAGE_PADDING_X = 54; // 0.75" * 72pt
const FIELD_BRIEF_PAGE_PADDING_Y = 32.4; // 0.45" * 72pt

const styles = StyleSheet.create({
  page: {
    color: h2oBrand.colors.ink,
    fontFamily: h2oBrand.font.family,
    fontSize: 9,
    lineHeight: 1.2,
    paddingBottom: FIELD_BRIEF_PAGE_PADDING_Y,
    paddingHorizontal: FIELD_BRIEF_PAGE_PADDING_X,
    paddingTop: FIELD_BRIEF_PAGE_PADDING_Y,
  },
  pageWithContinuation: {
    paddingTop: 32,
  },
  continuationHeader: {
    alignItems: "center",
    borderBottomColor: h2oBrand.colors.line,
    borderBottomWidth: 0.5,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    left: FIELD_BRIEF_PAGE_PADDING_X,
    paddingBottom: 3,
    position: "absolute",
    right: FIELD_BRIEF_PAGE_PADDING_X,
    top: 14,
  },
  continuationMiddle: {
    color: h2oBrand.colors.navy,
    flex: 1,
    fontFamily: h2oBrand.font.bold,
    fontSize: 9,
    marginHorizontal: 10,
    textAlign: "center",
  },
  continuationStageText: {
    color: h2oBrand.colors.muted,
    fontFamily: h2oBrand.font.bold,
    fontSize: 9,
  },
  section: {
    marginBottom: 2,
  },
  body: {
    fontSize: 9,
    lineHeight: 1.2,
    marginBottom: 2,
  },
  // Subhead — sits on the line above body with minimal margin (matches boss's compact subhead density).
  subhead: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 9.5,
    marginBottom: 0,
    marginTop: 1,
  },
  winWinParagraph: {
    fontSize: 9,
    lineHeight: 1.2,
    marginBottom: 2,
  },
  // Inline bold lead used as a paragraph-start label (e.g. "Recommended approach:").
  inlineLead: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
  },
  table: {
    marginTop: 4,
  },
  tableRow: {
    borderBottomColor: h2oBrand.colors.line,
    borderBottomWidth: 0.25,
    display: "flex",
    flexDirection: "row",
  },
  // Header row carries a thicker brand-navy underline per brand.py cost_of_alternative_table.
  tableHeaderPlain: {
    backgroundColor: h2oBrand.colors.panel,
    borderBottomColor: h2oBrand.colors.navy,
    borderBottomWidth: 0.5,
  },
  tableTotal: {
    backgroundColor: h2oBrand.colors.panelBlue,
    borderBottomWidth: 0,
    paddingVertical: 2,
  },
  tableCell: {
    fontSize: 8.5,
    lineHeight: 1.15,
    paddingHorizontal: 5,
    paddingVertical: 2.5,
  },
  componentCell: {
    width: "24%",
  },
  pathCell: {
    borderLeftColor: h2oBrand.colors.line,
    borderLeftWidth: 0.5,
    width: "38%",
  },
  headerText: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 9.5,
  },
  totalText: {
    fontFamily: h2oBrand.font.bold,
    fontSize: 10,
  },
  totalNegative: {
    color: h2oBrand.colors.red,
  },
  totalPositive: {
    color: h2oBrand.colors.green,
  },
  cardRow: {
    display: "flex",
    flexDirection: "row",
    gap: 6,
    marginBottom: 3,
  },
  // 18×18 circle — severity-coloured for risks (slightly smaller than spec 22pt to keep 2-page density).
  rankCircle: {
    alignItems: "center",
    borderRadius: 9,
    height: 18,
    justifyContent: "center",
    width: 18,
  },
  // 18×18 rounded rect — BRAND_BLUE for actions.
  rankBox: {
    alignItems: "center",
    backgroundColor: h2oBrand.colors.blue,
    borderRadius: 3,
    height: 18,
    justifyContent: "center",
    width: 18,
  },
  rankLabel: {
    color: h2oBrand.colors.white,
    fontFamily: h2oBrand.font.bold,
    fontSize: 9.5,
    lineHeight: 1.0,
    textAlign: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 9.5,
    lineHeight: 1.18,
    marginBottom: 0,
  },
  // Risk body: mechanism + inline italic muted Mitigation in a SINGLE paragraph.
  riskBody: {
    fontSize: 9,
    lineHeight: 1.18,
  },
  mitigationInline: {
    color: h2oBrand.colors.muted,
    fontFamily: "Helvetica-Oblique",
  },
  timeframe: {
    color: h2oBrand.colors.blue,
    fontFamily: "Helvetica-Oblique",
  },
  muted: {
    color: h2oBrand.colors.muted,
    fontSize: 9,
  },
  sensitivityCaption: {
    color: h2oBrand.colors.muted,
    fontFamily: "Helvetica-Oblique",
    fontSize: 8.5,
    lineHeight: 1.2,
    marginTop: 2,
  },
  // Narrative callouts now live INSIDE 'What this is' as plain body paragraphs — no own header.
  narrativeCalloutItem: {
    fontSize: 9,
    lineHeight: 1.2,
    marginBottom: 3,
  },
  cover: {
    marginBottom: 4,
  },
  coverTop: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  coverTitle: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 14,
    lineHeight: 1.18,
    marginBottom: 0,
  },
  coverMetadata: {
    borderBottomColor: h2oBrand.colors.line,
    borderBottomWidth: 0.5,
    color: h2oBrand.colors.muted,
    fontSize: 9,
    lineHeight: 1.2,
    paddingBottom: 2,
  },
  // Bold inline 'Field Brief' token inside the metadata line (per cover_block in brand.py).
  coverMetadataBold: {
    color: h2oBrand.colors.muted,
    fontFamily: h2oBrand.font.bold,
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

type CostRows = FieldBriefPayload["sections"]["whatWeWouldPropose"]["costOfAlternativeRows"];

export const splitCostRowsForTwoPageBrief = (
  rows: CostRows,
): {
  pageOneRows: CostRows;
  pageTwoRows: CostRows;
} => {
  if (rows.length <= 3) return { pageOneRows: rows, pageTwoRows: [] };
  return { pageOneRows: rows.slice(0, 2), pageTwoRows: rows.slice(2) };
};

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

/**
 * Builds the Field Brief H1 title.
 * Format: `{customer.name} — {site}` when location is present; falls back to `{customer.name}`.
 * Strips any city/state suffix that may have been appended to `location` — the H1 carries
 * only the site/sub-asset name; county/state/basin live in the metadata line.
 */
export const buildFieldBriefTitle = ({
  name,
  location,
}: {
  name: string;
  location?: string;
}): string => {
  const trimmed = location?.trim();
  if (!trimmed) return name;
  const site = trimmed.split(" — ")[0].split(", ")[0].trim();
  if (!site) return name;
  return `${name} — ${site}`;
};

/**
 * Builds the Field Brief header metadata line.
 * Format: `{County}, {State} ({Basin})? · {Date}? · Field Brief · Internal handover`
 * County+state are omitted silently when either is absent (R11 backward compat).
 * Basin parenthetical is omitted when basin is absent.
 */
export const buildFieldBriefMetadataLine = ({
  county,
  state,
  basin,
  date,
}: {
  county?: string;
  state?: string;
  basin?: string;
  date?: string;
}): string => {
  const parts: string[] = [];

  if (county && state) {
    const location = basin ? `${county}, ${state} (${basin})` : `${county}, ${state}`;
    parts.push(location);
  }

  if (date) parts.push(date);
  parts.push("Field Brief");
  parts.push("Internal handover");

  return parts.join(" · ");
};

/**
 * Determines how to render stop flags/narrative risk callouts (design §4 Option A).
 *
 * | narrativeRiskCallouts | stopFlags       | result      |
 * |-----------------------|-----------------|-------------|
 * | non-empty array       | any             | 'narrative' |
 * | absent / empty        | non-empty array | 'blocks'    |
 * | absent / empty        | absent / empty  | 'none'      |
 */
export const chooseStopFlagPresentation = ({
  narrativeRiskCallouts,
  stopFlags,
}: {
  narrativeRiskCallouts?: string[];
  stopFlags?: Array<{ title: string; summary: string }>;
}): "narrative" | "blocks" | "none" => {
  if (narrativeRiskCallouts && narrativeRiskCallouts.length > 0) return "narrative";
  if (stopFlags && stopFlags.length > 0) return "blocks";
  return "none";
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

// R3: Local cover block — H1 = "{Customer} — {Site}", small logo, metadata from helper
// Using LogoMark + StageBadge from shared-document; local styles to avoid Slice A territory.
const FieldBriefCover = ({
  title,
  metadataLine,
  stage,
}: {
  title: string;
  metadataLine: string;
  stage: string;
}) => (
  <View style={styles.cover}>
    <View style={styles.coverTop}>
      <LogoMark size="sm" />
      <StageBadge stage={stage} />
    </View>
    <Text style={styles.coverTitle}>{title}</Text>
    <Text style={styles.coverMetadata}>{renderCoverMetadataLine(metadataLine)}</Text>
  </View>
);

// Splits the metadata line so "Field Brief" renders bold inline (matches brand.py cover_block).
const renderCoverMetadataLine = (line: string) => {
  const token = "Field Brief";
  const idx = line.indexOf(token);
  if (idx === -1) return line;
  const before = line.slice(0, idx);
  const after = line.slice(idx + token.length);
  return (
    <>
      {before}
      <Text style={styles.coverMetadataBold}>{token}</Text>
      {after}
    </>
  );
};

// Win-win argument paragraph — bold lead followed by body, all inline (no bullet).
const WinWinParagraph = ({ lead, body }: { lead: string; body: string }) => (
  <Text style={styles.winWinParagraph}>
    <Text style={{ fontFamily: h2oBrand.font.bold }}>{lead}: </Text>
    {body}
  </Text>
);

// R6: Plain text column headers, thin row separators, bold last-row total + italic sensitivity
const CostTable = ({ rows }: { rows: CostRows }) => (
  <View style={styles.table}>
    <View style={[styles.tableRow, styles.tableHeaderPlain]}>
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

// Narrative risk callouts rendered as plain body paragraphs INSIDE 'What this is'.
// Boss-reference Field Briefs weave risk into the section body — no separate "Risk context" header.
const NarrativeCallouts = ({ callouts }: { callouts: string[] }) =>
  callouts.map((item, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: narrative items have no stable key
    <Text key={i} style={styles.narrativeCalloutItem}>
      {item}
    </Text>
  ));

// Continuation header: small logo + customer—site text + "Stage: X · Field Brief (continued)" as
// right-aligned plain text. Mirrors the boss reference page-2 strip (no badge pill).
const ContinuationHeader = ({
  customerName,
  site,
  stage,
}: {
  customerName: string;
  site?: string;
  stage: string;
}) => {
  const left = site ? `${customerName} — ${site}` : customerName;
  return (
    <View fixed style={styles.continuationHeader}>
      <LogoMark size="xs" />
      <Text style={styles.continuationMiddle}>{left}</Text>
      <Text
        style={styles.continuationStageText}
      >{`Stage: ${stage} · Field Brief (continued)`}</Text>
    </View>
  );
};

// Risk card per H2O brand spec: 22pt severity-coloured circle (FLAG_STOP red for rank 1,
// FLAG_SPECIALIST amber for rank 2-3) with white numeral; bold navy title; body paragraph
// combining mechanism + inline italic muted "Mitigation: ..." in a single text block.
const RiskCard = ({
  rank,
  risk,
}: {
  rank: number;
  risk: FieldBriefPayload["sections"]["whatCouldKillIt"]["risks"][number];
}) => (
  <View style={styles.cardRow} wrap={false}>
    <View style={[styles.rankCircle, { backgroundColor: riskRankColor(rank) }]}>
      <Text style={styles.rankLabel}>{rank}</Text>
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{risk.name}</Text>
      <Text style={styles.riskBody}>
        {risk.mechanism} <Text style={styles.mitigationInline}>Mitigation: {risk.mitigation}</Text>
      </Text>
    </View>
  </View>
);

// Action card per H2O brand spec: 22pt BRAND_BLUE rounded box with white numeral; bold navy
// title with inline brand-blue italic "· {timeframe}"; supporting body paragraph.
const ActionCard = ({
  action,
  index,
}: {
  action: FieldBriefPayload["sections"]["doThisNext"]["actions"][number];
  index: number;
}) => (
  <View style={styles.cardRow} wrap={false}>
    <View style={styles.rankBox}>
      <Text style={styles.rankLabel}>{index + 1}</Text>
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>
        {action.title} <Text style={styles.timeframe}>· {action.timeframe}</Text>
      </Text>
      <Text style={styles.body}>{action.body}</Text>
    </View>
  </View>
);

// Extracts the site/sub-asset portion of customer.location for the continuation header,
// using the same trimming rules as buildFieldBriefTitle.
const extractSite = (location?: string): string | undefined => {
  const trimmed = location?.trim();
  if (!trimmed) return undefined;
  const site = trimmed.split(" — ")[0].split(", ")[0].trim();
  return site || undefined;
};

export const FieldBriefDocument = ({ payload }: { payload: FieldBriefPayload }) => {
  const proposal = payload.sections.whatWeWouldPropose;
  const risks = payload.sections.whatCouldKillIt.risks;
  const actions = payload.sections.doThisNext.actions;

  const title = buildFieldBriefTitle({
    name: payload.customer.name,
    location: payload.customer.location,
  });
  const site = extractSite(payload.customer.location);

  const metadataLine = buildFieldBriefMetadataLine({
    county: payload.customer.county,
    state: payload.customer.state,
    basin: payload.customer.basin,
    date: payload.date,
  });

  const showNarrative = payload.narrativeRiskCallouts && payload.narrativeRiskCallouts.length > 0;
  const { pageOneRows, pageTwoRows } = splitCostRowsForTwoPageBrief(proposal.costOfAlternativeRows);

  return (
    <Document
      author="SecondstreamAI"
      subject="H2O Allegiant Field Brief"
      title={`${payload.customer.name} Field Brief`}
    >
      <Page size={h2oBrand.page.size} style={styles.page}>
        <FieldBriefCover title={title} metadataLine={metadataLine} stage={payload.stage} />

        <View style={styles.section}>
          <SectionHeader color={sectionMarkerColor("what-this-is")}>What this is</SectionHeader>
          <InsightBox>{payload.sections.whatThisIs.insight}</InsightBox>
          <Text style={styles.body}>{payload.sections.whatThisIs.body}</Text>
          {showNarrative && payload.narrativeRiskCallouts ? (
            <NarrativeCallouts callouts={payload.narrativeRiskCallouts} />
          ) : null}
        </View>

        <View style={styles.section}>
          <SectionHeader color={sectionMarkerColor("what-we-would-propose")}>
            What we'd propose
          </SectionHeader>
          <InsightBox>{proposal.insight}</InsightBox>
          <Text style={styles.body}>
            <Text style={styles.inlineLead}>Recommended approach: </Text>
            {proposal.recommendedApproach}
          </Text>
          <Text style={styles.subhead}>
            Why the customer should want this — the win-win argument:
          </Text>
          {proposal.winWinArguments.map((argument) => (
            <WinWinParagraph key={argument.lead} lead={argument.lead} body={argument.body} />
          ))}
          <Text style={styles.subhead}>Cost of the alternative — fully priced over 5 years:</Text>
          <CostTable rows={pageOneRows} />
          {proposal.dealSizeSensitivity && !pageTwoRows.length ? (
            <Text style={styles.sensitivityCaption}>
              Sensitivity: {proposal.dealSizeSensitivity}
            </Text>
          ) : null}
        </View>
        <Footer paddingX={FIELD_BRIEF_PAGE_PADDING_X} />
      </Page>

      <Page size={h2oBrand.page.size} style={[styles.page, styles.pageWithContinuation]}>
        <ContinuationHeader
          customerName={payload.customer.name}
          site={site}
          stage={payload.stage}
        />
        {pageTwoRows.length ? (
          <View style={styles.section}>
            <CostTable rows={pageTwoRows} />
            {proposal.dealSizeSensitivity ? (
              <Text style={styles.sensitivityCaption}>
                Sensitivity: {proposal.dealSizeSensitivity}
              </Text>
            ) : null}
          </View>
        ) : null}
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
        <Footer paddingX={FIELD_BRIEF_PAGE_PADDING_X} />
      </Page>
    </Document>
  );
};

export const renderFieldBriefPdf = async (payload: FieldBriefPayload): Promise<Buffer> =>
  renderToBuffer(<FieldBriefDocument payload={payload} />);
