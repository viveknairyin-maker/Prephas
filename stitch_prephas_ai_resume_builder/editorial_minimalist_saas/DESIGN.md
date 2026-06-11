---
name: Editorial Minimalist SaaS
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#4c4546'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e4e2e2'
  on-secondary-container: '#646464'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e4e2e2'
  secondary-fixed-dim: '#c8c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  container-max-width: 1280px
---

## Brand & Style

This design system is built on the intersection of high-end editorial layouts and high-performance productivity tools. The brand personality is disciplined, authoritative, and ultra-functional. It prioritizes content and clarity over visual noise, utilizing a strictly monochromatic palette to eliminate distraction.

The design style is a hybrid of **Minimalism** and **Modern Editorial**. Key characteristics include:
- **Binary Contrast:** Heavy reliance on pure black and pure white to create a clear hierarchy.
- **Negative Space as Structure:** Whitespace is not just "empty space" but a functional element used to group information and guide the eye without the need for containers.
- **Architectural Precision:** Every element aligns to a strict grid, emphasizing a "built" rather than "drawn" aesthetic.
- **Zero Decoration:** No shadows, gradients, or rounded corners are permitted. Depth is achieved through line work and typographic scale.

## Colors

The color strategy is purely functional and monochromatic. By removing hue, the user's focus is directed entirely toward the data and the task at hand.

- **Primary (#000000):** Used for all critical UI elements, headlines, primary buttons, and structural 1px borders.
- **Secondary (#555555):** Reserved for metadata, helper text, and inactive states to create a subtle secondary hierarchy.
- **Surface (#FFFFFF):** The universal background color. No secondary surface shades (like light grays) are used; instead, use 1px borders to define regions.
- **Interactive States:** Hover states on interactive elements should invert (e.g., a white button becomes black, or a black button becomes white).

## Typography

The typography system uses **Inter** to maintain a systematic, utilitarian feel. The hierarchy relies on extreme weight shifts and sizing rather than color.

- **Display & Headlines:** Use tight letter-spacing and heavy weights to create a "blocky" editorial feel.
- **Body Text:** Ample line height (1.5x - 1.6x) is critical to maintain the editorial readability of the design system.
- **Labels:** Small caps or uppercase labels are used for navigation and categorization to distinguish them from content.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** system for desktop and a **Fluid Grid** for mobile.

- **Grid:** A 12-column grid with 24px gutters. On desktop, the layout should be centered within a maximum width of 1280px.
- **Margins:** Generous outer margins (64px+) give the interface an "opened-up" magazine feel.
- **Spacing Scale:** All spacing must be multiples of 4px. Use larger gaps (48px, 64px, 80px) between major sections to emphasize the minimal aesthetic.
- **Structural Lines:** Use 1px black horizontal or vertical lines to separate content instead of background color shifts.

## Elevation & Depth

This design system intentionally rejects the concept of Z-axis shadows. Depth is communicated through **Bold Borders** and **Tonal Inversion**.

- **Flat Hierarchy:** Everything exists on a single plane. There are no drop shadows or inner glows.
- **Overlays:** Modals and menus should use a 1px black border and a solid white background. To distinguish from the background, use a 100% black "block shadow" (offset 4px or 8px) or a simple black scrim behind the element.
- **Focus States:** High-contrast outlines or full-color inversion (white-to-black) indicate active or focused elements.

## Shapes

The shape language is strictly **Sharp**. 

- **Corners:** All UI elements—including buttons, input fields, and cards—must have 0px border radius. 
- **Consistency:** Sharp edges reinforce the technical and editorial nature of the design system. Do not use rounded corners even for checkboxes or progress bars.

## Components

Components are designed with high contrast and linear precision.

- **Buttons:** 
  - *Primary:* Solid black background, white text. No border needed.
  - *Secondary:* Solid white background, 1px black border, black text.
- **Input Fields:** 1px black border, sharp corners. Placeholder text in secondary gray (#555555). Focus state thickens the border to 2px or adds a solid black fill for the label.
- **Cards:** No background shifts. Defined by a 1px black border. Use generous internal padding (min 24px).
- **Progress Trackers:** Linear bars with a 1px border. The "filled" portion is solid black; the "empty" portion is white. 
- **Checkboxes/Radios:** Square 1px black frames. Selection is indicated by a solid black fill (for checkboxes) or a smaller solid black square (for radios).
- **Lists:** Separated by 1px horizontal lines. Hovering over a list item should trigger a "ghost" effect where the background remains white but the text weight might shift or a leading icon appears.