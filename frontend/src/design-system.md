# MOTD Design System

## Overview
This document outlines the unified design system for the MOTD (Music of the Day) application. The design focuses on a modern, clean, and music-inspired aesthetic with consistent components and color palettes.

## Color Palette

### Primary Colors (Neutral Base)
- `primary-50` to `primary-900`: Clean slate-based neutrals for text and backgrounds
- Used for: Body text, secondary backgrounds, borders

### Music Colors (Blue Theme)
- `music-50` to `music-900`: Blue-based colors for primary actions
- Used for: Primary buttons, active states, navigation highlights

### Accent Colors (Purple Theme)
- `accent-50` to `accent-900`: Purple-based colors for highlights and gradients
- Used for: Secondary actions, gradient combinations, special highlights

## Typography
- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 300, 400, 500, 600, 700
- **Hierarchy**: Consistent scaling with proper contrast ratios

## Component Classes

### Glass Morphism
- `.glass-surface`: Standard glass effect with white background
- `.glass-surface-dark`: Dark variant for dark themes

### Buttons
- `.btn-primary`: Main action buttons (music gradient)
- `.btn-secondary`: Secondary actions (white with subtle background)
- `.btn-ghost`: Minimal buttons for tertiary actions

### Cards
- `.card`: Standard card with glass morphism effect
- `.card-dark`: Dark variant of cards

### Navigation
- `.nav-item`: Base navigation item styling
- `.nav-item-active`: Active navigation state
- `.nav-item-inactive`: Inactive navigation state

### Form Elements
- `.input-field`: Unified input field styling with focus states

### Text Utilities
- `.gradient-text`: Music-to-accent gradient text effect

### Animation Classes
- `.animate-in`: Fade-in animation
- `.animate-up`: Slide-up animation
- `.animate-pulse-gentle`: Gentle pulse effect

## Design Principles

### 1. Glass Morphism
All surfaces use a subtle glass morphism effect with:
- Semi-transparent backgrounds
- Backdrop blur effects
- Subtle borders and shadows

### 2. Consistent Spacing
- Padding: Multiples of 4 (4px, 8px, 12px, 16px, 24px, 32px)
- Margins: Following same scale
- Gap: Consistent spacing in flex/grid layouts

### 3. Border Radius
- Small elements: `rounded-xl` (12px)
- Medium elements: `rounded-2xl` (16px)
- Large elements: `rounded-3xl` (24px)
- Extra large: `rounded-4xl` (32px)

### 4. Animations
- Duration: 300ms for most interactions
- Easing: `ease-out` for entrance, `ease-in-out` for toggles
- Hover effects: Subtle scale (1.02-1.05)
- Active states: Slight scale down (0.95)

### 5. Gradients
- Primary gradient: Music blue to accent purple
- Background gradients: Subtle, low opacity variations
- Text gradients: High contrast for visibility

## Usage Examples

### Button Component
```tsx
<Button variant="primary" size="md" leftIcon="🎵">
  Share Song
</Button>
```

### Card Component
```tsx
<div className="card p-6">
  <h3 className="gradient-text">Song Title</h3>
  <p className="text-primary-600">Artist Name</p>
</div>
```

### Form Input
```tsx
<input 
  type="text" 
  className="input-field" 
  placeholder="Enter song title"
/>
```

## Responsive Design

### Breakpoints
- Mobile: Default (< 640px)
- Tablet: `sm:` (≥ 640px)
- Desktop: `lg:` (≥ 1024px)

### Grid System
- Cards: 1 column mobile, 2 tablet, 3 desktop
- Consistent gap spacing across breakpoints

## Accessibility

### Color Contrast
- All text meets WCAG AA standards
- Interactive elements have sufficient contrast ratios

### Focus States
- Visible focus rings on all interactive elements
- Consistent focus styling across components

### Animation
- Respects `prefers-reduced-motion` preference
- Optional animations that enhance UX without being essential

## Implementation Notes

### CSS Architecture
- Tailwind CSS as the foundation
- Custom component classes in `@layer components`
- Utility-first approach with semantic component abstractions

### Performance
- Minimal custom CSS
- Optimized animations
- Progressive enhancement approach

This design system ensures consistency across the MOTD application while maintaining flexibility for future enhancements and features.
