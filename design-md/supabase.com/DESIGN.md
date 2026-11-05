---
version: alpha
name: Supabase
description: |
  Supabase's design system embodies a modern, developer-focused aesthetic with a
  clean, minimal foundation and purposeful use of contrast. The visual language
  prioritizes clarity and function over decoration, using a dark neutral
  (#0C0F24) as the dominant tone paired with a vibrant teal accent to draw
  attention to primary actions and brand moments. The typography is contemporary
  and highly legible, combining Manrope for headings and Inter for body text,
  creating a sophisticated hierarchy that guides users through feature-rich
  interfaces. Whitespace is generous, allowing breathing room for content and
  emphasizing the importance of each section. The overall mood is professional
  yet approachable—suitable for developers building scalable applications while
  remaining welcoming to newcomers exploring the platform.
source:
  url: "https://supabase.com/"
  pagesAnalyzed: 1
  extractedAt: 2026-11-05
  tokensMeasured: true
colors:
  primary: "#0C0F24"
  ink: "#FFFFFF"
  accent-1: "#002533"
  neutral-1: "#000000"
typography:
  display:
    fontFamily: Manrope
    fontSize: 46px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0px
  heading-lg:
    fontFamily: Manrope
    fontSize: 34px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0px
  heading-lg-tight:
    fontFamily: Manrope
    fontSize: 34px
    fontWeight: 600
    lineHeight: 1.11
    letterSpacing: 0px
  heading-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 0px
  heading-sm:
    fontFamily: Manrope
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 0px
  heading-xs:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.43
    letterSpacing: 0px
  body-xl:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: 450
    lineHeight: 1.33
    letterSpacing: -0.16px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 450
    lineHeight: 1.5
    letterSpacing: 0px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 450
    lineHeight: 1.5
    letterSpacing: 0px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.38
    letterSpacing: 0px
  nav:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0px
  button-xl:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: 450
    lineHeight: 1.38
    letterSpacing: 0px
  button-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.43
    letterSpacing: 0px
  button-lg-tight:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.14
    letterSpacing: 0px
  button-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 450
    lineHeight: 1.63
    letterSpacing: 0px
  label:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 450
    lineHeight: 1.43
    letterSpacing: 0px
  caption-xs:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 450
    lineHeight: 1.33
    letterSpacing: 0px
  caption-xs-strong:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: 0px
  code:
    fontFamily: "Source Code Pro"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.7
    letterSpacing: 0px
rounded:
  none: 0px
  xs: 8px
  sm: 9.29231px
  md: 10.6667px
  lg: 15px
  xl: 16px
  xxl: 21.3333px
  full: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  xxxl: 40px
  section: 48px
  band: 64px
borderWidths:
  thin: 1px
shadows:
  sm: "rgba(0, 0, 0, 0.04) 0px 1px 3px 0px, rgba(0, 0, 0, 0.027) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.04) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.04) 0px -1px 0px 0px inset, rgba(0, 0, 0, 0.067) 0px 0px 0px 1px inset"
  md: "rgba(0, 0, 0, 0.04) 0px 1px 3px 0px, rgba(0, 0, 0, 0.027) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.04) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.067) 0px 0px 0px 1px inset"
  lg: "rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px"
elevationStrategy: layered-micro
themes:
  derived: light   # the other theme is the site's measured palette
  light:
    bg: "#FBFBFB"
    surface: "#F1F1F1"
    surfaceRaised: "#E9E9E9"
    text: "#111112"
    textMuted: "#737374"
    border: "#D8D8D8"
    accent: "#0C0F24"
    accentFg: "#FFFFFF"
    focusRing: "#0C0F24"
    elevation: shadow
  dark:
    bg: "#0F1011"
    surface: "#0F1010"
    surfaceRaised: "#222323"
    text: "#FFFFFF"
    textMuted: "#ABABAC"
    border: "#2C2D2E"
    accent: "#4D5CC4"
    accentFg: "#FFFFFF"
    focusRing: "#0C0F24"
    elevation: "border+surface"
gradients:
  - context: section
    kind: linear
    value: "linear-gradient(oklch(0.1 0 337.5 / 0.0812725) 0px, oklab(0.1 0 0 / 0.0406362) 100%)"
  - context: section
    kind: linear
    value: "linear-gradient(to top, rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 50%, oklch(1 0 337.5) 85%)"
components:
  button-outline:
    typography: "{typography.caption-xs}"
    textColor: "oklch(0.394455 0 337.5)"
    border: "1px solid oklch(0.1 0 337.5 / 0.0812725)"
    height: 30px
    padding: "6px 12px 6px 12px"
    rounded: "3.35544e+07px"
    backgroundColor: "oklch(1 0 337.5)"
  button-text:
    typography: "{typography.button-lg}"
    textColor: "oklch(0.99 0.00275 157.5)"
    height: 38px
    padding: "8px 16px 8px 16px"
    boxShadow: "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.04) 0px 1px 3px 0px, rgba(0, 0, 0, 0.027) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.04) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.067) 0px 0px 0px 1px inset"
    rounded: "{rounded.sm}"
    backgroundColor: "oklch(0.525 0.12 157.5)"
  button-text-2:
    typography: "{typography.button-lg}"
    textColor: "oklch(0.1 0 337.5)"
    height: 38px
    padding: "8px 16px 8px 16px"
    boxShadow: "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.04) 0px 1px 3px 0px, rgba(0, 0, 0, 0.027) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.04) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.04) 0px -1px 0px 0px inset, rgba(0, 0, 0, 0.067) 0px 0px 0px 1px inset"
    rounded: "{rounded.sm}"
    backgroundColor: "oklch(1 0 337.5)"
  card:
    typography: "{typography.body-lg}"
    textColor: "oklch(0.1 0 337.5)"
    border: "1px solid oklch(0.1 0 337.5 / 0.0812725)"
    padding: "24px 24px 24px 24px"
    rounded: "{rounded.xxl}"
    backgroundColor: "oklch(1 0 337.5)"
  card-2:
    typography: "{typography.body-lg}"
    textColor: "oklch(0.1 0 337.5)"
  navigation:
    typography: "{typography.body-lg}"
    textColor: "oklch(0.1 0 337.5)"
    height: 65px
  footer:
    typography: "{typography.body-lg}"
    textColor: "oklch(0.1 0 337.5)"
    backgroundColor: "oklch(0.995 0 337.5)"
  link:
    typography: "{typography.body-lg}"
    textColor: "oklch(0.1 0 337.5)"
    border: "1px solid oklch(0.1 0 337.5 / 0.0812725)"
    rounded: "{rounded.md}"
    backgroundColor: "oklch(1 0 337.5)"
  link-lg:
    typography: "{typography.body-lg}"
    textColor: "oklch(0.1 0 337.5)"
    rounded: "{rounded.xl}"
states:
  other-focus-visible:
    target: other
    state: focus-visible
    boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px, rgba(0, 0, 0, 0.2) 0px 0px 0px 2px"
  button-focus-visible:
    target: button
    state: focus-visible
    boxShadow: "rgba(0, 0, 0, 0.4) 0px 0px 0px 2px"
  other-hover:
    target: other
    state: hover
    opacity: 1
breakpoints:
  - width: 375
    containerWidth: 375
    gridColumns: 6
    navLinksVisible: 1
    menuToggleVisible: true
    headingPx: 34
    bodyPx: 16
    sectionPaddingX: 0
  - width: 768
    containerWidth: 768
    gridColumns: 6
    navLinksVisible: 1
    menuToggleVisible: true
    headingPx: 46
    bodyPx: 16
    sectionPaddingX: 0
  - width: 1024
    containerWidth: 1024
    gridColumns: 6
    navLinksVisible: 7
    menuToggleVisible: true
    headingPx: 46
    bodyPx: 16
    sectionPaddingX: 0
  - width: 1280
    containerWidth: 1280
    gridColumns: 6
    navLinksVisible: 7
    menuToggleVisible: true
    headingPx: 46
    bodyPx: 16
    sectionPaddingX: 0
  - width: 1440
    containerWidth: 1280
    gridColumns: 6
    navLinksVisible: 7
    menuToggleVisible: true
    headingPx: 46
    bodyPx: 16
    sectionPaddingX: 0
coverage:
  statesFound: 6
  gradientsFound: 2
  rolesUnassigned: 2
  archetypesUnnamed: 0
  archetypesDetected: 0
  responsiveMeasured: true
  stylesheetsBlocked: true
  semanticRampDeclared: false
---

# Design System Inspired by Supabase

## 1. Visual Theme & Atmosphere

Supabase's design system embodies a **modern, developer-focused aesthetic** with a clean, minimal foundation and purposeful use of contrast. The visual language prioritizes clarity and function over decoration, using a dark neutral (`{colors.primary}` — `#0C0F24`) as the dominant tone paired with a vibrant teal accent to draw attention to primary actions and brand moments. The typography is contemporary and highly legible, combining Manrope for headings and Inter for body text, creating a sophisticated hierarchy that guides users through feature-rich interfaces. Whitespace is generous, allowing breathing room for content and emphasizing the importance of each section. The overall mood is **professional yet approachable**—suitable for developers building scalable applications while remaining welcoming to newcomers exploring the platform.

**Key Characteristics:**
- Clean, minimal aesthetic with emphasis on content clarity
- Dark neutral base (`#0C0F24`) paired with vibrant teal accents (`#002533` for decorative depth)
- Contemporary typeface pairing (Manrope + Inter + Source Code Pro)
- Generous whitespace and logical sectioning
- Sharp corners on cards and elements (0px radius) contrasting with pill-shaped buttons
- Subtle, layered shadows for depth without visual clutter
- Developer-forward language and visual hierarchy
- Strong focus on readability and information architecture

## 2. Color Palette & Roles

### Primary
- **Brand Accent / Primary CTA** (`{colors.primary}` — `#0C0F24`): Dark navy-black used for primary call-to-action buttons, active states, and brand emphasis; the dominant colour in hero headings and interactive elements

### Accent Colors
- **Decorative / Accent** (`{colors.accent-1}` — `#002533`): Teal-blue secondary accent with no explicitly measured role; used decoratively for visual depth and thematic consistency in illustrations and background elements

### Neutral Scale
- **Ink / Heading Text** (`{colors.ink}` — `#FFFFFF`): Pure white; reserved for high-contrast text on dark backgrounds and brand mark visibility
- **Neutral / Text** (`{colors.neutral-1}` — `#000000`): Pure black; primary text colour on light backgrounds for maximum readability; used in body copy and interface labels

### Surface & Borders
- **Surface / Card Background**: `oklch(1 0 337.5)` (white/light neutral); used for card containers, input fields, and light surface regions
- **Border / Hairline**: `oklch(0.1 0 337.5 / 0.0812725)` (dark neutral with transparency); subtle 1px stroke for card and input boundaries

## 3. Typography Rules

### Font Family

**Primary: Manrope**
Fallback: `ui-rounded, "Hiragino Maru Gothic ProN", sans-serif`
Used for: Display and heading hierarchy; modern, rounded characteristics emphasize approachability

**Secondary: Inter**
Fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
Used for: Body text, buttons, navigation, labels; clean, neutral for high-legibility interface copy

**Tertiary: Source Code Pro**
Fallback: `"Courier New", monospace`
Used for: Code blocks, technical documentation, API references

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|-----------------|-------|
| Display | Manrope | 46px | 500 | 1.0 | 0px | Hero headline; compressed line height for impact |
| Heading LG | Manrope | 34px | 600 | 1.2 | 0px | Section headline; measured on h2 |
| Heading LG Tight | Manrope | 34px | 600 | 1.11 | 0px | Dense headline variant; measured on h3 |
| Heading MD | Inter | 16px | 600 | 1.5 | 0px | Subheading for features and cards |
| Heading SM | Inter | 15px | 600 | 1.5 | 0px | Small section heading; measured on h6 |
| Heading XS | Manrope | 14px | 500 | 1.43 | 0px | Tertiary heading; measured on h4 |
| Body XL | Inter | 22px | 450 | 1.33 | -0.16px | Large feature copy; only use with negative tracking |
| Body LG | Inter | 16px | 450 | 1.5 | 0px | Primary body text; measured on link |
| Body MD | Inter | 15px | 450 | 1.5 | 0px | Body variant for mixed line lengths |
| Body SM | Inter | 14px | 500 | 1.38 | 0px | Secondary body; captions and annotations |
| Button XL | Manrope | 22px | 450 | 1.38 | 0px | Large button text (infrequent) |
| Button LG | Inter | 14px | 500 | 1.43 | 0px | Standard button; measured on button element |
| Button LG Tight | Inter | 14px | 500 | 1.14 | 0px | Compact button variant |
| Button MD | Inter | 12px | 450 | 1.63 | 0px | Small button; measured on button element |
| Label | Inter | 14px | 450 | 1.43 | 0px | Form label text |
| Caption XS | Inter | 12px | 450 | 1.33 | 0px | Fine print; secondary metadata |
| Caption XS Strong | Inter | 12px | 500 | 1.33 | 0px | Emphasized caption or tag |
| Nav | Inter | 14px | 500 | 1.0 | 0px | Navigation link text; tight line height |
| Code | Source Code Pro | 13px | 500 | 1.7 | 0px | Monospace for code blocks and API examples |

### Principles

- **Manrope (headings)**: Modern, rounded glyphs create a friendly yet confident tone; reserved for display and structural hierarchy to maintain visual distinction
- **Inter (body/UI)**: Neutral, highly legible sans-serif; narrow widths and optimal metrics for screen reading; handles both body copy and interface labels seamlessly
- **Source Code Pro (code)**: Monospace with character distinction for technical accuracy; used sparingly to maintain focus on documentation and examples
- **Negative tracking on display**: Body XL (`{typography.body-xl}`) uses -0.16px letter-spacing; preserve this to maintain the intended visual tension and modernity
- **Line-height strategy**: Display and headings use compressed line heights (1.0–1.2) for visual impact; body text defaults to 1.5 for reading comfort; buttons use 1.14–1.63 depending on density
- **Weight hierarchy**: 600 weight for primary headings, 500 for secondary hierarchy and UI labels, 450 for body and description text

## 4. Component Stylings

### Buttons

**Primary (text variant)**
- Background: `oklch(0.525 0.12 157.5)` (vibrant teal)
- Text colour: `oklch(0.99 0.00275 157.5)` (off-white)
- Padding: `{spacing.xs}` top/bottom, `{spacing.md}` left/right (`8px 16px 8px 16px`)
- Height: 38px
- Font: `{typography.button-lg}` (Inter, 14px, weight 500)
- Border radius: `{rounded.sm}` (9.29231px)
- Border: none
- Shadow: `rgba(0, 0, 0, 0.04) 0px 1px 3px 0px, rgba(0, 0, 0, 0.027) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.04) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.067) 0px 0px 0px 1px inset`
- Focus: `rgba(0, 0, 0, 0.1) 0px 4px 12px, rgba(0, 0, 0, 0.2) 0px 0px 0px 2px`

**Secondary (text-2 variant)**
- Background: `oklch(1 0 337.5)` (white)
- Text colour: `oklch(0.1 0 337.5)` (dark navy, `#0C0F24`)
- Padding: `{spacing.xs}` top/bottom, `{spacing.md}` left/right (`8px 16px 8px 16px`)
- Height: 38px
- Font: `{typography.button-lg}` (Inter, 14px, weight 500)
- Border radius: `{rounded.sm}` (9.29231px)
- Border: 0px; inset shadows create subtle depth
- Shadow: `rgba(0, 0, 0, 0.04) 0px 1px 3px 0px, rgba(0, 0, 0, 0.027) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.04) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.04) 0px -1px 0px 0px inset, rgba(0, 0, 0, 0.067) 0px 0px 0px 1px inset`
- Focus: `rgba(0, 0, 0, 0.1) 0px 4px 12px, rgba(0, 0, 0, 0.2) 0px 0px 0px 2px`
- Hover: Border colour adjusts (var(--gray5) or var(--normal-border-hover))

**Ghost (outline variant)**
- Background: `oklch(1 0 337.5)` (white)
- Text colour: `oklch(0.394455 0 337.5)` (medium gray)
- Padding: `{spacing.xs}` top/bottom, `{spacing.xs}` left/right (`6px 12px 6px 12px`)
- Height: 30px
- Font: `{typography.button-md}` (Inter, 12px, weight 450)
- Border: `1px solid oklch(0.1 0 337.5 / 0.0812725)` (hairline dark neutral)
- Border radius: `{rounded.full}` (pill-shaped; 3.35544e+07px renders as 9999px)
- Shadow: none
- Focus: `rgba(0, 0, 0, 0.4) 0px 0px 0px 2px`

### Cards & Containers

**Default (bordered)**
- Background: `oklch(1 0 337.5)` (white)
- Text colour: `oklch(0.1 0 337.5)` (dark navy)
- Padding: `{spacing.xl}` all sides (24px)
- Border: `1px solid oklch(0.1 0 337.5 / 0.0812725)` (hairline)
- Border radius: `{rounded.xxl}` (21.3333px)
- Font: `{typography.body-lg}` (Inter, 16px, weight 450)
- Shadow: none
- Min-height: 214.5px (measured)

**Default-2 (transparent)**
- Background: `rgba(0, 0, 0, 0)` (transparent)
- Text colour: `oklch(0.1 0 337.5)` (dark navy)
- Padding: 0px all sides
- Border: none (0px)
- Border radius: `{rounded.none}` (0px)
- Font: `{typography.body-lg}` (Inter, 16px, weight 450)
- Shadow: none

### Inputs & Forms

**Text Input (default)**
- Background: `oklch(1 0 337.5)` (white)
- Text colour: `oklch(0.1 0 337.5)` (dark navy)
- Padding: `{spacing.xs}` top/bottom, `{spacing.md}` left/right (`8px 16px`)
- Border: `1px solid oklch(0.1 0 337.5 / 0.0812725)` (hairline)
- Border radius: `{rounded.xs}` (8px)
- Font: `{typography.label}` (Inter, 14px, weight 450)
- Line height: 1.43
- Shadow: `rgba(0, 0, 0, 0.04) 0px 1px 3px 0px, rgba(0, 0, 0, 0.027) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.04) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.067) 0px 0px 0px 1px inset`
- Focus: `rgba(0, 0, 0, 0.1) 0px 4px 12px, rgba(0, 0, 0, 0.2) 0px 0px 0px 2px`

### Navigation

**Header Navigation**
- Background: `rgba(0, 0, 0, 0)` (transparent)
- Height: 65px
- Padding: 0px (layout managed by grid)
- Font: `{typography.nav}` (Inter, 14px, weight 500)
- Text colour: `oklch(0.1 0 337.5)` (dark navy)
- Border: none
- Border radius: `{rounded.none}` (0px)
- Breakpoint collapse: Navigation links hidden on viewport < 768px; toggle menu appears

### Links

**Default (with border)**
- Text colour: `oklch(0.1 0 337.5)` (dark navy)
- Border: `1px solid oklch(0.1 0 337.5 / 0.0812725)` (hairline)
- Border radius: `{rounded.md}` (10.6667px)
- Font: `{typography.body-lg}` (Inter, 16px, weight 450)
- Background: `oklch(1 0 337.5)` (white)
- Shadow: none
- Hover: Opacity transitions to 1.0

**Default-lg (transparent)**
- Text colour: `oklch(0.1 0 337.5)` (dark navy)
- Border: none (0px)
- Border radius: `{rounded.xl}` (16px)
- Font: `{typography.body-lg}` (Inter, 16px, weight 450)
- Background: `rgba(0, 0, 0, 0)` (transparent)
- Shadow: none

## 5. Layout Principles

### Spacing System

The spacing system uses a base unit of `{spacing.xs}` (8px) multiplied across a consistent scale, enabling predictable, harmonious layouts.

- **Micro spacing**: `{spacing.xxs}` (4px) — icon padding, tight UI adjustments
- **Compact spacing**: `{spacing.xs}` (8px) — button padding, label margins
- **Standard spacing**: `{spacing.sm}` (12px) — form field gutters
- **Comfortable spacing**: `{spacing.md}` (16px) — card padding, section gutters
- **Generous spacing**: `{spacing.lg}` (20px) — feature section gaps
- **Large spacing**: `{spacing.xl}` (24px) — card internal padding
- **Extra-large spacing**: `{spacing.xxl}` (32px) — section separation
- **Extra-extra-large spacing**: `{spacing.xxxl}` (40px) — major layout divisions
- **Section spacing**: `{spacing.section}` (48px) — between major content sections
- **Band spacing**: `{spacing.band}` (64px) — full-width section separators; used for hero and feature bands

### Grid & Container

- **Max container width**: 1280px (consistent across 1440px and above viewports)
- **Column grid**: 6-column system across all breakpoints (375px → 1440px)
- **Section padding**: Varies by breakpoint; on mobile (375px), content extends edge-to-edge (0px horizontal padding); maintained on tablet and desktop
- **Content approach**: Viewport expands but inner column count remains stable; max-width constraint prevents excessive line lengths on large screens

### Whitespace Philosophy

Supabase employs **generous, intentional whitespace** to create visual hierarchy and breathing room. Sections are clearly separated by `{spacing.band}` (64px) vertical gaps, allowing users to parse content in distinct chunks. Internal padding within cards uses `{spacing.xl}` (24px), while text elements maintain comfortable `{spacing.md}` (16px) or `{spacing.lg}` (20px) gaps. This approach reduces cognitive load and emphasizes the importance of each feature or call-to-action. Whitespace is rarely used below `{spacing.sm}` (12px) except in tight UI contexts like button padding or icon spacing.

### Border Radius Scale

- **Sharp (0px)**: `{rounded.none}` — cards, images, sections; emphasizes clean, geometric aesthetic
- **Subtle (8px)**: `{rounded.xs}` — buttons, overlays, inputs; minor softness without losing definition
- **Rounded (9.29231px)**: `{rounded.sm}` — variant button radius; measured specifically for consistency
- **Gentle (10.6667px)**: `{rounded.md}` — links and interactive elements; balances sharpness and approachability
- **Moderate (15px)**: `{rounded.lg}` — decorative or secondary elements
- **Comfortable (16px)**: `{rounded.xl}` — large link/container radius
- **Smooth (21.3333px)**: `{rounded.xxl}` — card containers; visually softer than text input or button
- **Pill-shaped (9999px)**: `{rounded.full}` — ghost buttons and toggle states; maximum softness for secondary actions

### Border Widths

- **Thin (1px)**: `1px` — hairline borders on cards, inputs, buttons; subtle visual separation without weight

## 6. Depth & Elevation

The system uses a **layered-micro elevation strategy**, relying on stacked near-transparent shadows and inset borders rather than dramatic drop shadows. This creates subtle, barely-there lift that maintains the clean aesthetic.

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (base) | No shadow; border only | Cards, inputs in neutral state |
| Micro (sm) | `rgba(0, 0, 0, 0.04) 0px 1px 3px 0px, rgba(0, 0, 0, 0.027) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.04) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.067) 0px 0px 0px 1px inset` | Buttons, modals, inputs; gentle depth |
| Subtle (lg) | `rgba(0, 0, 0, 0.04) 0px 1px 3px 0px, rgba(0, 0, 0, 0.027) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.04) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.067) 0px 0px 0px 1px inset` | Modal and overlay depth; minimal lift |
| Pronounced (xl) | `rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px` | Dropdown menus, floating overlays; most prominent elevation |

**Shadow philosophy**: Depth emerges through layered transparency rather than strong drop shadows. Inset shadows on the bottom and sides create an embossed quality, while a subtle external shadow adds perceived lift. This approach keeps the interface feeling flat and minimal while maintaining clear depth hierarchy.

### Opacity Levels

- **Subtle (20%)**: `0.20` — disabled or inactive states; minor de-emphasis
- **Moderate (70%)**: `0.70` — hover effects, secondary overlays; clear but not full opacity
- **Strong (80%)**: `0.80` — semi-transparent surfaces, masks; high visibility with background washout

### Z-index / Layering

- **Dropdown (low)**: `z-index: 10` — primary dropdown menus
- **Dropdown (medium)**: `z-index: 20` — secondary dropdowns or nested overlays
- **Dropdown (high)**: `z-index: 40` — tertiary or modal-level dropdowns
- **Dropdown (modal-tier)**: `z-index: 50` — dropdown behaving as modal backdrop
- **Sticky/Persistent**: `z-index: 100` — header navigation, sticky sidebars; above all floating content

## 7. Do's and Don'ts

### Do

- **Use generous spacing**: Apply `{spacing.band}` (64px) between major sections and `{spacing.section}` (48px) between subsections to maintain breathing room and visual clarity
- **Apply border-radius contextually**: Use `{rounded.none}` (0px) for cards and large containers, `{rounded.xs}` (8px) for interactive elements, and `{rounded.xxl}` (21.3333px) for soft card emphasis
- **Pair typefaces intentionally**: Manrope for headlines and display, Inter for body and UI; never mix them within a single heading hierarchy
- **Layer shadows microscopically**: Build depth using inset borders and layered transparency (micro elevation) rather than bold drop shadows
- **Preserve negative tracking on display**: Body XL (`{typography.body-xl}`) requires -0.16px letter-spacing; do not normalize this to 0px
- **Use semantic button variants**: Primary (teal background) for main CTAs, secondary (white) for alternatives, ghost (outline) for tertiary actions
- **Test on stated breakpoints**: Verify layouts at 375px (mobile), 768px (tablet), 1024px, 1280px, and 1440px (desktop); navigation collapse occurs at < 768px
- **Maintain 1280px max-width**: Desktop layouts cap at 1280px even on 1440px+ screens to prevent excessively long line lengths

### Don't

- **Don't invent border radii**: Every component radius is explicitly measured; do not estimate or average between defined values
- **Don't apply drop shadows aggressively**: Heavy shadows break the minimal aesthetic; layer-micro philosophy (inset + subtle external shadow) is the rule
- **Don't mix navigation states**: Logo, primary nav links, and CTA buttons each have distinct styling; do not homogenize them
- **Don't over-emphasize with colour**: The accent colour (`{colors.accent-1}` — `#002533`) is decorative; primary CTAs use teal (`oklch(0.525 0.12 157.5)`), not the brand dark
- **Don't forget focus states**: All interactive elements require `:focus-visible` shadow treatment (e.g., `rgba(0, 0, 0, 0.1) 0px 4px 12px, rgba(0, 0, 0, 0.2) 0px 0px 0px 2px`)
- **Don't violate minimum touch targets**: Maintain at least 38–44px height for interactive elements on mobile
- **Don't ignore responsive collapse**: Navigation links hide on < 768px; provide a menu toggle in their place
- **Don't normalize letter-spacing**: Negative tracking on display (Body XL) is a defining brand trait; preserve it exactly

## 8. Responsive Behavior

### Breakpoints

| Viewport | Width | Grid Columns | Nav Links Visible | Menu Toggle | Heading Size | Body Font | Max Container | Key Changes |
|----------|-------|--------------|-------------------|-------------|--------------|-----------|----------------|-------------|
| Mobile | 375px | 6 | 1 link | yes | 34px | 16px | 375px | Full-width layout; navigation collapses; single visible link in header |
| Tablet | 768px | 6 | 1 link | yes | 46px | 16px | 768px | Display heading expands; layout becomes wider but remains full-width |
| Laptop | 1024px | 6 | 7 links | yes | 46px | 16px | 1024px | Navigation expands; full menu visible; max-width begins to constrain |
| Desktop | 1280px | 6 | 7 links | yes | 46px | 16px | 1280px | Stabilized at max-width; full navigation; typical desktop layout |
| Large Desktop | 1440px | 6 | 7 links | yes | 46px | 16px | 1280px | Viewport larger but content capped at 1280px to prevent line-length bloat |

**Breakpoint strategy**: The site uses a continuous responsive approach rather than discrete jumps. Grid columns remain 6 across all sizes, but internal padding and component scaling adjust. Navigation collapses when menu links cannot fit (approx. < 768px). Display heading size jumps from 34px (mobile) to 46px (tablet+) at the 768px threshold.

### Touch Targets

- **Minimum interactive height**: 38px (buttons, inputs, nav items); measured standard across the system
- **Minimum interactive width**: 44px recommended for finger targets on mobile; buttons typically 38–44px
- **Padding around icons**: `{spacing.xs}` (8px) minimum around icon centres to ensure comfortable touch zones
- **Navigation spacing**: Header nav items maintain ≥38px height with `{spacing.md}` (16px) horizontal padding; collapse when text no longer fits

### Collapsing Strategy

- **Mobile (< 768px)**:
  - Navigation links collapse into a menu toggle; only logo and toggle visible
  - Section headings remain at 34px (`{typography.heading-lg-tight}`)
  - Cards stack vertically in single column
  - Full-width padding: 0px (content bleeds to edges)
  - Button widths adjust to available space with consistent `{spacing.xs}` padding

- **Tablet (768px–1023px)**:
  - Display heading jumps to 46px (`{typography.display}`)
  - Navigation links begin to appear; evaluate density
  - Multi-column layouts remain single-column or 2-column (6-column grid, few wide columns)
  - Padding increases slightly; sections gain breathing room

- **Desktop (1024px+)**:
  - Full navigation visible (7 links)
  - Content width stabilizes at 1280px max-width
  - Multi-column grids become usable (3–6 columns per section)
  - Spacing and padding remain consistent; line lengths optimized

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA**: Brand Dark (`{colors.primary}` — `#0C0F24`) with teal fill (`oklch(0.525 0.12 157.5)`) for primary buttons
- **Secondary CTA**: White (`oklch(1 0 337.5)`) for secondary buttons
- **Background (surfaces)**: White (`oklch(1 0 337.5)`)
- **Heading text**: Dark navy (`oklch(0.1 0 337.5)` / `#0C0F24`)
- **Body text**: Dark navy (`oklch(0.1 0 337.5)`)
- **Border / hairline**: Dark neutral with transparency (`oklch(0.1 0 337.5 / 0.0812725)`)
- **Accent (decorative)**: Teal (`{colors.accent-1}` — `#002533`)
- **Ink (high contrast on dark)**: White (`{colors.ink}` — `#FFFFFF`)

### Iteration Guide

1. **Start with semantic structure**: Use Manrope for all h1–h4 headings, Inter for body and UI; apply exact font sizes and weights from Typography Hierarchy table
2. **Layer shadows, don't drop them**: Every button, input, and card uses inset borders plus micro shadows; never apply a single `box-shadow` without at least one inset layer
3. **Apply corner radius per role**: Cards = 21.3333px, buttons = 8px or 9999px (pill), inputs = 8px; do not generalize
4. **Preserve spacing scale**: Every gap, padding, and margin uses the defined spacing scale (4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px); do not invent intermediate values
5. **Constrain desktop layouts to 1280px**: Use `max-width: 1280px` on containers to prevent excessive line-length growth on 1440px+ screens
6. **Focus states are mandatory**: Every button and interactive element requires `:focus-visible` with `rgba(0, 0, 0, 0.1) 0px 4px 12px, rgba(0, 0, 0, 0.2) 0px 0px 0px 2px` (or variant as specified)
7. **Mobile breakpoint is 768px**: Navigation collapses here; above this, show full nav. Below 375px, content remains full-width with 0px padding
8. **Negative tracking on display**: `{typography.body-xl}` has -0.16px letter-spacing; this is not an error—preserve it exactly for visual modernity
9. **Borders are always 1px or inset**: No thick borders; hairline (`1px`) paired with inset shadow creates definition
10. **Ghost buttons are pill-shaped**: Use `{rounded.full}` (9999px) with `1px` border and no fill for lowest-priority actions

## 10. Known Gaps

- **Interaction states not fully measured**: Hover, active, and disabled states for buttons, inputs, and cards were partially extracted; only explicit `:focus-visible` and `:hover` states are documented. Other state variants (disabled opacity, active backgrounds, error states) are not present in the extraction data and should not be assumed.
- **Error, warning, success semantic colours absent**: The site does not declare a semantic status colour ramp (error/warning/success/info). No validation or status-based colours were measured; do not invent them.
- **Dark mode not documented**: Only the light theme was analysed; if a dark mode exists behind authentication or in a settings panel, it was not visited and is not documented here.
- **Decorative accent colour (`{colors.accent-1}`) has no explicit role**: The teal accent (`#002533`) was measured but does not appear to have a designated UI role; it is used decoratively in illustrations and backgrounds. Do not repurpose it as a primary action colour.
- **Brand dark colour (`{colors.primary}`) measured as `#0C0F24`**: This is a near-black navy, not a blue or teal. It serves as the dark neutral and brand base, not as a vibrant accent; primary CTAs use a separate teal (`oklch(0.525 0.12 157.5)`).
- **Animation / transition timings not extracted**: No duration, easing, or animation specifications were captured; CSS transitions should follow platform defaults or be derived from interaction context.
- **Gradients present but not systematized**: Two linear gradients were measured on sections; they are documented verbatim under Typography/Component Patterns but not formalized into a reusable gradient scale. Use them as measured or omit if not needed for a specific surface.
- **Cross-origin stylesheets unreadable**: Some CSS detail may be missing due to CORS restrictions; if a component's full style could not be extracted, it is listed under Component Stylings with measured values only.
- **Z-index scale incomplete**: Numeric z-index values (10, 20, 40, 50, 100) were extracted; intermediate values and layering for modals/toasts may exist but were not fully observed.
- **Opacity scale partial**: Three opacity values (0.20, 0.70, 0.80) were measured; complete disabled/hover/overlay opacities may not be exhaustive.
- **Surfaces behind authentication not visited**: Logged-in UI, dashboard, or account settings were not analysed; their design may differ from the public homepage.