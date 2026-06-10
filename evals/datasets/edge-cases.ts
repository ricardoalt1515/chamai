import type { Scenario } from "../runner/types";

const FULL_PACKAGE_SEQUENCE = [
  "field-brief",
  "playbook",
  "analytical-read",
  "proposal-shell",
] as const;

// Builds ~2 pages of eDMR-style monthly discharge monitoring numbers, each
// row: month, flow (MGD), BOD (mg/L), TSS (mg/L), ammonia (mg/L), pH range.
const buildLongEdmrEvidence = (): string => {
  const months = [
    "Jan-2024",
    "Feb-2024",
    "Mar-2024",
    "Apr-2024",
    "May-2024",
    "Jun-2024",
    "Jul-2024",
    "Aug-2024",
    "Sep-2024",
    "Oct-2024",
    "Nov-2024",
    "Dec-2024",
    "Jan-2025",
    "Feb-2025",
    "Mar-2025",
    "Apr-2025",
    "May-2025",
    "Jun-2025",
    "Jul-2025",
    "Aug-2025",
    "Sep-2025",
    "Oct-2025",
    "Nov-2025",
    "Dec-2025",
  ];

  const rows = months.map((month, index) => {
    const flow = (1.8 + (index % 5) * 0.07).toFixed(2);
    const bod = (210 + (index % 7) * 18).toFixed(0);
    const tss = (95 + (index % 6) * 12).toFixed(0);
    const ammonia = (3.1 + (index % 4) * 0.6).toFixed(1);
    const phLow = (6.4 + (index % 3) * 0.1).toFixed(1);
    const phHigh = (7.6 + (index % 3) * 0.1).toFixed(1);
    return `${month}: Flow ${flow} MGD, BOD ${bod} mg/L, TSS ${tss} mg/L, NH3-N ${ammonia} mg/L, pH ${phLow}-${phHigh}`;
  });

  return rows.join("\n");
};

// Edge-case scenarios: thin evidence, name-only customer identification,
// very long pasted evidence, and mixed asks must each be handled without
// crashing the artifact tools or producing schema-invalid payloads.
export const edgeCaseScenarios: Scenario[] = [
  {
    id: "edge-case-minimal-evidence-lead-full-package",
    title: "Minimal evidence at Lead stage with a full-package ask",
    motivation:
      "Guards against the agent failing schema validation (e.g. min-length array fields) when content is necessarily thin at Lead stage.",
    prompt:
      "Got a cold inbound from a contact at a regional food distribution center — they " +
      "mentioned in passing that their wastewater bills 'seem high' and asked if we do " +
      "anything in that space. No site visit yet, no data shared, don't even know their permit " +
      "limits or current treatment setup. Can you put together the full package anyway so I " +
      "have something to bring if they're willing to talk further?",
    expectations: {
      artifactSequence: [...FULL_PACKAGE_SEQUENCE],
      maxCostUsd: 1.15,
    },
  },
  {
    id: "edge-case-name-only-customer-no-company-details",
    title: "Customer mentioned by name only, no company details",
    motivation:
      "Guards against titleFor's slug-fallback path breaking when customer.name is a person's name with no company/site name available.",
    prompt:
      "I spoke with someone named Marcus Webb at a trade show — he runs operations for some " +
      "kind of poultry or meat processing operation, didn't catch the company name, but he " +
      "said they've had 'surcharge problems for years' and gave me his card. That's literally " +
      "all I have right now. Generate the full opportunity package using what little we know " +
      "so I can follow up with him this week.",
    expectations: {
      artifactSequence: [...FULL_PACKAGE_SEQUENCE],
      maxCostUsd: 1.15,
    },
  },
  {
    id: "edge-case-long-edmr-evidence-field-brief-only",
    title: "Very long pasted eDMR evidence with a single Field Brief ask",
    motivation:
      "Guards against the agent timing out, truncating, or calling extra artifact tools when the prompt itself is dominated by ~2 pages of pasted numeric eDMR data.",
    prompt:
      "Pulling together prep for a municipal account — here's the full eDMR history they sent " +
      "over for their plant (population ~28,000, conventional activated sludge, NPDES permit " +
      "limits: BOD 25 mg/L monthly avg / 40 mg/L weekly avg, TSS 30 mg/L monthly avg / 45 mg/L " +
      "weekly avg, NH3-N seasonal limit 2.0 mg/L summer / 4.0 mg/L winter, pH 6.0-9.0):\n\n" +
      `${buildLongEdmrEvidence()}\n\n` +
      "Their NH3-N readings have been creeping above the summer limit in the last six months " +
      "and their plant superintendent flagged aging blower equipment as a likely contributor. " +
      "Just generate the Field Brief from this — that's all I need for now.",
    expectations: {
      artifactSequence: ["field-brief"],
      maxCostUsd: 0.55,
    },
  },
  {
    id: "edge-case-mixed-stage-and-playbook-ask",
    title: "Mixed ask: deal stage classification AND the Playbook",
    motivation:
      "Guards against the agent either skipping the Playbook (treating the whole ask as a fast-path question) or generating the full package (over-producing beyond what was asked).",
    prompt:
      "For the industrial laundry account in North Carolina with the oil-and-grease violation " +
      "notices — we've now had two follow-up calls, the plant manager shared their current " +
      "pretreatment layout and confirmed the regional ops VP is engaged for anything over " +
      "$150K, and they've agreed to a site walk-through next month. What stage is this deal at, " +
      "and can you also give me the Playbook for the site walk-through conversation?",
    expectations: {
      artifactSequence: ["playbook"],
      maxCostUsd: 0.4,
    },
  },
];
