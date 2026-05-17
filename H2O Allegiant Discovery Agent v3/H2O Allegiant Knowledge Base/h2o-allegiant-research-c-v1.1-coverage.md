<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Research C — YAML Coverage Completion Pass (v1.1)

## Section 1: Additional `doc-` entities (Artefact 1)

```yaml
- id: doc-npdes-general-permit
  name: NPDES general permit (coverage plus NOI)
  category: regulatory
  issued_by: EPA or authorized state NPDES authority
  access_method:
    - state-permit-portal
    - EPA-ICIS-NPDES-download
    - customer-provided
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-stormwater-ms4
  applies_to_subcases:
    - null
  structured_data_fields:
    - general_permit_id
    - sector_or_category
    - coverage_eligibility_criteria
    - required_best_management_practices
    - effluent_limits_by_category
    - monitoring_requirements
    - reporting_requirements
    - notice_of_intent_required
    - notice_of_termination_required
  operator_wisdom_reading_insights:
    - "Use the general permit to understand baseline sector requirements and where facility-specific conditions may be layered on via NOIs or state addenda."
    - "Check whether the customer’s actual activities and SIC/NAICS codes match the eligibility criteria to avoid unpermitted discharges under the wrong general permit."
  common_gotchas:
    - "Facilities sometimes assume coverage under a general permit without filing a Notice of Intent or meeting eligibility criteria."
    - "Sector-wide limits and BMPs may not reflect more stringent local TMDL or state standard overlays that still apply."
  what_summaries_lose:
    - "Summaries rarely specify which general permit version applies or how eligibility was determined for a given facility."
    - "They often omit special sector-only conditions, benchmark monitoring, or impaired-waters provisions that drive additional obligations."
  realistic_first_call_ask: true
  source: https://www.epa.gov/npdes/npdes-general-permit-program
  confidence: high

- id: doc-state-npdes-equivalent-permit
  name: State NPDES-equivalent wastewater permit (e.g., TPDES)
  category: regulatory
  issued_by: state environmental agency in NPDES-authorized state
  access_method:
    - state-permit-portal
    - customer-provided
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-stormwater-ms4
  applies_to_subcases:
    - null
  structured_data_fields:
    - state_permit_number
    - federal_npdes_number_if_any
    - effective_date
    - expiration_date
    - facility_identifier
    - outfall_ids
    - receiving_waters
    - effluent_limits_by_parameter
    - monitoring_frequencies
    - narrative_and_numeric_criteria_references
  operator_wisdom_reading_insights:
    - "Treat state-branded permits as fully equivalent to federal NPDES permits for compliance assessments; differences are in formatting, not authority."
    - "State permits may incorporate state-only standards and implementation policies that are more stringent than federal minimums."
  common_gotchas:
    - "Parameter names, units, and averaging periods can differ from federal examples, complicating automated extraction."
    - "State portals sometimes host only the permit without the fact sheet, obscuring the basis for key limits."
  what_summaries_lose:
    - "Summaries rarely include state-only narrative conditions or cross-references to groundwater and reuse rules that materially affect design."
    - "They often omit information about state-specific mixing-zone policies and antidegradation findings."
  realistic_first_call_ask: true
  source: https://www.epa.gov/npdes/npdes-authorized-states
  confidence: high

- id: doc-pretreatment-control-mechanism
  name: POTW industrial pretreatment permit/control mechanism
  category: regulatory
  issued_by: POTW control authority
  access_method:
    - customer-provided
    - POTW-pretreatment-office
  applies_to_lenses:
    - lens-industrial-discharge
    - lens-municipal-wet-weather
  applies_to_subcases:
    - subcase-ind-indirect
  structured_data_fields:
    - control_mechanism_id
    - significant_industrial_user_id
    - applicable_categorical_standards
    - local_limits_by_parameter
    - surcharge_parameters_and_rates
    - monitoring_requirements
    - reporting_frequency
    - slug_control_requirements
    - spill_prevention_requirements
  operator_wisdom_reading_insights:
    - "Use the control mechanism to understand the true regulatory envelope for indirect dischargers—local limits and categorical standards are often tighter than generic NPDES parameters."
    - "Check for special conditions on slug discharges, batch operations, and hauled wastes that can create worst-day risks for the POTW."
  common_gotchas:
    - "Some local programs rely on outdated local limits or have not updated categorical-standard references after federal changes."
    - "Control mechanisms may not fully reflect side agreements or enforcement history with problem users."
  what_summaries_lose:
    - "Summaries rarely list specific categorical standards and local limits or the sampling and reporting burden for the industrial user."
    - "They often omit any mention of slug-control or BMP requirements that matter for upset risk at the POTW."
  realistic_first_call_ask: true
  source: https://www.epa.gov/npdes/national-pretreatment-program-overview
  confidence: high

- id: doc-biosolids-permit
  name: Biosolids land-application permit or state approval
  category: biosolids-specific
  issued_by: state environmental agency or health department
  access_method:
    - customer-provided
    - state-biosolids-program
  applies_to_lenses:
    - lens-biosolids-residuals
    - lens-municipal-wet-weather
  applies_to_subcases:
    - subcase-bio-landapp
  structured_data_fields:
    - permit_or_approval_id
    - authorized_management_practices
    - approved_classifications
    - pollutant_limits_referenced
    - pathogen_and_vector_reduction_requirements
    - site_restrictions
    - monitoring_and_reporting_requirements
  operator_wisdom_reading_insights:
    - "Read biosolids permits together with annual reports to understand not just what is allowed, but what outlets are actually being used."
    - "Pay close attention to any state-specific overlays on metals, nutrients, and PFAS that go beyond Part 503."
  common_gotchas:
    - "Permits may be structured as general approvals tied to guidance documents rather than detailed site-specific permits, making conditions harder to parse."
    - "State PFAS or odor provisions may be embedded in separate policy documents, not in the core permit text."
  what_summaries_lose:
    - "Customer summaries usually say only 'land application permitted' without describing outlet conditions, restrictions, or state overlays."
    - "They almost never mention specific acreage or site limits that constrain future solids growth."
  realistic_first_call_ask: true
  source: https://www.epa.gov/biosolids/compliance-and-annual-biosolids-reporting
  confidence: high

- id: doc-reuse-approval-letter
  name: State reuse approval / engineering report approval letter
  category: reuse-specific
  issued_by: state health or environmental agency
  access_method:
    - customer-provided
    - state-reuse-program
  applies_to_lenses:
    - lens-advanced-reuse
  applies_to_subcases:
    - subcase-reuse-nonpotable
    - subcase-reuse-ipr
    - subcase-reuse-dpr
  structured_data_fields:
    - approval_id
    - project_name
    - reuse_category
    - conditions_of_approval
    - monitoring_requirements
    - reporting_requirements
    - references_to_engineering_report_and_criteria
  operator_wisdom_reading_insights:
    - "Use approval letters to see which reuse configurations regulators have actually accepted and which conditions they emphasized as critical."
    - "Look for caveats, pilot requirements, and reopener clauses that signal where regulators still have concerns."
  common_gotchas:
    - "Approval letters can be narrowly scoped—for a pilot, a specific phase, or a subset of end uses—so assuming blanket project approval is risky."
    - "They may reference updated criteria or guidance that go beyond the original engineering report."
  what_summaries_lose:
    - "Summaries often state 'state approved our project' without specifying the conditions, monitoring, or limitations attached."
    - "They rarely capture references to evolving DPR/IPR criteria that will affect expansions or similar projects."
  realistic_first_call_ask: true
  source: https://watereuse.org/ca-dpr-take-effect
  confidence: high

- id: doc-rcra-permit
  name: RCRA hazardous-waste permit or closure plan affecting wastewater and residuals
  category: regulatory
  issued_by: EPA or state hazardous-waste program
  access_method:
    - customer-provided
    - state-hazardous-waste-portal
  applies_to_lenses:
    - lens-industrial-discharge
    - lens-biosolids-residuals
    - lens-municipal-wet-weather
  applies_to_subcases:
    - null
  structured_data_fields:
    - permit_id
    - regulated_units
    - waste_codes
    - groundwater_and_leachate_monitoring_requirements
    - closure_and_postclosure_requirements
    - corrective_action_requirements
  operator_wisdom_reading_insights:
    - "Check RCRA permits and closure plans for residual-handling constraints that can limit sludge, filtercake, or brine options."
    - "Look for CCR or hazardous-constituent linkages that may drive additional monitoring or treatment beyond typical wastewater permits."
  common_gotchas:
    - "RCRA and wastewater teams are often siloed; important residual constraints may not surface in wastewater-only conversations."
    - "Historic units and legacy impoundments can create ongoing obligations even when no new hazardous waste is generated."
  what_summaries_lose:
    - "Summaries typically mention only 'we have a RCRA site' without detailing units, waste codes, or long-term obligations."
    - "They almost never quantify monitoring or closure-cost implications for project feasibility."
  realistic_first_call_ask: false
  source: https://www.epa.gov/hwpermitting/hazardous-waste-permitting
  confidence: medium

- id: doc-industrial-smr
  name: Industrial self-monitoring report (SMR)
  category: monitoring-compliance
  issued_by: significant industrial user (submitted to POTW)
  access_method:
    - customer-provided
    - POTW-pretreatment-office
  applies_to_lenses:
    - lens-industrial-discharge
    - lens-municipal-wet-weather
  applies_to_subcases:
    - subcase-ind-indirect
  structured_data_fields:
    - reporting_period
    - parameters_monitored
    - sample_dates
    - sample_types
    - measured_values
    - certification_statements
  operator_wisdom_reading_insights:
    - "Use SMRs to see what industrial users actually discharge against local limits and categorical standards, not just what permits allow."
    - "Cross-check SMR results with POTW events and biosolids quality to identify upstream drivers of plant issues."
  common_gotchas:
    - "SMR formats vary widely and may omit method details or detection limits needed to judge data quality."
    - "Some users under-report batch or upset events that do not neatly fit scheduled sampling windows."
  what_summaries_lose:
    - "Customer narratives often say 'we sample quarterly' without providing actual result distributions or any discussion of outliers."
    - "Summaries rarely show relationships between production cycles and pollutant loads."
  realistic_first_call_ask: true
  source: https://www.law.cornell.edu/cfr/text/40/403.12
  confidence: high

- id: doc-slug-discharge-report
  name: Slug discharge or upset incident report (industrial to POTW)
  category: monitoring-compliance
  issued_by: significant industrial user
  access_method:
    - customer-provided
    - POTW-pretreatment-office
  applies_to_lenses:
    - lens-industrial-discharge
    - lens-municipal-wet-weather
  applies_to_subcases:
    - subcase-ind-indirect
  structured_data_fields:
    - incident_date
    - pollutant_or_wastestream
    - estimated_volume
    - cause
    - actions_taken
    - recurrence_potential
  operator_wisdom_reading_insights:
    - "Slug reports reveal 'worst-day' hazards that average monitoring cannot show; focus on whether root causes were removed or just patched."
    - "Link slug events to POTW upsets, overflows, or WET test failures to understand upstream-downstream dynamics."
  common_gotchas:
    - "Customers may treat slug reporting as a paperwork exercise and under-describe impacts and root causes."
    - "Some facilities fail to file required slug reports, so absence of documents does not prove absence of events."
  what_summaries_lose:
    - "Summaries often say 'we had an upset but fixed it' without quantifying magnitude, duration, or downstream effects."
    - "They rarely document long-term preventive measures or changes in operating procedures."
  realistic_first_call_ask: false
  source: https://www.law.cornell.edu/cfr/text/40/403.8
  confidence: medium

- id: doc-permit-exceedence-notice
  name: Permit exceedance / noncompliance notification letter
  category: monitoring-compliance
  issued_by: permittee to regulator (and sometimes POTW)
  access_method:
    - customer-provided
    - regulator-compliance-files
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
  applies_to_subcases:
    - null
  structured_data_fields:
    - notification_date
    - parameter_exceeded
    - magnitude_of_exceedance
    - cause_description
    - interim_corrective_actions
    - long_term_corrective_actions
  operator_wisdom_reading_insights:
    - "Compare exceedance narratives with DMR data and later performance to see whether corrective actions worked."
    - "Look for repeated exceedances with similar causes as evidence of unresolved structural issues."
  common_gotchas:
    - "Letters may minimize causes or overstate the permanence of planned corrective actions."
    - "Not all exceedances receive written notification; some are handled verbally or via NetDMR comments."
  what_summaries_lose:
    - "Summaries often state 'we notified the regulator' without details on magnitude, cause, or regulator reaction."
    - "They rarely track whether similar events reoccurred after supposed fixes."
  realistic_first_call_ask: false
  source: https://www.epa.gov/npdes/npdes-regulations
  confidence: medium

- id: doc-pretreatment-audit-report
  name: POTW pretreatment audit or inspection report
  category: monitoring-compliance
  issued_by: EPA or state pretreatment program
  access_method:
    - customer-provided
    - EPA-or-state-pretreatment-program
  applies_to_lenses:
    - lens-industrial-discharge
    - lens-municipal-wet-weather
  applies_to_subcases:
    - null
  structured_data_fields:
    - audit_date
    - auditing_agency
    - major_findings
    - corrective_actions_required
    - follow_up_deadlines
  operator_wisdom_reading_insights:
    - "Read audit findings as an early-warning system for where industrial discharges could compromise plant compliance and reuse or biosolids strategies."
    - "Focus on repeated findings across audit cycles—they often signal governance gaps rather than one-off mistakes."
  common_gotchas:
    - "Some deficiencies are documented as 'critical' but not followed up with enforcement; others appear minor but hide serious systemic issues."
    - "Program-level weaknesses may not show up immediately in DMRs but still elevate long-term risk."
  what_summaries_lose:
    - "Summaries typically say 'we were audited and are addressing findings' without specifying which requirements remain open."
    - "They rarely mention the regulator’s tone on future enforcement if issues remain unresolved."
  realistic_first_call_ask: true
  source: https://www.epa.gov/system/files/documents/2021-07/final_pca_checklist_and_instructions_-feb2010.pdf
  confidence: high

- id: doc-echo-summary
  name: EPA ECHO compliance and enforcement summary
  category: monitoring-compliance
  issued_by: US EPA
  access_method:
    - EPA-ECHO-public
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  structured_data_fields:
    - facility_identifier
    - npdes_ids
    - effluent_violation_counts
    - snc_periods
    - inspection_counts
    - enforcement_actions
    - penalty_amounts
  operator_wisdom_reading_insights:
    - "Use ECHO as an independent cross-check on self-reported performance and customer narratives."
    - "Look for patterns of SNC, repeated effluent violations, or frequent inspections that suggest regulatory concern."
  common_gotchas:
    - "Data lags and state-reporting differences mean ECHO is not a complete or perfectly current picture."
    - "Some state-level actions and informal enforcement are not fully captured."
  what_summaries_lose:
    - "Customers rarely present full ECHO histories; they may highlight only resolved issues or improvements."
    - "Summaries do not show how regulators have perceived risk over time."
  realistic_first_call_ask: false
  source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set
  confidence: high

- id: doc-lab-analytical-report
  name: Routine lab analytical report (non-PFAS)
  category: lab-analytical
  issued_by: certified environmental laboratory
  access_method:
    - customer-provided
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-advanced-reuse
    - lens-biosolids-residuals
  applies_to_subcases:
    - null
  structured_data_fields:
    - lab_id
    - method_id
    - analytes
    - detection_limits
    - reporting_limits
    - sample_ids
    - sample_locations
    - qa_qc_results
    - measured_values
  operator_wisdom_reading_insights:
    - "Verify methods, detection limits, and QA/QC acceptance criteria before trusting reported values."
    - "Align lab reports with permit requirements and sampling plans to ensure they are decision-grade for compliance."
  common_gotchas:
    - "Reports may omit method IDs or detection limits in summary versions, undermining comparability and regulatory sufficiency."
    - "Matrix interferences or failed QA/QC may make some results unusable even if values look normal."
  what_summaries_lose:
    - "Summaries typically show only means or 'pass/fail' judgments without QA/QC context."
    - "They rarely document detection-limit changes that alter apparent trends."
  realistic_first_call_ask: true
  source: https://www.epa.gov/cwa-methods/approved-cwa-test-methods-questions-and-answers
  confidence: high

- id: doc-wet-test-report
  name: Whole Effluent Toxicity (WET) test report
  category: lab-analytical
  issued_by: certified toxicity-testing laboratory
  access_method:
    - customer-provided
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-advanced-reuse
  applies_to_subcases:
    - null
  structured_data_fields:
    - test_type_acute_or_chronic
    - test_species
    - dilution_series
    - test_conditions
    - endpoints
    - pass_fail_determination
    - test_acceptability_criteria
  operator_wisdom_reading_insights:
    - "Confirm that test-acceptability criteria were met before using WET results to change process or permit strategies."
    - "Look for relationships between WET failures and specific events or wastestreams, not just overall toxicity labels."
  common_gotchas:
    - "Invalid tests can be misinterpreted as genuine toxicity issues if QA criteria are ignored."
    - "Single failed tests without follow-up can be over-weighted in decision-making."
  what_summaries_lose:
    - "Summaries often state 'we passed/failed WET' without describing test design, species, or validity."
    - "They rarely connect WET outcomes to specific operational changes."
  realistic_first_call_ask: false
  source: https://www.epa.gov/cwa-methods/whole-effluent-toxicity-methods
  confidence: high

- id: doc-pfas-lab-report
  name: PFAS analytical report (Method 1633 or drinking-water methods)
  category: lab-analytical
  issued_by: certified PFAS laboratory
  access_method:
    - customer-provided
  applies_to_lenses:
    - lens-industrial-discharge
    - lens-municipal-wet-weather
    - lens-biosolids-residuals
    - lens-advanced-reuse
  applies_to_subcases:
    - null
  structured_data_fields:
    - method_id
    - matrices_tested
    - pfos_pfoa_and_other_analytes
    - detection_limits_by_analyte
    - reporting_limits_by_analyte
    - qa_qc_results
    - measured_values
  operator_wisdom_reading_insights:
    - "Different PFAS methods and matrices are not directly comparable; focus on method IDs and detection limits before comparing datasets."
    - "Tie PFAS results to specific sources (industrial users, biosolids outlets, reuse feedwater) rather than treating them as abstract numbers."
  common_gotchas:
    - "Early PFAS datasets may use non-standard or evolving methods, making trend analysis difficult."
    - "Reporting 'non-detect' without clarifying detection limits relative to MCLs can be misleading."
  what_summaries_lose:
    - "Summaries rarely distinguish between methods or matrices when reporting PFAS ranges."
    - "They often omit detection limits, making risk relative to NPDWR thresholds hard to judge."
  realistic_first_call_ask: true
  source: https://www.epa.gov/cwa-methods/draft-epa-method-1633-pfas
  confidence: high

- id: doc-tclp-splp-report
  name: TCLP/SPLP leaching test report for residuals
  category: lab-analytical
  issued_by: certified environmental laboratory
  access_method:
    - customer-provided
  applies_to_lenses:
    - lens-biosolids-residuals
    - lens-industrial-discharge
  applies_to_subcases:
    - null
  structured_data_fields:
    - test_method_tclp_or_splp
    - analytes
    - leachate_concentrations
    - comparison_to_regulatory_thresholds
    - sample_description
  operator_wisdom_reading_insights:
    - "Use TCLP/SPLP to decide whether residuals qualify as hazardous or pose leaching risks at disposal and beneficial-use sites."
    - "Consider both leachate and total composition when planning outlet changes or co-management with CCR."
  common_gotchas:
    - "Tests may be performed on non-representative samples, especially for heterogeneous residual streams."
    - "Only looking at pass/fail versus thresholds can miss margin and trend information relevant for outlet viability."
  what_summaries_lose:
    - "Summaries usually report only whether materials are 'non-hazardous' without showing leachate data or analyte lists."
    - "They rarely mention test conditions that influence leaching behavior."
  realistic_first_call_ask: false
  source: https://www.epa.gov/hw-sw846/sw-846-test-method-1311-toxicity-characteristic-leaching-procedure
  confidence: medium

- id: doc-process-flow-diagram
  name: Process flow diagram (PFD) and hydraulic profile
  category: operational
  issued_by: utility or consulting engineer
  access_method:
    - customer-provided
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-advanced-reuse
  applies_to_subcases:
    - null
  structured_data_fields:
    - unit_processes
    - flow_paths
    - bypass_routes
    - sampling_locations
    - control_points
    - design_flows_by_branch
  operator_wisdom_reading_insights:
    - "Use PFDs to understand where bottlenecks, bypasses, and critical control points actually sit relative to sampling and monitoring."
    - "Overlay worst-day stories and SCADA data on the PFD to see how flows redistribute under stress."
  common_gotchas:
    - "PFDs can be out of date relative to as-operated configurations."
    - "They may not show temporary or seasonal configurations that drive worst-case conditions."
  what_summaries_lose:
    - "Summaries describe 'conventional activated sludge' or similar shorthand without clarifying sidestreams, recycle flows, or bypasses."
    - "They often omit information on hydraulic pinch points."
  realistic_first_call_ask: true
  source: https://www.abebooks.co.uk/9780071663588/Design-Municipal-Wastewater-Treatment-Plants-0071663584/plp
  confidence: high

- id: doc-water-balance-study
  name: Water balance and I/I study
  category: operational
  issued_by: utility or consulting engineer
  access_method:
    - customer-provided
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-nrw
  applies_to_subcases:
    - null
  structured_data_fields:
    - study_period
    - flow_monitoring_locations
    - dry_weather_vs_wet_weather_flows
    - iandi_estimates
    - recommended_remedial_actions
  operator_wisdom_reading_insights:
    - "Use water-balance/I/I studies to understand how much of peak flow is controllable via collection-system work versus process upgrades."
    - "Check whether recommended I/I reductions have funding and implementation paths or remain wish lists."
  common_gotchas:
    - "Studies may assume rainfall-runoff relationships or meter accuracy that no longer hold."
    - "They can be quickly outdated by growth, climate shifts, or system changes."
  what_summaries_lose:
    - "Summaries usually state only overall I/I percentages or 'we have high I/I' without spatial detail."
    - "They often omit cost and feasibility assessments for I/I reduction options."
  realistic_first_call_ask: false
  source: https://www.epa.gov/npdes/collection-systems
  confidence: medium

- id: doc-ops-logs-scada
  name: Operations logs and SCADA trend exports
  category: operational
  issued_by: utility operations staff
  access_method:
    - customer-provided
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
    - lens-advanced-reuse
  applies_to_subcases:
    - null
  structured_data_fields:
    - timestamped_flows
    - key_process_parameters
    - alarms_and_events
    - setpoint_changes
  operator_wisdom_reading_insights:
    - "SCADA and logs reveal how plants behave on their worst days; use them to validate narratives about stability and control."
    - "Look for chronic alarm conditions or frequent manual interventions as signs of fragility."
  common_gotchas:
    - "Logs may be incomplete, inconsistent, or stored in formats that make long-term trend analysis difficult."
    - "Operators sometimes normalize to frequent alarm states and under-report them in narratives."
  what_summaries_lose:
    - "Summaries seldom mention specific control challenges or recurring alarms."
    - "They often understate how close operations run to capacity during peak events."
  realistic_first_call_ask: false
  source: https://www.epa.gov/npdes/municipal-wastewater
  confidence: medium

- id: doc-capacity-study
  name: Capacity assessment and optimization study
  category: operational
  issued_by: consulting engineer or utility
  access_method:
    - customer-provided
  applies_to_lenses:
    - lens-municipal-wet-weather
  applies_to_subcases:
    - null
  structured_data_fields:
    - evaluated_flows_and_loads
    - unit_process_capacities
    - bottlenecks_identified
    - recommended_upgrades
    - implementation_priorities
  operator_wisdom_reading_insights:
    - "Capacity studies are only as useful as the implementation that follows; check CIPs to see which recommendations were funded."
    - "Focus on stress scenarios and safety factors, not just nominal design capacities."
  common_gotchas:
    - "Studies can rely on flow and load projections that no longer match current conditions."
    - "Some recommendations assume reuse or biosolids outlet strategies that have since become constrained."
  what_summaries_lose:
    - "Summaries often list only headline projects and approximate capacities, not the underlying constraints and risk tradeoffs."
    - "They rarely document what was consciously left unaddressed due to funding limits."
  realistic_first_call_ask: false
  source: https://www.waterrf.org/case-studies
  confidence: high

- id: doc-master-plan
  name: Wastewater or integrated water master plan
  category: utility-side
  issued_by: utility and consulting engineers
  access_method:
    - customer-provided
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-biosolids-residuals
    - lens-advanced-reuse
    - lens-stormwater-ms4
  applies_to_subcases:
    - null
  structured_data_fields:
    - planning_horizon
    - demand_and_flow_projections
    - regulatory_drivers
    - project_portfolio
    - phasing_and_costs
  operator_wisdom_reading_insights:
    - "Use master plans to understand how utilities prioritize regulatory and risk-driven projects relative to growth and optimization."
    - "Discount assumptions in older plans about reuse and biosolids outlets that predate PFAS and other shifts."
  common_gotchas:
    - "Master plans may be aspirational documents, with many projects never advancing to funded CIPs."
    - "They can quickly become outdated when regulations or growth trajectories change."
  what_summaries_lose:
    - "Summaries usually list only major projects and total capital needs."
    - "They rarely show sensitivity analyses, scenario planning, or risk-ranking logic."
  realistic_first_call_ask: false
  source: https://www.waterrf.org/case-studies
  confidence: high

- id: doc-cip
  name: Capital improvement plan (CIP)
  category: utility-side
  issued_by: utility or municipality
  access_method:
    - customer-provided
    - public-budget-documents
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-biosolids-residuals
    - lens-advanced-reuse
    - lens-stormwater-ms4
  applies_to_subcases:
    - null
  structured_data_fields:
    - project_name
    - project_description
    - project_driver
    - start_year
    - completion_year
    - estimated_cost
    - funding_source
  operator_wisdom_reading_insights:
    - "Match projects in the CIP to consent decrees, permit limits, and outlet risks to see what is truly prioritized."
    - "Pay attention to whether high-risk assets and obligations have firm funding or sit in unfunded out-years."
  common_gotchas:
    - "CIPs may not clearly distinguish between adopted, funded projects and aspirational placeholders."
    - "Projects can be repeatedly deferred without obvious changes in CIP labels."
  what_summaries_lose:
    - "Summaries typically emphasize only marquee projects and aggregate capital totals."
    - "They rarely expose tradeoffs or projects dropped from prior CIPs."
  realistic_first_call_ask: true
  source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water
  confidence: high

- id: doc-asset-management-plan
  name: Asset management plan / condition assessment
  category: utility-side
  issued_by: utility or consulting engineer
  access_method:
    - customer-provided
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-stormwater-ms4
  applies_to_subcases:
    - null
  structured_data_fields:
    - asset_inventory
    - condition_ratings
    - criticality_scores
    - renewal_or_replacement_plans
  operator_wisdom_reading_insights:
    - "Use asset-management plans to see whether high-risk treatment and collection assets have realistic renewal schedules."
    - "Cross-check criticality rankings with wet-weather and compliance risks, not just age and failure history."
  common_gotchas:
    - "Some plans are high-level or static, lacking the detail needed for project scoping."
    - "Criticality scoring may undervalue environmental and public-health consequences."
  what_summaries_lose:
    - "Summaries usually present only total backlog and broad categories."
    - "They seldom show which specific assets drive near-term risk."
  realistic_first_call_ask: false
  source: https://www.epa.gov/sustainable-water-infrastructure/asset-management-water-and-wastewater-utilities
  confidence: medium

- id: doc-reuse-engineering-report
  name: Reuse engineering report (Title 22 / DPR)
  category: reuse-specific
  issued_by: utility and consulting engineer
  access_method:
    - customer-provided
  applies_to_lenses:
    - lens-advanced-reuse
  applies_to_subcases:
    - subcase-reuse-nonpotable
    - subcase-reuse-ipr
    - subcase-reuse-dpr
  structured_data_fields:
    - project_type
    - source_waters
    - treatment_trains
    - log_removal_credits
    - monitoring_and_control_strategy
    - environmental_buffer_description
    - residuals_and_concentrate_management
  operator_wisdom_reading_insights:
    - "Focus on worst-case scenarios, alarm logic, and redundancy; these often determine regulator comfort more than nominal performance."
    - "Look for realistic concentrate and residuals solutions; many otherwise strong designs falter on outlets."
  common_gotchas:
    - "Reports may predate PFAS NPDWR and other recent standards, leaving emerging-contaminant management underdeveloped."
    - "Pilot assumptions may not be scaled appropriately into full-scale designs."
  what_summaries_lose:
    - "Summaries emphasize high-level process blocks and branding (e.g., 'AWT') rather than detailed LRVs and response plans."
    - "They often gloss over concentrate, byproduct, and source-control requirements."
  realistic_first_call_ask: true
  source: https://www.fluencecorp.com/california-title-22-water-reuse-standards
  confidence: high

- id: doc-swmp-plan
  name: Stormwater Management Program (SWMP) / MS4 program plan
  category: stormwater-specific
  issued_by: MS4 operator
  access_method:
    - customer-provided
    - state-stormwater-program-portal
  applies_to_lenses:
    - lens-stormwater-ms4
  applies_to_subcases:
    - subcase-ms4-phase1
    - subcase-ms4-phase2
  structured_data_fields:
    - ms4_classification
    - minimum_control_measures
    - program_activities
    - implementation_schedule
    - tmdl_commitments
  operator_wisdom_reading_insights:
    - "Use the SWMP to map how MS4s operationalize permit requirements across departments."
    - "Look for institutionalization versus one-off projects—mature programs embed controls into core operations."
  common_gotchas:
    - "SWMPs can be outdated or aspirational, not reflecting current staffing and funding realities."
    - "TMDL obligations may be mentioned but not backed by credible implementation actions."
  what_summaries_lose:
    - "Summaries often say 'we have a SWMP' without indicating depth, coverage, or implementation status."
    - "They rarely highlight resource gaps or enforcement history."
  realistic_first_call_ask: true
  source: https://www.epa.gov/npdes/stormwater-discharges-municipal-sources
  confidence: high

- id: doc-ms4-annual-report
  name: MS4 annual report
  category: stormwater-specific
  issued_by: MS4 operator
  access_method:
    - customer-provided
    - state-stormwater-program-portal
  applies_to_lenses:
    - lens-stormwater-ms4
  applies_to_subcases:
    - subcase-ms4-phase1
    - subcase-ms4-phase2
  structured_data_fields:
    - reporting_year
    - activities_by_minimum_control_measure
    - implementation_metrics
    - monitoring_results
    - planned_improvements
  operator_wisdom_reading_insights:
    - "Check year-over-year trends to see whether programs are maturing, stagnating, or backsliding."
    - "Look for candid discussion of challenges and enforcement interactions as signals of where risk resides."
  common_gotchas:
    - "Reports can be templated and activity-focused rather than outcomes-focused."
    - "Some MS4s under-report illicit discharges or inspection shortfalls."
  what_summaries_lose:
    - "Summaries rarely capture weak areas or recurring deficiencies."
    - "They often omit TMDL or retrofit progress details."
  realistic_first_call_ask: true
  source: https://epa.illinois.gov/topics/forms/water-permits/storm-water/ms4.html
  confidence: high

- id: doc-decentralized-permit
  name: Onsite / decentralized wastewater permit
  category: decentralized-specific
  issued_by: county or state health/environmental agency
  access_method:
    - customer-provided
    - local-health-department
  applies_to_lenses:
    - lens-decentralized-onsite
  applies_to_subcases:
    - null
  structured_data_fields:
    - permit_id
    - system_type
    - design_flow
    - siting_conditions
    - separation_distances
    - maintenance_requirements
  operator_wisdom_reading_insights:
    - "Use decentralized permits to understand what regulators believed was acceptable at installation, not current performance."
    - "Check whether operating and maintenance requirements are realistic for homeowners or RMEs."
  common_gotchas:
    - "Legacy permits may be minimal or missing for older systems."
    - "Permit conditions may not reflect current groundwater or surface-water protection expectations."
  what_summaries_lose:
    - "Summaries usually say only 'system is permitted' without conditions or age."
    - "They rarely reference setback, soil, or hydraulic constraints."
  realistic_first_call_ask: true
  source: https://www.epa.gov/small-and-rural-wastewater-systems/about-small-wastewater-systems
  confidence: high

- id: doc-decentralized-inspection-report
  name: Decentralized system inspection / maintenance report
  category: decentralized-specific
  issued_by: inspector, pumper, or RME
  access_method:
    - customer-provided
    - local-program-database
  applies_to_lenses:
    - lens-decentralized-onsite
  applies_to_subcases:
    - null
  structured_data_fields:
    - inspection_date
    - system_type
    - observed_deficiencies
    - pumping_or_repair_actions
    - recommended_follow_up
  operator_wisdom_reading_insights:
    - "Inspection histories reveal failure patterns and neglect that aggregate into watershed-scale risks."
    - "High failure rates in particular neighborhoods can indicate design or siting issues, not just homeowner behavior."
  common_gotchas:
    - "Records may be incomplete, especially where pumpers are not required to report."
    - "Subjective condition ratings may vary across inspectors."
  what_summaries_lose:
    - "Summaries typically state only that systems are 'regularly pumped' or 'mostly fine' without quantitative failure data."
    - "They rarely identify clusters of serious deficiencies."
  realistic_first_call_ask: false
  source: https://www.epa.gov/septic/septic-system-impacts-water-sources
  confidence: medium

- id: doc-cdp-water-response
  name: CDP Water Security response (company or utility)
  category: sustainability-esg
  issued_by: company or utility
  access_method:
    - CDP-portal
    - company-website
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  structured_data_fields:
    - water_risks_identified
    - wastewater_and_reuse_metrics
    - risk_mitigation_actions
    - governance_and_responsibilities
  operator_wisdom_reading_insights:
    - "Treat CDP disclosures as signals of how seriously management views water and wastewater risk, not as hard performance data."
    - "Cross-check stated risks and mitigation plans with actual permits, enforcement, and capital programs."
  common_gotchas:
    - "Responses may emphasize reputational or investor-friendly narratives over operational details."
    - "Coverage boundaries can exclude some facilities or activities."
  what_summaries_lose:
    - "Internal summaries often mention only scores or rankings, not the underlying risk statements."
    - "They seldom highlight inconsistencies between CDP responses and regulatory records."
  realistic_first_call_ask: false
  source: https://www.cdp.net/en/guidance/guidance-for-companies/water-security-questionnaire
  confidence: medium

- id: doc-esg-report
  name: ESG / sustainability report (wastewater-relevant sections)
  category: sustainability-esg
  issued_by: company or utility
  access_method:
    - company-website
  applies_to_lenses:
    - all
  applies_to_subcases:
    - null
  structured_data_fields:
    - disclosed_wastewater_projects
    - reuse_targets
    - biosolids_and_pfAS_risks_discussed
    - climate_and_resilience_links
  operator_wisdom_reading_insights:
    - "Use ESG reports to identify public commitments that may constrain or enable project options."
    - "Check whether ESG claims about compliance and risk reduction match regulatory and technical evidence."
  common_gotchas:
    - "ESG metrics may be aggregated or normalized, obscuring facility-level risks."
    - "Reports are not usually independently audited to the level of financial statements."
  what_summaries_lose:
    - "Summaries often cite ESG highlights but omit caveats, scope limitations, and uncertainties."
    - "They rarely enumerate wastewater-specific assumptions or boundaries."
  realistic_first_call_ask: false
  source: https://www.sec.gov/news/press-release/2024-31
  confidence: medium

- id: doc-srf-wifia-agreement
  name: CWSRF/DWSRF or WIFIA financing agreement
  category: funding
  issued_by: state SRF program or US EPA (WIFIA)
  access_method:
    - customer-provided
    - EPA-or-state-announcement
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-stormwater-ms4
    - lens-advanced-reuse
    - lens-biosolids-residuals
  applies_to_subcases:
    - null
  structured_data_fields:
    - agreement_id
    - funded_projects
    - funding_amount
    - key_milestones
    - reporting_requirements
    - special_conditions
  operator_wisdom_reading_insights:
    - "Use financing agreements to see which projects are truly locked in and what schedule or reporting constraints apply."
    - "Slipping milestones can jeopardize funding for core compliance projects."
  common_gotchas:
    - "Agreements may be amended without clear linkage back to planning documents."
    - "Some conditions are embedded in attachments or referenced guidance, not obvious in main text."
  what_summaries_lose:
    - "Summaries usually highlight only total funding and generic project labels."
    - "They rarely describe covenant risk or milestone pressures."
  realistic_first_call_ask: false
  source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water
  confidence: high
```


***

## Section 2: Additional `xcheck-` entities (Artefact 2)

```yaml
- id: xcheck-smr-vs-pretreatment-permit
  primary_document: doc-industrial-smr
  cross_check_against:
    - doc-pretreatment-control-mechanism
  what_to_compare: "Compare SMR sampling parameters, frequencies, and results against categorical standards and local limits in the pretreatment control mechanism to identify under-monitored pollutants and near-limit performance."
  what_conflicts_indicate: "If discharges approach or exceed local limits or categorical standards without corresponding discussion in customer narratives, surface csflag-pretreatment-audit-critical-finding-open or csflag-pfas-industrial-pretreatment-unknown depending on pollutants involved."
  applies_to_lenses:
    - lens-industrial-discharge
    - lens-municipal-wet-weather
  applies_to_flags:
    - csflag-pretreatment-audit-critical-finding-open
    - csflag-pfas-industrial-pretreatment-unknown
  source: https://www.law.cornell.edu/cfr/text/40/403.12
  confidence: high

- id: xcheck-lab-method-vs-permit-method
  primary_document: doc-lab-analytical-report
  cross_check_against:
    - doc-npdes-permit
  what_to_compare: "Compare analytical methods and detection limits in lab reports with those specified or implied in permit conditions and 40 CFR 136."
  what_conflicts_indicate: "If methods are non-approved or detection limits are above permit-required or health-relevant thresholds, surface csflag-edmr-method-change-unexplained or csflag-edmr-consistent-no-data-flags as evidence-quality concerns."
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-industrial-discharge
  applies_to_flags:
    - csflag-edmr-method-change-unexplained
  source: https://www.epa.gov/cwa-methods/approved-cwa-test-methods-questions-and-answers
  confidence: high

- id: xcheck-pfas-lab-vs-npdwr
  primary_document: doc-pfas-lab-report
  cross_check_against:
    - doc-pfas-regulatory-benchmarks
  what_to_compare: "Compare PFAS concentrations across influent, effluent, biosolids, and receiving waters against NPDWR MCLs and applicable state thresholds."
  what_conflicts_indicate: "If PFAS levels are near or above MCLs without source attribution or treatment plans, surface csflag-pfas-source-unknown-near-mcl, csflag-pfas-reuse-feedwater-critical-risk, or csflag-pfas-biosolids-ban-ignored depending on context."
  applies_to_lenses:
    - lens-industrial-discharge
    - lens-municipal-wet-weather
    - lens-biosolids-residuals
    - lens-advanced-reuse
  applies_to_flags:
    - csflag-pfas-source-unknown-near-mcl
    - csflag-pfas-reuse-feedwater-critical-risk
    - csflag-pfas-biosolids-ban-ignored
  source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation
  confidence: high

- id: xcheck-master-plan-vs-cip
  primary_document: doc-master-plan
  cross_check_against:
    - doc-cip
  what_to_compare: "Compare recommended projects and phasing in the master plan with funded projects and timelines in the CIP."
  what_conflicts_indicate: "If high-priority compliance or risk-reduction projects in the master plan are absent or repeatedly deferred in the CIP, surface csflag-biosolids-rule-pipeline-misaligned, csflag-elg-pipeline-investment-misaligned, or csflag-state-rule-pipeline-investment-risk as appropriate."
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-biosolids-residuals
    - lens-advanced-reuse
  applies_to_flags:
    - csflag-biosolids-rule-pipeline-misaligned
    - csflag-elg-pipeline-investment-misaligned
    - csflag-state-rule-pipeline-investment-risk
  source: https://www.waterrf.org/case-studies
  confidence: medium

- id: xcheck-capacity-study-vs-edmr
  primary_document: doc-capacity-study
  cross_check_against:
    - doc-edmr-history
  what_to_compare: "Compare unit-process capacity limits and recommended operating envelopes in the capacity study against actual flows and loads observed in recent DMRs."
  what_conflicts_indicate: "If monitored flows or loads routinely exceed study assumptions or approach recommended caps, surface claim-capacity-adequacy as at-risk and consider csflag-modification-implemented-and-violating where violations are present."
  applies_to_lenses:
    - lens-municipal-wet-weather
  applies_to_flags:
    - csflag-modification-implemented-and-violating
  source: https://www.abebooks.co.uk/9780071663588/Design-Municipal-Wastewater-Treatment-Plants-0071663584/plp
  confidence: high

- id: xcheck-biosolids-permit-vs-annual-report
  primary_document: doc-biosolids-permit
  cross_check_against:
    - doc-biosolids-annual-report
  what_to_compare: "Compare permitted management practices, classification, and monitoring requirements with actual outlets, volumes, and quality reported annually."
  what_conflicts_indicate: "If land application or other outlets are used in ways inconsistent with permit or state guidance (for example PFAS-related restrictions), surface csflag-pfas-biosolids-ban-ignored and claim-biosolids-outlet-viability concerns."
  applies_to_lenses:
    - lens-biosolids-residuals
    - lens-municipal-wet-weather
  applies_to_flags:
    - csflag-pfas-biosolids-ban-ignored
  source: https://www.epa.gov/biosolids/land-application-biosolids
  confidence: high

- id: xcheck-swmp-vs-ms4-annual
  primary_document: doc-swmp-plan
  cross_check_against:
    - doc-ms4-annual-report
  what_to_compare: "Compare SWMP commitments and schedules with reported implementation metrics and activities in recent MS4 annual reports."
  what_conflicts_indicate: "If key minimum control measures or TMDL-related actions are planned but not executed, surface csflag-ms4-tmdl-no-credible-plan and related enforcement-risk flags."
  applies_to_lenses:
    - lens-stormwater-ms4
  applies_to_flags:
    - csflag-ms4-tmdl-no-credible-plan
  source: https://www.epa.gov/npdes/stormwater-discharges-municipal-sources
  confidence: medium

- id: xcheck-decentralized-permits-vs-inspections
  primary_document: doc-decentralized-permit
  cross_check_against:
    - doc-decentralized-inspection-report
  what_to_compare: "Compare permit conditions and design assumptions for onsite systems with actual inspection findings, failure rates, and maintenance histories."
  what_conflicts_indicate: "If many systems permitted under similar conditions show chronic failure or are linked to groundwater or drinking-water impacts, surface csflag-decent-drinking-water-contamination and related decentralized-risk flags."
  applies_to_lenses:
    - lens-decentralized-onsite
  applies_to_flags:
    - csflag-decent-drinking-water-contamination
  source: https://www.epa.gov/septic/septic-system-impacts-water-sources
  confidence: high

- id: xcheck-esg-vs-echo-and-permits
  primary_document: doc-esg-report
  cross_check_against:
    - doc-echo-summary
    - doc-npdes-permit
  what_to_compare: "Compare ESG claims about compliance, reuse, emissions, and environmental risk with permit limits, ECHO violation histories, and enforcement records."
  what_conflicts_indicate: "If ESG narratives assert strong compliance or low risk while ECHO and permits show frequent violations or tight margins, surface csflag-bias-permit-optimism-flag and bias-permit-compliance-optimism."
  applies_to_lenses:
    - all
  applies_to_flags:
    - csflag-bias-permit-optimism-flag
  source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set
  confidence: medium

- id: xcheck-srf-wifia-vs-cip-and-consent-decree
  primary_document: doc-srf-wifia-agreement
  cross_check_against:
    - doc-cip
    - doc-consent-decree
  what_to_compare: "Compare funded project scopes, milestones, and conditions in SRF/WIFIA agreements with CIP project lists and consent-decree requirements."
  what_conflicts_indicate: "If critical decree-driven projects lack aligned funding or funding milestones are at risk, surface csflag-consent-decree-milestones-missed and csflag-biosolids-rule-pipeline-misaligned where solids are involved."
  applies_to_lenses:
    - lens-municipal-wet-weather
    - lens-stormwater-ms4
  applies_to_flags:
    - csflag-consent-decree-milestones-missed
  source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water
  confidence: medium
```


***

## Section 3: Additional `docflag-` entities (Artefact 4)

```yaml
- id: docflag-npdes-permit-renewal-and-mod-triggers
  document: doc-npdes-permit
  surfaces_flags:
    - csflag-renewal-12mo-no-engagement
    - csflag-renewal-180day-deadline-at-risk
    - csflag-renewal-application-late
    - csflag-admin-continuance-with-new-constraints
    - csflag-renewal-expired-no-continuance
    - csflag-modification-planned-change-not-yet-filed
    - csflag-modification-implemented-no-violations
    - csflag-modification-implemented-and-violating
  evidence_pattern_in_document: "Permit cover pages, effective and expiration dates, and change-in-operations clauses show whether renewal windows and modification triggers have been reached; when these details conflict with customer narratives about timing and scope of changes, the agent raises renewal-window and modification-trigger flags and, if violations are evident, stop-level modification flags."
  source: https://www.law.cornell.edu/cfr/text/40/122.21
  confidence: high

- id: docflag-edmr-history-compliance-and-data-gaps
  document: doc-edmr-history
  surfaces_flags:
    - csflag-edmr-method-change-unexplained
    - csflag-edmr-gap-around-upset-event
    - csflag-edmr-consistent-no-data-flags
    - csflag-nov-pattern-resolved-history
    - csflag-enforcement-history-unknown-multisite
  evidence_pattern_in_document: "Time series of DMR/eDMR data show missing periods, unexplained method changes, repeated NODI codes, and clusters of violations; when these patterns coincide with upsets, storms, or enforcement events, the agent surfaces eDMR evidence-quality flags and enforcement-history attention flags even if customers claim 'good compliance'."
  source: https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-and-limit-data-set
  confidence: high

- id: docflag-pretreatment-audit-report-and-smrs
  document: doc-pretreatment-audit-report
  surfaces_flags:
    - csflag-pretreatment-audit-critical-finding-open
    - csflag-pretreatment-audit-critical-finding-causing-violation
    - csflag-pretreatment-audit-program-systemic-weakness
  evidence_pattern_in_document: "Audit reports listing critical findings about local limits, industrial monitoring, or enforcement, especially when tied to specific users or parameters, surface pretreatment flags; when findings tie directly to ongoing violations at the POTW or industrial outfalls, the agent escalates to stop-level pretreatment-audit-critical-finding-causing-violation."
  source: https://www.epa.gov/system/files/documents/2021-07/final_pca_checklist_and_instructions_-feb2010.pdf
  confidence: high

- id: docflag-industrial-smr-and-slug-reports
  document: doc-industrial-smr
  surfaces_flags:
    - csflag-pfas-industrial-pretreatment-unknown
    - csflag-ec-above-advisory-near-intake
    - csflag-ec-above-advisory-nonpotable
  evidence_pattern_in_document: "SMR results showing PFAS, 1,4-dioxane, or other emerging contaminants near advisory or MCL levels without clear pretreatment or source-control descriptions cause PFAS-pretreatment-unknown and emerging-contaminant flags, with severity determined by receptor context (upstream of drinking-water intakes versus non-potable waters)."
  source: https://www.federalregister.gov/documents/2024/04/26/2024-07773/pfas-national-primary-drinking-water-regulation
  confidence: high

- id: docflag-pfas-lab-report-multi-matrix
  document: doc-pfas-lab-report
  surfaces_flags:
    - csflag-pfas-source-unknown-near-mcl
    - csflag-pfas-reuse-feedwater-poor-characterization
    - csflag-pfas-reuse-feedwater-critical-risk
    - csflag-pfas-municipal-influent-rising-trend
  evidence_pattern_in_document: "PFAS lab reports across influent, effluent, reuse feedwater, biosolids, and receiving waters show concentrations close to or above NPDWR MCLs and rising trends without adequate source attribution or treatment plans, triggering PFAS-source-unknown-near-mcl, reuse-feedwater-poor-characterization, feedwater-critical-risk, or rising-trend flags depending on severity and pathway."
  source: https://www.epa.gov/cwa-methods/draft-epa-method-1633-pfas
  confidence: high

- id: docflag-biosolids-permit-and-annual-report
  document: doc-biosolids-annual-report
  surfaces_flags:
    - csflag-pfas-biosolids-ban-ignored
    - csflag-biosolids-rule-pipeline-misaligned
  evidence_pattern_in_document: "Biosolids reports that show significant volumes of land-applied Class B biosolids in states with PFAS-driven bans or in jurisdictions with pending restrictive rules, especially without alternative outlet planning, surface stop-level PFAS-biosolids-ban-ignored flags and specialist-level biosolids-rule-pipeline-misaligned flags."
  source: https://www.nebiosolids.org/maine-bans-land-application
  confidence: high

- id: docflag-master-plan-and-cip-pipeline-risk
  document: doc-master-plan
  surfaces_flags:
    - csflag-elg-pipeline-investment-misaligned
    - csflag-state-rule-pipeline-investment-risk
  evidence_pattern_in_document: "Master plans that recommend capital strategies heavily committed to treatments, outlets, or reuse configurations that do not appear compatible with pending ELG or state PFAS/biosolids rules, especially where CIPs are already aligning funding, trigger pipeline-investment-misaligned attention or specialist flags."
  source: https://www.epa.gov/eg/effluent-guidelines
  confidence: medium

- id: docflag-reuse-engineering-report-reg-path
  document: doc-reuse-engineering-report
  surfaces_flags:
    - csflag-reuse-no-reg-path
    - csflag-pfas-reuse-feedwater-poor-characterization
    - csflag-pfas-reuse-feedwater-critical-risk
    - csflag-state-reuse-rule-effective-soon
  evidence_pattern_in_document: "Reuse engineering reports proposing IPR/DPR in jurisdictions without clear regulatory pathways, with limited PFAS characterization or designs that do not meet emerging criteria, or prepared before imminent state reuse rules, surface no-reg-path and PFAS reuse flags, and state-reuse-rule-effective-soon flags."
  source: https://watereuse.org/ca-dpr-take-effect
  confidence: high

- id: docflag-swmp-and-ms4-annual-tmdl-gaps
  document: doc-ms4-annual-report
  surfaces_flags:
    - csflag-ms4-tmdl-no-credible-plan
    - csflag-state-biosolids-rule-effective-soon
  evidence_pattern_in_document: "MS4 annual reports that acknowledge TMDL obligations but show minimal structural BMP implementation or funding, or that describe reliance on at-risk biosolids or residuals outlets for stormwater-related solids, surface ms4-tmdl-no-credible-plan and, where timing is explicit, state-biosolids-rule-effective-soon."
  source: https://epa.illinois.gov/topics/forms/water-permits/storm-water/ms4.html
  confidence: medium

- id: docflag-decentralized-inspections-and-health-impacts
  document: doc-decentralized-inspection-report
  surfaces_flags:
    - csflag-decent-drinking-water-contamination
    - csflag-state-rule-some-facilities-affected
  evidence_pattern_in_document: "Inspection and failure reports showing high onsite failure rates correlated with well contamination or surface-water impairments, particularly in jurisdictions with stricter onsite rules for some areas but not others, surface decentralized drinking-water-contamination stop flags and state-rule-some-facilities-affected attention flags."
  source: https://www.epa.gov/septic/septic-system-impacts-water-sources
  confidence: high

- id: docflag-esg-and-cdp-bias-signals
  document: doc-esg-report
  surfaces_flags:
    - csflag-bias-permit-optimism-flag
    - bias-permit-compliance-optimism
    - csflag-bias-alarmism-flag
  evidence_pattern_in_document: "ESG and CDP narratives emphasizing strong compliance, low risk, or imminent shutdowns around funding cycles without corroborating evidence in permits, ECHO, or enforcement histories surface permit-optimism and alarmism evidence-quality flags, prompting recalibration of narrative reliability."
  source: https://www.cdp.net/en/guidance/guidance-for-companies/water-security-questionnaire
  confidence: medium

- id: docflag-srf-wifia-milestones-and-decree
  document: doc-srf-wifia-agreement
  surfaces_flags:
    - csflag-elg-effective-soon-no-plan
    - csflag-consent-decree-milestones-missed
    - csflag-elg-effective-soon-noncompliant-design
  evidence_pattern_in_document: "Financing agreements that fund projects needed to satisfy consent decrees or ELG-driven upgrades, but with milestone delays, under-scoped designs relative to forthcoming ELG limits, or weak linkage to decree schedules, surface ELG-effective-soon and consent-decree-milestones-missed flags where progression without redesign would risk noncompliance and stranded assets."
  source: https://www.epa.gov/infrastructure/infrastructure-investment-and-jobs-act-resources-clean-water
  confidence: medium
```


***

Sources reused for these YAML entities include EPA’s NPDES Permit Writers’ Manual, ECHO documentation, and related program pages and rules.[^1]
<span style="display:none">[^2][^3][^4][^5]</span>

<div align="center">⁂</div>

[^1]: https://www.epa.gov/npdes/npdes-permit-writers-manual

[^2]: Perplexity-research-c-water-evidence-doc-landscape-2.md

[^3]: research-c-coverage-completion.md

[^4]: Research-A-YAML-Coverage-Completion-Pass-v1.1-3.md

[^5]: Perplexity-Deep-Research-A-Compliance-and-Safety-Flag-Taxonomy-for-US-Wastewater-Discovery-4.md

