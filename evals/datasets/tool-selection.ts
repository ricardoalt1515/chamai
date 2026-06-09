import type { Scenario } from "../runner/types";

const FULL_PACKAGE_SEQUENCE = [
  "field-brief",
  "playbook",
  "analytical-read",
  "proposal-shell",
] as const;

// Tool-selection scenarios: explicit single-artifact requests, conversational
// questions, and non-PDF asks should each route to the correct tool set —
// not default to the full four-artifact package.
export const toolSelectionScenarios: Scenario[] = [
  {
    id: "tool-selection-analytical-read-only",
    title: "Explicit request for just the Analytical Read",
    motivation:
      "Guards against the agent over-producing the full package when the field agent explicitly asked for only the leadership write-up.",
    prompt:
      "We've got a metal-finishing shop in Ohio with chronic pH excursions and a documented " +
      "history of two consent agreements with the state EPA over the last five years. I've " +
      "already got the Field Brief and Playbook from last week's session. My regional manager " +
      "wants the evidence-tagged write-up to forward up the chain before our Friday review — " +
      "just generate the Analytical Read for this one, nothing else.",
    expectations: {
      artifactSequence: ["analytical-read"],
      maxCostUsd: 0.35,
    },
  },
  {
    id: "tool-selection-what-stage-question",
    title: "Conversational 'what stage is this deal?' question",
    motivation:
      "Guards against the agent calling artifact tools in response to a focused conversational question that should use the fast path.",
    prompt:
      "Quick check on the Pecos East produced-water account — we had a site visit two weeks " +
      "ago, the operator shared their NORM disposal logs and confirmed their current SWD well " +
      "is approaching its permitted injection volume, and their ops manager said they'd be open " +
      "to a follow-up call but hasn't committed to anything yet. What stage is this deal at " +
      "right now?",
    expectations: {
      forbidArtifactTools: true,
      maxCostUsd: 0.15,
    },
  },
  {
    id: "tool-selection-explicit-full-package",
    title: "Explicit request for the full opportunity package",
    motivation:
      "Guards against the agent stopping after a subset of artifacts when the field agent explicitly names the full package by request.",
    prompt:
      "I'm prepping for a follow-up meeting tomorrow with a chemical manufacturing plant in " +
      "Louisiana. They've got a wastewater stream with elevated COD and intermittent pH swings " +
      "from batch process changeovers, and their environmental compliance manager has shared " +
      "six months of effluent sampling data showing they're trending toward a permit " +
      "exceedance on COD. We had a productive call last week where they agreed to a paid " +
      "scoping engagement. Please generate the full opportunity package — Field Brief, " +
      "Playbook, Analytical Read, and Proposal Shell — so I have everything for tomorrow.",
    expectations: {
      artifactSequence: [...FULL_PACKAGE_SEQUENCE],
      maxCostUsd: 0.75,
    },
  },
  {
    id: "tool-selection-follow-up-email-draft",
    title: "Request for a follow-up email draft to the plant manager",
    motivation:
      "Guards against the agent generating PDF artifacts for a lightweight non-PDF output (follow-up email) that should not invoke any generate* tool.",
    prompt:
      "I just wrapped a call with the plant manager at a dairy processing facility in " +
      "Wisconsin about their whey permeate discharge issues and the upcoming surcharge true-up. " +
      "They asked me to send over a short recap of what we discussed and confirm next steps. " +
      "Can you draft a follow-up email to the plant manager summarizing the call and proposing " +
      "a site visit date?",
    expectations: {
      forbidArtifactTools: true,
      maxCostUsd: 0.15,
    },
  },
];
