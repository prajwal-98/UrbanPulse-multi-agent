# Pipeline Progress Component Documentation

## Overview

The pipeline progress component is a sophisticated, modern UI element that displays the execution flow of an 8-step multi-agent intelligence system. It combines sticky navigation, animated state transitions, real-time progress tracking, and responsive design.

## Key Features

### 1. **Sticky Navigation Bar**
- Fixed at the top of the page with backdrop blur effect
- Shows all 8 steps in a compact, horizontally scrollable format
- Displays real-time completion percentage
- Animated progress bar showing overall pipeline health
- Works seamlessly on mobile with horizontal scroll

### 2. **Visual States**
Each step displays one of four distinct states:

| State | Visual | Interaction | Use Case |
|-------|--------|-------------|----------|
| **Completed** | Emerald gradient with checkmark | Clickable to navigate | Step has finished |
| **Running** | Blue gradient with pulse indicator | Shows current step | Currently processing |
| **Pending** | Gray background | Non-interactive | Not yet reached |
| **Error** | (Future: Red state) | Alert display | Failed processing |

### 3. **Responsive Design**
- **Mobile**: Sticky header scales down, full 8-column grid hidden, horizontal scroll enabled
- **Tablet**: Compact spacing, optimized touch targets (36px minimum)
- **Desktop**: Full layout with tooltips on hover and generous spacing

### 4. **Progress Tracking**
- Real-time completion percentage calculation
- Color-coded progress bar (blue during processing, emerald when complete)
- Animated transitions between states
- Smooth duration-500 animations for visual feedback

### 5. **Accessibility**
- Semantic button elements with proper disabled states
- Tooltip labels for context on hover
- High contrast ratios (>7:1 for WCAG AA compliance)
- Screen reader friendly with proper ARIA labels
- Clear visual focus indicators

## Technical Implementation

### Component Structure

```
PipelineView
├── PipelineProgressBar (Sticky Header)
│   ├── Progress Percentage Display
│   ├── Step Node Buttons (8 total)
│   └── Connecting Lines
├── Page Header
├── Full Pipeline Overview Card
│   └── 8-Step Grid Layout
└── Content Area
    ├── Status Card (Idle/Loading/Complete)
    ├── Step-specific Content
    └── Error Card (if applicable)
```

### Color System

**Primary Gradients:**
- **Success**: `from-emerald-500 to-emerald-600` (Completed steps)
- **Active**: `from-blue-500 to-blue-600` (Running step)
- **Neutral**: Slate-200 to Slate-500 (Pending/Disabled)

**Background & Text:**
- Background: `bg-slate-50` (App-wide)
- Text: `text-slate-900` (Primary), `text-slate-500` (Secondary)
- Borders: `border-slate-200` (Default), `border-slate-200/50` (Subtle)

### Animation Details

**Transitions:**
- Duration: 300-500ms for step state changes
- Easing: `cubic-bezier(0.4, 0, 0.6, 1)` for progress bars
- Effects: Pulse animations for active state indicators

**Shadow Effects:**
- Active step: `shadow-lg shadow-blue-500/40` (Blue glow)
- Completed: `shadow-lg shadow-emerald-500/30` (Green glow)

### Key CSS Classes

```tailwind
/* Sticky positioning */
.sticky.top-0.z-40

/* Gradient backgrounds */
.bg-gradient-to-br.from-emerald-500.to-emerald-600
.bg-gradient-to-r.from-blue-500.to-blue-600

/* Smooth scrolling */
.scrollbar-hide  /* Custom utility for hiding scrollbars */

/* Responsive text */
.text-xs.sm:text-sm.md:text-base
```

## Usage in Context

### Props
```typescript
interface PipelineViewProps {
  stepNum: number;  // Current step (1-8)
}
```

### Session Context Integration
```typescript
interface SessionContext {
  sessionId: string;
  currentStep: number;
  pipelineStatus: "idle" | "running" | "complete" | "error";
  stepStatus: Record<string, "pending" | "done" | "error">;
  error?: string;
}
```

## Mobile Optimization

- Responsive padding: `px-4 sm:px-6 lg:px-8`
- Sticky header scales smoothly on all screen sizes
- Step dots resize: `w-9 h-9` (mobile) to `w-12 h-12` (on hover detail view)
- Touch targets maintain 44px minimum for accessibility
- Horizontal scroll on sticky bar prevents layout shift

## Browser Support

- Chrome/Edge: Full support (latest 2 versions)
- Firefox: Full support (latest 2 versions)
- Safari: Full support (iOS 14+)
- Mobile browsers: Optimized with touch-friendly interactions

## Performance Considerations

- Sticky positioning uses GPU acceleration via `transform` hardware rendering
- Animations use `transition-all` for smooth 60fps performance
- Progress bar uses `will-change` (implicit via Tailwind animations)
- SVG icons inline for zero external requests
- Component memoization prevents unnecessary re-renders

## Future Enhancements

1. **Error State Visualization**: Red gradient background for failed steps
2. **Detailed Timeline**: Expand to show timestamp and duration per step
3. **Step Descriptions**: Tooltip with dynamic descriptions during processing
4. **Estimated Time**: ETA calculations based on historical data
5. **Export Functionality**: Download pipeline execution report
6. **Pause/Resume**: Controls to halt pipeline mid-execution
7. **Dark Mode**: Dark theme variant with adjusted colors

## Customization Guide

### Changing Colors
Edit `/app/globals.css` color tokens:
```css
--primary: #0ea5e9;       /* Blue */
--success: #10b981;       /* Emerald */
--warning: #f59e0b;       /* Amber */
--error: #ef4444;         /* Red */
```

### Adjusting Animation Speed
Modify transition duration classes:
```tsx
transition-all duration-300  // Change 300 to preferred ms
animate-spin               // Adjust spinner speed
```

### Step Configuration
Edit the `STEPS` constant in `pipeline-view.tsx` to add/modify steps.

## Testing Checklist

- [ ] All 8 steps render correctly
- [ ] Click navigation between steps works
- [ ] Progress percentage updates in real-time
- [ ] Completed steps show checkmark
- [ ] Current step shows pulse animation
- [ ] Error state displays properly
- [ ] Mobile layout responds correctly
- [ ] Sticky header doesn't cover content
- [ ] Animations perform smoothly (60fps)
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility verified
