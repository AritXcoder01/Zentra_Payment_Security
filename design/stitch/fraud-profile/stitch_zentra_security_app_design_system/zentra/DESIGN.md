---
name: Zentra
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434750'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#747781'
  outline-variant: '#c4c6d2'
  surface-tint: '#3c5d9c'
  primary: '#001b44'
  on-primary: '#ffffff'
  primary-container: '#002f6c'
  on-primary-container: '#7999dc'
  inverse-primary: '#aec6ff'
  secondary: '#00629d'
  on-secondary: '#ffffff'
  secondary-container: '#00a2fd'
  on-secondary-container: '#003558'
  tertiary: '#0c1f25'
  on-tertiary: '#ffffff'
  tertiary-container: '#22343b'
  on-tertiary-container: '#899ca5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#aec6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#224583'
  secondary-fixed: '#cfe5ff'
  secondary-fixed-dim: '#98cbff'
  on-secondary-fixed: '#001d33'
  on-secondary-fixed-variant: '#004a77'
  tertiary-fixed: '#d2e6ef'
  tertiary-fixed-dim: '#b6cad2'
  on-tertiary-fixed: '#0b1e24'
  on-tertiary-fixed-variant: '#374951'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  otp-input:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: 0.2em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 20px
---

## Brand & Style

The design system for this product is engineered to evoke immediate trust and a sense of "quiet security." It targets users who demand professional-grade payment protection without the friction of overly technical jargon. The brand personality is reassuring, authoritative, and precise.

The visual style is **Corporate Modern with Tactile Depth**. It blends the structured reliability of Android-native interfaces with sophisticated layers of glassmorphism and subtle elevation. By avoiding definitive "100% secure" claims in favor of active, process-oriented language like "Checks complete" or "Active protection," the UI fosters a realistic and transparent relationship with the user. The aesthetic is clean and premium, utilizing light borders and soft blurs to create a high-clarity environment.

## Colors

The palette is anchored by a deep navy (`#002F6C`), establishing a foundation of institutional stability. 

- **Primary Anchor:** Used for core branding, primary actions, and high-level navigation.
- **Support Blues:** Light and Very Light Blue shades are utilized for surface tinting and secondary indicators, preventing the interface from feeling "heavy."
- **Semantic Colors:** These are used strictly for status indicators. Success (Protected) uses a soft emerald, while Warning and Danger (High Priority) use amber and coral tones respectively to maintain urgency without inducing panic.
- **Backgrounds:** A neutral, nearly-white foundation (`#F8FAFC`) ensures that glassmorphic effects and soft shadows have enough contrast to remain legible.

## Typography

This design system utilizes **Inter** across all levels to leverage its exceptional legibility on mobile screens and its neutral, systematic character.

A strong typographic hierarchy is established to guide users through complex financial data. Headlines are bold and tightly spaced to feel impactful, while body text uses generous line heights to ensure readability during security reviews. A specialized `otp-input` style is defined with increased letter-spacing to ensure the 6-digit security codes are distinct and easy to verify at a glance.

## Layout & Spacing

This design system adheres to a **strict 8pt grid system**. All dimensions, padding, and margins are multiples of 8px (with 4px used only for extreme micro-adjustments).

The layout is optimized for Android mobile devices using a fluid 4-column grid.
- **Margins:** A standard 20px side margin provides a premium "breathing room" feel.
- **Vertical Rhythm:** Elements are grouped using 8px (related) or 24px (unrelated) vertical increments.
- **Touch Targets:** All interactive elements maintain a minimum hit area of 48x48dp to ensure accessibility and reduce input errors during sensitive transactions.

## Elevation & Depth

Hierarchy is communicated through **Tonal Layering and Glassmorphism**.

1.  **Base Layer:** Solid `#F8FAFC` background.
2.  **Surface Layer:** High-contrast white cards with a 1px border (`#E2E8F0`) and a very soft, diffused shadow (0px 4px 20px rgba(0, 47, 108, 0.05)).
3.  **Glassmorphic Overlays:** For security status and modals, use a semi-transparent white (80% opacity) with a 16px background blur. This creates a "safe" aesthetic where the user can still perceive the app's context underneath.
4.  **Active Depth:** Primary buttons use a subtle inner-glow to appear slightly raised, while secondary buttons remain flat with a light stroke.

## Shapes

The shape language is characterized by **Generous Roundedness**, leaning into the "Rounded" (Level 2) category but extended for specific container types.

Standard cards and security status containers use a **20px radius** to feel soft and approachable. Inputs and buttons use a **12px radius**, providing enough curve to feel modern while maintaining a structural "form-like" appearance. Full-screen modals utilize a top-heavy 24px radius to indicate they are "shelves" sliding over the primary content.

## Components

### Buttons
- **Primary:** Solid `#002F6C` fill with white text. High-contrast and authoritative.
- **Secondary:** Transparent fill with 1.5px `#002F6C` border. Used for "Cancel" or "View Details."
- **Danger:** Solid `#EF4444` fill. Reserved for irreversible actions or high-priority security alerts.

### Security Components
- **Glassmorphic Cards:** Used for "Active Protection" status. Background is white at 70% opacity with a blur of 12px and a subtle blue-tinted border.
- **Status Chips:** Small, pill-shaped badges.
    - *Successful:* Light Green tint / Dark Green text.
    - *Flagged:* Light Red tint / Dark Red text.
- **6-Digit OTP Input:** Six individual 48x56px boxes with a 2px bottom-border highlight when focused.

### Navigation & Feedback
- **Bottom Navigation:** A frosted glass bar (90% opacity white) with 4 tabs. Active state uses the Primary Navy color for the icon and a small 4px dot indicator underneath.
- **Modals:** Bottom-sheet style that covers 60-90% of the screen height. Always includes a drag-handle at the top.
- **Empty States:** Centered, grayscale-tinted versions of primary icons with a "Label-LG" headline and a single Primary button for the next logical step.