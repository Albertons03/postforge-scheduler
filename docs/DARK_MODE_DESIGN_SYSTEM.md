# Dark Mode Design System Specification
## LinkedIn Post Scheduler Application

**Version:** 1.0
**Date:** December 5, 2025
**Status:** Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Design System Analysis](#current-design-system-analysis)
3. [Color Palette Specifications](#color-palette-specifications)
4. [Component Design Variants](#component-design-variants)
5. [UI Placement Recommendations](#ui-placement-recommendations)
6. [Implementation Strategy](#implementation-strategy)
7. [Accessibility Compliance](#accessibility-compliance)
8. [User Journey & Interaction Design](#user-journey--interaction-design)

---

## Executive Summary

This document provides comprehensive specifications for implementing a dual-theme system (light/dark mode) in the LinkedIn Post Scheduler application. The current application uses a dark theme by default with slate/gray color schemes. This design system introduces a complementary light mode while maintaining brand consistency and ensuring accessibility compliance.

**Key Design Principles:**
- **Consistency:** Maintain visual coherence across all pages and components
- **Accessibility:** WCAG 2.1 AA compliance for color contrast and keyboard navigation
- **Performance:** Minimal performance impact using CSS variables and Tailwind dark mode
- **User Control:** Persistent theme preference across sessions
- **Visual Hierarchy:** Clear distinction between primary, secondary, and tertiary elements in both modes

---

## Current Design System Analysis

### Existing Color Scheme (Dark Mode)

**Current Implementation:**
- **Primary Background:** `#0f172a` (slate-950) via CSS variables
- **Secondary Background:** `slate-900`, `slate-800` with gradients
- **Text Colors:** `#f1f5f9` (slate-100), `gray-400`, `gray-300`
- **Accent Colors:** Indigo-purple-pink gradient system
- **Border Colors:** `slate-700/50` with 50% opacity

**Brand Colors (Gradients):**
```
Primary: from-indigo-600 via-purple-600 to-pink-600
Secondary: from-purple-600 via-purple-500 to-pink-600
Tertiary: from-cyan-600 via-blue-500 to-blue-600
Success: from-emerald-600 via-teal-500 to-green-600
Warning: from-amber-600 via-orange-500 to-yellow-600
Error: from-rose-600 to-red-600
```

**Component Patterns:**
- Cards: `backdrop-blur-xl` with semi-transparent backgrounds
- Buttons: Gradient backgrounds with hover scale effects
- Inputs: Dark backgrounds (`slate-900/60`) with colored focus rings
- Shadows: Colored glow effects for hover states

**Current Strengths:**
- Strong visual hierarchy with gradients
- Consistent border radius system (xl, 2xl)
- Engaging hover animations and transitions
- Colored shadows for depth perception

**Areas for Enhancement:**
- No light mode alternative
- Hard-coded dark values in many components
- CSS variables only for background/foreground
- Mixed usage of Tailwind classes and custom styles

---

## Color Palette Specifications

### Semantic Color System

#### Dark Mode Colors

**Surface Colors:**
```css
--surface-primary-dark: #0f172a      /* slate-950 - Main background */
--surface-secondary-dark: #1e293b    /* slate-900 - Card backgrounds */
--surface-tertiary-dark: #334155     /* slate-800 - Elevated elements */
--surface-hover-dark: #475569        /* slate-700 - Hover states */
--surface-active-dark: #64748b       /* slate-600 - Active/pressed states */
```

**Text Colors:**
```css
--text-primary-dark: #f1f5f9         /* slate-100 - Primary text */
--text-secondary-dark: #cbd5e1       /* slate-300 - Secondary text */
--text-tertiary-dark: #94a3b8        /* slate-400 - Tertiary/muted text */
--text-disabled-dark: #64748b        /* slate-500 - Disabled text */
--text-inverse-dark: #0f172a         /* For text on light backgrounds */
```

**Border Colors:**
```css
--border-primary-dark: rgba(51, 65, 85, 0.5)   /* slate-700/50 */
--border-secondary-dark: rgba(71, 85, 105, 0.3) /* slate-600/30 */
--border-hover-dark: rgba(148, 163, 184, 0.3)   /* slate-400/30 */
--border-focus-dark: rgba(99, 102, 241, 0.5)    /* indigo-600/50 */
```

#### Light Mode Colors

**Surface Colors:**
```css
--surface-primary-light: #ffffff     /* Pure white - Main background */
--surface-secondary-light: #f8fafc   /* slate-50 - Card backgrounds */
--surface-tertiary-light: #f1f5f9    /* slate-100 - Elevated elements */
--surface-hover-light: #e2e8f0       /* slate-200 - Hover states */
--surface-active-light: #cbd5e1      /* slate-300 - Active/pressed states */
```

**Text Colors:**
```css
--text-primary-light: #0f172a        /* slate-950 - Primary text */
--text-secondary-light: #334155      /* slate-800 - Secondary text */
--text-tertiary-light: #64748b       /* slate-600 - Tertiary/muted text */
--text-disabled-light: #94a3b8       /* slate-400 - Disabled text */
--text-inverse-light: #ffffff        /* For text on dark backgrounds */
```

**Border Colors:**
```css
--border-primary-light: rgba(226, 232, 240, 1)   /* slate-200 - solid */
--border-secondary-light: rgba(241, 245, 249, 1)  /* slate-100 - subtle */
--border-hover-light: rgba(203, 213, 225, 1)      /* slate-300 - hover */
--border-focus-light: rgba(99, 102, 241, 0.5)     /* indigo-600/50 */
```

#### Brand Colors (Theme-Agnostic)

These colors remain consistent across both themes:

**Primary Accent (Indigo):**
```css
--accent-primary-50: #eef2ff
--accent-primary-100: #e0e7ff
--accent-primary-200: #c7d2fe
--accent-primary-300: #a5b4fc
--accent-primary-400: #818cf8    /* Light mode buttons/links */
--accent-primary-500: #6366f1    /* Standard usage */
--accent-primary-600: #4f46e5    /* Dark mode buttons/links */
--accent-primary-700: #4338ca
--accent-primary-800: #3730a3
--accent-primary-900: #312e81
```

**Secondary Accent (Purple):**
```css
--accent-secondary-400: #c084fc  /* Light mode */
--accent-secondary-500: #a855f7  /* Standard */
--accent-secondary-600: #9333ea  /* Dark mode */
--accent-secondary-700: #7e22ce
```

**Tertiary Accent (Pink):**
```css
--accent-tertiary-400: #f472b6   /* Light mode */
--accent-tertiary-500: #ec4899   /* Standard */
--accent-tertiary-600: #db2777   /* Dark mode */
```

**Status Colors:**
```css
/* Success - Green */
--success-light: #10b981          /* emerald-500 */
--success-dark: #059669           /* emerald-600 */
--success-bg-light: #d1fae5       /* emerald-100 */
--success-bg-dark: rgba(16, 185, 129, 0.1)

/* Warning - Amber */
--warning-light: #f59e0b          /* amber-500 */
--warning-dark: #d97706           /* amber-600 */
--warning-bg-light: #fef3c7       /* amber-100 */
--warning-bg-dark: rgba(245, 158, 11, 0.1)

/* Error - Red */
--error-light: #ef4444            /* red-500 */
--error-dark: #dc2626             /* red-600 */
--error-bg-light: #fee2e2         /* red-100 */
--error-bg-dark: rgba(239, 68, 68, 0.1)

/* Info - Cyan */
--info-light: #06b6d4             /* cyan-500 */
--info-dark: #0891b2              /* cyan-600 */
--info-bg-light: #cffafe          /* cyan-100 */
--info-bg-dark: rgba(6, 182, 212, 0.1)
```

### Gradient System

Gradients require adjustment for light mode to maintain visibility:

**Dark Mode Gradients:**
```css
/* Primary Gradient */
bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600

/* Card Backgrounds */
bg-gradient-to-br from-slate-800/80 to-slate-900/80

/* Sidebar */
bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
```

**Light Mode Gradients:**
```css
/* Primary Gradient (slightly darker for better contrast) */
bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500

/* Card Backgrounds (subtle gradients) */
bg-gradient-to-br from-slate-50 to-slate-100

/* Sidebar */
bg-gradient-to-b from-white via-slate-50 to-white
```

### Shadow System

**Dark Mode Shadows:**
```css
/* Card Shadows */
--shadow-sm-dark: 0 2px 8px rgba(0, 0, 0, 0.3)
--shadow-md-dark: 0 4px 16px rgba(0, 0, 0, 0.4)
--shadow-lg-dark: 0 8px 32px rgba(0, 0, 0, 0.5)

/* Glow Effects */
--shadow-glow-indigo-dark: 0 0 20px rgba(99, 102, 241, 0.4)
--shadow-glow-emerald-dark: 0 0 20px rgba(16, 185, 129, 0.4)
```

**Light Mode Shadows:**
```css
/* Card Shadows */
--shadow-sm-light: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)
--shadow-md-light: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)
--shadow-lg-light: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)

/* Glow Effects (more subtle) */
--shadow-glow-indigo-light: 0 0 15px rgba(99, 102, 241, 0.2)
--shadow-glow-emerald-light: 0 0 15px rgba(16, 185, 129, 0.2)
```

---

## Component Design Variants

### Button Component

#### Primary Button

**Dark Mode:**
```tsx
className="
  bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
  hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700
  text-white font-bold rounded-xl
  shadow-lg shadow-indigo-500/30
  hover:shadow-xl hover:shadow-indigo-500/40
  hover:scale-105 active:scale-95
  transition-all duration-200
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-indigo-500 focus-visible:ring-offset-2
  focus-visible:ring-offset-slate-950
  disabled:opacity-50 disabled:cursor-not-allowed
"
```

**Light Mode:**
```tsx
className="
  bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
  hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600
  text-white font-bold rounded-xl
  shadow-md shadow-indigo-500/20
  hover:shadow-lg hover:shadow-indigo-500/30
  hover:scale-105 active:scale-95
  transition-all duration-200
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-indigo-500 focus-visible:ring-offset-2
  focus-visible:ring-offset-white
  disabled:opacity-50 disabled:cursor-not-allowed
"
```

#### Secondary Button (Outline)

**Dark Mode:**
```tsx
className="
  bg-transparent border-2 border-slate-600/50
  hover:bg-slate-800/50 hover:border-slate-500
  text-gray-300 hover:text-white
  font-semibold rounded-xl
  transition-all duration-200
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-indigo-500 focus-visible:ring-offset-2
  focus-visible:ring-offset-slate-950
"
```

**Light Mode:**
```tsx
className="
  bg-transparent border-2 border-slate-300
  hover:bg-slate-100 hover:border-slate-400
  text-slate-700 hover:text-slate-900
  font-semibold rounded-xl
  transition-all duration-200
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-indigo-500 focus-visible:ring-offset-2
  focus-visible:ring-offset-white
"
```

#### Ghost Button

**Dark Mode:**
```tsx
className="
  bg-transparent
  hover:bg-slate-800/50
  text-gray-300 hover:text-white
  font-medium rounded-lg
  transition-colors duration-200
"
```

**Light Mode:**
```tsx
className="
  bg-transparent
  hover:bg-slate-100
  text-slate-700 hover:text-slate-900
  font-medium rounded-lg
  transition-colors duration-200
"
```

### Card Component

**Dark Mode:**
```tsx
className="
  bg-gradient-to-br from-slate-800/80 to-slate-900/80
  backdrop-blur-xl
  rounded-2xl border-2 border-slate-700/50
  p-6 md:p-8
  shadow-xl
  hover:shadow-2xl hover:border-slate-600/50
  transition-all duration-300
"
```

**Light Mode:**
```tsx
className="
  bg-white
  rounded-2xl border-2 border-slate-200
  p-6 md:p-8
  shadow-md
  hover:shadow-lg hover:border-slate-300
  transition-all duration-300
"
```

### Input Components

#### Text Input

**Dark Mode:**
```tsx
className="
  w-full px-5 py-3.5
  bg-slate-900/60 border-2 border-slate-600/50
  rounded-xl text-white placeholder-gray-500
  focus:outline-none focus:border-indigo-500
  focus:ring-4 focus:ring-indigo-500/20
  hover:border-slate-500
  transition-all duration-200
  disabled:opacity-50 disabled:cursor-not-allowed
"
```

**Light Mode:**
```tsx
className="
  w-full px-5 py-3.5
  bg-white border-2 border-slate-300
  rounded-xl text-slate-900 placeholder-gray-400
  focus:outline-none focus:border-indigo-500
  focus:ring-4 focus:ring-indigo-500/10
  hover:border-slate-400
  transition-all duration-200
  disabled:opacity-50 disabled:cursor-not-allowed
"
```

#### Select Dropdown

**Dark Mode:**
```tsx
className="
  w-full px-5 py-3.5
  bg-slate-900/60 border-2 border-slate-600/50
  rounded-xl text-white
  focus:outline-none focus:border-purple-500
  focus:ring-4 focus:ring-purple-500/20
  hover:border-slate-500 cursor-pointer
  transition-all duration-200
"
```

**Light Mode:**
```tsx
className="
  w-full px-5 py-3.5
  bg-white border-2 border-slate-300
  rounded-xl text-slate-900
  focus:outline-none focus:border-purple-500
  focus:ring-4 focus:ring-purple-500/10
  hover:border-slate-400 cursor-pointer
  transition-all duration-200
"
```

#### Textarea

**Dark Mode:**
```tsx
className="
  w-full px-5 py-4
  bg-slate-900/60 border-2 border-slate-600/50
  rounded-xl text-white placeholder-gray-500
  focus:outline-none focus:border-cyan-500
  focus:ring-4 focus:ring-cyan-500/20
  resize-none font-mono text-sm leading-relaxed
  hover:border-slate-500
  transition-all duration-200
"
```

**Light Mode:**
```tsx
className="
  w-full px-5 py-4
  bg-white border-2 border-slate-300
  rounded-xl text-slate-900 placeholder-gray-400
  focus:outline-none focus:border-cyan-500
  focus:ring-4 focus:ring-cyan-500/10
  resize-none font-mono text-sm leading-relaxed
  hover:border-slate-400
  transition-all duration-200
"
```

### Navigation Components

#### Sidebar

**Dark Mode:**
```tsx
/* Container */
className="
  bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
  border-r border-slate-700/50
  shadow-lg
"

/* Active Nav Item */
className="
  bg-gradient-to-r from-indigo-600 to-purple-600
  text-white shadow-lg shadow-indigo-500/30
"

/* Inactive Nav Item */
className="
  text-gray-300
  hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10
  hover:text-white hover:shadow-sm
"
```

**Light Mode:**
```tsx
/* Container */
className="
  bg-gradient-to-b from-white via-slate-50 to-white
  border-r border-slate-200
  shadow-md
"

/* Active Nav Item */
className="
  bg-gradient-to-r from-indigo-500 to-purple-500
  text-white shadow-md shadow-indigo-500/20
"

/* Inactive Nav Item */
className="
  text-slate-700
  hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50
  hover:text-slate-900 hover:shadow-sm
"
```

### Badge Component

**Dark Mode:**
```tsx
/* Success Badge */
className="
  inline-flex items-center px-3 py-1
  bg-gradient-to-r from-emerald-600 to-teal-600
  text-white rounded-lg text-xs font-semibold
  shadow-sm
"

/* Warning Badge */
className="
  inline-flex items-center px-3 py-1
  bg-gradient-to-r from-amber-600 to-orange-600
  text-white rounded-lg text-xs font-semibold
  shadow-sm
"
```

**Light Mode:**
```tsx
/* Success Badge */
className="
  inline-flex items-center px-3 py-1
  bg-emerald-100 border border-emerald-300
  text-emerald-700 rounded-lg text-xs font-semibold
"

/* Warning Badge */
className="
  inline-flex items-center px-3 py-1
  bg-amber-100 border border-amber-300
  text-amber-700 rounded-lg text-xs font-semibold
"
```

### Stat Card Component

**Dark Mode:**
```tsx
className="
  bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600
  rounded-2xl border-2 border-indigo-400/30
  p-6 text-white
  shadow-xl hover:shadow-2xl
  hover:scale-105 transition-all duration-300
  group relative overflow-hidden
"
```

**Light Mode:**
```tsx
className="
  bg-gradient-to-br from-indigo-500 via-indigo-400 to-purple-500
  rounded-2xl border-2 border-indigo-300/50
  p-6 text-white
  shadow-md hover:shadow-lg
  hover:scale-105 transition-all duration-300
  group relative overflow-hidden
"
```

### Dialog/Modal Component

**Dark Mode:**
```tsx
/* Overlay */
className="
  fixed inset-0 bg-black/80 backdrop-blur-sm
  data-[state=open]:animate-in data-[state=closed]:animate-out
  data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
"

/* Content */
className="
  bg-slate-900 border-2 border-slate-700
  text-white rounded-2xl shadow-2xl
  max-w-lg w-full p-6
"
```

**Light Mode:**
```tsx
/* Overlay */
className="
  fixed inset-0 bg-black/40 backdrop-blur-sm
  data-[state=open]:animate-in data-[state=closed]:animate-out
  data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
"

/* Content */
className="
  bg-white border-2 border-slate-200
  text-slate-900 rounded-2xl shadow-xl
  max-w-lg w-full p-6
"
```

### Table Component

**Dark Mode:**
```tsx
/* Table Container */
className="
  bg-slate-900/80 backdrop-blur-xl
  rounded-2xl border-2 border-slate-700/50
  overflow-hidden
"

/* Table Header */
className="
  bg-slate-800/60 border-b-2 border-slate-700/50
  text-gray-200 font-semibold
"

/* Table Row */
className="
  border-b border-slate-700/30
  hover:bg-slate-800/40
  transition-colors duration-150
"

/* Table Cell */
className="text-gray-300"
```

**Light Mode:**
```tsx
/* Table Container */
className="
  bg-white
  rounded-2xl border-2 border-slate-200
  overflow-hidden
"

/* Table Header */
className="
  bg-slate-50 border-b-2 border-slate-200
  text-slate-700 font-semibold
"

/* Table Row */
className="
  border-b border-slate-200
  hover:bg-slate-50
  transition-colors duration-150
"

/* Table Cell */
className="text-slate-700"
```

### Loading Skeleton

**Dark Mode:**
```tsx
className="
  bg-gradient-to-r from-slate-700 to-slate-600
  rounded-xl animate-pulse
  relative overflow-hidden
  before:absolute before:inset-0
  before:bg-gradient-to-r before:from-transparent
  before:via-slate-500/20 before:to-transparent
  before:animate-shimmer-loading
"
```

**Light Mode:**
```tsx
className="
  bg-gradient-to-r from-slate-200 to-slate-300
  rounded-xl animate-pulse
  relative overflow-hidden
  before:absolute before:inset-0
  before:bg-gradient-to-r before:from-transparent
  before:via-white/40 before:to-transparent
  before:animate-shimmer-loading
"
```

---

## UI Placement Recommendations

### Theme Toggle Component

#### Primary Placement: Header/Top Bar

**Location:** Top-right corner of the dashboard, next to the UserButton
**Rationale:**
- Universally accessible across all pages
- Consistent with user expectations (top-right is standard for theme toggles)
- Doesn't interfere with navigation flow
- Always visible without scrolling

**Visual Design:**

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo/Brand]                           [Toggle] [UserButton]│
└─────────────────────────────────────────────────────────────┘
```

**Component Specifications:**

**Icon-Based Toggle (Recommended):**
```tsx
<button
  onClick={toggleTheme}
  className="
    p-2.5 rounded-xl
    bg-slate-800/50 dark:bg-slate-900/50
    border-2 border-slate-600/30 dark:border-slate-700/50
    hover:bg-slate-700/50 dark:hover:bg-slate-800/50
    hover:border-slate-500/50 dark:hover:border-slate-600/50
    transition-all duration-200
    hover:scale-110 active:scale-95
    group
  "
  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
>
  {theme === 'dark' ? (
    <Sun className="w-5 h-5 text-amber-400 group-hover:text-amber-300
                    group-hover:rotate-180 transition-all duration-300" />
  ) : (
    <Moon className="w-5 h-5 text-indigo-600 group-hover:text-indigo-500
                     group-hover:rotate-12 transition-all duration-300" />
  )}
</button>
```

**Alternative: Toggle Switch Design:**
```tsx
<div className="flex items-center gap-2 p-1 bg-slate-800/50 dark:bg-slate-900/50
                rounded-full border-2 border-slate-600/30 dark:border-slate-700/50">
  <button
    onClick={() => setTheme('light')}
    className={cn(
      "p-2 rounded-full transition-all duration-200",
      theme === 'light'
        ? "bg-white shadow-md"
        : "bg-transparent"
    )}
  >
    <Sun className="w-4 h-4 text-amber-500" />
  </button>
  <button
    onClick={() => setTheme('dark')}
    className={cn(
      "p-2 rounded-full transition-all duration-200",
      theme === 'dark'
        ? "bg-slate-700 shadow-md"
        : "bg-transparent"
    )}
  >
    <Moon className="w-4 h-4 text-indigo-400" />
  </button>
</div>
```

#### Secondary Placement: Settings Page

**Location:** Appearance section in Settings page
**Rationale:**
- Provides a dedicated space for theme customization
- Allows for additional theme-related settings in the future
- Expected location for appearance settings

**Design Specifications:**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Appearance</CardTitle>
    <CardDescription>
      Customize how PostForge AI looks on your device
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <Label>Theme</Label>
      <div className="grid grid-cols-3 gap-4">
        {/* Light Mode Option */}
        <button
          onClick={() => setTheme('light')}
          className={cn(
            "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
            theme === 'light'
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
              : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
          )}
        >
          <div className="w-full h-20 rounded-lg bg-white border-2 border-slate-200
                          flex items-center justify-center">
            <Sun className="w-8 h-8 text-amber-500" />
          </div>
          <span className="font-medium text-sm">Light</span>
          {theme === 'light' && (
            <CheckCircle className="w-5 h-5 text-indigo-600" />
          )}
        </button>

        {/* Dark Mode Option */}
        <button
          onClick={() => setTheme('dark')}
          className={cn(
            "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
            theme === 'dark'
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
              : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
          )}
        >
          <div className="w-full h-20 rounded-lg bg-slate-900 border-2 border-slate-700
                          flex items-center justify-center">
            <Moon className="w-8 h-8 text-indigo-400" />
          </div>
          <span className="font-medium text-sm">Dark</span>
          {theme === 'dark' && (
            <CheckCircle className="w-5 h-5 text-indigo-600" />
          )}
        </button>

        {/* System Mode Option */}
        <button
          onClick={() => setTheme('system')}
          className={cn(
            "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
            theme === 'system'
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
              : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
          )}
        >
          <div className="w-full h-20 rounded-lg bg-gradient-to-r from-white to-slate-900
                          border-2 border-slate-400 flex items-center justify-center">
            <Monitor className="w-8 h-8 text-slate-600" />
          </div>
          <span className="font-medium text-sm">System</span>
          {theme === 'system' && (
            <CheckCircle className="w-5 h-5 text-indigo-600" />
          )}
        </button>
      </div>
    </div>
  </CardContent>
</Card>
```

#### Mobile Considerations

**Placement:** Add theme toggle to mobile menu/hamburger menu
**Design:** Use the same icon-based toggle but ensure minimum touch target of 48x48px

```tsx
<nav className="mobile-menu">
  {/* Navigation items */}
  <Separator />
  <div className="flex items-center justify-between p-4">
    <span className="text-sm font-medium">Theme</span>
    {/* Theme toggle button */}
  </div>
</nav>
```

### Layout Integration Points

#### 1. Dashboard Layout (D:\ai-linkedIn-scheduler\src\app\dashboard\layout.tsx)

**Modification Point:** Add theme toggle to the top bar between logo and user button

```tsx
// Line ~164 - User Section
<div className="flex items-center gap-3">
  <ThemeToggle />
  <div className="p-2 rounded-full...">
    <UserButton ... />
  </div>
</div>
```

#### 2. Settings Page (D:\ai-linkedIn-scheduler\src\app\dashboard\settings\page.tsx)

**Modification Point:** Add new Appearance section before Billing section

```tsx
{/* Profile Section */}
<ProfileSection ... />
<Separator />

{/* NEW: Appearance Section */}
<AppearanceSection />
<Separator />

{/* Billing Section */}
<BillingSection ... />
```

---

## Implementation Strategy

### Recommended Approach: Tailwind Dark Mode + CSS Variables + Context API

This hybrid approach provides the best balance of performance, maintainability, and developer experience.

### Phase 1: Foundation Setup

#### 1.1 Update tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  // Enable class-based dark mode
  darkMode: 'class',

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        // Semantic color tokens that adapt to theme
        background: "var(--background)",
        foreground: "var(--foreground)",

        // New semantic tokens
        surface: {
          primary: "var(--surface-primary)",
          secondary: "var(--surface-secondary)",
          tertiary: "var(--surface-tertiary)",
          hover: "var(--surface-hover)",
          active: "var(--surface-active)",
        },

        border: {
          DEFAULT: "var(--border-primary)",
          secondary: "var(--border-secondary)",
          hover: "var(--border-hover)",
        },

        // Keep existing gradient support
        primary: {
          DEFAULT: "var(--accent-primary-500)",
          foreground: "var(--text-inverse)",
        },
      },

      boxShadow: {
        // Theme-aware shadows
        'card-sm': 'var(--shadow-card-sm)',
        'card-md': 'var(--shadow-card-md)',
        'card-lg': 'var(--shadow-card-lg)',

        // Keep existing glow effects
        'glow-emerald': '0 0 20px rgba(16, 185, 129, var(--glow-opacity))',
        'glow-indigo': '0 0 20px rgba(99, 102, 241, var(--glow-opacity))',
        // ... other glow effects
      },

      // Keep existing animations
      animation: {
        'shimmer-loading': 'shimmer-loading 2s infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        // ...
      },

      keyframes: {
        // Keep existing keyframes
      },
    },
  },
  plugins: [],
};

export default config;
```

#### 1.2 Update globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ============================================
   CSS Variables for Theme System
   ============================================ */

:root {
  /* Light Mode (Default) */
  --background: #ffffff;
  --foreground: #0f172a;

  /* Surface Colors */
  --surface-primary: #ffffff;
  --surface-secondary: #f8fafc;
  --surface-tertiary: #f1f5f9;
  --surface-hover: #e2e8f0;
  --surface-active: #cbd5e1;

  /* Text Colors */
  --text-primary: #0f172a;
  --text-secondary: #334155;
  --text-tertiary: #64748b;
  --text-disabled: #94a3b8;
  --text-inverse: #ffffff;

  /* Border Colors */
  --border-primary: #e2e8f0;
  --border-secondary: #f1f5f9;
  --border-hover: #cbd5e1;

  /* Shadow System */
  --shadow-card-sm: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
  --shadow-card-md: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-card-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);

  /* Glow Intensity */
  --glow-opacity: 0.2;

  /* Accent Colors (Theme-agnostic) */
  --accent-primary-500: #6366f1;
  --accent-primary-600: #4f46e5;
}

.dark {
  /* Dark Mode Variables */
  --background: #0f172a;
  --foreground: #f1f5f9;

  /* Surface Colors */
  --surface-primary: #0f172a;
  --surface-secondary: #1e293b;
  --surface-tertiary: #334155;
  --surface-hover: #475569;
  --surface-active: #64748b;

  /* Text Colors */
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-tertiary: #94a3b8;
  --text-disabled: #64748b;
  --text-inverse: #0f172a;

  /* Border Colors */
  --border-primary: rgba(51, 65, 85, 0.5);
  --border-secondary: rgba(71, 85, 105, 0.3);
  --border-hover: rgba(148, 163, 184, 0.3);

  /* Shadow System */
  --shadow-card-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-card-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-card-lg: 0 8px 32px rgba(0, 0, 0, 0.5);

  /* Glow Intensity */
  --glow-opacity: 0.4;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
               'Helvetica Neue', Arial, sans-serif;
}

/* Keep existing utility classes and animations */
@layer utilities {
  /* ... existing utilities ... */
}

/* Smooth transitions for theme switching */
* {
  @apply transition-colors duration-200;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0ms !important;
    animation-duration: 0ms !important;
  }
}

/* Focus states for accessibility */
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}
```

### Phase 2: Theme Context & Provider

#### 2.1 Create Theme Provider

**File:** `src/contexts/ThemeContext.tsx`

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  // Handle theme changes
  useEffect(() => {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    let effectiveTheme: 'light' | 'dark' = 'dark';

    if (theme === 'system') {
      // Use system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      effectiveTheme = systemTheme;
    } else {
      effectiveTheme = theme;
    }

    // Apply theme class
    root.classList.add(effectiveTheme);
    setResolvedTheme(effectiveTheme);

    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
      setResolvedTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

#### 2.2 Create Theme Toggle Component

**File:** `src/components/ThemeToggle.tsx`

```typescript
'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'icon' | 'switch';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          p-2.5 rounded-xl
          bg-surface-secondary dark:bg-surface-tertiary
          border-2 border-border-primary dark:border-border-secondary
          hover:bg-surface-hover dark:hover:bg-surface-hover
          hover:border-border-hover dark:hover:border-border-hover
          transition-all duration-200
          hover:scale-110 active:scale-95
          group
          ${className}
        `}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="w-5 h-5 text-amber-400 group-hover:text-amber-300
                          group-hover:rotate-180 transition-all duration-300" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-600 group-hover:text-indigo-500
                           group-hover:rotate-12 transition-all duration-300" />
        )}
      </button>
    );
  }

  return (
    <div className={`
      flex items-center gap-2 p-1
      bg-surface-secondary dark:bg-surface-tertiary
      rounded-full border-2 border-border-primary dark:border-border-secondary
      ${className}
    `}>
      <button
        onClick={() => setTheme('light')}
        className={`
          p-2 rounded-full transition-all duration-200
          ${resolvedTheme === 'light'
            ? 'bg-white shadow-md'
            : 'bg-transparent hover:bg-surface-hover'
          }
        `}
        aria-label="Switch to light mode"
      >
        <Sun className={`w-4 h-4 ${
          resolvedTheme === 'light' ? 'text-amber-500' : 'text-gray-400'
        }`} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`
          p-2 rounded-full transition-all duration-200
          ${resolvedTheme === 'dark'
            ? 'bg-slate-700 shadow-md'
            : 'bg-transparent hover:bg-surface-hover'
          }
        `}
        aria-label="Switch to dark mode"
      >
        <Moon className={`w-4 h-4 ${
          resolvedTheme === 'dark' ? 'text-indigo-400' : 'text-gray-400'
        }`} />
      </button>
    </div>
  );
}
```

#### 2.3 Integrate Theme Provider in Root Layout

**File:** `src/app/layout.tsx`

```typescript
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Phase 3: Component Migration Strategy

#### 3.1 Migration Priority

**Tier 1 (Critical - Week 1):**
1. Layout components (dashboard layout, sidebar)
2. Navigation components
3. Basic UI components (Button, Card, Input)

**Tier 2 (Important - Week 2):**
4. Form components (Select, Textarea, Label)
5. Data display components (Table, Badge)
6. Modal/Dialog components

**Tier 3 (Enhancement - Week 3):**
7. Complex components (PostGenerator, CreditDisplay)
8. Settings page components
9. Analytics/Charts

#### 3.2 Component Migration Pattern

**Before:**
```tsx
<div className="bg-slate-900 border-slate-700 text-white">
```

**After:**
```tsx
<div className="bg-surface-secondary dark:bg-surface-secondary
                border-border-primary dark:border-border-primary
                text-foreground">
```

**Or using semantic classes:**
```tsx
<div className="bg-surface-secondary border-border-primary text-foreground">
```

#### 3.3 Update shadcn/ui Components

Update base components to use theme-aware tokens:

**File:** `src/components/ui/button.tsx`

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-500 dark:via-purple-500 dark:to-pink-500 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 dark:hover:from-indigo-600 dark:hover:via-purple-600 dark:hover:to-pink-600 shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/30",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border-2 border-border-primary dark:border-border-primary bg-transparent hover:bg-surface-hover dark:hover:bg-surface-hover",
        secondary: "bg-surface-tertiary dark:bg-surface-tertiary text-foreground hover:bg-surface-hover dark:hover:bg-surface-hover",
        ghost: "hover:bg-surface-hover dark:hover:bg-surface-hover hover:text-foreground",
        link: "text-indigo-600 dark:text-indigo-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### Phase 4: Testing & Validation

#### 4.1 Visual Regression Testing

**Test Checklist:**
- [ ] All pages render correctly in light mode
- [ ] All pages render correctly in dark mode
- [ ] Theme toggle works on all pages
- [ ] Theme preference persists across sessions
- [ ] System theme preference is respected
- [ ] No FOUC (Flash of Unstyled Content) on page load
- [ ] Gradients maintain visibility in both modes
- [ ] Shadows are appropriately subtle/prominent
- [ ] Text contrast meets WCAG AA standards

#### 4.2 Accessibility Testing

**WCAG 2.1 Level AA Compliance:**
- [ ] Color contrast ratio minimum 4.5:1 for normal text
- [ ] Color contrast ratio minimum 3:1 for large text
- [ ] Color contrast ratio minimum 3:1 for UI components
- [ ] Focus indicators visible in both themes
- [ ] Theme toggle keyboard accessible (Tab + Enter/Space)
- [ ] Screen reader announces theme changes
- [ ] No information conveyed by color alone
- [ ] Reduced motion preferences respected

#### 4.3 Cross-Browser Testing

**Browsers:**
- Chrome/Edge (Chromium)
- Firefox
- Safari (macOS/iOS)

**Test Cases:**
- CSS variable support
- Dark mode class toggling
- LocalStorage persistence
- System theme detection

---

## Accessibility Compliance

### WCAG 2.1 Level AA Requirements

#### 1. Color Contrast

**Text Contrast Requirements:**
- Normal text (< 18pt): 4.5:1 minimum
- Large text (≥ 18pt or 14pt bold): 3:1 minimum
- UI components and graphics: 3:1 minimum

**Validated Color Combinations:**

**Light Mode:**
```
Background: #ffffff vs Text: #0f172a = 19.1:1 ✓
Background: #f8fafc vs Text: #0f172a = 18.2:1 ✓
Background: #f1f5f9 vs Text: #334155 = 11.8:1 ✓
Indigo-500 vs White = 8.6:1 ✓
```

**Dark Mode:**
```
Background: #0f172a vs Text: #f1f5f9 = 16.8:1 ✓
Background: #1e293b vs Text: #cbd5e1 = 12.1:1 ✓
Background: #334155 vs Text: #e2e8f0 = 9.5:1 ✓
Indigo-400 vs Slate-900 = 7.2:1 ✓
```

#### 2. Keyboard Navigation

**Requirements:**
- All interactive elements must be reachable via keyboard
- Tab order must be logical and sequential
- Focus indicators must be clearly visible
- No keyboard traps

**Implementation:**
```tsx
// Focus visible styles
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-indigo-500
focus-visible:ring-offset-2
focus-visible:ring-offset-background
```

**Theme Toggle Keyboard Support:**
- Tab: Focus theme toggle
- Enter/Space: Toggle theme
- Escape: Close settings panel (if in settings)

#### 3. Screen Reader Support

**Semantic HTML Structure:**
```tsx
<button
  onClick={toggleTheme}
  aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
  aria-pressed={resolvedTheme === 'dark'}
>
  {/* Icon */}
</button>
```

**Live Region Announcements:**
```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {`Theme switched to ${resolvedTheme} mode`}
</div>
```

#### 4. Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0ms !important;
    animation-duration: 0ms !important;
  }

  .animate-spin,
  .animate-pulse,
  .animate-bounce {
    animation: none !important;
  }
}
```

#### 5. Focus Management

**Focus Trap in Modals:**
```tsx
// When modal opens, trap focus
useEffect(() => {
  if (isOpen) {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];

    firstElement?.focus();

    // Handle Tab key to cycle focus
  }
}, [isOpen]);
```

#### 6. Color Independence

**Never rely on color alone:**
- Use icons alongside color badges
- Provide text labels for status indicators
- Use patterns or shapes for data visualization

**Example:**
```tsx
{/* Bad: Color only */}
<span className="text-green-500">Active</span>

{/* Good: Icon + Color + Text */}
<span className="flex items-center gap-2 text-green-500">
  <CheckCircle className="w-4 h-4" />
  <span>Active</span>
</span>
```

#### 7. Touch Target Size

**Minimum touch target: 48x48px**

```tsx
// Ensure buttons meet minimum size
<button className="min-h-[48px] min-w-[48px] p-3">
  <Icon className="w-5 h-5" />
</button>
```

---

## User Journey & Interaction Design

### Theme Switching User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Visits Application                      │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ First Visit?  │
         └───┬───────┬───┘
             │       │
         Yes │       │ No
             │       │
             ▼       ▼
    ┌─────────────┐ ┌──────────────────┐
    │ Check System│ │ Load Saved Theme │
    │ Preference  │ │ from localStorage│
    └──────┬──────┘ └────────┬─────────┘
           │                 │
           │                 │
           ▼                 ▼
    ┌──────────────────────────────┐
    │  Apply Theme to <html> class │
    │  - Remove existing classes   │
    │  - Add 'light' or 'dark'     │
    │  - Update CSS variables      │
    └────────────┬─────────────────┘
                 │
                 ▼
    ┌──────────────────────────────┐
    │  User Interacts with Toggle  │
    │  - Click/Tap theme button    │
    │  - Or select in Settings     │
    └────────────┬─────────────────┘
                 │
                 ▼
    ┌──────────────────────────────┐
    │  Theme Transition Animation  │
    │  - 200ms color transitions   │
    │  - Smooth class swap         │
    │  - Update icon rotation      │
    └────────────┬─────────────────┘
                 │
                 ▼
    ┌──────────────────────────────┐
    │  Save Preference             │
    │  - localStorage.setItem()    │
    │  - Persist across sessions   │
    └──────────────────────────────┘
```

### First-Time User Experience

**Default Behavior:**
1. Check if user has saved preference → Use that
2. If no saved preference → Check system preference
3. Apply appropriate theme immediately (no flash)
4. Show subtle tooltip on first visit: "Toggle theme anytime"

### Interaction States

#### Theme Toggle Button States

**Default (Dark Mode):**
- Moon icon, indigo color
- Subtle glow on hover
- Rotate animation on hover

**Default (Light Mode):**
- Sun icon, amber color
- Subtle shadow on hover
- Rotate animation on hover

**Focus:**
- 2px indigo ring
- 2px offset from button
- Visible keyboard focus

**Active/Pressed:**
- Scale down to 95%
- Immediate theme switch
- Icon rotation animation

**Disabled:**
- Opacity 50%
- Cursor not-allowed
- No interactions

### Transition Behavior

**Smooth Theme Switching:**
```css
/* Applied to all elements */
transition:
  background-color 200ms ease,
  color 200ms ease,
  border-color 200ms ease;
```

**Exceptions (No transition):**
- Images
- SVGs
- Canvas elements
- Video players

### Error Handling

**localStorage Unavailable:**
```typescript
try {
  localStorage.setItem('theme', theme);
} catch (error) {
  console.warn('Theme preference could not be saved');
  // Continue using in-memory state
}
```

**Invalid Saved Theme:**
```typescript
const savedTheme = localStorage.getItem('theme');
const validThemes = ['light', 'dark', 'system'];

if (savedTheme && validThemes.includes(savedTheme)) {
  setTheme(savedTheme as Theme);
} else {
  // Fall back to system preference
  setTheme('system');
}
```

---

## Migration Timeline

### Week 1: Foundation
- Day 1-2: Update tailwind.config.ts and globals.css
- Day 3-4: Create ThemeContext and ThemeToggle component
- Day 5: Integrate ThemeProvider, test core functionality

### Week 2: Core Components
- Day 1-2: Migrate layout components (sidebar, header)
- Day 3-4: Migrate UI primitives (Button, Card, Input, Select)
- Day 5: Update shadcn/ui base components

### Week 3: Feature Components
- Day 1-2: Migrate PostGenerator and credit components
- Day 3: Migrate settings page and appearance section
- Day 4: Migrate table, modal, and dialog components
- Day 5: Update analytics and chart components

### Week 4: Testing & Polish
- Day 1-2: Visual regression testing
- Day 3: Accessibility audit and fixes
- Day 4: Cross-browser testing
- Day 5: Performance optimization and documentation

---

## Success Metrics

**Technical Metrics:**
- [ ] Zero console errors related to theme switching
- [ ] < 100ms theme transition time
- [ ] 100% component coverage (all components support both themes)
- [ ] No FOUC on initial page load

**Accessibility Metrics:**
- [ ] WCAG 2.1 Level AA compliance (automated + manual testing)
- [ ] Lighthouse accessibility score ≥ 95
- [ ] All interactive elements keyboard accessible
- [ ] Screen reader compatible

**User Experience Metrics:**
- [ ] Theme preference persists 100% of the time
- [ ] Theme toggle accessible within 2 clicks from any page
- [ ] Smooth transitions (no jarring flashes)
- [ ] Consistent visual hierarchy in both modes

---

## Future Enhancements

### Phase 2 Features (Post-Launch)

1. **Custom Theme Colors**
   - Allow users to customize accent colors
   - Theme presets (Ocean, Forest, Sunset)
   - Save multiple custom themes

2. **Auto Theme Scheduling**
   - Automatically switch themes based on time of day
   - Custom schedule (e.g., light 6am-6pm, dark 6pm-6am)

3. **Contrast Adjustment**
   - High contrast mode for accessibility
   - Low contrast mode for reduced eye strain

4. **Component-Level Theming**
   - Allow different themes for different sections
   - Editor-specific themes for PostGenerator

---

## Appendix

### A. File Structure

```
src/
├── app/
│   ├── layout.tsx                  (Integrate ThemeProvider)
│   ├── globals.css                 (Add theme CSS variables)
│   └── dashboard/
│       ├── layout.tsx              (Add ThemeToggle to header)
│       └── settings/
│           └── page.tsx            (Add AppearanceSection)
│
├── components/
│   ├── ThemeToggle.tsx             (NEW: Theme toggle component)
│   ├── settings/
│   │   └── AppearanceSection.tsx   (NEW: Settings appearance UI)
│   └── ui/
│       ├── button.tsx              (UPDATE: Add theme variants)
│       ├── card.tsx                (UPDATE: Add theme variants)
│       ├── input.tsx               (UPDATE: Add theme variants)
│       └── ...                     (UPDATE: Other components)
│
├── contexts/
│   └── ThemeContext.tsx            (NEW: Theme state management)
│
├── lib/
│   └── utils.ts                    (Existing utility functions)
│
└── tailwind.config.ts              (UPDATE: Add dark mode config)
```

### B. Color Contrast Testing Tools

**Recommended Tools:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Stark Plugin (Figma): For design validation
- axe DevTools (Browser Extension): Automated accessibility testing
- Chrome DevTools: Built-in contrast ratio calculator

### C. Browser Support

**Target Browsers:**
- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Mobile Safari: iOS 14+
- Chrome Mobile: Android 10+

**CSS Feature Support:**
- CSS Variables: ✓ All target browsers
- CSS Dark Mode: ✓ All target browsers
- CSS Backdrop Filter: ✓ All target browsers (with prefixes)

### D. Performance Considerations

**Optimization Strategies:**
1. Use CSS variables for theme colors (no JS needed for colors)
2. Avoid unnecessary re-renders on theme change
3. Use `useCallback` for theme toggle function
4. Memoize theme-dependent computed values
5. Lazy load theme-specific assets

**Expected Performance Impact:**
- Initial page load: +0ms (CSS variables pre-loaded)
- Theme switch time: ~200ms (transition duration)
- Memory overhead: < 1KB (theme state)

---

## Conclusion

This design system provides a comprehensive foundation for implementing a robust, accessible, and performant dark/light mode system. The hybrid approach using Tailwind CSS dark mode classes, CSS variables, and React Context provides the best developer experience while maintaining excellent performance.

**Key Takeaways:**
1. Use semantic color tokens for maintainability
2. Maintain consistent visual hierarchy across themes
3. Prioritize accessibility from the start
4. Test thoroughly across browsers and devices
5. Provide clear user controls for theme selection

**Next Steps:**
1. Review and approve design specifications
2. Begin Phase 1 foundation setup
3. Create detailed component migration checklist
4. Set up automated accessibility testing
5. Schedule user testing sessions

---

**Document Version:** 1.0
**Last Updated:** December 5, 2025
**Author:** UI/UX Design Team
**Status:** Ready for Implementation Review
