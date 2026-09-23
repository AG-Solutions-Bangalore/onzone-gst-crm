---
version: alpha
name: Vercel
description: >-
  Vercel is the autonomous stack for deploying and scaling applications and AI agents. The design system embodies
  technical precision through minimalist monochromatic aesthetics with strategic accent colors.
logo:
  src: https://assets.vercel.com/image/upload/q_auto/front/favicon/vercel/apple-touch-icon-180x180.png
colors:
  surface: '#fafafa'
  surface-dim: '#f5f5f5'
  surface-bright: '#ffffff'
  surface-container-lowest: '#f0f0f0'
  surface-container-low: '#ededed'
  surface-container: '#eaeaea'
  surface-container-high: '#e0e0e0'
  surface-container-highest: '#d4d4d4'
  on-surface: '#171717'
  on-surface-variant: '#666666'
  inverse-surface: '#1f1f1f'
  inverse-on-surface: '#f5f5f5'
  outline: '#cccccc'
  outline-variant: '#b3b3b3'
  surface-tint: '#171717'
  primary: '#171717'
  on-primary: '#ffffff'
  primary-container: '#333333'
  on-primary-container: '#f5f5f5'
  inverse-primary: '#ffffff'
  secondary: '#95bf47'
  on-secondary: '#1f1f1f'
  secondary-container: '#c8e6a0'
  on-secondary-container: '#2d4a0f'
  tertiary: '#de2670'
  on-tertiary: '#ffffff'
  tertiary-container: '#f5a3c7'
  on-tertiary-container: '#5a0a2a'
  error: '#d32f2f'
  on-error: '#ffffff'
  error-container: '#ffcdd2'
  on-error-container: '#b71c1c'
  primary-fixed: '#333333'
  primary-fixed-dim: '#1f1f1f'
  on-primary-fixed: '#ffffff'
  on-primary-fixed-variant: '#f5f5f5'
  secondary-fixed: '#c8e6a0'
  secondary-fixed-dim: '#95bf47'
  on-secondary-fixed: '#1f1f1f'
  on-secondary-fixed-variant: '#2d4a0f'
  tertiary-fixed: '#f5a3c7'
  tertiary-fixed-dim: '#de2670'
  on-tertiary-fixed: '#ffffff'
  on-tertiary-fixed-variant: '#5a0a2a'
  background: '#fafafa'
  on-background: '#171717'
  surface-variant: '#e9ecef'
typography:
  display:
    fontFamily: GeistSans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 72px
    letterSpacing: '-0.02em'
  headline-lg:
    fontFamily: GeistSans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: '-0.01em'
  headline-md:
    fontFamily: GeistSans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 36px
  title-lg:
    fontFamily: GeistSans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: GeistSans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: GeistSans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: GeistSans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: GeistSans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 4px
  DEFAULT: 6px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  container-max: 1280px
elevation:
  sm: 0 1px 2px rgba(0, 0, 0, 0.05)
  md: 0 3px 8px rgba(0, 0, 0, 0.15)
  lg: 0 8px 24px rgba(0, 0, 0, 0.12)
layout:
  containerMaxWidth: 1280px
  gridColumns: 12
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    typography: '{typography.label-md}'
    rounded: '{rounded.full}'
    padding: 12px 24px
    height: 40px
    fontWeight: '500'
  button-primary-hover:
    backgroundColor: '{colors.primary-container}'
    textColor: '{colors.on-primary-container}'
  button-secondary:
    backgroundColor: transparent
    textColor: '{colors.primary}'
    typography: '{typography.label-md}'
    rounded: '{rounded.DEFAULT}'
    padding: 12px 16px
    height: 40px
    border: 1px solid {colors.outline}
  button-secondary-hover:
    backgroundColor: '{colors.surface-container-low}'
  button-tertiary:
    backgroundColor: transparent
    textColor: '{colors.primary}'
    typography: '{typography.body-md}'
    rounded: '{rounded.DEFAULT}'
    padding: 8px 12px
    height: auto
  button-tertiary-hover:
    backgroundColor: '{colors.surface-container-lowest}'
  card:
    backgroundColor: '{colors.surface-bright}'
    rounded: '{rounded.lg}'
    padding: '{spacing.md}'
    border: 1px solid {colors.outline-variant}
    boxShadow: '{elevation.sm}'
  card-hover:
    backgroundColor: '{colors.surface-container-low}'
    boxShadow: '{elevation.md}'
  input-field:
    backgroundColor: '{colors.surface-bright}'
    textColor: '{colors.on-surface}'
    typography: '{typography.body-md}'
    rounded: '{rounded.DEFAULT}'
    padding: '{spacing.sm}'
    border: 1px solid {colors.outline}
    height: 40px
  input-field-focus:
    borderColor: '{colors.primary}'
    boxShadow: 0 0 0 3px rgba(23, 23, 23, 0.1)
  badge:
    backgroundColor: '{colors.secondary-container}'
    textColor: '{colors.on-secondary-container}'
    typography: '{typography.label-sm}'
    rounded: '{rounded.full}'
    padding: 4px 12px
    fontWeight: '500'
  badge-accent:
    backgroundColor: '{colors.tertiary-container}'
    textColor: '{colors.on-tertiary-container}'
  list-item:
    backgroundColor: transparent
    rounded: '{rounded.md}'
    padding: '{spacing.sm}'
    textColor: '{colors.on-surface}'
  list-item-hover:
    backgroundColor: '{colors.surface-container-low}'
    textColor: '{colors.primary}'
---

## Overview

Vercel is the autonomous infrastructure platform for deploying, scaling, and managing applications and AI agents at global scale. The design system embodies 'Technical Minimalism'—a philosophy that strips away ornamentation to reveal pure function, using a near-monochromatic palette (charcoal #171717 on off-white #fafafa) punctuated by strategic accent colors (lime-green #95bf47 for positive actions, magenta #de2670 for highlights). The brand voice is direct, confident, and precise: it speaks to developers and enterprises who value speed and clarity. The UI evokes a sense of control and inevitability—like infrastructure that simply works, without fuss or compromise.

The tone is matter-of-fact and technical without being cold. Vercel uses active verbs and concrete outcomes: 'Deploy now,' 'Ship 26 is coming to SF,' 'Automated by agents.' The vocabulary favors infrastructure terminology (deploy, scale, agent, autonomous) and avoids marketing hyperbole. Example sentence in brand voice: 'Deploy your app in milliseconds; scale from zero to millions without thinking about servers.'

## Colors

The color system is anchored in a high-contrast monochromatic foundation: primary surface is #fafafa (off-white), with text at #171717 (near-black). This 98% contrast ratio ensures accessibility and legibility across all contexts. The surface stack progresses through grays (#f5f5f5 → #ededed → #eaeaea → #e0e0e0) to create subtle depth without visual noise. Primary color (#171717) is reserved for interactive elements, text emphasis, and CTAs—it is the brand's signature neutral-dark, used on the 'Deploy now' button and all primary actions. Secondary accent (#95bf47, a vibrant lime-green) is deployed sparingly on success states, positive indicators, and secondary CTAs to signal forward momentum and growth. Tertiary accent (#de2670, magenta) is used for highlights, badges, and attention-grabbi

## Typography

The type system uses GeistSans (a geometric, modern sans-serif optimized for screens) across all scales, maintaining visual consistency and technical clarity. Display (64px, 400 weight, -0.02em tracking) anchors hero sections with commanding presence; Headline-lg (40px, 400 weight) breaks major sections; Body-md (16px, 400 weight, 24px line-height) is the workhorse for body copy and UI labels. The 400 weight dominates, with 500 weight reserved for labels and interactive elements to signal interactivity. Letter-spacing is tight (-0.02em to -0.01em on display/headlines) to reinforce technical precision, while body text uses neutral tracking (0em) for readability. Apply text-shadow: 0 1px 2px rgba(0, 0, 0, 0.08) on small labels (label-sm) when placed over busy backgrounds or gradients to ensu

## Layout

The layout uses a 12-column fluid grid with a max-width of 1280px, centered on the viewport. Spacing follows a semantic scale: xs (4px) for micro-interactions, sm (12px) for component padding, md (24px) for section gutters and card padding, lg (40px) for major section separation, and xl (64px) for hero-to-content transitions. The hero section uses asymmetric layout—large headline on the left (64px display type), supporting copy and CTAs below, with a geometric illustration (black triangle) anchored right-center. Sections are separated by lg spacing (40px) vertically, creating rhythm without excessive whitespace. Container padding uses gutter (24px) on desktop, reducing to sm (12px) on mobile. The page maintains generous negative space—approximately 30% of viewport height is empty space in

## Elevation & Depth

Depth is achieved through subtle layering rather than dramatic shadows. Level 1 (Base): flat surface at #fafafa with no shadow. Level 2 (Standard Card): background #ffffff with 1px border #cccccc and box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15), creating a soft lift. Level 3 (Elevated/Modal): background #ffffff with 1px border #cccccc and box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), suggesting greater separation. Hover states on cards transition from Level 2 to Level 3 over 150ms (cubic-bezier(0.4, 0, 0.2, 1)). Interactive elements (buttons, inputs) use no shadow at rest; on focus, they gain a 3px

## Shapes

The shape philosophy is 'Architectural Precision'—rounded corners are used strategically to soften technical interfaces without sacrificing clarity. Buttons use full radius (9999px) to signal primary actions and create a friendly, approachable CTA (e.g., 'Deploy now' button). Cards and containers use lg radius (12px) for a modern, refined appearance that avoids sharp corners while maintaining structure. Input fields use DEFAULT radius (6px) for a compact, technical feel. Badges and pills use full radius (9999px) to denote status or metadata. The black triangle in the hero uses 0px radius (shar

## Components

### Action Elements
Buttons are the primary interaction mechanism. Primary buttons (button-primary) use background #171717, text #ffffff, padding 12px 24px, height 40px, full radius (9999px), and label-md typography (14px, 500 weight). On hover, background transitions to #333333 (primary-container) over 150ms. Secondary buttons (button-secondary) use transparent background with 1px border #cccccc, text #171717, same padding and height, DEFAULT radius (6px). On hover, background becomes #ededed (surface-container-low). Tertiary buttons use transparent background, text #171717, reduced padding (8px 12px), and body-md typography for inline or low-emphasis actions. All buttons use cursor: pointer and transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1).

### Containers & Surfaces
Ca

## Do's and Don'ts

**Do**
- Do use primary color (#171717) exclusively for interactive elements, CTAs, and text emphasis—never for backgrounds or decorative elements.
- Do maintain the 98% contrast ratio between surface (#fafafa) and text (#171717) on all body copy and labels for accessibility.
- Do apply lg spacing (40px) between major sections to create visual rhythm and reduce cognitive load.
- Do use full radius (9999px) on primary buttons and badges to signal approachability and action.
- Do transition all interactive states (hover, focus, active) over 150ms using cubic-bezier(0.4, 0, 0.2, 1) for consistency.
- Do reserve secondary accent (#95bf47) for success states, positive indicators, and secondary CTAs only.
- Do use GeistSans at 400 weight for body copy and 500 weight for labels to maintain technical clarity.

**Don't**
- Don't use shadows heavier than 0 8px 24px rgba(0, 0, 0, 0.12)—excessive shadows contradict the minimalist aesthetic.
- Don't apply border-radius greater than lg (12px) on cards or containers; sharp geometry is reserved for illustrations.
- Don't mix primary and secondary accents on the same interactive element—choose one to avoid visual confusion.
- Don't use tertiary accent (#de2670) for CTAs or primary actions; reserve it for highlights and badges only.
- Don't reduce line-height below 1.2x on headlines or 1.5x on body text—tight leading reduces readability.
- Don't apply text-shadow or text-stroke on body copy; use only on small labels over busy backgrounds.
- Don't use colors outside the defined palette (e.g., custom blues, purples, or reds) without explicit brand approval.
