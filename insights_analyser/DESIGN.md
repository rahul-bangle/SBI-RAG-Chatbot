---
name: SBI MF Insights Dashboard
description: Minimalist design system for SBI MF Product Pulse Insights.
colors:
  primary: "#00B5B7"
  dark: "#262626"
  muted: "#71717A"
  background: "#FFFFFF"
  cardBg: "#F5F5F7"
typography:
  h1:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
  body-md:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
rounded:
  md: "8px"
  lg: "16px"
components:
  card:
    backgroundColor: "{colors.cardBg}"
    rounded: "{rounded.md}"
    padding: "20px"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
---

## Overview
Minimalist, clean, and scannable interface for product teams. Designed to reduce noise and highlight actionable intelligence.

## Colors
- **Primary (#00B5B7):** Teal accent for branding and high-emphasis indicators.
- **Dark (#262626):** Ink color for headlines and core text.

## Typography
Inter font family used throughout for readability and professional look.

## Components
- `card`: Surface for themes and insights.
- `button-primary`: Action-oriented CTA for emailing or re-running analysis.
