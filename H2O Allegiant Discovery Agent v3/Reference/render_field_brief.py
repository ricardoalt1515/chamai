"""
Prairie Field Brief renderer — consumes brand kit primitives.

This is the validated worked example for the v2 Field Brief design. The renderer
is thin (~250 lines) — it just calls build_field_brief_templates, assembles the
section content from the positioning record (handcrafted here for the Prairie
case), and builds the doc.

To re-render: from within this directory, run `python3 render_field_brief.py`.
Requires the brand kit (h2o-allegiant-brand-brand.py) to be in the parent
directory, which is where it lives in the package layout.

Reference for what the rendered output should look like:
    prairie_field_brief_example.pdf  (the rendered output committed alongside this script)
"""

import os
import sys
import importlib.util

# Locate brand.py — it's expected to be in the parent directory (package root).
_HERE = os.path.dirname(os.path.abspath(__file__))
_BRAND_PY = os.path.join(os.path.dirname(_HERE), 'h2o-allegiant-brand-brand.py')
if not os.path.exists(_BRAND_PY):
    # Dev-environment fallback
    _BRAND_PY = '/home/claude/h2o_v2/brand.py'
if not os.path.exists(_BRAND_PY):
    raise FileNotFoundError(
        f"Could not locate brand.py. Expected at {_BRAND_PY} or "
        "in the parent directory of this script."
    )

_spec = importlib.util.spec_from_file_location('brand', _BRAND_PY)
brand = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(brand)
brand.register_fonts()

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate, NextPageTemplate, PageBreak, Paragraph, Spacer
)
from reportlab.lib.styles import ParagraphStyle

# Pull colours, fonts, and primitives from the dynamically-loaded brand module
BRAND_NAVY = brand.BRAND_NAVY
BRAND_BLUE = brand.BRAND_BLUE
GATE_OPEN = brand.GATE_OPEN
FLAG_STOP = brand.FLAG_STOP
FLAG_SPECIALIST = brand.FLAG_SPECIALIST
LIGHT_BG_GREY = brand.LIGHT_BG_GREY
BODY_TEXT = brand.BODY_TEXT
MUTED_TEXT = brand.MUTED_TEXT
BODY_FONT = brand.BODY_FONT
BODY_BOLD_FONT = brand.BODY_BOLD_FONT
BODY_ITALIC_FONT = brand.BODY_ITALIC_FONT
HEADING_FONT = brand.HEADING_FONT
# v2 Field Brief primitives
LogoMark = brand.LogoMark
StageBadge = brand.StageBadge
InsightBox = brand.InsightBox
section_header = brand.section_header
kill_risk_card = brand.kill_risk_card
action_card = brand.action_card
cost_of_alternative_table = brand.cost_of_alternative_table
cover_block = brand.cover_block
body_paragraph = brand.body_paragraph
build_field_brief_templates = brand.build_field_brief_templates


def build_prairie_field_brief(output_path):
    """Build the Prairie AeroSurface Field Brief using brand-kit primitives."""
    doc = BaseDocTemplate(
        output_path,
        pagesize=LETTER,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.45 * inch,
        bottomMargin=0.45 * inch,
    )
    build_field_brief_templates(
        doc,
        customer_name="Prairie AeroSurface Components LLC — Plant 3",
        stage="Qualify",
    )

    story = []
    # Switch to 'later' template after page 1
    story.append(NextPageTemplate('later'))

    # Cover block
    story.extend(cover_block(
        customer_name="Prairie AeroSurface Components LLC — Plant 3",
        location="South Wichita, Kansas",
        stage="Qualify",
        date_str="2026-05-14",
    ))

    # ============ SECTION 1: WHAT THIS IS ============
    story.append(section_header("What this is", marker_color=BRAND_BLUE))
    story.append(Spacer(1, 2))
    story.append(InsightBox(
        "Customer frames it as 'three abnormal events'. The composite shows exceedances on seven of "
        "nine parameters — chronic envelope, not slug events."
    ))
    story.append(Spacer(1, 2))
    story.append(body_paragraph(
        "Aerospace metal-finishing facility, indirect discharger to municipal POTW. "
        "Categorical user under 40 CFR Part 433. The WW-01 24-hour composite shows hex chrome at 3.4×, "
        "nickel at 3.1×, zinc at 3.0×, cyanide at 1.72× local limits. "
        "<b>The reframe is the deal.</b> If 'events' framing wins, this becomes a $300K "
        "metals-precipitation point-fix; if the chronic-envelope reframe wins, it's a multi-million-dollar "
        "pretreatment redesign with PFAS source-control as phase-2."
    ))
    story.append(Spacer(1, 2))

    # ============ SECTION 2: WHAT WE'D PROPOSE ============
    story.append(section_header("What we'd propose", marker_color=GATE_OPEN))
    story.append(Spacer(1, 2))
    story.append(InsightBox(
        "Pretreatment redesign — Cr<super>6+</super> reduction + cyanide destruction + EQ slug control + "
        "phase-2 PFAS source-control. $3–8M over 18 months. <b>Their $300K alternative costs them ~$4–7M "
        "over 5 years when surcharges, the forced PFAS retrofit, and risk-adjusted enforcement exposure "
        "are priced in.</b>"
    ))
    story.append(Spacer(1, 2))

    # (a) Recommended approach
    story.append(body_paragraph(
        "<b>Recommended approach:</b> redesigned pretreatment train — Cr<super>6+</super> reduction "
        "(bisulfite, upstream of hydroxide), two-stage alkaline-chlorination cyanide destruction with "
        "segregation from acid streams, hydroxide precipitation re-tuned for the Ni/Zn/Cu mix, and "
        "EQ-tank slug control (level interlocks + dump-discipline SOP + continuous pH trim). "
        "~$2–4M capex + design fee. <b>Phase-2:</b> PFAS source-control on the chromate conversion line "
        "+ F006 residuals strategy. ~$1–3M, 12–18 months out."
    ))

    # (b) Why the customer should want this — three paragraphs
    why_lead_style = ParagraphStyle(
        name='WhyLead',
        fontName=BODY_BOLD_FONT,
        fontSize=10,
        leading=12.5,
        textColor=BRAND_NAVY,
        spaceBefore=4,
        spaceAfter=2,
    )
    story.append(Paragraph("Why the customer should want this — the win-win argument:", why_lead_style))
    story.append(body_paragraph(
        "<b>Permanent compliance, not a 12-month band-aid.</b> A redesigned train sized to the actual "
        "chemistry takes Prairie from chronic non-compliance to permanent compliance across all 7 "
        "parameters. Eliminates ongoing surcharges (~$120K/yr at observed mass loading), takes them "
        "off the POTW's repeat-violator track, and ends the operator burden of running a train that "
        "was never sized for this chemistry."
    ))
    story.append(body_paragraph(
        "<b>PFAS handled before it becomes a forced retrofit.</b> 6:2 FTS dominance + tightening federal "
        "effluent guidelines for chrome platers mean aerospace finishers will be required to source-control "
        "within 24–36 months. Doing it now as committed phase-2 is ~40% cheaper than a forced retrofit "
        "and avoids a second plant shutdown."
    ))
    story.append(body_paragraph(
        "<b>HCN risk neutralised.</b> Segregating cyanide destruction from acid streams closes the active "
        "HCN-evolution pathway — material reduction in OSHA exposure and the underlying criminal-liability "
        "tail."
    ))

    # (c) Cost-of-alternative table
    compare_lead_style = ParagraphStyle(
        name='CompareLead',
        fontName=BODY_BOLD_FONT,
        fontSize=10,
        leading=12.5,
        textColor=BRAND_NAVY,
        spaceBefore=4,
        spaceAfter=3,
    )
    story.append(Paragraph("Cost of the alternative — fully priced over 5 years:", compare_lead_style))
    story.append(cost_of_alternative_table([
        ("Cost component", "Their $300K point-fix path", "Our proposal"),
        ("Capex (year 0)", "$300K — metals precipitation only",
         "$2–4M — full train + EQ control"),
        ("Sewer-use surcharges, 5yr", "~$600K — 4 of 7 params still exceed",
         "~$0 — back inside limits"),
        ("Forced PFAS retrofit, yr 2–3", "$1.5–2.5M — at higher emergency cost",
         "Included in phase-2 ($1–3M)"),
        ("Risk-adjusted enforcement", "$500K–1.5M — NOV + Consent Order tail",
         "~$50K — minimal residual"),
        ("HCN incident exposure", "Material, uncapped — open pathway",
         "Neutralised by segregation"),
        ("<b>5-year total (mid-range)</b>", "<b>~$4–7M + HCN tail risk</b>",
         "<b>~$3–7M, risk extinguished</b>"),
    ]))

    # (d) Deal-size sensitivity
    sensitivity_style = ParagraphStyle(
        name='Sensitivity',
        fontName=BODY_ITALIC_FONT,
        fontSize=8.5,
        leading=11,
        textColor=MUTED_TEXT,
        spaceBefore=4,
        spaceAfter=2,
    )
    story.append(Paragraph(
        "<i>Deal-size sensitivity (within our $3–8M range): scope of redesign drives ~3× from "
        "point-fix to full train; committed phase-2 PFAS adds ~$2M + 12mo; recurring "
        "monitoring/SOP/training contract adds $200–500K/yr. Confirming plant flows (action #2) "
        "tightens the range.</i>",
        sensitivity_style,
    ))
    story.append(Spacer(1, 2))

    # Force page break — Sections 3 & 4 sit together on page 2
    story.append(PageBreak())

    # ============ SECTION 3: WHAT COULD KILL IT ============
    story.append(section_header("What could kill it", marker_color=FLAG_STOP))
    story.append(Spacer(1, 2))
    story.append(InsightBox(
        "The framing battle is the #1 kill risk. If 'three events' wins on Thursday, you lose this "
        "deal to a $300K point-fix vendor."
    ))
    story.append(Spacer(1, 2))
    story.append(kill_risk_card(
        rank=1,
        name="The customer's 'events' framing wins",
        mechanism="If the environmental manager pushes the slug-event story in the conversation and "
                  "you don't reframe to chronic, a metals-precipitation vendor closes a point-fix at "
                  "1/10 the scope.",
        mitigation='Open Thursday with "I\'ve looked at the WW-01 composite — this isn\'t three events," '
                   "and walk them through the 7-parameter exceedance directly.",
    ))
    story.append(kill_risk_card(
        rank=2,
        name="POTW enforcement posture goes hot or cold",
        mechanism="Formal NOV or Consent Order spikes urgency but may force a fast point-fix; informal "
                  "posture drops deal pace and the deal can drift 12+ months.",
        mitigation="Get the city's posture in writing within 7 days; size the deal to whichever way it lands.",
    ))
    story.append(kill_risk_card(
        rank=3,
        name="HCN safety incident before close",
        mechanism="Legacy cyanide line + documented EQ-tank pH 4.2 = active HCN-evolution pathway. "
                  "An incident routes the conversation to emergency response and a different vendor.",
        mitigation="Surface the safety angle Thursday explicitly — credibility builder, protects against "
                   "incident-driven loss.",
    ))
    story.append(Spacer(1, 2))

    # ============ SECTION 4: DO THIS NEXT ============
    story.append(section_header("Do this next", marker_color=BRAND_NAVY))
    story.append(Spacer(1, 2))
    story.append(InsightBox(
        "Thursday's reframe call is the single highest-leverage move. Everything else calibrates around it."
    ))
    story.append(Spacer(1, 2))
    story.append(action_card(
        n=1,
        action_text="Call the environmental manager with the chronic-envelope reframe",
        timeframe="Thursday",
        supporting_text='Open with "I\'ve looked at the WW-01 composite — this isn\'t three events, '
                        'it\'s a chronic discharge envelope." Lead the conversation; don\'t accept their '
                        "framing. Request the Playbook separately for the question structure.",
    ))
    story.append(action_card(
        n=2,
        action_text="Pull the ECHO record for the receiving POTW",
        timeframe="by Friday",
        supporting_text="Public data, 30 minutes of work. Tells you the city's enforcement track "
                        "record, prior NOVs, recent consent orders. Calibrates regulatory urgency.",
    ))
    story.append(action_card(
        n=3,
        action_text="Identify the corporate EHS approver for capex above $500K",
        timeframe="by next Monday",
        supporting_text="A $3–8M deal needs corporate EHS sign-off. Find them before you're 4 "
                        "conversations deep — common deal-killer is reaching approval and finding "
                        "the approver was never engaged.",
    ))

    doc.build(story)
    return output_path


if __name__ == '__main__':
    out = os.path.join(_HERE, 'prairie_field_brief_example.pdf')
    build_prairie_field_brief(out)
    print(f"Wrote {out} ({os.path.getsize(out):,} bytes)")
