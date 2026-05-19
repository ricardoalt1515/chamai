import { Document, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { PlaybookPayload } from "../payloads";
import { artifactLabels, h2oBrand, themePalette } from "./brand-tokens";
import {
  CoverBlock,
  Footer,
  InsightBox,
  LogoMark,
  StageBadge,
} from "./shared-document";

// ─── Pure helpers (testable, no React) ───────────────────────────────────────

export const playbookThemeAccentColor = (index: number): string =>
  themePalette[index % themePalette.length];

/** Returns the same accent color used for the theme header bottom border. */
export const playbookThemeHeaderAccentBorderColor = (index: number): string =>
  playbookThemeAccentColor(index);

/**
 * Returns true when a question string is a sub-prompt (starts with em-dash
 * or en-dash), allowing typographic differentiation without payload changes.
 */
export const playbookIsSubPrompt = (question: string): boolean =>
  question.startsWith("—") || question.startsWith("–");

export const playbookContinuationLabel = (customerName: string): string =>
  `${customerName} · Playbook (continued)`;

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
  pageWithContinuation: {
    paddingTop: 48,
  },
  continuationHeader: {
    alignItems: "center",
    borderBottomColor: h2oBrand.colors.line,
    borderBottomWidth: 1,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    left: h2oBrand.page.paddingX,
    paddingBottom: 4,
    position: "absolute",
    right: h2oBrand.page.paddingX,
    top: 16,
  },
  continuationMiddle: {
    color: h2oBrand.colors.navy,
    flex: 1,
    fontFamily: h2oBrand.font.bold,
    fontSize: 7.5,
    marginHorizontal: 10,
    textAlign: "center",
  },
  orientationCallout: {
    backgroundColor: h2oBrand.colors.panel,
    borderColor: h2oBrand.colors.line,
    borderRadius: 4,
    borderWidth: 0.8,
    color: h2oBrand.colors.muted,
    fontSize: 8.2,
    fontStyle: "italic",
    lineHeight: 1.3,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  themeBlock: {
    marginBottom: 8,
  },
  themeHeader: {
    borderBottomWidth: 1.2,
    display: "flex",
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
    paddingBottom: 3,
  },
  themeNumber: {
    fontFamily: h2oBrand.font.bold,
    fontSize: 14,
    lineHeight: 1.1,
    width: 20,
  },
  themeTitleColumn: {
    flex: 1,
  },
  themeTitle: {
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 9.5,
    lineHeight: 1.2,
  },
  themeFraming: {
    color: h2oBrand.colors.muted,
    fontSize: 7.6,
    fontStyle: "italic",
    lineHeight: 1.15,
    marginTop: 1,
  },
  substreamChip: {
    alignSelf: "flex-start",
    backgroundColor: h2oBrand.colors.panelBlue,
    borderRadius: 999,
    color: h2oBrand.colors.navy,
    fontFamily: h2oBrand.font.bold,
    fontSize: 6.8,
    marginBottom: 3,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    textTransform: "uppercase",
  },
  question: {
    display: "flex",
    flexDirection: "row",
    gap: 5,
    marginBottom: 2,
  },
  questionDot: {
    width: 8,
  },
  questionText: {
    flex: 1,
    fontSize: 8.2,
    lineHeight: 1.22,
  },
  // Sub-prompt: typographically muted, indented
  subPrompt: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
    marginBottom: 1.5,
    paddingLeft: 12,
  },
  subPromptDot: {
    color: h2oBrand.colors.muted,
    fontSize: 7,
    width: 7,
  },
  subPromptText: {
    color: h2oBrand.colors.muted,
    flex: 1,
    fontSize: 7.6,
    fontStyle: "italic",
    lineHeight: 1.18,
  },
});

// ─── Components ───────────────────────────────────────────────────────────────

const PlaybookContinuationHeader = ({
  customerName,
  stage,
}: {
  customerName: string;
  stage: string;
}) => (
  <View fixed style={styles.continuationHeader}>
    <LogoMark />
    <Text style={styles.continuationMiddle}>{playbookContinuationLabel(customerName)}</Text>
    <StageBadge stage={stage} />
  </View>
);

const ThemeBlock = ({
  index,
  theme,
}: {
  index: number;
  theme: PlaybookPayload["themes"][number];
}) => {
  const accent = playbookThemeAccentColor(index);
  return (
    <View style={styles.themeBlock} wrap={false}>
      <View style={[styles.themeHeader, { borderBottomColor: accent }]}>
        <Text style={[styles.themeNumber, { color: accent }]}>{index + 1}</Text>
        <View style={styles.themeTitleColumn}>
          <Text style={styles.themeTitle}>{theme.title}</Text>
          {theme.framing ? <Text style={styles.themeFraming}>{theme.framing}</Text> : null}
        </View>
      </View>
      {theme.substreamTag ? (
        <Text style={styles.substreamChip}>Sub-stream: {theme.substreamTag}</Text>
      ) : null}
      {theme.questions.map((question) => {
        if (playbookIsSubPrompt(question)) {
          return (
            <View key={question} style={styles.subPrompt}>
              <Text style={styles.subPromptDot}>›</Text>
              <Text style={styles.subPromptText}>{question.replace(/^[–—]\s*/, "")}</Text>
            </View>
          );
        }
        return (
          <View key={question} style={styles.question}>
            <Text style={[styles.questionDot, { color: accent }]}>•</Text>
            <Text style={styles.questionText}>{question}</Text>
          </View>
        );
      })}
    </View>
  );
};

export const PlaybookDocument = ({ payload }: { payload: PlaybookPayload }) => (
  <Document
    author="SecondstreamAI"
    subject="H2O Allegiant Conversation Playbook"
    title={`${payload.customer.name} Playbook`}
  >
    <Page size={h2oBrand.page.size} style={styles.page}>
      <CoverBlock
        artifactLabel={artifactLabels.playbook}
        customerName={payload.title ?? `${payload.customer.name} Conversation Playbook`}
        location={payload.customer.location}
        stage={payload.stage ?? "Reference"}
      />
      {payload.orientation ? (
        <InsightBox>{payload.orientation}</InsightBox>
      ) : null}
      {payload.themes.map((theme, index) => (
        <ThemeBlock key={theme.title} index={index} theme={theme} />
      ))}
      <Footer label="H2O Allegiant Conversation Playbook" />
    </Page>
    <Page size={h2oBrand.page.size} style={[styles.page, styles.pageWithContinuation]}>
      <PlaybookContinuationHeader
        customerName={payload.customer.name}
        stage={payload.stage ?? "Reference"}
      />
      <Footer label="H2O Allegiant Conversation Playbook" />
    </Page>
  </Document>
);

export const renderPlaybookPdf = async (payload: PlaybookPayload): Promise<Buffer> =>
  renderToBuffer(<PlaybookDocument payload={payload} />);
