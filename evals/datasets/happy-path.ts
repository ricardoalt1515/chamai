import type { Scenario } from "../runner/types";

const FULL_PACKAGE_SEQUENCE = [
  "field-brief",
  "playbook",
  "analytical-read",
  "proposal-shell",
] as const;

// Happy-path scenarios: a clean opportunity-advancing turn at various
// industries and stages should always produce the full four-artifact
// package in the canonical order without exceeding budget.
export const happyPathScenarios: Scenario[] = [
  {
    id: "happy-path-food-processing-bod-tss-surcharge",
    title: "Food-processing plant exceeding BOD/TSS surcharge limits",
    motivation:
      "Guards against the agent skipping or reordering artifacts when a high-urgency surcharge story dominates the prompt.",
    prompt:
      "We just got off a call with the EHS manager at a poultry processing plant in Arkansas. " +
      "Their last three months of surcharge bills from the municipal utility have spiked — " +
      "BOD averaging 1,450 mg/L against a 300 mg/L permit limit, and TSS averaging 620 mg/L " +
      "against a 250 mg/L limit. They're paying roughly $38,000/month in surcharges on top of " +
      "base sewer rates. The plant runs two shifts, 5 days/week, with a DAF unit that's " +
      "undersized for current throughput after a 2023 line expansion. The EHS manager owns the " +
      "budget for anything under $500K and reports to the plant GM. They want to understand " +
      "options before their next capital planning cycle in Q3. Put together the full package so " +
      "I can walk in prepared next week.",
    expectations: {
      artifactSequence: [...FULL_PACKAGE_SEQUENCE],
      maxCostUsd: 0.75,
    },
  },
  {
    id: "happy-path-municipality-npdes-renewal",
    title: "Municipality with NPDES permit renewal approaching",
    motivation:
      "Guards against the agent treating a municipal NPDES renewal as a pure compliance question and skipping the proposal-track artifacts.",
    prompt:
      "A small municipal WWTP (population ~12,000) in eastern Tennessee has an NPDES permit " +
      "renewal due in 14 months. The current permit has ammonia and phosphorus limits that the " +
      "draft renewal tightens significantly — ammonia drops from 4.0 mg/L to 1.5 mg/L monthly " +
      "average, and a new phosphorus limit of 1.0 mg/L is being proposed where none existed " +
      "before. Their existing trickling filter plant has no nitrification capacity and no " +
      "chemical phosphorus removal. The city's public works director has flagged this to the " +
      "city council as an upcoming capital item, but no engineering study has been commissioned " +
      "yet. They mentioned CWSRF as a likely funding pathway. Build me the full opportunity " +
      "package for this one — I'm meeting the public works director Thursday.",
    expectations: {
      artifactSequence: [...FULL_PACKAGE_SEQUENCE],
      maxCostUsd: 0.75,
    },
  },
  {
    id: "happy-path-industrial-laundry-fog",
    title: "Industrial laundry with FOG and oil-and-grease issues",
    motivation:
      "Guards against the agent under-weighting FOG/oil-and-grease evidence and producing a thin Field Brief cost-of-alternative table.",
    prompt:
      "An industrial uniform laundry facility in North Carolina has been hit with two violation " +
      "notices in the past six months for oil-and-grease exceedances at their discharge point — " +
      "readings of 180 mg/L and 210 mg/L against a 100 mg/L local limit. The POTW has threatened " +
      "to put them on a compliance schedule with monthly self-monitoring if a third exceedance " +
      "occurs. Their current pretreatment is a single gravity grease trap sized for the original " +
      "1990s facility footprint, but they've added two more washer-extractor lines since then " +
      "without upgrading pretreatment. The plant manager is the main contact and has informal " +
      "authority to spend up to about $150K without corporate sign-off, but anything larger " +
      "needs regional ops VP approval. Give me the full package — Field Brief, Playbook, " +
      "Analytical Read, and Proposal Shell.",
    expectations: {
      artifactSequence: [...FULL_PACKAGE_SEQUENCE],
      maxCostUsd: 0.75,
    },
  },
  {
    id: "happy-path-brewery-mbr-retrofit-scoping",
    title: "Brewery scoping an MBR retrofit",
    motivation:
      "Guards against the agent producing a Lead-stage thin Proposal Shell when the evidence actually supports a Scope-stage scoping conversation.",
    prompt:
      "A regional craft brewery in Colorado is doubling production capacity over the next 18 " +
      "months and their existing aerobic SBR pretreatment system is already running near " +
      "capacity on BOD loading from spent grain liquor and CIP wastewater. The brewery's " +
      "sustainability director has already engaged us in a site visit and shared two years of " +
      "discharge monitoring data plus their proposed expansion timeline. They're actively " +
      "comparing an SBR expansion against an MBR retrofit that would also enable some process " +
      "water reuse for cooling tower makeup. They've asked us to come back with a scoping-level " +
      "comparison they can bring to their ops committee next month, including rough CAPEX " +
      "ranges for both paths. Please put together the full opportunity package reflecting where " +
      "this deal actually stands.",
    expectations: {
      artifactSequence: [...FULL_PACKAGE_SEQUENCE],
      maxCostUsd: 0.75,
    },
  },
];
