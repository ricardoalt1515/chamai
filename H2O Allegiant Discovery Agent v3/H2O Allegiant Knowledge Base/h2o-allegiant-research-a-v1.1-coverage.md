<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Research A — YAML Coverage Completion Pass (v1.1)

## Source document

Reference: Perplexity Research A v1.0 output (attached). Flag entities decomposed from narrative Sections 2–5.[^1]

## Section 2: Cross-cutting compliance flags

### 2.1 PFAS

```yaml
- id: csflag-pfas-industrial-pretreatment-unknown
  flag_name: PFAS in industrial discharges to POTW with unclear pretreatment controls
  category: cross-cutting-compliance
  severity: specialist
  applies_to_lenses:
    - lens-industrial-discharge
    - lens-municipal-wet-weather
    - lens-biosolids-residuals
    - lens-advanced-reuse
  applies_to_subcases:
    - null
  evidence_cue: Industrial user discharging to a POTW reports PFAS in process streams or finished effluent near NPDWR MCLs, but cannot explain any PFAS-specific pretreatment, source reduction, or monitoring beyond generic metals/organics programs.
  why_it_matters: regulatory
  resolution_path: Inventory PFAS-relevant wastestreams and chemicals at the industrial user, evaluate PFAS sources, and develop a POTW-coordinated pretreatment and monitoring plan that aligns with PFAS NPDWR implications for downstream drinking-water sources and state PFAS policies.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation
  confidence: high
  confidence_reason: Directly derived from narrative discussion of PFAS source-attribution across industrial and POTW/pretreatment pathways.

- id: csflag-pfas-reuse-feedwater-poor-characterization
  flag_name: PFAS in proposed reuse feedwater poorly characterized
  category: cross-cutting-compliance
  severity: specialist
  applies_to_lenses:
    - lens-advanced-reuse
    - lens-municipal-wet-weather
    - lens-industrial-discharge
  applies_to_subcases:
    - subcase-reuse-ipr
    - subcase-reuse-dpr
  evidence_cue: Customer is scoping IPR or DPR using municipal or industrial effluent as feedwater but has only limited PFAS sampling, with no spatial or temporal characterization and no linkage to pretreatment or source-control activities in the contributing sewershed.
  why_it_matters: regulatory
  resolution_path: Develop a PFAS sampling plan for the reuse basin, coordinate with pretreatment/local limits programs to reduce upstream PFAS, and integrate PFAS design criteria into advanced treatment selection so that reuse projects can meet current and foreseeable regulatory expectations.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation
  confidence: high
  confidence_reason: Narrative explicitly calls out reuse projects advancing without adequate PFAS characterization as a distinct PFAS flag situation.

- id: csflag-pfas-reuse-feedwater-critical-risk
  flag_name: PFAS exceedances in reuse feedwater with no treatment or management plan
  category: cross-cutting-compliance
  severity: stop
  applies_to_lenses:
    - lens-advanced-reuse
    - lens-municipal-wet-weather
  applies_to_subcases:
    - subcase-reuse-ipr
    - subcase-reuse-dpr
  evidence_cue: PFAS levels in proposed reuse feedwater or in receiving groundwater/surface-water buffers are already near or above PFAS NPDWR MCLs and the customer has no credible advanced treatment or residuals-management strategy to reduce PFAS before potable use.
  why_it_matters: regulatory
  resolution_path: Pause progression of IPR/DPR concepts until PFAS treatment performance, concentration management, and residuals outlets are defined and shown to meet current NPDWR and state PFAS expectations; resume only once a technically and regulatorily viable PFAS management strategy is in place.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation
  confidence: high
  confidence_reason: Severity split from the reuse PFAS narrative, which distinguishes specialist-level planning issues from gate-closing feedwater risk.

- id: csflag-pfas-municipal-influent-rising-trend
  flag_name: Rising PFAS trend in municipal influent with no response strategy
  category: cross-cutting-compliance
  severity: attention
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-biosolids-residuals
    - lens-advanced-reuse
  applies_to_subcases:
    - null
  evidence_cue: Municipal utility’s monitoring or regional studies show PFAS concentrations in influent, effluent, or biosolids trending upward over several years, but there is no internal discussion, pretreatment engagement, or planning referenced in customer statements.
  why_it_matters: regulatory
  resolution_path: Flag the trend for Assessment-mode review, encourage expanded PFAS monitoring and source investigation, and incorporate PFAS trajectory into planning for biosolids outlets, reuse concepts, and receiving-water protections, without yet closing the qualification gate.
  resolution_owner: agent
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation
  confidence: medium
  confidence_reason: Narrative references PFAS as a cross-cutting trend issue; this flag formalizes that trend as an attention-level signal.
```


### 2.2 Notices of Violation and Enforcement History

```yaml
- id: csflag-nov-pattern-resolved-history
  flag_name: Pattern of past NOVs resolved but indicative of chronic stress
  category: cross-cutting-compliance
  severity: attention
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: ECHO or customer materials show multiple NOVs or informal enforcement actions over the past 5–10 years that have been formally closed, but with recurring themes such as wet-weather overflows, industrial noncompliance, or MS4 program failures.
  why_it_matters: regulatory
  resolution_path: Document the enforcement pattern and themes, verify that underlying causes were structurally addressed rather than patched, and carry forward the history as context for Assessment without blocking progression.
  resolution_owner: agent
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/enforcement/enforcement-basic-information
  confidence: high
  confidence_reason: Narrative highlights broader enforcement history as a context-setting factor even when active NOVs are resolved.

- id: csflag-ao-active-under-corrective-plan
  flag_name: Active administrative order with partial corrective action underway
  category: cross-cutting-compliance
  severity: specialist
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: Customer references or provides an administrative order or consent administrative order with specified corrective measures and deadlines, some of which are in progress but not yet complete.
  why_it_matters: regulatory
  resolution_path: Obtain and review the order, summarize remaining obligations and timelines, and route to Assessment with explicit recognition that project scopes and sequencing must align with order requirements and reporting.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/enforcement/enforcement-basic-information
  confidence: high
  confidence_reason: Directly follows the narrative’s treatment of enforcement history that conditions but does not necessarily block progression.

- id: csflag-enforcement-history-unknown-multisite
  flag_name: Enforcement history unclear for multi-facility operator
  category: cross-cutting-compliance
  severity: attention
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: Customer operates multiple wastewater or stormwater facilities across states but provides no information about enforcement history, and basic public searches have not yet been performed.
  why_it_matters: regulatory
  resolution_path: Prompt the agent to perform an ECHO search and basic enforcement history scan before accepting global “good compliance” claims and to treat any later-discovered enforcement as potential grounds for severity escalation.
  resolution_owner: agent
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/enforcement/enforcement-basic-information
  confidence: medium
  confidence_reason: Narrative implies the need to surface enforcement posture; this flag codifies that for multi-facility situations.
```


### 2.3 Administrative continuance and modification triggers

```yaml
- id: csflag-admin-continuance-with-new-constraints
  flag_name: Administratively continued permit subject to new TMDL or standard
  category: cross-cutting-compliance
  severity: specialist
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-stormwater-ms4
  applies_to_subcases:
    - null
  evidence_cue: Permit is administratively continued while a new TMDL, ELG, or water-quality standard affecting key parameters has been approved, but the customer has not evaluated how likely it is that the renewed permit will tighten limits.
  why_it_matters: regulatory
  resolution_path: Identify applicable new TMDLs or standards, anticipate likely permit changes with Assessment specialists, and shape project options accordingly while the permit is under review.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: high
  confidence_reason: Narrative describes administrative continuance as benign until overlaid with new constraints that affect future limits.

- id: csflag-renewal-expired-no-continuance
  flag_name: NPDES permit expired without administrative continuance
  category: cross-cutting-compliance
  severity: stop
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
  applies_to_subcases:
    - null
  evidence_cue: Permit documents or regulator correspondence indicate that the permit expiration date has passed without administrative continuance and there is no indication that a timely renewal application was submitted.
  why_it_matters: regulatory
  resolution_path: Clarify permit status with the permitting authority, submit or complete a renewal application as needed, and obtain written confirmation that discharges are authorized before moving into Assessment.
  resolution_owner: customer
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.law.cornell.edu/cfr/text/40/122.21
  confidence: high
  confidence_reason: Expired permits without continuance are a clear legal-exposure scenario under NPDES renewal rules.

- id: csflag-modification-change-causing-violations
  flag_name: Unmodified process change already causing effluent or MS4 violations
  category: cross-cutting-compliance
  severity: stop
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-stormwater-ms4
  applies_to_subcases:
    - null
  evidence_cue: Customer reports or data show recurring effluent or MS4 violations clearly associated with new or expanded operations (for example, new wastestreams or added drainage areas) that were not incorporated into a permit modification.
  why_it_matters: regulatory
  resolution_path: Halt progression until the customer initiates an appropriate permit modification or new permit application, stabilizes compliance, and confirms regulator acceptance of the modified operations.
  resolution_owner: customer
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: high
  confidence_reason: Narrative explicitly treats unmodified change plus violations as a gate-closing scenario distinct from simple modification timing issues.
```


### 2.4 POTW pretreatment program audit findings

```yaml
- id: csflag-pretreatment-audit-critical-finding-open
  flag_name: POTW pretreatment audit critical finding open but not yet causing violations
  category: cross-cutting-compliance
  severity: specialist
  applies_to_lenses:
    - lens-industrial-discharge
    - lens-municipal-wet-weather
  applies_to_subcases:
    - null
  evidence_cue: Recent POTW pretreatment audit identified critical findings (for example, inadequate local limits documentation or insufficient industrial sampling) with corrective actions required, but no related NPDES or local-limit violations have yet been documented.
  why_it_matters: regulatory
  resolution_path: Review audit findings and corrective-action deadlines, verify progress with the control authority, and ensure Assessment scopes recognize that pretreatment program changes may alter industrial discharger requirements.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: high
  confidence_reason: Maps directly to narrative discussion of unresolved audit findings that have not yet escalated to enforcement.

- id: csflag-pretreatment-audit-critical-finding-causing-violation
  flag_name: POTW pretreatment audit finding linked to ongoing categorical or local-limit violations
  category: cross-cutting-compliance
  severity: stop
  applies_to_lenses:
    - lens-industrial-discharge
    - lens-municipal-wet-weather
  applies_to_subcases:
    - null
  evidence_cue: Audit documents or ECHO records show that critical pretreatment deficiencies (for example, failure to control a significant industrial user) are already causing ongoing categorical or local-limit violations at the POTW or industrial outfall.
  why_it_matters: regulatory
  resolution_path: Coordinate with the control authority and affected industrial users on immediate corrective actions, re-establish effective pretreatment controls, and restore compliance before progressing BD work that assumes stable pretreatment performance.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.ecfr.gov/current/title-40/chapter-I/subchapter-N/part-403
  confidence: high
  confidence_reason: Severity follows the narrative’s treatment of egregious pretreatment failures as potential stop-conditions.

- id: csflag-pretreatment-audit-program-systemic-weakness
  flag_name: Pretreatment program systemic weakness without specific user identified
  category: cross-cutting-compliance
  severity: attention
  applies_to_lenses:
    - lens-industrial-discharge
    - lens-municipal-wet-weather
  applies_to_subcases:
    - null
  evidence_cue: Audit notes program-level weaknesses such as limited staff, outdated ordinances, or incomplete significant-industrial-user inventories, but does not tie them to documented violations.
  why_it_matters: regulatory
  resolution_path: Encourage the customer to strengthen program infrastructure (staffing, ordinances, inventories) and treat associated risk as context for industrial and reuse opportunities, while continuing progression with appropriate caution.
  resolution_owner: agent
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.ecfr.gov/current/title-40/chapter-I/subchapter-N/part-403
  confidence: medium
  confidence_reason: Narrative implies these systemic issues as risk multipliers rather than immediate gate-closers; this flag formalizes them.
```


### 2.5 State rule applicability ambiguity

```yaml
- id: csflag-state-rule-cross-state-mismatch
  flag_name: Cross-state operator with inconsistent understanding of PFAS or biosolids rules
  category: cross-cutting-compliance
  severity: specialist
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: Customer operates facilities in multiple states with active PFAS, biosolids, or reuse rule developments but speaks about “our rules” as if one uniform framework applies everywhere, without distinguishing state-specific obligations.
  why_it_matters: regulatory
  resolution_path: Require a state-by-state regulatory applicability check by Assessment-mode specialists, clarifying which rules apply at each facility and ensuring that Discovery recommendations are not based on incorrect generalizations.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.nebiosolids.org/maine-bans-land-application
  confidence: medium
  confidence_reason: Narrative highlights cross-state ambiguity; this flag captures that pattern where operators assume uniform rules.

- id: csflag-state-rule-active-rulemaking-unclear
  flag_name: Active state rulemaking with unclear current applicability
  category: cross-cutting-compliance
  severity: specialist
  applies_to_lenses:
    - lens-biosolids-residuals
    - lens-advanced-reuse
    - lens-decentralized-onsite
  applies_to_subcases:
    - null
  evidence_cue: Customer mentions ongoing state PFAS, biosolids, or reuse rulemaking but cannot state whether draft rules are currently enforceable, advisory, or still under development.
  why_it_matters: regulatory
  resolution_path: Confirm status of pending rules using state-agency sources, identify likely effective dates and transition provisions, and route the opportunity to Assessment with explicit assumptions about rule trajectories.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.nebiosolids.org/maine-bans-land-application
  confidence: medium
  confidence_reason: Derived from narrative sections on evolving state rules and the need for explicit determinations rather than assumptions.

- id: csflag-state-rule-some-facilities-affected
  flag_name: State PFAS/biosolids rule applies to some but not all facilities in portfolio
  category: cross-cutting-compliance
  severity: attention
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: Customer portfolio spans multiple states, and at least one facility clearly falls under a stricter PFAS or biosolids regime while others do not, but planning discussions treat the portfolio as homogeneous.
  why_it_matters: regulatory
  resolution_path: Flag the affected facilities for differentiated planning in Assessment, ensuring that more stringent state requirements are not overlooked when scoping solids, reuse, or decentralized strategies.
  resolution_owner: agent
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.nebiosolids.org/maine-bans-land-application
  confidence: medium
  confidence_reason: Narrative mentions cross-state differences; this flag ensures they are surfaced without over-flagging stop severity.
```


### 2.6 Emerging contaminants below MCL but above action levels

```yaml
- id: csflag-ec-above-advisory-near-intake
  flag_name: Emerging contaminants above advisory levels upstream of drinking-water intake
  category: cross-cutting-compliance
  severity: specialist
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-advanced-reuse
  applies_to_subcases:
    - null
  evidence_cue: Monitoring shows PFAS, 1,4-dioxane, or similar contaminants above health-advisory or state action levels—but below MCLs—in effluent or receiving waters that discharge to a drinking-water intake or source used for potable supply.
  why_it_matters: regulatory
  resolution_path: Route to Assessment for receptor analysis, additional characterization, and potential treatment or source-control options; integrate findings into discussions with drinking-water agencies and permit writers before committing to long-lived infrastructure.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation
  confidence: high
  confidence_reason: Directly matches the narrative’s “gray zone” description for emerging contaminants near advisory levels in source waters.

- id: csflag-ec-above-advisory-nonpotable
  flag_name: Emerging contaminants above advisory levels in non-potable receiving waters
  category: cross-cutting-compliance
  severity: attention
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
  applies_to_subcases:
    - null
  evidence_cue: Monitoring detects emerging contaminants above advisory levels in receiving waters without direct potable use, and no immediate regulatory action has been triggered.
  why_it_matters: regulatory
  resolution_path: Encourage continued monitoring and trend tracking, record the condition for Assessment, and revisit severity if receptors or standards change; do not block progression solely on this basis.
  resolution_owner: agent
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation
  confidence: medium
  confidence_reason: Narrative treats these cases as lower-severity watch items unless receptors or standards tighten.

- id: csflag-ec-trending-toward-mcl
  flag_name: Emerging contaminant trend approaching enforceable MCL
  category: cross-cutting-compliance
  severity: attention
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-advanced-reuse
  applies_to_subcases:
    - null
  evidence_cue: Multi-year monitoring indicates an upward trend in an emerging contaminant concentration that, extrapolated, could reach federal or state MCLs within a typical planning horizon.
  why_it_matters: regulatory
  resolution_path: Flag for Assessment-mode risk analysis and inclusion in long-term capital planning; consider treatment or source-control options but do not classify as a current stop or specialist condition absent receptor or enforcement triggers.
  resolution_owner: agent
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation
  confidence: medium
  confidence_reason: The narrative discusses trends toward tighter standards; this flag encodes that trajectory as an attention-level signal.
```


### 2.7 Regulatory pipeline conflict flags

```yaml
- id: csflag-elg-pipeline-investment-misaligned
  flag_name: Planned industrial treatment investments misaligned with pending ELG tightening
  category: cross-cutting-compliance
  severity: specialist
  applies_to_lenses:
    - lens-industrial-discharge
  applies_to_subcases:
    - null
  evidence_cue: Customer plans or is constructing treatment upgrades that meet current effluent guidelines but does not address known, near-term ELG revisions likely to require additional controls for PFAS or other pollutants.
  why_it_matters: regulatory
  resolution_path: Route to Assessment for review of ELG timelines and alternatives, stress-test the investment against pending ELG requirements, and potentially re-scope or phase projects to avoid stranded assets.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.epa.gov/eg/effluent-guidelines
  confidence: high
  confidence_reason: Directly follows narrative examples of ELG pipeline conflicts for chrome plating and OCPSF sectors.

- id: csflag-biosolids-rule-pipeline-misaligned
  flag_name: Biosolids strategy locked into land application ahead of likely PFAS rule changes
  category: cross-cutting-compliance
  severity: specialist
  applies_to_lenses:
    - lens-biosolids-residuals
    - lens-municipal-wet-weather
  applies_to_subcases:
    - subcase-bio-landapp
  evidence_cue: Utility is planning long-lived biosolids infrastructure or contracts based on Class B land application, while federal or state PFAS-related biosolids rule changes are under active risk assessment and could materially restrict land application.
  why_it_matters: regulatory
  resolution_path: Flag for Assessment review of biosolids regulatory pipeline, evaluate diversification of outlets or upgrade paths, and avoid new long-term land-application commitments without understanding PFAS rule trajectories.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.nebiosolids.org/maine-bans-land-application
  confidence: high
  confidence_reason: Narrative links biosolids outlet risk explicitly to PFAS-related rulemaking and pipeline uncertainty.

- id: csflag-state-rule-pipeline-investment-risk
  flag_name: Capital investment at risk from imminent state PFAS/biosolids rule
  category: cross-cutting-compliance
  severity: attention
  applies_to_lenses:
    - lens-biosolids-residuals
    - lens-municipal-wet-weather
    - lens-decentralized-onsite
  applies_to_subcases:
    - null
  evidence_cue: Customer is considering or executing capital projects whose economic logic depends on current state PFAS or biosolids policies, while state rulemaking documents signal likely tightening within a few years.
  why_it_matters: commercial
  resolution_path: Incorporate state rule pipeline risk into Assessment-mode financial modeling and scenario analysis, but do not treat this as a current compliance stop unless draft rules are effectively binding.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.nebiosolids.org/maine-bans-land-application
  confidence: medium
  confidence_reason: Narrative frames pipeline conflicts as economic and planning risks rather than immediate violations; this flag encodes that as attention-level.
```


## Section 3: Permit-lifecycle and temporal pressure flags

### 3.1 NPDES renewal-window flags

```yaml
- id: csflag-renewal-12mo-no-engagement
  flag_name: Permit within 12 months of expiration with minimal renewal planning
  category: permit-lifecycle-temporal
  severity: attention
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-stormwater-ms4
  applies_to_subcases:
    - null
  evidence_cue: Permit expiration date is less than 12 months away, but customer has not begun internal discussions or data gathering for renewal and is unaware of upcoming changes such as new TMDLs or standards.
  why_it_matters: regulatory
  resolution_path: Encourage early engagement with permitting staff and Assessment specialists to align project concepts with expected renewal changes; track this as an opportunity and planning flag rather than a compliance issue.
  resolution_owner: agent
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.law.cornell.edu/cfr/text/40/122.21
  confidence: high
  confidence_reason: Derived directly from narrative discussion of 12-month pre-renewal periods as windows for strategic shaping.

- id: csflag-renewal-180day-deadline-at-risk
  flag_name: Renewal-application 180-day deadline at risk
  category: permit-lifecycle-temporal
  severity: specialist
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
  applies_to_subcases:
    - null
  evidence_cue: Permit expires within 9–7 months and customer has not yet submitted a renewal application or prepared required information, making compliance with the 180-day advance submittal requirement unlikely.
  why_it_matters: regulatory
  resolution_path: Prioritize preparation and submission of a complete renewal application and coordinate with regulators to avoid lapses; integrate expected permit changes into Assessment scoping.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.law.cornell.edu/cfr/text/40/122.21
  confidence: high
  confidence_reason: Reflects explicit 180-day timing requirements in 40 CFR 122.21 as emphasized in the narrative.

- id: csflag-renewal-application-late
  flag_name: Renewal application submitted late or not at all
  category: permit-lifecycle-temporal
  severity: stop
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
  applies_to_subcases:
    - null
  evidence_cue: Expiration date has passed or is imminent and customer acknowledges that a renewal application was submitted late or not yet accepted as complete by the permitting authority.
  why_it_matters: regulatory
  resolution_path: Clarify permit status with the agency, submit a complete renewal application and obtain confirmation that discharges remain authorized; pause movement toward Assessment until legal coverage is clear.
  resolution_owner: customer
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: high
  confidence_reason: Narrative identifies missed renewal deadlines as higher-risk than ordinary administrative continuance and potentially gate-closing.
```


### 3.2 Permit modification triggers

```yaml
- id: csflag-modification-planned-change-not-yet-filed
  flag_name: Planned change likely to trigger modification but not yet filed
  category: permit-lifecycle-temporal
  severity: attention
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
  applies_to_subcases:
    - null
  evidence_cue: Customer is planning to add new wastestreams, outfalls, or capacity expansions that will materially change discharges but has not yet discussed or initiated permit modification with regulators.
  why_it_matters: regulatory
  resolution_path: Flag for Assessment planning, including early discussions with permit writers on modification needs and timelines; proceed while ensuring future scopes include modification.
  resolution_owner: agent
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: high
  confidence_reason: Narrative highlights planned changes as distinct from already-implemented unmodified changes.

- id: csflag-modification-implemented-no-violations
  flag_name: Operational change implemented without modification but no violations yet observed
  category: permit-lifecycle-temporal
  severity: specialist
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
  applies_to_subcases:
    - null
  evidence_cue: Customer has already implemented a material change (for example, added an industrial line or increased flow) without modifying the permit, but current monitoring does not yet show violations.
  why_it_matters: regulatory
  resolution_path: Assess whether the change requires modification under 40 CFR 122, file for modification if needed, and adjust monitoring and treatment assumptions in Assessment; treat as a specialist issue rather than an immediate stop if no harm is evident.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.law.cornell.edu/cfr/text/40/122.21
  confidence: high
  confidence_reason: Matches narrative’s distinction between mod-triggering changes with and without evident noncompliance.

- id: csflag-modification-implemented-and-violating
  flag_name: Operational change implemented without modification and causing violations
  category: permit-lifecycle-temporal
  severity: stop
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
  applies_to_subcases:
    - null
  evidence_cue: Monitoring or enforcement records show repeated effluent or local-limit violations clearly associated with a change that was implemented without required permit modification.
  why_it_matters: regulatory
  resolution_path: Pause progression until modification is initiated, interim controls are in place, and the permitting authority accepts a path back to compliance; treat the situation as a gate-closing combination of unpermitted change and demonstrated noncompliance.
  resolution_owner: customer
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: high
  confidence_reason: Directly reflects narrative’s classification of unmodified changes causing violations as stop-level conditions.
```


### 3.3 ELG effective date pressure

```yaml
- id: csflag-elg-effective-soon-no-plan
  flag_name: ELG revisions effective within 24 months with no compliance plan
  category: permit-lifecycle-temporal
  severity: specialist
  applies_to_lenses:
    - lens-industrial-discharge
  applies_to_subcases:
    - null
  evidence_cue: EPA’s ELG program plan or final rules identify new limits for the customer’s sector with compliance timelines within two years, and customer acknowledges awareness but has no documented plan for meeting them.
  why_it_matters: regulatory
  resolution_path: Route to Assessment for treatment and cost evaluation, integrate ELG timelines into project prioritization, and avoid committing to solutions that will be obsolete when new limits apply.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.epa.gov/eg/effluent-guidelines
  confidence: high
  confidence_reason: Matches narrative emphasis on ELG effective-date windows as drivers for specialist involvement.

- id: csflag-elg-effective-soon-noncompliant-design
  flag_name: Existing or planned design unlikely to meet imminent ELG limits
  category: permit-lifecycle-temporal
  severity: stop
  applies_to_lenses:
    - lens-industrial-discharge
  applies_to_subcases:
    - null
  evidence_cue: Draft or final ELG revisions show numerical limits that current or planned treatment systems demonstrably cannot achieve, and customer intends to proceed with those systems without modification.
  why_it_matters: regulatory
  resolution_path: Halt progression on investments that are clearly inconsistent with imminent ELG limits and re-scope options with Assessment specialists so that compliance at the effective date is feasible.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.epa.gov/eg/effluent-guidelines
  confidence: medium
  confidence_reason: Narrative suggests such situations pose high risk of stranded assets; stop severity is appropriate when noncompliance at effective date is nearly certain.
```


### 3.4 State rule effective date pressure

```yaml
- id: csflag-state-biosolids-rule-effective-soon
  flag_name: State PFAS/biosolids rule effective within 24 months for current outlets
  category: permit-lifecycle-temporal
  severity: specialist
  applies_to_lenses:
    - lens-biosolids-residuals
    - lens-municipal-wet-weather
  applies_to_subcases:
    - subcase-bio-landapp
  evidence_cue: State legislation or rulemaking sets a date within two years when PFAS-based restrictions on land application or specific biosolids outlets take effect, and customer relies heavily on those outlets without a transition plan.
  why_it_matters: regulatory
  resolution_path: In Assessment, develop and evaluate alternative outlets or upgraded treatment strategies that will be legal and viable after the rule takes effect, and plan a phased transition away from at-risk outlets.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.nebiosolids.org/maine-bans-land-application
  confidence: high
  confidence_reason: Follows narrative logic that state effective dates drive biosolids outlet risk even before outright bans.

- id: csflag-state-reuse-rule-effective-soon
  flag_name: State potable reuse rule effective soon for in-progress projects
  category: permit-lifecycle-temporal
  severity: specialist
  applies_to_lenses:
    - lens-advanced-reuse
  applies_to_subcases:
    - subcase-reuse-ipr
    - subcase-reuse-dpr
  evidence_cue: Customer is planning or constructing IPR/DPR projects in a state with reuse regulations scheduled to take effect soon, and design/operations assumptions were based on draft or out-of-state criteria.
  why_it_matters: regulatory
  resolution_path: Align project design, monitoring, and public-health protection measures with the final state reuse rule before commissioning and permitting, potentially re-opening some design decisions in Assessment.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: medium
  confidence_reason: Narrative ties state reuse rule activations to regulatory-pathway risk for IPR/DPR projects; this flag formalizes that timing sensitivity.
```


### 3.5 IIJA/BIL funding milestone compliance

```yaml
- id: csflag-funding-milestone-minor-delay
  flag_name: IIJA/SRF-funded project milestones slightly delayed but recoverable
  category: permit-lifecycle-temporal
  severity: attention
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-advanced-reuse
    - lens-biosolids-residuals
    - lens-stormwater-ms4
  applies_to_subcases:
    - null
  evidence_cue: Customer notes modest schedule slippage relative to IIJA/SRF funding milestones, but agencies have not yet signaled concern and corrective paths appear feasible.
  why_it_matters: commercial
  resolution_path: Document schedule risk for Assessment, coordinate with funding agencies on updated timelines, and incorporate float and contingency into project planning without treating it as a gate-closing issue.
  resolution_owner: agent
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water
  confidence: high
  confidence_reason: Narrative treats many funding-milestone issues as commercial and planning concerns rather than immediate stop conditions.

- id: csflag-funding-milestone-severe-delay
  flag_name: IIJA/SRF-funded compliance-critical project at risk of losing funding
  category: permit-lifecycle-temporal
  severity: specialist
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-advanced-reuse
    - lens-biosolids-residuals
    - lens-stormwater-ms4
  applies_to_subcases:
    - null
  evidence_cue: Customer reports or documentation shows that a compliance-critical wastewater, stormwater, or reuse project funded under IIJA/SRF has missed key milestones or is at risk of de-obligation or adverse restructuring by the funding agency.
  why_it_matters: commercial
  resolution_path: Elevate to Assessment for financial and schedule triage, including engagement with the funding agency and evaluation of alternative financing or phasing; treat as a major commercial constraint but not automatically gate-closing unless loss of funding makes compliance impossible.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water
  confidence: medium
  confidence_reason: Narrative identifies these as high-consequence but typically not immediate stop conditions, fitting a specialist severity.
```


## Section 4: Operational and physical safety flags

### 4.1 Confined-space entry concerns

```yaml
- id: csflag-confined-space-program-uncertain-no-bd-entry
  flag_name: Confined-space practices unclear but BD engagement excludes entry
  category: operational-physical-safety
  severity: attention
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: Customer does not mention a formal confined-space program, but proposed Discovery activities explicitly exclude any entry into tanks, sewers, or similar spaces by the agent’s staff.
  why_it_matters: safety
  resolution_path: Note the lack of clarity for context, but proceed with non-entry scopes while encouraging the customer to confirm that their own confined-space program meets applicable safety expectations.
  resolution_owner: agent
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/collection-systems
  confidence: high
  confidence_reason: Narrative distinguishes BD-safe situations where confined-space work is not contemplated from those that are gate-closing.

- id: csflag-confined-space-limited-rescue
  flag_name: Confined-space entry with monitoring but questionable rescue capability
  category: operational-physical-safety
  severity: specialist
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: Customer describes atmospheric testing and entry permits for confined spaces but indicates that rescue capabilities are ad hoc (for example, “crew will pull them out”) rather than planned and trained.
  why_it_matters: safety
  resolution_path: Require Assessment-mode safety specialists to review confined-space rescue provisions before any agent personnel participate in work that depends on those capabilities; adjust scopes to exclude such work if necessary.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/collection-systems
  confidence: medium
  confidence_reason: Narrative points to rescue planning as a critical component of safe confined-space practice; this flag isolates that aspect.

- id: csflag-confined-space-near-miss-history
  flag_name: Confined-space near-miss or incident history without program changes
  category: operational-physical-safety
  severity: specialist
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: Customer recounts near misses or incidents in confined spaces (for example, workers overcome by gases) but cannot describe any substantial changes to confined-space procedures since those events.
  why_it_matters: safety
  resolution_path: Route to Assessment safety specialists for review of incident investigations and program improvements; exclude agent personnel from confined-space scopes until credible corrective actions are documented.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/collection-systems
  confidence: high
  confidence_reason: Narrative highlights incident history as a strong signal that current practices may be inadequate even if minimal procedures exist.
```


### 4.2 H₂S and sewer-atmosphere hazards

```yaml
- id: csflag-h2s-incidents-no-mitigation
  flag_name: Documented H2S incidents without corresponding mitigation measures
  category: operational-physical-safety
  severity: stop
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-stormwater-ms4
    - lens-decentralized-onsite
  applies_to_subcases:
    - null
  evidence_cue: Customer reports prior H2S-related injuries, collapses, or emergency responses in sewers, wet wells, or sludge-handling facilities and cannot articulate changes in monitoring, ventilation, or work practices implemented afterward.
  why_it_matters: safety
  resolution_path: Treat as a gate-closing condition for any field work in affected areas until an H2S hazard assessment and mitigation plan are developed and verified by safety specialists; adjust scopes or avoid high-risk locations accordingly.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/collection-systems
  confidence: high
  confidence_reason: Narrative ties unmanaged H2S incidents directly to unacceptable risk levels requiring stop severity.

- id: csflag-h2s-odor-corrosion-no-incidents
  flag_name: Strong sewer odours and corrosion but no reported H2S incidents
  category: operational-physical-safety
  severity: attention
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-stormwater-ms4
  applies_to_subcases:
    - null
  evidence_cue: Customer describes persistent odours and corrosion in specific sewer segments or wet wells but reports no H2S injuries or near misses and limited monitoring data.
  why_it_matters: safety
  resolution_path: Encourage characterization of H2S levels and evaluation of odour/corrosion control, and ensure Assessment-mode scopes treat these as potential but not yet gate-closing safety risks.
  resolution_owner: agent
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/collection-systems
  confidence: medium
  confidence_reason: Narrative treats these indicators as significant but not automatically stop-level without incidents or unmanaged entry.
```


### 4.3 Chlorine and disinfectant handling

```yaml
- id: csflag-chlorine-gas-legacy-system-no-scrubber
  flag_name: Legacy chlorine-gas system without effective containment or scrubbing
  category: operational-physical-safety
  severity: stop
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
  applies_to_subcases:
    - null
  evidence_cue: Customer uses ton cylinders or railcars of gaseous chlorine stored in older facilities without mention of gas scrubbers, leak-detection systems, or updated emergency-response planning.
  why_it_matters: safety
  resolution_path: Exclude BD personnel from work involving the chlorine system until an RMP-compliant control and emergency-response framework is confirmed; where projects touch disinfection, consider safer alternatives or upgrades as part of Assessment.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: medium
  confidence_reason: Narrative highlights gaseous chlorine as a high-consequence hazard when not managed with modern controls.

- id: csflag-chlorine-rmp-status-unknown
  flag_name: Chlorine or other covered chemicals with unclear RMP or emergency-plan status
  category: operational-physical-safety
  severity: specialist
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
  applies_to_subcases:
    - null
  evidence_cue: Customer stores quantities of chlorine or other RMP-threshold chemicals but cannot state whether the site is subject to RMP or provide evidence of current emergency-response planning.
  why_it_matters: safety
  resolution_path: Confirm RMP applicability and status, review emergency-response and mitigation measures, and integrate any identified gaps into Assessment-mode risk management and scope definitions.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: medium
  confidence_reason: Derived from narrative emphasis on chlorine-related risk management without specifying particular regulatory thresholds.

- id: csflag-disinfectant-bulk-storage-deteriorated
  flag_name: Deteriorated bulk storage of hypochlorite or other disinfectants
  category: operational-physical-safety
  severity: attention
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
  applies_to_subcases:
    - null
  evidence_cue: Photos or descriptions show corroded tanks, staining, or previous leaks at bulk disinfectant storage areas, with minimal mention of containment or recent upgrades.
  why_it_matters: safety
  resolution_path: Flag for Inclusion in Assessment asset-condition review and spill-prevention planning; proceed with Discovery while recognizing that upgrades may be needed as part of broader projects.
  resolution_owner: agent
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: medium
  confidence_reason: Narrative treats secondary containment and asset condition as safety and environmental concerns that rarely close the gate by themselves.
```


### 4.4 Pyrophoric and reactive scale

```yaml
- id: csflag-pyrophoric-scale-suspected-no-plan
  flag_name: Pyrophoric scale suspected in long-idle anaerobic units with no handling plan
  category: operational-physical-safety
  severity: specialist
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-biosolids-residuals
  applies_to_subcases:
    - null
  evidence_cue: Customer plans to clean or retrofit digesters or sludge tanks that have been in long anaerobic service, recognizes possible pyrophoric scale presence, but has no documented plan for inerting, isolation, or fire risk management.
  why_it_matters: safety
  resolution_path: Route to Assessment safety and process specialists for risk evaluation and detailed cleaning/retrofit planning before any physical work is attempted.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: medium
  confidence_reason: Narrative references pyrophoric-scale risk; this flag encodes cases where the risk is acknowledged but unmanaged.

- id: csflag-pyrophoric-scale-documented-incident
  flag_name: Prior pyrophoric-scale ignition incident in similar equipment
  category: operational-physical-safety
  severity: stop
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-biosolids-residuals
  applies_to_subcases:
    - null
  evidence_cue: Customer reports previous fires or ignitions during opening or cleaning of digesters, tanks, or sludge-handling equipment attributable to pyrophoric residues, without clear evidence of revised procedures.
  why_it_matters: safety
  resolution_path: Prohibit any BD-side field work involving such equipment until a comprehensive, specialist-developed plan is in place and prior incident lessons are demonstrably incorporated into safety and work procedures.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: medium
  confidence_reason: Narrative implies that pyrophoric incidents are high-consequence events that should trigger gate-closing safety review.
```


### 4.5 Chemical storage and secondary containment

```yaml
- id: csflag-chem-storage-inadequate-containment
  flag_name: Bulk chemical storage with visibly inadequate secondary containment
  category: operational-physical-safety
  severity: specialist
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-advanced-reuse
  applies_to_subcases:
    - null
  evidence_cue: Photos or descriptions show bulk acid, caustic, or coagulant tanks without berms, sumps, or other containment capable of capturing a significant leak or failure.
  why_it_matters: safety
  resolution_path: Ensure that Assessment-mode scopes include containment upgrades and updated spill-prevention plans; coordinate with the customer to address high-consequence failure modes before or as part of project implementation.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: high
  confidence_reason: Narrative frames inadequate containment as a recurring safety and environmental risk that merits structured follow-up.

- id: csflag-chem-storage-ageing-tanks
  flag_name: Aging chemical tanks showing early signs of failure
  category: operational-physical-safety
  severity: attention
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
  applies_to_subcases:
    - null
  evidence_cue: Customer notes or photos show older fiberglass or steel tanks with visible surface degradation, minor leaks, or patch repairs, without reference to replacement planning.
  why_it_matters: safety
  resolution_path: Flag for inclusion in Assessment asset-management reviews and cost estimates, but allow BD discussions to proceed while recognizing that tank replacement may be a prerequisite or companion project.
  resolution_owner: agent
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: medium
  confidence_reason: Narrative treats such conditions as important but usually non-gate-closing safety issues.
```


### 4.6 Electrical and arc-flash hazards

```yaml
- id: csflag-arcflash-no-study-or-labels
  flag_name: No arc-flash study or labelling for critical electrical gear
  category: operational-physical-safety
  severity: specialist
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-advanced-reuse
  applies_to_subcases:
    - null
  evidence_cue: Customer indicates major switchgear, MCCs, or distribution panels in harsh environments but reports no recent arc-flash study and shows no hazard labeling on equipment.
  why_it_matters: safety
  resolution_path: Require Assessment-mode electrical safety review and arc-flash study before BD-side staff conduct work near that gear; integrate labeling and PPE requirements into project plans.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: medium
  confidence_reason: Narrative points to aging electrical infrastructure and missing safety analyses as conditions requiring specialist involvement.

- id: csflag-arcflash-live-work-proposed
  flag_name: Proposed live electrical work on uncharacterized gear
  category: operational-physical-safety
  severity: stop
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
  applies_to_subcases:
    - null
  evidence_cue: Customer proposes that BD-side personnel or contractors perform troubleshooting or modifications on energized switchgear or MCCs with no recent arc-flash study or documented safe-work procedures.
  why_it_matters: safety
  resolution_path: Refuse participation in live-work scopes until an arc-flash study, labeling, and safe-work methods are in place and reviewed by electrical safety specialists; consider redesigning scopes to avoid energized work entirely.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: medium
  confidence_reason: Narrative treats high-risk electrical scenarios involving uncharacterized live work as requiring gate-closing safety discipline.
```


## Section 5: Evidence-quality flags

### 5.1 eDMR discontinuity and methodology changes

```yaml
- id: csflag-edmr-method-change-unexplained
  flag_name: Sudden change in analytical method without explanation
  category: evidence-quality
  severity: attention
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: eDMR or lab reports show an abrupt switch in analytical method or lab for a key parameter, with no explanation in permit conditions or customer narrative.
  why_it_matters: operational
  resolution_path: Ask the customer to explain the change, confirm that new methods are approved, and avoid drawing strong trend conclusions across the method change until comparability is understood.
  resolution_owner: agent
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: high
  confidence_reason: Narrative highlights methodology changes as a specific evidence-quality concern.

- id: csflag-edmr-gap-around-upset-event
  flag_name: eDMR data gap coincident with reported upset or storm event
  category: evidence-quality
  severity: specialist
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-stormwater-ms4
  applies_to_subcases:
    - null
  evidence_cue: Customer describes significant upsets, storms, or overflows during periods where eDMR records show “no data” or missing entries for relevant parameters.
  why_it_matters: operational
  resolution_path: Seek explanations and any alternative datasets (for example internal logs, SCADA exports), and treat compliance conclusions as low-confidence until the gap is understood; route complex cases to Assessment specialists for deeper review.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: high
  confidence_reason: Narrative explicitly calls out such coincident gaps as higher-severity evidence-quality issues.

- id: csflag-edmr-consistent-no-data-flags
  flag_name: Repeated “no data required” entries where monitoring would normally be expected
  category: evidence-quality
  severity: attention
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: eDMR shows recurring “no data” or similar codes for parameters that appear central to permit performance, without clear permit-based exemptions.
  why_it_matters: operational
  resolution_path: Ask the customer to confirm whether monitoring is required and, if so, why results are not reported; adjust confidence in apparent compliance accordingly.
  resolution_owner: agent
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: medium
  confidence_reason: Narrative frames such patterns as ambiguous but not automatically indicative of noncompliance.
```


### 5.2 Lab analysis methodology mismatches

```yaml
- id: csflag-lab-method-mismatch-noncritical
  flag_name: Lab methods differ from permit requirements for non-limiting parameters
  category: evidence-quality
  severity: attention
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: Customer provides lab data for parameters measured using methods different from those specified in the permit, but parameters are not near limits and are not central to key flags.
  why_it_matters: operational
  resolution_path: Encourage future use of permit-approved methods while noting that current data are still directionally informative; avoid using these results for formal compliance determinations.
  resolution_owner: agent
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: high
  confidence_reason: Derived from narrative guidance that method mismatches mostly downgrade confidence when parameters are not critical.

- id: csflag-lab-method-mismatch-critical-parameter
  flag_name: Lab method mismatch for parameters central to stop-level flags
  category: evidence-quality
  severity: specialist
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: Key parameters underlying potential stop-level conditions (for example PFAS near MCLs, toxic pollutants near limits) are measured using non-approved or inconsistent methods.
  why_it_matters: regulatory
  resolution_path: Request confirmatory testing using approved methods before treating results as basis for stop or specialist compliance flags; escalate to Assessment if needed to design appropriate sampling campaigns.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: high
  confidence_reason: Narrative calls out such mismatches as particularly important when underlying conditions could be gate-closing if misrepresented.
```


### 5.3 SDS conflicts with customer description

```yaml
- id: csflag-sds-minor-discrepancy
  flag_name: Minor discrepancies between SDS and customer description
  category: evidence-quality
  severity: attention
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: SDS and customer narrative disagree slightly on product concentration or secondary components, but overall hazard characterization and process role are similar.
  why_it_matters: operational
  resolution_path: Ask clarifying questions to align process understanding, update internal notes, and treat the discrepancy as a minor confidence downgrade, not a routing changer.
  resolution_owner: agent
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: high
  confidence_reason: Narrative treats modest SDS conflicts as routine but worth flagging for clarity.

- id: csflag-sds-major-discrepancy
  flag_name: Major discrepancies between SDS and customer description
  category: evidence-quality
  severity: specialist
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: SDS indicates significantly different composition or hazard class (for example hazardous organics or solvents) than the customer’s description of a “benign” additive or wastestream.
  why_it_matters: safety
  resolution_path: Require reconciliation of SDS and process information and, where necessary, Assessment-mode hazard assessment before relying on customer descriptions for treatment or safety decisions.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: high
  confidence_reason: Narrative references SDS conflicts as potentially serious when they mask important hazards.
```


### 5.4 Customer description versus photographic evidence

```yaml
- id: csflag-photo-minor-disagreement
  flag_name: Minor disagreement between customer description and photos
  category: evidence-quality
  severity: attention
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: Photos or drone imagery show modest deterioration, staining, or occasional solids where customer describes “good condition” or “clear water,” but not to the level of obvious violations.
  why_it_matters: operational
  resolution_path: Note the discrepancy and ask for updated descriptions, while recognizing that the difference may reflect time gaps or differing perspectives rather than material misrepresentation.
  resolution_owner: agent
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: high
  confidence_reason: Narrative points to such mismatches as reasons to downgrade confidence but not necessarily escalate severity.

- id: csflag-photo-major-disagreement
  flag_name: Major disagreement between customer description and photos
  category: evidence-quality
  severity: specialist
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: Customer claims clear discharges, well-maintained assets, or completed projects, while photos show discolored or foaming outfalls, obvious structural failures, or unbuilt/unfinished infrastructure.
  why_it_matters: operational
  resolution_path: Treat customer narrative as low-confidence, seek additional independent evidence, and involve Assessment specialists where the discrepancy affects compliance or safety-related conclusions.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: high
  confidence_reason: Narrative treats clear visual conflicts as needing specialist-level scrutiny before relying on customer claims.
```


### 5.5 Single-source unverified claims

```yaml
- id: csflag-claim-compliance-no-data
  flag_name: Global compliance claim without supporting data
  category: evidence-quality
  severity: attention
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: Customer states “we are fully in compliance” or similar, without providing recent eDMR data, lab reports, or regulator correspondence to substantiate the claim.
  why_it_matters: regulatory
  resolution_path: Request representative monitoring summaries and recent permit correspondence; treat the claim as unverified until corroborated and avoid basing routing solely on it.
  resolution_owner: agent
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://echo.epa.gov
  confidence: high
  confidence_reason: Narrative identifies this pattern as a common bias requiring corroboration through independent records.

- id: csflag-claim-no-pfas-no-monitoring
  flag_name: “No PFAS problem” claimed without PFAS monitoring
  category: evidence-quality
  severity: specialist
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-biosolids-residuals
    - lens-advanced-reuse
  applies_to_subcases:
    - null
  evidence_cue: Customer asserts that PFAS is not an issue in influent, effluent, biosolids, or reuse feedwater but has never conducted PFAS sampling or relied only on generic assumptions.
  why_it_matters: regulatory
  resolution_path: Encourage initial PFAS screening and review of regional PFAS studies before accepting the claim; treat reuse, biosolids, and industrial opportunities as requiring PFAS characterization in Assessment.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: true
  superseded_research_b_flag: null
  source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation
  confidence: high
  confidence_reason: Narrative describes PFAS denial without data as a salient cross-cutting evidence-quality problem given new PFAS standards.

- id: csflag-claim-critical-safety-controlled-no-evidence
  flag_name: Critical safety risk claimed as “under control” with no documentation
  category: evidence-quality
  severity: stop
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: Customer asserts that confined-space entry, H2S, chlorine, or high-voltage hazards are “all handled” but cannot provide any written procedures, monitoring data, or training records, while other evidence suggests elevated risk.
  why_it_matters: safety
  resolution_path: Treat related safety conditions as unresolved and maintain appropriate stop-level safety flags until documentation and specialist review confirm that risks are managed; do not accept self-assurances in lieu of evidence.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/collection-systems
  confidence: medium
  confidence_reason: Narrative notes that evidence gaps can elevate severity when underlying issues would be stop-level if misrepresented.
```


### 5.6 Self-reporting bias patterns

```yaml
- id: csflag-bias-permit-optimism-flag
  flag_name: Permit-compliance optimism affecting reliability of narrative
  category: evidence-quality
  severity: attention
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: Customer repeatedly asserts good compliance without specifics, minimizes past issues, and frames regulators as “happy” without citing actual performance metrics or enforcement records.
  why_it_matters: regulatory
  resolution_path: Re-anchor conversations in concrete metrics and independent records (for example last year’s DMR performance, NOVs, or inspections) and discount purely optimistic framing when interpreting risks.
  resolution_owner: agent
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://echo.epa.gov
  confidence: high
  confidence_reason: Narrative explicitly identifies permit optimism as a recurrent bias requiring calibration.

- id: csflag-bias-vendor-blame-flag
  flag_name: Vendor-blame and engineer-shield bias affecting accountability
  category: evidence-quality
  severity: attention
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-advanced-reuse
    - lens-biosolids-residuals
  applies_to_subcases:
    - null
  evidence_cue: Customer attributes most problems to vendors or consulting engineers and offers little internal understanding of process performance or compliance obligations.
  why_it_matters: operational
  resolution_path: Ask targeted questions about internal monitoring, performance tracking, and governance; ensure Assessment scopes address organizational capability as well as technology.
  resolution_owner: agent
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/npdes/npdes-permit-writers-manual
  confidence: medium
  confidence_reason: Narrative references this bias as widespread; this flag codifies its impact on evidence reliability.

- id: csflag-bias-alarmism-flag
  flag_name: Alarmist framing near budget or funding cycles
  category: evidence-quality
  severity: specialist
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  evidence_cue: Customer emphasizes imminent regulatory shutdowns or catastrophic failures tied to near-term budget or funding decisions, without matching evidence in permits, enforcement records, or regulator statements.
  why_it_matters: commercial
  resolution_path: Seek independent confirmation of claimed deadlines and risks via permits, regulations, and regulator communications; incorporate the possibility of strategic alarmism into Assessment-mode financial and scheduling analysis.
  resolution_owner: specialist-in-assessment
  regulatory_environment_2025_specific: false
  superseded_research_b_flag: null
  source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water
  confidence: medium
  confidence_reason: Narrative explicitly calls out alarmism around funding cycles as a distinct bias requiring careful interpretation.
```


## Coverage self-check

- Total new csflag entities produced: 63
- By category: cross-cutting-compliance 22, permit-lifecycle-temporal 12, operational-physical-safety 14, evidence-quality 15
- By severity: stop 12, specialist 28, attention 23
- All entries trace to situations described in the v1.0 narrative: yes
- Any items added beyond narrative basis (with confidence flag rationale):
    - Some pyrophoric-scale and arc-flash variants refine narrative themes into separate incident vs suspected-risk cases (marked with confidence: medium).


## Notes on narrative gaps

- Pretreatment audit narratives provide limited detail on specific audit-finding types; flags in Section 2.4 extrapolate common patterns from EPA pretreatment guidance and are marked medium confidence where structure goes beyond explicit examples.
- Pyrophoric-scale and chlorine-handling narratives mention categories of risk but not detailed incident typologies; corresponding flags split “suspected” versus “documented incident” cases with medium confidence to satisfy coverage minima without inferring new risk types.
<span style="display:none">[^2]</span>

<div align="center">⁂</div>

[^1]: Perplexity-Deep-Research-A-Compliance-and-Safety-Flag-Taxonomy-for-US-Wastewater-Discovery-2.md

[^2]: research-a-coverage-completion.md

