---
workstream: water-evidence-document-landscape
version: 1.0
generated_date: 2026-05-13
geographic_scope: US-50-states
language: en-US
deep_research_platform: Perplexity
document_type_count: 32
source_count: 34
coverage_self_assessment:
  overall: high
  notable_gaps:
    - "Limited direct access to paywalled WEF/AWWA manuals and proprietary consulting templates; operator-wisdom patterns inferred from accessible summaries and case material."
    - "State-by-state variability in permit formats, enforcement portals, and PFAS/biosolids rules represented by canonical examples rather than an exhaustive 50-state survey."
---

# Water Evidence Document Landscape for US Wastewater Discovery

## Executive Synthesis

Field business-development representatives working US wastewater opportunities see the same recurring stack of formal documents across municipal, industrial, reuse, non-revenue water, biosolids, stormwater, and decentralized contexts, even though formats and issuing authorities vary by state and program.[source: https://www.epa.gov/npdes][source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set]  This work catalogs 32 high-frequency document types across 12 categories and encodes operator-grade reading discipline so an AI agent can treat each as structured evidence rather than as unstructured PDFs.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual]  The inventory spans regulatory permits and fact sheets, monitoring and eDMR records, enforcement artefacts, lab and PFAS analytical reports, operational and capacity studies, utility-side planning documents, reuse and stormwater program plans, biosolids reporting packages, decentralized permits, sustainability disclosures, and funding agreements.[source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting][source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition]

For each major document type, Section 2 specifies six things the agent must internalize: where the document comes from and how it is accessed; the structured fields to extract; cross-checks against other documents and customer statements; operator-wisdom reading discipline that goes beyond table scraping; common gotchas and limits; and what typically gets lost when customers only provide summaries.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://www.epa.gov/cwa-methods/approved-cwa-test-methods-questions-and-answers]  Applying the operator-wisdom test, every reading-discipline subsection is anchored in how senior permit writers, pretreatment auditors, biosolids program leads, reuse directors, NRW specialists, MS4 managers, and decentralized program heads actually use these artefacts rather than in textbook descriptions.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition][source: https://www.epa.gov/npdesstormwater-discharges-municipal-sources]

Sections 3–5 connect this document inventory back to Research A and Research B.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set][source: https://www.epa.gov/ecfr]  Section 3 defines a cross-document evidence matrix for six high-stakes claims—NPDES compliance posture, PFAS exposure, capacity adequacy, biosolids outlet viability, reuse project viability, and NRW programme maturity—specifying the minimum and ideal evidence set for each so the agent neither over-requests nor underpins opinions with a single artefact.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition]  Section 4 maps the Research A compliance-and-safety flags to one or more document types, ensuring that every cross-cutting flag—including NOV-without-corrective-action, PFAS-driven biosolids bans, DPR log-removal failures, MS4 consent-decree noncompliance, and decentralized drinking-water contamination—has at least one concrete documentary evidence path.[source: https://www.epa.gov/enforcement/enforcement-basic-information][source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation][source: https://www.epa.gov/septic/septic-system-impacts-water-sources]

Section 5 aligns the 32 document types to the seven specialist lenses from Research B, specifying canonical first-call asks that are realistic in a first Discovery conversation and a deeper second-wave set that surfaces only once trust is established.[source: https://www.epa.gov/npdes/municipal-wastewater][source: https://www.epa.gov/npdes/national-pretreatment-program-overview]  Each lens—municipal wet-weather, industrial discharge, advanced reuse, NRW, biosolids and residuals, stormwater/MS4, and decentralized/onsite—ends up with at least four first-call documents that the agent can confidently request while keeping conversation friction manageable.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition][source: https://www.epa.gov/biosolids/land-application-biosolids]

The Structured Knowledge Annex then hard-codes four YAML artefact types for direct use by the agent: document type specifications with extraction fields and operator insights (Artefact 1); cross-check patterns that tell the agent how to compare documents and what conflicts mean (Artefact 2); high-stakes claim evidence sets (Artefact 3); and document-to-flag mappings that tie each Research A flag to at least one document and an evidence pattern in that document (Artefact 4).[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set]  Together, these artefacts let the Discovery agent route from conversational claims to specific documentary asks, read each artefact with operator-level discipline, and surface the right flags with clear justification rather than opaque heuristics.[source: https://www.epa.gov/npdes][source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting]

## Methodology and Source Quality

The inventory starts from the Research C prompt’s candidate list and is cross-checked against EPA Office of Water program pages for NPDES, pretreatment, MS4, biosolids, reuse, and decentralized systems, which together define the canonical federal document structures and reporting obligations.[source: https://www.epa.gov/npdes][source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting]  Additional depth comes from EPA’s NPDES Permit Writers’ Manual, pretreatment audit checklists under 40 CFR 403, WET methods guidance, and e-reporting documentation for eDMR and ICIS-NPDES.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://www.epa.gov/cwa-methods/whole-effluent-toxicity-methods][source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set]

Operator-wisdom content—how senior readers actually use these documents—is inferred from a mix of WEF and AWWA manual descriptions, Water Research Foundation case studies, MS4 and decentralized program handbooks, and state guidance on water audits, stormwater SWMPs, and decentralized management.[source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition][source: https://swefc.unm.edu/wlswitchboard/resource/m36-water-audits-and-loss-control-programs-4th-edition/][source: https://www.epa.gov/small-and-rural-wastewater-systems/about-small-wastewater-systems]  Because full manuals are typically paywalled, the reading-discipline sections rely on publicly available overviews, tables of contents, summaries, and consent-decree case material to reconstruct what experienced practitioners actually scan for when they open each document.[source: https://www.epa.gov/npdes/municipal-wastewater][source: https://www.epa.gov/npdes/stormwater-discharges-municipal-sources][source: https://www.waterrf.org/case-studies]

Regulatory currency is aligned with the 2025 environment by checking key references—PFAS National Primary Drinking Water Regulation, coal combustion residuals legacy impoundment rule, and updated electronic reporting rules—against Federal Register and eCFR entries.[source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation][source: https://www.epa.gov/coal-combustion-residuals/final-rule-legacy-coal-combustion-residuals-surface-impoundments-and-ccr][source: https://www.law.cornell.edu/cfr/text/40/122.21]  Where state examples are used—for PFAS-driven biosolids bans or MS4 annual reporting expectations—the document is explicit that these are representative patterns rather than a 50-state rule digest.[source: https://www.nebiosolids.org/maine-bans-land-application][source: https://epa.illinois.gov/topics/forms/water-permits/storm-water/ms4.html]

Throughout, the operator-wisdom test is applied to every reading-discipline section: each subsection had to answer “what does a senior operator turn to first, what do they treat as negotiable versus hard, and what do they distrust” rather than restating regulatory text.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition]  Any field or cross-check that could not be anchored in a real document specification, guidance note, or case-study pattern was dropped rather than speculatively invented.[source: https://www.epa.gov/cwa-methods/approved-cwa-test-methods-questions-and-answers][source: https://www.waterrf.org/case-studies]

## 1. The Document Inventory — Comprehensive Catalogue

### 1.1 Regulatory Documents

**NPDES wastewater discharge permits (individual POTW and industrial).** These are legally binding permits issued by EPA or authorized states under 40 CFR 122 that specify effluent limits, monitoring requirements, and standard and special conditions for point-source dischargers.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://www.law.cornell.edu/cfr/text/40/122.21]  They normally include facility information, outfall identifiers, technology-based and water-quality-based limits, monitoring frequencies, reporting provisions, and reopener and modification clauses.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual]  Access is primarily via customer-provided copies, state permit search portals, or EPA’s ICIS-NPDES data, with some states still providing scanned PDFs linked from public notices.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set][source: https://www.epa.gov/npdes]

**NPDES permit fact sheets and statements of basis.** For major permits, EPA requires a fact sheet explaining the rationale for each limit, including whether it is technology- or water-quality-based, any mixing-zone assumptions, and how effluent guidelines, TMDLs, or antidegradation policies were applied.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://www.ecfr.gov/current/title-40/chapter-I/subchapter-D/part-124]  Permit writers’ manuals explicitly instruct permit writers to document important decisions here, making fact sheets the primary place where a senior operator learns which limits are negotiable at renewal and which are effectively fixed by water-quality standards.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual]  Fact sheets are typically co-published with permits in state or EPA online repositories; customers often forward them alongside permits only when asked.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set]

**State NPDES-equivalent permits (e.g., TPDES).** In delegated states, state-branded permits implement NPDES requirements but use state numbering and formatting conventions; key content—limits, monitoring, conditions—remains aligned with 40 CFR 122.[source: https://www.epa.gov/npdes/npdes-authorized-states][source: https://www.law.cornell.edu/cfr/text/40/122.21]  State environmental agencies typically host searchable permit databases and general permits for POTWs, MS4s, and industrial sectors.[source: https://epa.illinois.gov/topics/forms/water-permits/storm-water/ms4.html]  The agent should treat state permits as first-class regulatory documents while recognizing that parameter naming, units, and layout can diverge from federal examples.

**POTW industrial pretreatment permits and control mechanisms.** Under the national pretreatment program in 40 CFR 403, POTW control authorities issue control mechanisms to significant industrial users specifying local limits, categorical standards, monitoring, and reporting requirements.[source: https://www.epa.gov/npdes/national-pretreatment-program-overview][source: https://www.law.cornell.edu/cfr/text/40/part-403]  These documents often sit in local pretreatment files rather than central EPA databases, so they are usually obtained from customers or POTW pretreatment coordinators.[source: https://www.epa.gov/npdes/national-pretreatment-program-overview]  Their structure is less standardized than NPDES permits, making field-by-field extraction critical.

**Biosolids permits and land-application approvals (Part 503).** Biosolids land application, surface disposal, and incineration are regulated under 40 CFR 503, with some states issuing specific permits or approvals that incorporate pollutant, pathogen, and vector attraction limits and management practices.[source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting][source: https://www.law.cornell.edu/cfr/text/40/503]  Larger treatment works that land apply, incinerate, or surface dispose must file annual biosolids reports summarizing pollutant monitoring and management.[source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting]  These permits and reports are obtained via customers, state biosolids programs, or EPA’s biosolids reporting portal.

**Water reuse approvals and engineering report approvals (Title 22 and state reuse programs).** States with formal reuse programs, such as California’s Title 22 water recycling regulations, require engineering reports and operating plans for non-potable and potable reuse projects, which are reviewed and approved by state health or environmental agencies.[source: https://www.fluencecorp.com/california-title-22-water-reuse-standards][source: https://watereuse.org/ca-dpr-take-effect]  Approvals may be embedded in permits or stand-alone letters referencing the engineering report; access is usually via the customer’s project files or state reuse program archives.[source: https://www.ocwd.com/gwrs]

**MS4 general or individual permits.** Municipal separate storm sewer systems operate under MS4 permits that require implementation of six minimum control measures, annual reporting, and in some cases TMDL-driven retrofits.[source: https://www.epa.gov/npdes/stormwater-discharges-municipal-sources][source: https://epa.illinois.gov/topics/forms/water-permits/storm-water/ms4.html]  MS4 permits are typically available from state stormwater program sites, with general permits published once and Notices of Intent (NOIs) and annual reports posted by permittees.[source: https://epa.illinois.gov/topics/forms/water-permits/storm-water/ms4.html]

**Air permits where wastewater treatment drives air emissions.** Co-located incinerators, thermal dryers, and some odor control systems operate under air permits that may constrain solids handling, thermal processes, and stack emissions.[source: https://www.epa.gov/air-emissions-factors-and-quantification]  These are usually state air permits accessed via customers or public permit databases; the wastewater agent mainly needs high-level conditions that influence solids and process design.

**RCRA permits where wastewater intersects hazardous waste.** Surface impoundments, tank systems, and dewatering operations handling hazardous wastestreams may operate under RCRA permits or closure plans that constrain how wastewater residuals are managed.[source: https://www.epa.gov/hwpermitting/hazardous-waste-permitting]  These documents are commonly accessed via customers, state waste programs, or, in some cases, court or enforcement records.

### 1.2 Monitoring and Compliance Records

**Discharge Monitoring Reports (DMR/eDMR).** DMRs are periodic reports required by NPDES permits that summarize effluent monitoring results, typically submitted electronically via NetDMR or state systems and stored in ICIS-NPDES.[source: https://www.epa.gov/npdes/compliance-reporting][source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set]  They contain parameter-level results, statistical summaries (e.g., daily max, monthly average), violation codes, and “no data” indicators where sampling did not occur.[source: https://www.deq.louisiana.gov/assets/docs/NetDMR/Useful_Information.pdf][source: https://www.stevensehs.com/wastewater-and-stormwater-compliance/discharge-monitoring-report-dmr/]  Customers may provide PDF exports, while agents can cross-check against ECHO summaries.

**Self-monitoring reports for industrial users.** Significant industrial users often submit self-monitoring reports (SMRs) or equivalent forms directly to POTW pretreatment programs documenting compliance with local limits and categorical standards.[source: https://www.epa.gov/npdes/national-pretreatment-program-overview][source: https://www.law.cornell.edu/cfr/text/40/403.12]  Formats vary by control authority but generally include sample results, flow, and certification statements; they are usually accessed from customers or POTW pretreatment staff.

**Slug discharge and upset reports.** Pretreatment regulations require industrial users to report slug discharges and upsets that may cause interference or pass-through at the POTW, often via narrative incident reports or special forms.[source: https://www.law.cornell.edu/cfr/text/40/403.8]  These are customer- or POTW-held documents that reveal worst-day behavior not evident in averaged monitoring.

**Permit-exceedance and noncompliance notifications.** Many permits require 24-hour or 5-day written notifications for certain violations or upsets, often sent as letters or NetDMR attachments and logged in enforcement files.[source: https://www.epa.gov/npdes/npdes-regulations][source: https://portal.ct.gov/-/media/DEEP/water_regulating_and_discharges/industrial_wastewater/NetDMR/FinalEPAandCTaddingandNamingAtta]  Customers sometimes summarize these; operators know to ask for the actual notices, which include dates, parameters, and corrective actions.

**Regulatory inspection and audit reports (EPA, state, POTW).** POTW pretreatment audits and inspections use structured checklists to evaluate compliance with 40 CFR 403 requirements, often generating reports with detailed findings and required corrective actions.[source: https://www.epa.gov/system/files/documents/2021-07/final_pca_checklist_and_instructions_-feb2010.pdf]  State and EPA NPDES inspections similarly produce reports on sampling, operation, and record-keeping; these are typically accessed via customers or, sometimes, state enforcement portals.

**ECHO compliance summaries.** EPA’s ECHO system publishes facility-level compliance and enforcement summaries for NPDES permits, including effluent violation history, significant noncompliance periods, and enforcement actions.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set]  These summaries are public and give the agent an independent view of compliance posture that can be cross-checked against customer claims.

### 1.3 Enforcement Records

**Notices of Violation (NOVs).** NOVs are formal enforcement documents issued by EPA or states when regulators identify significant noncompliance with NPDES, pretreatment, biosolids, or MS4 requirements.[source: https://www.epa.gov/enforcement/enforcement-basic-information]  They describe the violation, cite applicable regulations, and may specify required corrective actions and timelines; customers may have copies, and some NOV information appears in ECHO.

**Administrative orders and administrative consent agreements.** These enforcement instruments often require specific projects, operational changes, or monitoring and reporting enhancements, and may be precursors to or alternatives to judicial consent decrees.[source: https://www.epa.gov/enforcement/enforcement-basic-information]  Documents are accessed via customer legal or compliance teams, with some summary information in public enforcement dockets.

**Civil judicial consent decrees and settlement agreements.** For CSO, SSO, MS4, and some industrial cases, utilities and companies enter into court-approved consent decrees that set binding project schedules, performance metrics, and reporting obligations.[source: https://www.msdprojectwin.org/about-us/federal-consent-decree][source: https://www.govinfo.gov/content/pkg/FR-2020-12-16/html/2020-27680.htm]  Senior operators treat the decree and associated long-term control plans as the “real plan” for wet-weather and infrastructure commitments; these are publicly available through court or EPA repositories.

**Penalty assessments and compliance orders.** Final orders imposing penalties and requiring specific corrective actions are often accessible via state enforcement databases or customer legal files, and provide concrete signals about regulatory tolerance and recent compliance history.[source: https://www.epa.gov/enforcement/enforcement-basic-information]

### 1.4 Lab Analyses and Analytical Data

**Routine lab analytical reports (permit-required parameters).** Compliance and process control sampling uses EPA-approved methods under 40 CFR 136 and related guidance, with lab reports presenting methods, detection limits, QA/QC, and sample results.[source: https://www.epa.gov/cwa-methods/approved-cwa-test-methods-questions-and-answers][source: https://www.law.cornell.edu/cfr/text/40/136.3]  Senior readers prioritize method codes, detection limits, QA flags, and whether the method aligns with permit requirements before trusting numeric values.

**Whole Effluent Toxicity (WET) test reports.** WET tests measure aggregate toxicity using standardized acute and chronic methods specifying multiple effluent dilutions and test organisms, with methods codified in 40 CFR 136.3 and detailed EPA guidance.[source: https://www.epa.gov/cwa-methods/whole-effluent-toxicity-methods]  WET reports include test design, organism performance, endpoints, and pass/fail determinations; operators know to verify test acceptability criteria before using results to infer process performance.[source: https://www.epa.gov/cwa-methods/whole-effluent-toxicity-methods]

**PFAS analytical reports (e.g., EPA Method 1633 and drinking-water methods 533/537.1).** EPA Method 1633 provides a draft multi-matrix method for up to 40 PFAS in non-potable water, solids, leachate, and biota, while drinking-water methods 533 and 537.1 cover subsets of PFAS in potable water.[source: https://www.epa.gov/cwa-methods/draft-epa-method-1633-pfas][source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation][source: https://pfas.com/pfas-matrices/wastewater-sludge-biosolids/]  Reports specify method, analyte list, detection limits, and QA/QC; operator-grade reading discipline requires noting which method was used, since results from different methods and matrices are not directly comparable.[source: https://www.epa.gov/cwa-methods/approved-cwa-test-methods-questions-and-answers]

**1,4-dioxane and other emerging contaminant reports.** Utilities and industrial dischargers may commission targeted analyses for 1,4-dioxane and similar contaminants using EPA-approved or state-accepted methods; these reports are accessed via customers and are often used in reuse, groundwater, or source-water protection contexts.[source: https://www.epa.gov/dwstandardsregulations/chemical-contaminant-rules]  Senior readers check whether method sensitivity and reporting limits are aligned with health advisories or state criteria.

**TCLP/SPLP results for waste and residuals.** Toxicity Characteristic Leaching Procedure (TCLP) and Synthetic Precipitation Leaching Procedure (SPLP) tests are used to characterize solid wastes and residuals for disposal and beneficial-use decisions.[source: https://www.epa.gov/hw-sw846/sw-846-test-method-1311-toxicity-characteristic-leaching-procedure]  Results influence biosolids outlets, monofill strategies, and co-managed CCR-residual decisions, so the agent must capture parameter-level results and test conditions.

**Biosolids analytical reports (metals, nutrients, pathogens, vector attraction).** Part 503 requires biosolids programs to monitor regulated pollutants, pathogen indicators, and vector attraction reduction parameters, with results summarized in annual biosolids reports and underlying lab certificates.[source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting][source: https://www.law.cornell.edu/cfr/text/40/503]  Operator readers focus on trends and peaks in metals and key co-contaminants, PFAS where available, and classification thresholds for Class A or B determinations.[source: https://www.epa.gov/biosolids/land-application-biosolids]

**Source-water and feedwater quality reports for reuse.** Utilities preparing for advanced reuse compile baseline groundwater, surface water, or imported water quality data, often drawing on monitoring networks and prior studies.[source: https://watereuse.org/ca-dpr-take-effect][source: https://www.ocwd.com/gwrs]  These documents inform treatment-train design and environmental buffer performance assessments and are typically provided by customers or drawn from state water-resource data portals.

### 1.5 Operational Records

**Process flow diagrams (PFDs) and hydraulic profiles.** PFDs and hydraulic profiles show unit processes, flow splits, bypasses, and control points, and are standard outputs of design reports and optimization studies for wastewater treatment plants.[source: https://www.abebooks.co.uk/9780071663588/Design-Municipal-Wastewater-Treatment-Plants-0071663584/plp]  Senior operators use them to understand bottlenecks, bypass routing, and where sampling points sit relative to process units.

**Water balance studies and I/I studies.** Water balance and infiltration/inflow (I/I) studies quantify how much flow is attributable to groundwater and stormwater intrusion versus base sanitary load, typically combining flow monitoring, rainfall data, and hydraulic modeling.[source: https://www.lgean.net/water/wastewater.php][source: https://www.epa.gov/npdes/collection-systems]  These studies are usually customer-provided engineering reports; operators immediately look for where hydraulic constraints and wet-weather bottlenecks are documented.

**Sampling plans, SOPs, and monitoring plans.** Many permits and engineering studies come with formal sampling and monitoring plans that describe parameters, locations, frequencies, and methods.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://www.epa.gov/cwa-methods/approved-cwa-test-methods-questions-and-answers]  These plans are critical for interpreting whether reported data adequately represent worst-case and design conditions.

**Daily operations logs and SCADA exports.** Operational logs and SCADA trends capture flows, process settings, alarms, and outages over time and are typically internal documents not available via public databases.[source: https://www.epa.gov/npdes/municipal-wastewater]  Senior operators use them to reconstruct “worst days,” verify customer narratives, and understand operational flexibility and resilience.

**Sludge generation and disposal manifests.** Manifests document volumes, destinations, and handling of sludge and residuals sent to land application, composting, landfills, or monofills, often integrating with biosolids reporting and CCR management where relevant.[source: https://www.epa.gov/biosolids/land-application-biosolids][source: https://www.epa.gov/coal-combustion-residuals/final-rule-legacy-coal-combustion-residuals-surface-impoundments-and-ccr]  The agent uses them to cross-check outlet diversity and exposure to PFAS or CCR-related constraints.

**Incident reports (overflows, bypasses, upsets).** Utilities and industrial facilities typically use internal incident report forms to document SSOs, CSOs, bypass events, equipment failures, and safety incidents.[source: https://www.epa.gov/npdes/collection-systems]  These are often more candid than external reports and reveal root causes and repeat patterns that senior readers look for.

**Capacity assessments and optimization studies.** Capacity and optimization reports, including energy and process optimization studies, document how close facilities are to design capacity and identify recommended upgrades or operational changes.[source: https://www.abebooks.co.uk/9780071663588/Design-Municipal-Wastewater-Treatment-Plants-0071663584/plp][source: https://www.waterrf.org/case-studies]  Operators read executive summaries for constraints, but know to verify whether recommendations were actually implemented.

### 1.6 Utility-Side Documents

**AWWA M36 water audits and NRW reports.** AWWA’s M36 methodology and Free Water Audit Software define a standard for quantifying non-revenue water, data validity scores, and apparent and real loss components.[source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition][source: https://swefc.unm.edu/wlswitchboard/resource/m36-water-audits-and-loss-control-programs-4th-edition/]  Completed audit workbooks and summary reports are usually customer-provided and form the core evidence for NRW programme maturity.

**Master plans and integrated resource plans.** Wastewater, water, and integrated water resource master plans outline long-term demand projections, regulatory drivers, project portfolios, and phasing.[source: https://www.waterrf.org/case-studies]  Senior readers treat master plans older than about five years as potentially out of date for demand and capex estimates, but still valuable for understanding planned directions and constraints.

**Capital improvement plans (CIPs) and rate studies.** CIPs and rate orders link major projects to timelines and funding, often highlighting consent-decree or compliance-driven investments and differentiating between funded and unfunded needs.[source: https://www.waterrf.org/case-studies][source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water]  These documents are customer-provided and essential for evaluating whether identified capacity, wet-weather, or biosolids risks have credible funding paths.

**Asset management plans and condition assessments.** Asset management plans compile condition ratings, risk scores, and renewal plans for critical assets, drawing on inspections, failure history, and consequence-of-failure analyses.[source: https://www.epa.gov/sustainable-water-infrastructure/asset-management-water-and-wastewater-utilities]  Senior operators look for whether high-risk assets tied to treatment and wet-weather performance have funded renewal strategies.

**Customer billing and consumption studies.** Billing data and consumption studies are central to NRW work and also inform wastewater flow projections and affordability discussions.[source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition]  These are customer-internal datasets but are often summarized in rate cases and NRW reports.

### 1.7 Reuse-Specific Documents

**Reuse project engineering reports (Title 22/DPR engineering reports).** Engineering reports for reuse projects describe proposed treatment trains, log-removal credits, monitoring and control strategies, and environmental buffers, and are required for regulatory approvals in California and other reuse-leading states.[source: https://www.fluencecorp.com/california-title-22-water-reuse-standards][source: https://watereuse.org/ca-dpr-take-effect]  Regulators and senior practitioners treat these as the primary technical dossier for assessing reuse viability and safeguards.

**Reuse operations plans and O&M manuals.** Operations plans describe staffing, training, maintenance, and abnormal-event response for reuse facilities, often required as permit conditions.[source: https://www.ocwd.com/gwrs]  Senior readers look for how log-removal performance is maintained and verified under real operating conditions.

**Source-control and feedwater protection program documents.** For potable reuse and sensitive non-potable uses, utilities develop source-control programs and watershed protection plans to manage upstream industrial and non-point loads.[source: https://watereuse.org/ca-dpr-take-effect]  These documents interact with pretreatment and stormwater programs and are accessed via customers or state reuse program documentation.

**Public outreach and acceptance studies.** Reuse projects often commission surveys, focus groups, and outreach plans to manage public perceptions, which are central to project viability even when technical criteria are met.[source: https://www.waterrf.org/research-topics/reuse][source: https://www.ocwd.com/gwrs]  Senior reuse practitioners read these to judge political feasibility and messaging risks.

### 1.8 Stormwater-Specific Documents

**Stormwater Management Programs (SWMPs) and MS4 program plans.** SWMPs describe how MS4s implement minimum control measures, monitoring, and TMDL-driven actions under their permits.[source: https://www.epa.gov/npdes/stormwater-discharges-municipal-sources][source: https://epa.illinois.gov/topics/forms/water-permits/storm-water/ms4.html]  Plans include programmatic and structural BMPs, implementation schedules, and roles and responsibilities.

**MS4 annual reports.** MS4 annual reports document implementation progress, monitoring results, and upcoming activities, and are required annually in many permits.[source: https://epa.illinois.gov/topics/forms/water-permits/storm-water/ms4.html]  Experienced MS4 managers and auditors focus on trends in implementation and any noted deficiencies or enforcement interactions.

**Illicit discharge detection and elimination (IDDE) records.** IDDE programs maintain records of investigations, identified illicit connections, and corrective actions, providing evidence of how well the MS4 controls high-risk discharges.[source: https://www.epa.gov/npdes/stormwater-discharges-municipal-sources]  These records are usually internal but may be summarized in annual reports.

**Post-construction stormwater control inventories and TMDL implementation plans.** Many MS4 permits require inventories of structural BMPs and watershed-specific implementation plans for TMDL load reductions.[source: https://www.epa.gov/npdes/stormwater-discharges-municipal-sources][source: https://www.epa.gov/npdes/stormwater-discharges-municipal-sources-developing-ms4-program]  These documents are public or customer-provided and are central to assessing retrofit needs and funding gaps.

### 1.9 Biosolids-Specific Documents

**Biosolids annual reports and supporting data.** Biosolids annual reports required under Part 503 summarize pollutant monitoring, pathogen and vector attraction data, management practices, and land-application or disposal volumes.[source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting][source: https://www.law.cornell.edu/cfr/text/40/503]  They may be submitted via EPA’s biosolids reporting system or state portals and are primary compliance artefacts.[source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting]

**Land-application notifications and site records.** Many states require site-specific land-application notifications, maps, and receiving-site records documenting agronomic rates, restrictions, and landowner agreements.[source: https://www.epa.gov/biosolids/land-application-biosolids]  These are held by utilities, contractors, or state programs and are crucial when evaluating outlet diversity and exposure to PFAS-driven bans.

**Class A/B determination documentation.** Documentation supporting Class A or B classification, including process descriptions and validation data for pathogen and vector reduction, is often prepared by consultants and reviewed by regulators.[source: https://www.ecfr.gov/current/title-40/chapter-I/subchapter-O/part-503]  Senior biosolids leads review these to understand process flexibility and compliance margins.

### 1.10 Decentralized-Specific Documents

**Onsite and decentralized system permits.** County and state health or environmental agencies issue permits for septic systems, advanced onsite units, and clustered systems, specifying siting, design, and sometimes maintenance requirements.[source: https://www.epa.gov/small-and-rural-wastewater-systems/about-small-wastewater-systems]  Records are often fragmented across local agencies, and many legacy systems have paper-only files.

**System inspection and maintenance reports.** Inspection and pump-out records document whether onsite systems are functioning and maintained, and may be tracked in decentralized program databases or paper logs.[source: https://www.epa.gov/septic/septic-system-impacts-water-sources]  Senior decentralized program managers look for failure rates, recurring problem areas, and links to surface or groundwater impacts.

**Cluster system management plans and RME documentation.** Responsible management entities (RMEs) and similar structures manage advanced and clustered systems under formal management plans and legal agreements.[source: https://www.epa.gov/small-and-rural-wastewater-systems/about-small-wastewater-systems]  These documents define inspection frequencies, funding mechanisms, and enforcement tools.

**Septage hauler manifests and disposal records.** Hauler manifests document pumping, transport, and disposal or treatment of septage, linking decentralized systems to receiving facilities and biosolids programs.[source: https://www.epa.gov/septic/septic-system-impacts-water-sources]  Senior readers use them to understand pathways from onsite failures to centralized systems and biosolids outlets.

### 1.11 Sustainability and ESG Disclosures

**CDP Water Security responses.** Companies and utilities report water-related risks, opportunities, and performance via CDP questionnaires, which include qualitative and quantitative disclosures on wastewater and reuse.[source: https://www.cdp.net/en/guidance/guidance-for-companies/water-security-questionnaire]  Senior practitioners treat these as positioning documents—useful for capturing commitments and reputational stakes but not as primary performance evidence.

**SEC and voluntary sustainability/ESG reports.** Public companies increasingly disclose water-related capex, risks, and metrics in SEC filings and voluntary ESG reports, particularly under emerging climate and ESG disclosure frameworks.[source: https://www.sec.gov/news/press-release/2024-31]  Wastewater-related content is usually high-level and must be cross-checked against permits, monitoring, and enforcement records.

**Utility sustainability and climate reports.** Utilities publish sustainability and climate action plans summarizing greenhouse gas, energy, water reuse, and resilience efforts that often reference wastewater projects, biosolids outlets, and PFAS responses.[source: https://www.waterrf.org/case-studies]  Senior utility operators use these to understand board-level commitments that may drive future projects, while discounting unaudited metrics.

### 1.12 Funding Documents

**CWSRF/DWSRF and WIFIA financing agreements.** Clean Water and Drinking Water State Revolving Fund and WIFIA agreements define project scopes, eligible costs, milestones, and reporting conditions for major wastewater, stormwater, and reuse investments.[source: https://www.epa.gov/dwsrf][source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water]  Senior operators and finance staff treat these as binding constraints on project phasing and scope; Discovery agents should recognize when an opportunity is embedded in an existing funded project.

**Emerging contaminant and PFAS-focused grants.** IIJA and related programs provide targeted grants for emerging contaminants, including PFAS, often with specific reporting and schedule requirements.[source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water]  Funding documents are customer-provided but may be cross-checked against EPA or state grant announcements.

**Bond prospectuses and rate case filings (wastewater-relevant portions).** Where bond or rate case documents explicitly reference wastewater projects, consent decrees, or PFAS/biosolids risks, they provide additional evidence about project timing and financial constraints.[source: https://www.waterrf.org/case-studies]  The agent should treat them as secondary evidence supporting primary regulatory and technical documents.

## 2. Per-Document Reading Discipline

### 2.1 NPDES Permits (Individual)

**What the document is and who issues it.** Individual NPDES permits are facility-specific licenses issued by EPA or authorized states that define legal conditions for discharging pollutants from POTWs and industrial facilities to waters of the United States under the Clean Water Act.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://www.law.cornell.edu/cfr/text/40/122]  They integrate technology-based effluent limits derived from effluent guidelines with water-quality-based limits needed to meet state standards and TMDLs.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual]

**How the agent gets it.** The most reliable path is a customer-provided electronic copy, ideally including both permit and fact sheet; public copies can often be retrieved via state permit databases or EPA’s ICIS-NPDES permit downloads if the permit number is known.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set][source: https://www.epa.gov/npdes]  If only a permit number or facility name is available, the agent can search state or EPA portals and then ask the customer to verify that the retrieved version is the current effective permit.

**Structured data fields to extract.** At minimum, the agent should extract permit number; issuing authority; effective and expiration dates; facility name and address; SIC/NAICS and facility type; each outfall ID and receiving water; design flow; all parameters with effluent limits (including units, averaging periods, statistical bases, and separate acute/chronic or seasonal limits); monitoring locations and frequencies; reporting requirements; standard conditions; special conditions and schedules of compliance; and any explicit references to TMDLs, ELGs, or reuse/biosolids interactions.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://www.law.cornell.edu/cfr/text/40/122.44]  For CSO/SSO-bearing permits, the agent should also capture CSO outfall inventories, event control targets, and monitoring and reporting requirements.[source: https://www.epa.gov/npdes/combined-sewer-overflow-control-policy]

**Operationally useful cross-checks.** The agent should systematically compare permitted limits to recent DMR/eDMR data to determine margin to limits and any patterns of exceedance, cross-check against ECHO compliance status to validate self-reported compliance, and compare design flow and treatment configuration from PFDs and master plans to permitted flow and treatment descriptions.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set][source: https://www.stevensehs.com/wastewater-and-stormwater-compliance/discharge-monitoring-report-dmr/][source: https://www.abebooks.co.uk/9780071663588/Design-Municipal-Wastewater-Treatment-Plants-0071663584/plp]  The agent should also cross-check permit limits and conditions against enforcement records and consent decrees, since decrees may impose more stringent or schedule-driven expectations than the base permit text.[source: https://www.msdprojectwin.org/about-us/federal-consent-decree]

**Operator-wisdom reading insights.** Senior permit readers scan the cover page to confirm effective and expiration dates and look for whether the permit is administratively continued, because that sets the context for permit-renewal risk and opportunity.[source: https://www.law.cornell.edu/cfr/text/40/122.21]  They then jump to effluent limit tables, scanning for parameters with tight margins or new limits (e.g., ammonia, nutrients, WET) and cross-reference these against fact sheet rationales to understand whether limits are technology- or water-quality-based and how negotiable they might be at renewal.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual]  Experienced operators also pay attention to special conditions—such as requirements to develop pretreatment programs, implement capacity management, or complete reuse or biosolids studies—because these frequently connect directly to capital projects and consent-decree milestones.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual]

**Common gotchas and limitations.** Permits can lag reality: administratively continued permits may not yet reflect tighter WQ standards, revised ELGs, or PFAS and nutrient policy changes, so reading them without checking renewal status can understate upcoming risk.[source: https://www.law.cornell.edu/cfr/text/40/122.21][source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water]  Parameter listings may omit pollutants of emerging concern that are nonetheless monitored or negotiated outside the permit (e.g., PFAS, 1,4-dioxane), and some states consolidate industrial sector limits in general permits, meaning individual facility permits are only part of the picture.[source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation][source: https://www.epa.gov/npdes/npdes-general-permit-program]

**What gets lost in summaries.** Customer summaries of permits usually include only a handful of parameters and headline limits, often omitting monitoring frequency, reporting conditions, compliance schedules, and special conditions tied to pretreatment, wet-weather, or reuse obligations.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual]  Summaries almost never capture whether limits are technology- versus water-quality-driven or the basis of mixing zones, so they obscure negotiability and fail to show how close operations are to the edges of permit expectations.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual]

### 2.2 NPDES Permit Fact Sheets

**What the document is and who issues it.** Fact sheets and statements of basis are explanatory documents that accompany draft and final NPDES permits for major facilities, written by permit writers to describe how limits and conditions were derived.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://www.ecfr.gov/current/title-40/chapter-I/subchapter-D/part-124]  They are produced by the same permitting authorities that issue the permits and become part of the public administrative record.

**How the agent gets it.** Fact sheets are usually posted alongside draft or final permits on state or EPA websites, but they are frequently omitted from customer document packets unless explicitly requested.[source: https://www.epa.gov/npdes]  The agent should treat absence of a fact sheet as a retrieval gap to be closed via public search or direct customer request.

**Structured data fields to extract.** Key fields include references to applicable effluent guidelines and their implementation, identification of water-quality standards, TMDLs, and mixing-zone assumptions; identification of technology-based versus water-quality-based limits; critical design flows and receiving-water characteristics; and explanations for any variances, alternate limits, or special conditions.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual]  Extracting these as structured fields allows the agent to reason about why each limit exists and what changes might trigger modifications.

**Operationally useful cross-checks.** The fact sheet’s explanation of basis-of-limit should be compared against current regulatory context (e.g., updated ELGs, PFAS NPDWR, new TMDLs) to determine whether the rationale is still current.[source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation][source: https://www.epa.gov/eg/effluent-guidelines]  It should also be cross-checked with master plans and optimization studies to see whether recommended upgrades or changes were actually pursued, and with enforcement records to see whether regulators later judged the permit’s assumptions unrealistic.[source: https://www.waterrf.org/case-studies][source: https://www.msdprojectwin.org/about-us/federal-consent-decree]

**Operator-wisdom reading insights.** Senior operators treat the fact sheet as a map of negotiability: technology-based limits anchored in ELGs are harder to move than site-specific water-quality-based limits tied to assumptions about mixing zones, background levels, or intake protection.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://www.ecfr.gov/current/title-40/chapter-I/subchapter-N]  They also look closely at the rationale for any schedules of compliance and special studies, because those sections often encode regulatory expectations for future capital projects and monitoring expansions.

**Common gotchas and limitations.** Fact sheets may be missing or dated compared with the currently effective permit, especially after minor modifications, and they rarely reflect evolving state policy or guidance on topics like PFAS or nutrients that may change between permit cycles.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation]  They also sometimes rely on simplified receiving-water models or incomplete industrial load assumptions, which experienced readers cross-check against actual monitoring and industrial inventories.

**What gets lost in summaries.** Customer summaries seldom mention whether limits are technology- versus water-quality-based or how much safety margin was assumed, and almost never capture TMDL allocations or narrative rationales for mixing zones and dilution factors.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual]  This means that “we can’t change this limit” or “this limit is conservative” claims cannot be trusted without reading the fact sheet itself.

### 2.3 eDMRs and Self-Monitoring Reports

**What the documents are and who issues them.** eDMRs and industrial SMRs are permittee-submitted monitoring reports that document actual discharge performance against permit limits, typically using EPA-approved methods under 40 CFR 136 and reported via NetDMR or local portals.[source: https://www.epa.gov/npdes/compliance-reporting][source: https://www.deq.louisiana.gov/assets/docs/NetDMR/Useful_Information.pdf]  POTWs and industrial facilities are the reporting entities, with data stored in ICIS-NPDES for NPDES permittees.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set]

**How the agent gets them.** Customers can export PDFs or spreadsheets of eDMRs from NetDMR or state systems, while the agent can retrieve summary data and, in some cases, parameter-level time series from ECHO.[source: https://www.deq.louisiana.gov/assets/docs/NetDMR/Useful_Information.pdf][source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set]  Industrial SMRs that go only to POTWs must be requested from customers or local pretreatment programs.

**Structured data fields to extract.** For each parameter at each outfall and monitoring location, the agent should extract sample dates, sample types (grab/composite), measured values, statistical summaries (max, min, average), detection flags, method codes where present, and violation indicators.[source: https://www.stevensehs.com/wastewater-and-stormwater-compliance/discharge-monitoring-report-dmr/][source: https://www.deq.louisiana.gov/assets/docs/NetDMR/Useful_Information.pdf]  For SMRs, the same fields apply, with additional attention to local limit comparisons.

**Operationally useful cross-checks.** eDMR data should be compared against permit limits to calculate frequency and magnitude of exceedances, cross-checked against ECHO significant noncompliance designations, and aligned with incident reports and enforcement records to see whether the worst events triggered appropriate follow-up.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set][source: https://www.epa.gov/enforcement/enforcement-basic-information]  The agent should also cross-check method codes and detection limits against lab reports and 40 CFR 136 requirements to identify method mismatches or insufficient sensitivity.[source: https://www.epa.gov/cwa-methods/approved-cwa-test-methods-questions-and-answers]

**Operator-wisdom reading insights.** Senior operators look for patterns rather than single months: chronic near-limit operation, seasonal peaks, and correlation with wet-weather or industrial production cycles matter more than isolated outliers.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual]  They also scan for data gaps, NODI codes, and sudden shifts in reported values or methods that might signal changes in processes, lab practices, or reporting discipline, and they routinely overlay DMR data with SCADA and incident logs to see whether data reflect real operations.[source: https://www.deq.louisiana.gov/assets/docs/NetDMR/Useful_Information.pdf][source: https://www.epa.gov/npdes/collection-systems]

**Common gotchas and limitations.** eDMRs are self-reported, and while they are subject to certification and enforcement, they can contain gaps, late submissions, and occasional under-reporting or misclassification.[source: https://www.epa.gov/npdes/npdes-regulations][source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set]  Some states also maintain separate portals or additional monitoring requirements that are not fully reflected in ICIS-NPDES, so ECHO alone is not a complete view of performance.

**What gets lost in summaries.** Customer-provided performance summaries often show only annual averages or compliance percentages, which can mask peak events, seasonal stress periods, and data gaps that matter for risk assessment and capacity planning.[source: https://www.stevensehs.com/wastewater-and-stormwater-compliance/discharge-monitoring-report-dmr/]  Summaries also rarely flag changes in methods or detection limits, which can make apparent trends misleading.

### 2.4 Consent Decrees and Settlement Agreements

**What the documents are and who issues them.** Consent decrees are judicially approved settlements between utilities or companies and regulators (and sometimes citizen groups) that set binding schedules and performance requirements for CSO, SSO, MS4, and other wastewater programs.[source: https://www.msdprojectwin.org/about-us/federal-consent-decree][source: https://www.govinfo.gov/content/pkg/FR-2020-12-16/html/2020-27680.htm]  Administrative settlement agreements similarly define obligations without court entry.

**How the agent gets them.** Decrees and many major settlement agreements are public, accessible via court records, utility websites, or EPA wet-weather enforcement pages, while customers typically have working copies and annual compliance reports.[source: https://www.msdprojectwin.org/about-us/federal-consent-decree][source: https://www.epa.gov/npdes/combined-sewer-overflow-control-policy]

**Structured data fields to extract.** For each decree, the agent should extract parties, effective date, scope (e.g., CSO, SSO, MS4), key project and program milestones with deadlines, stipulated penalty structures, required reports and monitoring, and any numeric performance targets (e.g., CSO capture percentages, overflow frequency limits).[source: https://www.govinfo.gov/content/pkg/FR-2020-12-16/html/2020-27680.htm][source: https://www.epa.gov/npdes/combined-sewer-overflow-control-policy]  From compliance reports, the agent should capture milestone status, variances, and identified risks.

**Operationally useful cross-checks.** Decree milestones and performance targets should be cross-checked against CIP documents and rate studies to see whether funding aligns with obligations, and against eDMR, CSO event, and MS4 annual reports to see whether on-the-ground performance matches commitments.[source: https://www.waterrf.org/case-studies][source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set][source: https://epa.illinois.gov/topics/forms/water-permits/storm-water/ms4.html]  The agent should also cross-check enforcement history for any indications that milestones have been missed or renegotiated.

**Operator-wisdom reading insights.** Senior operators view consent decrees as de facto strategic plans: they dictate which projects must happen, in what sequence, and by when, and often drive the entire capital program and performance narrative.[source: https://www.msdprojectwin.org/about-us/federal-consent-decree][source: https://www.epa.gov/npdes/combined-sewer-overflow-control-policy]  They read schedule tables and performance criteria first, then look at how adaptive-management provisions and force majeure clauses might affect future renegotiations.

**Common gotchas and limitations.** Decrees often reference “most recent annual report” or “latest modeling results” without embedding those details, so reading the decree alone can mislead on current status if compliance reports are missing.[source: https://www.govinfo.gov/content/pkg/FR-2020-12-16/html/2020-27680.htm]  Some utilities also achieve partial relief or schedule changes via court-approved modifications that are not obvious from the original decree, so the agent must verify whether a decree has been amended.

**What gets lost in summaries.** Customer summaries usually emphasize that “we are under a consent decree” or “on track,” but omit which milestones are at risk, which projects are critical path, and how penalties escalate if deadlines slip.[source: https://www.msdprojectwin.org/about-us/federal-consent-decree]  Summaries rarely capture subtle, but important, constraints like limits on interim bypassing or specific CSO performance metrics.

### 2.5 Notices of Violation

**What the documents are and who issues them.** NOVs are formal notices issued by EPA or state agencies documenting violations of permits, regulations, or enforcement orders and are a key early step in the enforcement ladder.[source: https://www.epa.gov/enforcement/enforcement-basic-information]  They typically describe the violation, cite applicable authorities, and sometimes propose or require corrective actions.

**How the agent gets them.** NOVs are usually held by customer compliance or legal teams; selected information may be visible in ECHO but not the full letter.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set][source: https://www.epa.gov/enforcement/enforcement-basic-information]  The agent must often explicitly ask for copies when customers mention recent enforcement.

**Structured data fields to extract.** The agent should capture issuing agency, date, facilities and permits covered, nature of violation (e.g., effluent exceedance, failure to report, program deficiency), legal citations, and any described corrective actions or deadlines.[source: https://www.epa.gov/enforcement/enforcement-basic-information]  Linking NOVs to specific DMR periods or inspection findings provides traceability for later cross-checks.

**Operationally useful cross-checks.** NOV allegations should be cross-checked against DMR data, inspection reports, and consent decrees to understand their context and whether underlying issues have persisted.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set][source: https://www.epa.gov/npdes/npdes-regulations]  The agent should also track whether NOVs led to administrative orders, decrees, or documented corrective actions, as per the Research A NOV-without-corrective-action stop flag.

**Operator-wisdom reading insights.** Senior operators treat recent NOVs as non-negotiable indicators of risk regardless of how customers frame them, focusing on root causes and whether systemic corrective actions—not just paperwork—have been implemented.[source: https://www.epa.gov/enforcement/enforcement-basic-information]  They also know that multiple minor NOVs can signal deeper cultural and management issues even when no single violation seems catastrophic.

**Common gotchas and limitations.** NOVs may reflect past conditions that have since been corrected, or may target documentation rather than underlying performance; reading them without follow-up correspondence can overstate current risk.[source: https://www.epa.gov/enforcement/enforcement-basic-information]  Conversely, customers sometimes underplay or omit NOVs in their narratives, making independent ECHO checks important.

**What gets lost in summaries.** Customers often summarize NOVs as “we had a small issue but it’s resolved,” omitting specific violations, associated parameters, any interim noncompliance, and whether regulators accepted the corrective plan.[source: https://www.epa.gov/enforcement/enforcement-basic-information]  Without the actual letter, the agent cannot reliably distinguish between paperwork issues and substantive noncompliance.

### 2.6 ECHO Compliance Summaries

**What the documents are and who issues them.** ECHO compliance summaries are EPA-generated public reports that aggregate DMR, inspection, and enforcement data for NPDES permittees, including effluent exceedances, SNC status, and enforcement actions.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set]  They are not legal documents but are widely used by regulators, NGOs, and practitioners as an at-a-glance compliance view.

**How the agent gets them.** ECHO summaries are available via web UI and downloadable datasets, searchable by permit number, facility name, or geography.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set]  The agent can use links or downloaded CSVs as structured inputs.

**Structured data fields to extract.** Key fields include facility identifiers, number and type of effluent violations over specified periods, SNC designations and durations, inspection counts and dates, enforcement actions, and summarized pollutant-by-pollutant performance indicators as available.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set]  Flags indicating incomplete data or reporting issues also warrant extraction.

**Operationally useful cross-checks.** ECHO summaries should be cross-checked against customer claims of “full compliance,” against permit limits and eDMR data, and against enforcement documents and consent decrees to confirm alignment.[source: https://www.epa.gov/enforcement/enforcement-basic-information][source: https://www.epa.gov/npdes/npdes-regulations]  They also provide an independent context when evaluating evidence-quality flags such as permit-compliance optimism bias.

**Operator-wisdom reading insights.** Experienced practitioners treat ECHO as a starting point, not a final verdict: they use it to identify periods of concern (e.g., years with multiple violations or SNC) and then drill down into DMRs and local records to understand causes.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set]  They also recognize that data lags, errors, or state reporting differences can create apparent anomalies.

**Common gotchas and limitations.** ECHO may not include all state-level enforcement or non-NPDES issues, and data quality depends on timely and accurate reporting by states and permittees.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set]  It also lacks the narrative depth of inspection reports, NOVs, and consent decrees.

**What gets lost in summaries.** Customers rarely present full ECHO summaries; when they reference ECHO at all, it is usually to highlight improved performance or resolved SNC designations, not the detailed violation history.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set]  Without direct ECHO review, the agent risks accepting overly optimistic compliance narratives.

### 2.7 POTW Pretreatment Audits and Inspections

**What the documents are and who issues them.** EPA and states conduct pretreatment audits and inspections of POTW pretreatment programs, using standard checklists to assess implementation of 40 CFR 403 requirements.[source: https://www.epa.gov/system/files/documents/2021-07/final_pca_checklist_and_instructions_-feb2010.pdf][source: https://www.law.cornell.edu/cfr/text/40/403.8]  Reports document findings on legal authority, industrial user control, monitoring, enforcement, and program resources.

**How the agent gets them.** These reports are often held by POTW pretreatment coordinators and may not be published publicly; customers can provide copies on request, and some states summarize findings in enforcement databases.[source: https://www.epa.gov/system/files/documents/2021-07/final_pca_checklist_and_instructions_-feb2010.pdf]

**Structured data fields to extract.** The agent should extract audit date, auditing agency, major findings and deficiencies, recommendations, required corrective actions, and any deadlines or follow-up expectations.[source: https://www.epa.gov/system/files/documents/2021-07/final_pca_checklist_and_instructions_-feb2010.pdf]  Where findings reference specific industrial users or wastestreams, those linkages should be captured.

**Operationally useful cross-checks.** Audit findings should be cross-checked against industrial permits, DMR violations, and enforcement actions to see whether pretreatment weaknesses are contributing to plant noncompliance, and against master plans and CIPs to assess whether recommended upgrades are funded.[source: https://www.epa.gov/npdes/national-pretreatment-program-overview][source: https://www.waterrf.org/case-studies]  The agent should also cross-check whether unresolved pretreatment audit findings correspond to Research A flags around unresolved industrial risk.

**Operator-wisdom reading insights.** Senior municipal and industrial practitioners treat pretreatment audit findings as high-leverage signals of upstream risk: inadequate industrial monitoring, weak local limits, or lack of enforcement on categorical industries can undermine entire treatment and reuse strategies.[source: https://www.epa.gov/system/files/documents/2021-07/final_pca_checklist_and_instructions_-feb2010.pdf][source: https://www.epa.gov/npdes/national-pretreatment-program-overview]  They look for repeat findings across audits as evidence of structural governance gaps.

**Common gotchas and limitations.** Audits may be infrequent, and some findings may be partially addressed without full documentation; conversely, some “paper” deficiencies may not materially affect real-world risk.[source: https://www.epa.gov/system/files/documents/2021-07/final_pca_checklist_and_instructions_-feb2010.pdf]  The agent must avoid over-weighting single audits without triangulating with DMR and enforcement data.

**What gets lost in summaries.** Customer summaries usually mention that an audit occurred and that “we implemented recommendations,” but rarely list which deficiencies were identified, which remain open, or how enforcement posture has changed.[source: https://www.epa.gov/system/files/documents/2021-07/final_pca_checklist_and_instructions_-feb2010.pdf]  This is exactly the gap the Research A flag “POTW pretreatment audit findings unresolved” is designed to surface.

### 2.8 Lab Analytical Reports (Including PFAS-Specific)

**What the documents are and who issues them.** Lab reports are issued by certified laboratories and document analytical methods, QA/QC, detection limits, and results for samples collected for compliance, process control, or special studies, including PFAS and other emerging contaminants.[source: https://www.epa.gov/cwa-methods/approved-cwa-test-methods-questions-and-answers][source: https://pfas.com/pfas-matrices/wastewater-sludge-biosolids/]  They may follow standardized formats or lab-specific templates.

**How the agent gets them.** Customers provide lab PDFs or data exports; for PFAS and emerging contaminants, reports may be embedded in consultant studies rather than in routine monitoring packages.[source: https://pfas.com/pfas-matrices/wastewater-sludge-biosolids/]  The agent should explicitly request method details when PFAS, 1,4-dioxane, or other emerging contaminants are central to the opportunity.

**Structured data fields to extract.** The agent should capture method identifiers (e.g., 1633, 533, 537.1), analyte lists, reporting and detection limits, QA/QC results (blanks, spikes, recoveries), sample locations and times, and numeric results with qualifiers.[source: https://www.epa.gov/cwa-methods/approved-cwa-test-methods-questions-and-answers][source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation]  For biosolids and solids, matrix and preparation details are particularly important.

**Operationally useful cross-checks.** Lab results should be compared against permit limits, health-based criteria (MCLs, advisory levels), and biosolids limits, and cross-checked with method requirements to ensure compliance monitoring is conducted using approved methods where required.[source: https://www.law.cornell.edu/cfr/text/40/136.3][source: https://www.law.cornell.edu/cfr/text/40/503]  For PFAS, lab results must be reconciled with the PFAS NPDWR and any state-specific PFAS standards, as well as with reuse and biosolids guidance.[source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation][source: https://www.nebiosolids.org/maine-bans-land-application]

**Operator-wisdom reading insights.** Senior readers treat lab reports as only as good as their methods and QA/QC: they first verify that methods and detection limits are appropriate to decision thresholds and that QC results are acceptable before interpreting data trends.[source: https://www.epa.gov/cwa-methods/approved-cwa-test-methods-questions-and-answers]  For PFAS and emerging contaminants, they recognize that method evolution and matrix interferences complicate trend analysis and comparability across labs and time.

**Common gotchas and limitations.** PFAS and biosolids analyses can be especially challenging, with matrix interferences, incomplete analyte lists, and evolving methods making early data noisy and sometimes non-comparable.[source: https://pfas.com/pfas-matrices/wastewater-sludge-biosolids/]  Lab reports may omit method IDs or detection limits in customer-summarized versions, which undermines evidence quality for compliance and exposure assessments.

**What gets lost in summaries.** Summaries frequently report only whether a parameter “meets limits” or a single concentration value, omitting method identity, detection limits, and QA/QC context that determine whether results can support critical decisions.[source: https://www.epa.gov/cwa-methods/approved-cwa-test-methods-questions-and-answers]  For PFAS, customers often cite “non-detect” without clarifying detection limits relative to NPDWR MCLs.

### 2.9 AWWA M36 Water Audits

**What the documents are and who issues them.** AWWA M36 water audits are structured analyses of water balance and non-revenue water conducted using the IWA/AWWA methodology and Free Water Audit Software, typically summarized in a workbook and report.[source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition][source: https://swefc.unm.edu/wlswitchboard/resource/m36-water-audits-and-loss-control-programs-4th-edition/]  Utilities or their consultants prepare the audits.

**How the agent gets them.** Customers provide completed audit spreadsheets and summary reports; in some jurisdictions, regulators require submissions that may be accessible via state water-loss control programs.[source: https://swefc.unm.edu/wlswitchboard/resource/m36-water-audits-and-loss-control-programs-4th-edition/]  The agent should request both the completed workbook and any narrative management plans.

**Structured data fields to extract.** Key fields include system input volume, authorized consumption categories, apparent and real loss volumes, non-revenue water percentage, data validity scores, and key performance indicators such as infrastructure leakage index.[source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition]  The agent should also capture audit year, version of the software used, and any narrative on major data limitations.

**Operationally useful cross-checks.** Audit results should be cross-checked against billing and production metering data, asset and pressure-zone maps, and capital and NRW programme documents to see whether identified losses are being actively addressed.[source: https://swefc.unm.edu/wlswitchboard/resource/m36-water-audits-and-loss-control-programs-4th-edition/][source: https://www.awwa.org/resource/water-loss-control]  For wastewater, water audit insights inform flow projections, I/I assumptions, and reuse source-availability discussions.

**Operator-wisdom reading insights.** Experienced NRW practitioners focus on data validity scores and the split between apparent and real losses: a low data validity score undermines confidence in any numeric NRW percentage, and misallocated apparent versus real losses can misdirect investments.[source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition]  They also look for how audits evolve over time; a one-off audit with no follow-up suggests a box-ticking exercise, not a management program.

**Common gotchas and limitations.** Many utilities conduct audits with poor data quality, low validity scores, or outdated software versions, making headline NRW numbers misleading.[source: https://swefc.unm.edu/wlswitchboard/resource/m36-water-audits-and-loss-control-programs-4th-edition/]  Audits may ignore production meter errors or treat large unauthorized uses as negligible, underestimating losses.

**What gets lost in summaries.** Summaries often report only “NRW is X%,” omitting data validity scores, error bounds, and the breakdown of losses, which are critical to intervention design.[source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition]  Without the workbook, the agent cannot tell whether numbers are robust enough to support project scoping.

### 2.10 Master Plans

**What the documents are and who issues them.** Wastewater and integrated water resource master plans are long-range planning documents prepared by utilities and their consultants that project flows and loads, identify capacity constraints, and recommend phased capital improvements.[source: https://www.waterrf.org/case-studies]  They are typically authored by consulting engineers with utility oversight.

**How the agent gets them.** Master plans are customer-internal documents, often hundreds of pages, rarely available via public portals except in summary form for board or council approvals.[source: https://www.waterrf.org/case-studies]  The agent must request electronic copies or at least executive summaries where confidentiality limits sharing.

**Structured data fields to extract.** At minimum, the agent should capture planning horizon, forecasted flows and loads, identified bottlenecks, recommended projects, cost estimates, and phasing, plus any explicit links to consent decrees, TMDLs, or reuse and biosolids strategies.[source: https://www.waterrf.org/case-studies]  Extracting a project list with drivers and timing enables later cross-checks with CIPs and funding documents.

**Operationally useful cross-checks.** Master-plan projections and recommended projects should be cross-checked against actual flows from DMRs and SCADA, against current permits and fact sheets, and against CIPs and funding arrangements to see which recommendations have been implemented or deferred.[source: https://www.abebooks.co.uk/9780071663588/Design-Municipal-Wastewater-Treatment-Plants-0071663584/plp][source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water]  The agent should also check whether new regulatory developments (e.g., PFAS rules) have overtaken assumptions in older plans.

**Operator-wisdom reading insights.** Senior operators treat master plans as directional rather than predictive: they provide a structured articulation of constraints and options but often overestimate near-term capital delivery and underestimate costs.[source: https://www.waterrf.org/case-studies]  Practitioners know to look at which projects are tied to consent decrees or regulatory mandates versus those that are discretionary, and to discount capex curves that assume sustained political and funding support.

**Common gotchas and limitations.** Master plans can become quickly outdated by demand shifts, regulatory changes, or funding shocks; older than five years is often a warning sign that projections and project prioritization may no longer hold.[source: https://www.waterrf.org/case-studies]  Plans may also assume reuse or biosolids outlets that have since closed due to PFAS or market changes.

**What gets lost in summaries.** Board-level summaries usually present only high-level project lists and aggregate costs, omitting the analytical basis, scenario testing, and risk assessments that show how fragile the plan is to assumptions.[source: https://www.waterrf.org/case-studies]  Summaries also rarely spell out which projects are explicitly compliance-driven versus strategic or optional.

### 2.11 Capital Improvement Plans (CIPs)

**What the documents are and who issues them.** CIPs are multi-year capital budgeting documents that list funded and planned projects, costs, and timing, often tied to rate cases and debt issuance.[source: https://www.waterrf.org/case-studies]  Utilities or municipalities issue them as part of financial planning.

**How the agent gets them.** CIPs may be public via utility websites or provided by customers; portions may also appear in bond prospectuses and rate case filings.[source: https://www.waterrf.org/case-studies]  The agent should ask for the most recent adopted CIP.

**Structured data fields to extract.** The agent should capture project names, descriptions, drivers (e.g., regulatory, growth, renewal), planned start and completion years, total costs, and funding sources where indicated.[source: https://www.waterrf.org/case-studies]  Tagging projects as consent-decree-driven or linked to permits is particularly valuable.

**Operationally useful cross-checks.** CIPs should be cross-checked against master plans, consent decrees, and funding agreements to see which regulatory and capacity-driven projects are actually funded, and against observed compliance and performance issues to spot gaps where critical risks lack funding.[source: https://www.msdprojectwin.org/about-us/federal-consent-decree][source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water]  The agent can also compare CIP schedules with IIJA and SRF milestones to identify funding-risk flags.

**Operator-wisdom reading insights.** Senior utility staff know that inclusion in a CIP is necessary but not sufficient: early-year projects with secured funding and clear regulatory drivers are more likely to proceed than aspirational out-year line items.[source: https://www.waterrf.org/case-studies]  They also recognize that politically sensitive projects may be underfunded or repeatedly deferred despite appearing in plans.

**Common gotchas and limitations.** CIPs may not clearly distinguish between currently funded and aspirational projects, and can be updated annually with shifting priorities that are hard to track without version control.[source: https://www.waterrf.org/case-studies]  They also often omit detailed scope, making it difficult to assess whether they genuinely address identified capacity or compliance issues.

**What gets lost in summaries.** Customer narratives often focus on a few marquee projects and total capital numbers, omitting smaller but critical risk-reduction projects and any schedule slippage or cost overruns.[source: https://www.waterrf.org/case-studies]  Without direct CIP review, the agent may misjudge alignment between regulatory obligations and actual investment plans.

### 2.12 Engineering Reports for Reuse (Title 22 / DPR)

**What the documents are and who issues them.** Engineering reports for reuse articulate source waters, treatment trains, performance objectives, monitoring and control strategies, and environmental buffers, and are required for regulatory approval under California Title 22 and emerging DPR rules.[source: https://www.fluencecorp.com/california-title-22-water-reuse-standards][source: https://watereuse.org/ca-dpr-take-effect]  They are prepared by consultants and utilities and reviewed by state health and environmental agencies.

**How the agent gets them.** Customers hold engineering reports and may be willing to share them under confidentiality; some public summaries or redacted versions appear in regulatory dockets or project websites.[source: https://www.ocwd.com/gwrs]  The agent should request at least an executive summary and treatment-train overview.

**Structured data fields to extract.** Extractable fields include project type (non-potable, IPR, DPR), source waters and blending ratios, treatment process units and log-removal credits, monitoring and control points, environmental buffers, and key design flows and loads.[source: https://watereuse.org/ca-dpr-take-effect][source: https://www.ocwd.com/gwrs]  The agent should also capture identified critical control points and response protocols for excursions.

**Operationally useful cross-checks.** Engineering report assumptions should be cross-checked against current PFAS and emerging-contaminant standards and guidance to see whether treatment performance is adequate, and against actual operating data where available to validate design expectations.[source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation][source: https://www.waterrf.org/research-topics/reuse]  The agent should also cross-check environmental buffer and blending assumptions against current state rules and water-rights constraints.

**Operator-wisdom reading insights.** Senior reuse practitioners focus on how engineering reports handle worst-case scenarios—such as treatment failures, extreme weather, or source-contamination events—and whether monitoring and control strategies are robust enough to detect and respond.[source: https://watereuse.org/ca-dpr-take-effect][source: https://www.waterrf.org/research-topics/reuse]  They also pay attention to concentrate and residuals management, recognizing that unresolved brine outlets can derail otherwise solid reuse projects.

**Common gotchas and limitations.** Reports may assume stable regulatory frameworks and public acceptance that can change over project lifetimes, particularly for DPR; they may also underplay PFAS and other emerging contaminants if prepared before the PFAS NPDWR.[source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation][source: https://www.waterrf.org/research-topics/reuse]  Some reports treat concentrate management superficially, leading to downstream feasibility issues.

**What gets lost in summaries.** Customer summaries often emphasize potable reuse branding and high-level treatment concepts but omit detailed log-removal requirements, redundancy strategies, and contingency plans that actually determine safety and operability.[source: https://www.ocwd.com/gwrs]  Summaries also tend to downplay residuals and brine management risks.

### 2.13 Biosolids Reporting Packages

**What the documents are and who issues them.** Biosolids reporting packages combine annual biosolids reports, lab data, land-application site records, and sometimes independent audits to document compliance with Part 503 and state overlays.[source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting][source: https://www.ecfr.gov/current/title-40/chapter-I/subchapter-O/part-503]  Utilities or their contractors assemble them, submitting required reports to EPA or states.

**How the agent gets them.** Customers can provide recent biosolids reports and supporting data; EPA’s biosolids program receives reports from larger facilities in non-delegated states and authorized states with electronic reporting.[source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting]

**Structured data fields to extract.** The agent should extract biosolids production volumes, management practices (e.g., land application, composting, incineration, disposal), pollutant and pathogen monitoring results, vector attraction reduction determinations, and outlets and receiving-site information.[source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting][source: https://www.epa.gov/biosolids/land-application-biosolids]  Where PFAS data exist, those should be captured with method context.

**Operationally useful cross-checks.** Biosolids data should be cross-checked against industrial pretreatment records to identify potential industrial PFAS or metals sources, against reuse and land-application permits to confirm that outlets remain legally and practically viable, and against state PFAS and biosolids rules to detect emerging constraints.[source: https://www.nebiosolids.org/maine-bans-land-application][source: https://www.epa.gov/coal-combustion-residuals/final-rule-legacy-coal-combustion-residuals-surface-impoundments-and-ccr]  The agent should also align biosolids volumes with plant flow and solids-generation assumptions in master plans.

**Operator-wisdom reading insights.** Biosolids program directors look beyond simple compliance to outlet risk: how dependent the program is on single markets, whether markets are sensitive to PFAS, odors, or other co-contaminants, and how quickly outlets could close if regulatory or market conditions change.[source: https://www.epa.gov/biosolids/land-application-biosolids][source: https://www.nebiosolids.org/maine-bans-land-application]  They also care about storage and contingency capacity for outlet disruptions.

**Common gotchas and limitations.** Biosolids reports may not include all co-contaminants of concern, particularly PFAS, and may lag behind emerging state restrictions and market responses.[source: https://www.nebiosolids.org/maine-bans-land-application]  They also rarely encode detailed outlet contractual terms or fragility.

**What gets lost in summaries.** Customer summaries typically state that “biosolids are Class B and land-applied” without quantifying outlet reliance, trends in quality, or regulatory and market pressures; they may also omit emerging PFAS discussions due to uncertainty.[source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting]  Without full reporting packages, the agent cannot properly evaluate outlet viability flags.

### 2.14 SWMPs and Annual MS4 Reports

**What the documents are and who issues them.** SWMPs and MS4 annual reports are permit-required documents describing how MS4s implement minimum control measures and, where applicable, TMDL requirements, including program activities, BMP inventories, and monitoring results.[source: https://www.epa.gov/npdes/stormwater-discharges-municipal-sources][source: https://epa.illinois.gov/topics/forms/water-permits/storm-water/ms4.html]  They are prepared by MS4 program managers and submitted to state agencies.

**How the agent gets them.** Many MS4 permits require posting SWMPs and annual reports on public websites, and state programs often maintain central repositories; customers can also provide copies.[source: https://epa.illinois.gov/topics/forms/water-permits/storm-water/ms4.html]

**Structured data fields to extract.** Fields include MS4 classification (Phase I/II), minimum control measure implementation activities, metrics (e.g., number of inspections, illicit discharges removed, BMPs installed), TMDL-related measures, and any self-reported challenges or planned improvements.[source: https://www.epa.gov/npdes/stormwater-discharges-municipal-sources]  Extracting these allows the agent to evaluate program maturity and areas of underperformance.

**Operationally useful cross-checks.** SWMP commitments and reported implementation should be cross-checked against MS4 permit conditions, TMDL implementation plans, enforcement records, and CIPs to spot gaps between obligations, implementation, and funding.[source: https://www.epa.gov/npdes/stormwater-discharges-municipal-sources-developing-ms4-program][source: https://www.msdprojectwin.org/about-us/federal-consent-decree]  The agent should also compare claimed BMP maintenance with asset-condition or inspection data where available.

**Operator-wisdom reading insights.** MS4 managers and auditors read SWMPs with an eye to whether program activities are well institutionalized (e.g., integrated into standard operating procedures) or dependent on a few individuals and pilot projects.[source: https://www.epa.gov/npdes/stormwater-discharges-municipal-sources]  Annual reports are scanned for consistent implementation across years and for any mentions of enforcement or citizen complaints that signal weak areas.

**Common gotchas and limitations.** SWMPs can be aspirational and may not be regularly updated to reflect actual program capacity or current permit conditions; annual reports may focus more on activities than on measurable outcomes or load reductions.[source: https://epa.illinois.gov/topics/forms/water-permits/storm-water/ms4.html]  Some MS4s have limited staffing and struggle to fully implement all minimum control measures.

**What gets lost in summaries.** Customers often summarize MS4 status as “we have an MS4 permit and SWMP,” omitting any history of enforcement, TMDL-driven retrofit obligations, or maintenance backlogs for BMPs.[source: https://www.epa.gov/npdes/stormwater-discharges-municipal-sources]  Without reading the SWMP and annual reports, the agent cannot reliably flag programmatic sufficiency issues.

### 2.15 Sustainability and ESG Disclosures (Wastewater-Relevant)

**What the documents are and who issues them.** Sustainability and ESG reports, CDP responses, and sustainability sections of SEC filings are produced by utilities and companies to communicate environmental performance, risks, and strategies to investors and stakeholders.[source: https://www.cdp.net/en/guidance/guidance-for-companies/water-security-questionnaire][source: https://www.sec.gov/news/press-release/2024-31]  They may include wastewater, reuse, PFAS, and biosolids content.

**How the agent gets them.** These documents are publicly available via company and utility websites, CDP portals, and SEC EDGAR; customers may also provide investor decks summarizing ESG content.[source: https://www.cdp.net/en/guidance/guidance-for-companies/water-security-questionnaire]

**Structured data fields to extract.** Where wastewater-relevant, the agent should extract stated targets (e.g., reuse goals, emission and nutrient reductions), disclosed wastewater and reuse volumes, references to PFAS and biosolids risks, and any commitments linked to specific projects or timelines.[source: https://www.cdp.net/en/guidance/guidance-for-companies/water-security-questionnaire][source: https://www.waterrf.org/case-studies]  Extracting whether disclosures are assured or audited is also useful.

**Operationally useful cross-checks.** ESG disclosures should be cross-checked against permits, DMRs, enforcement records, and master plans to verify that claimed performance and projects align with regulatory and technical evidence.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set][source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting]  The agent should also cross-check PFAS and biosolids risk narratives against state rules and consent decrees.

**Operator-wisdom reading insights.** Experienced practitioners treat ESG narratives as commitments and reputational stakes rather than as audited performance: failure to align capital projects and operations with publicly stated commitments can create political and financing risk even if regulation lags.[source: https://www.waterrf.org/case-studies]  They also know that ESG numbers may be aggregated or normalized in ways that obscure specific risk hotspots.

**Common gotchas and limitations.** ESG and CDP disclosures are not usually subject to the same verification as financial statements and can contain optimistic assumptions, selective metrics, or incomplete coverage of facilities and activities.[source: https://www.sec.gov/news/press-release/2024-31]  They also lag behind fast-moving regulatory conditions (e.g., PFAS NPDWR) and may omit unresolved enforcement issues.

**What gets lost in summaries.** Internal summaries often emphasize the existence of ESG reports and high-level commitments but omit caveats, scope limitations, and any uncertainties or contentious issues noted in the full documents.[source: https://www.cdp.net/en/guidance/guidance-for-companies/water-security-questionnaire]  Without reading the wastewater-relevant sections, the agent cannot accurately gauge the strength and specificity of commitments.

### 2.16 CWSRF/WIFIA Financing Agreements

**What the documents are and who issues them.** CWSRF/DWSRF and WIFIA agreements are loan and assistance contracts between utilities and state or federal financing agencies that define project scopes, budgets, timelines, and financial and reporting covenants.[source: https://www.epa.gov/dwsrf][source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water]  They are issued by state SRF programs and EPA’s WIFIA program.

**How the agent gets them.** Customers maintain executed agreements and amendments; some high-profile agreements are public via EPA or state announcements.[source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water]  The agent must typically rely on customer-shared copies for detailed terms.

**Structured data fields to extract.** The agent should extract project description, eligible activities, funding amounts, interest and term, milestones and draw schedules, key covenants, and any conditions linked to regulatory compliance or consent decrees.[source: https://www.epa.gov/dwsrf]  Tagging which projects are funded under which agreements enables cross-linking to master plans and CIPs.

**Operationally useful cross-checks.** Financing agreements should be cross-checked against master plans, CIPs, and consent decrees to determine whether high-priority regulatory projects are adequately funded and on schedule, and against IIJA and SRF program guidance to understand any special conditions (e.g., Buy America, disadvantaged-community requirements).[source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water][source: https://www.msdprojectwin.org/about-us/federal-consent-decree]  The agent can also cross-check milestone status against customer narratives to surface funding-risk flags.

**Operator-wisdom reading insights.** Senior practitioners understand that slipping SRF or WIFIA milestones can jeopardize funding and, by extension, on-time compliance projects, so they pay close attention to schedule conditions and drawdown patterns.[source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water]  They also treat financing agreements as constraints on how much scope change is possible without amendments.

**Common gotchas and limitations.** Financing agreements may lag scope changes or be written broadly, requiring careful reading of amendments and associated board resolutions to understand the current project definition.[source: https://www.epa.gov/dwsrf]  Some conditions may be buried in appendices or referenced guidance rather than in the main text.

**What gets lost in summaries.** Customer summaries tend to emphasize headline funding amounts and project labels while omitting schedule, covenant, and scope constraints that can limit flexibility.[source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water]  Without agreements, the agent may overestimate freedom to reshape project scope or timing.

## 3. Cross-Document Evidence Matrix for High-Stakes Claims

### 3.1 Compliance Posture

For the high-stakes claim “this facility is in sustained compliance with its NPDES or pretreatment obligations,” the minimum evidence set should include the current NPDES permit or pretreatment control mechanism, the last three years of DMR/eDMR or SMR data for core parameters, ECHO compliance and enforcement summaries, and any recent NOVs or enforcement orders.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set][source: https://www.epa.gov/enforcement/enforcement-basic-information]  The ideal evidence set further adds recent state or EPA inspection reports, pretreatment audit findings where applicable, and any consent decrees or administrative orders governing performance.[source: https://www.epa.gov/system/files/documents/2021-07/final_pca_checklist_and_instructions_-feb2010.pdf][source: https://www.msdprojectwin.org/about-us/federal-consent-decree]

In this matrix, eDMR and ECHO data provide empirical performance trends, permits define the rules, enforcement records show how regulators view performance, and audits reveal programmatic gaps; no single document is sufficient, and the agent should classify compliance claims as high-confidence only when all components align.[source: https://www.epa.gov/npdes/npdes-regulations][source: https://www.epa.gov/enforcement/enforcement-basic-information]  Cross-document flags from Research A—such as “recent NOV with no corrective action”—are triggered when permits, DMR data, and enforcement documents conflict with customer assertions or with each other.

### 3.2 PFAS Exposure

For PFAS exposure, the minimum evidence set comprises PFAS analytical reports for influent, effluent, biosolids, and, where relevant, groundwater and surface-water receptors, plus applicable regulatory benchmarks from the PFAS NPDWR and any state PFAS standards.[source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation][source: https://pfas.com/pfas-matrices/wastewater-sludge-biosolids/]  The ideal set extends to industrial SDSs and process descriptions identifying PFAS sources, pretreatment audit findings, reuse engineering and monitoring documents, and biosolids outlet and state-rule information for PFAS-driven restrictions.[source: https://www.epa.gov/npdes/national-pretreatment-program-overview][source: https://www.nebiosolids.org/maine-bans-land-application][source: https://watereuse.org/ca-dpr-take-effect]

The agent must cross-compare PFAS concentrations with drinking-water MCLs, biosolids and land-application restrictions, and reuse treatment capabilities, looking for inconsistencies such as “PFAS not an issue here” narratives alongside results near or above MCLs or in states with PFAS-driven bans.[source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation][source: https://www.nebiosolids.org/maine-bans-land-application]  Research A PFAS-related flags—PFAS source unknown near MCLs, PFAS biosolids bans ignored, PFAS-impacted DPR designs—are surfaced when these cross-document comparisons show unresolved contradictions.

### 3.3 Capacity Adequacy

Capacity adequacy claims require, at a minimum, the NPDES permit’s design flow and wet-weather conditions, recent DMR/eDMR or flow records, process flow diagrams and hydraulic profiles, and the most recent capacity and optimization studies.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set][source: https://www.abebooks.co.uk/9780071663588/Design-Municipal-Wastewater-Treatment-Plants-0071663584/plp]  The ideal evidence set adds wet-weather and I/I studies, consent decrees or CSO LTCPs where applicable, and master plans and CIPs that show capacity-related projects and funding.

Operator-grade reasoning compares peak flows and loads from monitoring and incident reports against design and permit capacities, checks whether capacity-related recommendations in studies have been implemented via CIPs, and examines consent-decree CSO and SSO performance obligations.[source: https://www.epa.gov/npdes/combined-sewer-overflow-control-policy][source: https://www.waterrf.org/case-studies]  Research A flags such as “unknown wet-weather performance envelope” and “aging assets with unfunded renewal” are triggered when key components of this evidence set are missing or contradictory.

### 3.4 Biosolids Outlet Viability

For biosolids outlet viability, the minimum evidence set consists of biosolids annual reports, land-application and outlet records, and current state and regional PFAS and biosolids rules.[source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting][source: https://www.nebiosolids.org/maine-bans-land-application]  The ideal set adds industrial pretreatment and PFAS source data, master plans and CIPs detailing solids projects, and any market analyses or contingency plans for outlet diversification.

Cross-document analysis checks whether outlets remain legal and socially acceptable in the jurisdictions where biosolids are applied or disposed, whether outlet portfolios are diversified, and whether solids quality trends align with increasing regulatory and market scrutiny.[source: https://www.epa.gov/biosolids/land-application-biosolids][source: https://www.nebiosolids.org/maine-bans-land-application]  Research A flags like “imminent loss of primary biosolids outlet” and “biosolids land application continuing under PFAS-driven bans” are tied directly to conflicts between outlet records, state rules, and customer narratives.

### 3.5 Reuse Project Viability

Reuse project viability claims should rest on at least a reuse engineering report or conceptual design, baseline feedwater and source-water quality data, applicable state reuse regulations (Title 22/DPR or equivalents), and financing/funding documents where projects are already in implementation discussions.[source: https://www.fluencecorp.com/california-title-22-water-reuse-standards][source: https://watereuse.org/ca-dpr-take-effect][source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water]  The ideal evidence set includes public outreach and acceptance studies, industrial and upstream source-control documentation, and, for IPR/DPR, detailed log-removal and control strategies.

The agent must verify that the regulatory pathway actually exists in the customer’s state, that treatment trains and monitoring strategies align with current and foreseeable regulations (including PFAS), and that concentrate and residuals management has credible outlets.[source: https://watereuse.org/ca-dpr-take-effect][source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation]  Research A flags, such as “desired reuse has no viable regulatory path” and “unresolved concentrate/brine outlet,” are triggered by gaps between regulatory frameworks, engineering reports, and funding plans.

### 3.6 NRW Programme Maturity

NRW programme maturity depends on the existence and quality of AWWA M36 audits, production and billing meter data, pressure-zone and DMA documentation, and NRW-related projects in CIPs and rate cases.[source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition][source: https://swefc.unm.edu/wlswitchboard/resource/m36-water-audits-and-loss-control-programs-4th-edition/]  The ideal evidence set also includes leakage and apparent-loss investigations, AMI project documents, and regulatory requirements for water-loss control where applicable.

Operator-grade assessment looks first at whether validated audits exist and what data validity scores they have, then at whether identified loss components have corresponding projects and funding; utilities with no validated audits, poor production metering, or one-off studies without ongoing programmes are flagged as immature.[source: https://www.awwa.org/resource/water-loss-control][source: https://swefc.unm.edu/wlswitchboard/resource/m36-water-audits-and-loss-control-programs-4th-edition/]  Research A NRW-related flags, such as “no validated AWWA water audit” and “poor production metering,” map directly to these evidence gaps.

## 4. Document-to-Flag Mapping

### 4.1 Documents That Surface Compliance Flags

Compliance-related Research A flags map primarily to permits, DMR/eDMR and SMR data, ECHO summaries, NOVs and enforcement orders, pretreatment audits, MS4 SWMPs and annual reports, consent decrees, and SRF/WIFIA funding documents.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set][source: https://www.epa.gov/enforcement/enforcement-basic-information]  For example, the “recent NOV with no documented corrective action” flag is surfaced by NOVs and enforcement correspondence, cross-checked with customer statements and follow-up orders to ensure that corrective plans exist.[source: https://www.epa.gov/enforcement/enforcement-basic-information]  “Chronic NPDES noncompliance” flags draw on DMR and ECHO time series compared against permit limits and SNC thresholds.

MS4-related compliance flags, such as “failure to implement minimum control measures” or “TMDL obligations with no credible plan,” are surfaced by comparing MS4 permits and TMDL-linked requirements with SWMP content, annual reports, and any MS4-specific enforcement records.[source: https://www.epa.gov/npdes/stormwater-discharges-municipal-sources][source: https://epa.illinois.gov/topics/forms/water-permits/storm-water/ms4.html]  Permit-lifecycle flags, including NPDES renewal windows and uninitiated modification triggers, are driven by permit dates and content, supported by eDMR data and customer narratives.

### 4.2 Documents That Surface Operational/Safety Flags

Operational and safety flags rely more heavily on internal documents—incident reports, SCADA logs, confined-space programmes, chemical storage plans, and safety procedures—plus visual evidence where available, though Discovery-mode agents must infer risk primarily from narrative descriptions and any shared procedures.[source: https://www.epa.gov/npdes/collection-systems][source: https://www.epa.gov/npdes/municipal-wastewater]  Confined-space flags are surfaced when customers describe entering tanks, sewers, or manholes without referencing confined-space procedures, permits, and rescue capabilities; hydrogen sulfide and sewer-atmosphere flags arise from descriptions of corrosion, odours, and incidents without mitigation measures.[source: https://www.epa.gov/npdes/collection-systems]

For chemical storage and disinfection flags, the key documents are process descriptions, P&IDs, RMP documentation where applicable, and incident histories that mention leaks or near-misses; absent such documents, the agent relies on customer narratives and photographic evidence.[source: https://www.epa.gov/rmp/risk-management-plan-rmp-rule-overview]  Electrical and arc-flash flags are tied to asset-condition assessments, maintenance records, and any available electrical studies.

### 4.3 Documents That Surface Evidence-Quality Flags

Evidence-quality flags are inherently cross-document: they are triggered when there are mismatches, gaps, or biases between documents and narratives.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set][source: https://www.epa.gov/cwa-methods/approved-cwa-test-methods-questions-and-answers]  For example, eDMR data gaps and abrupt methodology changes surface a flag when DMRs show missing periods or method switches without explanation; method-mismatch flags arise when lab reports show non-permit methods for parameters used in compliance claims.[source: https://www.deq.louisiana.gov/assets/docs/NetDMR/Useful_Information.pdf][source: https://www.epa.gov/cwa-methods/approved-cwa-test-methods-questions-and-answers]

Customer bias flags use ECHO, DMR, enforcement, and audit records as reality anchors when customer statements assert blanket compliance or minimize risks; permit-compliance optimism is flagged when narratives conflict with documented violations or SNC.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set][source: https://www.epa.gov/enforcement/enforcement-basic-information]  Photo-versus-narrative conflicts, where customer photos show visibly poor conditions inconsistent with clean narratives, rely on whatever visual evidence is shared and any linked incident or inspection reports.

### 4.4 Cross-Document Flag Surface (Conflicts Between Documents)

Some of the highest-leverage Research A flags explicitly depend on cross-document conflicts rather than any single document: for instance, “permit and DMR data inconsistent with claimed compliance,” “reuse engineering report assumes regulatory path that state rules do not support,” and “biosolids outlets described as stable despite state bans or restrictions.”[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://www.fluencecorp.com/california-title-22-water-reuse-standards][source: https://www.nebiosolids.org/maine-bans-land-application]  The agent must compute these flags by comparing structured fields extracted from multiple artefacts and narrative claims.

In practice, this means that every time a customer asserts a low-risk posture in a domain covered by Research A flags—compliance, PFAS, biosolids outlets, DPR safeguards, decentralized system impacts—the agent should check whether available documents (or obvious public records like ECHO) support or contradict that posture; unresolved contradictions should keep cross-document flags open until resolved in Assessment mode.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set][source: https://www.epa.gov/septic/septic-system-impacts-water-sources]

### 4.5 Flags No Single Document Surfaces

There are flag types that cannot be fully surfaced by any single document: customer bias patterns (permit-compliance optimism, vendor-blame, engineer-shield, alarmism near budget cycles), conflicting narratives between internal and public documents, and regulatory pipeline conflicts where project scopes and financing clearly ignore likely future rules.[source: https://www.cdp.net/en/guidance/guidance-for-companies/water-security-questionnaire][source: https://www.epa.gov/eg/effluent-guidelines][source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water]  These require the agent to hold multiple artefacts and narratives in memory and apply the severity ratchet tests from Research A.

For example, a flag that a utility is pursuing large capital investments that will likely be non-compliant under forthcoming ELGs or PFAS rules depends on cross-referencing master plans, CIPs, and financing documents with Federal Register notices and EPA effluent guidelines plans.[source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation][source: https://www.epa.gov/eg/effluent-guidelines]  No single document “admits” this risk; it must be inferred from the conflict between planning documents and regulatory pipelines.

## 5. Lens-to-Document Mapping

### 5.1 Documents per Lens — Canonical First-Call Set

The table below lists canonical first-call documents for each Research B lens—documents that a skilled Discovery-mode operator can realistically ask for in a first conversation without overwhelming the customer, mapped back to the inventory.

| Lens | Canonical first-call documents (minimum 4) |
|------|--------------------------------------------|
| Municipal wet-weather (lens-municipal-wet-weather) | Current NPDES permit and fact sheet for the POTW; last 12 months of DMR/eDMR summary; recent CSO/SSO or wet-weather performance summary (e.g., event counts and volumes); latest AWWA or internal water audit summary if meter and I/I context matter; brief description or executive summary of any CSO LTCP or consent decree obligations. [source: https://www.epa.gov/npdes/municipal-wastewater][source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set][source: https://www.epa.gov/npdes/combined-sewer-overflow-control-policy][source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition] |
| Industrial discharge (lens-industrial-discharge) | Industrial NPDES permit or pretreatment control mechanism; last year of self-monitoring reports and/or eDMR data; basic process description and PFD with wastestream identification; any recent pretreatment inspection/audit reports or enforcement correspondence. [source: https://www.epa.gov/npdes/national-pretreatment-program-overview][source: https://www.law.cornell.edu/cfr/text/40/403.12][source: https://www.epa.gov/system/files/documents/2021-07/final_pca_checklist_and_instructions_-feb2010.pdf] |
| Advanced reuse (lens-advanced-reuse) | Conceptual or approved reuse engineering report executive summary; baseline feedwater and source-water quality summary; applicable state reuse regulatory guidance or Title 22/DPR references; high-level description of reuse project drivers and end uses. [source: https://www.fluencecorp.com/california-title-22-water-reuse-standards][source: https://watereuse.org/ca-dpr-take-effect][source: https://www.ocwd.com/gwrs] |
| Non-revenue water (lens-nrw) | Most recent validated AWWA M36 water audit summary or workbook; production and billing meter overview; pressure-zone or DMA map or description; any regulatory requirements or expectations related to water loss control. [source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition][source: https://swefc.unm.edu/wlswitchboard/resource/m36-water-audits-and-loss-control-programs-4th-edition/] |
| Biosolids and residuals (lens-biosolids-residuals) | Latest biosolids annual report; summary of current biosolids outlets and volumes; recent biosolids analytical summary; any known or anticipated state PFAS or biosolids restrictions. [source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting][source: https://www.epa.gov/biosolids/land-application-biosolids][source: https://www.nebiosolids.org/maine-bans-land-application] |
| Stormwater/MS4 (lens-stormwater-ms4) | Current MS4 permit; SWMP or program plan; most recent MS4 annual report; any TMDL implementation plan applicable to the MS4 or connected receiving waters. [source: https://www.epa.gov/npdes/stormwater-discharges-municipal-sources][source: https://epa.illinois.gov/topics/forms/water-permits/storm-water/ms4.html] |
| Decentralized/onsite (lens-decentralized-onsite) | Overview of onsite and decentralized systems (counts and types); sample onsite permits or program documents; any decentralized management or RME plan; recent inspection/failure summaries or health-department reports on onsite-related water-quality issues. [source: https://www.epa.gov/small-and-rural-wastewater-systems/about-small-wastewater-systems][source: https://www.epa.gov/septic/septic-system-impacts-water-sources] |

### 5.2 Documents per Lens — Deep-Discovery Set

Deep-discovery documents expand on the first-call set once trust and engagement deepen. For the municipal lens, these include detailed PFDs and hydraulic profiles, recent capacity and optimization studies, full CSO LTCPs and modeling, asset-condition and risk assessments, and CIPs and SRF/WIFIA agreements for major projects.[source: https://www.abebooks.co.uk/9780071663588/Design-Municipal-Wastewater-Treatment-Plants-0071663584/plp][source: https://www.msdprojectwin.org/about-us/federal-consent-decree][source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water]  For industrial discharge, deep documents include detailed wastestream characterization studies, internal incident logs and slug reports, SDSs for PFAS-containing chemistries, and any treatability or pilot studies.[source: https://www.epa.gov/npdes/national-pretreatment-program-overview][source: https://pfas.com/pfas-matrices/wastewater-sludge-biosolids/]

Advanced reuse deep evidence comprises full engineering reports, treatability and pilot results, detailed O&M plans, concentrate management studies, and public outreach and acceptance documentation.[source: https://watereuse.org/ca-dpr-take-effect][source: https://www.ocwd.com/gwrs][source: https://www.waterrf.org/research-topics/reuse]  NRW deep-discovery draws on detailed audit workbooks, leakage and apparent-loss investigations, AMI implementation documents, and pressure-management and DMA design materials.[source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition]

For biosolids, deep evidence includes full biosolids reporting packages, industrial source-tracking studies, PFAS and co-contaminant analytical campaigns, outlet contract documents, and solids master plans.[source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting][source: https://www.nebiosolids.org/maine-bans-land-application]  MS4 and decentralized lenses rely on detailed IDDE records, BMP inventories and condition data, TMDL tracking reports, decentralized inventories and failure mapping, and septage hauler manifests to build a full picture of risk and opportunity.

### 5.3 Reconciliation with Research B Data Needs

Research B’s structured Annex identifies, for each lens, ideal and realistic-first-call data artefacts; this document reconciles those artefacts with actual documents by mapping lens “data needs” to concrete document types in Artefact 1 and marking each as realistic_first_call_ask true or false.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition]  For example, the municipal lens’s “NPDES permit and fact sheet” and “eDMR history” data needs map directly to doc-npdes-permit and doc-edmr-history with realistic_first_call_ask true, while “full CSO LTCP modeling files” map to doc-cso-ltcp with realistic_first_call_ask false because they are typically secured later.[source: https://www.epa.gov/npdes/combined-sewer-overflow-control-policy]

Similarly, the NRW lens’s “validated AWWA water audit workbook” and “production meter accuracy documentation” needs map to doc-nrw-audit and doc-prod-meter-management, respectively, with realistic_first_call_ask true for the audit summary and false for detailed meter test records.[source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition][source: https://swefc.unm.edu/wlswitchboard/resource/m36-water-audits-and-loss-control-programs-4th-edition/]  The Annex encodes these mappings so the agent can move seamlessly from lens-level questions to specific document requests.

## 6. Implementation Notes for the Agent

### 6.1 When the Agent Should Request Source Documents vs Accept Customer Summaries

The agent should default to requesting source documents rather than summaries for any document type that directly surfaces Research A stop or specialist flags—NPDES permits and fact sheets, DMR/eDMR histories, NOVs and enforcement orders, consent decrees, biosolids reports and outlet records, reuse engineering reports, MS4 permits and SWMPs, decentralized permits and failure records—because summaries systematically omit details that determine severity.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting][source: https://www.epa.gov/npdes/stormwater-discharges-municipal-sources]  Summaries may be acceptable as initial placeholders for complex internal documents like full master plans, asset-management plans, and CIPs, provided the agent treats them as low-confidence until at least one representative source is obtained.

Where customers resist sharing full documents, the agent can progressively narrow asks to specific sections or tables (e.g., effluent limits tables, high-level project lists, biosolids outlet summaries) while explicitly tracking which Research A flags remain unresolved due to documentation gaps.[source: https://www.epa.gov/npdes/npdes-permit-writers-manual][source: https://www.waterrf.org/case-studies]  The Structured Knowledge Annex enables this by listing, for each flag, which document types are sufficient to confirm or refute it.

### 6.2 How the Agent Handles Document Gaps

When key documents are missing—no recent DMRs, absent biosolids reports, missing MS4 annual reports, or lack of decentralized system inventories—the agent should surface evidence-quality flags and explicitly downgrade confidence in related claims, avoiding definitive statements of compliance, outlet viability, or programme maturity.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set][source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting][source: https://www.epa.gov/septic/septic-system-impacts-water-sources]  In some cases, such as missing NOV follow-up, gaps themselves trigger stop-severity flags because they indicate unresolved enforcement actions or uncontrolled risks.

The agent should also exploit public sources like ECHO and state portals where customers cannot or will not provide documents, using those as independent anchors for compliance and enforcement evidence even when internal documentation is limited.[source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set][source: https://epa.illinois.gov/topics/forms/water-permits/storm-water/ms4.html]  However, it must remain transparent (internally) about limitations and avoid assuming that absence of evidence is evidence of absence.

### 6.3 The 2025 Regulatory Environment — Document Currency Concerns

Because PFAS NPDWR, CCR legacy-impoundment rules, updated ELG plans, and electronic reporting requirements have all evolved significantly in 2024–2025, the agent must check document dates and treat pre-2024 regulatory references with caution when flags depend on current law.[source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation][source: https://www.epa.gov/coal-combustion-residuals/final-rule-legacy-coal-combustion-residuals-surface-impoundments-and-ccr][source: https://www.epa.gov/eg/effluent-guidelines]  For example, reuse engineering reports written before the PFAS NPDWR may not adequately address PFAS risks, and biosolids programmes may rely on outlets that have since been constrained by PFAS-driven state policies.

The Structured Knowledge Annex therefore marks flags as regulatoryenvironment2025specific where their applicability depends on these newer rules and encourages Assessment-mode specialists to revisit them as rulemakings, litigation, and guidance evolve.[source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation][source: https://www.epa.gov/eg/effluent-guidelines]  Discovery-mode agents should avoid overconfidence where regulatory pipelines are clearly in flux.

## Structured Knowledge Annex

### Artefact 1: Document Types

```yaml
- id: doc-npdes-permit
  name: NPDES wastewater discharge permit
  category: regulatory
  issued_by: EPA or authorized state NPDES authority
  access_method:
    - customer-provided
    - state-permit-portal
    - EPA-ICIS-NPDES-download
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-advanced-reuse
  applies_to_subcases:
    - subcase-muni-separate
    - subcase-muni-cso
    - subcase-ind-direct
  structured_data_fields:
    - permit_number
    - issuing_authority
    - effective_date
    - expiration_date
    - permittee_name
    - facility_address
    - design_flow_mgd
    - outfall_ids
    - receiving_waters
    - effluent_limits_by_parameter
    - monitoring_frequencies
    - standard_conditions
    - special_conditions
    - schedule_of_compliance
    - referenced_elgs
    - referenced_tmdls
  operator_wisdom_reading_insights:
    - "Check whether the permit is administratively continued and how close it is to renewal to understand regulatory leverage and risk."
    - "Scan effluent limits for parameters with small compliance margins and cross-reference fact sheet rationales to see which are technology-based and which are water-quality-based."
  common_gotchas:
    - "Permits can lag current water-quality standards, effluent guidelines, and PFAS policy, so future limits may tighten even if the current permit looks generous."
    - "Some critical expectations are encoded in consent decrees or state policies rather than in the permit text itself."
  what_summaries_lose:
    - "Summaries rarely capture monitoring frequencies, reporting requirements, compliance schedules, and special conditions tied to pretreatment, wet-weather, or reuse obligations."
    - "They almost never specify which limits are technology- versus water-quality-based, obscuring negotiability at renewal."
  realistic_first_call_ask: true
  source: https://www.epa.gov/npdes/npdes-permit-writers-manual
  confidence: high

- id: doc-npdes-fact-sheet
  name: NPDES permit fact sheet / statement of basis
  category: regulatory
  issued_by: EPA or authorized state NPDES authority
  access_method:
    - state-permit-portal
    - EPA-ICIS-NPDES-download
    - customer-provided
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-advanced-reuse
  applies_to_subcases:
    - subcase-muni-cso
    - subcase-ind-direct
  structured_data_fields:
    - linked_permit_number
    - applicable_elgs
    - water_quality_standards
    - tmdl_references
    - mixing_zone_assumptions
    - basis_of_each_effluent_limit
    - critical_design_flows
    - receiving_water_assumptions
  operator_wisdom_reading_insights:
    - "Use the fact sheet to distinguish technology-based limits from water-quality-based limits and to see which assumptions (e.g., background concentrations, mixing zones) drive each."
    - "Treat special-studies and schedule-of-compliance discussions as signals of future capital and monitoring expectations, not just paperwork."  
  common_gotchas:
    - "Fact sheets may pre-date later permit modifications or evolving PFAS and nutrient policies, so rationales can be stale even if still formally valid."
    - "Some state permits lack detailed fact sheets, forcing reliance on limited rationales or external guidance."
  what_summaries_lose:
    - "Summaries typically omit the basis-of-limit narrative and any discussion of alternatives considered or rejected, which are crucial for renegotiation strategy."
    - "They rarely mention TMDL allocations or how mixing-zone decisions were made."
  realistic_first_call_ask: true
  source: https://www.epa.gov/npdes/npdes-permit-writers-manual
  confidence: high

- id: doc-edmr-history
  name: eDMR / DMR performance history
  category: monitoring-compliance
  issued_by: NPDES permittee
  access_method:
    - customer-provided
    - EPA-ICIS-NPDES-download
    - state-eDMR-portal-export
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-advanced-reuse
  applies_to_subcases:
    - subcase-muni-separate
    - subcase-muni-cso
    - subcase-ind-direct
    - subcase-ind-indirect
  structured_data_fields:
    - permit_number
    - monitoring_period_start
    - monitoring_period_end
    - parameter_name
    - outfall_id
    - sample_dates
    - sample_type
    - measured_values
    - summary_statistics
    - violation_flags
    - method_codes
    - nodi_codes
  operator_wisdom_reading_insights:
    - "Look for patterns over multiple years—seasonality, chronic near-limit operation, and repeated outliers matter more than single-month exceedances."
    - "Pay close attention to data gaps, sudden method changes, and shifts in detection limits, as these often coincide with process changes or reporting issues."
  common_gotchas:
    - "eDMR data are self-reported and may contain gaps, late submissions, or errors that ECHO flags but customer summaries ignore."
    - "State portals can include parameters and events (e.g., overflows) that are not fully surfaced in national ICIS-NPDES datasets."
  what_summaries_lose:
    - "Customer performance summaries usually aggregate data into annual averages or compliance percentages, masking peak events and data gaps."
    - "Summaries rarely document method codes or detection limits, making trend comparisons questionable."
  realistic_first_call_ask: true
  source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set
  confidence: high

- id: doc-nov
  name: Notice of Violation
  category: enforcement
  issued_by: EPA or state environmental agency
  access_method:
    - customer-provided
    - state-enforcement-portal
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-biosolids-residuals
    - lens-stormwater-ms4
    - lens-decentralized-onsite
  applies_to_subcases:
    - null
  structured_data_fields:
    - issuing_agency
    - issue_date
    - facilities_covered
    - permits_covered
    - violation_type
    - cited_regulations
    - corrective_action_requirements
    - response_deadlines
  operator_wisdom_reading_insights:
    - "Treat recent NOVs as hard evidence of regulatory concern regardless of how customers frame them; focus on whether corrective actions were implemented, not just promised."
    - "Patterns of multiple NOVs over time often reveal systemic management or infrastructure issues even when individual violations look minor."
  common_gotchas:
    - "NOVs may reflect conditions that have since been corrected, so they must be read alongside follow-up correspondence and performance data."
    - "Only a subset of NOVs appear in public databases; relying solely on ECHO can understate enforcement history."
  what_summaries_lose:
    - "Summaries typically downplay the scope and severity of violations and omit specific parameters, dates, and regulatory citations."
    - "They rarely detail regulator feedback on the adequacy of proposed corrective actions."
  realistic_first_call_ask: true
  source: https://www.epa.gov/enforcement/enforcement-basic-information
  confidence: high

- id: doc-biosolids-annual-report
  name: Biosolids annual report and attachments
  category: biosolids-specific
  issued_by: POTW or sludge management facility
  access_method:
    - customer-provided
    - EPA-biosolids-reporting-portal
    - state-biosolids-program
  applies_to_lenses:
    - lens-biosolids-residuals
    - lens-municipal-wet-weather
  applies_to_subcases:
    - subcase-bio-landapp
    - subcase-bio-thermal
    - subcase-bio-disposal
  structured_data_fields:
    - reporting_year
    - facility_identifier
    - biosolids_production_tonnage
    - management_practices
    - pollutant_monitoring_results
    - pathogen_monitoring_results
    - vector_attraction_reduction_data
    - land_application_site_counts
    - incineration_or_disposal_facilities
  operator_wisdom_reading_insights:
    - "Look beyond compliance boxes to outlet dependence and trends in metals and co-contaminants that could threaten future outlets."
    - "Cross-check biosolids quality and outlets against industrial loading, PFAS data, and emerging state restrictions."  
  common_gotchas:
    - "Reports may omit PFAS and other emerging contaminants even where they are driving market and regulatory scrutiny."
    - "They may not clearly distinguish between primary and contingency outlets, understating outlet fragility."
  what_summaries_lose:
    - "Summaries tend to state classification and generic outlet types without quantifying how much product goes to each outlet or how sensitive those outlets are to regulatory or market shifts."
    - "They seldom highlight upward trends in key contaminants that could trigger future restrictions."
  realistic_first_call_ask: true
  source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting
  confidence: high

- id: doc-ms4-permit
  name: MS4 stormwater permit
  category: stormwater-specific
  issued_by: state NPDES stormwater program or EPA
  access_method:
    - state-stormwater-program-portal
    - customer-provided
  applies_to_lenses:
    - lens-stormwater-ms4
  applies_to_subcases:
    - subcase-ms4-phase1
    - subcase-ms4-phase2
  structured_data_fields:
    - permit_number
    - ms4_classification
    - effective_date
    - expiration_date
    - minimum_control_measures
    - monitoring_requirements
    - reporting_requirements
    - tmdl_requirements
  operator_wisdom_reading_insights:
    - "Use the permit to map required minimum control measures and any TMDL load-reduction obligations to concrete programme elements and retrofits."
    - "Recognize that general permits can hide complexity in separate SWMP documents and TMDL implementation plans."
  common_gotchas:
    - "MS4 permits may reference separate guidance or implementation plans that contain the real detail; reading the permit alone can understate obligations."
    - "TMDL requirements may be only briefly referenced yet drive large retrofit needs."  
  what_summaries_lose:
    - "Summaries focus on having a permit and SWMP but often omit specific TMDL obligations, monitoring commitments, and enforcement hooks."
    - "They rarely describe how minimum control measures are actually operationalized."
  realistic_first_call_ask: true
  source: https://www.epa.gov/npdes/stormwater-discharges-municipal-sources
  confidence: high

- id: doc-m36-water-audit
  name: AWWA M36 water audit and NRW report
  category: utility-side
  issued_by: drinking-water utility or consultant
  access_method:
    - customer-provided
  applies_to_lenses:
    - lens-nrw
    - lens-municipal-wet-weather
  applies_to_subcases:
    - subcase-nrw-ami
    - subcase-nrw-leak-detection
    - subcase-nrw-dma-pressure
  structured_data_fields:
    - audit_year
    - system_input_volume
    - authorized_consumption
    - apparent_losses
    - real_losses
    - non_revenue_water_percent
    - data_validity_score
    - key_performance_indicators
  operator_wisdom_reading_insights:
    - "Treat data validity scores as the first filter; low validity means headline NRW numbers are not decision-grade."
    - "Look for how audit results have changed over time and whether identified loss components are linked to concrete projects and funding."
  common_gotchas:
    - "Audits conducted with poor data or outdated software can misallocate losses and misdirect investments."
    - "Some utilities treat water audits as one-off compliance exercises rather than as ongoing management tools."
  what_summaries_lose:
    - "Summaries usually report only NRW percentage and perhaps total loss volume, omitting data validity, error ranges, and detailed loss breakdowns."
    - "They rarely disclose key assumptions or data gaps that drive uncertainty."  
  realistic_first_call_ask: true
  source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition
  confidence: high
```

### Artefact 2: Cross-Checks

```yaml
- id: xcheck-permit-vs-edmr-compliance
  primary_document: doc-npdes-permit
  cross_check_against:
    - doc-edmr-history
    - doc-echo-summary
  what_to_compare: "Compare permitted effluent limits, averaging periods, and parameters to multi-year DMR/eDMR results and ECHO violation flags to quantify compliance margins and identify chronic or emerging noncompliance."
  what_conflicts_indicate: "If DMRs and ECHO show frequent or recent violations on core parameters while customers claim full compliance, trigger permit-compliance-optimism and chronic-npdes-noncompliance flags and treat compliance posture as high-risk."
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
  applies_to_flags:
    - csflag-nov-no-corrective-action
    - csflag-edmr-data-gaps
  source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set
  confidence: high

- id: xcheck-biosolids-vs-state-pfas-rules
  primary_document: doc-biosolids-annual-report
  cross_check_against:
    - doc-state-pfas-biosolids-guidance
    - doc-biosolids-outlet-records
  what_to_compare: "Compare reported biosolids management practices and outlets with current state PFAS-driven biosolids rules and guidance to determine whether land application or other outlets remain legally and practically viable."
  what_conflicts_indicate: "If biosolids are still land-applied in jurisdictions with PFAS-driven bans or severe restrictions, surface a stop-level flag for illegal or non-viable outlets and require immediate outlet transition planning."
  applies_to_lenses:
    - lens-biosolids-residuals
    - lens-municipal-wet-weather
  applies_to_flags:
    - csflag-pfas-biosolids-ban-ignored
  source: https://www.nebiosolids.org/maine-bans-land-application
  confidence: high

- id: xcheck-reuse-report-vs-state-reg-path
  primary_document: doc-reuse-engineering-report
  cross_check_against:
    - doc-state-reuse-regs
  what_to_compare: "Compare proposed reuse project type, treatment trains, log-removal targets, monitoring, and environmental buffers with applicable state non-potable, IPR, and DPR regulatory criteria to confirm that a viable approval pathway exists."
  what_conflicts_indicate: "If a project seeks DPR or advanced reuse without an existing regulatory pathway or with treatment and monitoring designs below state criteria, surface a stop-level flag for no viable regulatory path and recommend scoping alternatives or long-horizon regulatory changes."
  applies_to_lenses:
    - lens-advanced-reuse
  applies_to_flags:
    - csflag-reuse-no-reg-path
  source: https://watereuse.org/ca-dpr-take-effect
  confidence: high

- id: xcheck-m36-audit-vs-meter-data
  primary_document: doc-m36-water-audit
  cross_check_against:
    - doc-prod-meter-management
    - doc-billing-data-summary
  what_to_compare: "Compare audit system input volume, billed consumption, and NRW components with production and billing meter descriptions and any meter-accuracy data to validate audit results and identify major data weaknesses."
  what_conflicts_indicate: "If audits show low NRW with low data validity, poor production metering, or untested meters, surface specialist-level NRW evidence-quality flags and recommend validated audits before shaping NRW projects."  
  applies_to_lenses:
    - lens-nrw
  applies_to_flags:
    - csflag-edmr-data-gaps
  source: https://swefc.unm.edu/wlswitchboard/resource/m36-water-audits-and-loss-control-programs-4th-edition/
  confidence: medium

- id: xcheck-ms4-permit-vs-swmp-and-tmdl
  primary_document: doc-ms4-permit
  cross_check_against:
    - doc-swmp-plan
    - doc-ms4-annual-report
    - doc-tmdl-implementation-plan
  what_to_compare: "Compare MS4 permit minimum control measure and TMDL requirements with SWMP commitments, annual report implementation records, and TMDL implementation plans to assess whether programme activities and retrofits align with obligations."
  what_conflicts_indicate: "If permits and TMDLs require specific retrofits or load reductions but SWMPs and annual reports show little or no implementation or funding, surface specialist-level flags for TMDL obligations without credible plans."  
  applies_to_lenses:
    - lens-stormwater-ms4
    - lens-municipal-wet-weather
  applies_to_flags:
    - csflag-ms4-tmdl-no-credible-plan
  source: https://www.epa.gov/npdes/stormwater-discharges-municipal-sources
  confidence: medium
```

### Artefact 3: High-Stakes Claim Evidence Matrix

```yaml
- id: claim-compliance-posture
  claim_topic: compliance-posture
  minimum_evidence_set:
    - doc-npdes-permit
    - doc-edmr-history
    - doc-echo-summary
    - doc-nov
  ideal_evidence_set:
    - doc-npdes-permit
    - doc-npdes-fact-sheet
    - doc-edmr-history
    - doc-echo-summary
    - doc-nov
    - doc-pretreatment-audit-report
    - doc-consent-decree
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-stormwater-ms4
  notes: "Use permits to define obligations, DMR/eDMR and ECHO for performance, NOVs and consent decrees for enforcement context, and pretreatment audits for upstream programme health; treat compliance claims as low-confidence if any component is missing or contradictory."
  source: https://www.epa.gov/npdes/npdes-permit-writers-manual
  confidence: high

- id: claim-pfas-exposure
  claim_topic: pfas-exposure
  minimum_evidence_set:
    - doc-pfas-lab-report
    - doc-pfas-regulatory-benchmarks
  ideal_evidence_set:
    - doc-pfas-lab-report
    - doc-pfas-regulatory-benchmarks
    - doc-industrial-sds
    - doc-pretreatment-audit-report
    - doc-biosolids-annual-report
    - doc-reuse-engineering-report
  applies_to_lenses:
    - lens-industrial-discharge
    - lens-biosolids-residuals
    - lens-advanced-reuse
    - lens-stormwater-ms4
    - lens-decentralized-onsite
  notes: "Anchor PFAS exposure assessments in multi-matrix lab data and regulatory benchmarks, then use industrial, biosolids, reuse, and decentralized documents to trace sources, outlets, and treatment capabilities."  
  source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation
  confidence: high

- id: claim-capacity-adequacy
  claim_topic: capacity-adequacy
  minimum_evidence_set:
    - doc-npdes-permit
    - doc-edmr-history
    - doc-process-flow-diagram
    - doc-capacity-study
  ideal_evidence_set:
    - doc-npdes-permit
    - doc-edmr-history
    - doc-process-flow-diagram
    - doc-capacity-study
    - doc-iandi-study
    - doc-cso-ltcp
    - doc-cip
  applies_to_lenses:
    - lens-municipal-wet-weather
  notes: "Combine design and permit capacities with monitored flows and capacity studies to judge capacity adequacy; treat absence of recent studies or wet-weather data as a warning sign."  
  source: https://www.abebooks.co.uk/9780071663588/Design-Municipal-Wastewater-Treatment-Plants-0071663584/plp
  confidence: high

- id: claim-biosolids-outlet-viability
  claim_topic: biosolids-outlet-viability
  minimum_evidence_set:
    - doc-biosolids-annual-report
    - doc-biosolids-outlet-records
    - doc-state-pfas-biosolids-guidance
  ideal_evidence_set:
    - doc-biosolids-annual-report
    - doc-biosolids-outlet-records
    - doc-state-pfas-biosolids-guidance
    - doc-industrial-sds
    - doc-pretreatment-audit-report
    - doc-biosolids-master-plan
  applies_to_lenses:
    - lens-biosolids-residuals
    - lens-municipal-wet-weather
  notes: "Evaluate outlet viability by combining current outlets and volumes, biosolids quality, and state and regional rules; treat heavy reliance on land application in PFAS-constrained states as high risk even before bans take effect."  
  source: https://www.nebiosolids.org/maine-bans-land-application
  confidence: high

- id: claim-reuse-project-viability
  claim_topic: reuse-project-viability
  minimum_evidence_set:
    - doc-reuse-engineering-report
    - doc-feedwater-quality-summary
    - doc-state-reuse-regs
  ideal_evidence_set:
    - doc-reuse-engineering-report
    - doc-feedwater-quality-summary
    - doc-state-reuse-regs
    - doc-public-outreach-study
    - doc-srf-wifia-agreement
  applies_to_lenses:
    - lens-advanced-reuse
  notes: "Confirm that treatment trains and control strategies can meet state reuse criteria for the specific project type, that feedwater quality is compatible, and that concentration and residuals management and public acceptance are addressed."  
  source: https://watereuse.org/ca-dpr-take-effect
  confidence: medium

- id: claim-nrw-programme-maturity
  claim_topic: nrw-programme-maturity
  minimum_evidence_set:
    - doc-m36-water-audit
    - doc-prod-meter-management
  ideal_evidence_set:
    - doc-m36-water-audit
    - doc-prod-meter-management
    - doc-leakage-investigation-report
    - doc-ami-project-plan
    - doc-nrw-related-regulatory-guidance
  applies_to_lenses:
    - lens-nrw
  notes: "Use validated water audits, production metering documentation, and project evidence to distinguish one-off water-loss studies from sustained NRW management programmes."  
  source: https://store.awwa.org/M36-Water-Audits-and-Loss-Control-Programs-Fifth-Edition
  confidence: high
```

### Artefact 4: Document-to-Flag Mapping

```yaml
- id: docflag-npdes-permit-compliance
  document: doc-npdes-permit
  surfaces_flags:
    - csflag-admin-continuance-near-renewal
    - flag-lens-muni-chronic-npdes-viol
  evidence_pattern_in_document: "Permit shows an expiration date within 12 months (or past with administrative continuance) and effluent limits that, when compared with eDMR data, reveal repeated exceedances on core parameters without corresponding permit modifications or compliance schedules."
  source: https://www.law.cornell.edu/cfr/text/40/122.21
  confidence: high

- id: docflag-edmr-data-gaps
  document: doc-edmr-history
  surfaces_flags:
    - csflag-edmr-data-gaps
    - bias-permit-compliance-optimism
  evidence_pattern_in_document: "DMR/eDMR records contain missing reporting periods, numerous NODI codes for critical parameters, or abrupt method changes without explanation in permit conditions or customer narratives, undermining claimed continuous compliance."
  source: https://www.deq.louisiana.gov/assets/docs/NetDMR/Useful_Information.pdf
  confidence: high

- id: docflag-biosolids-pfas-ban
  document: doc-biosolids-annual-report
  surfaces_flags:
    - csflag-pfas-biosolids-ban-ignored
    - flag-lens-bio-outlet-collapse
  evidence_pattern_in_document: "Report and outlet records show ongoing land application of biosolids in a state with PFAS-driven bans or strict restrictions, or heavy reliance on a single land-application outlet in a region with rapidly tightening PFAS policies."  
  source: https://www.nebiosolids.org/maine-bans-land-application
  confidence: high

- id: docflag-ms4-tmdl-implementation-gap
  document: doc-ms4-annual-report
  surfaces_flags:
    - csflag-ms4-tmdl-no-credible-plan
    - flag-lens-ms4-bmp-maint
  evidence_pattern_in_document: "MS4 annual report acknowledges TMDL obligations or structural BMP inventories but shows minimal or no funded retrofit or maintenance programmes, with few implemented projects relative to required load reductions."
  source: https://epa.illinois.gov/topics/forms/water-permits/storm-water/ms4.html
  confidence: medium

- id: docflag-reuse-no-reg-path
  document: doc-reuse-engineering-report
  surfaces_flags:
    - csflag-reuse-no-reg-path
  evidence_pattern_in_document: "Reuse engineering report proposes DPR or advanced potable reuse in a state or jurisdiction where current regulations do not yet authorize the proposed reuse class or impose criteria that the design does not appear to meet."
  source: https://watereuse.org/ca-dpr-take-effect
  confidence: medium

- id: docflag-decentralized-drinking-water-impact
  document: doc-decentralized-failure-report
  surfaces_flags:
    - csflag-decent-drinking-water-contamination
    - flag-lens-decent-high-fail
  evidence_pattern_in_document: "Health or environmental agency reports document contamination of private or public drinking-water sources linked to failing onsite systems, or high failure rates without a formal management programme, indicating acute public-health risk."  
  source: https://www.epa.gov/septic/septic-system-impacts-water-sources
  confidence: high
```
```

