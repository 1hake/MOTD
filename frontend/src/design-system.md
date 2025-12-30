# MOTD Design System - Neo Brutalism Soft Pop

## Overview
This document outlines the "Neo Brutalism Soft Pop" design system for the MOTD (Music of the Day) application. The design focuses on high contrast, bold borders, hard shadows, and a soft pastel "pop" color palette.

## Color Palette

### Pop Colors (Main Accents)
- `pop-pink`: `#FFD1DC` - Main brand color, used for primary actions and active states.
- `pop-mint`: `#B4F8C8` - Used for secondary actions and success states.
- `pop-blue`: `#A0E7E5` - Used for highlights and backgrounds.
- `pop-yellow`: `#FBE7C6` - Main background color for the application.
- `pop-purple`: `#E0BBE4` - Used for special accents.

### Base Colors
- `black`: `#000000` - Used for all borders, shadows, and primary text.
- `white`: `#FFFFFF` - Used for card backgrounds and contrast.

## Typography
- **Font Family**: Inter (Google Fonts)
- **Hierarchy**: Bold and black weights are prioritized for a "brutalist" feel.
- **Style**: Italicized headers are common to add "pop" energy.

## Borders & Shadows

### Borders
- Standard border: `3px solid #000000` (`border-3 border-black`)
- Thin border: `2px solid #000000` (`border-2 border-black`)

### Shadows (Hard Shadows)
- `shadow-neo`: `4px 4px 0px 0px #000000`
- `shadow-neo-lg`: `8px 8px 0px 0px #000000`
- `shadow-neo-sm`: `2px 2px 0px 0px #000000`

## Component Classes

### Surfaces
- `.card`: White background, 3px black border, `shadow-neo`, rounded corners (`rounded-2xl`).

### Buttons
- `.btn-primary`: `bg-pop-pink`, bold text, black border, `shadow-neo`.
- `.btn-secondary`: `bg-pop-mint`, bold text, black border, `shadow-neo`.
- `.btn-ghost`: Minimal buttons with bold text and hover borders.

### Interaction States
- **Hover**: Usually `translate-x-[-2px] translate-y-[-2px]` with an increased shadow (`shadow-neo-lg`).
- **Active**: `translate-x-[2px] translate-y-[2px]` with shadow removed.

## Implementation Notes
- **Backdrop Blur**: Removed in favor of solid colors and bold outlines.
- **Gradients**: Minimized, used only where depth is absolutely necessary (e.g., over images).
- **Background**: Dot pattern (`radial-gradient`) on `pop-yellow` base.

This design system ensures a unique, high-energy identity for MOTD while maintaining readability and ease of use.
