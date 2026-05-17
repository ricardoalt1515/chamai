"""
H2O Allegiant — brand.py

Visual identity primitives for the Discovery Agent's PDF outputs.
Consumed by `h2o-field-brief` (v2 primary) and on-demand follow-on renderers
(Playbook, Analytical Read, Proposal Shell).

Defines:
- Three-tier colour palette (primary brand, functional accents, chart tertiary)
- Font registration with Helvetica fallback (Inter / Inter Tight / JetBrains Mono)
- Paragraph styles for the type scale
- v1.2-era callout primitives (gate, flag, strategic insight, why-it-matters, theme header)
  — retained for the on-demand follow-ons (Analytical Read, Playbook) which preserve v1.2 structure
- v1.2-era cover-block templates (Analytical, Playbook) — retained for follow-ons.
  `ideation_cover` retained but unused in v2 (Ideation Brief was retired in the v2 architecture).
- v2 Field Brief primitives (added below the v1.2 set):
  LogoMark, StageBadge, InsightBox, section_header, kill_risk_card, action_card,
  cost_of_alternative_table, cover_block, later_page_header, build_field_brief_templates
- Pre-built table styles (comparison, decision-maker matrix, solution fit)

See SKILL.md for rationale and usage rules.
"""

import os
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch, mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Flowable, Frame, NextPageTemplate, PageBreak,
    PageTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether,
)


# =============================================================================
# TIER 1 — PRIMARY BRAND COLOURS (from the H2O Allegiant logo)
# =============================================================================

BRAND_NAVY = HexColor('#03045E')       # Allegiant wordtext, primary headers
BRAND_BLUE = HexColor('#0090F0')       # H2O wordtext, droplet body, accents
BRAND_CYAN = HexColor('#ADFDFF')       # Droplet highlight, strategic-insight bg


# =============================================================================
# TIER 2 — FUNCTIONAL ACCENTS (gate, flags, text)
# =============================================================================

# Gate-status traffic light
GATE_OPEN = HexColor('#15803D')        # Forest green — all criteria met
GATE_CONDITIONAL = HexColor('#D97706') # Amber — open with conditions or mixed
GATE_CLOSED = HexColor('#B91C1C')      # Cherry red — one or more criteria fail

# Flag severities (h2o-compliance-and-safety-flagging consolidated inventory)
FLAG_STOP = HexColor('#B91C1C')        # Red (matches GATE_CLOSED severity weight)
FLAG_SPECIALIST = HexColor('#D97706')  # Amber
FLAG_ATTENTION = HexColor('#CA8A04')   # Yellow-gold
FLAG_CLEAR = HexColor('#64748B')       # Neutral slate — "no active flags"

# Text and structural
MUTED_TEXT = HexColor('#64748B')       # Evidence tags, footnotes, captions
BODY_TEXT = HexColor('#0F172A')        # Body copy — near-black with cool tone

# Backgrounds and borders
LIGHT_BG_NAVY = HexColor('#E8E9F4')    # Navy tint for callout backgrounds
LIGHT_BG_CYAN = HexColor('#F0FDFF')    # Cyan tint for strategic-insight callout
LIGHT_BG_GREY = HexColor('#F8FAFC')    # Generic light grey for soft callouts
BORDER_NEUTRAL = HexColor('#CBD5E1')   # Subtle border for tables and callouts
WHITE = colors.white


# =============================================================================
# TIER 3 — CHART ACCENT PALETTE (data viz, in order)
# =============================================================================

CHART_BLUE = HexColor('#0090F0')       # Brand blue (matches BRAND_BLUE)
CHART_TEAL = HexColor('#0D9488')       # Teal — pairs with brand blue
CHART_SLATE = HexColor('#475569')      # Slate grey — neutral series
CHART_PURPLE = HexColor('#7C3AED')     # Soft purple — distinct categories
CHART_GOLD = HexColor('#CA8A04')       # Muted gold (matches FLAG_ATTENTION)
CHART_CORAL = HexColor('#E11D48')      # Soft coral — for decline/negative
CHART_FOREST = HexColor('#15803D')     # Forest green (matches GATE_OPEN)

CHART_PALETTE = [
    CHART_BLUE, CHART_TEAL, CHART_SLATE, CHART_PURPLE,
    CHART_GOLD, CHART_CORAL, CHART_FOREST,
]


# =============================================================================
# FONT REGISTRATION (Inter / Inter Tight / JetBrains Mono with Helvetica fallback)
# =============================================================================

# Font name constants — set by register_fonts() based on what's available
HEADING_FONT = 'Helvetica-Bold'        # Default fallback
BODY_FONT = 'Helvetica'                # Default fallback
BODY_BOLD_FONT = 'Helvetica-Bold'      # Default fallback
BODY_ITALIC_FONT = 'Helvetica-Oblique' # Default fallback
MONO_FONT = 'Courier'                  # Default fallback

# Internal: track whether brand fonts loaded successfully
_FONTS_REGISTERED = False
_USING_BRAND_FONTS = False

# Candidate font file paths (production deployments install here; dev can skip)
_FONT_SEARCH_PATHS = [
    Path('./fonts'),                              # Working dir override
    Path.home() / '.fonts',                       # User-installed
    Path('/usr/share/fonts/truetype'),            # Linux system fonts
    Path('/usr/share/fonts/opentype'),
    Path('/Library/Fonts'),                       # macOS system fonts
    Path.home() / 'Library/Fonts',                # macOS user fonts
]

_FONT_MAP = {
    # name -> list of filename candidates to search for
    'Inter': ['Inter-Regular.ttf', 'Inter-Regular.otf', 'Inter.ttf'],
    'Inter-Bold': ['Inter-Bold.ttf', 'Inter-Bold.otf'],
    'Inter-Italic': ['Inter-Italic.ttf', 'Inter-Italic.otf'],
    'Inter-Tight-Bold': ['InterTight-Bold.ttf', 'InterTight-Bold.otf',
                         'Inter-Tight-Bold.ttf'],
    'JetBrainsMono': ['JetBrainsMono-Regular.ttf', 'JetBrainsMono.ttf',
                      'JetBrainsMonoNL-Regular.ttf'],
}


def _find_font_file(candidates):
    """Search _FONT_SEARCH_PATHS for the first matching font file."""
    for path in _FONT_SEARCH_PATHS:
        if not path.exists():
            continue
        for candidate in candidates:
            # Direct match
            direct = path / candidate
            if direct.exists():
                return str(direct)
            # Recursive search (font directories often have subdirs)
            for found in path.rglob(candidate):
                return str(found)
    return None


def register_fonts():
    """
    Attempt to register Inter, Inter Tight, and JetBrains Mono fonts.

    Updates the module-level font name constants if registration succeeds;
    falls back to Helvetica/Courier defaults if not.

    Returns True if brand fonts loaded, False if using fallback.
    """
    global HEADING_FONT, BODY_FONT, BODY_BOLD_FONT, BODY_ITALIC_FONT, MONO_FONT
    global _FONTS_REGISTERED, _USING_BRAND_FONTS

    if _FONTS_REGISTERED:
        return _USING_BRAND_FONTS

    registered_count = 0

    # Body font (Inter regular)
    inter_path = _find_font_file(_FONT_MAP['Inter'])
    if inter_path:
        try:
            pdfmetrics.registerFont(TTFont('Inter', inter_path))
            BODY_FONT = 'Inter'
            registered_count += 1
        except Exception:
            pass

    # Body bold (Inter bold)
    inter_bold_path = _find_font_file(_FONT_MAP['Inter-Bold'])
    if inter_bold_path:
        try:
            pdfmetrics.registerFont(TTFont('Inter-Bold', inter_bold_path))
            BODY_BOLD_FONT = 'Inter-Bold'
            registered_count += 1
        except Exception:
            pass

    # Body italic (Inter italic)
    inter_italic_path = _find_font_file(_FONT_MAP['Inter-Italic'])
    if inter_italic_path:
        try:
            pdfmetrics.registerFont(TTFont('Inter-Italic', inter_italic_path))
            BODY_ITALIC_FONT = 'Inter-Italic'
            registered_count += 1
        except Exception:
            pass

    # Heading font (Inter Tight Bold, falls back to Inter Bold)
    inter_tight_path = _find_font_file(_FONT_MAP['Inter-Tight-Bold'])
    if inter_tight_path:
        try:
            pdfmetrics.registerFont(TTFont('Inter-Tight-Bold', inter_tight_path))
            HEADING_FONT = 'Inter-Tight-Bold'
            registered_count += 1
        except Exception:
            HEADING_FONT = BODY_BOLD_FONT
    elif BODY_BOLD_FONT == 'Inter-Bold':
        HEADING_FONT = 'Inter-Bold'  # Fall back to Inter Bold

    # Monospace (JetBrains Mono)
    mono_path = _find_font_file(_FONT_MAP['JetBrainsMono'])
    if mono_path:
        try:
            pdfmetrics.registerFont(TTFont('JetBrainsMono', mono_path))
            MONO_FONT = 'JetBrainsMono'
            registered_count += 1
        except Exception:
            pass

    _FONTS_REGISTERED = True
    _USING_BRAND_FONTS = registered_count >= 2  # At least Inter + one variant
    return _USING_BRAND_FONTS


# =============================================================================
# PARAGRAPH STYLES (type scale)
# =============================================================================

def get_styles():
    """
    Return a dict of named ParagraphStyles ready for use.

    Calls register_fonts() if not already done.
    """
    register_fonts()

    return {
        # Headings
        'h1': ParagraphStyle(
            name='H1', fontName=HEADING_FONT, fontSize=18, leading=22,
            textColor=BRAND_NAVY, spaceAfter=8, spaceBefore=4,
        ),
        'h2': ParagraphStyle(
            name='H2', fontName=HEADING_FONT, fontSize=14, leading=18,
            textColor=BRAND_NAVY, spaceAfter=6, spaceBefore=12,
        ),
        'h3': ParagraphStyle(
            name='H3', fontName=BODY_BOLD_FONT, fontSize=11, leading=14,
            textColor=BRAND_NAVY, spaceAfter=4, spaceBefore=6,
        ),
        # Body
        'body': ParagraphStyle(
            name='Body', fontName=BODY_FONT, fontSize=10, leading=13,
            textColor=BODY_TEXT, spaceAfter=4,
        ),
        'body_bold': ParagraphStyle(
            name='BodyBold', fontName=BODY_BOLD_FONT, fontSize=10, leading=13,
            textColor=BODY_TEXT, spaceAfter=4,
        ),
        'body_italic': ParagraphStyle(
            name='BodyItalic', fontName=BODY_ITALIC_FONT, fontSize=10,
            leading=13, textColor=BODY_TEXT, spaceAfter=4,
        ),
        # Mono (evidence tags, IDs)
        'mono_small': ParagraphStyle(
            name='MonoSmall', fontName=MONO_FONT, fontSize=9, leading=11,
            textColor=MUTED_TEXT, spaceAfter=2,
        ),
        # Captions and muted metadata
        'caption': ParagraphStyle(
            name='Caption', fontName=BODY_FONT, fontSize=9, leading=11,
            textColor=MUTED_TEXT, spaceAfter=4,
        ),
        # Cover-block elements
        'header_line': ParagraphStyle(
            name='HeaderLine', fontName=BODY_FONT, fontSize=9, leading=12,
            textColor=MUTED_TEXT, spaceAfter=2,
        ),
        'cover_title': ParagraphStyle(
            name='CoverTitle', fontName=HEADING_FONT, fontSize=18, leading=22,
            textColor=BRAND_NAVY, spaceAfter=4, spaceBefore=4,
        ),
        'cover_subtitle': ParagraphStyle(
            name='CoverSubtitle', fontName=BODY_ITALIC_FONT, fontSize=11,
            leading=14, textColor=MUTED_TEXT, spaceAfter=12,
        ),
        # Strategic insight callout (centred, italic, larger)
        'strategic_insight': ParagraphStyle(
            name='StrategicInsight', fontName=BODY_ITALIC_FONT, fontSize=13,
            leading=17, textColor=BRAND_NAVY, alignment=TA_CENTER,
            spaceAfter=4, spaceBefore=4,
        ),
        # Callout title (used inside coloured-bar callouts)
        'callout_title': ParagraphStyle(
            name='CalloutTitle', fontName=BODY_BOLD_FONT, fontSize=10,
            leading=13, textColor=BODY_TEXT, spaceAfter=4,
        ),
        # Theme header for Playbook
        'theme_number': ParagraphStyle(
            name='ThemeNumber', fontName=HEADING_FONT, fontSize=20,
            leading=24, alignment=TA_LEFT, spaceAfter=0,
        ),
        'theme_title': ParagraphStyle(
            name='ThemeTitle', fontName=HEADING_FONT, fontSize=14,
            leading=18, textColor=BRAND_NAVY, spaceAfter=2,
        ),
        'theme_framing': ParagraphStyle(
            name='ThemeFraming', fontName=BODY_ITALIC_FONT, fontSize=11,
            leading=14, textColor=MUTED_TEXT, spaceAfter=8,
        ),
    }


# =============================================================================
# CALLOUT COMPONENTS
# =============================================================================

# Gate state -> (bar colour, light tint background, title)
_GATE_STATE_MAP = {
    'OPEN': (GATE_OPEN, HexColor('#E8F5EC'), 'QUALIFICATION GATE — OPEN'),
    'OPEN-WITH-CONDITIONS': (GATE_CONDITIONAL, HexColor('#FDF2E1'),
                              'QUALIFICATION GATE — OPEN (with conditions)'),
    'CONDITIONALLY-OPEN': (GATE_CONDITIONAL, HexColor('#FDF2E1'),
                            'QUALIFICATION GATE — CONDITIONALLY OPEN'),
    'CLOSED': (GATE_CLOSED, HexColor('#FBE7E7'), 'QUALIFICATION GATE — CLOSED'),
}

# Flag severity -> (bar colour, light tint background, title prefix)
_FLAG_SEVERITY_MAP = {
    'STOP': (FLAG_STOP, HexColor('#FBE7E7'), 'COMPLIANCE & SAFETY — STOP'),
    'SPECIALIST': (FLAG_SPECIALIST, HexColor('#FDF2E1'),
                   'COMPLIANCE & SAFETY — SPECIALIST'),
    'ATTENTION': (FLAG_ATTENTION, HexColor('#FDF7E1'),
                  'COMPLIANCE & SAFETY — ATTENTION'),
    'CLEAR': (FLAG_CLEAR, LIGHT_BG_GREY, 'COMPLIANCE & SAFETY — NO ACTIVE FLAGS'),
}


def gate_callout(state, content):
    """
    Render a coloured-bar callout for the qualification gate state.

    Args:
        state: One of 'OPEN', 'OPEN-WITH-CONDITIONS', 'CONDITIONALLY-OPEN', 'CLOSED'.
        content: String describing the gate state details.

    Returns:
        A reportlab Table flowable that can be added to a story.
    """
    styles = get_styles()
    state = state.upper().replace('_', '-')
    if state not in _GATE_STATE_MAP:
        state = 'CLOSED'  # Conservative default if mislabeled
    bar_color, bg_color, title = _GATE_STATE_MAP[state]

    title_para = Paragraph(f"<b>{title}</b>", styles['callout_title'])
    body_para = Paragraph(content, styles['body'])

    inner = Table(
        [[title_para], [body_para]],
        colWidths=[6.3 * inch],
        style=TableStyle([
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (0, 0), 6),
            ('BOTTOMPADDING', (0, -1), (-1, -1), 6),
        ]),
    )

    # Coloured bar on left + inner content
    outer = Table(
        [[' ', inner]],
        colWidths=[0.08 * inch, 6.42 * inch],
        style=TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), bar_color),
            ('BACKGROUND', (1, 0), (1, 0), bg_color),
            ('BOX', (0, 0), (-1, -1), 0.5, bar_color),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]),
    )
    return outer


def flag_callout(severity, content, flags_list):
    """
    Render the compliance-and-safety flag callout.

    Args:
        severity: One of 'STOP', 'SPECIALIST', 'ATTENTION', 'CLEAR'.
        content: String describing the overall flag state.
        flags_list: List of (flag_id, severity_label, evidence_pattern) tuples;
                    empty list for CLEAR state.

    Returns:
        A reportlab Table flowable.
    """
    styles = get_styles()
    severity = severity.upper()
    if severity not in _FLAG_SEVERITY_MAP:
        severity = 'CLEAR'
    bar_color, bg_color, title = _FLAG_SEVERITY_MAP[severity]

    elements = [Paragraph(f"<b>{title}</b>", styles['callout_title'])]
    if content:
        elements.append(Paragraph(content, styles['body']))

    # Per-flag lines (one per active flag)
    for flag_id, flag_severity, evidence in flags_list:
        line = (f'<font name="{MONO_FONT}" color="#64748B">{flag_id}</font> '
                f'<b>{flag_severity}</b> — {evidence}')
        elements.append(Paragraph(line, styles['body']))

    inner = Table(
        [[el] for el in elements],
        colWidths=[6.3 * inch],
        style=TableStyle([
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (0, 0), 6),
            ('BOTTOMPADDING', (0, -1), (-1, -1), 6),
        ]),
    )

    outer = Table(
        [[' ', inner]],
        colWidths=[0.08 * inch, 6.42 * inch],
        style=TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), bar_color),
            ('BACKGROUND', (1, 0), (1, 0), bg_color),
            ('BOX', (0, 0), (-1, -1), 0.5, bar_color),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]),
    )
    return outer


def strategic_insight_callout(text):
    """
    Render the closing strategic-insight callout.

    Centred italic in a bordered box with light cyan background.

    Args:
        text: The single-sentence strategic insight.

    Returns:
        A reportlab Table flowable.
    """
    styles = get_styles()
    para = Paragraph(text, styles['strategic_insight'])

    callout = Table(
        [[para]],
        colWidths=[6.5 * inch],
        style=TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), LIGHT_BG_CYAN),
            ('BOX', (0, 0), (-1, -1), 1, BRAND_BLUE),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]),
    )
    return callout


def why_it_matters_callout(items):
    """
    Render a "Why it matters" callout at the end of a Playbook theme.

    Typographic discipline only — bold title in brand navy, no decorative glyphs.
    A small brand-blue accent line above the title provides visual anchoring.

    Args:
        items: List of strings, each a short implication (2-4 items typical).

    Returns:
        A reportlab Table flowable.
    """
    styles = get_styles()
    # Title in brand navy, bold — no emoji
    title_style = ParagraphStyle(
        name='WhyItMattersTitle', parent=styles['body_bold'],
        textColor=BRAND_NAVY,
    )
    title = Paragraph("<b>Why it matters</b>", title_style)
    bullets = [Paragraph(f"• {item}", styles['body']) for item in items]

    inner = Table(
        [[el] for el in [title] + bullets],
        colWidths=[6.3 * inch],
        style=TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), LIGHT_BG_GREY),
            # Thin brand-blue accent line at the top — replaces the emoji as visual anchor
            ('LINEABOVE', (0, 0), (-1, 0), 1.5, BRAND_BLUE),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (0, 0), 6),
            ('BOTTOMPADDING', (0, -1), (-1, -1), 6),
        ]),
    )
    return inner


def theme_header(number, title, framing_line):
    """
    Render a Playbook theme header with cycling accent colour.

    Theme number -> accent colour via CHART_PALETTE; themes 8-11 reuse positions
    1-4 at reduced visual weight (via opacity is not directly supported in
    reportlab, so we use lighter hex variants).

    Args:
        number: Theme number (1-11).
        title: Theme title (e.g., "Service area, flow, and scale").
        framing_line: The italic framing line.

    Returns:
        A reportlab Table flowable.
    """
    styles = get_styles()

    # Cycle: themes 1-7 use CHART_PALETTE[0-6]; themes 8-11 reuse 0-3
    accent_index = (number - 1) % 7
    accent_color = CHART_PALETTE[accent_index]

    # Numbered indicator with accent colour
    num_style = ParagraphStyle(
        name=f'ThemeNum{number}', parent=styles['theme_number'],
        textColor=accent_color,
    )
    num_para = Paragraph(f"<b>{number}</b>", num_style)
    title_para = Paragraph(f"<b>{title}</b>", styles['theme_title'])
    framing_para = Paragraph(f"<i>{framing_line}</i>", styles['theme_framing'])

    # Two-column layout: number on left, title and framing on right
    header = Table(
        [
            [num_para, title_para],
            ['', framing_para],
        ],
        colWidths=[0.5 * inch, 6.0 * inch],
        style=TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('SPAN', (0, 0), (0, 1)),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            # Accent bar under the header
            ('LINEBELOW', (0, 1), (-1, 1), 1, accent_color),
        ]),
    )
    return header


# =============================================================================
# COVER BLOCK TEMPLATES
# =============================================================================

def _shared_header_line(text):
    """Build the shared header line that appears at the top of every PDF."""
    styles = get_styles()
    return Paragraph(text, styles['header_line'])


def ideation_cover(header_line, title, subtitle, substreams,
                   gate_state, gate_content,
                   flag_severity, flag_content, flags_list):
    """
    Build the cover block for an Ideation Brief PDF.

    Returns a list of Flowables ready to extend the story.

    Args:
        header_line: Shared header line (customer, date, etc.)
        title: PDF title (e.g., "Ideation Brief — Wet-weather + biosolids cluster")
        subtitle: Italic subtitle
        substreams: One-line description of sub-streams covered
        gate_state: Gate state for callout
        gate_content: Gate state content
        flag_severity: Flag severity for callout
        flag_content: Flag callout content
        flags_list: List of active flags
    """
    styles = get_styles()
    return [
        _shared_header_line(header_line),
        Spacer(1, 8),
        Paragraph(title, styles['cover_title']),
        Paragraph(subtitle, styles['cover_subtitle']),
        Paragraph(f"<i>Sub-streams: {substreams}</i>", styles['caption']),
        Spacer(1, 12),
        gate_callout(gate_state, gate_content),
        Spacer(1, 6),
        flag_callout(flag_severity, flag_content, flags_list),
        Spacer(1, 14),
    ]


def analytical_cover(header_line, title, subtitle, substreams,
                     gate_state, gate_content,
                     flag_severity, flag_content, flags_list):
    """
    Build the cover block for an Analytical Read PDF.

    Same structure as Ideation cover; provided as a separate function for
    semantic clarity and future divergence (e.g., evidence-base summary in cover).
    """
    return ideation_cover(
        header_line, title, subtitle, substreams,
        gate_state, gate_content,
        flag_severity, flag_content, flags_list,
    )


def playbook_cover(header_line, title, subtitle, substreams, orientation_line):
    """
    Build the cover block for a Call Playbook PDF.

    Playbook has no gate or flag callouts — it's a tool, not a record.
    Includes an orientation line for use during the customer call.

    Returns a list of Flowables.
    """
    styles = get_styles()

    # Orientation callout — light grey, bordered, italic
    orientation_para = Paragraph(orientation_line, styles['body_italic'])
    orientation_callout = Table(
        [[orientation_para]],
        colWidths=[6.5 * inch],
        style=TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), LIGHT_BG_GREY),
            ('BOX', (0, 0), (-1, -1), 0.5, BORDER_NEUTRAL),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]),
    )

    return [
        _shared_header_line(header_line),
        Spacer(1, 8),
        Paragraph(title, styles['cover_title']),
        Paragraph(subtitle, styles['cover_subtitle']),
        Paragraph(f"<i>Sub-streams: {substreams}</i>", styles['caption']),
        Spacer(1, 12),
        orientation_callout,
        Spacer(1, 14),
    ]


# =============================================================================
# TABLE STYLES
# =============================================================================

COMPARISON_TABLE_STYLE = TableStyle([
    # Header row
    ('BACKGROUND', (0, 0), (-1, 0), BRAND_NAVY),
    ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),  # Always available; overridden if Inter loaded
    ('FONTSIZE', (0, 0), (-1, 0), 10),
    ('ALIGN', (0, 0), (-1, 0), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    # Body cells
    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 1), (-1, -1), 10),
    ('TEXTCOLOR', (0, 1), (-1, -1), BODY_TEXT),
    # Zebra stripes
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_BG_GREY]),
    # Grid
    ('GRID', (0, 0), (-1, -1), 0.5, BORDER_NEUTRAL),
    # Padding
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
])


DECISION_MAKER_MATRIX_STYLE = TableStyle([
    # Header row
    ('BACKGROUND', (0, 0), (-1, 0), BRAND_NAVY),
    ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 10),
    ('ALIGN', (0, 0), (-1, 0), 'LEFT'),
    # Header column (left column, body rows)
    ('BACKGROUND', (0, 1), (0, -1), LIGHT_BG_NAVY),
    ('TEXTCOLOR', (0, 1), (0, -1), BRAND_NAVY),
    ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
    # Body cells
    ('FONTNAME', (1, 1), (-1, -1), 'Helvetica'),
    ('FONTSIZE', (1, 1), (-1, -1), 10),
    ('TEXTCOLOR', (1, 1), (-1, -1), BODY_TEXT),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
    # Grid
    ('GRID', (0, 0), (-1, -1), 0.5, BORDER_NEUTRAL),
    # Padding
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
])


SOLUTION_FIT_TABLE_STYLE = TableStyle([
    # Header row
    ('BACKGROUND', (0, 0), (-1, 0), BRAND_NAVY),
    ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 10),
    ('ALIGN', (0, 0), (-1, 0), 'LEFT'),
    # Body
    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 1), (-1, -1), 10),
    ('TEXTCOLOR', (0, 1), (-1, -1), BODY_TEXT),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    # Grid
    ('GRID', (0, 0), (-1, -1), 0.5, BORDER_NEUTRAL),
    # Padding
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
])


# Helper for solution-fit cells — caller wraps in fit_cell() to get coloured bg
def fit_cell_color(fit):
    """
    Return the appropriate background tint for a solution-fit cell.

    Args:
        fit: '✓', 'borderline', or '✗' (or string variants)

    Returns:
        Hex color for cell background, or None for default white.
    """
    fit_lower = str(fit).lower().strip()
    if fit_lower in ('✓', 'yes', 'fit', 'good'):
        return HexColor('#E8F5EC')  # Light green tint
    elif fit_lower in ('borderline', 'maybe', '~'):
        return HexColor('#FDF2E1')  # Light amber tint
    elif fit_lower in ('✗', 'no', 'misfit', 'bad'):
        return HexColor('#FBE7E7')  # Light red tint
    return None


# =============================================================================
# PAGE SETUP HELPERS
# =============================================================================

PAGE_SIZE = LETTER
PAGE_WIDTH, PAGE_HEIGHT = LETTER
MARGIN_LEFT = inch
MARGIN_RIGHT = inch
MARGIN_TOP = inch
MARGIN_BOTTOM = inch

CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT


def page_footer(canvas, doc):
    """
    Standard page footer for H2O Allegiant PDFs.

    Renders a footer line with H2O Allegiant attribution and page number.
    Use as `onFirstPage` and `onLaterPages` callback in SimpleDocTemplate.
    """
    canvas.saveState()
    register_fonts()
    canvas.setFont(MONO_FONT, 8)
    canvas.setFillColor(MUTED_TEXT)

    footer_text = "H2O Allegiant Discovery Agent · Internal handover"
    page_num = f"Page {doc.page}"

    canvas.drawString(MARGIN_LEFT, 0.5 * inch, footer_text)
    canvas.drawRightString(PAGE_WIDTH - MARGIN_RIGHT, 0.5 * inch, page_num)

    canvas.restoreState()


# =============================================================================
# v2 FIELD BRIEF PRIMITIVES
# =============================================================================
# These primitives implement the v2 Field Brief design. They were built and
# validated during the Prairie AeroSurface hand-build (three feedback rounds with
# the user) and promoted into the brand kit so `h2o-field-brief` can consume them
# at runtime.
#
# Design references:
# - `/home/claude/h2o_v2/h2o-field-brief-SKILL.md` for the rendering specification
# - `/home/claude/h2o_v2/h2o-field-brief-SPEC.md` for the full design spec
# - `prairie_field_brief_v2.pdf` for the validated worked example
# =============================================================================


# Logo file paths — primary PNG, SVG fallback
# Logo file paths — resolved relative to this file's location so the brand kit
# is portable. The kit looks for logo files in the same directory as brand.py
# (the standard install location), with a development-environment fallback.
_BRAND_DIR = os.path.dirname(os.path.abspath(__file__))
LOGO_PNG_PATH = os.path.join(_BRAND_DIR, 'h2o_allegiant_logo_transparent.png')
LOGO_SVG_PATH = os.path.join(_BRAND_DIR, 'h2o_allegiant_logo.svg')
# Development fallback paths — used only if the relative paths above don't resolve
_LOGO_PNG_DEV_FALLBACK = '/home/claude/h2o_v2/h2o_allegiant_logo_transparent.png'
_LOGO_SVG_DEV_FALLBACK = '/home/claude/h2o_v2/h2o_allegiant_logo.svg'
if not os.path.exists(LOGO_PNG_PATH) and os.path.exists(_LOGO_PNG_DEV_FALLBACK):
    LOGO_PNG_PATH = _LOGO_PNG_DEV_FALLBACK
if not os.path.exists(LOGO_SVG_PATH) and os.path.exists(_LOGO_SVG_DEV_FALLBACK):
    LOGO_SVG_PATH = _LOGO_SVG_DEV_FALLBACK


class LogoMark(Flowable):
    """
    Embeds the actual H2O Allegiant logo. PNG primary (predictable rendering);
    SVG fallback when PNG is unavailable.

    The logo's natural aspect ratio is roughly 2.42:1 (1000 x 413 px).
    Caller specifies height; width is computed from the natural ratio.

    Usage:
        story.append(LogoMark(height=0.40 * inch))
    """
    NATURAL_RATIO = 1000 / 413

    def __init__(self, height=0.40 * inch):
        Flowable.__init__(self)
        self.height = height
        self.width = height * self.NATURAL_RATIO
        self._png_image = None
        self._svg_drawing = None
        self._load()

    def _load(self):
        """Try PNG first (predictable rendering), fall back to SVG."""
        try:
            from reportlab.lib.utils import ImageReader
            if os.path.exists(LOGO_PNG_PATH):
                self._png_image = ImageReader(LOGO_PNG_PATH)
                return
        except Exception:
            pass
        try:
            from svglib.svglib import svg2rlg
            if os.path.exists(LOGO_SVG_PATH):
                self._svg_drawing = svg2rlg(LOGO_SVG_PATH)
        except (ImportError, Exception):
            pass

    def wrap(self, *args):
        return self.width, self.height

    def draw(self):
        c = self.canv
        if self._png_image is not None:
            c.drawImage(
                self._png_image, 0, 0,
                width=self.width, height=self.height,
                mask='auto',
                preserveAspectRatio=True,
            )
        elif self._svg_drawing is not None:
            scale = self.height / self._svg_drawing.height
            c.saveState()
            c.scale(scale, scale)
            from reportlab.graphics import renderPDF
            renderPDF.draw(self._svg_drawing, c, 0, 0)
            c.restoreState()
        else:
            # Last-resort fallback: text-only mark
            c.setFillColor(BRAND_NAVY)
            c.setFont(HEADING_FONT, self.height * 0.65)
            c.drawString(0, self.height * 0.2, "H2O Allegiant")


class StageBadge(Flowable):
    """
    Coloured pill showing the current deal stage. Stage-to-colour mapping uses
    the gate traffic-light palette repurposed for stage progression.

    Stages: Lead / Qualify / Scope / Position / Propose / Close

    Usage:
        story.append(StageBadge(stage='Qualify', width=1.1*inch, height=0.26*inch))
    """
    STAGE_COLOURS = {
        'Lead': None,        # set below — references MUTED_TEXT
        'Qualify': None,     # GATE_CONDITIONAL (amber)
        'Scope': None,       # BRAND_BLUE
        'Position': None,    # BRAND_NAVY
        'Propose': None,     # GATE_OPEN (green)
        'Close': None,       # GATE_OPEN (green)
    }

    def __init__(self, stage, width=1.1 * inch, height=0.26 * inch):
        Flowable.__init__(self)
        self.stage = stage
        self.width = width
        self.height = height
        # Late-binding of colour mapping (avoids module-import-time ordering issues)
        StageBadge.STAGE_COLOURS = {
            'Lead': MUTED_TEXT,
            'Qualify': GATE_CONDITIONAL,
            'Scope': BRAND_BLUE,
            'Position': BRAND_NAVY,
            'Propose': GATE_OPEN,
            'Close': GATE_OPEN,
        }

    def wrap(self, *args):
        return self.width, self.height

    def draw(self):
        c = self.canv
        color = self.STAGE_COLOURS.get(self.stage, MUTED_TEXT)

        # Pill background
        c.setFillColor(color)
        c.setStrokeColor(color)
        c.roundRect(0, 0, self.width, self.height, self.height / 2, fill=1, stroke=0)

        # Label inside
        c.setFillColor(white)
        font_size = self.height * 0.55
        c.setFont(HEADING_FONT, font_size)
        label = f"Stage: {self.stage}"
        text_width = c.stringWidth(label, HEADING_FONT, font_size)
        c.drawString((self.width - text_width) / 2,
                     (self.height - font_size) / 2 + font_size * 0.2,
                     label)


class InsightBox(Flowable):
    """
    The Field Brief's section insight box — surfaces the single key claim
    of a section in a scannable 60-second-skim form.

    Light navy tint background, 3pt brand-blue accent line on the left edge,
    bold dark-navy text inside.

    Uses a reportlab Paragraph internally so XML tags (<super>, <sub>, <b>,
    <i>) are supported. 1-2 lines max; compact and scannable.

    Usage:
        story.append(InsightBox(
            "Customer frames it as 'three abnormal events'. The composite "
            "shows exceedances on seven of nine parameters — chronic envelope."
        ))
    """
    def __init__(self, text, width=7.0 * inch):
        Flowable.__init__(self)
        self.text = text
        self.width = width

        self._style = ParagraphStyle(
            name='InsightInternal',
            fontName=BODY_BOLD_FONT,
            fontSize=10.5,
            leading=13.5,
            textColor=BRAND_NAVY,
            leftIndent=0,
            rightIndent=0,
            spaceBefore=0,
            spaceAfter=0,
        )
        self._para = Paragraph(text, self._style)
        usable_width = self.width - 18
        _, ph = self._para.wrap(usable_width, 1000)
        self.height = ph + 14  # padding top/bottom

    def wrap(self, *args):
        return self.width, self.height

    def draw(self):
        c = self.canv

        # Background
        c.setFillColor(LIGHT_BG_NAVY)
        c.setStrokeColor(LIGHT_BG_NAVY)
        c.rect(0, 0, self.width, self.height, fill=1, stroke=0)

        # Left accent line (brand blue, 3pt wide)
        c.setFillColor(BRAND_BLUE)
        c.setStrokeColor(BRAND_BLUE)
        c.rect(0, 0, 3, self.height, fill=1, stroke=0)

        # Paragraph inside (top-aligned with padding)
        usable_width = self.width - 18
        _, ph = self._para.wrap(usable_width, self.height)
        self._para.drawOn(c, 12, self.height - 7 - ph)


def section_header(text, marker_color=None, width=7.0 * inch):
    """
    Field Brief section header — bold brand-navy text prefixed with a small
    coloured marker dot. Returns a Table flowable.

    The marker colour signals the section category:
    - BRAND_BLUE for "What this is"
    - GATE_OPEN (green) for "What we'd propose"
    - FLAG_STOP (red) for "What could kill it"
    - BRAND_NAVY for "Do this next"

    Usage:
        story.append(section_header("What we'd propose", marker_color=GATE_OPEN))
    """
    if marker_color is None:
        marker_color = BRAND_BLUE

    style = ParagraphStyle(
        name='SectionHeader',
        fontName=HEADING_FONT,
        fontSize=12,
        leading=15,
        textColor=BRAND_NAVY,
        spaceBefore=0,
        spaceAfter=0,
    )
    p = Paragraph(text, style)

    class _Dot(Flowable):
        def __init__(self, color, size=8):
            Flowable.__init__(self)
            self.color = color
            self.size = size
            self.width = size + 4
            self.height = size + 4
        def wrap(self, *args):
            return self.width, self.height
        def draw(self):
            c = self.canv
            c.setFillColor(self.color)
            c.setStrokeColor(self.color)
            c.circle(self.size / 2 + 2, self.height / 2, self.size / 2,
                     fill=1, stroke=0)

    dot = _Dot(marker_color)
    t = Table([[dot, p]], colWidths=[14, width - 14])
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    return t


def kill_risk_card(rank, name, mechanism, mitigation,
                   severity_color=None, width=7.0 * inch):
    """
    Renders a single kill-risk card for Field Brief Section 3.

    Layout: severity-coloured rank circle on the left + body block on the right.
    The body block has the risk name (bold), mechanism (regular), and inline
    italic muted mitigation.

    Severity-colour convention (set by caller per rank):
    - rank 1 → FLAG_STOP (red)
    - rank 2, 3 → FLAG_SPECIALIST (amber)

    Usage:
        story.append(kill_risk_card(
            rank=1,
            name="The customer's 'events' framing wins",
            mechanism="If the environmental manager pushes the slug-event story...",
            mitigation="Open Thursday with...",
            severity_color=FLAG_STOP,
        ))
    """
    if severity_color is None:
        severity_color = FLAG_STOP if rank == 1 else FLAG_SPECIALIST

    class _RankCircle(Flowable):
        def __init__(self, n, color):
            Flowable.__init__(self)
            self.n = n
            self.color = color
            self.width = 22
            self.height = 22
        def wrap(self, *args):
            return self.width, self.height
        def draw(self):
            c = self.canv
            c.setFillColor(self.color)
            c.setStrokeColor(self.color)
            c.circle(self.width / 2, self.height / 2, self.width / 2,
                     fill=1, stroke=0)
            c.setFillColor(white)
            c.setFont(HEADING_FONT, 11)
            label = str(self.n)
            tw = c.stringWidth(label, HEADING_FONT, 11)
            c.drawString((self.width - tw) / 2, self.height / 2 - 4, label)

    name_style = ParagraphStyle(
        name='KillRiskName',
        fontName=BODY_BOLD_FONT,
        fontSize=10,
        leading=12,
        textColor=BRAND_NAVY,
        spaceAfter=0,
    )
    body_style = ParagraphStyle(
        name='KillRiskBody',
        fontName=BODY_FONT,
        fontSize=9.5,
        leading=11.5,
        textColor=BODY_TEXT,
        spaceBefore=1,
        spaceAfter=0,
    )

    # Mechanism + inline italic muted mitigation in one paragraph
    combined = (
        f"{mechanism} "
        f"<font name='{BODY_ITALIC_FONT}' color='#64748B'>"
        f"Mitigation: {mitigation}</font>"
    )

    content_cell = [
        Paragraph(name, name_style),
        Paragraph(combined, body_style),
    ]

    t = Table(
        [[_RankCircle(rank, severity_color), content_cell]],
        colWidths=[28, width - 28],
    )
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (0, 0), 'TOP'),
        ('VALIGN', (1, 0), (1, 0), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 1),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
    ]))
    return t


def action_card(n, action_text, timeframe, supporting_text=None, width=7.0 * inch):
    """
    Renders a single action card for Field Brief Section 4.

    Layout: brand-blue numbered rank box on the left + body block on the right.
    The body block has the bold action title with the timeframe in brand-blue
    inline, then optional supporting paragraph.

    Usage:
        story.append(action_card(
            n=1,
            action_text="Call the environmental manager with the chronic-envelope reframe",
            timeframe="Thursday",
            supporting_text='Open with "I\\'ve looked at the WW-01 composite..."',
        ))
    """
    class _NumBox(Flowable):
        def __init__(self, n):
            Flowable.__init__(self)
            self.n = n
            self.width = 22
            self.height = 22
        def wrap(self, *args):
            return self.width, self.height
        def draw(self):
            c = self.canv
            c.setFillColor(BRAND_BLUE)
            c.setStrokeColor(BRAND_BLUE)
            c.roundRect(0, 0, self.width, self.height, 4, fill=1, stroke=0)
            c.setFillColor(white)
            c.setFont(HEADING_FONT, 11)
            label = str(self.n)
            tw = c.stringWidth(label, HEADING_FONT, 11)
            c.drawString((self.width - tw) / 2, self.height / 2 - 4, label)

    action_style = ParagraphStyle(
        name='ActionMain',
        fontName=BODY_BOLD_FONT,
        fontSize=10,
        leading=12,
        textColor=BRAND_NAVY,
        spaceAfter=0,
    )
    body_style = ParagraphStyle(
        name='ActionBody',
        fontName=BODY_FONT,
        fontSize=9.5,
        leading=11.5,
        textColor=BODY_TEXT,
        spaceBefore=1,
        spaceAfter=0,
    )

    # Action title with the timeframe in brand-blue inline
    title_html = (
        f"{action_text} &nbsp;"
        f"<font color='#0090F0'>· {timeframe}</font>"
    )
    content = [Paragraph(title_html, action_style)]
    if supporting_text:
        content.append(Paragraph(supporting_text, body_style))

    t = Table(
        [[_NumBox(n), content]],
        colWidths=[28, width - 28],
    )
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (0, 0), 'TOP'),
        ('VALIGN', (1, 0), (1, 0), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 1),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
    ]))
    return t


def cost_of_alternative_table(rows, width=7.0 * inch):
    """
    Renders the 3-column cost-of-alternative comparison table for Field Brief
    Section 2. This is the executive-headline artefact — the customer's BATNA
    fully priced over 5 years, compared row-by-row to our proposal.

    Args:
        rows: list of 3-tuples (cost_component, their_path, our_proposal).
              Each is a string supporting reportlab XML markup.
              The last row should be the bottom-line total; it's rendered with
              stronger background and coloured totals (their path in red,
              our proposal in green).

    Usage:
        story.append(cost_of_alternative_table([
            ('Cost component', 'Their $300K point-fix path', 'Our proposal'),
            ('Capex (year 0)', '$300K — metals precipitation only',
             '$2–4M — full train + EQ control'),
            # ...
            ('<b>5-year total (mid-range)</b>',
             '<b>~$4–7M + HCN tail risk</b>',
             '<b>~$3–7M, risk extinguished</b>'),
        ]))
    """
    if not rows or len(rows) < 2:
        raise ValueError("cost_of_alternative_table requires at least 2 rows")

    header_style = ParagraphStyle(
        name='CompareHeader',
        fontName=BODY_BOLD_FONT,
        fontSize=9.5,
        leading=12,
        textColor=BRAND_NAVY,
        alignment=TA_LEFT,
    )
    label_style = ParagraphStyle(
        name='CompareLabel',
        fontName=BODY_FONT,
        fontSize=9,
        leading=11,
        textColor=BODY_TEXT,
    )
    cell_style = ParagraphStyle(
        name='CompareCell',
        fontName=BODY_FONT,
        fontSize=9,
        leading=11,
        textColor=BODY_TEXT,
    )
    total_alt_style = ParagraphStyle(
        name='CompareTotalAlt',
        fontName=BODY_BOLD_FONT,
        fontSize=10,
        leading=12,
        textColor=FLAG_STOP,
    )
    total_ours_style = ParagraphStyle(
        name='CompareTotalOurs',
        fontName=BODY_BOLD_FONT,
        fontSize=10,
        leading=12,
        textColor=GATE_OPEN,
    )

    n_rows = len(rows)
    data = []
    for i, (component, alt, ours) in enumerate(rows):
        if i == 0:
            # Header row
            data.append([
                Paragraph(component, header_style),
                Paragraph(alt, header_style),
                Paragraph(ours, header_style),
            ])
        elif i == n_rows - 1:
            # Bottom-line total row — coloured totals
            data.append([
                Paragraph(component, header_style),
                Paragraph(alt, total_alt_style),
                Paragraph(ours, total_ours_style),
            ])
        else:
            data.append([
                Paragraph(component, label_style),
                Paragraph(alt, cell_style),
                Paragraph(ours, cell_style),
            ])

    # 3 columns: label | their path | our proposal
    col1_width = width * (1.7 / 7.0)
    col2_width = width * (2.65 / 7.0)
    col3_width = width * (2.65 / 7.0)
    t = Table(data, colWidths=[col1_width, col2_width, col3_width])
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        # Header row
        ('BACKGROUND', (0, 0), (-1, 0), LIGHT_BG_GREY),
        # Bottom-line total row
        ('BACKGROUND', (0, -1), (-1, -1), LIGHT_BG_NAVY),
        ('TOPPADDING', (0, -1), (-1, -1), 5),
        ('BOTTOMPADDING', (0, -1), (-1, -1), 5),
        # Grid lines for readability
        ('LINEBELOW', (0, 0), (-1, 0), 0.5, BRAND_NAVY),
        ('LINEBELOW', (0, 1), (-1, -2), 0.25, BORDER_NEUTRAL),
        # Column separator between "their path" and "our proposal"
        ('LINEBEFORE', (2, 0), (2, -1), 0.5, BORDER_NEUTRAL),
    ]))
    return t


def cover_block(customer_name, location, stage, date_str,
                regression_note=None, width=7.0 * inch):
    """
    Renders the Field Brief cover block: logo top-left, stage badge top-right,
    customer name below, then location/date/handover metadata line, then a
    thin horizontal rule.

    Args:
        customer_name: e.g., "Prairie AeroSurface Components LLC — Plant 3"
        location: e.g., "South Wichita, Kansas"
        stage: one of Lead/Qualify/Scope/Position/Propose/Close
        date_str: e.g., "2026-05-14"
        regression_note: optional, e.g., "Regressed from Scope — competitor pre-empt"

    Returns:
        list of flowables to extend onto the story.
    """
    logo = LogoMark(height=0.36 * inch)
    badge = StageBadge(stage, width=1.1 * inch, height=0.26 * inch)

    # Top row: logo on left, spacer in middle, badge on right
    top_row = Table(
        [[logo, '', badge]],
        colWidths=[2.5 * inch, width - 2.5 * inch - 1.1 * inch, 1.1 * inch],
    )
    top_row.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))

    customer_style = ParagraphStyle(
        name='CustomerName',
        fontName=HEADING_FONT,
        fontSize=14,
        leading=17,
        textColor=BRAND_NAVY,
        spaceBefore=2,
        spaceAfter=1,
    )
    customer_p = Paragraph(customer_name, customer_style)

    meta_style = ParagraphStyle(
        name='Meta',
        fontName=BODY_FONT,
        fontSize=9.5,
        leading=12,
        textColor=MUTED_TEXT,
    )
    meta_p = Paragraph(
        f"{location} &nbsp;·&nbsp; {date_str} &nbsp;·&nbsp; "
        f"<font name='{BODY_BOLD_FONT}'>Field Brief</font> · Internal handover",
        meta_style,
    )

    flowables = [top_row, customer_p, meta_p]

    if regression_note:
        regression_style = ParagraphStyle(
            name='RegressionNote',
            fontName=BODY_ITALIC_FONT,
            fontSize=9,
            leading=11,
            textColor=FLAG_SPECIALIST,
            spaceBefore=2,
        )
        flowables.append(Paragraph(f"<i>{regression_note}</i>", regression_style))

    # Thin neutral horizontal rule
    class _HRule(Flowable):
        def __init__(self, w=width, thickness=0.5, color=BORDER_NEUTRAL):
            Flowable.__init__(self)
            self.width = w
            self.thickness = thickness
            self.color = color
            self.height = thickness + 2
        def wrap(self, *args):
            return self.width, self.height
        def draw(self):
            c = self.canv
            c.setStrokeColor(self.color)
            c.setLineWidth(self.thickness)
            c.line(0, self.height / 2, self.width, self.height / 2)

    flowables.extend([Spacer(1, 4), _HRule(), Spacer(1, 6)])
    return flowables


# Module-level state for later_page_header (set by build_field_brief_templates)
_LATER_PAGE_CUSTOMER = ""
_LATER_PAGE_STAGE = ""


def later_page_header(canvas_obj, doc):
    """
    Footer + lightweight top-of-page anchor for pages 2+ of a Field Brief.

    The anchor strip shows: small logo + customer name (left) + stage badge
    marker + "Field Brief (continued)" (right) + thin separator rule. Gives
    page 2+ standalone identity when pulled out of context.

    The customer name and stage are set by `build_field_brief_templates` via
    the module-level state. Don't call this directly; assign it as a page-
    template `onPage` callback.
    """
    page_footer(canvas_obj, doc)

    canvas_obj.saveState()
    page_width = doc.pagesize[0]
    page_height = doc.pagesize[1]

    # Small logo (left)
    try:
        from reportlab.lib.utils import ImageReader
        if os.path.exists(LOGO_PNG_PATH):
            img = ImageReader(LOGO_PNG_PATH)
            logo_h = 0.22 * inch
            logo_w = logo_h * LogoMark.NATURAL_RATIO
            canvas_obj.drawImage(
                img, 0.75 * inch, page_height - 0.55 * inch,
                width=logo_w, height=logo_h, mask='auto',
                preserveAspectRatio=True,
            )
    except Exception:
        pass

    # Customer name (right of logo, brand-navy bold)
    canvas_obj.setFont(BODY_BOLD_FONT, 10)
    canvas_obj.setFillColor(BRAND_NAVY)
    text_x = 0.75 * inch + (0.22 * inch * LogoMark.NATURAL_RATIO) + 12
    text_y = page_height - 0.50 * inch
    canvas_obj.drawString(text_x, text_y, _LATER_PAGE_CUSTOMER)

    # Stage + continued suffix (right side, muted)
    canvas_obj.setFont(BODY_FONT, 9)
    canvas_obj.setFillColor(MUTED_TEXT)
    suffix = f"{_LATER_PAGE_STAGE} · Field Brief (continued)"
    suffix_width = canvas_obj.stringWidth(suffix, BODY_FONT, 9)
    canvas_obj.drawString(page_width - 0.75 * inch - suffix_width, text_y, suffix)

    # Thin separator rule
    canvas_obj.setStrokeColor(BORDER_NEUTRAL)
    canvas_obj.setLineWidth(0.5)
    rule_y = page_height - 0.62 * inch
    canvas_obj.line(0.75 * inch, rule_y, page_width - 0.75 * inch, rule_y)

    canvas_obj.restoreState()


def build_field_brief_templates(doc, customer_name, stage):
    """
    Wire up the two page templates for a Field Brief BaseDocTemplate.

    Page 1 uses the 'first' template (full content area, page_footer only).
    Pages 2+ use the 'later' template (frame offset for the anchor header,
    later_page_header callback).

    Sets the module-level _LATER_PAGE_CUSTOMER and _LATER_PAGE_STAGE state
    used by later_page_header.

    Usage in renderer:
        doc = BaseDocTemplate(path, pagesize=LETTER, ...)
        build_field_brief_templates(doc, customer_name="...", stage="Qualify")
        story = [NextPageTemplate('later'), ...cover_block(...), ...]
        doc.build(story)
    """
    global _LATER_PAGE_CUSTOMER, _LATER_PAGE_STAGE
    _LATER_PAGE_CUSTOMER = customer_name
    _LATER_PAGE_STAGE = f"Stage: {stage}"

    # Page 1: full content area
    frame_first = Frame(
        0.75 * inch, 0.45 * inch,
        LETTER[0] - 1.5 * inch,
        LETTER[1] - 0.9 * inch,
        id='frame_first',
        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
    )
    # Pages 2+: frame starts below anchor header
    later_top_offset = 0.75 * inch
    frame_later = Frame(
        0.75 * inch, 0.45 * inch,
        LETTER[0] - 1.5 * inch,
        LETTER[1] - 0.45 * inch - later_top_offset,
        id='frame_later',
        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
    )

    doc.addPageTemplates([
        PageTemplate(id='first', frames=[frame_first], onPage=page_footer),
        PageTemplate(id='later', frames=[frame_later], onPage=later_page_header),
    ])


def body_paragraph(text, width=7.0 * inch):
    """
    Standard Field Brief body paragraph. 9.5pt regular BODY_TEXT, leading 12pt.
    Use for section bodies and most prose content.

    Usage:
        story.append(body_paragraph("Aerospace metal-finishing facility..."))
    """
    style = ParagraphStyle(
        name='FieldBriefBody',
        fontName=BODY_FONT,
        fontSize=9.5,
        leading=12,
        textColor=BODY_TEXT,
        spaceBefore=1,
        spaceAfter=3,
        alignment=TA_LEFT,
    )
    return Paragraph(text, style)


# =============================================================================
# DIAGNOSTIC HELPER (for testing)
# =============================================================================

def render_brand_test_pdf(output_path='/tmp/h2o_allegiant_brand_test.pdf'):
    """
    Render a one-page test PDF showing every brand primitive in use.

    Useful for verifying that the brand kit renders correctly in the current
    environment (fonts loaded, callouts laid out, table styles applied).
    """
    from reportlab.platypus import SimpleDocTemplate

    doc = SimpleDocTemplate(
        output_path, pagesize=PAGE_SIZE,
        leftMargin=MARGIN_LEFT, rightMargin=MARGIN_RIGHT,
        topMargin=MARGIN_TOP, bottomMargin=MARGIN_BOTTOM,
    )
    styles = get_styles()
    story = []

    # Header
    story.extend(ideation_cover(
        header_line="Test Customer — wet-weather + biosolids · 2026-05-14",
        title="Brand Kit — Visual Test",
        subtitle="All primitives in one page",
        substreams="substream-eastside-wet-weather, substream-biosolids-outlet",
        gate_state="CONDITIONALLY-OPEN",
        gate_content="Sub-stream A open; sub-stream B closed on stop-flag.",
        flag_severity="STOP",
        flag_content="2 active flags affecting these sub-streams",
        flags_list=[
            ('csflag-consent-decree-milestones-missed', 'STOP',
             'Annual compliance report not obtained'),
            ('csflag-pfas-biosolids-ban-ignored', 'STOP',
             'September outlet cutoff with no documented alternate'),
        ],
    ))

    story.append(Paragraph("Section Header (h2)", styles['h2']))
    story.append(Paragraph("Sub-section Header (h3)", styles['h3']))
    story.append(Paragraph(
        "Body text in Inter (or Helvetica fallback). Lorem ipsum dolor sit amet, "
        "<b>bold emphasis</b>, <i>italic emphasis</i>, and mono "
        f'<font name="{MONO_FONT}">ER-001</font> inline.',
        styles['body']
    ))

    story.append(Spacer(1, 12))
    story.append(Paragraph("Theme header example (Playbook):", styles['body_bold']))
    story.append(theme_header(1, "Service area, flow, and scale",
                              "These define the entire business case."))
    story.append(Spacer(1, 6))
    story.append(why_it_matters_callout([
        "Anchors all downstream sizing",
        "Reveals capacity constraints",
        "Sets the gate's quantitative criterion",
    ]))

    story.append(Spacer(1, 16))
    story.append(strategic_insight_callout(
        "This is not a compliance project — it's a capital programme. "
        "Win by anchoring on rate-stability."
    ))

    doc.build(story, onFirstPage=page_footer, onLaterPages=page_footer)
    return output_path


if __name__ == '__main__':
    # When run directly, render the test PDF for visual verification
    output = render_brand_test_pdf()
    print(f"Brand test PDF rendered: {output}")
    print(f"Brand fonts loaded: {_USING_BRAND_FONTS}")
