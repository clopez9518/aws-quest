---
name: AWS Architecture Simulator
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e18'
  surface-container-low: '#171b26'
  surface-container: '#1F2937'
  surface-container-high: '#262a35'
  surface-container-highest: '#313540'
  on-surface: '#dfe2f1'
  on-surface-variant: '#dbc2ad'
  inverse-surface: '#dfe2f1'
  inverse-on-surface: '#2c303b'
  outline: '#a38d7a'
  outline-variant: '#554434'
  surface-tint: '#ffb86f'
  primary: '#ffc082'
  on-primary: '#4a2800'
  primary-container: '#ff9900'
  on-primary-container: '#653a00'
  inverse-primary: '#8a5100'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#d5c3ff'
  on-tertiary: '#3c0091'
  tertiary-container: '#bda2ff'
  on-tertiary-container: '#520fbb'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdcbd'
  primary-fixed-dim: '#ffb86f'
  on-primary-fixed: '#2c1600'
  on-primary-fixed-variant: '#693c00'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#0f131d'
  on-background: '#dfe2f1'
  surface-variant: '#313540'
  surface-canvas: '#0B0F19'
  surface-card: '#111827'
  border-subtle: '#374151'
  status-pass: '#10B981'
  status-fail: '#EF4444'
  status-warning: '#F59E0B'
  status-info: '#0284C7'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
  code-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system embodies the high-velocity, rigorous environment of enterprise cloud engineering paired with the tactical clarity of an interactive simulation environment. The brand personality is precision-engineered, authoritative, and empowering. It avoids toy-like gamification in favor of an authentic mission-critical command console where architects, sysadmins, and engineers solve complex distributed systems challenges under realistic operational constraints.

The visual style blends modern technical minimalism with targeted, high-contrast visual cues:
- **Foundational Substratum:** Deep slate and void-navy surfaces that minimize eye strain during intensive modeling sessions and amplify luminescent network telemetry.
- **Architectural Chromatic Accents:** Iconic AWS cloud amber signals structural actions and compute anchors, accompanied by strict semantic telemetry indicators (cyan for ingress/mesh routing, emerald for resilient healthy states, coral for SPOFs and security breaches, and violet for event-driven orchestration).
- **Tactile Technical Fidelity:** Subtle low-opacity structural borders, dot-matrix topology backdrops, crisp modular cards, and contextual split-screen drawers engineered to eliminate context fragmentation.

## Colors

The color system operates strictly in dark mode, reflecting the focus and low-strain expectations of a cloud management console and real-time simulator.

### Hierarchy & Semantics
- **Primary (`#FF9900`):** The signature cloud amber. Used exclusively for high-leverage actions, primary interactive triggers, primary AWS tier badges, active selections, and progress achievements.
- **Secondary (`#38BDF8`):** Technological cyan. Reserved for active network routing, compute boundaries, load balancer paths, and data egress channels.
- **Tertiary (`#8B5CF6`):** Deep violet. Designated for serverless logic (Lambda, Fargate), IaC configurations, and decoupled asynchronous messaging pipelines.
- **Neutral Palette (`#0B0F19` base):** Deep slate hierarchy graduated from `#0B0F19` (canvas substrate) to `#111827` (card panels, docks) and `#1F2937` (active drawer/modal elevation), bounded by precise `#374151` linear dividers.

### Functional Diagnostic Tokens
- `status-pass` (`#10B981`): Validated architecture requirements, passing Well-Architected rules, and authorized traffic.
- `status-fail` (`#EF4444`): Single points of failure (SPOF), open security groups, packet drops, and mission-critical breaches.
- `status-warning` (`#F59E0B`): Optimization bottlenecks, unhedged operational costs, or missing cross-region redundancy.
- `status-info` (`#0284C7`): Informational architectural annotations, deep-dive technical definitions, and non-blocking guidance.

## Typography

The typography leverages Inter across all hierarchy tiers to enforce high typographic density, legibility under complex multi-column layouts, and strict systemic discipline.

- **Headlines:** Clean, high-contrast, structured letterforms designed for quick scanning across diagnostic panels, unit roadmap milestones, and modal briefs.
- **Body:** Standardized on 14px (`body-md`) with 20px line-height for engineering challenge statements and 30-to-60-second micro-briefings, ensuring maximum reading velocity.
- **Labels & Metadata:** Compact 11px and 12px levels (`label-sm`, `label-md`) with heightened weights (500–600) for difficulty pills, Well-Architected pillar flags, and operational status chips.
- **Technical Strings:** Service keys, configuration identifiers (`MaxInstances`, `CIDRBlock`), and port mappings utilize `code-md` styling with subtle letter-spacing for distinction inside the UI canvas.

## Layout & Spacing

The layout is built upon an 8pt metric scale, combining a rigid structural 12-column grid for dashboards and documentation with an infinite, dot-matrix fluid canvas for the architectural workspace.

### Form Factors & Adaptation
- **Desktop (1280px and above):** 12-column layout with 24px (`space-lg`) gutters and 32px (`space-xl`) outer margins. The workspace incorporates split-screen docking: persistent floating node palette (left, 280px), central fluid graph canvas, and expandable lateral deep-dive/diagnostic inspection drawers (right, 420px to 540px width).
- **Tablet (768px – 1279px):** Canvas collapses control toolbars into icon-docked overlay clusters; lateral drawers operate as sliding modal sheets with scrim backdrop, reducing grid margins to 16px (`space-md`).
- **Mobile (below 768px):** Structural grids reflow to single-column stacking; simulation canvases switch to read-only replay and diagnostic inspection cards, preserving 16px side safe margins.

## Elevation & Depth

Depth is established via tonal layering and low-contrast borders rather than heavy diffused drop shadows, ensuring clarity in high-density engineering environments.

- **Base Layer (0dp):** System substrate `#0B0F19` with a subtle SVG dot grid (`rgba(55, 65, 81, 0.35)`) spaced at 24px intervals for spatial orientation.
- **Surface Layer (1dp):** Structural cards, roadmap tiles, and inactive dock bars using `#111827` enclosed by a 1px solid `#374151` border.
- **Interactive Nodes & Panels (2dp):** Nodes, hovering toolbars, and inspector containers elevated to `#1F2937` with an ambient glow (`box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5)`). Active nodes receive a 1px colored accent border (`#FF9900` or `#38BDF8`).
- **Contextual Drawers & Diagnostic Sheets (3dp):** Lateral sliding panels sit above the canvas with a distinct boundary stroke (`#374151`) and an intensified backdrop drop-shadow (`box-shadow: -8px 0 24px rgba(0, 0, 0, 0.7)`).
- **Global Modals & Command Palette (4dp):** Highest tier centered overlays with `#111827` background, full screen backdrop filter (`backdrop-filter: blur(8px)` with `rgba(11, 15, 25, 0.8)` tint).

## Shapes

The design system uses a soft, structured corner geometry (level 1) corresponding to a baseline radius of `0.25rem` (4px).

- **Baseline Components (4px / `0.25rem`):** Buttons, inputs, metric tiles, status chips, node connection ports, and technical code markers.
- **Medium Panels (8px / `0.5rem`):** Topology service cards, inspector panels, diagnostic result cards, and floating control dockets.
- **Top-Level Containers (12px / `0.75rem`):** Global modal briefing dialogs, Capstone challenge summary banners, and sliding lateral drawer inner views.
- **Pill Badges:** Fully circular (`rounded-full`) borders are strictly reserved for Well-Architected status chips, telemetry health pills, and difficulty indicator labels.

## Components

### Buttons & Interactive Controls
- **Primary Action (Deploy / Run Simulation):** Filled `#FF9900` background, `#0B0F19` bold typography, 4px border radius, subtle hover brightness shift without layout-shifting elevation changes.
- **Secondary Action (Inspect / Clear):** Transparent background with 1px `#374151` border, `#F3F4F6` text, transitioning on hover to `#1F2937` surface fill and `#9CA3AF` border.
- **Destructive Action (Tear Down / Abort):** Transparent background with 1px `#EF4444` border and text; fills `#EF4444` at 15% opacity on hover.

### Badges & Status Chips
- **Well-Architected Pillars:** Compact 11px label with colored pillar dot indicator (e.g., Security = `#EF4444`, Reliability = `#38BDF8`, Cost Optimization = `#10B981`).
- **Difficulty Badges:** High-contrast bordered badges: Easy (`#10B981`), Intermediate (`#38BDF8`), Hard (`#F59E0B`), Capstone (`#8B5CF6`).

### Diagnostic Breakdown Cards
- **Architecture Evaluation Blocks:** 4-part modular structure displaying:
  1. *Diagnóstico:* High-contrast verdict with status icon (`#10B981` Pass or `#EF4444` Fail).
  2. *Riesgo en Producción:* Explicit technical risk explanation set in `body-sm`.
  3. *Pilar:* Linked Well-Architected tag.
  4. *Recomendación:* Concrete corrective action steps highlighted with monospace configuration values.

### Form Inputs & Selectors
- Background `#111827`, border 1px `#374151`, text `#F9FAFB`. Focus states introduce a crisp 1px ring in primary amber (`#FF9900`) with zero default blur outline.

### Topology Graph Nodes & Connectors
- **Service Node:** Compact rectangular card (`#111827`), 1px `#374151` outline, housing the AWS service glyph, user-assigned label, and status indicator.
- **Connection Ports:** 8px circular anchor targets situated on cardinal edges, transitioning to `#38BDF8` upon connection drag hover.
- **Traffic Vectors:** Directed SVG lines with dynamic animated dash-arrays reflecting protocol state: solid for healthy verified links, animated dots for dynamic traffic, and flashing crimson strokes for interrupted or blocked vectors.