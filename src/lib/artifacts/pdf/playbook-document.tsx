import { Document, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { PlaybookPayload } from "../payloads";
import { h2oBrand, themeAccentByIndex } from "./brand-tokens";
import { Footer, TopHeader, tier2ContinuationTopReserve } from "./shared-document";

// ─── Pure helpers (testable, no React) ───────────────────────────────────────

/**
 * Builds the customerSite string for MinimalHeader from Playbook customer fields.
 * Returns "{name} — {location}" when location is present, "{name}" otherwise.
 */
export const buildPlaybookCustomerSite = ({
  name,
  location,
}: {
  name: string;
  location?: string;
}): string => (location ? `${name} — ${location}` : name);

/**
 * Returns the theme accent color at position `i`.
 * @deprecated Delegates to `themeAccentByIndex` from brand-tokens — use that directly for new code.
 */
export const playbookThemeAccentColor = (index: number): string => themeAccentByIndex(index);

/**
 * Returns the same accent color used for the theme header bottom border.
 * @deprecated Use `themeAccentByIndex` directly.
 */
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

export type ResolvedPlaybookHeaderFields = {
  subStreamsLine?: string;
  stageIntro?: string;
  insight?: string;
  orientationLine?: string;
  introLine?: string;
};

export const resolvePlaybookHeaderFields = (
  header?: PlaybookPayload["header"],
): ResolvedPlaybookHeaderFields => ({
  subStreamsLine: header?.subStreams?.length ? header.subStreams.join(", ") : undefined,
  stageIntro: header?.stageIntro,
  insight: header?.insight,
  orientationLine: header?.orientationLine,
  introLine: header?.introLine,
});

export const resolvePlaybookThemeAccent = (
  theme: Pick<PlaybookPayload["themes"][number], "accentIndex">,
  position: number,
): string => themeAccentByIndex(theme.accentIndex ?? position);

/**
 * Returns true when the WhyItMattersCallout should be rendered.
 * Guards against undefined and empty arrays for graceful degradation.
 */
export const shouldRenderWhyItMatters = (items?: string[]): boolean =>
  Array.isArray(items) && items.length > 0;

export const playbookPagePaddingTop = tier2ContinuationTopReserve;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    color: "#0F172A",
    fontFamily: "Helvetica",
    fontSize: 8.4,
    lineHeight: 1.18,
    paddingBottom: 34,
    paddingHorizontal: 44,
    paddingTop: playbookPagePaddingTop,
  },
  // Sub-streams summary line — italic, muted, below MinimalHeader
  // Per discovery #4773: use "Helvetica-Oblique" for italic text (not fontStyle on a bold family)
  subStreamsLine: {
    color: "#64748B",
    fontFamily: "Helvetica-Oblique",
    fontSize: 8,
    lineHeight: 1.2,
    marginBottom: 4,
  },
  // Lead-stage intro paragraph — italic, muted
  // Per discovery #4773: "Helvetica-Oblique" for italic body text
  stageIntro: {
    color: "#64748B",
    fontFamily: "Helvetica-Oblique",
    fontSize: 8.2,
    lineHeight: 1.25,
    marginBottom: 5,
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
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    lineHeight: 1.0,
    width: 30,
  },
  themeTitleColumn: {
    flex: 1,
  },
  themeTitle: {
    color: "#03045E",
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    lineHeight: 1.2,
  },
  // Why-line in accent color — italic, directly under title
  // Per discovery #4773: "Helvetica-Oblique" explicitly; NOT fontFamily "Helvetica-Bold" + fontStyle
  themeWhyLine: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 8,
    lineHeight: 1.18,
    marginTop: 1,
  },
  substreamLabel: {
    color: "#03045E",
    fontFamily: "Helvetica-Bold",
    fontSize: 6.8,
    marginBottom: 3,
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
  // Orientation callout — grey-bordered italic block
  orientationCallout: {
    borderColor: h2oBrand.colors.line,
    borderWidth: 1,
    fontFamily: "Helvetica-Oblique",
    fontSize: 8.2,
    lineHeight: 1.3,
    marginBottom: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: h2oBrand.colors.ink,
  },
  // Intro italic paragraph
  introLine: {
    color: h2oBrand.colors.muted,
    fontFamily: "Helvetica-Oblique",
    fontSize: 8.2,
    lineHeight: 1.25,
    marginBottom: 6,
  },
  // Sub-prompt: typographically muted, indented one level
  subPrompt: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
    marginBottom: 1.5,
    paddingLeft: 12,
  },
  subPromptDot: {
    color: "#64748B",
    fontSize: 7,
    width: 7,
  },
  // Per discovery #4773: "Helvetica-Oblique" for italic sub-prompt text
  subPromptText: {
    color: "#64748B",
    flex: 1,
    fontFamily: "Helvetica-Oblique",
    fontSize: 7.6,
    lineHeight: 1.18,
  },
});

// ─── Components ───────────────────────────────────────────────────────────────

const ThemeBlock = ({
  index,
  theme,
}: {
  index: number;
  theme: PlaybookPayload["themes"][number];
}) => {
  // Use explicit accentIndex when provided; fall back to position-based index
  const accent = resolvePlaybookThemeAccent(theme, index);

  return (
    <View style={styles.themeBlock} wrap={false}>
      <View style={[styles.themeHeader, { borderBottomColor: accent }]}>
        <Text style={[styles.themeNumber, { color: accent }]}>{index + 1}</Text>
        <View style={styles.themeTitleColumn}>
          <Text style={styles.themeTitle}>{theme.title}</Text>
          {/* Framing renders as italic why-line in muted color (boss ref: not accent) */}
          {theme.framing ? (
            <Text style={[styles.themeWhyLine, { color: h2oBrand.colors.muted }]}>
              {theme.framing}
            </Text>
          ) : null}
        </View>
      </View>
      {theme.substreamTag ? (
        <Text style={styles.substreamLabel}>Sub-stream: {theme.substreamTag}</Text>
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

export const PlaybookDocument = ({ payload }: { payload: PlaybookPayload }) => {
  const resolvedHeader = resolvePlaybookHeaderFields(payload.header);

  // Build metadata line: "Customer — Site · County, State · Date" pattern
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

  const docTitle = payload.title ?? "Call Playbook";
  const docSubtitle = payload.subtitle ?? "Question structure for the first operator conversation";

  return (
    <Document
      author="SecondstreamAI"
      subject="H2O Allegiant Conversation Playbook"
      title={`${customer.name} Playbook`}
    >
      <Page size="LETTER" style={styles.page}>
        <TopHeader
          metadataLine={metadataLine}
          title={docTitle}
          subtitle={docSubtitle}
          subStreamsLine={
            resolvedHeader.subStreamsLine
              ? `Sub-streams: ${resolvedHeader.subStreamsLine}`
              : undefined
          }
        />
        {resolvedHeader.orientationLine ? (
          <Text style={styles.orientationCallout}>{resolvedHeader.orientationLine}</Text>
        ) : null}
        {resolvedHeader.introLine ? (
          <Text style={styles.introLine}>{resolvedHeader.introLine}</Text>
        ) : null}
        {payload.themes.map((theme, index) => (
          <ThemeBlock key={theme.title} index={index} theme={theme} />
        ))}
        <Footer paddingX={h2oBrand.page.paddingX} />
      </Page>
    </Document>
  );
};

export const renderPlaybookPdf = async (payload: PlaybookPayload): Promise<Buffer> =>
  renderToBuffer(<PlaybookDocument payload={payload} />);
