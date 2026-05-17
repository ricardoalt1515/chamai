<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Execute the YAML coverage completion task specified in the attached prompt file. The attached Research B output contains the source narrative; produce only the missing YAML for the five abbreviated lenses (advanced-reuse, NRW, biosolids-residuals, stormwater-MS4, decentralized-onsite). Follow the schema and the operator-wisdom calibration set by the two complete lenses in the source. Meet the per-lens coverage minimums. Cite every YAML entity to a non-fabricated URL. Begin now.

```yaml
# Research B YAML Coverage Completion Pass v1.1
# New artefacts for lenses: lens-advanced-reuse, lens-nrw, lens-biosolids-residuals,
# lens-stormwater-ms4, and lens-decentralized-onsite, derived from the existing narratives
# and their cited sources in Perplexity Research B.[file:1][web:3][web:22][web:23][web:34]

# ---------------------------------------------------------------------------
# Profile questions (Artefact 2)
# ---------------------------------------------------------------------------

- id: profq-lens-advanced-reuse-worst-supply-stress
  lens: lens-advanced-reuse
  question_text: "Think back to your worst recent supply-stress period or drought—how did you keep customers in water, and what would you do differently if advanced reuse were already in place?"
  customer_role_signals: utility-reuse-lead-or-water-supply-executive
  evidence_surfaced: Concrete narrative of past supply crises, contingency measures, and appetite for structurally different solutions such as IPR or DPR.
  diagnostic_rank: 1
  applies_to_subcase: null
  bias_calibration_notes: Grounds the reuse conversation in real events and trade-offs rather than generic interest in reuse.
  source: https://www.ocwd.com/gwrs/
  confidence: high

- id: profq-lens-advanced-reuse-reg-path
  lens: lens-advanced-reuse
  question_text: "Who have you already spoken with on the regulatory side about non-potable, IPR, or DPR options, and what did they tell you about a feasible path in your state?"
  customer_role_signals: utility-reuse-lead-or-regulatory-affairs
  evidence_surfaced: Level of engagement with state reuse regulators, clarity on which reuse classes are actually approvable, and early feedback from Title-22-style programs.
  diagnostic_rank: 2
  applies_to_subcase: null
  bias_calibration_notes: Avoids abstract 'is reuse allowed here?' and instead asks for specific conversations and advice received.
  source: https://watereuse.org/ca-dpr-take-effect/
  confidence: high

- id: profq-lens-advanced-reuse-ops-readiness
  lens: lens-advanced-reuse
  question_text: "If you had to run an MF/RO/AOP advanced treatment train tomorrow, who on your team would own it, and what similar processes are they already operating today?"
  customer_role_signals: operations-lead-or-plant-manager
  evidence_surfaced: Operational bench strength, experience with membranes and advanced oxidation, and gaps in staffing or training.
  diagnostic_rank: 3
  applies_to_subcase: null
  bias_calibration_notes: Surfaces realistic operational readiness instead of generic claims that 'our team can handle advanced treatment'.
  source: https://www.fluencecorp.com/california-title-22-water-reuse-standards/
  confidence: medium

- id: profq-lens-advanced-reuse-end-use-portfolio
  lens: lens-advanced-reuse
  question_text: "Walk me through your current and potential end uses for reclaimed water—who would take it, at what reliability and quality, and what happens if one of those outlets closes?"
  customer_role_signals: water-resources-or-reuse-program-manager
  evidence_surfaced: Diversity and firmness of non-potable and potable end uses, tolerance for interruptions, and outlet risk.
  diagnostic_rank: null
  applies_to_subcase: subcase-reuse-nonpotable
  bias_calibration_notes: Encourages thinking in terms of specific customers and outages rather than abstract 'demand for reuse'.
  source: https://www.ocwd.com/gwrs/
  confidence: high

- id: profq-lens-advanced-reuse-buffer-and-log-credits
  lens: lens-advanced-reuse
  question_text: "For an IPR or DPR concept, how are you thinking about environmental buffers or engineered storage and the log-removal or log-reduction credits you would need to demonstrate?"
  customer_role_signals: planning-or-process-design-lead
  evidence_surfaced: Depth of understanding of IPR/DPR regulatory expectations for pathogen and contaminant reduction.
  diagnostic_rank: null
  applies_to_subcase: subcase-reuse-ipr
  bias_calibration_notes: Moves beyond 'we’ll meet the standards' to how credits and buffers would actually be earned.
  source: https://watereuse.org/ca-dpr-take-effect/
  confidence: medium

- id: profq-lens-advanced-reuse-feedwater-risk
  lens: lens-advanced-reuse
  question_text: "What do your latest monitoring data and industrial source-control efforts tell you about PFAS and other microconstituents in the proposed reuse feedwater?"
  customer_role_signals: water-quality-or-pretreatment-lead
  evidence_surfaced: Current data on PFAS and trace organics, awareness of treatment challenges, and linkage to pretreatment or source control.
  diagnostic_rank: null
  applies_to_subcase: null
  bias_calibration_notes: Ties emerging-contaminant risk to actual data instead of generic concern about 'chemicals of emerging concern'.
  source: https://kh.aquaenergyexpo.com/wp-content/uploads/2022/11/Drinking-Water-Treatment-for-PFAS-Selection-Guide.pdf
  confidence: medium

- id: profq-lens-advanced-reuse-brine-and-residuals
  lens: lens-advanced-reuse
  question_text: "If you produced RO concentrate and additional residuals at reuse scale tomorrow, where would they go, and what constraints could force you to change that plan?"
  customer_role_signals: solids-and-residuals-program-manager
  evidence_surfaced: Existing or planned concentrate and residuals outlets, regulatory limits, and commercial vulnerabilities.
  diagnostic_rank: null
  applies_to_subcase: null
  bias_calibration_notes: Connects advanced treatment choices to downstream solids and concentrate risks rather than treating them as separate problems.
  source: https://www.epa.gov/biosolids/land-application-biosolids
  confidence: high

- id: profq-lens-advanced-reuse-public-trust
  lens: lens-advanced-reuse
  question_text: "What have you heard from elected officials and the public when potable reuse has come up—what stories, concerns, or endorsements have stuck with you?"
  customer_role_signals: general-manager-or-communications-lead
  evidence_surfaced: Real-world signals on public trust, political champions, and opposition narratives around potable reuse.
  diagnostic_rank: null
  applies_to_subcase: subcase-reuse-dpr
  bias_calibration_notes: Surfaces lived experience with perception and politics instead of asking abstractly if 'the community supports reuse'.
  source: https://watereuse.org/ca-dpr-take-effect/
  confidence: medium

- id: profq-lens-nrw-last-audit
  lens: lens-nrw
  question_text: "When was your last validated AWWA water audit, what data validity score did you achieve, and which components were weakest?"
  customer_role_signals: nrw-or-distribution-system-lead
  evidence_surfaced: Audit recency, rigor, and specific weaknesses in data streams feeding the NRW balance.
  diagnostic_rank: 1
  applies_to_subcase: null
  bias_calibration_notes: Replaces 'do you track NRW?' with evidence on audit quality and specific weak spots.
  source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition
  confidence: high

- id: profq-lens-nrw-production-meter-trust
  lens: lens-nrw
  question_text: "Walk me through how you know your production meters are right—when were they last tested or replaced, and what did you learn?"
  customer_role_signals: nrw-or-plant-operations-lead
  evidence_surfaced: Depth of verification around system input meters and willingness to confront big corrections.
  diagnostic_rank: 2
  applies_to_subcase: subcase-nrw-ami
  bias_calibration_notes: Targets the single most leveraged data point in the audit rather than asking generally about 'meter accuracy'.
  source: https://www.awwa.org/resource/water-loss-control/
  confidence: high

- id: profq-lens-nrw-dma-hotspots
  lens: lens-nrw
  question_text: "Which DMAs or pressure zones account for most of your real-loss volume today, and what field evidence backs that up?"
  customer_role_signals: nrw-or-distribution-engineer
  evidence_surfaced: Whether leakage hotspots are identified and substantiated with night flows, step tests, or repair history.
  diagnostic_rank: 3
  applies_to_subcase: subcase-nrw-dma-pressure
  bias_calibration_notes: Forces link between modeled losses and concrete field data rather than relying on rough intuition.
  source: https://swefc.unm.edu/wlswitchboard/resource/m36-water-audits-and-loss-control-programs-4th-edition/
  confidence: high

- id: profq-lens-nrw-apparent-loss-story
  lens: lens-nrw
  question_text: "Tell me about the last time you discovered a major apparent loss—how did you find it, and what changed in your metering or billing practices afterward?"
  customer_role_signals: nrw-or-customer-service-lead
  evidence_surfaced: Capability to detect and correct data-handling errors, theft, and meter under-registration.
  diagnostic_rank: null
  applies_to_subcase: null
  bias_calibration_notes: Anchors apparent-loss discussion in a specific discovery and organizational learning, not just policies.
  source: https://www.mrwa.com/PDF/WaterResourcesUtilityoftheFuture_BlueprintForAction_Final%20(2).pdf
  confidence: medium

- id: profq-lens-nrw-leak-repair-cycle
  lens: lens-nrw
  question_text: "From when a leak is first suspected to when it is repaired, what does that timeline look like in practice, and how does it vary by area?"
  customer_role_signals: field-operations-or-maintenance-lead
  evidence_surfaced: Real repair cycle times, backlog, and whether leak detection is matched by repair capacity.
  diagnostic_rank: null
  applies_to_subcase: subcase-nrw-leak-detection
  bias_calibration_notes: Surfaces operational constraints that keep modeled savings from materializing on the ground.
  source: https://www.awwa.org/resource/water-loss-control/
  confidence: high

- id: profq-lens-nrw-reg-and-kpi-pressure
  lens: lens-nrw
  question_text: "What external requirements or internal KPIs are pushing you on NRW today, and how often do those metrics show up in board or council discussions?"
  customer_role_signals: finance-or-executive-lead
  evidence_surfaced: Level of governance attention and whether NRW is treated as strategic or purely technical.
  diagnostic_rank: null
  applies_to_subcase: null
  bias_calibration_notes: Helps distinguish pilot enthusiasm from durable organizational commitment to loss control.
  source: https://www.mrwa.com/PDF/WaterResourcesUtilityoftheFuture_BlueprintForAction_Final%20(2).pdf
  confidence: medium

- id: profq-lens-nrw-ami-analytics
  lens: lens-nrw
  question_text: "For areas where you already have AMI, what are the most actionable analyses you actually run today, and which ones are still on the wish list?"
  customer_role_signals: nrw-or-ami-program-manager
  evidence_surfaced: Practical use of AMI for NRW (continuous flow flags, backflow, tamper alarms) versus unrealized potential.
  diagnostic_rank: null
  applies_to_subcase: subcase-nrw-ami
  bias_calibration_notes: Avoids equating 'having AMI' with using AMI for loss control.
  source: https://www.awwa.org/event/water-audits-and-non-revenue-water-management/
  confidence: medium

- id: profq-lens-bio-outlet-history
  lens: lens-biosolids-residuals
  question_text: "In the last five years, when did a biosolids outlet change on you—losing a field, a landfill, or a buyer—and how did you keep solids moving?"
  customer_role_signals: biosolids-program-director
  evidence_surfaced: Practical experience with outlet disruptions, contingency planning, and tolerance for market or regulatory shocks.
  diagnostic_rank: 1
  applies_to_subcase: null
  bias_calibration_notes: Moves beyond static outlet lists to real stress tests of the outlet portfolio.
  source: https://www.epa.gov/biosolids/fact-sheet-land-application-biosolids
  confidence: high

- id: profq-lens-bio-outlet-mix
  lens: lens-biosolids-residuals
  question_text: "For each dry ton you produce, where does it go today by percentage, and which one or two outlets would hurt most if they disappeared next year?"
  customer_role_signals: biosolids-or-finance-lead
  evidence_surfaced: Outlet diversification, revenue or cost exposure, and identification of single points of failure.
  diagnostic_rank: 2
  applies_to_subcase: null
  bias_calibration_notes: Forces quantification of outlet dependence instead of generic statements about 'multiple options'.
  source: https://www.epa.gov/biosolids/land-application-biosolids
  confidence: high

- id: profq-lens-bio-pfas-strategy
  lens: lens-biosolids-residuals
  question_text: "What have your monitoring, regulators, or end users told you so far about PFAS and other emerging contaminants in your biosolids, and how are you planning for tighter limits?"
  customer_role_signals: biosolids-or-regulatory-affairs
  evidence_surfaced: Awareness of PFAS-driven outlet risk, existing data, and proactive or reactive strategies.
  diagnostic_rank: 3
  applies_to_subcase: null
  bias_calibration_notes: Links emerging-contaminant stories directly to the local program instead of treating PFAS as abstract news.
  source: https://www.kirkland.com/-/media/publications/alert/2024/04/pfas-update-epa-announces-its-first-enforceable-and-final-national-drinking-water-standards-for-cert.pdf
  confidence: medium

- id: profq-lens-bio-class-and-flexibility
  lens: lens-biosolids-residuals
  question_text: "What Class A or Class B designations are you producing today, and how easy would it be to shift between them if an outlet or rule changed?"
  customer_role_signals: biosolids-process-or-design-lead
  evidence_surfaced: Process flexibility, margin against tighter classification or vector-attraction requirements, and reconfiguration options.
  diagnostic_rank: null
  applies_to_subcase: null
  bias_calibration_notes: Surfaces whether process design supports outlet agility rather than locking into a single classification.
  source: https://www.wef.org/publications/publications/books/standards-for-design-of-water-resource-recovery-facilities/
  confidence: medium

- id: profq-lens-bio-storage-and-buffer
  lens: lens-biosolids-residuals
  question_text: "How much storage or buffering capacity do you have if a land-application season is delayed or a landfill stops taking material unexpectedly?"
  customer_role_signals: biosolids-program-or-operations-lead
  evidence_surfaced: On-site storage, emergency haul options, and risk of treatment plant constraints when outlets pause.
  diagnostic_rank: null
  applies_to_subcase: null
  bias_calibration_notes: Encourages thinking about solids as a flow with variability, not just an average tonnage.
  source: https://www.epa.gov/biosolids/land-application-biosolids
  confidence: high

- id: profq-lens-bio-thermal-tradeoffs
  lens: lens-biosolids-residuals
  question_text: "For your thermal processes, how do fuel, energy, and air-permitting constraints show up in day-to-day decisions about how hard you run the system?"
  customer_role_signals: thermal-process-or-plant-operations-lead
  evidence_surfaced: Operational constraints and trade-offs for incineration or drying systems, including air rules and cost.
  diagnostic_rank: null
  applies_to_subcase: subcase-bio-thermal
  bias_calibration_notes: Surfaces real constraints that can limit the theoretical reliability of thermal outlets.
  source: https://www.wef.org/publications/publications/books/standards-for-design-of-water-resource-recovery-facilities/
  confidence: medium

- id: profq-lens-bio-ccr-collocation
  lens: lens-biosolids-residuals
  question_text: "Are any of your biosolids handling, monofills, or landfills co-located with coal combustion residuals or other industrial residuals, and how are those liabilities managed?"
  customer_role_signals: biosolids-or-environmental-compliance-lead
  evidence_surfaced: Intersection of CCR and biosolids management, shared infrastructure, and awareness of evolving CCR rules.
  diagnostic_rank: null
  applies_to_subcase: subcase-bio-disposal
  bias_calibration_notes: Brings long-term residuals liability into the conversation without assuming the customer has already connected CCR and biosolids risk.
  source: https://www.epa.gov/coal-combustion-residuals/final-rule-legacy-coal-combustion-residuals-surface-impoundments-and-ccr
  confidence: medium

- id: profq-lens-bio-market-signals
  lens: lens-biosolids-residuals
  question_text: "What have your farmers, landowners, or landfill operators told you recently about staying in or exiting your biosolids program, and what would make them change their minds?"
  customer_role_signals: biosolids-marketing-or-contracts-lead
  evidence_surfaced: Market sentiment, early-warning signals, and value proposition for current outlets.
  diagnostic_rank: null
  applies_to_subcase: subcase-bio-landapp
  bias_calibration_notes: Surfaces forward-looking outlet risk through counterparties’ words, not just current contracts.
  source: https://www.epa.gov/biosolids/fact-sheet-land-application-biosolids
  confidence: medium

- id: profq-lens-ms4-last-enforcement-or-crisis
  lens: lens-stormwater-ms4
  question_text: "Tell me about the last time your MS4 program had a serious issue—a notice of violation, fish kill, or high-profile flooding complaint—and what changed afterward."
  customer_role_signals: ms4-program-manager
  evidence_surfaced: How the program responds to crises, learns from enforcement, and adjusts practices.
  diagnostic_rank: 1
  applies_to_subcase: null
  bias_calibration_notes: Anchors performance in real incidents rather than compliance-status slogans.
  source: https://floridadep.gov/water/stormwater/content/phase-ii-ms4s
  confidence: high

- id: profq-lens-ms4-iddetrace
  lens: lens-stormwater-ms4
  question_text: "When was the last time you traced an illicit discharge from first report all the way back to its source, and what did that investigation look like?"
  customer_role_signals: idde-coordinator-or-field-lead
  evidence_surfaced: Practical capability to detect, investigate, and eliminate illicit discharges.
  diagnostic_rank: 2
  applies_to_subcase: null
  bias_calibration_notes: Avoids generic 'we have an IDDE program' statements and focuses on an actual case.
  source: https://crwp.org/npdes-phase-ii/
  confidence: high

- id: profq-lens-ms4-permit-renewal-changes
  lens: lens-stormwater-ms4
  question_text: "Looking at your current permit compared to the last one, what were the three biggest changes in minimum control measures or TMDL obligations, and how did you adjust the program?"
  customer_role_signals: ms4-program-or-regulatory-lead
  evidence_surfaced: Awareness of evolving permit requirements and practical program adjustments.
  diagnostic_rank: 3
  applies_to_subcase: null
  bias_calibration_notes: Forces comparison across permit cycles rather than static descriptions of the program.
  source: https://floridadep.gov/water/stormwater/content/phase-ii-ms4s
  confidence: high

- id: profq-lens-ms4-bmp-inventory-and-condition
  lens: lens-stormwater-ms4
  question_text: "How complete and current is your inventory of structural BMPs, and what do your last few inspection rounds say about their actual condition and performance?"
  customer_role_signals: asset-management-or-field-inspection-lead
  evidence_surfaced: Quality of BMP asset data, inspection coverage, and maintenance backlog.
  diagnostic_rank: null
  applies_to_subcase: null
  bias_calibration_notes: Pushes beyond having a SWMP document to understanding the field reality of BMPs.
  source: https://www.tceq.texas.gov/permitting/stormwater/ms4/WQ_ms4_small.html
  confidence: medium

- id: profq-lens-ms4-construction-controls
  lens: lens-stormwater-ms4
  question_text: "On a typical construction season, what does it take for a site to get your attention—are you reacting to complaints, inspection findings, or documented trends in violations?"
  customer_role_signals: construction-stormwater-or-code-enforcement-lead
  evidence_surfaced: How proactive the construction program is, and drivers of enforcement focus.
  diagnostic_rank: null
  applies_to_subcase: null
  bias_calibration_notes: Surfaces whether enforcement is complaint-driven or risk-based.
  source: https://crwp.org/npdes-phase-ii/
  confidence: medium

- id: profq-lens-ms4-tmdl-retrofit-strategy
  lens: lens-stormwater-ms4
  question_text: "For any TMDL-driven requirements you have, what is your current retrofit or implementation strategy, and how are you tracking load reductions over time?"
  customer_role_signals: ms4-or-watershed-planning-lead
  evidence_surfaced: Existence and maturity of a TMDL compliance path and supporting analytics.
  diagnostic_rank: null
  applies_to_subcase: subcase-ms4-phase1
  bias_calibration_notes: Distinguishes paper TMDL commitments from funded, trackable implementation.
  source: https://floridadep.gov/water/stormwater/content/phase-ii-ms4s
  confidence: medium

- id: profq-lens-ms4-funding-and-staffing
  lens: lens-stormwater-ms4
  question_text: "How stable are your stormwater funding sources and staff positions over the permit term, and what has that meant for your ability to follow through on your SWMP?"
  customer_role_signals: ms4-program-manager-or-finance-lead
  evidence_surfaced: Funding mechanisms, staffing continuity, and vulnerability of program delivery.
  diagnostic_rank: null
  applies_to_subcase: null
  bias_calibration_notes: Ties program ambitions to resourcing realities, highlighting risks from unstable funding.
  source: https://crwp.org/npdes-phase-ii/
  confidence: medium

- id: profq-lens-ms4-cross-department-coordination
  lens: lens-stormwater-ms4
  question_text: "When you look at your last year of MS4 work, where did coordination with streets, utilities, or planning departments work well, and where did it break down?"
  customer_role_signals: ms4-program-manager
  evidence_surfaced: Practical integration of stormwater considerations into other municipal functions.
  diagnostic_rank: null
  applies_to_subcase: null
  bias_calibration_notes: Surfaces programmatic sufficiency bias where plans exist but day-to-day coordination lags.
  source: https://floridadep.gov/water/stormwater/content/phase-ii-ms4s
  confidence: medium

- id: profq-lens-decent-inventory-and-failure-rate
  lens: lens-decentralized-onsite
  question_text: "When did you last complete a comprehensive inventory and condition assessment of your onsite and clustered systems, and what failure rate did you actually find?"
  customer_role_signals: decentralized-program-manager-or-health-department-lead
  evidence_surfaced: Existence and recency of system inventories and real failure statistics.
  diagnostic_rank: 1
  applies_to_subcase: null
  bias_calibration_notes: Replaces generic assurances about septic performance with measured failure data.
  source: https://www.epa.gov/small-and-rural-wastewater-systems/about-small-wastewater-systems
  confidence: high

- id: profq-lens-decent-management-entity
  lens: lens-decentralized-onsite
  question_text: "Who is formally responsible for long-term management—an RME, utility, or nobody—and how is that entity staffed and funded over the next decade?"
  customer_role_signals: utility-or-local-government-lead
  evidence_surfaced: Presence and robustness of responsible management entities or equivalent structures.
  diagnostic_rank: 2
  applies_to_subcase: subcase-decent-rme-advanced
  bias_calibration_notes: Surfaces governance strength and sustainability rather than just existence of a program on paper.
  source: https://www.epa.gov/sites/default/files/2015-06/documents/2005_12_20_septics_onsite_handbook_fs.pdf
  confidence: high

- id: profq-lens-decent-last-incident
  lens: lens-decentralized-onsite
  question_text: "Tell me about the last serious public-health or surface/groundwater incident linked to onsite systems here—what triggered it, and what changed afterward?"
  customer_role_signals: health-or-environmental-protection-lead
  evidence_surfaced: Recent incidents, response capacity, and institutional learning around onsite failures.
  diagnostic_rank: 3
  applies_to_subcase: null
  bias_calibration_notes: Grounds risk in specific events rather than generalized perceptions that 'systems usually work'.
  source: https://www.epa.gov/small-and-rural-wastewater-systems/about-small-wastewater-systems
  confidence: high

- id: profq-lens-decent-high-risk-areas
  lens: lens-decentralized-onsite
  question_text: "Which neighborhoods or watersheds worry you the most for onsite performance—near wells, lakes, or shellfish areas—and what extra protections, if any, are in place there?"
  customer_role_signals: decentralized-program-manager-or-watershed-planner
  evidence_surfaced: Identification of high-risk clusters and presence of risk-based differential management.
  diagnostic_rank: null
  applies_to_subcase: null
  bias_calibration_notes: Pushes beyond uniform policies to consider environmental vulnerability and density.
  source: https://www.epa.gov/sites/default/files/2015-06/documents/2005_12_20_septics_onsite_handbook_fs.pdf
  confidence: medium

- id: profq-lens-decent-growth-and-developers
  lens: lens-decentralized-onsite
  question_text: "How are onsite or cluster systems being used in new development, and what happens when those areas reach densities where decentralized management becomes harder to sustain?"
  customer_role_signals: planning-or-utilities-coordination-lead
  evidence_surfaced: Interaction between growth patterns, onsite reliance, and triggers for centralization or stronger management.
  diagnostic_rank: null
  applies_to_subcase: subcase-decent-community
  bias_calibration_notes: Surfaces long-term trajectory instead of just current snapshot of onsite use.
  source: https://www.epa.gov/small-and-rural-wastewater-systems/about-small-wastewater-systems
  confidence: medium

- id: profq-lens-decent-tracking-and-records
  lens: lens-decentralized-onsite
  question_text: "When you pull records for a typical system, what do you actually see—design, permits, inspections, pump-outs—and how many systems have that level of documentation?"
  customer_role_signals: permitting-or-records-manager
  evidence_surfaced: Quality and completeness of records that underpin any management program.
  diagnostic_rank: null
  applies_to_subcase: subcase-decent-septic
  bias_calibration_notes: Moves quickly past 'we have files' to what those files really contain and at what coverage.
  source: https://www.epa.gov/sites/default/files/2015-06/documents/2005_12_20_septics_onsite_handbook_fs.pdf
  confidence: medium

- id: profq-lens-decent-homeowner-engagement
  lens: lens-decentralized-onsite
  question_text: "What have you done in the last few years to change homeowner behavior around inspections, pump-outs, and repairs, and how do you know if it is working?"
  customer_role_signals: decentralized-program-or-outreach-lead
  evidence_surfaced: Education, incentives, enforcement, and any measured shifts in owner practices.
  diagnostic_rank: null
  applies_to_subcase: subcase-decent-septic
  bias_calibration_notes: Surfaces whether programs move beyond brochures to measurable behavior change.
  source: https://www.epa.gov/small-and-rural-wastewater-systems/about-small-wastewater-systems
  confidence: medium

- id: profq-lens-decent-financing-tools
  lens: lens-decentralized-onsite
  question_text: "What financing tools—fees, assessments, SRF, grants—are actually in place today to pay for inspections, upgrades, or replacements of onsite and clustered systems?"
  customer_role_signals: finance-or-program-manager
  evidence_surfaced: Practical ability to fund the management model contemplated in guidance.
  diagnostic_rank: null
  applies_to_subcase: null
  bias_calibration_notes: Distinguishes wish-list programs from those with a sustainable financial base.
  source: https://www.epa.gov/small-and-rural-wastewater-systems/about-small-wastewater-systems
  confidence: medium

# ---------------------------------------------------------------------------
# Data needs (Artefact 3)
# ---------------------------------------------------------------------------

- id: data-lens-reuse-supply-demand
  lens: lens-advanced-reuse
  artefact_name: Long-term supply–demand and drought analyses
  artefact_category: commercial
  ideal_data: Integrated water supply plans, historical and projected demand curves, drought-of-record analyses, and shortage response plans.
  realistic_first_call_ask: Latest water supply plan or a concise summary of projected gaps and recent drought management actions.
  cross_links_to_lenses:
    - lens-municipal-wet-weather
  source: https://www.ocwd.com/gwrs/
  confidence: high

- id: data-lens-reuse-analogue-projects
  lens: lens-advanced-reuse
  artefact_name: Analogous reuse project case studies and performance data
  artefact_category: reuse-specific
  ideal_data: Design, performance, and regulatory-approval documentation from comparable non-potable, IPR, or DPR projects used as benchmarks.
  realistic_first_call_ask: List of reference projects and any publicly available case studies or summaries used internally.
  cross_links_to_lenses:
    - lens-biosolids-residuals
  source: https://www.waterrf.org/research/topics/reuse
  confidence: medium

- id: data-lens-reuse-treatment-train-design
  lens: lens-advanced-reuse
  artefact_name: Proposed or existing advanced treatment train design basis
  artefact_category: engineering
  ideal_data: Process flow diagrams, unit process sizing, design log-removal credits, and control philosophy for MF/UF, RO, AOP, and UV.
  realistic_first_call_ask: High-level block diagram and design basis document for the advanced treatment concept.
  cross_links_to_lenses:
    - lens-municipal-wet-weather
  source: https://www.fluencecorp.com/california-title-22-water-reuse-standards/
  confidence: high

- id: data-lens-reuse-residuals-and-brine
  lens: lens-advanced-reuse
  artefact_name: Residuals, concentrate, and brine management plan
  artefact_category: reuse-specific
  ideal_data: Quantities, characteristics, and outlets for RO concentrate, residuals, and additional solids, including permits and contracts.
  realistic_first_call_ask: Current concept memo or slide summarizing concentrate and residuals management options and constraints.
  cross_links_to_lenses:
    - lens-biosolids-residuals
  source: https://www.epa.gov/biosolids/land-application-biosolids
  confidence: medium

- id: data-lens-reuse-public-and-stakeholder-input
  lens: lens-advanced-reuse
  artefact_name: Public outreach, stakeholder feedback, and governance records
  artefact_category: commercial
  ideal_data: Results from surveys, stakeholder meetings, advisory committees, and board actions related to potable or non-potable reuse.
  realistic_first_call_ask: Most recent summary of stakeholder engagement findings or board resolutions on reuse.
  cross_links_to_lenses:
    - lens-decentralized-onsite
  source: https://watereuse.org/ca-dpr-take-effect/
  confidence: medium

- id: data-lens-reuse-pretreatment-and-feedwater-control
  lens: lens-advanced-reuse
  artefact_name: Pretreatment and source-control program data for reuse feedwater
  artefact_category: reuse-specific
  ideal_data: Industrial user inventories, local limits, PFAS and microconstituent monitoring, and any special source-control initiatives for the reuse basin.
  realistic_first_call_ask: Summary of key industrial contributors and any targeted pretreatment or PFAS initiatives affecting the reuse project.
  cross_links_to_lenses:
    - lens-industrial-discharge
    - lens-biosolids-residuals
  source: https://www.epa.gov/eg/electroplating-effluent-guidelines
  confidence: medium

- id: data-lens-nrw-audit-workbooks
  lens: lens-nrw
  artefact_name: AWWA water audit workbooks and summaries
  artefact_category: operational
  ideal_data: At least five years of completed AWWA Free Water Audit Software workbooks with data validity scores and detailed component volumes.
  realistic_first_call_ask: Most recent one or two completed AWWA audit workbooks and a summary of key findings.
  cross_links_to_lenses:
    - lens-municipal-wet-weather
  source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition
  confidence: high

- id: data-lens-nrw-production-meter-tests
  lens: lens-nrw
  artefact_name: Production meter calibration and test records
  artefact_category: engineering
  ideal_data: Test reports, calibration histories, and replacement records for all key production and treatment-plant effluent meters.
  realistic_first_call_ask: Latest calibration or test report for the primary production meters and a brief description of test frequency.
  cross_links_to_lenses:
    - lens-municipal-wet-weather
  source: https://www.awwa.org/resource/water-loss-control/
  confidence: high

- id: data-lens-nrw-customer-meter-sampling
  lens: lens-nrw
  artefact_name: Customer meter sample testing and change-out strategy
  artefact_category: operational
  ideal_data: Sample-test results for residential, commercial, and large meters, with policies for replacement and expected under-registration over time.
  realistic_first_call_ask: Summary of any recent sample-testing program or large-meter audit and key results.
  cross_links_to_lenses:
    - lens-decentralized-onsite
  source: https://swefc.unm.edu/wlswitchboard/resource/m36-water-audits-and-loss-control-programs-4th-edition/
  confidence: medium

- id: data-lens-nrw-pressure-and-dma-maps
  lens: lens-nrw
  artefact_name: Pressure zone and DMA mapping with key pressures and flows
  artefact_category: engineering
  ideal_data: GIS layers showing DMAs, pressure zones, key valves and meters, typical pressures, and night-flow data for each area.
  realistic_first_call_ask: Current map or schematic showing DMAs and pressure zones with notes on typical pressures and metered inflows.
  cross_links_to_lenses:
    - lens-stormwater-ms4
  source: https://www.awwa.org/event/water-audits-and-non-revenue-water-management/
  confidence: medium

- id: data-lens-nrw-leak-and-break-history
  lens: lens-nrw
  artefact_name: Leak, main break, and repair history
  artefact_category: operational
  ideal_data: Multi-year dataset of leaks and breaks with location, pipe material, repair time, and estimated loss volumes.
  realistic_first_call_ask: Recent year’s leak and break summary with counts, repair intervals, and any spatial clustering analysis.
  cross_links_to_lenses:
    - lens-municipal-wet-weather
  source: https://www.mrwa.com/PDF/WaterResourcesUtilityoftheFuture_BlueprintForAction_Final%20(2).pdf
  confidence: medium

- id: data-lens-nrw-policy-and-reg-drivers
  lens: lens-nrw
  artefact_name: Policy and regulatory drivers for NRW control
  artefact_category: regulatory
  ideal_data: State or regional regulations, performance targets, and reporting requirements related to water loss control.
  realistic_first_call_ask: Summary of any regulatory or funding program requirements that mention water loss audits or NRW performance.
  cross_links_to_lenses:
    - lens-municipal-wet-weather
  source: https://www.mrwa.com/PDF/WaterResourcesUtilityoftheFuture_BlueprintForAction_Final%20(2).pdf
  confidence: medium

- id: data-lens-bio-quality-and-503
  lens: lens-biosolids-residuals
  artefact_name: Biosolids quality data and Part 503 compliance records
  artefact_category: regulatory
  ideal_data: Multi-year dataset of metals, nutrients, pathogens, vector attraction, and monitored organics with associated Part 503 compliance documentation.
  realistic_first_call_ask: Most recent year of biosolids quality reports and any recent correspondence with regulators on compliance.
  cross_links_to_lenses:
    - lens-municipal-wet-weather
  source: https://www.epa.gov/biosolids/land-application-biosolids
  confidence: high

- id: data-lens-bio-outlet-matrix
  lens: lens-biosolids-residuals
  artefact_name: Outlet and market matrix for biosolids
  artefact_category: commercial
  ideal_data: Quantities, destinations, contract terms, and pricing for each outlet (land application, compost, thermal, landfill, monofill).
  realistic_first_call_ask: Current year summary table of outlets with approximate tonnages and contract end dates.
  cross_links_to_lenses:
    - lens-advanced-reuse
  source: https://www.epa.gov/biosolids/fact-sheet-land-application-biosolids
  confidence: medium

- id: data-lens-bio-storage-and-contingency
  lens: lens-biosolids-residuals
  artefact_name: Storage capacity and contingency plans
  artefact_category: engineering
  ideal_data: Storage facility designs, capacities, and written contingency plans for outlet interruptions.
  realistic_first_call_ask: Brief description of available storage, maximum duration of outlet loss that can be handled, and any contingency plans.
  cross_links_to_lenses:
    - lens-municipal-wet-weather
  source: https://www.wef.org/publications/publications/books/standards-for-design-of-water-resource-recovery-facilities/
  confidence: medium

- id: data-lens-bio-ccr-and-residuals-linkages
  lens: lens-biosolids-residuals
  artefact_name: Linkages with CCR and other industrial residuals
  artefact_category: regulatory
  ideal_data: Documentation of shared disposal sites, permits, monitoring plans, and closure or corrective action obligations for CCR-related units.
  realistic_first_call_ask: Identification of any co-located CCR units or industrial residuals facilities and associated permits or orders.
  cross_links_to_lenses:
    - lens-industrial-discharge
  source: https://www.epa.gov/coal-combustion-residuals/final-rule-legacy-coal-combustion-residuals-surface-impoundments-and-ccr
  confidence: medium

- id: data-lens-bio-contracts-and-costs
  lens: lens-biosolids-residuals
  artefact_name: Biosolids hauling, processing, and disposal contracts and unit costs
  artefact_category: commercial
  ideal_data: All active contracts with unit rates, escalation terms, minimum/maximum tonnages, and termination clauses.
  realistic_first_call_ask: List of major current contracts with approximate unit costs and contract end dates.
  cross_links_to_lenses:
    - lens-municipal-wet-weather
  source: https://www.waterrf.org/case-studies
  confidence: medium

- id: data-lens-bio-pfas-and-ec-monitoring
  lens: lens-biosolids-residuals
  artefact_name: PFAS and emerging contaminant monitoring in biosolids
  artefact_category: biosolids-specific
  ideal_data: PFAS and other microconstituent monitoring results for biosolids, plus any applicable state or local guidance.
  realistic_first_call_ask: Any recent PFAS or microconstituent data collected for biosolids and related communications from regulators or outlets.
  cross_links_to_lenses:
    - lens-advanced-reuse
  source: https://www.kirkland.com/-/media/publications/alert/2024/04/pfas-update-epa-announces-its-first-enforceable-and-final-national-drinking-water-standards-for-cert.pdf
  confidence: medium

- id: data-lens-ms4-permit-and-swmp
  lens: lens-stormwater-ms4
  artefact_name: Current MS4 permit and SWMP or stormwater management plan
  artefact_category: regulatory
  ideal_data: Full MS4 permit, associated SWMP, and any TMDL implementation plans referenced in the permit.
  realistic_first_call_ask: Current MS4 permit and most recent SWMP or SWMP update.
  cross_links_to_lenses:
    - lens-municipal-wet-weather
  source: https://floridadep.gov/water/stormwater/content/phase-ii-ms4s
  confidence: high

- id: data-lens-ms4-annual-reports
  lens: lens-stormwater-ms4
  artefact_name: Recent MS4 annual reports and compliance summaries
  artefact_category: regulatory
  ideal_data: At least three years of annual reports including implementation status, metrics, and any enforcement correspondence.
  realistic_first_call_ask: Most recent annual report and any associated enforcement letters or orders.
  cross_links_to_lenses:
    - lens-stormwater-ms4
  source: https://crwp.org/npdes-phase-ii/
  confidence: high

- id: data-lens-ms4-bmp-inventory-and-om
  lens: lens-stormwater-ms4
  artefact_name: BMP inventory, inspection, and maintenance data
  artefact_category: operational
  ideal_data: GIS or tabular inventory of structural BMPs with inspection dates, conditions, and completed maintenance activities.
  realistic_first_call_ask: Latest BMP inventory report or export plus summary of inspection frequencies and common deficiencies.
  cross_links_to_lenses:
    - lens-municipal-wet-weather
  source: https://www.tceq.texas.gov/permitting/stormwater/ms4/WQ_ms4_small.html
  confidence: medium

- id: data-lens-ms4-idde-records
  lens: lens-stormwater-ms4
  artefact_name: Illicit discharge detection and elimination (IDDE) investigations
  artefact_category: operational
  ideal_data: Multi-year log of IDDE complaints, investigations, sources found, and corrective actions taken.
  realistic_first_call_ask: Recent year’s IDDE investigation summary, including counts by source type and resolution status.
  cross_links_to_lenses:
    - lens-industrial-discharge
  source: https://crwp.org/npdes-phase-ii/
  confidence: medium

- id: data-lens-ms4-construction-inspections
  lens: lens-stormwater-ms4
  artefact_name: Construction and post-construction inspection and enforcement records
  artefact_category: regulatory
  ideal_data: Inspection schedules, findings, notices of violation, and follow-up actions for construction and post-construction stormwater controls.
  realistic_first_call_ask: Summary of construction and post-construction inspections and violations for the last year or permit cycle.
  cross_links_to_lenses:
    - lens-municipal-wet-weather
  source: https://floridadep.gov/water/stormwater/content/phase-ii-ms4s
  confidence: medium

- id: data-lens-ms4-funding-and-staffing
  lens: lens-stormwater-ms4
  artefact_name: Stormwater funding mechanisms and staffing levels
  artefact_category: commercial
  ideal_data: Budgets, revenue sources (fees, taxes), staffing plans, and vacancy history for the MS4 program over several years.
  realistic_first_call_ask: Current stormwater budget summary and organizational chart showing dedicated MS4 staff.
  cross_links_to_lenses:
    - lens-decentralized-onsite
  source: https://crwp.org/npdes-phase-ii/
  confidence: medium

- id: data-lens-decent-system-inventory
  lens: lens-decentralized-onsite
  artefact_name: Inventory of onsite and clustered systems
  artefact_category: operational
  ideal_data: GIS or tabular inventory of all onsite, advanced, and clustered systems with age, type, capacity, and ownership/management details.
  realistic_first_call_ask: Latest inventory or best-available count of systems by type and location.
  cross_links_to_lenses:
    - lens-stormwater-ms4
  source: https://www.epa.gov/small-and-rural-wastewater-systems/about-small-wastewater-systems
  confidence: high

- id: data-lens-decent-inspection-and-pumpout-records
  lens: lens-decentralized-onsite
  artefact_name: Inspection, monitoring, and pump-out records
  artefact_category: operational
  ideal_data: Multi-year records of inspections, monitoring, and pump-outs with compliance status for each system or service area.
  realistic_first_call_ask: Summary of inspection and pump-out coverage over the last few years, including estimated compliance rates.
  cross_links_to_lenses:
    - lens-decentralized-onsite
  source: https://www.epa.gov/sites/default/files/2015-06/documents/2005_12_20_septics_onsite_handbook_fs.pdf
  confidence: medium

- id: data-lens-decent-failure-and-complaint-logs
  lens: lens-decentralized-onsite
  artefact_name: Failure reports, complaints, and enforcement actions
  artefact_category: regulatory
  ideal_data: Logs of reported failures, environmental incidents, health complaints, and resulting enforcement or corrective actions.
  realistic_first_call_ask: Recent year’s summary of failures or complaints and any major enforcement actions taken.
  cross_links_to_lenses:
    - lens-municipal-wet-weather
  source: https://www.epa.gov/small-and-rural-wastewater-systems/about-small-wastewater-systems
  confidence: medium

- id: data-lens-decent-risk-and-vulnerability-mapping
  lens: lens-decentralized-onsite
  artefact_name: Hydrogeologic and watershed vulnerability assessments
  artefact_category: engineering
  ideal_data: Maps and assessments showing sensitive areas (drinking-water wells, surface waters, shellfish beds) and onsite system density and risk.
  realistic_first_call_ask: Any existing vulnerability maps or studies used to prioritize management or upgrades.
  cross_links_to_lenses:
    - lens-stormwater-ms4
  source: https://www.epa.gov/sites/default/files/2015-06/documents/2005_12_20_septics_onsite_handbook_fs.pdf
  confidence: medium

- id: data-lens-decent-program-and-rme-docs
  lens: lens-decentralized-onsite
  artefact_name: Management program and RME governance documents
  artefact_category: regulatory
  ideal_data: Ordinances, service agreements, bylaws, and program plans defining responsibilities, service levels, and funding mechanisms for decentralized management.
  realistic_first_call_ask: Current ordinance or program plan that describes how onsite and clustered systems are managed.
  cross_links_to_lenses:
    - lens-decentralized-onsite
  source: https://www.epa.gov/small-and-rural-wastewater-systems/about-small-wastewater-systems
  confidence: high

- id: data-lens-decent-financing-and-assistance
  lens: lens-decentralized-onsite
  artefact_name: Financing tools and assistance programs
  artefact_category: commercial
  ideal_data: Documentation of user fees, assessments, SRF loans, grants, or cost-share programs available for onsite upgrades or replacements.
  realistic_first_call_ask: Summary of existing funding and assistance programs, including eligibility criteria and uptake.
  cross_links_to_lenses:
    - lens-decentralized-onsite
  source: https://www.epa.gov/small-and-rural-wastewater-systems/about-small-wastewater-systems
  confidence: medium

# ---------------------------------------------------------------------------
# Red flags (Artefact 4)
# ---------------------------------------------------------------------------

- id: flag-lens-reuse-pfas-feedwater-uncertain
  lens: lens-advanced-reuse
  flag_name: PFAS and microconstituent risk poorly characterized in feedwater
  severity: specialist
  evidence_cue: Limited or no PFAS and microconstituent monitoring for proposed reuse feedwater despite known industrial or upstream sources.
  why_it_matters: regulatory
  resolution_path: Implement a targeted monitoring program, coordinate with pretreatment, and adjust treatment and project scope consistent with emerging PFAS and potable reuse expectations.
  regulatory_environment_2025_specific: true
  applies_to_subcase: null
  source: https://kh.aquaenergyexpo.com/wp-content/uploads/2022/11/Drinking-Water-Treatment-for-PFAS-Selection-Guide.pdf
  confidence: medium

- id: flag-lens-reuse-ops-capacity-gap
  lens: lens-advanced-reuse
  flag_name: Advanced treatment operations capacity gap
  severity: attention
  evidence_cue: No staff with experience in membranes or advanced oxidation and no concrete plan for training, staffing, or support.
  why_it_matters: operational
  resolution_path: Develop a staffing and training plan, including vendor and peer-utility support, before committing to complex advanced treatment.
  regulatory_environment_2025_specific: false
  applies_to_subcase: null
  source: https://www.waterrf.org/research/topics/reuse
  confidence: medium

- id: flag-lens-reuse-fragmented-governance
  lens: lens-advanced-reuse
  flag_name: Fragmented governance across wastewater and drinking water agencies
  severity: attention
  evidence_cue: Separate organizations control wastewater, reuse production, and potable supply with limited joint planning or governance structures.
  why_it_matters: commercial
  resolution_path: Establish formal joint governance or program structures, MOUs, and integrated planning to support IPR/DPR reliability and accountability.
  regulatory_environment_2025_specific: false
  applies_to_subcase: subcase-reuse-dpr
  source: https://watereuse.org/ca-dpr-take-effect/
  confidence: medium

- id: flag-lens-nrw-audit-never-validated
  lens: lens-nrw
  flag_name: NRW audits never independently validated
  severity: specialist
  evidence_cue: Self-performed audits with no third-party review or formal data validity scoring, despite significant losses indicated.
  why_it_matters: commercial
  resolution_path: Engage qualified reviewers or partners to validate audits, improve data validity, and recalibrate NRW estimates.
  regulatory_environment_2025_specific: false
  applies_to_subcase: null
  source: https://swefc.unm.edu/wlswitchboard/resource/m36-water-audits-and-loss-control-programs-4th-edition/
  confidence: high

- id: flag-lens-nrw-no-leak-repair-capacity
  lens: lens-nrw
  flag_name: Leak detection outpaces repair capacity
  severity: attention
  evidence_cue: Significant backlog of confirmed leaks awaiting repair and field crews consistently operating at or beyond capacity.
  why_it_matters: operational
  resolution_path: Align repair capacity and contracting strategies with detection programs so that identified leaks are quickly resolved.
  regulatory_environment_2025_specific: false
  applies_to_subcase: subcase-nrw-leak-detection
  source: https://www.awwa.org/resource/water-loss-control/
  confidence: medium

- id: flag-lens-nrw-ami-underused
  lens: lens-nrw
  flag_name: AMI deployed but underused for NRW management
  severity: attention
  evidence_cue: AMI system in place but limited use of continuous flow flags, night-flow analyses, or tamper alerts for water loss control.
  why_it_matters: commercial
  resolution_path: Develop and implement NRW-focused AMI analytics and workflows, including clear responsibilities and KPIs.
  regulatory_environment_2025_specific: false
  applies_to_subcase: subcase-nrw-ami
  source: https://www.awwa.org/event/water-audits-and-non-revenue-water-management/
  confidence: medium

- id: flag-lens-nrw-reg-noncompliance-on-loss
  lens: lens-nrw
  flag_name: Noncompliance with water loss reporting or performance requirements
  severity: stop
  evidence_cue: State or regional programs require water audits or NRW thresholds that the utility is not meeting or not reporting against.
  why_it_matters: regulatory
  resolution_path: Bring audits and reporting into alignment with requirements and develop a documented plan to achieve mandated loss targets.
  regulatory_environment_2025_specific: false
  applies_to_subcase: null
  source: https://www.mrwa.com/PDF/WaterResourcesUtilityoftheFuture_BlueprintForAction_Final%20(2).pdf
  confidence: medium

- id: flag-lens-bio-class-b-in-encroaching-areas
  lens: lens-biosolids-residuals
  flag_name: Class B land application in encroaching or sensitive areas
  severity: specialist
  evidence_cue: Class B programs operating near growing residential areas or sensitive waters with increasing complaints or attention.
  why_it_matters: safety
  resolution_path: Reassess siting, consider Class A upgrades or alternative outlets, and strengthen outreach and monitoring.
  regulatory_environment_2025_specific: false
  applies_to_subcase: subcase-bio-landapp
  source: https://www.epa.gov/biosolids/fact-sheet-land-application-biosolids
  confidence: medium

- id: flag-lens-bio-cumulative-loading-unknown
  lens: lens-biosolids-residuals
  flag_name: Cumulative loading at land-application sites poorly tracked
  severity: attention
  evidence_cue: Limited records of cumulative metals or nutrient loading at fields, with uncertainty around remaining capacity.
  why_it_matters: regulatory
  resolution_path: Consolidate and update loading records, verify remaining capacity, and adjust site use or rotation accordingly.
  regulatory_environment_2025_specific: false
  applies_to_subcase: subcase-bio-landapp
  source: https://www.epa.gov/biosolids/land-application-biosolids
  confidence: medium

- id: flag-lens-bio-thermal-air-or-permit-constraints
  lens: lens-biosolids-residuals
  flag_name: Thermal process constrained by air or permit limits
  severity: specialist
  evidence_cue: Incineration or drying system frequently throttled by air permit conditions, emissions limits, or fuel constraints.
  why_it_matters: regulatory
  resolution_path: Evaluate control upgrades, permit modifications, or outlet diversification to avoid solids bottlenecks.
  regulatory_environment_2025_specific: false
  applies_to_subcase: subcase-bio-thermal
  source: https://www.wef.org/publications/publications/books/standards-for-design-of-water-resource-recovery-facilities/
  confidence: medium

- id: flag-lens-bio-ccr-liability-exposure
  lens: lens-biosolids-residuals
  flag_name: Unknown liability from co-managed CCR and biosolids
  severity: attention
  evidence_cue: Co-disposal or co-location of biosolids with CCR or other industrial residuals without clear understanding of CCR rule implications.
  why_it_matters: regulatory
  resolution_path: Clarify CCR and residuals obligations, evaluate long-term closure and monitoring requirements, and separate or manage streams accordingly.
  regulatory_environment_2025_specific: true
  applies_to_subcase: subcase-bio-disposal
  source: https://www.epa.gov/coal-combustion-residuals/final-rule-legacy-coal-combustion-residuals-surface-impoundments-and-ccr
  confidence: medium

- id: flag-lens-ms4-tmdl-no-credible-plan
  lens: lens-stormwater-ms4
  flag_name: TMDL obligations without a credible implementation and retrofit plan
  severity: specialist
  evidence_cue: MS4 permit includes TMDL-related requirements but there is no funded, scheduled retrofit or implementation plan.
  why_it_matters: regulatory
  resolution_path: Develop a specific TMDL implementation plan with projects, milestones, and tracking, and align resources accordingly.
  regulatory_environment_2025_specific: false
  applies_to_subcase: subcase-ms4-phase1
  source: https://floridadep.gov/water/stormwater/content/phase-ii-ms4s
  confidence: medium

- id: flag-lens-ms4-iddet-program-on-paper-only
  lens: lens-stormwater-ms4
  flag_name: IDDE program largely on paper
  severity: attention
  evidence_cue: Written IDDE procedures exist but few investigations, limited source tracing, and minimal corrective actions documented.
  why_it_matters: operational
  resolution_path: Strengthen IDDE implementation with targeted investigations, training, and metrics for illicit discharge identification and removal.
  regulatory_environment_2025_specific: false
  applies_to_subcase: null
  source: https://crwp.org/npdes-phase-ii/
  confidence: medium

- id: flag-lens-ms4-chronic-staffing-and-funding-gaps
  lens: lens-stormwater-ms4
  flag_name: Chronic staffing and funding gaps for MS4 program
  severity: attention
  evidence_cue: Persistent vacancies, heavy reliance on temporary funding, or major SWMP elements unfunded.
  why_it_matters: commercial
  resolution_path: Establish stable funding mechanisms and core staff positions to meet permit and SWMP commitments.
  regulatory_environment_2025_specific: false
  applies_to_subcase: null
  source: https://crwp.org/npdes-phase-ii/
  confidence: medium

- id: flag-lens-ms4-industrial-stormwater-weak
  lens: lens-stormwater-ms4
  flag_name: Weak control over high-risk industrial stormwater sources
  severity: specialist
  evidence_cue: Significant industrial facilities within the MS4 area with limited inspections or stormwater controls and repeated complaints.
  why_it_matters: regulatory
  resolution_path: Enhance industrial stormwater inspection and enforcement programs, and coordinate with NPDES industrial permit programs where applicable.
  regulatory_environment_2025_specific: false
  applies_to_subcase: subcase-ms4-phase1
  source: https://floridadep.gov/water/stormwater/content/phase-ii-ms4s
  confidence: medium

- id: flag-lens-decent-no-inventory
  lens: lens-decentralized-onsite
  flag_name: No reliable inventory of onsite and clustered systems
  severity: attention
  evidence_cue: Estimates of system counts based on permits or assumptions with no consolidated, up-to-date inventory.
  why_it_matters: operational
  resolution_path: Build or update a comprehensive inventory to enable risk-based management and compliance tracking.
  regulatory_environment_2025_specific: false
  applies_to_subcase: null
  source: https://www.epa.gov/small-and-rural-wastewater-systems/about-small-wastewater-systems
  confidence: high

- id: flag-lens-decent-high-risk-density-areas
  lens: lens-decentralized-onsite
  flag_name: Dense onsite development in highly vulnerable areas
  severity: specialist
  evidence_cue: Many onsite systems in areas with shallow groundwater, karst, or near drinking-water intakes, with limited additional protections.
  why_it_matters: safety
  resolution_path: Prioritize management, monitoring, upgrades, or sewer extensions in these areas based on vulnerability assessments.
  regulatory_environment_2025_specific: false
  applies_to_subcase: null
  source: https://www.epa.gov/sites/default/files/2015-06/documents/2005_12_20_septics_onsite_handbook_fs.pdf
  confidence: medium

- id: flag-lens-decent-no-sustainable-financing
  lens: lens-decentralized-onsite
  flag_name: No sustainable financing for decentralized management
  severity: attention
  evidence_cue: Management expectations exist but there is no stable fee, assessment, or funding mechanism to support inspections, upgrades, or RMEs.
  why_it_matters: commercial
  resolution_path: Develop and implement sustainable funding tools (fees, assessments, grants) consistent with EPA decentralized management models.
  regulatory_environment_2025_specific: false
  applies_to_subcase: subcase-decent-rme-advanced
  source: https://www.epa.gov/small-and-rural-wastewater-systems/about-small-wastewater-systems
  confidence: medium

- id: flag-lens-decent-legacy-unpermitted-clusters
  lens: lens-decentralized-onsite
  flag_name: Large clusters of unpermitted or legacy onsite systems
  severity: specialist
  evidence_cue: Known neighborhoods or developments with many legacy systems lacking permits, records, or inspections.
  why_it_matters: safety
  resolution_path: Prioritize inventory, inspection, and potential upgrades or sewer extensions for legacy clusters.
  regulatory_environment_2025_specific: false
  applies_to_subcase: subcase-decent-community
  source: https://www.epa.gov/sites/default/files/2015-06/documents/2005_12_20_septics_onsite_handbook_fs.pdf
  confidence: medium
```

<span style="display:none">[^1][^2]</span>

<div align="center">⁂</div>

[^1]: Perplexity-Research-B.md

[^2]: research-b-coverage-completion-2.md

